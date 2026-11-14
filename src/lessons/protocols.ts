import type { ConfigureSpec } from '../components/ConfigureStage'
import type { BreakSpec } from '../components/BreakStage'
import { Network, type Device } from '../engine/network'

/* ───────────────────────── shared helpers ───────────────────────── */

function addr(n: Network, id: string, ifn: string, ip: string, mask: string) {
  const i = n.get(id)!.iface(ifn)!
  i.ip = ip
  i.mask = mask
  i.shutdown = false
}

function pc(n: Network, id: string, name: string, ip: string, mask: string, gw: string) {
  n.addDevice({ id, name, kind: 'pc', ifaces: ['e0'] })
  const i = n.get(id)!.iface('e0')!
  i.ip = ip
  i.mask = mask
  n.get(id)!.defaultGateway = gw
}

const H = (gu: string, en: string) => ({ gu, en })

/* ═══════════════════════ n3l5 · OSPF single area ═══════════════════════ */

/** PC1 - R1 = R2 = R3 - PC2, a ring-free chain with addresses already on. */
function ospfLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'r2', name: 'R2', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'r3', name: 'R3', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  pc(n, 'pc1', 'PC1', '10.1.1.10', '255.255.255.0', '10.1.1.1')
  pc(n, 'pc2', 'PC2', '10.3.3.10', '255.255.255.0', '10.3.3.1')

  n.connect('pc1', 'e0', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'r2', 'Gi0/0')
  n.connect('r2', 'Gi0/1', 'r3', 'Gi0/0')
  n.connect('r3', 'Gi0/1', 'pc2', 'e0')

  addr(n, 'r1', 'Gi0/0', '10.1.1.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '10.0.12.1', '255.255.255.252')
  addr(n, 'r2', 'Gi0/0', '10.0.12.2', '255.255.255.252')
  addr(n, 'r2', 'Gi0/1', '10.0.23.1', '255.255.255.252')
  addr(n, 'r3', 'Gi0/0', '10.0.23.2', '255.255.255.252')
  addr(n, 'r3', 'Gi0/1', '10.3.3.1', '255.255.255.0')
  return n
}

const OSPF_LAYOUT = [
  { id: 'pc1', x: 80, y: 150, type: 'pc' as const, accent: 'var(--nq-beginner)' },
  { id: 'r1', x: 270, y: 150, type: 'router' as const },
  { id: 'r2', x: 450, y: 150, type: 'router' as const },
  { id: 'r3', x: 630, y: 150, type: 'router' as const },
  { id: 'pc2', x: 810, y: 150, type: 'pc' as const, accent: 'var(--nq-ccnp)' },
]

const ospfOn = (d: Device | undefined) => !!d?.ospf?.networks.length

export const n3l5Config: ConfigureSpec = {
  build: ospfLab,
  layout: OSPF_LAYOUT,
  terminals: ['r1', 'r2', 'r3', 'pc1'],
  viewBox: { w: 900, h: 300 },
  tasks: [
    {
      id: 'r1',
      instruction: H(
        'R1 પર OSPF process 1 ચાલુ કરો અને એનાં બંને networks area 0 માં નાખો',
        'Start OSPF process 1 on R1 and put both of its networks into area 0',
      ),
      why: H(
        'બધાં સરનામાં પહેલેથી ગોઠવેલાં છે, પણ કોઈ router બીજાનું network જાણતું નથી. Static route લખવાને બદલે આ વખતે એમને જાતે શીખવા દઈએ.',
        'Every address is already in place, but no router knows the others. Instead of writing static routes, this time we let them learn by themselves.',
      ),
      hints: [
        H('પહેલાં process ચાલુ કરો, પછી network statements લખો.', 'Start the process first, then add the network statements.'),
        H('router ospf 1 → network <ip> <wildcard> area 0', 'router ospf 1 → network <ip> <wildcard> area 0'),
        H(
          'enable\nconf t\nrouter ospf 1\nnetwork 10.1.1.0 0.0.0.255 area 0\nnetwork 10.0.12.0 0.0.0.3 area 0',
          'enable\nconf t\nrouter ospf 1\nnetwork 10.1.1.0 0.0.0.255 area 0\nnetwork 10.0.12.0 0.0.0.3 area 0',
        ),
      ],
      check: (n) => ospfOn(n.get('r1')),
      done: H('R1 પર OSPF ચાલે છે', 'OSPF is running on R1'),
    },
    {
      id: 'r2',
      instruction: H('R2 પર એ જ કરો — એનાં બંને networks area 0 માં', 'Do the same on R2 — both its networks in area 0'),
      why: H(
        'OSPF માટે બંને છેડે ચાલુ હોવું જરૂરી છે. એક બાજુ ચાલુ હોય તો Hello મોકલાય પણ કોઈ જવાબ ન આપે.',
        'OSPF has to be on at both ends. With only one side running, Hellos go out and nobody answers.',
      ),
      hints: [
        H('R2 ટેબ પર જાઓ.', 'Switch to the R2 tab.'),
        H('એનાં networks 10.0.12.0/30 અને 10.0.23.0/30 છે.', 'Its networks are 10.0.12.0/30 and 10.0.23.0/30.'),
        H(
          'enable\nconf t\nrouter ospf 1\nnetwork 10.0.12.0 0.0.0.3 area 0\nnetwork 10.0.23.0 0.0.0.3 area 0',
          'enable\nconf t\nrouter ospf 1\nnetwork 10.0.12.0 0.0.0.3 area 0\nnetwork 10.0.23.0 0.0.0.3 area 0',
        ),
      ],
      check: (n) => ospfOn(n.get('r2')),
      done: H('R2 પર OSPF ચાલે છે', 'OSPF is running on R2'),
    },
    {
      id: 'r3',
      instruction: H('R3 પર પણ OSPF ચાલુ કરો', 'Start OSPF on R3 as well'),
      hints: [
        H('છેલ્લો router બાકી છે.', 'One router left.'),
        H('એનાં networks 10.0.23.0/30 અને 10.3.3.0/24 છે.', 'Its networks are 10.0.23.0/30 and 10.3.3.0/24.'),
        H(
          'enable\nconf t\nrouter ospf 1\nnetwork 10.0.23.0 0.0.0.3 area 0\nnetwork 10.3.3.0 0.0.0.255 area 0',
          'enable\nconf t\nrouter ospf 1\nnetwork 10.0.23.0 0.0.0.3 area 0\nnetwork 10.3.3.0 0.0.0.255 area 0',
        ),
      ],
      check: (n) => ospfOn(n.get('r3')),
      done: H('ત્રણેય routers OSPF બોલે છે', 'All three routers speak OSPF'),
    },
    {
      id: 'learned',
      instruction: H(
        'R1 પર તપાસો કે એણે દૂરનું network જાતે શીખી લીધું (show ip route માં O વાળી લાઈન)',
        'Check on R1 that it has learned the far network by itself (an O line in show ip route)',
      ),
      why: H(
        'તમે R1 ને 10.3.3.0 વિશે કદી કહ્યું નથી. છતાં એ ટેબલમાં આવી ગયું — કારણ કે OSPF એ આખા નેટવર્કનો નકશો વહેંચ્યો.',
        'You never told R1 about 10.3.3.0. It is in the table anyway, because OSPF shared a map of the whole network.',
      ),
      hints: [
        H('R1 ટેબ પર જાઓ.', 'Go to the R1 tab.'),
        H('show ip route · show ip ospf neighbor', 'show ip route · show ip ospf neighbor'),
        H('end\nshow ip route\nshow ip ospf neighbor', 'end\nshow ip route\nshow ip ospf neighbor'),
      ],
      check: (n) => n.get('r1')!.routingTable().some((r) => r.source === 'O' && r.prefix === '10.3.3.0'),
      done: H('R1 એ 10.3.3.0 જાતે શીખ્યું', 'R1 learned 10.3.3.0 on its own'),
    },
    {
      id: 'ping',
      instruction: H('PC1 પરથી PC2 (10.3.3.10) ને ping કરો', 'From PC1, ping PC2 at 10.3.3.10'),
      hints: [
        H('PC1 ટેબ પર જાઓ.', 'Switch to the PC1 tab.'),
        H('enable → ping 10.3.3.10', 'enable → ping 10.3.3.10'),
        H('enable\nping 10.3.3.10', 'enable\nping 10.3.3.10'),
      ],
      check: (n) => n.ping('pc1', '10.3.3.10').ok,
      done: H('આખા નેટવર્કમાં પહોંચ થઈ ગઈ', 'End-to-end reachability'),
    },
  ],
  success: H(
    'છ static routes લખવાને બદલે તમે ત્રણ routers ને ફક્ત "આ networks મારાં છે" કહ્યું — બાકીનું એમણે જાતે ગોઠવી લીધું. હવે કોઈ નવું network ઉમેરાય તો ફક્ત એક network statement, બીજે ક્યાંય કશું બદલવાનું નહીં. "show ip ospf neighbor" અને "show ip protocols" જોઈ લો.',
    'Instead of six static routes you simply told three routers "these networks are mine" and they worked out the rest. Add a new network later and it takes one network statement, with nothing to change anywhere else. Have a look at "show ip ospf neighbor" and "show ip protocols".',
  ),
}

