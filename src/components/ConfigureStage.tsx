import { useMemo, useState } from 'react'
import type { Bi } from '../data/courses'
import type { DeviceType, LinkSpec, NodeSpec } from './Topology'
import Topology from './Topology'
import Terminal from './Terminal'
import StageLayout from './StageLayout'
import { CliSession, type CliLine } from '../engine/cli'
import type { Network } from '../engine/network'
import { cidr } from '../engine/ip'
import { useT } from '../lib/i18n'

export interface ConfigDeviceLayout {
  id: string
  x: number
  y: number
  type: DeviceType
  accent?: string
}

export interface ConfigTask {
  id: string
  instruction: Bi
  /** three escalating levels: nudge, syntax, full answer */
  hints: [Bi, Bi, Bi]
  why?: Bi
  check: (net: Network) => boolean
  done: Bi
}

export interface ConfigureSpec {
  build: () => Network
  layout: ConfigDeviceLayout[]
  /** device ids that get a console tab, in order */
  terminals: string[]
  tasks: ConfigTask[]
  success: Bi
  viewBox?: { w: number; h: number }
}

const L = {
  task: { gu: 'કામ', en: 'Task' },
  hint: { gu: 'મદદ', en: 'Hint' },
  allDone: { gu: 'બધું થઈ ગયું!', en: 'All done!' },
  reset: { gu: 'ફરી શરૂ', en: 'Reset' },
  ifaces: { gu: 'Interfaces', en: 'Interfaces' },
  routes: { gu: 'Routing Table', en: 'Routing Table' },
  empty: { gu: '(ખાલી)', en: '(empty)' },
  typeHere: { gu: 'અહીં કમાન્ડ લખો…', en: 'type a command…' },
  tabHint: {
    gu: 'Tab = પૂરું કરો · ↑ = પાછલી કમાન્ડ · ? = મદદ',
    en: 'Tab completes · ↑ recalls · ? lists commands',
  },
  whatToDo: { gu: 'શું કરવાનું છે', en: 'What to do' },
  console: { gu: 'Console', en: 'Console' },
}

