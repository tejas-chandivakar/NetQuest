import { describe, expect, it } from 'vitest'
import { Network } from './network'
import { CliSession } from './cli'
import { maskToPrefix, networkOf, prefixToMask } from './ip'

function twoPCs() {
  const n = new Network()
  n.addDevice({ id: 'pc1', name: 'PC1', kind: 'pc', ifaces: ['e0'] })
  n.addDevice({ id: 'pc2', name: 'PC2', kind: 'pc', ifaces: ['e0'] })
  n.connect('pc1', 'e0', 'pc2', 'e0')
  return n
}

function routedPair() {
  const n = new Network()
  n.addDevice({ id: 'pc1', name: 'PC1', kind: 'pc', ifaces: ['e0'] })
  n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'r2', name: 'R2', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'pc2', name: 'PC2', kind: 'pc', ifaces: ['e0'] })
  n.connect('pc1', 'e0', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'r2', 'Gi0/1')
  n.connect('r2', 'Gi0/0', 'pc2', 'e0')

  const set = (id: string, ifn: string, ip: string, mask: string) => {
    const i = n.get(id)!.iface(ifn)!
    i.ip = ip
    i.mask = mask
    i.shutdown = false
  }
  set('pc1', 'e0', '192.168.1.10', '255.255.255.0')
  set('r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  set('r1', 'Gi0/1', '10.0.0.1', '255.255.255.252')
  set('r2', 'Gi0/1', '10.0.0.2', '255.255.255.252')
  set('r2', 'Gi0/0', '192.168.2.1', '255.255.255.0')
  set('pc2', 'e0', '192.168.2.10', '255.255.255.0')
  n.get('pc1')!.defaultGateway = '192.168.1.1'
  n.get('pc2')!.defaultGateway = '192.168.2.1'
  return n
}

describe('ip maths', () => {
  it('converts masks both ways', () => {
    expect(maskToPrefix('255.255.255.0')).toBe(24)
    expect(maskToPrefix('255.255.255.252')).toBe(30)
    expect(prefixToMask(26)).toBe('255.255.255.192')
  })
  it('rejects a non-contiguous mask', () => {
    expect(maskToPrefix('255.0.255.0')).toBe(-1)
  })
  it('finds the network address', () => {
    expect(networkOf('192.168.1.77', '255.255.255.0')).toBe('192.168.1.0')
    expect(networkOf('10.1.2.200', '255.255.255.192')).toBe('10.1.2.192')
  })
})

describe('two hosts on one cable', () => {
  it('fails to ping with no addresses', () => {
    const n = twoPCs()
    expect(n.ping('pc1', '192.168.1.20').ok).toBe(false)
  })

  it('pings once both sides are addressed', () => {
    const n = twoPCs()
    const a = n.get('pc1')!.iface('e0')!
    a.ip = '192.168.1.10'
    a.mask = '255.255.255.0'
    const b = n.get('pc2')!.iface('e0')!
    b.ip = '192.168.1.20'
    b.mask = '255.255.255.0'
    expect(n.ping('pc1', '192.168.1.20').ok).toBe(true)
  })

  it('fails when the two sides are in different subnets', () => {
    const n = twoPCs()
    const a = n.get('pc1')!.iface('e0')!
    a.ip = '192.168.1.10'
    a.mask = '255.255.255.0'
    const b = n.get('pc2')!.iface('e0')!
    b.ip = '10.0.0.20'
    b.mask = '255.255.255.0'
    const r = n.ping('pc1', '10.0.0.20')
    expect(r.ok).toBe(false)
    expect(r.failure).toBe('no-route')
  })

  it('fails when one interface is shut', () => {
    const n = twoPCs()
    const a = n.get('pc1')!.iface('e0')!
    a.ip = '192.168.1.10'
    a.mask = '255.255.255.0'
    const b = n.get('pc2')!.iface('e0')!
    b.ip = '192.168.1.20'
    b.mask = '255.255.255.0'
    b.shutdown = true
    expect(n.ping('pc1', '192.168.1.20').failure).toBe('link-down')
  })
})

