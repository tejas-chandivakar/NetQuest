import { useMemo, useState } from 'react'
import { useT } from '../lib/i18n'

/**
 * Match the door to the service.
 *
 * Port numbers are pure recall, and recall is built by retrieval, not by
 * reading a table. Each wrong pairing says why it is wrong, so a miss teaches
 * as much as a hit.
 */
interface Door {
  port: string
  proto: 'TCP' | 'UDP'
  name: { gu: string; en: string }
  note: { gu: string; en: string }
}

const DOORS: Door[] = [
  { port: '22', proto: 'TCP', name: { gu: 'SSH', en: 'SSH' }, note: { gu: 'ઉપકરણમાં સુરક્ષિત રીતે ઘૂસવું', en: 'getting into a device, encrypted' } },
  { port: '53', proto: 'UDP', name: { gu: 'DNS', en: 'DNS' }, note: { gu: 'નામને IP માં બદલવું', en: 'turning a name into an address' } },
  { port: '67', proto: 'UDP', name: { gu: 'DHCP', en: 'DHCP' }, note: { gu: 'સરનામું વહેંચવું', en: 'handing out addresses' } },
  { port: '80', proto: 'TCP', name: { gu: 'HTTP', en: 'HTTP' }, note: { gu: 'સાદી website', en: 'a plain website' } },
  { port: '443', proto: 'TCP', name: { gu: 'HTTPS', en: 'HTTPS' }, note: { gu: 'તાળાવાળી website', en: 'a website with the padlock' } },
  { port: '25', proto: 'TCP', name: { gu: 'SMTP', en: 'SMTP' }, note: { gu: 'email મોકલવો', en: 'sending email' } },
  { port: '161', proto: 'UDP', name: { gu: 'SNMP', en: 'SNMP' }, note: { gu: 'ઉપકરણની તબિયત જોવી', en: 'watching a device’s health' } },
  { port: '23', proto: 'TCP', name: { gu: 'Telnet', en: 'Telnet' }, note: { gu: 'જૂનું અને અસુરક્ષિત — SSH વાપરો', en: 'old and unencrypted — use SSH instead' } },
]

const L = {
  title: { gu: 'કયો દરવાજો કોનો', en: 'Which door belongs to whom' },
  lead: {
    gu: 'સેવા પસંદ કરો, પછી એનો દરવાજો. ખોટું હોય તો કારણ કહીશ.',
    en: 'Pick a service, then its door. A wrong pairing will tell you why.',
  },
  services: { gu: 'સેવા', en: 'Service' },
  ports: { gu: 'દરવાજા', en: 'Doors' },
  done: { gu: 'બધાં મળી ગયાં.', en: 'All matched.' },
  again: { gu: 'ફરી ભેળવો', en: 'Shuffle again' },
  score: { gu: 'મળ્યાં', en: 'matched' },
  wrongIs: { gu: 'એ દરવાજો છે', en: 'that door belongs to' },
}

const shuffle = <T,>(a: T[]) => {
  const c = [...a]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

export default function PortMatch() {
  const t = useT()
  const [seed, setSeed] = useState(0)
  const [picked, setPicked] = useState<Door | null>(null)
  const [solved, setSolved] = useState<string[]>([])
  const [miss, setMiss] = useState<{ chose: Door; actual: Door } | null>(null)

  const services = useMemo(() => shuffle(DOORS), [seed])
  const ports = useMemo(() => shuffle(DOORS), [seed])

  const tap = (d: Door) => {
    if (!picked) {
      setPicked(d)
      setMiss(null)
      return
    }
    if (d.port === picked.port) {
      setSolved((s) => [...s, d.port])
      setPicked(null)
      setMiss(null)
    } else {
      setMiss({ chose: picked, actual: d })
      setPicked(null)
    }
  }

  const reset = () => {
    setSeed((s) => s + 1)
    setPicked(null)
    setSolved([])
    setMiss(null)
  }

  const allDone = solved.length === DOORS.length

  return (
    <div className="space-y-4">
      <div className="max-w-[46em] px-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--nq-accent)]">
          {t(L.title)}
        </span>
        <p className="mt-1.5 text-[1.0625rem] leading-[1.75] text-[var(--nq-text-dim)]">{t(L.lead)}</p>
      </div>

      <div className="nq-panel p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="nq-mono text-[12px] text-[var(--nq-text-mute)]">
            {solved.length} / {DOORS.length} {t(L.score)}
          </span>
          {allDone && (
            <span className="text-sm font-semibold" style={{ color: 'var(--nq-ok)' }}>
              ✓ {t(L.done)}
            </span>
          )}
          <button
            onClick={reset}
            className="nq-focus ml-auto rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-xs font-semibold text-[var(--nq-text-dim)] transition hover:text-[var(--nq-text)]"
          >
            ↺ {t(L.again)}
          </button>
        </div>

        {miss && (
          <p className="nq-prose mt-3 text-sm" style={{ color: 'var(--nq-warn)' }}>
            <strong>{t(miss.chose.name)}</strong> → {miss.chose.proto} {miss.chose.port}.{' '}
            {miss.actual.port} {t(L.wrongIs)} <strong>{t(miss.actual.name)}</strong>.
          </p>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
              {t(L.services)}
            </h3>
            <div className="mt-2 space-y-1.5">
              {services.map((d) => {
                const done = solved.includes(d.port)
                const on = picked?.port === d.port
                return (
                  <button
                    key={d.port}
                    disabled={done}
                    onClick={() => tap(d)}
                    className="nq-focus flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left transition disabled:cursor-default"
                    style={{
                      borderColor: done ? 'var(--nq-ok)' : on ? 'var(--nq-accent)' : 'var(--nq-border)',
                      background: done
                        ? 'color-mix(in srgb, var(--nq-ok) 9%, transparent)'
                        : on
                          ? 'color-mix(in srgb, var(--nq-accent) 10%, transparent)'
                          : 'transparent',
                      opacity: done ? 0.7 : 1,
                    }}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[var(--nq-text)]">
                        {done && '✓ '}
                        {t(d.name)}
                      </span>
                      <span className="block text-[11.5px] text-[var(--nq-text-mute)]">{t(d.note)}</span>
                    </span>
                    {done && (
                      <span className="nq-mono shrink-0 text-[11px] text-[var(--nq-ok)]">
                        {d.proto} {d.port}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
              {t(L.ports)}
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {ports.map((d) => {
                const done = solved.includes(d.port)
                return (
                  <button
                    key={d.port}
                    disabled={done || !picked}
                    onClick={() => tap(d)}
                    className="nq-focus rounded-lg border px-3 py-2.5 transition disabled:cursor-default"
                    style={{
                      borderColor: done ? 'var(--nq-ok)' : 'var(--nq-border)',
                      background: done ? 'color-mix(in srgb, var(--nq-ok) 9%, transparent)' : 'transparent',
                      opacity: done ? 0.45 : picked ? 1 : 0.7,
                    }}
                  >
                    <span className="nq-mono block text-base font-bold text-[var(--nq-text)]">
                      {d.port}
                    </span>
                    <span className="nq-mono block text-[10px] text-[var(--nq-text-mute)]">
                      {d.proto}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
