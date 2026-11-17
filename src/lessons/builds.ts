import type { BuildSpec } from '../components/BuildStage'
import type { BuildDesign } from '../lib/buildDesign'
import { networkOf } from '../engine/ip'
import type { Device, Network } from '../engine/network'

/**
 * Build-it challenges.
 *
 * Every other stage hands the learner a finished network. Here they make the
 * decisions themselves — how many networks, which addresses, who the way out
 * is — and the engine marks the work by trying it, so nobody has to be told
 * whether it was right.
 *
 * Goals never name a device by id, because the learner may add, delete and
 * re-add anything: they ask what is true of the drawing as a whole.
 */

const H = (gu: string, en: string) => ({ gu, en })

const hostsOf = (net: Network) =>
  [...net.devices.values()].filter((d) => d.kind === 'pc' || d.kind === 'server')

const subnetOf = (dev: Device) => {
  const i = dev.activeIfaces()[0]
  return i?.ip && i.mask ? networkOf(i.ip, i.mask) : undefined
}

const countKind = (d: BuildDesign, kind: string) =>
  d.devices.filter((x) => x.kind === kind).length

/** Every host reaches every other one. */
function allReach(net: Network): boolean {
  const list = hostsOf(net)
  if (list.length < 2) return false
  return list.every((a) =>
    list.every((b) => {
      if (a.id === b.id) return true
      const ip = b.activeIfaces()[0]?.ip
      return !!ip && net.ping(a.id, ip).ok
    }),
  )
}

/** Is every host cabled to something of this kind? */
function allCabledTo(design: BuildDesign, kind: string): boolean {
  const hosts = design.devices.filter((d) => d.kind === 'pc' || d.kind === 'server')
  if (!hosts.length) return false
  const kindIds = new Set(design.devices.filter((d) => d.kind === kind).map((d) => d.id))
  return hosts.every((h) =>
    design.links.some(
      (l) =>
        (l.a.device === h.id && kindIds.has(l.b.device)) ||
        (l.b.device === h.id && kindIds.has(l.a.device)),
    ),
  )
}

/* ═══════════ b2l1 · one street, everyone on it ═══════════ */

const oneNetworkStart: BuildDesign = {
  devices: [
    { id: 'pc1', name: 'PC1', kind: 'pc', x: 120, y: 95, addrs: {} },
    { id: 'pc2', name: 'PC2', kind: 'pc', x: 120, y: 310, addrs: {} },
    { id: 'sw1', name: 'SW1', kind: 'switch', x: 480, y: 200, addrs: {} },
  ],
  links: [],
}

export const b2l1Build: BuildSpec = {
  brief: H(
    'ત્રણ ઉપકરણ કેનવાસ પર છે પણ એકેય જોડાયેલું નથી અને એકેયને સરનામું નથી. બંને કમ્પ્યુટરને switch સાથે જોડો, દરેકને `192.168.1.x` શ્રેણીનું સરનામું આપો, અને પછી ચકાસો કે એ એકબીજા સાથે વાત કરી શકે છે.',
    'Three devices are on the canvas, none of them joined and none of them addressed. Cable both computers to the switch, give each one an address in the `192.168.1.x` range, then test that they can talk to each other.',
  ),
  start: oneNetworkStart,
  palette: ['pc', 'server', 'switch'],
  goals: [
    {
      id: 'parts',
      label: H(
        'બે કમ્પ્યુટર અને એક switch કેનવાસ પર હોય',
        'Two computers and a switch on the canvas',
      ),
      check: (_net, d) => countKind(d, 'pc') >= 2 && countKind(d, 'switch') >= 1,
    },
    {
      id: 'cabled',
      label: H('દરેક કમ્પ્યુટર switch સાથે જોડાયેલું હોય', 'Every computer is cabled to the switch'),
      check: (_net, d) => allCabledTo(d, 'switch'),
    },
    {
      id: 'addressed',
      label: H('દરેક કમ્પ્યુટર પાસે પોતાનું સરનામું હોય', 'Every computer has an address of its own'),
      check: (net) => {
        const hs = hostsOf(net)
        const ips = hs.map((h) => h.activeIfaces()[0]?.ip).filter(Boolean)
        return hs.length >= 2 && ips.length === hs.length && new Set(ips).size === ips.length
      },
    },
    {
      id: 'reach',
      label: H('એક કમ્પ્યુટર બીજા સુધી પહોંચે', 'One computer can reach the other'),
      check: (net) => allReach(net),
    },
  ],
  success: H(
    'એક switch, એક શ્રેણીનાં સરનામાં, અને વાત ચાલુ. **આ જ એક network છે** — બીજું કશું નહીં.',
    'One switch, addresses from one range, and a conversation. **That is all a network is** — nothing more.',
  ),
}

