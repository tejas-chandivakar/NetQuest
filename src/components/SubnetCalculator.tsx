import { useMemo, useState } from 'react'
import {
  broadcastOf,
  intToIp,
  ipToInt,
  isIp,
  networkOf,
  prefixToMask,
  wildcardToMask,
} from '../engine/ip'
import { useT } from '../lib/i18n'
import { useApp } from '../store/useApp'

const L = {
  title: { gu: 'Subnet Calculator', en: 'Subnet Calculator' },
  address: { gu: 'કોઈ પણ IP સરનામું', en: 'Any IP address' },
  prefix: { gu: 'કેટલા bits network ના?', en: 'How many bits belong to the network?' },
  bits: { gu: '32 bits — ઉપર network, નીચે host', en: 'All 32 bits — network on top, host below' },
  netBits: { gu: 'Network bits', en: 'Network bits' },
  hostBits: { gu: 'Host bits', en: 'Host bits' },
  results: { gu: 'પરિણામ', en: 'Results' },
  mask: { gu: 'Subnet Mask', en: 'Subnet mask' },
  wildcard: { gu: 'Wildcard', en: 'Wildcard' },
  network: { gu: 'Network Address', en: 'Network address' },
  broadcast: { gu: 'Broadcast Address', en: 'Broadcast address' },
  first: { gu: 'પહેલું વાપરી શકાય એવું', en: 'First usable' },
  last: { gu: 'છેલ્લું વાપરી શકાય એવું', en: 'Last usable' },
  total: { gu: 'કુલ સરનામાં', en: 'Total addresses' },
  usable: { gu: 'વાપરી શકાય એવાં', en: 'Usable hosts' },
  range: { gu: 'પ્રકાર', en: 'Range' },
  invalid: { gu: 'આ સરનામું બરાબર નથી', en: 'That is not a valid address' },
  practice: { gu: 'જાતે અજમાવો', en: 'Try it yourself' },
  reveal: { gu: 'જવાબ જુઓ', en: 'Show answer' },
  again: { gu: 'બીજો સવાલ', en: 'Another one' },
  private: { gu: 'Private (ઘર/ઓફિસની અંદર)', en: 'Private (inside a home or office)' },
  publicNet: { gu: 'Public (ઈન્ટરનેટ પર)', en: 'Public (routable on the internet)' },
  loopback: { gu: 'Loopback (પોતાનું જ)', en: 'Loopback (the machine itself)' },
  explainBeginner: {
    gu: 'Slider ખસેડો. ડાબી બાજુના વાદળી bits કહે છે "આ કઈ શેરી છે", અને જમણી બાજુના ભૂખરા bits કહે છે "એ શેરીમાં કયું ઘર". વાદળી વધારો એટલે શેરીઓ વધે પણ દરેકમાં ઘર ઓછાં થાય.',
    en: 'Drag the slider. The blue bits on the left say which street this is; the grey bits on the right say which house on that street. More blue means more streets, each with fewer houses.',
  },
  explainExam: {
    gu: 'Prefix length એ mask માં contiguous 1-bits ની સંખ્યા છે. Host bits = 32 − prefix. Usable hosts = 2^(host bits) − 2 (network અને broadcast બાદ). /31 point-to-point માટે અને /32 host route માટે વપરાય છે.',
    en: 'The prefix length is the count of contiguous 1-bits in the mask. Host bits = 32 − prefix, and usable hosts = 2^(host bits) − 2, since the network and broadcast addresses are not assignable. A /31 is used for point-to-point links and a /32 for host routes.',
  },
}

function bitsOf(ip: string): number[] {
  const n = ipToInt(ip)
  return Array.from({ length: 32 }, (_, i) => (n >>> (31 - i)) & 1)
}

function rangeKind(ip: string) {
  const o = ip.split('.').map(Number)
  if (o[0] === 127) return 'loopback'
  if (o[0] === 10) return 'private'
  if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return 'private'
  if (o[0] === 192 && o[1] === 168) return 'private'
  return 'public'
}

function Row({ k, v, accent }: { k: string; v: string; accent?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--nq-border)] py-2 last:border-0">
      <span className="text-sm text-[var(--nq-text-dim)]">{k}</span>
      <span className="nq-mono text-sm font-semibold" style={{ color: accent ?? 'var(--nq-text)' }}>
        {v}
      </span>
    </div>
  )
}

