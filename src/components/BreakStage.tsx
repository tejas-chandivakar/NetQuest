import { useEffect, useMemo, useRef, useState } from 'react'
import type { Bi } from '../data/courses'
import Topology, { type LinkSpec, type NodeSpec, type PacketSpec } from './Topology'
import type { ConfigDeviceLayout } from './ConfigureStage'
import StageLayout from './StageLayout'
import { rich } from './Prose'
import type { Network, PingFailure, PingResult } from '../engine/network'
import { cidr } from '../engine/ip'
import { useT } from '../lib/i18n'
import { useApp } from '../store/useApp'
import { ease } from '../lib/useStepPlayer'

export interface BreakAction {
  id: string
  label: Bi
  /** what this switch actually does, in the learner's words */
  explain: Bi
  /** what they should expect to see — revealed after they flip it */
  expect: Bi
  apply: (net: Network) => void
  revert: (net: Network) => void
}

export interface BreakProbe {
  id: string
  from: string
  to: string
  destIp: string
  label: Bi
}

export interface BreakSpec {
  /** a fully working network — the learner breaks it from here */
  build: () => Network
  layout: ConfigDeviceLayout[]
  actions: BreakAction[]
  probes: BreakProbe[]
  intro: Bi
  viewBox?: { w: number; h: number }
}

const L = {
  intro: { gu: 'તોડો અને જુઓ', en: 'Break it and watch' },
  faults: { gu: 'શું બગાડવું છે?', en: 'What do you want to break?' },
  probes: { gu: 'ચકાસો', en: 'Test it' },
  healthy: { gu: 'બધું બરાબર ચાલે છે', en: 'Everything is healthy' },
  broken: { gu: 'કંઈક તૂટેલું છે', en: 'Something is broken' },
  repairAll: { gu: 'બધું ઠીક કરો', en: 'Repair everything' },
  expect: { gu: 'શું થયું', en: 'What happened' },
  path: { gu: 'Packet નો રસ્તો', en: "The packet's path" },
  reached: { gu: 'પહોંચ્યું', en: 'delivered' },
  stopped: { gu: 'અહીં અટક્યું', en: 'stopped here' },
  replyBlocked: { gu: 'પહોંચ્યું, પણ જવાબ અટક્યો', en: 'arrived, reply blocked' },
  tables: { gu: 'અસર પામેલું ટેબલ', en: 'Affected tables' },
  on: { gu: 'ચાલુ', en: 'ON' },
  off: { gu: 'બંધ', en: 'OFF' },
}

