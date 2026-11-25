import type { BreakSpec } from '../components/BreakStage'
import { Network } from '../engine/network'

/**
 * CCNA Break it specs.
 *
 * Each lab starts healthy, then exposes two or three faults you will actually
 * meet in the field: a native VLAN mismatch, a missing default route, a
 * trust-port on the wrong side. The learner guesses where it will fail, then
 * runs the probe and sees — in the real engine, not a mock — exactly how.
 */

const H = (gu: string, hi: string, en: string) => ({ gu, hi, en })

/* ──────── helpers ──────── */

function host(n: Network, id: string, name: string, ip: string, mask = '255.255.255.0', gw?: string) {
  n.addDevice({ id, name, kind: 'pc', ifaces: ['e0'] })
  const i = n.get(id)!.iface('e0')!
  i.ip = ip
  i.mask = mask
  if (gw) n.get(id)!.defaultGateway = gw
}

function server(n: Network, id: string, name: string, ip: string, gw?: string) {
  n.addDevice({ id, name, kind: 'server', ifaces: ['e0'] })
  const i = n.get(id)!.iface('e0')!
  i.ip = ip
  i.mask = '255.255.255.0'
  if (gw) n.get(id)!.defaultGateway = gw
}

function router(n: Network, id: string, name: string, ifaces: string[]) {
  n.addDevice({ id, name, kind: 'router', ifaces })
  n.get(id)!.ipRouting = true
}

function addrIf(n: Network, dev: string, ifn: string, ip: string, mask = '255.255.255.0') {
  const i = n.get(dev)!.iface(ifn)!
  i.ip = ip
  i.mask = mask
  i.shutdown = false
}

const shut = (n: Network, dev: string, ifn: string, v: boolean) => {
  n.get(dev)!.iface(ifn)!.shutdown = v
  n.rev++
}

/* ═════════════ n1l1 · Components and Topology ═════════════ */

