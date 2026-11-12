import { useEffect, useMemo, useState } from 'react'
import type { Bi } from '../data/courses'

type BiText = { gu: string; en: string }
import type { DeviceType, LinkSpec, NodeSpec } from './Topology'
import Topology from './Topology'
import Terminal from './Terminal'
import StageLayout from './StageLayout'
import { CliSession, MODE_NAME, type CliLine } from '../engine/cli'
import CommandList from './CommandList'
import Prose, { rich } from './Prose'
import { CommandReferenceButton } from './CommandReference'
import LiveTable from './LiveTable'
import { describeChange, snapshot } from '../lib/netDiff'
import { useApp } from '../store/useApp'
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
  /** the lines to type; taken from the full-answer hint when not given */
  commands?: string[]
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
  youAre: { gu: 'તમે અત્યારે', en: 'You are in' },
  justHappened: { gu: 'હમણાં શું થયું', en: 'What just happened' },
  nothingYet: { gu: 'હજી કોઈ કમાન્ડ ચાલ્યો નથી.', en: 'No command has run yet.' },
  noEffect: { gu: 'એ કમાન્ડે કશું બદલ્યું નહીં.', en: 'That command changed nothing.' },
  showAll: { gu: 'આખી lesson ના કમાન્ડ', en: 'All commands' },
  hideAll: { gu: 'છુપાવો', en: 'Hide' },
  allTitle: { gu: 'આ lesson ના બધા કમાન્ડ', en: 'Every command in this lesson' },
  console: { gu: 'Console', en: 'Console' },
}

function Tables({ net, deviceId, rev }: { net: Network; deviceId: string; rev: number }) {
  const dev = net.get(deviceId)
  if (!dev) return null
  const routes = dev.installedRoutes().filter((r) => r.source !== 'L')

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <LiveTable
        stepKey={rev}
        spec={{
          title: L.ifaces,
          owner: deviceId,
          head: ['port', 'address', 'state'],
          empty: { gu: 'કોઈ પોર્ટ નથી.', en: 'No ports on this device.' },
          rows: dev.ifaces.map((i) => {
            const up = !i.shutdown && (i.vlanId !== undefined || net.linkUp(dev.id, i.name))
            return [
              i.name,
              i.ip ? cidr(i.ip, i.mask!) : '—',
              i.shutdown ? 'admin down' : up ? 'up/up' : 'down',
            ]
          }),
        }}
      />
      <LiveTable
        stepKey={rev}
        spec={{
          title: L.routes,
          owner: deviceId,
          head: ['', 'network', 'via'],
          empty: {
            gu: 'એકેય રસ્તો નથી — એટલે બીજે ક્યાંય પહોંચાશે નહીં.',
            en: 'No paths yet, so nothing elsewhere can be reached.',
          },
          rows: routes.map((r) => [r.source, cidr(r.prefix, r.mask), r.nextHop ? `via ${r.nextHop}` : (r.iface ?? '—')]),
        }}
      />
    </div>
  )
}

