import { useMemo, useState } from 'react'
import { MODE_NAME, allCommands } from '../engine/cli'
import { useT } from '../lib/i18n'

/**
 * Every command the console understands, searchable, with what each one does.
 * Opens from anywhere in a lesson, so looking something up never costs you
 * your place in the lab.
 */
const L = {
  title: { gu: 'કમાન્ડ યાદી', en: 'Command reference' },
  search: { gu: 'કમાન્ડ કે કામ શોધો…', en: 'search a command or what it does…' },
  none: { gu: 'કશું મળ્યું નહીં.', en: 'Nothing matched.' },
  where: { gu: 'ક્યાં ચાલે', en: 'works in' },
  count: { gu: 'કમાન્ડ', en: 'commands' },
  open: { gu: 'કમાન્ડ યાદી', en: 'Commands' },
  close: { gu: 'બંધ કરો', en: 'Close' },
}

export function CommandReferenceButton() {
  const t = useT()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="nq-focus flex items-center gap-1.5 rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-[11px] font-semibold text-[var(--nq-text-mute)] transition hover:text-[var(--nq-text)]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 5h16M4 12h16M4 19h10" strokeLinecap="round" />
        </svg>
        {t(L.open)}
      </button>
      {open && <CommandReference onClose={() => setOpen(false)} />}
    </>
  )
}

export default function CommandReference({ onClose }: { onClose: () => void }) {
  const t = useT()
  const [q, setQ] = useState('')
  const all = useMemo(() => allCommands(), [])

  const needle = q.trim().toLowerCase()
  const shown = needle
    ? all.filter((c) => {
        const hay = [c.words.join(' '), c.help, c.means?.en ?? '', c.means?.gu ?? ''].join(' ').toLowerCase()
        return hay.includes(needle)
      })
    : all

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[color-mix(in_srgb,var(--nq-bg)_82%,transparent)] p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="nq-panel mt-10 flex max-h-[80vh] w-full max-w-[760px] flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--nq-border)] p-4">
          <h3 className="text-sm font-bold tracking-tight">{t(L.title)}</h3>
          <span className="nq-mono text-[11px] text-[var(--nq-text-mute)]">
            {shown.length} {t(L.count)}
          </span>
          <button
            onClick={onClose}
            className="nq-focus ml-auto rounded-lg border border-[var(--nq-border-2)] px-3 py-1 text-[11px] text-[var(--nq-text-mute)] transition hover:text-[var(--nq-text)]"
          >
            {t(L.close)}
          </button>
        </div>

        <div className="border-b border-[var(--nq-border)] p-4">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(L.search)}
            spellCheck={false}
            className="nq-mono w-full rounded-lg border border-[var(--nq-border-2)] bg-[var(--nq-panel-2)] px-3 py-2 text-[12.5px] text-[var(--nq-text)] outline-none placeholder:text-[var(--nq-text-mute)] focus:border-[var(--nq-accent)]"
          />
        </div>

        <div className="overflow-y-auto p-4">
          {shown.length === 0 ? (
            <p className="nq-prose py-6 text-center text-sm text-[var(--nq-text-mute)]">{t(L.none)}</p>
          ) : (
            <ul className="space-y-2">
              {shown.map((c, i) => (
                <li key={i} className="rounded-xl border border-[var(--nq-border)] px-4 py-3">
                  <p className="nq-mono text-[12.5px] font-semibold text-[var(--nq-text)]">
                    {c.words.join(' ')}
                  </p>
                  <p className="nq-prose mt-1 text-[12.5px] text-[var(--nq-text-dim)]">
                    {c.means ? t(c.means) : c.help}
                  </p>
                  <p className="nq-mono mt-1.5 text-[10px] text-[var(--nq-text-mute)]">
                    {t(L.where)}: {c.modes.map((m) => t(MODE_NAME[m])).join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
