import { useState } from 'react'
import { isIp } from '../engine/ip'
import { useT } from '../lib/i18n'

/**
 * Type an address and watch it split into street and house.
 *
 * The lesson says an IP has two halves; this lets a learner move the wall and
 * see which half each number falls into — including the cases that surprise
 * people, like .0 and .255 being spoken for.
 */
const L = {
  title: { gu: 'સરનામું ખોલીને જુઓ', en: 'Open an address up' },
  lead: {
    gu: 'કોઈ પણ સરનામું લખો. વાદળી ભાગ શેરી છે, ભૂખરો ભાગ ઘર.',
    en: 'Type any address. The blue part is the street, the grey part is the house.',
  },
  address: { gu: 'સરનામું', en: 'Address' },
  bad: { gu: 'આ સરનામું બરાબર નથી — દરેક આંકડો 0 થી 255 વચ્ચે હોવો જોઈએ.', en: 'Not a valid address — each number must be 0 to 255.' },
  street: { gu: 'શેરી (network)', en: 'Street (network)' },
  house: { gu: 'ઘર (host)', en: 'House (host)' },
  wall: { gu: 'દીવાલ ક્યાં પડે', en: 'Where the wall falls' },
  neighbours: { gu: 'આ જ શેરીમાં', en: 'On this same street' },
  firstHouse: { gu: 'પહેલું ઘર', en: 'First house' },
  lastHouse: { gu: 'છેલ્લું ઘર', en: 'Last house' },
  streetName: { gu: 'શેરીનું નામ — કોઈને ન અપાય', en: 'The street itself — never given out' },
  shout: { gu: 'બધાને સંભળાવવાનું — કોઈને ન અપાય', en: 'Shout to everyone — never given out' },
  howMany: { gu: 'કેટલાં ઘર બેસે', en: 'Houses that fit' },
  kind: { gu: 'આ કયા પ્રકારનું છે', en: 'What kind is this' },
  samePrompt: { gu: 'બીજું સરનામું લખો — એ જ શેરીનું છે?', en: 'Type a second address — is it on the same street?' },
  same: { gu: 'હા — બંને એક જ શેરીમાં. સીધી વાત થઈ શકે.', en: 'Yes — same street. They can talk directly.' },
  diff: { gu: 'ના — બીજી શેરી. વચ્ચે router જોઈશે.', en: 'No — a different street. A router is needed.' },
}

const KIND: { test: (o: number[]) => boolean; gu: string; en: string; tone: string }[] = [
  { test: (o) => o[0] === 127, gu: 'Loopback — મશીન પોતે', en: 'Loopback — the machine itself', tone: 'var(--nq-text-mute)' },
  { test: (o) => o[0] === 10, gu: 'ખાનગી — મોટી કંપનીઓ વાપરે', en: 'Private — used by large companies', tone: 'var(--nq-ok)' },
  { test: (o) => o[0] === 172 && o[1] >= 16 && o[1] <= 31, gu: 'ખાનગી — મધ્યમ કદનાં નેટવર્ક', en: 'Private — medium networks', tone: 'var(--nq-ok)' },
  { test: (o) => o[0] === 192 && o[1] === 168, gu: 'ખાનગી — ઘર અને નાની ઓફિસ', en: 'Private — homes and small offices', tone: 'var(--nq-ok)' },
  { test: (o) => o[0] === 169 && o[1] === 254, gu: 'APIPA — DHCP મળ્યું નથી', en: 'APIPA — no DHCP answered', tone: 'var(--nq-warn)' },
  { test: (o) => o[0] >= 224 && o[0] <= 239, gu: 'Multicast — એક સાથે ઘણાને', en: 'Multicast — to a group at once', tone: 'var(--nq-ccnp)' },
]

const parse = (s: string) => s.trim().split('.').map(Number)