function ospfConfigured() {
  const n = ospfLab()
  for (const [id, nets] of [
    ['r1', [['10.1.1.0', '0.0.0.255'], ['10.0.12.0', '0.0.0.3']]],
    ['r2', [['10.0.12.0', '0.0.0.3'], ['10.0.23.0', '0.0.0.3']]],
    ['r3', [['10.0.23.0', '0.0.0.3'], ['10.3.3.0', '0.0.0.255']]],
  ] as [string, string[][]][]) {
    n.get(id)!.ospf = {
      pid: 1,
      networks: nets.map(([ip, wc]) => ({ ip, wildcard: wc, area: 0 })),
      passive: [],
      referenceBandwidth: 100_000,
    }
  }
  n.rev++
  return n
}

export const n3l5Break: BreakSpec = {
  build: ospfConfigured,
  layout: OSPF_LAYOUT,
  viewBox: { w: 900, h: 280 },
  intro: H(
    'OSPF ચાલુ છે અને PC1 થી PC2 પહોંચે છે. હવે એવી ભૂલો નાખો જે OSPF ને ચૂપ કરી દે — દરેક વખતે routing tables નીચે બદલાતાં જુઓ.',
    'OSPF is up and PC1 reaches PC2. Now inject the faults that silence OSPF, and watch the routing tables below change each time.',
  ),
  actions: [
    {
      id: 'area-mismatch',
      label: H('R2 ને area 7 માં ખસેડો', 'Move R2 into area 7'),
      explain: H('R2 ના network statements માં area 0 ને બદલે area 7.', 'Area 7 instead of area 0 in R2 network statements.'),
      expect: H(
        'Area mismatch હોય તો neighbour બને જ નહીં. કોઈ error message નથી આવતો — ફક્ત "show ip ospf neighbor" ખાલી રહે છે. આ exam નો પ્રિય સવાલ છે.',
        'An area mismatch means the adjacency never forms. No error appears — "show ip ospf neighbor" just stays empty. A favourite exam question.',
      ),
      apply: (n) => {
        n.get('r2')!.ospf!.networks = n.get('r2')!.ospf!.networks.map((x) => ({ ...x, area: 7 }))
        n.rev++
      },
      revert: (n) => {
        n.get('r2')!.ospf!.networks = n.get('r2')!.ospf!.networks.map((x) => ({ ...x, area: 0 }))
        n.rev++
      },
    },
    {
      id: 'passive',
      label: H('R2 નું Gi0/1 passive કરી દો', 'Make R2 Gi0/1 passive'),
      explain: H('passive-interface Gi0/1 — એ interface પર Hello જ ન મોકલાય.', 'passive-interface Gi0/1 — no Hellos leave that interface.'),
      expect: H(
        'Passive interface નું network હજી advertise થાય છે, પણ એના પરથી neighbour બનતો નથી. એટલે R3 તરફનો રસ્તો તૂટે છે. LAN ports પર આ સાચું વર્તન છે, WAN લિંક પર ભૂલ.',
        'A passive interface still advertises its network but forms no adjacency over it, so the path to R3 breaks. This is correct on a LAN port and a mistake on a transit link.',
      ),
      apply: (n) => {
        n.get('r2')!.ospf!.passive = ['Gi0/1']
        n.rev++
      },
      revert: (n) => {
        n.get('r2')!.ospf!.passive = []
        n.rev++
      },
    },
    {
      id: 'missing-network',
      label: H('R3 પરથી LAN નું network statement કાઢો', 'Remove the LAN network statement on R3'),
      explain: H('R3 પરથી "network 10.3.3.0 0.0.0.255 area 0" કાઢી નાખો.', 'Delete "network 10.3.3.0 0.0.0.255 area 0" from R3.'),
      expect: H(
        'R3 હજી OSPF બોલે છે અને એના neighbours જીવતા છે — પણ એ હવે PC2 વાળું network કોઈને કહેતો નથી. એટલે R1 ના ટેબલમાંથી એ લાઈન ગાયબ.',
        'R3 still speaks OSPF and its neighbours stay up — it simply no longer tells anyone about PC2 network, so that line disappears from R1 table.',
      ),
      apply: (n) => {
        n.get('r3')!.ospf!.networks = n.get('r3')!.ospf!.networks.filter((x) => x.ip !== '10.3.3.0')
        n.rev++
      },
      revert: (n) => {
        n.get('r3')!.ospf!.networks.push({ ip: '10.3.3.0', wildcard: '0.0.0.255', area: 0 })
        n.rev++
      },
    },
    {
      id: 'shut',
      label: H('R1 નું Gi0/1 બંધ કરો', 'Shut down R1 Gi0/1'),
      explain: H('બંને routers ને જોડતી લિંક બંધ.', 'Close the link joining the first two routers.'),
      expect: H(
        'Interface જતાં એનો connected route પણ જાય છે, અને OSPF તરત નવો નકશો ગણે છે. અહીં બીજો રસ્તો જ નથી, એટલે બધું તૂટે.',
        'When the interface goes, so does its connected route, and OSPF immediately recomputes. There is no second path here, so everything breaks.',
      ),
      apply: (n) => {
        n.get('r1')!.iface('Gi0/1')!.shutdown = true
        n.rev++
      },
      revert: (n) => {
        n.get('r1')!.iface('Gi0/1')!.shutdown = false
        n.rev++
      },
    },
  ],
  probes: [
    { id: 'e2e', from: 'pc1', to: 'pc2', destIp: '10.3.3.10', label: H('PC1 → PC2', 'PC1 → PC2') },
    { id: 'hop', from: 'r1', to: 'r2', destIp: '10.0.12.2', label: H('R1 → R2 લિંક', 'R1 → R2 link') },
  ],
}

/* ═══════════════════════ n3l6 · HSRP ═══════════════════════ */

function hsrpLab() {
  const n = new Network()
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'r2', name: 'R2', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'core', name: 'CORE', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  pc(n, 'pc1', 'PC1', '10.0.0.10', '255.255.255.0', '10.0.0.1')
  n.addDevice({ id: 'srv', name: 'SRV', kind: 'server', ifaces: ['e0'] })

  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('r1', 'Gi0/0', 'sw', 'Fa0/2')
  n.connect('r2', 'Gi0/0', 'sw', 'Fa0/3')
  n.connect('r1', 'Gi0/1', 'core', 'Gi0/0')
  n.connect('r2', 'Gi0/1', 'core', 'Gi0/1')
  n.connect('core', 'Gi0/1', 'srv', 'e0')

  addr(n, 'r1', 'Gi0/0', '10.0.0.2', '255.255.255.0')
  addr(n, 'r2', 'Gi0/0', '10.0.0.3', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '172.16.0.1', '255.255.255.0')
  addr(n, 'r2', 'Gi0/1', '172.16.0.2', '255.255.255.0')
  addr(n, 'core', 'Gi0/0', '172.16.0.254', '255.255.255.0')
  addr(n, 'srv', 'e0', '172.16.0.50', '255.255.255.0')
  n.get('srv')!.defaultGateway = '172.16.0.1'
  return n
}

