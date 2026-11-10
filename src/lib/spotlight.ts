import type { NodeSpec, PacketSpec } from '../components/Topology'

/**
 * Pushes back the devices that have nothing to do with the current moment, so
 * the eye lands on the one that is acting. Only applies when something is
 * actually moving — with no packets in flight there is nothing to point at,
 * and dimming the whole drawing would just make it look broken.
 *
 * A lesson that already set `dim` keeps it; this only adds a softer `faded`.
 */
export function spotlight(nodes: NodeSpec[], packets: PacketSpec[] = []): NodeSpec[] {
  if (packets.length === 0) return nodes

  const live = new Set<string>()
  for (const p of packets) {
    live.add(p.from)
    live.add(p.to)
  }
  for (const n of nodes) if (n.pulse) live.add(n.id)

  if (live.size === 0 || live.size === nodes.length) return nodes
  return nodes.map((n) => (live.has(n.id) || n.dim ? n : { ...n, faded: true }))
}
