import { networkOf } from './ip'
import type { Device, Network, RouteEntry } from './network'

export interface BgpNeighbor {
  ip: string
  remoteAs: number
  /** outbound local-preference applied to what this peer sends us */
  localPref?: number
  /** repeat our own AS this many extra times when advertising */
  prepend?: number
  routeReflectorClient?: boolean
}

export interface BgpConfig {
  asn: number
  routerId?: string
  neighbors: BgpNeighbor[]
  networks: { ip: string; mask: string }[]
}

export interface BgpPath {
  prefix: string
  mask: string
  asPath: number[]
  nextHop: string
  localPref: number
  med: number
  /** learned from a peer in our own AS */
  internal: boolean
  /** the device we heard it from */
  fromDevice?: string
  originRouterId: string
}

export const EBGP_AD = 20
export const IBGP_AD = 200

/** Two routers peer when each names the other's address with the right AS. */
export function bgpSessions(net: Network, dev: Device): { peer: Device; neighbor: BgpNeighbor }[] {
  const cfg = dev.bgp
  if (!cfg) return []
  const out: { peer: Device; neighbor: BgpNeighbor }[] = []

  for (const nb of cfg.neighbors) {
    for (const other of net.devices.values()) {
      if (other.id === dev.id || !other.bgp) continue
      if (!other.ownsIp(nb.ip)) continue
      if (other.bgp.asn !== nb.remoteAs) continue
      // the far end must point back at one of our addresses
      const back = other.bgp.neighbors.find(
        (x) => dev.ownsIp(x.ip) && x.remoteAs === cfg.asn,
      )
      if (!back) continue
      // the peer address has to be reachable at all
      if (!dev.lookup(nb.ip)) continue
      out.push({ peer: other, neighbor: nb })
    }
  }
  return out
}

export function bgpRouterId(dev: Device): string {
  if (dev.bgp?.routerId) return dev.bgp.routerId
  const ips = dev.activeIfaces().map((i) => i.ip!)
  return ips.sort().at(-1) ?? '0.0.0.0'
}

/** Lower is better: the first tie-break that differs decides. */
export function comparePaths(a: BgpPath, b: BgpPath): number {
  if (a.localPref !== b.localPref) return b.localPref - a.localPref
  if (a.asPath.length !== b.asPath.length) return a.asPath.length - b.asPath.length
  if (a.med !== b.med) return a.med - b.med
  if (a.internal !== b.internal) return a.internal ? 1 : -1
  return a.originRouterId.localeCompare(b.originRouterId)
}

/**
 * Floods every advertised prefix across the BGP sessions until nothing
 * changes, honouring AS-path loop prevention and the iBGP rule that a route
 * learned from one iBGP peer is never passed to another.
 */
export function computeBgp(net: Network): Map<string, BgpPath[]> {
  const table = new Map<string, BgpPath[]>()
  const speakers = [...net.devices.values()].filter((d) => d.bgp)

  for (const dev of speakers) {
    const own: BgpPath[] = []
    for (const nwk of dev.bgp!.networks) {
      const prefix = networkOf(nwk.ip, nwk.mask)
      const local = dev
        .routingTable()
        .find((r) => r.prefix === prefix && r.mask === nwk.mask && r.source !== 'L')
      if (!local) continue
      own.push({
        prefix,
        mask: nwk.mask,
        asPath: [],
        nextHop: '0.0.0.0',
        localPref: 100,
        med: 0,
        internal: false,
        originRouterId: bgpRouterId(dev),
      })
    }
    table.set(dev.id, own)
  }

  for (let round = 0; round < speakers.length + 2; round++) {
    let changed = false

    for (const dev of speakers) {
      for (const { peer, neighbor } of bgpSessions(net, dev)) {
        const ebgp = neighbor.remoteAs !== dev.bgp!.asn
        const advertising = table.get(dev.id) ?? []

        for (const path of advertising) {
          // iBGP split horizon: never pass an internal route to another internal peer
          if (!ebgp && path.internal) continue

          const prepends = ebgp ? [dev.bgp!.asn, ...Array(neighbor.prepend ?? 0).fill(dev.bgp!.asn)] : []
          const asPath = ebgp ? [...prepends, ...path.asPath] : [...path.asPath]
          if (asPath.includes(peer.bgp!.asn)) continue // loop prevention

          const peerBack = peer.bgp!.neighbors.find((x) => dev.ownsIp(x.ip))
          const nextHop = ebgp
            ? peerBack?.ip ?? path.nextHop
            : path.nextHop === '0.0.0.0'
              ? (peerBack?.ip ?? '0.0.0.0')
              : path.nextHop

          const incoming: BgpPath = {
            prefix: path.prefix,
            mask: path.mask,
            asPath,
            nextHop,
            localPref: peerBack?.localPref ?? (ebgp ? 100 : path.localPref),
            med: path.med,
            internal: !ebgp,
            fromDevice: dev.id,
            originRouterId: path.originRouterId,
          }

          const peerTable = table.get(peer.id) ?? []
          const existing = peerTable.find(
            (p) =>
              p.prefix === incoming.prefix &&
              p.mask === incoming.mask &&
              p.asPath.join() === incoming.asPath.join() &&
              p.nextHop === incoming.nextHop,
          )
          if (existing) continue

          peerTable.push(incoming)
          table.set(peer.id, peerTable)
          changed = true
        }
      }
    }
    if (!changed) break
  }

  return table
}

/** The winning path per prefix, turned into routing-table entries. */
export function bgpRoutesFor(net: Network, dev: Device): RouteEntry[] {
  if (!dev.bgp) return []
  const all = computeBgp(net).get(dev.id) ?? []
  const byPrefix = new Map<string, BgpPath[]>()
  for (const p of all) {
    const key = `${p.prefix}/${p.mask}`
    byPrefix.set(key, [...(byPrefix.get(key) ?? []), p])
  }

  const out: RouteEntry[] = []
  for (const paths of byPrefix.values()) {
    const best = [...paths].sort(comparePaths)[0]
    if (!best || best.nextHop === '0.0.0.0') continue
    if (dev.activeIfaces().some((i) => networkOf(i.ip!, i.mask!) === best.prefix)) continue
    out.push({
      source: 'B',
      prefix: best.prefix,
      mask: best.mask,
      nextHop: best.nextHop,
      ad: best.internal ? IBGP_AD : EBGP_AD,
      metric: best.asPath.length,
    })
  }
  return out
}