const HSRP_LAYOUT = [
  { id: 'pc1', x: 110, y: 180, type: 'pc' as const, accent: 'var(--nq-beginner)' },
  { id: 'sw', x: 300, y: 180, type: 'switch' as const },
  { id: 'r1', x: 520, y: 90, type: 'router' as const },
  { id: 'r2', x: 520, y: 270, type: 'router' as const },
  { id: 'srv', x: 760, y: 180, type: 'server' as const, accent: 'var(--nq-ccnp)' },
]

const hsrpOf = (n: Network, id: string) => n.get(id)?.iface('Gi0/0')?.hsrp

export const n3l6Config: ConfigureSpec = {
  build: hsrpLab,
  layout: HSRP_LAYOUT,
  terminals: ['r1', 'r2', 'pc1'],
  viewBox: { w: 880, h: 380 },
  tasks: [
    {
      id: 'r1-hsrp',
      instruction: H(
        'R1 ના Gi0/0 પર HSRP group 1 માટે virtual IP 10.0.0.1 સેટ કરો',
        'On R1 Gi0/0, set virtual IP 10.0.0.1 for HSRP group 1',
      ),
      why: H(
        'PC1 નું gateway 10.0.0.1 છે — પણ એ સરનામું અત્યારે કોઈનું નથી! HSRP એક "કાલ્પનિક" router બનાવે છે જેનું સરનામું બે ખરા routers વહેંચે છે.',
        'PC1 gateway is 10.0.0.1 — but right now nobody owns that address. HSRP invents a phantom router whose address two real routers share.',
      ),
      hints: [
        H('આ interface નું setting છે.', 'This is an interface setting.'),
        H('interface Gi0/0 → standby 1 ip 10.0.0.1', 'interface Gi0/0 → standby 1 ip 10.0.0.1'),
        H('enable\nconf t\ninterface Gi0/0\nstandby 1 ip 10.0.0.1', 'enable\nconf t\ninterface Gi0/0\nstandby 1 ip 10.0.0.1'),
      ],
      check: (n) => hsrpOf(n, 'r1')?.virtualIp === '10.0.0.1',
      done: H('R1 virtual IP માટે તૈયાર છે', 'R1 is offering the virtual IP'),
    },
    {
      id: 'r1-priority',
      instruction: H('R1 ની priority 110 કરો અને preempt ચાલુ કરો', 'Give R1 priority 110 and enable preempt'),
      why: H(
        'Default priority 100 છે. વધારે priority વાળો Active બને. Preempt એટલે "હું પાછો આવું તો ફરી હું જ Active".',
        'The default priority is 100 and the higher one becomes Active. Preempt means "when I come back, I take the job again".',
      ),
      hints: [
        H('એ જ interface પર બે વધુ લાઈન.', 'Two more lines on the same interface.'),
        H('standby 1 priority 110 · standby 1 preempt', 'standby 1 priority 110 · standby 1 preempt'),
        H('standby 1 priority 110\nstandby 1 preempt', 'standby 1 priority 110\nstandby 1 preempt'),
      ],
      check: (n) => (hsrpOf(n, 'r1')?.priority ?? 0) >= 110,
      done: H('R1 ને ઊંચી priority મળી', 'R1 has the higher priority'),
    },
    {
      id: 'r2-hsrp',
      instruction: H('R2 પર એ જ group અને એ જ virtual IP સેટ કરો (priority default રહેવા દો)', 'Set the same group and virtual IP on R2, leaving priority at the default'),
      why: H(
        'બંને routers એ જ virtual IP આપે છે. એક Active, બીજો Standby — ચૂપચાપ રાહ જોતો.',
        'Both routers offer the same virtual IP. One is Active, the other waits quietly as Standby.',
      ),
      hints: [
        H('R2 ટેબ પર જાઓ.', 'Switch to the R2 tab.'),
        H('virtual IP બંને પર એક જ હોવું જોઈએ.', 'The virtual IP must be identical on both.'),
        H('enable\nconf t\ninterface Gi0/0\nstandby 1 ip 10.0.0.1', 'enable\nconf t\ninterface Gi0/0\nstandby 1 ip 10.0.0.1'),
      ],
      check: (n) => hsrpOf(n, 'r2')?.virtualIp === '10.0.0.1',
      done: H('R2 standby તરીકે તૈયાર', 'R2 is ready as standby'),
    },
    {
      id: 'ping',
      instruction: H('PC1 પરથી એના gateway 10.0.0.1 ને ping કરો', 'From PC1, ping its gateway 10.0.0.1'),
      hints: [
        H('PC1 ટેબ પર જાઓ.', 'Go to the PC1 tab.'),
        H('enable → ping 10.0.0.1', 'enable → ping 10.0.0.1'),
        H('enable\nping 10.0.0.1', 'enable\nping 10.0.0.1'),
      ],
      check: (n) => n.ping('pc1', '10.0.0.1').ok,
      done: H('Gateway જવાબ આપે છે', 'The gateway answers'),
    },
  ],
  success: H(
    '10.0.0.1 કોઈ ખરા router નું સરનામું નથી — છતાં એ જવાબ આપે છે. અત્યારે R1 એના વતી બોલે છે. "તોડો" ટેબ પર જઈને R1 બંધ કરો અને જુઓ કે PC1 ને ખબર પણ પડતી નથી: એ જ gateway, એ જ ping, ફક્ત જવાબ આપનાર બદલાઈ ગયો.',
    'No real router owns 10.0.0.1, yet it answers — R1 is speaking for it right now. Go to the Break it tab, take R1 away, and watch PC1 never notice: same gateway, same ping, only the machine answering has changed.',
  ),
}

function hsrpConfigured() {
  const n = hsrpLab()
  n.get('r1')!.iface('Gi0/0')!.hsrp = { group: 1, virtualIp: '10.0.0.1', priority: 110, preempt: true }
  n.get('r2')!.iface('Gi0/0')!.hsrp = { group: 1, virtualIp: '10.0.0.1', priority: 100, preempt: false }
  n.rev++
  return n
}

