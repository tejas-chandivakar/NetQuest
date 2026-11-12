import { useState } from 'react'
import { useT } from '../lib/i18n'
import { useApp } from '../store/useApp'

/**
 * Eight bulbs you can switch on and off.
 *
 * Subnetting is where most people stall, and the reason is almost always that
 * binary was read rather than handled. Clicking a bulb and watching the number
 * move teaches in seconds what a table of powers never does.
 */
const BITS = [128, 64, 32, 16, 8, 4, 2, 1]

const L = {
  title: { gu: 'આઠ બલ્બ', en: 'Eight bulbs' },
  lead: {
    gu: 'કોઈ પણ બલ્બ દબાવો. જે ચાલુ હોય એની કિંમત ઉમેરાય — બસ આટલું જ binary છે.',
    en: 'Press any bulb. The ones that are on get added up — that is all binary is.',
  },
  value: { gu: 'કિંમત', en: 'Value' },
  sum: { gu: 'સરવાળો', en: 'Adding up' },
  nothing: { gu: 'બધા બંધ છે, એટલે શૂન્ય.', en: 'All off, so zero.' },
  asMask: { gu: 'આ mask તરીકે', en: 'As a subnet mask' },
  notMask: {
    gu: 'Mask માં ચાલુ બલ્બ ડાબેથી સળંગ હોવા જોઈએ — વચ્ચે ખાડો ન ચાલે.',
    en: 'In a mask the lit bulbs must run from the left with no gap in between.',
  },
  prefix: { gu: 'એટલે', en: 'which is' },
  tryTitle: { gu: 'જાતે બનાવો', en: 'Build it yourself' },
  make: { gu: 'આ આંકડો બનાવો', en: 'Make this number' },
  got: { gu: 'બરાબર!', en: 'Got it.' },
  next: { gu: 'બીજો આંકડો', en: 'Another number' },
  common: { gu: 'વારંવાર કામ લાગે એવા', en: 'The ones you will keep meeting' },
}

const TARGETS = [192, 224, 240, 248, 252, 128, 200, 172, 10, 255]

function bulbsFor(n: number) {
  return BITS.map((b) => (n & b) !== 0)
}

