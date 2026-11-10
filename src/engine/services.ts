import { broadcastOf, intToIp, ipToInt, networkOf, wildcardToMask } from './ip'
import type { Device, Network } from './network'

/* ───────────────────────── access control lists ───────────────────────── */

export type AclAction = 'permit' | 'deny'
export type AclProtocol = 'ip' | 'icmp' | 'tcp' | 'udp'

export interface AclEntry {
  seq: number
  action: AclAction
  protocol: AclProtocol
  src: string
  srcWildcard: string
  dst?: string
  dstWildcard?: string
}

export interface Acl {
  id: string
  /** 1-99 standard, 100-199 extended; named lists are always extended */
  extended: boolean
  entries: AclEntry[]
}

const ANY = { ip: '0.0.0.0', wildcard: '255.255.255.255' }

export function aclMatchesAddress(ip: string, ref: string, wildcard: string): boolean {
  if (ref === ANY.ip && wildcard === ANY.wildcard) return true
  const mask = wildcardToMask(wildcard)
  return networkOf(ip, mask) === networkOf(ref, mask)
}

/**
 * Walks the list top to bottom and stops at the first match, exactly like IOS.
 * Nothing matched means the invisible `deny ip any any` at the end wins.
 */
export function evaluateAcl(acl: Acl, srcIp: string, dstIp: string, protocol: AclProtocol = 'icmp'): AclAction {
  for (const e of acl.entries) {
    if (e.protocol !== 'ip' && e.protocol !== protocol) continue
    if (!aclMatchesAddress(srcIp, e.src, e.srcWildcard)) continue
    if (acl.extended && e.dst && !aclMatchesAddress(dstIp, e.dst, e.dstWildcard ?? ANY.wildcard)) continue
    return e.action
  }
  return 'deny'
}

export function parseAclTarget(tokens: string[]): { ip: string; wildcard: string; rest: string[] } | null {
  if (!tokens.length) return null
  const first = tokens[0].toLowerCase()
  if (first === 'any') return { ip: ANY.ip, wildcard: ANY.wildcard, rest: tokens.slice(1) }
  if (first === 'host') {
    if (!tokens[1]) return null
    return { ip: tokens[1], wildcard: '0.0.0.0', rest: tokens.slice(2) }
  }
  if (!tokens[1]) return null
  return { ip: tokens[0], wildcard: tokens[1], rest: tokens.slice(2) }
}

/* ───────────────────────── network address translation ───────────────────────── */

export interface NatConfig {
  /** interface names marked `ip nat inside` */
  inside: string[]
  /** interface names marked `ip nat outside` */
  outside: string[]
  /** addresses allowed to be translated, as an ACL id */
  aclId?: string
  pool?: { name: string; start: string; end: string; mask: string }
  /** PAT: hide everything behind one address */
  overload: boolean
  /** one-to-one mappings */
  statics: { inside: string; outside: string }[]
}

export interface NatBinding {
  insideLocal: string
  insideGlobal: string
  protocol: string
}

/** The public address an inside host should appear as, or null if not translated. */
export function translateSource(
  dev: Device,
  srcIp: string,
  outIface: string,
): string | null {
  const nat = dev.nat
  if (!nat) return null
  if (!nat.outside.some((n) => n.toLowerCase() === outIface.toLowerCase())) return null

  const fixed = nat.statics.find((s) => s.inside === srcIp)
  if (fixed) return fixed.outside

  if (nat.aclId) {
    const acl = dev.acls.get(nat.aclId)
    if (!acl) return null
    if (evaluateAcl(acl, srcIp, '0.0.0.0', 'ip') !== 'permit') return null
  }

  if (nat.pool) {
    const start = ipToInt(nat.pool.start)
    const end = ipToInt(nat.pool.end)
    if (nat.overload) return nat.pool.start
    const used = new Set([...dev.natTable.values()].map((b) => b.insideGlobal))
    for (let a = start; a <= end; a++) {
      const candidate = intToIp(a)
      if (!used.has(candidate)) return candidate
    }
    return null
  }

  if (nat.overload) {
    const i = dev.iface(outIface)
    return i?.ip ?? null
  }
  return null
}

/* ───────────────────────── first hop redundancy ───────────────────────── */

export interface HsrpConfig {
  group: number
  virtualIp: string
  priority: number
  preempt: boolean
}

/**
 * Among every router offering this virtual address on the segment, the one
 * with the highest priority is active; a tie is broken by the highest real
 * address, exactly as HSRP does it.
 */
export function hsrpActive(
  net: Network,
  candidates: { device: string; iface: string }[],
  virtualIp: string,
): Device | null {
  let best: { dev: Device; priority: number; ip: string } | null = null
  for (const ep of candidates) {
    const dev = net.get(ep.device)
    const i = dev?.iface(ep.iface)
    if (!dev || !i || i.shutdown || !i.hsrp || !i.ip) continue
    if (i.hsrp.virtualIp !== virtualIp) continue
    const score = { dev, priority: i.hsrp.priority, ip: i.ip }
    if (
      !best ||
      score.priority > best.priority ||
      (score.priority === best.priority && ipToInt(score.ip) > ipToInt(best.ip))
    ) {
      best = score
    }
  }
  return best?.dev ?? null
}

/* ───────────────────────── DHCP ───────────────────────── */

export interface DhcpPool {
  name: string
  network: string
  mask: string
  gateway?: string
  dns?: string
  excluded: string[]
}

export interface DhcpBinding {
  ip: string
  client: string
  pool: string
}

/**
 * Hands a client the next free address from a matching pool on the same
 * segment. Returns what the client should configure, or null if nothing
 * answered — which is exactly what a real failed DORA looks like.
 */
export function dhcpRequest(
  net: Network,
  client: Device,
  ifaceName: string,
): { ip: string; mask: string; gateway?: string; server: string } | null {
  for (const ep of net.segmentOf(client.id, ifaceName)) {
    const server = net.get(ep.device)
    if (!server?.dhcpPools.length) continue
    const serverIf = server.iface(ep.iface)
    if (!serverIf?.ip) continue

    for (const pool of server.dhcpPools) {
      if (networkOf(serverIf.ip, pool.mask) !== pool.network) continue

      const taken = new Set<string>([
        ...pool.excluded,
        ...[...server.dhcpBindings.values()].map((b) => b.ip),
        serverIf.ip,
      ])
      const first = ipToInt(pool.network) + 1
      const last = ipToInt(broadcastOf(pool.network, pool.mask)) - 1
      for (let a = first; a <= last; a++) {
        const candidate = intToIp(a)
        if (taken.has(candidate)) continue
        server.dhcpBindings.set(candidate, { ip: candidate, client: client.name, pool: pool.name })
        return {
          ip: candidate,
          mask: pool.mask,
          gateway: pool.gateway ?? serverIf.ip,
          server: server.name,
        }
      }
    }
  }
  return null
}