export const n3l6Break: BreakSpec = {
  build: hsrpConfigured,
  layout: HSRP_LAYOUT,
  viewBox: { w: 880, h: 380 },
  intro: H(
    'R1 અત્યારે Active છે અને 10.0.0.1 વતી જવાબ આપે છે. હવે એને મારી નાખો — અને જુઓ કે PC1 માટે કશું બદલાતું નથી. આ જ FHRP નો આખો હેતુ છે.',
    'R1 is Active right now and answers for 10.0.0.1. Kill it — and watch nothing change for PC1. That is the whole point of a first hop redundancy protocol.',
  ),
  actions: [
    {
      id: 'kill-active',
      silent: true,
      label: H('Active router (R1) બંધ કરો', 'Take the active router (R1) down'),
      explain: H('R1 ના Gi0/0 પર shutdown.', 'shutdown on R1 Gi0/0.'),
      expect: H(
        'R2 તરત Active બની જાય છે. Ping ફરી ચલાવો — એ જ 10.0.0.1 જવાબ આપે છે, પણ હવે રસ્તામાં R2 દેખાય છે. PC1 પર કશું બદલવું પડ્યું નહીં.',
        'R2 becomes Active at once. Run the ping again — the same 10.0.0.1 answers, but the path now shows R2. Nothing had to change on PC1.',
      ),
      apply: (n) => {
        n.get('r1')!.iface('Gi0/0')!.shutdown = true
        n.rev++
      },
      revert: (n) => {
        n.get('r1')!.iface('Gi0/0')!.shutdown = false
        n.rev++
      },
    },
    {
      id: 'kill-both',
      label: H('બંને routers બંધ કરો', 'Take both routers down'),
      explain: H('R1 અને R2 બંનેનાં LAN interfaces બંધ.', 'Shut the LAN interface on R1 and R2.'),
      expect: H(
        'હવે virtual IP વતી કોઈ બોલનાર નથી. Redundancy બે સુધી બચાવે છે, ત્રણ સુધી નહીં.',
        'Now nobody is left to speak for the virtual address. Redundancy saves you from one failure, not from every failure.',
      ),
      apply: (n) => {
        n.get('r1')!.iface('Gi0/0')!.shutdown = true
        n.get('r2')!.iface('Gi0/0')!.shutdown = true
        n.rev++
      },
      revert: (n) => {
        n.get('r1')!.iface('Gi0/0')!.shutdown = false
        n.get('r2')!.iface('Gi0/0')!.shutdown = false
        n.rev++
      },
    },
    {
      id: 'wrong-vip',
      silent: true,
      label: H('R2 પર virtual IP ખોટો લખો', 'Put the wrong virtual IP on R2'),
      explain: H('R2 પર 10.0.0.1 ને બદલે 10.0.0.9.', '10.0.0.9 instead of 10.0.0.1 on R2.'),
      expect: H(
        'બધું ચાલતું દેખાય છે — કારણ કે R1 હજી જીવતો છે. ભૂલ ત્યારે જ બહાર આવશે જ્યારે R1 પડશે, અને ત્યારે કોઈ બચાવનાર નહીં હોય. આવી ભૂલો મહિનાઓ છુપાયેલી રહે છે.',
        'Everything looks fine, because R1 is still alive. The mistake only surfaces the day R1 fails, and by then there is no backup. Faults like this hide for months.',
      ),
      apply: (n) => {
        n.get('r2')!.iface('Gi0/0')!.hsrp!.virtualIp = '10.0.0.9'
        n.rev++
      },
      revert: (n) => {
        n.get('r2')!.iface('Gi0/0')!.hsrp!.virtualIp = '10.0.0.1'
        n.rev++
      },
    },
  ],
  probes: [
    { id: 'gw', from: 'pc1', to: 'r1', destIp: '10.0.0.1', label: H('PC1 → gateway', 'PC1 → gateway') },
  ],
}

/* ═══════════════════════ n4l1 · DHCP ═══════════════════════ */

function dhcpLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  n.addDevice({ id: 'pc1', name: 'PC1', kind: 'pc', ifaces: ['e0'] })
  n.addDevice({ id: 'pc2', name: 'PC2', kind: 'pc', ifaces: ['e0'] })

  n.connect('r1', 'Gi0/0', 'sw', 'Fa0/1')
  n.connect('pc1', 'e0', 'sw', 'Fa0/2')
  n.connect('pc2', 'e0', 'sw', 'Fa0/3')
  addr(n, 'r1', 'Gi0/0', '192.168.10.1', '255.255.255.0')
  return n
}

export const n4l1Config: ConfigureSpec = {
  build: dhcpLab,
  layout: [
    { id: 'r1', x: 150, y: 170, type: 'router' as const },
    { id: 'sw', x: 420, y: 170, type: 'switch' as const },
    { id: 'pc1', x: 700, y: 85, type: 'pc' as const, accent: 'var(--nq-beginner)' },
    { id: 'pc2', x: 700, y: 265, type: 'pc' as const, accent: 'var(--nq-ccna)' },
  ],
  terminals: ['r1', 'pc1', 'pc2'],
  viewBox: { w: 860, h: 360 },
  tasks: [
    {
      id: 'excluded',
      instruction: H(
        'પહેલાં 192.168.10.1 થી 192.168.10.9 સુધીનાં સરનામાં અનામત રાખો',
        'First reserve the addresses from 192.168.10.1 to 192.168.10.9',
      ),
      why: H(
        'Router, printer, server — આ બધાને સ્થિર સરનામું જોઈએ. એમને DHCP વહેંચી ન દે એટલે પહેલાં જ બાજુ પર કાઢી લઈએ.',
        'Routers, printers and servers need fixed addresses. Set them aside first so DHCP never hands them out.',
      ),
      hints: [
        H('આ global config માં લખાય છે, pool બનાવતાં પહેલાં.', 'This goes in global config, before the pool.'),
        H('ip dhcp excluded-address <પહેલું> <છેલ્લું>', 'ip dhcp excluded-address <first> <last>'),
        H(
          'enable\nconf t\nip dhcp excluded-address 192.168.10.1 192.168.10.9',
          'enable\nconf t\nip dhcp excluded-address 192.168.10.1 192.168.10.9',
        ),
      ],
      check: (n) => (n.get('r1')?.pendingExcluded.length ?? 0) >= 9,
      done: H('પહેલાં નવ સરનામાં અનામત', 'The first nine addresses are reserved'),
    },
    {
      id: 'pool',
      instruction: H(
        'LAN નામનો pool બનાવો, 192.168.10.0/24 માટે, gateway 192.168.10.1',
        'Create a pool called LAN for 192.168.10.0/24 with gateway 192.168.10.1',
      ),
      hints: [
        H('Pool નું પોતાનું config mode છે.', 'A pool has its own configuration mode.'),
        H('ip dhcp pool LAN → network … → default-router …', 'ip dhcp pool LAN → network … → default-router …'),
        H(
          'ip dhcp pool LAN\nnetwork 192.168.10.0 255.255.255.0\ndefault-router 192.168.10.1\ndns-server 8.8.8.8',
          'ip dhcp pool LAN\nnetwork 192.168.10.0 255.255.255.0\ndefault-router 192.168.10.1\ndns-server 8.8.8.8',
        ),
      ],
      check: (n) => {
        const p = n.get('r1')?.dhcpPools.find((x) => x.name.toLowerCase() === 'lan')
        return p?.network === '192.168.10.0' && p?.gateway === '192.168.10.1'
      },
      done: H('Pool તૈયાર છે', 'The pool is ready'),
    },
    {
      id: 'pc1',
      instruction: H('PC1 પર DHCP થી સરનામું માગો', 'Ask for an address by DHCP on PC1'),
      why: H(
        'PC1 પાસે અત્યારે કોઈ સરનામું નથી. એ બૂમ પાડશે "કોઈ છે જે મને સરનામું આપે?" — અને router સાંભળશે.',
        'PC1 has no address at all. It will shout "is anyone there who can give me an address?" and the router will hear it.',
      ),
      hints: [
        H('PC1 ટેબ પર જાઓ, interface e0 પસંદ કરો.', 'Go to the PC1 tab and select interface e0.'),
        H('ip address dhcp', 'ip address dhcp'),
        H('enable\nconf t\ninterface e0\nip address dhcp', 'enable\nconf t\ninterface e0\nip address dhcp'),
      ],
      check: (n) => !!n.get('pc1')?.iface('e0')?.ip,
      done: H('PC1 ને આપોઆપ સરનામું મળ્યું', 'PC1 got an address automatically'),
    },
    {
      id: 'pc2',
      instruction: H('PC2 પર પણ એ જ કરો — અને જુઓ કે એને બીજું સરનામું મળે છે', 'Do the same on PC2 and watch it get a different address'),
      why: H(
        'Server યાદ રાખે છે કે કયું સરનામું કોને આપ્યું, એટલે બે જણને એક જ સરનામું કદી ન મળે.',
        'The server remembers which address went to whom, so two clients never receive the same one.',
      ),
      hints: [
        H('PC2 ટેબ પર જાઓ.', 'Switch to the PC2 tab.'),
        H('એ જ ચાર લાઈન.', 'The same four lines.'),
        H('enable\nconf t\ninterface e0\nip address dhcp', 'enable\nconf t\ninterface e0\nip address dhcp'),
      ],
      check: (n) => {
        const a = n.get('pc1')?.iface('e0')?.ip
        const b = n.get('pc2')?.iface('e0')?.ip
        return !!a && !!b && a !== b
      },
      done: H('બંને PC ને અલગ અલગ સરનામાં મળ્યાં', 'Both PCs got distinct addresses'),
    },
  ],
  success: H(
    'કોઈ PC પર એક પણ સરનામું જાતે ટાઈપ કર્યા વગર આખું LAN ચાલુ થઈ ગયું. Router પર "show ip dhcp binding" લખીને જુઓ કે કોને શું અપાયું. નોંધો કે પહેલું વહેંચાયેલું સરનામું .10 છે — કારણ કે .1 થી .9 તમે અનામત રાખ્યાં હતાં.',
    'The whole LAN came up without typing a single address on any PC. Type "show ip dhcp binding" on the router to see who got what. Notice the first address handed out is .10, because you reserved .1 to .9.',
  ),
}

