import { cidr } from '../engine/ip'
import type { Device, DeviceKind, Network } from '../engine/network'
import type { Bi } from '../data/courses'

/**
 * What each box on the drawing actually is, worked out from the network.
 *
 * A beginner looking at a topology can name none of it: the icons differ but
 * nothing on screen says which one starts a conversation, which one only
 * repeats it, and which one is the way out. Writing that by hand into every
 * lesson would be forty paragraphs that drift out of step with the labs, so it
 * is derived instead — the kinds carry the explanation and the network itself
 * supplies the addresses, the neighbours and who leans on whom.
 */

const H = (gu: string, en: string): Bi => ({ gu, en })

export interface PartFact {
  label: Bi
  value: string
}

export interface Part {
  id: string
  name: string
  kind: DeviceKind
  role: Bi
  /** absent on the second and later device of a kind — the words were said once */
  what?: Bi
  facts: PartFact[]
}

const ROLE: Record<DeviceKind, Bi> = {
  pc: H('કમ્પ્યુટર', 'Computer'),
  server: H('Server', 'Server'),
  switch: H('Switch', 'Switch'),
  router: H('Router', 'Router'),
}

const WHAT: Record<DeviceKind, { beginner: Bi; exam: Bi }> = {
  pc: {
    beginner: H(
      'એક કમ્પ્યુટર જેની પાસે કોઈ બેસે છે. એ વાત **શરૂ** કરે છે — બીજાનું traffic આગળ પસાર કરતું નથી.',
      'A computer someone sits at. It **starts** conversations — it never passes anyone else’s traffic along.',
    ),
    exam: H(
      'End host. Traffic અહીંથી શરૂ થાય અને અહીં પૂરું થાય; એ forwarding કરતું નથી.',
      'An end host. Traffic originates and terminates here; it does not forward.',
    ),
  },
  server: {
    beginner: H(
      'એ પણ કમ્પ્યુટર જ છે — પણ એ **પૂછાય તેની રાહ** જુએ છે. જવાબ આપે છે, વાત શરૂ કરતું નથી.',
      'A computer too — but one that **waits to be asked**. It answers; it does not start the conversation.',
    ),
    exam: H(
      'Services ચલાવતું end host. Client ની વિનંતી આવે ત્યારે જવાબ આપે છે.',
      'An end host running services. It responds when a client asks.',
    ),
  },
  switch: {
    beginner: H(
      'એક નેટવર્કની અંદરનાં મશીનોને જોડે છે. એ **hardware સરનામું** વાંચે છે, IP નહીં — એટલે બીજા નેટવર્ક સુધી જાતે કશું મોકલી શકતું નથી.',
      'Joins the machines inside one network. It reads **hardware addresses**, not IP — so on its own it cannot send anything to a different network.',
    ),
    exam: H(
      'Layer 2. એક VLAN ની અંદર MAC પ્રમાણે frame forward કરે છે.',
      'Layer 2. Forwards frames by MAC address within a VLAN.',
    ),
  },
  router: {
    beginner: H(
      'જુદાં નેટવર્કને જોડે છે. એ **IP સરનામું** વાંચીને નક્કી કરે છે કે packet કઈ બાજુ જાય. પોતાના નેટવર્કની બહાર નીકળવાનો રસ્તો આ જ છે.',
      'Joins different networks. It reads **IP addresses** and decides which way each packet goes. This is the way out of your own network.',
    ),
    exam: H(
      'Layer 3. Routing table સામે longest-prefix match કરીને forward કરે છે.',
      'Layer 3. Forwards on a longest-prefix match against the routing table.',
    ),
  },
}

const ALSO_ROUTES = H(
  'આના પર routing ચાલુ છે, એટલે એ પોતાનાં VLAN વચ્ચે પણ રસ્તો કરી આપે છે.',
  'ip routing is on here, so it also routes between its own VLANs.',
)