function n1l1Lab() {
  const n = new Network()
  router(n, 'r1', 'R1', ['g0/0', 'g0/1'])
  n.addDevice({ id: 'sw1', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2'] })
  host(n, 'pc1', 'PC1', '192.168.1.11', '255.255.255.0', '192.168.1.1')
  server(n, 'srv1', 'SRV1', '10.0.0.10', '10.0.0.1')
  addrIf(n, 'r1', 'g0/0', '192.168.1.1')
  addrIf(n, 'r1', 'g0/1', '10.0.0.1')
  n.connect('pc1', 'e0', 'sw1', 'Fa0/1')
  n.connect('sw1', 'Fa0/2', 'r1', 'g0/0')
  n.connect('r1', 'g0/1', 'srv1', 'e0')
  return n
}

export const n1l1Break: BreakSpec = {
  build: n1l1Lab,
  viewBox: { w: 900, h: 320 },
  layout: [
    { id: 'pc1', x: 90, y: 160, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'sw1', x: 300, y: 160, type: 'switch' },
    { id: 'r1', x: 540, y: 160, type: 'router' },
    { id: 'srv1', x: 780, y: 160, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'દરેક device નો પોતાનો role છે: switch ની અંદર, router બહાર, server જવાબ આપે. એક role ઓછું કરો અને જુઓ કે બીજા device શું કરી શકે છે — ને શું નહીં.',
    'हर device का अपना role है: switch अंदर, router बाहर, server जवाब दे। एक role हटाएं और देखें कि बाकी device क्या कर सकते हैं — और क्या नहीं।',
    'Every device has one job: the switch stitches a floor together, the router crosses floors, the server answers. Take one away and watch what the rest can — and cannot — do.',
  ),
  actions: [
    {
      id: 'switch-off',
      label: H('SW1 નો PC1 તરફનો port બંધ કરો', 'SW1 का PC1 तरफ का port बंद करें', 'Shut SW1’s port to PC1'),
      explain: H('Switch પર shutdown — PC1 નો access cut.', 'Switch पर shutdown — PC1 का access कट।', 'Shutdown on the switch port — PC1 loses access.'),
      expect: H('PC1 જ બહાર ના નીકળે, SRV1 ઉપરાંત કોઈ સાથે નહીં.', 'PC1 ही बाहर न निकले, SRV1 तो क्या किसी के साथ नहीं।', 'PC1 cannot leave at all — not to the server, not to anyone.'),
      apply: (n) => shut(n, 'sw1', 'Fa0/1', true),
      revert: (n) => shut(n, 'sw1', 'Fa0/1', false),
    },
    {
      id: 'router-down',
      label: H('R1 g0/1 shutdown', 'R1 g0/1 shutdown', 'Shut R1 g0/1'),
      explain: H('Server તરફનું interface બંધ — connected route ખોવાય.', 'Server की तरफ का interface बंद — connected route खो जाए।', 'The server-side interface goes down — its connected route is gone.'),
      expect: H('PC1 → SRV1 fail: R1 પાસે હવે 10.0.0.0/24 ની entry જ નથી.', 'PC1 → SRV1 fail: R1 के पास अब 10.0.0.0/24 की entry ही नहीं।', 'PC1 → SRV1 fails: R1 no longer has an entry for 10.0.0.0/24.'),
      apply: (n) => shut(n, 'r1', 'g0/1', true),
      revert: (n) => shut(n, 'r1', 'g0/1', false),
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'srv1', destIp: '10.0.0.10', label: H('PC1 → SRV1', 'PC1 → SRV1', 'PC1 → SRV1') },
  ],
}

/* ═════════════ n1l2 · Cabling and Interfaces ═════════════ */

function n1l2Lab() {
  const n = new Network()
  n.addDevice({ id: 'sw1', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2'] })
  host(n, 'pc1', 'PC1', '10.1.1.11', '255.255.255.0')
  host(n, 'pc2', 'PC2', '10.1.1.12', '255.255.255.0')
  n.connect('pc1', 'e0', 'sw1', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw1', 'Fa0/2')
  return n
}

export const n1l2Break: BreakSpec = {
  build: n1l2Lab,
  viewBox: { w: 860, h: 300 },
  layout: [
    { id: 'pc1', x: 120, y: 160, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'sw1', x: 420, y: 160, type: 'switch' },
    { id: 'pc2', x: 720, y: 160, type: 'pc', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'વાયર lab નું સૌથી અવગણાતું layer છે — અને field માં સૌથી વધારે તૂટતું. અહીં ત્રણ રીત છે જેમાં "બધી config બરાબર" છતાં કશું ચાલતું નથી.',
    'केबल lab की सबसे उपेक्षित layer है — और field में सबसे ज्यादा टूटती। यहां तीन तरीके हैं जिनमें "सारी config ठीक" फिर भी कुछ नहीं चले।',
    'Cabling is the layer labs ignore most and the field breaks most. Here are three ways "the config is fine" and still nothing passes.',
  ),
  actions: [
    {
      id: 'cut1',
      label: H('PC1 ↔ SW1 વાયર કાપો', 'PC1 ↔ SW1 केबल काटें', 'Cut PC1 ↔ SW1 cable'),
      explain: H('ફક્ત વાયર તૂટેલો — બંને device ચાલુ, બંને પાસે address છે.', 'केवल केबल टूटा — दोनों device चालू, दोनों के पास address है।', 'Only the cable is cut — both devices are on and addressed.'),
      expect: H('Link down. PC1 આખા network થી ખોવાઈ ગયું.', 'Link down। PC1 पूरे network से कट गया।', 'Link down. PC1 is cut off from the whole network.'),
      apply: (n) => n.setLinkCut('pc1', 'e0', true),
      revert: (n) => n.setLinkCut('pc1', 'e0', false),
    },
    {
      id: 'shut-sw',
      label: H('SW1 Fa0/2 shutdown', 'SW1 Fa0/2 shutdown', 'Shutdown SW1 Fa0/2'),
      explain: H('PC2 તરફનો switch port admin-down.', 'PC2 की तरफ का switch port admin-down।', 'The switch-side port to PC2 is administratively down.'),
      expect: H('PC2 દેખાય તો છે ("green"), પણ એનો switch-side દરવાજો બંધ છે.', 'PC2 दिखे तो सही ("green"), पर उसका switch-side दरवाजा बंद है।', 'PC2 looks alive, but the door on the switch side is shut.'),
      apply: (n) => shut(n, 'sw1', 'Fa0/2', true),
      revert: (n) => shut(n, 'sw1', 'Fa0/2', false),
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'pc2', destIp: '10.1.1.12', label: H('PC1 → PC2', 'PC1 → PC2', 'PC1 → PC2') },
  ],
}

/* ═════════════ n1l3 · IPv4 Addressing ═════════════ */

function n1l3Lab() {
  const n = new Network()
  n.addDevice({ id: 'sw1', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  host(n, 'pc1', 'PC1', '192.168.10.11', '255.255.255.0')
  host(n, 'pc2', 'PC2', '192.168.10.12', '255.255.255.0')
  host(n, 'pc3', 'PC3', '192.168.10.13', '255.255.255.0')
  n.connect('pc1', 'e0', 'sw1', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw1', 'Fa0/2')
  n.connect('pc3', 'e0', 'sw1', 'Fa0/3')
  return n
}

export const n1l3Break: BreakSpec = {
  build: n1l3Lab,
  viewBox: { w: 880, h: 340 },
  layout: [
    { id: 'pc1', x: 120, y: 90, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'pc2', x: 760, y: 90, type: 'pc', accent: 'var(--nq-ccnp)' },
    { id: 'sw1', x: 440, y: 230, type: 'switch' },
    { id: 'pc3', x: 440, y: 90, type: 'pc', accent: 'var(--nq-beginner)' },
  ],
  intro: H(
    'IP સરનામું **network** કહે છે, mask **ક્યાં સુધી** કહે છે. mask ખોટો — અને બે pc "જુદા networks" માં પહોંચી જાય, એક જ wire પર હોવા છતાં.',
    'IP पता **network** बताए, mask **कहां तक** बताए। mask गलत — और दो pc "अलग networks" में पहुंच जाएं, एक ही wire पर होने के बावजूद।',
    'An IP says **which network**, the mask says **how far it reaches**. Get the mask wrong and two PCs land in "different networks" though they share one wire.',
  ),
  actions: [
    {
      id: 'wrong-mask',
      label: H('PC2 નો mask /24 થી /30 કરો', 'PC2 का mask /24 से /30 करें', 'Change PC2’s mask from /24 to /30'),
      explain: H('સરનામું એ જ, mask ટૂંકું — PC2 માને કે એનું network ફક્ત 4 addresses નું છે.', 'पता वही, mask छोटा — PC2 माने कि उसका network सिर्फ 4 addresses का है।', 'Same IP, tighter mask — PC2 now thinks its network holds only 4 addresses.'),
      expect: H('PC2 → PC1 ફેલ. PC2 માને PC1 બહાર છે, પણ gateway નથી.', 'PC2 → PC1 फेल। PC2 माने PC1 बाहर है, पर gateway नहीं।', 'PC2 → PC1 fails. PC2 decides PC1 is outside and tries a gateway that does not exist.'),
      apply: (n) => addrIf(n, 'pc2', 'e0', '192.168.10.12', '255.255.255.252'),
      revert: (n) => addrIf(n, 'pc2', 'e0', '192.168.10.12', '255.255.255.0'),
    },
    {
      id: 'shut-pc1',
      label: H('PC1 નું interface shutdown', 'PC1 का interface shutdown', 'Shut PC1’s interface'),
      explain: H('PC1 જ બંધ — કોઈ પણ probe એને reach ના કરી શકે.', 'PC1 ही बंद — कोई भी probe उस तक नहीं पहुंच सके।', 'Shut PC1 — nothing can reach it.'),
      expect: H('બંને direction fail.', 'दोनों direction fail।', 'Both directions fail.'),
      apply: (n) => shut(n, 'pc1', 'e0', true),
      revert: (n) => shut(n, 'pc1', 'e0', false),
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'pc2', destIp: '192.168.10.12', label: H('PC1 → PC2', 'PC1 → PC2', 'PC1 → PC2') },
    { id: 'b', from: 'pc2', to: 'pc1', destIp: '192.168.10.11', label: H('PC2 → PC1', 'PC2 → PC1', 'PC2 → PC1') },
  ],
}

/* ═════════════ n2l1 · Switching and the MAC Table ═════════════ */

function n2l1Lab() {
  const n = new Network()
  n.addDevice({ id: 'sw1', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  host(n, 'pc1', 'PC1', '10.0.0.11')
  host(n, 'pc2', 'PC2', '10.0.0.12')
  host(n, 'pc3', 'PC3', '10.0.0.13')
  n.connect('pc1', 'e0', 'sw1', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw1', 'Fa0/2')
  n.connect('pc3', 'e0', 'sw1', 'Fa0/3')
  return n
}

export const n2l1Break: BreakSpec = {
  build: n2l1Lab,
  viewBox: { w: 880, h: 320 },
  layout: [
    { id: 'sw1', x: 440, y: 180, type: 'switch' },
    { id: 'pc1', x: 160, y: 60, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'pc2', x: 440, y: 60, type: 'pc', accent: 'var(--nq-ccnp)' },
    { id: 'pc3', x: 720, y: 60, type: 'pc', accent: 'var(--nq-beginner)' },
  ],
  intro: H(
    'Switch MAC address દ્વારા શીખે છે. એક port બંધ કરો, એક વાયર કાપો — અને જુઓ કે MAC table માં શું ખોવાય છે ને આખો LAN કેમ ભાંગે છે.',
    'Switch MAC address के जरिए सीखता है। एक port बंद करें, एक केबल काटें — और देखें कि MAC table से क्या खोता है और पूरा LAN कैसे टूटता है।',
    'A switch learns by watching MAC addresses. Pull a port, cut a wire — then see what disappears from the MAC table and how the LAN breaks.',
  ),
  actions: [
    {
      id: 'shut-pc2',
      label: H('SW1 Fa0/2 shutdown', 'SW1 Fa0/2 shutdown', 'Shutdown SW1 Fa0/2'),
      explain: H('PC2 તરફનો port બંધ. MAC entry timeout માં જતી રહેશે.', 'PC2 की तरफ का port बंद। MAC entry timeout में चली जाएगी।', 'The port to PC2 is shut. Its MAC entry ages out.'),
      expect: H('PC1 → PC2 fail. PC1 બૂમ પાડે પણ કોઈ switch-port પર જવાબ નથી આવતો.', 'PC1 → PC2 fail। PC1 चिल्लाए पर किसी switch-port से जवाब नहीं आता।', 'PC1 → PC2 fails. PC1 calls out but no switch port answers.'),
      apply: (n) => shut(n, 'sw1', 'Fa0/2', true),
      revert: (n) => shut(n, 'sw1', 'Fa0/2', false),
    },
    {
      id: 'cut-pc3',
      label: H('PC3 નો cable કાપો', 'PC3 का cable काटें', 'Cut PC3’s cable'),
      explain: H('Physical break — switch port down તરત દેખાશે.', 'Physical break — switch port down तुरंत दिखे।', 'Physical break — the port drops instantly.'),
      expect: H('PC3 અદૃશ્ય; PC1 & PC2 એક બીજા સાથે બરાબર.', 'PC3 गायब; PC1 & PC2 एक-दूसरे के साथ ठीक।', 'PC3 vanishes; PC1 and PC2 still talk fine.'),
      apply: (n) => n.setLinkCut('pc3', 'e0', true),
      revert: (n) => n.setLinkCut('pc3', 'e0', false),
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'pc2', destIp: '10.0.0.12', label: H('PC1 → PC2', 'PC1 → PC2', 'PC1 → PC2') },
    { id: 'b', from: 'pc1', to: 'pc3', destIp: '10.0.0.13', label: H('PC1 → PC3', 'PC1 → PC3', 'PC1 → PC3') },
  ],
}

/* ═════════════ n2l3 · Trunking and 802.1Q ═════════════ */

function n2l3Lab() {
  const n = new Network()
  n.addDevice({ id: 'sw1', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/24'] })
  n.addDevice({ id: 'sw2', name: 'SW2', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/24'] })
  host(n, 'pcA', 'PC-A', '10.10.10.11')
  host(n, 'pcB', 'PC-B', '10.10.10.12')
  // vlan 10 access ports
  const sp = (dev: string, port: string, vlan: number) => {
    n.get(dev)!.iface(port)!.switchport = { mode: 'access', accessVlan: vlan, nativeVlan: 1 }
  }
  sp('sw1', 'Fa0/1', 10)
  sp('sw2', 'Fa0/1', 10)
  // trunk between switches
  n.get('sw1')!.iface('Fa0/24')!.switchport = { mode: 'trunk', accessVlan: 1, nativeVlan: 1 }
  n.get('sw2')!.iface('Fa0/24')!.switchport = { mode: 'trunk', accessVlan: 1, nativeVlan: 1 }
  n.connect('pcA', 'e0', 'sw1', 'Fa0/1')
  n.connect('pcB', 'e0', 'sw2', 'Fa0/1')
  n.connect('sw1', 'Fa0/24', 'sw2', 'Fa0/24')
  return n
}

export const n2l3Break: BreakSpec = {
  build: n2l3Lab,
  viewBox: { w: 940, h: 320 },
  layout: [
    { id: 'pcA', x: 90, y: 160, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'sw1', x: 330, y: 160, type: 'switch' },
    { id: 'sw2', x: 620, y: 160, type: 'switch' },
    { id: 'pcB', x: 860, y: 160, type: 'pc', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'Trunk એટલે બે switch વચ્ચે એક વાયર પર અનેક VLAN. બંને છેડે તૈયારી એકસરખી જોઈએ — ખોટો native, allowed list માંથી ખૂટતો VLAN, કે access તરીકે configured — બધું ખબર વગર break કરે.',
    'Trunk यानी दो switch के बीच एक wire पर कई VLAN। दोनों छोर पर तैयारी समान चाहिए — गलत native, allowed list से गुम VLAN, या access के रूप में configured — सब बिना पता चले break करे।',
    'A trunk carries many VLANs over one wire between switches. Both ends must agree — wrong native, a missing allowed VLAN, or one side configured as access — all break the link in ways the lights hide.',
  ),
  actions: [
    {
      id: 'trunk-cut',
      label: H('Trunk વાયર કાપો', 'Trunk cable काटें', 'Cut the trunk cable'),
      explain: H('બે switch ને જોડતો inter-switch link down.', 'दो switch को जोड़ने वाला inter-switch link down।', 'The inter-switch link goes down.'),
      expect: H('pcA → pcB ફેલ — trunk વિના VLAN 10 બીજા switch સુધી પહોંચે નહીં.', 'pcA → pcB फेल — trunk बिना VLAN 10 दूसरे switch तक नहीं पहुंचे।', 'pcA → pcB fails — VLAN 10 cannot cross to the other switch without the trunk.'),
      apply: (n) => n.setLinkCut('sw1', 'Fa0/24', true),
      revert: (n) => n.setLinkCut('sw1', 'Fa0/24', false),
    },
    {
      id: 'trunk-to-access',
      label: H('SW1 નો trunk port access VLAN 1 કરો', 'SW1 का trunk port access VLAN 1 करें', 'Change SW1 trunk to access VLAN 1'),
      explain: H('એક છેડો trunk, બીજો access — VLAN 10 ના tagged frames drop થાય.', 'एक छोर trunk, दूसरा access — VLAN 10 के tagged frames drop हों।', 'One end trunk, the other access — VLAN 10 tagged frames are dropped.'),
      expect: H('pcA → pcB તૂટે, બીજી VLAN 1 ની traffic ચાલુ રહે.', 'pcA → pcB टूटे, बाकी VLAN 1 का traffic चालू रहे।', 'pcA → pcB breaks while any VLAN 1 traffic keeps flowing.'),
      apply: (n) => { n.get('sw1')!.iface('Fa0/24')!.switchport = { mode: 'access', accessVlan: 1, nativeVlan: 1 }; n.rev++ },
      revert: (n) => { n.get('sw1')!.iface('Fa0/24')!.switchport = { mode: 'trunk', accessVlan: 1, nativeVlan: 1 }; n.rev++ },
    },
  ],
  probes: [
    { id: 'a', from: 'pcA', to: 'pcB', destIp: '10.10.10.12', label: H('pcA → pcB (VLAN 10)', 'pcA → pcB (VLAN 10)', 'pcA → pcB (VLAN 10)') },
  ],
}

/* ═════════════ n2l4 · Inter-VLAN Routing ═════════════ */

function n2l4Lab() {
  const n = new Network()
  router(n, 'r1', 'R1', ['g0/0', 'g0/1'])
  host(n, 'pcA', 'PC-A', '10.10.10.11', '255.255.255.0', '10.10.10.1')
  host(n, 'pcB', 'PC-B', '10.10.20.11', '255.255.255.0', '10.10.20.1')
  addrIf(n, 'r1', 'g0/0', '10.10.10.1')
  addrIf(n, 'r1', 'g0/1', '10.10.20.1')
  n.connect('pcA', 'e0', 'r1', 'g0/0')
  n.connect('pcB', 'e0', 'r1', 'g0/1')
  return n
}

export const n2l4Break: BreakSpec = {
  build: n2l4Lab,
  viewBox: { w: 860, h: 300 },
  layout: [
    { id: 'pcA', x: 100, y: 150, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'r1', x: 430, y: 150, type: 'router' },
    { id: 'pcB', x: 760, y: 150, type: 'pc', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'બે VLAN (અહીં બે subnet તરીકે) ને જોડનાર router. એક leg shutdown કરો — અને જુઓ કે cross-subnet traffic કેવી રીતે તૂટે.',
    'दो VLAN (यहां दो subnet के रूप में) को जोड़ने वाला router। एक leg shutdown करें — और देखें कि cross-subnet traffic कैसे टूटता है।',
    'A router stitches two VLANs (shown here as two subnets) together. Shut one leg and watch cross-subnet traffic collapse.',
  ),
  actions: [
    {
      id: 'shut-leg',
      label: H('R1 નું VLAN 20 leg shutdown', 'R1 का VLAN 20 leg shutdown', 'Shut R1’s VLAN 20 leg'),
      explain: H('VLAN 20 નો gateway ખોવાયો.', 'VLAN 20 का gateway खो गया।', 'The gateway for VLAN 20 is gone.'),
      expect: H('pcA → pcB fail; પાછળ જવાનો રસ્તો જ નથી.', 'pcA → pcB fail; वापसी का रास्ता ही नहीं।', 'pcA → pcB fails; there is no return path.'),
      apply: (n) => shut(n, 'r1', 'g0/1', true),
      revert: (n) => shut(n, 'r1', 'g0/1', false),
    },
  ],
  probes: [
    { id: 'a', from: 'pcA', to: 'pcB', destIp: '10.10.20.11', label: H('pcA (VLAN 10) → pcB (VLAN 20)', 'pcA (VLAN 10) → pcB (VLAN 20)', 'pcA (VLAN 10) → pcB (VLAN 20)') },
  ],
}

/* ═════════════ n3l1 · Reading the routing table ═════════════ */

function n3l1Lab() {
  const n = new Network()
  router(n, 'r1', 'R1', ['g0/0', 'g0/1'])
  host(n, 'pc1', 'PC1', '10.1.1.11', '255.255.255.0', '10.1.1.1')
  server(n, 'srv1', 'SRV1', '10.2.2.10', '10.2.2.1')
  addrIf(n, 'r1', 'g0/0', '10.1.1.1')
  addrIf(n, 'r1', 'g0/1', '10.2.2.1')
  n.connect('pc1', 'e0', 'r1', 'g0/0')
  n.connect('r1', 'g0/1', 'srv1', 'e0')
  return n
}

export const n3l1Break: BreakSpec = {
  build: n3l1Lab,
  viewBox: { w: 840, h: 280 },
  layout: [
    { id: 'pc1', x: 120, y: 140, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'r1', x: 420, y: 140, type: 'router' },
    { id: 'srv1', x: 720, y: 140, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'Routing table એ router નો નકશો છે. એક નેટવર્ક ઘસી નાખો — ને જુઓ કે packet ક્યાં અટકે છે.',
    'Routing table router का नक्शा है। एक network मिटा दें — और देखें कि packet कहां रुकता है।',
    'The routing table is the router’s map. Erase one network and watch exactly where the packet stops.',
  ),
  actions: [
    {
      id: 'shut-g01',
      label: H('R1 g0/1 shutdown', 'R1 g0/1 shutdown', 'Shut R1 g0/1'),
      explain: H('SRV1 તરફનું interface બંધ — connected route table માંથી કાઢી નખાય.', 'SRV1 की तरफ का interface बंद — connected route table से निकल जाए।', 'The interface to SRV1 goes down — its connected route leaves the table.'),
      expect: H('pc1 → srv1 ફેલ. R1 કહે "10.2.2.0/24 માટે કોઈ રસ્તો જ નથી".', 'pc1 → srv1 फेल। R1 कहे "10.2.2.0/24 के लिए कोई रास्ता नहीं"।', 'pc1 → srv1 fails. R1 says "no route to 10.2.2.0/24".'),
      apply: (n) => shut(n, 'r1', 'g0/1', true),
      revert: (n) => shut(n, 'r1', 'g0/1', false),
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'srv1', destIp: '10.2.2.10', label: H('PC1 → SRV1', 'PC1 → SRV1', 'PC1 → SRV1') },
  ],
}

/* ═════════════ n3l2 · Administrative Distance ═════════════ */

function n3l2Lab() {
  const n = new Network()
  router(n, 'r1', 'R1', ['g0/0', 'g0/1'])
  host(n, 'pc1', 'PC1', '10.1.1.11', '255.255.255.0', '10.1.1.1')
  server(n, 'srv1', 'SRV1', '10.9.9.10', '10.9.9.1')
  addrIf(n, 'r1', 'g0/0', '10.1.1.1')
  addrIf(n, 'r1', 'g0/1', '10.9.9.1')
  n.connect('pc1', 'e0', 'r1', 'g0/0')
  n.connect('r1', 'g0/1', 'srv1', 'e0')
  // start with a working static route (not strictly needed; directly connected)
  return n
}

export const n3l2Break: BreakSpec = {
  build: n3l2Lab,
  viewBox: { w: 840, h: 280 },
  layout: [
    { id: 'pc1', x: 120, y: 140, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'r1', x: 420, y: 140, type: 'router' },
    { id: 'srv1', x: 720, y: 140, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'AD routing table માં "કોને માનવું" નક્કી કરે છે. નાની AD જીતે. એક "better" source આવે ને existing path ને બદલી નાખે.',
    'AD routing table में "किसकी मानें" तय करता है। छोटी AD जीते। एक "better" source आए और existing path बदल दे।',
    'AD decides whom to believe when two sources learn the same network. Lower wins. Add a "better" source and watch it displace the one you had.',
  ),
  actions: [
    {
      id: 'blackhole-static',
      label: H('એક static route Null0 તરફ નાખો', 'एक static route Null0 की तरफ डालें', 'Add a static route pointing to Null0'),
      explain: H('10.9.9.0/24 માટે static route બનાવી null તરફ મોકલો.', '10.9.9.0/24 के लिए static route बनाकर null की तरफ भेजें।', 'Add a static route for 10.9.9.0/24 that points at Null0.'),
      expect: H('Static AD (1) < Connected (0). એટલે directly-connected જીતશે. Static ignore. પણ જો connected જતી રહે તો static ચાલુ થાય.', 'Static AD (1) > Connected (0), तो directly-connected जीते। Static ignore। पर connected चली जाए तो static चालू हो और blackhole करे।', 'Static AD (1) > Connected (0), so the connected route wins. If the interface dies, the static becomes active and blackholes.'),
      apply: (n) => {
        shut(n, 'r1', 'g0/1', true)
        const r = n.get('r1')!
        r.staticRoutes = (r.staticRoutes || []).concat([{ prefix: '10.9.9.0', mask: '255.255.255.0', exitIface: 'Null0', ad: 1 }])
        n.rev++
      },
      revert: (n) => {
        const r = n.get('r1')!
        r.staticRoutes = (r.staticRoutes || []).filter((s) => s.exitIface !== 'Null0')
        shut(n, 'r1', 'g0/1', false)
      },
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'srv1', destIp: '10.9.9.10', label: H('PC1 → SRV1', 'PC1 → SRV1', 'PC1 → SRV1') },
  ],
}

/* ═════════════ n3l4 · Default and Floating Static ═════════════ */

function n3l4Lab() {
  const n = new Network()
  router(n, 'r1', 'R1', ['g0/0', 'g0/1'])
  router(n, 'r2', 'ISP', ['g0/0', 'g0/1'])
  host(n, 'pc1', 'PC1', '10.1.1.11', '255.255.255.0', '10.1.1.1')
  server(n, 'srv1', 'Internet', '8.8.8.8', '8.8.8.1')
  addrIf(n, 'r1', 'g0/0', '10.1.1.1')
  addrIf(n, 'r1', 'g0/1', '203.0.113.2')
  addrIf(n, 'r2', 'g0/0', '203.0.113.1')
  addrIf(n, 'r2', 'g0/1', '8.8.8.1')
  n.connect('pc1', 'e0', 'r1', 'g0/0')
  n.connect('r1', 'g0/1', 'r2', 'g0/0')
  n.connect('r2', 'g0/1', 'srv1', 'e0')
  const r1 = n.get('r1')!
  r1.staticRoutes = [{ prefix: '0.0.0.0', mask: '0.0.0.0', nextHop: '203.0.113.1', ad: 1 }]
  const r2 = n.get('r2')!
  r2.staticRoutes = [{ prefix: '10.1.1.0', mask: '255.255.255.0', nextHop: '203.0.113.2', ad: 1 }]
  return n
}

export const n3l4Break: BreakSpec = {
  build: n3l4Lab,
  viewBox: { w: 940, h: 280 },
  layout: [
    { id: 'pc1', x: 90, y: 140, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'r1', x: 340, y: 140, type: 'router' },
    { id: 'r2', x: 620, y: 140, type: 'router' },
    { id: 'srv1', x: 860, y: 140, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'Default route એટલે "બીજું બધું જે ના જાણતો હોય એ અહીંથી". એ કાઢી લો, ને આખું Internet ખોવાઈ જાય.',
    'Default route यानी "बाकी सब जो नहीं जानता वह यहां से"। उसे निकाल दें, और पूरा Internet खो जाए।',
    'The default route means "everything I do not know about goes this way". Pull it out and the whole Internet disappears from the table.',
  ),
  actions: [
    {
      id: 'no-default',
      label: H('R1 નો default route કાઢો', 'R1 का default route निकालें', 'Remove R1’s default route'),
      explain: H('0.0.0.0/0 entry દૂર.', '0.0.0.0/0 entry हटाएं।', 'Remove the 0.0.0.0/0 entry.'),
      expect: H('pc1 → 8.8.8.8 fail. "no route" — કારણ કે નકશામાંથી 0/0 જ ગયું.', 'pc1 → 8.8.8.8 fail। "no route" — क्योंकि नक्शे से 0/0 ही चला गया।', 'pc1 → 8.8.8.8 fails: "no route" because 0/0 just left the map.'),
      apply: (n) => {
        const r = n.get('r1')!
        r.staticRoutes = (r.staticRoutes || []).filter((s) => s.prefix !== '0.0.0.0')
        n.rev++
      },
      revert: (n) => {
        const r = n.get('r1')!
        r.staticRoutes = (r.staticRoutes || []).concat([{ prefix: '0.0.0.0', mask: '0.0.0.0', nextHop: '203.0.113.1', ad: 1 }])
        n.rev++
      },
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'srv1', destIp: '8.8.8.8', label: H('PC1 → Internet', 'PC1 → Internet', 'PC1 → Internet') },
  ],
}

/* ═════════════ n4l1 · DHCP — DORA ═════════════ */

function n4l1Lab() {
  const n = new Network()
  router(n, 'r1', 'R1', ['g0/0', 'g0/1'])
  n.addDevice({ id: 'sw1', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2'] })
  host(n, 'pc1', 'PC1', '10.1.1.11', '255.255.255.0', '10.1.1.1')
  server(n, 'dhcp', 'DHCP', '10.9.9.10', '10.9.9.1')
  addrIf(n, 'r1', 'g0/0', '10.1.1.1')
  addrIf(n, 'r1', 'g0/1', '10.9.9.1')
  n.connect('pc1', 'e0', 'sw1', 'Fa0/1')
  n.connect('sw1', 'Fa0/2', 'r1', 'g0/0')
  n.connect('r1', 'g0/1', 'dhcp', 'e0')
  return n
}

export const n4l1Break: BreakSpec = {
  build: n4l1Lab,
  viewBox: { w: 940, h: 280 },
  layout: [
    { id: 'pc1', x: 90, y: 140, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'sw1', x: 320, y: 140, type: 'switch' },
    { id: 'r1', x: 580, y: 140, type: 'router' },
    { id: 'dhcp', x: 840, y: 140, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'DHCP server બીજા subnet માં છે — router ને જો કોઈ એના broadcast ને આગળ મોકલે તો જ pc1 ને lease મળે. Relay દૂર કરો, ને DORA તૂટે.',
    'DHCP server दूसरे subnet में है — router उसके broadcast को आगे भेजे तो ही pc1 को lease मिले। Relay हटाएं, और DORA टूटे।',
    'The DHCP server sits in another subnet — PC1 only gets a lease when the router relays its broadcast. Pull the relay and DORA collapses.',
  ),
  actions: [
    {
      id: 'shut-dhcp',
      label: H('DHCP server નો link down', 'DHCP server का link down', 'Bring down the DHCP server link'),
      explain: H('Server unreachable — Discover તો pcmid જાય, પણ જવાબ નહીં આવે.', 'Server unreachable — Discover तो जाए, पर जवाब नहीं आए।', 'Server unreachable — the Discover may go, but no Offer ever comes back.'),
      expect: H('pc1 ને address ના મળે, LAN માં જ અટવાયેલું.', 'pc1 को address न मिले, LAN में ही अटका।', 'PC1 gets no address, stuck on the LAN.'),
      apply: (n) => shut(n, 'dhcp', 'e0', true),
      revert: (n) => shut(n, 'dhcp', 'e0', false),
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'dhcp', destIp: '10.9.9.10', label: H('PC1 → DHCP', 'PC1 → DHCP', 'PC1 → DHCP') },
  ],
}

/* ═════════════ n5l1 · SSH and AAA ═════════════ */

function n5l1Lab() {
  const n = new Network()
  router(n, 'r1', 'R1', ['g0/0'])
  host(n, 'admin', 'Admin', '10.1.1.11', '255.255.255.0', '10.1.1.1')
  addrIf(n, 'r1', 'g0/0', '10.1.1.1')
  n.connect('admin', 'e0', 'r1', 'g0/0')
  return n
}

export const n5l1Break: BreakSpec = {
  build: n5l1Lab,
  viewBox: { w: 760, h: 260 },
  layout: [
    { id: 'admin', x: 160, y: 130, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'r1', x: 560, y: 130, type: 'router' },
  ],
  intro: H(
    'Admin ને device સુધી પહોંચવું જોઈએ. Reachability ખોવાય, management plane ખોવાય — ને in-band management બંધ.',
    'Admin को device तक पहुंचना चाहिए। Reachability खोए, management plane खोए — और in-band management बंद।',
    'Admins need reach to the device. Lose reachability and you lose the management plane — in-band management is gone.',
  ),
  actions: [
    {
      id: 'shut-mgmt',
      label: H('R1 g0/0 shutdown', 'R1 g0/0 shutdown', 'Shutdown R1 g0/0'),
      explain: H('Admin ને R1 સુધી પહોંચવા માટે કોઈ path જ નથી.', 'Admin को R1 तक पहुंचने के लिए कोई path ही नहीं।', 'The only path from admin to R1 is gone.'),
      expect: H('SSH impossible — console જ એક રસ્તો બચે.', 'SSH impossible — console ही एक रास्ता बचे।', 'SSH is impossible — only console access remains.'),
      apply: (n) => shut(n, 'r1', 'g0/0', true),
      revert: (n) => shut(n, 'r1', 'g0/0', false),
    },
  ],
  probes: [
    { id: 'a', from: 'admin', to: 'r1', destIp: '10.1.1.1', label: H('Admin → R1 (mgmt)', 'Admin → R1 (mgmt)', 'Admin → R1 (mgmt)') },
  ],
}

/* ═════════════ n7l1 · Home / Small Office project ═════════════ */

function n7l1Lab() {
  const n = new Network()
  router(n, 'r1', 'HomeGW', ['g0/0', 'g0/1'])
  router(n, 'isp', 'ISP', ['g0/0', 'g0/1'])
  n.addDevice({ id: 'sw1', name: 'LAN', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/24'] })
  host(n, 'pc1', 'PC', '192.168.1.11', '255.255.255.0', '192.168.1.1')
  host(n, 'laptop', 'Laptop', '192.168.1.12', '255.255.255.0', '192.168.1.1')
  server(n, 'net', 'Internet', '8.8.8.8', '8.8.8.1')
  addrIf(n, 'r1', 'g0/0', '192.168.1.1')
  addrIf(n, 'r1', 'g0/1', '203.0.113.2')
  addrIf(n, 'isp', 'g0/0', '203.0.113.1')
  addrIf(n, 'isp', 'g0/1', '8.8.8.1')
  n.connect('pc1', 'e0', 'sw1', 'Fa0/1')
  n.connect('laptop', 'e0', 'sw1', 'Fa0/2')
  n.connect('sw1', 'Fa0/24', 'r1', 'g0/0')
  n.connect('r1', 'g0/1', 'isp', 'g0/0')
  n.connect('isp', 'g0/1', 'net', 'e0')
  n.get('r1')!.staticRoutes = [{ prefix: '0.0.0.0', mask: '0.0.0.0', nextHop: '203.0.113.1', ad: 1 }]
  n.get('isp')!.staticRoutes = [{ prefix: '192.168.1.0', mask: '255.255.255.0', nextHop: '203.0.113.2', ad: 1 }]
  return n
}

export const n7l1Break: BreakSpec = {
  build: n7l1Lab,
  viewBox: { w: 1080, h: 340 },
  layout: [
    { id: 'pc1', x: 90, y: 90, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'laptop', x: 90, y: 230, type: 'pc', accent: 'var(--nq-ccnp)' },
    { id: 'sw1', x: 320, y: 160, type: 'switch' },
    { id: 'r1', x: 540, y: 160, type: 'router' },
    { id: 'isp', x: 760, y: 160, type: 'router' },
    { id: 'net', x: 990, y: 160, type: 'server', accent: 'var(--nq-beginner)' },
  ],
  intro: H(
    'Home office: બે device, LAN, gateway, Internet. દરેક ભાગ એક job કરે છે — એક કાઢો ને આખું system જુઓ.',
    'Home office: दो device, LAN, gateway, Internet। हर हिस्सा एक job करे — एक हटाएं और पूरा system देखें।',
    'Home office: two devices, LAN, gateway, Internet. Each piece has one job — pull one and watch the whole thing react.',
  ),
  actions: [
    {
      id: 'uplink-cut',
      label: H('ISP નો વાયર કાપો', 'ISP का wire काटें', 'Cut the ISP uplink'),
      explain: H('g0/1 ↔ Internet વાયર cut.', 'g0/1 ↔ Internet wire cut।', 'Cut the g0/1 ↔ Internet wire.'),
      expect: H('LAN ચાલુ (pc ↔ laptop), Internet gone. Default route આવતો રહે પણ next-hop unreachable.', 'LAN चालू (pc ↔ laptop), Internet gone। Default route बना रहे पर next-hop unreachable।', 'The LAN stays up (pc ↔ laptop), the Internet is gone. The default route is still there but the next hop is unreachable.'),
      apply: (n) => n.setLinkCut('r1', 'g0/1', true),
      revert: (n) => n.setLinkCut('r1', 'g0/1', false),
    },
    {
      id: 'no-gw',
      label: H('PC નો default gateway કાઢો', 'PC का default gateway हटाएं', 'Erase PC’s default gateway'),
      explain: H('pc1 પાસે gateway નથી — LAN જ scope.', 'pc1 के पास gateway नहीं — LAN ही scope।', 'pc1 has no gateway — its scope is only the LAN.'),
      expect: H('pc1 → Internet fail; pc1 → laptop બરાબર.', 'pc1 → Internet fail; pc1 → laptop ठीक।', 'pc1 → Internet fails; pc1 → laptop still works.'),
      apply: (n) => { n.get('pc1')!.defaultGateway = undefined; n.rev++ },
      revert: (n) => { n.get('pc1')!.defaultGateway = '192.168.1.1'; n.rev++ },
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'net', destIp: '8.8.8.8', label: H('PC → Internet', 'PC → Internet', 'PC → Internet') },
    { id: 'b', from: 'pc1', to: 'laptop', destIp: '192.168.1.12', label: H('PC → Laptop', 'PC → Laptop', 'PC → Laptop') },
  ],
}

/* ═════════════ n7l2 · Small Business VLAN project ═════════════ */

function n7l2Lab() {
  const n = new Network()
  router(n, 'r1', 'R1', ['g0/0', 'g0/1'])
  n.addDevice({ id: 'swStaff', name: 'Staff SW', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/24'] })
  n.addDevice({ id: 'swGuest', name: 'Guest SW', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/24'] })
  host(n, 'staff', 'Staff', '10.10.10.11', '255.255.255.0', '10.10.10.1')
  host(n, 'guest', 'Guest', '10.10.20.11', '255.255.255.0', '10.10.20.1')
  addrIf(n, 'r1', 'g0/0', '10.10.10.1')
  addrIf(n, 'r1', 'g0/1', '10.10.20.1')
  n.connect('staff', 'e0', 'swStaff', 'Fa0/1')
  n.connect('swStaff', 'Fa0/24', 'r1', 'g0/0')
  n.connect('guest', 'e0', 'swGuest', 'Fa0/1')
  n.connect('swGuest', 'Fa0/24', 'r1', 'g0/1')
  return n
}

export const n7l2Break: BreakSpec = {
  build: n7l2Lab,
  viewBox: { w: 980, h: 360 },
  layout: [
    { id: 'staff', x: 90, y: 100, type: 'pc', accent: 'var(--nq-ccna)' },
    { id: 'swStaff', x: 300, y: 100, type: 'switch' },
    { id: 'r1', x: 560, y: 200, type: 'router' },
    { id: 'swGuest', x: 300, y: 280, type: 'switch' },
    { id: 'guest', x: 90, y: 280, type: 'pc', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'Staff અને Guest અલગ VLAN પર છે, એક router બંને ને જોડે છે. એક leg shutdown કરો — Guest Internet-less, Staff સચવાય.',
    'Staff और Guest अलग VLAN पर हैं, एक router दोनों को जोड़े। एक leg shutdown करें — Guest Internet-less, Staff बना रहे।',
    'Staff and Guest live on separate VLANs; the router joins them. Shut one leg — Guest is cut off, Staff keeps working.',
  ),
  actions: [
    {
      id: 'guest-gw-down',
      label: H('R1 નું Guest-side interface shutdown', 'R1 का Guest-side interface shutdown', 'Shut R1’s Guest-side interface'),
      explain: H('Guest VLAN નો gateway નીચે.', 'Guest VLAN का gateway नीचे।', 'Guest VLAN’s gateway goes down.'),
      expect: H('Staff → Guest fail. Staff LAN અંદર કામ કરે.', 'Staff → Guest fail। Staff LAN अंदर काम करे।', 'Staff → Guest fails. Staff LAN still works internally.'),
      apply: (n) => shut(n, 'r1', 'g0/1', true),
      revert: (n) => shut(n, 'r1', 'g0/1', false),
    },
  ],
  probes: [
    { id: 'a', from: 'staff', to: 'guest', destIp: '10.10.20.11', label: H('Staff → Guest', 'Staff → Guest', 'Staff → Guest') },
  ],
}
