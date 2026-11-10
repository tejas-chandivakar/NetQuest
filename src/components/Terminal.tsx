import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CliLine, CliSession } from '../engine/cli'

const COLOR: Record<CliLine['kind'], string> = {
  in: 'var(--nq-text)',
  out: 'var(--nq-text-dim)',
  err: 'var(--nq-err)',
  info: 'var(--nq-info)',
  ok: 'var(--nq-ok)',
}

interface Props {
  session: CliSession
  lines: CliLine[]
  onRun: (line: string) => void
  height?: number
  placeholder?: string
}

export default function Terminal({ session, lines, onRun, height = 300, placeholder }: Props) {
  const [value, setValue] = useState('')
  const [histIdx, setHistIdx] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = () => {
    onRun(value)
    setValue('')
    setHistIdx(null)
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      setValue(session.complete(value))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const h = session.history
      if (!h.length) return
      const i = histIdx === null ? h.length - 1 : Math.max(0, histIdx - 1)
      setHistIdx(i)
      setValue(h[i])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const h = session.history
      if (histIdx === null) return
      const i = histIdx + 1
      if (i >= h.length) {
        setHistIdx(null)
        setValue('')
      } else {
        setHistIdx(i)
        setValue(h[i])
      }
    }
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-[var(--nq-border-2)] bg-[#05080f]"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b border-[var(--nq-border)] bg-[var(--nq-bg-2)] px-3 py-1.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="nq-mono ml-1 text-[11px] text-[var(--nq-text-mute)]">
          {session.dev.name} · console
        </span>
      </div>

      <div
        ref={scrollRef}
        className="nq-mono overflow-y-auto px-3 py-2.5 text-[12.5px] leading-[1.55]"
        style={{ height }}
      >
        {lines.map((l, i) => (
          <div key={i} style={{ color: COLOR[l.kind], whiteSpace: 'pre-wrap' }}>
            {l.text}
          </div>
        ))}

        <div className="flex items-baseline gap-2">
          <span style={{ color: 'var(--nq-ok)' }}>{session.prompt()}</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoComplete="off"
            placeholder={placeholder}
            className="nq-mono flex-1 border-0 bg-transparent text-[12.5px] text-[var(--nq-text)] outline-none placeholder:text-[var(--nq-text-mute)]"
          />
        </div>
      </div>
    </div>
  )
}
