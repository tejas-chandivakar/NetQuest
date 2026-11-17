import { Network, type DeviceKind } from '../engine/network'

/**
 * What the learner has drawn, as plain data.
 *
 * The engine can add a device and join two of them, but it cannot take either
 * back — and a canvas you cannot undo on is not a canvas. So nothing is edited
 * in place: the design below is the truth, and a fresh Network is built from it
 * after every change. That also makes saving, resetting and sharing a build
 * nothing more than handing this object around.
 */

export interface BuildAddr {
  ip: string
  mask: string
}

export interface BuildDevice {
  id: string
  name: string
  kind: DeviceKind
  x: number
  y: number
  /** interface name -> address; switches stay empty */
  addrs: Record<string, BuildAddr>
  gateway?: string
}

export interface BuildEnd {
  device: string
  iface: string
}

export interface BuildLink {
  id: string
  a: BuildEnd
  b: BuildEnd
}

export interface BuildDesign {
  devices: BuildDevice[]
  links: BuildLink[]
}

/** What each kind has on the back of it. */
export const PORTS: Record<DeviceKind, string[]> = {
  pc: ['e0'],
  server: ['e0'],
  switch: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Fa0/5', 'Fa0/6'],
  router: ['Gi0/0', 'Gi0/1'],
}

const PREFIX: Record<DeviceKind, { id: string; name: string }> = {
  pc: { id: 'pc', name: 'PC' },
  server: { id: 'srv', name: 'SRV' },
  switch: { id: 'sw', name: 'SW' },
  router: { id: 'r', name: 'R' },
}

export const blankDesign = (): BuildDesign => ({ devices: [], links: [] })

export const clone = (d: BuildDesign): BuildDesign => JSON.parse(JSON.stringify(d)) as BuildDesign

/** Ports already carrying a cable on this device. */
function takenPorts(design: BuildDesign, deviceId: string): Set<string> {
  const taken = new Set<string>()
  for (const l of design.links) {
    if (l.a.device === deviceId) taken.add(l.a.iface)
    if (l.b.device === deviceId) taken.add(l.b.iface)
  }
  return taken
}

/** The first port with nothing plugged into it, or undefined when full. */
export function freePort(design: BuildDesign, deviceId: string): string | undefined {
  const dev = design.devices.find((d) => d.id === deviceId)
  if (!dev) return undefined
  const taken = takenPorts(design, deviceId)
  return PORTS[dev.kind].find((p) => !taken.has(p))
}

export function portsLeft(design: BuildDesign, deviceId: string): number {
  const dev = design.devices.find((d) => d.id === deviceId)
  if (!dev) return 0
  return PORTS[dev.kind].length - takenPorts(design, deviceId).size
}

export const linkBetween = (design: BuildDesign, a: string, b: string) =>
  design.links.find(
    (l) =>
      (l.a.device === a && l.b.device === b) || (l.a.device === b && l.b.device === a),
  )

/** Why these two cannot be joined, or undefined when they can. */
export function cableRefusal(
  design: BuildDesign,
  a: string,
  b: string,
): 'same' | 'already' | 'full-a' | 'full-b' | undefined {
  if (a === b) return 'same'
  if (linkBetween(design, a, b)) return 'already'
  if (!freePort(design, a)) return 'full-a'
  if (!freePort(design, b)) return 'full-b'
  return undefined
}

/** A name and id that are not in use yet — PC1, PC2, SW1, R1. */
export function nextIdentity(design: BuildDesign, kind: DeviceKind) {
  const p = PREFIX[kind]
  let n = 1
  while (design.devices.some((d) => d.id === `${p.id}${n}`)) n++
  return { id: `${p.id}${n}`, name: `${p.name}${n}` }
}

/**
 * Somewhere to put a newly added device: the first slot on a loose grid that
 * nothing is sitting on, so adding five machines never stacks them.
 */
