import type { BreakSpec } from '../components/BreakStage'
import { Network } from '../engine/network'

const H = (gu: string, en: string) => ({ gu, en })

function addr(n: Network, id: string, ifn: string, ip: string, mask: string) {
  const i = n.get(id)!.iface(ifn)!
  i.ip = ip
  i.mask = mask
  i.shutdown = false
}

function pc(n: Network, id: string, name: string, ip: string, gw: string) {
  n.addDevice({ id, name, kind: 'pc', ifaces: ['e0'] })
  const i = n.get(id)!.iface('e0')!
  i.ip = ip
  i.mask = '255.255.255.0'
  n.get(id)!.defaultGateway = gw
}

/* ═══════════════ b2l3 · the ARP cache ═══════════════ */

function arpLab() {
  const n = new Network()
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  pc(n, 'pc1', 'PC1', '192.168.1.11', '192.168.1.1')
  pc(n, 'pc2', 'PC2', '192.168.1.12', '192.168.1.1')
  pc(n, 'pc3', 'PC3', '192.168.1.13', '192.168.1.1')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw', 'Fa0/2')
  n.connect('pc3', 'e0', 'sw', 'Fa0/3')
  return n
}

export const b2l3Break: BreakSpec = {
  build: arpLab,
  viewBox: { w: 860, h: 340 },
  layout: [
    { id: 'pc1', x: 120, y: 90, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 430, y: 200, type: 'switch' },
    { id: 'pc2', x: 430, y: 60, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'pc3', x: 740, y: 90, type: 'pc', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'ત્રણ મશીન એક જ switch પર છે અને એકબીજાને ઓળખે છે. હવે એમની યાદશક્તિ અને વાયર સાથે રમો — અને જુઓ કે IP હોવા છતાં MAC વગર કશું પહોંચતું નથી.',
    'Three machines on one switch, all of which know each other. Now play with their memory and their cables — and watch how an IP alone gets you nowhere without a MAC.',
  ),
  actions: [
    {
      id: 'forget',
      label: H('બધાંની યાદશક્તિ ભૂંસો', 'Wipe what everyone has learnt'),
      explain: H(
        'દરેક મશીને યાદ રાખેલું છે કે કયા IP નું કયું MAC. એ નોંધ ભૂંસી નાખો.',
        'Each machine remembers which MAC goes with which IP. Erase those notes.',
      ),
      expect: H(
        'Ping તોય ચાલશે — કારણ કે મશીન ફરી પૂછી લેશે. ભૂલી જવું એ ભાંગવું નથી, ફક્ત ધીમું પડવું છે.',
        'The ping still works, because the machine simply asks again. Forgetting is not breaking — only a small delay.',
      ),
      apply: (n) => {
        for (const d of n.devices.values()) d.arp.clear()
      },
      revert: () => {},
    },
    {
      id: 'unplug2',
      label: H('PC2 નો વાયર કાઢો', 'Unplug PC2'),
      explain: H(
        'PC2 નું સરનામું તો એ જ રહેશે — પણ એ હવે બૂમનો જવાબ આપી શકશે નહીં.',
        'PC2 keeps its address, but it can no longer answer when someone calls.',
      ),
      expect: H(
        'PC1 થી PC2 ને ping નિષ્ફળ — અને કારણ "સરનામું ખોટું" નહીં, "કોઈએ જવાબ આપ્યો નહીં" હશે.',
        'PC1 to PC2 fails — and the reason is not a wrong address but that nobody answered.',
      ),
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
      id: 'wrongip',
      label: H('PC3 ને બીજી શેરીમાં ખસેડો', 'Move PC3 to another street'),
      explain: H(
        'PC3 નું સરનામું 10.0.0.13 કરી દો — વાયર એ જ, switch એ જ, ફક્ત સરનામું બીજા નેટવર્કનું.',
        'Give PC3 the address 10.0.0.13 — same cable, same switch, just an address from another network.',
      ),
      expect: H(
        'PC1 હવે PC3 ને શોધવાની કોશિશ પણ નહીં કરે — એ માનશે કે એ બીજી શેરીમાં છે અને gateway ને આપશે.',
        'PC1 will not even look for PC3 any more — it decides PC3 is on another street and hands the packet to the gateway.',
      ),
      apply: (n) => {
        addr(n, 'pc3', 'e0', '10.0.0.13', '255.255.255.0')
        n.rev++
      },
      revert: (n) => {
        addr(n, 'pc3', 'e0', '192.168.1.13', '255.255.255.0')
        n.rev++
      },
    },
  ],
  probes: [
    { id: 'p12', from: 'pc1', to: 'pc2', destIp: '192.168.1.12', label: H('PC1 → PC2', 'PC1 → PC2') },
    { id: 'p13', from: 'pc1', to: 'pc3', destIp: '192.168.1.13', label: H('PC1 → PC3', 'PC1 → PC3') },
  ],
}

/* ═══════════════ b4l3 · the DHCP server ═══════════════ */

function dhcpLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  pc(n, 'pc1', 'PC1', '192.168.10.10', '192.168.10.1')
  pc(n, 'srv', 'SERVER', '192.168.10.50', '192.168.10.1')
  n.get('srv')!.kind = 'server'
  // something beyond the street, so a wrong gateway has somewhere to fail
  pc(n, 'web', 'WEB', '203.0.113.9', '203.0.113.1')
  n.get('web')!.kind = 'server'
  n.connect('r1', 'Gi0/0', 'sw', 'Fa0/1')
  n.connect('pc1', 'e0', 'sw', 'Fa0/2')
  n.connect('srv', 'e0', 'sw', 'Fa0/3')
  n.connect('r1', 'Gi0/1', 'web', 'e0')
  addr(n, 'r1', 'Gi0/0', '192.168.10.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '203.0.113.1', '255.255.255.0')
  return n
}

export const b4l3Break: BreakSpec = {
  build: dhcpLab,
  viewBox: { w: 860, h: 340 },
  layout: [
    { id: 'web', x: 90, y: 170, type: 'server', accent: 'var(--nq-ccna)' },
    { id: 'r1', x: 300, y: 170, type: 'router' },
    { id: 'sw', x: 520, y: 170, type: 'switch' },
    { id: 'pc1', x: 760, y: 80, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'srv', x: 760, y: 270, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'PC1 ને DHCP થી સરનામું મળી ગયું છે અને બધું ચાલે છે. હવે એ સરનામું છીનવી લો, કે gateway બગાડો — અને જુઓ કે દરેક ખામી અલગ રીતે દેખાય છે.',
    'PC1 has its address from DHCP and everything works. Now take that address away, or spoil the gateway — and notice that each fault looks different.',
  ),
  actions: [
    {
      id: 'noaddr',
      label: H('PC1 નું સરનામું છીનવી લો', 'Take PC1’s address away'),
      explain: H(
        'જાણે DHCP server જવાબ જ ન આપ્યો હોય. PC1 પાસે કોઈ સરનામું નથી.',
        'As though no DHCP server ever answered. PC1 has no address at all.',
      ),
      expect: H(
        'કશે પણ ping નહીં જાય. સરનામા વગર જવાબ પાછો ક્યાં આવે?',
        'Nothing reaches anywhere. Without an address, where would a reply even come back to?',
      ),
      apply: (n) => {
        const i = n.get('pc1')!.iface('e0')!
        i.ip = undefined
        i.mask = undefined
        n.rev++
      },
      revert: (n) => {
        addr(n, 'pc1', 'e0', '192.168.10.10', '255.255.255.0')
        n.rev++
      },
    },
    {
      id: 'badgw',
      label: H('ખોટું gateway આપો', 'Hand out the wrong gateway'),
      explain: H(
        'DHCP એ gateway 192.168.10.99 કહ્યું — પણ ત્યાં કોઈ છે જ નહીં.',
        'DHCP said the gateway is 192.168.10.99 — but nothing lives at that address.',
      ),
      expect: H(
        'એક જ શેરીમાં ping ચાલશે, પણ બહાર કશે નહીં. ખોટું gateway એટલે આ જ દેખાય.',
        'Pings inside the street still work, but nothing leaves it. A wrong gateway looks exactly like this.',
      ),
      apply: (n) => {
        n.get('pc1')!.defaultGateway = '192.168.10.99'
        n.rev++
      },
      revert: (n) => {
        n.get('pc1')!.defaultGateway = '192.168.10.1'
        n.rev++
      },
    },
    {
      id: 'dup',
      label: H('બે મશીનને એક જ સરનામું', 'Give two machines one address'),
      explain: H(
        'Server ને પણ 192.168.10.10 આપી દો — બરાબર એ જ જે PC1 પાસે છે.',
        'Give the server 192.168.10.10 as well — exactly what PC1 already has.',
      ),
      expect: H(
        'આ જ કારણે DHCP ની જરૂર પડી. હાથે સરનામાં આપો ત્યારે આવું થાય, અને શોધવું અઘરું પડે.',
        'This is the very reason DHCP exists. Hand addresses out by hand and this happens, and it is painful to track down.',
      ),
      apply: (n) => {
        addr(n, 'srv', 'e0', '192.168.10.10', '255.255.255.0')
        n.rev++
      },
      revert: (n) => {
        addr(n, 'srv', 'e0', '192.168.10.50', '255.255.255.0')
        n.rev++
      },
    },
  ],
  probes: [
    { id: 'psrv', from: 'pc1', to: 'srv', destIp: '192.168.10.50', label: H('PC1 → Server', 'PC1 → Server') },
    { id: 'pweb', from: 'pc1', to: 'web', destIp: '203.0.113.9', label: H('PC1 → બહાર', 'PC1 → outside') },
  ],
}
