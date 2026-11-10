import { describe, expect, it } from 'vitest'
import { Network } from './network'
import { CliSession } from './cli'
import { evaluateAcl, type Acl } from './services'

/** PC1 - R1 - R2(internet host) with a LAN on each side. */
function edge() {
  const n = new Network()
  n.addDevice({ id: 'pc1', name: 'PC1', kind: 'pc', ifaces: ['e0'] })
  n.addDevice({ id: 'pc2', name: 'PC2', kind: 'pc', ifaces: ['e0'] })
  n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'isp', name: 'ISP', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'web', name: 'WEB', kind: 'server', ifaces: ['e0'] })

  n.connect('pc1', 'e0', 'r1', 'Gi0/0')
  n.connect('pc2', 'e0', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'isp', 'Gi0/0')
  n.connect('isp', 'Gi0/1', 'web', 'e0')

  const set = (id: string, ifn: string, ip: string, mask: string) => {
    const i = n.get(id)!.iface(ifn)!
    i.ip = ip
    i.mask = mask
    i.shutdown = false
  }
  set('pc1', 'e0', '192.168.1.10', '255.255.255.0')
  set('pc2', 'e0', '192.168.1.11', '255.255.255.0')
  set('r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  set('r1', 'Gi0/1', '203.0.113.2', '255.255.255.252')
  set('isp', 'Gi0/0', '203.0.113.1', '255.255.255.252')
  set('isp', 'Gi0/1', '198.51.100.1', '255.255.255.0')
  set('web', 'e0', '198.51.100.20', '255.255.255.0')

  n.get('pc1')!.defaultGateway = '192.168.1.1'
  n.get('pc2')!.defaultGateway = '192.168.1.1'
  n.get('web')!.defaultGateway = '198.51.100.1'
  n.get('r1')!.staticRoutes.push({ prefix: '0.0.0.0', mask: '0.0.0.0', nextHop: '203.0.113.1', ad: 1 })
  n.get('isp')!.staticRoutes.push({
    prefix: '192.168.1.0',
    mask: '255.255.255.0',
    nextHop: '203.0.113.2',
    ad: 1,
  })
  return n
}

describe('access lists', () => {
  const acl = (entries: Acl['entries'], extended = false): Acl => ({ id: '1', extended, entries })

  it('stops at the first matching line', () => {
    const a = acl([
      { seq: 10, action: 'deny', protocol: 'ip', src: '192.168.1.10', srcWildcard: '0.0.0.0' },
      { seq: 20, action: 'permit', protocol: 'ip', src: '0.0.0.0', srcWildcard: '255.255.255.255' },
    ])
    expect(evaluateAcl(a, '192.168.1.10', '8.8.8.8')).toBe('deny')
    expect(evaluateAcl(a, '192.168.1.11', '8.8.8.8')).toBe('permit')
  })

  it('denies anything that matches nothing', () => {
    const a = acl([
      { seq: 10, action: 'permit', protocol: 'ip', src: '10.0.0.0', srcWildcard: '0.255.255.255' },
    ])
    expect(evaluateAcl(a, '192.168.1.5', '8.8.8.8')).toBe('deny')
  })

  it('matches on destination too when the list is extended', () => {
    const a = acl(
      [
        {
          seq: 10,
          action: 'deny',
          protocol: 'icmp',
          src: '192.168.1.0',
          srcWildcard: '0.0.0.255',
          dst: '198.51.100.20',
          dstWildcard: '0.0.0.0',
        },
        { seq: 20, action: 'permit', protocol: 'ip', src: '0.0.0.0', srcWildcard: '255.255.255.255' },
      ],
      true,
    )
    expect(evaluateAcl(a, '192.168.1.10', '198.51.100.20')).toBe('deny')
    expect(evaluateAcl(a, '192.168.1.10', '198.51.100.21')).toBe('permit')
  })

  it('drops a real packet once the list is applied to an interface', () => {
    const n = edge()
    const s = new CliSession(n, 'r1')
    s.exec('enable')
    s.exec('conf t')
    s.exec('access-list 1 deny 192.168.1.10 0.0.0.0')
    s.exec('access-list 1 permit any')
    s.exec('interface Gi0/0')
    s.exec('ip access-group 1 in')

    const blocked = n.ping('pc1', '198.51.100.20')
    expect(blocked.ok).toBe(false)
    expect(blocked.failure).toBe('acl-denied')
    // the neighbour on the same LAN is untouched
    expect(n.ping('pc2', '198.51.100.20').ok).toBe(true)
  })

  it('lists its contents', () => {
    const n = edge()
    const s = new CliSession(n, 'r1')
    s.exec('enable')
    s.exec('conf t')
    s.exec('access-list 100 permit icmp 192.168.1.0 0.0.0.255 any')
    s.exec('end')
    const lines = s.exec('show access-lists')
    expect(lines.some((l) => String(l.text).includes('Extended'))).toBe(true)
  })
})

