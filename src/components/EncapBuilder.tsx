import { useState } from 'react'
import { useT } from '../lib/i18n'

/**
 * Wrap the data, then unwrap it.
 *
 * The animation shows encapsulation happening; this makes the learner do it,
 * and refuses the wrong order. Putting the IP header on before the port header
 * is the mistake worth making here rather than in an exam.
 */
interface Layer {
  id: string
  n: number
  name: { gu: string; en: string }
  adds: { gu: string; en: string }
  becomes: { gu: string; en: string }
  tone: string
}

const LAYERS: Layer[] = [
  {
    id: 'app',
    n: 7,
    name: { gu: 'Application', en: 'Application' },
    adds: { gu: 'તમારો સંદેશ', en: 'your message' },
    becomes: { gu: 'Data', en: 'Data' },
    tone: 'var(--nq-ccnp)',
  },
  {
    id: 'tcp',
    n: 4,
    name: { gu: 'Transport', en: 'Transport' },
    adds: { gu: 'કયા દરવાજે — port નંબર', en: 'which door — port numbers' },
    becomes: { gu: 'Segment', en: 'Segment' },
    tone: 'var(--nq-pkt-tcp)',
  },
  {
    id: 'ip',
    n: 3,
    name: { gu: 'Network', en: 'Network' },
    adds: { gu: 'કયા ઘરે — IP સરનામાં', en: 'which house — IP addresses' },
    becomes: { gu: 'Packet', en: 'Packet' },
    tone: 'var(--nq-accent)',
  },
  {
    id: 'eth',
    n: 2,
    name: { gu: 'Data Link', en: 'Data Link' },
    adds: { gu: 'આ લિંક પર કોને — MAC', en: 'who on this link — MAC addresses' },
    becomes: { gu: 'Frame', en: 'Frame' },
    tone: 'var(--nq-ok)',
  },
  {
    id: 'phy',
    n: 1,
    name: { gu: 'Physical', en: 'Physical' },
    adds: { gu: 'વાયર પર 1 અને 0', en: '1s and 0s on the wire' },
    becomes: { gu: 'Bits', en: 'Bits' },
    tone: 'var(--nq-warn)',
  },
]

const L = {
  title: { gu: 'જાતે વીંટો, પછી ઉખાડો', en: 'Wrap it, then unwrap it' },
  lead: {
    gu: 'ઉપરથી નીચે એક પછી એક કવર ચઢાવો. ક્રમ ખોટો હોય તો બેસશે નહીં.',
    en: 'Add each envelope from the top down. Out of order, it will not go on.',
  },
  down: { gu: 'મોકલનાર — કવર ચઢાવો', en: 'Sending — wrap it' },
  up: { gu: 'મેળવનાર — કવર ઉખાડો', en: 'Receiving — unwrap it' },
  add: { gu: 'ચઢાવો', en: 'Add' },
  remove: { gu: 'ઉખાડો', en: 'Remove' },
  wrong: { gu: 'એ પહેલાં નહીં — ઉપરના માળથી શરૂ કરો.', en: 'Not that one yet — start from the floor above.' },
  doneDown: { gu: 'વીંટાઈ ગયું. હવે વાયર પર જવા તૈયાર.', en: 'Fully wrapped. Ready for the wire.' },
  doneUp: { gu: 'બધાં કવર ઉખડી ગયાં — અસલ સંદેશ પાછો મળ્યો.', en: 'Every envelope is off. The original message is back.' },
  reset: { gu: 'ફરી શરૂ', en: 'Start again' },
  onTheWire: { gu: 'વાયર પર', en: 'On the wire' },
  nowCalled: { gu: 'હવે એને કહેવાય', en: 'now called' },
}

