import { useMemo, useState } from 'react'
import { useT } from '../lib/i18n'
import type { Bi } from '../data/courses'
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

/* ═══════════════════ b1l2 · the cable chooser ═══════════════════ */

interface Cable {
  id: string
  name: Bi
  reachM: number
  carriesPower: boolean
  noiseProof: boolean
  cost: Bi
  colour: string
}

const CABLES: Cable[] = [
  { id: 'cat5e', name: H('Cat5e તાંબુ', 'Cat5e copper'), reachM: 100, carriesPower: true, noiseProof: false, cost: H('સસ્તું', 'cheapest'), colour: 'var(--nq-beginner)' },
  { id: 'cat6a', name: H('Cat6a તાંબુ', 'Cat6a copper'), reachM: 100, carriesPower: true, noiseProof: false, cost: H('સસ્તું', 'cheap'), colour: 'var(--nq-ccna)' },
  { id: 'mmf', name: H('Multimode fibre', 'Multimode fibre'), reachM: 400, carriesPower: false, noiseProof: true, cost: H('મોંઘું', 'pricier'), colour: 'var(--nq-warn)' },
  { id: 'smf', name: H('Singlemode fibre', 'Singlemode fibre'), reachM: 10000, carriesPower: false, noiseProof: true, cost: H('સૌથી મોંઘું', 'priciest'), colour: 'var(--nq-ccnp)' },
]

const STOPS = [5, 30, 90, 100, 150, 400, 2000, 10000]
const metres = (m: number) => (m >= 1000 ? `${m / 1000} km` : `${m} m`)

const C1 = {
  title: H('કયો કેબલ ચાલશે?', 'Which cable will do?'),
  lead: H(
    'અંતર ખસેડો અને જરૂરિયાત ટિક કરો. જે કેબલ **ન** ચાલે એ કારણ સાથે બહાર થઈ જશે.',
    'Move the distance and tick what you need. Any cable that **will not** do drops out, with the reason.',
  ),
  dist: H('અંતર', 'Distance'),
  needs: H('જરૂરિયાત', 'What you need'),
  power: H('કેબલમાં વીજળી પણ (PoE)', 'Power down the cable too (PoE)'),
  noise: H('મશીનોનો વીજ-ઘોંઘાટ છે', 'There is electrical noise around'),
  tooFar: H('આટલે દૂર પહોંચે નહીં', 'does not reach that far'),
  noPower: H('કાચમાં વીજળી ન જાય', 'glass carries no power'),
  noisy: H('તાંબુ ઘોંઘાટ પકડે', 'copper picks up noise'),
  works: H('ચાલશે', 'will work'),
  none: H('આ બધી શરતો સાથે એકેય કેબલ નથી. કોઈ એક શરત છોડવી પડશે — સામાન્ય રીતે PoE, કારણ કે દૂરના ઉપકરણ માટે ત્યાં જ અલગ વીજળી આપવી પડે.', 'No cable meets all of those at once. One condition has to go — usually PoE, because a device that far away needs its own power anyway.'),
  cheapest: H('સૌથી સસ્તો જે ચાલે', 'the cheapest one that works'),
}