export default function BinaryBulbs() {
  const t = useT()
  const mode = useApp((s) => s.mode)
  const [on, setOn] = useState<boolean[]>(Array(8).fill(false))
  const [target, setTarget] = useState(192)

  const total = BITS.reduce((acc, b, i) => acc + (on[i] ? b : 0), 0)
  const lit = BITS.filter((_, i) => on[i])

  // a mask is a run of ones from the left; anything else is just a number
  const firstOff = on.indexOf(false)
  const contiguous = firstOff === -1 || !on.slice(firstOff).includes(true)
  const prefix = on.filter(Boolean).length

  const toggle = (i: number) =>
    setOn((prev) => prev.map((v, j) => (j === i ? !v : v)))

  const solved = total === target

  return (
    <div className="space-y-4">
      <div className="max-w-[46em] px-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--nq-accent)]">
          {t(L.title)}
        </span>
        <p className="mt-1.5 text-[1.0625rem] leading-[1.75] text-[var(--nq-text-dim)]">{t(L.lead)}</p>
      </div>

      <div className="nq-panel p-6">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {BITS.map((b, i) => (
            <button
              key={b}
              onClick={() => toggle(i)}
              aria-pressed={on[i]}
              className="nq-focus flex w-[62px] flex-col items-center gap-1.5 rounded-xl border-2 py-3 transition sm:w-[72px]"
              style={{
                borderColor: on[i] ? 'var(--nq-accent)' : 'var(--nq-border-2)',
                background: on[i]
                  ? 'color-mix(in srgb, var(--nq-accent) 12%, transparent)'
                  : 'var(--nq-panel-2)',
              }}
            >
              <span
                className="nq-mono text-xl font-bold"
                style={{ color: on[i] ? 'var(--nq-accent)' : 'var(--nq-text-mute)' }}
              >
                {on[i] ? 1 : 0}
              </span>
              <span
                className="nq-mono text-[11px]"
                style={{ color: on[i] ? 'var(--nq-text-dim)' : 'var(--nq-text-mute)' }}
              >
                {b}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
          <span className="nq-mono text-[13px] text-[var(--nq-text-mute)]">{t(L.sum)}</span>
          <span className="nq-mono text-[15px] text-[var(--nq-text-dim)]">
            {lit.length ? lit.join(' + ') : '0'}
          </span>
          <span className="nq-mono text-[15px] text-[var(--nq-text-mute)]">=</span>
          <span className="nq-mono text-4xl font-extrabold text-[var(--nq-text)]">{total}</span>
        </div>

        <p className="nq-mono mt-2 text-center text-[12.5px] text-[var(--nq-text-mute)]">
          {on.map((v) => (v ? 1 : 0)).join('')}
          {lit.length === 0 && ` — ${t(L.nothing)}`}
        </p>

        <div
          className="mt-5 rounded-xl px-4 py-3 text-center"
          style={{
            background: contiguous
              ? 'color-mix(in srgb, var(--nq-ok) 10%, transparent)'
              : 'color-mix(in srgb, var(--nq-warn) 10%, transparent)',
          }}
        >
          <p className="nq-prose text-[13px] text-[var(--nq-text-dim)]">
            <strong style={{ color: contiguous ? 'var(--nq-ok)' : 'var(--nq-warn)' }}>
              {t(L.asMask)}:{' '}
            </strong>
            {contiguous ? (
              <span className="nq-mono">
                255.255.255.{total} {t(L.prefix)} /{24 + prefix}
              </span>
            ) : (
              t(L.notMask)
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="nq-panel p-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
            {t(L.tryTitle)}
          </h3>
          <p className="nq-prose mt-2 text-sm text-[var(--nq-text-dim)]">
            {t(L.make)}: <span className="nq-mono text-xl font-bold text-[var(--nq-text)]">{target}</span>
          </p>
          {solved && (
            <p className="nq-prose mt-2 text-sm font-semibold" style={{ color: 'var(--nq-ok)' }}>
              ✓ {t(L.got)}{' '}
              <span className="nq-mono font-normal text-[var(--nq-text-dim)]">
                {lit.join(' + ')} = {total}
              </span>
            </p>
          )}
          <button
            onClick={() => {
              const next = TARGETS[Math.floor(Math.random() * TARGETS.length)]
              setTarget(next === target ? TARGETS[0] : next)
              setOn(Array(8).fill(false))
            }}
            className="nq-focus mt-3 rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-xs font-semibold text-[var(--nq-text-dim)] transition hover:text-[var(--nq-text)]"
          >
            {t(L.next)}
          </button>
        </div>

        <div className="nq-panel p-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
            {t(L.common)}
          </h3>
          <table className="nq-mono mt-3 w-full text-[12px]">
            <tbody>
              {[128, 192, 224, 240, 248, 252, 254, 255].map((n) => (
                <tr key={n} className="border-t border-[var(--nq-border)] first:border-0">
                  <td className="py-1 pr-2 text-[var(--nq-text)]">{n}</td>
                  <td className="py-1 pr-2 text-[var(--nq-text-mute)]">
                    {bulbsFor(n)
                      .map((v) => (v ? 1 : 0))
                      .join('')}
                  </td>
                  <td className="py-1 text-right text-[var(--nq-text-dim)]">
                    /{24 + bulbsFor(n).filter(Boolean).length}
                  </td>
                  <td className="w-16 py-1 text-right">
                    <button
                      onClick={() => setOn(bulbsFor(n))}
                      className="nq-focus rounded px-1.5 py-0.5 text-[10px] text-[var(--nq-accent)]"
                    >
                      {mode === 'beginner' ? '→' : 'show'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
