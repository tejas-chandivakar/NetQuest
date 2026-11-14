import type { ConfigureSpec } from '../components/ConfigureStage'
import type { BreakSpec } from '../components/BreakStage'
import { Network, type Device } from '../engine/network'

/* ───────── shared builders ───────── */

function host(n: Network, id: string, name: string, ip: string, sw: string, port: string) {
  n.addDevice({ id, name, kind: 'pc', ifaces: ['e0'] })
  const f = n.get(id)!.iface('e0')!
  f.ip = ip
  f.mask = '255.255.255.0'
  n.connect(id, 'e0', sw, port)
}

const access = (d: Device, port: string, vlan: number) => {
  const sp = d.iface(port)!.switchport!
  sp.mode = 'access'
  sp.accessVlan = vlan
  if (!d.vlans.has(vlan)) d.vlans.set(vlan, `VLAN${vlan}`)
}

/** One switch, four hosts, everything still in the default VLAN. */
function oneSwitch() {
  const n = new Network()
  n.addDevice({
    id: 'sw1',
    name: 'SW1',
    kind: 'switch',
    ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4'],
  })
  host(n, 'pc1', 'PC1', '192.168.1.11', 'sw1', 'Fa0/1')
  host(n, 'pc2', 'PC2', '192.168.1.12', 'sw1', 'Fa0/2')
  host(n, 'pc3', 'PC3', '192.168.1.13', 'sw1', 'Fa0/3')
  host(n, 'pc4', 'PC4', '192.168.1.14', 'sw1', 'Fa0/4')
  return n
}

const ONE_SWITCH_LAYOUT = [
  { id: 'pc1', x: 140, y: 85, type: 'pc' as const, accent: 'var(--nq-beginner)' },
  { id: 'pc2', x: 140, y: 300, type: 'pc' as const, accent: 'var(--nq-beginner)' },
  { id: 'sw1', x: 430, y: 192, type: 'switch' as const },
  { id: 'pc3', x: 720, y: 85, type: 'pc' as const, accent: 'var(--nq-ccnp)' },
  { id: 'pc4', x: 720, y: 300, type: 'pc' as const, accent: 'var(--nq-ccnp)' },
]

/* ───────── n2l2 · VLANs on one switch ───────── */

const portVlan = (n: Network, port: string) => n.get('sw1')?.iface(port)?.switchport?.accessVlan

