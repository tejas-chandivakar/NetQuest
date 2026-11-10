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
  width?: number
  height?: number
  className?: string
  style?: CSSProperties
  grid?: boolean
}

const SIZE: Record<DeviceType, { w: number; h: number }> = {
  pc: { w: 74, h: 56 },
  laptop: { w: 78, h: 52 },
  switch: { w: 96, h: 42 },
  router: { w: 76, h: 56 },
  server: { w: 60, h: 74 },
  cloud: { w: 104, h: 60 },
  firewall: { w: 72, h: 56 },
  ap: { w: 64, h: 48 },
}

function DeviceShape({ node }: { node: NodeSpec }) {
  const { type } = node
  const accent = node.accent ?? 'var(--nq-accent)'
  const { w, h } = SIZE[type]
  const fill = 'var(--nq-panel-2)'
  const stroke = node.pulse ? accent : 'var(--nq-border-2)'

  const common = {
    fill,
    stroke,
    strokeWidth: node.pulse ? 2 : 1.5,
  }

  switch (type) {
    case 'cloud':
      return (
        <g>
          <ellipse cx={-26} cy={4} rx={24} ry={18} {...common} />
          <ellipse cx={4} cy={-6} rx={30} ry={24} {...common} />
          <ellipse cx={30} cy={6} rx={22} ry={17} {...common} />
          <rect x={-48} y={0} width={96} height={22} rx={11} {...common} />
        </g>
      )
    case 'server':
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={9} {...common} />
          {[0, 1, 2].map((i) => (
            <Fragment key={i}>
              <line
                x1={-w / 2 + 10}
                y1={-h / 2 + 16 + i * 18}
                x2={w / 2 - 20}
                y2={-h / 2 + 16 + i * 18}
                stroke="var(--nq-border-2)"
                strokeWidth={1.5}
              />
              <circle cx={w / 2 - 12} cy={-h / 2 + 16 + i * 18} r={2.6} fill={accent} />
            </Fragment>
          ))}
        </g>
      )
    case 'switch':
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} {...common} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={-w / 2 + 11 + i * 12.5}
              y={h / 2 - 13}
              width={8}
              height={7}
              rx={1.6}
              fill="var(--nq-border-2)"
            />
          ))}
          <path
            d={`M ${-14} ${-6} L ${6} ${-6} M ${0} ${-11} L ${7} ${-6} L ${0} ${-1}`}
            stroke={accent}
            strokeWidth={1.8}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )
    case 'router':
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} {...common} />
          <g stroke={accent} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M -18 -8 L 14 -8 M 8 -13 L 15 -8 L 8 -3" />
            <path d="M 18 8 L -14 8 M -8 3 L -15 8 L -8 13" />
          </g>
        </g>
      )
    case 'firewall':
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} {...common} />
          {[0, 1, 2].map((r) => (
            <line
              key={r}
              x1={-w / 2}
              y1={-h / 2 + 14 + r * 14}
              x2={w / 2}
              y2={-h / 2 + 14 + r * 14}
              stroke="var(--nq-border-2)"
              strokeWidth={1.4}
            />
          ))}
          <line x1={0} y1={-h / 2} x2={0} y2={-h / 2 + 14} stroke="var(--nq-border-2)" strokeWidth={1.4} />
          <line x1={-18} y1={-h / 2 + 14} x2={-18} y2={-h / 2 + 28} stroke="var(--nq-border-2)" strokeWidth={1.4} />
          <line x1={18} y1={-h / 2 + 14} x2={18} y2={-h / 2 + 28} stroke="var(--nq-border-2)" strokeWidth={1.4} />
        </g>
      )
    case 'ap':
      return (
        <g>
          <rect x={-w / 2} y={-6} width={w} height={18} rx={9} {...common} />
          <g stroke={accent} strokeWidth={1.8} fill="none" strokeLinecap="round">
            <path d="M -13 -12 A 18 18 0 0 1 13 -12" />
            <path d="M -7 -20 A 28 28 0 0 1 7 -20" />
          </g>
        </g>
      )
    case 'laptop':
      return (
        <g>
          <rect x={-30} y={-24} width={60} height={38} rx={5} {...common} />
          <rect x={-26} y={-20} width={52} height={30} rx={3} fill="var(--nq-bg-2)" stroke="none" />
          <rect x={-39} y={14} width={78} height={7} rx={3.5} {...common} />
          <circle cx={0} cy={-5} r={5} fill={accent} opacity={0.55} />
        </g>
      )
    default:
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h - 12} rx={6} {...common} />
          <rect x={-22} y={-h / 2} width={44} height={h - 12} rx={4} fill="var(--nq-bg-2)" stroke="none" />
          <rect x={-12} y={h / 2 - 14} width={24} height={6} rx={2} {...common} />
          <rect x={-24} y={h / 2 - 8} width={48} height={6} rx={3} {...common} />
        </g>
      )
  }
}

export default function Topology({
  nodes,
  links = [],
  packets = [],
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
      style={{ width: '100%', height: 'auto', display: 'block', ...style }}
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
          <g key={n.id} transform={`translate(${n.x},${n.y})`} opacity={n.dim ? 0.32 : 1}>
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
    </svg>
  )
}