/* ═══════════ b1l5 · put together the right cast ═══════════ */

export const b1l5Build: BuildSpec = {
  brief: H(
    'ખાલી canvas છે. **એક PC, એક server, અને એક switch** ઉમેરો. PC અને server ને switch સાથે cable કરો — switch જ વચ્ચે રહે છે, PC ને server સાથે સીધા ન જોડો.',
    'The canvas is empty. Add **one PC, one server, and one switch**. Cable the PC and the server to the switch — the switch sits in the middle, don’t cable the PC directly to the server.',
  ),
  palette: ['pc', 'server', 'switch'],
  goals: [
    {
      id: 'cast',
      label: H(
        'એક PC, એક server, અને એક switch કેનવાસ પર હોય',
        'A PC, a server, and a switch on the canvas',
      ),
      check: (_net, d) =>
        countKind(d, 'pc') >= 1 && countKind(d, 'server') >= 1 && countKind(d, 'switch') >= 1,
    },
    {
      id: 'cabled',
      label: H(
        'PC અને server બંને switch સાથે જોડાયેલાં હોય',
        'Both the PC and the server are cabled to the switch',
      ),
      check: (_net, d) => allCabledTo(d, 'switch'),
    },
  ],
  success: H(
    'PC માગે, server આપે, switch વચ્ચેથી ટ્રાફિક પહોંચાડે. **આ ત્રણ ભૂમિકા** — client, server, switch — દરેક network ના પાયામાં છે.',
    'The PC asks, the server answers, and the switch carries the traffic. **These three roles** — client, server, switch — are at the foundation of every network.',
  ),
}

/* ═══════════ b2l3 · three machines, one street ═══════════ */

const threeHostsStart: BuildDesign = {
  devices: [
    { id: 'sw1', name: 'SW1', kind: 'switch', x: 440, y: 200, addrs: {} },
  ],
  links: [],
}

export const b2l3Build: BuildSpec = {
  brief: H(
    'એક switch કેનવાસ પર છે. **ત્રણ કમ્પ્યુટર** ઉમેરો, ત્રણેયને switch સાથે cable કરો, દરેકને **એક જ subnet** નું IP address આપો, અને ચકાસો કે ત્રણેય એકબીજા સુધી પહોંચે.',
    'One switch is on the canvas. Add **three computers**, cable all three to the switch, give each an IP address from the **same subnet**, and verify that all three can reach each other.',
  ),
  start: threeHostsStart,
  palette: ['pc', 'server', 'switch'],
  goals: [
    {
      id: 'three',
      label: H('ઓછામાં ઓછા ત્રણ host (PC/server) કેનવાસ પર હોય', 'At least three hosts on the canvas'),
      check: (net) => hostsOf(net).length >= 3,
    },
    {
      id: 'cabled',
      label: H('દરેક host switch સાથે જોડાયેલું હોય', 'Every host is cabled to the switch'),
      check: (_net, d) => allCabledTo(d, 'switch'),
    },
    {
      id: 'same-subnet',
      label: H('બધા host **એક જ subnet** પર હોય', 'All hosts sit on the **same subnet**'),
      check: (net) => {
        const subs = hostsOf(net).map(subnetOf).filter(Boolean)
        return subs.length >= 3 && new Set(subs).size === 1
      },
    },
    {
      id: 'reach',
      label: H('દરેક host બીજા દરેક સુધી પહોંચે', 'Every host can reach every other one'),
      check: (net) => allReach(net),
    },
  ],
  success: H(
    'ત્રણ host, એક switch, એક subnet — **IP address અને MAC address બંને** કામ કરે છે, પણ **IP** આપણે નક્કી કર્યું, **MAC** hardware એ નક્કી કરેલું. એક street ના address share કરનારા પડોશી.',
    'Three hosts, one switch, one subnet — **both IP and MAC** are at work, but **IP** is what you chose, **MAC** is what the hardware decided. Neighbours sharing an address range on one street.',
  ),
}

/* ═══════════ b4l1 · the full journey ═══════════ */

