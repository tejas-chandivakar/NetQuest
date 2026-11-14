import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../lib/i18n'
import type { Bi } from '../data/courses'
import { rich } from './Prose'
import { Choice, ToolFrame, ToolHead, Verdict } from './ToolFrame'

const H = (gu: string, en: string): Bi => ({ gu, en })

/* ═══════════════════ b4l4 · open up the home router ═══════════════════ */

interface Part {
  id: string
  name: Bi
  job: Bi
  detail: Bi
  tone: string
  lessons: { id: string; label: string }[]
}

const PARTS: Part[] = [
  {
    id: 'switch',
    name: H('Switch', 'A switch'),
    job: H('પાછળના ચાર LAN port', 'the four LAN sockets on the back'),
    detail: H(
      'ઘરનાં ઉપકરણો એકબીજા સાથે આના દ્વારા વાત કરે છે. તમારો લેપટોપ printer ને file મોકલે ત્યારે એ **ઇન્ટરનેટ સુધી જતી જ નથી** — આ ટુકડો જ એને સીધી આપી દે છે.',
      'This is how the things in your home talk to each other. When your laptop sends a file to the printer it **never goes near the internet** — this piece hands it straight over.',
    ),
    tone: 'var(--nq-dev-switch)',
    lessons: [{ id: 'b1l5', label: 'b1l5' }, { id: 'b2l2', label: 'b2l2' }],
  },
  {
    id: 'router',
    name: H('Router', 'A router'),
    job: H('WAN port — બહાર જવાનો દરવાજો', 'the WAN socket — the door out'),
    detail: H(
      'ઘરની બહારની દરેક વસ્તુ આમાંથી પસાર થાય. તમારાં ઉપકરણો માટે આ **default gateway** છે — "ખબર ન પડે તો આને આપી દો".',
      'Everything outside your home passes through here. To your devices this is the **default gateway** — "if you do not know, hand it to this".',
    ),
    tone: 'var(--nq-dev-router)',
    lessons: [{ id: 'b1l3', label: 'b1l3' }, { id: 'b1l5', label: 'b1l5' }],
  },
  {
    id: 'ap',
    name: H('Access point', 'An access point'),
    job: H('અંદરનું રેડિયો — Wi-Fi', 'the radio inside — the Wi-Fi'),
    detail: H(
      'તાર વગરનાં ઉપકરણોને એ જ નેટવર્કમાં લાવે. એટલે Wi-Fi વાળો મોબાઇલ અને તારવાળો લેપટોપ **એક જ LAN** માં છે — એકબીજાને જોઈ શકે.',
      'It brings wireless devices onto the same network. Which is why a phone on Wi-Fi and a laptop on a cable are **on one LAN** and can see each other.',
    ),
    tone: 'var(--nq-dev-ap)',
    lessons: [{ id: 'b1l2', label: 'b1l2' }],
  },
  {
    id: 'dhcp',
    name: H('DHCP server', 'A DHCP server'),
    job: H('સરનામાં વહેંચે', 'it hands out addresses'),
    detail: H(
      'નવું ઉપકરણ જોડાય એટલે એ બૂમ પાડે "કોઈ મને સરનામું આપશે?" — અને આ ટુકડો જવાબ આપે. એટલે તમારે કદી હાથે IP લખવું પડતું નથી.',
      'A new device joins and shouts "will anyone give me an address?" — and this piece answers. Which is why you have never had to type an IP address at home.',
    ),
    tone: 'var(--nq-pkt-dns)',
    lessons: [{ id: 'b4l3', label: 'b4l3' }],
  },
  {
    id: 'nat',
    name: H('NAT', 'NAT'),
    job: H('એક public IP ને બધામાં વહેંચે', 'shares one public IP among everything'),
    detail: H(
      'ISP તમને **એક જ** public સરનામું આપે છે, પણ ઘરમાં બાર ઉપકરણ છે. NAT દરેકનું ખાનગી સરનામું બહાર જતાં બદલી નાખે અને જવાબ પાછો સાચાને આપે.',
      'Your ISP gives you **one** public address, and there are a dozen devices in the house. NAT swaps each private address on the way out and hands the reply back to the right one.',
    ),
    tone: 'var(--nq-dev-server)',
    lessons: [{ id: 'b2l4', label: 'b2l4' }],
  },
  {
    id: 'fw',
    name: H('Firewall', 'A firewall'),
    job: H('બહારથી આવતું રોકે', 'it blocks what comes from outside'),
    detail: H(
      'અંદરથી બહાર જતું ચાલે, બહારથી અંદર આવતું **ન** ચાલે — જ્યાં સુધી તમે ખાસ પરવાનગી ન આપો. એટલે જ ઇન્ટરનેટ પરથી કોઈ તમારા printer સુધી પહોંચી શકતું નથી.',
      'Outbound is fine, inbound is **not** — unless you specifically allow it. It is why nobody on the internet can reach your printer.',
    ),
    tone: 'var(--nq-dev-fw)',
    lessons: [{ id: 'b4l5', label: 'b4l5' }],
  },
]

