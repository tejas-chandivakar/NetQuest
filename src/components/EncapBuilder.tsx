import { useState } from 'react'
import { useT } from '../lib/i18n'
import type { Bi } from '../data/courses'
import { rich } from './Prose'

/**
 * Walk your message down all seven layers, one at a time.
 *
 * The honest part is the count. Seven layers, but only three of them put an
 * envelope on: 4, 3 and 2. Layers 7, 6 and 5 each do real work and hand the
 * same Data downward, and layer 1 adds nothing either — it turns the frame
 * into signal. An earlier version of this tool hid 6 and 5 to make the
 * numbers tidy, which taught the wrong lesson. Every layer is its own row
 * now; what differs is what each one is allowed to do.
 */

/** what the layer does to what it is handed */
type Act = 'pass' | 'header' | 'wrap' | 'signal'

interface Layer {
  id: string
  n: number
  name: Bi
  /** the one decision this layer makes */
  job: Bi
  /** what a learner will actually meet at this layer */
  lives: string[]
  /** the box in the rack that works here */
  device: Bi
  act: Act
  /** what the thing is called after this layer has had it */
  becomes: Bi
  /** the line shown when this layer is applied */
  did: Bi
  tone: string
}

const LAYERS: Layer[] = [
  {
    id: 'app',
    n: 7,
    name: { gu: 'Application', en: 'Application' },
    job: { gu: 'કયો કાર્યક્રમ, અને એને શું કહેવું છે', en: 'which program, and what it wants to say' },
    lives: ['HTTP', 'HTTPS', 'DNS', 'DHCP', 'SMTP', 'FTP', 'SSH', 'SNMP'],
    device: { gu: 'તમારું browser, તમારી app', en: 'your browser, your app' },
    act: 'pass',
    becomes: { gu: 'Data', en: 'Data' },
    did: {
      gu: 'તમારો સંદેશ તૈયાર થયો. કોઈ કવર ચઢ્યું નથી — એ હજી `Data` જ છે.',
      en: 'Your message exists. No envelope went on — it is still just `Data`.',
    },
    tone: 'var(--nq-ccnp)',
  },
  {
    id: 'pres',
    n: 6,
    name: { gu: 'Presentation', en: 'Presentation' },
    job: { gu: 'એ વાત કયા રૂપમાં — encode, compress, encrypt', en: 'what form that takes — encode, compress, encrypt' },
    lives: ['JPEG', 'PNG', 'MP4', 'ASCII', 'Unicode', 'TLS encryption', 'zip'],
    device: { gu: 'કોઈ અલગ ઉપકરણ નહીં — software માં', en: 'no separate box — it happens in software' },
    act: 'pass',
    becomes: { gu: 'Data', en: 'Data' },
    did: {
      gu: 'સંદેશ encrypt થયો અને સરખા રૂપમાં ગોઠવાયો. **તોય કવર ચઢ્યું નથી** — હજી `Data`.',
      en: 'The message got encrypted and put in an agreed format. **Still no envelope** — still `Data`.',
    },
    tone: 'var(--nq-ccnp)',
  },
  {
    id: 'sess',
    n: 5,
    name: { gu: 'Session', en: 'Session' },
    job: { gu: 'વાતચીત ખોલવી, ચાલુ રાખવી, બંધ કરવી', en: 'opening the conversation, keeping it, closing it' },
    lives: ['TLS session', 'RPC', 'NetBIOS', 'resume after a drop'],
    device: { gu: 'કોઈ અલગ ઉપકરણ નહીં — software માં', en: 'no separate box — it happens in software' },
    act: 'pass',
    becomes: { gu: 'Data', en: 'Data' },
    did: {
      gu: 'વાતચીત ખૂલી અને ચાલુ રહી. આ ત્રીજી વાર — **હજી પણ કવર નહીં**. એટલે 7, 6, 5 ત્રણેયનું પરિણામ `Data` જ કહેવાય.',
      en: 'The conversation is open and being kept. That is three times now — **still no envelope**. Which is why what 7, 6 and 5 produce is all just called `Data`.',
    },
    tone: 'var(--nq-ccnp)',
  },
  {
    id: 'tcp',
    n: 4,
    name: { gu: 'Transport', en: 'Transport' },
    job: { gu: 'કયા દરવાજે, અને ખરેખર પહોંચ્યું કે નહીં', en: 'which door, and whether it truly arrived' },
    lives: ['TCP', 'UDP', 'port numbers', 'ACK', 'window', 'segmentation'],
    device: { gu: 'Firewall અહીં port જોઈને રોકે છે', en: 'a firewall blocks by port here' },
    act: 'header',
    becomes: { gu: 'Segment', en: 'Segment' },
    did: {
      gu: '**પહેલું ખરું કવર.** Port નંબર ચઢ્યો, એટલે સામેના computer પર **કયો કાર્યક્રમ** એ નક્કી થયું. હવે એને `Segment` કહેવાય.',
      en: '**The first real envelope.** A port number went on, so it is now settled **which program** on the far computer gets this. It is now called a `Segment`.',
    },
    tone: 'var(--nq-pkt-tcp)',
  },
  {
    id: 'ip',
    n: 3,
    name: { gu: 'Network', en: 'Network' },
    job: { gu: 'કયું નેટવર્ક, અને ત્યાં સુધીનો કયો રસ્તો', en: 'which network, and the way to get there' },
    lives: ['IP', 'ICMP (ping)', 'OSPF', 'EIGRP', 'BGP', 'NAT'],
    device: { gu: 'Router — એ આ layer પર જ કામ કરે', en: 'a router — this is the layer it works at' },
    act: 'header',
    becomes: { gu: 'Packet', en: 'Packet' },
    did: {
      gu: 'IP સરનામું ચઢ્યું — **આખા રસ્તાની મંઝિલ**, જે છેડા સુધી બદલાતી નથી. હવે એને `Packet` કહેવાય, અને router આના પર જ નિર્ણય લે છે.',
      en: 'An IP address went on — **the destination for the whole journey**, which does not change end to end. It is now a `Packet`, and this is what a router makes its decision on.',
    },
    tone: 'var(--nq-accent)',
  },
  {
    id: 'eth',
    n: 2,
    name: { gu: 'Data link', en: 'Data link' },
    job: { gu: 'આ એક તાર પર કોને, અને બગડ્યું હોય તો ખબર પડે', en: 'who on this one wire, and whether it arrived damaged' },
    lives: ['Ethernet', 'MAC', 'ARP', 'VLAN', 'trunk', 'STP'],
    device: { gu: 'Switch — એ MAC જોઈને મોકલે', en: 'a switch — it forwards on the MAC' },
    act: 'wrap',
    becomes: { gu: 'Frame', en: 'Frame' },
    did: {
      gu: 'MAC સરનામું ચઢ્યું — પણ ફક્ત **આગળના એક ઉપકરણ** સુધી; દરેક hop પર એ બદલાય. અને આ **એકમાત્ર layer છે જે પાછળ પણ કંઈક મૂકે** — FCS trailer, જે કહે છે કે રસ્તામાં બગડ્યું તો નહીં. હવે `Frame`.',
      en: 'A MAC address went on — but only as far as **the next device**; it is rewritten at every hop. And this is the **only layer that also puts something at the back** — the FCS trailer, which says whether it got damaged on the way. Now a `Frame`.',
    },
    tone: 'var(--nq-ok)',
  },
  {
    id: 'phy',
    n: 1,
    name: { gu: 'Physical', en: 'Physical' },
    job: { gu: 'વીજળી, પ્રકાશ કે રેડિયો — ખરો સંકેત', en: 'electricity, light or radio — the actual signal' },
    lives: ['cable', 'fibre', 'Wi-Fi radio', 'connector', 'voltage', 'hub'],
    device: { gu: 'કેબલ પોતે, hub, repeater', en: 'the cable itself, a hub, a repeater' },
    act: 'signal',
    becomes: { gu: 'Bits', en: 'Bits' },
    did: {
      gu: 'અહીં **કશું ઉમેરાતું નથી**. આખું frame વીજળીના ધબકારામાં બદલાઈ જાય — `Bits`. એટલે જ સાત layer હોવા છતાં કવર ફક્ત **ત્રણ** ચઢ્યાં.',
      en: 'Nothing is added here. The whole frame **turns into** pulses on the wire — `Bits`. Which is why, across seven layers, only **three** envelopes ever went on.',
    },
    tone: 'var(--nq-warn)',
  },
]

