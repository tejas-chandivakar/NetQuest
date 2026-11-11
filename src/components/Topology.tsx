import { Fragment, type CSSProperties } from 'react'

export type DeviceType = 'pc' | 'laptop' | 'switch' | 'router' | 'server' | 'cloud' | 'firewall' | 'ap'

export interface NodeSpec {
  id: string
  x: number
  y: number
  type: DeviceType
  label: string
  sub?: string
  /** dim the node until it becomes relevant */
  dim?: boolean
  /** draw an attention ring */
  pulse?: boolean
  /** softly pushed back because another node is the subject of this step */
  faded?: boolean
  accent?: string
}

/** A short line of speech anchored above a device. */
export interface CalloutSpec {
  nodeId: string
  text: string
  accent?: string
}

export interface LinkSpec {
  id: string
  from: string
  to: string
  label?: string
  state?: 'up' | 'down' | 'idle'
  /** animated dashes along the link */
  flowing?: boolean
}

export interface PacketSpec {
  id: string
  from: string
  to: string
  /** 0 = at `from`, 1 = at `to` */
  t: number
  color?: string
  label?: string
}

interface Props {
  nodes: NodeSpec[]
  links?: LinkSpec[]
  packets?: PacketSpec[]
  callouts?: CalloutSpec[]
  width?: number
  height?: number
  className?: string
  style?: CSSProperties
  grid?: boolean
}

const SIZE: Record<DeviceType, { w: number; h: number }> = {
  pc: { w: 74, h: 56 },
  laptop: { w: 78, h: 52 },
  switch: { w: 96, h: 46 },
  router: { w: 80, h: 52 },
  server: { w: 60, h: 74 },
  cloud: { w: 104, h: 60 },
  firewall: { w: 76, h: 56 },
  ap: { w: 66, h: 48 },
}

/**
 * The classic Cisco icon language — a cylinder with four arrows for a router,
 * a flat box with crossed arrows for a switch, a brick wall for a firewall.
 *
 * These are the shapes the exams, Packet Tracer and every networking book use,
 * so what a learner recognises here is what they will meet everywhere else.
 */