const R = {
  title: H('તમારા ઘરનું router ખોલો', 'Open up the box at home'),
  lead: H(
    'એ એક દેખાતું બોક્સ **છ અલગ ઉપકરણો** છે, એક ડબ્બામાં. ખોલો અને કોઈ પણ ટુકડા પર ટેપ કરો.',
    'That one box you can see is **six separate devices** in one case. Open it and tap any piece.',
  ),
  open: H('ખોલો', 'Open it'),
  close: H('બંધ કરો', 'Close it'),
  closed: H('બહારથી: એક બોક્સ, થોડી લાઇટ, બે antenna.', 'From outside: one box, a few lights, two aerials.'),
  seeIn: H('આ ક્યાં શીખવ્યું', 'Where this was taught'),
  all: H(
    'આખા Foundation course માં જે શીખ્યા એ **બધું** આ એક ડબ્બામાં છે. મોટી ઓફિસમાં આ છ ટુકડા છ અલગ ઉપકરણ હોય — ઘરમાં એ બધા ભેગા કરી દીધા, કારણ કે સસ્તું પડે.',
    'Everything you learned across the whole Foundation course is in this one case. In a large office these six are six separate devices — at home they were merged, because it is cheaper.',
  ),
}

export function InsideRouter() {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [sel, setSel] = useState<Part | null>(null)

  return (
    <ToolFrame
      title={R.title}
      lead={R.lead}
      onReset={() => {
        setOpen(false)
        setSel(null)
      }}
      status={
        <button
          onClick={() => {
            setOpen((o) => !o)
            setSel(null)
          }}
          className="nq-focus rounded-lg px-4 py-1.5 text-sm font-semibold"
          style={{ background: 'var(--nq-accent)', color: 'var(--nq-on-accent)' }}
        >
          {open ? t(R.close) : t(R.open)}
        </button>
      }
    >
      {!open ? (
        <div className="flex flex-col items-center py-6">
          <svg width="260" height="130" viewBox="0 0 260 130" aria-hidden>
            <path d="M40 18 L46 2 M220 18 L214 2" stroke="var(--nq-wire)" strokeWidth="3" strokeLinecap="round" />
            <rect x="20" y="18" width="220" height="80" rx="10" fill="var(--nq-panel-2)" stroke="var(--nq-border-2)" strokeWidth="2" />
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} cx={52 + i * 26} cy={58} r="5" fill={i < 3 ? 'var(--nq-ok)' : 'var(--nq-border-2)'} />
            ))}
            <rect x="160" y="48" width="58" height="20" rx="4" fill="var(--nq-border)" />
          </svg>
          <p className="mt-2 text-[12px] text-[var(--nq-text-mute)]">{t(R.closed)}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-1.5 sm:grid-cols-3">
            {PARTS.map((p) => (
              <Choice key={p.id} on={sel?.id === p.id} onClick={() => setSel(p)} className="block w-full">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.tone }} />
                  <span className="text-sm font-semibold text-[var(--nq-text)]">{t(p.name)}</span>
                </span>
                <span className="mt-0.5 block text-[11px] text-[var(--nq-text-mute)]">{t(p.job)}</span>
              </Choice>
            ))}
          </div>

          {sel ? (
            <div className="mt-4 rounded-xl border-2 p-4" style={{ borderColor: sel.tone, background: `color-mix(in srgb, ${sel.tone} 6%, transparent)` }}>
              <span className="text-[11px] font-bold uppercase tracking-[0.13em]" style={{ color: sel.tone }}>
                {t(sel.name)}
              </span>
              <p className="nq-prose mt-1.5 text-[15px] leading-[1.7] text-[var(--nq-text-dim)]">
                {rich(t(sel.detail))}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.1em] text-[var(--nq-text-mute)]">
                  {t(R.seeIn)}
                </span>
                {sel.lessons.map((l) => (
                  <Link
                    key={l.id}
                    to={`/lesson/${l.id}`}
                    className="nq-focus nq-mono rounded-md border px-2 py-0.5 text-[11px] font-semibold transition hover:text-[var(--nq-accent)]"
                    style={{ borderColor: 'var(--nq-border-2)', color: 'var(--nq-text-dim)' }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Verdict tone="info">{rich(t(R.all))}</Verdict>
            </div>
          )}
        </>
      )}
    </ToolFrame>
  )
}