function Tables({ net, deviceId }: { net: Network; deviceId: string }) {
  const t = useT()
  const dev = net.get(deviceId)
  if (!dev) return null
  const routes = dev.routingTable().filter((r) => r.source !== 'L')

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="nq-panel p-3">
        <h4 className="nq-mono mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--nq-text-mute)]">
          {t(L.ifaces)}
        </h4>
        <table className="nq-mono w-full text-[11px]">
          <tbody>
            {dev.ifaces.map((i) => {
              const up = !i.shutdown && (i.vlanId !== undefined || net.linkUp(dev.id, i.name))
              return (
                <tr key={i.name} className="border-t border-[var(--nq-border)] first:border-0">
                  <td className="py-1 pr-2 text-[var(--nq-text-dim)]">{i.name}</td>
                  <td className="py-1 pr-2 text-[var(--nq-text)]">
                    {i.ip ? cidr(i.ip, i.mask!) : <span className="opacity-40">unassigned</span>}
                  </td>
                  <td className="py-1 text-right">
                    <span
                      className="rounded px-1.5 py-px text-[10px]"
                      style={{
                        color: up ? 'var(--nq-ok)' : 'var(--nq-err)',
                        background: up
                          ? 'color-mix(in srgb, var(--nq-ok) 14%, transparent)'
                          : 'color-mix(in srgb, var(--nq-err) 12%, transparent)',
                      }}
                    >
                      {i.shutdown ? 'admin down' : up ? 'up/up' : 'down'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="nq-panel p-3">
        <h4 className="nq-mono mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--nq-text-mute)]">
          {t(L.routes)}
        </h4>
        {routes.length === 0 ? (
          <p className="nq-mono text-[11px] text-[var(--nq-text-mute)]">{t(L.empty)}</p>
        ) : (
          <table className="nq-mono w-full text-[11px]">
            <tbody>
              {routes.map((r, i) => (
                <tr key={i} className="border-t border-[var(--nq-border)] first:border-0">
                  <td className="w-6 py-1" style={{ color: 'var(--nq-accent)' }}>
                    {r.source}
                  </td>
                  <td className="py-1 pr-2 text-[var(--nq-text)]">{cidr(r.prefix, r.mask)}</td>
                  <td className="py-1 text-right text-[var(--nq-text-mute)]">
                    {r.nextHop ? `via ${r.nextHop}` : r.iface}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default function ConfigureStage({ spec }: { spec: ConfigureSpec }) {
  const t = useT()
  const [nonce, setNonce] = useState(0)

  const boot = useMemo(() => {
    const net = spec.build()
    const sessions = new Map<string, CliSession>()
    for (const id of spec.terminals) sessions.set(id, new CliSession(net, id))
    return { net, sessions }
    // rebuilt only when the learner presses Reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, nonce])

  const { net, sessions } = boot
  const [active, setActive] = useState(spec.terminals[0])
  const [lines, setLines] = useState<Record<string, CliLine[]>>({})
  const [hintLevel, setHintLevel] = useState(0)
  const [rev, setRev] = useState(0)

  const doneSet = new Set<string>()
  for (const task of spec.tasks) {
    try {
      if (task.check(net)) doneSet.add(task.id)
    } catch {
      /* a half-finished config can throw; treat as not done */
    }
  }
  const currentIdx = spec.tasks.findIndex((x) => !doneSet.has(x.id))
  const current = currentIdx >= 0 ? spec.tasks[currentIdx] : null
  const allDone = current === null

  const run = (raw: string) => {
    const s = sessions.get(active)!
    const produced = s.exec(raw)
    setLines((prev) => ({ ...prev, [active]: [...(prev[active] ?? []), ...produced] }))
    setHintLevel(0)
    setRev((r) => r + 1)
  }

  const reset = () => {
    setLines({})
    setHintLevel(0)
    setNonce((n) => n + 1)
    setActive(spec.terminals[0])
  }

  const nodes: NodeSpec[] = spec.layout.map((d) => {
    const dev = net.get(d.id)!
    const ip = dev.activeIfaces()[0]?.ip
    return {
      id: d.id,
      x: d.x,
      y: d.y,
      type: d.type,
      label: dev.name,
      sub: ip ?? '—',
      dim: !ip,
      pulse: d.id === active && !allDone,
      accent: d.accent,
    }
  })

  const links: LinkSpec[] = net.links.map((l, i) => {
    const up = net.linkUp(l.a.device, l.a.iface)
    const aIf = net.get(l.a.device)?.iface(l.a.iface)
    const bIf = net.get(l.b.device)?.iface(l.b.iface)
    const shut = aIf?.shutdown || bIf?.shutdown
    return {
      id: `l${i}`,
      from: l.a.device,
      to: l.b.device,
      state: up ? 'up' : shut ? 'down' : 'idle',
      label: up ? 'up/up' : undefined,
    }
  })

  const vb = spec.viewBox ?? { w: 860, h: 320 }

  return (
    <div data-rev={rev}>
      <StageLayout
        note={{
          label: allDone ? t(L.allDone) : t(L.whatToDo),
          text: allDone ? t(spec.success) : t(current!.why ?? current!.instruction),
          accent: allDone ? 'var(--nq-ok)' : 'var(--nq-warn)',
        }}
        stage={<Topology nodes={nodes} links={links} width={vb.w} height={vb.h} />}
        controls={
          <div className="flex flex-wrap items-center gap-2">
            {spec.terminals.map((id) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className="nq-focus rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
                style={
                  active === id
                    ? { borderColor: 'var(--nq-accent)', color: 'var(--nq-text)' }
                    : { borderColor: 'var(--nq-border)', color: 'var(--nq-text-mute)' }
                }
              >
                {net.get(id)?.name ?? id}
              </button>
            ))}
            <button
              onClick={reset}
              className="nq-focus ml-auto rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-[11px] text-[var(--nq-text-mute)] transition hover:text-[var(--nq-text)]"
            >
              ↺ {t(L.reset)}
            </button>
            <span className="nq-mono text-[11px] tracking-wider text-[var(--nq-text-mute)]">
              {t(L.task)} {Math.min(currentIdx + 1 || spec.tasks.length, spec.tasks.length)}/
              {spec.tasks.length}
            </span>
          </div>
        }
        narration={
          <>
            <div className="nq-panel p-5">
              <div className="flex items-center gap-3">
                <span
                  className="nq-mono flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold"
                  style={{
                    background: allDone
                      ? 'color-mix(in srgb, var(--nq-ok) 18%, transparent)'
                      : 'color-mix(in srgb, var(--nq-accent) 18%, transparent)',
                    color: allDone ? 'var(--nq-ok)' : 'var(--nq-accent)',
                  }}
                >
                  {allDone ? '✓' : currentIdx + 1}
                </span>
                <h3 className="text-lg font-bold tracking-tight">
                  {allDone ? t(L.allDone) : t(L.task) + ' ' + (currentIdx + 1)}
                </h3>
              </div>

              <p className="nq-prose mt-3 text-[var(--nq-text-dim)]">
                {allDone ? t(spec.success) : t(current!.instruction)}
              </p>

              {!allDone && (
                <div className="mt-4">
                  {hintLevel > 0 && (
                    <div className="mb-2 space-y-1.5">
                      {current!.hints.slice(0, hintLevel).map((h, i) => (
                        <p
                          key={i}
                          className="nq-prose whitespace-pre-line rounded-lg px-3 py-2 text-sm"
                          style={{
                            background: 'color-mix(in srgb, var(--nq-warn) 10%, transparent)',
                            color: 'var(--nq-text-dim)',
                          }}
                        >
                          <span className="nq-mono mr-2 text-[10px] opacity-60">{i + 1}</span>
                          {t(h)}
                        </p>
                      ))}
                    </div>
                  )}
                  {hintLevel < 3 && (
                    <button
                      onClick={() => setHintLevel((h) => h + 1)}
                      className="nq-focus rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-xs font-semibold text-[var(--nq-warn)] transition hover:border-[var(--nq-warn)]"
                    >
                      💡 {t(L.hint)} {hintLevel + 1}/3
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        }
        progress={
            <ol className="nq-panel space-y-1.5 p-5">
              {spec.tasks.map((task, i) => {
                const ok = doneSet.has(task.id)
                const isCurrent = i === currentIdx
                return (
                  <li key={task.id} className="flex items-start gap-2.5 text-sm">
                    <span
                      className="nq-mono mt-0.5 flex shrink-0 items-center justify-center rounded text-[10px]"
                      style={{
                        width: 18,
                        height: 18,
                        background: ok
                          ? 'var(--nq-ok)'
                          : isCurrent
                            ? 'color-mix(in srgb, var(--nq-accent) 22%, transparent)'
                            : 'var(--nq-panel-2)',
                        color: ok ? 'var(--nq-bg)' : isCurrent ? 'var(--nq-accent)' : 'var(--nq-text-mute)',
                      }}
                    >
                      {ok ? '✓' : i + 1}
                    </span>
                    <span
                      style={{
                        color: isCurrent && !ok ? 'var(--nq-text)' : 'var(--nq-text-mute)',
                        textDecoration: ok ? 'line-through' : undefined,
                      }}
                    >
                      {ok ? t(task.done) : t(task.instruction)}
                    </span>
                  </li>
                )
              })}
            </ol>
        }
        surface={
          <>
            <Terminal
              key={`${active}-${nonce}`}
              session={sessions.get(active)!}
              lines={lines[active] ?? []}
              onRun={run}
              placeholder={t(L.typeHere)}
              height={260}
            />
            <p className="nq-mono text-[10.5px] text-[var(--nq-text-mute)]">{t(L.tabHint)}</p>
            <Tables net={net} deviceId={active} />
          </>
        }
      />
    </div>
  )
}
