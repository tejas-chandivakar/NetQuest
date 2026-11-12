import { describe, expect, it } from 'vitest'
import { Network } from './network'
import { CliSession } from './cli'
import { eigrpMetric, ospfCost, routerIdOf } from './routing'

/**
 * PC1 -- R1 ==Gi== R2 ==Gi== R3 -- PC2, plus a slow Fa shortcut R1--R3,
 * so the protocols have a genuine choice of path to make.
 */
function triangle() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1', 'Fa0/0'] })
  n.addDevice({ id: 'r2', name: 'R2', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'r3', name: 'R3', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1', 'Fa0/0'] })
  n.addDevice({ id: 'pc1', name: 'PC1', kind: 'pc', ifaces: ['e0'] })
  n.addDevice({ id: 'pc2', name: 'PC2', kind: 'pc', ifaces: ['e0'] })

  n.connect('pc1', 'e0', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'r2', 'Gi0/0')
  n.connect('r2', 'Gi0/1', 'r3', 'Gi0/0')
  n.connect('r3', 'Gi0/1', 'pc2', 'e0')
  n.connect('r1', 'Fa0/0', 'r3', 'Fa0/0')

  const set = (id: string, ifn: string, ip: string, mask = '255.255.255.252') => {
    const i = n.get(id)!.iface(ifn)!
    i.ip = ip
    i.mask = mask
    i.shutdown = false
  }
  set('pc1', 'e0', '10.1.1.10', '255.255.255.0')
  set('r1', 'Gi0/0', '10.1.1.1', '255.255.255.0')
  set('r1', 'Gi0/1', '10.0.12.1')
  set('r2', 'Gi0/0', '10.0.12.2')
  set('r2', 'Gi0/1', '10.0.23.1')
  set('r3', 'Gi0/0', '10.0.23.2')
  set('r3', 'Gi0/1', '10.3.3.1', '255.255.255.0')
  set('pc2', 'e0', '10.3.3.10', '255.255.255.0')
  set('r1', 'Fa0/0', '10.0.13.1')
  set('r3', 'Fa0/0', '10.0.13.2')

  n.get('pc1')!.defaultGateway = '10.1.1.1'
  n.get('pc2')!.defaultGateway = '10.3.3.1'
  return n
}

const ospfAll = (n: Network, ids: string[]) => {
  for (const id of ids) {
    n.get(id)!.ospf = {
      pid: 1,
      networks: [{ ip: '10.0.0.0', wildcard: '0.255.255.255', area: 0 }],
      passive: [],
      referenceBandwidth: 100_000,
    }
  }
  n.rev++
}

const eigrpAll = (n: Network, ids: string[]) => {
  for (const id of ids) {
    n.get(id)!.eigrp = { asn: 100, networks: [{ ip: '10.0.0.0' }], passive: [], autoSummary: false }
  }
  n.rev++
}

const ripAll = (n: Network, ids: string[]) => {
  for (const id of ids) {
    n.get(id)!.rip = { version: 2, networks: ['10.0.0.0'], passive: [], autoSummary: false }
  }
  n.rev++
}

describe('interface characteristics', () => {
  it('derives OSPF cost from bandwidth', () => {
    expect(ospfCost({ name: 'Gi0/1', shutdown: false })).toBe(1)
    expect(ospfCost({ name: 'Fa0/0', shutdown: false })).toBe(1)
    expect(ospfCost({ name: 'Fa0/0', shutdown: false }, 1_000_000)).toBe(10)
    expect(ospfCost({ name: 'Se0/0', shutdown: false })).toBe(64)
  })

  it('computes the EIGRP composite metric', () => {
    expect(eigrpMetric(1_000_000, 10)).toBe(256 * (10 + 10))
  })

  it('picks the highest address as the router ID', () => {
    const n = triangle()
    expect(routerIdOf(n.get('r1')!)).toBe('10.1.1.1')
  })
})

describe('OSPF', () => {
  it('learns nothing before it is configured', () => {
    const n = triangle()
    expect(n.get('r1')!.routingTable().some((r) => r.source === 'O')).toBe(false)
    expect(n.ping('pc1', '10.3.3.10').ok).toBe(false)
  })

  it('fills the routing table and reaches end to end once enabled', () => {
    const n = triangle()
    ospfAll(n, ['r1', 'r2', 'r3'])
    const learned = n.get('r1')!.routingTable().filter((r) => r.source === 'O')
    expect(learned.length).toBeGreaterThan(0)
    expect(learned.some((r) => r.prefix === '10.3.3.0')).toBe(true)
    expect(n.ping('pc1', '10.3.3.10').ok).toBe(true)
  })

  it('marks learned routes with administrative distance 110', () => {
    const n = triangle()
    ospfAll(n, ['r1', 'r2', 'r3'])
    const r = n.get('r1')!.routingTable().find((x) => x.source === 'O')!
    expect(r.ad).toBe(110)
  })

  it('prefers the two-hop Gigabit path over the single Fast Ethernet hop when costs say so', () => {
    const n = triangle()
    ospfAll(n, ['r1', 'r2', 'r3'])
    // reference bandwidth 1000 Mbps makes Gi cost 1 and Fa cost 10
    for (const id of ['r1', 'r2', 'r3']) n.get(id)!.ospf!.referenceBandwidth = 1_000_000
    n.rev++
    const route = n.get('r1')!.routingTable().find((x) => x.source === 'O' && x.prefix === '10.3.3.0')!
    expect(route.nextHop).toBe('10.0.12.2') // via R2, cost 1+1+1 < 10+1
  })

  it('takes the direct slow link when it is the only one left', () => {
    const n = triangle()
    ospfAll(n, ['r1', 'r2', 'r3'])
    for (const id of ['r1', 'r2', 'r3']) n.get(id)!.ospf!.referenceBandwidth = 1_000_000
    n.get('r2')!.iface('Gi0/1')!.shutdown = true
    n.rev++
    const route = n.get('r1')!.routingTable().find((x) => x.source === 'O' && x.prefix === '10.3.3.0')!
    expect(route.nextHop).toBe('10.0.13.2')
    expect(n.ping('pc1', '10.3.3.10').ok).toBe(true)
  })

  it('does not form an adjacency across an area mismatch', () => {
    const n = triangle()
    ospfAll(n, ['r1', 'r2', 'r3'])
    // take the direct R1-R3 shortcut away so R2 is the only path
    n.get('r1')!.iface('Fa0/0')!.shutdown = true
    n.get('r2')!.ospf!.networks = [{ ip: '10.0.0.0', wildcard: '0.255.255.255', area: 7 }]
    n.rev++
    expect(n.get('r1')!.routingTable().some((r) => r.source === 'O' && r.prefix === '10.3.3.0')).toBe(
      false,
    )
  })

  it('ignores a passive interface when forming neighbours', () => {
    const n = triangle()
    ospfAll(n, ['r1', 'r2', 'r3'])
    n.get('r1')!.ospf!.passive = ['Gi0/1', 'Fa0/0']
    n.rev++
    expect(n.get('r1')!.routingTable().some((r) => r.source === 'O')).toBe(false)
  })
})

describe('EIGRP', () => {
  it('learns routes with AD 90 and reaches the far side', () => {
    const n = triangle()
    eigrpAll(n, ['r1', 'r2', 'r3'])
    const learned = n.get('r1')!.routingTable().filter((r) => r.source === 'D')
    expect(learned.some((r) => r.prefix === '10.3.3.0')).toBe(true)
    expect(learned[0].ad).toBe(90)
    expect(n.ping('pc1', '10.3.3.10').ok).toBe(true)
  })

  it('does not peer across different AS numbers', () => {
    const n = triangle()
    eigrpAll(n, ['r1', 'r2', 'r3'])
    n.get('r1')!.iface('Fa0/0')!.shutdown = true
    n.get('r2')!.eigrp!.asn = 200
    n.rev++
    expect(n.get('r1')!.routingTable().some((r) => r.source === 'D' && r.prefix === '10.3.3.0')).toBe(
      false,
    )
  })
})

describe('RIP', () => {
  it('learns routes with hop-count metric and AD 120', () => {
    const n = triangle()
    ripAll(n, ['r1', 'r2', 'r3'])
    const route = n.get('r1')!.routingTable().find((r) => r.source === 'R' && r.prefix === '10.3.3.0')!
    expect(route.ad).toBe(120)
    expect(route.metric).toBe(1) // straight across the Fa shortcut: one hop to R3
    expect(n.ping('pc1', '10.3.3.10').ok).toBe(true)
  })
})

describe('administrative distance between protocols', () => {
  it('prefers EIGRP over OSPF, and OSPF over RIP', () => {
    const n = triangle()
    ospfAll(n, ['r1', 'r2', 'r3'])
    ripAll(n, ['r1', 'r2', 'r3'])
    expect(n.get('r1')!.lookup('10.3.3.10')!.source).toBe('O')
    eigrpAll(n, ['r1', 'r2', 'r3'])
    expect(n.get('r1')!.lookup('10.3.3.10')!.source).toBe('D')
  })

  it('still prefers a static route over anything learned', () => {
    const n = triangle()
    ospfAll(n, ['r1', 'r2', 'r3'])
    n.get('r1')!.staticRoutes.push({
      prefix: '10.3.3.0',
      mask: '255.255.255.0',
      nextHop: '10.0.13.2',
      ad: 1,
    })
    n.rev++
    expect(n.get('r1')!.lookup('10.3.3.10')!.source).toBe('S')
  })
})

describe('routing protocol CLI', () => {
  it('configures OSPF end to end from the console', () => {
    const n = triangle()
    for (const id of ['r1', 'r2', 'r3']) {
      const s = new CliSession(n, id)
      s.exec('enable')
      s.exec('conf t')
      s.exec('router ospf 1')
      expect(s.prompt()).toBe(`${s.dev.name}(config-router)#`)
      s.exec('network 10.0.0.0 0.255.255.255 area 0')
      s.exec('end')
    }
    expect(n.ping('pc1', '10.3.3.10').ok).toBe(true)
  })

  it('rejects an OSPF network statement without an area', () => {
    const n = triangle()
    const s = new CliSession(n, 'r1')
    s.exec('enable')
    s.exec('conf t')
    s.exec('router ospf 1')
    const lines = s.exec('network 10.0.0.0 0.255.255.255')
    expect(lines.some((l) => String(l.text).includes('Incomplete'))).toBe(true)
  })

  it('shows OSPF neighbours once they are up', () => {
    const n = triangle()
    ospfAll(n, ['r1', 'r2', 'r3'])
    const s = new CliSession(n, 'r1')
    s.exec('enable')
    const lines = s.exec('show ip ospf neighbor')
    expect(lines.some((l) => String(l.text).includes('FULL'))).toBe(true)
  })

  it('shows which protocols are running', () => {
    const n = triangle()
    eigrpAll(n, ['r1', 'r2', 'r3'])
    const s = new CliSession(n, 'r1')
    s.exec('enable')
    const lines = s.exec('show ip protocols')
    expect(lines.some((l) => String(l.text).includes('eigrp 100'))).toBe(true)
  })

  it('removes the process again', () => {
    const n = triangle()
    ospfAll(n, ['r1', 'r2', 'r3'])
    const s = new CliSession(n, 'r1')
    s.exec('enable')
    s.exec('conf t')
    s.exec('no router ospf 1')
    expect(n.get('r1')!.routingTable().some((r) => r.source === 'O')).toBe(false)
  })
})

describe('a floating static waits out of sight', () => {
  const build = () => {
    const n = new Network()
    n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/1', 'Gi0/2'] })
    const set = (ifn: string, ip: string) => {
      const i = n.get('r1')!.iface(ifn)!
      i.ip = ip
      i.mask = '255.255.255.252'
      i.shutdown = false
    }
    set('Gi0/1', '10.0.12.1')
    set('Gi0/2', '10.0.13.1')
    const s = new CliSession(n, 'r1')
    for (const c of [
      'enable',
      'conf t',
      'ip route 10.9.9.0 255.255.255.0 10.0.12.2',
      'ip route 10.9.9.0 255.255.255.0 10.0.13.2 200',
    ])
      s.exec(c)
    return n
  }

  it('keeps both candidates but installs only the trusted one', () => {
    const r1 = build().get('r1')!
    const all = r1.routingTable().filter((r) => r.prefix === '10.9.9.0')
    const shown = r1.installedRoutes().filter((r) => r.prefix === '10.9.9.0')
    expect(all).toHaveLength(2)
    expect(shown).toHaveLength(1)
    expect(shown[0].nextHop).toBe('10.0.12.2')
  })

  it('still forwards by the primary', () => {
    expect(build().get('r1')!.lookup('10.9.9.9')!.nextHop).toBe('10.0.12.2')
  })

  it('installs equal-cost statics side by side', () => {
    const n = build()
    const s = new CliSession(n, 'r1')
    s.exec('enable')
    s.exec('conf t')
    s.exec('ip route 10.8.8.0 255.255.255.0 10.0.12.2')
    s.exec('ip route 10.8.8.0 255.255.255.0 10.0.13.2')
    expect(n.get('r1')!.installedRoutes().filter((r) => r.prefix === '10.8.8.0')).toHaveLength(2)
  })
})
