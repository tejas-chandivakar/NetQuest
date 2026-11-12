import { Fragment, type ReactNode } from 'react'

/**
 * Lesson text carries command names and emphasis — `conf t`, **never** — and
 * until now those marks reached the screen as literal backticks and asterisks.
 * This renders them, so a command inside a sentence looks like a command.
 *
 * Deliberately only two forms. Lesson text is prose, not a document format,
 * and anything richer would invite writing that belongs in a panel instead.
 */
const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*)/g

export function rich(text: string): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={i}
          className="nq-mono rounded px-[0.3em] py-[0.1em] text-[0.92em]"
          style={{
            background: 'color-mix(in srgb, var(--nq-accent) 10%, transparent)',
            color: 'var(--nq-accent)',
          }}
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-bold text-[var(--nq-text)]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

export default function Prose({
  children,
  className,
  style,
}: {
  children: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <p className={className} style={style}>
      {rich(children)}
    </p>
  )
}
