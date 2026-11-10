import type { Bi } from '../data/courses'
import { explainCommand } from '../engine/cli'
import { useT } from '../lib/i18n'

/**
 * The commands a task needs, with what each one does, written out instead of
 * hidden behind three clicks of Hint.
 *
 * Beginner mode shows this; Exam mode gets the hint ladder instead, because
 * recalling the command is the thing being practised there.
 */
const L = {
  title: { gu: 'આ કામ માટેના કમાન્ડ', en: 'Commands for this task' },
  tap: { gu: 'કોઈ પણ લીટી પર ટેપ કરો — terminal માં ભરાઈ જશે', en: 'Tap any line to drop it into the console' },
  typed: { gu: 'લખાઈ ગયું', en: 'typed' },
  unknown: { gu: 'આ લીટી જાતે લખો', en: 'type this line as it is' },
}

export default function CommandList({
  commands,
  typed,
  onPick,
}: {
  commands: string[]
  /** lines already entered in this lab, lower-cased and trimmed */
  typed: Set<string>
  onPick: (line: string) => void
}) {
  const t = useT()
  if (commands.length === 0) return null

  return (
    <div className="nq-panel p-5">
      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
        {t(L.title)}
      </h3>
      <p className="nq-prose mt-1.5 text-[12px] text-[var(--nq-text-mute)]">{t(L.tap)}</p>

      <ol className="mt-3 space-y-1.5">
        {commands.map((c, i) => {
          const done = typed.has(c.trim().toLowerCase())
          const info = explainCommand(c)
          const means: Bi | undefined = info?.means
          return (
            <li key={`${c}-${i}`}>
              <button
                onClick={() => onPick(c)}
                className="nq-focus group flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition"
                style={{
                  borderColor: done ? 'color-mix(in srgb, var(--nq-ok) 40%, transparent)' : 'var(--nq-border)',
                  background: done ? 'color-mix(in srgb, var(--nq-ok) 8%, transparent)' : 'transparent',
                }}
              >
                <span
                  className="nq-mono mt-0.5 flex shrink-0 items-center justify-center rounded text-[10px]"
                  style={{
                    width: 18,
                    height: 18,
                    background: done ? 'var(--nq-ok)' : 'var(--nq-panel-2)',
                    color: done ? 'var(--nq-bg)' : 'var(--nq-text-mute)',
                  }}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="nq-mono block text-[12.5px]"
                    style={{ color: done ? 'var(--nq-text-mute)' : 'var(--nq-text)' }}
                  >
                    {c}
                  </span>
                  <span className="nq-prose mt-0.5 block text-[11.5px] text-[var(--nq-text-mute)]">
                    {means ? t(means) : t(L.unknown)}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
