import { useState } from 'react'
import { useT } from '../lib/i18n'
import type { Bi } from '../data/courses'
import { rich } from './Prose'
import { ToolFrame, ToolHead, Verdict } from './ToolFrame'

const H = (gu: string, en: string): Bi => ({ gu, en })

/* ═══════════════════ b2l2 · the MAC explorer ═══════════════════ */

interface Known {
  oui: string
  maker: Bi
  rest: string
  what: Bi
}

const KNOWN: Known[] = [
  { oui: '00:1A:2B', maker: H('Cisco', 'Cisco'), rest: '3C:4D:5E', what: H('ઓફિસનું switch', 'a switch in the office') },
  { oui: 'B8:27:EB', maker: H('Raspberry Pi', 'Raspberry Pi'), rest: '9F:12:04', what: H('ટેબલ પરનું નાનું બોર્ડ', 'the little board on your desk') },
  { oui: 'F0:18:98', maker: H('Apple', 'Apple'), rest: 'A7:3C:D1', what: H('કોઈનો લેપટોપ', 'somebody’s laptop') },
  { oui: '3C:5A:B4', maker: H('Google', 'Google'), rest: '0E:77:22', what: H('ઘરનું smart speaker', 'a smart speaker at home') },
]

const BROADCAST = { oui: 'FF:FF:FF', rest: 'FF:FF:FF' }

const L = {
  title: H('MAC સરનામાના બે ભાગ', 'The two halves of a MAC address'),
  lead: H(
    'MAC એક લાંબો આંકડો નથી — એના **બે ભાગ** છે. ઉપકરણ બદલો, અને જુઓ કે પહેલો ભાગ જ બદલાય છે કે બીજો.',
    'A MAC is not one long number — it has **two halves**. Change the device and watch which half moves.',
  ),
  pick: H('ઉપકરણ', 'Device'),
  firstHalf: H('કોણે બનાવ્યું', 'Who made it'),
  secondHalf: H('એમનો કયો', 'Which one of theirs'),
  ouiNote: H(
    'પહેલા ત્રણ byte એ **બનાવનાર કંપની** છે. એને OUI કહે છે, અને એ IEEE પાસેથી ખરીદવી પડે છે. એટલે MAC જોઈને કહી શકાય કે બોક્સ કોનું છે — ખોલ્યા વગર.',
    'The first three bytes are the **maker**. It is called the OUI and a company buys it from the IEEE. Which is how you can tell whose box it is from the address alone, without opening anything.',
  ),
  nicNote: H(
    'પછીના ત્રણ byte એ **કંપનીનો પોતાનો ક્રમાંક** છે. એ બંને મળીને દુનિયામાં અનોખા હોવા જોઈએ — અને એ ફેક્ટરીમાં જ કાયમ માટે લખાય છે.',
    'The last three bytes are the **maker’s own serial**. Together the two halves are meant to be unique in the world — and they are burned in at the factory, for good.',
  ),
  bcast: H('બધાને બોલાવો', 'Call everyone'),
  normal: H('એક ઉપકરણ', 'One device'),
  bcastNote: H(
    'બધા `F` એટલે **broadcast** — "આ ઓરડાના બધા સાંભળો". એક પણ ઉપકરણનું સરનામું આવું નથી, અને હોઈ પણ ન શકે. ARP આ જ વાપરે છે.',
    'All `F`s is the **broadcast** address — "everyone in this room, listen". No single device has this one, and none could. ARP uses exactly this.',
  ),
  vsIp: H('MAC અને IP નો ફરક', 'How this differs from an IP'),
  rows: [
    [H('કોણે આપ્યું', 'who gave it'), H('ફેક્ટરીએ, કાયમ માટે', 'the factory, permanently'), H('નેટવર્કે, અત્યારે', 'the network, for now')],
    [H('ક્યાં ચાલે', 'where it works'), H('ફક્ત આ એક નેટવર્કમાં', 'only on this one network'), H('આખી દુનિયામાં', 'anywhere in the world')],
    [H('શું કહે છે', 'what it says'), H('તમે **કોણ** છો', 'who you **are**'), H('તમે **ક્યાં** છો', 'where you **are**')],
  ] as [Bi, Bi, Bi][],
}

