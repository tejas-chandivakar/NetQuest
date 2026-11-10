import { describe, expect, it } from 'vitest'
import { Network } from './network'
import { CliSession } from './cli'
import { comparePaths, computeBgp, type BgpPath } from './bgp'

/**
 *            ISP1 (65010)
 *           /            \
 * CUST (65001)            CORE (65100) -- 8.8.8.0/24
 *           \            /
 *            ISP2 (65020)
 */
function dualHomed() {
  const n = new Network()
  n.addDevice({ id: 'cust', name: 'CUST', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1', 'Gi0/2'] })
  n.addDevice({ id: 'isp1', name: 'ISP1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'isp2', name: 'ISP2', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'core', name: 'CORE', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1', 'Gi0/2'] })

  n.connect('cust', 'Gi0/0', 'isp1', 'Gi0/0')
  n.connect('cust', 'Gi0/1', 'isp2', 'Gi0/0')
  n.connect('isp1', 'Gi0/1', 'core', 'Gi0/0')
  n.connect('isp2', 'Gi0/1', 'core', 'Gi0/1')

  const set = (id: string, ifn: string, ip: string, mask = '255.255.255.252') => {
    const i = n.get(id)!.iface(ifn)!
    i.ip = ip
    i.mask = mask
    i.shutdown = false
  }
  set('cust', 'Gi0/0', '10.0.1.1')
  set('isp1', 'Gi0/0', '10.0.1.2')
  set('cust', 'Gi0/1', '10.0.2.1')
  set('isp2', 'Gi0/0', '10.0.2.2')
  set('isp1', 'Gi0/1', '10.0.3.1')
  set('core', 'Gi0/0', '10.0.3.2')
  set('isp2', 'Gi0/1', '10.0.4.1')
  set('core', 'Gi0/1', '10.0.4.2')
  set('cust', 'Gi0/2', '192.168.1.1', '255.255.255.0')
  set('core', 'Gi0/2', '8.8.8.1', '255.255.255.0')

  // a host on each advertised LAN, so traffic uses addresses BGP actually carries
  n.addDevice({ id: 'pc', name: 'PC', kind: 'pc', ifaces: ['e0'] })
  n.addDevice({ id: 'srv', name: 'SRV', kind: 'server', ifaces: ['e0'] })
  n.connect('pc', 'e0', 'cust', 'Gi0/2')
  n.connect('srv', 'e0', 'core', 'Gi0/2')
  set('pc', 'e0', '192.168.1.10', '255.255.255.0')
  set('srv', 'e0', '8.8.8.10', '255.255.255.0')
  n.get('pc')!.defaultGateway = '192.168.1.1'
  n.get('srv')!.defaultGateway = '8.8.8.1'
  return n
}

function speakBgp(n: Network) {
  n.get('cust')!.bgp = {
    asn: 65001,
    neighbors: [
      { ip: '10.0.1.2', remoteAs: 65010 },
      { ip: '10.0.2.2', remoteAs: 65020 },
    ],
    networks: [{ ip: '192.168.1.0', mask: '255.255.255.0' }],
  }
  n.get('isp1')!.bgp = {
    asn: 65010,
    neighbors: [
      { ip: '10.0.1.1', remoteAs: 65001 },
      { ip: '10.0.3.2', remoteAs: 65100 },
    ],
    networks: [],
  }
  n.get('isp2')!.bgp = {
    asn: 65020,
    neighbors: [
      { ip: '10.0.2.1', remoteAs: 65001 },
      { ip: '10.0.4.2', remoteAs: 65100 },
    ],
    networks: [],
  }
  n.get('core')!.bgp = {
    asn: 65100,
    neighbors: [
      { ip: '10.0.3.1', remoteAs: 65010 },
      { ip: '10.0.4.1', remoteAs: 65020 },
    ],
    networks: [{ ip: '8.8.8.0', mask: '255.255.255.0' }],
  }
  n.rev++
}

const custPathsTo = (n: Network, prefix: string): BgpPath[] =>
  (computeBgp(n).get('cust') ?? []).filter((p) => p.prefix === prefix)

describe('BGP path selection rules', () => {
  const base = (over: Partial<BgpPath> = {}): BgpPath => ({
    prefix: '8.8.8.0',
    mask: '255.255.255.0',
    asPath: [65010, 65100],
    nextHop: '10.0.1.2',
    localPref: 100,
    med: 0,
    internal: false,
    originRouterId: '1.1.1.1',
    ...over,
  })

  it('prefers the higher local preference above everything else', () => {
    const better = base({ localPref: 200, asPath: [1, 2, 3, 4, 5] })
    expect(comparePaths(better, base())).toBeLessThan(0)
  })

  it('then prefers the shorter AS path', () => {
    expect(comparePaths(base({ asPath: [65020] }), base())).toBeLessThan(0)
  })

  it('then prefers the lower MED', () => {
    expect(comparePaths(base({ med: 10 }), base({ med: 50 }))).toBeLessThan(0)
  })

  it('then prefers eBGP over iBGP', () => {
    expect(comparePaths(base(), base({ internal: true }))).toBeLessThan(0)
  })
})

describe('BGP in a dual-homed network', () => {
  it('knows nothing about the far prefix before BGP runs', () => {
    const n = dualHomed()
    expect(n.get('cust')!.routingTable().some((r) => r.prefix === '8.8.8.0')).toBe(false)
  })

  it('learns the far prefix over both providers', () => {
    const n = dualHomed()
    speakBgp(n)
    const paths = custPathsTo(n, '8.8.8.0')
    expect(paths.length).toBe(2)
    expect(paths.every((p) => p.asPath.length === 2)).toBe(true)
  })

  it('installs a best path with AD 20 and reaches the far side', () => {
    const n = dualHomed()
    speakBgp(n)
    const route = n.get('cust')!.routingTable().find((r) => r.prefix === '8.8.8.0')!
    expect(route.source).toBe('B')
    expect(route.ad).toBe(20)
    expect(n.ping('pc', '8.8.8.10').ok).toBe(true)
  })

  it('follows local preference when told to prefer the second provider', () => {
    const n = dualHomed()
    speakBgp(n)
    n.get('cust')!.bgp!.neighbors[1].localPref = 200
    n.rev++
    const route = n.get('cust')!.routingTable().find((r) => r.prefix === '8.8.8.0')!
    expect(route.nextHop).toBe('10.0.2.2')
  })

  it('never accepts a path that already contains its own AS', () => {
    const n = dualHomed()
    speakBgp(n)
    const corePaths = computeBgp(n).get('core') ?? []
    expect(corePaths.every((p) => !p.asPath.includes(65100))).toBe(true)
  })

  it('falls back to the other provider when one session dies', () => {
    const n = dualHomed()
    speakBgp(n)
    n.get('cust')!.iface('Gi0/0')!.shutdown = true
    n.rev++
    const route = n.get('cust')!.routingTable().find((r) => r.prefix === '8.8.8.0')!
    expect(route.nextHop).toBe('10.0.2.2')
    expect(n.ping('pc', '8.8.8.10').ok).toBe(true)
  })
})

describe('BGP CLI', () => {
  it('builds a session from the console and shows it established', () => {
    const n = dualHomed()
    const pairs: [string, number, [string, number][], string[]][] = [
      ['cust', 65001, [['10.0.1.2', 65010], ['10.0.2.2', 65020]], ['192.168.1.0']],
      ['isp1', 65010, [['10.0.1.1', 65001], ['10.0.3.2', 65100]], []],
      ['isp2', 65020, [['10.0.2.1', 65001], ['10.0.4.2', 65100]], []],
      ['core', 65100, [['10.0.3.1', 65010], ['10.0.4.1', 65020]], ['8.8.8.0']],
    ]
    for (const [id, asn, neighbors, nets] of pairs) {
      const s = new CliSession(n, id)
      s.exec('enable')
      s.exec('conf t')
      s.exec(`router bgp ${asn}`)
      for (const [ip, remote] of neighbors) s.exec(`neighbor ${ip} remote-as ${remote}`)
      for (const net of nets) s.exec(`network ${net} mask 255.255.255.0`)
      s.exec('end')
    }

    const s = new CliSession(n, 'cust')
    s.exec('enable')
    const summary = s.exec('show ip bgp summary')
    expect(summary.filter((l) => String(l.text).includes('Established')).length).toBe(2)
    const table = s.exec('show ip bgp')
    expect(table.some((l) => String(l.text).includes('8.8.8.0'))).toBe(true)
    expect(n.ping('pc', '8.8.8.10').ok).toBe(true)
  })

  it('refuses a neighbor option before remote-as is set', () => {
    const n = dualHomed()
    const s = new CliSession(n, 'cust')
    s.exec('enable')
    s.exec('conf t')
    s.exec('router bgp 65001')
    const lines = s.exec('neighbor 10.0.1.2 route-reflector-client')
    expect(lines.some((l) => String(l.text).includes('remote-as'))).toBe(true)
  })
})
