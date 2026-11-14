import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const OK = 'var(--nq-ok)'
const WARN = 'var(--nq-warn)'
const ERR = 'var(--nq-err)'
const MUTE = 'var(--nq-text-mute)'
const H = (gu: string, en: string) => ({ gu, en })

/* ═══════════════ n1l1 · components and topology architectures ═══════════════ */

export const n1l1: LessonSpec = {
  why: {
    gu: 'દરેક નેટવર્કમાં એ જ મુઠ્ઠીભર ઉપકરણો ફરી ફરી આવે છે. એ દરેક **એક જ સવાલ**નો જવાબ આપે છે, અને કયું ક્યાં બેસે એ સમજાય એટલે કોઈ પણ નકશો વાંચી શકાય — ઘરનો હોય કે આખા campus નો.',
    en: 'Every network is the same handful of devices, over and over. Each one answers **exactly one question**, and once you know which sits where you can read any diagram put in front of you — a house or a whole campus.',
  },
  steps: [
    {
      ms: 3000,
      label: H('Switch — "આ ઇમારતમાં કોણ?"', 'The switch — "who is in this building?"'),
      text: {
        beginner: {
          gu: 'Switch એક જ કામ કરે: એક જ જગ્યાના ઉપકરણોને જોડવા. એ MAC સરનામાં યાદ રાખે અને frame **સીધો** સાચા port પર મોકલે. પણ એ બીજા નેટવર્ક સુધી જવાનો રસ્તો જાણતું નથી — એ એનું કામ જ નથી.',
          en: 'A switch does one job: join up the devices in one place. It remembers MAC addresses and sends each frame **straight** to the right port. But it knows no way to any other network — that was never its job.',
        },
        exam: {
          gu: 'Layer 2 device. Frame ને MAC થી forward કરે, દરેક port એક collision domain, પણ બધા ports એક જ broadcast domain (VLAN થી વહેંચાય ત્યાં સુધી).',
          en: 'A Layer 2 device. It forwards frames by MAC, gives each port its own collision domain, but keeps every port in one broadcast domain until VLANs divide them.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 430, y: 210, type: 'switch', label: 'Switch', sub: 'who is in this building?', accent: CCNA, pulse: t > 0.3 },
          { id: 'p1', x: 150, y: 90, type: 'pc', label: 'PC1', accent: BEG },
          { id: 'p2', x: 150, y: 330, type: 'pc', label: 'PC2', accent: BEG },
          { id: 'p3', x: 710, y: 90, type: 'pc', label: 'PC3', accent: BEG },
          { id: 'pr', x: 710, y: 330, type: 'server', label: 'Printer', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'p1', to: 'sw', state: 'up', flowing: t > 0.4 && t < 0.8 },
          { id: 'b', from: 'p2', to: 'sw', state: 'up' },
          { id: 'c', from: 'p3', to: 'sw', state: 'up' },
          { id: 'd', from: 'sw', to: 'pr', state: 'up', flowing: t > 0.55 },
        ],
        packets:
          t > 0.4
            ? [{ id: 'x', from: 'p1', to: 'pr', t: 0.1 + ease(Math.min(1, (t - 0.4) / 0.6)) * 0.8, color: 'var(--nq-pkt-data)', label: '→ printer' }]
            : [],
      }),
      aside: () => ({
        title: H('Switch શું જાણે છે', 'What a switch knows'),
        caption: H('ફક્ત આ એક જગ્યાના ઉપકરણો.', 'Only the devices in this one place.'),
        head: ['port', 'MAC it has seen'],
        rows: [
          ['Fa0/1', 'PC1'],
          ['Fa0/2', 'PC2'],
          ['Fa0/4', 'Printer'],
        ],
      }),
    },
    {
      ms: 3000,
      label: H('Router — "બહાર કેવી રીતે જવું?"', 'The router — "how do I get out?"'),
      text: {
        beginner: {
          gu: 'બીજા નેટવર્ક સુધી જવું હોય ત્યારે router જોઈએ. એ IP સરનામું જુએ, પોતાની યાદીમાં રસ્તો શોધે, અને packet આગળ ધકેલે. દરેક નેટવર્કમાં એ **દરવાજો** છે — એટલે તો એને default *gateway* કહે છે.',
          en: 'The moment you need to reach another network you need a router. It looks at the IP address, finds a path in its list and pushes the packet onward. It is the **door** out of each network — which is why we call it the default *gateway*.',
        },
        exam: {
          gu: 'Layer 3 device. દરેક interface એક અલગ broadcast domain. Broadcast ને આગળ ન મોકલે — એ મોટા નેટવર્કમાં એની સૌથી કામની ખાસિયત છે.',
          en: 'A Layer 3 device. Each interface is its own broadcast domain, and it does not pass broadcasts along — which is its single most useful property at scale.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 180, y: 210, type: 'switch', label: 'Switch', accent: CCNA, faded: t > 0.4 },
          { id: 'r', x: 450, y: 210, type: 'router', label: 'Router', sub: 'how do I get out?', accent: CCNA, pulse: t > 0.35 },
          { id: 'cl', x: 740, y: 210, type: 'cloud', label: 'another network', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'sw', to: 'r', state: 'up', flowing: t > 0.3 },
          { id: 'b', from: 'r', to: 'cl', state: 'up', flowing: t > 0.5 },
        ],
        packets:
          t > 0.45
            ? [{ id: 'x', from: 'r', to: 'cl', t: 0.1 + ease((t - 0.45) / 0.55) * 0.8, color: 'var(--nq-pkt-data)', label: '→ 10.9.9.9' }]
            : [],
      }),
      say: (t) => (t > 0.5 ? { nodeId: 'r', text: H('એ નેટવર્ક મારી યાદીમાં છે', 'that network is in my list') } : null),
    },
    {
      ms: 3000,
      label: H('Firewall — "આ અંદર આવવા દેવું?"', 'The firewall — "should this be let in?"'),
      text: {
        beginner: {
          gu: 'Router પૂછે છે "રસ્તો કયો?", firewall પૂછે છે **"આ પસાર થવા દેવું?"**. એ નિયમોની યાદી સામે દરેક જોડાણ તપાસે: અંદરથી બહાર જતું સામાન્ય રીતે ચાલે, બહારથી અંદર આવતું ત્યારે જ જ્યારે તમે ખાસ પરવાનગી આપી હોય.',
          en: 'A router asks "which way?"; a firewall asks **"should this pass at all?"**. It checks every connection against a list of rules: outbound is usually fine, inbound only when you have specifically allowed it.',
        },
        exam: {
          gu: 'Stateful firewall અંદરથી શરૂ થયેલા જોડાણો યાદ રાખે, એટલે એના જવાબ આપોઆપ પાછા આવી શકે. ACL stateless હોય — એને બંને દિશા જાતે લખવી પડે.',
          en: 'A stateful firewall remembers connections that started inside, so their replies come back automatically. An ACL is stateless: you have to write both directions yourself.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'in', x: 140, y: 210, type: 'pc', label: 'inside', accent: BEG },
          { id: 'fw', x: 430, y: 210, type: 'firewall', label: 'Firewall', sub: 'should this be let in?', accent: ERR, pulse: true },
          { id: 'out', x: 740, y: 210, type: 'cloud', label: 'internet', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'in', to: 'fw', state: 'up', flowing: true },
          { id: 'b', from: 'fw', to: 'out', state: 'up', flowing: true },
        ],
        packets: [
          { id: 'o', from: 'in', to: 'out', t: 0.3 + ease(Math.min(1, t)) * 0.2, color: 'var(--nq-ok)', label: 'out — allowed' },
          ...(t > 0.45
            ? [{ id: 'i', from: 'out', to: 'fw', t: 0.15 + ease((t - 0.45) / 0.55) * 0.55, color: ERR, label: 'in — blocked ✕' }]
            : []),
        ],
      }),
    },
    {
      ms: 3000,
      label: H('AP અને controller — "તાર વગર"', 'AP and controller — "without a cable"'),
      text: {
        beginner: {
          gu: 'Access point રેડિયો તરંગને તારમાં બદલે — બસ એટલું. એક ઇમારતમાં પચાસ AP હોય તો દરેકને હાથે ગોઠવવું અશક્ય બને, એટલે **controller** આવે: તમે એક જગ્યાએ નિયમ બદલો, બધા AP એ માને.',
          en: 'An access point turns radio into cable, and that is all it does. Fifty APs in one building would be impossible to configure one by one, so a **controller** steps in: you change a setting in one place and every AP obeys.',
        },
        exam: {
          gu: 'Autonomous AP પોતે બધું સંભાળે. Lightweight AP controller સાથે CAPWAP tunnel થી જોડાય — WLC તેની configuration, channel અને power સંભાળે.',
          en: 'An autonomous AP handles everything itself. A lightweight AP joins a controller over a CAPWAP tunnel, and the WLC then owns its configuration, channel and power.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ph', x: 110, y: 100, type: 'laptop', label: 'laptop', accent: BEG },
          { id: 'ap1', x: 360, y: 90, type: 'ap', label: 'AP 1', accent: CCNP },
          { id: 'ap2', x: 360, y: 320, type: 'ap', label: 'AP 2', accent: CCNP },
          { id: 'wlc', x: 680, y: 210, type: 'server', label: 'Controller', sub: t > 0.45 ? 'one place to change things' : undefined, accent: t > 0.45 ? OK : MUTE, pulse: t > 0.45 },
        ],
        links: [
          { id: 'w', from: 'ph', to: 'ap1', state: 'up', flowing: true, label: 'radio' },
          { id: 'a', from: 'ap1', to: 'wlc', state: 'up', flowing: t > 0.45 },
          { id: 'b', from: 'ap2', to: 'wlc', state: 'up', flowing: t > 0.45 },
        ],
        packets:
          t > 0.5
            ? [
                { id: 'c1', from: 'wlc', to: 'ap1', t: 0.15 + ease((t - 0.5) / 0.5) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'same settings' },
                { id: 'c2', from: 'wlc', to: 'ap2', t: 0.15 + ease((t - 0.5) / 0.5) * 0.7, color: 'var(--nq-pkt-ctrl)' },
              ]
            : [],
      }),
    },
    {
      ms: 3200,
      label: H('બધાને સાથે ગોઠવો: ત્રણ માળ', 'Stack them up: the three tiers'),
      text: {
        beginner: {
          gu: 'મોટી જગ્યાએ આ ઉપકરણો **માળ**માં ગોઠવાય. નીચે *access* — જ્યાં લોકોના કેબલ આવે. વચ્ચે *distribution* — માળ અને ઇમારતોને જોડે, અને નિયમો અહીં લાગે. ઉપર *core* — ફક્ત ઝડપ, બીજું કશું નહીં.',
          en: 'At scale these devices stack into **tiers**. At the bottom *access*, where people’s cables land. In the middle *distribution*, joining floors and buildings, and where the rules live. At the top *core*, which does nothing but go fast.',
        },
        exam: {
          gu: 'Core layer પર કદી ACL કે policy ન મૂકવું — એનું કામ ફક્ત switch કરવું છે. નાની જગ્યાએ distribution અને core એક થઈ જાય: એને collapsed core કહે છે.',
          en: 'Never hang ACLs or policy off the core — its one job is to switch fast. In smaller sites distribution and core merge into one, which is called a collapsed core.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'c1', x: 310, y: 70, type: 'switch', label: 'Core', sub: t > 0.2 ? 'speed only' : undefined, accent: CCNP, pulse: t > 0.2 && t < 0.4 },
          { id: 'c2', x: 560, y: 70, type: 'switch', label: 'Core', accent: CCNP },
          { id: 'd1', x: 310, y: 200, type: 'switch', label: 'Distribution', sub: t > 0.45 ? 'rules live here' : undefined, accent: CCNA, pulse: t > 0.45 && t < 0.65 },
          { id: 'd2', x: 560, y: 200, type: 'switch', label: 'Distribution', accent: CCNA },
          { id: 'a1', x: 180, y: 330, type: 'switch', label: 'Access', sub: t > 0.7 ? 'people plug in here' : undefined, accent: BEG, pulse: t > 0.7 },
          { id: 'a2', x: 430, y: 330, type: 'switch', label: 'Access', accent: BEG },
          { id: 'a3', x: 690, y: 330, type: 'switch', label: 'Access', accent: BEG },
        ],
        links: [
          { id: 'cc', from: 'c1', to: 'c2', state: 'up' },
          { id: 'x1', from: 'c1', to: 'd1', state: 'up' },
          { id: 'x2', from: 'c1', to: 'd2', state: 'up' },
          { id: 'x3', from: 'c2', to: 'd1', state: 'up' },
          { id: 'x4', from: 'c2', to: 'd2', state: 'up' },
          { id: 'y1', from: 'd1', to: 'a1', state: 'up' },
          { id: 'y2', from: 'd1', to: 'a2', state: 'up' },
          { id: 'y3', from: 'd2', to: 'a2', state: 'up' },
          { id: 'y4', from: 'd2', to: 'a3', state: 'up' },
        ],
      }),
      aside: () => ({
        title: H('ત્રણ માળ, ત્રણ કામ', 'Three tiers, three jobs'),
        head: ['tier', 'its one job'],
        rows: [
          ['Core', 'move packets fast, decide nothing'],
          ['Distribution', 'join things up, apply the policy'],
          ['Access', 'take the user cables'],
        ],
        notes: { 0: H('અહીં કદી ACL નહીં', 'never put an ACL here') },
      }),
    },
  ],
  takeaway: {
    gu: 'દરેક ઉપકરણ **એક** સવાલનો જવાબ છે: switch "આ જગ્યામાં કોણ?", router "બહાર કેવી રીતે?", firewall "પસાર થવા દેવું?", AP "તાર વગર કેવી રીતે?", controller "પચાસ AP એકસાથે કેવી રીતે?". મોટી જગ્યાએ એ ત્રણ માળમાં ગોઠવાય — access, distribution, core — અને core પર કદી નિયમ ન મૂકવા.',
    en: 'Each device answers **one** question: the switch "who is in this place?", the router "how do I get out?", the firewall "should this pass?", the AP "how, without a cable?", the controller "how do I manage fifty APs at once?". At scale they stack into access, distribution and core — and nothing but speed belongs in the core.',
  },
  check: {
    q: H(
      'બે PC એક જ switch પર છે, એક જ subnet માં. એમની વચ્ચેની વાતમાં router નું કામ શું?',
      'Two PCs are on the same switch, in the same subnet. What part does the router play in their conversation?',
    ),
    options: [
      H('કશું જ નહીં — switch જ પૂરતું છે', 'None at all — the switch is enough'),
      H('દરેક frame router થઈને જાય', 'Every frame passes through the router'),
      H('Router MAC સરનામાં આપે', 'The router hands out the MAC addresses'),
    ],
    answer: 0,
    explain: H(
      'એક જ subnet એટલે એક જ નેટવર્ક — બહાર જવાનું જ નથી. Switch MAC જોઈને સીધો સાચા port પર મોકલે. Router ત્યારે જ વચ્ચે આવે જ્યારે મંઝિલ **બીજા** નેટવર્કમાં હોય.',
      'One subnet means one network, so there is nothing to get out of. The switch reads the MAC and sends it straight to the right port. The router only enters the picture when the destination is on a **different** network.',
    ),
  },
}

