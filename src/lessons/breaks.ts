import type { BreakSpec } from '../components/BreakStage'
import { Network } from '../engine/network'

/* ───────── b1l1 · two hosts on one cable, fully working ───────── */

function twoHosts() {
  const n = new Network()
  n.addDevice({ id: 'pc1', name: 'PC1', kind: 'pc', ifaces: ['e0'] })
  n.addDevice({ id: 'pc2', name: 'PC2', kind: 'pc', ifaces: ['e0'] })
  n.connect('pc1', 'e0', 'pc2', 'e0')
  const a = n.get('pc1')!.iface('e0')!
  a.ip = '192.168.1.10'
  a.mask = '255.255.255.0'
  const b = n.get('pc2')!.iface('e0')!
  b.ip = '192.168.1.20'
  b.mask = '255.255.255.0'
  return n
}

export const b1l1Break: BreakSpec = {
  build: twoHosts,
  layout: [
    { id: 'pc1', x: 250, y: 140, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'pc2', x: 620, y: 140, type: 'pc', accent: 'var(--nq-ccna)' },
  ],
  viewBox: { w: 880, h: 280 },
  intro: {
    gu: 'બંને કમ્પ્યુટર અત્યારે બરાબર વાત કરે છે. હવે એક એક વસ્તુ બગાડો અને જુઓ કે ping ક્યાં અને કેમ અટકે છે. પહેલાં મનમાં ધારો, પછી ચકાસો — એ જ ખરી શીખવાની રીત છે.',
    en: 'The two computers are talking perfectly right now. Break one thing at a time and watch where — and why — the ping stops. Guess first, then test: that is where the learning happens.',
  },
  actions: [
    {
      id: 'shut-pc2',
      label: { gu: 'PC2 નું interface બંધ કરો (shutdown)', en: 'Shut down PC2 interface' },
      explain: {
        gu: 'PC2 ના e0 પર shutdown લખવા બરાબર.',
        en: 'The same as typing shutdown on PC2 e0.',
      },
      expect: {
        gu: 'લિંક લાલ થઈ. PC1 પાસે રસ્તો તો છે, પણ વાયરના સામે છેડે કોઈ સાંભળતું નથી.',
        en: 'The link turned red. PC1 still has a path, but nothing at the far end is listening.',
      },
      apply: (n) => {
        n.get('pc2')!.iface('e0')!.shutdown = true
        n.rev++
      },
      revert: (n) => {
        n.get('pc2')!.iface('e0')!.shutdown = false
        n.rev++
      },
    },
    {
      id: 'cut',
      label: { gu: 'વાયર કાપો', en: 'Cut the cable' },
      explain: {
        gu: 'બંને છેડે બધું બરાબર છે — ખાલી વચ્ચેનો વાયર તૂટેલો છે.',
        en: 'Both ends are configured fine — only the cable between them is cut.',
      },
      expect: {
        gu: 'બંને interfaces "ચાલુ" છે છતાં ping નથી જતી. એટલે જ ફિલ્ડમાં સૌથી પહેલાં વાયર તપાસાય છે.',
        en: 'Both interfaces are still "on" yet nothing passes. This is exactly why the cable is the first thing checked in the field.',
      },
      apply: (n) => n.setLinkCut('pc1', 'e0', true),
      revert: (n) => n.setLinkCut('pc1', 'e0', false),
    },
    {
      id: 'wrong-subnet',
      label: { gu: 'PC2 ને બીજા network માં ખસેડો', en: 'Move PC2 into a different network' },
      explain: {
        gu: 'PC2 નું સરનામું 10.0.0.20 કરી દો — વાયર એ જ, સરનામું જુદું.',
        en: 'Change PC2 to 10.0.0.20 — same cable, different address.',
      },
      expect: {
        gu: 'વાયર જોડાયેલો હોવા છતાં PC1 કહે છે "રસ્તો જ નથી". સરનામું જ નેટવર્ક નક્કી કરે છે, વાયર નહીં.',
        en: 'The cable is fine, yet PC1 says there is no route at all. The address decides the network, not the wire.',
      },
      apply: (n) => {
        n.get('pc2')!.iface('e0')!.ip = '10.0.0.20'
        n.rev++
      },
      revert: (n) => {
        n.get('pc2')!.iface('e0')!.ip = '192.168.1.20'
        n.rev++
      },
    },
  ],
  probes: [
    {
      id: 'p1',
      from: 'pc1',
      to: 'pc2',
      destIp: '192.168.1.20',
      label: { gu: 'PC1 → PC2 ping', en: 'ping PC1 → PC2' },
    },
  ],
}

/* ───────── n3l3 · static routing, fully working ───────── */

export function routedPairConfigured() {
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
  return n
}