export const n2l2Config: ConfigureSpec = {
  build: oneSwitch,
  layout: ONE_SWITCH_LAYOUT,
  terminals: ['sw1', 'pc1'],
  viewBox: { w: 860, h: 390 },
  tasks: [
    {
      id: 'vlan10',
      instruction: {
        gu: 'VLAN 10 બનાવો અને એનું નામ Sales રાખો',
        en: 'Create VLAN 10 and name it Sales',
      },
      why: {
        gu: 'અત્યારે ચારેય કમ્પ્યુટર એક જ જૂથમાં છે — કોઈ કોઈને જોઈ શકે છે. પહેલાં જૂથ બનાવીએ.',
        en: 'Right now all four computers are in one group and everybody can see everybody. First we create the groups.',
      },
      hints: [
        { gu: 'Global config માં VLAN બનાવાય છે, interface માં નહીં.', en: 'VLANs are created in global config, not under an interface.' },
        { gu: 'conf t → vlan <id> → name <નામ>', en: 'conf t → vlan <id> → name <name>' },
        { gu: 'enable\nconf t\nvlan 10\nname Sales', en: 'enable\nconf t\nvlan 10\nname Sales' },
      ],
      check: (n) => n.get('sw1')?.vlans.get(10) === 'Sales',
      done: { gu: 'VLAN 10 (Sales) બની ગયું', en: 'VLAN 10 (Sales) exists' },
    },
    {
      id: 'vlan20',
      instruction: {
        gu: 'VLAN 20 બનાવો અને એનું નામ Accounts રાખો',
        en: 'Create VLAN 20 and name it Accounts',
      },
      hints: [
        { gu: 'એ જ બે કમાન્ડ, બીજા નંબર સાથે.', en: 'The same two commands with a different number.' },
        { gu: 'exit કરીને ફરી vlan 20 લખો.', en: 'exit back out and type vlan 20.' },
        { gu: 'exit\nvlan 20\nname Accounts', en: 'exit\nvlan 20\nname Accounts' },
      ],
      check: (n) => n.get('sw1')?.vlans.get(20) === 'Accounts',
      done: { gu: 'VLAN 20 (Accounts) બની ગયું', en: 'VLAN 20 (Accounts) exists' },
    },
    {
      id: 'ports10',
      instruction: {
        gu: 'Fa0/1 અને Fa0/2 ને VLAN 10 માં મૂકો',
        en: 'Put Fa0/1 and Fa0/2 into VLAN 10',
      },
      why: {
        gu: 'VLAN બનાવવું પૂરતું નથી — કયો પોર્ટ કયા જૂથનો છે એ કહેવું પડે.',
        en: 'Creating a VLAN is not enough — you have to say which port belongs to which group.',
      },
      hints: [
        { gu: 'દરેક interface પર બે લાઈન જોઈશે: mode અને vlan.', en: 'Each interface needs two lines: the mode and the VLAN.' },
        { gu: 'interface Fa0/1 → switchport mode access → switchport access vlan 10', en: 'interface Fa0/1 → switchport mode access → switchport access vlan 10' },
        {
          gu: 'exit\ninterface Fa0/1\nswitchport mode access\nswitchport access vlan 10\ninterface Fa0/2\nswitchport mode access\nswitchport access vlan 10',
          en: 'exit\ninterface Fa0/1\nswitchport mode access\nswitchport access vlan 10\ninterface Fa0/2\nswitchport mode access\nswitchport access vlan 10',
        },
      ],
      check: (n) => portVlan(n, 'Fa0/1') === 10 && portVlan(n, 'Fa0/2') === 10,
      done: { gu: 'PC1 અને PC2 હવે Sales માં છે', en: 'PC1 and PC2 are in Sales' },
    },
    {
      id: 'ports20',
      instruction: {
        gu: 'Fa0/3 અને Fa0/4 ને VLAN 20 માં મૂકો',
        en: 'Put Fa0/3 and Fa0/4 into VLAN 20',
      },
      hints: [
        { gu: 'એ જ ત્રણ લાઈન, બીજા બે પોર્ટ પર.', en: 'The same three lines on the other two ports.' },
        { gu: 'interface Fa0/3 → … vlan 20', en: 'interface Fa0/3 → … vlan 20' },
        {
          gu: 'interface Fa0/3\nswitchport mode access\nswitchport access vlan 20\ninterface Fa0/4\nswitchport mode access\nswitchport access vlan 20',
          en: 'interface Fa0/3\nswitchport mode access\nswitchport access vlan 20\ninterface Fa0/4\nswitchport mode access\nswitchport access vlan 20',
        },
      ],
      check: (n) => portVlan(n, 'Fa0/3') === 20 && portVlan(n, 'Fa0/4') === 20,
      done: { gu: 'PC3 અને PC4 હવે Accounts માં છે', en: 'PC3 and PC4 are in Accounts' },
    },
    {
      id: 'verify',
      instruction: {
        gu: 'PC1 ટેબ પરથી ચકાસો: PC2 (192.168.1.12) ને ping ચાલવી જોઈએ, PC3 (192.168.1.13) ને નહીં',
        en: 'From the PC1 tab check that PC2 (192.168.1.12) answers and PC3 (192.168.1.13) does not',
      },
      why: {
        gu: 'ચારેય કમ્પ્યુટર એક જ switch પર, એક જ 192.168.1.x network માં છે. છતાં અડધા હવે પહોંચતા નથી — કારણ કે VLAN એમને અલગ કરી નાખ્યા છે.',
        en: 'All four sit on one switch in one 192.168.1.x network. Yet half of them are now unreachable, purely because the VLAN separated them.',
      },
      hints: [
        { gu: 'ઉપરના PC1 ટેબ પર ક્લિક કરો.', en: 'Click the PC1 tab above.' },
        { gu: 'enable → ping 192.168.1.12 → ping 192.168.1.13', en: 'enable → ping 192.168.1.12 → ping 192.168.1.13' },
        { gu: 'enable\nping 192.168.1.12\nping 192.168.1.13', en: 'enable\nping 192.168.1.12\nping 192.168.1.13' },
      ],
      check: (n) => n.ping('pc1', '192.168.1.12').ok && !n.ping('pc1', '192.168.1.13').ok,
      done: { gu: 'બે જૂથ ખરેખર અલગ પડી ગયાં', en: 'The two groups really are separated' },
    },
  ],
  success: {
    gu: 'એક જ switch, એક જ વાયરિંગ — છતાં હવે બે સાવ અલગ નેટવર્ક. આ જ VLAN છે. switch પર "show vlan brief" લખીને આખું ચિત્ર જુઓ, અને "show mac address-table" માં જુઓ કે દરેક MAC કયા VLAN સામે શીખાયું છે.',
    en: 'One switch, the same cabling — and now two completely separate networks. That is a VLAN. Type "show vlan brief" on the switch to see the whole picture, and "show mac address-table" to see each MAC learned against its own VLAN.',
  },
}

