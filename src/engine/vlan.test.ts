import { describe, expect, it } from 'vitest'
import { Network } from './network'
import { CliSession } from './cli'

/** One switch, four PCs on Fa0/1..Fa0/4, all in the default VLAN. */
function campus() {
  const n = new Network()
  n.addDevice({
    id: 'sw1',
    name: 'SW1',
    kind: 'switch',
    ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Gi0/1'],
  })
  const hosts: [string, string, string][] = [
    ['pc1', 'PC1', '192.168.1.11'],
    ['pc2', 'PC2', '192.168.1.12'],
    ['pc3', 'PC3', '192.168.1.13'],
    ['pc4', 'PC4', '192.168.1.14'],
  ]
  hosts.forEach(([id, name, ip], i) => {
    n.addDevice({ id, name, kind: 'pc', ifaces: ['e0'] })
    const f = n.get(id)!.iface('e0')!
    f.ip = ip
    f.mask = '255.255.255.0'
    n.connect(id, 'e0', 'sw1', `Fa0/${i + 1}`)
  })
  return n
}

const setAccess = (n: Network, sw: string, port: string, vlan: number) => {
  const sp = n.get(sw)!.iface(port)!.switchport!
  sp.mode = 'access'
  sp.accessVlan = vlan
  n.get(sw)!.vlans.set(vlan, `VLAN${vlan}`)
}

const setTrunk = (n: Network, sw: string, port: string, allowed?: number[]) => {
  const sp = n.get(sw)!.iface(port)!.switchport!
  sp.mode = 'trunk'
  sp.allowedVlans = allowed
}

describe('switching', () => {
  it('lets every host reach every other host in one VLAN', () => {
    const n = campus()
    expect(n.ping('pc1', '192.168.1.12').ok).toBe(true)
    expect(n.ping('pc1', '192.168.1.14').ok).toBe(true)
  })

  it('learns MAC addresses as frames pass through', () => {
    const n = campus()
    expect(n.get('sw1')!.macTable.size).toBe(0)
    n.ping('pc1', '192.168.1.12')
    expect(n.get('sw1')!.macTable.size).toBeGreaterThan(0)
    const entry = [...n.get('sw1')!.macTable.values()][0]
    expect(entry.vlan).toBe(1)
    expect(entry.iface).toBe('Fa0/1')
  })

  it('stops forwarding when a port is shut', () => {
    const n = campus()
    n.get('sw1')!.iface('Fa0/2')!.shutdown = true
    expect(n.ping('pc1', '192.168.1.12').ok).toBe(false)
  })
})

describe('VLANs on one switch', () => {
  const split = () => {
    const n = campus()
    setAccess(n, 'sw1', 'Fa0/1', 10)
    setAccess(n, 'sw1', 'Fa0/2', 10)
    setAccess(n, 'sw1', 'Fa0/3', 20)
    setAccess(n, 'sw1', 'Fa0/4', 20)
    return n
  }

  it('keeps hosts in the same VLAN talking', () => {
    expect(split().ping('pc1', '192.168.1.12').ok).toBe(true)
    expect(split().ping('pc3', '192.168.1.14').ok).toBe(true)
  })

  it('separates hosts in different VLANs even on the same switch', () => {
    const r = split().ping('pc1', '192.168.1.13')
    expect(r.ok).toBe(false)
    expect(r.failure).toBe('arp-fail')
  })

  it('learns each MAC against its own VLAN', () => {
    const n = split()
    n.ping('pc3', '192.168.1.14')
    const entry = [...n.get('sw1')!.macTable.values()][0]
    expect(entry.vlan).toBe(20)
  })
})