/* ═══════════════════════ n4l2 · NAT ═══════════════════════ */

function natLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'isp', name: 'ISP', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'web', name: 'WEB', kind: 'server', ifaces: ['e0'] })
  pc(n, 'pc1', 'PC1', '192.168.1.10', '255.255.255.0', '192.168.1.1')

  n.connect('pc1', 'e0', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'isp', 'Gi0/0')
  n.connect('isp', 'Gi0/1', 'web', 'e0')

  addr(n, 'r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '203.0.113.2', '255.255.255.252')
  addr(n, 'isp', 'Gi0/0', '203.0.113.1', '255.255.255.252')
  addr(n, 'isp', 'Gi0/1', '198.51.100.1', '255.255.255.0')
  addr(n, 'web', 'e0', '198.51.100.20', '255.255.255.0')
  n.get('web')!.defaultGateway = '198.51.100.1'
  n.get('r1')!.staticRoutes.push({ prefix: '0.0.0.0', mask: '0.0.0.0', nextHop: '203.0.113.1', ad: 1 })
  return n
}

const NAT_LAYOUT = [
  { id: 'pc1', x: 95, y: 160, type: 'pc' as const, accent: 'var(--nq-beginner)' },
  { id: 'r1', x: 320, y: 160, type: 'router' as const },
  { id: 'isp', x: 560, y: 160, type: 'router' as const },
  { id: 'web', x: 790, y: 160, type: 'server' as const, accent: 'var(--nq-ccnp)' },
]

export const n4l2Config: ConfigureSpec = {
  build: natLab,
  layout: NAT_LAYOUT,
  terminals: ['r1', 'pc1'],
  viewBox: { w: 880, h: 320 },
  tasks: [
    {
      id: 'acl',
      instruction: H(
        'કયાં સરનામાં બહાર જઈ શકે એ નક્કી કરો: access-list 1 માં 192.168.1.0/24 ને permit કરો',
        'Decide which addresses may go out: permit 192.168.1.0/24 in access-list 1',
      ),
      why: H(
        'PC1 નું સરનામું private છે — ઈન્ટરનેટ પર એવાં સરનામાં ચાલતાં નથી, અને જવાબ કદી પાછો આવી શકે નહીં. પહેલાં નક્કી કરીએ કે કોને છુપાવવાનું છે.',
        'PC1 has a private address, which the internet will not carry, so a reply could never find its way back. First we decide whose addresses need hiding.',
      ),
      hints: [
        H('ACL માં wildcard mask વપરાય છે, subnet mask નહીં.', 'An ACL takes a wildcard mask, not a subnet mask.'),
        H('access-list 1 permit 192.168.1.0 0.0.0.255', 'access-list 1 permit 192.168.1.0 0.0.0.255'),
        H('enable\nconf t\naccess-list 1 permit 192.168.1.0 0.0.0.255', 'enable\nconf t\naccess-list 1 permit 192.168.1.0 0.0.0.255'),
      ],
      check: (n) => !!n.get('r1')?.acls.get('1')?.entries.length,
      done: H('કોને છુપાવવું એ નક્કી થયું', 'We have said whose addresses to hide'),
    },
    {
      id: 'inside-outside',
      instruction: H(
        'Gi0/0 ને inside અને Gi0/1 ને outside જાહેર કરો',
        'Declare Gi0/0 as inside and Gi0/1 as outside',
      ),
      why: H(
        'Router ને ખબર પડવી જોઈએ કે સીમા ક્યાં છે — કઈ બાજુ "ઘર" છે અને કઈ બાજુ "દુનિયા".',
        'The router has to know where the boundary is: which side is home and which side is the world.',
      ),
      hints: [
        H('બંને interfaces પર એક એક લાઈન.', 'One line on each interface.'),
        H('ip nat inside · ip nat outside', 'ip nat inside · ip nat outside'),
        H(
          'interface Gi0/0\nip nat inside\ninterface Gi0/1\nip nat outside',
          'interface Gi0/0\nip nat inside\ninterface Gi0/1\nip nat outside',
        ),
      ],
      check: (n) => {
        const nat = n.get('r1')?.nat
        return !!nat?.inside.includes('Gi0/0') && !!nat?.outside.includes('Gi0/1')
      },
      done: H('સીમા દોરાઈ ગઈ', 'The boundary is drawn'),
    },
    {
      id: 'overload',
      instruction: H(
        'બધાને Gi0/1 ના સરનામા પાછળ છુપાવો (PAT / overload)',
        'Hide everyone behind the Gi0/1 address (PAT, or overload)',
      ),
      why: H(
        'ઘરમાં દસ કમ્પ્યુટર હોય તોય ISP એક જ public સરનામું આપે છે. Overload એટલે બધા એ એક જ સરનામા પાછળથી બહાર જાય.',
        'You may have ten computers at home, but the ISP gives you one public address. Overload means everyone leaves from behind that single address.',
      ),
      hints: [
        H('Global config માં એક લાઈન.', 'One line in global config.'),
        H('ip nat inside source list 1 interface Gi0/1 overload', 'ip nat inside source list 1 interface Gi0/1 overload'),
        H('exit\nip nat inside source list 1 interface Gi0/1 overload', 'exit\nip nat inside source list 1 interface Gi0/1 overload'),
      ],
      check: (n) => !!n.get('r1')?.nat?.overload && n.get('r1')?.nat?.aclId === '1',
      done: H('PAT ચાલુ છે', 'PAT is on'),
    },
    {
      id: 'ping',
      instruction: H('PC1 પરથી WEB (198.51.100.20) ને ping કરો', 'From PC1, ping WEB at 198.51.100.20'),
      hints: [
        H('PC1 ટેબ પર જાઓ.', 'Go to the PC1 tab.'),
        H('enable → ping 198.51.100.20', 'enable → ping 198.51.100.20'),
        H('enable\nping 198.51.100.20', 'enable\nping 198.51.100.20'),
      ],
      check: (n) => n.ping('pc1', '198.51.100.20').ok,
      done: H('Private સરનામેથી ઈન્ટરનેટ પર પહોંચ', 'A private address reached the internet'),
    },
  ],
  success: H(
    'PC1 નું સરનામું 192.168.1.10 છે, પણ WEB ને 203.0.113.2 દેખાયું. R1 પર "show ip nat translations" લખીને અનુવાદ જુઓ. આ જ તમારા ઘરના router માં અત્યારે ચાલી રહ્યું છે.',
    'PC1 address is 192.168.1.10, but WEB saw 203.0.113.2. Type "show ip nat translations" on R1 to see the swap. This is exactly what the router in your home is doing right now.',
  ),
}

function natConfigured() {
  const n = natLab()
  const r1 = n.get('r1')!
  r1.acls.set('1', {
    id: '1',
    extended: false,
    entries: [{ seq: 10, action: 'permit', protocol: 'ip', src: '192.168.1.0', srcWildcard: '0.0.0.255' }],
  })
  r1.nat = { inside: ['Gi0/0'], outside: ['Gi0/1'], overload: true, aclId: '1', statics: [] }
  n.rev++
  return n
}