export const n3l3Break: BreakSpec = {
  build: routedPairConfigured,
  layout: [
    { id: 'pc1', x: 105, y: 140, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'r1', x: 330, y: 140, type: 'router' },
    { id: 'r2', x: 560, y: 140, type: 'router' },
    { id: 'pc2', x: 775, y: 140, type: 'pc', accent: 'var(--nq-ccnp)' },
  ],
  viewBox: { w: 880, h: 280 },
  intro: {
    gu: 'આખું નેટવર્ક અત્યારે ચાલે છે: PC1 થી PC2 સુધી ping જાય છે. હવે એક એક ખામી નાખો. દરેક વખતે પહેલાં ધારો કે packet ક્યાં અટકશે, પછી ping ચલાવીને જુઓ — અને નીચે બંને routers ના routing tables બદલાતા જુઓ.',
    en: 'The whole network works right now: PC1 reaches PC2. Now inject one fault at a time. Each time, predict where the packet will stop before you run the ping — and watch both routing tables change below.',
  },
  actions: [
    {
      id: 'no-return',
      label: { gu: 'R2 પરથી પાછો રસ્તો કાઢી નાખો', en: 'Delete the return route on R2' },
      explain: {
        gu: 'R2 પર: no ip route 192.168.1.0 255.255.255.0 10.0.0.1',
        en: 'On R2: no ip route 192.168.1.0 255.255.255.0 10.0.0.1',
      },
      expect: {
        gu: 'આ સૌથી કપટી ભૂલ છે. Packet PC2 સુધી પહોંચી જાય છે — રસ્તો સાચો છે — પણ જવાબ પાછો આવી શકતો નથી, એટલે ping નિષ્ફળ દેખાય છે. હંમેશાં બંને દિશા તપાસો.',
        en: 'This is the sneakiest fault of all. The packet does reach PC2 — the forward path is fine — but the reply cannot get home, so the ping still fails. Always check both directions.',
      },
      apply: (n) => {
        n.get('r2')!.staticRoutes = n.get('r2')!.staticRoutes.filter((r) => r.prefix !== '192.168.1.0')
        n.rev++
      },
      revert: (n) => {
        n.get('r2')!.staticRoutes.push({
          prefix: '192.168.1.0',
          mask: '255.255.255.0',
          nextHop: '10.0.0.1',
          ad: 1,
        })
        n.rev++
      },
    },
    {
      id: 'no-forward',
      label: { gu: 'R1 પરથી આગળનો રસ્તો કાઢી નાખો', en: 'Delete the forward route on R1' },
      explain: {
        gu: 'R1 પર: no ip route 192.168.2.0 255.255.255.0 10.0.0.2',
        en: 'On R1: no ip route 192.168.2.0 255.255.255.0 10.0.0.2',
      },
      expect: {
        gu: 'હવે packet R1 થી આગળ જ નથી વધતું. R1 ના routing table માંથી S વાળી લાઈન ગાયબ થઈ ગઈ એ નીચે જુઓ.',
        en: 'Now the packet gets no further than R1. Look below: the S line has vanished from R1 routing table.',
      },
      apply: (n) => {
        n.get('r1')!.staticRoutes = n.get('r1')!.staticRoutes.filter((r) => r.prefix !== '192.168.2.0')
        n.rev++
      },
      revert: (n) => {
        n.get('r1')!.staticRoutes.push({
          prefix: '192.168.2.0',
          mask: '255.255.255.0',
          nextHop: '10.0.0.2',
          ad: 1,
        })
        n.rev++
      },
    },
    {
      id: 'shut-wan',
      label: { gu: 'R1 નું Gi0/1 બંધ કરો', en: 'Shut down R1 Gi0/1' },
      explain: {
        gu: 'બંને routers ને જોડતી લિંકનો દરવાજો બંધ.',
        en: 'Close the door on the link that joins the two routers.',
      },
      expect: {
        gu: 'લિંક લાલ થઈ, અને R1 ના table માંથી 10.0.0.0/30 નો connected route પણ ગાયબ થયો — interface બંધ થતાં એનો route પણ જાય છે.',
        en: 'The link turned red, and the 10.0.0.0/30 connected route disappeared from R1 as well — when an interface goes down, its route goes with it.',
      },
      apply: (n) => {
        n.get('r1')!.iface('Gi0/1')!.shutdown = true
        n.rev++
      },
      revert: (n) => {
        n.get('r1')!.iface('Gi0/1')!.shutdown = false
        n.rev++
      },
    },
    {
      id: 'bad-mask',
      label: { gu: 'R2 ના LAN પર ખોટો mask', en: 'Wrong mask on the R2 LAN' },
      explain: {
        gu: 'R2 Gi0/0 નો mask 255.255.255.0 ને બદલે 255.255.255.252 કરી દો.',
        en: 'Change the R2 Gi0/0 mask from 255.255.255.0 to 255.255.255.252.',
      },
      expect: {
        gu: 'Packet R2 સુધી પહોંચે છે, પણ R2 ના મતે PC2 (192.168.2.10) હવે એના LAN માં છે જ નહીં. બધું "ચાલુ" દેખાય છે છતાં ચાલતું નથી — mask ની ભૂલ આવી જ હોય છે.',
        en: 'The packet reaches R2, but as far as R2 is concerned PC2 (192.168.2.10) is no longer on its LAN. Everything looks up and nothing works — mask mistakes always look like this.',
      },
      apply: (n) => {
        n.get('r2')!.iface('Gi0/0')!.mask = '255.255.255.252'
        n.rev++
      },
      revert: (n) => {
        n.get('r2')!.iface('Gi0/0')!.mask = '255.255.255.0'
        n.rev++
      },
    },
  ],
  probes: [
    {
      id: 'end',
      from: 'pc1',
      to: 'pc2',
      destIp: '192.168.2.10',
      label: { gu: 'PC1 → PC2', en: 'ping PC1 → PC2' },
    },
    {
      id: 'gw',
      from: 'pc1',
      to: 'r1',
      destIp: '192.168.1.1',
      label: { gu: 'PC1 → પોતાનું gateway', en: 'ping PC1 → its gateway' },
    },
    {
      id: 'wan',
      from: 'r1',
      to: 'r2',
      destIp: '10.0.0.2',
      label: { gu: 'R1 → R2 (WAN લિંક)', en: 'ping R1 → R2 (WAN link)' },
    },
  ],
}
