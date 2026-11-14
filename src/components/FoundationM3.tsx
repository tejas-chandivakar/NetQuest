import { useMemo, useState } from 'react'
import { useT } from '../lib/i18n'
import type { Bi } from '../data/courses'
import { rich } from './Prose'
import { Choice, ToolFrame, ToolHead, Verdict } from './ToolFrame'

const H = (gu: string, en: string): Bi => ({ gu, en })
const shuffle = <T,>(a: T[]) => {
  const c = [...a]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

/* ═══════════════════ b3l1 · open the packet ═══════════════════ */

interface Layer {
  id: string
  label: Bi
  value: string
  bytes: number
  says: Bi
  tone: string
}

const WRAPS: Layer[] = [
  { id: 'eth', label: H('Ethernet header', 'Ethernet header'), value: 'to 00:1A:2B:3C:4D:5E', bytes: 14, says: H('આ **કેબલ પર** આગળના ઉપકરણ સુધી', 'to the next device **on this cable**'), tone: 'var(--nq-dev-switch)' },
  { id: 'ip', label: H('IP header', 'IP header'), value: 'to 142.250.195.78', bytes: 20, says: H('આ **આખા રસ્તાની** મંઝિલ', 'the destination for the **whole journey**'), tone: 'var(--nq-dev-router)' },
  { id: 'tcp', label: H('TCP header', 'TCP header'), value: 'to port 443', bytes: 20, says: H('એ કમ્પ્યુટર પરના **કયા કાર્યક્રમ** માટે', 'which **program** on that computer'), tone: 'var(--nq-pkt-tcp)' },
]

const PAYLOAD = 'Hello'

const P = {
  title: H('Packet ને કાંદાની જેમ છોલો', 'Peel the packet like an onion'),
  lead: H(
    'તમારો સંદેશ `Hello` છે — **પાંચ** અક્ષર. ઉપરથી એક એક પડ ઉતારો અને જુઓ કે બાકીનું બધું શું કરે છે.',
    'Your message is `Hello` — **five** characters. Take the layers off one at a time and see what all the rest is for.',
  ),
  peel: H('આ પડ ઉતારો', 'take this layer off'),
  inside: H('અંદર તમારો સંદેશ', 'your message, inside'),
  total: H('કુલ કદ', 'total size'),
  payloadPct: H('એમાં તમારો સંદેશ', 'of which your message is'),
  done: H(
    'પાંચ અક્ષર મોકલવા માટે **59 byte** ગયા. એને overhead કહે છે — અને એટલે જ નેટવર્ક મોટા packet પસંદ કરે છે: પડ તો એટલાં જ રહે છે, ભલે અંદર વધુ હોય.',
    'Five characters took **59 bytes** to send. That is the overhead — and it is why networks prefer large packets: the layers cost the same whatever is inside.',
  ),
  allOff: H('બધાં પડ ઉતરી ગયાં', 'every layer is off'),
}

export function PacketOpener() {
  const t = useT()
  const [off, setOff] = useState<string[]>([])
  const on = WRAPS.filter((w) => !off.includes(w.id))
  const size = on.reduce((s, w) => s + w.bytes, 0) + PAYLOAD.length
  const pct = Math.round((PAYLOAD.length / (WRAPS.reduce((s, w) => s + w.bytes, 0) + PAYLOAD.length)) * 100)

  return (
    <ToolFrame
      title={P.title}
      lead={P.lead}
      onReset={() => setOff([])}
      status={
        <span className="nq-mono text-[12px] text-[var(--nq-text-mute)]">
          {t(P.total)}: <strong className="text-[var(--nq-text)]">{size} bytes</strong>
          {!off.length && ` · ${t(P.payloadPct)} ${pct}%`}
        </span>
      }
    >
      <div className="space-y-2">
        {on.map((w) => (
          <div
            key={w.id}
            className="rounded-xl border-2 p-3"
            style={{ borderColor: w.tone, background: `color-mix(in srgb, ${w.tone} 6%, transparent)` }}
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.13em]" style={{ color: w.tone }}>
                {t(w.label)}
              </span>
              <span className="nq-mono text-[12px] text-[var(--nq-text-dim)]">{w.value}</span>
              <span className="nq-mono ml-auto text-[11px] text-[var(--nq-text-mute)]">{w.bytes} B</span>
              <button
                onClick={() => setOff((o) => [...o, w.id])}
                className="nq-focus rounded-md border px-2 py-0.5 text-[11px] font-semibold transition"
                style={{ borderColor: w.tone, color: w.tone }}
              >
                ✕ {t(P.peel)}
              </button>
            </div>
            <p className="mt-1 text-[11.5px] text-[var(--nq-text-mute)]">{rich(t(w.says))}</p>
          </div>
        ))}

        <div
          className="rounded-xl border-2 p-4 text-center"
          style={{ borderColor: 'var(--nq-ok)', background: 'color-mix(in srgb, var(--nq-ok) 10%, transparent)' }}
        >
          <span className="nq-mono text-xl font-bold" style={{ color: 'var(--nq-ok)' }}>
            {PAYLOAD}
          </span>
          <p className="mt-1 text-[11.5px] text-[var(--nq-text-mute)]">
            {t(P.inside)} · {PAYLOAD.length} B
          </p>
        </div>
      </div>

      {off.length === WRAPS.length && (
        <div className="mt-3">
          <Verdict tone="info">{t(P.done)}</Verdict>
        </div>
      )}
    </ToolFrame>
  )
}