const ENVELOPES = LAYERS.filter((l) => l.act === 'header' || l.act === 'wrap')

const L = {
  title: { gu: 'સાતેય layer, એક પછી એક', en: 'All seven layers, one at a time' },
  lead: {
    gu: 'ઉપરથી નીચે એક એક layer પર જાઓ. દરેક કંઈક કરે છે — પણ **કવર ફક્ત ત્રણ જ ચઢાવે છે**. કયાં, એ જાતે જોઈ લો.',
    en: 'Go down the stack one layer at a time. Every one of them does something — but **only three put an envelope on**. Find out which.',
  },
  down: { gu: 'મોકલનાર — નીચે ઊતરો', en: 'Sending — going down' },
  up: { gu: 'મેળવનાર — ઉપર ચઢો', en: 'Receiving — coming back up' },
  go: { gu: 'આ layer પર જાઓ', en: 'Do this layer' },
  undo: { gu: 'પાછા', en: 'Undo' },
  wrong: { gu: 'એ પહેલાં નહીં — ઉપરના layer થી શરૂ કરો.', en: 'Not that one yet — start from the layer above.' },
  wrongUp: { gu: 'ઊલટું — નીચેના layer થી ઉપર ચઢાય.', en: 'Other way — you come back up from the layer below.' },
  reset: { gu: 'ફરી શરૂ', en: 'Start again' },
  device: { gu: 'ઉપકરણ', en: 'The box' },
  adds: { gu: 'ચઢાવે', en: 'Puts on' },
  actPass: { gu: 'કશું નહીં — નીચે સોંપે', en: 'nothing — hands it down' },
  actHeader: { gu: 'આગળ header', en: 'a header at the front' },
  actWrap: { gu: 'આગળ header + પાછળ trailer', en: 'a header in front and a trailer behind' },
  actSignal: { gu: 'કશું નહીં — સંકેતમાં બદલે', en: 'nothing — turns it into signal' },
  counter: { gu: 'કવર ચઢ્યાં', en: 'envelopes on' },
  stepsOf: { gu: 'layer પૂરા', en: 'layers done' },
  nowCalled: { gu: 'અત્યારે એને કહેવાય', en: 'Right now it is called' },
  onTheWire: { gu: 'વાયર પર', en: 'On the wire' },
  yourMessage: { gu: 'તમારો સંદેશ', en: 'your message' },
  trailer: { gu: 'FCS trailer', en: 'FCS trailer' },
  doneDown: {
    gu: 'સાતેય layer પૂરા. **સાત layer, પણ ત્રણ જ કવર** — 7, 6, 5 અને 1 એ કશું ચઢાવ્યું નહોતું. હવે ઊલટું કરો.',
    en: 'All seven done. **Seven layers, three envelopes** — 7, 6, 5 and 1 never put anything on. Now do it backwards.',
  },
  doneUp: {
    gu: 'બધું ઉખડી ગયું — અસલ સંદેશ પાછો મળ્યો. સામેના computer પર બરાબર આ જ ક્રમ ઊલટો ચાલે છે.',
    en: 'Everything is off and the original message is back. This exact sequence runs in reverse on the far computer.',
  },
}

