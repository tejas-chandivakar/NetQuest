import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const WARN = 'var(--nq-warn)'

/* ══════════════════════ n3l3 · Static routing ══════════════════════ */

const staticNodes = (r1Route: boolean, r2Route: boolean) => [
  { id: 'pc1', x: 90, y: 230, type: 'pc' as const, label: 'PC1', sub: '10.1.1.10', accent: BEG },
  { id: 'r1', x: 310, y: 230, type: 'router' as const, label: 'R1', sub: r1Route ? 'knows 10.2.2.0' : 'knows 10.1.1.0', accent: r1Route ? CCNA : 'var(--nq-text-mute)' },
  { id: 'r2', x: 570, y: 230, type: 'router' as const, label: 'R2', sub: r2Route ? 'knows 10.1.1.0' : 'knows 10.2.2.0', accent: r2Route ? CCNA : 'var(--nq-text-mute)' },
  { id: 'pc2', x: 790, y: 230, type: 'pc' as const, label: 'PC2', sub: '10.2.2.10', accent: CCNP },
]

const staticLinks = [
  { id: 'a', from: 'pc1', to: 'r1', state: 'up' as const },
  { id: 'b', from: 'r1', to: 'r2', state: 'up' as const },
  { id: 'c', from: 'r2', to: 'pc2', state: 'up' as const },
]

