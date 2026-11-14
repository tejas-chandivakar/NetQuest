import type { ReactNode } from 'react'
import { useT } from '../lib/i18n'
import type { Bi } from '../data/courses'
import { rich } from './Prose'

/**
 * The shell every Foundation tool sits in.
 *
 * Ten tools written freehand would drift apart within a week — a different
 * heading size here, a reset button somewhere else there. The shape lives
 * here instead, so a tool file only has to contain the idea it is teaching.
 */
export function ToolFrame({
  title,
  lead,
  status,
  onReset,
  resetLabel,
  children,
}: {
  title: Bi
  lead: Bi
  /** the line that reacts to what the learner just did */
  status?: ReactNode
  onReset?: () => void
  resetLabel?: Bi
  children: ReactNode
}) {
  const t = useT()
  return (
    <div className="space-y-4">
      <div className="max-w-[46em] px-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--nq-accent)]">
          {t(title)}
        </span>
        <p className="nq-prose mt-1.5 text-[1.0625rem] leading-[1.75] text-[var(--nq-text-dim)]">
          {rich(t(lead))}
        </p>
      </div>

      <div className="nq-panel p-5">
        {(status || onReset) && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {status}
            {onReset && (
              <button
                onClick={onReset}
                className="nq-focus ml-auto rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-xs font-semibold text-[var(--nq-text-dim)] transition hover:text-[var(--nq-text)]"
              >
                ↺ {t(resetLabel ?? { gu: 'ફરી શરૂ', en: 'Start again' })}
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

/** A small all-caps heading, the same one the stage panels use. */
export function ToolHead({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
      {children}
    </h3>
  )
}

/**
 * What the learner just found out. Three tones, because a tool that only ever
 * says "wrong" teaches nothing: `miss` has to explain, not scold.
 */
export function Verdict({ tone, children }: { tone: 'ok' | 'miss' | 'info'; children: ReactNode }) {
  const colour = tone === 'ok' ? 'var(--nq-ok)' : tone === 'miss' ? 'var(--nq-warn)' : 'var(--nq-info)'
  return (
    <p
      className="nq-prose rounded-lg px-3 py-2 text-sm"
      style={{ color: colour, background: `color-mix(in srgb, ${colour} 8%, transparent)` }}
    >
      {/* A plain string is lesson prose, so `code` and **bold** in it are meant
          to render. Doing it here means no call site has to remember. */}
      {typeof children === 'string' ? rich(children) : children}
    </p>
  )
}

/** A chooser button: the one shape used for every "pick this" in the tools. */
export function Choice({
  on,
  done,
  tone,
  onClick,
  disabled,
  children,
  className = '',
}: {
  on?: boolean
  done?: boolean
  tone?: 'ok' | 'err'
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  className?: string
}) {
  const edge = done
    ? tone === 'err'
      ? 'var(--nq-err)'
      : 'var(--nq-ok)'
    : on
      ? 'var(--nq-accent)'
      : 'var(--nq-border)'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`nq-focus rounded-lg border px-3 py-2 text-left transition disabled:cursor-default ${className}`}
      style={{
        borderColor: edge,
        background: done || on ? `color-mix(in srgb, ${edge} 10%, transparent)` : 'transparent',
      }}
    >
      {children}
    </button>
  )
}
