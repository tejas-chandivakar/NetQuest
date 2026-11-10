import { useEffect } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { applyModeToDocument, useApp } from '../store/useApp'
import { TRACKS } from '../data/courses'
import { UI, useT } from '../lib/i18n'

function Logo() {
  return (
    <Link to="/" className="nq-focus flex items-center gap-2.5 rounded-lg">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="1.5" y="1.5" width="29" height="29" rx="9" stroke="var(--nq-accent)" strokeWidth="1.6" />
        <circle cx="16" cy="8.5" r="2.8" fill="var(--nq-accent)" />
        <circle cx="8" cy="22" r="2.8" fill="var(--nq-ccnp)" />
        <circle cx="24" cy="22" r="2.8" fill="var(--nq-beginner)" />
        <path
          d="M16 11.3 L8 19.2 M16 11.3 L24 19.2 M10.8 22 L21.2 22"
          stroke="var(--nq-text-dim)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[17px] font-extrabold tracking-tight">
        Net<span className="text-[var(--nq-accent)]">Quest</span>
      </span>
    </Link>
  )
}

function Toggle({
  options,
  value,
  onChange,
  title,
}: {
  options: { v: string; label: string }[]
  value: string
  onChange: (v: string) => void
  title?: string
}) {
  return (
    <div
      title={title}
      className="flex items-center gap-0.5 rounded-lg border border-[var(--nq-border)] bg-[color-mix(in_srgb,var(--nq-panel)_70%,transparent)] p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`nq-focus rounded-md px-2.5 py-1 text-xs font-semibold transition ${
            value === o.v
              ? 'bg-[var(--nq-panel-2)] text-[var(--nq-text)] shadow-sm'
              : 'text-[var(--nq-text-mute)] hover:text-[var(--nq-text-dim)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Layout() {
  const { mode, lang, setMode, setLang } = useApp()
  const t = useT()

  useEffect(() => {
    applyModeToDocument(mode)
  }, [mode])

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--nq-border)] bg-[color-mix(in_srgb,var(--nq-bg)_82%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center gap-5 px-5">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {TRACKS.map((tr) => (
              <NavLink
                key={tr.id}
                to={`/track/${tr.id}`}
                className={({ isActive }) =>
                  `nq-focus rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[var(--nq-panel-2)] text-[var(--nq-text)]'
                      : 'text-[var(--nq-text-dim)] hover:bg-[var(--nq-panel)] hover:text-[var(--nq-text)]'
                  }`
                }
                style={({ isActive }) => (isActive ? { boxShadow: `inset 0 -2px 0 ${tr.accent}` } : undefined)}
              >
                {t(tr.title)}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Toggle
              title={t(UI.modeHint)}
              value={mode}
              onChange={(v) => setMode(v as 'beginner' | 'exam')}
              options={[
                { v: 'beginner', label: t(UI.modeBeginner) },
                { v: 'exam', label: t(UI.modeExam) },
              ]}
            />
            <Toggle
              value={lang}
              onChange={(v) => setLang(v as 'gu' | 'en')}
              options={[
                { v: 'gu', label: 'ગુજ' },
                { v: 'en', label: 'EN' },
              ]}
            />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--nq-border)] px-5 py-6">
        <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-3 text-xs text-[var(--nq-text-mute)]">
          <span>NetQuest · {t(UI.tagline)}</span>
          <span className="ml-auto nq-mono">
            Beginner · CCNA 200-301 · CCNP ENCOR + ENARSI
          </span>
        </div>
      </footer>
    </div>
  )
}