const FAILURE: Record<PingFailure, { beginner: Bi; exam: Bi }> = {
  'no-source-ip': {
    beginner: {
      gu: 'મોકલનાર પાસે જ પોતાનું સરનામું નથી — પરબીડિયા પર "કોના તરફથી" લખાય જ નહીં.',
      en: 'The sender has no address of its own — there is nothing to write in the "from" box.',
    },
    exam: {
      gu: 'કોઈ active interface પાસે IP નથી, એટલે source address પસંદ થઈ શકતું નથી.',
      en: 'No active interface holds an IP, so no source address can be selected.',
    },
  },
  'no-route': {
    beginner: {
      gu: 'આ ડિવાઇસને ખબર જ નથી કે એ સરનામું કઈ દિશામાં છે. નકશામાં એ રસ્તો લખેલો જ નથી.',
      en: 'This device has no idea which way that address lies. The road is simply not on its map.',
    },
    exam: {
      gu: 'Routing table માં destination માટે કોઈ matching entry નથી અને default route પણ નથી — packet drop થાય અને ICMP unreachable જાય.',
      en: 'No matching entry for the destination and no default route — the packet is dropped and an ICMP unreachable is returned.',
    },
  },
  'arp-fail': {
    beginner: {
      gu: 'રસ્તો તો ખબર છે, પણ એ બાજુ જેને સોંપવાનું હતું એ ત્યાં છે જ નહીં — કોઈએ જવાબ ન આપ્યો.',
      en: 'The way is known, but whoever was supposed to take it on is not there — nobody answered.',
    },
    exam: {
      gu: 'Next-hop IP માટે ARP resolve થતું નથી — એ સરનામું આ segment પર કોઈ ધરાવતું નથી.',
      en: 'ARP cannot resolve the next-hop IP — nothing on that segment owns the address.',
    },
  },
  'iface-down': {
    beginner: {
      gu: 'જે દરવાજેથી બહાર નીકળવાનું હતું એ દરવાજો જ બંધ કરી દેવાયો છે.',
      en: 'The door it was supposed to leave through has been shut.',
    },
    exam: {
      gu: 'Egress interface administratively down છે (shutdown), એટલે forwarding શક્ય નથી.',
      en: 'The egress interface is administratively down (shutdown), so forwarding is impossible.',
    },
  },
  'link-down': {
    beginner: {
      gu: 'વાયર તૂટેલો છે — અથવા સામેના છેડે દરવાજો બંધ છે. રસ્તો છે, પણ ચાલી શકાય એમ નથી.',
      en: 'The cable is cut — or the far end is shut. The road exists but it cannot be walked.',
    },
    exam: {
      gu: 'Line protocol down છે: physical link કપાયેલો છે કે remote interface shutdown છે.',
      en: 'Line protocol is down: the physical link is cut or the remote interface is shut.',
    },
  },
  'ttl-exceeded': {
    beginner: {
      gu: 'Packet ગોળ ગોળ ફર્યા કરે છે — એક router બીજાને મોકલે, બીજો પાછો પહેલાને. આ routing loop છે.',
      en: 'The packet is going round in circles — one router sends it to the next, which sends it back. This is a routing loop.',
    },
    exam: {
      gu: 'TTL શૂન્ય થઈ ગયું. Routing loop છે — સામાન્ય રીતે ખોટી static route કે redistribution ને કારણે.',
      en: 'TTL hit zero. There is a routing loop, usually from a bad static route or redistribution.',
    },
  },
  'acl-denied': {
    beginner: {
      gu: 'દરવાજા પર ચોકીદાર બેઠો છે અને એણે આ packet ને અંદર જવા ન દીધું. નેટવર્ક બરાબર છે — એક નિયમ એને રોકી રહ્યો છે.',
      en: 'A guard is sitting at the door and turned this packet away. The network is fine — a rule is stopping it.',
    },
    exam: {
      gu: 'Access list એ packet drop કર્યું. યાદ રાખો કે દરેક ACL ના છેડે અદૃશ્ય "deny ip any any" હોય છે.',
      en: 'An access list dropped the packet. Remember the invisible "deny ip any any" at the end of every ACL.',
    },
  },
  'no-ip-routing': {
    beginner: {
      gu: 'આ switch બે VLAN ને જોડી શકે એમ નથી. એ ફક્ત એક જ VLAN ની અંદર frame આમતેમ કરે છે — જુદાં VLAN જોડવા માટે routing ચાલુ કરવું પડે.',
      en: 'This switch cannot join two VLANs. It only moves frames within one VLAN — joining different VLANs needs routing turned on.',
    },
    exam: {
      gu: 'Switch પર ip routing enable નથી, એટલે SVIs વચ્ચે inter-VLAN routing થતું નથી.',
      en: 'ip routing is not enabled on the switch, so no inter-VLAN routing happens between the SVIs.',
    },
  },
  'no-return-path': {
    beginner: {
      gu: 'Packet સામે છેડે પહોંચી તો ગયું — પણ જવાબ પાછો આવવાનો રસ્તો નથી. એક દિશામાં જ રસ્તો બનાવવો એ સૌથી સામાન્ય ભૂલ છે.',
      en: 'The packet did get there — but the reply has no way home. A route built in one direction only is the most common mistake there is.',
    },
    exam: {
      gu: 'Echo request પહોંચે છે, પણ destination પાસે source network માટે return route નથી, એટલે echo reply drop થાય છે. Routing હંમેશાં બંને દિશામાં તપાસો.',
      en: 'The echo request arrives, but the destination has no return route to the source network, so the echo reply is dropped. Always verify routing in both directions.',
    },
  },
  unreachable: {
    beginner: { gu: 'એ સરનામા સુધી પહોંચવાનો કોઈ રસ્તો નથી.', en: 'There is no way to reach that address.' },
    exam: { gu: 'Destination unreachable.', en: 'Destination unreachable.' },
  },
}

/* ───────────────────────── component ───────────────────────── */

