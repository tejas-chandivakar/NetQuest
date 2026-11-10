import { useEffect, useRef, useState } from 'react'
import type { Bi } from '../data/courses'
import type { NodeSpec } from './Topology'
import { useT } from '../lib/i18n'

/**
 * A table that explains itself while it changes.
 *
 * The complaint this answers: a panel quietly fills in while the learner is
 * watching the drawing, and by the time they look down the moment has gone —
 * and even then the heading alone never says what they are looking at.
 *
 * So: rows that changed during the current step stay highlighted for the whole
 * step (not a flash that expires while paused), the header says in words what
 * just happened, and the panel names whose table it is.
 */
export interface LiveTableSpec {
  title: Bi
  /** overrides the generated "what just happened" line */
  caption?: Bi
  /** id of the device this belongs to; inferred from the title when omitted */
  owner?: string
  head: string[]
  rows: string[][]
  /** per-row footnote, keyed by row index */
  notes?: Record<number, Bi>
  /** shown instead of "(empty)" so an empty table is not a dead end */
  empty?: Bi
}

const L = {
  updated: { gu: 'હમણાં બદલાયું', en: 'just updated' },
  view: { gu: 'ની નજરે', en: '· their view' },
  nothingYet: { gu: 'હજી કશું નથી — animation આગળ ચાલશે તેમ ભરાશે.', en: 'Nothing yet — this fills in as the animation runs.' },
  addedOne: { gu: 'એક નવી લીટી ઉમેરાઈ.', en: 'One new line appeared.' },
  addedMany: { gu: 'નવી લીટીઓ ઉમેરાઈ.', en: 'New lines appeared.' },
  changedOne: { gu: 'એક કિંમત બદલાઈ.', en: 'One value changed.' },
  changedMany: { gu: 'કેટલીક કિંમતો બદલાઈ.', en: 'Several values changed.' },
  steady: { gu: 'આ પગલામાં અહીં કશું બદલાયું નથી.', en: 'Nothing changed here during this step.' },
  cleared: { gu: 'ખાલી થઈ ગયું.', en: 'It emptied out.' },
}

const key = (rows: string[][]) => rows.map((r) => r.join('\u0000')).join('\u0001')

export function useRowDiff(rows: string[][], stepKey: string | number, baseRows?: string[][]) {
  // the baseline is the table at the very start of this step, computed rather
  // than captured — so jumping straight to a step still shows what that step
  // did, and pausing never loses the highlight
  const captured = useRef<string[][]>(rows)
  const seenStep = useRef(stepKey)

  if (seenStep.current !== stepKey) {
    seenStep.current = stepKey
    captured.current = rows
  }

  const before = baseRows ?? captured.current
  const beforeKeys = new Set(before.map((r) => r.join('\u0000')))
  const changed = new Set<number>()
  rows.forEach((r, i) => {
    if (!beforeKeys.has(r.join('\u0000'))) changed.add(i)
  })
  return { changed, grew: rows.length > before.length, emptied: rows.length === 0 && before.length > 0 }
}

