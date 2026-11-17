import type { BreakSpec } from '../components/BreakStage'
import { Network } from '../engine/network'

/**
 * The six Foundation breaks that were still missing.
 *
 * b2l2 — MAC: the physical name nobody can change
 * b2l5 — Binary: the mask that slices the street
 * b3l1 — Packet: what happens when the road is cut
 * b3l3 — TCP vs UDP: reliable vs fast
 * b3l4 — Port numbers: blocking the door, not the house
 * b3l5 — Protocol: the language both sides must speak
 */

const H = (gu: string, en: string) => ({ gu, en })

function addr(n: Network, id: string, ifn: string, ip: string, mask: string) {
  const i = n.get(id)!.iface(ifn)!
  i.ip = ip
  i.mask = mask
  i.shutdown = false
}

function host(n: Network, id: string, name: string, ip: string, gw?: string, kind: 'pc' | 'server' = 'pc') {
  n.addDevice({ id, name, kind, ifaces: ['e0'] })
  const i = n.get(id)!.iface('e0')!
  i.ip = ip
  i.mask = '255.255.255.0'
  if (gw) n.get(id)!.defaultGateway = gw
}

const down = (n: Network, id: string, ifn: string, v: boolean) => {
  n.get(id)!.iface(ifn)!.shutdown = v
  n.rev++
}

/* ═══════════ b2l2 · the MAC address you cannot change ═══════════ */

