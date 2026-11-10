import { Link, Navigate, useParams } from 'react-router-dom'
import { KIND_LABEL, allLessons, trackById, type Lesson } from '../data/courses'
import { useApp } from '../store/useApp'
import { UI, useT } from '../lib/i18n'
import { hasLesson } from '../lessons/registry'

const KIND_COLOR: Record<string, string> = {
  concept: 'var(--nq-text-mute)',
  config: 'var(--nq-ccna)',
  lab: 'var(--nq-warn)',
  project: 'var(--nq-ccnp)',
  quiz: 'var(--nq-ok)',
}

function LessonRow({ lesson, n, accent }: { lesson: Lesson; n: number; accent: string }) {
  const t = useT()
  const done = useApp((s) => !!s.completed[lesson.id])
  const built = hasLesson(lesson.id)

  return (
    <Link
      to={`/lesson/${lesson.id}`}
      className="nq-focus group flex items-start gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:border-[var(--nq-border)] hover:bg-[color-mix(in_srgb,var(--nq-panel)_60%,transparent)]"
    >
      <span
        className="nq-mono mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
        style={
          done
            ? { background: accent, color: 'var(--nq-bg)' }
            : { background: 'var(--nq-panel-2)', color: 'var(--nq-text-mute)' }
        }
      >
        {done ? '✓' : n}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[var(--nq-text)] group-hover:text-white">{t(lesson.title)}</span>
          <span
            className="nq-mono rounded px-1.5 py-px text-[10px] uppercase tracking-wider"
            style={{ color: KIND_COLOR[lesson.kind], background: 'var(--nq-panel-2)' }}
          >
            {t(KIND_LABEL[lesson.kind])}
          </span>
          {built && (
            <span
              className="nq-mono rounded px-1.5 py-px text-[10px] uppercase tracking-wider"
              style={{ color: 'var(--nq-ok)', background: 'color-mix(in srgb, var(--nq-ok) 14%, transparent)' }}
            >
              ● live
            </span>
          )}
        </span>
        <span className="nq-prose mt-1 block text-sm text-[var(--nq-text-dim)]">{t(lesson.blurb)}</span>
      </span>

      <span className="nq-mono mt-0.5 shrink-0 text-xs text-[var(--nq-text-mute)]">{lesson.minutes}m</span>
    </Link>
  )
}

export default function TrackPage() {
  const { trackId } = useParams()
  const t = useT()
  const completed = useApp((s) => s.completed)
  const track = trackById(trackId ?? '')

  if (!track) return <Navigate to="/" replace />

  const lessons = allLessons(track)
  const done = lessons.filter((l) => completed[l.id]).length
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0
  let counter = 0

  return (
    <div className="mx-auto w-full max-w-[1000px] px-5 py-10">
      <header className="nq-panel relative overflow-hidden p-7">
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: track.accent }} />
        <span className="nq-chip" style={{ borderColor: track.accent, color: track.accent }}>
          {track.code}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">{t(track.title)}</h1>
        <p className="nq-prose mt-2 max-w-2xl text-[var(--nq-text-dim)]">{t(track.subtitle)}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--nq-text-mute)]">
          <span>
            {lessons.length} {t(UI.lessons)}
          </span>
          <span>
            {track.modules.length} {t(UI.modules)}
          </span>
          <span>
            ~{track.hours} {t(UI.hours)}
          </span>
          <span>
            {t(UI.prereq)}: {t(track.prereq)}
          </span>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-[11px] text-[var(--nq-text-mute)]">
            <span>{t(UI.progress)}</span>
            <span className="nq-mono">
              {done}/{lessons.length} · {pct}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--nq-border)]">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: track.accent }} />
          </div>
        </div>
      </header>

      <div className="mt-8 space-y-7">
        {track.modules.map((m, mi) => (
          <section key={m.id}>
            <div className="mb-2 flex items-baseline gap-3 px-3">
              <h2 className="text-lg font-bold tracking-tight">
                <span className="nq-mono mr-2 text-[var(--nq-text-mute)]">
                  {String(mi + 1).padStart(2, '0')}
                </span>
                {t(m.title)}
              </h2>
              {m.weight && (
                <span className="nq-chip" style={{ color: track.accent, borderColor: 'var(--nq-border)' }}>
                  {m.weight}
                </span>
              )}
            </div>
            <div className="nq-panel divide-y divide-[var(--nq-border)] p-1.5">
              {m.lessons.map((l) => {
                counter += 1
                return <LessonRow key={l.id} lesson={l} n={counter} accent={track.accent} />
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
