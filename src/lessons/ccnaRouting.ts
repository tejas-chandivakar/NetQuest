import type { LessonSpec } from '../components/AnimatedLesson'
import type { ConfigureSpec } from '../components/ConfigureStage'
import { Network } from '../engine/network'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const WARN = 'var(--nq-warn)'
const H = (gu: string, hi: string, en: string) => ({ gu, hi, en })

/* ═══════════════════ n3l1 · reading the routing table ═══════════════════ */

const chain = (sub1?: string, sub2?: string) => [
  { id: 'pc1', x: 90, y: 200, type: 'pc' as const, label: 'PC1', sub: '10.1.1.10', accent: BEG },
  { id: 'r1', x: 330, y: 200, type: 'router' as const, label: 'R1', sub: sub1, accent: CCNA },
  { id: 'r2', x: 580, y: 200, type: 'router' as const, label: 'R2', sub: sub2, accent: CCNA },
  { id: 'pc2', x: 800, y: 200, type: 'pc' as const, label: 'PC2', sub: '10.2.2.10', accent: CCNP },
]

const chainLinks = [
  { id: 'a', from: 'pc1', to: 'r1', state: 'up' as const },
  { id: 'b', from: 'r1', to: 'r2', state: 'up' as const },
  { id: 'c', from: 'r2', to: 'pc2', state: 'up' as const },
]