/** The lines a task wants typed. The full-answer hint already is that list. */
function commandsFor(task: ConfigTask): string[] {
  if (task.commands) return task.commands
  return task.hints[2].en
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
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
  const [typed, setTyped] = useState<Set<string>>(new Set())
  const [changed, setChanged] = useState<{ lines: BiText[]; touched: string[]; n: number }>({
    lines: [],
    touched: [],
    n: 0,
  })
  const [prefill, setPrefill] = useState<{ text: string; n: number }>({ text: '', n: 0 })
  const mode = useApp((st) => st.mode)

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
    const before = snapshot(net)
    const produced = s.exec(raw)
    const diff = describeChange(before, snapshot(net))

    setLines((prev) => ({ ...prev, [active]: [...(prev[active] ?? []), ...produced] }))
    setTyped((prev) => new Set(prev).add(raw.trim().toLowerCase()))
    if (diff.lines.length) setChanged((c) => ({ ...diff, n: c.n + 1 }))
    setHintLevel(0)
    setRev((r) => r + 1)
  }

  const reset = () => {
    setLines({})
    setTyped(new Set())
    setChanged({ lines: [], touched: [], n: 0 })
    setHintLevel(0)
    setNonce((n) => n + 1)
    setActive(spec.terminals[0])
  }

  // the devices the last command actually altered, lit briefly so the change
  // is visible on the drawing and not only in a table
  const [showAll, setShowAll] = useState(false)
  const [flash, setFlash] = useState<string[]>([])
  useEffect(() => {
    if (!changed.touched.length) return
    setFlash(changed.touched)
    const h = setTimeout(() => setFlash([]), 1400)
    return () => clearTimeout(h)
  }, [changed.n, changed.touched])

  // where this console currently stands, so IOS modes stop being a guessing game
  const sessionMode = sessions.get(active)!.mode
  const CHAIN: Record<string, string[]> = {
    user: ['user'],
    priv: ['user', 'priv'],
    config: ['user', 'priv', 'config'],
    'config-if': ['user', 'priv', 'config', 'config-if'],
    'config-vlan': ['user', 'priv', 'config', 'config-vlan'],
    'config-router': ['user', 'priv', 'config', 'config-router'],
    'config-dhcp': ['user', 'priv', 'config', 'config-dhcp'],
  }
  const trail = (CHAIN[sessionMode] ?? ['user']).map(
    (m) => MODE_NAME[m as keyof typeof MODE_NAME],
  )

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
      pulse: flash.includes(d.id) || (d.id === active && !allDone),
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
            <span className="ml-auto flex items-center gap-2">
              <CommandReferenceButton />
              <button
                onClick={() => setShowAll((v) => !v)}
                className="nq-focus rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-[11px] text-[var(--nq-text-mute)] transition hover:text-[var(--nq-text)]"
              >
                {showAll ? t(L.hideAll) : t(L.showAll)}
              </button>
              <button
                onClick={reset}
                className="nq-focus rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-[11px] text-[var(--nq-text-mute)] transition hover:text-[var(--nq-text)]"
              >
                ↺ {t(L.reset)}
              </button>
            </span>
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

              <Prose className="nq-prose mt-3 text-[var(--nq-text-dim)]">
                {allDone ? t(spec.success) : t(current!.instruction)}
              </Prose>

              {!allDone && mode === 'beginner' && (
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

            {showAll && (
              <div className="nq-panel p-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
                  {t(L.allTitle)}
                </h3>
                <ol className="mt-3 space-y-3">
                  {spec.tasks.map((task, i) => (
                    <li key={task.id}>
                      <p className="text-[12px] font-semibold text-[var(--nq-text-dim)]">
                        {i + 1}. {rich(t(task.instruction))}
                      </p>
                      <pre className="nq-mono mt-1 whitespace-pre-wrap rounded-lg px-3 py-2 text-[11.5px] text-[var(--nq-text-mute)]" style={{ background: 'var(--nq-panel-2)' }}>
                        {commandsFor(task).join(String.fromCharCode(10))}
                      </pre>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {!allDone && mode === 'beginner' && (
              <CommandList
                commands={commandsFor(current!)}
                typed={typed}
                onPick={(line) => setPrefill((p) => ({ text: line, n: p.n + 1 }))}
              />
            )}

            <div className="nq-panel p-5">
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
                {t(L.justHappened)}
              </h3>
              {changed.n === 0 ? (
                <p className="nq-prose mt-2 text-[12.5px] text-[var(--nq-text-mute)]">{t(L.nothingYet)}</p>
              ) : changed.lines.length === 0 ? (
                <p className="nq-prose mt-2 text-[12.5px] text-[var(--nq-text-mute)]">{t(L.noEffect)}</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {changed.lines.map((l, i) => (
                    <li key={i} className="nq-prose flex items-start gap-2 text-[12.5px]">
                      <span style={{ color: 'var(--nq-ok)' }}>→</span>
                      <span className="text-[var(--nq-text-dim)]">{t(l)}</span>
                    </li>
                  ))}
                </ul>
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
                        color: ok ? 'var(--nq-on-accent)' : isCurrent ? 'var(--nq-accent)' : 'var(--nq-text-mute)',
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
                      {ok ? rich(t(task.done)) : rich(t(task.instruction))}
                    </span>
                  </li>
                )
              })}
            </ol>
        }
        surface={
          <>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="nq-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nq-text-mute)]">
                {t(L.youAre)}
              </span>
              {trail.map((m, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-[var(--nq-text-mute)]">›</span>}
                  <span
                    className="nq-mono rounded px-1.5 py-px text-[10.5px]"
                    style={
                      i === trail.length - 1
                        ? {
                            background: 'color-mix(in srgb, var(--nq-accent) 18%, transparent)',
                            color: 'var(--nq-accent)',
                          }
                        : { color: 'var(--nq-text-mute)' }
                    }
                  >
                    {t(m)}
                  </span>
                </span>
              ))}
            </div>

            <Terminal
              key={`${active}-${nonce}`}
              session={sessions.get(active)!}
              lines={lines[active] ?? []}
              onRun={run}
              placeholder={t(L.typeHere)}
              height={260}
              prefill={prefill}
            />
            <p className="nq-mono text-[10.5px] text-[var(--nq-text-mute)]">{t(L.tabHint)}</p>
            <Tables net={net} deviceId={active} rev={rev} />
          </>
        }
      />
    </div>
  )
}