export default function LiveTable({
  spec,
  stepKey,
  baseRows,
  nodes = [],
  arriving,
  onChange,
}: {
  spec: LiveTableSpec
  stepKey: string | number
  /** the same table at the start of this step, so the diff is deterministic */
  baseRows?: string[][]
  nodes?: NodeSpec[]
  /** node a packet is currently heading to — the last fallback for ownership */
  arriving?: string
  /** fired with the owning node id when rows change, so the stage can point at it */
  onChange?: (ownerId: string | undefined) => void
}) {
  const t = useT()
  const { changed, grew, emptied } = useRowDiff(spec.rows, stepKey, baseRows)

  // Whose table is this? Asked in order of how sure we can be: what the lesson
  // said, what the heading names, who the step is drawing attention to, and
  // finally who a packet is arriving at. Without this a panel is an orphan —
  // a table of values with nothing on screen to attach it to.
  const titled = t(spec.title).toLowerCase()
  const pulsing = nodes.filter((n) => n.pulse)
  const owner =
    nodes.find((n) => n.id === spec.owner) ??
    nodes.find((n) => n.label && titled.includes(n.label.toLowerCase())) ??
    (pulsing.length === 1 ? pulsing[0] : undefined) ??
    (arriving ? nodes.find((n) => n.id === arriving) : undefined)

  const sig = `${stepKey}:${key(spec.rows)}`
  const lastSig = useRef('')
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (lastSig.current === sig) return
    lastSig.current = sig
    // a table that appears for the first time mid-lesson is exactly the moment
    // worth pointing at, so only a genuinely unchanged table is skipped
    if (changed.size === 0) return
    onChange?.(owner?.id)
    setPulse(true)
    const h = setTimeout(() => setPulse(false), 900)
    return () => clearTimeout(h)
    // the signature is the whole dependency: it covers step and contents
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig])

  const caption = spec.caption
    ? t(spec.caption)
    : spec.rows.length === 0
      ? t(spec.empty ?? L.nothingYet)
      : emptied
        ? t(L.cleared)
        : changed.size === 0
          ? t(L.steady)
          : grew
            ? changed.size === 1
              ? t(L.addedOne)
              : t(L.addedMany)
            : changed.size === 1
              ? t(L.changedOne)
              : t(L.changedMany)

  return (
    <div
      className="nq-panel p-5 transition-shadow"
      style={
        pulse
          ? { boxShadow: '0 0 0 2px color-mix(in srgb, var(--nq-accent) 55%, transparent)' }
          : undefined
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="nq-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nq-text-mute)]">
          {t(spec.title)}
        </h3>
        {owner && (
          <span
            className="nq-mono rounded px-1.5 py-px text-[9.5px] uppercase tracking-wider"
            style={{
              background: `color-mix(in srgb, ${owner.accent ?? 'var(--nq-accent)'} 16%, transparent)`,
              color: owner.accent ?? 'var(--nq-accent)',
            }}
          >
            {owner.label}
            {t(L.view)}
          </span>
        )}
        {changed.size > 0 && (
          <span
            className="nq-mono ml-auto rounded px-1.5 py-px text-[9.5px] uppercase tracking-wider"
            style={{
              background: 'color-mix(in srgb, var(--nq-accent) 18%, transparent)',
              color: 'var(--nq-accent)',
            }}
          >
            ● {t(L.updated)}
          </span>
        )}
      </div>

      <p className="nq-prose mt-1.5 text-[12.5px] text-[var(--nq-text-dim)]">{caption}</p>

      {spec.rows.length === 0 ? (
        <p
          className="nq-mono mt-3 rounded-lg px-3 py-4 text-center text-[11px] text-[var(--nq-text-mute)]"
          style={{ background: 'var(--nq-panel-2)' }}
        >
          {t(spec.empty ?? L.nothingYet)}
        </p>
      ) : (
        <table className="nq-mono mt-3 w-full text-[11.5px]">
          <thead>
            <tr>
              {spec.head.map((h, i) => (
                <th key={i} className="pb-1 pr-3 text-left font-normal text-[var(--nq-text-mute)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spec.rows.map((r, i) => {
              const isNew = changed.has(i)
              const note = spec.notes?.[i]
              return (
                <tr
                  key={i}
                  className="border-t border-[var(--nq-border)]"
                  style={{
                    background: isNew
                      ? 'color-mix(in srgb, var(--nq-accent) 13%, transparent)'
                      : undefined,
                    transition: 'background 320ms',
                  }}
                >
                  {r.map((c, j) => (
                    <td
                      key={j}
                      className="py-1 pr-3 align-top"
                      style={{ color: isNew ? 'var(--nq-text)' : 'var(--nq-text-dim)' }}
                    >
                      {j === 0 && isNew && (
                        <span className="mr-1.5" style={{ color: 'var(--nq-accent)' }}>
                          ▸
                        </span>
                      )}
                      {c}
                      {j === r.length - 1 && note && (
                        <span className="mt-0.5 block text-[10px] text-[var(--nq-text-mute)]">
                          {t(note)}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