const ACT_LABEL: Record<Act, Bi> = {
  pass: L.actPass,
  header: L.actHeader,
  wrap: L.actWrap,
  signal: L.actSignal,
}

export default function EncapBuilder() {
  const t = useT()
  const [done, setDone] = useState(0)
  const [unwrapping, setUnwrapping] = useState(false)
  const [slip, setSlip] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  const full = done === LAYERS.length
  const nextDown = LAYERS[done]
  const nextUp = done > 0 ? LAYERS[done - 1] : undefined
  const current = done > 0 ? LAYERS[done - 1] : undefined
  const onCount = LAYERS.slice(0, done).filter((l) => l.act === 'header' || l.act === 'wrap').length

  const tap = (l: Layer) => {
    // Open the detail whatever happens. Tapping ahead is how somebody reads
    // about a layer before doing it, and a tap out of order should still
    // answer "what is this one for?" rather than only saying no.
    setOpen((o) => (o === l.id ? null : l.id))
    const wanted = unwrapping ? nextUp : nextDown
    if (l.id !== wanted?.id) {
      setSlip(l.id)
      setTimeout(() => setSlip(null), 1400)
      return
    }
    setOpen(l.id)
    if (unwrapping) {
      setDone((d) => d - 1)
      return
    }
    const next = done + 1
    setDone(next)
    if (next === LAYERS.length) setUnwrapping(true)
  }

  const reset = () => {
    setDone(0)
    setUnwrapping(false)
    setOpen(null)
    setSlip(null)
  }

  return (
    <div className="space-y-4">
      <div className="max-w-[46em] px-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--nq-accent)]">
          {t(L.title)}
        </span>
        <p className="nq-prose mt-1.5 text-[1.0625rem] leading-[1.75] text-[var(--nq-text-dim)]">
          {rich(t(L.lead))}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="nq-panel p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
              {unwrapping ? t(L.up) : t(L.down)}
            </h3>
            <span className="nq-mono ml-auto text-[11px] text-[var(--nq-text-mute)]">
              {done}/{LAYERS.length} {t(L.stepsOf)} · {onCount}/{ENVELOPES.length} {t(L.counter)}
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            {LAYERS.map((l, i) => {
              const applied = i < done
              const isNext = l.id === (unwrapping ? nextUp?.id : nextDown?.id)
              const shaking = slip === l.id
              const envelope = l.act === 'header' || l.act === 'wrap'
              const expanded = open === l.id
              return (
                <div
                  key={l.id}
                  className="rounded-xl border transition"
                  style={{
                    borderColor: shaking
                      ? 'var(--nq-err)'
                      : applied
                        ? l.tone
                        : isNext
                          ? 'var(--nq-border-2)'
                          : 'var(--nq-border)',
                    borderWidth: envelope ? 2 : 1,
                    background: applied ? `color-mix(in srgb, ${l.tone} 8%, transparent)` : 'transparent',
                    opacity: !applied && !isNext ? 0.6 : 1,
                  }}
                >
                  <button
                    onClick={() => tap(l)}
                    className="nq-focus flex w-full items-start gap-3 px-3 py-2.5 text-left"
                  >
                    <span
                      className="nq-mono flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold"
                      style={{
                        background: applied ? l.tone : 'var(--nq-panel-2)',
                        color: applied ? 'var(--nq-on-accent)' : 'var(--nq-text-mute)',
                      }}
                    >
                      {l.n}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[var(--nq-text)]">
                        {applied && '✓ '}
                        {t(l.name)}
                      </span>
                      <span className="block text-[12px] leading-snug text-[var(--nq-text-mute)]">
                        {t(l.job)}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      {envelope ? (
                        <span
                          className="nq-mono rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide"
                          style={{ background: `color-mix(in srgb, ${l.tone} 16%, transparent)`, color: l.tone }}
                        >
                          {l.act === 'wrap' ? '+ header + trailer' : '+ header'}
                        </span>
                      ) : (
                        <span className="nq-mono text-[9.5px] uppercase tracking-wide text-[var(--nq-text-mute)]">
                          {l.act === 'signal' ? '→ signal' : 'passes it down'}
                        </span>
                      )}
                      {isNext && (
                        <span
                          className="nq-mono rounded px-2 py-0.5 text-[10px] font-bold uppercase"
                          style={{
                            background: 'color-mix(in srgb, var(--nq-accent) 15%, transparent)',
                            color: 'var(--nq-accent)',
                          }}
                        >
                          {unwrapping ? t(L.undo) : t(L.go)}
                        </span>
                      )}
                    </span>
                  </button>

                  {expanded && (
                    <div className="border-t px-3 py-2.5" style={{ borderColor: 'var(--nq-border)' }}>
                      <p className="nq-prose text-[12.5px] leading-[1.65] text-[var(--nq-text-dim)]">
                        {rich(t(l.did))}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {l.lives.map((x) => (
                          <span
                            key={x}
                            className="nq-mono rounded px-1.5 py-0.5 text-[10.5px]"
                            style={{ background: 'var(--nq-panel-2)', color: 'var(--nq-text-dim)' }}
                          >
                            {x}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] text-[var(--nq-text-mute)]">
                        <strong>{t(L.device)}:</strong> {t(l.device)} · <strong>{t(L.adds)}:</strong>{' '}
                        {t(ACT_LABEL[l.act])}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {slip && (
            <p className="nq-prose mt-3 text-sm" style={{ color: 'var(--nq-err)' }}>
              {t(unwrapping ? L.wrongUp : L.wrong)}
            </p>
          )}

          {(full || (unwrapping && done === 0)) && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="nq-prose flex-1 text-sm font-semibold" style={{ color: 'var(--nq-ok)' }}>
                {rich(t(full ? L.doneDown : L.doneUp))}
              </p>
              <button
                onClick={reset}
                className="nq-focus rounded-lg border border-[var(--nq-border-2)] px-3 py-1.5 text-xs font-semibold text-[var(--nq-text-dim)] transition hover:text-[var(--nq-text)]"
              >
                ↺ {t(L.reset)}
              </button>
            </div>
          )}
        </div>

        <div className="nq-panel p-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--nq-text-mute)]">
            {full ? t(L.onTheWire) : t(L.nowCalled)}
          </h3>
          <p className="mt-1.5 text-center text-xl font-bold text-[var(--nq-text)]">
            {current ? t(current.becomes) : '—'}
          </p>

          <div className="mt-4">
            {LAYERS.slice(0, done)
              .filter((l) => l.act === 'header' || l.act === 'wrap')
              .slice()
              .reverse()
              .map((l) => (
                <div
                  key={l.id}
                  className="nq-mono rounded-t-lg border-x-2 border-t-2 px-3 py-1.5 text-[10.5px] font-bold"
                  style={{
                    borderColor: l.tone,
                    background: `color-mix(in srgb, ${l.tone} 9%, transparent)`,
                    color: l.tone,
                  }}
                >
                  {t(l.name)} header
                </div>
              ))}

            <div
              className="nq-mono px-3 py-4 text-center text-[12px] font-bold"
              style={{
                background: 'color-mix(in srgb, var(--nq-ccnp) 14%, transparent)',
                color: 'var(--nq-ccnp)',
                borderRadius: done >= 6 ? 0 : '0.5rem',
              }}
            >
              {t(L.yourMessage)}
            </div>

            {/* only layer 2 puts something at the back, so only it gets a tail */}
            {done >= 6 && (
              <div
                className="nq-mono rounded-b-lg border-x-2 border-b-2 px-3 py-1.5 text-[10.5px] font-bold"
                style={{
                  borderColor: 'var(--nq-ok)',
                  background: 'color-mix(in srgb, var(--nq-ok) 9%, transparent)',
                  color: 'var(--nq-ok)',
                }}
              >
                {t(L.trailer)}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1">
            {['Data', 'Segment', 'Packet', 'Frame', 'Bits'].map((p, i) => {
              const reached =
                (i === 0 && done >= 1) ||
                (i === 1 && done >= 4) ||
                (i === 2 && done >= 5) ||
                (i === 3 && done >= 6) ||
                (i === 4 && done >= 7)
              return (
                <span key={p} className="flex items-center gap-1">
                  {i > 0 && <span className="text-[10px] text-[var(--nq-text-mute)]">→</span>}
                  <span
                    className="nq-mono rounded px-1.5 py-0.5 text-[10.5px] font-bold"
                    style={{
                      background: reached ? 'color-mix(in srgb, var(--nq-ok) 13%, transparent)' : 'var(--nq-panel-2)',
                      color: reached ? 'var(--nq-ok)' : 'var(--nq-text-mute)',
                    }}
                  >
                    {p}
                  </span>
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