export function freeSpot(design: BuildDesign, w: number, h: number) {
  const stepX = 170
  const stepY = 150
  const cols = Math.max(1, Math.floor((w - 100) / stepX))
  for (let i = 0; i < 40; i++) {
    const x = 110 + (i % cols) * stepX
    const y = 90 + Math.floor(i / cols) * stepY
    if (y > h - 50) break
    if (!design.devices.some((d) => Math.abs(d.x - x) < 80 && Math.abs(d.y - y) < 80)) {
      return { x, y }
    }
  }
  return { x: 110 + Math.random() * (w - 220), y: 90 + Math.random() * (h - 180) }
}

/* ───────────────────────── editing ───────────────────────── */

export function addDevice(design: BuildDesign, kind: DeviceKind, w: number, h: number): BuildDesign {
  const next = clone(design)
  const { id, name } = nextIdentity(next, kind)
  const { x, y } = freeSpot(next, w, h)
  next.devices.push({ id, name, kind, x, y, addrs: {} })
  return next
}

export function removeDevice(design: BuildDesign, id: string): BuildDesign {
  const next = clone(design)
  next.devices = next.devices.filter((d) => d.id !== id)
  next.links = next.links.filter((l) => l.a.device !== id && l.b.device !== id)
  return next
}

export function addCable(design: BuildDesign, a: string, b: string): BuildDesign {
  if (cableRefusal(design, a, b)) return design
  const next = clone(design)
  const pa = freePort(next, a)!
  const pb = freePort(next, b)!
  next.links.push({
    id: `${a}:${pa}-${b}:${pb}`,
    a: { device: a, iface: pa },
    b: { device: b, iface: pb },
  })
  return next
}

export const removeCable = (design: BuildDesign, linkId: string): BuildDesign => ({
  ...clone(design),
  links: design.links.filter((l) => l.id !== linkId).map((l) => ({ ...l })),
})

export function moveDevice(design: BuildDesign, id: string, x: number, y: number): BuildDesign {
  const next = clone(design)
  const d = next.devices.find((v) => v.id === id)
  if (d) {
    d.x = Math.round(x)
    d.y = Math.round(y)
  }
  return next
}

export function setAddress(
  design: BuildDesign,
  id: string,
  iface: string,
  addr: Partial<BuildAddr>,
): BuildDesign {
  const next = clone(design)
  const d = next.devices.find((v) => v.id === id)
  if (!d) return next
  const cur = d.addrs[iface] ?? { ip: '', mask: '255.255.255.0' }
  const merged = { ...cur, ...addr }
  if (!merged.ip) delete d.addrs[iface]
  else d.addrs[iface] = merged
  return next
}

export function setGateway(design: BuildDesign, id: string, gateway: string): BuildDesign {
  const next = clone(design)
  const d = next.devices.find((v) => v.id === id)
  if (d) {
    if (gateway) d.gateway = gateway
    else delete d.gateway
  }
  return next
}

/* ───────────────────────── to a real network ───────────────────────── */

/**
 * Build the engine's Network from the drawing.
 *
 * A port with a cable in it is brought up, because a router's ports start shut
 * and `no shutdown` belongs to the Configure stage — here the one thing the
 * learner is deciding is addressing, and a lab that silently needs a second
 * unrelated step teaches the wrong lesson.
 */
export function materialise(design: BuildDesign): Network {
  const net = new Network()

  for (const d of design.devices) {
    net.addDevice({ id: d.id, name: d.name, kind: d.kind, ifaces: PORTS[d.kind] })
    const dev = net.get(d.id)!
    for (const [ifn, a] of Object.entries(d.addrs)) {
      const i = dev.iface(ifn)
      if (!i || !a.ip) continue
      i.ip = a.ip
      i.mask = a.mask || '255.255.255.0'
    }
    if (d.gateway) dev.defaultGateway = d.gateway
  }

  for (const l of design.links) {
    if (!net.get(l.a.device) || !net.get(l.b.device)) continue
    net.connect(l.a.device, l.a.iface, l.b.device, l.b.iface)
    net.get(l.a.device)!.iface(l.a.iface)!.shutdown = false
    net.get(l.b.device)!.iface(l.b.iface)!.shutdown = false
  }

  return net
}