export const n4l2Break: BreakSpec = {
  build: natConfigured,
  layout: NAT_LAYOUT,
  viewBox: { w: 880, h: 300 },
  intro: H(
    'NAT ચાલે છે અને PC1 ઈન્ટરનેટ પર પહોંચે છે. હવે એક એક ટુકડો કાઢો અને જુઓ કે કયો ભાગ ખરેખર કામ કરી રહ્યો હતો.',
    'NAT is working and PC1 reaches the internet. Now remove one piece at a time to see which part was really doing the work.',
  ),
  actions: [
    {
      id: 'no-outside',
      label: H('Gi0/1 પરથી "outside" કાઢી નાખો', 'Remove "outside" from Gi0/1'),
      explain: H('Router ને હવે ખબર નથી કે બહારની બાજુ કઈ છે.', 'The router no longer knows which side is outside.'),
      expect: H(
        'અનુવાદ થતો જ નથી, એટલે packet પોતાના private સરનામા સાથે બહાર જાય છે — અને જવાબ પાછો આવી શકતો નથી.',
        'No translation happens, so the packet leaves wearing its private address and the reply has no way home.',
      ),
      apply: (n) => {
        n.get('r1')!.nat!.outside = []
        n.rev++
      },
      revert: (n) => {
        n.get('r1')!.nat!.outside = ['Gi0/1']
        n.rev++
      },
    },
    {
      id: 'acl-wrong',
      label: H('ACL માં ખોટું network લખો', 'Point the ACL at the wrong network'),
      explain: H('192.168.1.0 ને બદલે 10.0.0.0 permit કરો.', 'Permit 10.0.0.0 instead of 192.168.1.0.'),
      expect: H(
        'NAT ચાલુ છે, inside/outside બરાબર છે — પણ PC1 નું સરનામું list માં બેસતું નથી, એટલે એનો અનુવાદ થતો નથી. "NAT કામ નથી કરતું" ની સૌથી સામાન્ય ફરિયાદ આ જ હોય છે.',
        'NAT is on and inside/outside are right, but PC1 address does not match the list, so it is never translated. This is the usual reason behind "NAT is not working".',
      ),
      apply: (n) => {
        n.get('r1')!.acls.get('1')!.entries[0].src = '10.0.0.0'
        n.rev++
      },
      revert: (n) => {
        n.get('r1')!.acls.get('1')!.entries[0].src = '192.168.1.0'
        n.rev++
      },
    },
    {
      id: 'no-default',
      label: H('Default route કાઢી નાખો', 'Delete the default route'),
      explain: H('R1 પરથી 0.0.0.0/0 કાઢો.', 'Remove 0.0.0.0/0 from R1.'),
      expect: H(
        'હવે packet અનુવાદ સુધી પહોંચતું જ નથી — R1 ને ખબર જ નથી કે ઈન્ટરનેટ કઈ બાજુ છે. NAT અને routing બંને જોઈએ.',
        'Now the packet never reaches translation at all, because R1 does not know which way the internet is. You need both NAT and routing.',
      ),
      apply: (n) => {
        n.get('r1')!.staticRoutes = []
        n.rev++
      },
      revert: (n) => {
        n.get('r1')!.staticRoutes.push({ prefix: '0.0.0.0', mask: '0.0.0.0', nextHop: '203.0.113.1', ad: 1 })
        n.rev++
      },
    },
  ],
  probes: [
    { id: 'web', from: 'pc1', to: 'web', destIp: '198.51.100.20', label: H('PC1 → WEB', 'PC1 → WEB') },
    { id: 'isp', from: 'pc1', to: 'isp', destIp: '203.0.113.1', label: H('PC1 → ISP', 'PC1 → ISP') },
  ],
}

/* ═══════════════════════ n5l2 · ACL ═══════════════════════ */

function aclLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  pc(n, 'guest', 'GUEST', '192.168.1.50', '255.255.255.0', '192.168.1.1')
  pc(n, 'staff', 'STAFF', '192.168.1.20', '255.255.255.0', '192.168.1.1')
  n.addDevice({ id: 'srv', name: 'HR-SRV', kind: 'server', ifaces: ['e0'] })

  n.connect('guest', 'e0', 'sw', 'Fa0/1')
  n.connect('staff', 'e0', 'sw', 'Fa0/2')
  n.connect('sw', 'Fa0/3', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'srv', 'e0')

  addr(n, 'r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '10.10.10.1', '255.255.255.0')
  addr(n, 'srv', 'e0', '10.10.10.50', '255.255.255.0')
  n.get('srv')!.defaultGateway = '10.10.10.1'
  return n
}

const ACL_LAYOUT = [
  { id: 'guest', x: 95, y: 85, type: 'pc' as const, accent: 'var(--nq-warn)' },
  { id: 'staff', x: 95, y: 265, type: 'pc' as const, accent: 'var(--nq-beginner)' },
  { id: 'sw', x: 330, y: 175, type: 'switch' as const },
  { id: 'r1', x: 560, y: 175, type: 'router' as const },
  { id: 'srv', x: 790, y: 175, type: 'server' as const, accent: 'var(--nq-ccnp)' },
]

export const n5l2Config: ConfigureSpec = {
  build: aclLab,
  layout: ACL_LAYOUT,
  terminals: ['r1', 'guest', 'staff'],
  viewBox: { w: 880, h: 360 },
  tasks: [
    {
      id: 'before',
      instruction: H(
        'પહેલાં ચકાસો કે ઓફિસમાંથી HR સર્વર પહોંચે છે — GUEST પરથી પણ અજમાવી જુઓ',
        'First confirm the HR server is reachable from the office — and try it from GUEST too',
      ),
      why: H(
        'કંઈ પણ બદલતાં પહેલાં અત્યારે શું ચાલે છે એ જોઈ લેવું — આ ફિલ્ડની પહેલી આદત છે.',
        'Look at what works before you change anything. That is the first habit in the field.',
      ),
      hints: [
        H('GUEST ટેબ પરથી ping કરો.', 'Ping from the GUEST tab.'),
        H('enable → ping 10.10.10.50', 'enable → ping 10.10.10.50'),
        H('enable\nping 10.10.10.50', 'enable\nping 10.10.10.50'),
      ],
      check: (n) => n.ping('staff', '10.10.10.50').ok,
      done: H('સર્વર પહોંચે છે — અને GUEST પણ, એ જ સમસ્યા છે', 'The server is reachable — and so is GUEST, which is the problem'),
    },
    {
      id: 'deny',
      instruction: H(
        'access-list 100 બનાવો: GUEST (192.168.1.50) ને HR સર્વર સુધી જતાં રોકો, બાકી બધું ચાલવા દો',
        'Build access-list 100: stop GUEST (192.168.1.50) from reaching the HR server, and let everything else through',
      ),
      why: H(
        'ક્રમ અગત્યનો છે. પહેલાં deny લખો, પછી permit — ઊલટું લખશો તો deny કદી વંચાશે જ નહીં.',
        'Order matters. Write the deny first and the permit after; the other way round, the deny is never read.',
      ),
      hints: [
        H('Extended ACL જોઈશે કારણ કે destination પણ જોવાનું છે.', 'You need an extended ACL, because the destination matters too.'),
        H('access-list 100 deny ip host <src> host <dst> → પછી access-list 100 permit ip any any', 'access-list 100 deny ip host <src> host <dst> → then access-list 100 permit ip any any'),
        H(
          'enable\nconf t\naccess-list 100 deny ip host 192.168.1.50 host 10.10.10.50\naccess-list 100 permit ip any any',
          'enable\nconf t\naccess-list 100 deny ip host 192.168.1.50 host 10.10.10.50\naccess-list 100 permit ip any any',
        ),
      ],
      check: (n) => (n.get('r1')?.acls.get('100')?.entries.length ?? 0) >= 2,
      done: H('નિયમો લખાઈ ગયા', 'The rules are written'),
    },
    {
      id: 'apply',
      instruction: H(
        'List ને Gi0/0 પર inbound લગાવો',
        'Apply the list inbound on Gi0/0',
      ),
      why: H(
        'ACL લખવાથી કશું થતું નથી — એ કોઈ દરવાજા પર લગાવવી પડે. સ્રોતની સૌથી નજીકના દરવાજે લગાવવી એ નિયમ છે.',
        'Writing an ACL does nothing until you hang it on a door. The rule of thumb is to put it on the door nearest the source.',
      ),
      hints: [
        H('Interface config માં જાઓ.', 'Go into interface configuration.'),
        H('ip access-group 100 in', 'ip access-group 100 in'),
        H('interface Gi0/0\nip access-group 100 in', 'interface Gi0/0\nip access-group 100 in'),
      ],
      check: (n) => n.get('r1')?.iface('Gi0/0')?.aclIn === '100',
      done: H('ચોકીદાર દરવાજે બેસી ગયો', 'The guard is at the door'),
    },
    {
      id: 'verify',
      instruction: H(
        'ચકાસો: GUEST હવે ન પહોંચે, પણ STAFF પહોંચતો રહે',
        'Verify that GUEST can no longer reach it but STAFF still can',
      ),
      hints: [
        H('બંને ટેબ પરથી ping કરો.', 'Ping from both tabs.'),
        H('GUEST → fail, STAFF → success', 'GUEST should fail, STAFF should succeed'),
        H('enable\nping 10.10.10.50', 'enable\nping 10.10.10.50'),
      ],
      check: (n) => !n.ping('guest', '10.10.10.50').ok && n.ping('staff', '10.10.10.50').ok,
      done: H('ફક્ત GUEST રોકાયો', 'Only GUEST is blocked'),
    },
  ],
  success: H(
    'એક જ LAN, એક જ switch, એક જ gateway — છતાં એક કમ્પ્યુટર રોકાયો અને બીજો નહીં. "show access-lists" લખીને નિયમો જુઓ. અને યાદ રાખો: દરેક ACL ના છેડે એક અદૃશ્ય "deny ip any any" બેઠો હોય છે — એટલે જ permit વાળી લાઈન ફરજિયાત હતી.',
    'One LAN, one switch, one gateway — yet one computer is blocked and the other is not. Type "show access-lists" to read the rules. And remember: every ACL ends with an invisible "deny ip any any", which is why that permit line was not optional.',
  ),
}

