import { Link, Navigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { KIND_LABEL, allLessons, findLesson } from '../data/courses'
import { useApp } from '../store/useApp'
import { UI, useT } from '../lib/i18n'
import { getBreak, getConfig, getLesson, getTool } from '../lessons/registry'
import AnimatedLesson from '../components/AnimatedLesson'
import ConfigureStage from '../components/ConfigureStage'
import BreakStage from '../components/BreakStage'

type Stage = 'learn' | 'config' | 'break'

/**
 * Only the stages a lesson actually has. A greyed-out "soon" that never
 * arrives reads as a broken promise, and a lesson with one stage needs no
 * tabs at all — it is just the lesson.
 */
function StageTabs({
  accent,
  stage,
  setStage,
  available,
  configLabel,
}: {
  accent: string
  stage: Stage
  setStage: (s: Stage) => void
  available: Record<Stage, boolean>
  configLabel: string
}) {
  const t = useT()
  const stages: { k: Stage; label: string }[] = [
    { k: 'learn', label: t(UI.stageLearn) },
    { k: 'config', label: configLabel },
    { k: 'break', label: t(UI.stageBreak) },
  ].filter((s) => available[s.k as Stage]) as { k: Stage; label: string }[]

  if (stages.length < 2) return null

  return (
    <div className="flex gap-1 rounded-lg border border-[var(--nq-border)] p-0.5">
      {stages.map((s, i) => {
        const active = stage === s.k
        return (
          <button
            key={s.k}
            onClick={() => setStage(s.k)}
            className="nq-focus flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition"
            style={
              active
                ? { background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: 'var(--nq-text)' }
                : { color: 'var(--nq-text-dim)' }
            }
          >
            <span className="nq-mono text-[11px]">{i + 1}</span>
            {s.label}
          </button>
        )
      })}
    </div>
  )
}

function Roadmap() {
  const t = useT()
  return (
    <div className="nq-panel p-8 text-center">
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: 'color-mix(in srgb, var(--nq-warn) 14%, transparent)' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--nq-warn)" strokeWidth="2">
          <path d="M12 6v6l4 2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-bold">{t(UI.comingSoon)}</h3>
      <p className="nq-prose mx-auto mt-2 max-w-md text-[var(--nq-text-dim)]">{t(UI.comingSoonBody)}</p>
    </div>
  )
}

export default function LessonPage() {
  const { lessonId } = useParams()
  const t = useT()
  const { completed, complete, uncomplete } = useApp()
  const [stage, setStage] = useState<Stage>('learn')

  useEffect(() => {
    window.scrollTo({ top: 0 })
    setStage(getLesson(lessonId ?? '') ? 'learn' : 'config')
  }, [lessonId])

  const found = findLesson(lessonId ?? '')
  if (!found) return <Navigate to="/" replace />

  const { track, module: mod, lesson } = found
  const order = allLessons(track)
  const pos = order.findIndex((l) => l.id === lesson.id)
  const prev = pos > 0 ? order[pos - 1] : null
  const next = pos < order.length - 1 ? order[pos + 1] : null
  const spec = getLesson(lesson.id)
  const config = getConfig(lesson.id)
  const brk = getBreak(lesson.id)
  const Tool = getTool(lesson.id)
  const available: Record<Stage, boolean> = {
    learn: !!spec,
    config: !!config || !!Tool,
    break: !!brk,
  }
  const done = !!completed[lesson.id]
  const activeStage: Stage = available[stage] ? stage : spec ? 'learn' : config ? 'config' : 'learn'

  return (
    <div>
      {/*
        One bar instead of four stacked blocks. Breadcrumb, title, minutes and
        the stage tabs used to take ~250px between them and push the drawing
        past the fold; together here they take about 60, and the bar stays put
        so you always know which lesson and which stage you are in.
      */}
      <div
        className="sticky top-0 z-30 border-b border-[var(--nq-border)]"
        style={{ background: 'color-mix(in srgb, var(--nq-bg) 92%, transparent)', backdropFilter: 'blur(8px)' }}
      >
        <div className="mx-auto flex w-full max-w-[1640px] flex-wrap items-center gap-x-3 gap-y-2 px-5 py-2.5">
          <Link
            to={`/track/${track.id}`}
            className="nq-focus shrink-0 rounded text-xs text-[var(--nq-text-mute)] transition hover:text-[var(--nq-text-dim)]"
            title={t(mod.title)}
          >
            ← <span className="hidden sm:inline">{t(track.title)}</span>
          </Link>

          <h1 className="min-w-0 flex-1 truncate text-base font-extrabold tracking-tight md:text-lg">
            {t(lesson.title)}
          </h1>

          {/* the meta is the first thing to go when the bar runs out of room —
              a readable title matters more than the kind chip */}
          <span
            className="nq-chip hidden shrink-0 sm:inline-flex"
            style={{ borderColor: track.accent, color: track.accent }}
          >
            {t(KIND_LABEL[lesson.kind])}
          </span>
          <span className="nq-mono hidden shrink-0 text-xs font-bold text-[var(--nq-text-dim)] sm:inline">
            {lesson.minutes} min
          </span>
          <span className="nq-mono hidden shrink-0 text-xs text-[var(--nq-text-mute)] md:inline">
            {pos + 1}/{order.length}
          </span>

          <div className="w-full sm:w-auto">
            <StageTabs
              accent={track.accent}
              stage={activeStage}
              setStage={setStage}
              available={available}
              configLabel={t(track.id === 'beginner' ? UI.stageTry : UI.stageConfig)}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1640px] px-5 pb-8 pt-4">
        {activeStage === 'config' && Tool ? (
          <Tool />
        ) : activeStage === 'config' && config ? (
          <ConfigureStage spec={config} />
        ) : activeStage === 'break' && brk ? (
          <BreakStage spec={brk} />
        ) : spec ? (
          <AnimatedLesson spec={spec} />
        ) : (
          <Roadmap />
        )}

        {/* footer nav */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--nq-border)] pt-5">
        {prev ? (
          <Link
            to={`/lesson/${prev.id}`}
            className="nq-focus rounded-xl border border-[var(--nq-border-2)] px-4 py-2.5 text-sm font-semibold text-[var(--nq-text-dim)] transition hover:text-[var(--nq-text)]"
          >
            ← {t(UI.prevLesson)}
          </Link>
        ) : (
          <Link
            to={`/track/${track.id}`}
            className="nq-focus rounded-xl border border-[var(--nq-border-2)] px-4 py-2.5 text-sm font-semibold text-[var(--nq-text-dim)] transition hover:text-[var(--nq-text)]"
          >
            ← {t(UI.backToCourse)}
          </Link>
        )}

        <button
          onClick={() => (done ? uncomplete(lesson.id) : complete(lesson.id))}
          className="nq-focus rounded-xl px-4 py-2.5 text-sm font-bold transition"
          style={
            done
              ? { background: 'color-mix(in srgb, var(--nq-ok) 16%, transparent)', color: 'var(--nq-ok)' }
              : { border: '1px solid var(--nq-border-2)', color: 'var(--nq-text-dim)' }
          }
        >
          {done ? `✓ ${t(UI.markedDone)}` : t(UI.markDone)}
        </button>

        {next && (
          <Link
            to={`/lesson/${next.id}`}
            className="nq-focus ml-auto rounded-xl px-5 py-2.5 text-sm font-bold text-[var(--nq-on-accent)] transition hover:brightness-110"
            style={{ background: track.accent }}
          >
            {t(UI.nextLesson)} →
          </Link>
        )}
        </div>
      </div>
    </div>
  )
}
