import { describe, expect, it } from 'vitest'
import { CliSession } from '../engine/cli'
import type { ConfigureSpec } from '../components/ConfigureStage'
import { CONFIGS } from './registry'

/**
 * Every lab must be finishable. Each script below is the solution a learner
 * would type; the test replays it and insists that every task check turns
 * true, so a lab can never silently become impossible.
 */
type Script = [device: string, commands: string[]][]

function solve(spec: ConfigureSpec, script: Script) {
  const net = spec.build()
  for (const [device, commands] of script) {
    const s = new CliSession(net, device)
    for (const c of commands) {
      const lines = s.exec(c)
      const bad = lines.find((l) => String(l.text).includes('Invalid input') || String(l.text).includes('Incomplete'))
      if (bad) throw new Error(`"${c}" on ${device} was rejected: ${bad.text}`)
    }
  }
  return net
}

function expectSolved(spec: ConfigureSpec, script: Script) {
  const net = solve(spec, script)
  const failed = spec.tasks.filter((t) => !t.check(net)).map((t) => t.id)
  expect(failed).toEqual([])
}

const enter = (...rest: string[]) => ['enable', 'conf t', ...rest]

describe('every built lab can actually be completed', () => {
  it('b1l1 — two hosts on one cable', () => {
    expectSolved(CONFIGS.b1l1, [
      ['pc1', enter('interface e0', 'ip address 192.168.1.10 255.255.255.0')],
      ['pc2', enter('interface e0', 'ip address 192.168.1.20 255.255.255.0')],
    ])
  })

  it('n2l2 — VLANs on one switch', () => {
    expectSolved(CONFIGS.n2l2, [
      [
        'sw1',
        enter(
          'vlan 10',
          'name Sales',
          'exit',
          'vlan 20',
          'name Accounts',
          'exit',
          'interface Fa0/1',
          'switchport mode access',
          'switchport access vlan 10',
          'interface Fa0/2',
          'switchport mode access',
          'switchport access vlan 10',
          'interface Fa0/3',
          'switchport mode access',
          'switchport access vlan 20',
          'interface Fa0/4',
          'switchport mode access',
          'switchport access vlan 20',
        ),
      ],
    ])
  })

  it('n2l3 — trunking between two switches', () => {
    expectSolved(CONFIGS.n2l3, [
      ['sw1', enter('interface Gi0/1', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20')],
      ['sw2', enter('interface Gi0/1', 'switchport mode trunk', 'switchport trunk allowed vlan 10,20')],
    ])
  })

  it('n3l3 — static routing', () => {
    expectSolved(CONFIGS.n3l3, [
      [
        'r1',
        enter(
          'interface Gi0/0',
          'ip address 192.168.1.1 255.255.255.0',
          'no shutdown',
          'interface Gi0/1',
          'ip address 10.0.0.1 255.255.255.252',
          'no shutdown',
          'exit',
          'ip route 192.168.2.0 255.255.255.0 10.0.0.2',
        ),
      ],
      [
        'r2',
        enter(
          'interface Gi0/1',
          'ip address 10.0.0.2 255.255.255.252',
          'no shutdown',
          'interface Gi0/0',
          'ip address 192.168.2.1 255.255.255.0',
          'no shutdown',
          'exit',
          'ip route 192.168.1.0 255.255.255.0 10.0.0.1',
        ),
      ],
    ])
  })

  it('n3l5 — OSPF single area', () => {
    expectSolved(CONFIGS.n3l5, [
      ['r1', enter('router ospf 1', 'network 10.1.1.0 0.0.0.255 area 0', 'network 10.0.12.0 0.0.0.3 area 0')],
      ['r2', enter('router ospf 1', 'network 10.0.12.0 0.0.0.3 area 0', 'network 10.0.23.0 0.0.0.3 area 0')],
      ['r3', enter('router ospf 1', 'network 10.0.23.0 0.0.0.3 area 0', 'network 10.3.3.0 0.0.0.255 area 0')],
    ])
  })

  it('n3l6 — HSRP', () => {
    expectSolved(CONFIGS.n3l6, [
      [
        'r1',
        enter('interface Gi0/0', 'standby 1 ip 10.0.0.1', 'standby 1 priority 110', 'standby 1 preempt'),
      ],
      ['r2', enter('interface Gi0/0', 'standby 1 ip 10.0.0.1')],
    ])
  })

  it('n4l1 — DHCP', () => {
    expectSolved(CONFIGS.n4l1, [
      [
        'r1',
        enter(
          'ip dhcp excluded-address 192.168.10.1 192.168.10.9',
          'ip dhcp pool LAN',
          'network 192.168.10.0 255.255.255.0',
          'default-router 192.168.10.1',
          'dns-server 8.8.8.8',
        ),
      ],
      ['pc1', enter('interface e0', 'ip address dhcp')],
      ['pc2', enter('interface e0', 'ip address dhcp')],
    ])
  })

  it('n4l2 — NAT overload', () => {
    expectSolved(CONFIGS.n4l2, [
      [
        'r1',
        enter(
          'access-list 1 permit 192.168.1.0 0.0.0.255',
          'interface Gi0/0',
          'ip nat inside',
          'interface Gi0/1',
          'ip nat outside',
          'exit',
          'ip nat inside source list 1 interface Gi0/1 overload',
        ),
      ],
    ])
  })

  it('n5l2 — access control lists', () => {
    expectSolved(CONFIGS.n5l2, [
      [
        'r1',
        enter(
          'access-list 100 deny ip host 192.168.1.50 host 10.10.10.50',
          'access-list 100 permit ip any any',
          'interface Gi0/0',
          'ip access-group 100 in',
        ),
      ],
    ])
  })

  it('p2l4 — BGP with two providers', () => {
    expectSolved(CONFIGS.p2l4, [
      [
        'cust',
        enter(
          'router bgp 65001',
          'neighbor 10.0.1.2 remote-as 65010',
          'neighbor 10.0.2.2 remote-as 65020',
          'network 192.168.1.0 mask 255.255.255.0',
        ),
      ],
    ])
  })

  it('n7l1 — project 1, the small office', () => {
    expectSolved(CONFIGS.n7l1, [
      [
        'r1',
        enter(
          'interface Gi0/0',
          'ip address 192.168.10.1 255.255.255.0',
          'no shutdown',
          'interface Gi0/1',
          'ip address 203.0.113.2 255.255.255.252',
          'no shutdown',
          'exit',
          'ip route 0.0.0.0 0.0.0.0 203.0.113.1',
          'ip dhcp excluded-address 192.168.10.1 192.168.10.9',
          'ip dhcp pool OFFICE',
          'network 192.168.10.0 255.255.255.0',
          'default-router 192.168.10.1',
          'exit',
          'access-list 1 permit 192.168.10.0 0.0.0.255',
          'interface Gi0/0',
          'ip nat inside',
          'interface Gi0/1',
          'ip nat outside',
          'exit',
          'ip nat inside source list 1 interface Gi0/1 overload',
        ),
      ],
      ['pc1', enter('interface e0', 'ip address dhcp')],
      ['pc2', enter('interface e0', 'ip address dhcp')],
    ])
  })

  it('n7l2 — project 2, departments apart', () => {
    expectSolved(CONFIGS.n7l2, [
      [
        'sw',
        enter(
          'vlan 10',
          'name SALES',
          'exit',
          'vlan 20',
          'name HR',
          'exit',
          'interface Fa0/1',
          'switchport mode access',
          'switchport access vlan 10',
          'interface Fa0/2',
          'switchport mode access',
          'switchport access vlan 10',
          'interface Fa0/3',
          'switchport mode access',
          'switchport access vlan 20',
          'interface Fa0/4',
          'switchport mode access',
          'switchport access vlan 20',
          'interface Vlan10',
          'ip address 10.10.10.1 255.255.255.0',
          'interface Vlan20',
          'ip address 10.20.20.1 255.255.255.0',
          'exit',
          'ip routing',
          'access-list 110 deny ip 10.10.10.0 0.0.0.255 host 10.20.20.50',
          'access-list 110 permit ip any any',
          'interface Vlan10',
          'ip access-group 110 in',
        ),
      ],
    ])
  })
})