function aclConfigured() {
  const n = aclLab()
  n.get('r1')!.acls.set('100', {
    id: '100',
    extended: true,
    entries: [
      {
        seq: 10,
        action: 'deny',
        protocol: 'ip',
        src: '192.168.1.50',
        srcWildcard: '0.0.0.0',
        dst: '10.10.10.50',
        dstWildcard: '0.0.0.0',
      },
      {
        seq: 20,
        action: 'permit',
        protocol: 'ip',
        src: '0.0.0.0',
        srcWildcard: '255.255.255.255',
        dst: '0.0.0.0',
        dstWildcard: '255.255.255.255',
      },
    ],
  })
  n.get('r1')!.iface('Gi0/0')!.aclIn = '100'
  n.rev++
  return n
}

export const n5l2Break: BreakSpec = {
  build: aclConfigured,
  layout: ACL_LAYOUT,
  viewBox: { w: 880, h: 360 },
  intro: H(
    'ACL બરાબર કામ કરે છે: GUEST રોકાયેલો, STAFF છૂટો. હવે ACL ની ત્રણ ક્લાસિક ભૂલો કરો અને જુઓ કે દરેક શું બગાડે છે.',
    'The ACL is doing its job: GUEST blocked, STAFF free. Now make the three classic ACL mistakes and see what each one costs.',
  ),
  actions: [
    {
      id: 'no-permit',
      label: H('છેલ્લી permit લાઈન કાઢી નાખો', 'Delete the final permit line'),
      explain: H('ફક્ત deny વાળી લાઈન રહેવા દો.', 'Leave only the deny line.'),
      expect: H(
        'હવે STAFF પણ રોકાઈ ગયો! કારણ કે છેડે અદૃશ્ય "deny ip any any" બેઠો છે. એક લાઈન ભૂલવાથી આખું LAN બંધ — આ ખરેખર થાય છે.',
        'Now STAFF is blocked as well, because of the invisible "deny ip any any" at the end. One forgotten line takes the whole LAN down. This really happens.',
      ),
      apply: (n) => {
        const acl = n.get('r1')!.acls.get('100')!
        acl.entries = acl.entries.filter((e) => e.action !== 'permit')
        n.rev++
      },
      revert: (n) => {
        const acl = n.get('r1')!.acls.get('100')!
        acl.entries.push({
          seq: 20,
          action: 'permit',
          protocol: 'ip',
          src: '0.0.0.0',
          srcWildcard: '255.255.255.255',
          dst: '0.0.0.0',
          dstWildcard: '255.255.255.255',
        })
        n.rev++
      },
    },
    {
      id: 'wrong-order',
      label: H('ક્રમ ઊલટો કરો — permit પહેલાં', 'Reverse the order — permit first'),
      explain: H('permit ને deny ની ઉપર ખસેડો.', 'Move the permit above the deny.'),
      expect: H(
        'હવે GUEST પણ પહોંચી જાય છે. Packet પહેલી લાઈને જ મેળ ખાઈ જાય છે અને નીચેની deny કદી વંચાતી નથી. ACL માં ક્રમ એ જ બધું છે.',
        'Now GUEST gets through. The packet matches the very first line and the deny below is never read. In an ACL, order is everything.',
      ),
      apply: (n) => {
        const acl = n.get('r1')!.acls.get('100')!
        acl.entries.reverse()
        n.rev++
      },
      revert: (n) => {
        const acl = n.get('r1')!.acls.get('100')!
        acl.entries.reverse()
        n.rev++
      },
    },
    {
      id: 'wrong-direction',
      label: H('List ને ખોટી દિશામાં લગાવો', 'Apply the list in the wrong direction'),
      explain: H('Gi0/0 પર in ને બદલે out.', 'out instead of in on Gi0/0.'),
      expect: H(
        'GUEST હવે સર્વર સુધી પહોંચી જાય છે. Outbound list એ interface માંથી બહાર નીકળતા traffic ને જુએ છે — અને LAN તરફ પાછા આવતા traffic ને. દિશા ખોટી એટલે ચોકીદાર ખોટા દરવાજે.',
        'GUEST reaches the server again. An outbound list inspects traffic leaving that interface, which here means traffic heading back to the LAN. Wrong direction, wrong door.',
      ),
      apply: (n) => {
        const i = n.get('r1')!.iface('Gi0/0')!
        i.aclIn = undefined
        i.aclOut = '100'
        n.rev++
      },
      revert: (n) => {
        const i = n.get('r1')!.iface('Gi0/0')!
        i.aclIn = '100'
        i.aclOut = undefined
        n.rev++
      },
    },
  ],
  startsFailing: ['g'],
  probes: [
    { id: 'g', from: 'guest', to: 'srv', destIp: '10.10.10.50', label: H('GUEST → HR સર્વર', 'GUEST → HR server') },
    { id: 's', from: 'staff', to: 'srv', destIp: '10.10.10.50', label: H('STAFF → HR સર્વર', 'STAFF → HR server') },
  ],
}

/* ═══════════════════════ p2l4 · BGP ═══════════════════════ */

