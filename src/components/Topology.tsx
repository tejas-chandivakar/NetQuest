import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from 'react'

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
  /** Build mode. A ring around the device being worked on. */
  selected?: string
  onNodeClick?: (id: string) => void
  onNodePointerDown?: (id: string, e: ReactPointerEvent) => void
  onLinkClick?: (id: string) => void
  /** so an editor can turn pointer coordinates into viewBox coordinates */
  svgRef?: Ref<SVGSVGElement>
}

/** What each icon actually measures once SCALE is applied — measured, not guessed. */
const SIZE: Record<DeviceType, { w: number; h: number }> = {
  // the SIZE-driven four: this is both what they measure and what they draw
  switch: { w: 89, h: 43 },
  router: { w: 77, h: 50 },
  server: { w: 56, h: 69 },
  firewall: { w: 72, h: 53 },
  // the fixed-geometry four: this is their drawn size times SCALE
  pc: { w: 87, h: 44 },
  laptop: { w: 86, h: 44 },
  cloud: { w: 76, h: 50 },
  ap: { w: 77, h: 50 },
}

/**
 * The classic Cisco icon language — a cylinder with four arrows for a router,
 * a flat box with crossed arrows for a switch, a brick wall for a firewall.
 *
 * These are the shapes the exams, Packet Tracer and every networking book use,
 * so what a learner recognises here is what they will meet everywhere else.
 */
/**
 * Optical balance. Each shape is drawn at whatever size its own geometry
 * wants, and left alone they do not sit together: the AP measured a third of
 * the router, the server stood a head taller than everything, the switch ran
 * widest of all. These factors bring every icon to roughly the same drawn
 * area (~3,800 square units) so a row of devices reads as one family. SIZE
 * below states the result, because links and packet insets read from it.
 */
const SCALE: Record<DeviceType, number> = {
  // these four draw themselves from SIZE, so their target goes in SIZE and
  // scaling them again would only shrink what SIZE just set
  switch: 1,
  router: 1,
  server: 1,
  firewall: 1,
  // these four are drawn at fixed coordinates, so they take a factor
  pc: 1.04,
  laptop: 1.1,
  cloud: 0.99,
  ap: 1.13,
}

const DEVICE_COLOUR: Record<DeviceType, string> = {
  pc: 'var(--nq-dev-host)',
  laptop: 'var(--nq-dev-host)',
  switch: 'var(--nq-dev-switch)',
  router: 'var(--nq-dev-router)',
  server: 'var(--nq-dev-server)',
  cloud: 'var(--nq-dev-cloud)',
  firewall: 'var(--nq-dev-fw)',
  ap: 'var(--nq-dev-ap)',
}

/**
 * The classic Cisco icon language, filled rather than outlined: the router is
 * a drum with four arrows, the switch a flat box with two opposed arrows, the
 * firewall a brick wall. These are the shapes the exams, Packet Tracer and
 * every networking book use, so what a learner recognises here is what they
 * will meet everywhere else — and the colour says which kind of box it is
 * before the shape has been read.
 */
