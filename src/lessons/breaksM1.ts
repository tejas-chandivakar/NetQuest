import type { BreakSpec } from '../components/BreakStage'
import { Network } from '../engine/network'

/**
 * Break it, Module 1.
 *
 * Every fault here is one a beginner will actually meet, and each one fails
 * in a *different* way on purpose: a cut cable, an address that was never
 * set, an address on the wrong street, a gateway that is missing. The point
 * is not that it broke — it is that "it does not work" has several distinct
 * shapes, and the probe tells you which one you are looking at.
 */

const H = (gu: string, en: string) => ({ gu, en })

function addr(n: Network, id: string, ifn: string, ip: string, mask: string) {
  const i = n.get(id)!.iface(ifn)!
  i.ip = ip
  i.mask = mask
  i.shutdown = false
}

function host(n: Network, id: string, name: string, ip: string, gw?: string, kind: 'pc' | 'server' | 'laptop' = 'pc') {
  n.addDevice({ id, name, kind: kind === 'laptop' ? 'pc' : kind, ifaces: ['e0'] })
  const i = n.get(id)!.iface('e0')!
  i.ip = ip
  i.mask = '255.255.255.0'
  if (gw) n.get(id)!.defaultGateway = gw
}

const down = (n: Network, id: string, ifn: string, v: boolean) => {
  n.get(id)!.iface(ifn)!.shutdown = v
  n.rev++
}

/* ═══════════ b1l1 · two computers, one conversation ═══════════ */

function pairLab() {
  const n = new Network()
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2'] })
  host(n, 'pc1', 'PC1', '192.168.1.11')
  host(n, 'pc2', 'PC2', '192.168.1.12')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw', 'Fa0/2')
  return n
}