const fullJourneyStart: BuildDesign = {
  devices: [
    { id: 'pc1', name: 'PC1', kind: 'pc', x: 60, y: 200, addrs: {} },
    { id: 'sw1', name: 'SW1', kind: 'switch', x: 240, y: 200, addrs: {} },
    { id: 'r1', name: 'R1', kind: 'router', x: 440, y: 200, addrs: {} },
    { id: 'sw2', name: 'SW2', kind: 'switch', x: 640, y: 200, addrs: {} },
    { id: 'srv1', name: 'SRV1', kind: 'server', x: 820, y: 200, addrs: {} },
  ],
  links: [],
}

export const b4l1Build: BuildSpec = {
  brief: H(
    'પાંચ ઉપકરણ કેનવાસ પર છે: PC, switch, router, switch, server. **ડાબેથી જમણે** cable કરો — PC→SW1→R1→SW2→SRV1. PC ને `192.168.1.x` range, server ને `10.0.0.x` range આપો. Router ને **બંને બાજુ** address આપો અને gateway set કરો.',
    'Five devices are on the canvas: PC, switch, router, switch, server. Cable them **left to right** — PC→SW1→R1→SW2→SRV1. Give the PC a `192.168.1.x` address, the server a `10.0.0.x` address. Give the router an address on **each side**, and set the gateways.',
  ),
  start: fullJourneyStart,
  palette: ['pc', 'server', 'switch', 'router'],
  viewBox: { w: 900, h: 420 },
  goals: [
    {
      id: 'chain',
      label: H('PC થી server સુધી cable ની સાંકળ હોય', 'A chain of cables connects PC to server'),
      check: (_net, d) => {
        // BFS from any PC to any server through cables
        const pcs = d.devices.filter((x) => x.kind === 'pc').map((x) => x.id)
        const servers = new Set(d.devices.filter((x) => x.kind === 'server').map((x) => x.id))
        const adj = new Map<string, string[]>()
        for (const l of d.links) {
          if (!adj.has(l.a.device)) adj.set(l.a.device, [])
          if (!adj.has(l.b.device)) adj.set(l.b.device, [])
          adj.get(l.a.device)!.push(l.b.device)
          adj.get(l.b.device)!.push(l.a.device)
        }
        return pcs.some((pc) => {
          const visited = new Set([pc])
          const queue = [pc]
          while (queue.length) {
            const cur = queue.shift()!
            if (servers.has(cur)) return true
            for (const nb of adj.get(cur) ?? []) {
              if (!visited.has(nb)) { visited.add(nb); queue.push(nb) }
            }
          }
          return false
        })
      },
    },
    {
      id: 'router',
      label: H('chain માં router હોય', 'The chain goes through a router'),
      check: (_net, d) => countKind(d, 'router') >= 1 && d.links.some(
        (l) => d.devices.find((x) => x.id === l.a.device)?.kind === 'router' ||
               d.devices.find((x) => x.id === l.b.device)?.kind === 'router',
      ),
    },
    {
      id: 'two-subnets',
      label: H('PC અને server **જુદા subnet** પર હોય', 'PC and server sit on **different subnets**'),
      check: (net) => {
        const subs = hostsOf(net).map(subnetOf).filter(Boolean) as string[]
        return subs.length >= 2 && new Set(subs).size >= 2
      },
    },
    {
      id: 'gateways',
      label: H('દરેક host નો gateway **એની બાજુનું** router address હોય', 'Each host’s gateway is the router’s address **on its own side**'),
      check: (net) => {
        const hs = hostsOf(net)
        if (hs.length < 2) return false
        return hs.every((h) => {
          const gw = h.defaultGateway
          const i = h.activeIfaces()[0]
          if (!gw || !i?.ip || !i.mask) return false
          if (networkOf(gw, i.mask) !== networkOf(i.ip, i.mask)) return false
          return [...net.devices.values()].some((d) => d.kind === 'router' && d.ownsIp(gw))
        })
      },
    },
    {
      id: 'reach',
      label: H('PC server સુધી પહોંચે', 'The PC can reach the server'),
      check: (net) => allReach(net),
    },
  ],
  success: H(
    'PC → switch → router → switch → server. **આ જ google.com ટાઈપ કરો ત્યારે થાય છે** — ફક્ત router ના ઘણા step. એક LAN છોડો, બીજા LAN માં પહોંચો, router જ વચ્ચેનો દરવાજો.',
    'PC → switch → router → switch → server. **This is what happens when you type google.com** — just more routers in between. Leave one LAN, arrive at another, with the router as the door between them.',
  ),
}