function DeviceShape({ node }: { node: NodeSpec }) {
  const { type } = node
  const accent = node.accent ?? 'var(--nq-accent)'
  const { w, h } = SIZE[type]
  const face = 'var(--nq-panel-2)'
  const lid = 'var(--nq-panel)'
  const edge = node.pulse ? accent : 'var(--nq-border-2)'
  const sw = node.pulse ? 2 : 1.5

  const body = { fill: face, stroke: edge, strokeWidth: sw }
  const top = { fill: lid, stroke: edge, strokeWidth: sw }
  const arrow = {
    stroke: accent,
    strokeWidth: 2,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (type) {
    /* a drum lying down, with traffic entering and leaving on every side */
    case 'router': {
      const rx = w / 2
      const ry = 11
      const bh = h - ry * 2
      return (
        <g>
          <path
            d={`M ${-rx} ${-bh / 2} v ${bh} a ${rx} ${ry} 0 0 0 ${w} 0 v ${-bh}`}
            {...body}
          />
          <ellipse cx={0} cy={-bh / 2} rx={rx} ry={ry} {...top} />
          <g {...arrow}>
            <path d="M -22 -12 h 15 m -4.5 -4 l 4.5 4 l -4.5 4" />
            <path d="M 22 -4 h -15 m 4.5 -4 l -4.5 4 l 4.5 4" />
            <path d="M -9 -19 v 12 m -4 -8 l 4 -4 l 4 4" transform="translate(-6 0)" />
            <path d="M 9 -5 v -12 m -4 8 l 4 4 l 4 -4" transform="translate(6 0)" />
          </g>
        </g>
      )
    }

    /* a flat box whose top carries the two opposed arrows of a bridge */
    case 'switch': {
      const lift = 13
      const bh = h - lift
      return (
        <g>
          <path d={`M ${-w / 2} ${-bh / 2} h ${w} v ${bh} h ${-w} z`} {...body} />
          <path
            d={`M ${-w / 2} ${-bh / 2} l 12 ${-lift} h ${w - 24} l 12 ${lift} z`}
            {...top}
          />
          <g {...arrow} strokeWidth={1.8}>
            <path d="M -20 -16 h 16 m -4.5 -4 l 4.5 4 l -4.5 4" />
            <path d="M 20 -7 h -16 m 4.5 -4 l -4.5 4 l 4.5 4" />
          </g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={-w / 2 + 11 + i * 12.5}
              y={bh / 2 - 9}
              width={8}
              height={5.5}
              rx={1.4}
              fill="var(--nq-border-2)"
            />
          ))}
        </g>
      )
    }

    case 'firewall': {
      const rows = [-h / 2 + 14, -h / 2 + 28, -h / 2 + 42]
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={5} {...body} />
          {rows.map((y, r) => (
            <Fragment key={r}>
              <line x1={-w / 2} y1={y} x2={w / 2} y2={y} stroke={edge} strokeWidth={1.3} />
              {(r % 2 === 0 ? [-w / 4, w / 4] : [0, -w / 2 + 2, w / 2 - 2]).map((x, j) => (
                <line
                  key={j}
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={y - 14}
                  stroke={edge}
                  strokeWidth={1.3}
                />
              ))}
            </Fragment>
          ))}
          <line x1={0} y1={h / 2} x2={0} y2={rows[2]} stroke={edge} strokeWidth={1.3} />
        </g>
      )
    }

    case 'cloud':
      return (
        <g>
          <path
            d="M -30 14 a 17 17 0 0 1 2 -33 a 23 23 0 0 1 42 -6 a 18 18 0 0 1 20 20 a 15 15 0 0 1 -12 19 z"
            {...body}
          />
        </g>
      )

    case 'server':
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} {...body} />
          {[0, 1, 2, 3].map((i) => (
            <Fragment key={i}>
              <rect
                x={-w / 2 + 7}
                y={-h / 2 + 9 + i * 15}
                width={w - 24}
                height={9}
                rx={1.6}
                fill="var(--nq-bg-2)"
                stroke={edge}
                strokeWidth={1}
              />
              <circle cx={w / 2 - 9} cy={-h / 2 + 13.5 + i * 15} r={2.4} fill={accent} />
            </Fragment>
          ))}
        </g>
      )

    case 'ap':
      return (
        <g>
          <path d={`M ${-w / 2} 10 a ${w / 2} 16 0 0 1 ${w} 0 z`} {...body} />
          <rect x={-w / 2} y={8} width={w} height={5} rx={2.5} {...body} />
          <g {...arrow}>
            <path d="M -14 -6 A 20 20 0 0 1 14 -6" />
            <path d="M -8 -15 A 30 30 0 0 1 8 -15" />
          </g>
        </g>
      )

    case 'laptop':
      return (
        <g>
          <path d="M -29 12 l 5 -34 h 48 l 5 34 z" {...body} />
          <path d="M -23 8 l 4 -26 h 38 l 4 26 z" fill="var(--nq-bg-2)" stroke="none" />
          <path d="M -39 12 h 78 l 4 8 h -86 z" {...top} />
          <circle cx={0} cy={-5} r={4.5} fill={accent} opacity={0.5} />
        </g>
      )

    /* pc — a monitor on a stand */
    default:
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h - 16} rx={4} {...body} />
          <rect
            x={-w / 2 + 5}
            y={-h / 2 + 5}
            width={w - 10}
            height={h - 26}
            rx={2}
            fill="var(--nq-bg-2)"
            stroke="none"
          />
          <rect x={-9} y={h / 2 - 16} width={18} height={8} {...body} />
          <rect x={-22} y={h / 2 - 8} width={44} height={6} rx={3} {...top} />
        </g>
      )
  }
}