export const b1l1Break: BreakSpec = {
  build: pairLab,
  viewBox: { w: 860, h: 300 },
  layout: [
    { id: 'pc1', x: 140, y: 150, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 430, y: 150, type: 'switch' },
    { id: 'pc2', x: 720, y: 150, type: 'pc', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'બે કમ્પ્યુટર, એક switch, અને વાત ચાલે છે. હવે એને **ત્રણ જુદી રીતે** તોડો — અને જુઓ કે દરેક વખતે નિષ્ફળતાનું કારણ **જુદું** હોય છે. "ચાલતું નથી" એક જવાબ નથી.',
    'Two computers, one switch, and a working conversation. Now break it **three different ways** — and notice the reason is **different each time**. "It does not work" is not one answer.',
  ),
  actions: [
    {
      id: 'cut',
      label: H('PC2 નો વાયર કાઢો', 'Pull out PC2’s cable'),
      explain: H(
        'PC2 ચાલુ છે, એનું સરનામું પણ એ જ છે — ફક્ત વાયર નીકળી ગયો.',
        'PC2 is still on and still has its address — the cable is simply out.',
      ),
      expect: H(
        'PC1 બૂમ પાડશે "192.168.1.12 કોણ છે?" — અને **કોઈ જવાબ નહીં આપે**. કારણ "સરનામું ખોટું" નહીં, "કોઈ ત્યાં નથી" હશે.',
        'PC1 will call out "who is 192.168.1.12?" and **nobody answers**. The reason is not a wrong address, it is that nobody is there.',
      ),
      apply: (n) => down(n, 'pc2', 'e0', true),
      revert: (n) => down(n, 'pc2', 'e0', false),
    },
    {
      id: 'noip',
      label: H('PC1 નું સરનામું ભૂંસો', 'Erase PC1’s address'),
      explain: H(
        'PC1 નું IP કાઢી નાખો. વાયર જોડાયેલો છે, switch ચાલુ છે, બસ સરનામું નથી.',
        'Take PC1’s IP away. The cable is in and the switch is on — there is just no address.',
      ),
      expect: H(
        'હવે નિષ્ફળતા **બીજા છેડે** નહીં, **અહીં** જ છે: પરબીડિયા પર "કોના તરફથી" લખવા માટે કશું જ નથી, એટલે એ નીકળતું જ નથી.',
        'Now the failure is not at the far end but **right here**: there is nothing to write in the "from" box, so it never leaves at all.',
      ),
      apply: (n) => {
        const i = n.get('pc1')!.iface('e0')!
        i.ip = undefined
        n.rev++
      },
      revert: (n) => {
        addr(n, 'pc1', 'e0', '192.168.1.11', '255.255.255.0')
      },
    },
    {
      id: 'street',
      label: H('PC2 ને બીજી શેરીમાં ખસેડો', 'Move PC2 to another street'),
      explain: H(
        'PC2 નું સરનામું `10.0.0.12` કરો. વાયર એ જ, switch એ જ — ફક્ત સરનામું બીજા નેટવર્કનું.',
        'Give PC2 the address `10.0.0.12`. Same cable, same switch — the address just belongs to a different network.',
      ),
      expect: H(
        'સૌથી કપટી ભૂલ: બંને **ચાલુ** છે અને **જોડાયેલા** છે, તોય વાત થતી નથી. PC1 માને છે કે PC2 બીજા નેટવર્કમાં છે અને એને gateway પાસે મોકલે — પણ અહીં gateway છે જ નહીં.',
        'The sneakiest one: both are **on** and **plugged in**, and still nothing passes. PC1 decides PC2 lives on another network and hands the packet to the gateway — and there is no gateway here.',
      ),
      apply: (n) => {
        addr(n, 'pc2', 'e0', '10.0.0.12', '255.255.255.0')
      },
      revert: (n) => {
        addr(n, 'pc2', 'e0', '192.168.1.12', '255.255.255.0')
      },
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'pc2', destIp: '192.168.1.12', label: H('PC1 → PC2', 'PC1 → PC2') },
    { id: 'b', from: 'pc2', to: 'pc1', destIp: '192.168.1.11', label: H('PC2 → PC1', 'PC2 → PC1') },
  ],
}

/* ═══════════ b1l2 · copper, glass and air ═══════════ */

function mediaLab() {
  const n = new Network()
  n.addDevice({ id: 'sw1', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Gi0/1'] })
  n.addDevice({ id: 'sw2', name: 'SW2', kind: 'switch', ifaces: ['Gi0/1', 'Fa0/1'] })
  // an AP bridges air to wire, so to the engine it is a switch; the layout
  // still draws it as an AP
  n.addDevice({ id: 'ap', name: 'AP', kind: 'switch', ifaces: ['e0', 'radio'] })
  host(n, 'pc1', 'PC1', '192.168.5.11')
  host(n, 'lap', 'LAPTOP', '192.168.5.12')
  host(n, 'srv', 'SERVER', '192.168.5.50', undefined, 'server')
  n.connect('pc1', 'e0', 'sw1', 'Fa0/1')
  n.connect('ap', 'e0', 'sw1', 'Fa0/2')
  n.connect('lap', 'e0', 'ap', 'radio')
  n.connect('sw1', 'Gi0/1', 'sw2', 'Gi0/1')
  n.connect('srv', 'e0', 'sw2', 'Fa0/1')
  return n
}

export const b1l2Break: BreakSpec = {
  build: mediaLab,
  viewBox: { w: 880, h: 380 },
  layout: [
    { id: 'pc1', x: 110, y: 90, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'lap', x: 110, y: 300, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'ap', x: 310, y: 300, type: 'ap', accent: 'var(--nq-ccnp)' },
    { id: 'sw1', x: 360, y: 150, type: 'switch' },
    { id: 'sw2', x: 640, y: 150, type: 'switch' },
    { id: 'srv', x: 790, y: 300, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'ત્રણ જુદાં માધ્યમ એક જ નેટવર્કમાં: ટેબલ સુધી **તાંબુ**, ઇમારતો વચ્ચે **કાચ**, અને લેપટોપ માટે **હવા**. એક એક તોડો અને જુઓ કે **કોને વાગે છે** — બધાને નહીં, દર વખતે જુદાને.',
    'Three different media on one network: **copper** to the desk, **glass** between the buildings, **air** for the laptop. Break them one at a time and watch **who it hits** — not everyone, and somebody different each time.',
  ),
  actions: [
    {
      id: 'fibre',
      label: H('ઇમારતો વચ્ચેનું fibre કાપો', 'Cut the fibre between the buildings'),
      explain: H(
        'SW1 અને SW2 ને જોડતી કાચની લિંક — 400 મીટર લાંબી, એટલે જ ત્યાં તાંબુ ન ચાલે.',
        'The glass link joining SW1 and SW2 — 400 metres, which is exactly why copper could not be used there.',
      ),
      expect: H(
        'Server બીજી ઇમારતમાં છે, એટલે **બંને** client એને ગુમાવે. પણ PC1 અને લેપટોપ **એકબીજાને** હજી પહોંચે છે — એ બંને આ બાજુ છે.',
        'The server is in the other building, so **both** clients lose it. But PC1 and the laptop can still reach **each other** — they are both on this side.',
      ),
      apply: (n) => down(n, 'sw1', 'Gi0/1', true),
      revert: (n) => down(n, 'sw1', 'Gi0/1', false),
    },
    {
      id: 'copper',
      label: H('PC1 નું તાંબાનું વાયર કાઢો', 'Unplug PC1’s copper cable'),
      explain: H(
        'ટેબલ સુધીનો સામાન્ય Ethernet વાયર — 30 મીટર, સસ્તો, અને સૌથી સહેલાઈથી નીકળી જતો.',
        'The ordinary Ethernet cable to the desk — 30 metres, cheap, and the easiest thing in the room to knock out.',
      ),
      expect: H(
        'ફક્ત **PC1** નેટવર્કની બહાર. લેપટોપ અને server ને કશો ફરક નથી — એક વાયર એક જ મશીનનો હોય છે.',
        'Only **PC1** drops off. The laptop and the server do not notice at all — one cable belongs to one machine.',
      ),
      apply: (n) => down(n, 'pc1', 'e0', true),
      revert: (n) => down(n, 'pc1', 'e0', false),
    },
    {
      id: 'ap',
      label: H('AP નું વાયર કાઢો', 'Unplug the AP'),
      explain: H(
        'AP નો radio ચાલુ જ રહેશે — ફક્ત એને નેટવર્ક સાથે જોડતો **તાંબાનો** વાયર કાઢો.',
        'The AP’s radio keeps running — only the **copper** cable that joins it to the network comes out.',
      ),
      expect: H(
        'લેપટોપ ને Wi-Fi તો દેખાશે, પણ ક્યાંય પહોંચાશે નહીં. એ જ "Wi-Fi જોડાયેલું છે પણ ઇન્ટરનેટ નથી" — AP એ **તારનો પુલ** છે, મંઝિલ નહીં.',
        'The laptop still sees Wi-Fi but reaches nothing. This is exactly "connected, no internet" — the AP is a **bridge to the wire**, not a destination.',
      ),
      apply: (n) => down(n, 'ap', 'e0', true),
      revert: (n) => down(n, 'ap', 'e0', false),
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'srv', destIp: '192.168.5.50', label: H('PC1 → Server', 'PC1 → Server') },
    { id: 'b', from: 'lap', to: 'srv', destIp: '192.168.5.50', label: H('લેપટોપ → Server', 'Laptop → Server') },
    { id: 'c', from: 'pc1', to: 'lap', destIp: '192.168.5.12', label: H('PC1 → લેપટોપ', 'PC1 → Laptop') },
  ],
}

/* ═══════════ b1l3 · the LAN survives, the WAN does not ═══════════ */

function lanWanLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'ROUTER', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  host(n, 'pc1', 'PC1', '192.168.1.11', '192.168.1.1')
  host(n, 'pc2', 'PC2', '192.168.1.12', '192.168.1.1')
  host(n, 'web', 'WEB', '203.0.113.9', '203.0.113.1', 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw', 'Fa0/2')
  n.connect('sw', 'Fa0/3', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'web', 'e0')
  addr(n, 'r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '203.0.113.1', '255.255.255.0')
  return n
}

export const b1l3Break: BreakSpec = {
  build: lanWanLab,
  viewBox: { w: 880, h: 340 },
  layout: [
    { id: 'pc1', x: 110, y: 80, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'pc2', x: 110, y: 270, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 350, y: 175, type: 'switch' },
    { id: 'r1', x: 580, y: 175, type: 'router', accent: 'var(--nq-ccna)' },
    { id: 'web', x: 800, y: 175, type: 'cloud', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'ડાબી બાજુ તમારું **LAN** — એક જગ્યા, તમારા વાયર. જમણી બાજુ **WAN** — બહારની દુનિયા. હવે તોડો અને જુઓ કે **બેમાંથી એક તૂટે ત્યારે બીજું ચાલતું રહે છે**. એ જ તો એને બે જુદી વસ્તુ બનાવે છે.',
    'On the left your **LAN** — one place, your own cables. On the right the **WAN** — the outside world. Break things and watch how **one can fail while the other keeps working**. That is what makes them two different things.',
  ),
  actions: [
    {
      id: 'wan',
      label: H('ISP ની લાઇન કાપો', 'Cut the line to the ISP'),
      explain: H(
        'Router નો બહારનો port બંધ. ઘરનું બધું જેમનું તેમ — ફક્ત બહાર જવાનો રસ્તો ગયો.',
        'The router’s outside port goes down. Everything indoors is untouched — only the way out is gone.',
      ),
      expect: H(
        'ઇન્ટરનેટ ગયું, પણ **PC1 અને PC2 હજી એકબીજાને પહોંચે છે**. એટલે જ ઘરનું printer ત્યારે પણ ચાલે છે જ્યારે ઇન્ટરનેટ બંધ હોય.',
        'The internet is gone, but **PC1 and PC2 still reach each other**. Which is why the printer at home still works when the internet is down.',
      ),
      apply: (n) => down(n, 'r1', 'Gi0/1', true),
      revert: (n) => down(n, 'r1', 'Gi0/1', false),
    },
    {
      id: 'gw',
      label: H('PC1 નો gateway ભૂંસો', 'Erase PC1’s gateway'),
      explain: H(
        'PC1 ને કહેવાનું બંધ કરો કે "બહાર જવા માટે router પાસે જજે". બાકી બધું એ જ.',
        'Stop telling PC1 "hand anything outside to the router". Everything else stays as it is.',
      ),
      expect: H(
        'હવે ફક્ત **PC1** બહાર નહીં જઈ શકે — PC2 આરામથી જશે. અને PC1 **LAN માં તો ચાલે જ છે**: gateway ફક્ત બહાર જવા માટે જોઈએ, પાડોશી માટે નહીં.',
        'Now only **PC1** cannot get out, while PC2 carries on fine. And PC1 is still **happy on the LAN**: a gateway is only needed to leave, never to reach a neighbour.',
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
    {
      id: 'lan',
      label: H('Switch નું uplink કાઢો', 'Unplug the switch’s uplink'),
      explain: H(
        'Switch ને router સાથે જોડતો વાયર કાઢો. બંને PC switch પર જ છે.',
        'Remove the cable joining the switch to the router. Both PCs stay on the switch.',
      ),
      expect: H(
        'હવે **આખું LAN** બહારથી કપાઈ ગયું — બંને PC ઇન્ટરનેટ ગુમાવે. પણ અંદરોઅંદર? હજી બરાબર. LAN ને બહારની જરૂર જ નથી.',
        'Now the **whole LAN** is cut off — both PCs lose the internet. But among themselves? Still fine. A LAN does not need the outside at all.',
      ),
      apply: (n) => down(n, 'sw', 'Fa0/3', true),
      revert: (n) => down(n, 'sw', 'Fa0/3', false),
    },
  ],
  probes: [
    { id: 'lan', from: 'pc1', to: 'pc2', destIp: '192.168.1.12', label: H('PC1 → PC2 (LAN)', 'PC1 → PC2 (LAN)') },
    { id: 'wan1', from: 'pc1', to: 'web', destIp: '203.0.113.9', label: H('PC1 → બહાર (WAN)', 'PC1 → outside (WAN)') },
    { id: 'wan2', from: 'pc2', to: 'web', destIp: '203.0.113.9', label: H('PC2 → બહાર (WAN)', 'PC2 → outside (WAN)') },
  ],
}

/* ═══════════ b1l4 · one client down, or the server down ═══════════ */

function serveLab() {
  const n = new Network()
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  host(n, 'pc1', 'PC1', '192.168.2.11')
  host(n, 'pc2', 'PC2', '192.168.2.12')
  host(n, 'srv', 'SERVER', '192.168.2.50', undefined, 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw', 'Fa0/2')
  n.connect('srv', 'e0', 'sw', 'Fa0/3')
  return n
}

export const b1l4Break: BreakSpec = {
  build: serveLab,
  viewBox: { w: 860, h: 340 },
  layout: [
    { id: 'pc1', x: 120, y: 80, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'pc2', x: 120, y: 270, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 430, y: 175, type: 'switch' },
    { id: 'srv', x: 740, y: 175, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'બે client અને એક server. તોડતાં પહેલાં **અનુમાન કરો**: એક client પડે તો કેટલાને વાગે? અને server પડે તો? **એ જ ફરક** server ને server બનાવે છે.',
    'Two clients and one server. Before you break anything, **make a guess**: if one client falls over, how many people notice? And if the server does? **That difference** is what makes a server a server.',
  ),
  actions: [
    {
      id: 'client',
      label: H('PC1 બંધ કરો', 'Take PC1 down'),
      explain: H('એક client નો વાયર કાઢો. Server અને બીજો client ચાલુ.', 'Pull one client’s cable. The server and the other client stay up.'),
      expect: H(
        'ફક્ત **એક વ્યક્તિ**ને વાગ્યું. PC2 ને ખબર પણ નહીં પડે. Client ની નિષ્ફળતા એક ટેબલ પૂરતી હોય છે.',
        'Exactly **one person** is affected. PC2 will not even notice. A client failing is a one-desk problem.',
      ),
      apply: (n) => down(n, 'pc1', 'e0', true),
      revert: (n) => down(n, 'pc1', 'e0', false),
    },
    {
      id: 'server',
      label: H('Server બંધ કરો', 'Take the server down'),
      explain: H('એ જ એક વાયર — પણ આ વખતે server નો.', 'The same single cable — but this time it is the server’s.'),
      expect: H(
        'એક જ વાયર, અને **બંને** client ને વાગ્યું. એટલે જ server ને બે વીજળી, બે વાયર અને backup અપાય છે — એના પર ઘણા લોકો ટકેલા હોય છે.',
        'One cable, and **both** clients are hit. This is why servers get two power supplies, two cables and a backup — a lot of people are resting on them.',
      ),
      apply: (n) => down(n, 'srv', 'e0', true),
      revert: (n) => down(n, 'srv', 'e0', false),
    },
    {
      id: 'moved',
      label: H('Server નું સરનામું બદલો', 'Change the server’s address'),
      explain: H(
        'Server ચાલુ છે, વાયર જોડાયેલો છે — ફક્ત એનું સરનામું `192.168.2.60` થઈ ગયું.',
        'The server is up and plugged in — its address just became `192.168.2.60`.',
      ),
      expect: H(
        'Client જૂના સરનામે બૂમ પાડે છે અને કોઈ જવાબ આપતું નથી. Server **ચાલુ** છે, છતાં "server down" લાગે છે — એટલે જ server ને કદી DHCP થી સરનામું ન અપાય.',
        'The clients keep calling the old address and nobody answers. The server is **up** and it still looks down — which is why a server never takes its address from DHCP.',
      ),
      apply: (n) => addr(n, 'srv', 'e0', '192.168.2.60', '255.255.255.0'),
      revert: (n) => addr(n, 'srv', 'e0', '192.168.2.50', '255.255.255.0'),
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'srv', destIp: '192.168.2.50', label: H('PC1 → Server', 'PC1 → Server') },
    { id: 'b', from: 'pc2', to: 'srv', destIp: '192.168.2.50', label: H('PC2 → Server', 'PC2 → Server') },
  ],
}

/* ═══════════ b1l5 · each box, a different blast radius ═══════════ */

function castLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'ROUTER', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SWITCH', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4'] })
  // an AP bridges air to wire, so to the engine it is a switch; the layout
  // still draws it as an AP
  n.addDevice({ id: 'ap', name: 'AP', kind: 'switch', ifaces: ['e0', 'radio'] })
  host(n, 'pc1', 'PC1', '192.168.3.11', '192.168.3.1')
  host(n, 'lap', 'LAPTOP', '192.168.3.12', '192.168.3.1')
  host(n, 'srv', 'SERVER', '192.168.3.50', '192.168.3.1', 'server')
  host(n, 'web', 'WEB', '203.0.113.9', '203.0.113.1', 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('srv', 'e0', 'sw', 'Fa0/2')
  n.connect('ap', 'e0', 'sw', 'Fa0/3')
  n.connect('lap', 'e0', 'ap', 'radio')
  n.connect('sw', 'Fa0/4', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'web', 'e0')
  addr(n, 'r1', 'Gi0/0', '192.168.3.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '203.0.113.1', '255.255.255.0')
  return n
}

export const b1l5Break: BreakSpec = {
  build: castLab,
  viewBox: { w: 880, h: 400 },
  layout: [
    { id: 'pc1', x: 100, y: 90, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'lap', x: 100, y: 320, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'ap', x: 280, y: 320, type: 'ap', accent: 'var(--nq-ccnp)' },
    { id: 'srv', x: 290, y: 60, type: 'server', accent: 'var(--nq-ccnp)' },
    { id: 'sw', x: 450, y: 200, type: 'switch' },
    { id: 'r1', x: 670, y: 200, type: 'router', accent: 'var(--nq-ccna)' },
    { id: 'web', x: 820, y: 90, type: 'cloud', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'આખી ટોળી એકસાથે: switch, router, AP અને server. એક એક કરીને કાઢો — અને **કેટલાને વાગે** એના પરથી જ ખબર પડશે કે **કોનું કામ શું હતું**.',
    'The whole cast at once: switch, router, AP and server. Take them out one at a time — and **how many people are hit** will tell you **what each one was for**.',
  ),
  actions: [
    {
      id: 'ap',
      label: H('AP કાઢો', 'Remove the AP'),
      explain: H('તાર વગરનાં ઉપકરણોને નેટવર્કમાં લાવનારો પુલ.', 'The bridge that brings wireless devices onto the network.'),
      expect: H(
        'ફક્ત **લેપટોપ** ગયું. તારવાળાં બધાં જેમનાં તેમ — AP ફક્ત હવા અને તાર વચ્ચેનો અનુવાદક છે.',
        'Only the **laptop** goes. Everything on a cable is untouched — the AP only translates between air and wire.',
      ),
      apply: (n) => down(n, 'ap', 'e0', true),
      revert: (n) => down(n, 'ap', 'e0', false),
    },
    {
      id: 'router',
      label: H('Router કાઢો', 'Remove the router'),
      explain: H('બહાર જવાનો એકમાત્ર દરવાજો.', 'The one and only door to the outside.'),
      expect: H(
        '**બધાંનું ઇન્ટરનેટ ગયું**, પણ અંદરનું બધું — PC, લેપટોપ, server — એકબીજાને પહોંચે છે. Router નું કામ બહાર જવાનું જ હતું.',
        '**Everyone loses the internet**, yet everything inside — PC, laptop, server — still reaches each other. Getting out was the router’s only job.',
      ),
      apply: (n) => down(n, 'sw', 'Fa0/4', true),
      revert: (n) => down(n, 'sw', 'Fa0/4', false),
    },
    {
      id: 'switch',
      label: H('Switch કાઢો', 'Remove the switch'),
      explain: H('બધાં જેના પર જોડાયેલાં છે એ જ ઉપકરણ. ચારેય port બંધ.', 'The box everything else is plugged into. All four ports go down.'),
      expect: H(
        '**બધું જ ગયું** — અંદરનું પણ, બહારનું પણ. Switch પોતે કશું નક્કી નથી કરતું, પણ એના વગર કોઈ કોઈને અડી શકતું નથી.',
        '**Everything stops** — inside and out. A switch decides nothing at all, and yet without it nobody can touch anybody.',
      ),
      apply: (n) => {
        for (const p of ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4']) down(n, 'sw', p, true)
      },
      revert: (n) => {
        for (const p of ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4']) down(n, 'sw', p, false)
      },
    },
  ],
  probes: [
    { id: 'a', from: 'pc1', to: 'srv', destIp: '192.168.3.50', label: H('PC1 → Server (અંદર)', 'PC1 → Server (inside)') },
    { id: 'b', from: 'lap', to: 'srv', destIp: '192.168.3.50', label: H('લેપટોપ → Server', 'Laptop → Server') },
    { id: 'c', from: 'pc1', to: 'web', destIp: '203.0.113.9', label: H('PC1 → બહાર', 'PC1 → outside') },
  ],
}