function bgpLab() {
  const n = new Network()
  n.addDevice({ id: 'cust', name: 'CUST', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1', 'Gi0/2'] })
  n.addDevice({ id: 'isp1', name: 'ISP1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'isp2', name: 'ISP2', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'core', name: 'CORE', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1', 'Gi0/2'] })
  pc(n, 'pc', 'PC', '192.168.1.10', '255.255.255.0', '192.168.1.1')
  n.addDevice({ id: 'srv', name: 'SRV', kind: 'server', ifaces: ['e0'] })

  n.connect('cust', 'Gi0/0', 'isp1', 'Gi0/0')
  n.connect('cust', 'Gi0/1', 'isp2', 'Gi0/0')
  n.connect('isp1', 'Gi0/1', 'core', 'Gi0/0')
  n.connect('isp2', 'Gi0/1', 'core', 'Gi0/1')
  n.connect('cust', 'Gi0/2', 'pc', 'e0')
  n.connect('core', 'Gi0/2', 'srv', 'e0')

  addr(n, 'cust', 'Gi0/0', '10.0.1.1', '255.255.255.252')
  addr(n, 'isp1', 'Gi0/0', '10.0.1.2', '255.255.255.252')
  addr(n, 'cust', 'Gi0/1', '10.0.2.1', '255.255.255.252')
  addr(n, 'isp2', 'Gi0/0', '10.0.2.2', '255.255.255.252')
  addr(n, 'isp1', 'Gi0/1', '10.0.3.1', '255.255.255.252')
  addr(n, 'core', 'Gi0/0', '10.0.3.2', '255.255.255.252')
  addr(n, 'isp2', 'Gi0/1', '10.0.4.1', '255.255.255.252')
  addr(n, 'core', 'Gi0/1', '10.0.4.2', '255.255.255.252')
  addr(n, 'cust', 'Gi0/2', '192.168.1.1', '255.255.255.0')
  addr(n, 'core', 'Gi0/2', '8.8.8.1', '255.255.255.0')
  addr(n, 'srv', 'e0', '8.8.8.10', '255.255.255.0')
  n.get('srv')!.defaultGateway = '8.8.8.1'

  // the providers and the far core already peer with each other
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
  return n
}

export const p2l4Config: ConfigureSpec = {
  build: bgpLab,
  layout: [
    { id: 'pc', x: 70, y: 180, type: 'pc' as const, accent: 'var(--nq-beginner)' },
    { id: 'cust', x: 250, y: 180, type: 'router' as const },
    { id: 'isp1', x: 460, y: 80, type: 'router' as const },
    { id: 'isp2', x: 460, y: 285, type: 'router' as const },
    { id: 'core', x: 670, y: 180, type: 'router' as const },
    { id: 'srv', x: 840, y: 180, type: 'server' as const, accent: 'var(--nq-ccnp)' },
  ],
  terminals: ['cust', 'isp1', 'pc'],
  viewBox: { w: 920, h: 390 },
  tasks: [
    {
      id: 'process',
      instruction: H('CUST પર BGP ચાલુ કરો — તમારો AS 65001 છે', 'Start BGP on CUST — your AS is 65001'),
      why: H(
        'અત્યાર સુધીના બધા protocols એક જ સંસ્થાની અંદર ચાલતા હતા. BGP જુદો છે: એ બે જુદી સંસ્થાઓ વચ્ચે વાત કરે છે, અને એટલે એ ઝડપ નહીં પણ *નીતિ* જુએ છે.',
        'Every protocol so far ran inside one organisation. BGP is different: it talks between separate organisations, so it cares about policy rather than speed.',
      ),
      hints: [
        H('AS number એ તમારી સંસ્થાનો ઓળખ નંબર છે.', 'The AS number is your organisation identifier.'),
        H('router bgp 65001', 'router bgp 65001'),
        H('enable\nconf t\nrouter bgp 65001', 'enable\nconf t\nrouter bgp 65001'),
      ],
      check: (n) => n.get('cust')?.bgp?.asn === 65001,
      done: H('CUST નો AS 65001 છે', 'CUST is in AS 65001'),
    },
    {
      id: 'neighbors',
      instruction: H(
        'બંને providers સાથે session બનાવો: 10.0.1.2 (AS 65010) અને 10.0.2.2 (AS 65020)',
        'Peer with both providers: 10.0.1.2 (AS 65010) and 10.0.2.2 (AS 65020)',
      ),
      why: H(
        'BGP જાતે પાડોશી શોધતો નથી — તમારે દરેકનું સરનામું અને એનો AS જાતે લખવો પડે. બંને છેડે લખાયેલું હોય તો જ session બને.',
        'BGP does not discover neighbours. You name each one by address and AS, and the session only comes up when both ends have done so.',
      ),
      hints: [
        H('દરેક પાડોશી માટે એક લાઈન.', 'One line per neighbour.'),
        H('neighbor <ip> remote-as <as>', 'neighbor <ip> remote-as <as>'),
        H(
          'neighbor 10.0.1.2 remote-as 65010\nneighbor 10.0.2.2 remote-as 65020',
          'neighbor 10.0.1.2 remote-as 65010\nneighbor 10.0.2.2 remote-as 65020',
        ),
      ],
      check: (n) => (n.get('cust')?.bgp?.neighbors.length ?? 0) >= 2,
      done: H('બંને providers સાથે session', 'Sessions with both providers'),
    },
    {
      id: 'advertise',
      instruction: H(
        'તમારું network 192.168.1.0/24 દુનિયાને જાહેર કરો',
        'Advertise your own 192.168.1.0/24 to the world',
      ),
      why: H(
        'Session બનવાથી કશું જાહેર થતું નથી. "network" લખો ત્યારે જ તમે કહો છો "આ prefix મારું છે, મારી પાસે મોકલો".',
        'A session advertises nothing by itself. The network statement is how you say "this prefix is mine, send it to me".',
      ),
      hints: [
        H('BGP માં network statement સાથે mask લખવો પડે છે.', 'In BGP the network statement needs an explicit mask.'),
        H('network 192.168.1.0 mask 255.255.255.0', 'network 192.168.1.0 mask 255.255.255.0'),
        H('network 192.168.1.0 mask 255.255.255.0', 'network 192.168.1.0 mask 255.255.255.0'),
      ],
      check: (n) => !!n.get('cust')?.bgp?.networks.length,
      done: H('તમારું prefix જાહેર થયું', 'Your prefix is advertised'),
    },
    {
      id: 'learned',
      instruction: H(
        'ચકાસો કે CUST એ 8.8.8.0/24 બંને રસ્તે શીખ્યું (show ip bgp)',
        'Check that CUST learned 8.8.8.0/24 over both paths (show ip bgp)',
      ),
      why: H(
        'એક જ prefix માટે બે રસ્તા મળ્યા — એક ISP1 થઈને, એક ISP2 થઈને. AS-PATH માં કયા દેશો વટાવવા પડશે એ લખેલું છે.',
        'Two paths arrived for the same prefix, one through each provider. The AS-PATH lists which countries you would cross on the way.',
      ),
      hints: [
        H('BGP નું પોતાનું ટેબલ routing table થી જુદું છે.', 'The BGP table is separate from the routing table.'),
        H('show ip bgp · show ip bgp summary', 'show ip bgp · show ip bgp summary'),
        H('end\nshow ip bgp summary\nshow ip bgp', 'end\nshow ip bgp summary\nshow ip bgp'),
      ],
      check: (n) => n.get('cust')!.routingTable().some((r) => r.source === 'B' && r.prefix === '8.8.8.0'),
      done: H('દૂરનું prefix શીખાયું', 'The far prefix is in the table'),
    },
    {
      id: 'reach',
      instruction: H('PC પરથી SRV (8.8.8.10) ને ping કરો', 'From PC, ping SRV at 8.8.8.10'),
      hints: [
        H('PC ટેબ પર જાઓ.', 'Go to the PC tab.'),
        H('enable → ping 8.8.8.10', 'enable → ping 8.8.8.10'),
        H('enable\nping 8.8.8.10', 'enable\nping 8.8.8.10'),
      ],
      check: (n) => n.ping('pc', '8.8.8.10').ok,
      done: H('બીજા AS સુધી પહોંચ', 'You reached another autonomous system'),
    },
  ],
  success: H(
    'તમે હમણાં જ ઈન્ટરનેટ જે રીતે ચાલે છે એ જ કર્યું — બે providers સાથે peering, પોતાનું prefix જાહેર, અને AS-PATH જોઈને રસ્તો પસંદ. હવે અજમાવો: "neighbor 10.0.2.2 local-preference 200" લખો અને "show ip route" માં જુઓ કે traffic બીજા provider પર કૂદી જાય છે — લિંક એવી ને એવી, ફક્ત નીતિ બદલાઈ.',
    'You have just done what the internet itself does: peer with two providers, advertise your own prefix, and choose a path by AS-PATH. Now try this — type "neighbor 10.0.2.2 local-preference 200" and watch "show ip route" move your traffic to the other provider. Same links, different policy.',
  ),
}