const FACT = {
  address: H('સરનામું', 'address'),
  wayOut: H('બહાર જવાનો રસ્તો', 'way out'),
  joins: H('જોડાયેલું', 'connects'),
  networks: H('નેટવર્ક જોડે છે', 'joins networks'),
  gatewayFor: H('આમનો દરવાજો', 'gateway for'),
  vlans: H('VLANs', 'VLANs'),
  guard: H('નિયમ યાદી', 'rule list'),
}

const named = (net: Network, id: string) => net.get(id)?.name ?? id

/** Who the cables run to, whatever state they are in. */
function neighbours(net: Network, id: string): string[] {
  const out: string[] = []
  for (const l of net.links) {
    if (l.a.device === id) out.push(l.b.device)
    else if (l.b.device === id) out.push(l.a.device)
  }
  return [...new Set(out)].map((n) => named(net, n))
}

const ownerOf = (net: Network, ip: string) =>
  [...net.devices.values()].find((d) => d.ownsIp(ip))?.name

function factsFor(dev: Device, net: Network): PartFact[] {
  const facts: PartFact[] = []
  const near = neighbours(net, dev.id)

  if (dev.kind === 'pc' || dev.kind === 'server') {
    const addrs = dev.activeIfaces().map((i) => cidr(i.ip!, i.mask!))
    facts.push({ label: FACT.address, value: addrs.join(', ') || '—' })
    if (dev.defaultGateway) {
      const owner = ownerOf(net, dev.defaultGateway)
      facts.push({
        label: FACT.wayOut,
        value: owner ? `${dev.defaultGateway} (${owner})` : dev.defaultGateway,
      })
    }
    if (near.length) facts.push({ label: FACT.joins, value: near.join(', ') })
    return facts
  }

  if (dev.kind === 'switch') {
    if (near.length) facts.push({ label: FACT.joins, value: near.join(', ') })
    const vlans = [...dev.vlans].filter(([id]) => id !== 1)
    if (vlans.length) {
      facts.push({ label: FACT.vlans, value: vlans.map(([id, n]) => `${id} (${n})`).join(', ') })
    }
    return facts
  }

  // router
  const nets = dev
    .installedRoutes()
    .filter((r) => r.source === 'C')
    .map((r) => cidr(r.prefix, r.mask))
  if (nets.length) facts.push({ label: FACT.networks, value: nets.join(', ') })

  const leaning = [...net.devices.values()]
    .filter((d) => d.defaultGateway && dev.ownsIp(d.defaultGateway))
    .map((d) => d.name)
  if (leaning.length) facts.push({ label: FACT.gatewayFor, value: leaning.join(', ') })

  const filtered = dev.ifaces.filter((i) => i.aclIn || i.aclOut).map((i) => i.name)
  if (filtered.length) facts.push({ label: FACT.guard, value: filtered.join(', ') })

  return facts
}

export function partsFor(net: Network, ids: string[], mode: 'beginner' | 'exam'): Part[] {
  const parts: Part[] = []
  // three PCs do not need the same paragraph three times; the second one only
  // has to say which PC it is and where it sits
  const explained = new Set<string>()

  for (const id of ids) {
    const dev = net.get(id)
    if (!dev) continue
    // a layer-3 switch is the one case where the kind alone misleads, so it is
    // its own entry in the "said already" set rather than sharing with switches
    const voice = dev.kind === 'switch' && dev.ipRouting ? 'switch-l3' : dev.kind
    const base = WHAT[dev.kind][mode]
    const what = explained.has(voice)
      ? undefined
      : voice === 'switch-l3'
        ? { gu: `${base.gu} ${ALSO_ROUTES.gu}`, en: `${base.en} ${ALSO_ROUTES.en}` }
        : base
    explained.add(voice)

    parts.push({
      id,
      name: dev.name,
      kind: dev.kind,
      role: ROLE[dev.kind],
      what,
      facts: factsFor(dev, net),
    })
  }
  return parts
}