export function CableChooser() {
  const t = useT()
  const [i, setI] = useState(2)
  const [poe, setPoe] = useState(false)
  const [noise, setNoise] = useState(false)
  const dist = STOPS[i]

  const judged = CABLES.map((c) => {
    const reasons: Bi[] = []
    if (dist > c.reachM) reasons.push(C1.tooFar)
    if (poe && !c.carriesPower) reasons.push(C1.noPower)
    if (noise && !c.noiseProof) reasons.push(C1.noisy)
    return { c, reasons }
  })
  const ok = judged.filter((j) => !j.reasons.length)

  return (
    <ToolFrame
      title={C1.title}
      lead={C1.lead}
      onReset={() => {
        setI(2)
        setPoe(false)
        setNoise(false)
      }}
      status={
        ok.length ? (
          <span className="text-sm font-semibold" style={{ color: 'var(--nq-ok)' }}>
            ✓ {ok.length} {t(C1.works)} — {t(C1.cheapest)}: {t(ok[0].c.name)}
          </span>
        ) : (
          <span className="text-sm font-semibold" style={{ color: 'var(--nq-warn)' }}>
            ✕ 0 {t(C1.works)}
          </span>
        )
      }
    >
      <div className="grid gap-5 sm:grid-cols-[1fr_1fr]">
        <div>
          <ToolHead>{t(C1.dist)}</ToolHead>
          <p className="nq-mono mt-2 text-2xl font-bold text-[var(--nq-text)]">{metres(dist)}</p>
          <input
            type="range"
            min={0}
            max={STOPS.length - 1}
            value={i}
            onChange={(e) => setI(Number(e.target.value))}
            className="nq-focus mt-2 w-full accent-[var(--nq-accent)]"
            aria-label={t(C1.dist)}
          />
          <div className="mt-1 flex justify-between">
            <span className="nq-mono text-[10px] text-[var(--nq-text-mute)]">{metres(STOPS[0])}</span>
            <span className="nq-mono text-[10px] text-[var(--nq-text-mute)]">
              {metres(STOPS[STOPS.length - 1])}
            </span>
          </div>

          <div className="mt-4">
            <ToolHead>{t(C1.needs)}</ToolHead>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-[var(--nq-text-dim)]">
              <input type="checkbox" checked={poe} onChange={(e) => setPoe(e.target.checked)} className="nq-focus accent-[var(--nq-accent)]" />
              {t(C1.power)}
            </label>
            <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-sm text-[var(--nq-text-dim)]">
              <input type="checkbox" checked={noise} onChange={(e) => setNoise(e.target.checked)} className="nq-focus accent-[var(--nq-accent)]" />
              {t(C1.noise)}
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          {judged.map(({ c, reasons }) => (
            <div
              key={c.id}
              className="rounded-lg border px-3 py-2.5 transition"
              style={{
                borderColor: reasons.length ? 'var(--nq-border)' : 'var(--nq-ok)',
                background: reasons.length ? 'transparent' : 'color-mix(in srgb, var(--nq-ok) 9%, transparent)',
                opacity: reasons.length ? 0.55 : 1,
              }}
            >
              <div className="flex items-baseline gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.colour }} />
                <span className="text-sm font-semibold text-[var(--nq-text)]">{t(c.name)}</span>
                <span className="nq-mono ml-auto text-[11px] text-[var(--nq-text-mute)]">
                  {metres(c.reachM)} · {t(c.cost)}
                </span>
              </div>
              <p className="mt-1 text-[11.5px]" style={{ color: reasons.length ? 'var(--nq-warn)' : 'var(--nq-ok)' }}>
                {reasons.length ? reasons.map((r) => t(r)).join(' · ') : `✓ ${t(C1.works)}`}
              </p>
            </div>
          ))}
          {!ok.length && <Verdict tone="info">{t(C1.none)}</Verdict>}
        </div>
      </div>
    </ToolFrame>
  )
}

/* ═══════════════════ b1l3 · LAN, WAN or the internet ═══════════════════ */

type Zone = 'lan' | 'wan' | 'both'

interface Thing {
  id: string
  name: Bi
  zone: Zone
  why: Bi
}

const THINGS: Thing[] = [
  { id: 'laptop', name: H('તમારો લેપટોપ', 'Your laptop'), zone: 'lan', why: H('ઘરના એ જ નેટવર્કમાં', 'on the one network in your home') },
  { id: 'printer', name: H('ઘરનું printer', 'The printer at home'), zone: 'lan', why: H('એ જ ઓરડાનું — બહાર કોઈ એને જોતું નથી', 'in the same room; nobody outside can see it') },
  { id: 'router', name: H('ઘરનું Wi-Fi router', 'Your home Wi-Fi router'), zone: 'both', why: H('એક પગ LAN માં, એક WAN માં — એટલે જ એને gateway કહે છે', 'one foot in the LAN, one in the WAN — which is why it is the gateway') },
  { id: 'isp', name: H('ISP ની લાઇન', 'The line from your ISP'), zone: 'wan', why: H('તમારા ઘરની બહાર, શહેર પાર', 'outside your house, across the city') },
  { id: 'google', name: H('Google નો server', 'A Google server'), zone: 'wan', why: H('બીજા દેશમાં — તમારા LAN સાથે કોઈ સંબંધ નથી', 'in another country, nothing to do with your LAN') },
  { id: 'phone', name: H('ઘરના Wi-Fi પરનો મોબાઇલ', 'Your phone on the home Wi-Fi'), zone: 'lan', why: H('Wi-Fi એ પણ LAN જ છે — તાર નથી, એટલું જ', 'Wi-Fi is still a LAN; it just has no cable') },
]

