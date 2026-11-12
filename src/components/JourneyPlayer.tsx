import { useState } from 'react'
import { useT } from '../lib/i18n'

/**
 * A journey the learner drives rather than watches.
 *
 * The animation already runs this on a clock. Here each step waits to be
 * asked for, and before it runs the learner picks what should happen next —
 * so the order has to be understood rather than observed.
 */
export interface Beat {
  /** what the learner is choosing between at this point */
  ask: { gu: string; en: string }
  options: { gu: string; en: string }[]
  answer: number
  /** what happens once the right one is picked */
  did: { gu: string; en: string }
  detail?: { gu: string; en: string }
  wrong?: { gu: string; en: string }
}

export interface JourneySpec {
  intro: { gu: string; en: string }
  beats: Beat[]
  done: { gu: string; en: string }
}

const L = {
  title: { gu: 'તમે ચલાવો', en: 'You drive it' },
  step: { gu: 'પગલું', en: 'Step' },
  start: { gu: 'શરૂ કરો', en: 'Start' },
  again: { gu: 'ફરી શરૂ', en: 'Start again' },
  sofar: { gu: 'અત્યાર સુધી', en: 'So far' },
  notYet: { gu: 'હજી નહીં —', en: 'Not yet —' },
}

export default function JourneyPlayer({ spec }: { spec: JourneySpec }) {
  const t = useT()
  const [at, setAt] = useState(0)
  const [history, setHistory] = useState<Beat[]>([])
  const [slip, setSlip] = useState<string | null>(null)

  const beat = spec.beats[at]
  const finished = at >= spec.beats.length

  const choose = (i: number) => {
    if (i !== beat.answer) {
      setSlip(beat.wrong ? t(beat.wrong) : `${t(L.notYet)} ${t(beat.options[beat.answer])}`)
      return
    }
    setSlip(null)
    setHistory((h) => [...h, beat])
    setAt((n) => n + 1)
  }

  return (
    <div className="space-y-4">
      <div className="max-w-[46em] px-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--nq-accent)]">
          {t(L.title)}
        </span>
        <p className="mt-1.5 text-[1.0625rem] leading-[1.75] text-[var(--nq-text-dim)]">{t(spec.intro)}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="nq-panel p-6">
          {finished ? (
            <>
              <p className="text-base font-bold" style={{ color: 'var(--nq-ok)' }}>
                ✓ {t(spec.done)}
              </p>
              <button
                onClick={() => {
                  setAt(0)
                  setHistory([])
                  setSlip(null)
                }}
                className="nq-focus mt-4 rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-xs font-semibold text-[var(--nq-text-dim)] transition hover:text-[var(--nq-text)]"
              >
                ↺ {t(L.again)}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="nq-mono text-[11px] uppercase tracking-wider text-[var(--nq-text-mute)]">
                  {t(L.step)} {at + 1} / {spec.beats.length}
                </span>
                <span className="ml-auto flex gap-1">
                  {spec.beats.map((_, i) => (
                    <span
                      key={i}
                      className="h-1.5 w-5 rounded-full"
                      style={{
                        background: i < at ? 'var(--nq-ok)' : i === at ? 'var(--nq-accent)' : 'var(--nq-border-2)',
                      }}
                    />
                  ))}
                </span>
              </div>

              <p className="mt-3 text-base font-semibold text-[var(--nq-text)]">{t(beat.ask)}</p>

              <div className="mt-4 space-y-2">
                {beat.options.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    className="nq-focus flex w-full items-center gap-3 rounded-xl border border-[var(--nq-border)] px-4 py-3 text-left text-sm transition hover:border-[var(--nq-accent)]"
                  >
                    <span className="nq-mono text-[11px] text-[var(--nq-text-mute)]">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-[var(--nq-text)]">{t(o)}</span>
                  </button>
                ))}
              </div>

              {slip && (
                <p className="nq-prose mt-3 text-sm" style={{ color: 'var(--nq-warn)' }}>
                  {slip}
                </p>
              )}
            </>
          )}
        </div>

        <div className="nq-panel p-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
            {t(L.sofar)}
          </h3>
          {history.length === 0 ? (
            <p className="nq-prose mt-3 text-sm text-[var(--nq-text-mute)]">—</p>
          ) : (
            <ol className="mt-3 space-y-2.5">
              {history.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="nq-mono mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold"
                    style={{ background: 'var(--nq-ok)', color: 'var(--nq-on-accent)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[var(--nq-text)]">{t(b.did)}</span>
                    {b.detail && (
                      <span className="nq-mono block text-[11.5px] text-[var(--nq-text-mute)]">
                        {t(b.detail)}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