export default function BreakStage({ spec }: { spec: BreakSpec }) {
  const t = useT()
  const mode = useApp((s) => s.mode)
  const [nonce, setNonce] = useState(0)
  const net = useMemo(() => spec.build(), [spec, nonce])

  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [, forceRender] = useState(0)
  const [result, setResult] = useState<{ probe: BreakProbe; r: PingResult } | null>(null)
  const [anim, setAnim] = useState<number | null>(null)
  const raf = useRef<number | null>(null)

  const bump = () => forceRender((n) => n + 1)

  useEffect(() => () => {
    if (raf.current !== null) cancelAnimationFrame(raf.current)
  }, [])

  const toggle = (action: BreakAction) => {
    const next = new Set(applied)
    if (next.has(action.id)) {
      action.revert(net)
      next.delete(action.id)
    } else {
      action.apply(net)
      next.add(action.id)
    }
    setApplied(next)
    setResult(null)
    setAnim(null)
    bump()
  }

  const repairAll = () => {
    setApplied(new Set())
    setResult(null)
    setAnim(null)
    setNonce((n) => n + 1)
  }

  const runProbe = (probe: BreakProbe) => {
    const r = net.ping(probe.from, probe.destIp)
    setResult({ probe, r })
    const segments = Math.max(1, r.hops.length - 1)

    if (raf.current !== null) cancelAnimationFrame(raf.current)
    const started = performance.now()
    const perSegment = 620
    const tick = (now: number) => {
      const p = Math.min(segments, (now - started) / perSegment)
      setAnim(p)
      if (p < segments) raf.current = requestAnimationFrame(tick)
      else raf.current = null
    }
    setAnim(0)
    raf.current = requestAnimationFrame(tick)
  }

  /* ── derived view ── */

  const nodes: NodeSpec[] = spec.layout.map((d) => {
    const dev = net.get(d.id)!
    const ip = dev.activeIfaces()[0]?.ip
    const failedHere = result && !result.r.ok && result.r.failedAt === d.id
    return {
      id: d.id,
      x: d.x,
      y: d.y,
      type: d.type,
      label: dev.name,
      sub: ip ?? '—',
      dim: !ip,
      pulse: !!failedHere,
      accent: failedHere ? 'var(--nq-err)' : d.accent,
    }
  })

  const links: LinkSpec[] = net.links.map((l, i) => {
    const up = net.linkUp(l.a.device, l.a.iface)
    const aIf = net.get(l.a.device)?.iface(l.a.iface)
    const bIf = net.get(l.b.device)?.iface(l.b.iface)
    const shut = aIf?.shutdown || bIf?.shutdown || l.cut
    return {
      id: `l${i}`,
      from: l.a.device,
      to: l.b.device,
      state: up ? 'up' : shut ? 'down' : 'idle',
      label: up ? undefined : t({ gu: 'down', en: 'down' }),
    }
  })

  const packets: PacketSpec[] = []
  if (result && anim !== null) {
    const hops = result.r.hops
    const idx = Math.min(Math.floor(anim), Math.max(0, hops.length - 2))
    const frac = Math.min(1, anim - idx)
    const from = hops[idx]
    const to = hops[idx + 1]
    if (from && to) {
      packets.push({
        id: 'probe',
        from: from.device,
        to: to.device,
        t: ease(frac),
        color: result.r.ok ? 'var(--nq-ok)' : 'var(--nq-warn)',
        label: 'ping',
      })
    } else if (from && !result.r.ok) {
      packets.push({
        id: 'probe',
        from: from.device,
        to: from.device,
        t: 0,
        color: 'var(--nq-err)',
        label: '✕',
      })
    }
  }

  const broken = applied.size > 0
  const finished = result && anim !== null && anim >= Math.max(1, result.r.hops.length - 1)

  return (
    <StageLayout
      note={{ label: t(L.intro), text: t(spec.intro), accent: 'var(--nq-ccnp)' }}
      stage={
        <Topology
          nodes={nodes}
          links={links}
          packets={packets}
          width={spec.viewBox?.w ?? 880}
          height={spec.viewBox?.h ?? 300}
        />
      }
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="nq-chip"
            style={{
              borderColor: broken ? 'var(--nq-err)' : 'var(--nq-ok)',
              color: broken ? 'var(--nq-err)' : 'var(--nq-ok)',
            }}
          >
            {broken ? t(L.broken) : t(L.healthy)}
          </span>
          <button
            onClick={repairAll}
            disabled={!broken}
            className="nq-focus ml-auto rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-[11px] text-[var(--nq-text-mute)] transition hover:text-[var(--nq-text)] disabled:opacity-40"
          >
            ↺ {t(L.repairAll)}
          </button>
        </div>
      }
      narration={
        <div className="nq-panel p-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
            {t(L.faults)}
          </h3>
          <div className="mt-3 space-y-2">
            {spec.actions.map((a) => {
              const on = applied.has(a.id)
              return (
                <div key={a.id}>
                  <button
                    onClick={() => toggle(a)}
                    className="nq-focus flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition"
                    style={{
                      borderColor: on ? 'var(--nq-err)' : 'var(--nq-border)',
                      background: on ? 'color-mix(in srgb, var(--nq-err) 10%, transparent)' : 'transparent',
                    }}
                  >
                    <span
                      className="mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition"
                      style={{ background: on ? 'var(--nq-err)' : 'var(--nq-border-2)' }}
                    >
                      <span
                        className="h-4 w-4 rounded-full bg-white transition"
                        style={{ transform: on ? 'translateX(16px)' : 'translateX(0)' }}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{t(a.label)}</span>
                      <span className="nq-prose mt-0.5 block text-sm text-[var(--nq-text-dim)]">
                        {rich(t(a.explain))}
                      </span>
                    </span>
                  </button>
                  {on && (
                    <p
                      className="nq-prose mt-1.5 rounded-lg px-3 py-2 text-sm"
                      style={{
                        background: 'color-mix(in srgb, var(--nq-warn) 10%, transparent)',
                        color: 'var(--nq-text-dim)',
                      }}
                    >
                      <strong style={{ color: 'var(--nq-warn)' }}>{t(L.expect)}: </strong>
                      {t(a.expect)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      }
      surface={
        <>
          <div className="nq-panel p-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
              {t(L.probes)}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {spec.probes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => runProbe(p)}
                  className="nq-focus nq-mono rounded-lg border border-[var(--nq-border-2)] px-3 py-2 text-xs font-semibold text-[var(--nq-text-dim)] transition hover:border-[var(--nq-accent)] hover:text-[var(--nq-text)]"
                >
                  ▶ {t(p.label)}
                </button>
              ))}
            </div>

            {result && (
              <div className="mt-4">
                <h4 className="nq-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nq-text-mute)]">
                  {t(L.path)}
                </h4>
                <ol className="mt-2 space-y-1">
                  {result.r.hops.map((h, i) => {
                    const last = i === result.r.hops.length - 1
                    const noReturn = result.r.failure === 'no-return-path'
                    const bad = !result.r.ok && last && !noReturn
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
                        <span
                          style={{
                            color: bad
                              ? 'var(--nq-err)'
                              : last && noReturn
                                ? 'var(--nq-warn)'
                                : 'var(--nq-text)',
                          }}
                        >
                          {h.deviceName}
                        </span>
                        {h.outIface && (
                          <span className="text-[var(--nq-text-mute)]">
                            → {h.outIface}
                            {h.nextHopIp ? ` (${h.nextHopIp})` : ''}
                          </span>
                        )}
                        {last && (
                          <span
                            className="ml-auto text-[10px] uppercase tracking-wider"
                            style={{
                              color: result.r.ok
                                ? 'var(--nq-ok)'
                                : noReturn
                                  ? 'var(--nq-warn)'
                                  : 'var(--nq-err)',
                            }}
                          >
                            {result.r.ok ? t(L.reached) : noReturn ? t(L.replyBlocked) : t(L.stopped)}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ol>

                {finished && (
                  <div
                    className="mt-3 rounded-xl p-3"
                    style={{
                      background: result.r.ok
                        ? 'color-mix(in srgb, var(--nq-ok) 12%, transparent)'
                        : 'color-mix(in srgb, var(--nq-err) 12%, transparent)',
                    }}
                  >
                    <p
                      className="nq-mono text-xs font-bold"
                      style={{ color: result.r.ok ? 'var(--nq-ok)' : 'var(--nq-err)' }}
                    >
                      {result.r.ok
                        ? '!!!!!  Success rate is 100 percent'
                        : '.....  Success rate is 0 percent'}
                    </p>
                    {!result.r.ok && result.r.failure && (
                      <p className="nq-prose mt-1.5 text-sm text-[var(--nq-text-dim)]">
                        {t(
                          mode === 'beginner'
                            ? FAILURE[result.r.failure].beginner
                            : FAILURE[result.r.failure].exam,
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="nq-panel p-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
              {t(L.tables)}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {spec.layout
                .filter((d) => net.get(d.id)?.kind === 'router' || net.get(d.id)?.kind === 'switch')
                .map((d) => {
                  const dev = net.get(d.id)!
                  const routes = dev.installedRoutes().filter((r) => r.source !== 'L')
                  return (
                    <div key={d.id}>
                      <p className="nq-mono mb-1 text-[11px] font-bold text-[var(--nq-text-dim)]">
                        {dev.name}
                      </p>
                      {routes.length === 0 ? (
                        <p className="nq-mono text-[11px] text-[var(--nq-text-mute)]">(empty)</p>
                      ) : (
                        <table className="nq-mono w-full text-[11px]">
                          <tbody>
                            {routes.map((r, i) => (
                              <tr key={i}>
                                <td className="w-5 py-0.5" style={{ color: 'var(--nq-accent)' }}>
                                  {r.source}
                                </td>
                                <td className="py-0.5 pr-2">{cidr(r.prefix, r.mask)}</td>
                                <td className="py-0.5 text-right text-[var(--nq-text-mute)]">
                                  {r.nextHop ?? r.iface}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        </>
      }
    />
  )
}