/* ═══════════════════ b3l3 · TCP or UDP ═══════════════════ */

interface Case {
  id: string
  text: Bi
  want: 'tcp' | 'udp'
  why: Bi
}

const CASES: Case[] = [
  { id: 'bank', text: H('બેંકનું transaction', 'A bank transfer'), want: 'tcp', why: H('એક પણ byte ખોવાય તો ન ચાલે — ભલે થોડું ધીમું થાય.', 'not one byte may go missing, even if it costs a little time.') },
  { id: 'cric', text: H('લાઇવ ક્રિકેટ stream', 'A live cricket stream'), want: 'udp', why: H('જૂની frame ફરી મોકલવાનો અર્થ જ નથી — એ ક્ષણ વીતી ગઈ.', 'resending an old frame is pointless — that moment has passed.') },
  { id: 'dl', text: H('File download', 'A file download'), want: 'tcp', why: H('અધૂરી file નકામી છે.', 'half a file is no file.') },
  { id: 'game', text: H('ઓનલાઇન game', 'An online game'), want: 'udp', why: H('જૂની જગ્યા કરતાં નવી જગ્યા કામની — રાહ જોવી મોંઘી પડે.', 'the new position matters more than the old one; waiting costs more than the loss.') },
  { id: 'mail', text: H('Email મોકલવો', 'Sending an email'), want: 'tcp', why: H('અડધો email કોઈને જોઈતો નથી.', 'nobody wants half an email.') },
  { id: 'dns', text: H('DNS ને નામ પૂછવું', 'Asking DNS for a name'), want: 'udp', why: H('એક નાનો સવાલ, એક નાનો જવાબ. જવાબ ન આવે તો ફરી પૂછી લેવું સહેલું છે.', 'one small question, one small answer. If it does not come back, just ask again.') },
]

const T3 = {
  title: H('TCP કે UDP?', 'TCP or UDP?'),
  lead: H(
    'દરેક માટે પસંદ કરો. **"TCP સારું, UDP ખરાબ" નથી** — બંનેની જગ્યા છે, અને ખોટું પસંદ કરો તો કારણ મળશે.',
    'Choose for each one. It is **not that TCP is good and UDP bad** — each has its place, and a wrong pick will say why.',
  ),
  score: H('સાચાં', 'right'),
  done: H('બધાં પૂરાં.', 'All done.'),
  hs: H('TCP નો હાથ મિલાવવો', 'The TCP handshake'),
  hsLead: H(
    'TCP વાત શરૂ કરતાં પહેલાં **ત્રણ સંદેશા** કરે. પછી packet ખોવાડો અને જુઓ કે બંને શું કરે છે.',
    'TCP exchanges **three messages** before it says anything. Then drop a packet and watch what each one does.',
  ),
  drop: H('એક packet ખોવાડો', 'Drop a packet'),
  tcpLost: H(
    'TCP એ **નોંધ્યું** કે જવાબ નથી આવ્યો, રાહ જોઈ, અને **ફરી મોકલ્યું**. કશું ખોવાયું નહીં — પણ એક ક્ષણ ગઈ.',
    'TCP **noticed** no acknowledgement came, waited, and **sent it again**. Nothing was lost — but a moment was.',
  ),
  udpLost: H(
    'UDP એ કશું જ ન કર્યું. એને ખબર પણ નથી કે કશું ખોવાયું. Stream આગળ વધી ગઈ — એક ઝટકો આવ્યો અને ગયો.',
    'UDP did nothing at all. It does not even know anything went missing. The stream moved on — a glitch came and went.',
  ),
}