/* ═══════════════════ b4l5 · build the firewall rules ═══════════════════ */

type Dir = 'out' | 'in'

interface Rule {
  id: string
  action: 'allow' | 'deny'
  dir: Dir
  port: string
  label: Bi
}

const AVAILABLE: Omit<Rule, 'id'>[] = [
  { action: 'allow', dir: 'out', port: '80', label: H('બહાર જતું — સાદી website', 'outbound — plain websites') },
  { action: 'allow', dir: 'out', port: '443', label: H('બહાર જતું — તાળાવાળી website', 'outbound — websites with the padlock') },
  { action: 'allow', dir: 'out', port: '53', label: H('બહાર જતું — DNS', 'outbound — DNS') },
  { action: 'allow', dir: 'in', port: '22', label: H('અંદર આવતું — SSH', 'inbound — SSH') },
  { action: 'deny', dir: 'in', port: 'all', label: H('અંદર આવતું — બધું બંધ', 'inbound — block everything') },
  { action: 'allow', dir: 'in', port: 'all', label: H('અંદર આવતું — બધું ખોલો', 'inbound — allow everything') },
]

interface Probe {
  id: string
  name: Bi
  dir: Dir
  port: string
  friendly: boolean
}

const PROBES: Probe[] = [
  { id: 'web', name: H('તમે website ખોલો છો', 'You open a website'), dir: 'out', port: '443', friendly: true },
  { id: 'dns', name: H('તમારો લેપટોપ DNS પૂછે છે', 'Your laptop asks DNS'), dir: 'out', port: '53', friendly: true },
  { id: 'scan', name: H('બહારથી કોઈ દરવાજા ખખડાવે છે', 'Somebody outside rattles your doors'), dir: 'in', port: '445', friendly: false },
  { id: 'ssh', name: H('બહારથી કોઈ SSH કરવા માગે છે', 'Somebody outside tries to SSH in'), dir: 'in', port: '22', friendly: false },
]

