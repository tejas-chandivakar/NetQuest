import { ipToInt, networkOf, wildcardToMask } from './ip'
import type { Device, Iface, Network, RouteEntry } from './network'

/* ───────────────────────── protocol configuration ───────────────────────── */

export interface OspfNetwork {
  ip: string
  wildcard: string
  area: number
}

export interface OspfConfig {
  pid: number
  routerId?: string
  networks: OspfNetwork[]
  passive: string[]
  referenceBandwidth: number
}

export interface EigrpConfig {
  asn: number
  networks: { ip: string; wildcard?: string }[]
  passive: string[]
  autoSummary: boolean
}

export interface RipConfig {
  version: number
  networks: string[]
  passive: string[]
  autoSummary: boolean
}

export type Proto = 'ospf' | 'eigrp' | 'rip'

export const AD: Record<Proto, number> = { ospf: 110, eigrp: 90, rip: 120 }
export const CODE: Record<Proto, RouteEntry['source']> = { ospf: 'O', eigrp: 'D', rip: 'R' }

/* ───────────────────────── interface characteristics ───────────────────────── */

/** Bandwidth in kbps, inferred from the interface name like real IOS defaults. */
export function bandwidthOf(i: Iface): number {
  const n = i.name.toLowerCase()
  if (n.startsWith('te')) return 10_000_000
  if (n.startsWith('gi')) return 1_000_000
  if (n.startsWith('fa')) return 100_000
  if (n.startsWith('se')) return 1_544
  if (n.startsWith('vlan')) return 1_000_000
  return 10_000
}

/** Delay in tens of microseconds, as EIGRP counts it. */
export function delayOf(i: Iface): number {
  const n = i.name.toLowerCase()
  if (n.startsWith('te') || n.startsWith('gi')) return 10
  if (n.startsWith('fa')) return 100
  if (n.startsWith('se')) return 2000
  return 100
}

/** OSPF cost = reference bandwidth / interface bandwidth, minimum 1. */
export function ospfCost(i: Iface, referenceBandwidth = 100_000): number {
  return Math.max(1, Math.floor(referenceBandwidth / bandwidthOf(i)))
}

/** Classic EIGRP composite metric for a path. */
export function eigrpMetric(minBandwidth: number, totalDelay: number): number {
  return 256 * (Math.floor(10_000_000 / minBandwidth) + totalDelay)
}

/* ───────────────────────── which interfaces take part ───────────────────────── */

function matchesWildcard(ip: string, netIp: string, wildcard: string): boolean {
  const mask = wildcardToMask(wildcard)
  return networkOf(ip, mask) === networkOf(netIp, mask)
}

/** The classful network an address falls into, which is what RIP advertises. */
export function classfulOf(ip: string): string {
  const first = Number(ip.split('.')[0])
  if (first < 128) return networkOf(ip, '255.0.0.0')
  if (first < 192) return networkOf(ip, '255.255.0.0')
  return networkOf(ip, '255.255.255.0')
}

export function enabledIfaces(dev: Device, proto: Proto): Iface[] {
  const active = dev.activeIfaces()
  if (proto === 'ospf') {
    const cfg = dev.ospf
    if (!cfg) return []
    return active.filter((i) => cfg.networks.some((n) => matchesWildcard(i.ip!, n.ip, n.wildcard)))
  }
  if (proto === 'eigrp') {
    const cfg = dev.eigrp
    if (!cfg) return []
    return active.filter((i) =>
      cfg.networks.some((n) =>
        n.wildcard ? matchesWildcard(i.ip!, n.ip, n.wildcard) : classfulOf(i.ip!) === classfulOf(n.ip),
      ),
    )
  }
  const cfg = dev.rip
  if (!cfg) return []
  return active.filter((i) => cfg.networks.some((n) => classfulOf(i.ip!) === classfulOf(n)))
}

export function areaOf(dev: Device, i: Iface): number {
  const cfg = dev.ospf
  if (!cfg) return 0
  const m = cfg.networks.find((n) => matchesWildcard(i.ip!, n.ip, n.wildcard))
  return m?.area ?? 0
}

function passiveOn(dev: Device, proto: Proto, i: Iface): boolean {
  const cfg = proto === 'ospf' ? dev.ospf : proto === 'eigrp' ? dev.eigrp : dev.rip
  return !!cfg?.passive.some((p) => p.toLowerCase() === i.name.toLowerCase())
}

/** Highest loopback, else highest interface address — the real OSPF rule. */
export function routerIdOf(dev: Device): string {
  if (dev.ospf?.routerId) return dev.ospf.routerId
  const addrs = dev.activeIfaces().map((i) => i.ip!)
  const loops = dev.activeIfaces().filter((i) => i.name.toLowerCase().startsWith('lo'))
  const pool = loops.length ? loops.map((i) => i.ip!) : addrs
  return pool.sort((a, b) => ipToInt(b) - ipToInt(a))[0] ?? '0.0.0.0'
}

/* ───────────────────────── adjacency ───────────────────────── */

export interface Neighbor {
  /** the local device */
  from: string
  /** the neighbouring device */
  to: string
  /** local interface facing the neighbour */
  localIface: string
  /** neighbour's address on the shared segment */
  remoteIp: string
  cost: number
  bandwidth: number
  delay: number
  area?: number
}

