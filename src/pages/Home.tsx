import { Link } from 'react-router-dom'
import { TRACKS, allLessons, type Track } from '../data/courses'
import { useApp } from '../store/useApp'
import { UI, useT } from '../lib/i18n'

function TrackCard({ track, index }: { track: Track; index: number }) {
  const t = useT()
  const completed = useApp((s) => s.completed)
  const lessons = allLessons(track)
  const done = lessons.filter((l) => completed[l.id]).length
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0

  return (
    <Link
      to={`/track/${track.id}`}
      className="nq-panel nq-focus group relative flex flex-col overflow-hidden p-6 transition hover:-translate-y-1"
      style={{ borderColor: pct > 0 ? track.accent : undefined }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
        style={{ background: track.accent }}
      />
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-[0.07] blur-2xl transition group-hover:opacity-20"
        style={{ background: track.accent }}
      />

      <div className="flex items-center gap-3">
        <span
          className="nq-mono flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
          style={{ background: `color-mix(in srgb, ${track.accent} 18%, transparent)`, color: track.accent }}
        >
          {index + 1}
        </span>
        <span className="nq-chip" style={{ borderColor: track.accent, color: track.accent }}>
          {track.code}
        </span>
      </div>

      <h3 className="mt-4 text-2xl font-bold tracking-tight">{t(track.title)}</h3>
      <p className="nq-prose mt-2 flex-1 text-[var(--nq-text-dim)]">{t(track.subtitle)}</p>

      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-[var(--nq-border)] pt-4">
        {[
          { v: lessons.length, k: t(UI.lessons) },
          { v: track.modules.length, k: t(UI.modules) },
          { v: `~${track.hours}`, k: t(UI.hours) },
        ].map((s) => (
          <div key={s.k}>
            <dt className="nq-mono text-lg font-bold" style={{ color: track.accent }}>
              {s.v}
            </dt>
            <dd className="text-[11px] uppercase tracking-wider text-[var(--nq-text-mute)]">{s.k}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-[var(--nq-text-mute)]">
          <span>{t(UI.prereq)}: {t(track.prereq)}</span>
          <span className="nq-mono">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--nq-border)]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: track.accent }}
          />
        </div>
      </div>
    </Link>
  )
}

function StageCard({ n, title, body, accent }: { n: string; title: string; body: string; accent: string }) {
  return (
    <div className="nq-panel p-5">
      <div
        className="nq-mono mb-3 flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold"
        style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}
      >
        {n}
      </div>
      <h4 className="font-bold">{title}</h4>
      <p className="nq-prose mt-1 text-sm text-[var(--nq-text-dim)]">{body}</p>
    </div>
  )
}

export default function Home() {
  const t = useT()
  const lang = useApp((s) => s.lang)

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-12">
      {/* hero */}
      <section className="relative overflow-hidden rounded-[22px] border border-[var(--nq-border)] p-8 md:p-12">
        <div className="nq-grid-bg pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative max-w-3xl">
          <span className="nq-chip">{t(UI.tagline)}</span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-tight md:text-6xl">
            {t(UI.heroTitle)}
          </h1>
          <p className="nq-prose mt-5 max-w-2xl text-[var(--nq-text-dim)]">{t(UI.heroBody)}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/track/beginner"
              className="nq-focus rounded-xl px-5 py-3 text-sm font-bold text-[var(--nq-on-accent)] transition hover:brightness-110"
              style={{ background: 'var(--nq-beginner)' }}
            >
              {lang === 'gu' ? 'શરૂઆતથી શરૂ કરો' : 'Start from the beginning'}
            </Link>
            <Link
              to="/track/ccna"
              className="nq-focus rounded-xl border border-[var(--nq-border-2)] px-5 py-3 text-sm font-bold text-[var(--nq-text)] transition hover:border-[var(--nq-ccna)]"
            >
              {lang === 'gu' ? 'સીધા CCNA પર જાઓ' : 'Jump to CCNA'}
            </Link>
          </div>
        </div>
      </section>

      {/* three stages */}
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <StageCard
          n="1"
          accent="var(--nq-beginner)"
          title={t(UI.stageLearn)}
          body={
            lang === 'gu'
              ? 'ફક્ત એનિમેશન. થોભો, પાછા જાઓ, ધીમું કરો — જ્યાં સમજ ન પડે ત્યાં અટકો.'
              : 'Animation only. Pause, rewind, slow it down — stop wherever it stops making sense.'
          }
        />
        <StageCard
          n="2"
          accent="var(--nq-ccna)"
          title={t(UI.stageConfig)}
          body={
            lang === 'gu'
              ? 'તમે CLI માં લખો, અને દરેક લાઈન એનિમેશનને એક ડગલું આગળ ચલાવે.'
              : 'You type in the CLI, and every line moves the animation one step forward.'
          }
        />
        <StageCard
          n="3"
          accent="var(--nq-ccnp)"
          title={t(UI.stageBreak)}
          body={
            lang === 'gu'
              ? 'લિંક તોડો, timer બદલો, ભૂલ કરો — અને નેટવર્ક શું કરે છે એ જુઓ.'
              : 'Break a link, change a timer, make a mistake — and watch what the network does.'
          }
        />
      </section>

      {/* tracks */}
      <section className="mt-12">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--nq-text-mute)]">
          {lang === 'gu' ? 'ત્રણ કોર્સ' : 'Three courses'}
        </h2>
        <div className="mt-4 grid gap-5 lg:grid-cols-3">
          {TRACKS.map((tr, i) => (
            <TrackCard key={tr.id} track={tr} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