const Byte = ({ v, tone }: { v: string; tone: string }) => (
  <span
    className="nq-mono rounded-md px-2 py-1.5 text-base font-bold sm:text-lg"
    style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
  >
    {v}
  </span>
)

export function MacExplorer() {
  const t = useT()
  const [i, setI] = useState(0)
  const [bcast, setBcast] = useState(false)
  const [half, setHalf] = useState<'oui' | 'nic' | null>(null)

  const d = KNOWN[i]
  const shown = bcast ? BROADCAST : { oui: d.oui, rest: d.rest }
  const ouiTone = bcast ? 'var(--nq-err)' : 'var(--nq-ccna)'
  const nicTone = bcast ? 'var(--nq-err)' : 'var(--nq-beginner)'

  return (
    <ToolFrame
      title={L.title}
      lead={L.lead}
      onReset={() => {
        setI(0)
        setBcast(false)
        setHalf(null)
      }}
    >
      <div className="flex flex-wrap gap-1.5">
        {KNOWN.map((k, n) => (
          <button
            key={k.oui}
            onClick={() => {
              setI(n)
              setBcast(false)
            }}
            className="nq-focus rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
            style={{
              borderColor: !bcast && i === n ? 'var(--nq-accent)' : 'var(--nq-border)',
              color: !bcast && i === n ? 'var(--nq-accent)' : 'var(--nq-text-dim)',
            }}
          >
            {t(k.maker)}
          </button>
        ))}
        <button
          onClick={() => setBcast(true)}
          className="nq-focus rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
          style={{
            borderColor: bcast ? 'var(--nq-err)' : 'var(--nq-border)',
            color: bcast ? 'var(--nq-err)' : 'var(--nq-text-dim)',
          }}
        >
          {t(L.bcast)}
        </button>
      </div>

      <p className="mt-2 text-[12px] text-[var(--nq-text-mute)]">
        {bcast ? t(L.bcast) : t(d.what)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setHalf(half === 'oui' ? null : 'oui')}
          className="nq-focus flex gap-1 rounded-lg p-1 transition"
          style={{ outline: half === 'oui' ? `2px solid ${ouiTone}` : 'none' }}
        >
          {shown.oui.split(':').map((b, n) => (
            <Byte key={n} v={b} tone={ouiTone} />
          ))}
        </button>
        <span className="nq-mono text-lg text-[var(--nq-text-mute)]">:</span>
        <button
          onClick={() => setHalf(half === 'nic' ? null : 'nic')}
          className="nq-focus flex gap-1 rounded-lg p-1 transition"
          style={{ outline: half === 'nic' ? `2px solid ${nicTone}` : 'none' }}
        >
          {shown.rest.split(':').map((b, n) => (
            <Byte key={n} v={b} tone={nicTone} />
          ))}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.13em]" style={{ color: ouiTone }}>
          {bcast ? '— ' : ''}
          {t(L.firstHalf)}
          {!bcast && `: ${t(d.maker)}`}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.13em]" style={{ color: nicTone }}>
          {t(L.secondHalf)}
        </span>
      </div>

      <div className="mt-3">
        {bcast ? (
          <Verdict tone="info">{t(L.bcastNote)}</Verdict>
        ) : half === 'oui' ? (
          <Verdict tone="info">{t(L.ouiNote)}</Verdict>
        ) : half === 'nic' ? (
          <Verdict tone="info">{t(L.nicNote)}</Verdict>
        ) : null}
      </div>

      <div className="mt-5">
        <ToolHead>{t(L.vsIp)}</ToolHead>
        <table className="mt-2 w-full text-left text-[12.5px]">
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.1em] text-[var(--nq-text-mute)]">
              <th className="py-1 font-semibold" />
              <th className="py-1 font-semibold">MAC</th>
              <th className="py-1 font-semibold">IP</th>
            </tr>
          </thead>
          <tbody>
            {L.rows.map(([k, a, b], n) => (
              <tr key={n} className="border-t border-[var(--nq-border)]">
                <td className="py-1.5 pr-3 text-[var(--nq-text-mute)]">{t(k)}</td>
                <td className="py-1.5 pr-3 text-[var(--nq-text-dim)]">{rich(t(a))}</td>
                <td className="py-1.5 text-[var(--nq-text-dim)]">{rich(t(b))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ToolFrame>
  )
}