/* ═══════════ b4l4 · two streets and the way between ═══════════ */

const twoNetworkStart: BuildDesign = {
  devices: [
    { id: 'pc1', name: 'PC1', kind: 'pc', x: 120, y: 200, addrs: {} },
    { id: 'r1', name: 'R1', kind: 'router', x: 450, y: 200, addrs: {} },
    { id: 'srv1', name: 'SRV1', kind: 'server', x: 770, y: 200, addrs: {} },
  ],
  links: [],
}

export const b4l4Build: BuildSpec = {
  brief: H(
    'Router ની બે બાજુ બે **જુદાં** network બનાવો. PC ને એક બાજુ જોડો, server ને બીજી બાજુ, અને બંનેને જુદી શ્રેણીનાં સરનામાં આપો — જેમ કે `192.168.1.x` અને `10.0.0.x`. Router ને દરેક બાજુ એક સરનામું જોઈશે, અને દરેક મશીનનો "બહાર જવાનો રસ્તો" **એની પોતાની બાજુનું** router નું સરનામું હોવું જોઈએ.',
    'Make two **different** networks, one on each side of the router. Cable the PC to one side and the server to the other, and give them addresses from different ranges — say `192.168.1.x` and `10.0.0.x`. The router needs an address on each side, and every machine’s way out must be the router’s address **on its own side**.',
  ),
  start: twoNetworkStart,
  palette: ['pc', 'server', 'switch', 'router'],
  goals: [
    {
      id: 'router',
      label: H('એક router કેનવાસ પર હોય', 'A router on the canvas'),
      check: (_net, d) => countKind(d, 'router') >= 1,
    },
    {
      id: 'cabled',
      label: H('દરેક મશીન router સુધી જોડાયેલું હોય', 'Every machine has a path to the router'),
      check: (net, d) => {
        const routers = new Set(d.devices.filter((x) => x.kind === 'router').map((x) => x.id))
        if (!routers.size) return false
        return hostsOf(net).every((h) =>
          d.links.some(
            (l) =>
              (l.a.device === h.id && routers.has(l.b.device)) ||
              (l.b.device === h.id && routers.has(l.a.device)),
          ),
        )
      },
    },
    {
      id: 'two',
      label: H('મશીનો **બે જુદાં** network પર હોય', 'The machines sit on **two different** networks'),
      check: (net) => {
        const subs = hostsOf(net)
          .map(subnetOf)
          .filter(Boolean) as string[]
        return subs.length >= 2 && new Set(subs).size >= 2
      },
    },
    {
      id: 'gateway',
      label: H(
        'દરેક મશીનનો રસ્તો **એની પોતાની બાજુનું** router નું સરનામું હોય',
        'Each machine’s way out is the router’s address **on its own side**',
      ),
      check: (net) => {
        const hs = hostsOf(net)
        if (hs.length < 2) return false
        return hs.every((h) => {
          const gw = h.defaultGateway
          const i = h.activeIfaces()[0]
          if (!gw || !i?.ip || !i.mask) return false
          // pointing at the far side of the router is the classic mistake, and
          // it is the one this goal exists to catch
          if (networkOf(gw, i.mask) !== networkOf(i.ip, i.mask)) return false
          return [...net.devices.values()].some((d) => d.kind === 'router' && d.ownsIp(gw))
        })
      },
    },
    {
      id: 'reach',
      label: H('એક બાજુનું મશીન બીજી બાજુ પહોંચે', 'A machine on one side reaches the other side'),
      check: (net) => {
        const hs = hostsOf(net)
        return hs.some((a) =>
          hs.some((b) => {
            if (a.id === b.id) return false
            const sa = subnetOf(a)
            const sb = subnetOf(b)
            if (!sa || !sb || sa === sb) return false
            const ip = b.activeIfaces()[0]?.ip
            return !!ip && net.ping(a.id, ip).ok
          }),
        )
      },
    },
  ],
  success: H(
    'બે network, અને વચ્ચે એક router. **દરેક બાજુને એની પોતાની બાજુનો દરવાજો જોઈએ** — આ એક વાત આખા routing નો પાયો છે.',
    'Two networks with a router between them. **Each side needs the door on its own side** — that one idea is the foundation of all routing.',
  ),
}
