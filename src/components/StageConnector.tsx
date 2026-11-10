import { useEffect, useRef, useState } from 'react'

/**
 * Draws a brief glowing line from a device in the drawing to the panel that
 * just changed because of it, so cause and effect are visibly joined instead
 * of happening in two places the eye cannot watch at once.
 *
 * Geometry is measured, not assumed: the device is found by its data-node-id
 * inside the drawing, and both ends are expressed relative to the container.
 */
export default function StageConnector({
  containerRef,
  stageRef,
  targetRef,
  nodeId,
  nonce,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  stageRef: React.RefObject<HTMLDivElement | null>
  targetRef: React.RefObject<HTMLDivElement | null>
  nodeId: string | undefined
  /** bump to fire the line again for the same node */
  nonce: number
}) {
  const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!nodeId || nonce === 0) return
    const box = containerRef.current?.getBoundingClientRect()
    const stage = stageRef.current
    const target = targetRef.current
    if (!box || !stage || !target) return

    const el = stage.querySelector<SVGGElement>(`[data-node-id="${CSS.escape(nodeId)}"]`)
    if (!el) return
    const a = el.getBoundingClientRect()
    const b = target.getBoundingClientRect()

    // leave from the device's right edge, arrive at the panel's left edge
    setLine({
      x1: a.right - box.left,
      y1: a.top + a.height / 2 - box.top,
      x2: b.left - box.left,
      y2: b.top - box.top + Math.min(44, b.height / 2),
    })

    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setLine(null), 1300)
    return () => window.clearTimeout(timer.current)
  }, [nodeId, nonce, containerRef, stageRef, targetRef])

  if (!line) return null

  const { x1, y1, x2, y2 } = line
  const mid = (x1 + x2) / 2
  const d = `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full lg:block"
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke="var(--nq-accent)"
        strokeWidth={2}
        strokeDasharray="7 6"
        opacity={0.85}
        className="nq-flow"
      />
      <circle cx={x1} cy={y1} r={5} fill="var(--nq-accent)" />
      <circle cx={x2} cy={y2} r={5} fill="var(--nq-accent)" />
      <circle cx={x1} cy={y1} r={13} fill="none" stroke="var(--nq-accent)" strokeWidth={1.5} className="nq-pulse" />
    </svg>
  )
}
