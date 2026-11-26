import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const WARN = 'var(--nq-warn)'
const H = (gu: string, hi: string, en: string) => ({ gu, hi, en })

/* ═══════════════════ p3l1 · Redistribution and its traps ═══════════════════ */

export const p3l1: LessonSpec = {
  why: {
    gu: 'Ek enterprise ma OSPF campus par, EIGRP data center ma, static WAN par. Mene ek protocol thi bijje routes "lavavi" pade — redistribution. Pan a job sauthi dangerous — ek typo thi routing loop, suboptimal path, ke silent blackhole. Aa lesson gotchas ne janavai ane route-tag thi ene fix.',
    hi: 'एक enterprise में OSPF campus पर, EIGRP data center में, static WAN पर। एक protocol से दूसरे में routes "लानी" पड़ें — redistribution। पर यह job सबसे dangerous — एक typo से routing loop, suboptimal path, या silent blackhole। यह lesson gotchas को दिखाए और route-tag से उसे fix।',
    en: 'An enterprise runs OSPF on campus, EIGRP in the DC, static on WAN. You need to "carry" routes from one protocol to another — redistribution. But it is the most dangerous job — one typo and you have a routing loop, a suboptimal path, or a silent blackhole. This lesson shows the gotchas and fixes them with route-tags.',
  },
  steps: [
    {
      ms: 3000,
      label: H('Redistribution simple case', 'Redistribution simple case', 'Redistribution simple case'),
      text: {
        beginner: {
          gu: 'ASBR par donno protocols chhe. OSPF ma EIGRP routes jarur chhe: `redistribute eigrp 100 subnets`. Haven OSPF routers EIGRP networks ne External Type 5 LSA tarike jue chhe — pan routing table ma e aa to install thai gayu.',
          hi: 'ASBR पर दोनों protocols हैं। OSPF में EIGRP routes चाहिए: `redistribute eigrp 100 subnets`। अब OSPF routers EIGRP networks को External Type 5 LSA के रूप में देखें — पर routing table में वे install हो गए।',
          en: 'The ASBR runs both protocols. OSPF needs EIGRP routes: `redistribute eigrp 100 subnets`. Now OSPF routers see EIGRP networks as External Type 5 LSAs — and the routing table has them.',
        },
        exam: {
          gu: '`subnets` keyword bina ma OSPF ma fakat classful networks redistribute thaay — moti miss. Default metric: OSPF 20 (E2), EIGRP mate `default-metric` set karvi pade.',
          hi: '`subnets` keyword के बिना OSPF में केवल classful networks redistribute हों — बड़ी miss। Default metric: OSPF 20 (E2), EIGRP के लिए `default-metric` set करनी पड़े।',
          en: 'Without the `subnets` keyword OSPF only redistributes classful networks — a big miss. Default metric: OSPF 20 (E2); for EIGRP you must set a `default-metric`.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'e1', x: 180, y: 220, type: 'router' as const, label: 'EIGRP side', accent: BEG },
          { id: 'asbr', x: 450, y: 220, type: 'router' as const, label: 'ASBR', sub: 'redistribute', accent: CCNP, pulse: t > 0.3 },
          { id: 'o1', x: 720, y: 220, type: 'router' as const, label: 'OSPF side', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'e1', to: 'asbr', state: 'up', label: 'EIGRP' },
          { id: 'b', from: 'asbr', to: 'o1', state: 'up', label: 'OSPF', flowing: t > 0.3 },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Mutual redistribution — bidirectional', 'Mutual redistribution — bidirectional', 'Mutual redistribution — bidirectional'),
      text: {
        beginner: {
          gu: 'Both-way redistribution: ASBR par OSPF-to-EIGRP ane EIGRP-to-OSPF, both. EIGRP ni routes OSPF ma jay, OSPF ni routes EIGRP ma jay. Simple sound, pan hamna thi j problem shuru thay — be ASBRs chhe to?',
          hi: 'Both-way redistribution: ASBR पर OSPF-to-EIGRP और EIGRP-to-OSPF, दोनों। EIGRP की routes OSPF में जाएं, OSPF की routes EIGRP में जाएं। Simple लगे, पर यहीं से problem शुरू — दो ASBRs हों तो?',
          en: 'Both-way redistribution: OSPF-to-EIGRP and EIGRP-to-OSPF on the ASBR, both. EIGRP routes go into OSPF, OSPF routes go into EIGRP. Sounds simple, but the problem starts right here — what if there are two ASBRs?',
        },
        exam: {
          gu: '`router ospf 1` → `redistribute eigrp 100 subnets metric 20`, `router eigrp 100` → `redistribute ospf 1 metric 10000 100 255 1 1500`. Default metric OSPF ma 20 (E2), EIGRP ma unreachable — explicit joiyee.',
          hi: '`router ospf 1` → `redistribute eigrp 100 subnets metric 20`, `router eigrp 100` → `redistribute ospf 1 metric 10000 100 255 1 1500`। Default metric OSPF में 20 (E2), EIGRP में unreachable — explicit चाहिए।',
          en: '`router ospf 1` → `redistribute eigrp 100 subnets metric 20`, `router eigrp 100` → `redistribute ospf 1 metric 10000 100 255 1 1500`. Default metric is 20 (E2) in OSPF, unreachable in EIGRP — must be explicit.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'e', x: 180, y: 220, type: 'cloud' as const, label: 'EIGRP', accent: BEG },
          { id: 'asbr', x: 450, y: 220, type: 'router' as const, label: 'ASBR', accent: CCNP, pulse: true },
          { id: 'o', x: 720, y: 220, type: 'cloud' as const, label: 'OSPF', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'e', to: 'asbr', state: 'up', flowing: true },
          { id: 'b', from: 'asbr', to: 'o', state: 'up', flowing: true },
        ],
      }),
    },
    {
      ms: 3400,
      label: H('Routing loop — two-way, two ASBRs', 'Routing loop — two-way, two ASBRs', 'Routing loop — two-way, two ASBRs'),
      text: {
        beginner: {
          gu: 'ASBR1 OSPF ma EIGRP route inject kari (AD 110). Bhi ASBR2 EIGRP ma OSPF route pacho inject karti chhe — hve EIGRP ne pan same destination mate rasto male, AD 170 (external). Pan ASBR1 ne EIGRP rasto AD 90 ma preference male — EIGRP native thi! Etle ASBR1 EIGRP rasto choose kare ne routing loop thay jay. Classic trap.',
          hi: 'ASBR1 OSPF में EIGRP route inject करे (AD 110)। दूसरा ASBR2 EIGRP में OSPF route वापस inject करे — अब EIGRP को भी same destination के लिए रास्ता मिले, AD 170 (external)। पर ASBR1 को EIGRP रास्ता AD 90 में preference मिले — EIGRP native से! तो ASBR1 EIGRP रास्ता चुने और routing loop हो जाए। Classic trap।',
          en: 'ASBR1 injects an EIGRP route into OSPF (AD 110). The other ASBR2 injects the OSPF route back into EIGRP — now EIGRP also has a path to the same destination, AD 170 (external). But ASBR1 prefers the EIGRP path at AD 90 — EIGRP native! So ASBR1 picks the EIGRP path and a routing loop forms. Classic trap.',
        },
        exam: {
          gu: 'AD comparison matter kare: EIGRP internal 90, EIGRP external 170, OSPF 110. Mutual redistribution ma AD mismatch thi suboptimal paths. Solution: route-tag + distribute-list.',
          hi: 'AD comparison matter करे: EIGRP internal 90, EIGRP external 170, OSPF 110। Mutual redistribution में AD mismatch से suboptimal paths। Solution: route-tag + distribute-list।',
          en: 'AD comparison matters: EIGRP internal 90, EIGRP external 170, OSPF 110. In mutual redistribution, AD mismatches cause suboptimal paths. Solution: route-tag + distribute-list.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'asbr1', x: 200, y: 100, type: 'router' as const, label: 'ASBR1', sub: 'confused', accent: 'var(--nq-err)', pulse: true },
          { id: 'asbr2', x: 700, y: 100, type: 'router' as const, label: 'ASBR2', accent: WARN },
          { id: 'o', x: 450, y: 50, type: 'cloud' as const, label: 'OSPF', accent: CCNA },
          { id: 'e', x: 450, y: 250, type: 'cloud' as const, label: 'EIGRP', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'asbr1', to: 'o', state: 'up' },
          { id: 'b', from: 'asbr2', to: 'o', state: 'up' },
          { id: 'c', from: 'asbr1', to: 'e', state: 'up' },
          { id: 'd', from: 'asbr2', to: 'e', state: 'up' },
          { id: 'loop', from: 'asbr1', to: 'asbr2', state: 'up', label: t > 0.4 ? 'loop!' : undefined },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Route-tag thi fix', 'Route-tag से fix', 'Fix with route-tag'),
      text: {
        beginner: {
          gu: 'Solution: redistribute karti vakhate dar route par tag lagavi do — "aa ekdam EIGRP thi aavi". Bhi ASBR aa tag jue ane filter kare: "jo aa route tag 100 thi aave to EIGRP ma pachhi na inject karvu". Loop break. Route-map thi tag set/match kari shakay.',
          hi: 'Solution: redistribute करते समय हर route पर tag लगा दो — "यह मूल रूप से EIGRP से आई"। दूसरा ASBR यह tag देखे और filter करे: "यदि यह route tag 100 से आई तो EIGRP में वापस inject न करें"। Loop break। Route-map से tag set/match कर सकें।',
          en: 'Solution: at redistribution time, tag every route — "this originally came from EIGRP". The other ASBR sees the tag and filters: "if this route has tag 100 do not inject it back into EIGRP". Loop broken. Set and match tags with route-maps.',
        },
        exam: {
          gu: '`route-map SET_TAG` → `set tag 100`; `route-map FILTER_TAG` → `match tag 100` (deny). Mutual redistribution mate kagad par pehla tag strategy lakhvi, pachhi configure karvi. Troubleshooting mate `show ip route <net>` ma AD check karvi.',
          hi: '`route-map SET_TAG` → `set tag 100`; `route-map FILTER_TAG` → `match tag 100` (deny)। Mutual redistribution के लिए पहले कागज पर tag strategy लिखें, फिर configure करें। Troubleshooting में `show ip route <net>` से AD देखें।',
          en: '`route-map SET_TAG` → `set tag 100`; `route-map FILTER_TAG` → `match tag 100` (deny). For mutual redistribution, write the tag strategy on paper first, then configure. For troubleshooting, check AD with `show ip route <net>`.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'asbr1', x: 200, y: 180, type: 'router' as const, label: 'ASBR1', sub: 'tag 100', accent: 'var(--nq-ok)' },
          { id: 'asbr2', x: 700, y: 180, type: 'router' as const, label: 'ASBR2', sub: 'filter tag 100', accent: 'var(--nq-ok)', pulse: t > 0.3 },
        ],
        links: [
          { id: 'a', from: 'asbr1', to: 'asbr2', state: 'up', label: t > 0.3 ? 'no loop' : 'loop' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Redistribution routes ne ek protocol thi bijje "import" kare, pan AD mismatch thi suboptimal path ke routing loop thai shake che — khas kari ne mutual redistribution be ASBRs par. Fix: route-tag set redistribution par ane filter opposite direction par. "Design tag strategy before typing."',
    hi: 'Redistribution routes को एक protocol से दूसरे में "import" करे, पर AD mismatch से suboptimal path या routing loop हो सकता है — खासकर mutual redistribution दो ASBRs पर। Fix: route-tag set करें redistribution पर और filter opposite direction पर। "Design tag strategy before typing."',
    en: 'Redistribution "imports" routes from one protocol to another, but AD mismatches can cause suboptimal paths or routing loops — especially with mutual redistribution on two ASBRs. Fix: set a route-tag on redistribution and filter it in the opposite direction. "Design tag strategy before typing."',
  },
  check: {
    q: H(
      'Mutual redistribution OSPF <-> EIGRP be ASBRs par. Loop prevent karva nu best tool?',
      'Mutual redistribution OSPF <-> EIGRP दो ASBRs पर। Loop prevent करने का best tool?',
      'Mutual redistribution OSPF ↔ EIGRP on two ASBRs. Best tool to prevent loops?',
    ),
    options: [
      H('Route-tag set and filter', 'Route-tag set and filter', 'Route-tag set and filter'),
      H('Change AD values', 'Change AD values', 'Change AD values'),
      H('Only use one ASBR', 'Only use one ASBR', 'Only use one ASBR'),
    ],
    answer: 0,
    explain: H(
      'AD change karvanu brittle — bijja routes ne affect kare. One ASBR na redundancy maari nake. Route-tag clean solution: ASBR1 tag 100 set kare ane ASBR2 tag 100 filter — ane vice versa. Protocol-agnostic.',
      'AD change करना brittle — बाकी routes को affect करे। One ASBR redundancy मार दे। Route-tag clean solution: ASBR1 tag 100 set करे और ASBR2 tag 100 filter — और vice versa। Protocol-agnostic।',
      'Changing AD is brittle — affects other routes. A single ASBR kills redundancy. Route-tag is the clean solution: ASBR1 sets tag 100 and ASBR2 filters tag 100, and vice versa. Protocol-agnostic.',
    ),
  },
}

/* ═══════════════════ p3l2 · Route-maps and PBR ═══════════════════ */

export const p3l2: LessonSpec = {
  why: {
    gu: 'Normal routing destination jue che — "10.9.9.5 kyar jay?". Pan kyarek source par based decision joiyee: "Finance VLAN internet par fast fibre thi jay, Guest VLAN slow DSL thi jay." Policy-Based Routing (PBR) e kam kare — route-map thi.',
    hi: 'Normal routing destination देखे — "10.9.9.5 कहां जाए?"। पर कभी source पर आधारित decision चाहिए: "Finance VLAN internet को fast fibre से जाए, Guest VLAN slow DSL से"। Policy-Based Routing (PBR) यही काम करे — route-map से।',
    en: 'Normal routing looks at destination — "where does 10.9.9.5 go?". But sometimes you want a source-based decision: "Finance VLAN goes to internet over fast fibre, Guest VLAN over slow DSL". Policy-Based Routing (PBR) does that — via route-maps.',
  },
  steps: [
    {
      ms: 3000,
      label: H('Route-map — Swiss Army knife', 'Route-map — Swiss Army knife', 'Route-map — the Swiss Army knife'),
      text: {
        beginner: {
          gu: 'Route-map sequential clauses chhe — darek clause match statement ane set statement saathe. Match karvu: "aa route 10.1.0.0 thi aavi che?", Set karvu: "tag 100 lagavi lo", "local-preference 200 karo", "next-hop badalo". ACLs, prefix-lists, redistribution, PBR, BGP — darek jagya e vapray.',
          hi: 'Route-map sequential clauses — हर clause match statement और set statement के साथ। Match: "यह route 10.1.0.0 से आई?", Set: "tag 100 लगा दें", "local-preference 200 करें", "next-hop बदलें"। ACLs, prefix-lists, redistribution, PBR, BGP — हर जगह वापरे।',
          en: 'A route-map is sequential clauses — each with a match statement and a set statement. Match: "did this route come from 10.1.0.0?", set: "apply tag 100", "set local-preference to 200", "change next-hop". Used in ACLs, prefix-lists, redistribution, PBR, BGP — everywhere.',
        },
        exam: {
          gu: '`route-map NAME permit 10` — sequence number thi order. Multiple match conditions ek clause ma ANDed, multiple ACL match statement ORed. End ma implicit deny. Null set clause means "no modification, but allow".',
          hi: '`route-map NAME permit 10` — sequence number से order। Multiple match conditions एक clause में ANDed, multiple ACL match statement ORed। End में implicit deny। Null set clause means "no modification, but allow"।',
          en: '`route-map NAME permit 10` — ordered by sequence number. Multiple match conditions in one clause are ANDed, multiple ACL match statements are ORed. Implicit deny at the end. A null set clause means "no modification, but allow".',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'r', x: 450, y: 200, type: 'router' as const, label: 'route-map', accent: CCNP, pulse: true },
        ],
      }),
      aside: () => ({
        title: H('Example: tag EIGRP routes', 'Example: tag EIGRP routes', 'Example: tag EIGRP routes'),
        head: ['clause', 'match', 'set'],
        rows: [
          ['10 permit', 'route-source EIGRP', 'tag 100'],
          ['20 deny', 'network 10.99.0.0/24', '—'],
          ['30 permit', '(any)', '(no modification)'],
        ],
      }),
    },
    {
      ms: 3200,
      label: H('PBR — source thi route badalvo', 'PBR — source से route बदलें', 'PBR — route by source'),
      text: {
        beginner: {
          gu: 'PBR routing table ne override kare: packet avey tyare route-map chale che, aney set clause nakki kare ke next-hop kyo hashe. Finance packets ne 203.0.113.2 (fibre) mokaalo, Guest packets ne 198.51.100.2 (DSL) mokalo. Routing table shu kahu che e matter nathi kartu.',
          hi: 'PBR routing table को override करे: packet आए तो route-map चले, और set clause तय करे कि next-hop कौन होगा। Finance packets को 203.0.113.2 (fibre), Guest packets को 198.51.100.2 (DSL)। Routing table क्या कहती है इससे फर्क नहीं।',
          en: 'PBR overrides the routing table: a packet arrives, the route-map runs, and the set clause decides the next-hop. Finance packets to 203.0.113.2 (fibre), Guest packets to 198.51.100.2 (DSL). What the routing table says does not matter.',
        },
        exam: {
          gu: '`ip policy route-map NAME` interface par apply karo (ingress). Match ACL thi source select, set `ip next-hop` thi direct. Local PBR: router potana originated traffic mate `ip local policy`. PBR CPU-based (slow) hoy shake — CEF support jue.',
          hi: '`ip policy route-map NAME` interface पर apply (ingress)। Match ACL से source select, set `ip next-hop` से direct। Local PBR: router के खुद originated traffic के लिए `ip local policy`। PBR CPU-based (slow) हो सकता है — CEF support देखें।',
          en: '`ip policy route-map NAME` applied on an interface (ingress). Match ACL to select source, set `ip next-hop` to direct it. Local PBR for router-originated traffic: `ip local policy`. PBR can be CPU-based (slow) — check CEF support.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'f', x: 150, y: 120, type: 'pc' as const, label: 'Finance', sub: '10.10.1.0', accent: BEG },
          { id: 'g', x: 150, y: 320, type: 'pc' as const, label: 'Guest', sub: '10.10.2.0', accent: WARN },
          { id: 'r', x: 400, y: 220, type: 'router' as const, label: 'R1', sub: 'PBR', accent: CCNP, pulse: true },
          { id: 'fib', x: 720, y: 120, type: 'cloud' as const, label: 'Fibre · 1Gbps', accent: 'var(--nq-ok)' },
          { id: 'dsl', x: 720, y: 320, type: 'cloud' as const, label: 'DSL · 50Mbps', accent: WARN },
        ],
        links: [
          { id: 'a', from: 'f', to: 'r', state: 'up', flowing: t > 0.3 },
          { id: 'b', from: 'g', to: 'r', state: 'up', flowing: t > 0.5 },
          { id: 'c', from: 'r', to: 'fib', state: 'up', flowing: t > 0.3 },
          { id: 'd', from: 'r', to: 'dsl', state: 'up', flowing: t > 0.5 },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('Use cases — ane careful!', 'Use cases — और careful!', 'Use cases — and be careful!'),
      text: {
        beginner: {
          gu: 'Classic PBR use cases: 1) ISP cost optimization — important traffic ne premium, bulk ne cheap. 2) Compliance — specific source e specific exit thi ja jay. 3) Load distribution — alag subnets alag links par. Pan PBR ni problem: bidirectional nathi (reply traffic ne pan bana karvu pade), aney troubleshooting confusing — `show ip route` ma kashu nahi dekhay.',
          hi: 'Classic PBR use cases: 1) ISP cost optimization — important traffic premium पर, bulk cheap पर। 2) Compliance — specific source specific exit से ही जाए। 3) Load distribution — अलग subnets अलग links पर। पर PBR की problem: bidirectional नहीं (reply traffic को भी बनाना पड़े), और troubleshooting confusing — `show ip route` में कुछ नहीं दिखे।',
          en: 'Classic PBR use cases: 1) ISP cost optimisation — important traffic to premium, bulk to cheap. 2) Compliance — specific source must exit from a specific link. 3) Load distribution — different subnets on different links. But PBR’s problem: not bidirectional (reply traffic needs its own), and troubleshooting is confusing — `show ip route` shows nothing.',
        },
        exam: {
          gu: 'Troubleshooting mate `show ip policy`, `show route-map`, aney `debug ip policy`. Return path mate return-side PBR ke SNAT jarur. Modern designs ma PBR ni jagya SD-WAN e aani che — centralized policy, bidirectional.',
          hi: 'Troubleshooting के लिए `show ip policy`, `show route-map`, और `debug ip policy`। Return path के लिए return-side PBR या SNAT चाहिए। Modern designs में PBR की जगह SD-WAN ने ली है — centralized policy, bidirectional।',
          en: 'Troubleshooting with `show ip policy`, `show route-map`, and `debug ip policy`. For return path, use return-side PBR or SNAT. In modern designs PBR has been replaced by SD-WAN — centralised policy, bidirectional.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'c', x: 450, y: 200, type: 'router' as const, label: 'careful', sub: 'bidirectional?', accent: WARN, pulse: true },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Route-map Cisco nu universal policy tool — match karvu, set karvu, aney destinations ne redistribution, PBR, BGP, filtering ma vaapvru. PBR source ane other criteria thi routing table ne override kare — fibre vs DSL steer karva majedar, pan reply path yaad rakhvi pade.',
    hi: 'Route-map Cisco का universal policy tool — match करना, set करना, और destinations को redistribution, PBR, BGP, filtering में वापरना। PBR source और अन्य criteria से routing table को override करे — fibre vs DSL steer करने में मज़ेदार, पर reply path याद रखनी पड़े।',
    en: 'Route-map is Cisco’s universal policy tool — match, set, and apply to redistribution, PBR, BGP, filtering. PBR overrides the routing table based on source and other criteria — great for steering fibre vs DSL, but remember the reply path.',
  },
  check: {
    q: H(
      'PBR configure kari pan traffic badla ne jati nathi. Pehla troubleshoot shu?',
      'PBR configure की पर traffic बदल कर नहीं जाता। पहले troubleshoot क्या?',
      'Configured PBR but traffic is not being steered. First thing to troubleshoot?',
    ),
    options: [
      H('`show ip policy` ane `show route-map` — interface attached chhe ke nahi', '`show ip policy` और `show route-map` — interface attached है या नहीं', '`show ip policy` and `show route-map` — is it attached to the interface'),
      H('Routing table re-check karo', 'Routing table re-check करें', 'Re-check the routing table'),
      H('Router reboot karo', 'Router reboot करें', 'Reboot the router'),
    ],
    answer: 0,
    explain: H(
      'PBR routing table bahar chale — `show ip route` ma kashu nahi dekhay. `show ip policy` kahi ke konse interfaces par policy-maps attached chhe. Common mistake: route-map lakhi pan interface par `ip policy route-map` lagavvanu bhuli jay.',
      'PBR routing table के बाहर चले — `show ip route` में कुछ नहीं दिखे। `show ip policy` बताए कि किन interfaces पर policy-maps attached हैं। Common mistake: route-map लिखी पर interface पर `ip policy route-map` लगाना भूल गए।',
      'PBR works outside the routing table — `show ip route` shows nothing. `show ip policy` tells you which interfaces have policy-maps attached. Common mistake: wrote the route-map but forgot `ip policy route-map` on the interface.',
    ),
  },
}

/* ═══════════════════ p3l3 · BGP Advanced — RR and Communities ═══════════════════ */

export const p3l3: LessonSpec = {
  why: {
    gu: 'iBGP rule: routes ne biji iBGP ne forward na karvu. Nano AS ma 10 routers etle 45 iBGP sessions (N × (N-1)/2). 50 routers ni DC ma 1,225 sessions — maintain karvanu asambhav. Route Reflector a problem solve kare. Communities policy ne scalably taagi shake.',
    hi: 'iBGP rule: routes को दूसरे iBGP को forward न करें। छोटे AS में 10 routers यानी 45 iBGP sessions (N × (N-1)/2)। 50 routers के DC में 1,225 sessions — maintain करना असंभव। Route Reflector यह समस्या हल करे। Communities policy को scalably tag करें।',
    en: 'iBGP rule: do not forward routes to other iBGP. A small AS with 10 routers has 45 iBGP sessions (N × (N-1)/2). A DC with 50 routers: 1,225 sessions — impossible to maintain. Route Reflectors fix it. Communities tag policy scalably.',
  },
  steps: [
    {
      ms: 3000,
      label: H('Full-mesh problem', 'Full-mesh problem', 'Full-mesh problem'),
      text: {
        beginner: {
          gu: 'Rule yaad rakho: iBGP ne iBGP ne forward na karvu, kem ke AS-path ma apno ASN add nathi thatu (loop detect nathi thatu). Etle jaroor badha iBGP routers ni vachhe direct session hovi joie — full mesh. N routers, N × (N-1)/2 sessions. CPU, memory, management ma tremendous overhead.',
          hi: 'Rule: iBGP को iBGP में forward न करें, क्योंकि AS-path में अपना ASN add नहीं हो (loop detect न हो)। तो ज़रूरी सारे iBGP routers के बीच direct session हो — full mesh। N routers, N × (N-1)/2 sessions। CPU, memory, management में tremendous overhead।',
          en: 'Remember the rule: iBGP does not forward to other iBGP because AS-path does not add the own ASN (no loop detection). So all iBGP routers must have direct sessions — full mesh. N routers, N × (N-1)/2 sessions. Tremendous overhead in CPU, memory, management.',
        },
        exam: {
          gu: '10 routers = 45 sessions, 50 routers = 1,225, 100 routers = 4,950. CPU per session small pan multiply thai ne thodu — aney TCP keepalive, memory overhead, management complexity.',
          hi: '10 routers = 45 sessions, 50 routers = 1,225, 100 routers = 4,950। CPU per session छोटा पर multiply होकर बड़ा — और TCP keepalive, memory overhead, management complexity।',
          en: '10 routers = 45 sessions, 50 routers = 1,225, 100 routers = 4,950. Per-session CPU is small but multiplies — plus TCP keepalives, memory overhead, management complexity.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'r1', x: 200, y: 100, type: 'router' as const, label: 'R1', accent: CCNA },
          { id: 'r2', x: 500, y: 100, type: 'router' as const, label: 'R2', accent: CCNA },
          { id: 'r3', x: 800, y: 100, type: 'router' as const, label: 'R3', accent: CCNA },
          { id: 'r4', x: 200, y: 320, type: 'router' as const, label: 'R4', accent: CCNA },
          { id: 'r5', x: 500, y: 320, type: 'router' as const, label: 'R5', accent: CCNA },
          { id: 'r6', x: 800, y: 320, type: 'router' as const, label: 'R6', accent: CCNA },
        ],
        links: [
          { id: '12', from: 'r1', to: 'r2', state: 'up' },
          { id: '13', from: 'r1', to: 'r3', state: 'up' },
          { id: '14', from: 'r1', to: 'r4', state: 'up' },
          { id: '15', from: 'r1', to: 'r5', state: 'up' },
          { id: '16', from: 'r1', to: 'r6', state: 'up' },
          { id: '23', from: 'r2', to: 'r3', state: 'up' },
          { id: '24', from: 'r2', to: 'r4', state: 'up' },
          { id: '25', from: 'r2', to: 'r5', state: 'up' },
          { id: '26', from: 'r2', to: 'r6', state: 'up' },
          { id: '34', from: 'r3', to: 'r4', state: 'up' },
          { id: '35', from: 'r3', to: 'r5', state: 'up' },
          { id: '36', from: 'r3', to: 'r6', state: 'up' },
          { id: '45', from: 'r4', to: 'r5', state: 'up' },
          { id: '46', from: 'r4', to: 'r6', state: 'up' },
          { id: '56', from: 'r5', to: 'r6', state: 'up' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Route Reflector — hub ne client', 'Route Reflector — hub और client', 'Route Reflector — hub and clients'),
      text: {
        beginner: {
          gu: 'RR a rule ne temporarily tod che: tari pas aavu route to hu badha bijja clients ne reflect karu. Clients fakt RR saathe session rakhey (nathi badha vachhe), aney RR badha paasethi routes shikhe, reflect kare. 50 routers ma 49 sessions, N × (N-1)/2 nathi.',
          hi: 'RR यह rule को locally तोड़े: मुझे route आई तो मैं बाकी clients को reflect करूं। Clients केवल RR के साथ session रखें (बाकी वच्चे नहीं), और RR सबसे routes सीखे, reflect करे। 50 routers में 49 sessions, N × (N-1)/2 नहीं।',
          en: 'RR locally breaks the rule: when I receive a route I reflect it to the other clients. Clients only peer with the RR (not with each other), and the RR learns and reflects to all. 50 routers = 49 sessions, not N × (N-1)/2.',
        },
        exam: {
          gu: 'RR cluster-ID ane originator-ID loop detection mate add kare. Multiple RRs per cluster redundancy mate — same cluster-ID. Non-client peer RR saathe normal iBGP rule chalu.',
          hi: 'RR cluster-ID और originator-ID loop detection के लिए add करे। Multiple RRs per cluster redundancy के लिए — same cluster-ID। Non-client peer RR के साथ normal iBGP rule चले।',
          en: 'RR adds cluster-ID and originator-ID for loop detection. Multiple RRs per cluster for redundancy — same cluster-ID. Non-client peer with RR follows normal iBGP rules.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'rr', x: 450, y: 100, type: 'router' as const, label: 'RR', sub: 'reflects to all', accent: CCNP, pulse: true },
          { id: 'c1', x: 180, y: 300, type: 'router' as const, label: 'Client', accent: CCNA },
          { id: 'c2', x: 340, y: 300, type: 'router' as const, label: 'Client', accent: CCNA },
          { id: 'c3', x: 500, y: 300, type: 'router' as const, label: 'Client', accent: CCNA },
          { id: 'c4', x: 660, y: 300, type: 'router' as const, label: 'Client', accent: CCNA },
          { id: 'c5', x: 820, y: 300, type: 'router' as const, label: 'Client', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'rr', to: 'c1', state: 'up' },
          { id: 'b', from: 'rr', to: 'c2', state: 'up' },
          { id: 'c', from: 'rr', to: 'c3', state: 'up', flowing: t > 0.4 },
          { id: 'd', from: 'rr', to: 'c4', state: 'up' },
          { id: 'e', from: 'rr', to: 'c5', state: 'up' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Communities — tag ane group', 'Communities — tag और group', 'Communities — tag and group'),
      text: {
        beginner: {
          gu: 'BGP community e route par ek tag chhe — numeric (32-bit) ke textual. Example: 65001:100 = "aa Mumbai ni route", 65001:200 = "Delhi ni". Downstream routers e tag jue ne policy apply kare: "Mumbai ni routes ne local-pref 200 set karo, Delhi ni ne 50". Dar route alag configure karvanu rahi gayun — communities thi group policies.',
          hi: 'BGP community route पर एक tag — numeric (32-bit) या textual। Example: 65001:100 = "Mumbai की route", 65001:200 = "Delhi की"। Downstream routers tag देखें और policy apply करें: "Mumbai की routes को local-pref 200, Delhi की को 50"। हर route को अलग configure करने की ज़रूरत नहीं — communities से group policies।',
          en: 'BGP community is a tag on a route — numeric (32-bit) or textual. Example: 65001:100 = "a Mumbai route", 65001:200 = "Delhi". Downstream routers see the tag and apply policy: "Mumbai routes get local-pref 200, Delhi gets 50". No per-route configuration — communities give group policies.',
        },
        exam: {
          gu: 'Well-known: no-export (bijja AS ma na jay), no-advertise (koi peer ne na jay), internet (default). `ip bgp-community new-format` thi AA:NN format. Extended communities route-target mate (MPLS VPN).',
          hi: 'Well-known: no-export (बाकी AS में न जाए), no-advertise (किसी peer को न जाए), internet (default)। `ip bgp-community new-format` से AA:NN format। Extended communities route-target के लिए (MPLS VPN)।',
          en: 'Well-known: no-export (do not go to other ASes), no-advertise (do not go to any peer), internet (default). `ip bgp-community new-format` for AA:NN format. Extended communities for route-target (MPLS VPN).',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'r', x: 450, y: 200, type: 'router' as const, label: 'route 10.0.0.0/8', sub: 'community 65001:100', accent: CCNP, pulse: true },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('Prefix-list ane AS-path prepending', 'Prefix-list और AS-path prepending', 'Prefix-list and AS-path prepending'),
      text: {
        beginner: {
          gu: 'Prefix-list: ACL kartaa behtar jyare exact prefixes ne match karvi hoy (prefix length saathe). `ip prefix-list ALLOW seq 10 permit 10.0.0.0/8 le 24` = 10.0.0.0/8 na andar na prefixes /24 sudhi na. AS-path prepending: tamara outbound announcements ma apnu ASN be-tran vaar add karo, aney bijji AS ni longer AS-path jue ne secondary tarike treat kare.',
          hi: 'Prefix-list: ACL से बेहतर जब exact prefixes match करनी हों (prefix length के साथ)। `ip prefix-list ALLOW seq 10 permit 10.0.0.0/8 le 24` = 10.0.0.0/8 के अंदर के prefixes /24 तक। AS-path prepending: अपने outbound announcements में अपना ASN दो-तीन बार add करें, और दूसरा AS longer AS-path देखे और secondary की तरह treat करे।',
          en: 'Prefix-list: better than ACLs when matching exact prefixes (with prefix length). `ip prefix-list ALLOW seq 10 permit 10.0.0.0/8 le 24` = prefixes inside 10.0.0.0/8 up to /24. AS-path prepending: add your own ASN two or three times in outbound announcements, and the other AS sees a longer AS-path and treats it as secondary.',
        },
        exam: {
          gu: 'Prefix-list `ge` (greater or equal), `le` (less or equal) — /24 le 32 etle /24 thi /32 sudhi. AS-path ACL `ip as-path access-list 1 permit ^65001_` regex. Prepending outbound route-map ma `set as-path prepend 65001 65001`.',
          hi: 'Prefix-list `ge` (greater or equal), `le` (less or equal) — /24 le 32 यानी /24 से /32 तक। AS-path ACL `ip as-path access-list 1 permit ^65001_` regex। Prepending outbound route-map में `set as-path prepend 65001 65001`।',
          en: 'Prefix-list `ge` (greater or equal), `le` (less or equal) — /24 le 32 means /24 through /32. AS-path ACL `ip as-path access-list 1 permit ^65001_` regex. Prepending in outbound route-map: `set as-path prepend 65001 65001`.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'me', x: 180, y: 200, type: 'router' as const, label: 'me · AS 65001', accent: CCNA },
          { id: 'o', x: 720, y: 200, type: 'router' as const, label: 'other AS', sub: t > 0.4 ? 'sees: 65001 65001 65001' : 'sees: 65001', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'me', to: 'o', state: 'up', label: t > 0.4 ? 'prepended' : 'normal' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Route Reflector iBGP ni full mesh scalability problem solve kare — clients RR saathe peer, RR badha ne reflect kare. Communities route par tag lagavi ne policies ne group ma apply karva de. Prefix-list ane AS-path ACL filtering na tools, AS-path prepending inbound traffic ne nudge kare.',
    hi: 'Route Reflector iBGP की full mesh scalability समस्या हल करे — clients RR से peer, RR सबको reflect करे। Communities route पर tag लगाकर policies को group में apply करने दें। Prefix-list और AS-path ACL filtering के tools, AS-path prepending inbound traffic को nudge करे।',
    en: 'Route Reflectors fix the iBGP full-mesh scalability problem — clients peer with the RR, the RR reflects to all. Communities tag routes to apply policies in groups. Prefix-list and AS-path ACL are filtering tools, AS-path prepending nudges inbound traffic.',
  },
  check: {
    q: H(
      '50-router AS ma iBGP mesh e 1,225 sessions. Scale-friendly alternative?',
      '50-router AS में iBGP mesh से 1,225 sessions। Scale-friendly alternative?',
      '50-router AS has 1,225 iBGP mesh sessions. Scale-friendly alternative?',
    ),
    options: [
      H('Route Reflector — 49 sessions', 'Route Reflector — 49 sessions', 'Route Reflector — 49 sessions'),
      H('Change to EIGRP', 'Change to EIGRP', 'Change to EIGRP'),
      H('Enable eBGP within AS', 'Enable eBGP within AS', 'Enable eBGP within AS'),
    ],
    answer: 0,
    explain: H(
      'RR same AS andar iBGP route forwarding ni rule ne scale friendly way thi tod che: clients RR saathe session, RR reflect kare. 1,225 sessions mathi 49 — ye bhi redundancy mate 2 RRs rakho ne 98 sessions. Loop prevention cluster-ID aney originator-ID thi.',
      'RR same AS के अंदर iBGP route forwarding rule को scale-friendly way से तोड़े: clients RR से session, RR reflect करे। 1,225 sessions से 49 — और redundancy के लिए 2 RRs रखें तो 98 sessions। Loop prevention cluster-ID और originator-ID से।',
      'RR breaks the iBGP route-forwarding rule in a scale-friendly way: clients peer with RR, RR reflects. 1,225 sessions → 49 — or 98 with 2 RRs for redundancy. Loop prevention via cluster-ID and originator-ID.',
    ),
  },
}

/* ═══════════════════ p3l4 · DMVPN ═══════════════════ */

export const p3l4: LessonSpec = {
  why: {
    gu: '50 branches ne 1 head office saathe VPN tunnel? 50 static GRE+IPsec tunnels. New branch add thai? Hub par new tunnel configure, routes update. Costly aney error-prone. DMVPN (Dynamic Multipoint VPN) e problem solve kare — spokes dynamically register thai jay, aney Phase 3 ma spokes direct ek bijja saathe vaat kare.',
    hi: '50 branches को 1 head office से VPN tunnel? 50 static GRE+IPsec tunnels। नई branch add हो? Hub पर नया tunnel configure, routes update। Costly और error-prone। DMVPN (Dynamic Multipoint VPN) यह समस्या हल करे — spokes dynamically register हो जाएं, और Phase 3 में spokes direct एक-दूसरे से बात करें।',
    en: '50 branches to 1 head office with VPN tunnels? 50 static GRE+IPsec tunnels. A new branch? Configure a new tunnel on the hub, update routes. Costly and error-prone. DMVPN (Dynamic Multipoint VPN) solves it — spokes register dynamically, and in Phase 3 spokes talk directly to each other.',
  },
  steps: [
    {
      ms: 3000,
      label: H('mGRE — ek interface, ghana destinations', 'mGRE — एक interface, कई destinations', 'mGRE — one interface, many destinations'),
      text: {
        beginner: {
          gu: 'DMVPN nu pehlu block: Multipoint GRE. Classic GRE point-to-point (ek tunnel interface = ek destination). mGRE ek j tunnel interface thi many destinations ne reach kari shake. Hub par ek mGRE interface spoken paise tamasha spokes ne talk kari shake.',
          hi: 'DMVPN का पहला block: Multipoint GRE। Classic GRE point-to-point (एक tunnel interface = एक destination)। mGRE एक ही tunnel interface से कई destinations को reach कर सके। Hub पर एक mGRE interface सारे spokes से बात कर सके।',
          en: 'DMVPN’s first block: Multipoint GRE. Classic GRE is point-to-point (one tunnel interface = one destination). mGRE reaches many destinations from one tunnel interface. One mGRE interface on the hub talks to all spokes.',
        },
        exam: {
          gu: '`interface Tunnel 0`, `tunnel mode gre multipoint`, `tunnel source <physical>`, no `tunnel destination` (multipoint ma destination dynamic). Tunnel key same banne side.',
          hi: '`interface Tunnel 0`, `tunnel mode gre multipoint`, `tunnel source <physical>`, no `tunnel destination` (multipoint में destination dynamic)। Tunnel key दोनों side same।',
          en: '`interface Tunnel 0`, `tunnel mode gre multipoint`, `tunnel source <physical>`, no `tunnel destination` (destination is dynamic in multipoint). Tunnel key same on both sides.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'hub', x: 450, y: 100, type: 'router' as const, label: 'Hub', sub: 'one mGRE', accent: CCNP, pulse: true },
          { id: 's1', x: 200, y: 300, type: 'router' as const, label: 'Spoke 1', accent: CCNA },
          { id: 's2', x: 450, y: 300, type: 'router' as const, label: 'Spoke 2', accent: CCNA },
          { id: 's3', x: 700, y: 300, type: 'router' as const, label: 'Spoke 3', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'hub', to: 's1', state: 'up', label: 'dynamic' },
          { id: 'b', from: 'hub', to: 's2', state: 'up', label: 'dynamic' },
          { id: 'c', from: 'hub', to: 's3', state: 'up', label: 'dynamic' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('NHRP — dynamic mapping', 'NHRP — dynamic mapping', 'NHRP — dynamic mapping'),
      text: {
        beginner: {
          gu: 'Problem: spoke nu public IP dynamic (DHCP thi ISP) chhe. Hub ne kem khabar pade? NHRP (Next Hop Resolution Protocol) solve kare: spoke boot thai tyare hub (Next Hop Server, NHS) ne register kare: "mu Spoke 1, mi public IP xxx, mi tunnel IP yyy". Hub mapping store kare. New spoke add thai to NHS par ek entry add thai jay.',
          hi: 'समस्या: spoke का public IP dynamic (DHCP से ISP) है। Hub को कैसे पता चले? NHRP (Next Hop Resolution Protocol) हल करे: spoke boot हो तो hub (Next Hop Server, NHS) को register करे: "मैं Spoke 1, मेरा public IP xxx, मेरा tunnel IP yyy"। Hub mapping store करे। New spoke add हो तो NHS पर एक entry add हो जाए।',
          en: 'Problem: spoke’s public IP is dynamic (DHCP from ISP). How does the hub know? NHRP (Next Hop Resolution Protocol) solves it: a spoke boots and registers with the hub (Next Hop Server, NHS): "I am Spoke 1, my public IP is xxx, my tunnel IP is yyy". The hub stores the mapping. A new spoke means one entry added on the NHS.',
        },
        exam: {
          gu: 'Hub: `ip nhrp map multicast dynamic`, `ip nhrp authentication <key>`. Spoke: `ip nhrp nhs <hub-tunnel-ip>`, `ip nhrp map <hub-tunnel-ip> <hub-public-ip>`. Registration interval 2400s default.',
          hi: 'Hub: `ip nhrp map multicast dynamic`, `ip nhrp authentication <key>`। Spoke: `ip nhrp nhs <hub-tunnel-ip>`, `ip nhrp map <hub-tunnel-ip> <hub-public-ip>`। Registration interval 2400s default।',
          en: 'Hub: `ip nhrp map multicast dynamic`, `ip nhrp authentication <key>`. Spoke: `ip nhrp nhs <hub-tunnel-ip>`, `ip nhrp map <hub-tunnel-ip> <hub-public-ip>`. Default registration interval 2400s.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'hub', x: 450, y: 100, type: 'router' as const, label: 'NHS (hub)', accent: CCNP, pulse: t > 0.3 },
          { id: 's1', x: 200, y: 300, type: 'router' as const, label: 'Spoke 1', accent: CCNA },
          { id: 's2', x: 700, y: 300, type: 'router' as const, label: 'Spoke 2', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 's1', to: 'hub', state: 'up', flowing: t > 0.3 },
          { id: 'b', from: 's2', to: 'hub', state: 'up', flowing: t > 0.3 },
        ],
        packets:
          t > 0.3
            ? [{ id: 'reg', from: 's1', to: 'hub', t: 0.1 + ease((t - 0.3) / 0.7) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'NHRP register' }]
            : [],
      }),
    },
    {
      ms: 3200,
      label: H('Phase 1, 2, 3', 'Phase 1, 2, 3', 'Phase 1, 2, 3'),
      text: {
        beginner: {
          gu: 'Phase 1: badhu traffic hub thai jay — spoke-to-spoke pan hub thi route thai. Simple pan hub bottleneck. Phase 2: spokes directly ek bijja saathe vaat kari shake — but routing protocol next-hop preserve karvu pade. Phase 3: NHRP shortcut thi best phase — spokes direct, hub involvement minimal.',
          hi: 'Phase 1: सारा traffic hub से जाए — spoke-to-spoke भी hub से route हो। Simple पर hub bottleneck। Phase 2: spokes directly एक-दूसरे से बात कर सकें — पर routing protocol next-hop preserve करना पड़े। Phase 3: NHRP shortcut से best phase — spokes direct, hub involvement minimal।',
          en: 'Phase 1: all traffic through hub — spoke-to-spoke routed via hub. Simple but hub is bottleneck. Phase 2: spokes can talk directly — but routing protocol must preserve next-hop. Phase 3: NHRP shortcut — spokes direct, hub involvement minimal.',
        },
        exam: {
          gu: 'Phase 1: hub mGRE, spoke p2p. Phase 2: both mGRE, `no ip next-hop-self` on hub. Phase 3: `ip nhrp shortcut` (spoke) + `ip nhrp redirect` (hub) — hub spoke ne direct rasto kahay.',
          hi: 'Phase 1: hub mGRE, spoke p2p। Phase 2: both mGRE, `no ip next-hop-self` on hub। Phase 3: `ip nhrp shortcut` (spoke) + `ip nhrp redirect` (hub) — hub spoke को direct रास्ता बताए।',
          en: 'Phase 1: hub mGRE, spoke p2p. Phase 2: both mGRE, `no ip next-hop-self` on hub. Phase 3: `ip nhrp shortcut` (spoke) + `ip nhrp redirect` (hub) — hub tells spoke the direct path.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'hub', x: 450, y: 100, type: 'router' as const, label: 'Hub', accent: CCNP },
          { id: 's1', x: 200, y: 300, type: 'router' as const, label: 'Spoke 1', accent: CCNA },
          { id: 's2', x: 700, y: 300, type: 'router' as const, label: 'Spoke 2', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 's1', to: 'hub', state: 'up' },
          { id: 'b', from: 's2', to: 'hub', state: 'up' },
          { id: 'direct', from: 's1', to: 's2', state: t > 0.4 ? 'up' : 'idle', label: t > 0.4 ? 'Phase 3 direct' : undefined, flowing: t > 0.4 },
        ],
      }),
    },
    {
      ms: 2800,
      label: H('IPsec thi encryption', 'IPsec से encryption', 'IPsec encryption'),
      text: {
        beginner: {
          gu: 'DMVPN tunnel GRE chhe — readable. Internet par jay to encrypt karvu padse. IPsec profile banavi ne tunnel interface par apply: `tunnel protection ipsec profile DMVPN_PROFILE`. Now GRE packets IPsec thi wrap thay. Pre-shared key ke PKI certificates thi authentication.',
          hi: 'DMVPN tunnel GRE है — readable। Internet पर जाए तो encrypt करना पड़े। IPsec profile बनाकर tunnel interface पर apply: `tunnel protection ipsec profile DMVPN_PROFILE`। Now GRE packets IPsec से wrap हों। Pre-shared key या PKI certificates से authentication।',
          en: 'DMVPN tunnel is GRE — readable. Over the internet it must be encrypted. Create an IPsec profile and apply to tunnel interface: `tunnel protection ipsec profile DMVPN_PROFILE`. Now GRE packets are wrapped by IPsec. Authentication via pre-shared key or PKI certificates.',
        },
        exam: {
          gu: '`crypto ikev2 keyring`, `crypto ikev2 profile`, `crypto ipsec profile DMVPN_PROFILE` → tunnel par apply. Transform set `esp-aes 256 esp-sha-hmac`. IKEv2 preferred over IKEv1.',
          hi: '`crypto ikev2 keyring`, `crypto ikev2 profile`, `crypto ipsec profile DMVPN_PROFILE` → tunnel पर apply। Transform set `esp-aes 256 esp-sha-hmac`। IKEv2 preferred over IKEv1।',
          en: '`crypto ikev2 keyring`, `crypto ikev2 profile`, `crypto ipsec profile DMVPN_PROFILE` → apply on tunnel. Transform set `esp-aes 256 esp-sha-hmac`. IKEv2 preferred over IKEv1.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'hub', x: 450, y: 200, type: 'router' as const, label: 'Hub', sub: 'GRE + IPsec', accent: 'var(--nq-ok)', pulse: true },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'DMVPN 50+ sites na hub-and-spoke VPN ne scalable banave: mGRE ek interface par ghana destinations, NHRP spokes ne hub par dynamically register kare, Phase 3 ma spokes direct ek bijja saathe vaat kare. IPsec profile thi encryption. Enterprise WAN ne ISP-dependent ma scalable banave.',
    hi: 'DMVPN 50+ sites के hub-and-spoke VPN को scalable बनाए: mGRE एक interface पर कई destinations, NHRP spokes को hub पर dynamically register करे, Phase 3 में spokes direct एक-दूसरे से बात करें। IPsec profile से encryption। Enterprise WAN को ISP-dependent में scalable बनाए।',
    en: 'DMVPN scales 50+ site hub-and-spoke VPN: mGRE for many destinations on one interface, NHRP registers spokes dynamically at the hub, Phase 3 lets spokes talk directly. IPsec profile for encryption. Makes enterprise WAN scalable over any ISP.',
  },
  check: {
    q: H(
      'DMVPN Phase 3 ma spokes directly ek bijja saathe vaat kare. Hub nu role?',
      'DMVPN Phase 3 में spokes direct एक-दूसरे से बात करें। Hub का role?',
      'In DMVPN Phase 3 spokes talk directly. What is the hub’s role?',
    ),
    options: [
      H('NHRP server ane initial routing — pachhi spokes direct chale', 'NHRP server और initial routing — फिर spokes direct चलें', 'NHRP server and initial routing — then spokes go direct'),
      H('Fakt backup', 'केवल backup', 'Backup only'),
      H('Nothing — hub kadhi nakhvanu', 'कुछ नहीं — hub हटाना', 'Nothing — remove the hub'),
    ],
    answer: 0,
    explain: H(
      'Phase 3 ma hub NHS (NHRP server) tarike kaam kare — spokes register ane address resolve karva. Pehla packet hub par jay, hub spoke ne redirect kare direct path aape. Subsequent packets spoke-to-spoke direct, hub involvement vagar.',
      'Phase 3 में hub NHS (NHRP server) के रूप में काम करे — spokes register और address resolve करें। पहला packet hub पर जाए, hub spoke को redirect करके direct path बताए। Subsequent packets spoke-to-spoke direct, hub involvement के बिना।',
      'In Phase 3 the hub acts as NHS (NHRP server) — spokes register and resolve addresses. The first packet goes to the hub, which redirects the spoke to the direct path. Subsequent packets go spoke-to-spoke directly, without hub involvement.',
    ),
  },
}

/* ═══════════════════ p3l5 · MPLS and MP-BGP VPN ═══════════════════ */

export const p3l5: LessonSpec = {
  why: {
    gu: 'Service provider ne 10,000 customers ne connect karva chhe, darek nu potanu VPN. Darek customer na pocha je 10.0.0.0/8 hoy — overlap, VRF ni jarur. Ane darek flow mate separate tunnel manage karvanu non-feasible. MPLS labels thi fast forwarding, MP-BGP customer VRFs ne carry kare — a classic SP VPN model.',
    hi: 'Service provider को 10,000 customers को connect करना — हर एक का अपना VPN। हर customer का 10.0.0.0/8 overlap हो — VRF की ज़रूरत। और हर flow के लिए अलग tunnel manage करना non-feasible। MPLS labels से fast forwarding, MP-BGP customer VRFs carry करे — classic SP VPN model।',
    en: 'A service provider must connect 10,000 customers, each with their own VPN. Each customer’s 10.0.0.0/8 overlaps — VRF needed. Managing a tunnel per flow is infeasible. MPLS labels for fast forwarding, MP-BGP carries customer VRFs — the classic SP VPN model.',
  },
  steps: [
    {
      ms: 3000,
      label: H('MPLS — labels, nahi IP lookup', 'MPLS — labels, न कि IP lookup', 'MPLS — labels, not IP lookup'),
      text: {
        beginner: {
          gu: 'Traditional routing e dar hop par IP destination lookup — slow (longest-prefix match on full table). MPLS packet ni upar 32-bit label lagave, aney SP network ma label j vanchvani, IP nahi. Label switching super-fast kem ke hardware ma. Forwarding decisions label swap kare: ingress label 100 → egress label 200 → next hop.',
          hi: 'Traditional routing हर hop पर IP destination lookup — slow (longest-prefix match on full table)। MPLS packet के ऊपर 32-bit label लगाए, और SP network में केवल label पढ़ी जाए, IP नहीं। Label switching super-fast क्योंकि hardware में। Forwarding decisions label swap करें: ingress label 100 → egress label 200 → next hop।',
          en: 'Traditional routing does IP lookup at every hop — slow (longest-prefix match on full table). MPLS puts a 32-bit label on the packet, and the SP network reads only the label, not the IP. Label switching is super-fast because it is in hardware. Forwarding decisions swap labels: ingress label 100 → egress label 200 → next hop.',
        },
        exam: {
          gu: 'LDP (Label Distribution Protocol) labels distribute kare. Label stack: multiple labels nested (outer = transport, inner = VPN). LSR (Label Switch Router) core ma, LER (Label Edge Router) border par.',
          hi: 'LDP (Label Distribution Protocol) labels distribute करे। Label stack: multiple labels nested (outer = transport, inner = VPN)। LSR (Label Switch Router) core में, LER (Label Edge Router) border पर।',
          en: 'LDP (Label Distribution Protocol) distributes labels. Label stack: multiple labels nested (outer = transport, inner = VPN). LSR (Label Switch Router) in core, LER (Label Edge Router) at border.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ler1', x: 180, y: 220, type: 'router' as const, label: 'LER', sub: 'push label', accent: CCNA },
          { id: 'lsr', x: 450, y: 220, type: 'router' as const, label: 'LSR', sub: 'swap label', accent: CCNP, pulse: t > 0.3 },
          { id: 'ler2', x: 720, y: 220, type: 'router' as const, label: 'LER', sub: 'pop label', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'ler1', to: 'lsr', state: 'up', flowing: t > 0.2, label: 'L100' },
          { id: 'b', from: 'lsr', to: 'ler2', state: 'up', flowing: t > 0.4, label: 'L200' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('VRF ane RD, RT', 'VRF और RD, RT', 'VRF and RD, RT'),
      text: {
        beginner: {
          gu: 'Customer A ane Customer B ne same 10.0.0.0/8 chhe. SP e ne separate VRFs ma rakhe — pan single MP-BGP table ma carry karvi chhe. Solution: Route Distinguisher (RD) prefix ne unique banave: Customer A ni 10.0.0.0/8 banne 65001:1:10.0.0.0/8, Customer B ni 65001:2:10.0.0.0/8. Route Target (RT) VRF import/export control kare.',
          hi: 'Customer A और Customer B के पास same 10.0.0.0/8 है। SP उन्हें separate VRFs में रखे — पर single MP-BGP table में carry करना है। Solution: Route Distinguisher (RD) prefix को unique बनाए: Customer A की 10.0.0.0/8 बने 65001:1:10.0.0.0/8, Customer B की 65001:2:10.0.0.0/8। Route Target (RT) VRF import/export control करे।',
          en: 'Customer A and Customer B both have 10.0.0.0/8. SP keeps them in separate VRFs — but must carry them in a single MP-BGP table. Solution: Route Distinguisher (RD) makes the prefix unique: Customer A’s 10.0.0.0/8 becomes 65001:1:10.0.0.0/8, Customer B’s becomes 65001:2:10.0.0.0/8. Route Target (RT) controls VRF import/export.',
        },
        exam: {
          gu: 'RD route unique banave (per-VRF). RT policy carry kare (per-prefix community). Common design: RD = RT. Hub-and-spoke ma RT different kari ne spoke-to-spoke prevent kari shakay.',
          hi: 'RD route unique बनाए (per-VRF)। RT policy carry करे (per-prefix community)। Common design: RD = RT। Hub-and-spoke में RT different करके spoke-to-spoke prevent कर सकें।',
          en: 'RD makes the route unique (per-VRF). RT carries policy (per-prefix community). Common design: RD = RT. Different RTs can prevent spoke-to-spoke in hub-and-spoke.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'ca', x: 180, y: 120, type: 'cloud' as const, label: 'Cust A VPN', sub: '10.0.0.0/8', accent: BEG },
          { id: 'cb', x: 180, y: 320, type: 'cloud' as const, label: 'Cust B VPN', sub: '10.0.0.0/8', accent: WARN },
          { id: 'pe', x: 450, y: 220, type: 'router' as const, label: 'PE', sub: 'VRF A, VRF B', accent: CCNP, pulse: true },
          { id: 'mp', x: 750, y: 220, type: 'server' as const, label: 'MP-BGP', sub: 'RD : prefix', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'ca', to: 'pe', state: 'up' },
          { id: 'b', from: 'cb', to: 'pe', state: 'up' },
          { id: 'c', from: 'pe', to: 'mp', state: 'up' },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('PE, P, CE roles', 'PE, P, CE roles', 'PE, P, CE roles'),
      text: {
        beginner: {
          gu: 'MPLS VPN ma three roles: CE (Customer Edge) customer no router, SP ni bahar. PE (Provider Edge) SP no border router — customer saathe direct peering, VRF rakhe. P (Provider core) SP no core — labels switch kare, customer routes ni khabar pan nathi (scale!). Simple model, clean separation.',
          hi: 'MPLS VPN में तीन roles: CE (Customer Edge) customer का router, SP के बाहर। PE (Provider Edge) SP का border router — customer से direct peering, VRF रखे। P (Provider core) SP का core — labels switch करे, customer routes की खबर भी नहीं (scale!)। Simple model, clean separation।',
          en: 'MPLS VPN has three roles: CE (Customer Edge) is the customer router, outside SP. PE (Provider Edge) is SP border router — direct peering with customer, holds VRF. P (Provider core) is SP’s core — switches labels, has no knowledge of customer routes (scale!). Simple model, clean separation.',
        },
        exam: {
          gu: 'Scalability nu secret: P routers full Internet routes nathi carry karta — fakt SP ni internal (P/PE loopbacks) ane labels. Customer routes fakt PE par VRFs ma. VPN separation RD/RT ane labels thi.',
          hi: 'Scalability का secret: P routers full Internet routes नहीं carry करें — केवल SP की internal (P/PE loopbacks) और labels। Customer routes केवल PE पर VRFs में। VPN separation RD/RT और labels से।',
          en: 'Scalability secret: P routers do not carry full internet routes — only SP internal (P/PE loopbacks) and labels. Customer routes only on PE in VRFs. VPN separation via RD/RT and labels.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'ce1', x: 100, y: 200, type: 'router' as const, label: 'CE', accent: BEG },
          { id: 'pe1', x: 280, y: 200, type: 'router' as const, label: 'PE', accent: CCNA, pulse: true },
          { id: 'p1', x: 450, y: 200, type: 'router' as const, label: 'P', accent: CCNP },
          { id: 'p2', x: 620, y: 200, type: 'router' as const, label: 'P', accent: CCNP },
          { id: 'pe2', x: 790, y: 200, type: 'router' as const, label: 'PE', accent: CCNA, pulse: true },
          { id: 'ce2', x: 970, y: 200, type: 'router' as const, label: 'CE', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'ce1', to: 'pe1', state: 'up' },
          { id: 'b', from: 'pe1', to: 'p1', state: 'up' },
          { id: 'c', from: 'p1', to: 'p2', state: 'up' },
          { id: 'd', from: 'p2', to: 'pe2', state: 'up' },
          { id: 'e', from: 'pe2', to: 'ce2', state: 'up' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'MPLS VPN = labels (fast forwarding) + VRF (separation) + MP-BGP (customer routes carry) + RD/RT (overlap aney policy). Service provider thi 10,000 customer VPN scale thai jay. Enterprise mate lukhvani: tama ISP MPLS VPN product offer karti hoy to badha branches ne fast, reliable WAN male — tunnels manage karva nathi.',
    hi: 'MPLS VPN = labels (fast forwarding) + VRF (separation) + MP-BGP (customer routes carry) + RD/RT (overlap and policy)। Service provider से 10,000 customer VPN scale हों। Enterprise के लिए: अपनी ISP MPLS VPN product offer करती हो तो सारी branches को fast, reliable WAN मिले — tunnels manage नहीं करने।',
    en: 'MPLS VPN = labels (fast forwarding) + VRF (separation) + MP-BGP (carries customer routes) + RD/RT (overlap and policy). Service provider scales 10,000 customer VPNs. For enterprise: if your ISP offers MPLS VPN, all branches get fast, reliable WAN — no tunnels to manage.',
  },
  check: {
    q: H(
      'MPLS VPN ma do customers no overlapping 10.0.0.0/8 chhe. SP keva separate rakhe?',
      'MPLS VPN में दो customers का overlapping 10.0.0.0/8 है। SP कैसे separate रखे?',
      'MPLS VPN has two customers with overlapping 10.0.0.0/8. How does the SP keep them separate?',
    ),
    options: [
      H('VRF + Route Distinguisher (RD) prefix ne unique banave', 'VRF + Route Distinguisher (RD) prefix को unique बनाए', 'VRF + Route Distinguisher (RD) makes the prefix unique'),
      H('NAT thi customer IPs translate karvi', 'NAT से customer IPs translate करें', 'NAT to translate customer IPs'),
      H('Fakt one customer accept karo', 'केवल एक customer accept करें', 'Accept only one customer'),
    ],
    answer: 0,
    explain: H(
      'VRF PE par per-customer routing table banave. MP-BGP ma carry karta pehla RD prefix ne unique banave: 65001:1:10.0.0.0/8 vs 65001:2:10.0.0.0/8. Bhine single BGP table ma ban tango prefixes exist kari shake — koi overlap nahi.',
      'VRF PE पर per-customer routing table बनाए। MP-BGP में carry करने से पहले RD prefix को unique बनाए: 65001:1:10.0.0.0/8 vs 65001:2:10.0.0.0/8। एक single BGP table में दोनों prefixes exist कर सकें — कोई overlap नहीं।',
      'VRF creates a per-customer routing table on PE. Before carrying in MP-BGP, RD makes the prefix unique: 65001:1:10.0.0.0/8 vs 65001:2:10.0.0.0/8. Both prefixes can exist in one BGP table — no overlap.',
    ),
  },
}

/* ═══════════════════ p3l6 · VRF-Lite and IP SLA ═══════════════════ */

export const p3l6: LessonSpec = {
  why: {
    gu: 'VRF-Lite enterprise ne ek router par multiple separate routing tables aape — without MPLS. Guest Wi-Fi ne corp network thi alag rakhvo chhe? Separate VRFs. Ane IP SLA problem check kare: "aa WAN link sachhu alive chhe ke ping response nathi aapta?" Static route tracking thi auto failover.',
    hi: 'VRF-Lite enterprise को एक router पर multiple separate routing tables दे — without MPLS। Guest Wi-Fi को corp network से अलग रखना है? Separate VRFs। और IP SLA check करे: "यह WAN link सच में alive है या ping response नहीं आ रहा?" Static route tracking से auto failover।',
    en: 'VRF-Lite gives an enterprise multiple separate routing tables on one router — without MPLS. Need to keep guest Wi-Fi apart from corp? Separate VRFs. And IP SLA checks: "is this WAN link really alive or not responding to pings?" Static route tracking → auto failover.',
  },
  steps: [
    {
      ms: 3000,
      label: H('VRF-Lite — MPLS vagar VRF', 'VRF-Lite — MPLS के बिना VRF', 'VRF-Lite — VRF without MPLS'),
      text: {
        beginner: {
          gu: 'Full MPLS VPN complex chhe — MP-BGP, labels, RD, RT. Enterprise ne ek j router par 2-3 VRFs joiyee (corp, guest, IoT). VRF-Lite e simple answer: VRF features (separate table, separate interfaces) pan MPLS vagar. Routing protocols VRF-aware chalaav: `router ospf 10 vrf GUEST`.',
          hi: 'Full MPLS VPN complex है — MP-BGP, labels, RD, RT। Enterprise को एक ही router पर 2-3 VRFs चाहिए (corp, guest, IoT)। VRF-Lite simple answer: VRF features (separate table, separate interfaces) पर MPLS के बिना। Routing protocols VRF-aware चलाएं: `router ospf 10 vrf GUEST`।',
          en: 'Full MPLS VPN is complex — MP-BGP, labels, RD, RT. Enterprise just needs 2-3 VRFs on one router (corp, guest, IoT). VRF-Lite is the simple answer: VRF features (separate table, separate interfaces) without MPLS. Run routing protocols VRF-aware: `router ospf 10 vrf GUEST`.',
        },
        exam: {
          gu: '`ip vrf CORP` (old) ya `vrf definition CORP` (new, address-family aware). Interface par `vrf forwarding CORP`. Troubleshooting: `show ip route vrf CORP`, `ping vrf CORP <ip>`.',
          hi: '`ip vrf CORP` (old) या `vrf definition CORP` (new, address-family aware)। Interface पर `vrf forwarding CORP`। Troubleshooting: `show ip route vrf CORP`, `ping vrf CORP <ip>`।',
          en: '`ip vrf CORP` (old) or `vrf definition CORP` (new, address-family aware). Interface: `vrf forwarding CORP`. Troubleshoot: `show ip route vrf CORP`, `ping vrf CORP <ip>`.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'r', x: 450, y: 200, type: 'router' as const, label: 'R1', sub: 'corp + guest + iot', accent: CCNP, pulse: true },
          { id: 'c', x: 150, y: 100, type: 'pc' as const, label: 'Corp VRF', accent: CCNA },
          { id: 'g', x: 150, y: 220, type: 'pc' as const, label: 'Guest VRF', accent: WARN },
          { id: 'i', x: 150, y: 340, type: 'pc' as const, label: 'IoT VRF', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'c', to: 'r', state: 'up' },
          { id: 'b', from: 'g', to: 'r', state: 'up' },
          { id: 'd', from: 'i', to: 'r', state: 'up' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('IP SLA — probe thi link health', 'IP SLA — probe से link health', 'IP SLA — probe for link health'),
      text: {
        beginner: {
          gu: 'Problem: primary ISP ni interface up chhe, pan actual Internet connectivity down (upstream router problem). Router ne khabar nathi — static default route still alive, traffic blackhole. IP SLA periodically probe mokale (ping, HTTP, DNS) ane health check kare. Agar probe fail to object "down".',
          hi: 'समस्या: primary ISP का interface up है, पर actual Internet connectivity down (upstream router problem)। Router को पता नहीं — static default route अभी भी alive, traffic blackhole। IP SLA periodically probe भेजे (ping, HTTP, DNS) और health check करे। अगर probe fail तो object "down"।',
          en: 'Problem: primary ISP interface is up, but actual internet connectivity is down (upstream router problem). Router does not know — static default route still alive, traffic blackholes. IP SLA periodically sends probes (ping, HTTP, DNS) and checks health. Probe fails → object "down".',
        },
        exam: {
          gu: '`ip sla 1`, `icmp-echo <target>`, `frequency 10`, `ip sla schedule 1 start-time now life forever`. Track object: `track 1 ip sla 1 reachability`. Tracked object static route par apply: `ip route 0.0.0.0 0.0.0.0 <next-hop> track 1`.',
          hi: '`ip sla 1`, `icmp-echo <target>`, `frequency 10`, `ip sla schedule 1 start-time now life forever`। Track object: `track 1 ip sla 1 reachability`। Tracked object static route पर apply: `ip route 0.0.0.0 0.0.0.0 <next-hop> track 1`।',
          en: '`ip sla 1`, `icmp-echo <target>`, `frequency 10`, `ip sla schedule 1 start-time now life forever`. Track object: `track 1 ip sla 1 reachability`. Apply tracked object to static route: `ip route 0.0.0.0 0.0.0.0 <next-hop> track 1`.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r', x: 180, y: 200, type: 'router' as const, label: 'R1', sub: 'IP SLA probing', accent: CCNA, pulse: true },
          { id: 'tgt', x: 600, y: 200, type: 'server' as const, label: '8.8.8.8', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'r', to: 'tgt', state: 'up', flowing: t > 0.2 },
        ],
        packets:
          t > 0.2
            ? [{ id: 'p', from: 'r', to: 'tgt', t: 0.1 + ease((t - 0.2) / 0.8) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'ping' }]
            : [],
      }),
    },
    {
      ms: 3200,
      label: H('Tracked static route thi failover', 'Tracked static route से failover', 'Tracked static route failover'),
      text: {
        beginner: {
          gu: 'Combined magic: Primary default route track 1 par bandh — agar IP SLA probe fail thai to route automatic withdraw thai jay routing table ma thi. Backup floating static route (higher AD) activate thai jay. Few seconds ma seamless failover. User to khabar j nathi padti.',
          hi: 'Combined magic: Primary default route track 1 पर बंधा — अगर IP SLA probe fail हो तो route automatic withdraw हो routing table से। Backup floating static route (higher AD) activate हो जाए। Few seconds में seamless failover। User को पता भी नहीं चले।',
          en: 'Combined magic: primary default route tied to track 1 — if IP SLA probe fails, route auto-withdraws from routing table. Backup floating static route (higher AD) activates. Seamless failover in a few seconds. User never knows.',
        },
        exam: {
          gu: '`ip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1` (primary, AD 1). `ip route 0.0.0.0 0.0.0.0 198.51.100.1 100` (backup, AD 100). Primary down → secondary install. Recovery automatic jyare probe pachhi start thay.',
          hi: '`ip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1` (primary, AD 1)। `ip route 0.0.0.0 0.0.0.0 198.51.100.1 100` (backup, AD 100)। Primary down → secondary install। Recovery automatic जब probe फिर start हो।',
          en: '`ip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1` (primary, AD 1). `ip route 0.0.0.0 0.0.0.0 198.51.100.1 100` (backup, AD 100). Primary down → secondary installs. Recovery automatic when probe starts again.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r', x: 180, y: 200, type: 'router' as const, label: 'R1', accent: CCNA },
          { id: 'p', x: 500, y: 100, type: 'cloud' as const, label: 'Primary ISP', sub: t > 0.4 ? 'probe fail ✕' : 'alive', accent: t > 0.4 ? 'var(--nq-err)' : 'var(--nq-ok)' },
          { id: 'b', x: 500, y: 300, type: 'cloud' as const, label: 'Backup ISP', sub: t > 0.4 ? 'active' : 'standby', accent: t > 0.4 ? 'var(--nq-ok)' : WARN, pulse: t > 0.4 },
        ],
        links: [
          { id: 'pa', from: 'r', to: 'p', state: t > 0.4 ? 'down' : 'up', flowing: t < 0.4 },
          { id: 'ba', from: 'r', to: 'b', state: 'up', flowing: t > 0.4 },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'VRF-Lite enterprise ne ek router par separate routing tables aape — MPLS vagar, corp-guest-IoT isolation sahelo. IP SLA probes thi real link health check kare, tracked static route automatic failover kari aape — "link up but dead" problem solve. Combined, resilient WAN connectivity.',
    hi: 'VRF-Lite enterprise को एक router पर separate routing tables दे — MPLS बिना, corp-guest-IoT isolation आसान। IP SLA probes से real link health check करे, tracked static route automatic failover कर दे — "link up but dead" problem हल। Combined, resilient WAN connectivity।',
    en: 'VRF-Lite gives enterprise separate routing tables on one router — without MPLS, easy corp-guest-IoT isolation. IP SLA probes check real link health, tracked static routes auto-failover — solves the "link up but dead" problem. Together: resilient WAN connectivity.',
  },
  check: {
    q: H(
      'Primary ISP ni interface up chhe pan Internet unreachable. Static default route hon the still active — traffic blackhole. Fix?',
      'Primary ISP का interface up है पर Internet unreachable। Static default route अभी भी active — traffic blackhole। Fix?',
      'Primary ISP interface is up but internet is unreachable. Static default route is still active — traffic blackholes. Fix?',
    ),
    options: [
      H('IP SLA probe + tracked static route', 'IP SLA probe + tracked static route', 'IP SLA probe + tracked static route'),
      H('Change to dynamic routing (BGP)', 'Change to dynamic routing (BGP)', 'Change to dynamic routing (BGP)'),
      H('Manually monitor ane change', 'Manually monitor और change', 'Manually monitor and change'),
    ],
    answer: 0,
    explain: H(
      'Static route fakat interface up/down jue — upstream failure detect nathi kare. IP SLA periodically ping 8.8.8.8 ke bijju reliable host. Tracked object static route ne auto-withdraw kare agar probe fail. Backup route (higher AD) automatic install thai jay.',
      'Static route केवल interface up/down देखे — upstream failure detect न करे। IP SLA periodically ping 8.8.8.8 या कोई reliable host। Tracked object static route को auto-withdraw करे अगर probe fail। Backup route (higher AD) automatic install हो।',
      'Static route only checks interface up/down — does not detect upstream failure. IP SLA periodically pings 8.8.8.8 or another reliable host. Tracked object auto-withdraws the static route if probe fails. Backup route (higher AD) installs automatically.',
    ),
  },
}