const F = {
  title: H('Firewall ના નિયમ જાતે લખો', 'Build the firewall rules yourself'),
  lead: H(
    'નિયમ ઉમેરો, પછી traffic ચલાવો. નિયમ **ઉપરથી નીચે** વંચાય છે અને **પહેલો મેળ જીતે** — એટલે ક્રમ બધું બદલી નાખે છે.',
    'Add rules, then run the traffic. Rules are read **top to bottom** and the **first match wins** — so the order changes everything.',
  ),
  yours: H('તમારા નિયમ', 'Your rules'),
  add: H('ઉમેરવા માટે', 'Rules you can add'),
  run: H('Traffic ચલાવો', 'Run the traffic'),
  empty: H('એકેય નિયમ નથી. નીચેથી ઉમેરો.', 'No rules yet. Add some from below.'),
  implicit: H('છેડે: જે કશામાં મેળ ન ખાય', 'at the end: anything that matched nothing'),
  implicitDeny: H('બંધ (મૂળભૂત)', 'blocked (the default)'),
  matched: H('મેળ ખાધો', 'matched'),
  nothing: H('કશામાં મેળ ન ખાધો', 'matched nothing'),
  allowed: H('પસાર', 'through'),
  blocked: H('રોકાયું', 'stopped'),
  leak: H(
    'બહારથી આવતું અંદર પહોંચી ગયું. કાં તો તમે `allow in` ઉપર રાખ્યું છે, કાં છેડે `deny in all` નથી — અને મૂળભૂત રીતે જે કશામાં મેળ ન ખાય એ **પસાર થઈ જાય** છે.',
    'Something from outside got in. Either an `allow in` is sitting above, or there is no `deny in all` at the end — and by default anything matching nothing **goes through**.',
  ),
  tight: H(
    'બરાબર. બહાર જતું ચાલે છે, બહારથી આવતું રોકાય છે. ઘરના router માં આ જ મૂળભૂત ગોઠવણ છે — એટલે તમારે કશું કરવું પડતું નથી.',
    'That is right. Outbound passes, inbound is stopped. This is exactly how the box at home ships — which is why you never had to do anything.',
  ),
  up: H('ઉપર', 'up'),
  del: H('કાઢો', 'remove'),
}

const judge = (rules: Rule[], p: Probe) => {
  for (const r of rules) {
    if (r.dir !== p.dir) continue
    if (r.port !== 'all' && r.port !== p.port) continue
    return { rule: r, pass: r.action === 'allow' }
  }
  return { rule: null, pass: true } // nothing matched: the default here is to pass
}