/* ═══════════════════ n1l2 · cabling and interfaces ═══════════════════ */

export const n1l2: LessonSpec = {
  why: {
    gu: 'Configuration સાચું હોય અને તોય કશું ન ચાલે — અને કારણ હોય એક કેબલ, એક duplex, કે એક port જેને વીજળી જ નથી મળી. આ પાઠ એ ભૌતિક સ્તરનો છે, જ્યાં સૌથી વધુ સમય બગડે છે.',
    en: 'The configuration is right and still nothing works — and the reason is a cable, a duplex setting, or a port that never got any power. This lesson is that physical layer, where the most time gets lost.',
  },
  steps: [
    {
      ms: 3000,
      label: H('તાંબુ કે કાચ', 'Copper or glass'),
      text: {
        beginner: {
          gu: 'તાંબાનો કેબલ (UTP) સસ્તો અને સહેલો છે, પણ **100 મીટર** પછી સંકેત મરી જાય. Fibre કાચમાં પ્રકાશ મોકલે: કિલોમીટરો જાય, વીજળીના ઘોંઘાટથી અસર ન થાય, પણ મોંઘું. એટલે નિયમ સાદો છે — ઓરડામાં તાંબુ, ઇમારતો વચ્ચે fibre.',
          en: 'Copper (UTP) is cheap and easy, but past **100 metres** the signal dies. Fibre sends light down glass: it goes for kilometres, electrical noise cannot touch it, and it costs more. So the rule is simple — copper inside a room, fibre between buildings.',
        },
        exam: {
          gu: 'UTP Cat5e 1 Gbps / Cat6a 10 Gbps, બંને 100 m. Multimode fibre (orange/aqua) થોડાં સો મીટર, સસ્તું optics. Singlemode (yellow) દસ કિલોમીટર સુધી.',
          en: 'UTP Cat5e does 1 Gbps and Cat6a 10 Gbps, both to 100 m. Multimode fibre (orange or aqua) runs a few hundred metres on cheaper optics; singlemode (yellow) goes tens of kilometres.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's1', x: 130, y: 110, type: 'switch', label: 'SW1', sub: 'floor 1', accent: CCNA },
          { id: 'p1', x: 130, y: 320, type: 'pc', label: 'PC', sub: '30 m — copper', accent: BEG },
          { id: 's2', x: 720, y: 110, type: 'switch', label: 'SW2', sub: t > 0.4 ? '400 m away' : 'other building', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'p1', to: 's1', state: 'up', label: 'copper', flowing: true },
          { id: 'b', from: 's1', to: 's2', state: t > 0.4 ? 'up' : 'idle', label: t > 0.4 ? 'fibre' : '?', flowing: t > 0.4 },
        ],
      }),
      aside: (t) => ({
        title: H('કયો કેબલ ક્યાં', 'Which cable where'),
        caption: H('અંતર નક્કી કરે, ઝડપ નહીં.', 'Distance decides this, not speed.'),
        head: ['cable', 'reach', 'use it for'],
        rows: [
          ['Cat6a copper', '100 m', 'desk to switch'],
          ...(t > 0.4 ? [['Multimode fibre', '~400 m', 'building to building']] : []),
          ...(t > 0.7 ? [['Singlemode fibre', '10+ km', 'site to site']] : []),
        ],
      }),
    },
    {
      ms: 3000,
      label: H('એક જ તારે વીજળી પણ', 'Power down the same wire'),
      text: {
        beginner: {
          gu: 'છત પર AP લગાવવું હોય તો ત્યાં plug point નથી. PoE એ જ data કેબલમાં **વીજળી પણ** મોકલે — એટલે AP, કેમેરા અને ફોનને એક જ તાર પૂરતો થાય. Switch આપે, ઉપકરણ માગે, અને બંને પહેલાં નક્કી કરે કે કેટલું.',
          en: 'Mounting an AP on a ceiling means there is no socket up there. PoE sends **power as well** down the same data cable, so an AP, a camera or a phone needs one wire and no more. The switch supplies, the device asks, and the two agree the amount first.',
        },
        exam: {
          gu: 'PoE (802.3af) 15.4 W, PoE+ (at) 30 W, PoE++ (bt) 60/100 W — switch ના port પર. Switch નું કુલ power budget ગણવું પડે: 48 ports × 30 W ભાગ્યે જ મળે.',
          en: 'PoE (802.3af) gives 15.4 W, PoE+ (at) 30 W, PoE++ (bt) 60 or 100 W at the port. Watch the switch’s total power budget: 48 ports at 30 W each is rarely on offer.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 200, y: 210, type: 'switch', label: 'PoE switch', sub: t > 0.5 ? 'budget 370 W' : undefined, accent: CCNA },
          { id: 'ap', x: 620, y: 110, type: 'ap', label: 'AP', sub: t > 0.45 ? 'asks 25 W' : undefined, accent: t > 0.45 ? OK : MUTE, pulse: t > 0.45 },
          { id: 'cam', x: 620, y: 330, type: 'server', label: 'Camera', sub: t > 0.6 ? 'asks 12 W' : undefined, accent: t > 0.6 ? OK : MUTE },
        ],
        links: [
          { id: 'a', from: 'sw', to: 'ap', state: 'up', label: 'data + power', flowing: t > 0.3 },
          { id: 'b', from: 'sw', to: 'cam', state: 'up', label: 'data + power', flowing: t > 0.5 },
        ],
        packets:
          t > 0.35
            ? [{ id: 'p', from: 'sw', to: 'ap', t: 0.15 + ease((t - 0.35) / 0.65) * 0.7, color: 'var(--nq-warn)', label: '⚡ 25 W' }]
            : [],
      }),
    },
    {
      ms: 3200,
      label: H('Duplex — બંને સાથે બોલે?', 'Duplex — can both talk at once?'),
      text: {
        beginner: {
          gu: 'Full duplex એટલે બંને છેડા **એકસાથે** બોલી શકે, બે લેનના રસ્તાની જેમ. Half duplex એટલે વારો લેવો પડે, એક લેનના પુલની જેમ. આજે બધું full duplex છે — અને એટલે જ half duplex મળે ત્યારે લગભગ હંમેશા એ ભૂલ હોય છે.',
          en: 'Full duplex means both ends can talk **at the same time**, like a two-lane road. Half duplex means taking turns, like a single-lane bridge. Everything is full duplex today — which is exactly why finding half duplex nearly always means something is wrong.',
        },
        exam: {
          gu: 'Hub ને half duplex ફરજિયાત. Switch port ને `duplex full`, `duplex half` કે `duplex auto` — અને auto એ default છે.',
          en: 'A hub forces half duplex. A switch port takes `duplex full`, `duplex half` or `duplex auto`, and auto is the default.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 220, y: 210, type: 'pc', label: 'PC', sub: t > 0.5 ? 'full duplex' : 'half duplex', accent: t > 0.5 ? OK : WARN },
          { id: 'b', x: 640, y: 210, type: 'switch', label: 'SW', accent: CCNA },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up', flowing: true }],
        packets:
          t > 0.5
            ? [
                { id: 'o', from: 'a', to: 'b', t: 0.2 + ease(Math.min(1, (t - 0.5) / 0.5)) * 0.6, color: 'var(--nq-pkt-data)', label: 'both ways' },
                { id: 'i', from: 'b', to: 'a', t: 0.2 + ease(Math.min(1, (t - 0.5) / 0.5)) * 0.6, color: 'var(--nq-pkt-tcp)' },
              ]
            : [{ id: 'o', from: 'a', to: 'b', t: 0.2 + ease(t / 0.5) * 0.6, color: 'var(--nq-pkt-data)', label: 'one at a time' }],
      }),
      aside: (t) => ({
        title: H('એક લેન કે બે', 'One lane or two'),
        head: ['mode', 'who may talk'],
        rows: t > 0.5 ? [['full', 'both ends, at once']] : [['half', 'one end, taking turns']],
      }),
    },
    {
      ms: 3400,
      label: H('Mismatch — ચાલે છે, પણ ભયાનક ધીમું', 'A mismatch — it works, horribly slowly'),
      text: {
        beginner: {
          gu: 'હવે સૌથી કપટી ભૂલ. એક છેડો full, બીજો half. **Link ઊભી થાય**, ping ચાલે, બધું ઠીક લાગે — પણ full વાળો છેડો વારો જોયા વગર બોલે ત્યારે અથડામણ થાય. File copy કરવા બેસો તો ખબર પડે: 1 Gbps ની લિંક પર 2 Mbps.',
          en: 'Now the sneakiest fault of all. One end full, the other half. **The link comes up**, ping works, everything looks fine — but when the full-duplex end talks without waiting its turn, the two collide. You notice when you copy a file: 2 Mbps across a gigabit link.',
        },
        exam: {
          gu: '`show interface` પર late collisions અને CRC errors વધતા દેખાય — mismatch ની સહી એ જ છે. એક છેડો હાથે set હોય અને બીજો auto હોય ત્યારે આ થાય, એટલે **બંને છેડા સરખા** રાખો.',
          en: 'Watch late collisions and CRC errors climbing in `show interface` — that is the signature. It happens when one end is set by hand and the other left on auto, so set **both ends the same way**.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 220, y: 210, type: 'pc', label: 'PC', sub: 'full duplex', accent: WARN },
          { id: 'b', x: 640, y: 210, type: 'switch', label: 'SW', sub: 'half duplex', accent: WARN },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up', label: t > 0.45 ? 'up — and crawling' : 'up', flowing: true }],
        packets: [
          { id: 'o', from: 'a', to: 'b', t: 0.46, color: t > 0.45 ? ERR : 'var(--nq-pkt-data)', label: t > 0.45 ? 'collision ✕' : undefined },
          { id: 'i', from: 'b', to: 'a', t: 0.54, color: t > 0.45 ? ERR : 'var(--nq-pkt-tcp)' },
        ],
      }),
      say: (t) => (t > 0.55 ? { nodeId: 'b', text: H('તારો વારો નહોતો', 'it was not your turn') } : null),
      aside: (t) => ({
        title: H('Interface ના આંકડા', 'The interface counters'),
        caption: H('Link ઊભી છે. આંકડા જ સાચું કહે છે.', 'The link is up. Only the counters tell the truth.'),
        head: ['counter', 'value'],
        rows: [
          ['late collisions', t > 0.45 ? '4,812 ↑' : '0'],
          ['CRC errors', t > 0.45 ? '1,106 ↑' : '0'],
          ['throughput', t > 0.45 ? '2 Mbps on a 1 Gbps link' : '—'],
        ],
        notes: { 0: H('mismatch ની સહી', 'the signature of a mismatch') },
      }),
    },
    {
      ms: 2800,
      label: H('પહેલાં અહીં જુઓ', 'Look here first'),
      text: {
        beginner: {
          gu: 'કશું ન ચાલે ત્યારે **ભૌતિક સ્તરથી શરૂ કરો**, configuration થી નહીં. એક command લગભગ બધું કહી દે: `show ip interface brief`. Port નીચે છે? કેબલ. `administratively down`? તમે `no shutdown` ભૂલ્યા. ઊભું છે પણ ધીમું? duplex જુઓ.',
          en: 'When nothing works, **start at the physical layer**, not the configuration. One command tells you nearly everything: `show ip interface brief`. Port down? A cable. `administratively down`? You forgot `no shutdown`. Up but slow? Go and look at the duplex.',
        },
        exam: {
          gu: 'ક્રમ: `show ip interface brief` → `show interface <x>` (counters, duplex, speed) → `show interface status` → પછી જ configuration. નીચેથી ઉપર, OSI ની જેમ.',
          en: 'The order: `show ip interface brief` → `show interface <x>` for counters, duplex and speed → `show interface status` → and only then the configuration. Bottom up, the way OSI is drawn.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'sw', x: 430, y: 210, type: 'switch', label: 'SW1', accent: CCNA, pulse: true },
          { id: 'p1', x: 150, y: 110, type: 'pc', label: 'PC1', sub: 'up', accent: OK },
          { id: 'p2', x: 150, y: 330, type: 'pc', label: 'PC2', sub: 'cable out', accent: ERR },
          { id: 'p3', x: 710, y: 210, type: 'pc', label: 'PC3', sub: 'admin down', accent: WARN },
        ],
        links: [
          { id: 'a', from: 'p1', to: 'sw', state: 'up', flowing: true },
          { id: 'b', from: 'p2', to: 'sw', state: 'down' },
          { id: 'c', from: 'sw', to: 'p3', state: 'idle' },
        ],
      }),
      aside: () => ({
        title: H('show ip interface brief', 'show ip interface brief'),
        head: ['port', 'status', 'what it means'],
        rows: [
          ['Fa0/1', 'up/up', 'all well'],
          ['Fa0/2', 'down/down', 'cable or far end'],
          ['Fa0/3', 'admin down', 'you forgot no shutdown'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'ઓરડામાં તાંબુ (100 મીટર), ઇમારતો વચ્ચે fibre. PoE એ જ તારે વીજળી મોકલે — switch નું budget ગણવું. બંને છેડા full duplex રાખો, અને **એક છેડો full બીજો half** એ સૌથી કપટી ભૂલ છે: લિંક ઊભી રહે, ઝડપ મરી જાય, અને late collisions એની સહી છે.',
    en: 'Copper in the room (100 metres), fibre between buildings. PoE carries power down the same wire — count the switch’s budget. Keep both ends full duplex, because **one full and one half** is the sneakiest fault there is: the link stays up, the speed dies, and late collisions are its signature.',
  },
  check: {
    q: H(
      'Link `up/up` છે, ping ચાલે છે, પણ file copy અત્યંત ધીમી છે અને late collisions વધે છે. પહેલાં શું તપાસશો?',
      'The link is `up/up`, ping works, but a file copy is painfully slow and late collisions are climbing. What do you check first?',
    ),
    options: [
      H('બંને છેડાની duplex setting', 'The duplex setting at both ends'),
      H('IP સરનામું અને subnet mask', 'The IP address and subnet mask'),
      H('Routing table', 'The routing table'),
    ],
    answer: 0,
    explain: H(
      'Late collisions duplex mismatch ની ઓળખ છે. IP કે routing ખોટું હોય તો ping **ચાલે જ નહીં** — એ ચાલે છે, એટલે Layer 3 ઠીક છે અને સમસ્યા નીચે છે.',
      'Late collisions are the fingerprint of a duplex mismatch. Wrong IP or routing would stop the ping **working at all** — it works, so Layer 3 is fine and the trouble is below it.',
    ),
  },
}

/* ═══════════════════ n1l7 · wireless principles ═══════════════════ */

export const n1l7: LessonSpec = {
  why: {
    gu: 'Wi-Fi એ કેબલ જેવું **નથી**. એ વહેંચાયેલી હવા છે જ્યાં દરેકે વારો લેવો પડે, અને પડોશીનું AP પણ એ જ હવા વાપરે. એ એક વાત સમજાય એટલે "Wi-Fi ધીમું છે" ની અડધી ફરિયાદો સમજાઈ જાય.',
    en: 'Wi-Fi is **not** a cable. It is shared air where everybody takes turns, and the neighbour’s AP is using the same air. Understand that one thing and half the "the Wi-Fi is slow" complaints explain themselves.',
  },
  steps: [
    {
      ms: 3000,
      label: H('એક સમયે એક જ બોલે', 'Only one may talk at a time'),
      text: {
        beginner: {
          gu: 'Switch ના દરેક port ને પોતાની લેન છે. AP પાસે **એક** હવા છે, બધા માટે. એટલે દરેક ઉપકરણ પહેલાં સાંભળે — કોઈ બોલે છે? — અને ચૂપ હોય તો જ બોલે. Wi-Fi હંમેશા half duplex છે, ભલે આંકડો ગમે તેટલો મોટો લખ્યો હોય.',
          en: 'Every port on a switch has its own lane. An AP has **one** patch of air for everyone. So each device listens first — is anybody talking? — and speaks only into silence. Wi-Fi is always half duplex, whatever large number is printed on the box.',
        },
        exam: {
          gu: 'CSMA/CA: carrier sense, અને અથડામણ **ટાળવી** (avoidance), પકડવી નહીં — કારણ કે રેડિયો પર મોકલતી વખતે સાંભળી શકાતું નથી. એટલે random backoff અને ACK.',
          en: 'CSMA/CA: carrier sense with collision *avoidance*, not detection — because a radio cannot listen while it transmits. Hence the random backoff and the ACK.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ap', x: 430, y: 200, type: 'ap', label: 'AP', sub: 'one patch of air', accent: CCNP, pulse: true },
          { id: 'l1', x: 150, y: 90, type: 'laptop', label: 'laptop', accent: t < 0.5 ? OK : MUTE },
          { id: 'l2', x: 150, y: 320, type: 'laptop', label: 'phone', accent: t >= 0.5 ? OK : MUTE },
          { id: 'l3', x: 720, y: 200, type: 'laptop', label: 'tablet', sub: 'waiting', accent: MUTE },
        ],
        links: [
          { id: 'a', from: 'l1', to: 'ap', state: t < 0.5 ? 'up' : 'idle', flowing: t < 0.5 },
          { id: 'b', from: 'l2', to: 'ap', state: t >= 0.5 ? 'up' : 'idle', flowing: t >= 0.5 },
          { id: 'c', from: 'l3', to: 'ap', state: 'idle' },
        ],
        packets:
          t < 0.5
            ? [{ id: 'p', from: 'l1', to: 'ap', t: 0.15 + ease(t / 0.5) * 0.7, color: 'var(--nq-pkt-data)', label: 'my turn' }]
            : [{ id: 'p', from: 'l2', to: 'ap', t: 0.15 + ease((t - 0.5) / 0.5) * 0.7, color: 'var(--nq-pkt-tcp)', label: 'now mine' }],
      }),
      say: (t) => (t > 0.3 && t < 0.5 ? { nodeId: 'l3', text: H('હું રાહ જોઉં છું', 'I am waiting') } : null),
    },
    {
      ms: 3200,
      label: H('Channel — હવાના ભાગ', 'Channels — slices of the air'),
      text: {
        beginner: {
          gu: '2.4 GHz માં અગિયાર channel દેખાય, પણ એ **એકબીજા પર ચડે** છે. ફક્ત **1, 6 અને 11** સાચે જુદા છે. પડોશમાં ત્રણ AP હોય તો એ ત્રણ વાપરો. કોઈ channel 3 પર જાય તો એ 1 અને 6 બંનેને બગાડે — અને સૌથી વધુ પોતાને.',
          en: 'There look to be eleven channels in 2.4 GHz, but they **overlap**. Only **1, 6 and 11** are genuinely separate. Three APs near each other should use those three. Put one on channel 3 and it spoils both 1 and 6 — and itself most of all.',
        },
        exam: {
          gu: '2.4 GHz માં 20 MHz channel, 5 MHz ને અંતરે — એટલે 1/6/11 જ non-overlapping. 5 GHz માં 20+ non-overlapping channels, એટલે ત્યાં આ સમસ્યા નથી.',
          en: 'In 2.4 GHz the channels are 20 MHz wide but spaced 5 MHz apart, so only 1/6/11 are non-overlapping. 5 GHz has more than twenty non-overlapping channels, so the problem does not arise there.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a1', x: 160, y: 130, type: 'ap', label: 'AP 1', sub: 'ch 1', accent: OK },
          { id: 'a2', x: 430, y: 300, type: 'ap', label: 'AP 2', sub: 'ch 6', accent: OK },
          { id: 'a3', x: 700, y: 130, type: 'ap', label: 'AP 3', sub: t > 0.45 ? 'ch 3 — clashing' : 'ch 11', accent: t > 0.45 ? ERR : OK, pulse: t > 0.45 },
        ],
        links:
          t > 0.45
            ? [
                { id: 'x', from: 'a3', to: 'a1', state: 'down', label: 'interferes' },
                { id: 'y', from: 'a3', to: 'a2', state: 'down', label: 'interferes' },
              ]
            : [],
      }),
      aside: (t) => ({
        title: H('2.4 GHz ના channel', 'The 2.4 GHz channels'),
        caption: H('ત્રણ જ સાચે જુદા છે.', 'Only three are genuinely separate.'),
        head: ['channel', 'overlaps with'],
        rows: [
          ['1', 'nothing — safe'],
          ['6', 'nothing — safe'],
          ['11', 'nothing — safe'],
          ...(t > 0.45 ? [['3', '1 and 6 — never use it']] : []),
        ],
      }),
    },
    {
      ms: 3000,
      label: H('SSID નામ છે, નેટવર્ક નથી', 'An SSID is a name, not a network'),
      text: {
        beginner: {
          gu: 'SSID એ ફક્ત **નામ** છે જે AP પોકારે છે. દસ AP એક જ SSID પોકારી શકે — અને લેપટોપ માટે એ એક જ Wi-Fi લાગે, ઓરડે ઓરડે ફરતાં પણ. એની પાછળ VLAN અને subnet હોય, પણ વાપરનારને એની ખબર જ ન પડે.',
          en: 'An SSID is only the **name** an AP calls out. Ten APs can call out the same SSID, and to a laptop it feels like one Wi-Fi even as you walk from room to room. Behind it sits a VLAN and a subnet, and the person using it never finds out.',
        },
        exam: {
          gu: 'BSSID = એ એક AP ના રેડિયોનું MAC. SSID = નામ. ESS = એક જ SSID વાળા ઘણા AP, જેથી roaming થાય. Hidden SSID એ સુરક્ષા નથી — એ પહેલા frame માં જ ખુલ્લું દેખાય.',
          en: 'The BSSID is one radio’s MAC; the SSID is the name; an ESS is many APs sharing one SSID so that roaming works. Hiding an SSID is not security — it is visible in the first frame anyway.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'l', x: t < 0.5 ? 180 : 620, y: 320, type: 'laptop', label: 'laptop', sub: 'OFFICE-WIFI', accent: BEG, pulse: true },
          { id: 'a1', x: 250, y: 120, type: 'ap', label: 'AP 1', sub: 'OFFICE-WIFI', accent: t < 0.5 ? OK : MUTE },
          { id: 'a2', x: 600, y: 120, type: 'ap', label: 'AP 2', sub: 'OFFICE-WIFI', accent: t >= 0.5 ? OK : MUTE },
        ],
        links: [
          { id: 'a', from: 'l', to: 'a1', state: t < 0.5 ? 'up' : 'idle', flowing: t < 0.5 },
          { id: 'b', from: 'l', to: 'a2', state: t >= 0.5 ? 'up' : 'idle', flowing: t >= 0.5 },
        ],
      }),
      say: (t) =>
        t > 0.55 ? { nodeId: 'l', text: H('એ જ Wi-Fi લાગે છે', 'feels like the same Wi-Fi') } : null,
      aside: () => ({
        title: H('ત્રણ શબ્દ અલગ રાખો', 'Keep the three words apart'),
        head: ['word', 'what it actually is'],
        rows: [
          ['SSID', 'the name people see'],
          ['BSSID', 'one radio’s MAC address'],
          ['ESS', 'many APs sharing one SSID'],
        ],
      }),
    },
    {
      ms: 3200,
      label: H('દૂર જાઓ, ધીમું થાય', 'Walk away and it slows down'),
      text: {
        beginner: {
          gu: 'Wi-Fi તૂટતું નથી, એ **ધીમું** થાય. દૂર જતાં સંકેત નબળો પડે, એટલે ઉપકરણ અને AP સાથે મળીને ધીમી પણ ભરોસાપાત્ર ઝડપ પસંદ કરે. અને ધીમું ઉપકરણ હવા **લાંબો સમય** રોકે — એટલે એક દૂરનો લેપટોપ બધાને ધીમા કરી દે.',
          en: 'Wi-Fi does not break, it **slows**. Signal weakens with distance, so the device and the AP settle on a slower but reliable rate together. And a slow device holds the air for **longer** — which is how one distant laptop slows everybody down.',
        },
        exam: {
          gu: 'એને rate adaptation કહે છે, અને ધીમા client બધાની airtime ખાય એ problem ને airtime fairness કહેવાય. ઉકેલ: વધુ AP ઓછી power પર, એક AP વધુ power પર નહીં.',
          en: 'This is rate adaptation, and slow clients eating everyone’s airtime is the airtime fairness problem. The fix is more APs at lower power, not one AP turned up loud.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ap', x: 200, y: 200, type: 'ap', label: 'AP', accent: CCNP, pulse: true },
          { id: 'near', x: 420, y: 110, type: 'laptop', label: 'near', sub: '600 Mbps', accent: OK },
          { id: 'far', x: 760, y: 300, type: 'laptop', label: 'far away', sub: t > 0.4 ? '6 Mbps — hogging the air' : '6 Mbps', accent: t > 0.4 ? ERR : WARN, pulse: t > 0.4 },
        ],
        links: [
          { id: 'a', from: 'ap', to: 'near', state: t > 0.5 ? 'idle' : 'up', flowing: t <= 0.5, label: 'fast' },
          { id: 'b', from: 'ap', to: 'far', state: 'up', flowing: t > 0.4, label: 'slow' },
        ],
      }),
      say: (t) => (t > 0.6 ? { nodeId: 'near', text: H('હું ઝડપી છું, પણ રાહ જોઉં છું', 'I am fast, and still waiting') } : null),
      aside: () => ({
        title: H('હવા કોણે રોકી', 'Who is holding the air'),
        caption: H('ધીમું ઉપકરણ વધુ સમય લે.', 'The slow one takes longer.'),
        head: ['client', 'rate', 'airtime for 1 MB'],
        rows: [
          ['near', '600 Mbps', '~13 ms'],
          ['far away', '6 Mbps', '~1,300 ms'],
        ],
        notes: { 1: H('સો ગણો સમય — એ જ ખરી કિંમત', 'a hundred times longer — that is the real cost'),
        },
      }),
    },
    {
      ms: 2800,
      label: H('AP ની બે જાત', 'Two kinds of AP'),
      text: {
        beginner: {
          gu: 'Autonomous AP પોતે બધું સંભાળે — ઘર કે નાની દુકાન માટે ઠીક. Lightweight AP પોતે લગભગ કશું નક્કી ન કરે: એ controller ને પૂછે. પચાસ AP હોય તો બીજો રસ્તો જ નથી, કારણ channel અને power આખી ઇમારત જોઈને નક્કી કરવા પડે.',
          en: 'An autonomous AP handles everything itself, which is fine for a house or a small shop. A lightweight AP decides almost nothing on its own: it asks the controller. With fifty APs there is no other way, because channel and power have to be chosen by looking at the whole building at once.',
        },
        exam: {
          gu: 'Lightweight AP → WLC સાથે CAPWAP (UDP 5246 control, 5247 data). WLC ના RRM channel અને power આપોઆપ ગોઠવે. Cloud-managed અને embedded controller એ વચ્ચેના વિકલ્પ.',
          en: 'A lightweight AP reaches the WLC over CAPWAP (UDP 5246 for control, 5247 for data), and the WLC’s RRM sets channel and power automatically. Cloud-managed and embedded controllers sit in between.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'solo', x: 190, y: 120, type: 'ap', label: 'Autonomous', sub: 'decides for itself', accent: WARN },
          { id: 'w', x: 620, y: 290, type: 'server', label: 'Controller', accent: OK, pulse: t > 0.4 },
          { id: 'x1', x: 390, y: 150, type: 'ap', label: 'AP', sub: 'asks the controller', accent: CCNP },
          { id: 'x2', x: 390, y: 330, type: 'ap', label: 'AP', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'x1', to: 'w', state: 'up', flowing: t > 0.4, label: 'CAPWAP' },
          { id: 'b', from: 'x2', to: 'w', state: 'up', flowing: t > 0.4 },
        ],
      }),
      aside: () => ({
        title: H('કયું ક્યાં', 'Which one where'),
        head: ['kind', 'suits'],
        rows: [
          ['Autonomous', 'a house, one shop'],
          ['Lightweight + WLC', 'a floor, a building, a campus'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Wi-Fi વહેંચાયેલી હવા છે — હંમેશા half duplex, વારાફરતી. 2.4 GHz માં ફક્ત **1, 6, 11** વાપરો. SSID એ નામ છે, નેટવર્ક નહીં. દૂરનું ઉપકરણ ધીમી ઝડપે બોલે અને હવા લાંબો સમય રોકે, એટલે **વધુ AP ઓછી power પર** — એક AP મોટેથી નહીં.',
    en: 'Wi-Fi is shared air — always half duplex, always taking turns. In 2.4 GHz use only **1, 6 and 11**. An SSID is a name, not a network. A distant device talks slowly and holds the air for longer, so the answer is **more APs at lower power**, never one AP turned up loud.',
  },
  check: {
    q: H(
      'એક ઓરડામાં ત્રણ AP છે. કયા channel આપશો?',
      'Three APs share one room. Which channels do you give them?',
    ),
    options: [
      H('1, 6 અને 11', '1, 6 and 11'),
      H('1, 2 અને 3 — જુદા તો છે', '1, 2 and 3 — they are different, after all'),
      H('ત્રણેયને 6 — એક જ SSID છે', 'All three on 6 — it is one SSID'),
    ],
    answer: 0,
    explain: H(
      '2.4 GHz માં channel 20 MHz પહોળા છે પણ 5 MHz ને અંતરે બેસે છે, એટલે 1, 2, 3 એકબીજા પર ચડે. 1/6/11 જ સાચે જુદા છે. અને ત્રણેયને એક channel આપો તો ત્રણ AP એક જ હવા વહેંચે — એક AP જેટલી જ ઝડપ મળે.',
      'In 2.4 GHz the channels are 20 MHz wide but only 5 MHz apart, so 1, 2 and 3 sit on top of each other. Only 1/6/11 are truly separate. And putting all three on one channel makes three APs share one patch of air — you get the throughput of a single AP.',
    ),
  },
}
