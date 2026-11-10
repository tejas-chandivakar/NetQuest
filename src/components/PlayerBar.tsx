import type { StepPlayer } from '../lib/useStepPlayer'

interface Props {
  player: StepPlayer
  total: number
  labels?: string[]
  playLabel?: string
  pauseLabel?: string
  replayLabel?: string
  stepWord?: string
}

const btn =
  'nq-focus inline-flex items-center justify-center rounded-lg border border-[var(--nq-border-2)] ' +
  'bg-[var(--nq-panel-2)] text-[var(--nq-text-dim)] transition hover:text-[var(--nq-text)] ' +
  'hover:border-[var(--nq-accent)] disabled:opacity-35 disabled:hover:border-[var(--nq-border-2)] ' +
  'disabled:hover:text-[var(--nq-text-dim)]'

export default function PlayerBar({
  player,
  total,
  labels,
  playLabel = 'Play',
  pauseLabel = 'Pause',
  replayLabel = 'Replay',
  stepWord = 'STEP',
}: Props) {
  const { step, t, playing, atEnd } = player

  return (
    <div className="flex flex-col gap-3">
      {/* segmented progress */}
      <div className="flex gap-1.5" role="group">
        {Array.from({ length: total }).map((_, i) => {
          const fill = i < step ? 1 : i === step ? t : 0
          return (
            <button
              key={i}
              onClick={() => player.goTo(i)}
              title={labels?.[i] ?? `${stepWord} ${i + 1}`}
              className="nq-focus group relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--nq-border)] transition hover:h-2"
            >
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-[var(--nq-accent)]"
                style={{ width: `${fill * 100}%` }}
              />
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className={`${btn} h-9 w-9`} onClick={player.reset} title={replayLabel} aria-label={replayLabel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
            <path d="M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button className={`${btn} h-9 w-9`} onClick={player.prev} disabled={step === 0} aria-label="Previous step">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 6h2v12H8zM18 6v12l-8-6z" />
          </svg>
        </button>

        <button
          onClick={player.toggle}
          className="nq-focus inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--nq-accent)] bg-[color-mix(in_srgb,var(--nq-accent)_16%,transparent)] px-4 text-sm font-semibold text-[var(--nq-text)] transition hover:bg-[color-mix(in_srgb,var(--nq-accent)_26%,transparent)]"
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4l13 8-13 8z" />
            </svg>
          )}
          {playing ? pauseLabel : atEnd ? replayLabel : playLabel}
        </button>

        <button
          className={`${btn} h-9 w-9`}
          onClick={player.next}
          disabled={step >= total - 1}
          aria-label="Next step"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 6h2v12h-2zM6 6v12l8-6z" />
          </svg>
        </button>

        <div className="ml-auto flex items-center gap-1 rounded-lg border border-[var(--nq-border)] p-0.5">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => player.setSpeed(s)}
              className={`nq-focus nq-mono rounded-md px-2 py-1 text-[11px] transition ${
                player.speed === s
                  ? 'bg-[var(--nq-panel-2)] text-[var(--nq-text)]'
                  : 'text-[var(--nq-text-mute)] hover:text-[var(--nq-text-dim)]'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        <span className="nq-mono text-[11px] tracking-wider text-[var(--nq-text-mute)]">
          {stepWord} {step + 1}/{total}
        </span>
      </div>
    </div>
  )
}