export default function EncapBuilder() {
  const t = useT()
  const [applied, setApplied] = useState<string[]>([])
  const [unwrapping, setUnwrapping] = useState(false)
  const [slip, setSlip] = useState<string | null>(null)

  const full = applied.length === LAYERS.length
  const nextDown = LAYERS[applied.length]
  // coming back up, the outermost envelope is the one that comes off
  const nextUp = applied.length > 0 ? LAYERS[applied.length - 1] : undefined

  const add = (l: Layer) => {
    if (l.id !== nextDown?.id) {
      setSlip(l.id)
      setTimeout(() => setSlip(null), 1200)
      return
    }
    const next = [...applied, l.id]
    setApplied(next)
    if (next.length === LAYERS.length) setUnwrapping(true)
  }

  const remove = (l: Layer) => {
    if (l.id !== nextUp?.id) {
      setSlip(l.id)
      setTimeout(() => setSlip(null), 1200)
      return
    }
    setApplied(applied.slice(0, -1))
  }

  const current = applied.length ? LAYERS[applied.length - 1] : undefined

  return (
    <div className="space-y-4">
      <div className="max-w-[46em] px-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--nq-accent)]">
          {t(L.title)}
        </span>
        <p className="mt-1.5 text-[1.0625rem] leading-[1.75] text-[var(--nq-text-dim)]">{t(L.lead)}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="nq-panel p-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
            {unwrapping ? t(L.up) : t(L.down)}
          </h3>

          <div className="mt-4 space-y-1.5">
            {LAYERS.map((l) => {
              const on = applied.includes(l.id)
              const isNext = unwrapping ? l.id === nextUp?.id : l.id === nextDown?.id
              const shaking = slip === l.id
              return (
                <button
                  key={l.id}
                  onClick={() => (unwrapping ? remove(l) : add(l))}
                  className="nq-focus flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition"
                  style={{
                    borderColor: shaking
                      ? 'var(--nq-err)'
                      : on
                        ? l.tone
                        : isNext
                          ? 'var(--nq-border-2)'
                          : 'var(--nq-border)',
                    background: on ? `color-mix(in srgb, ${l.tone} 11%, transparent)` : 'transparent',
                    opacity: !on && !isNext ? 0.55 : 1,
                  }}
                >
                  <span
                    className="nq-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                    style={{
                      background: on ? l.tone : 'var(--nq-panel-2)',
                      color: on ? 'var(--nq-on-accent)' : 'var(--nq-text-mute)',
                    }}
                  >
                    {l.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[var(--nq-text)]">{t(l.name)}</span>
                    <span className="block text-[12px] text-[var(--nq-text-mute)]">{t(l.adds)}</span>
                  </span>
                  {isNext && (
                    <span
                      className="nq-mono shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase"
                      style={{
                        background: 'color-mix(in srgb, var(--nq-accent) 15%, transparent)',
                        color: 'var(--nq-accent)',
                      }}
                    >
                      {unwrapping ? t(L.remove) : t(L.add)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {slip && (
            <p className="nq-prose mt-3 text-sm" style={{ color: 'var(--nq-err)' }}>
              {t(L.wrong)}
            </p>
          )}

          {(full || (unwrapping && applied.length === 0)) && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p
                className="nq-prose flex-1 text-sm font-semibold"
                style={{ color: 'var(--nq-ok)' }}
              >
                {full ? t(L.doneDown) : t(L.doneUp)}
              </p>
              <button
                onClick={() => {
                  setApplied([])
                  setUnwrapping(false)
                }}
                className="nq-focus rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-xs font-semibold text-[var(--nq-text-dim)] transition hover:text-[var(--nq-text)]"
              >
                ↺ {t(L.reset)}
              </button>
            </div>
          )}
        </div>

        <div className="nq-panel p-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
            {full ? t(L.onTheWire) : t(L.nowCalled)}
          </h3>

          <p className="mt-2 text-center text-xl font-bold text-[var(--nq-text)]">
            {current ? t(current.becomes) : '—'}
          </p>

          <div className="mt-4 space-y-0">
            {applied
              .slice()
              .reverse()
              .map((id) => {
                const l = LAYERS.find((x) => x.id === id)!
                return (
                  <div
                    key={id}
                    className="nq-mono rounded-t-lg border-x-2 border-t-2 px-3 py-1.5 text-[11px] font-bold"
                    style={{
                      borderColor: l.tone,
                      background: `color-mix(in srgb, ${l.tone} 9%, transparent)`,
                      color: l.tone,
                    }}
                  >
                    {t(l.name)} header
                  </div>
                )
              })}
            <div
              className="nq-mono rounded-lg px-3 py-4 text-center text-[12px] font-bold"
              style={{
                background: 'color-mix(in srgb, var(--nq-ccnp) 14%, transparent)',
                color: 'var(--nq-ccnp)',
              }}
            >
              {t(LAYERS[0].adds)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
