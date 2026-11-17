import { useEffect, useMemo, useRef, useState } from 'react'
import type { Bi } from '../data/courses'
import type { DeviceKind, Network, PingResult } from '../engine/network'
import Topology, { type DeviceType, type LinkSpec, type NodeSpec, type PacketSpec } from './Topology'
import StageLayout from './StageLayout'
import LiveTable from './LiveTable'
import PartsList from './PartsList'
import { rich } from './Prose'
import { tablesFor } from '../lib/deviceTables'
import { quietly } from '../lib/netProbe'
import { useT } from '../lib/i18n'
import { ease } from '../lib/useStepPlayer'
import {
  PORTS,
  addCable,
  addDevice,
  blankDesign,
  cableRefusal,
  clone,
  materialise,
  moveDevice,
  portsLeft,
  removeCable,
  removeDevice,
  setAddress,
  setGateway,
  type BuildDesign,
} from '../lib/buildDesign'

export interface BuildGoal {
  id: string
  label: Bi
  /** true once the drawing satisfies it; run inside `quietly`, so it may ping */
  check: (net: Network, design: BuildDesign) => boolean
}

export interface BuildSpec {
  /** what to make, in the learner's words */
  brief: Bi
  /** what is on the canvas to begin with; empty when omitted */
  start?: BuildDesign
  /** which kinds the palette offers, in order */
  palette?: DeviceKind[]
  goals: BuildGoal[]
  success: Bi
  viewBox?: { w: number; h: number }
}

const MASKS = ['255.255.255.0', '255.255.255.128', '255.255.0.0', '255.255.255.252']

const L = {
  lead: { gu: 'જાતે બનાવો', en: 'Build it yourself' },
  add: { gu: 'ઉમેરો', en: 'Add' },
  cable: { gu: 'Cable જોડો', en: 'Run a cable' },
  cableOn: { gu: 'કોને જોડવું? બીજા ઉપકરણ પર ટેપ કરો', en: 'Joining to? Tap the other device' },
  cablePick: { gu: 'પહેલું ઉપકરણ પસંદ કરો', en: 'Tap the first device' },
  undo: { gu: 'પાછું', en: 'Undo' },
  clear: { gu: 'બધું ભૂંસો', en: 'Clear' },
  goals: { gu: 'શું કરવાનું છે', en: 'What to build' },
  done: { gu: 'થઈ ગયું!', en: 'Built it.' },
  nothing: {
    gu: 'Canvas ખાલી છે. ઉપરથી એક ઉપકરણ ઉમેરીને શરૂ કરો.',
    en: 'The canvas is empty. Add a device above to start.',
  },
  inspect: { gu: 'પસંદ કરેલું', en: 'Selected' },
  pickOne: {
    gu: 'કોઈ ઉપકરણ કે cable પર ટેપ કરો — એની વિગત અહીં ખૂલશે.',
    en: 'Tap a device or a cable — its details open here.',
  },
  address: { gu: 'સરનામું', en: 'Address' },
  mask: { gu: 'Mask', en: 'Mask' },
  gateway: { gu: 'બહાર જવાનો રસ્તો', en: 'Way out (gateway)' },
  noAddr: {
    gu: 'Switch ને સરનામું જોઈતું નથી — એ hardware સરનામાં વાંચે છે, IP નહીં.',
    en: 'A switch needs no address — it reads hardware addresses, not IP.',
  },
  remove: { gu: 'કાઢી નાખો', en: 'Remove' },
  removeCable: { gu: 'Cable કાઢો', en: 'Remove cable' },
  test: { gu: 'ચકાસો', en: 'Test it' },
  from: { gu: 'કોનાથી', en: 'from' },
  to: { gu: 'કોને', en: 'to' },
  ping: { gu: 'Ping', en: 'Ping' },
  noTargets: {
    gu: 'ચકાસવા માટે સરનામાંવાળાં બે ઉપકરણ જોઈએ.',
    en: 'Testing needs two devices that have addresses.',
  },
  path: { gu: 'Packet નો રસ્તો', en: "The packet's path" },
  reached: { gu: 'પહોંચ્યું', en: 'delivered' },
  stopped: { gu: 'અહીં અટક્યું', en: 'stopped here' },
  tables: { gu: 'ઉપકરણનાં ટેબલ', en: 'Device tables' },
  full: { gu: 'એના બધા port ભરાઈ ગયા છે.', en: 'Every port on it is taken.' },
  already: { gu: 'એ બંને પહેલેથી જોડાયેલાં છે.', en: 'Those two are already joined.' },
  portsFree: { gu: 'port ખાલી', en: 'ports free' },
}