function Practice() {
  const t = useT()
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e6))
  const [shown, setShown] = useState(false)

  const q = useMemo(() => {
    const rnd = (n: number, salt: number) => Math.floor(((seed * 9301 + salt * 49297) % 233280) / 233280 * n)
    const ip = `192.168.${rnd(200, 3) + 1}.${rnd(250, 7) + 2}`
    const prefix = [25, 26, 27, 28][rnd(4, 11)]
    const mask = prefixToMask(prefix)
    return {
      ip,
      prefix,
      mask,
      network: networkOf(ip, mask),
      broadcast: broadcastOf(ip, mask),
      hosts: Math.max(0, Math.pow(2, 32 - prefix) - 2),
    }
  }, [seed])

  return (
    <div className="nq-panel p-5">
      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
        {t(L.practice)}
      </h3>
      <p className="nq-prose mt-2">
        <span className="nq-mono font-bold text-[var(--nq-accent)]">
          {q.ip}/{q.prefix}
        </span>{' '}
        — {t({ gu: 'network, broadcast અને કેટલા hosts?', en: 'network, broadcast and how many hosts?' })}
      </p>

      {shown ? (
        <div className="mt-3 space-y-1">
          <Row k={t(L.mask)} v={q.mask} />
          <Row k={t(L.network)} v={q.network} accent="var(--nq-ok)" />
          <Row k={t(L.broadcast)} v={q.broadcast} accent="var(--nq-warn)" />
          <Row k={t(L.usable)} v={q.hosts.toLocaleString()} />
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        {!shown && (
          <button
            onClick={() => setShown(true)}
            className="nq-focus rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-xs font-semibold text-[var(--nq-text-dim)] transition hover:text-[var(--nq-text)]"
          >
            {t(L.reveal)}
          </button>
        )}
        <button
          onClick={() => {
            setSeed(Math.floor(Math.random() * 1e6))
            setShown(false)
          }}
          className="nq-focus rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--nq-on-accent)]"
          style={{ background: 'var(--nq-accent)' }}
        >
          {t(L.again)}
        </button>
      </div>
    </div>
  )
}

export default function SubnetCalculator() {
  const t = useT()
  const mode = useApp((s) => s.mode)
  const [ip, setIp] = useState('192.168.1.130')
  const [prefix, setPrefix] = useState(24)

  const valid = isIp(ip)
  const mask = prefixToMask(prefix)
  const net = valid ? networkOf(ip, mask) : ''
  const bcast = valid ? broadcastOf(ip, mask) : ''
  const total = Math.pow(2, 32 - prefix)
  const usable = prefix >= 31 ? (prefix === 31 ? 2 : 1) : total - 2
  const first = valid && prefix < 31 ? intToIp(ipToInt(net) + 1) : net
  const last = valid && prefix < 31 ? intToIp(ipToInt(bcast) - 1) : bcast
  const kind = valid ? rangeKind(ip) : 'public'
  const bits = valid ? bitsOf(ip) : []

  return (
    <div className="space-y-4">
      <div className="nq-panel p-5">
        <div className="grid gap-5 md:grid-cols-[minmax(0,260px)_1fr]">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--nq-text-mute)]">
              {t(L.address)}
            </label>
            <input
              value={ip}
              onChange={(e) => setIp(e.target.value.trim())}
              spellCheck={false}
              className="nq-mono nq-focus w-full rounded-xl border bg-[var(--nq-bg-2)] px-3 py-2.5 text-lg font-bold outline-none"
              style={{
                borderColor: valid ? 'var(--nq-border-2)' : 'var(--nq-err)',
                color: valid ? 'var(--nq-text)' : 'var(--nq-err)',
              }}
            />
            {!valid && <p className="mt-1 text-xs text-[var(--nq-err)]">{t(L.invalid)}</p>}
          </div>

          <div>
            <label className="mb-1.5 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wider text-[var(--nq-text-mute)]">
              <span>{t(L.prefix)}</span>
              <span className="nq-mono text-xl font-bold text-[var(--nq-accent)]">/{prefix}</span>
            </label>
            <input
              type="range"
              min={8}
              max={32}
              value={prefix}
              onChange={(e) => setPrefix(Number(e.target.value))}
              className="nq-focus w-full accent-[var(--nq-accent)]"
            />
            <div className="nq-mono mt-1 flex justify-between text-[10px] text-[var(--nq-text-mute)]">
              <span>/8</span>
              <span>/16</span>
              <span>/24</span>
              <span>/32</span>
            </div>
          </div>
        </div>

        {/* 32 bits */}
        {valid && (
          <div className="mt-6">
            <div className="mb-2 flex flex-wrap items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--nq-accent)' }} />
                {t(L.netBits)} ({prefix})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--nq-border-2)' }} />
                {t(L.hostBits)} ({32 - prefix})
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {[0, 1, 2, 3].map((octet) => (
                <div key={octet} className="flex flex-col gap-1">
                  <div className="flex gap-0.5">
                    {bits.slice(octet * 8, octet * 8 + 8).map((b, i) => {
                      const idx = octet * 8 + i
                      const isNet = idx < prefix
                      return (
                        <span
                          key={i}
                          className="nq-mono flex h-7 w-[18px] items-center justify-center rounded-[3px] text-[11px] font-bold transition-colors"
                          style={{
                            background: isNet
                              ? 'color-mix(in srgb, var(--nq-accent) 24%, transparent)'
                              : 'var(--nq-panel-2)',
                            color: isNet ? 'var(--nq-accent)' : 'var(--nq-text-mute)',
                            boxShadow: idx === prefix - 1 ? '2px 0 0 var(--nq-warn)' : undefined,
                          }}
                        >
                          {b}
                        </span>
                      )
                    })}
                  </div>
                  <span className="nq-mono text-center text-[11px] text-[var(--nq-text-dim)]">
                    {ip.split('.')[octet]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="nq-prose mt-5 text-sm text-[var(--nq-text-dim)]">
          {t(mode === 'beginner' ? L.explainBeginner : L.explainExam)}
        </p>
      </div>

      {valid && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="nq-panel p-5">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
              {t(L.results)}
            </h3>
            <Row k={t(L.mask)} v={mask} />
            <Row k={t(L.wildcard)} v={wildcardToMask(mask)} />
            <Row k={t(L.network)} v={net} accent="var(--nq-ok)" />
            <Row k={t(L.broadcast)} v={bcast} accent="var(--nq-warn)" />
            <Row
              k={t(L.range)}
              v={
                kind === 'private'
                  ? t(L.private)
                  : kind === 'loopback'
                    ? t(L.loopback)
                    : t(L.publicNet)
              }
            />
          </div>

          <div className="nq-panel p-5">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
              {t(L.bits)}
            </h3>
            <Row k={t(L.first)} v={first} />
            <Row k={t(L.last)} v={last} />
            <Row k={t(L.total)} v={total.toLocaleString()} />
            <Row k={t(L.usable)} v={usable.toLocaleString()} accent="var(--nq-accent)" />
          </div>
        </div>
      )}

      <Practice />
    </div>
  )
}
