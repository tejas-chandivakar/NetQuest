import type { Network } from '../engine/network'

/**
 * Run something without letting it teach the network anything.
 *
 * A stage pings on every render to work out whether it is healthy, or whether
 * a goal is met — and a ping makes devices learn. Without this the ARP and MAC
 * tables are full before the learner has pressed a thing, and the one moment
 * those tables exist to show never happens on screen.
 */
export function quietly<T>(net: Network, fn: () => T): T {
  const saved = [...net.devices.values()].map(
    (d) => [d, new Map(d.arp), new Map(d.macTable)] as const,
  )
  try {
    return fn()
  } finally {
    for (const [d, arp, mac] of saved) {
      d.arp = arp
      d.macTable = mac
    }
  }
}
