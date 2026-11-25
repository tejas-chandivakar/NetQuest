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
    hi: 'Router के पास नक्शा जन्म से नहीं होता। वह केवल उतना ही जानता है जो उससे सीधा जुड़ा है — बाकी पूरी दुनिया उसके लिए अनजान है। Static route यानी आप खुद उसे रास्ता बताना।',
    en: 'A router is not born with a map. It knows only what is directly attached to it — the rest of the world is a blank. A static route is you telling it the way by hand.',
  },
  steps: [
    {
      ms: 2800,
      label: { gu: 'Router ફક્ત પાડોશીને ઓળખે', hi: 'Router केवल पड़ोसी को जानता है', en: 'A router only knows its neighbours' },
      text: {
        beginner: {
          gu: 'R1 ચાલુ કરો એટલે એ બે વસ્તુ જાણે છે: ડાબી બાજુનું 10.1.1.0 નેટવર્ક અને વચ્ચેની લિંક. બસ. 10.2.2.0 વિશે એને કશી જ ખબર નથી — ભલે એ ફક્ત એક hop દૂર હોય.',
          hi: 'R1 चालू करें तो वह दो चीजें जानता है: बाईं तरफ का 10.1.1.0 network और बीच की link। बस। 10.2.2.0 के बारे में उसे कुछ भी नहीं पता — भले वह सिर्फ एक hop दूर हो।',
          en: 'Power on R1 and it knows two things: the 10.1.1.0 network on its left and the link in the middle. That is all. It knows nothing of 10.2.2.0 — even though it is just one hop away.',
        },
        exam: {
          gu: 'Interface up/up થતાં જ connected (C) અને local (L) routes આપોઆપ table માં આવે છે, AD 0 સાથે. બીજું કશું આપોઆપ આવતું નથી.',
          hi: 'Interface up/up होते ही connected (C) और local (L) routes अपने आप table में आते हैं, AD 0 के साथ। और कुछ अपने आप नहीं आता।',
          en: 'As soon as an interface is up/up its connected (C) and local (L) routes appear automatically with AD 0. Nothing else arrives on its own.',
        },
      },
      scene: () => ({
        nodes: staticNodes(false, false),
        links: staticLinks,
      }),
      aside: () => ({
        title: { gu: 'R1 નું routing table', hi: 'R1 की routing table', en: 'R1 routing table' },
        head: ['code', 'network', 'via'],
        rows: [
          ['C', '10.1.1.0/24', 'Gi0/0'],
          ['C', '10.0.12.0/30', 'Gi0/1'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'એટલે ping નિષ્ફળ જાય', hi: 'इसलिए ping असफल जाए', en: 'So the ping fails' },
      text: {
        beginner: {
          gu: 'PC1 થી PC2 ને ping કરો. Packet R1 સુધી તો પહોંચે છે, પણ R1 પોતાનું table જુએ છે, 10.2.2.0 માટે કોઈ નોંધ નથી મળતી — અને એ packet ને ચૂપચાપ ફેંકી દે છે. Router ક્યારેય અનુમાન નથી કરતો.',
          hi: 'PC1 से PC2 को ping करें। Packet R1 तक तो पहुंचता है, पर R1 अपनी table देखता है, 10.2.2.0 के लिए कोई entry नहीं मिलती — और वह packet चुपचाप फेंक देता है। Router कभी अनुमान नहीं लगाता।',
          en: 'Ping PC1 to PC2. The packet reaches R1, R1 checks its table, finds no entry for 10.2.2.0 — and drops the packet. A router never guesses.',
        },
        exam: {
          gu: 'Longest-prefix match નિષ્ફળ જાય અને કોઈ default route ન હોય તો packet drop થાય છે અને સામાન્ય રીતે ICMP "destination network unreachable" પાછું જાય.',
          hi: 'Longest-prefix match असफल हो और कोई default route न हो तो packet drop होता है और आमतौर पर ICMP "destination network unreachable" वापस जाता है।',
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
          ? { nodeId: 'r1', text: { gu: '10.2.2.0 મારા table માં નથી', hi: '10.2.2.0 मेरे table में नहीं', en: '10.2.2.0 is not in my table' } }
          : null,
    },
    {
      ms: 3000,
      label: { gu: 'એક લીટીમાં રસ્તો બતાવો', hi: 'एक line में रास्ता बताएं', en: 'Point the way in one line' },
      text: {
        beginner: {
          gu: 'હવે R1 ને હાથે કહીએ: "10.2.2.0/24 જોઈતું હોય તો 10.0.12.2 ને આપી દેજે." આ એક જ લીટી — `ip route 10.2.2.0 255.255.255.0 10.0.12.2` — અને રસ્તો table માં આવી ગયો. કોઈ protocol નહીં, કોઈ વાટાઘાટ નહીં.',
          hi: 'अब R1 को हाथ से बताएं: "10.2.2.0/24 चाहिए तो 10.0.12.2 को दे देना"। यह एक ही line — `ip route 10.2.2.0 255.255.255.0 10.0.12.2` — और रास्ता table में आ गया। कोई protocol नहीं, कोई बातचीत नहीं।',
          en: 'Now we tell R1 by hand: "if you want 10.2.2.0/24, hand it to 10.0.12.2." That one line — `ip route 10.2.2.0 255.255.255.0 10.0.12.2` — and the path is in the table. No protocol, no negotiation.',
        },
        exam: {
          gu: 'Syntax: `ip route <network> <mask> <next-hop | exit-interface>`. Static route ની AD 1 છે, એટલે connected પછી સૌથી વધુ ભરોસાપાત્ર ગણાય છે.',
          hi: 'Syntax: `ip route <network> <mask> <next-hop | exit-interface>`। Static route की AD 1 है, तो connected के बाद सबसे भरोसेमंद मानी जाती है।',
          en: 'Syntax: `ip route <network> <mask> <next-hop | exit-interface>`. A static route has AD 1, making it the most trusted source after connected.',
        },
      },
      scene: (t) => ({
        nodes: staticNodes(t > 0.4, false),
        links: staticLinks,
      }),
      aside: (t) => ({
        title: { gu: 'R1 નું routing table', hi: 'R1 की routing table', en: 'R1 routing table' },
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
      label: { gu: 'અડધો રસ્તો — હજી ping નહીં ચાલે', hi: 'आधा रास्ता — अभी ping नहीं चलेगा', en: 'Half a path — the ping still fails' },
      text: {
        beginner: {
          gu: 'અહીં સૌથી સામાન્ય ભૂલ થાય છે. Packet હવે R1 થી R2 સુધી અને PC2 સુધી પહોંચી જાય છે — પણ ping તો પણ નિષ્ફળ! કારણ? PC2 જવાબ મોકલે છે, R2 પોતાનું table જુએ છે, અને 10.1.1.0 માટે કશું નથી મળતું. **Routing બંને દિશામાં જોઈએ.**',
          hi: 'यहां सबसे आम गलती होती है। Packet अब R1 से R2 तक और PC2 तक पहुंच जाता है — पर ping फिर भी असफल! क्यों? PC2 जवाब भेजता है, R2 अपनी table देखता है, और 10.1.1.0 के लिए कुछ नहीं मिलता। **Routing दोनों दिशाओं में चाहिए।**',
          en: 'Here is the classic mistake. The packet now reaches R2 and even PC2 — yet the ping still fails. Why? PC2 sends a reply, R2 checks its table, and finds nothing for 10.1.1.0. **Routing is needed in both directions.**',
        },
        exam: {
          gu: 'દરેક router ને destination અને source બંને networks નો રસ્તો જોઈએ. એક તરફી routing એ troubleshooting નું સૌથી વારંવારનું મૂળ કારણ છે.',
          hi: 'हर router को destination और source दोनों networks का रास्ता चाहिए। एक तरफा routing troubleshooting का सबसे बार-बार होने वाला मूल कारण है।',
          en: 'Every router needs a path to both the destination and the source network. One-way routing is the single most common root cause in troubleshooting.',
        },
      },
      scene: (t) => ({
        nodes: staticNodes(true, false),
        links: staticLinks,
        packets: (() => {
          if (t >= 0.5) return [{ id: 'r', from: 'pc2', to: 'r2', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-err)', label: 'reply dropped ✕' }]
          const hops: [string, string][] = [['pc1', 'r1'], ['r1', 'r2'], ['r2', 'pc2']]
          const p = t / 0.5
          const seg = Math.min(2, Math.floor(p * 3))
          const st = p * 3 - seg
          return [{ id: 'f', from: hops[seg][0], to: hops[seg][1], t: 0.08 + ease(st) * 0.84, color: 'var(--nq-ok)', label: 'forward ✓' }]
        })(),
      }),
      say: (t) =>
        t > 0.55
          ? { nodeId: 'r2', text: { gu: 'જવાબ ક્યાં મોકલું? રસ્તો જ નથી', hi: 'जवाब कहां भेजूं? रास्ता ही नहीं', en: 'Where do I send the reply? No route' } }
          : null,
      aside: () => ({
        title: { gu: 'R2 નું routing table', hi: 'R2 की routing table', en: 'R2 routing table' },
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
      label: { gu: 'પાછો રસ્તો પણ લખો', hi: 'वापसी का रास्ता भी लिखें', en: 'Write the return path too' },
      text: {
        beginner: {
          gu: 'R2 પર પણ એવી જ એક લીટી લખો, ઊલટી દિશામાં: 10.1.1.0 માટે 10.0.12.1. હવે બંને routers પાસે બંને નેટવર્કના રસ્તા છે — અને ping ચાલે છે. દરેક static route હંમેશા જોડીમાં વિચારો.',
          hi: 'R2 पर भी वैसी ही एक line लिखें, उल्टी दिशा में: 10.1.1.0 के लिए 10.0.12.1। अब दोनों routers के पास दोनों networks के रास्ते हैं — और ping चलता है। हर static route हमेशा जोड़ी में सोचें।',
          en: 'Write the same kind of line on R2, pointing the other way: 10.1.1.0 via 10.0.12.1. Now both routers know both networks — and the ping works. Always think of static routes in pairs.',
        },
        exam: {
          gu: 'Bidirectional reachability માટે બંને છેડે routes જોઈએ. મોટા નેટવર્કમાં આ જ કારણે dynamic routing protocols વપરાય છે — હાથે લખવાનું exponentially વધે છે.',
          hi: 'Bidirectional reachability के लिए दोनों छोर पर routes चाहिए। बड़े network में इसी कारण dynamic routing protocols वापरे जाते हैं — हाथ से लिखना exponentially बढ़ता है।',
          en: 'Bidirectional reachability needs routes at both ends. In a large network this is exactly why dynamic protocols exist — the hand-written entries grow exponentially.',
        },
      },
      scene: (t) => ({
        nodes: staticNodes(true, t > 0.3),
        links: staticLinks.map((l) => ({ ...l, flowing: t > 0.4 })),
        packets: (() => {
          if (t <= 0.4) return []
          const fwd: [string, string][] = [['pc1', 'r1'], ['r1', 'r2'], ['r2', 'pc2']]
          const rev: [string, string][] = [['pc2', 'r2'], ['r2', 'r1'], ['r1', 'pc1']]
          if (t < 0.7) {
            const p = (t - 0.4) / 0.3
            const seg = Math.min(2, Math.floor(p * 3))
            const st = p * 3 - seg
            return [{ id: 'f', from: fwd[seg][0], to: fwd[seg][1], t: 0.08 + ease(st) * 0.84, color: 'var(--nq-pkt-data)', label: 'request' }]
          }
          const p = (t - 0.7) / 0.3
          const seg = Math.min(2, Math.floor(p * 3))
          const st = p * 3 - seg
          return [{ id: 'r', from: rev[seg][0], to: rev[seg][1], t: 0.08 + ease(st) * 0.84, color: 'var(--nq-ok)', label: 'reply ✓' }]
        })(),
      }),
      aside: (t) => ({
        title: { gu: 'R2 નું routing table', hi: 'R2 की routing table', en: 'R2 routing table' },
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
      label: { gu: 'Default route — બાકી બધું આ તરફ', hi: 'Default route — बाकी सब इस तरफ', en: 'The default route — everything else this way' },
      text: {
        beginner: {
          gu: 'Internet માં લાખો નેટવર્ક છે — બધાં માટે લીટી લખવી અશક્ય છે. એટલે એક ખાસ route લખાય છે: 0.0.0.0/0, જેનો અર્થ "જે કશું મેળ ન ખાય એ બધું આ તરફ મોકલી દે". એને default route કે gateway of last resort કહે છે.',
          hi: 'Internet में लाखों networks हैं — सबके लिए line लिखना असंभव है। इसलिए एक खास route लिखी जाती है: 0.0.0.0/0, जिसका मतलब "जो कुछ से मेल न खाए वह सब इस तरफ भेज दे"। इसे default route या gateway of last resort कहते हैं।',
          en: 'The internet has millions of networks — writing a line for each is impossible. So we write one special route: 0.0.0.0/0, meaning "anything that matches nothing else, send it this way." That is the default route, the gateway of last resort.',
        },
        exam: {
          gu: '`ip route 0.0.0.0 0.0.0.0 <next-hop>`. Prefix length 0 હોવાથી એ હંમેશા સૌથી છેલ્લે match થાય — longest-prefix match માં સૌથી ટૂંકું.',
          hi: '`ip route 0.0.0.0 0.0.0.0 <next-hop>`। Prefix length 0 होने से यह हमेशा सबसे आखिरी match होता है — longest-prefix match में सबसे छोटा।',
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
        title: { gu: 'R1 નું routing table', hi: 'R1 की routing table', en: 'R1 routing table' },
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
    hi: 'Router केवल सीधा जुड़ा जानता है; बाकी आपको बताना पड़ता है। `ip route <network> <mask> <next-hop>` एक रास्ता जोड़े — पर हमेशा दोनों दिशाओं में लिखें, वरना जवाब वापस नहीं आएगा। और बाकी पूरी दुनिया के लिए एक default route 0.0.0.0/0।',
    en: 'A router knows only what is attached; the rest you must point out. `ip route <network> <mask> <next-hop>` adds a path — but always write it in both directions or the reply never returns. And for the whole rest of the world, one default route: 0.0.0.0/0.',
  },
  check: {
    q: {
      gu: 'R1 પર 10.2.2.0 નો route લખ્યો, પણ ping હજી નિષ્ફળ જાય છે. સૌથી સંભવિત કારણ?',
      hi: 'R1 पर 10.2.2.0 का route लिखा, पर ping अभी भी असफल है। सबसे संभावित कारण?',
      en: 'You added a route for 10.2.2.0 on R1 but the ping still fails. The most likely cause?',
    },
    options: [
      { gu: 'R2 પાસે પાછા આવવાનો route નથી', hi: 'R2 के पास वापसी का route नहीं', en: 'R2 has no route back' },
      { gu: 'Static route કામ જ નથી કરતા', hi: 'Static route काम ही नहीं करते', en: 'Static routes simply do not work' },
      { gu: 'Mask ખોટો હોવો જોઈએ', hi: 'Mask गलत होगा', en: 'The mask must be wrong' },
    ],
    answer: 0,
    explain: {
      gu: 'Ping સફળ થવા માટે request અને reply બંનેને રસ્તો જોઈએ. એક તરફનું routing લખીને ભૂલી જવું એ સૌથી વારંવારની ભૂલ છે.',
      hi: 'Ping सफल होने के लिए request और reply दोनों को रास्ता चाहिए। एक तरफा routing लिखकर भूल जाना सबसे बार-बार की गलती है।',
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
    hi: 'तीन routers के लिए static routes लिखना आसान है। तीस के लिए दुःस्वप्न, और एक link टूटे तो किसी को पता ही नहीं चले। OSPF routers को एक-दूसरे से बात करता करता है — वे खुद नक्शा बनाते हैं और टूटने पर खुद सुधार लेते हैं।',
    en: 'Static routes are fine for three routers. For thirty they are a nightmare, and if a link dies nobody notices. OSPF makes the routers talk to each other — they build the map themselves and repair it themselves when something breaks.',
  },
  viewBox: { w: 900, h: 380 },
  steps: [
    {
      ms: 2800,
      label: { gu: 'Hello — કોઈ છે?', hi: 'Hello — कोई है?', en: 'Hello — anyone there?' },
      text: {
        beginner: {
          gu: 'OSPF ચાલુ કરતાં જ router દર 10 સેકન્ડે એક નાનો Hello packet દરેક interface પર મોકલે છે: "હું R1 છું, કોઈ છે?" આ packet 224.0.0.5 પર જાય છે — એ સરનામું ફક્ત OSPF routers સાંભળે છે.',
          hi: 'OSPF चालू करते ही router हर 10 सेकंड में एक छोटा Hello packet हर interface पर भेजता है: "मैं R1 हूं, कोई है?" यह packet 224.0.0.5 पर जाता है — वह पता केवल OSPF routers सुनते हैं।',
          en: 'The moment OSPF starts, the router sends a small Hello out of every interface every 10 seconds: "I am R1, anyone there?" It goes to 224.0.0.5, an address only OSPF routers listen to.',
        },
        exam: {
          gu: 'Hello packets multicast 224.0.0.5 પર જાય છે. Broadcast networks પર Hello 10 s અને Dead 40 s — બંને timers બંને છેડે સરખા હોવા જોઈએ.',
          hi: 'Hello packets multicast 224.0.0.5 पर जाते हैं। Broadcast networks पर Hello 10 s और Dead 40 s — दोनों timers दोनों छोर पर समान होने चाहिए।',
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
      label: { gu: 'પાડોશી મળ્યો — પણ શરતો તપાસાય', hi: 'पड़ोसी मिला — पर शर्तें जांची जाएं', en: 'A neighbour answers — but conditions are checked' },
      text: {
        beginner: {
          gu: 'R2 પણ OSPF ચલાવે છે એટલે એ જવાબ આપે છે. પણ દોસ્તી આપોઆપ નથી થતી — ચાર વસ્તુ મેળ ખાવી જોઈએ: એક જ area, એક જ subnet, એક જ timers, અને authentication. એકેય ન મળે તો neighbour બને જ નહીં.',
          hi: 'R2 भी OSPF चलाता है तो वह जवाब देता है। पर दोस्ती अपने आप नहीं होती — चार चीजें मेल खानी चाहिए: एक ही area, एक ही subnet, एक ही timers, और authentication। एक भी न मिले तो neighbour बने ही नहीं।',
          en: 'R2 runs OSPF too, so it answers. But the friendship is not automatic — four things must match: the same area, the same subnet, the same timers, and authentication. Miss one and no neighbour forms.',
        },
        exam: {
          gu: 'Adjacency માટે જોઈએ: matching area ID, subnet/mask, Hello અને Dead timers, authentication, MTU, અને stub flags. Router ID unique હોવું જોઈએ.',
          hi: 'Adjacency के लिए चाहिए: matching area ID, subnet/mask, Hello और Dead timers, authentication, MTU, और stub flags। Router ID unique होनी चाहिए।',
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
        title: { gu: 'મેળ ખાવું જોઈએ', hi: 'मेल खाना चाहिए', en: 'Must match' },
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
      label: { gu: 'નકશો વહેંચાય — LSA', hi: 'नक्शा बांटा जाए — LSA', en: 'The map is shared — LSAs' },
      text: {
        beginner: {
          gu: 'દોસ્તી થયા પછી એ એકબીજાને પોતાનો નકશો આપે છે: "મારી પાસે આ નેટવર્ક છે, આ લિંક છે, એનો ખર્ચ આટલો." આ ટુકડાને LSA કહે છે. દરેક router બધા LSA ભેગા કરીને આખા વિસ્તારનો એકસરખો નકશો બનાવે છે.',
          hi: 'दोस्ती होने के बाद वे एक-दूसरे को अपना नक्शा देते हैं: "मेरे पास यह network है, यह link है, इसकी cost इतनी"। इस टुकड़े को LSA कहते हैं। हर router सारे LSA जोड़कर पूरे area का समान नक्शा बनाता है।',
          en: 'Once they are neighbours they hand each other their piece of the map: "I have these networks, these links, and they cost this much." Those pieces are LSAs. Every router collects them all and builds one identical map of the area.',
        },
        exam: {
          gu: 'DBD → LSR → LSU → LSAck થી database exchange થાય છે. અંતે એક area ના બધા routers પાસે identical LSDB હોય છે.',
          hi: 'DBD → LSR → LSU → LSAck से database exchange होता है। अंत में एक area के सारे routers के पास identical LSDB होती है।',
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
        title: { gu: 'R2 નું link-state database', hi: 'R2 की link-state database', en: 'R2 link-state database' },
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
      label: { gu: 'ખર્ચ ગણાય — bandwidth પરથી', hi: 'Cost गिनी जाए — bandwidth से', en: 'Cost is computed — from bandwidth' },
      text: {
        beginner: {
          gu: 'OSPF hop ગણતો નથી, ખર્ચ ગણે છે. લિંક જેટલી ઝડપી એટલો ખર્ચ ઓછો: cost = 100 Mbps ÷ bandwidth. એટલે 100 Mbps લિંકનો ખર્ચ 1, અને 10 Mbps નો 10. ધીમા રસ્તે જવું મોંઘું પડે — અને OSPF સસ્તો રસ્તો પસંદ કરે.',
          hi: 'OSPF hop नहीं गिनता, cost गिनता है। Link जितनी तेज उतनी cost कम: cost = 100 Mbps ÷ bandwidth। तो 100 Mbps link की cost 1, और 10 Mbps की 10। धीमे रास्ते जाना महंगा — और OSPF सस्ता रास्ता चुनता है।',
          en: 'OSPF does not count hops, it adds up cost. The faster the link the lower the cost: cost = 100 Mbps ÷ bandwidth. So a 100 Mbps link costs 1 and a 10 Mbps link costs 10. Slow roads are expensive — and OSPF buys the cheapest.',
        },
        exam: {
          gu: 'Default reference bandwidth 100 Mbps છે, એટલે 1 Gbps અને 10 Gbps બંનેનો cost 1 થઈ જાય. આધુનિક નેટવર્કમાં `auto-cost reference-bandwidth` વધારવું પડે.',
          hi: 'Default reference bandwidth 100 Mbps है, तो 1 Gbps और 10 Gbps दोनों की cost 1 बन जाए। आधुनिक network में `auto-cost reference-bandwidth` बढ़ाना पड़ता है।',
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
        title: { gu: 'રસ્તાની સરખામણી', hi: 'रास्तों की तुलना', en: 'Comparing paths' },
        head: ['path', 'hops', 'cost'],
        rows: [
          ['via R2 (1 Gbps)', '2', '2 ← wins'],
          ['via R4 (10 Mbps)', '2', '20'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'SPF ચાલે — ઝાડ બને', hi: 'SPF चले — पेड़ बने', en: 'SPF runs — a tree appears' },
      text: {
        beginner: {
          gu: 'બધા LSA ભેગા થયા પછી દરેક router Dijkstra નામનો ગણિતનો રસ્તો ચલાવે છે અને પોતાને મૂળમાં રાખીને એક ઝાડ બનાવે છે — દરેક નેટવર્ક સુધીનો સૌથી સસ્તો રસ્તો. એ ઝાડનાં પરિણામ routing table માં O તરીકે આવે છે.',
          hi: 'सारे LSA जमा होने के बाद हर router Dijkstra नामक गणित का रास्ता चलाता है और खुद को जड़ में रखकर एक पेड़ बनाता है — हर network तक का सबसे सस्ता रास्ता। उस पेड़ के परिणाम routing table में O के रूप में आते हैं।',
          en: 'With all LSAs in hand each router runs Dijkstra’s algorithm and builds a tree with itself at the root — the cheapest path to every network. The results of that tree land in the routing table marked O.',
        },
        exam: {
          gu: 'દરેક router પોતાને root રાખીને SPF ચલાવે છે, એટલે એક જ LSDB માંથી દરેકને પોતાનો અલગ shortest-path tree મળે છે. AD 110.',
          hi: 'हर router खुद को root रखकर SPF चलाता है, तो एक ही LSDB से हर एक को अपना अलग shortest-path tree मिलता है। AD 110।',
          en: 'Each router runs SPF with itself as root, so one shared LSDB yields a different shortest-path tree for each. The AD is 110.',
        },
      },
      scene: (t) => ({
        nodes: ospfNodes(3),
        links: ospfLinks.map((l) => ({ ...l, flowing: t > 0.4 })),
        packets:
          t > 0.55
            ? (() => {
                const hops: [string, string][] = [['pc1', 'r1'], ['r1', 'r2'], ['r2', 'r3'], ['r3', 'pc2']]
                const p = (t - 0.55) / 0.45
                const seg = Math.min(3, Math.floor(p * 4))
                const st = p * 4 - seg
                return [{ id: 'p', from: hops[seg][0], to: hops[seg][1], t: 0.06 + ease(st) * 0.88, color: 'var(--nq-ok)', label: 'end to end ✓' }]
              })()
            : [],
      }),
      aside: (t) => ({
        title: { gu: 'R1 નું routing table', hi: 'R1 की routing table', en: 'R1 routing table' },
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
      label: { gu: 'લિંક તૂટે — જાતે સુધરે', hi: 'Link टूटे — खुद सुधरे', en: 'A link dies — it repairs itself' },
      text: {
        beginner: {
          gu: 'અહીં OSPF static routing ને હરાવે છે. R2–R3 ની લિંક તૂટે એટલે 40 સેકન્ડમાં Dead timer પૂરો થાય, બધાને નવો LSA મળે, SPF ફરી ચાલે, અને બીજો રસ્તો શોધાઈ જાય. કોઈએ કશું લખવું પડતું નથી.',
          hi: 'यहां OSPF static routing को हराता है। R2–R3 की link टूटे तो 40 सेकंड में Dead timer पूरा हो, सबको नया LSA मिले, SPF फिर चले, और दूसरा रास्ता मिल जाए। किसी को कुछ लिखना नहीं पड़ता।',
          en: 'This is where OSPF beats static routing. The R2–R3 link fails, the Dead timer expires within 40 seconds, a new LSA floods out, SPF runs again, and another path is found. Nobody types anything.',
        },
        exam: {
          gu: 'Link failure પર LSA flood થાય, બધા routers SPF ફરી ચલાવે અને converge થાય. Convergence time Dead timer અને SPF throttle timers પર આધાર રાખે છે.',
          hi: 'Link failure पर LSA flood हो, सारे routers SPF फिर चलाएं और converge हों। Convergence time Dead timer और SPF throttle timers पर निर्भर करता है।',
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
    hi: 'OSPF Hello से पड़ोसी ढूंढे, LSA से नक्शा बांटे, bandwidth से cost गिने, और Dijkstra से सबसे सस्ता रास्ता निकाले। Link टूटे तो खुद दूसरा रास्ता ढूंढ ले — static routing में यह आपको हाथ से करना पड़ता है।',
    en: 'OSPF finds neighbours with Hellos, shares the map with LSAs, derives cost from bandwidth, and runs Dijkstra for the cheapest path. When a link dies it finds another by itself — something static routing leaves to you.',
  },
  check: {
    q: {
      gu: 'OSPF બે રસ્તામાંથી એક પસંદ કરે ત્યારે શેના આધારે કરે છે?',
      hi: 'OSPF दो रास्तों में से एक चुने तो किसके आधार पर करता है?',
      en: 'When OSPF picks between two paths, what does it compare?',
    },
    options: [
      { gu: 'કુલ cost — જે bandwidth પરથી ગણાય છે', hi: 'कुल cost — जो bandwidth से गिनी जाती है', en: 'Total cost — derived from bandwidth' },
      { gu: 'કેટલા hops છે એ', hi: 'कितने hops हैं', en: 'How many hops there are' },
      { gu: 'કયો રસ્તો પહેલાં configure થયો', hi: 'कौन सा रास्ता पहले configure हुआ', en: 'Which path was configured first' },
    ],
    answer: 0,
    explain: {
      gu: 'RIP hops ગણે છે, OSPF નહીં. OSPF દરેક લિંકનો cost (100 Mbps ÷ bandwidth) ઉમેરે છે અને સૌથી ઓછા કુલ cost વાળો રસ્તો પસંદ કરે — ભલે એમાં hops વધુ હોય.',
      hi: 'RIP hops गिनता है, OSPF नहीं। OSPF हर link की cost (100 Mbps ÷ bandwidth) जोड़ता है और सबसे कम कुल cost वाला रास्ता चुनता है — भले उसमें hops ज्यादा हों।',
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
    hi: 'हर PC के पास एक ही default gateway होता है। वह router बंद हो तो पूरी ऑफिस का internet बंद। दूसरा router रखना आसान है — पर PC को नया gateway कैसे बताएं? HSRP उस समस्या का समाधान है: दो router, एक ही नकली पता।',
    en: 'Every PC has exactly one default gateway. If that router dies the whole office loses the internet. Adding a second router is easy — but how do you tell every PC the new gateway? HSRP solves it: two routers, one shared fake address.',
  },
  viewBox: { w: 880, h: 440 },
  steps: [
    {
      ms: 2800,
      label: { gu: 'એક gateway એટલે એક જ નબળી કડી', hi: 'एक gateway यानी एक ही कमजोर कड़ी', en: 'One gateway is one weak link' },
      text: {
        beginner: {
          gu: 'PC1 નું gateway 10.1.1.1 છે — એટલે R1. બીજો router R2 પણ ઊભો છે, પણ PC એને ઓળખતું જ નથી. R1 બંધ પડે તો PC1 બહાર નીકળી જ ન શકે, ભલે બાજુમાં બીજો રસ્તો તૈયાર હોય.',
          hi: 'PC1 का gateway 10.1.1.1 है — यानी R1। दूसरा router R2 भी खड़ा है, पर PC उसे जानता ही नहीं। R1 बंद हो तो PC1 बाहर निकल ही न सके, भले बगल में दूसरा रास्ता तैयार हो।',
          en: 'PC1’s gateway is 10.1.1.1 — that is R1. A second router R2 stands right there, but the PC has never heard of it. If R1 dies PC1 cannot get out, even with another road waiting beside it.',
        },
        exam: {
          gu: 'Host પાસે એક જ default gateway હોય છે અને એ જાતે બીજો શોધતો નથી. Gateway નું failure એ single point of failure છે.',
          hi: 'Host के पास एक ही default gateway होता है और वह खुद दूसरा नहीं ढूंढता। Gateway का failure single point of failure है।',
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
      label: { gu: 'એક નકલી સરનામું બનાવો', hi: 'एक नकली पता बनाएं', en: 'Invent one virtual address' },
      text: {
        beginner: {
          gu: 'HSRP નો વિચાર સરસ છે: એક ત્રીજું, નકલી સરનામું બનાવો — 10.1.1.1 — જે કોઈ એક router નું નથી, બંનેનું સહિયારું છે. PC ને એ જ gateway તરીકે આપો. હવે PC ને ફરક જ નથી પડતો કે પાછળ કયો router કામ કરે છે.',
          hi: 'HSRP का विचार अच्छा है: एक तीसरा, नकली पता बनाएं — 10.1.1.1 — जो किसी एक router का नहीं, दोनों का साझा है। PC को वही gateway के रूप में दें। अब PC को फर्क नहीं पड़ता कि पीछे कौन सा router काम करता है।',
          en: 'The HSRP idea is elegant: invent a third, virtual address — 10.1.1.1 — owned by neither router but shared by both. Give the PCs that as their gateway. Now it no longer matters which router is actually doing the work.',
        },
        exam: {
          gu: 'HSRP group એક virtual IP અને virtual MAC (0000.0c07.acXX, XX = group) બનાવે છે. Hosts હંમેશા virtual address વાપરે છે.',
          hi: 'HSRP group एक virtual IP और virtual MAC (0000.0c07.acXX, XX = group) बनाता है। Hosts हमेशा virtual address वापरते हैं।',
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
        title: { gu: 'સરનામાં', hi: 'पते', en: 'The addresses' },
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
      label: { gu: 'ચૂંટણી — કોણ કામ કરશે', hi: 'चुनाव — कौन काम करेगा', en: 'An election — who does the work' },
      text: {
        beginner: {
          gu: 'બંને routers એકબીજાને સંદેશ મોકલે છે અને નક્કી કરે છે કે કોણ Active રહેશે. જેની priority વધુ એ જીતે; સરખી હોય તો જેનું IP મોટું. બીજો Standby બનીને ચૂપચાપ જોયા કરે છે — તૈયાર, પણ નિષ્ક્રિય.',
          hi: 'दोनों routers एक-दूसरे को संदेश भेजते हैं और तय करते हैं कि कौन Active रहेगा। जिसकी priority ज्यादा वह जीते; समान हो तो जिसका IP बड़ा। दूसरा Standby बनकर चुपचाप देखता रहे — तैयार, पर निष्क्रिय।',
          en: 'The two routers exchange messages and decide who will be Active. Higher priority wins; on a tie the higher IP does. The other becomes Standby and simply watches — ready, but idle.',
        },
        exam: {
          gu: 'Default priority 100; higher wins, tie પર higher IP. `preempt` વગર જૂનો Active પાછો આવે તો પણ Standby જ રહે છે.',
          hi: 'Default priority 100; higher wins, tie पर higher IP। `preempt` के बिना पुराना Active वापस आए तो भी Standby ही रहता है।',
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
        title: { gu: 'ચૂંટણી', hi: 'चुनाव', en: 'The election' },
        head: ['router', 'priority', 'state'],
        rows: [
          ['R1', '110', t > 0.55 ? 'ACTIVE ←' : 'speaking'],
          ['R2', '100', t > 0.55 ? 'standby' : 'speaking'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'બધો traffic Active થઈને જાય', hi: 'सारा traffic Active से जाए', en: 'All traffic goes through the Active one' },
      text: {
        beginner: {
          gu: 'PC1 10.1.1.1 ને packet મોકલે છે. Active router R1 એ નકલી સરનામું પોતાનું હોય એમ જવાબ આપે છે અને traffic આગળ વધારે છે. Standby R2 બેઠો બેઠો જુએ છે અને દર 3 સેકન્ડે R1 ની ધબકાર સાંભળે છે.',
          hi: 'PC1 10.1.1.1 को packet भेजता है। Active router R1 वह नकली पता अपना होने जैसे जवाब देता है और traffic आगे बढ़ाता है। Standby R2 बैठा-बैठा देखता है और हर 3 सेकंड में R1 की धड़कन सुनता है।',
          en: 'PC1 sends to 10.1.1.1. The Active router R1 answers as though that address were its own and forwards the traffic. Standby R2 sits and watches, listening for R1’s heartbeat every 3 seconds.',
        },
        exam: {
          gu: 'Active router virtual MAC માટે ARP reply આપે છે અને forwarding કરે છે. Hello 3 s, hold 10 s — standby એ timers થી failure શોધે છે.',
          hi: 'Active router virtual MAC के लिए ARP reply देता है और forwarding करता है। Hello 3 s, hold 10 s — standby इन timers से failure खोजता है।',
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
      label: { gu: 'Active પડે — અને કોઈને ખબર ન પડે', hi: 'Active गिरे — और किसी को पता न चले', en: 'The Active one dies — and nobody notices' },
      text: {
        beginner: {
          gu: 'હવે R1 બંધ પડે છે. ધબકાર બંધ થાય એટલે 10 સેકન્ડમાં R2 જાહેર કરે છે "હવે હું Active" અને એ જ નકલી સરનામું પોતાના પર લઈ લે છે. PC1 માં કશું બદલવું પડતું નથી — એનું gateway હજી 10.1.1.1 જ છે. Ping એકાદ-બે ગુમાવીને ફરી ચાલુ.',
          hi: 'अब R1 बंद हो जाता है। धड़कन बंद होते ही 10 सेकंड में R2 घोषणा करता है "अब मैं Active" और वही नकली पता अपने पर ले लेता है। PC1 में कुछ बदलना नहीं पड़ता — उसका gateway अभी भी 10.1.1.1 ही है। Ping एक-दो खोकर फिर चालू।',
          en: 'Now R1 fails. The heartbeat stops and within ten seconds R2 announces "I am Active now" and takes the same virtual address onto itself. Nothing changes on PC1 — its gateway is still 10.1.1.1. The ping loses a packet or two and carries on.',
        },
        exam: {
          gu: 'Standby hold timer પૂરો થતાં Active બને અને gratuitous ARP મોકલીને switch નું MAC table અપડેટ કરે. Hosts માં કોઈ ફેરફાર નહીં.',
          hi: 'Standby hold timer पूरा होते ही Active बने और gratuitous ARP भेजकर switch की MAC table update करे। Hosts में कोई बदलाव नहीं।',
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
            : (() => {
                const hops: [string, string][] = [['pc1', 'sw'], ['sw', 'r2'], ['r2', 'srv']]
                const p = (t - 0.45) / 0.55
                const seg = Math.min(2, Math.floor(p * 3))
                const st = p * 3 - seg
                return [{ id: 'p', from: hops[seg][0], to: hops[seg][1], t: 0.06 + ease(st) * 0.88, color: 'var(--nq-ok)', label: 'same gateway ✓' }]
              })(),
      }),
      aside: (t) => ({
        title: { gu: 'સ્થિતિ', hi: 'स्थिति', en: 'State' },
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
      label: { gu: 'ખરી યુક્તિ — uplink પર નજર', hi: 'असली तरकीब — uplink पर नजर', en: 'The real trick — watching the uplink' },
      text: {
        beginner: {
          gu: 'એક છટકું છે. R1 ચાલુ હોય પણ એનો બહાર જવાનો રસ્તો તૂટે તો? R1 તો Active જ રહેશે અને traffic લેતો રહેશે — પણ આગળ મોકલી નહીં શકે. એટલે interface tracking વપરાય છે: ઉપરની લિંક પડે તો priority આપોઆપ ઘટાડી દો, જેથી R2 કબજો લઈ લે.',
          hi: 'एक छटका है। R1 चालू हो पर उसका बाहर जाने का रास्ता टूटे तो? R1 तो Active ही रहेगा और traffic लेता रहेगा — पर आगे भेज नहीं सकेगा। इसलिए interface tracking वापरा जाता है: ऊपर की link गिरे तो priority अपने आप घटा दें, ताकि R2 कब्जा ले ले।',
          en: 'There is a trap. What if R1 is alive but its path to the outside breaks? R1 stays Active and keeps accepting traffic — with nowhere to send it. So we use interface tracking: when the uplink drops, lower the priority automatically so R2 takes over.',
        },
        exam: {
          gu: '`standby 1 track <interface> <decrement>` uplink પડે ત્યારે priority ઘટાડે છે. એની સાથે `preempt` જોઈએ, નહીંતર standby કબજો લેશે નહીં.',
          hi: '`standby 1 track <interface> <decrement>` uplink गिरे तो priority घटाता है। इसके साथ `preempt` चाहिए, वरना standby कब्जा नहीं लेगा।',
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
    hi: 'HSRP दो router को एक नकली पता बांटता है। PC वही gateway वापरता है और पीछे कौन काम करता है यह जानता भी नहीं। Active गिरे तो Standby दस सेकंड में कब्जा ले — और uplink गिरे तो भी कब्जा हो इसके लिए interface tracking जोड़ें।',
    en: 'HSRP lets two routers share one virtual address. The PCs use it as their gateway and never learn who is really working. If the Active one dies, Standby takes over within ten seconds — and add interface tracking so it also takes over when only the uplink dies.',
  },
  check: {
    q: {
      gu: 'HSRP માં Active router બદલાય ત્યારે PC ના gateway માં શું બદલવું પડે?',
      hi: 'HSRP में Active router बदले तो PC के gateway में क्या बदलना पड़े?',
      en: 'When the Active HSRP router changes, what must you change on the PCs?',
    },
    options: [
      { gu: 'કશું નહીં — gateway એ જ virtual IP રહે છે', hi: 'कुछ नहीं — gateway वही virtual IP रहता है', en: 'Nothing — the gateway stays the same virtual IP' },
      { gu: 'નવા router નું IP લખવું પડે', hi: 'नए router का IP लिखना पड़े', en: 'You must enter the new router’s IP' },
      { gu: 'PC ફરી ચાલુ કરવો પડે', hi: 'PC फिर चालू करना पड़े', en: 'You must reboot the PC' },
    ],
    answer: 0,
    explain: {
      gu: 'એ જ તો HSRP નો આખો હેતુ છે. Gateway એક નકલી સરનામું છે જે બંને routers વહેંચે છે — એટલે કબજો બદલાય તોય hosts માટે કશું બદલાતું નથી.',
      hi: 'यही तो HSRP का पूरा मकसद है। Gateway एक नकली पता है जो दोनों routers बांटते हैं — तो कब्जा बदले तो भी hosts के लिए कुछ नहीं बदलता।',
      en: 'That is the entire point of HSRP. The gateway is a virtual address shared by both routers, so a change of ownership looks like nothing at all to the hosts.',
    },
  },
}
