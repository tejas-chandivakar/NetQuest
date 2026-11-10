/** IPv4 helpers. Everything works on unsigned 32-bit numbers. */

export const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

export function isIp(s: string): boolean {
  const m = IPV4_RE.exec(s.trim())
  if (!m) return false
  return m.slice(1).every((o) => {
    const n = Number(o)
    return n >= 0 && n <= 255 && String(n) === String(Number(o))
  })
}

export function ipToInt(ip: string): number {
  const m = IPV4_RE.exec(ip.trim())
  if (!m) return 0
  return (
    ((Number(m[1]) << 24) >>> 0) + (Number(m[2]) << 16) + (Number(m[3]) << 8) + Number(m[4])
  ) >>> 0
}

export function intToIp(n: number): string {
  const v = n >>> 0
  return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255].join('.')
}

/** 255.255.255.0 -> 24. Returns -1 for a non-contiguous mask. */
export function maskToPrefix(mask: string): number {
  const n = ipToInt(mask)
  let bits = 0
  let seenZero = false
  for (let i = 31; i >= 0; i--) {
    const bit = (n >>> i) & 1
    if (bit === 1) {
      if (seenZero) return -1
      bits++
    } else {
      seenZero = true
    }
  }
  return bits
}

export function prefixToMask(prefix: number): string {
  if (prefix <= 0) return '0.0.0.0'
  if (prefix >= 32) return '255.255.255.255'
  return intToIp(((0xffffffff << (32 - prefix)) >>> 0) >>> 0)
}

export function isValidMask(mask: string): boolean {
  return isIp(mask) && maskToPrefix(mask) >= 0
}

/** 0.0.0.255 style wildcard -> 255.255.255.0 style mask */
export function wildcardToMask(wc: string): string {
  return intToIp((~ipToInt(wc)) >>> 0)
}

export function networkOf(ip: string, mask: string): string {
  return intToIp((ipToInt(ip) & ipToInt(mask)) >>> 0)
}

export function broadcastOf(ip: string, mask: string): string {
  return intToIp((ipToInt(ip) | (~ipToInt(mask) >>> 0)) >>> 0)
}

export function sameNetwork(a: string, b: string, mask: string): boolean {
  return networkOf(a, mask) === networkOf(b, mask)
}

export function inNetwork(ip: string, prefix: string, mask: string): boolean {
  return networkOf(ip, mask) === networkOf(prefix, mask)
}

export function usableHosts(prefix: number): number {
  if (prefix >= 31) return 0
  return Math.pow(2, 32 - prefix) - 2
}

/** Pretty 10.0.0.0/24 */
export function cidr(ip: string, mask: string): string {
  return `${ip}/${maskToPrefix(mask)}`
}

/** A host address is not usable if it is the network or the broadcast address. */
export function isHostAddress(ip: string, mask: string): boolean {
  const p = maskToPrefix(mask)
  if (p >= 31) return true
  return ip !== networkOf(ip, mask) && ip !== broadcastOf(ip, mask)
}

/** Deterministic, readable fake MAC derived from a device + interface name. */
export function fakeMac(seed: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  const b = [
    0x00,
    0x1a,
    (h >>> 24) & 255,
    (h >>> 16) & 255,
    (h >>> 8) & 255,
    h & 255,
  ]
  const hex = b.map((x) => x.toString(16).padStart(2, '0'))
  return `${hex[0]}${hex[1]}.${hex[2]}${hex[3]}.${hex[4]}${hex[5]}`
}