export const n3l1: LessonSpec = {
  why: {
    gu: 'Troubleshooting માં તમે સૌથી વધુ વાર જે command ચલાવશો એ છે `show ip route`. એનું દરેક અક્ષર કંઈક કહે છે — અને એ વાંચતાં આવડે તો અડધી સમસ્યાઓ ત્યાં જ ઉકલી જાય.',
    hi: 'Troubleshooting में आप सबसे ज्यादा जो command चलाएंगे वह है `show ip route`। इसका हर अक्षर कुछ कहता है — और यह पढ़ना आ जाए तो आधी समस्याएं वहीं सुलझ जाती हैं।',
    en: 'The command you will run most often while troubleshooting is `show ip route`. Every character in its output is saying something, and reading it fluently settles half your problems on the spot.',
  },
  steps: [
    {
      ms: 2800,
      label: H('પહેલો અક્ષર — કોણે કહ્યું', 'पहला अक्षर — किसने कहा', 'The first letter — who said so'),
      text: {
        beginner: {
          gu: 'દરેક લીટીની શરૂઆતમાં એક અક્ષર છે, અને એ કહે છે કે **આ રસ્તાની ખબર ક્યાંથી પડી**. `C` એટલે સીધો જોડાયેલો, `S` એટલે તમે હાથે લખેલો, `O` એટલે OSPF એ શીખવ્યો. એ એક અક્ષર જ અડધી તપાસ પૂરી કરી દે છે.',
          hi: 'हर line की शुरुआत में एक अक्षर है, और वह बताता है कि **इस रास्ते का पता कहां से चला**। `C` यानी सीधा जुड़ा, `S` यानी आपने हाथ से लिखा, `O` यानी OSPF ने सिखाया। वह एक अक्षर ही आधी जांच पूरी कर देता है।',
          en: 'Every line opens with a letter, and it tells you **where this path came from**. `C` is directly attached, `S` is one you typed, `O` is one OSPF taught it. That single letter settles half of any investigation.',
        },
        exam: {
          gu: 'Codes: C connected, L local (/32 of the interface itself), S static, S* default, O OSPF, D EIGRP, R RIP, B BGP. `L` entries IOS 15 થી આવ્યા.',
          hi: 'Codes: C connected, L local (interface के खुद के /32), S static, S* default, O OSPF, D EIGRP, R RIP, B BGP। `L` entries IOS 15 से आए।',
          en: 'Codes: C connected, L local (the interface’s own /32), S static, S* default, O OSPF, D EIGRP, R RIP, B BGP. The `L` entries arrived with IOS 15.',
        },
      },
      scene: () => ({ nodes: chain('10.0.12.1'), links: chainLinks }),
      aside: () => ({
        title: H('R1 નું routing table', 'R1 की routing table', 'R1 routing table'),
        caption: H('પહેલો અક્ષર કહે છે કોણે શીખવ્યું.', 'पहला अक्षर बताता है किसने सिखाया।', 'The first letter says who taught it this.'),
        head: ['code', 'network', 'via'],
        rows: [
          ['C', '10.1.1.0/24', 'Gi0/0'],
          ['C', '10.0.12.0/30', 'Gi0/1'],
        ],
        notes: {
          0: H('સીધો જોડાયેલો — કોઈએ શીખવવું પડ્યું નથી', 'सीधा जुड़ा — किसी को सिखाना नहीं पड़ा', 'directly attached — nobody had to teach it'),
        },
      }),
    },
    {
      ms: 3000,
      label: H('હાથે લખેલો રસ્તો ઉમેરાય', 'हाथ से लिखा रास्ता जुड़ता है', 'A hand-written path appears'),
      text: {
        beginner: {
          gu: 'R1 પર `ip route 10.2.2.0 255.255.255.0 10.0.12.2` લખો અને એક નવી લીટી ઉમેરાય — પણ હવે અક્ષર `S` છે. એ કહે છે "આ મેં જાતે નથી શીખ્યો, કોઈએ મને કહ્યું છે".',
          hi: 'R1 पर `ip route 10.2.2.0 255.255.255.0 10.0.12.2` लिखें और एक नई line जुड़ती है — पर अब अक्षर `S` है। वह कहता है "यह मैंने खुद नहीं सीखा, किसी ने मुझे बताया है"।',
          en: 'Type `ip route 10.2.2.0 255.255.255.0 10.0.12.2` on R1 and a new line appears — but now the letter is `S`. It is saying "I did not learn this myself, somebody told me".',
        },
        exam: {
          gu: 'Static route table માં ત્યારે જ દેખાય જ્યારે એનો next hop reachable હોય. Next hop નો રસ્તો જતો રહે તો route આખું table માંથી ગાયબ થઈ જાય — એ ઘણાને ગૂંચવે છે.',
          hi: 'Static route table में तभी दिखता है जब उसका next hop reachable हो। Next hop का रास्ता चला जाए तो route पूरा table से गायब हो जाता है — यह कई लोगों को उलझाता है।',
          en: 'A static route only appears while its next hop is reachable. Lose the path to that next hop and the route vanishes from the table entirely, which surprises people.',
        },
      },
      scene: (t) => ({
        nodes: chain(t > 0.4 ? 'knows 10.2.2.0' : '10.0.12.1'),
        links: chainLinks,
      }),
      aside: (t) => ({
        title: H('R1 નું routing table', 'R1 की routing table', 'R1 routing table'),
        head: ['code', 'network', 'via'],
        rows: [
          ['C', '10.1.1.0/24', 'Gi0/0'],
          ['C', '10.0.12.0/30', 'Gi0/1'],
          ...(t > 0.4 ? [['S', '10.2.2.0/24', '10.0.12.2']] : []),
        ],
      }),
    },
    {
      ms: 3200,
      label: H('લાંબો prefix જીતે છે', 'लंबा prefix जीतता है', 'The longer prefix wins'),
      text: {
        beginner: {
          gu: 'ધારો કે table માં બંને છે: `10.2.0.0/16` અને `10.2.2.0/24`. Packet `10.2.2.10` માટે આવે તો **બંને મેળ ખાય છે**. Router કયો પસંદ કરે? જે **વધુ ચોક્કસ** હોય — એટલે લાંબો prefix. હંમેશા.',
          hi: 'मान लें table में दोनों हैं: `10.2.0.0/16` और `10.2.2.0/24`। Packet `10.2.2.10` के लिए आए तो **दोनों मेल खाते हैं**। Router कौन सा चुनेगा? जो **ज्यादा सटीक** हो — यानी लंबा prefix। हमेशा।',
          en: 'Suppose the table holds both `10.2.0.0/16` and `10.2.2.0/24`. A packet for `10.2.2.10` **matches both**. Which does the router take? The **more specific** one — the longer prefix. Always.',
        },
        exam: {
          gu: 'Longest-prefix match એ પહેલો નિયમ છે, અને એ administrative distance અને metric **બંનેથી ઉપર** છે. /24 એ /16 ને હરાવે ભલે /16 ની AD ઓછી હોય.',
          hi: 'Longest-prefix match पहला नियम है, और यह administrative distance और metric **दोनों से ऊपर** है। /24 /16 को हराता है भले /16 की AD कम हो।',
          en: 'Longest-prefix match is the first rule, and it sits **above** both administrative distance and metric. A /24 beats a /16 even when the /16 has the lower AD.',
        },
      },
      scene: (t) => ({
        nodes: chain('two matches'),
        links: chainLinks,
        packets: [
          { id: 'p', from: 'pc1', to: 'r1', t: 0.1 + ease(Math.min(1, t / 0.6)) * 0.8, color: 'var(--nq-pkt-data)', label: '→ 10.2.2.10' },
        ],
      }),
      say: (t) =>
        t > 0.55
          ? { nodeId: 'r1', text: H('/24 વધુ ચોક્કસ — એ જ લઉં', '/24 ज्यादा सटीक — वही लूंगा', 'the /24 is more specific — I take that') }
          : null,
      aside: (t) => ({
        title: H('કયો મેળ ખાય', 'कौन सा मेल खाता है', 'Which lines match'),
        caption: H('બંને મેળ ખાય છે. વધુ ચોક્કસ જીતે.', 'दोनों मेल खाते हैं। ज्यादा सटीक जीतता है।', 'Both match. The more specific one wins.'),
        head: ['code', 'network', 'match'],
        rows: [
          ['S', '10.2.0.0/16', t > 0.55 ? 'matches — but shorter' : 'matches'],
          ['S', '10.2.2.0/24', t > 0.55 ? 'matches — chosen ←' : 'matches'],
        ],
      }),
    },
    {
      ms: 2800,
      label: H('છેલ્લો આશરો', 'आखिरी सहारा', 'The last resort'),
      text: {
        beginner: {
          gu: '`S*  0.0.0.0/0` — તારા સાથેની આ લીટી કહે છે **"જે કશામાં મેળ ન ખાય એ બધું અહીં"**. એની લંબાઈ શૂન્ય છે, એટલે બીજો કોઈ પણ મેળ એને હરાવે. એટલે જ એને gateway of last resort કહે છે.',
          hi: '`S*  0.0.0.0/0` — तारे वाली यह line कहती है **"जो कुछ से मेल न खाए वह सब यहां"**। इसकी लंबाई शून्य है, इसलिए दूसरा कोई भी मेल इसे हराता है। इसीलिए इसे gateway of last resort कहते हैं।',
          en: '`S*  0.0.0.0/0` — the starred line that means **"anything matching nothing else goes here"**. Its length is zero, so any other match beats it. That is exactly why it is called the gateway of last resort.',
        },
        exam: {
          gu: 'Table ની ઉપર `Gateway of last resort is 10.0.12.2 to network 0.0.0.0` લખેલું દેખાય. એ ન દેખાય તો default route નથી, અને અજાણ્યા destinations drop થશે.',
          hi: 'Table के ऊपर `Gateway of last resort is 10.0.12.2 to network 0.0.0.0` लिखा दिखता है। वह न दिखे तो default route नहीं है, और अज्ञात destinations drop होंगे।',
          en: 'The table header reads `Gateway of last resort is 10.0.12.2 to network 0.0.0.0`. If that line is absent there is no default route, and unknown destinations are dropped.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc1', x: 110, y: 200, type: 'pc' as const, label: 'PC1', accent: BEG },
          { id: 'r1', x: 360, y: 200, type: 'router' as const, label: 'R1', sub: t > 0.3 ? '0.0.0.0/0 →' : undefined, accent: CCNA, pulse: t > 0.3 },
          { id: 'cl', x: 680, y: 200, type: 'cloud' as const, label: 'everything else', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'pc1', to: 'r1', state: 'up', flowing: t > 0.35 },
          { id: 'b', from: 'r1', to: 'cl', state: 'up', flowing: t > 0.5 },
        ],
        packets:
          t > 0.35
            ? [{ id: 'p', from: 'r1', to: 'cl', t: 0.1 + ease((t - 0.35) / 0.65) * 0.8, color: 'var(--nq-ok)', label: 'no match → default' }]
            : [],
      }),
      aside: () => ({
        title: H('R1 નું routing table', 'R1 की routing table', 'R1 routing table'),
        head: ['code', 'network', 'via'],
        rows: [
          ['C', '10.1.1.0/24', 'Gi0/0'],
          ['S', '10.2.2.0/24', '10.0.12.2'],
          ['S*', '0.0.0.0/0', '10.0.12.2'],
        ],
        notes: { 2: H('તારો = છેલ્લો આશરો', 'तारा = आखिरी सहारा', 'the star marks the last resort') },
      }),
    },
    {
      ms: 2800,
      label: H('ન દેખાય તો પહોંચાય નહીં', 'न दिखे तो पहुंच नहीं सकते', 'Absent here means unreachable'),
      text: {
        beginner: {
          gu: 'આ પાઠનો સૌથી કામનો નિયમ: **જે નેટવર્ક આ યાદીમાં નથી, ત્યાં router કદી packet મોકલશે નહીં.** Ping નિષ્ફળ જાય ત્યારે પહેલાં અહીં જુઓ — destination દેખાય છે? ન દેખાય તો સમસ્યા મળી ગઈ.',
          hi: 'इस पाठ का सबसे काम का नियम: **जो network इस सूची में नहीं है, वहां router कभी packet नहीं भेजेगा।** Ping असफल हो तो पहले यहां देखें — destination दिखता है? न दिखे तो समस्या मिल गई।',
          en: 'The most useful rule in this lesson: **a network that is not in this list will never receive a packet from this router.** When a ping fails, look here first. Is the destination listed? If not, you have already found the problem.',
        },
        exam: {
          gu: 'Troubleshooting ક્રમ: `show ip interface brief` (પોર્ટ ઊભા છે?) → `show ip route` (રસ્તો છે?) → `ping` (બંને દિશામાં ચાલે છે?). લગભગ દરેક સમસ્યા આ ત્રણમાં પકડાય.',
          hi: 'Troubleshooting क्रम: `show ip interface brief` (port खड़े हैं?) → `show ip route` (रास्ता है?) → `ping` (दोनों दिशाओं में चलता है?)। लगभग हर समस्या इन तीनों में पकड़ी जाती है।',
          en: 'The order to work in: `show ip interface brief` (are the ports up?) → `show ip route` (is there a path?) → `ping` (does it work both ways?). Nearly every fault is caught by those three.',
        },
      },
      scene: () => ({
        nodes: chain('no route to 10.3.3.0'),
        links: chainLinks,
        packets: [{ id: 'x', from: 'pc1', to: 'r1', t: 0.75, color: 'var(--nq-err)', label: 'dropped ✕' }],
      }),
      say: () => ({ nodeId: 'r1', text: H('એ યાદીમાં નથી', 'वह सूची में नहीं', 'it is not in my list') }),
    },
  ],
  takeaway: {
    gu: 'પહેલો અક્ષર કહે છે કોણે શીખવ્યું — `C` જોડાયેલો, `S` તમે લખ્યો, `O` OSPF. લાંબો prefix હંમેશા જીતે, AD અને metric કરતાં પણ ઉપર. `0.0.0.0/0` છેલ્લો આશરો. અને સૌથી કામનું: **યાદીમાં ન હોય એ નેટવર્ક સુધી કદી પહોંચાય નહીં.**',
    hi: 'पहला अक्षर बताता है किसने सिखाया — `C` जुड़ा, `S` आपने लिखा, `O` OSPF। लंबा prefix हमेशा जीतता है, AD और metric से भी ऊपर। `0.0.0.0/0` आखिरी सहारा। और सबसे काम का: **सूची में न हो वह network तक कभी पहुंच नहीं सकते।**',
    en: 'The first letter says who taught it: `C` attached, `S` typed by you, `O` from OSPF. The longer prefix always wins, above both AD and metric. `0.0.0.0/0` is the last resort. And most usefully of all: **a network absent from this list can never be reached.**',
  },
  check: {
    q: H(
      'Table માં `10.2.0.0/16 via A` અને `10.2.2.0/24 via B` બંને છે. Packet `10.2.2.50` માટે ક્યાં જશે?',
      'Table में `10.2.0.0/16 via A` और `10.2.2.0/24 via B` दोनों हैं। Packet `10.2.2.50` के लिए कहां जाएगा?',
      'The table holds both `10.2.0.0/16 via A` and `10.2.2.0/24 via B`. Where does a packet for `10.2.2.50` go?',
    ),
    options: [
      H('B તરફ — /24 વધુ ચોક્કસ છે', 'B की तरफ — /24 ज्यादा सटीक है', 'Toward B — the /24 is more specific'),
      H('A તરફ — એ પહેલાં લખાયેલો છે', 'A की तरफ — वह पहले लिखा गया', 'Toward A — it was entered first'),
      H('બંને તરફ વારાફરતી', 'दोनों तरफ बारी-बारी', 'Alternating between both'),
    ],
    answer: 0,
    explain: H(
      'Longest-prefix match પહેલો નિયમ છે. `/24` એ `/16` કરતાં વધુ ચોક્કસ છે, એટલે એ જીતે — ભલે બીજો રસ્તો જૂનો હોય કે એની AD ઓછી હોય.',
      'Longest-prefix match पहला नियम है। `/24` `/16` से ज्यादा सटीक है, इसलिए वह जीतता है — भले दूसरा रास्ता पुराना हो या उसकी AD कम हो।',
      'Longest-prefix match is the first rule. The `/24` is more specific than the `/16`, so it wins — regardless of which was entered first or which has the lower AD.',
    ),
  },
}