export function TcpUdpChooser() {
  const t = useT()
  const [n, setN] = useState(0)
  const [hits, setHits] = useState(0)
  const [said, setSaid] = useState<Case | null>(null)
  const [dropped, setDropped] = useState(false)
  const list = useMemo(() => shuffle(CASES), [])
  const c = list[n]

  const answer = (p: 'tcp' | 'udp') => {
    if (said) return
    if (p === c.want) setHits((h) => h + 1)
    setSaid(c)
  }

  return (
    <ToolFrame
      title={T3.title}
      lead={T3.lead}
      onReset={() => {
        setN(0)
        setHits(0)
        setSaid(null)
        setDropped(false)
      }}
      status={
        <span className="nq-mono text-[12px] text-[var(--nq-text-mute)]">
          {hits} / {CASES.length} {t(T3.score)}
        </span>
      }
    >
      {n >= list.length ? (
        <p className="text-sm font-semibold" style={{ color: 'var(--nq-ok)' }}>
          ✓ {t(T3.done)}
        </p>
      ) : (
        <>
          <p className="nq-prose text-[1.0625rem] leading-[1.7] text-[var(--nq-text)]">{t(c.text)}</p>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {(['tcp', 'udp'] as const).map((p) => (
              <Choice
                key={p}
                disabled={!!said}
                done={!!said && p === c.want}
                tone={said && p === c.want ? 'ok' : undefined}
                onClick={() => answer(p)}
                className="text-center"
              >
                <span className="nq-mono block text-sm font-bold text-[var(--nq-text)]">
                  {p.toUpperCase()}
                </span>
                <span className="block text-[11px] text-[var(--nq-text-mute)]">
                  {p === 'tcp'
                    ? t(H('ખાતરી કરે, ફરી મોકલે', 'checks, resends'))
                    : t(H('મોકલીને ભૂલી જાય', 'sends and forgets'))}
                </span>
              </Choice>
            ))}
          </div>
          {said && (
            <div className="mt-3 space-y-3">
              <Verdict tone="info">{t(said.why)}</Verdict>
              <button
                onClick={() => {
                  setSaid(null)
                  setN((x) => x + 1)
                }}
                className="nq-focus rounded-lg px-4 py-2 text-sm font-semibold"
                style={{ background: 'var(--nq-accent)', color: 'var(--nq-on-accent)' }}
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-6 border-t border-[var(--nq-border)] pt-5">
        <ToolHead>{t(T3.hs)}</ToolHead>
        <p className="nq-prose mt-1.5 text-sm text-[var(--nq-text-dim)]">{rich(t(T3.hsLead))}</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(['tcp', 'udp'] as const).map((p) => {
            const steps =
              p === 'tcp'
                ? ['SYN →', '← SYN-ACK', 'ACK →', 'Hello →', dropped ? '✕ lost' : '← ACK', ...(dropped ? ['Hello → (again)', '← ACK'] : [])]
                : ['Hello →', dropped ? '✕ lost' : 'Hello →', 'Hello →', 'Hello →']
            const tone = p === 'tcp' ? 'var(--nq-pkt-tcp)' : 'var(--nq-pkt-data)'
            return (
              <div key={p} className="rounded-xl border p-3" style={{ borderColor: 'var(--nq-border)' }}>
                <span className="nq-mono text-[11px] font-bold uppercase tracking-[0.13em]" style={{ color: tone }}>
                  {p.toUpperCase()}
                </span>
                <div className="mt-2 space-y-1">
                  {steps.map((s, k) => (
                    <div
                      key={k}
                      className="nq-mono rounded px-2 py-1 text-[11.5px]"
                      style={{
                        background: s.startsWith('✕')
                          ? 'color-mix(in srgb, var(--nq-err) 12%, transparent)'
                          : 'var(--nq-panel-2)',
                        color: s.startsWith('✕') ? 'var(--nq-err)' : 'var(--nq-text-dim)',
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
                {dropped && (
                  <p className="mt-2 text-[11.5px]" style={{ color: p === 'tcp' ? 'var(--nq-ok)' : 'var(--nq-warn)' }}>
                    {rich(t(p === 'tcp' ? T3.tcpLost : T3.udpLost))}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={() => setDropped((d) => !d)}
          className="nq-focus mt-3 rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
          style={{
            borderColor: dropped ? 'var(--nq-err)' : 'var(--nq-border-2)',
            color: dropped ? 'var(--nq-err)' : 'var(--nq-text-dim)',
          }}
        >
          {dropped ? '↺' : '✕'} {t(T3.drop)}
        </button>
      </div>
    </ToolFrame>
  )
}

/* ═══════════════════ b3l5 · put the conversation in order ═══════════════════ */

interface Line {
  id: string
  text: string
  who: 'client' | 'server'
  means: Bi
}

const CONVO: Line[] = [
  { id: 'a', text: '220 mail.example.com Ready', who: 'server', means: H('"હું તૈયાર છું" — server પહેલાં બોલે છે', '"I am ready" — the server speaks first') },
  { id: 'b', text: 'HELO laptop.local', who: 'client', means: H('"નમસ્તે, હું આ છું"', '"hello, this is who I am"') },
  { id: 'c', text: 'MAIL FROM: <tejas@…>', who: 'client', means: H('"આ મારા તરફથી છે"', '"this is from me"') },
  { id: 'd', text: 'RCPT TO: <priya@…>', who: 'client', means: H('"આને પહોંચાડવાનું છે"', '"this is who it goes to"') },
  { id: 'e', text: 'DATA … .', who: 'client', means: H('"હવે સંદેશ પોતે" — એક ટપકાંથી પૂરો થાય', '"and now the message itself" — ended by a single dot') },
  { id: 'f', text: '250 OK, queued', who: 'server', means: H('"મળ્યો, મોકલી દઈશ"', '"got it, I will send it"') },
  { id: 'g', text: 'QUIT', who: 'client', means: H('"બસ, આવજો"', '"that is all, goodbye"') },
]

const O = {
  title: H('વાતચીતને સાચા ક્રમમાં ગોઠવો', 'Put the conversation in order'),
  lead: H(
    'Protocol એ જાદુ નથી — એ **નક્કી કરેલો વારો** છે. આ email મોકલવાની વાતચીત છે, પણ ભળી ગઈ છે.',
    'A protocol is not magic — it is **an agreed set of turns**. This is the conversation that sends an email, shuffled.',
  ),
  next: H('હવે કયું આવે?', 'Which comes next?'),
  wrong: H('એ હજી નહીં', 'Not yet'),
  wrongWhy: H('પહેલાં', 'First comes'),
  done: H(
    'આ જ protocol છે: કોણ પહેલાં બોલે, પછી શું, અને ક્યારે પૂરું. ક્રમ તોડો તો સામેનો છેડો સમજતો જ નથી — એટલે એ ભૂલ `500` જેવા જવાબથી પાછી આવે.',
    'That is all a protocol is: who speaks first, what follows, and when it ends. Break the order and the far end simply does not understand — which is what a `500` reply is telling you.',
  ),
  server: H('server', 'server'),
  client: H('client', 'client'),
}

export function ProtocolOrder() {
  const t = useT()
  const [got, setGot] = useState<string[]>([])
  const [miss, setMiss] = useState<Line | null>(null)
  const pool = useMemo(() => shuffle(CONVO), [])
  const next = CONVO[got.length]

  const tap = (l: Line) => {
    if (l.id === next?.id) {
      setGot((g) => [...g, l.id])
      setMiss(null)
    } else {
      setMiss(l)
    }
  }

  return (
    <ToolFrame
      title={O.title}
      lead={O.lead}
      onReset={() => {
        setGot([])
        setMiss(null)
      }}
      status={
        <span className="nq-mono text-[12px] text-[var(--nq-text-mute)]">
          {got.length} / {CONVO.length}
        </span>
      }
    >
      <div className="space-y-1.5">
        {got.map((id, n) => {
          const l = CONVO.find((x) => x.id === id)!
          return (
            <div
              key={id}
              className="rounded-lg px-3 py-2"
              style={{
                background: 'var(--nq-panel-2)',
                marginLeft: l.who === 'server' ? 0 : '2rem',
              }}
            >
              <div className="flex items-baseline gap-2">
                <span className="nq-mono text-[10px] uppercase tracking-[0.1em] text-[var(--nq-text-mute)]">
                  {n + 1} · {t(l.who === 'server' ? O.server : O.client)}
                </span>
              </div>
              <span className="nq-mono block text-[12.5px] text-[var(--nq-text)]">{l.text}</span>
              <span className="block text-[11px] text-[var(--nq-text-mute)]">{t(l.means)}</span>
            </div>
          )
        })}
      </div>

      {miss && next && (
        <div className="mt-3">
          <Verdict tone="miss">
            {t(O.wrong)} — <span className="nq-mono">{miss.text}</span>. {t(O.wrongWhy)}:{' '}
            {t(next.means)}
          </Verdict>
        </div>
      )}

      {next ? (
        <>
          <p className="mt-4 text-[12px] font-semibold text-[var(--nq-text-mute)]">{t(O.next)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {pool
              .filter((l) => !got.includes(l.id))
              .map((l) => (
                <Choice key={l.id} onClick={() => tap(l)}>
                  <span className="nq-mono text-[12px] text-[var(--nq-text)]">{l.text}</span>
                </Choice>
              ))}
          </div>
        </>
      ) : (
        <div className="mt-3">
          <Verdict tone="ok">{t(O.done)}</Verdict>
        </div>
      )}
    </ToolFrame>
  )
}