const KIND_LABEL: Record<DeviceKind, Bi> = {
  pc: { gu: 'કમ્પ્યુટર', en: 'Computer' },
  server: { gu: 'Server', en: 'Server' },
  switch: { gu: 'Switch', en: 'Switch' },
  router: { gu: 'Router', en: 'Router' },
}

const DEFAULT_PALETTE: DeviceKind[] = ['pc', 'server', 'switch', 'router']

type Sel = { kind: 'device'; id: string } | { kind: 'link'; id: string } | null

export default function BuildStage({ spec }: { spec: BuildSpec }) {
  const t = useT()
  const W = spec.viewBox?.w ?? 880
  const H = spec.viewBox?.h ?? 420

  const [design, setDesign] = useState<BuildDesign>(() =>
    spec.start ? clone(spec.start) : blankDesign(),
  )
  const [past, setPast] = useState<BuildDesign[]>([])
  const [sel, setSel] = useState<Sel>(null)
  const [cableFrom, setCableFrom] = useState<string | null>(null)
  const [cabling, setCabling] = useState(false)
  const [note, setNote] = useState<Bi | null>(null)

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [result, setResult] = useState<PingResult | null>(null)
  const [anim, setAnim] = useState<number | null>(null)
  const raf = useRef<number | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const net = useMemo(() => materialise(design), [design])

  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    },
    [],
  )

  /* ── editing ── */

  const apply = (next: BuildDesign) => {
    if (next === design) return
    setPast((p) => [...p.slice(-29), design])
    setDesign(next)
    setResult(null)
    setAnim(null)
  }

  const undo = () => {
    setPast((p) => {
      if (!p.length) return p
      setDesign(p[p.length - 1])
      return p.slice(0, -1)
    })
    setSel(null)
    setResult(null)
    setAnim(null)
  }

  const clearAll = () => {
    apply(spec.start ? clone(spec.start) : blankDesign())
    setSel(null)
    setCabling(false)
    setCableFrom(null)
  }

  const tapDevice = (id: string) => {
    // any tap answers whatever the last refusal was complaining about
    setNote(null)
    if (!cabling) {
      setSel({ kind: 'device', id })
      return
    }
    if (!cableFrom) {
      setCableFrom(id)
      return
    }
    const refusal = cableRefusal(design, cableFrom, id)
    if (refusal === 'already') setNote(L.already)
    else if (refusal === 'full-a' || refusal === 'full-b') setNote(L.full)
    else if (!refusal) {
      apply(addCable(design, cableFrom, id))
      setNote(null)
    }
    setCableFrom(null)
    setCabling(false)
  }

  /* ── dragging ── */

  const toViewBox = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return null
    const r = svg.getBoundingClientRect()
    if (!r.width || !r.height) return null
    return { x: ((clientX - r.left) / r.width) * W, y: ((clientY - r.top) / r.height) * H }
  }

  const onMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d) return
    const p = toViewBox(e.clientX, e.clientY)
    if (!p) return
    setDesign((cur) => moveDevice(cur, d.id, p.x + d.dx, p.y + d.dy))
  }

  const onUp = () => {
    drag.current = null
    window.removeEventListener('pointermove', onMove)
  }

  const startDrag = (id: string, e: React.PointerEvent) => {
    if (cabling) return
    const dev = design.devices.find((v) => v.id === id)
    const p = toViewBox(e.clientX, e.clientY)
    if (!dev || !p) return
    // the design is replaced on every move, so the grab offset is kept here
    // rather than recomputed from a device that no longer exists
    drag.current = { id, dx: dev.x - p.x, dy: dev.y - p.y }
    setPast((prev) => [...prev.slice(-29), design])
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
  }

  /* ── testing ── */

  const addressOf = (id: string) => net.get(id)?.activeIfaces()[0]?.ip
  const addressable = design.devices.filter((d) => addressOf(d.id))

  const runPing = () => {
    const destIp = addressOf(to)
    if (!from || !destIp) return
    const r = net.ping(from, destIp)
    setResult(r)
    const segments = Math.max(1, r.hops.length - 1)
    if (raf.current !== null) cancelAnimationFrame(raf.current)
    const started = performance.now()
    const tick = (now: number) => {
      const p = Math.min(segments, (now - started) / 620)
      setAnim(p)
      if (p < segments) raf.current = requestAnimationFrame(tick)
      else raf.current = null
    }
    setAnim(0)
    raf.current = requestAnimationFrame(tick)
  }

  /* ── derived view ── */

  const nodes: NodeSpec[] = design.devices.map((d) => {
    const dev = net.get(d.id)
    const ip = dev?.activeIfaces()[0]?.ip
    const failedHere = result && !result.ok && result.failedAt === d.id
    return {
      id: d.id,
      x: d.x,
      y: d.y,
      type: d.kind as DeviceType,
      label: d.name,
      sub: ip ?? (d.kind === 'switch' ? undefined : '—'),
      dim: !ip && d.kind !== 'switch',
      pulse: !!failedHere || cableFrom === d.id,
      accent: failedHere ? 'var(--nq-err)' : undefined,
    }
  })

  const links: LinkSpec[] = design.links.map((l) => ({
    id: l.id,
    from: l.a.device,
    to: l.b.device,
    state: net.linkUp(l.a.device, l.a.iface) ? 'up' : 'idle',
  }))

  const packets: PacketSpec[] = []
  if (result && anim !== null) {
    const hops = result.hops
    const idx = Math.min(Math.floor(anim), Math.max(0, hops.length - 2))
    const a = hops[idx]
    const b = hops[idx + 1]
    if (a && b) {
      packets.push({
        id: 'probe',
        from: a.device,
        to: b.device,
        t: ease(Math.min(1, anim - idx)),
        color: result.ok ? 'var(--nq-ok)' : 'var(--nq-warn)',
        label: 'ping',
      })
    }
  }

  // goals may ping, and a ping teaches the devices; the checklist runs on every
  // render, so it must leave no trace in the tables the learner is watching
  const met = quietly(net, () => spec.goals.map((g) => g.check(net, design)))
  const allMet = met.length > 0 && met.every(Boolean)

  const selDev = sel?.kind === 'device' ? design.devices.find((d) => d.id === sel.id) : undefined
  const selLink = sel?.kind === 'link' ? design.links.find((l) => l.id === sel.id) : undefined
  const tableDev = selDev ? net.get(selDev.id) : undefined

  const palette = spec.palette ?? DEFAULT_PALETTE

  return (
    <StageLayout
      note={{ label: t(L.lead), text: t(spec.brief), accent: 'var(--nq-beginner)' }}
      stage={
        <Topology
          nodes={nodes}
          links={links}
          packets={packets}
          width={W}
          height={H}
          svgRef={svgRef}
          selected={sel?.kind === 'device' ? sel.id : undefined}
          onNodeClick={tapDevice}
          onNodePointerDown={cabling ? undefined : startDrag}
          onLinkClick={(id) => setSel({ kind: 'link', id })}
        />
      }
      controls={
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="nq-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nq-text-mute)]">
              {t(L.add)}
            </span>
            {palette.map((k) => (
              <button
                key={k}
                onClick={() => apply(addDevice(design, k, W, H))}
                className="nq-focus rounded-lg border border-[var(--nq-border-2)] px-2.5 py-1 text-[11px] font-semibold text-[var(--nq-text-dim)] transition hover:border-[var(--nq-accent)] hover:text-[var(--nq-text)]"
              >
                + {t(KIND_LABEL[k])}
              </button>
            ))}

            <button
              onClick={() => {
                setCabling((v) => !v)
                setCableFrom(null)
                setNote(null)
              }}
              disabled={design.devices.length < 2}
              className="nq-focus ml-auto rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-40"
              style={{
                borderColor: cabling ? 'var(--nq-accent)' : 'var(--nq-border-2)',
                color: cabling ? 'var(--nq-accent)' : 'var(--nq-text-dim)',
              }}
            >
              ⎯ {t(L.cable)}
            </button>
            <button
              onClick={undo}
              disabled={!past.length}
              className="nq-focus rounded-lg border border-[var(--nq-border-2)] px-2.5 py-1 text-[11px] text-[var(--nq-text-mute)] transition hover:text-[var(--nq-text)] disabled:opacity-40"
            >
              ↶ {t(L.undo)}
            </button>
            <button
              onClick={clearAll}
              disabled={!design.devices.length}
              className="nq-focus rounded-lg border border-[var(--nq-border-2)] px-2.5 py-1 text-[11px] text-[var(--nq-text-mute)] transition hover:text-[var(--nq-text)] disabled:opacity-40"
            >
              ↺ {t(L.clear)}
            </button>
          </div>

          {(cabling || note) && (
            <p
              className="nq-prose rounded-lg px-3 py-1.5 text-[12px]"
              style={{
                background: note
                  ? 'color-mix(in srgb, var(--nq-warn) 12%, transparent)'
                  : 'color-mix(in srgb, var(--nq-accent) 10%, transparent)',
                color: 'var(--nq-text-dim)',
              }}
            >
              {note ? t(note) : cableFrom ? t(L.cableOn) : t(L.cablePick)}
            </p>
          )}
        </div>
      }
      progress={
        <>
          <div className="nq-panel p-5">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
                {t(L.goals)}
              </h3>
              <span className="nq-mono ml-auto text-[11px] text-[var(--nq-text-mute)]">
                {met.filter(Boolean).length} / {met.length}
              </span>
            </div>
            <ol className="mt-3 space-y-1.5">
              {spec.goals.map((g, i) => (
                <li key={g.id} className="flex items-start gap-2.5 text-sm">
                  <span
                    className="nq-mono mt-0.5 flex shrink-0 items-center justify-center rounded text-[10px]"
                    style={{
                      width: 18,
                      height: 18,
                      background: met[i] ? 'var(--nq-ok)' : 'var(--nq-panel-2)',
                      color: met[i] ? 'var(--nq-on-accent)' : 'var(--nq-text-mute)',
                    }}
                  >
                    {met[i] ? '✓' : i + 1}
                  </span>
                  <span
                    style={{
                      color: met[i] ? 'var(--nq-text-mute)' : 'var(--nq-text)',
                      textDecoration: met[i] ? 'line-through' : undefined,
                    }}
                  >
                    {rich(t(g.label))}
                  </span>
                </li>
              ))}
            </ol>
            {allMet && (
              <p
                className="nq-prose mt-3 rounded-lg px-3 py-2 text-sm"
                style={{
                  background: 'color-mix(in srgb, var(--nq-ok) 12%, transparent)',
                  color: 'var(--nq-text-dim)',
                }}
              >
                <strong style={{ color: 'var(--nq-ok)' }}>✓ {t(L.done)} </strong>
                {rich(t(spec.success))}
              </p>
            )}
          </div>
          {design.devices.length > 0 && <PartsList net={net} layout={nodes} />}
        </>
      }
      narration={
        <div className="nq-panel p-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
            {t(L.inspect)}
          </h3>

          {!design.devices.length ? (
            <p className="nq-prose mt-2 text-sm text-[var(--nq-text-mute)]">{t(L.nothing)}</p>
          ) : selDev ? (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="nq-mono text-sm font-bold text-[var(--nq-text)]">{selDev.name}</span>
                <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--nq-text-mute)]">
                  {t(KIND_LABEL[selDev.kind])}
                </span>
                <span className="nq-mono ml-auto text-[11px] text-[var(--nq-text-mute)]">
                  {portsLeft(design, selDev.id)} {t(L.portsFree)}
                </span>
              </div>

              {selDev.kind === 'switch' ? (
                <p className="nq-prose text-[12.5px] text-[var(--nq-text-mute)]">{t(L.noAddr)}</p>
              ) : (
                <div className="space-y-2">
                  {PORTS[selDev.kind].map((ifn) => {
                    const a = selDev.addrs[ifn]
                    return (
                      <div key={ifn} className="flex flex-wrap items-center gap-2">
                        <span className="nq-mono w-12 shrink-0 text-[11px] text-[var(--nq-text-mute)]">
                          {ifn}
                        </span>
                        <input
                          value={a?.ip ?? ''}
                          onChange={(e) =>
                            apply(setAddress(design, selDev.id, ifn, { ip: e.target.value.trim() }))
                          }
                          placeholder={t(L.address)}
                          className="nq-focus nq-mono min-w-0 flex-1 rounded-lg border border-[var(--nq-border-2)] bg-transparent px-2 py-1 text-[12px]"
                        />
                        <select
                          value={a?.mask ?? MASKS[0]}
                          onChange={(e) =>
                            apply(setAddress(design, selDev.id, ifn, { mask: e.target.value }))
                          }
                          disabled={!a?.ip}
                          className="nq-focus nq-mono rounded-lg border border-[var(--nq-border-2)] bg-transparent px-1.5 py-1 text-[11px] disabled:opacity-40"
                        >
                          {MASKS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  })}

                  {selDev.kind !== 'router' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-12 shrink-0 text-[11px] text-[var(--nq-text-mute)]">
                        {t(L.gateway)}
                      </span>
                      <input
                        value={selDev.gateway ?? ''}
                        onChange={(e) => apply(setGateway(design, selDev.id, e.target.value.trim()))}
                        placeholder="—"
                        className="nq-focus nq-mono min-w-0 flex-1 rounded-lg border border-[var(--nq-border-2)] bg-transparent px-2 py-1 text-[12px]"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  apply(removeDevice(design, selDev.id))
                  setSel(null)
                }}
                className="nq-focus rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition"
                style={{ borderColor: 'var(--nq-err)', color: 'var(--nq-err)' }}
              >
                {t(L.remove)}
              </button>
            </div>
          ) : selLink ? (
            <div className="mt-3 space-y-3">
              <p className="nq-mono text-[12px] text-[var(--nq-text-dim)]">
                {net.get(selLink.a.device)?.name} {selLink.a.iface} ↔ {net.get(selLink.b.device)?.name}{' '}
                {selLink.b.iface}
              </p>
              <button
                onClick={() => {
                  apply(removeCable(design, selLink.id))
                  setSel(null)
                }}
                className="nq-focus rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition"
                style={{ borderColor: 'var(--nq-err)', color: 'var(--nq-err)' }}
              >
                {t(L.removeCable)}
              </button>
            </div>
          ) : (
            <p className="nq-prose mt-2 text-sm text-[var(--nq-text-mute)]">{t(L.pickOne)}</p>
          )}
        </div>
      }
      surface={
        <>
          <div className="nq-panel p-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
              {t(L.test)}
            </h3>

            {addressable.length < 2 ? (
              <p className="nq-prose mt-2 text-[12.5px] text-[var(--nq-text-mute)]">
                {t(L.noTargets)}
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="nq-mono text-[11px] text-[var(--nq-text-mute)]">{t(L.from)}</span>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="nq-focus nq-mono rounded-lg border border-[var(--nq-border-2)] bg-transparent px-2 py-1 text-[12px]"
                >
                  <option value="">—</option>
                  {design.devices
                    .filter((d) => d.kind !== 'switch')
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </select>
                <span className="nq-mono text-[11px] text-[var(--nq-text-mute)]">{t(L.to)}</span>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="nq-focus nq-mono rounded-lg border border-[var(--nq-border-2)] bg-transparent px-2 py-1 text-[12px]"
                >
                  <option value="">—</option>
                  {addressable.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {addressOf(d.id)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={runPing}
                  disabled={!from || !to || from === to}
                  className="nq-focus rounded-lg border border-[var(--nq-border-2)] px-3 py-1 text-[11px] font-semibold text-[var(--nq-text-dim)] transition hover:border-[var(--nq-accent)] hover:text-[var(--nq-text)] disabled:opacity-40"
                >
                  ▶ {t(L.ping)}
                </button>
              </div>
            )}

            {result && (
              <div className="mt-4">
                <h4 className="nq-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nq-text-mute)]">
                  {t(L.path)}
                </h4>
                <ol className="mt-2 space-y-1">
                  {result.hops.map((h, i) => {
                    const last = i === result.hops.length - 1
                    const bad = !result.ok && last
                    return (
                      <li key={i} className="nq-mono flex items-center gap-2 text-[12px]">
                        <span
                          className="flex h-5 w-5 items-center justify-center rounded text-[10px]"
                          style={{
                            background: bad ? 'var(--nq-err)' : 'var(--nq-panel-2)',
                            color: bad ? 'var(--nq-on-accent)' : 'var(--nq-text-mute)',
                          }}
                        >
                          {bad ? '✕' : i + 1}
                        </span>
                        <span style={{ color: bad ? 'var(--nq-err)' : 'var(--nq-text)' }}>
                          {h.deviceName}
                        </span>
                        {last && (
                          <span
                            className="ml-auto text-[10px] uppercase tracking-wider"
                            style={{ color: result.ok ? 'var(--nq-ok)' : 'var(--nq-err)' }}
                          >
                            {result.ok ? t(L.reached) : t(L.stopped)}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}
          </div>

          {tableDev && (
            <div className="nq-panel p-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
                {t(L.tables)}
              </h3>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {tablesFor(tableDev, net).map((tb) => (
                  <LiveTable key={tb.id} spec={tb.spec} stepKey={`${tableDev.id}:${design.links.length}`} />
                ))}
              </div>
            </div>
          )}
        </>
      }
    />
  )
}