function DeviceShape({ node }: { node: NodeSpec }) {
  const { type } = node
  const body = DEVICE_COLOUR[type]
  const { w, h } = SIZE[type]
  const cut = 'var(--nq-dev-top)'

  /* the lid catches the light, so it is the body lightened against paper */
  const lid = `color-mix(in srgb, ${body} 72%, white)`
  const detail = { stroke: cut, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (type) {
    case 'router': {
      /*
       * The Cisco drum. Its four arrows are the whole signature — traffic
       * arriving and leaving in both directions — so they have to sit ON the
       * elliptical lid, not spill onto the body below it, and they have to be
       * far enough apart that the arrowheads do not touch. Both of which the
       * first version of this got wrong at the sizes we actually draw.
       *
       * Lid: 80 x 26 centred on cy. Every coordinate below is checked against
       * the ellipse, |y - cy| <= ry * sqrt(1 - (x/rx)^2).
       */
      const rx = w / 2
      const ry = 13
      const bh = h - ry * 2
      const cy = -bh / 2
      return (
        <g>
          <path d={`M ${-rx} ${cy} v ${bh} a ${rx} ${ry} 0 0 0 ${w} 0 v ${-bh}`} fill={body} />
          <ellipse cx={0} cy={cy} rx={rx} ry={ry} fill={lid} />
          {/* Trimmed about a sixth from every arrow and thinned the stroke:
              at the sizes these are drawn the old ones read as the loudest
              thing on the page, louder than the device they sit on. */}
          <g {...detail} strokeWidth={1.7}>
            {/* the two that cross: out to the left, in from the right */}
            <path d={`M 4 ${cy - 4.5} H -13 m 4.2 -3.8 l -4.2 3.8 l 4.2 3.8`} />
            <path d={`M -4 ${cy + 4.5} H 13 m -4.2 -3.8 l 4.2 3.8 l -4.2 3.8`} />
            {/* and the two on the shoulders, clear of the arrowheads above */}
            <path d={`M -23 ${cy + 4.5} V ${cy - 4.5} m -3.8 4.2 l 3.8 -4.2 l 3.8 4.2`} />
            <path d={`M 23 ${cy - 4.5} V ${cy + 4.5} m -3.8 -4.2 l 3.8 4.2 l 3.8 -4.2`} />
          </g>
        </g>
      )
    }

    case 'switch': {
      /*
       * Two opposed arrows on the sloped top, the switch's counterpart to the
       * router's four. The lid was 13 tall, which is not enough for two
       * stacked arrowheads — they overlapped and the lower one hung off the
       * front face. A taller slope gives them room to read as two.
       */
      const lift = 18
      const bh = h - lift
      /*
       * The sloped lid grows upward from the body, so the body has to start
       * `lift / 2` lower than centre or the whole icon rides above its own
       * box — which it did, by 9px, pulling every link that attaches to it
       * off the shape. Top of the lid is now exactly -h/2, bottom of the body
       * exactly +h/2.
       */
      const top = -bh / 2 + lift / 2
      const cy = top - lift / 2
      return (
        <g>
          <path d={`M ${-w / 2} ${top} h ${w} v ${bh} h ${-w} z`} fill={body} />
          <path d={`M ${-w / 2} ${top} l 12 ${-lift} h ${w - 24} l 12 ${lift} z`} fill={lid} />
          <g {...detail} strokeWidth={1.7}>
            <path d={`M 4 ${cy - 4} H -15 m 4.2 -3.4 l -4.2 3.4 l 4.2 3.4`} />
            <path d={`M -4 ${cy + 4} H 15 m -4.2 -3.4 l 4.2 3.4 l -4.2 3.4`} />
          </g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={-w / 2 + 11 + i * 12.5}
              y={top + bh - 9}
              width={8}
              height={5.5}
              rx={1.4}
              fill={cut}
              opacity={0.85}
            />
          ))}
        </g>
      )
    }

    case 'firewall': {
      const rows = [-h / 2 + 14, -h / 2 + 28, -h / 2 + 42]
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={5} fill={body} />
          <g stroke={cut} strokeWidth={1.8} opacity={0.9}>
            {rows.map((y, r) => (
              <Fragment key={r}>
                <line x1={-w / 2} y1={y} x2={w / 2} y2={y} />
                {(r % 2 === 0 ? [-w / 4, w / 4] : [0, -w / 2 + 2, w / 2 - 2]).map((x, j) => (
                  <line key={j} x1={x} y1={y} x2={x} y2={y - 14} />
                ))}
              </Fragment>
            ))}
            <line x1={0} y1={h / 2} x2={0} y2={rows[2]} />
          </g>
        </g>
      )
    }

    case 'cloud':
      /*
       * The drawn path measures 77 x 50 and started at x -42, y -36, so it
       * hung up and to the left of the 104 x 60 box the layout believed in.
       * Links aim at the box, so they stopped short of the shape. Nudged to
       * centre; SIZE.cloud now states what is actually drawn.
       */
      return (
        <g transform="translate(3.5, 11)">
          <path
            d="M -30 14 a 17 17 0 0 1 2 -33 a 23 23 0 0 1 42 -6 a 18 18 0 0 1 20 20 a 15 15 0 0 1 -12 19 z"
            fill={body}
          />
        </g>
      )

    case 'server':
      return (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill={body} />
          {[0, 1, 2, 3].map((i) => (
            <Fragment key={i}>
              <rect
                x={-w / 2 + 7}
                y={-h / 2 + 9 + i * 15}
                width={w - 24}
                height={9}
                rx={1.6}
                fill={cut}
                opacity={0.9}
              />
              <circle cx={w / 2 - 9} cy={-h / 2 + 13.5 + i * 15} r={2.4} fill={cut} />
            </Fragment>
          ))}
        </g>
      )

    case 'ap':
      /*
       * Redrawn rather than scaled. It measured 66x29 — barely a third of the
       * router's weight — because the dome was shallow and the two arcs sat
       * close in. A taller dome, a deeper base and three waves reaching
       * further up give it a presence that matches the rest, which no amount
       * of scaling a squat shape could.
       */
      return (
        <g>
          {/* Sat 5 units high on its own node, because the waves reach up
              while the dome stays low; everything moved down to match. */}
          <path d="M -34 17 a 34 21 0 0 1 68 0 z" fill={body} />
          <rect x={-34} y={15} width={68} height={6} rx={3} fill={lid} />
          <g stroke={body} strokeWidth={2.6} fill="none" strokeLinecap="round">
            <path d="M -17 -6 A 23 23 0 0 1 17 -6" />
            <path d="M -11 -14 A 25 25 0 0 1 11 -14" />
            <path d="M -5 -21 A 20 20 0 0 1 5 -21" />
          </g>
        </g>
      )

    case 'laptop': {
      /*
       * The client machine, and the icon a learner meets most often — it
       * stands for every person in every diagram. The old one was a bare
       * trapezoid whose base measured 86 across a box 78 wide, so it spilled
       * sideways and read as a blank slab.
       *
       * This one has something on the screen: a window bar with its three
       * dots, a panel and three lines of content. That is the whole point of
       * the shape here — it has to say "somebody is using this", because the
       * lessons lean on the difference between a client and a server. The
       * detail is deliberately chunky; at 78px wide, hairlines turn to mush.
       */
      const op = (o: number) => ({ fill: body, opacity: o })
      return (
        <g>
          {/* lid, with the camera above the display */}
          <rect x={-30} y={-21} width={60} height={32} rx={3.5} fill={body} />
          <circle cx={0} cy={-18.8} r={0.95} fill={lid} />
          <rect x={-26} y={-17} width={52} height={24.5} rx={1.6} fill={cut} />

          {/* a window, open on the screen */}
          <rect x={-26} y={-17} width={52} height={6} rx={1.6} fill={lid} opacity={0.75} />
          {[-22.6, -19.1, -15.6].map((cx) => (
            <circle key={cx} cx={cx} cy={-14} r={1.2} fill={cut} />
          ))}
          <rect x={-22.5} y={-8.4} width={13.5} height={12} rx={1.8} {...op(0.2)} />
          <rect x={-6} y={-8} width={25} height={3} rx={1.5} {...op(0.33)} />
          <rect x={-6} y={-3.2} width={18} height={3} rx={1.5} {...op(0.33)} />
          <rect x={-6} y={1.6} width={22} height={3} rx={1.5} {...op(0.33)} />
          <rect x={-22.5} y={5} width={37} height={2.4} rx={1.2} {...op(0.24)} />

          {/* the deck, its hinge, and the lip you open it by */}
          <path d="M -35 11 H 35 L 39 19 H -39 Z" fill={lid} />
          <rect x={-30} y={11} width={60} height={1.5} {...op(0.16)} />
          <path d="M -8 19 h 16 l -2.2 -3 h -11.6 z" {...op(0.32)} />
        </g>
      )
    }

    /* pc — a monitor and its tower, standing on one baseline */
    default: {
      /*
       * A desktop, not just a screen: the tower beside it is what separates
       * this from the laptop at a glance, and the screen carries a sidebar
       * and lines rather than the laptop's window, for the same reason.
       *
       * Monitor foot and tower both end at y 21, so the pair sits on a
       * shared baseline instead of floating at different heights.
       */
      const op = (o: number) => ({ fill: body, opacity: o })
      return (
        <g>
          {/* the monitor */}
          <rect x={-42} y={-21} width={56} height={32} rx={3.5} fill={body} />
          <rect x={-38.5} y={-17.5} width={49} height={25} rx={1.5} fill={cut} />
          <rect x={-35} y={-14.5} width={9} height={18.5} rx={1.5} {...op(0.22)} />
          <rect x={-23} y={-14} width={22} height={3} rx={1.5} {...op(0.3)} />
          <rect x={-23} y={-8.5} width={15} height={3} rx={1.5} {...op(0.3)} />
          <rect x={-23} y={-3} width={19} height={3} rx={1.5} {...op(0.3)} />
          <rect x={-18} y={11} width={8} height={6} fill={body} />
          <rect x={-30} y={17} width={32} height={4} rx={2} fill={body} />

          {/* the tower */}
          <rect x={20} y={-14} width={22} height={35} rx={2.5} fill={body} />
          <rect x={23.5} y={-10} width={15} height={3.5} rx={1} fill={lid} />
          <rect x={23.5} y={-4.5} width={15} height={2.8} rx={1} fill={lid} opacity={0.55} />
          <circle cx={31} cy={2.5} r={2.1} fill={lid} />
          {[8, 11.6, 15.2].map((y) => (
            <rect key={y} x={25} y={y} width={12} height={1.9} rx={0.95} fill={lid} opacity={0.45} />
          ))}
        </g>
      )
    }
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
  selected,
  onNodeClick,
  onNodePointerDown,
  onLinkClick,
  svgRef,
}: Props) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const handy = !!(onNodeClick || onNodePointerDown)

  /*
    Fitting the drawing to a narrow screen.

    A lesson lays its devices out on an 880×420 stage, which is the shape of a
    desktop panel. A phone gives the same drawing about 325px of width, so
    everything renders at roughly a third size and a device label lands at
    four or five pixels — there, but unreadable.

    Most layouts do not use the whole stage: b2l1 keeps every device inside
    x 120–480, y 95–310. So on a narrow screen the viewBox is pulled in to
    what is actually drawn, which zooms the picture without moving a single
    device. Text gets a further nudge for whatever shrink is left. Wide
    screens keep the declared box exactly as it was.
  */
  const hostRef = useRef<SVGSVGElement | null>(null)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const el = hostRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setShown(e.contentRect.width))
    ro.observe(el)
    setShown(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const fitted = useMemo(() => {
    const full = { x: 0, y: 0, w: width, h: height }
    // below this the picture is simply too small to read unaided
    if (!shown || shown >= 560 || !nodes.length) return full

    let x0 = Infinity
    let y0 = Infinity
    let x1 = -Infinity
    let y1 = -Infinity
    for (const n of nodes) {
      const s = SIZE[n.type]
      // text labels can be wider than the icon — estimate their reach
      const nameW = n.label.length * 3.8
      const subW = n.sub?.length ? n.sub.length * 3.2 : 0
      const halfW = Math.max(s.w / 2, nameW, subW)
      x0 = Math.min(x0, n.x - halfW)
      x1 = Math.max(x1, n.x + halfW)
      y0 = Math.min(y0, n.y - s.h / 2)
      y1 = Math.max(y1, n.y + s.h / 2 + (n.sub ? 44 : 28))
    }
    if (!Number.isFinite(x0)) return full

    const pad = 36
    x0 -= pad
    y0 -= pad
    x1 += pad
    y1 += pad

    /*
      Holding the declared 2.1:1 shape here would throw most of the gain away:
      b2l1's devices occupy 500×355, and stretching that back to 2.1:1 pads it
      out to 744 wide of mostly nothing. A phone's panel is free to be taller,
      so the crop takes the drawing's own shape — clamped so it can neither
      become a narrow column nor end up wider than the stage it came from.
    */
    const aspect = width / height
    let w = Math.max(x1 - x0, 1)
    let h = Math.max(y1 - y0, 1)
    const want = Math.min(Math.max(w / h, 0.9), aspect)
    if (w / h < want) w = h * want
    else h = w / want

    /*
      A floor on the zoom. A lesson that draws one device occupies barely a
      tenth of the stage, and cropping to it blew a single PC up to fill the
      whole panel. Half the stage is as close as the crop ever gets.
    */
    const floor = width * 0.5
    if (w < floor) {
      h *= floor / w
      w = floor
    }

    const cx = (x0 + x1) / 2
    const cy = (y0 + y1) / 2
    // never zoom out past the stage the lesson drew on
    if (w >= width) return full
    return { x: cx - w / 2, y: cy - h / 2, w, h }
  }, [shown, nodes, width, height])

  /**
   * What is left to make up after the crop. 1 means no help needed; the cap
   * keeps a label from growing wider than the device it belongs to.
   */
  const tf = useMemo(() => {
    if (!shown) return 1
    // a 13-unit device name should land on at least ten real pixels
    const scale = shown / fitted.w
    return Math.min(1.75, Math.max(1, 10 / 13 / scale))
  }, [shown, fitted.w])

  /**
   * Where a packet sits along a link. The run is pulled in at both ends so an
   * envelope never lands on top of the device it is leaving or arriving at —
   * at t=0 it should be beside the machine, not covering its screen.
   */
  const pointOn = (fromId: string, toId: string, t: number) => {
    const a = byId.get(fromId)
    const b = byId.get(toId)
    if (!a || !b) return null

    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    if (len === 0) return { x: a.x, y: a.y }

    const clear = (n: NodeSpec) => Math.max(SIZE[n.type].w, SIZE[n.type].h) / 2 + 16
    // on a short link there is no room to inset; keep a third of it either way
    const room = Math.min(clear(a), len * 0.34)
    const roomB = Math.min(clear(b), len * 0.34)

    const sx = a.x + (dx / len) * room
    const sy = a.y + (dy / len) * room
    const ex = b.x - (dx / len) * roomB
    const ey = b.y - (dy / len) * roomB

    return { x: sx + (ex - sx) * t, y: sy + (ey - sy) * t }
  }

  return (
    <svg
      ref={(el) => {
        hostRef.current = el
        if (typeof svgRef === 'function') svgRef(el)
        else if (svgRef) (svgRef as { current: SVGSVGElement | null }).current = el
      }}
      viewBox={`${fitted.x} ${fitted.y} ${fitted.w} ${fitted.h}`}
      className={className}
      style={{ width: '100%', height: 'auto', maxHeight: '100%', display: 'block', ...style }}
      role={handy || onLinkClick ? undefined : 'img'}
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
          <rect
            x={fitted.x}
            y={fitted.y}
            width={fitted.w}
            height={fitted.h}
            fill="url(#nq-grid)"
          />
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
          const colour = down ? 'var(--nq-err)' : idle ? 'var(--nq-wire)' : 'var(--nq-ok)'
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
              {/* a 3px wire is far too thin to aim at, so the cable has its
                  own invisible hit area when it is something you can act on */}
              {onLinkClick && (
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="transparent"
                  strokeWidth={20}
                  strokeLinecap="round"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onLinkClick(l.id)}
                />
              )}
              {l.label && (
                <>
                  <rect
                    x={mx - (l.label.length * 3.4 + 7) * tf}
                    y={my - 19 * tf}
                    width={(l.label.length * 6.8 + 14) * tf}
                    height={17 * tf}
                    rx={8}
                    fill="var(--nq-bg-2)"
                    stroke="var(--nq-border)"
                  />
                  <text
                    x={mx}
                    y={my - 7 * tf}
                    textAnchor="middle"
                    fontSize={10 * tf}
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
            onPointerDown={onNodePointerDown ? (e) => onNodePointerDown(n.id, e) : undefined}
            onClick={onNodeClick ? () => onNodeClick(n.id) : undefined}
            style={{
              transition: 'opacity 260ms',
              cursor: handy ? 'pointer' : undefined,
              // without this a drag on a phone scrolls the page instead
              touchAction: onNodePointerDown ? 'none' : undefined,
            }}
          >
            {selected === n.id && (
              <circle
                r={52}
                fill="none"
                stroke="var(--nq-accent)"
                strokeWidth={2}
                strokeDasharray="6 5"
              />
            )}
            {n.pulse && (
              <circle
                r={46}
                fill="none"
                stroke={n.accent ?? DEVICE_COLOUR[n.type]}
                strokeWidth={2}
                className="nq-pulse"
              />
            )}
            <g transform={`scale(${SCALE[n.type]})`}>
              <DeviceShape node={n} />
            </g>
            <text
              y={SIZE[n.type].h / 2 + 20 * tf}
              textAnchor="middle"
              fontSize={13 * tf}
              fontWeight={700}
              fill={n.accent ?? 'var(--nq-text)'}
            >
              {n.label}
            </text>
            {n.sub && (
              <text
                y={SIZE[n.type].h / 2 + 36 * tf}
                textAnchor="middle"
                fontSize={11 * tf}
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
              <path d="M -11 -9 L 0 0 L 11 -9" fill="none" stroke="var(--nq-on-accent)" strokeWidth={1.6} />
              {p.label && (
                <text
                  y={-19 * tf}
                  textAnchor="middle"
                  fontSize={11 * tf}
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