export const n3l3: LessonSpec = {
  why: {
    gu: 'Router પાસે નકશો જન્મથી નથી હોતો. એ ફક્ત એટલું જ જાણે છે જે એની સાથે સીધું જોડાયેલું છે — બાકીની આખી દુનિયા એના માટે અજાણી છે. Static route એટલે તમે જાતે એને રસ્તો બતાવવો.',
    en: 'A router is not born with a map. It knows only what is directly attached to it — the rest of the world is a blank. A static route is you telling it the way by hand.',
  },
  steps: [
    {
      ms: 2800,
      label: { gu: 'Router ફક્ત પાડોશીને ઓળખે', en: 'A router only knows its neighbours' },
      text: {
        beginner: {
          gu: 'R1 ચાલુ કરો એટલે એ બે વસ્તુ જાણે છે: ડાબી બાજુનું 10.1.1.0 નેટવર્ક અને વચ્ચેની લિંક. બસ. 10.2.2.0 વિશે એને કશી જ ખબર નથી — ભલે એ ફક્ત એક hop દૂર હોય.',
          en: 'Power on R1 and it knows two things: the 10.1.1.0 network on its left and the link in the middle. That is all. It knows nothing of 10.2.2.0 — even though it is just one hop away.',
        },
        exam: {
          gu: 'Interface up/up થતાં જ connected (C) અને local (L) routes આપોઆપ table માં આવે છે, AD 0 સાથે. બીજું કશું આપોઆપ આવતું નથી.',
          en: 'As soon as an interface is up/up its connected (C) and local (L) routes appear automatically with AD 0. Nothing else arrives on its own.',
        },
      },
      scene: () => ({
        nodes: staticNodes(false, false),
        links: staticLinks,
      }),
      aside: () => ({
        title: { gu: 'R1 નું routing table', en: 'R1 routing table' },
        head: ['code', 'network', 'via'],
        rows: [
          ['C', '10.1.1.0/24', 'Gi0/0'],
          ['C', '10.0.12.0/30', 'Gi0/1'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'એટલે ping નિષ્ફળ જાય', en: 'So the ping fails' },
      text: {
        beginner: {
          gu: 'PC1 થી PC2 ને ping કરો. Packet R1 સુધી તો પહોંચે છે, પણ R1 પોતાનું table જુએ છે, 10.2.2.0 માટે કોઈ નોંધ નથી મળતી — અને એ packet ને ચૂપચાપ ફેંકી દે છે. Router ક્યારેય અનુમાન નથી કરતો.',
          en: 'Ping PC1 to PC2. The packet reaches R1, R1 checks its table, finds no entry for 10.2.2.0 — and drops the packet. A router never guesses.',
        },
        exam: {
          gu: 'Longest-prefix match નિષ્ફળ જાય અને કોઈ default route ન હોય તો packet drop થાય છે અને સામાન્ય રીતે ICMP "destination network unreachable" પાછું જાય.',
          en: 'When longest-prefix match finds nothing and there is no default route the packet is dropped, usually with an ICMP "destination network unreachable" sent back.',
        },
      },
      scene: (t) => ({
        nodes: staticNodes(false, false),
        links: staticLinks,
        packets: [
          { id: 'p', from: 'pc1', to: 'r1', t: 0.1 + ease(Math.min(1, t / 0.6)) * 0.8, color: t > 0.6 ? 'var(--nq-err)' : 'var(--nq-pkt-data)', label: t > 0.6 ? 'dropped ✕' : '→ 10.2.2.10' },
        ],
      }),
      say: (t) =>
        t > 0.6
          ? { nodeId: 'r1', text: { gu: '10.2.2.0 મારા table માં નથી', en: '10.2.2.0 is not in my table' } }
          : null,
    },
    {
      ms: 3000,
      label: { gu: 'એક લીટીમાં રસ્તો બતાવો', en: 'Point the way in one line' },
      text: {
        beginner: {
          gu: 'હવે R1 ને હાથે કહીએ: "10.2.2.0/24 જોઈતું હોય તો 10.0.12.2 ને આપી દેજે." આ એક જ લીટી — `ip route 10.2.2.0 255.255.255.0 10.0.12.2` — અને રસ્તો table માં આવી ગયો. કોઈ protocol નહીં, કોઈ વાટાઘાટ નહીં.',
          en: 'Now we tell R1 by hand: "if you want 10.2.2.0/24, hand it to 10.0.12.2." That one line — `ip route 10.2.2.0 255.255.255.0 10.0.12.2` — and the path is in the table. No protocol, no negotiation.',
        },
        exam: {
          gu: 'Syntax: `ip route <network> <mask> <next-hop | exit-interface>`. Static route ની AD 1 છે, એટલે connected પછી સૌથી વધુ ભરોસાપાત્ર ગણાય છે.',
          en: 'Syntax: `ip route <network> <mask> <next-hop | exit-interface>`. A static route has AD 1, making it the most trusted source after connected.',
        },
      },
      scene: (t) => ({
        nodes: staticNodes(t > 0.4, false),
        links: staticLinks,
      }),
      aside: (t) => ({
        title: { gu: 'R1 નું routing table', en: 'R1 routing table' },
        head: ['code', 'network', 'via'],
        rows:
          t > 0.4
            ? [
                ['C', '10.1.1.0/24', 'Gi0/0'],
                ['C', '10.0.12.0/30', 'Gi0/1'],
                ['S', '10.2.2.0/24', '10.0.12.2 ←'],
              ]
            : [
                ['C', '10.1.1.0/24', 'Gi0/0'],
                ['C', '10.0.12.0/30', 'Gi0/1'],
              ],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'અડધો રસ્તો — હજી ping નહીં ચાલે', en: 'Half a path — the ping still fails' },
      text: {
        beginner: {
          gu: 'અહીં સૌથી સામાન્ય ભૂલ થાય છે. Packet હવે R1 થી R2 સુધી અને PC2 સુધી પહોંચી જાય છે — પણ ping તો પણ નિષ્ફળ! કારણ? PC2 જવાબ મોકલે છે, R2 પોતાનું table જુએ છે, અને 10.1.1.0 માટે કશું નથી મળતું. **Routing બંને દિશામાં જોઈએ.**',
          en: 'Here is the classic mistake. The packet now reaches R2 and even PC2 — yet the ping still fails. Why? PC2 sends a reply, R2 checks its table, and finds nothing for 10.1.1.0. **Routing is needed in both directions.**',
        },
        exam: {
          gu: 'દરેક router ને destination અને source બંને networks નો રસ્તો જોઈએ. એક તરફી routing એ troubleshooting નું સૌથી વારંવારનું મૂળ કારણ છે.',
          en: 'Every router needs a path to both the destination and the source network. One-way routing is the single most common root cause in troubleshooting.',
        },
      },
      scene: (t) => ({
        nodes: staticNodes(true, false),
        links: staticLinks,
        packets:
          t < 0.5
            ? [{ id: 'f', from: 'pc1', to: 'pc2', t: 0.08 + ease(t / 0.5) * 0.84, color: 'var(--nq-ok)', label: 'forward ✓' }]
            : [{ id: 'r', from: 'pc2', to: 'r2', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-err)', label: 'reply dropped ✕' }],
      }),
      say: (t) =>
        t > 0.55
          ? { nodeId: 'r2', text: { gu: 'જવાબ ક્યાં મોકલું? રસ્તો જ નથી', en: 'Where do I send the reply? No route' } }
          : null,
      aside: () => ({
        title: { gu: 'R2 નું routing table', en: 'R2 routing table' },
        head: ['code', 'network', 'via'],
        rows: [
          ['C', '10.2.2.0/24', 'Gi0/0'],
          ['C', '10.0.12.0/30', 'Gi0/1'],
          ['—', '10.1.1.0/24', 'missing!'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'પાછો રસ્તો પણ લખો', en: 'Write the return path too' },
      text: {
        beginner: {
          gu: 'R2 પર પણ એવી જ એક લીટી લખો, ઊલટી દિશામાં: 10.1.1.0 માટે 10.0.12.1. હવે બંને routers પાસે બંને નેટવર્કના રસ્તા છે — અને ping ચાલે છે. દરેક static route હંમેશા જોડીમાં વિચારો.',
          en: 'Write the same kind of line on R2, pointing the other way: 10.1.1.0 via 10.0.12.1. Now both routers know both networks — and the ping works. Always think of static routes in pairs.',
        },
        exam: {
          gu: 'Bidirectional reachability માટે બંને છેડે routes જોઈએ. મોટા નેટવર્કમાં આ જ કારણે dynamic routing protocols વપરાય છે — હાથે લખવાનું exponentially વધે છે.',
          en: 'Bidirectional reachability needs routes at both ends. In a large network this is exactly why dynamic protocols exist — the hand-written entries grow exponentially.',
        },
      },
      scene: (t) => ({
        nodes: staticNodes(true, t > 0.3),
        links: staticLinks.map((l) => ({ ...l, flowing: t > 0.4 })),
        packets:
          t > 0.4
            ? [
                t < 0.7
                  ? { id: 'f', from: 'pc1', to: 'pc2', t: 0.08 + ease((t - 0.4) / 0.3) * 0.84, color: 'var(--nq-pkt-data)', label: 'request' }
                  : { id: 'r', from: 'pc2', to: 'pc1', t: 0.08 + ease((t - 0.7) / 0.3) * 0.84, color: 'var(--nq-ok)', label: 'reply ✓' },
              ]
            : [],
      }),
      aside: (t) => ({
        title: { gu: 'R2 નું routing table', en: 'R2 routing table' },
        head: ['code', 'network', 'via'],
        rows:
          t > 0.3
            ? [
                ['C', '10.2.2.0/24', 'Gi0/0'],
                ['C', '10.0.12.0/30', 'Gi0/1'],
                ['S', '10.1.1.0/24', '10.0.12.1 ←'],
              ]
            : [
                ['C', '10.2.2.0/24', 'Gi0/0'],
                ['C', '10.0.12.0/30', 'Gi0/1'],
              ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'Default route — બાકી બધું આ તરફ', en: 'The default route — everything else this way' },
      text: {
        beginner: {
          gu: 'Internet માં લાખો નેટવર્ક છે — બધાં માટે લીટી લખવી અશક્ય છે. એટલે એક ખાસ route લખાય છે: 0.0.0.0/0, જેનો અર્થ "જે કશું મેળ ન ખાય એ બધું આ તરફ મોકલી દે". એને default route કે gateway of last resort કહે છે.',
          en: 'The internet has millions of networks — writing a line for each is impossible. So we write one special route: 0.0.0.0/0, meaning "anything that matches nothing else, send it this way." That is the default route, the gateway of last resort.',
        },
        exam: {
          gu: '`ip route 0.0.0.0 0.0.0.0 <next-hop>`. Prefix length 0 હોવાથી એ હંમેશા સૌથી છેલ્લે match થાય — longest-prefix match માં સૌથી ટૂંકું.',
          en: '`ip route 0.0.0.0 0.0.0.0 <next-hop>`. With a prefix length of 0 it is always the last to match — the shortest in longest-prefix match.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc1', x: 110, y: 240, type: 'pc' as const, label: 'PC1', accent: BEG },
          { id: 'r1', x: 330, y: 240, type: 'router' as const, label: 'R1', sub: t > 0.3 ? '0.0.0.0/0 → ISP' : undefined, accent: CCNA, pulse: t > 0.3 },
          { id: 'isp', x: 580, y: 240, type: 'router' as const, label: 'ISP', accent: CCNP },
          { id: 'cl', x: 780, y: 200, type: 'cloud' as const, label: 'Internet', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'pc1', to: 'r1', state: 'up', flowing: t > 0.4 },
          { id: 'b', from: 'r1', to: 'isp', state: 'up', flowing: t > 0.55 },
          { id: 'c', from: 'isp', to: 'cl', state: 'up', flowing: t > 0.75 },
        ],
        packets:
          t > 0.4
            ? [
                t < 0.7
                  ? { id: 'p', from: 'pc1', to: 'isp', t: 0.08 + ease((t - 0.4) / 0.3) * 0.84, color: 'var(--nq-pkt-data)', label: 'no match → default' }
                  : { id: 'p', from: 'isp', to: 'cl', t: ease((t - 0.7) / 0.3), color: 'var(--nq-ok)', label: 'out to the world' },
              ]
            : [],
      }),
      aside: (t) => ({
        title: { gu: 'R1 નું routing table', en: 'R1 routing table' },
        head: ['code', 'network', 'via'],
        rows: [
          ['C', '10.1.1.0/24', 'Gi0/0'],
          ['S', '10.2.2.0/24', '10.0.12.2'],
          t > 0.3 ? ['S*', '0.0.0.0/0', 'ISP ← last resort'] : ['', '', ''],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Router ફક્ત સીધું જોડાયેલું જાણે છે; બાકીનું તમારે બતાવવું પડે. `ip route <network> <mask> <next-hop>` એક રસ્તો ઉમેરે — પણ હંમેશા બંને દિશામાં લખો, નહીંતર જવાબ પાછો નહીં આવે. અને બાકીની આખી દુનિયા માટે એક default route 0.0.0.0/0.',
    en: 'A router knows only what is attached; the rest you must point out. `ip route <network> <mask> <next-hop>` adds a path — but always write it in both directions or the reply never returns. And for the whole rest of the world, one default route: 0.0.0.0/0.',
  },
  check: {
    q: {
      gu: 'R1 પર 10.2.2.0 નો route લખ્યો, પણ ping હજી નિષ્ફળ જાય છે. સૌથી સંભવિત કારણ?',
      en: 'You added a route for 10.2.2.0 on R1 but the ping still fails. The most likely cause?',
    },
    options: [
      { gu: 'R2 પાસે પાછા આવવાનો route નથી', en: 'R2 has no route back' },
      { gu: 'Static route કામ જ નથી કરતા', en: 'Static routes simply do not work' },
      { gu: 'Mask ખોટો હોવો જોઈએ', en: 'The mask must be wrong' },
    ],
    answer: 0,
    explain: {
      gu: 'Ping સફળ થવા માટે request અને reply બંનેને રસ્તો જોઈએ. એક તરફનું routing લખીને ભૂલી જવું એ સૌથી વારંવારની ભૂલ છે.',
      en: 'A successful ping needs a path for both the request and the reply. Writing one direction and forgetting the other is the most frequent slip.',
    },
  },
}

/* ══════════════════════ n3l5 · OSPF single area ══════════════════════ */

const ospfNodes = (up: number) => [
  { id: 'pc1', x: 80, y: 190, type: 'pc' as const, label: 'PC1', sub: '10.1.1.10', accent: BEG },
  { id: 'r1', x: 270, y: 190, type: 'router' as const, label: 'R1', sub: up >= 1 ? 'OSPF on' : undefined, accent: up >= 1 ? CCNA : 'var(--nq-text-mute)' },
  { id: 'r2', x: 450, y: 190, type: 'router' as const, label: 'R2', sub: up >= 2 ? 'OSPF on' : undefined, accent: up >= 2 ? CCNA : 'var(--nq-text-mute)' },
  { id: 'r3', x: 630, y: 190, type: 'router' as const, label: 'R3', sub: up >= 3 ? 'OSPF on' : undefined, accent: up >= 3 ? CCNA : 'var(--nq-text-mute)' },
  { id: 'pc2', x: 810, y: 190, type: 'pc' as const, label: 'PC2', sub: '10.3.3.10', accent: CCNP },
]

const ospfLinks = [
  { id: 'a', from: 'pc1', to: 'r1', state: 'up' as const },
  { id: 'b', from: 'r1', to: 'r2', state: 'up' as const },
  { id: 'c', from: 'r2', to: 'r3', state: 'up' as const },
  { id: 'd', from: 'r3', to: 'pc2', state: 'up' as const },
]

export const n3l5: LessonSpec = {
  why: {
    gu: 'ત્રણ routers માટે static routes લખવા સહેલા છે. ત્રીસ માટે દુઃસ્વપ્ન, અને એક લિંક તૂટે તો કોઈને ખબર જ ન પડે. OSPF એ routers ને એકબીજા સાથે વાત કરતા કરી દે છે — એ જાતે નકશો બનાવે છે અને તૂટે ત્યારે જાતે સુધારી લે છે.',
    en: 'Static routes are fine for three routers. For thirty they are a nightmare, and if a link dies nobody notices. OSPF makes the routers talk to each other — they build the map themselves and repair it themselves when something breaks.',
  },
  viewBox: { w: 900, h: 380 },
  steps: [
    {
      ms: 2800,
      label: { gu: 'Hello — કોઈ છે?', en: 'Hello — anyone there?' },
      text: {
        beginner: {
          gu: 'OSPF ચાલુ કરતાં જ router દર 10 સેકન્ડે એક નાનો Hello packet દરેક interface પર મોકલે છે: "હું R1 છું, કોઈ છે?" આ packet 224.0.0.5 પર જાય છે — એ સરનામું ફક્ત OSPF routers સાંભળે છે.',
          en: 'The moment OSPF starts, the router sends a small Hello out of every interface every 10 seconds: "I am R1, anyone there?" It goes to 224.0.0.5, an address only OSPF routers listen to.',
        },
        exam: {
          gu: 'Hello packets multicast 224.0.0.5 પર જાય છે. Broadcast networks પર Hello 10 s અને Dead 40 s — બંને timers બંને છેડે સરખા હોવા જોઈએ.',
          en: 'Hellos go to multicast 224.0.0.5. On broadcast networks the Hello timer is 10 s and Dead is 40 s — and both must match on both ends.',
        },
      },
      scene: (t) => ({
        nodes: ospfNodes(1),
        links: ospfLinks,
        packets:
          t > 0.3
            ? [{ id: 'h', from: 'r1', to: 'r2', t: 0.1 + ease((t - 0.3) / 0.7) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'Hello · 224.0.0.5' }]
            : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'પાડોશી મળ્યો — પણ શરતો તપાસાય', en: 'A neighbour answers — but conditions are checked' },
      text: {
        beginner: {
          gu: 'R2 પણ OSPF ચલાવે છે એટલે એ જવાબ આપે છે. પણ દોસ્તી આપોઆપ નથી થતી — ચાર વસ્તુ મેળ ખાવી જોઈએ: એક જ area, એક જ subnet, એક જ timers, અને authentication. એકેય ન મળે તો neighbour બને જ નહીં.',
          en: 'R2 runs OSPF too, so it answers. But the friendship is not automatic — four things must match: the same area, the same subnet, the same timers, and authentication. Miss one and no neighbour forms.',
        },
        exam: {
          gu: 'Adjacency માટે જોઈએ: matching area ID, subnet/mask, Hello અને Dead timers, authentication, MTU, અને stub flags. Router ID unique હોવું જોઈએ.',
          en: 'An adjacency needs matching area ID, subnet and mask, Hello and Dead timers, authentication, MTU and stub flags — with unique router IDs.',
        },
      },
      scene: (t) => ({
        nodes: ospfNodes(2),
        links: ospfLinks.map((l) => (l.id === 'b' ? { ...l, flowing: true, label: t > 0.6 ? 'neighbours' : undefined } : l)),
        packets:
          t < 0.5
            ? [{ id: 'h', from: 'r2', to: 'r1', t: 0.1 + ease(t / 0.5) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'Hello back' }]
            : [{ id: 'k', from: 'r1', to: 'r2', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-ok)', label: '2-Way ✓' }],
      }),
      aside: (t) => ({
        title: { gu: 'મેળ ખાવું જોઈએ', en: 'Must match' },
        head: ['check', 'R1', 'R2'],
        rows: [
          ['area', '0', '0'],
          ['subnet', '10.0.12.0/30', '10.0.12.0/30'],
          ['hello/dead', '10 / 40', '10 / 40'],
          ['result', '', t > 0.5 ? 'neighbour ✓' : 'checking…'],
        ],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'નકશો વહેંચાય — LSA', en: 'The map is shared — LSAs' },
      text: {
        beginner: {
          gu: 'દોસ્તી થયા પછી એ એકબીજાને પોતાનો નકશો આપે છે: "મારી પાસે આ નેટવર્ક છે, આ લિંક છે, એનો ખર્ચ આટલો." આ ટુકડાને LSA કહે છે. દરેક router બધા LSA ભેગા કરીને આખા વિસ્તારનો એકસરખો નકશો બનાવે છે.',
          en: 'Once they are neighbours they hand each other their piece of the map: "I have these networks, these links, and they cost this much." Those pieces are LSAs. Every router collects them all and builds one identical map of the area.',
        },
        exam: {
          gu: 'DBD → LSR → LSU → LSAck થી database exchange થાય છે. અંતે એક area ના બધા routers પાસે identical LSDB હોય છે.',
          en: 'The database exchange runs DBD → LSR → LSU → LSAck. At the end every router in an area holds an identical LSDB.',
        },
      },
      scene: (t) => ({
        nodes: ospfNodes(3),
        links: ospfLinks.map((l) => ({ ...l, flowing: t > 0.2 })),
        packets:
          t > 0.2
            ? [
                { id: 'l1', from: 'r1', to: 'r2', t: 0.1 + ease((t - 0.2) / 0.8) * 0.8, color: 'var(--nq-pkt-dns)', label: 'LSA' },
                { id: 'l2', from: 'r3', to: 'r2', t: 0.1 + ease((t - 0.2) / 0.8) * 0.8, color: 'var(--nq-pkt-dns)', label: 'LSA' },
              ]
            : [],
      }),
      aside: (t) => ({
        title: { gu: 'R2 નું link-state database', en: 'R2 link-state database' },
        head: ['from', 'network', 'cost'],
        rows:
          t > 0.4
            ? [
                ['R1', '10.1.1.0/24', '1'],
                ['R1', '10.0.12.0/30', '1'],
                ['R3', '10.3.3.0/24', '1'],
                ['R3', '10.0.23.0/30', '1'],
              ]
            : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'ખર્ચ ગણાય — bandwidth પરથી', en: 'Cost is computed — from bandwidth' },
      text: {
        beginner: {
          gu: 'OSPF hop ગણતો નથી, ખર્ચ ગણે છે. લિંક જેટલી ઝડપી એટલો ખર્ચ ઓછો: cost = 100 Mbps ÷ bandwidth. એટલે 100 Mbps લિંકનો ખર્ચ 1, અને 10 Mbps નો 10. ધીમા રસ્તે જવું મોંઘું પડે — અને OSPF સસ્તો રસ્તો પસંદ કરે.',
          en: 'OSPF does not count hops, it adds up cost. The faster the link the lower the cost: cost = 100 Mbps ÷ bandwidth. So a 100 Mbps link costs 1 and a 10 Mbps link costs 10. Slow roads are expensive — and OSPF buys the cheapest.',
        },
        exam: {
          gu: 'Default reference bandwidth 100 Mbps છે, એટલે 1 Gbps અને 10 Gbps બંનેનો cost 1 થઈ જાય. આધુનિક નેટવર્કમાં `auto-cost reference-bandwidth` વધારવું પડે.',
          en: 'The default reference bandwidth is 100 Mbps, so 1 Gbps and 10 Gbps both come out as cost 1. On modern networks you must raise `auto-cost reference-bandwidth`.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r1', x: 150, y: 240, type: 'router' as const, label: 'R1', accent: CCNA },
          { id: 'r2', x: 430, y: 120, type: 'router' as const, label: 'R2', sub: 'fast path', accent: t > 0.5 ? 'var(--nq-ok)' : CCNA },
          { id: 'r4', x: 430, y: 370, type: 'router' as const, label: 'R4', sub: 'slow path', accent: WARN },
          { id: 'r3', x: 710, y: 240, type: 'router' as const, label: 'R3', accent: CCNA },
        ],
        links: [
          { id: 'f1', from: 'r1', to: 'r2', state: 'up', label: '1 Gbps · cost 1', flowing: t > 0.5 },
          { id: 'f2', from: 'r2', to: 'r3', state: 'up', label: 'cost 1', flowing: t > 0.5 },
          { id: 's1', from: 'r1', to: 'r4', state: 'up', label: '10 Mbps · cost 10' },
          { id: 's2', from: 'r4', to: 'r3', state: 'up', label: 'cost 10' },
        ],
        packets:
          t > 0.5
            ? [{ id: 'p', from: 'r1', to: 'r2', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'total 2 — chosen' }]
            : [],
      }),
      aside: () => ({
        title: { gu: 'રસ્તાની સરખામણી', en: 'Comparing paths' },
        head: ['path', 'hops', 'cost'],
        rows: [
          ['via R2 (1 Gbps)', '2', '2 ← wins'],
          ['via R4 (10 Mbps)', '2', '20'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'SPF ચાલે — ઝાડ બને', en: 'SPF runs — a tree appears' },
      text: {
        beginner: {
          gu: 'બધા LSA ભેગા થયા પછી દરેક router Dijkstra નામનો ગણિતનો રસ્તો ચલાવે છે અને પોતાને મૂળમાં રાખીને એક ઝાડ બનાવે છે — દરેક નેટવર્ક સુધીનો સૌથી સસ્તો રસ્તો. એ ઝાડનાં પરિણામ routing table માં O તરીકે આવે છે.',
          en: 'With all LSAs in hand each router runs Dijkstra’s algorithm and builds a tree with itself at the root — the cheapest path to every network. The results of that tree land in the routing table marked O.',
        },
        exam: {
          gu: 'દરેક router પોતાને root રાખીને SPF ચલાવે છે, એટલે એક જ LSDB માંથી દરેકને પોતાનો અલગ shortest-path tree મળે છે. AD 110.',
          en: 'Each router runs SPF with itself as root, so one shared LSDB yields a different shortest-path tree for each. The AD is 110.',
        },
      },
      scene: (t) => ({
        nodes: ospfNodes(3),
        links: ospfLinks.map((l) => ({ ...l, flowing: t > 0.4 })),
        packets:
          t > 0.55
            ? [{ id: 'p', from: 'pc1', to: 'pc2', t: 0.06 + ease((t - 0.55) / 0.45) * 0.88, color: 'var(--nq-ok)', label: 'end to end ✓' }]
            : [],
      }),
      aside: (t) => ({
        title: { gu: 'R1 નું routing table', en: 'R1 routing table' },
        head: ['code', 'network', 'cost', 'via'],
        rows:
          t > 0.4
            ? [
                ['C', '10.1.1.0/24', '0', 'Gi0/0'],
                ['O', '10.0.23.0/30', '2', 'R2'],
                ['O', '10.3.3.0/24', '3', 'R2'],
              ]
            : [['C', '10.1.1.0/24', '0', 'Gi0/0']],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'લિંક તૂટે — જાતે સુધરે', en: 'A link dies — it repairs itself' },
      text: {
        beginner: {
          gu: 'અહીં OSPF static routing ને હરાવે છે. R2–R3 ની લિંક તૂટે એટલે 40 સેકન્ડમાં Dead timer પૂરો થાય, બધાને નવો LSA મળે, SPF ફરી ચાલે, અને બીજો રસ્તો શોધાઈ જાય. કોઈએ કશું લખવું પડતું નથી.',
          en: 'This is where OSPF beats static routing. The R2–R3 link fails, the Dead timer expires within 40 seconds, a new LSA floods out, SPF runs again, and another path is found. Nobody types anything.',
        },
        exam: {
          gu: 'Link failure પર LSA flood થાય, બધા routers SPF ફરી ચલાવે અને converge થાય. Convergence time Dead timer અને SPF throttle timers પર આધાર રાખે છે.',
          en: 'On link failure an LSA is flooded, every router reruns SPF and the network reconverges. Convergence time depends on the Dead timer and the SPF throttle timers.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r1', x: 150, y: 240, type: 'router' as const, label: 'R1', accent: CCNA },
          { id: 'r2', x: 430, y: 130, type: 'router' as const, label: 'R2', accent: CCNA },
          { id: 'r4', x: 430, y: 370, type: 'router' as const, label: 'R4', sub: t > 0.5 ? 'backup path' : undefined, accent: t > 0.5 ? 'var(--nq-ok)' : WARN },
          { id: 'r3', x: 710, y: 240, type: 'router' as const, label: 'R3', accent: CCNA },
        ],
        links: [
          { id: 'f1', from: 'r1', to: 'r2', state: 'up' },
          { id: 'f2', from: 'r2', to: 'r3', state: t > 0.25 ? 'down' : 'up', label: t > 0.25 ? 'failed ✕' : 'cost 1' },
          { id: 's1', from: 'r1', to: 'r4', state: 'up', flowing: t > 0.6 },
          { id: 's2', from: 'r4', to: 'r3', state: 'up', flowing: t > 0.6 },
        ],
        packets:
          t > 0.3 && t < 0.55
            ? [{ id: 'l', from: 'r2', to: 'r1', t: 0.1 + ease((t - 0.3) / 0.25) * 0.8, color: WARN, label: 'LSA: link down!' }]
            : t >= 0.6
              ? [{ id: 'p', from: 'r1', to: 'r4', t: 0.1 + ease((t - 0.6) / 0.4) * 0.8, color: 'var(--nq-ok)', label: 'rerouted ✓' }]
              : [],
      }),
    },
  ],
  takeaway: {
    gu: 'OSPF Hello થી પાડોશી શોધે, LSA થી નકશો વહેંચે, bandwidth પરથી ખર્ચ ગણે, અને Dijkstra થી સૌથી સસ્તો રસ્તો કાઢે. લિંક તૂટે તો જાતે બીજો રસ્તો શોધી લે — static routing માં એ તમારે હાથે કરવું પડે.',
    en: 'OSPF finds neighbours with Hellos, shares the map with LSAs, derives cost from bandwidth, and runs Dijkstra for the cheapest path. When a link dies it finds another by itself — something static routing leaves to you.',
  },
  check: {
    q: {
      gu: 'OSPF બે રસ્તામાંથી એક પસંદ કરે ત્યારે શેના આધારે કરે છે?',
      en: 'When OSPF picks between two paths, what does it compare?',
    },
    options: [
      { gu: 'કુલ cost — જે bandwidth પરથી ગણાય છે', en: 'Total cost — derived from bandwidth' },
      { gu: 'કેટલા hops છે એ', en: 'How many hops there are' },
      { gu: 'કયો રસ્તો પહેલાં configure થયો', en: 'Which path was configured first' },
    ],
    answer: 0,
    explain: {
      gu: 'RIP hops ગણે છે, OSPF નહીં. OSPF દરેક લિંકનો cost (100 Mbps ÷ bandwidth) ઉમેરે છે અને સૌથી ઓછા કુલ cost વાળો રસ્તો પસંદ કરે — ભલે એમાં hops વધુ હોય.',
      en: 'RIP counts hops; OSPF does not. It sums each link’s cost (100 Mbps ÷ bandwidth) and takes the lowest total — even if that path has more hops.',
    },
  },
}

/* ══════════════════════ n3l6 · HSRP ══════════════════════ */

const hsrpNodes = (active: 'r1' | 'r2' | null, r1Dead: boolean) => [
  { id: 'pc1', x: 110, y: 230, type: 'pc' as const, label: 'PC1', sub: 'gw 10.1.1.1', accent: BEG },
  { id: 'sw', x: 300, y: 230, type: 'switch' as const, label: 'SW', accent: CCNA },
  {
    id: 'r1',
    x: 520,
    y: 120,
    type: 'router' as const,
    label: 'R1',
    sub: r1Dead ? 'DOWN' : active === 'r1' ? 'ACTIVE' : 'standby',
    accent: r1Dead ? 'var(--nq-err)' : active === 'r1' ? 'var(--nq-ok)' : 'var(--nq-text-mute)',
    pulse: active === 'r1' && !r1Dead,
  },
  {
    id: 'r2',
    x: 520,
    y: 340,
    type: 'router' as const,
    label: 'R2',
    sub: active === 'r2' ? 'ACTIVE' : 'standby',
    accent: active === 'r2' ? 'var(--nq-ok)' : 'var(--nq-text-mute)',
    pulse: active === 'r2',
  },
  { id: 'srv', x: 760, y: 230, type: 'server' as const, label: 'Server', accent: CCNP },
]

export const n3l6: LessonSpec = {
  why: {
    gu: 'દરેક PC પાસે એક જ default gateway હોય છે. એ router બંધ પડે તો આખી ઓફિસનું internet બંધ. બીજો router રાખવો સહેલો છે — પણ PC ને નવું gateway કેવી રીતે કહેવું? HSRP એ સમસ્યાનો ઉકેલ છે: બે router, એક જ નકલી સરનામું.',
    en: 'Every PC has exactly one default gateway. If that router dies the whole office loses the internet. Adding a second router is easy — but how do you tell every PC the new gateway? HSRP solves it: two routers, one shared fake address.',
  },
  viewBox: { w: 880, h: 440 },
  steps: [
    {
      ms: 2800,
      label: { gu: 'એક gateway એટલે એક જ નબળી કડી', en: 'One gateway is one weak link' },
      text: {
        beginner: {
          gu: 'PC1 નું gateway 10.1.1.1 છે — એટલે R1. બીજો router R2 પણ ઊભો છે, પણ PC એને ઓળખતું જ નથી. R1 બંધ પડે તો PC1 બહાર નીકળી જ ન શકે, ભલે બાજુમાં બીજો રસ્તો તૈયાર હોય.',
          en: 'PC1’s gateway is 10.1.1.1 — that is R1. A second router R2 stands right there, but the PC has never heard of it. If R1 dies PC1 cannot get out, even with another road waiting beside it.',
        },
        exam: {
          gu: 'Host પાસે એક જ default gateway હોય છે અને એ જાતે બીજો શોધતો નથી. Gateway નું failure એ single point of failure છે.',
          en: 'A host has one default gateway and will not look for another. The gateway is therefore a single point of failure.',
        },
      },
      scene: () => ({
        nodes: hsrpNodes('r1', false),
        links: [
          { id: 'a', from: 'pc1', to: 'sw', state: 'up' },
          { id: 'b', from: 'sw', to: 'r1', state: 'up' },
          { id: 'c', from: 'sw', to: 'r2', state: 'up' },
          { id: 'd', from: 'r1', to: 'srv', state: 'up' },
          { id: 'e', from: 'r2', to: 'srv', state: 'up' },
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'એક નકલી સરનામું બનાવો', en: 'Invent one virtual address' },
      text: {
        beginner: {
          gu: 'HSRP નો વિચાર સરસ છે: એક ત્રીજું, નકલી સરનામું બનાવો — 10.1.1.1 — જે કોઈ એક router નું નથી, બંનેનું સહિયારું છે. PC ને એ જ gateway તરીકે આપો. હવે PC ને ફરક જ નથી પડતો કે પાછળ કયો router કામ કરે છે.',
          en: 'The HSRP idea is elegant: invent a third, virtual address — 10.1.1.1 — owned by neither router but shared by both. Give the PCs that as their gateway. Now it no longer matters which router is actually doing the work.',
        },
        exam: {
          gu: 'HSRP group એક virtual IP અને virtual MAC (0000.0c07.acXX, XX = group) બનાવે છે. Hosts હંમેશા virtual address વાપરે છે.',
          en: 'An HSRP group creates a virtual IP and a virtual MAC (0000.0c07.acXX, where XX is the group). Hosts always use the virtual address.',
        },
      },
      scene: (t) => ({
        nodes: [
          ...hsrpNodes('r1', false).map((n) =>
            n.id === 'r1' ? { ...n, sub: t > 0.4 ? 'real .2 · virtual .1' : 'real 10.1.1.2' } : n.id === 'r2' ? { ...n, sub: t > 0.4 ? 'real .3 · virtual .1' : 'real 10.1.1.3' } : n,
          ),
        ],
        links: [
          { id: 'a', from: 'pc1', to: 'sw', state: 'up' },
          { id: 'b', from: 'sw', to: 'r1', state: 'up' },
          { id: 'c', from: 'sw', to: 'r2', state: 'up' },
          { id: 'd', from: 'r1', to: 'srv', state: 'up' },
          { id: 'e', from: 'r2', to: 'srv', state: 'up' },
        ],
      }),
      aside: (t) => ({
        title: { gu: 'સરનામાં', en: 'The addresses' },
        head: ['who', 'address'],
        rows: [
          ['R1 real', '10.1.1.2'],
          ['R2 real', '10.1.1.3'],
          ['virtual (shared)', t > 0.4 ? '10.1.1.1 ←' : '…'],
          ['PC gateway', '10.1.1.1'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'ચૂંટણી — કોણ કામ કરશે', en: 'An election — who does the work' },
      text: {
        beginner: {
          gu: 'બંને routers એકબીજાને સંદેશ મોકલે છે અને નક્કી કરે છે કે કોણ Active રહેશે. જેની priority વધુ એ જીતે; સરખી હોય તો જેનું IP મોટું. બીજો Standby બનીને ચૂપચાપ જોયા કરે છે — તૈયાર, પણ નિષ્ક્રિય.',
          en: 'The two routers exchange messages and decide who will be Active. Higher priority wins; on a tie the higher IP does. The other becomes Standby and simply watches — ready, but idle.',
        },
        exam: {
          gu: 'Default priority 100; higher wins, tie પર higher IP. `preempt` વગર જૂનો Active પાછો આવે તો પણ Standby જ રહે છે.',
          en: 'Default priority is 100; higher wins and a tie goes to the higher IP. Without `preempt` a recovered router stays Standby even if it has the better priority.',
        },
      },
      scene: (t) => ({
        nodes: hsrpNodes(t > 0.55 ? 'r1' : null, false),
        links: [
          { id: 'a', from: 'pc1', to: 'sw', state: 'up' },
          { id: 'b', from: 'sw', to: 'r1', state: 'up' },
          { id: 'c', from: 'sw', to: 'r2', state: 'up' },
          { id: 'd', from: 'r1', to: 'srv', state: 'up' },
          { id: 'e', from: 'r2', to: 'srv', state: 'up' },
        ],
        packets:
          t < 0.55
            ? [{ id: 'h', from: 'r1', to: 'r2', t: 0.1 + ease(t / 0.55) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'priority 110' }]
            : [],
      }),
      aside: (t) => ({
        title: { gu: 'ચૂંટણી', en: 'The election' },
        head: ['router', 'priority', 'state'],
        rows: [
          ['R1', '110', t > 0.55 ? 'ACTIVE ←' : 'speaking'],
          ['R2', '100', t > 0.55 ? 'standby' : 'speaking'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'બધો traffic Active થઈને જાય', en: 'All traffic goes through the Active one' },
      text: {
        beginner: {
          gu: 'PC1 10.1.1.1 ને packet મોકલે છે. Active router R1 એ નકલી સરનામું પોતાનું હોય એમ જવાબ આપે છે અને traffic આગળ વધારે છે. Standby R2 બેઠો બેઠો જુએ છે અને દર 3 સેકન્ડે R1 ની ધબકાર સાંભળે છે.',
          en: 'PC1 sends to 10.1.1.1. The Active router R1 answers as though that address were its own and forwards the traffic. Standby R2 sits and watches, listening for R1’s heartbeat every 3 seconds.',
        },
        exam: {
          gu: 'Active router virtual MAC માટે ARP reply આપે છે અને forwarding કરે છે. Hello 3 s, hold 10 s — standby એ timers થી failure શોધે છે.',
          en: 'The Active router answers ARP for the virtual MAC and does the forwarding. Hello is 3 s and hold 10 s — those timers are how Standby detects failure.',
        },
      },
      scene: (t) => ({
        nodes: hsrpNodes('r1', false),
        links: [
          { id: 'a', from: 'pc1', to: 'sw', state: 'up', flowing: true },
          { id: 'b', from: 'sw', to: 'r1', state: 'up', flowing: true },
          { id: 'c', from: 'sw', to: 'r2', state: 'up' },
          { id: 'd', from: 'r1', to: 'srv', state: 'up', flowing: t > 0.5 },
          { id: 'e', from: 'r2', to: 'srv', state: 'up' },
        ],
        packets:
          t < 0.5
            ? [{ id: 'p', from: 'pc1', to: 'r1', t: 0.08 + ease(t / 0.5) * 0.84, color: 'var(--nq-pkt-data)', label: '→ 10.1.1.1' }]
            : [{ id: 'p', from: 'r1', to: 'srv', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'forwarded ✓' }],
      }),
    },
    {
      ms: 3400,
      label: { gu: 'Active પડે — અને કોઈને ખબર ન પડે', en: 'The Active one dies — and nobody notices' },
      text: {
        beginner: {
          gu: 'હવે R1 બંધ પડે છે. ધબકાર બંધ થાય એટલે 10 સેકન્ડમાં R2 જાહેર કરે છે "હવે હું Active" અને એ જ નકલી સરનામું પોતાના પર લઈ લે છે. PC1 માં કશું બદલવું પડતું નથી — એનું gateway હજી 10.1.1.1 જ છે. Ping એકાદ-બે ગુમાવીને ફરી ચાલુ.',
          en: 'Now R1 fails. The heartbeat stops and within ten seconds R2 announces "I am Active now" and takes the same virtual address onto itself. Nothing changes on PC1 — its gateway is still 10.1.1.1. The ping loses a packet or two and carries on.',
        },
        exam: {
          gu: 'Standby hold timer પૂરો થતાં Active બને અને gratuitous ARP મોકલીને switch નું MAC table અપડેટ કરે. Hosts માં કોઈ ફેરફાર નહીં.',
          en: 'When the hold timer expires Standby becomes Active and sends a gratuitous ARP so the switch updates its MAC table. Nothing changes on the hosts.',
        },
      },
      scene: (t) => ({
        nodes: hsrpNodes(t > 0.45 ? 'r2' : 'r1', t > 0.2),
        links: [
          { id: 'a', from: 'pc1', to: 'sw', state: 'up', flowing: true },
          { id: 'b', from: 'sw', to: 'r1', state: t > 0.2 ? 'down' : 'up' },
          { id: 'c', from: 'sw', to: 'r2', state: 'up', flowing: t > 0.45 },
          { id: 'd', from: 'r1', to: 'srv', state: t > 0.2 ? 'down' : 'up' },
          { id: 'e', from: 'r2', to: 'srv', state: 'up', flowing: t > 0.45 },
        ],
        packets:
          t < 0.45
            ? t > 0.2
              ? [{ id: 'x', from: 'pc1', to: 'sw', t: 0.1 + ease((t - 0.2) / 0.25) * 0.6, color: WARN, label: 'waiting…' }]
              : []
            : [{ id: 'p', from: 'pc1', to: 'srv', t: 0.06 + ease((t - 0.45) / 0.55) * 0.88, color: 'var(--nq-ok)', label: 'same gateway ✓' }],
      }),
      aside: (t) => ({
        title: { gu: 'સ્થિતિ', en: 'State' },
        head: ['router', 'before', 'after'],
        rows: [
          ['R1', 'ACTIVE', t > 0.2 ? 'down' : 'ACTIVE'],
          ['R2', 'standby', t > 0.45 ? 'ACTIVE ←' : 'standby'],
          ['PC gateway', '10.1.1.1', '10.1.1.1'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'ખરી યુક્તિ — uplink પર નજર', en: 'The real trick — watching the uplink' },
      text: {
        beginner: {
          gu: 'એક છટકું છે. R1 ચાલુ હોય પણ એનો બહાર જવાનો રસ્તો તૂટે તો? R1 તો Active જ રહેશે અને traffic લેતો રહેશે — પણ આગળ મોકલી નહીં શકે. એટલે interface tracking વપરાય છે: ઉપરની લિંક પડે તો priority આપોઆપ ઘટાડી દો, જેથી R2 કબજો લઈ લે.',
          en: 'There is a trap. What if R1 is alive but its path to the outside breaks? R1 stays Active and keeps accepting traffic — with nowhere to send it. So we use interface tracking: when the uplink drops, lower the priority automatically so R2 takes over.',
        },
        exam: {
          gu: '`standby 1 track <interface> <decrement>` uplink પડે ત્યારે priority ઘટાડે છે. એની સાથે `preempt` જોઈએ, નહીંતર standby કબજો લેશે નહીં.',
          en: '`standby 1 track <interface> <decrement>` lowers the priority when the uplink drops. It needs `preempt` alongside, otherwise the standby will never take over.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc1', x: 110, y: 230, type: 'pc' as const, label: 'PC1', accent: BEG },
          { id: 'sw', x: 300, y: 230, type: 'switch' as const, label: 'SW', accent: CCNA },
          { id: 'r1', x: 520, y: 120, type: 'router' as const, label: 'R1', sub: t > 0.35 ? 'priority 110 → 90' : 'priority 110', accent: t > 0.35 ? WARN : 'var(--nq-ok)' },
          { id: 'r2', x: 520, y: 340, type: 'router' as const, label: 'R2', sub: t > 0.6 ? 'ACTIVE' : 'priority 100', accent: t > 0.6 ? 'var(--nq-ok)' : 'var(--nq-text-mute)', pulse: t > 0.6 },
          { id: 'cl', x: 770, y: 230, type: 'cloud' as const, label: 'Internet', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'pc1', to: 'sw', state: 'up', flowing: true },
          { id: 'b', from: 'sw', to: 'r1', state: 'up' },
          { id: 'c', from: 'sw', to: 'r2', state: 'up', flowing: t > 0.6 },
          { id: 'd', from: 'r1', to: 'cl', state: t > 0.2 ? 'down' : 'up', label: t > 0.2 ? 'uplink failed ✕' : undefined },
          { id: 'e', from: 'r2', to: 'cl', state: 'up', flowing: t > 0.6 },
        ],
        packets:
          t > 0.6
            ? [{ id: 'p', from: 'pc1', to: 'cl', t: 0.06 + ease((t - 0.6) / 0.4) * 0.88, color: 'var(--nq-ok)', label: 'out via R2 ✓' }]
            : [],
      }),
    },
  ],
  takeaway: {
    gu: 'HSRP બે router ને એક નકલી સરનામું વહેંચાવે છે. PC એ જ gateway વાપરે છે અને પાછળ કોણ કામ કરે છે એ જાણતું પણ નથી. Active પડે તો Standby દસ સેકન્ડમાં કબજો લે — અને uplink પડે તોય કબજો થાય એ માટે interface tracking ઉમેરો.',
    en: 'HSRP lets two routers share one virtual address. The PCs use it as their gateway and never learn who is really working. If the Active one dies, Standby takes over within ten seconds — and add interface tracking so it also takes over when only the uplink dies.',
  },
  check: {
    q: {
      gu: 'HSRP માં Active router બદલાય ત્યારે PC ના gateway માં શું બદલવું પડે?',
      en: 'When the Active HSRP router changes, what must you change on the PCs?',
    },
    options: [
      { gu: 'કશું નહીં — gateway એ જ virtual IP રહે છે', en: 'Nothing — the gateway stays the same virtual IP' },
      { gu: 'નવા router નું IP લખવું પડે', en: 'You must enter the new router’s IP' },
      { gu: 'PC ફરી ચાલુ કરવો પડે', en: 'You must reboot the PC' },
    ],
    answer: 0,
    explain: {
      gu: 'એ જ તો HSRP નો આખો હેતુ છે. Gateway એક નકલી સરનામું છે જે બંને routers વહેંચે છે — એટલે કબજો બદલાય તોય hosts માટે કશું બદલાતું નથી.',
      en: 'That is the entire point of HSRP. The gateway is a virtual address shared by both routers, so a change of ownership looks like nothing at all to the hosts.',
    },
  },
}
