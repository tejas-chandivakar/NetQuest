import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useT } from '../lib/i18n'

/**
 * The one shape every stage uses — Learn, Configure and Break it all render
 * through this, so moving between the tabs never rearranges the page.
 *
 * It is a theatre, not a scroll: the drawing sits on the left with its height
 * capped, and the reading rail on the right holds the narration and the live
 * working surface. Both are on screen at the same time, because the whole
 * point is to watch a panel change while the animation is still running.
 */
export interface StageLayoutProps {
  /** the coloured strip at the top — why this matters, or what to do */
  note?: { label: string; text: string; accent: string }
  /** the drawing */
  stage: ReactNode
  /** controls sitting directly under the drawing, inside the same panel */
  controls?: ReactNode
  /** progress through the stage — step list or task list, under the drawing */
  progress?: ReactNode
  /** top of the rail: what is happening right now */
  narration: ReactNode
  /** the rail's working surface — live table, terminal, probes */
  surface: ReactNode
  /** full width, under everything */
  footer?: ReactNode
  /** an overlay drawn across the whole theatre (the cause-and-effect line) */
  overlay?: ReactNode
  /** given the container and stage elements so an overlay can measure them */
  refs?: {
    container?: React.RefObject<HTMLDivElement | null>
    stage?: React.RefObject<HTMLDivElement | null>
    surface?: React.RefObject<HTMLDivElement | null>
  }
}

const L = {
  focus: { gu: 'ફોકસ', en: 'Focus' },
  exit: { gu: 'બંધ કરો', en: 'Exit focus' },
  hint: { gu: 'Esc દબાવો', en: 'press Esc' },
}

/**
 * The lead paragraph sits on the page, not inside a panel. A box around prose
 * reads as chrome; the same words set large and plain read as the author
 * talking — which is what the opening of a lesson should be.
 */
export function StageNote({ label, text, accent }: { label: string; text: string; accent: string }) {
  return (
    <div className="max-w-[46em] px-1 py-1">
      <span
        className="text-[11px] font-bold uppercase tracking-[0.13em]"
        style={{ color: accent }}
      >
        {label}
      </span>
      <p className="mt-1.5 text-[1.0625rem] leading-[1.75] text-[var(--nq-text-dim)]">{text}</p>
    </div>
  )
}

export default function StageLayout({
  note,
  stage,
  controls,
  progress,
  narration,
  surface,
  footer,
  overlay,
  refs,
}: StageLayoutProps) {
  const t = useT()
  const [focus, setFocus] = useState(false)

  const ownContainer = useRef<HTMLDivElement | null>(null)
  const ownStage = useRef<HTMLDivElement | null>(null)
  const ownSurface = useRef<HTMLDivElement | null>(null)
  const containerRef = refs?.container ?? ownContainer
  const stageRef = refs?.stage ?? ownStage
  const surfaceRef = refs?.surface ?? ownSurface

  useEffect(() => {
    if (!focus) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFocus(false)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [focus])

  const theatre = (
    <div
      ref={containerRef}
      className={
        focus
          ? 'relative grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]'
          : 'relative grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]'
      }
    >
      {/* left: the drawing, its controls and the running order */}
      <div className={focus ? 'flex min-h-0 flex-col gap-4' : 'space-y-4'}>
        <div className={focus ? 'nq-panel flex min-h-0 flex-1 flex-col overflow-hidden' : 'nq-panel overflow-hidden'}>
          <div
            ref={stageRef}
            className="flex items-center justify-center bg-[color-mix(in_srgb,var(--nq-bg-2)_70%,transparent)] p-1"
            style={{ maxHeight: focus ? undefined : '56vh', minHeight: 0, flex: focus ? '1 1 0' : undefined }}
          >
            {stage}
          </div>
          {controls && <div className="border-t border-[var(--nq-border)] p-4">{controls}</div>}
        </div>
        {progress && !focus && progress}
      </div>

      {/* right: the reading rail — what is happening, and the surface it happens on */}
      <div className={focus ? 'flex min-h-0 flex-col gap-4 overflow-y-auto' : 'space-y-4'}>
        {narration}
        <div ref={surfaceRef} className={focus ? 'space-y-4' : 'space-y-4'}>
          {surface}
        </div>
      </div>

      {overlay}
    </div>
  )

  if (focus) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col gap-4 bg-[var(--nq-bg)] p-5">
        <div className="flex items-center gap-3">
          <span className="nq-mono text-[11px] uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
            {t(L.focus)}
          </span>
          <button
            onClick={() => setFocus(false)}
            className="nq-focus ml-auto rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-xs font-semibold text-[var(--nq-text-dim)] transition hover:text-[var(--nq-text)]"
          >
            {t(L.exit)} · {t(L.hint)}
          </button>
        </div>
        {theatre}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {note && <StageNote {...note} />}
      <div className="flex justify-end">
        <button
          onClick={() => setFocus(true)}
          className="nq-focus flex items-center gap-1.5 rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-[11px] font-semibold text-[var(--nq-text-mute)] transition hover:text-[var(--nq-text)]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" strokeLinecap="round" />
          </svg>
          {t(L.focus)}
        </button>
      </div>
      {theatre}
      {footer}
    </div>
  )
}
