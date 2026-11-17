import { useState } from 'react'
import type { Network } from '../engine/network'
import type { ConfigDeviceLayout } from './ConfigureStage'
import { partsFor } from '../lib/deviceParts'
import { rich } from './Prose'
import { useT } from '../lib/i18n'
import { useApp } from '../store/useApp'

/**
 * A key to the drawing, sitting directly under it.
 *
 * Every stage shows a topology of four or five icons and then talks about
 * them by name, which assumes the reader already knows which icon starts a
 * conversation and which one is the way out. For the Foundation track that is
 * precisely what they came to find out, so the names, the addresses and the
 * job each box does are spelled out beside the picture.
 */

const L = {
  title: { gu: 'આ નેટવર્ક પર શું છે', en: 'What’s on this network' },
  show: { gu: 'બતાવો', en: 'Show' },
  hide: { gu: 'છુપાવો', en: 'Hide' },
}

export default function PartsList({
  net,
  layout,
}: {
  net: Network
  layout: ConfigDeviceLayout[]
}) {
  const t = useT()
  const mode = useApp((s) => s.mode)
  // a beginner needs the key open; someone revising knows a router on sight
  const [open, setOpen] = useState(mode === 'beginner')

  const accentOf = new Map(layout.map((d) => [d.id, d.accent ?? 'var(--nq-accent)']))
  const parts = partsFor(
    net,
    layout.map((d) => d.id),
    mode,
  )
  if (!parts.length) return null

  return (
    <div className="nq-panel p-5">
      <div className="flex items-center gap-3">
        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
          {t(L.title)}
        </h3>
        <button
          onClick={() => setOpen((v) => !v)}
          className="nq-focus ml-auto rounded-lg border border-[var(--nq-border-2)] px-2.5 py-1 text-[11px] text-[var(--nq-text-mute)] transition hover:text-[var(--nq-text)]"
        >
          {t(open ? L.hide : L.show)}
        </button>
      </div>

      {open && (
        <ul className="mt-3 space-y-3">
          {parts.map((p) => {
            const accent = accentOf.get(p.id) ?? 'var(--nq-accent)'
            return (
              <li
                key={p.id}
                className="border-t border-[var(--nq-border)] pt-3 first:border-0 first:pt-0"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span
                    className="nq-mono rounded px-1.5 py-px text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: `color-mix(in srgb, ${accent} 16%, transparent)`,
                      color: accent,
                    }}
                  >
                    {p.name}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--nq-text-mute)]">
                    {t(p.role)}
                  </span>
                </div>

                {p.what && (
                  <p className="nq-prose mt-1.5 text-sm text-[var(--nq-text-dim)]">
                    {rich(t(p.what))}
                  </p>
                )}

                {p.facts.length > 0 && (
                  <dl className="mt-2 space-y-1">
                    {p.facts.map((f, i) => (
                      <div key={i} className="flex items-baseline gap-3 text-[11.5px]">
                        <dt className="shrink-0 text-[var(--nq-text-mute)]">{t(f.label)}</dt>
                        <dd className="nq-mono ml-auto text-right text-[var(--nq-text-dim)]">
                          {f.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