export default function Topology({
  nodes,
  links = [],
  packets = [],
  callouts = [],
  width = 860,
  height = 420,
  className = '',
  style,
  grid = true,
}: Props) {
  const byId = new Map(nodes.map((n) => [n.id, n]))

  const pointOn = (fromId: string, toId: string, t: number) => {
    const a = byId.get(fromId)
    const b = byId.get(toId)
    if (!a || !b) return null
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ width: '100%', height: 'auto', maxHeight: '100%', display: 'block', ...style }}
      role="img"
    >
      {grid && (
        <>
          <defs>
            <pattern id="nq-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path
                d="M 28 0 L 0 0 0 28"
                fill="none"
                stroke="var(--nq-border)"
                strokeWidth="1"
                opacity="0.35"
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#nq-grid)" />
        </>
      )}

      {/* links */}
      <g>
        {links.map((l) => {
          const a = byId.get(l.from)
          const b = byId.get(l.to)
          if (!a || !b) return null
          const down = l.state === 'down'
          const idle = l.state === 'idle'
          const colour = down ? 'var(--nq-err)' : idle ? 'var(--nq-border-2)' : 'var(--nq-ok)'
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2
          return (
            <g key={l.id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={colour}
                strokeWidth={down ? 2.5 : 3}
                strokeLinecap="round"
                opacity={idle ? 0.45 : 0.85}
                strokeDasharray={down ? '7 7' : undefined}
                className={l.flowing ? 'nq-flow' : undefined}
              />
              {l.label && (
                <>
                  <rect
                    x={mx - l.label.length * 3.4 - 7}
                    y={my - 19}
                    width={l.label.length * 6.8 + 14}
                    height={17}
                    rx={8}
                    fill="var(--nq-bg-2)"
                    stroke="var(--nq-border)"
                  />
                  <text
                    x={mx}
                    y={my - 7}
                    textAnchor="middle"
                    fontSize={10}
                    fill="var(--nq-text-dim)"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {l.label}
                  </text>
                </>
              )}
            </g>
          )
        })}
      </g>

      {/* nodes */}
      <g>
        {nodes.map((n) => (
          <g
            key={n.id}
            data-node-id={n.id}
            transform={`translate(${n.x},${n.y})`}
            opacity={n.dim ? 0.32 : n.faded ? 0.42 : 1}
            style={{ transition: 'opacity 260ms' }}
          >
            {n.pulse && (
              <circle
                r={46}
                fill="none"
                stroke={n.accent ?? 'var(--nq-accent)'}
                strokeWidth={2}
                className="nq-pulse"
              />
            )}
            <DeviceShape node={n} />
            <text
              y={SIZE[n.type].h / 2 + 20}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              fill="var(--nq-text)"
            >
              {n.label}
            </text>
            {n.sub && (
              <text
                y={SIZE[n.type].h / 2 + 36}
                textAnchor="middle"
                fontSize={11}
                fill="var(--nq-text-mute)"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {n.sub}
              </text>
            )}
          </g>
        ))}
      </g>

      {/* packets */}
      <g>
        {packets.map((p) => {
          const pt = pointOn(p.from, p.to, Math.max(0, Math.min(1, p.t)))
          if (!pt) return null
          const colour = p.color ?? 'var(--nq-pkt-data)'
          return (
            <g key={p.id} transform={`translate(${pt.x},${pt.y})`}>
              <circle r={15} fill={colour} opacity={0.2} />
              <rect x={-11} y={-9} width={22} height={18} rx={4} fill={colour} />
              <path d="M -11 -9 L 0 0 L 11 -9" fill="none" stroke="var(--nq-bg)" strokeWidth={1.6} />
              {p.label && (
                <text
                  y={-19}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill={colour}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {p.label}
                </text>
              )}
            </g>
          )
        })}
      </g>

      {/* callouts — the drawing explaining itself, so the eye never has to leave it */}
      <g>
        {callouts.map((c) => {
          const n = byId.get(c.nodeId)
          if (!n) return null
          const accent = c.accent ?? n.accent ?? 'var(--nq-accent)'
          const w = Math.min(230, c.text.length * 6.6 + 24)
          const top = n.y - SIZE[n.type].h / 2 - 54
          return (
            <g key={c.nodeId} transform={`translate(${n.x},${top})`}>
              <rect
                x={-w / 2}
                y={-16}
                width={w}
                height={32}
                rx={10}
                fill="var(--nq-panel)"
                stroke={accent}
                strokeWidth={1.4}
              />
              <path d={`M -7 16 L 0 26 L 7 16 Z`} fill="var(--nq-panel)" stroke={accent} strokeWidth={1.4} />
              <path d={`M -6 16 L 6 16`} stroke="var(--nq-panel)" strokeWidth={2.4} />
              <text
                y={4}
                textAnchor="middle"
                fontSize={11.5}
                fontWeight={600}
                fill="var(--nq-text)"
              >
                {c.text}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}