function macLab() {
  const n = new Network()
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  host(n, 'pc1', 'PC1', '192.168.1.10')
  host(n, 'pc2', 'PC2', '192.168.1.20')
  host(n, 'srv', 'SERVER', '192.168.1.50', undefined, 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw', 'Fa0/2')
  n.connect('srv', 'e0', 'sw', 'Fa0/3')
  return n
}

export const b2l2Break: BreakSpec = {
  build: macLab,
  viewBox: { w: 860, h: 340 },
  layout: [
    { id: 'pc1', x: 120, y: 80, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 430, y: 170, type: 'switch' },
    { id: 'pc2', x: 120, y: 280, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'srv', x: 740, y: 170, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'ત્રણ ઉપકરણ, એક switch. MAC address એ ફેક્ટરીમાં લખાયેલું નામ છે — ઉપકરણ બદલો ત્યારે MAC બદલાય, IP બદલો ત્યારે MAC **એ જ** રહે. અહીં ત્રણ રીતે તોડો, અને જુઓ MAC ક્યાં કામ કરે છે ને ક્યાં IP.',
    'Three devices, one switch. A MAC address is the name burned in at the factory — change the device and the MAC changes, change the IP and the MAC **stays**. Break it three ways and see where MAC matters and where IP does.',
  ),
  actions: [
    {
      id: 'unplug',
      label: H('PC2 ને switch માંથી કાઢો', 'Unplug PC2 from the switch'),
      explain: H(
        'PC2 નો cable કાઢો. MAC ત્યાં જ છે, IP ત્યાં જ છે — પણ switch ને ખબર જ ન પડે કે PC2 છે.',
        'Pull PC2’s cable. The MAC is still there, the IP is still there — but the switch has no idea PC2 exists.',
      ),
      expect: H(
        'Switch MAC table માંથી PC2 ગાયબ. PC1 broadcast કરશે, PC2 સાંભળશે નહીં. **MAC ખબર હોવી પૂરતી નથી — ભૌતિક રીતે જોડાયેલું હોવું પણ જોઈએ.**',
        'PC2 vanishes from the switch MAC table. PC1 broadcasts, PC2 cannot hear. **Knowing a MAC is not enough — the device must be physically connected.**',
      ),
      apply: (n) => down(n, 'pc2', 'e0', true),
      revert: (n) => down(n, 'pc2', 'e0', false),
    },
    {
      id: 'sameip',
      label: H('PC2 ને PC1 નું IP આપો', 'Give PC2 the same IP as PC1'),
      explain: H(
        'બે ઉપકરણને એક જ IP (192.168.1.10). MAC તો જુદા જ છે.',
        'Two devices with the same IP (192.168.1.10). Their MACs are still different.',
      ),
      expect: H(
        'Switch ને MAC ની ભૂલ નથી — એ IP જોતું જ નથી, ફક્ત MAC. પણ **IP duplicate છે** એટલે ARP ગૂંચવાશે — કોનું MAC લેવું? આ કારણે DHCP ની જરૂર પડે.',
        'The switch sees no MAC error — it does not look at IP, only MAC. But **the IP is duplicated**, so ARP gets confused — whose MAC to take? This is exactly why DHCP exists.',
      ),
      apply: (n) => {
        addr(n, 'pc2', 'e0', '192.168.1.10', '255.255.255.0')
        n.rev++
      },
      revert: (n) => {
        addr(n, 'pc2', 'e0', '192.168.1.20', '255.255.255.0')
        n.rev++
      },
    },
    {
      id: 'noip',
      label: H('Server નું IP ભૂંસો', 'Erase the server’s IP'),
      explain: H(
        'Server ની NIC (MAC) એ જ. ફક્ત IP કાઢી નાખો.',
        'The server’s NIC (MAC) stays. Only the IP goes away.',
      ),
      expect: H(
        'MAC હજી switch table માં દેખાય — **ભૌતિક ઓળખ અખંડ છે**. પણ IP વગર ARP request ને જવાબ ન મળે, એટલે ડેટા ન પહોંચે. MAC એ "કોણ", IP એ "ક્યાં" — બંને જોઈએ.',
        'The MAC still shows in the switch table — **the physical identity is intact**. But without an IP the ARP request gets no answer, so no data arrives. MAC is "who", IP is "where" — you need both.',
      ),
      apply: (n) => {
        const i = n.get('srv')!.iface('e0')!
        i.ip = undefined
        n.rev++
      },
      revert: (n) => {
        addr(n, 'srv', 'e0', '192.168.1.50', '255.255.255.0')
        n.rev++
      },
    },
  ],
  probes: [
    { id: 'p12', from: 'pc1', to: 'pc2', destIp: '192.168.1.20', label: H('PC1 → PC2', 'PC1 → PC2') },
    { id: 'psrv', from: 'pc1', to: 'srv', destIp: '192.168.1.50', label: H('PC1 → Server', 'PC1 → Server') },
  ],
}

/* ═══════════ b2l5 · the mask that cuts the street ═══════════ */

function binaryLab() {
  const n = new Network()
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  n.addDevice({ id: 'r1', name: 'ROUTER', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  host(n, 'pc1', 'PC1', '192.168.1.10', '192.168.1.1')
  host(n, 'pc2', 'PC2', '192.168.1.200', '192.168.1.1')
  host(n, 'web', 'WEB', '10.0.0.50', '10.0.0.1', 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw', 'Fa0/2')
  n.connect('sw', 'Fa0/3', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'web', 'e0')
  addr(n, 'r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '10.0.0.1', '255.255.255.0')
  return n
}

export const b2l5Break: BreakSpec = {
  build: binaryLab,
  viewBox: { w: 880, h: 340 },
  layout: [
    { id: 'pc1', x: 110, y: 80, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'pc2', x: 110, y: 270, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 350, y: 175, type: 'switch' },
    { id: 'r1', x: 580, y: 175, type: 'router', accent: 'var(--nq-ccna)' },
    { id: 'web', x: 800, y: 175, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'Subnet mask binary માં કામ કરે છે — 255 એટલે "આખું ચેક કરો", 0 એટલે "છોડી દો". Mask બદલો અને જુઓ કે PC ને શું "પાડોશી" દેખાય છે ને શું "દૂર" — **એ જ binary ની અસર છે**.',
    'A subnet mask works in binary — 255 means "check all of this", 0 means "skip it". Change the mask and watch what the PC considers a neighbour versus what it considers far away — **that is binary in action**.',
  ),
  actions: [
    {
      id: 'half',
      label: H('PC1 નો mask /25 કરો', 'Change PC1’s mask to /25'),
      explain: H(
        'Mask `255.255.255.128`. Binary માં છેલ્લા byte ના **પહેલા bit** ચાલુ: `.1` થી `.127` એક શેરી, `.128` થી `.255` બીજી.',
        'Mask `255.255.255.128`. In binary the **first bit** of the last byte is on: `.1` to `.127` is one street, `.128` to `.255` another.',
      ),
      silent: true,
      expect: H(
        'PC1 હજી PC2 ને પહોંચે છે — પણ **સીધું નહીં**. PC1 ના /25 mask પ્રમાણે `.200` બીજી શેરીમાં છે, એટલે એ packet gateway ને સોંપે છે અને router એને એ જ switch પર પાછો મોકલે છે. Ping લીલું રહે છે, પણ રસ્તો લાંબો થઈ ગયો. **ખોટો mask મદદગાર router ની પાછળ સંતાઈ જાય છે** — જે દિવસે router નહીં હોય, તે દિવસે ખબર પડશે.',
        'PC1 still reaches PC2 — but **not directly**. By PC1’s /25 mask, `.200` sits on another street, so it hands the packet to the gateway and the router sends it straight back out to the same switch. The ping stays green while the path quietly got longer. **A wrong mask hides behind a helpful router** — the day the router is gone is the day you find out.',
      ),
      apply: (n) => addr(n, 'pc1', 'e0', '192.168.1.10', '255.255.255.128'),
      revert: (n) => addr(n, 'pc1', 'e0', '192.168.1.10', '255.255.255.0'),
    },
    {
      id: 'tiny',
      label: H('PC1 નો mask /30 કરો', 'Shrink PC1’s mask to /30'),
      explain: H(
        'Mask `255.255.255.252`. ફક્ત **બે** host ને જગ્યા: `.9` અને `.10`. બાકી બધું "દૂર".',
        'Mask `255.255.255.252`. Room for only **two** hosts: `.9` and `.10`. Everything else is "far away".',
      ),
      expect: H(
        'Gateway (`.1`) પણ "દૂર" થઈ ગયું — અને gateway જ ન મળે તો **ક્યાંય** પહોંચાય નહીં. /30 link-net માટે વપરાય — router-to-router, host માટે નહીં.',
        'Even the gateway (`.1`) becomes "far away" — and without a gateway **nothing** is reachable. /30 is used for link-nets between routers, not for hosts.',
      ),
      apply: (n) => addr(n, 'pc1', 'e0', '192.168.1.10', '255.255.255.252'),
      revert: (n) => addr(n, 'pc1', 'e0', '192.168.1.10', '255.255.255.0'),
    },
    {
      id: 'wide',
      label: H('PC1 નો mask /8 કરો', 'Widen PC1’s mask to /8'),
      explain: H(
        'Mask `255.0.0.0`. PC1 માને છે કે `192.*.*.*` નું **બધું** એક જ શેરીમાં.',
        'Mask `255.0.0.0`. PC1 believes everything in `192.*.*.*` is on its street.',
      ),
      expect: H(
        'પાડોશી અને gateway ચાલે. WEB (10.0.0.50) ને PC1 દૂર ગણે — ત્યાં gateway ને આપે, **અને એ હજી સાચું છે**. ખૂબ મોટો mask ત્યારે વાગે જ્યારે `192.168.2.*` જેવું ખરેખર બીજું subnet આવી જાય.',
        'The neighbour and gateway work. WEB (10.0.0.50) PC1 treats as remote — hands to gateway, **and that still works**. Too wide a mask bites only when a genuinely different `192.168.2.*` subnet shows up.',
      ),
      silent: true,
      apply: (n) => addr(n, 'pc1', 'e0', '192.168.1.10', '255.0.0.0'),
      revert: (n) => addr(n, 'pc1', 'e0', '192.168.1.10', '255.255.255.0'),
    },
  ],
  probes: [
    { id: 'p12', from: 'pc1', to: 'pc2', destIp: '192.168.1.200', label: H('PC1 → PC2', 'PC1 → PC2') },
    { id: 'pweb', from: 'pc1', to: 'web', destIp: '10.0.0.50', label: H('PC1 → WEB', 'PC1 → WEB') },
  ],
}

/* ═══════════ b3l1 · the road is cut ═══════════ */

function packetLab() {
  const n = new Network()
  n.addDevice({ id: 'sw1', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Gi0/1'] })
  n.addDevice({ id: 'sw2', name: 'SW2', kind: 'switch', ifaces: ['Gi0/1', 'Fa0/1'] })
  host(n, 'pc1', 'PC1', '192.168.1.10')
  host(n, 'pc2', 'PC2', '192.168.1.20')
  host(n, 'srv', 'SERVER', '192.168.1.50', undefined, 'server')
  n.connect('pc1', 'e0', 'sw1', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw1', 'Fa0/2')
  n.connect('sw1', 'Gi0/1', 'sw2', 'Gi0/1')
  n.connect('srv', 'e0', 'sw2', 'Fa0/1')
  return n
}

export const b3l1Break: BreakSpec = {
  build: packetLab,
  viewBox: { w: 860, h: 340 },
  layout: [
    { id: 'pc1', x: 100, y: 80, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'pc2', x: 100, y: 270, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw1', x: 350, y: 170, type: 'switch' },
    { id: 'sw2', x: 600, y: 170, type: 'switch' },
    { id: 'srv', x: 780, y: 170, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'Packet એ ડેટાનો ટુકડો છે — દરેક ટુકડો **એક જ** રસ્તે ચાલે. રસ્તો તૂટે તો ટુકડો ક્યાંય ન પહોંચે. અહીં ત્રણ જુદા ટુકડા તોડો અને જુઓ કે **ક્યાં** તૂટ્યું.',
    'A packet is a piece of data — every piece travels **one road**. If the road breaks, the piece goes nowhere. Break three different links here and see **where** it breaks.',
  ),
  actions: [
    {
      id: 'trunk',
      label: H('બે switch વચ્ચેનું link કાપો', 'Cut the link between the two switches'),
      explain: H(
        'SW1 અને SW2 ને જોડતું link. PC1 અને PC2 આ બાજુ, Server પેલી બાજુ.',
        'The link joining SW1 and SW2. PC1 and PC2 are on this side, the server on that side.',
      ),
      expect: H(
        'PC1 ↔ PC2 હજી ચાલે — બંને **એ જ switch** પર છે. Server નો packet **SW2 ને પહોંચી જ ન શકે**. એક link તૂટ્યું, ફક્ત પેલી બાજુના packet ને અસર.',
        'PC1 ↔ PC2 still works — both are on **the same switch**. The server’s packets **cannot reach SW2**. One link down, only packets going that way are affected.',
      ),
      apply: (n) => down(n, 'sw1', 'Gi0/1', true),
      revert: (n) => down(n, 'sw1', 'Gi0/1', false),
    },
    {
      id: 'pc1',
      label: H('PC1 નો cable કાઢો', 'Pull PC1’s cable'),
      explain: H(
        'ફક્ત PC1 ને અલગ કરો. બાકી બધું જેમનું તેમ.',
        'Disconnect PC1 only. Everything else stays the same.',
      ),
      expect: H(
        'PC2 ↔ Server હજી ચાલે. ફક્ત **PC1 ના** packet ક્યાંય ન જાય. એક cable = એક ઉપકરણ. દરેક packet ના રસ્તાનું પહેલું પગલું **પોતાનો cable** છે.',
        'PC2 ↔ Server still works. Only **PC1** loses contact. One cable = one device. Every packet starts its journey on **its own cable**.',
      ),
      apply: (n) => down(n, 'pc1', 'e0', true),
      revert: (n) => down(n, 'pc1', 'e0', false),
    },
    {
      id: 'srv',
      label: H('Server ને disconnect કરો', 'Disconnect the server'),
      explain: H(
        'Server ની cable નીકળી ગઈ. બંને PC ને Switch બરાબર.',
        'The server’s cable is out. Both PCs and the switches are fine.',
      ),
      expect: H(
        'PC1 → PC2 ચાલે, PC → Server **ન ચાલે**. Packet SW2 સુધી **પહોંચે**, પણ ત્યાંથી Server ને આપવાનો રસ્તો નથી. **છેલ્લો ટુકડો** ગુમ.',
        'PC1 → PC2 works, PC → Server **does not**. The packet **reaches** SW2, but there is no last mile to the server. The **last hop** is missing.',
      ),
      apply: (n) => down(n, 'srv', 'e0', true),
      revert: (n) => down(n, 'srv', 'e0', false),
    },
  ],
  probes: [
    { id: 'p12', from: 'pc1', to: 'pc2', destIp: '192.168.1.20', label: H('PC1 → PC2', 'PC1 → PC2') },
    { id: 'psrv', from: 'pc1', to: 'srv', destIp: '192.168.1.50', label: H('PC1 → Server', 'PC1 → Server') },
    { id: 'p2s', from: 'pc2', to: 'srv', destIp: '192.168.1.50', label: H('PC2 → Server', 'PC2 → Server') },
  ],
}

/* ═══════════ b3l3 · blocking with and without a receipt ═══════════ */

function tcpUdpLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'ROUTER', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  host(n, 'pc1', 'PC1', '192.168.1.10', '192.168.1.1')
  host(n, 'web', 'WEB', '10.0.0.80', '10.0.0.1', 'server')
  host(n, 'dns', 'DNS', '192.168.1.53', undefined, 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('dns', 'e0', 'sw', 'Fa0/2')
  n.connect('sw', 'Fa0/3', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'web', 'e0')
  addr(n, 'r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '10.0.0.1', '255.255.255.0')
  return n
}

export const b3l3Break: BreakSpec = {
  build: tcpUdpLab,
  viewBox: { w: 880, h: 340 },
  layout: [
    { id: 'pc1', x: 110, y: 175, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'dns', x: 350, y: 60, type: 'server', accent: 'var(--nq-pkt-dns)' },
    { id: 'sw', x: 350, y: 260, type: 'switch' },
    { id: 'r1', x: 590, y: 260, type: 'router', accent: 'var(--nq-ccna)' },
    { id: 'web', x: 800, y: 175, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'DNS ને **UDP** (ઝડપી, ભરોસો ઓછો) અને website ને **TCP** (ધીમું, ભરોસો પૂરો) વપરાય. અલગ અલગ ટુકડા તોડો — અને જુઓ કે "દરવાજો" ક્યાં ખૂલે ને ક્યાં ન ખૂલે.',
    'DNS uses **UDP** (fast, no guarantees) and a website uses **TCP** (slower, fully reliable). Break different parts and see which door opens and which stays shut.',
  ),
  actions: [
    {
      id: 'dns',
      label: H('DNS server બંધ કરો', 'Take DNS offline'),
      explain: H(
        'DNS server ની cable કાઢો. UDP ની સેવા ગઈ.',
        'Unplug the DNS server. The UDP service is gone.',
      ),
      expect: H(
        'નામ ન મળે. UDP ફરી ન મોકલે — **ભરોસો** client ને ખુદને રાખવો પડે. Website ને સીધા IP થી પહોંચાય. DNS નથી ≠ Internet નથી.',
        'Names stop resolving. UDP does not retry — the **trust** is on the client. The website is still reachable by IP. No DNS does not mean no Internet.',
      ),
      apply: (n) => down(n, 'dns', 'e0', true),
      revert: (n) => down(n, 'dns', 'e0', false),
    },
    {
      id: 'web',
      label: H('Web server બંધ કરો', 'Take the web server offline'),
      explain: H(
        'WEB server ની cable કાઢો. TCP ની સેવા ગઈ.',
        'Unplug the web server. The TCP service is gone.',
      ),
      expect: H(
        'DNS હજી નામ ઉકેલે — **UDP ને કશી ખબર નથી** કે website ક્યાંક ગઈ. TCP connection **ત્રણ-પગલાની ઓળખ** (handshake) જ થાય નહીં — client ને **ખબર પડે કે ન ખૂલ્યું**.',
        'DNS still resolves names — **UDP knows nothing** about the web going down. The TCP three-way handshake never completes — the client **knows it failed**.',
      ),
      apply: (n) => down(n, 'web', 'e0', true),
      revert: (n) => down(n, 'web', 'e0', false),
    },
    {
      id: 'road',
      label: H('Router ની બહારની link તોડો', 'Break the router’s outside link'),
      explain: H(
        'Router થી WEB સુધીનો રસ્તો તૂટ્યો. DNS (LAN માં) ચાલુ.',
        'The road from the router to WEB is cut. DNS (on the LAN) still works.',
      ),
      expect: H(
        'DNS (UDP) હજી **ચાલે** — એ LAN માં છે. Website (TCP) **timeout** — TCP ફરી ફરી મોકલે, પણ **જવાબ ન આવે** ત્યારે connection drop કરે. UDP ભરોસો નથી રાખતું; TCP ભરોસો રાખે પણ **રસ્તો જ ન હોય તો છેવટે હારે**.',
        'DNS (UDP) still **works** — it is on the LAN. Website (TCP) **times out** — TCP retries, but when **no answer comes** it eventually drops the connection. UDP makes no promises; TCP makes promises but **gives up when the road itself is gone**.',
      ),
      apply: (n) => down(n, 'r1', 'Gi0/1', true),
      revert: (n) => down(n, 'r1', 'Gi0/1', false),
    },
  ],
  probes: [
    { id: 'pdns', from: 'pc1', to: 'dns', destIp: '192.168.1.53', label: H('DNS (UDP)', 'DNS (UDP)') },
    { id: 'pweb', from: 'pc1', to: 'web', destIp: '10.0.0.80', label: H('Website (TCP)', 'Website (TCP)') },
  ],
}

/* ═══════════ b3l4 · blocking the door, not the house ═══════════ */

function portLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'ROUTER', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2'] })
  host(n, 'pc1', 'PC1', '192.168.1.10', '192.168.1.1')
  host(n, 'srv', 'SERVER', '10.0.0.80', '10.0.0.1', 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('sw', 'Fa0/2', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'srv', 'e0')
  addr(n, 'r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '10.0.0.1', '255.255.255.0')
  return n
}

export const b3l4Break: BreakSpec = {
  build: portLab,
  viewBox: { w: 860, h: 300 },
  layout: [
    { id: 'pc1', x: 110, y: 150, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 340, y: 150, type: 'switch' },
    { id: 'r1', x: 560, y: 150, type: 'router', accent: 'var(--nq-ccna)' },
    { id: 'srv', x: 780, y: 150, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'Server પર ઘણા દરવાજા છે — port 80 (HTTP), port 443 (HTTPS), port 22 (SSH). **દરવાજો** બંધ કરો એટલે એ સેવા ગઈ, ઘર ત્યાં જ છે. Ping (ICMP) ચાલે પણ website ન ખૂલે — આ ફરક port number નો છે.',
    'The server has many doors — port 80 (HTTP), port 443 (HTTPS), port 22 (SSH). **Close a door** and that service is gone while the house is still there. Ping (ICMP) works but the website does not open — that difference is port numbers.',
  ),
  actions: [
    {
      id: 'web',
      label: H('Website નું TCP traffic બંધ કરો', 'Block the website’s TCP traffic'),
      explain: H(
        'Router ને નિયમ આપો: TCP ને પસાર ન થવા દો. Website TCP પર ચાલે છે — ping નથી ચાલતું.',
        'Give the router a rule: do not let TCP through. A website runs on TCP — a ping does not.',
      ),
      silent: true,
      expect: H(
        'બધી ચકાસણી **લીલી જ રહે છે** — કારણ કે ping ICMP વાપરે છે અને આ નિયમ TCP માટે છે. Website બંધ થઈ ગઈ છે, પણ ping એ બતાવી શકતું નથી. **"Ping ચાલે છે" અને "સેવા ચાલે છે" એ બે જુદી વાત છે** — એટલે જ port અને protocol જોવા પડે.',
        'Every probe **stays green** — because a ping is ICMP and this rule is about TCP. The website is shut, and the ping cannot see it. **"The ping works" and "the service works" are two different claims** — which is exactly why ports and protocols are worth reading.',
      ),
      apply: (n) => {
        const r = n.get('r1')!
        const ANY = { ip: '0.0.0.0', wildcard: '255.255.255.255' }
        r.acls.set('100', {
          id: '100',
          extended: true,
          entries: [
            {
              seq: 10,
              action: 'deny',
              protocol: 'tcp',
              src: ANY.ip,
              srcWildcard: ANY.wildcard,
              dst: ANY.ip,
              dstWildcard: ANY.wildcard,
            },
            {
              seq: 20,
              action: 'permit',
              protocol: 'ip',
              src: ANY.ip,
              srcWildcard: ANY.wildcard,
              dst: ANY.ip,
              dstWildcard: ANY.wildcard,
            },
          ],
        })
        r.iface('Gi0/0')!.aclIn = '100'
        n.rev++
      },
      revert: (n) => {
        n.get('r1')!.iface('Gi0/0')!.aclIn = undefined
        n.rev++
      },
    },
    {
      id: 'all',
      label: H('Server ની cable કાઢો', 'Pull the server’s cable'),
      explain: H(
        'Server ને ભૌતિક રીતે disconnect. કોઈ port નહીં, કોઈ ping નહીં.',
        'Physically disconnect the server. No ports, no ping.',
      ),
      expect: H(
        '**બધું** ગયું — HTTP, HTTPS, SSH, ping. આ port નથી, આ **ઘર** જ ગયું. Port block અને cable cut નો ફરક: port block = દરવાજો બંધ, cable cut = આખું ઘર ગાયબ.',
        '**Everything** is gone — HTTP, HTTPS, SSH, ping. This is not a port, the **house** is gone. The difference between port block and cable cut: port block = one door shut, cable cut = the whole house is gone.',
      ),
      apply: (n) => down(n, 'srv', 'e0', true),
      revert: (n) => down(n, 'srv', 'e0', false),
    },
    {
      id: 'gateway',
      label: H('PC1 નું gateway ભૂંસો', 'Erase PC1’s gateway'),
      explain: H(
        'PC1 ને gateway ની ખબર ન રહે. Server ના port તો ચાલુ જ છે.',
        'PC1 no longer knows the gateway. The server’s ports are all open.',
      ),
      expect: H(
        'PC1 ને ખબર છે કે Server "બહાર" છે — પણ **બહાર જવાનો દરવાજો** (gateway) ગુમ. Port numbers ચેક સુધી પહોંચે જ નહીં. **Layer 3 ન ચાલે તો Layer 4 ને મોકો જ ન મળે.**',
        'PC1 knows the server is "outside" but the **door to the outside** (gateway) is missing. Port numbers never enter the picture. **If layer 3 fails, layer 4 never gets a turn.**',
      ),
      apply: (n) => {
        n.get('pc1')!.defaultGateway = undefined
        n.rev++
      },
      revert: (n) => {
        n.get('pc1')!.defaultGateway = '192.168.1.1'
        n.rev++
      },
    },
  ],
  probes: [
    { id: 'ping', from: 'pc1', to: 'srv', destIp: '10.0.0.80', label: H('Ping (ICMP)', 'Ping (ICMP)') },
  ],
}

/* ═══════════ b3l5 · the rules both sides agree on ═══════════ */

function protocolLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'ROUTER', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  host(n, 'pc1', 'PC1', '192.168.1.10', '192.168.1.1')
  host(n, 'pc2', 'PC2', '192.168.1.20', '192.168.1.1')
  host(n, 'srv', 'SERVER', '10.5.5.50', '10.5.5.1', 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw', 'Fa0/2')
  n.connect('sw', 'Fa0/3', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'srv', 'e0')
  addr(n, 'r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '10.5.5.1', '255.255.255.0')
  return n
}

export const b3l5Break: BreakSpec = {
  build: protocolLab,
  viewBox: { w: 880, h: 340 },
  layout: [
    { id: 'pc1', x: 110, y: 80, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'pc2', x: 110, y: 270, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 350, y: 175, type: 'switch' },
    { id: 'r1', x: 580, y: 175, type: 'router', accent: 'var(--nq-ccna)' },
    { id: 'srv', x: 800, y: 175, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'Protocol એ નિયમ છે — "બોલતાં પહેલાં હાથ મિલાવો", "IP વાપરો", "આ port પર સાંભળો". નિયમ **બંને બાજુ** સરખા હોવા જોઈએ. અહીં એક એક નિયમ તોડો — Layer 1 થી Layer 3 સુધી — અને જુઓ કે **ફરક** શું થાય.',
    'A protocol is a rule — "shake hands before you talk", "use IP", "listen on this port". The rules must match on **both sides**. Break one rule at a time — from layer 1 to layer 3 — and see what **changes**.',
  ),
  actions: [
    {
      id: 'cable',
      label: H('Layer 1 નિયમ: PC1 નું cable cut', 'Layer 1 rule: cut PC1’s cable'),
      explain: H(
        'Layer 1 protocol: "signal હોવો જોઈએ". Cable નીકળ્યું, signal ગયું.',
        'Layer 1 protocol: "there must be a signal". Cable out, signal gone.',
      ),
      expect: H(
        '**બધું** ગયું. ઉપરનો કોઈ protocol મદદ ન કરી શકે — Layer 1 વગર Layer 2, 3, 4 ને **મોકો જ નથી**. Protocol ની સીડી **નીચેથી** ચાલે.',
        '**Everything** fails. No higher protocol can help — without layer 1, layers 2, 3 and 4 **never get a chance**. The protocol ladder runs **from the bottom**.',
      ),
      apply: (n) => down(n, 'pc1', 'e0', true),
      revert: (n) => down(n, 'pc1', 'e0', false),
    },
    {
      id: 'subnet',
      label: H('Layer 3 નિયમ: PC2 ને જુદું subnet', 'Layer 3 rule: move PC2 to a different subnet'),
      explain: H(
        'PC2 નું IP 10.0.0.20 કરો. Cable અને switch **બરાબર**, ફક્ત IP protocol ના નિયમ તૂટ્યો.',
        'Give PC2 the IP 10.0.0.20. Cable and switch are **fine**, only the IP protocol’s rule is broken.',
      ),
      expect: H(
        'PC1 → PC2 **નિષ્ફળ**: PC1 ને PC2 "દૂર" દેખાય — IP protocol કહે "subnet match નથી, gateway ને આપ". **Layer 1, 2 સંપૂર્ણ** — ફક્ત Layer 3 ના નિયમ ન મળ્યા.',
        'PC1 → PC2 **fails**: PC1 sees PC2 as "far away" — the IP protocol says "subnet mismatch, hand to gateway". **Layers 1 and 2 are perfect** — only the layer 3 rules disagree.',
      ),
      apply: (n) => {
        addr(n, 'pc2', 'e0', '10.0.0.20', '255.255.255.0')
        n.rev++
      },
      revert: (n) => {
        addr(n, 'pc2', 'e0', '192.168.1.20', '255.255.255.0')
        n.rev++
      },
    },
    {
      id: 'route',
      label: H('Layer 3 નિયમ: Router નો રસ્તો ભૂંસો', 'Layer 3 rule: erase the router’s road'),
      explain: H(
        'Router ની Server બાજુની link બંધ. PC ↔ PC ને ફરક ન પડે.',
        'Shut the router’s link towards the server. PC to PC is untouched.',
      ),
      expect: H(
        'PC1 → PC2 **ચાલે** (same subnet, router ની જરૂર નથી). PC → Server **ન ચાલે**: routing protocol ને રસ્તો નથી મળતો. **Protocol નો નિયમ** છે "રસ્તો ખબર હોવો જોઈએ" — ન હોય તો packet drop.',
        'PC1 → PC2 **works** (same subnet, no router needed). PC → Server **fails**: the routing protocol has no road. The **protocol rule** is "you must know the way" — and when you do not, the packet is dropped.',
      ),
      apply: (n) => down(n, 'r1', 'Gi0/1', true),
      revert: (n) => down(n, 'r1', 'Gi0/1', false),
    },
  ],
  probes: [
    { id: 'p12', from: 'pc1', to: 'pc2', destIp: '192.168.1.20', label: H('PC1 → PC2 (LAN)', 'PC1 → PC2 (LAN)') },
    { id: 'psrv', from: 'pc1', to: 'srv', destIp: '10.5.5.50', label: H('PC1 → Server (WAN)', 'PC1 → Server (WAN)') },
  ],
}
