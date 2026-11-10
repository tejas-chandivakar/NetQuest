import { useState } from 'react'
import type { Bi } from '../data/courses'
import Topology, { type LinkSpec, type NodeSpec, type PacketSpec } from './Topology'
import PlayerBar from './PlayerBar'
import StageLayout from './StageLayout'
import { useStepPlayer } from '../lib/useStepPlayer'
import { useApp } from '../store/useApp'
import { UI, useT } from '../lib/i18n'

export interface Scene {
  nodes: NodeSpec[]
  links?: LinkSpec[]
  packets?: PacketSpec[]
}

export interface SceneStep {
  /** how long this step runs, in ms at 1x */
  ms: number
  label: Bi
  text: { beginner: Bi; exam: Bi }
  /** t is 0..1 progress inside this step */
  scene: (t: number) => Scene
  /** optional live table shown beside the drawing (MAC table, ARP cache, ...) */
  aside?: (t: number) => { title: Bi; head: string[]; rows: string[][] }
}

export interface QuickCheck {
  q: Bi
  options: Bi[]
  answer: number
  explain: Bi
}

export interface LessonSpec {
  why: Bi
  steps: SceneStep[]
  takeaway: Bi
  check?: QuickCheck
  viewBox?: { w: number; h: number }
}

function AsideTable({ spec }: { spec: { title: Bi; head: string[]; rows: string[][] } }) {
  const t = useT()
  return (
    <div className="nq-panel p-5">
      <h3 className="nq-mono mb-3 text-[10px] uppercase tracking-[0.14em] text-[var(--nq-text-mute)]">
        {t(spec.title)}
      </h3>
      <table className="nq-mono w-full text-[11.5px]">
        <thead>
          <tr>
            {spec.head.map((h) => (
              <th key={h} className="pb-1 pr-3 text-left font-normal text-[var(--nq-text-mute)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spec.rows.length === 0 ? (
            <tr>
              <td colSpan={spec.head.length} className="py-1 text-[var(--nq-text-mute)] opacity-60">
                (empty)
              </td>
            </tr>
          ) : (
            spec.rows.map((r, i) => (
              <tr key={i} className="border-t border-[var(--nq-border)]">
                {r.map((c, j) => (
                  <td key={j} className="py-1 pr-3 text-[var(--nq-text)]">
                    {c}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function Check({ check }: { check: QuickCheck }) {
  const t = useT()
  const [picked, setPicked] = useState<number | null>(null)
  const right = picked === check.answer

  return (
    <div className="nq-panel p-5">
      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
        {t(UI.checkTitle)}
      </h3>
      <p className="nq-prose mt-2 font-semibold">{t(check.q)}</p>
      <div className="mt-3 grid gap-2">
        {check.options.map((o, i) => {
          const chosen = picked === i
          const isAnswer = i === check.answer
          const show = picked !== null
          return (
            <button
              key={i}
              onClick={() => setPicked(i)}
              className="nq-focus flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition"
              style={{
                borderColor: show && isAnswer ? 'var(--nq-ok)' : chosen ? 'var(--nq-err)' : 'var(--nq-border)',
                background:
                  show && isAnswer
                    ? 'color-mix(in srgb, var(--nq-ok) 12%, transparent)'
                    : chosen
                      ? 'color-mix(in srgb, var(--nq-err) 12%, transparent)'
                      : 'transparent',
              }}
            >
              <span className="nq-mono text-xs text-[var(--nq-text-mute)]">
                {String.fromCharCode(65 + i)}
              </span>
              <span>{t(o)}</span>
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <p className="nq-prose mt-3 text-sm" style={{ color: right ? 'var(--nq-ok)' : 'var(--nq-warn)' }}>
          <strong>{right ? t(UI.correct) : t(UI.tryAgain)}</strong> {t(check.explain)}
        </p>
      )}
    </div>
  )
}

export default function AnimatedLesson({ spec }: { spec: LessonSpec }) {
  const t = useT()
  const mode = useApp((s) => s.mode)
  const player = useStepPlayer(spec.steps.map((s) => s.ms))
  const step = spec.steps[player.step]
  const scene = step.scene(player.t)
  const aside = step.aside?.(player.t)
  const vb = spec.viewBox ?? { w: 860, h: 420 }

  return (
    <StageLayout
      note={{ label: t(UI.whyTitle), text: t(spec.why), accent: 'var(--nq-warn)' }}
      stage={
        <Topology
          nodes={scene.nodes}
          links={scene.links}
          packets={scene.packets}
          width={vb.w}
          height={vb.h}
        />
      }
      controls={
        <PlayerBar
          player={player}
          total={spec.steps.length}
          labels={spec.steps.map((s) => t(s.label))}
          playLabel={t(UI.play)}
          pauseLabel={t(UI.pause)}
          replayLabel={t(UI.replay)}
          stepWord={t(UI.step)}
        />
      }
      left={
        <>
          <div className="nq-panel p-5">
            <div className="flex items-center gap-3">
              <span
                className="nq-mono flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold"
                style={{
                  background: 'color-mix(in srgb, var(--nq-accent) 18%, transparent)',
                  color: 'var(--nq-accent)',
                }}
              >
                {player.step + 1}
              </span>
              <h3 className="text-lg font-bold tracking-tight">{t(step.label)}</h3>
              <span className="nq-chip ml-auto">
                {mode === 'beginner' ? t(UI.modeBeginner) : t(UI.modeExam)}
              </span>
            </div>
            <p className="nq-prose mt-3 text-[var(--nq-text-dim)]">
              {t(mode === 'beginner' ? step.text.beginner : step.text.exam)}
            </p>
          </div>

          {/* the running order, mirroring the task checklist of a lab */}
          <ol className="nq-panel space-y-1.5 p-5">
            {spec.steps.map((s, i) => {
              const done = i < player.step
              const current = i === player.step
              return (
                <li key={i}>
                  <button
                    onClick={() => player.goTo(i)}
                    className="nq-focus flex w-full items-start gap-2.5 rounded-lg px-1 py-0.5 text-left text-sm"
                  >
                    <span
                      className="nq-mono mt-0.5 flex shrink-0 items-center justify-center rounded text-[10px]"
                      style={{
                        width: 18,
                        height: 18,
                        background: done
                          ? 'var(--nq-ok)'
                          : current
                            ? 'color-mix(in srgb, var(--nq-accent) 22%, transparent)'
                            : 'var(--nq-panel-2)',
                        color: done ? 'var(--nq-bg)' : current ? 'var(--nq-accent)' : 'var(--nq-text-mute)',
                      }}
                    >
                      {done ? '✓' : i + 1}
                    </span>
                    <span style={{ color: current ? 'var(--nq-text)' : 'var(--nq-text-mute)' }}>
                      {t(s.label)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </>
      }
      right={
        <>
          {aside && <AsideTable spec={aside} />}
          {spec.check && <Check check={spec.check} />}
        </>
      }
      footer={
        <div className="nq-panel border-l-[3px] p-5" style={{ borderLeftColor: 'var(--nq-ok)' }}>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--nq-ok)' }}>
            {t(UI.keyTakeaway)}
          </h3>
          <p className="nq-prose mt-2">{t(spec.takeaway)}</p>
        </div>
      }
    />
  )
}
