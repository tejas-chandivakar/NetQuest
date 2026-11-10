import { useCallback, useEffect, useRef, useState } from 'react'

export interface StepPlayer {
  /** current step index */
  step: number
  /** 0..1 progress inside the current step */
  t: number
  playing: boolean
  speed: number
  play: () => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  reset: () => void
  goTo: (i: number) => void
  setSpeed: (s: number) => void
  atEnd: boolean
}

/**
 * Drives a stepped animation: each step runs for `durations[i]` ms, with a
 * 0..1 progress value the view can interpolate on. Pauses at the end of the
 * last step instead of looping, so a learner can read the final state.
 */
export function useStepPlayer(durations: number[], opts?: { autoplay?: boolean }): StepPlayer {
  const [step, setStep] = useState(0)
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(opts?.autoplay ?? false)
  const [speed, setSpeed] = useState(1)

  const raf = useRef<number | null>(null)
  const startedAt = useRef<number>(0)
  const stepRef = useRef(step)
  const speedRef = useRef(speed)
  stepRef.current = step
  speedRef.current = speed

  const count = durations.length
  const atEnd = step >= count - 1 && t >= 1

  const stop = useCallback(() => {
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current)
      raf.current = null
    }
  }, [])

  useEffect(() => {
    if (!playing) {
      stop()
      return
    }
    const dur = () => Math.max(120, durations[stepRef.current] ?? 1200) / speedRef.current
    startedAt.current = performance.now() - t * dur()

    const tick = (now: number) => {
      const d = dur()
      const progress = (now - startedAt.current) / d
      if (progress >= 1) {
        if (stepRef.current >= count - 1) {
          setT(1)
          setPlaying(false)
          return
        }
        stepRef.current += 1
        setStep(stepRef.current)
        setT(0)
        startedAt.current = now
      } else {
        setT(progress)
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return stop
    // `t` is intentionally excluded: it is the value being driven.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, count, stop])

  const play = useCallback(() => {
    if (stepRef.current >= count - 1 && t >= 1) {
      setStep(0)
      stepRef.current = 0
      setT(0)
    }
    setPlaying(true)
  }, [count, t])

  const pause = useCallback(() => setPlaying(false), [])
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play])

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(count - 1, i))
      setPlaying(false)
      stepRef.current = clamped
      setStep(clamped)
      setT(1)
    },
    [count],
  )

  const next = useCallback(() => goTo(stepRef.current + 1), [goTo])
  const prev = useCallback(() => goTo(stepRef.current - 1), [goTo])
  const reset = useCallback(() => {
    setPlaying(false)
    stepRef.current = 0
    setStep(0)
    setT(0)
  }, [])

  return { step, t, playing, speed, play, pause, toggle, next, prev, reset, goTo, setSpeed, atEnd }
}

/** ease-in-out for packet motion */
export const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)
