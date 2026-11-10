import type { ReactNode } from 'react'

/**
 * The one shape every stage uses. Learn, Configure and Break it all render
 * through this, so moving between the tabs never rearranges the page: the
 * same note strip on top, the same drawing, the same two columns underneath.
 */
export interface StageLayoutProps {
  /** the coloured strip at the top — why this matters, or what to do */
  note?: { label: string; text: string; accent: string }
  /** the drawing */
  stage: ReactNode
  /** controls sitting directly under the drawing, inside the same panel */
  controls?: ReactNode
  /** left column: what is happening, or what to do next */
  left: ReactNode
  /** right column: the working surface — table, terminal, probes */
  right: ReactNode
  /** full width, under both columns */
  footer?: ReactNode
}

export function StageNote({ label, text, accent }: { label: string; text: string; accent: string }) {
  return (
    <div className="nq-panel border-l-[3px] p-5" style={{ borderLeftColor: accent }}>
      <h3 className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: accent }}>
        {label}
      </h3>
      <p className="nq-prose mt-2 text-[var(--nq-text-dim)]">{text}</p>
    </div>
  )
}

export default function StageLayout({ note, stage, controls, left, right, footer }: StageLayoutProps) {
  return (
    <div className="space-y-4">
      {note && <StageNote {...note} />}

      <div className="nq-panel overflow-hidden">
        <div className="bg-[color-mix(in_srgb,var(--nq-bg-2)_70%,transparent)]">{stage}</div>
        {controls && <div className="border-t border-[var(--nq-border)] p-5">{controls}</div>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-4">{left}</div>
        <div className="space-y-4">{right}</div>
      </div>

      {footer}
    </div>
  )
}