/* ───────── n2l2 · break it ───────── */

function vlanSplit() {
  const n = oneSwitch()
  const sw = n.get('sw1')!
  sw.vlans.set(10, 'Sales')
  sw.vlans.set(20, 'Accounts')
  access(sw, 'Fa0/1', 10)
  access(sw, 'Fa0/2', 10)
  access(sw, 'Fa0/3', 20)
  access(sw, 'Fa0/4', 20)
  return n
}

export const n2l2Break: BreakSpec = {
  build: vlanSplit,
  layout: ONE_SWITCH_LAYOUT,
  viewBox: { w: 860, h: 390 },
  intro: {
    gu: 'VLAN બરાબર ગોઠવાયેલાં છે: PC1+PC2 એક જૂથમાં, PC3+PC4 બીજામાં. હવે એવી ભૂલો કરો જે ખરેખર ઓફિસોમાં થાય છે — અને જુઓ કે એ કેટલી શાંતિથી સુરક્ષા તોડી નાખે છે.',
    en: 'The VLANs are set up properly: PC1+PC2 in one group, PC3+PC4 in the other. Now make the mistakes that really happen in offices — and see how quietly they undo the separation.',
  },
  actions: [
    {
      id: 'wrong-vlan',
      label: { gu: 'Fa0/3 ને ભૂલથી VLAN 10 માં મૂકો', en: 'Move Fa0/3 into VLAN 10 by mistake' },
      explain: {
        gu: 'SW1 પર: interface Fa0/3 → switchport access vlan 10',
        en: 'On SW1: interface Fa0/3 → switchport access vlan 10',
      },
      expect: {
        gu: 'આ ભૂલ કોઈ error નથી આપતી — કંઈ "તૂટતું" નથી. પણ હવે Accounts નો PC3 સીધો Sales ના નેટવર્કમાં બેઠો છે. ping ચકાસો: જે પહોંચવું ન જોઈએ એ પહોંચે છે.',
        en: 'This mistake throws no error — nothing appears to break. But PC3 from Accounts now sits inside the Sales network. Run the ping: something that should not be reachable now is.',
      },
      apply: (n) => {
        access(n.get('sw1')!, 'Fa0/3', 10)
        n.rev++
      },
      revert: (n) => {
        access(n.get('sw1')!, 'Fa0/3', 20)
        n.rev++
      },
    },
    {
      id: 'orphan-vlan',
      label: { gu: 'Fa0/1 ને ખાલી VLAN 99 માં મૂકો', en: 'Put Fa0/1 into empty VLAN 99' },
      explain: {
        gu: 'એક એવા VLAN માં જેમાં બીજું કોઈ નથી.',
        en: 'Into a VLAN with nobody else in it.',
      },
      expect: {
        gu: 'PC1 નું સરનામું, cable, switch — બધું બરાબર છે, છતાં એ કોઈ સુધી પહોંચતો નથી. "ખોટો VLAN" એ ફિલ્ડની સૌથી સામાન્ય ફરિયાદ છે.',
        en: "PC1's address, cable and switch are all fine, yet it reaches nobody. Wrong VLAN is the most common complaint in the field.",
      },
      apply: (n) => {
        access(n.get('sw1')!, 'Fa0/1', 99)
        n.rev++
      },
      revert: (n) => {
        access(n.get('sw1')!, 'Fa0/1', 10)
        n.rev++
      },
    },
    {
      id: 'shut-port',
      label: { gu: 'Fa0/2 બંધ કરો', en: 'Shut down Fa0/2' },
      explain: { gu: 'PC2 નો પોર્ટ બંધ.', en: "Close PC2's port." },
      expect: {
        gu: 'લિંક લાલ. Switch પર એ MAC નું entry પણ થોડા વખતમાં ટેબલમાંથી નીકળી જાય.',
        en: 'The link goes red, and in time that MAC also ages out of the table.',
      },
      apply: (n) => {
        n.get('sw1')!.iface('Fa0/2')!.shutdown = true
        n.rev++
      },
      revert: (n) => {
        n.get('sw1')!.iface('Fa0/2')!.shutdown = false
        n.rev++
      },
    },
  ],
  startsFailing: ['cross'],
  probes: [
    {
      id: 'same',
      from: 'pc1',
      to: 'pc2',
      destIp: '192.168.1.12',
      label: { gu: 'PC1 → PC2 (એક જ VLAN)', en: 'PC1 → PC2 (same VLAN)' },
    },
    {
      id: 'cross',
      from: 'pc1',
      to: 'pc3',
      destIp: '192.168.1.13',
      label: { gu: 'PC1 → PC3 (બીજું VLAN)', en: 'PC1 → PC3 (other VLAN)' },
    },
  ],
}