export default function AddressExplorer() {
  const t = useT()
  const [ip, setIp] = useState('192.168.1.10')
  const [prefix, setPrefix] = useState(24)
  const [other, setOther] = useState('192.168.1.50')

  const ok = isIp(ip.trim())
  const oct = ok ? parse(ip) : [0, 0, 0, 0]

  // how much of each octet the wall has taken
  const netBitsIn = (i: number) => Math.min(8, Math.max(0, prefix - i * 8))

  const netOct = oct.map((o, i) => {
    const b = netBitsIn(i)
    if (b === 8) return o
    if (b === 0) return 0
    return o & (0xff << (8 - b))
  })
  const network = netOct.join('.')
  const hostBits = 32 - prefix
  const total = Math.pow(2, hostBits)
  const broadcastOct = [...netOct]
  if (hostBits > 0) {
    let add = total - 1
    for (let i = 3; i >= 0 && add > 0; i--) {
      broadcastOct[i] = broadcastOct[i] + (add % 256)
      add = Math.floor(add / 256)
    }
  }
  const broadcast = broadcastOct.join('.')
  const usable = Math.max(0, total - 2)

  const kind = ok ? KIND.find((k) => k.test(oct)) : undefined
  const publicKind = { gu: 'જાહેર — ઈન્ટરનેટ પર દેખાય', en: 'Public — visible on the internet' }

  const otherOk = isIp(other.trim())
  const otherNet = otherOk
    ? parse(other)
        .map((o, i) => {
          const b = netBitsIn(i)
          if (b === 8) return o
          if (b === 0) return 0
          return o & (0xff << (8 - b))
        })
        .join('.')
    : null
  const sameStreet = otherNet !== null && otherNet === network

  return (
    <div className="space-y-4">
      <div className="max-w-[46em] px-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--nq-accent)]">
          {t(L.title)}
        </span>
        <p className="mt-1.5 text-[1.0625rem] leading-[1.75] text-[var(--nq-text-dim)]">{t(L.lead)}</p>
      </div>

      <div className="nq-panel p-6">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nq-text-mute)]">
              {t(L.address)}
            </span>
            <input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              spellCheck={false}
              className="nq-mono mt-1 w-full rounded-lg border border-[var(--nq-border-2)] bg-[var(--nq-panel-2)] px-3 py-2 text-lg text-[var(--nq-text)] outline-none focus:border-[var(--nq-accent)]"
            />
          </label>
          <label className="w-full sm:w-auto sm:min-w-[220px]">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--nq-text-mute)]">
              {t(L.wall)} — /{prefix}
            </span>
            <input
              type="range"
              min={8}
              max={30}
              value={prefix}
              onChange={(e) => setPrefix(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--nq-accent)]"
            />
          </label>
        </div>

        {!ok ? (
          <p className="nq-prose mt-4 text-sm" style={{ color: 'var(--nq-err)' }}>
            {t(L.bad)}
          </p>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-1">
              {oct.map((o, i) => {
                const b = netBitsIn(i)
                const whole = b === 8
                const none = b === 0
                return (
                  <span key={i} className="flex items-center">
                    <span
                      className="nq-mono rounded-lg px-3 py-2 text-2xl font-bold"
                      style={{
                        background: whole
                          ? 'color-mix(in srgb, var(--nq-accent) 15%, transparent)'
                          : none
                            ? 'var(--nq-panel-2)'
                            : 'color-mix(in srgb, var(--nq-warn) 14%, transparent)',
                        color: whole
                          ? 'var(--nq-accent)'
                          : none
                            ? 'var(--nq-text-dim)'
                            : 'var(--nq-warn)',
                      }}
                    >
                      {o}
                    </span>
                    {i < 3 && <span className="px-1 text-xl text-[var(--nq-text-mute)]">.</span>}
                  </span>
                )
              })}
            </div>
            <div className="mt-2 flex justify-center gap-5 text-[11px]">
              <span style={{ color: 'var(--nq-accent)' }}>■ {t(L.street)}</span>
              <span style={{ color: 'var(--nq-warn)' }}>■ {t(L.wall)}</span>
              <span className="text-[var(--nq-text-dim)]">■ {t(L.house)}</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl p-3" style={{ background: 'var(--nq-panel-2)' }}>
                <p className="nq-mono text-[11px] text-[var(--nq-text-mute)]">{t(L.streetName)}</p>
                <p className="nq-mono text-[15px] font-bold text-[var(--nq-text)]">{network}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--nq-panel-2)' }}>
                <p className="nq-mono text-[11px] text-[var(--nq-text-mute)]">{t(L.shout)}</p>
                <p className="nq-mono text-[15px] font-bold text-[var(--nq-text)]">{broadcast}</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--nq-panel-2)' }}>
                <p className="nq-mono text-[11px] text-[var(--nq-text-mute)]">{t(L.howMany)}</p>
                <p className="nq-mono text-[15px] font-bold text-[var(--nq-text)]">
                  {usable.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'var(--nq-panel-2)' }}>
                <p className="nq-mono text-[11px] text-[var(--nq-text-mute)]">{t(L.kind)}</p>
                <p
                  className="text-[13px] font-bold"
                  style={{ color: kind ? kind.tone : 'var(--nq-ccna)' }}
                >
                  {kind ? t(kind) : t(publicKind)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="nq-panel p-5">
        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
          {t(L.neighbours)}
        </h3>
        <p className="nq-prose mt-2 text-sm text-[var(--nq-text-dim)]">{t(L.samePrompt)}</p>
        <input
          value={other}
          onChange={(e) => setOther(e.target.value)}
          spellCheck={false}
          className="nq-mono mt-2 w-full max-w-[280px] rounded-lg border border-[var(--nq-border-2)] bg-[var(--nq-panel-2)] px-3 py-2 text-[var(--nq-text)] outline-none focus:border-[var(--nq-accent)]"
        />
        {otherOk && ok && (
          <p
            className="nq-prose mt-3 text-sm font-semibold"
            style={{ color: sameStreet ? 'var(--nq-ok)' : 'var(--nq-warn)' }}
          >
            {sameStreet ? t(L.same) : t(L.diff)}{' '}
            <span className="nq-mono font-normal text-[var(--nq-text-mute)]">
              ({otherNet} {sameStreet ? '=' : '≠'} {network})
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