export function neighborsOf(net: Network, dev: Device, proto: Proto): Neighbor[] {
  const out: Neighbor[] = []
  for (const i of enabledIfaces(dev, proto)) {
    if (passiveOn(dev, proto, i)) continue
    for (const ep of net.segmentOf(dev.id, i.name)) {
      const peer = net.get(ep.device)
      if (!peer || peer.id === dev.id) continue
      const peerIf = peer.iface(ep.iface)
      if (!peerIf?.ip) continue
      if (!enabledIfaces(peer, proto).some((x) => x.name === peerIf.name)) continue
      if (passiveOn(peer, proto, peerIf)) continue
      if (proto === 'ospf' && areaOf(dev, i) !== areaOf(peer, peerIf)) continue
      if (proto === 'eigrp' && dev.eigrp?.asn !== peer.eigrp?.asn) continue

      out.push({
        from: dev.id,
        to: peer.id,
        localIface: i.name,
        remoteIp: peerIf.ip,
        cost: ospfCost(i, dev.ospf?.referenceBandwidth ?? 100_000),
        bandwidth: Math.min(bandwidthOf(i), bandwidthOf(peerIf)),
        delay: delayOf(i),
        area: proto === 'ospf' ? areaOf(dev, i) : undefined,
      })
    }
  }
  return out
}

/* ───────────────────────── shortest paths ───────────────────────── */

interface PathInfo {
  cost: number
  minBandwidth: number
  totalDelay: number
  hops: number
  firstHopIp?: string
  firstIface?: string
}

/**
 * Dijkstra from `start` across every router speaking `proto`. OSPF compares
 * cost, EIGRP compares its composite metric, RIP compares hop count — but the
 * walk itself is the same.
 */
function shortestPaths(net: Network, start: Device, proto: Proto): Map<string, PathInfo> {
  const best = new Map<string, PathInfo>()
  best.set(start.id, { cost: 0, minBandwidth: Infinity, totalDelay: 0, hops: 0 })

  const weight = (p: PathInfo) =>
    proto === 'rip' ? p.hops : proto === 'eigrp' ? eigrpMetric(p.minBandwidth, p.totalDelay) : p.cost

  const visited = new Set<string>()
  while (true) {
    let cur: string | undefined
    let curBest = Infinity
    for (const [id, info] of best) {
      if (visited.has(id)) continue
      const w = weight(info)
      if (w < curBest) {
        curBest = w
        cur = id
      }
    }
    if (!cur) break
    visited.add(cur)

    const dev = net.get(cur)!
    const here = best.get(cur)!
    for (const nb of neighborsOf(net, dev, proto)) {
      const next: PathInfo = {
        cost: here.cost + nb.cost,
        minBandwidth: Math.min(here.minBandwidth, nb.bandwidth),
        totalDelay: here.totalDelay + nb.delay,
        hops: here.hops + 1,
        firstHopIp: cur === start.id ? nb.remoteIp : here.firstHopIp,
        firstIface: cur === start.id ? nb.localIface : here.firstIface,
      }
      if (proto === 'rip' && next.hops > 15) continue
      const old = best.get(nb.to)
      if (!old || weight(next) < weight(old)) best.set(nb.to, next)
    }
  }

  best.delete(start.id)
  return best
}

/* ───────────────────────── route generation ───────────────────────── */

export function dynamicRoutesFor(net: Network, dev: Device): RouteEntry[] {
  const out: RouteEntry[] = []
  const connected = new Set(
    dev.activeIfaces().map((i) => `${networkOf(i.ip!, i.mask!)}/${i.mask}`),
  )

  for (const proto of ['ospf', 'eigrp', 'rip'] as Proto[]) {
    const cfg = proto === 'ospf' ? dev.ospf : proto === 'eigrp' ? dev.eigrp : dev.rip
    if (!cfg) continue

    const paths = shortestPaths(net, dev, proto)
    for (const [peerId, info] of paths) {
      const peer = net.get(peerId)
      if (!peer) continue

      for (const i of enabledIfaces(peer, proto)) {
        const prefix = networkOf(i.ip!, i.mask!)
        const key = `${prefix}/${i.mask}`
        if (connected.has(key)) continue
        if (out.some((r) => r.prefix === prefix && r.mask === i.mask && r.source === CODE[proto])) {
          continue
        }

        let metric: number
        if (proto === 'rip') metric = info.hops
        else if (proto === 'eigrp') {
          metric = eigrpMetric(Math.min(info.minBandwidth, bandwidthOf(i)), info.totalDelay + delayOf(i))
        } else {
          metric = info.cost + ospfCost(i, dev.ospf?.referenceBandwidth ?? 100_000)
        }

        out.push({
          source: CODE[proto],
          prefix,
          mask: i.mask!,
          nextHop: info.firstHopIp,
          iface: info.firstIface,
          ad: AD[proto],
          metric,
        })
      }
    }
  }

  return out
}

/** For `show ip ospf neighbor` and friends. */
export interface NeighborView {
  id: string
  address: string
  iface: string
  state: string
  area?: number
}

export function neighborViews(net: Network, dev: Device, proto: Proto): NeighborView[] {
  return neighborsOf(net, dev, proto).map((nb) => {
    const peer = net.get(nb.to)!
    return {
      id: proto === 'ospf' ? routerIdOf(peer) : peer.name,
      address: nb.remoteIp,
      iface: nb.localIface,
      state: proto === 'ospf' ? 'FULL/DR' : 'UP',
      area: nb.area,
    }
  })
}