const ZONES: { id: Zone; label: Bi; note: Bi }[] = [
  { id: 'lan', label: H('LAN', 'LAN'), note: H('એક જગ્યા', 'one place') },
  { id: 'both', label: H('બંનેમાં', 'In both'), note: H('સરહદ પર', 'on the border') },
  { id: 'wan', label: H('WAN / Internet', 'WAN / internet'), note: H('જગ્યાઓ વચ્ચે', 'between places') },
]

const C2 = {
  title: H('કયા વર્તુળમાં?', 'Which circle does it belong in?'),
  lead: H(
    'દરેક વસ્તુ એના વર્તુળમાં મૂકો. એક વસ્તુ **બંનેમાં** આવે — જોઈએ કે તમે એ પકડો છો કે નહીં.',
    'Put each thing in its circle. One of them belongs in **both** — see whether you catch it.',
  ),
  left: H('મૂકવાનું બાકી', 'Still to place'),
  done: H('બધું ગોઠવાઈ ગયું.', 'Everything placed.'),
}

export function ZoneSorter() {
  const t = useT()
  const [seed, setSeed] = useState(0)
  const [placed, setPlaced] = useState<Record<string, Zone>>({})
  const [picked, setPicked] = useState<Thing | null>(null)
  const [said, setSaid] = useState<{ thing: Thing; right: boolean } | null>(null)
  const pool = useMemo(() => shuffle(THINGS), [seed])

  const left = pool.filter((x) => !placed[x.id])
  const put = (z: Zone) => {
    if (!picked) return
    const right = picked.zone === z
    setSaid({ thing: picked, right })
    if (right) setPlaced((p) => ({ ...p, [picked.id]: z }))
    setPicked(null)
  }

  return (
    <ToolFrame
      title={C2.title}
      lead={C2.lead}
      onReset={() => {
        setSeed((s) => s + 1)
        setPlaced({})
        setPicked(null)
        setSaid(null)
      }}
      status={
        left.length ? (
          <span className="nq-mono text-[12px] text-[var(--nq-text-mute)]">
            {left.length} {t(C2.left)}
          </span>
        ) : (
          <span className="text-sm font-semibold" style={{ color: 'var(--nq-ok)' }}>
            ✓ {t(C2.done)}
          </span>
        )
      }
    >
      {said && (
        <div className="mb-3">
          <Verdict tone={said.right ? 'ok' : 'miss'}>
            <strong>{t(said.thing.name)}</strong> — {t(said.thing.why)}
          </Verdict>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {left.map((x) => (
          <Choice key={x.id} on={picked?.id === x.id} onClick={() => setPicked(x)}>
            <span className="text-sm font-semibold text-[var(--nq-text)]">{t(x.name)}</span>
          </Choice>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {ZONES.map((z) => {
          const mine = THINGS.filter((x) => placed[x.id] === z.id)
          return (
            <button
              key={z.id}
              onClick={() => put(z.id)}
              disabled={!picked}
              className="nq-focus min-h-[9rem] rounded-xl border-2 border-dashed p-3 text-left transition disabled:cursor-default"
              style={{
                borderColor: picked ? 'var(--nq-accent)' : 'var(--nq-border-2)',
                background: picked ? 'color-mix(in srgb, var(--nq-accent) 5%, transparent)' : 'transparent',
              }}
            >
              <span className="block text-sm font-bold text-[var(--nq-text)]">{t(z.label)}</span>
              <span className="block text-[11px] text-[var(--nq-text-mute)]">{t(z.note)}</span>
              <div className="mt-2 space-y-1">
                {mine.map((x) => (
                  <span key={x.id} className="block text-[11.5px]" style={{ color: 'var(--nq-ok)' }}>
                    ✓ {t(x.name)}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </ToolFrame>
  )
}

/* ═══════════════════ b1l4 · who is the client, who the server ═══════════════════ */

type Role = 'client' | 'server' | 'both'

interface Scene {
  id: string
  text: Bi
  about: Bi
  role: Role
  why: Bi
}

const SCENES: Scene[] = [
  { id: 'yt', text: H('તમે YouTube પર વિડિયો જુઓ છો.', 'You are watching a video on YouTube.'), about: H('તમારો લેપટોપ', 'your laptop'), role: 'client', why: H('એ માગે છે, આપતું નથી.', 'it is asking, not giving.') },
  { id: 'print', text: H('તમે printer પર file મોકલો છો.', 'You send a file to the printer.'), about: H('Printer', 'the printer'), role: 'server', why: H('એ વિનંતી સાંભળીને સેવા આપે છે — ભલે એ નાનું હોય.', 'it listens for requests and provides a service, however small it is.') },
  { id: 'drop', text: H('બે મોબાઇલ વચ્ચે સીધી file મોકલાય છે.', 'Two phones send a file directly to each other.'), about: H('દરેક મોબાઇલ', 'each phone'), role: 'both', why: H('એક માગે, બીજો આપે — અને પછી ઊલટું. ભૂમિકા છે, મશીન નહીં.', 'one asks, the other gives — and then the other way round. It is a role, not a machine.') },
  { id: 'site', text: H('કોઈ તમારી બનાવેલી website ખોલે છે.', 'Somebody opens the website you built.'), about: H('તમારો computer', 'your computer'), role: 'server', why: H('આ વખતે તમે આપનાર છો. એ જ મશીન, જુદી ભૂમિકા.', 'this time you are the one giving. Same machine, different role.') },
  { id: 'dns', text: H('તમારો લેપટોપ DNS ને પૂછે છે "google.com ક્યાં છે?"', 'Your laptop asks DNS "where is google.com?"'), about: H('તમારો લેપટોપ', 'your laptop'), role: 'client', why: H('DNS server સામે પણ તમે client જ છો.', 'even towards the DNS server you are the client.') },
]

const ROLES: { id: Role; label: Bi }[] = [
  { id: 'client', label: H('Client — માગે છે', 'Client — it asks') },
  { id: 'server', label: H('Server — આપે છે', 'Server — it gives') },
  { id: 'both', label: H('બંને', 'Both') },
]

const C3 = {
  title: H('કોણ માગે છે, કોણ આપે છે?', 'Who is asking, who is giving?'),
  lead: H(
    'દરેક દૃશ્યમાં કહો કે **જેની વાત છે** એ client છે કે server. એક દૃશ્ય બંને છે.',
    'In each scene, say whether **the thing named** is a client or a server. One of them is both.',
  ),
  of: H('જેની વાત છે', 'the one in question'),
  score: H('સાચાં', 'right'),
  done: H('બધાં પૂરાં.', 'All done.'),
}

export function ClientServer() {
  const t = useT()
  const [n, setN] = useState(0)
  const [hits, setHits] = useState(0)
  const [said, setSaid] = useState<{ right: boolean; why: Bi } | null>(null)
  const s = SCENES[n]

  const answer = (r: Role) => {
    if (said) return
    const right = r === s.role
    setSaid({ right, why: s.why })
    if (right) setHits((h) => h + 1)
  }

  const next = () => {
    setSaid(null)
    setN((x) => x + 1)
  }

  const over = n >= SCENES.length

  return (
    <ToolFrame
      title={C3.title}
      lead={C3.lead}
      onReset={() => {
        setN(0)
        setHits(0)
        setSaid(null)
      }}
      status={
        <span className="nq-mono text-[12px] text-[var(--nq-text-mute)]">
          {hits} / {SCENES.length} {t(C3.score)}
        </span>
      }
    >
      {over ? (
        <p className="text-sm font-semibold" style={{ color: 'var(--nq-ok)' }}>
          ✓ {t(C3.done)}
        </p>
      ) : (
        <>
          <p className="nq-prose text-[1.0625rem] leading-[1.7] text-[var(--nq-text)]">{t(s.text)}</p>
          <p className="mt-1 text-[12px] text-[var(--nq-text-mute)]">
            {t(C3.of)}: <strong className="text-[var(--nq-text-dim)]">{t(s.about)}</strong>
          </p>

          <div className="mt-4 grid gap-1.5 sm:grid-cols-3">
            {ROLES.map((r) => (
              <Choice
                key={r.id}
                disabled={!!said}
                done={!!said && r.id === s.role}
                onClick={() => answer(r.id)}
                className="text-center"
              >
                <span className="block text-sm font-semibold text-[var(--nq-text)]">{t(r.label)}</span>
              </Choice>
            ))}
          </div>

          {said && (
            <div className="mt-3 space-y-3">
              <Verdict tone={said.right ? 'ok' : 'miss'}>{t(said.why)}</Verdict>
              <button
                onClick={next}
                className="nq-focus rounded-lg px-4 py-2 text-sm font-semibold"
                style={{ background: 'var(--nq-accent)', color: 'var(--nq-on-accent)' }}
              >
                {n + 1 < SCENES.length ? '→' : '✓'}
              </button>
            </div>
          )}
        </>
      )}
    </ToolFrame>
  )
}

/* ═══════════════════ b1l5 · match the device to its job ═══════════════════ */

interface Cast {
  id: string
  device: Bi
  job: Bi
}

const CAST: Cast[] = [
  { id: 'switch', device: H('Switch', 'Switch'), job: H('એક જ જગ્યાનાં ઉપકરણોને જોડે', 'joins up the devices in one place') },
  { id: 'router', device: H('Router', 'Router'), job: H('બીજા નેટવર્ક સુધીનો રસ્તો શોધે', 'finds the way to another network') },
  { id: 'firewall', device: H('Firewall', 'Firewall'), job: H('નક્કી કરે કે શું પસાર થવા દેવું', 'decides what is allowed through') },
  { id: 'ap', device: H('Access point', 'Access point'), job: H('રેડિયો તરંગને તારમાં બદલે', 'turns radio waves into cable') },
  { id: 'server', device: H('Server', 'Server'), job: H('વિનંતી સાંભળીને સેવા આપે', 'listens for requests and serves them') },
  { id: 'modem', device: H('Modem', 'Modem'), job: H('ISP ની લાઇનને નેટવર્કમાં બદલે', 'turns the ISP’s line into a network') },
]

const C4 = {
  title: H('કોનું કયું કામ?', 'Whose job is which?'),
  lead: H(
    'ઉપકરણ પસંદ કરો, પછી એનું કામ. ખોટું જોડો તો કહીશ કે એ કામ **ખરેખર કોનું** છે.',
    'Pick a device, then its job. Join the wrong pair and it will tell you **whose job that really is**.',
  ),
  devices: H('ઉપકરણ', 'Devices'),
  jobs: H('કામ', 'Jobs'),
  score: H('મળ્યાં', 'matched'),
  done: H('બધાં મળી ગયાં.', 'All matched.'),
  actually: H('એ કામ ખરેખર આનું છે', 'that job really belongs to'),
}

export function DeviceCast() {
  const t = useT()
  const [seed, setSeed] = useState(0)
  const [picked, setPicked] = useState<Cast | null>(null)
  const [solved, setSolved] = useState<string[]>([])
  const [miss, setMiss] = useState<{ chose: Cast; actual: Cast } | null>(null)

  const devices = useMemo(() => shuffle(CAST), [seed])
  const jobs = useMemo(() => shuffle(CAST), [seed])

  const tapDevice = (c: Cast) => {
    setPicked(c)
    setMiss(null)
  }
  const tapJob = (c: Cast) => {
    if (!picked) return
    if (c.id === picked.id) {
      setSolved((s) => [...s, c.id])
      setMiss(null)
    } else {
      setMiss({ chose: picked, actual: c })
    }
    setPicked(null)
  }

  const allDone = solved.length === CAST.length

  return (
    <ToolFrame
      title={C4.title}
      lead={C4.lead}
      onReset={() => {
        setSeed((s) => s + 1)
        setPicked(null)
        setSolved([])
        setMiss(null)
      }}
      status={
        allDone ? (
          <span className="text-sm font-semibold" style={{ color: 'var(--nq-ok)' }}>
            ✓ {t(C4.done)}
          </span>
        ) : (
          <span className="nq-mono text-[12px] text-[var(--nq-text-mute)]">
            {solved.length} / {CAST.length} {t(C4.score)}
          </span>
        )
      }
    >
      {miss && (
        <div className="mb-3">
          <Verdict tone="miss">
            {t(C4.actually)} <strong>{t(miss.actual.device)}</strong>.
          </Verdict>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <ToolHead>{t(C4.devices)}</ToolHead>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {devices.map((c) => {
              const done = solved.includes(c.id)
              return (
                <Choice
                  key={c.id}
                  on={picked?.id === c.id}
                  done={done}
                  disabled={done}
                  onClick={() => tapDevice(c)}
                  className="text-center"
                >
                  <span className="block text-sm font-semibold text-[var(--nq-text)]">
                    {done && '✓ '}
                    {t(c.device)}
                  </span>
                </Choice>
              )
            })}
          </div>
        </div>

        <div>
          <ToolHead>{t(C4.jobs)}</ToolHead>
          <div className="mt-2 space-y-1.5">
            {jobs.map((c) => {
              const done = solved.includes(c.id)
              return (
                <Choice
                  key={c.id}
                  done={done}
                  disabled={done || !picked}
                  onClick={() => tapJob(c)}
                  className="block w-full"
                >
                  <span className="block text-[12.5px] text-[var(--nq-text-dim)]">
                    {done && '✓ '}
                    {t(c.job)}
                  </span>
                </Choice>
              )
            })}
          </div>
        </div>
      </div>
    </ToolFrame>
  )
}