describe('NAT', () => {
  it('cannot reach the internet from a private address without it', () => {
    const n = edge()
    n.get('isp')!.staticRoutes = [] // the internet has no route back to 192.168.1.0
    n.rev++
    const r = n.ping('pc1', '198.51.100.20')
    expect(r.ok).toBe(false)
    expect(r.failure).toBe('no-return-path')
  })

  it('translates the source and the reply gets home', () => {
    const n = edge()
    n.get('isp')!.staticRoutes = []
    n.rev++
    const s = new CliSession(n, 'r1')
    s.exec('enable')
    s.exec('conf t')
    s.exec('access-list 1 permit 192.168.1.0 0.0.0.255')
    s.exec('interface Gi0/0')
    s.exec('ip nat inside')
    s.exec('interface Gi0/1')
    s.exec('ip nat outside')
    s.exec('exit')
    s.exec('ip nat inside source list 1 interface Gi0/1 overload')

    const r = n.ping('pc1', '198.51.100.20')
    expect(r.ok).toBe(true)
    expect(r.translatedSource).toBe('203.0.113.2')
    expect(n.get('r1')!.natTable.get('192.168.1.10')?.insideGlobal).toBe('203.0.113.2')
  })

  it('shows the translation table', () => {
    const n = edge()
    const s = new CliSession(n, 'r1')
    s.exec('enable')
    s.exec('conf t')
    s.exec('access-list 1 permit 192.168.1.0 0.0.0.255')
    s.exec('interface Gi0/1')
    s.exec('ip nat outside')
    s.exec('exit')
    s.exec('ip nat inside source list 1 interface Gi0/1 overload')
    s.exec('end')
    n.ping('pc1', '198.51.100.20')
    const lines = s.exec('show ip nat translations')
    expect(lines.some((l) => String(l.text).includes('203.0.113.2'))).toBe(true)
  })
})