describe('routing across two routers', () => {
  it('cannot reach the far side without static routes', () => {
    const n = routedPair()
    expect(n.ping('pc1', '192.168.2.10').ok).toBe(false)
  })

  it('reaches the far side once both routers have routes', () => {
    const n = routedPair()
    n.get('r1')!.staticRoutes.push({
      prefix: '192.168.2.0',
      mask: '255.255.255.0',
      nextHop: '10.0.0.2',
      ad: 1,
    })
    n.get('r2')!.staticRoutes.push({
      prefix: '192.168.1.0',
      mask: '255.255.255.0',
      nextHop: '10.0.0.1',
      ad: 1,
    })
    const r = n.ping('pc1', '192.168.2.10')
    expect(r.ok).toBe(true)
    expect(r.hops.map((h) => h.deviceName)).toEqual(['PC1', 'R1', 'R2', 'PC2'])
  })

  it('fails with no-return-path when only the forward route exists', () => {
    const n = routedPair()
    n.get('r1')!.staticRoutes.push({
      prefix: '192.168.2.0',
      mask: '255.255.255.0',
      nextHop: '10.0.0.2',
      ad: 1,
    })
    const r = n.ping('pc1', '192.168.2.10')
    expect(r.ok).toBe(false)
    expect(r.failure).toBe('no-return-path')
    // the echo still made it all the way across
    expect(r.hops.map((h) => h.deviceName)).toEqual(['PC1', 'R1', 'R2', 'PC2'])
  })

  it('prefers the longest prefix match', () => {
    const n = routedPair()
    const r1 = n.get('r1')!
    r1.staticRoutes.push({ prefix: '0.0.0.0', mask: '0.0.0.0', nextHop: '10.0.0.2', ad: 1 })
    r1.staticRoutes.push({
      prefix: '192.168.2.0',
      mask: '255.255.255.0',
      nextHop: '10.0.0.2',
      ad: 1,
    })
    const best = r1.lookup('192.168.2.10')!
    expect(best.mask).toBe('255.255.255.0')
  })

  it('prefers the lower administrative distance', () => {
    const n = routedPair()
    const r1 = n.get('r1')!
    r1.staticRoutes.push({ prefix: '172.16.0.0', mask: '255.255.0.0', nextHop: '10.0.0.2', ad: 1 })
    r1.staticRoutes.push({ prefix: '172.16.0.0', mask: '255.255.0.0', nextHop: '192.168.1.9', ad: 200 })
    expect(r1.lookup('172.16.5.5')!.nextHop).toBe('10.0.0.2')
  })
})

describe('IOS CLI', () => {
  const session = () => {
    const n = twoPCs()
    n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
    return new CliSession(n, 'r1')
  }

  it('walks through the modes', () => {
    const s = session()
    expect(s.prompt()).toBe('R1>')
    s.exec('enable')
    expect(s.prompt()).toBe('R1#')
    s.exec('configure terminal')
    expect(s.prompt()).toBe('R1(config)#')
    s.exec('interface Gi0/0')
    expect(s.prompt()).toBe('R1(config-if)#')
    s.exec('exit')
    expect(s.prompt()).toBe('R1(config)#')
    s.exec('end')
    expect(s.prompt()).toBe('R1#')
  })

  it('accepts abbreviated commands', () => {
    const s = session()
    s.exec('en')
    expect(s.prompt()).toBe('R1#')
    s.exec('conf t')
    expect(s.prompt()).toBe('R1(config)#')
  })

  it('rejects an unknown command with the caret marker', () => {
    const s = session()
    const lines = s.exec('frobnicate')
    expect(lines.some((l) => l.text.includes('Invalid input'))).toBe(true)
  })

  it('reports an incomplete command', () => {
    const s = session()
    s.exec('enable')
    s.exec('configure terminal')
    s.exec('interface Gi0/0')
    const lines = s.exec('ip address 10.0.0.1')
    expect(lines.some((l) => l.text.includes('Incomplete'))).toBe(true)
  })

  it('rejects a subnet mask where an IP is expected', () => {
    const s = session()
    s.exec('enable')
    s.exec('conf t')
    s.exec('interface Gi0/0')
    const lines = s.exec('ip address 999.1.1.1 255.255.255.0')
    expect(lines.some((l) => l.text.includes('Invalid input'))).toBe(true)
  })

  it('configures an address and brings the interface up', () => {
    const s = session()
    s.exec('enable')
    s.exec('conf t')
    s.exec('int Gi0/0')
    s.exec('ip address 10.0.0.1 255.255.255.0')
    s.exec('no shutdown')
    const i = s.dev.iface('Gi0/0')!
    expect(i.ip).toBe('10.0.0.1')
    expect(i.shutdown).toBe(false)
  })

  it('adds and removes a static route', () => {
    const s = session()
    s.exec('enable')
    s.exec('conf t')
    s.exec('ip route 192.168.5.0 255.255.255.0 10.0.0.2')
    expect(s.dev.staticRoutes).toHaveLength(1)
    s.exec('no ip route 192.168.5.0 255.255.255.0 10.0.0.2')
    expect(s.dev.staticRoutes).toHaveLength(0)
  })

  it('shows interfaces and routes', () => {
    const s = session()
    s.exec('enable')
    const brief = s.exec('show ip interface brief')
    expect(brief.some((l) => l.text.includes('Gi0/0'))).toBe(true)
    const routes = s.exec('show ip route')
    expect(routes.some((l) => l.text.includes('Codes:'))).toBe(true)
  })

  it('fills the ARP cache with the MAC that answered, and clears it', () => {
    const n = routedPair()
    n.ping('pc1', '192.168.1.1')
    const pc1 = n.get('pc1')!
    expect(pc1.arp.get('192.168.1.1')).toBe(n.get('r1')!.mac('Gi0/0'))

    const s = new CliSession(n, 'pc1')
    s.exec('enable')
    expect(s.exec('show arp').some((l) => String(l.text).includes('192.168.1.1'))).toBe(true)
    s.exec('clear arp-cache')
    expect(pc1.arp.size).toBe(0)
  })

  it('completes a partial command', () => {
    const s = session()
    expect(s.complete('ena').trim()).toBe('enable')
  })

  it('lists help for ?', () => {
    const s = session()
    const lines = s.exec('?')
    expect(lines.length).toBeGreaterThan(1)
  })
})