describe('trunking between two switches', () => {
  const twoSwitches = (trunk: boolean, allowed?: number[]) => {
    const n = new Network()
    for (const [id, name] of [
      ['sw1', 'SW1'],
      ['sw2', 'SW2'],
    ]) {
      n.addDevice({ id, name, kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Gi0/1'] })
    }
    n.connect('sw1', 'Gi0/1', 'sw2', 'Gi0/1')

    const host = (id: string, name: string, ip: string, sw: string, port: string, vlan: number) => {
      n.addDevice({ id, name, kind: 'pc', ifaces: ['e0'] })
      const f = n.get(id)!.iface('e0')!
      f.ip = ip
      f.mask = '255.255.255.0'
      n.connect(id, 'e0', sw, port)
      setAccess(n, sw, port, vlan)
    }
    host('a10', 'A10', '192.168.1.11', 'sw1', 'Fa0/1', 10)
    host('a20', 'A20', '192.168.1.21', 'sw1', 'Fa0/2', 20)
    host('b10', 'B10', '192.168.1.12', 'sw2', 'Fa0/1', 10)
    host('b20', 'B20', '192.168.1.22', 'sw2', 'Fa0/2', 20)

    if (trunk) {
      setTrunk(n, 'sw1', 'Gi0/1', allowed)
      setTrunk(n, 'sw2', 'Gi0/1', allowed)
    }
    return n
  }

  it('cannot carry VLAN 10 across an access-mode uplink', () => {
    expect(twoSwitches(false).ping('a10', '192.168.1.12').ok).toBe(false)
  })

  it('carries both VLANs once the uplink is a trunk', () => {
    expect(twoSwitches(true).ping('a10', '192.168.1.12').ok).toBe(true)
    expect(twoSwitches(true).ping('a20', '192.168.1.22').ok).toBe(true)
  })

  it('still keeps the two VLANs apart across the trunk', () => {
    expect(twoSwitches(true).ping('a10', '192.168.1.22').ok).toBe(false)
  })

  it('blocks a VLAN left out of the allowed list', () => {
    const n = twoSwitches(true, [10])
    expect(n.ping('a10', '192.168.1.12').ok).toBe(true)
    expect(n.ping('a20', '192.168.1.22').ok).toBe(false)
  })
})

describe('inter-VLAN routing on a layer-3 switch', () => {
  const l3 = () => {
    const n = new Network()
    n.addDevice({ id: 'sw1', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2'] })
    const host = (id: string, name: string, ip: string, port: string, vlan: number, gw: string) => {
      n.addDevice({ id, name, kind: 'pc', ifaces: ['e0'] })
      const f = n.get(id)!.iface('e0')!
      f.ip = ip
      f.mask = '255.255.255.0'
      n.get(id)!.defaultGateway = gw
      n.connect(id, 'e0', 'sw1', port)
      setAccess(n, 'sw1', port, vlan)
    }
    host('pc1', 'PC1', '10.10.10.10', 'Fa0/1', 10, '10.10.10.1')
    host('pc2', 'PC2', '10.20.20.20', 'Fa0/2', 20, '10.20.20.1')
    return n
  }

  const addSvi = (n: Network, vlan: number, ip: string) => {
    n.get('sw1')!.ifaces.push({
      name: `Vlan${vlan}`,
      shutdown: false,
      vlanId: vlan,
      ip,
      mask: '255.255.255.0',
    })
  }

  it('cannot route between VLANs without SVIs', () => {
    expect(l3().ping('pc1', '10.20.20.20').ok).toBe(false)
  })

  it('still refuses once SVIs exist but ip routing is off', () => {
    const n = l3()
    addSvi(n, 10, '10.10.10.1')
    addSvi(n, 20, '10.20.20.1')
    const r = n.ping('pc1', '10.20.20.20')
    expect(r.ok).toBe(false)
    expect(r.failure).toBe('no-ip-routing')
  })

  it('routes between VLANs once ip routing is enabled', () => {
    const n = l3()
    addSvi(n, 10, '10.10.10.1')
    addSvi(n, 20, '10.20.20.1')
    n.get('sw1')!.ipRouting = true
    const r = n.ping('pc1', '10.20.20.20')
    expect(r.ok).toBe(true)
    expect(r.hops.map((h) => h.deviceName)).toEqual(['PC1', 'SW1', 'PC2'])
  })
})

describe('switch CLI', () => {
  const session = () => {
    const n = campus()
    return new CliSession(n, 'sw1')
  }

  it('creates a VLAN and names it', () => {
    const s = session()
    s.exec('enable')
    s.exec('conf t')
    s.exec('vlan 10')
    expect(s.prompt()).toBe('SW1(config-vlan)#')
    s.exec('name Sales')
    expect(s.dev.vlans.get(10)).toBe('Sales')
    s.exec('exit')
    expect(s.prompt()).toBe('SW1(config)#')
  })

  it('assigns an access port to a VLAN', () => {
    const s = session()
    s.exec('enable')
    s.exec('conf t')
    s.exec('int Fa0/1')
    s.exec('switchport mode access')
    s.exec('switchport access vlan 10')
    const sp = s.dev.iface('Fa0/1')!.switchport!
    expect(sp.mode).toBe('access')
    expect(sp.accessVlan).toBe(10)
  })

  it('configures a trunk with an allowed list', () => {
    const s = session()
    s.exec('enable')
    s.exec('conf t')
    s.exec('int Gi0/1')
    s.exec('switchport mode trunk')
    s.exec('switchport trunk allowed vlan 10,20-22')
    const sp = s.dev.iface('Gi0/1')!.switchport!
    expect(sp.mode).toBe('trunk')
    expect(sp.allowedVlans).toEqual([10, 20, 21, 22])
  })

  it('rejects a malformed allowed-vlan list', () => {
    const s = session()
    s.exec('enable')
    s.exec('conf t')
    s.exec('int Gi0/1')
    s.exec('switchport mode trunk')
    const lines = s.exec('switchport trunk allowed vlan ten')
    expect(lines.some((l) => String(l.text).includes('Invalid input'))).toBe(true)
  })

  it('creates an SVI on demand', () => {
    const s = session()
    s.exec('enable')
    s.exec('conf t')
    s.exec('interface Vlan10')
    expect(s.prompt()).toBe('SW1(config-if)#')
    s.exec('ip address 10.10.10.1 255.255.255.0')
    const svi = s.dev.svi(10)!
    expect(svi.ip).toBe('10.10.10.1')
  })

  it('shows the VLAN table with its ports', () => {
    const s = session()
    s.exec('enable')
    s.exec('conf t')
    s.exec('int Fa0/1')
    s.exec('switchport access vlan 30')
    s.exec('end')
    const lines = s.exec('show vlan brief')
    expect(lines.some((l) => String(l.text).includes('Fa0/1'))).toBe(true)
  })

  it('shows learned MAC addresses', () => {
    const n = campus()
    n.ping('pc1', '192.168.1.12')
    const s = new CliSession(n, 'sw1')
    s.exec('enable')
    const lines = s.exec('show mac address-table')
    expect(lines.some((l) => String(l.text).includes('DYNAMIC'))).toBe(true)
  })

  it('enables ip routing', () => {
    const s = session()
    s.exec('enable')
    s.exec('conf t')
    s.exec('ip routing')
    expect(s.dev.ipRouting).toBe(true)
  })
})