/** Two routers sharing one virtual gateway for a LAN. */
function redundantGateway() {
  const n = new Network()
  n.addDevice({ id: 'pc1', name: 'PC1', kind: 'pc', ifaces: ['e0'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'r2', name: 'R2', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'srv', name: 'SRV', kind: 'server', ifaces: ['e0'] })

  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('r1', 'Gi0/0', 'sw', 'Fa0/2')
  n.connect('r2', 'Gi0/0', 'sw', 'Fa0/3')
  n.connect('r1', 'Gi0/1', 'srv', 'e0')

  const set = (id: string, ifn: string, ip: string, mask: string) => {
    const i = n.get(id)!.iface(ifn)!
    i.ip = ip
    i.mask = mask
    i.shutdown = false
  }
  set('pc1', 'e0', '10.0.0.10', '255.255.255.0')
  set('r1', 'Gi0/0', '10.0.0.2', '255.255.255.0')
  set('r2', 'Gi0/0', '10.0.0.3', '255.255.255.0')
  set('r1', 'Gi0/1', '172.16.0.1', '255.255.255.0')
  set('srv', 'e0', '172.16.0.10', '255.255.255.0')
  n.get('pc1')!.defaultGateway = '10.0.0.1'
  n.get('srv')!.defaultGateway = '172.16.0.1'
  return n
}

describe('HSRP', () => {
  it('nobody answers the virtual address before HSRP is configured', () => {
    const n = redundantGateway()
    expect(n.ping('pc1', '10.0.0.1').ok).toBe(false)
  })

  it('the higher priority router answers for the virtual address', () => {
    const n = redundantGateway()
    for (const [id, prio] of [
      ['r1', 110],
      ['r2', 100],
    ] as const) {
      const s = new CliSession(n, id)
      s.exec('enable')
      s.exec('conf t')
      s.exec('interface Gi0/0')
      s.exec('standby 1 ip 10.0.0.1')
      s.exec(`standby 1 priority ${prio}`)
      s.exec('standby 1 preempt')
    }
    const r = n.ping('pc1', '10.0.0.1')
    expect(r.ok).toBe(true)
    expect(r.hops.at(-1)!.deviceName).toBe('R1')
  })

  it('hands the virtual address over when the active router goes down', () => {
    const n = redundantGateway()
    for (const [id, prio] of [
      ['r1', 110],
      ['r2', 100],
    ] as const) {
      const s = new CliSession(n, id)
      s.exec('enable')
      s.exec('conf t')
      s.exec('interface Gi0/0')
      s.exec('standby 1 ip 10.0.0.1')
      s.exec(`standby 1 priority ${prio}`)
    }
    n.get('r1')!.iface('Gi0/0')!.shutdown = true
    n.rev++
    const r = n.ping('pc1', '10.0.0.1')
    expect(r.ok).toBe(true)
    expect(r.hops.at(-1)!.deviceName).toBe('R2')
  })
})

describe('DHCP', () => {
  const lan = () => {
    const n = new Network()
    n.addDevice({ id: 'pc1', name: 'PC1', kind: 'pc', ifaces: ['e0'] })
    n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0'] })
    n.connect('pc1', 'e0', 'r1', 'Gi0/0')
    const i = n.get('r1')!.iface('Gi0/0')!
    i.ip = '192.168.10.1'
    i.mask = '255.255.255.0'
    i.shutdown = false
    return n
  }

  it('times out when no server is listening', () => {
    const n = lan()
    const s = new CliSession(n, 'pc1')
    s.exec('enable')
    s.exec('conf t')
    s.exec('interface e0')
    const lines = s.exec('ip address dhcp')
    expect(lines.some((l) => String(l.text).includes('no server answered'))).toBe(true)
    expect(n.get('pc1')!.iface('e0')!.ip).toBeUndefined()
  })

  it('hands out an address and a gateway', () => {
    const n = lan()
    const srv = new CliSession(n, 'r1')
    srv.exec('enable')
    srv.exec('conf t')
    srv.exec('ip dhcp excluded-address 192.168.10.1 192.168.10.9')
    srv.exec('ip dhcp pool LAN')
    srv.exec('network 192.168.10.0 255.255.255.0')
    srv.exec('default-router 192.168.10.1')

    const cli = new CliSession(n, 'pc1')
    cli.exec('enable')
    cli.exec('conf t')
    cli.exec('interface e0')
    cli.exec('ip address dhcp')

    const pc = n.get('pc1')!
    expect(pc.iface('e0')!.ip).toBe('192.168.10.10')
    expect(pc.defaultGateway).toBe('192.168.10.1')
    expect(n.ping('pc1', '192.168.10.1').ok).toBe(true)
  })

  it('records the lease on the server', () => {
    const n = lan()
    const srv = new CliSession(n, 'r1')
    srv.exec('enable')
    srv.exec('conf t')
    srv.exec('ip dhcp pool LAN')
    srv.exec('network 192.168.10.0 255.255.255.0')
    srv.exec('end')

    const cli = new CliSession(n, 'pc1')
    cli.exec('enable')
    cli.exec('conf t')
    cli.exec('interface e0')
    cli.exec('ip address dhcp')

    const lines = srv.exec('show ip dhcp binding')
    expect(lines.some((l) => String(l.text).includes('PC1'))).toBe(true)
  })
})