export function FirewallRules() {
  const t = useT()
  const [rules, setRules] = useState<Rule[]>([])
  const [ran, setRan] = useState(false)

  const add = (r: Omit<Rule, 'id'>) =>
    setRules((s) => [...s, { ...r, id: `${r.action}-${r.dir}-${r.port}-${s.length}` }])
  const up = (i: number) =>
    setRules((s) => {
      if (i === 0) return s
      const c = [...s]
      ;[c[i - 1], c[i]] = [c[i], c[i - 1]]
      return c
    })
  const del = (i: number) => setRules((s) => s.filter((_, n) => n !== i))

  const results = PROBES.map((p) => ({ p, ...judge(rules, p) }))
  const leaked = ran && results.some((r) => !r.p.friendly && r.pass)
  const tight = ran && results.every((r) => (r.p.friendly ? r.pass : !r.pass))

  return (
    <ToolFrame
      title={F.title}
      lead={F.lead}
      onReset={() => {
        setRules([])
        setRan(false)
      }}
      status={
        <button
          onClick={() => setRan(true)}
          disabled={!rules.length}
          className="nq-focus rounded-lg px-4 py-1.5 text-sm font-semibold disabled:opacity-40"
          style={{ background: 'var(--nq-accent)', color: 'var(--nq-on-accent)' }}
        >
          ▶ {t(F.run)}
        </button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <ToolHead>{t(F.yours)}</ToolHead>
          <div className="mt-2 space-y-1">
            {rules.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center gap-2 rounded-lg border px-3 py-1.5"
                style={{
                  borderColor: r.action === 'allow' ? 'var(--nq-ok)' : 'var(--nq-err)',
                  background: `color-mix(in srgb, ${r.action === 'allow' ? 'var(--nq-ok)' : 'var(--nq-err)'} 7%, transparent)`,
                }}
              >
                <span className="nq-mono text-[10px] text-[var(--nq-text-mute)]">{i + 1}</span>
                <span className="nq-mono text-[12px] font-semibold text-[var(--nq-text)]">
                  {r.action} {r.dir} {r.port}
                </span>
                <button
                  onClick={() => up(i)}
                  disabled={i === 0}
                  title={t(F.up)}
                  className="nq-focus ml-auto rounded px-1.5 text-[11px] text-[var(--nq-text-mute)] disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => del(i)}
                  title={t(F.del)}
                  className="nq-focus rounded px-1.5 text-[11px] text-[var(--nq-text-mute)]"
                >
                  ✕
                </button>
              </div>
            ))}
            {!rules.length && (
              <p className="rounded-lg border border-dashed border-[var(--nq-border-2)] px-3 py-3 text-[12px] text-[var(--nq-text-mute)]">
                {t(F.empty)}
              </p>
            )}
            <div className="rounded-lg border border-dashed px-3 py-1.5" style={{ borderColor: 'var(--nq-border-2)' }}>
              <span className="text-[11px] text-[var(--nq-text-mute)]">
                {t(F.implicit)} → <strong style={{ color: 'var(--nq-warn)' }}>{t(F.allowed)}</strong>
              </span>
            </div>
          </div>

          <div className="mt-4">
            <ToolHead>{t(F.add)}</ToolHead>
            <div className="mt-2 space-y-1">
              {AVAILABLE.map((r, n) => (
                <Choice key={n} onClick={() => add(r)} className="block w-full">
                  <span className="nq-mono text-[12px] font-semibold text-[var(--nq-text)]">
                    + {r.action} {r.dir} {r.port}
                  </span>
                  <span className="block text-[11px] text-[var(--nq-text-mute)]">{t(r.label)}</span>
                </Choice>
              ))}
            </div>
          </div>
        </div>

        <div>
          <ToolHead>{t(F.run)}</ToolHead>
          <div className="mt-2 space-y-1.5">
            {results.map(({ p, rule, pass }) => (
              <div
                key={p.id}
                className="rounded-lg border px-3 py-2"
                style={{
                  borderColor: !ran ? 'var(--nq-border)' : pass ? 'var(--nq-ok)' : 'var(--nq-err)',
                  background: !ran
                    ? 'transparent'
                    : `color-mix(in srgb, ${pass ? 'var(--nq-ok)' : 'var(--nq-err)'} 7%, transparent)`,
                  opacity: ran ? 1 : 0.55,
                }}
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[12.5px] font-semibold text-[var(--nq-text)]">{t(p.name)}</span>
                  <span className="nq-mono ml-auto text-[11px] text-[var(--nq-text-mute)]">
                    {p.dir} {p.port}
                  </span>
                </div>
                {ran && (
                  <p className="mt-0.5 text-[11.5px]" style={{ color: pass ? 'var(--nq-ok)' : 'var(--nq-err)' }}>
                    {rule ? (
                      <>
                        {t(F.matched)}{' '}
                        <span className="nq-mono">
                          {rule.action} {rule.dir} {rule.port}
                        </span>
                      </>
                    ) : (
                      t(F.nothing)
                    )}{' '}
                    → {pass ? t(F.allowed) : t(F.blocked)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {leaked && (
            <div className="mt-3">
              <Verdict tone="miss">{rich(t(F.leak))}</Verdict>
            </div>
          )}
          {tight && (
            <div className="mt-3">
              <Verdict tone="ok">{t(F.tight)}</Verdict>
            </div>
          )}
        </div>
      </div>
    </ToolFrame>
  )
}