/* ───────── n2l3 · trunking between two switches ───────── */

function twoSwitches() {
  const n = new Network()
  for (const [id, name] of [
    ['sw1', 'SW1'],
    ['sw2', 'SW2'],
  ]) {
    n.addDevice({ id, name, kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Gi0/1'] })
  }
  n.connect('sw1', 'Gi0/1', 'sw2', 'Gi0/1')

  host(n, 'pc1', 'PC1', '192.168.1.11', 'sw1', 'Fa0/1')
  host(n, 'pc3', 'PC3', '192.168.1.13', 'sw1', 'Fa0/2')
  host(n, 'pc2', 'PC2', '192.168.1.12', 'sw2', 'Fa0/1')
  host(n, 'pc4', 'PC4', '192.168.1.14', 'sw2', 'Fa0/2')

  for (const sw of ['sw1', 'sw2']) {
    const d = n.get(sw)!
    d.vlans.set(10, 'Sales')
    d.vlans.set(20, 'Accounts')
    access(d, 'Fa0/1', 10)
    access(d, 'Fa0/2', 20)
  }
  return n
}

const trunkOn = (n: Network, sw: string) => n.get(sw)?.iface('Gi0/1')?.switchport?.mode === 'trunk'
const allowed = (n: Network, sw: string) => n.get(sw)?.iface('Gi0/1')?.switchport?.allowedVlans

export const n2l3Config: ConfigureSpec = {
  build: twoSwitches,
  layout: [
    { id: 'pc1', x: 105, y: 265, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw1', x: 300, y: 100, type: 'switch' },
    { id: 'pc3', x: 360, y: 285, type: 'pc', accent: 'var(--nq-ccnp)' },
    { id: 'pc4', x: 560, y: 285, type: 'pc', accent: 'var(--nq-ccnp)' },
    { id: 'sw2', x: 620, y: 100, type: 'switch' },
    { id: 'pc2', x: 800, y: 265, type: 'pc', accent: 'var(--nq-beginner)' },
  ],
  terminals: ['sw1', 'sw2', 'pc1'],
  viewBox: { w: 900, h: 380 },
  tasks: [
    {
      id: 'trunk-sw1',
      instruction: {
        gu: 'SW1 નું Gi0/1 (બે switch વચ્ચેની લિંક) trunk બનાવો',
        en: 'Make SW1 Gi0/1 (the link between the switches) a trunk',
      },
      why: {
        gu: 'VLAN 10 અને 20 બંને switch પર છે, પણ વચ્ચેની લિંક અત્યારે access port છે — એટલે એ એક જ VLAN વહન કરી શકે. Trunk એ લિંક છે જે ઘણા VLAN એકસાથે લઈ જાય, દરેક frame પર tag લગાવીને.',
        en: 'VLANs 10 and 20 exist on both switches, but the link between them is still an access port, so it can carry only one VLAN. A trunk is a link that carries many VLANs at once by tagging each frame.',
      },
      hints: [
        { gu: 'Trunk એ interface નું setting છે.', en: 'Trunk is a setting on the interface.' },
        { gu: 'interface Gi0/1 → switchport mode trunk', en: 'interface Gi0/1 → switchport mode trunk' },
        { gu: 'enable\nconf t\ninterface Gi0/1\nswitchport mode trunk', en: 'enable\nconf t\ninterface Gi0/1\nswitchport mode trunk' },
      ],
      check: (n) => trunkOn(n, 'sw1'),
      done: { gu: 'SW1 નું uplink trunk છે', en: 'The SW1 uplink is a trunk' },
    },
    {
      id: 'trunk-sw2',
      instruction: { gu: 'SW2 પર પણ Gi0/1 ને trunk બનાવો', en: 'Make Gi0/1 a trunk on SW2 as well' },
      why: {
        gu: 'Trunk બંને છેડે જોઈએ. એક બાજુ trunk અને બીજી બાજુ access હોય તો tag સમજાય નહીં.',
        en: 'A trunk is needed at both ends. Trunk on one side and access on the other means the tags are not understood.',
      },
      hints: [
        { gu: 'ઉપરના SW2 ટેબ પર ક્લિક કરો.', en: 'Click the SW2 tab above.' },
        { gu: 'એ જ ત્રણ લાઈન.', en: 'The same three lines.' },
        { gu: 'enable\nconf t\ninterface Gi0/1\nswitchport mode trunk', en: 'enable\nconf t\ninterface Gi0/1\nswitchport mode trunk' },
      ],
      check: (n) => trunkOn(n, 'sw2'),
      done: { gu: 'બંને છેડે trunk છે', en: 'Both ends are trunks' },
    },
    {
      id: 'allowed-sw2',
      instruction: {
        gu: 'SW2 ના trunk પર ફક્ત VLAN 10 અને 20 ને જ પરવાનગી આપો',
        en: 'Allow only VLANs 10 and 20 across the SW2 trunk',
      },
      why: {
        gu: 'Default માં trunk બધાં 4094 VLAN વહન કરે છે. જે જોઈએ એટલાં જ રાખવાં એ સારી practice છે — અને exam માં પુછાય છે.',
        en: 'By default a trunk carries all 4094 VLANs. Allowing only the ones you need is good practice — and it is on the exam.',
      },
      hints: [
        { gu: 'Allowed list પણ એ જ interface પર લખાય છે.', en: 'The allowed list goes on the same interface.' },
        { gu: 'switchport trunk allowed vlan 10,20', en: 'switchport trunk allowed vlan 10,20' },
        { gu: 'interface Gi0/1\nswitchport trunk allowed vlan 10,20', en: 'interface Gi0/1\nswitchport trunk allowed vlan 10,20' },
      ],
      check: (n) => {
        const a = allowed(n, 'sw2')
        return !!a && a.includes(10) && a.includes(20) && a.length === 2
      },
      done: { gu: 'SW2 નું trunk ફક્ત 10 અને 20 લઈ જાય છે', en: 'The SW2 trunk carries only 10 and 20' },
    },
    {
      id: 'verify',
      instruction: {
        gu: 'PC1 પરથી ચકાસો: PC2 (192.168.1.12) પહોંચે, PC4 (192.168.1.14) નહીં',
        en: 'From PC1 check that PC2 (192.168.1.12) answers but PC4 (192.168.1.14) does not',
      },
      why: {
        gu: 'PC1 અને PC2 જુદા switch પર છે છતાં એક જ VLAN માં — એટલે trunk એમને જોડે છે. PC4 બીજા VLAN માં છે, એટલે એ જ trunk પરથી જતું હોવા છતાં અલગ જ રહે છે.',
        en: 'PC1 and PC2 are on different switches but in the same VLAN, so the trunk joins them. PC4 is in the other VLAN, so even though it crosses the same trunk it stays separate.',
      },
      hints: [
        { gu: 'PC1 ટેબ પર જાઓ.', en: 'Go to the PC1 tab.' },
        { gu: 'enable → ping 192.168.1.12 → ping 192.168.1.14', en: 'enable → ping 192.168.1.12 → ping 192.168.1.14' },
        { gu: 'enable\nping 192.168.1.12\nping 192.168.1.14', en: 'enable\nping 192.168.1.12\nping 192.168.1.14' },
      ],
      check: (n) => n.ping('pc1', '192.168.1.12').ok && !n.ping('pc1', '192.168.1.14').ok,
      done: { gu: 'VLAN switch ઓળંગી ગયું, અલગ રહીને', en: 'The VLAN crossed the switch, still separated' },
    },
  ],
  success: {
    gu: 'એક જ વાયર હવે બે VLAN વહન કરે છે, અને છતાં બંને અલગ રહે છે — કારણ કે દરેક frame પર VLAN નું tag લાગે છે. કોઈ પણ switch પર "show interfaces trunk" લખીને જુઓ. હવે તોડીને જુઓ: SW1 ના trunk પર "switchport trunk allowed vlan 10" લખો — VLAN 20 તરત કપાઈ જશે.',
    en: 'One wire now carries two VLANs while keeping them apart, because every frame gets a VLAN tag. Type "show interfaces trunk" on either switch to see it. Now break it: on the SW1 trunk type "switchport trunk allowed vlan 10" and VLAN 20 is cut off instantly.',
  },
}