/* ═══════════════════ n3l2 · administrative distance ═══════════════════ */

export const n3l2: LessonSpec = {
  why: {
    gu: 'એક જ નેટવર્ક સુધી બે protocol બે અલગ રસ્તા બતાવે તો router કોનું માને? આ પાઠ એ નિર્ણય સમજાવે છે — અને સાથે એ પણ કે **metric અને AD સાવ અલગ વસ્તુ છે**, જે ઘણા ભેળવી દે છે.',
    hi: 'एक ही network तक दो protocol दो अलग रास्ते बताएं तो router किसकी माने? यह पाठ वह निर्णय समझाता है — और साथ यह भी कि **metric और AD बिल्कुल अलग चीजें हैं**, जिन्हें कई लोग मिला देते हैं।',
    en: 'When two protocols offer two different paths to the same network, whom does the router believe? This lesson is that decision — and it also separates **metric from administrative distance**, which many people quietly conflate.',
  },
  steps: [
    {
      ms: 2800,
      label: H('બે protocol, એક જ મંઝિલ', 'दो protocol, एक ही मंजिल', 'Two protocols, one destination'),
      text: {
        beginner: {
          gu: 'R1 પર OSPF અને EIGRP બંને ચાલે છે, અને બંને `10.3.3.0` સુધીનો રસ્તો જાણે છે — પણ **જુદા રસ્તા**. Router બંને table માં ન રાખી શકે. એકે જીતવું પડે.',
          hi: 'R1 पर OSPF और EIGRP दोनों चलते हैं, और दोनों `10.3.3.0` तक का रास्ता जानते हैं — पर **अलग रास्ते**। Router दोनों को table में नहीं रख सकता। एक को जीतना ही पड़ेगा।',
          en: 'R1 runs both OSPF and EIGRP, and both know a way to `10.3.3.0` — but **different ways**. The router cannot keep both in the table. One has to win.',
        },
        exam: {
          gu: 'એક જ prefix માટે બહુવિધ sources હોય ત્યારે routing table માં ફક્ત સૌથી ભરોસાપાત્ર source નો route જાય. બાકીના protocol ના database માં રહે પણ table માં નહીં.',
          hi: 'एक ही prefix के लिए कई sources हों तो routing table में केवल सबसे भरोसेमंद source का route जाता है। बाकी protocol के database में रहते हैं पर table में नहीं।',
          en: 'When one prefix has several sources, only the most trusted one reaches the routing table. The others stay in their protocol’s own database but never make it in.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r1', x: 160, y: 200, type: 'router' as const, label: 'R1', accent: CCNA, pulse: t > 0.5 },
          { id: 'o', x: 460, y: 100, type: 'router' as const, label: 'via OSPF', sub: '3 hops', accent: CCNP },
          { id: 'e', x: 460, y: 320, type: 'router' as const, label: 'via EIGRP', sub: '5 hops', accent: WARN },
          { id: 'd', x: 740, y: 200, type: 'switch' as const, label: '10.3.3.0', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'r1', to: 'o', state: 'up' },
          { id: 'b', from: 'r1', to: 'e', state: 'up' },
          { id: 'c', from: 'o', to: 'd', state: 'up' },
          { id: 'e2', from: 'e', to: 'd', state: 'up' },
        ],
      }),
      aside: () => ({
        title: H('બંને જાણે છે', 'दोनों जानते हैं', 'Both know a way'),
        head: ['source', 'network', 'via'],
        rows: [
          ['OSPF', '10.3.3.0/24', '3 hops away'],
          ['EIGRP', '10.3.3.0/24', '5 hops away'],
        ],
      }),
    },
    {
      ms: 3000,
      label: H('ભરોસાનો ક્રમ', 'भरोसे का क्रम', 'A ladder of trust'),
      text: {
        beginner: {
          gu: 'દરેક source ને એક **ભરોસાનો આંકડો** મળેલો છે — administrative distance. **ઓછો એટલે વધુ ભરોસાપાત્ર.** સીધો જોડાયેલો 0 (એથી વધુ ખાતરી શું?), તમે હાથે લખેલો 1, EIGRP 90, OSPF 110, RIP 120.',
          hi: 'हर source को एक **भरोसे का अंक** मिला है — administrative distance। **कम यानी ज्यादा भरोसेमंद।** सीधा जुड़ा 0 (इससे ज्यादा निश्चितता क्या?), आपने हाथ से लिखा 1, EIGRP 90, OSPF 110, RIP 120।',
          en: 'Each source carries a **trust number** — its administrative distance. **Lower means more trusted.** Directly attached is 0 (what could be more certain?), a route you typed is 1, EIGRP is 90, OSPF 110, RIP 120.',
        },
        exam: {
          gu: 'Connected 0, Static 1, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, External EIGRP 170, iBGP 200, Unknown 255 (કદી ન વપરાય).',
          hi: 'Connected 0, Static 1, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, External EIGRP 170, iBGP 200, Unknown 255 (कभी इस्तेमाल न हो)।',
          en: 'Connected 0, static 1, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, external EIGRP 170, iBGP 200, and 255 meaning unusable.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r1', x: 160, y: 200, type: 'router' as const, label: 'R1', accent: CCNA },
          { id: 'o', x: 460, y: 100, type: 'router' as const, label: 'OSPF', sub: 'AD 110', accent: t > 0.5 ? 'var(--nq-text-mute)' : CCNP },
          { id: 'e', x: 460, y: 320, type: 'router' as const, label: 'EIGRP', sub: 'AD 90', accent: t > 0.5 ? 'var(--nq-ok)' : WARN, pulse: t > 0.5 },
          { id: 'd', x: 740, y: 200, type: 'switch' as const, label: '10.3.3.0', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'r1', to: 'o', state: t > 0.5 ? 'idle' : 'up' },
          { id: 'b', from: 'r1', to: 'e', state: 'up', flowing: t > 0.5 },
          { id: 'c', from: 'o', to: 'd', state: t > 0.5 ? 'idle' : 'up' },
          { id: 'e2', from: 'e', to: 'd', state: 'up', flowing: t > 0.5 },
        ],
      }),
      say: (t) =>
        t > 0.5 ? { nodeId: 'e', text: H('90 < 110 — હું જીત્યો', '90 < 110 — मैं जीता', '90 beats 110 — I win') } : null,
      aside: () => ({
        title: H('ભરોસાનો ક્રમ', 'भरोसे का क्रम', 'The ladder of trust'),
        caption: H('ઓછો આંકડો એટલે વધુ ભરોસો.', 'कम अंक यानी ज्यादा भरोसा।', 'A lower number means more trust.'),
        head: ['source', 'AD'],
        rows: [
          ['Connected', '0'],
          ['Static', '1'],
          ['EIGRP', '90'],
          ['OSPF', '110'],
          ['RIP', '120'],
        ],
      }),
    },
    {
      ms: 3200,
      label: H('પણ EIGRP નો રસ્તો લાંબો હતો!', 'पर EIGRP का रास्ता लंबा था!', 'But EIGRP’s path was the longer one'),
      text: {
        beginner: {
          gu: 'અહીં જ ચોંકાવનારી વાત છે. OSPF નો રસ્તો 3 hops નો હતો અને EIGRP નો 5 — **તોય EIGRP જીત્યો**. કારણ કે AD પહેલાં જોવાય છે. Router એમ કહે છે "હું EIGRP પર વધુ ભરોસો કરું છું, એટલે એનો રસ્તો લઈશ, ભલે લાંબો હોય."',
          hi: 'यहीं चौंकाने वाली बात है। OSPF का रास्ता 3 hops का था और EIGRP का 5 — **फिर भी EIGRP जीता**। क्योंकि AD पहले देखी जाती है। Router कहता है "मैं EIGRP पर ज्यादा भरोसा करता हूं, इसलिए उसका रास्ता लूंगा, भले लंबा हो।"',
          en: 'Here is the part that startles people. OSPF’s path was three hops and EIGRP’s was five — **and EIGRP still won**. Because AD is consulted first. The router is saying "I trust EIGRP more, so I will take its path even though it is longer."',
        },
        exam: {
          gu: 'AD એ *source* ની પસંદગી છે, metric એ એ source ની *અંદર* રસ્તાની પસંદગી. બે અલગ protocol ના metrics સરખાવાય જ નહીં — એકમ જ અલગ છે.',
          hi: 'AD *source* की पसंद है, metric उस source के *अंदर* रास्ते की पसंद। दो अलग protocol के metrics तुलना किए ही नहीं जा सकते — इकाई ही अलग है।',
          en: 'AD chooses the *source*; metric chooses the path *within* that source. Metrics from two different protocols are never compared — they are not even in the same units.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'o', x: 220, y: 140, type: 'router' as const, label: 'OSPF · 3 hops', sub: 'AD 110 — lost', accent: 'var(--nq-text-mute)' },
          { id: 'e', x: 220, y: 300, type: 'router' as const, label: 'EIGRP · 5 hops', sub: 'AD 90 — won', accent: 'var(--nq-ok)', pulse: true },
          { id: 'd', x: 650, y: 220, type: 'switch' as const, label: '10.3.3.0', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'o', to: 'd', state: 'idle' },
          { id: 'b', from: 'e', to: 'd', state: 'up', flowing: true },
        ],
      }),
      aside: () => ({
        title: H('ક્રમ યાદ રાખો', 'क्रम याद रखें', 'The order of questions'),
        caption: H('ઉપરથી નીચે, એક પછી એક.', 'ऊपर से नीचे, एक के बाद एक।', 'Top to bottom, one at a time.'),
        head: ['#', 'question'],
        rows: [
          ['1', 'longest prefix?'],
          ['2', 'lowest AD?'],
          ['3', 'lowest metric?'],
        ],
        notes: {
          2: H('metric ત્યારે જ, જ્યારે એક જ protocol ના બે રસ્તા હોય', 'metric तभी, जब एक ही protocol के दो रास्ते हों', 'metric only decides between two paths from the same protocol'),
        },
      }),
    },
    {
      ms: 2800,
      label: H('AD બદલી પણ શકાય', 'AD बदली भी जा सकती है', 'AD can be changed'),
      text: {
        beginner: {
          gu: 'Static route ની AD સામાન્ય રીતે 1 છે, એટલે એ લગભગ બધાને હરાવે. પણ `ip route ... 200` લખીને એને **ઇરાદાપૂર્વક નબળો** બનાવી શકાય. એ યુક્તિનો ઉપયોગ આગળના પાઠમાં — backup રસ્તો બનાવવા માટે.',
          hi: 'Static route की AD आमतौर पर 1 होती है, इसलिए वह लगभग सबको हराती है। पर `ip route ... 200` लिखकर उसे **जानबूझकर कमजोर** बनाया जा सकता है। उस तरकीब का उपयोग अगले पाठ में — backup रास्ता बनाने के लिए।',
          en: 'A static route normally has AD 1, so it beats almost everything. But writing `ip route ... 200` makes it **deliberately weak**. That trick is what the next lesson uses to build a backup path.',
        },
        exam: {
          gu: '`ip route <net> <mask> <next-hop> <distance>` — છેલ્લો આંકડો AD છે. એને floating static route કહે છે, અને એ મુખ્ય route જતો રહે ત્યારે જ table માં આવે.',
          hi: '`ip route <net> <mask> <next-hop> <distance>` — आखिरी अंक AD है। इसे floating static route कहते हैं, और यह मुख्य route के जाने पर ही table में आता है।',
          en: '`ip route <net> <mask> <next-hop> <distance>` — that last number is the AD. It is called a floating static route, and it only enters the table once the primary route disappears.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r1', x: 430, y: 200, type: 'router' as const, label: 'R1', sub: t > 0.4 ? 'static AD 200' : 'static AD 1', accent: CCNA, pulse: t > 0.4 },
        ],
      }),
      aside: (t) => ({
        title: H('એ જ રસ્તો, બીજો ભરોસો', 'वही रास्ता, अलग भरोसा', 'Same path, different trust'),
        head: ['command', 'AD', 'effect'],
        rows: [
          ['ip route ... 10.0.12.2', '1', 'beats OSPF'],
          ...(t > 0.4 ? [['ip route ... 10.0.12.2 200', '200', 'loses to OSPF — waits in reserve']] : []),
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Router ત્રણ સવાલ આ ક્રમે પૂછે: **લાંબો prefix? → ઓછી AD? → ઓછી metric?** AD કહે છે કોના પર ભરોસો કરવો, metric કહે છે એ ભરોસાની અંદર કયો રસ્તો સારો. એટલે ઓછી AD વાળો લાંબો રસ્તો પણ જીતી જાય.',
    hi: 'Router तीन सवाल इस क्रम में पूछता है: **लंबा prefix? → कम AD? → कम metric?** AD बताती है किस पर भरोसा करें, metric बताती है उस भरोसे के अंदर कौन सा रास्ता अच्छा। इसलिए कम AD वाला लंबा रास्ता भी जीत जाता है।',
    en: 'A router asks three questions in order: **longest prefix? → lowest AD? → lowest metric?** AD decides whom to trust; metric decides which path within that trust. Which is why a longer path from a more-trusted source still wins.',
  },
  check: {
    q: H(
      'OSPF `10.5.0.0/16` જાણે છે અને RIP એ જ નેટવર્કનો `/24` જાણે છે. Packet `10.5.1.1` માટે કોણ જીતે?',
      'OSPF `10.5.0.0/16` जानता है और RIP उसी network का `/24` जानता है। Packet `10.5.1.1` के लिए कौन जीतेगा?',
      'OSPF knows `10.5.0.0/16` and RIP knows a `/24` inside it. For a packet to `10.5.1.1`, which wins?',
    ),
    options: [
      H('RIP — કારણ કે એનો prefix લાંબો છે', 'RIP — क्योंकि इसका prefix लंबा है', 'RIP — because its prefix is longer'),
      H('OSPF — કારણ કે એની AD ઓછી છે', 'OSPF — क्योंकि इसकी AD कम है', 'OSPF — because its AD is lower'),
      H('બંને table માં રહેશે', 'दोनों table में रहेंगे', 'Both stay in the table'),
    ],
    answer: 0,
    explain: H(
      'AD ત્યારે જ જોવાય જ્યારે **એક જ prefix** માટે બે sources હોય. અહીં prefix અલગ છે, એટલે પહેલો નિયમ લાગુ પડે — લાંબો જીતે. RIP ની AD 120 હોવા છતાં.',
      'AD तभी देखी जाती है जब **एक ही prefix** के लिए दो sources हों। यहां prefix अलग हैं, इसलिए पहला नियम लागू होता है — लंबा जीतता है। RIP की AD 120 होने के बावजूद।',
      'AD is only consulted when two sources offer the **same prefix**. Here the prefixes differ, so the first rule applies and the longer one wins — despite RIP’s AD of 120.',
    ),
  },
}

/* ═══════════════════ n3l4 · floating static routes ═══════════════════ */

function floatLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1', 'Gi0/2'] })
  n.addDevice({ id: 'r2', name: 'R2', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'r3', name: 'R3', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'srv', name: 'SRV', kind: 'server', ifaces: ['e0'] })
  const s = n.get('srv')!.iface('e0')!
  s.ip = '10.9.9.9'
  s.mask = '255.255.255.0'
  n.get('srv')!.defaultGateway = '10.9.9.1'

  n.addDevice({ id: 'sw9', name: 'SW9', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  n.connect('r1', 'Gi0/1', 'r2', 'Gi0/0')
  n.connect('r1', 'Gi0/2', 'r3', 'Gi0/0')
  n.connect('r2', 'Gi0/1', 'sw9', 'Fa0/1')
  n.connect('r3', 'Gi0/1', 'sw9', 'Fa0/2')
  n.connect('srv', 'e0', 'sw9', 'Fa0/3')

  const addr = (id: string, ifn: string, ip: string, mask: string) => {
    const i = n.get(id)!.iface(ifn)!
    i.ip = ip
    i.mask = mask
    i.shutdown = false
  }
  addr('r1', 'Gi0/1', '10.0.12.1', '255.255.255.252')
  addr('r2', 'Gi0/0', '10.0.12.2', '255.255.255.252')
  addr('r1', 'Gi0/2', '10.0.13.1', '255.255.255.252')
  addr('r3', 'Gi0/0', '10.0.13.2', '255.255.255.252')
  addr('r2', 'Gi0/1', '10.9.9.1', '255.255.255.0')
  addr('r3', 'Gi0/1', '10.9.9.2', '255.255.255.0')
  return n
}

export const n3l4Config: ConfigureSpec = {
  build: floatLab,
  viewBox: { w: 880, h: 360 },
  layout: [
    { id: 'r1', x: 120, y: 180, type: 'router' },
    { id: 'r2', x: 430, y: 70, type: 'router', accent: 'var(--nq-ok)' },
    { id: 'r3', x: 430, y: 290, type: 'router', accent: 'var(--nq-warn)' },
    { id: 'sw9', x: 630, y: 180, type: 'switch' },
    { id: 'srv', x: 800, y: 180, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  terminals: ['r1'],
  success: H(
    'બે રસ્તા ગોઠવાયા, પણ એક સમયે એક જ વપરાય છે. મુખ્ય રસ્તો તૂટે તો backup આપોઆપ table માં આવી જશે — અને તમારે કશું કરવું નહીં પડે.',
    'दो रास्ते सेट हुए, पर एक समय में एक ही इस्तेमाल होता है। मुख्य रास्ता टूटे तो backup अपने आप table में आ जाएगा — और आपको कुछ नहीं करना पड़ेगा।',
    'Two paths are in place but only one is ever in use. Lose the primary and the backup slides into the table on its own, with nothing for you to do.',
  ),
  tasks: [
    {
      id: 'primary',
      instruction: H(
        'R2 થઈને `10.9.9.0/24` સુધીનો મુખ્ય રસ્તો લખો',
        'R2 के जरिए `10.9.9.0/24` तक का मुख्य रास्ता लिखें',
        'Write the primary path to `10.9.9.0/24` through R2',
      ),
      why: H(
        'R2 વાળી લિંક ઝડપી છે, એટલે સામાન્ય સંજોગોમાં traffic ત્યાંથી જ જવું જોઈએ. આ સાદો static route છે — કોઈ ખાસ આંકડો નહીં.',
        'R2 वाली link तेज है, इसलिए सामान्य परिस्थिति में traffic वहीं से जाना चाहिए। यह साधारण static route है — कोई खास अंक नहीं।',
        'The link through R2 is the faster one, so under normal conditions traffic should take it. This is an ordinary static route with no extra number on the end.',
      ),
      hints: [
        H('R2 નું next-hop સરનામું `10.0.12.2` છે.', 'R2 का next-hop पता `10.0.12.2` है।', 'R2’s next-hop address is `10.0.12.2`.'),
        H('ip route <network> <mask> <next-hop>', 'ip route <network> <mask> <next-hop>', 'ip route <network> <mask> <next-hop>'),
        H('ip route 10.9.9.0 255.255.255.0 10.0.12.2', 'ip route 10.9.9.0 255.255.255.0 10.0.12.2', 'ip route 10.9.9.0 255.255.255.0 10.0.12.2'),
      ],
      check: (n) =>
        !!n.get('r1')?.staticRoutes.find((r) => r.prefix === '10.9.9.0' && r.nextHop === '10.0.12.2' && r.ad <= 1),
      done: H('મુખ્ય રસ્તો table માં છે', 'मुख्य रास्ता table में है', 'The primary path is in the table'),
    },
    {
      id: 'backup',
      instruction: H(
        'R3 થઈને એ જ નેટવર્કનો backup રસ્તો લખો — AD 200 સાથે',
        'R3 के जरिए उसी network का backup रास्ता लिखें — AD 200 के साथ',
        'Write a backup to the same network through R3, with AD 200',
      ),
      why: H(
        'સાદો static route લખશો તો બંનેની AD 1 થશે અને traffic વહેંચાઈ જશે — એ નથી જોઈતું. AD મોટી રાખો એટલે આ રસ્તો **રાહ જોતો બેસી રહે**, અને મુખ્ય જાય ત્યારે જ આગળ આવે.',
        'साधारण static route लिखें तो दोनों की AD 1 होगी और traffic बंट जाएगा — यह नहीं चाहिए। AD बड़ी रखें ताकि यह रास्ता **इंतजार करता बैठा रहे**, और मुख्य जाने पर ही आगे आए।',
        'An ordinary static route would give both an AD of 1 and the traffic would split, which is not what you want. A higher AD makes this one **sit and wait**, stepping forward only when the primary goes.',
      ),
      hints: [
        H('એ જ command, પણ છેડે એક આંકડો ઉમેરો.', 'वही command, पर आखिर में एक अंक जोड़ें।', 'The same command, with one more number on the end.'),
        H('ip route <network> <mask> <next-hop> <AD>', 'ip route <network> <mask> <next-hop> <AD>', 'ip route <network> <mask> <next-hop> <AD>'),
        H('ip route 10.9.9.0 255.255.255.0 10.0.13.2 200', 'ip route 10.9.9.0 255.255.255.0 10.0.13.2 200', 'ip route 10.9.9.0 255.255.255.0 10.0.13.2 200'),
      ],
      check: (n) =>
        !!n.get('r1')?.staticRoutes.find((r) => r.prefix === '10.9.9.0' && r.nextHop === '10.0.13.2' && r.ad >= 2),
      done: H('Backup ગોઠવાયો — પણ હજી વપરાતો નથી', 'Backup सेट हुआ — पर अभी इस्तेमाल नहीं हो रहा', 'The backup is in place, and is not being used'),
    },
    {
      id: 'verify',
      instruction: H(
        'ચકાસો કે table માં ફક્ત મુખ્ય રસ્તો દેખાય છે',
        'जांचें कि table में केवल मुख्य रास्ता दिख रहा है',
        'Check that only the primary path shows in the table',
      ),
      why: H(
        'આ જ floating static ની ખૂબી છે: બંને લખ્યા હોવા છતાં **table માં એક જ દેખાય**. બીજો ગાયબ નથી — એ ફક્ત ઓછો ભરોસાપાત્ર હોવાથી બાજુ પર ઊભો છે.',
        'यही floating static की खासियत है: दोनों लिखे होने पर भी **table में एक ही दिखता है**। दूसरा गायब नहीं — वह बस कम भरोसेमंद होने से किनारे खड़ा है।',
        'This is the whole point of a floating static: both are configured yet **only one appears in the table**. The other is not gone — it is simply less trusted, waiting at the side.',
      ),
      hints: [
        H('Routing table જોવાનો command.', 'Routing table देखने का command।', 'The command that shows the routing table.'),
        H('`do show ip route` config mode માંથી પણ ચાલે.', '`do show ip route` config mode से भी चलता है।', '`do show ip route` works from config mode too.'),
        H('do show ip route', 'do show ip route', 'do show ip route'),
      ],
      check: (n) => n.ping('r1', '10.9.9.9').ok,
      done: H('મુખ્ય રસ્તે પહોંચે છે', 'मुख्य रास्ते से पहुंच रहा है', 'It reaches, by the primary path'),
    },
  ],
}

/* ═══════════════════ n3l4 · default and floating statics ═══════════════════ */

export const n3l4: LessonSpec = {
  why: {
    gu: 'દુનિયાના દરેક નેટવર્કનો રસ્તો લખવો અશક્ય છે — એટલે એક લીટી લખાય જે કહે "બાકીનું બધું આ તરફ". અને મુખ્ય લિંક તૂટે ત્યારે આપોઆપ બીજી ચાલુ થાય એ ગોઠવણ એ જ વિચારનું બીજું રૂપ છે.',
    hi: 'दुनिया के हर network का रास्ता लिखना असंभव है — इसलिए एक line लिखी जाती है जो कहे "बाकी सब इस तरफ"। और मुख्य link टूटे तो अपने आप दूसरी चालू हो जाए यह व्यवस्था उसी विचार का दूसरा रूप है।',
    en: 'Writing a route to every network on earth is impossible, so you write one line meaning "everything else goes that way". And the arrangement that switches to a second link when the first fails is the same idea wearing another hat.',
  },
  steps: [
    {
      ms: 2800,
      label: H('એક લીટી, આખી દુનિયા', 'एक line, पूरी दुनिया', 'One line, the whole world'),
      text: {
        beginner: {
          gu: '`ip route 0.0.0.0 0.0.0.0 203.0.113.1` — આ એક લીટી કહે છે **"જે મારા પોતાના નેટવર્કમાં નથી એ બધું ISP તરફ મોકલ"**. Mask માં એકેય 1 નથી, એટલે એ બધાને મેળ ખાય છે — પણ સૌથી નબળી રીતે.',
          hi: '`ip route 0.0.0.0 0.0.0.0 203.0.113.1` — यह एक line कहती है **"जो मेरे अपने network में नहीं है वह सब ISP की तरफ भेज"**। Mask में एक भी 1 नहीं है, इसलिए यह सबसे मेल खाती है — पर सबसे कमजोर तरीके से।',
          en: '`ip route 0.0.0.0 0.0.0.0 203.0.113.1` — this one line says **"anything that is not on my own networks, send it to the ISP"**. The mask has no ones in it at all, so it matches everything — but in the weakest possible way.',
        },
        exam: {
          gu: 'Default route ને quad-zero route પણ કહે છે. Table માં `S*` તરીકે દેખાય અને `Gateway of last resort` લીટી ઉમેરાય. Stub સાઇટ પર આ એક જ route પૂરતો છે.',
          hi: 'Default route को quad-zero route भी कहते हैं। Table में `S*` के रूप में दिखता है और `Gateway of last resort` line जुड़ती है। Stub site पर यह एक ही route काफी है।',
          en: 'The default route is also called the quad-zero route. It shows as `S*` and adds the `Gateway of last resort` line. On a stub site this single route is all you need.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc', x: 110, y: 200, type: 'pc' as const, label: 'PC', accent: BEG },
          { id: 'r1', x: 370, y: 200, type: 'router' as const, label: 'R1', sub: '0.0.0.0/0 →', accent: CCNA, pulse: t > 0.3 },
          { id: 'isp', x: 700, y: 200, type: 'cloud' as const, label: 'ISP', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'pc', to: 'r1', state: 'up' as const, flowing: t > 0.25 },
          { id: 'b', from: 'r1', to: 'isp', state: 'up' as const, flowing: t > 0.45 },
        ],
        packets:
          t > 0.45
            ? [{ id: 'p', from: 'r1', to: 'isp', t: 0.1 + ease((t - 0.45) / 0.55) * 0.8, color: 'var(--nq-pkt-data)', label: '→ 8.8.8.8' }]
            : [],
      }),
      aside: () => ({
        title: H('R1 નું routing table', 'R1 की routing table', 'R1 routing table'),
        head: ['code', 'network', 'via'],
        rows: [
          ['C', '192.168.1.0/24', 'Gi0/0'],
          ['S*', '0.0.0.0/0', '203.0.113.1'],
        ],
        notes: { 1: H('બાકીનું બધું — છેલ્લો આશરો', 'बाकी सब — आखिरी सहारा', 'everything else — the last resort') },
      }),
    },
    {
      ms: 3000,
      label: H('બે લિંક, પણ એક જ વપરાય', 'दो link, पर एक ही इस्तेमाल', 'Two links, one in use'),
      text: {
        beginner: {
          gu: 'સાઇટ પર બે ISP છે — એક ઝડપી fibre, એક ધીમું 4G. બંનેનો default route લખો તો traffic વહેંચાઈ જશે અને મોંઘા 4G પર પણ જશે. એ નથી જોઈતું. જોઈએ છે: **fibre ચાલે ત્યાં સુધી 4G અડે પણ નહીં**.',
          hi: 'Site पर दो ISP हैं — एक तेज fibre, एक धीमा 4G। दोनों का default route लिखें तो traffic बंट जाएगा और महंगे 4G पर भी जाएगा। यह नहीं चाहिए। चाहिए: **fibre चले तब तक 4G को छुए भी नहीं**।',
          en: 'The site has two ISPs — fast fibre and slow 4G. Write a default route for each and the traffic splits, putting some of it on the expensive 4G. That is not what you want. What you want is: **while the fibre is up, nothing touches the 4G**.',
        },
        exam: {
          gu: 'સરખી AD વાળા બે static routes equal-cost load balancing કરાવે. એ WAN failover માટે લગભગ હંમેશા ખોટું હોય છે.',
          hi: 'समान AD वाले दो static routes equal-cost load balancing करवाते हैं। यह WAN failover के लिए लगभग हमेशा गलत होता है।',
          en: 'Two static routes with the same AD produce equal-cost load balancing, which is nearly always the wrong thing for WAN failover.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'r1', x: 160, y: 200, type: 'router' as const, label: 'R1', accent: CCNA },
          { id: 'f', x: 500, y: 100, type: 'cloud' as const, label: 'Fibre', sub: 'fast', accent: 'var(--nq-ok)' },
          { id: 'g', x: 500, y: 310, type: 'cloud' as const, label: '4G', sub: 'slow, costly', accent: WARN },
        ],
        links: [
          { id: 'a', from: 'r1', to: 'f', state: 'up' as const, flowing: true },
          { id: 'b', from: 'r1', to: 'g', state: 'up' as const, flowing: true },
        ],
      }),
      say: () => ({ nodeId: 'r1', text: H('બંને સરખા? તો બંને વાપરું', 'दोनों समान? तो दोनों इस्तेमाल करूंगा', 'equal? then I use both') }),
    },
    {
      ms: 3200,
      label: H('બીજાને ઇરાદાપૂર્વક નબળો કરો', 'दूसरे को जानबूझकर कमजोर करें', 'Make the second one deliberately weak'),
      text: {
        beginner: {
          gu: '4G વાળી લીટીના છેડે એક આંકડો ઉમેરો: `... 200`. હવે એની AD 200 છે અને fibre ની 1. Router બંને જાણે છે પણ **table માં ફક્ત fibre મૂકે છે**. 4G બાજુ પર ઊભું રહીને રાહ જુએ છે.',
          hi: '4G वाली line के आखिर में एक अंक जोड़ें: `... 200`। अब उसकी AD 200 है और fibre की 1। Router दोनों जानता है पर **table में केवल fibre रखता है**। 4G किनारे खड़ा इंतजार करता है।',
          en: 'Put one number on the end of the 4G line: `... 200`. Now its AD is 200 while the fibre’s is 1. The router knows both but **only puts the fibre in the table**. The 4G stands aside and waits.',
        },
        exam: {
          gu: 'AD એવી પસંદ કરો જે મુખ્ય source કરતાં મોટી હોય. OSPF સામે backup રાખવો હોય તો 111 કે વધુ; static સામે 2 પણ ચાલે. 200 રૂઢિગત પસંદગી છે.',
          hi: 'AD ऐसी चुनें जो मुख्य source से बड़ी हो। OSPF के सामने backup रखना हो तो 111 या ज्यादा; static के सामने 2 भी चलता है। 200 पारंपरिक पसंद है।',
          en: 'Pick an AD above whatever the primary source uses. Against OSPF you need 111 or more; against another static, 2 is enough. 200 is the conventional choice.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r1', x: 160, y: 200, type: 'router' as const, label: 'R1', accent: CCNA },
          { id: 'f', x: 500, y: 100, type: 'cloud' as const, label: 'Fibre', sub: 'AD 1 — in the table', accent: 'var(--nq-ok)', pulse: t > 0.4 },
          { id: 'g', x: 500, y: 310, type: 'cloud' as const, label: '4G', sub: t > 0.4 ? 'AD 200 — waiting' : 'AD 1', accent: t > 0.4 ? 'var(--nq-text-mute)' : WARN },
        ],
        links: [
          { id: 'a', from: 'r1', to: 'f', state: 'up' as const, flowing: true },
          { id: 'b', from: 'r1', to: 'g', state: (t > 0.4 ? 'idle' : 'up') as 'idle' | 'up', flowing: t <= 0.4 },
        ],
      }),
      aside: (t) => ({
        title: H('R1 નું routing table', 'R1 की routing table', 'R1 routing table'),
        caption: H('બે લખ્યા, એક દેખાય છે.', 'दो लिखे, एक दिखता है।', 'Two written, one showing.'),
        head: ['code', 'network', 'via', 'AD'],
        rows:
          t > 0.4
            ? [['S*', '0.0.0.0/0', 'fibre', '1']]
            : [
                ['S*', '0.0.0.0/0', 'fibre', '1'],
                ['S*', '0.0.0.0/0', '4G', '1'],
              ],
      }),
    },
    {
      ms: 3200,
      label: H('Fibre જાય — અને કોઈએ કશું ન કર્યું', 'Fibre जाए — और किसी ने कुछ नहीं किया', 'The fibre drops, and nobody did anything'),
      text: {
        beginner: {
          gu: 'Fibre ની લિંક નીચે જાય એટલે એનો next hop અપ્રાપ્ય બને, અને એ route table માંથી **જાતે જ નીકળી જાય**. હવે એકમાત્ર બાકીનો દાવેદાર 4G છે — અને એ ક્ષણે જ table માં ચડી જાય. રાતના ત્રણ વાગ્યે પણ, કોઈને ફોન કર્યા વગર.',
          hi: 'Fibre की link नीचे जाए तो उसका next hop अप्राप्य बनता है, और वह route table से **खुद ही निकल जाता है**। अब एकमात्र बचा दावेदार 4G है — और उसी क्षण table में चढ़ जाता है। रात के तीन बजे भी, किसी को फोन किए बिना।',
          en: 'When the fibre link goes down its next hop becomes unreachable and the route **removes itself** from the table. The only remaining claimant is the 4G, and in that same moment it steps in. At three in the morning, without anyone being phoned.',
        },
        exam: {
          gu: 'ચેતવણી: લિંક ભૌતિક રીતે ઊભી રહે પણ આગળ ક્યાંક તૂટે તો next hop "પહોંચી શકાય" ગણાતો રહે અને failover ન થાય. એ માટે IP SLA tracking વપરાય.',
          hi: 'चेतावनी: link भौतिक रूप से खड़ी रहे पर आगे कहीं टूटे तो next hop "पहुंच सकते हैं" माना जाता रहता है और failover नहीं होता। इसके लिए IP SLA tracking इस्तेमाल होती है।',
          en: 'A caveat: if the link stays physically up but breaks further along, the next hop still counts as reachable and no failover happens. IP SLA tracking exists for exactly that.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r1', x: 160, y: 200, type: 'router' as const, label: 'R1', accent: CCNA },
          { id: 'f', x: 500, y: 100, type: 'cloud' as const, label: 'Fibre', sub: 'down ✕', accent: 'var(--nq-err)' },
          { id: 'g', x: 500, y: 310, type: 'cloud' as const, label: '4G', sub: t > 0.4 ? 'now in the table' : 'AD 200 — waiting', accent: t > 0.4 ? 'var(--nq-ok)' : 'var(--nq-text-mute)', pulse: t > 0.4 },
        ],
        links: [
          { id: 'a', from: 'r1', to: 'f', state: 'down' as const },
          { id: 'b', from: 'r1', to: 'g', state: (t > 0.4 ? 'up' : 'idle') as 'up' | 'idle', flowing: t > 0.4 },
        ],
        packets:
          t > 0.5
            ? [{ id: 'p', from: 'r1', to: 'g', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'still reaching' }]
            : [],
      }),
      aside: (t) => ({
        title: H('R1 નું routing table', 'R1 की routing table', 'R1 routing table'),
        head: ['code', 'network', 'via', 'AD'],
        rows: t > 0.4 ? [['S*', '0.0.0.0/0', '4G', '200']] : [],
        empty: H('એક ક્ષણ માટે કોઈ default નથી…', 'एक क्षण के लिए कोई default नहीं…', 'for one moment, no default at all…'),
      }),
    },
  ],
  takeaway: {
    gu: '`0.0.0.0 0.0.0.0` એટલે "બાકીનું બધું આ તરફ" — અને એ દરેક બીજા મેળથી હારે છે, એટલે જ એ સલામત છે. એ જ command ના છેડે AD નો આંકડો ઉમેરો એટલે route **રાહ જોતો backup** બની જાય: મુખ્ય જાય ત્યારે જ આગળ આવે, અને તમારે રાત્રે ઊઠવું ન પડે.',
    hi: '`0.0.0.0 0.0.0.0` यानी "बाकी सब इस तरफ" — और यह हर दूसरे मेल से हारता है, इसीलिए सुरक्षित है। उसी command के आखिर में AD का अंक जोड़ें तो route **इंतजार करता backup** बन जाता है: मुख्य जाने पर ही आगे आता है, और आपको रात में उठना नहीं पड़ता।',
    en: '`0.0.0.0 0.0.0.0` means "everything else goes this way", and it loses to every other match, which is precisely what makes it safe. Add an AD number to the end of that same command and the route becomes a **waiting backup**: it steps forward only when the primary goes, and nobody has to get up in the night.',
  },
  check: {
    q: H(
      'મુખ્ય રસ્તો OSPF શીખવે છે (AD 110). Backup static route ની AD કેટલી રાખશો?',
      'मुख्य रास्ता OSPF सिखाता है (AD 110)। Backup static route की AD कितनी रखेंगे?',
      'The primary path is learned from OSPF (AD 110). What AD would you give the backup static route?',
    ),
    options: [
      H('111 કે વધુ — જેથી એ OSPF સામે હારે', '111 या ज्यादा — ताकि यह OSPF से हारे', '111 or more — so it loses to OSPF'),
      H('1 — કારણ કે static હંમેશા ભરોસાપાત્ર છે', '1 — क्योंकि static हमेशा भरोसेमंद है', '1 — because statics are always more trustworthy'),
      H('109 — જેથી એ તૈયાર રહે', '109 — ताकि यह तैयार रहे', '109 — so it stands ready'),
    ],
    answer: 0,
    explain: H(
      'Backup એ **હારવા** માટે છે. 1 કે 109 રાખશો તો એ OSPF ને હરાવીને તરત જ મુખ્ય બની જશે — અને તમે ભૂલથી કાયમ backup લિંક પર ચાલતા રહેશો.',
      'Backup **हारने** के लिए है। 1 या 109 रखें तो यह OSPF को हराकर तुरंत मुख्य बन जाएगा — और आप गलती से हमेशा backup link पर चलते रहेंगे।',
      'A backup is supposed to **lose**. At 1 or 109 it would beat OSPF and become the primary immediately, quietly leaving you running on the backup link forever.',
    ),
  },
}
