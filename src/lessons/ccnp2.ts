import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const WARN = 'var(--nq-warn)'
const H = (gu: string, hi: string, en: string) => ({ gu, hi, en })

/* ═══════════════════ p2l1 · Advanced STP — RSTP and MST ═══════════════════ */

export const p2l1: LessonSpec = {
  why: {
    gu: 'જૂનું STP (802.1D) loop પકડતું હતું — પણ convergence 30-50 seconds. એક switch પડે ને આખી ઓફિસ અડધી મિનિટ માટે બંધ. RSTP એ ઝડપ લાવ્યો, MST એ scale લાવ્યો.',
    hi: 'पुराना STP (802.1D) loop पकड़ता था — पर convergence 30-50 seconds। एक switch गिरे और पूरी ऑफिस आधी मिनट बंद। RSTP ने तेज़ी लायी, MST ने scale।',
    en: 'Old STP (802.1D) caught loops — but convergence took 30-50 seconds. One switch fails and the whole office is down for half a minute. RSTP brought speed; MST brought scale.',
  },
  steps: [
    {
      ms: 2800,
      label: H('જૂનું STP — 50 second convergence', 'पुराना STP — 50 second convergence', 'Old STP — 50-second convergence'),
      text: {
        beginner: {
          gu: 'Classic STP માં port ને listen (15s) → learn (15s) → forward સુધી જવા 30 seconds. Topology change થાય અને BPDUs ફરી ફેલાય તો કુલ 50 seconds સુધી user ને ping fail દેખાય. આજના business માટે અસ્વીકાર્ય.',
          hi: 'Classic STP में port को listen (15s) → learn (15s) → forward तक जाने में 30 seconds। Topology change हो और BPDUs फिर फैलें तो कुल 50 seconds तक user को ping fail दिखे। आज के business के लिए अस्वीकार्य।',
          en: 'In classic STP a port takes listen (15s) → learn (15s) → forward — 30 seconds. On a topology change with BPDU reflooding it adds up to 50 seconds of ping failure. Unacceptable for modern business.',
        },
        exam: {
          gu: '802.1D timers: Hello 2s, MaxAge 20s, Forward Delay 15s. Port states: Blocking, Listening, Learning, Forwarding, Disabled.',
          hi: '802.1D timers: Hello 2s, MaxAge 20s, Forward Delay 15s। Port states: Blocking, Listening, Learning, Forwarding, Disabled।',
          en: '802.1D timers: Hello 2s, MaxAge 20s, Forward Delay 15s. Port states: Blocking, Listening, Learning, Forwarding, Disabled.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's1', x: 250, y: 180, type: 'switch' as const, label: 'SW1', accent: CCNA },
          { id: 's2', x: 650, y: 180, type: 'switch' as const, label: 'SW2', accent: CCNA },
          { id: 's3', x: 450, y: 330, type: 'switch' as const, label: 'SW3', sub: t > 0.3 ? 'blocked → listen → learn → forward' : 'blocked', accent: WARN, pulse: true },
        ],
        links: [
          { id: 'a', from: 's1', to: 's2', state: 'up' },
          { id: 'b', from: 's1', to: 's3', state: 'up' },
          { id: 'c', from: 's2', to: 's3', state: t > 0.3 ? 'up' : 'idle', label: t > 0.3 ? '50s wait' : 'blocked' },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('RSTP — sub-second recovery', 'RSTP — sub-second recovery', 'RSTP — sub-second recovery'),
      text: {
        beginner: {
          gu: 'RSTP (802.1w) એ listen અને learn બંને દૂર કર્યા. Port હવે તરત forwarding માં જઈ શકે — proposal/agreement handshake થી. Topology change 1-2 seconds, પચાસ નહીં. Alternate અને Backup port તૈયાર રાહ જુએ, ready to replace.',
          hi: 'RSTP (802.1w) ने listen और learn दोनों हटा दिए। Port अब तुरंत forwarding में जा सके — proposal/agreement handshake से। Topology change 1-2 seconds, पचास नहीं। Alternate और Backup port तैयार इंतज़ार करें, ready to replace।',
          en: 'RSTP (802.1w) removed both listen and learn. A port can go straight to forwarding — via a proposal/agreement handshake. Topology change takes 1-2 seconds, not fifty. Alternate and Backup ports wait ready to replace.',
        },
        exam: {
          gu: 'RSTP port roles: Root, Designated, Alternate (backup root), Backup (same segment ka backup). Port states: Discarding, Learning, Forwarding — ફક્ત ત્રણ. PortFast → Edge port.',
          hi: 'RSTP port roles: Root, Designated, Alternate (backup root), Backup (same segment का backup)। Port states: Discarding, Learning, Forwarding — केवल तीन। PortFast → Edge port।',
          en: 'RSTP port roles: Root, Designated, Alternate (backup root), Backup (backup for the same segment). Port states: Discarding, Learning, Forwarding — only three. PortFast becomes an Edge port.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's1', x: 250, y: 180, type: 'switch' as const, label: 'SW1', sub: 'Root', accent: 'var(--nq-ok)' },
          { id: 's2', x: 650, y: 180, type: 'switch' as const, label: 'SW2', accent: CCNA },
          { id: 's3', x: 450, y: 330, type: 'switch' as const, label: 'SW3', sub: t > 0.5 ? 'forwarding ✓' : 'alt', accent: t > 0.5 ? 'var(--nq-ok)' : WARN, pulse: t > 0.5 },
        ],
        links: [
          { id: 'a', from: 's1', to: 's2', state: 'up' },
          { id: 'b', from: 's1', to: 's3', state: 'up' },
          { id: 'c', from: 's2', to: 's3', state: t > 0.3 ? 'up' : 'idle', label: t > 0.3 ? '< 1s' : 'alt', flowing: t > 0.5 },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('MST — ઘણી VLAN, થોડા instances', 'MST — कई VLAN, थोड़े instances', 'MST — many VLANs, few instances'),
      text: {
        beginner: {
          gu: 'PVST+ દરેક VLAN માટે એક STP instance ચલાવે — 500 VLAN = 500 instances = CPU પર ભારી બોજો. MST ઘણી VLAN ને એક instance માં group કરે: Instance 1 માં VLAN 10-50, Instance 2 માં VLAN 60-100. 500 VLAN થી 4-5 instances.',
          hi: 'PVST+ हर VLAN के लिए एक STP instance चलाए — 500 VLAN = 500 instances = CPU पर भारी बोझ। MST कई VLAN को एक instance में group करे: Instance 1 में VLAN 10-50, Instance 2 में VLAN 60-100। 500 VLAN से 4-5 instances।',
          en: 'PVST+ runs one STP instance per VLAN — 500 VLANs = 500 instances = a heavy CPU load. MST groups many VLANs into one instance: Instance 1 holds VLAN 10-50, Instance 2 holds VLAN 60-100. From 500 VLANs down to 4-5 instances.',
        },
        exam: {
          gu: 'MST region: switches with matching MST configuration name, revision number, VLAN-to-instance mapping. IST (Internal Spanning Tree) = Instance 0, બહારથી region દેખાય એક single switch જેવું.',
          hi: 'MST region: switches with matching MST configuration name, revision number, VLAN-to-instance mapping। IST (Internal Spanning Tree) = Instance 0, बाहर से region एक single switch जैसा दिखे।',
          en: 'MST region: switches with matching MST configuration name, revision number and VLAN-to-instance mapping. IST (Internal Spanning Tree) = Instance 0; from outside, a region looks like a single switch.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'i1', x: 250, y: 100, type: 'switch' as const, label: 'Instance 1', sub: 'VLAN 10-50', accent: BEG },
          { id: 'i2', x: 650, y: 100, type: 'switch' as const, label: 'Instance 2', sub: 'VLAN 60-100', accent: CCNA },
          { id: 'i3', x: 250, y: 280, type: 'switch' as const, label: 'Instance 3', sub: 'VLAN 110-150', accent: CCNP },
          { id: 'i0', x: 650, y: 280, type: 'switch' as const, label: 'Instance 0 (IST)', sub: 'defaults', accent: WARN },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('Load balancing VLAN થી', 'Load balancing VLAN से', 'Load balancing by VLAN'),
      text: {
        beginner: {
          gu: 'MST નો મજાનો ફાયદો: અલગ instances અલગ root પસંદ કરી શકે. Instance 1 નો root SW1, Instance 2 નો root SW2. એટલે VLAN 10-50 નો traffic SW1 તરફ, VLAN 60-100 નો traffic SW2 તરફ — બે uplinks બંને busy, કોઈ idle નહીં.',
          hi: 'MST का मज़ेदार फायदा: अलग instances अलग root चुन सकें। Instance 1 का root SW1, Instance 2 का root SW2। तो VLAN 10-50 का traffic SW1 की तरफ, VLAN 60-100 का traffic SW2 की तरफ — दो uplinks दोनों busy, कोई idle नहीं।',
          en: 'A neat MST benefit: different instances can pick different roots. Instance 1’s root is SW1, Instance 2’s root is SW2. So VLAN 10-50 traffic goes toward SW1 and VLAN 60-100 toward SW2 — both uplinks busy, neither idle.',
        },
        exam: {
          gu: '`spanning-tree mst 1 priority 4096` — lower priority = more likely root. દરેક instance માટે independent root bridge election. Industry standard; Cisco હવે Rapid-PVST+ ને default રાખે પણ મોટા networks MST.',
          hi: '`spanning-tree mst 1 priority 4096` — lower priority = more likely root। हर instance के लिए independent root bridge election। Industry standard; Cisco अब Rapid-PVST+ default रखे पर बड़े networks MST।',
          en: '`spanning-tree mst 1 priority 4096` — lower priority = more likely root. Independent root-bridge election per instance. The industry standard; Cisco defaults to Rapid-PVST+ now but large networks run MST.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 's1', x: 250, y: 150, type: 'switch' as const, label: 'SW1', sub: 'root for inst 1', accent: 'var(--nq-ok)', pulse: true },
          { id: 's2', x: 650, y: 150, type: 'switch' as const, label: 'SW2', sub: 'root for inst 2', accent: 'var(--nq-ok)', pulse: true },
          { id: 'a1', x: 250, y: 320, type: 'switch' as const, label: 'Access', accent: CCNA },
          { id: 'a2', x: 650, y: 320, type: 'switch' as const, label: 'Access', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 's1', to: 'a1', state: 'up', label: 'VLAN 10-50', flowing: true },
          { id: 'b', from: 's1', to: 'a2', state: 'up', flowing: true },
          { id: 'c', from: 's2', to: 'a1', state: 'up', flowing: true },
          { id: 'd', from: 's2', to: 'a2', state: 'up', label: 'VLAN 60-100', flowing: true },
          { id: 'e', from: 's1', to: 's2', state: 'up' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'RSTP (802.1w) ઝડપ: proposal/agreement thi sub-second convergence. MST (802.1s) scale: ghani VLAN ne thoda instances ma group kare, CPU bachave, aney different instances different roots pasand kari load balance kare.',
    hi: 'RSTP (802.1w) तेज़ी: proposal/agreement से sub-second convergence। MST (802.1s) scale: कई VLAN को थोड़े instances में group करे, CPU बचाए, और different instances different roots चुनकर load balance करे।',
    en: 'RSTP (802.1w) for speed: proposal/agreement handshake brings sub-second convergence. MST (802.1s) for scale: group many VLANs into a few instances to save CPU, and different instances pick different roots to load-balance.',
  },
  check: {
    q: H(
      '500 VLAN છે. દરેક VLAN માટે અલગ STP instance ચલાવવું stale thai gayu chhe. Replacement?',
      '500 VLAN हैं। हर VLAN के लिए अलग STP instance चलाना stale हो गया। Replacement?',
      'You have 500 VLANs. Running a separate STP instance per VLAN is stale. The replacement?',
    ),
    options: [
      H('MST — ghani VLAN ne thoda instances ma group kare', 'MST — कई VLAN को थोड़े instances में group करे', 'MST — groups many VLANs into a few instances'),
      H('Traditional 802.1D', 'Traditional 802.1D', 'Traditional 802.1D'),
      H('PVST+ j rakho — kashu vadhu nathi', 'PVST+ ही रखें — कुछ ज़्यादा नहीं', 'Keep PVST+ — there’s nothing more'),
    ],
    answer: 0,
    explain: H(
      'PVST+/Rapid-PVST+ dar VLAN ma ek instance chalave — 500 VLAN = 500 instances. MST jem 500 VLAN ne 4-5 instances ma group kare, CPU no bojo ghate aney maintenance saheli.',
      'PVST+/Rapid-PVST+ हर VLAN के लिए एक instance चलाए — 500 VLAN = 500 instances। MST 500 VLAN को 4-5 instances में group करे, CPU का बोझ घटे और maintenance आसान।',
      'PVST+/Rapid-PVST+ runs one instance per VLAN — 500 VLANs = 500 instances. MST groups 500 VLANs into 4-5 instances, cutting CPU load and easing maintenance.',
    ),
  },
}

/* ═══════════════════ p2l2 · OSPF Multi-Area in Depth ═══════════════════ */

export const p2l2: LessonSpec = {
  why: {
    gu: 'CCNA માં single-area OSPF જોયું — બધા routers area 0 માં. Enterprise માં 200 routers એક area માં નાખો તો SPF calculation હેવી, LSDB મોટી, convergence ધીમી. Multi-area એ problem solve કરે — area 0 backbone, બાકી areas એની સાથે attach.',
    hi: 'CCNA में single-area OSPF देखा — सारे routers area 0 में। Enterprise में 200 routers एक area में डालें तो SPF calculation heavy, LSDB बड़ी, convergence धीमी। Multi-area यह समस्या हल करे — area 0 backbone, बाकी areas उसके साथ attach।',
    en: 'In CCNA you saw single-area OSPF — all routers in area 0. In enterprise, putting 200 routers in one area makes SPF heavy, the LSDB huge, convergence slow. Multi-area fixes it — area 0 as backbone, other areas attach to it.',
  },
  steps: [
    {
      ms: 3000,
      label: H('LSA types — કોણ શું જાહેર કરે', 'LSA types — कौन क्या announce करे', 'LSA types — who announces what'),
      text: {
        beginner: {
          gu: 'LSA Type 1 (Router): દરેક router પોતાના links જાહેર કરે, area ની અંદર. Type 2 (Network): DR જાહેર કરે kai routers e segment par chhe. Type 3 (Summary): ABR એક area ની routes બીજા area માં advertise કરે. Type 5 (External): ASBR external routes advertise kare, baherthi redistribute thai.',
          hi: 'LSA Type 1 (Router): हर router अपने links announce करे, area के अंदर। Type 2 (Network): DR announce करे कि कौन से routers उस segment पर हैं। Type 3 (Summary): ABR एक area की routes दूसरे area में advertise करे। Type 5 (External): ASBR external routes advertise करे, बाहर से redistribute हुईं।',
          en: 'LSA Type 1 (Router): every router advertises its links inside the area. Type 2 (Network): the DR advertises which routers are on the segment. Type 3 (Summary): the ABR advertises one area’s routes into another. Type 5 (External): the ASBR advertises external routes redistributed from outside.',
        },
        exam: {
          gu: 'Type 4: ASBR ની reachability advertise કરે બીજા areas માં. Type 7: NSSA માં external routes (Type 5 ની જગ્યાએ). Type 1 અને 2 area ની અંદર જ રહે; Type 3, 4, 5, 7 ABR દ્વારા cross areas.',
          hi: 'Type 4: ASBR की reachability advertise करे दूसरे areas में। Type 7: NSSA में external routes (Type 5 की जगह)। Type 1 और 2 area के अंदर ही रहें; Type 3, 4, 5, 7 ABR द्वारा cross areas।',
          en: 'Type 4: advertises the ASBR’s reachability into other areas. Type 7: external routes in NSSAs (instead of Type 5). Type 1 and 2 stay inside the area; Type 3, 4, 5, 7 cross areas via the ABR.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'r1', x: 180, y: 180, type: 'router' as const, label: 'Area 1', accent: BEG },
          { id: 'abr', x: 450, y: 180, type: 'router' as const, label: 'ABR', sub: 'area 0 + 1', accent: CCNP, pulse: true },
          { id: 'r2', x: 720, y: 180, type: 'router' as const, label: 'Area 0', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'r1', to: 'abr', state: 'up', label: 'Type 1, 2' },
          { id: 'b', from: 'abr', to: 'r2', state: 'up', label: 'Type 3 (summary)' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Stub — external નહીં જોવી', 'Stub — external नहीं देखनी', 'Stub — no externals'),
      text: {
        beginner: {
          gu: 'Branch office ને Internet routes ની 500,000 entries ની શું જરૂર? એક default route થી કામ ચાલે. Stub area external LSAs (Type 5) block કરે — ABR default route (0.0.0.0) inject કરે. LSDB નાની, SPF ઝડપી.',
          hi: 'Branch office को Internet routes की 500,000 entries की क्या ज़रूरत? एक default route से काम चले। Stub area external LSAs (Type 5) block करे — ABR default route (0.0.0.0) inject करे। LSDB छोटी, SPF तेज़।',
          en: 'Why does a branch office need the 500,000 internet routes? One default route will do. Stub area blocks external LSAs (Type 5) — the ABR injects a default route (0.0.0.0). The LSDB stays small, SPF is fast.',
        },
        exam: {
          gu: '`area 10 stub` — Type 5 block, default injected. Totally Stubby (Cisco): `area 10 stub no-summary` — Type 3 પણ block, ફક્ત default. બધા stub routers એ જ configuration હોવું જોઈએ.',
          hi: '`area 10 stub` — Type 5 block, default injected। Totally Stubby (Cisco): `area 10 stub no-summary` — Type 3 भी block, केवल default। सारे stub routers पर यही configuration होना चाहिए।',
          en: '`area 10 stub` — Type 5 blocked, default injected. Totally Stubby (Cisco): `area 10 stub no-summary` — Type 3 also blocked, only default. Every router in the stub area must share the same configuration.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'ex', x: 180, y: 120, type: 'cloud' as const, label: 'Internet · 500k routes', accent: WARN },
          { id: 'asbr', x: 400, y: 200, type: 'router' as const, label: 'ASBR', accent: CCNP },
          { id: 'abr', x: 600, y: 200, type: 'router' as const, label: 'ABR', sub: 'injects default', accent: 'var(--nq-ok)', pulse: true },
          { id: 'stub', x: 820, y: 200, type: 'router' as const, label: 'Stub Area 10', sub: 'only default', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'ex', to: 'asbr', state: 'up' },
          { id: 'b', from: 'asbr', to: 'abr', state: 'up' },
          { id: 'c', from: 'abr', to: 'stub', state: 'up', label: '0.0.0.0/0' },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('NSSA — external inject with limits', 'NSSA — external inject with limits', 'NSSA — external inject with limits'),
      text: {
        beginner: {
          gu: 'Problem: stub area external routes ban kare. Pan tamara branch na ASBR par ek EIGRP redistribute kay chhe — e external route stub ma inject karvi che. NSSA (Not-So-Stubby Area) e solve kare: Type 7 LSA stub-like area ma external inject kare, ABR tene Type 5 ma convert karine bijja areas ma spread kare.',
          hi: 'समस्या: stub area external routes ban करे। पर आपके branch के ASBR पर एक EIGRP redistribute हो रही है — वह external route stub में inject करनी है। NSSA (Not-So-Stubby Area) यह हल करे: Type 7 LSA stub-like area में external inject करे, ABR उसे Type 5 में convert करके बाकी areas में फैलाए।',
          en: 'Problem: stub area bans externals. But your branch ASBR is redistributing some EIGRP — you need to inject that external into the stub. NSSA (Not-So-Stubby Area) solves it: Type 7 LSAs inject externals into a stub-like area, the ABR converts them to Type 5 to spread into other areas.',
        },
        exam: {
          gu: '`area 10 nssa`. ABR Type 7 → Type 5 translate kare backbone ma. Totally NSSA: `area 10 nssa no-summary` — Type 3 bhi block, local Type 7 chale.',
          hi: '`area 10 nssa`। ABR Type 7 → Type 5 translate करे backbone में। Totally NSSA: `area 10 nssa no-summary` — Type 3 भी block, local Type 7 चले।',
          en: '`area 10 nssa`. The ABR translates Type 7 → Type 5 into the backbone. Totally NSSA: `area 10 nssa no-summary` — Type 3 also blocked, local Type 7 stays.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'eigrp', x: 150, y: 300, type: 'router' as const, label: 'EIGRP', accent: WARN },
          { id: 'asbr', x: 320, y: 180, type: 'router' as const, label: 'ASBR', sub: 'in NSSA', accent: CCNP, pulse: true },
          { id: 'abr', x: 550, y: 180, type: 'router' as const, label: 'ABR', sub: 'T7 → T5', accent: 'var(--nq-ok)' },
          { id: 'back', x: 800, y: 180, type: 'router' as const, label: 'Area 0', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'eigrp', to: 'asbr', state: 'up', label: 'redistribute' },
          { id: 'b', from: 'asbr', to: 'abr', state: 'up', label: 'Type 7' },
          { id: 'c', from: 'abr', to: 'back', state: 'up', label: 'Type 5' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Summarization — upstream ne shant rakho', 'Summarization — upstream को शांत रखें', 'Summarisation — keep the upstream quiet'),
      text: {
        beginner: {
          gu: 'Area 1 ma 10.1.0.0/24 thi 10.1.15.0/24 — sixteen networks. Dar ek ni Type 3 LSA bijja areas ma jay to LSDB vadhe aney flap thay to tabah. ABR par summarize karo: `area 1 range 10.1.0.0 255.255.240.0` — ek j /20 LSA baki duniya ne malse.',
          hi: 'Area 1 में 10.1.0.0/24 से 10.1.15.0/24 — sixteen networks। हर एक की Type 3 LSA बाकी areas में जाए तो LSDB बढ़े और flap हो तो तबाह। ABR पर summarize करें: `area 1 range 10.1.0.0 255.255.240.0` — एक ही /20 LSA बाकी दुनिया को मिले।',
          en: 'Area 1 holds 10.1.0.0/24 through 10.1.15.0/24 — sixteen networks. One Type 3 LSA per network into other areas bloats the LSDB and churns on every flap. Summarise on the ABR: `area 1 range 10.1.0.0 255.255.240.0` — the rest of the world sees one /20 LSA.',
        },
        exam: {
          gu: 'Summarization ABR (inter-area) ane ASBR (external) par thay. Internal networks summarize kari ke upstream flap nahi dekhe. Discard route (`Null0`) automatic banavie che ABR, blackhole thi bachva.',
          hi: 'Summarization ABR (inter-area) और ASBR (external) पर हो। Internal networks summarize करने पर upstream flap न देखे। Discard route (`Null0`) ABR अपने आप बनाए, blackhole से बचने के लिए।',
          en: 'Summarisation happens on the ABR (inter-area) and the ASBR (external). Summarising internal networks hides flaps from the upstream. The ABR auto-creates a discard route (`Null0`) to prevent blackholes.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a1', x: 150, y: 100, type: 'router' as const, label: '10.1.1.0', accent: BEG },
          { id: 'a2', x: 150, y: 220, type: 'router' as const, label: '10.1.2.0', accent: BEG },
          { id: 'a3', x: 150, y: 340, type: 'router' as const, label: '10.1.15.0', accent: BEG },
          { id: 'abr', x: 450, y: 220, type: 'router' as const, label: 'ABR', sub: t > 0.4 ? 'advertises 10.1.0.0/20' : '16 LSAs', accent: t > 0.4 ? 'var(--nq-ok)' : WARN, pulse: true },
          { id: 'back', x: 750, y: 220, type: 'router' as const, label: 'Area 0', sub: t > 0.4 ? '1 route' : '16 routes', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'a1', to: 'abr', state: 'up' },
          { id: 'b', from: 'a2', to: 'abr', state: 'up' },
          { id: 'c', from: 'a3', to: 'abr', state: 'up' },
          { id: 'd', from: 'abr', to: 'back', state: 'up', label: t > 0.4 ? 'summary' : '16 LSAs', flowing: true },
        ],
      }),
    },
    {
      ms: 2800,
      label: H('Virtual link — discontiguous area 0', 'Virtual link — discontiguous area 0', 'Virtual link — discontiguous area 0'),
      text: {
        beginner: {
          gu: 'Rule: badha areas area 0 saathe directly jodva joie. Merger pachhi tame beein company nu area 0 inherit kari lidhu, aney tamara new area 0 saathe directly jodayelu nathi — e vachhe area 1 chhe. Virtual link temporary tunnel bane area 1 par thi, baki badha areas ne logically area 0 saathe jodva.',
          hi: 'Rule: सारे areas area 0 से directly जुड़े हों। Merger के बाद आपने दूसरी company का area 0 inherit कर लिया, और आपके नए area 0 से directly नहीं जुड़ा — बीच में area 1 है। Virtual link temporary tunnel बने area 1 पर, बाकी areas को logically area 0 से जोड़ने के लिए।',
          en: 'Rule: all areas must attach directly to area 0. After a merger you inherited another company’s area 0 that is not directly attached — area 1 sits between. A virtual link builds a temporary tunnel across area 1 to logically reconnect everything to area 0.',
        },
        exam: {
          gu: '`area 1 virtual-link <router-id>` ABR par — transit area 1 thai jay. Fix tarike use karo, permanent design nahi. Transit area stub na hovu joie.',
          hi: '`area 1 virtual-link <router-id>` ABR पर — transit area 1 बने। Fix के रूप में इस्तेमाल करें, permanent design नहीं। Transit area stub नहीं होना चाहिए।',
          en: '`area 1 virtual-link <router-id>` on the ABR — area 1 becomes transit. Use as a fix, not a permanent design. The transit area must not be a stub.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a0a', x: 180, y: 180, type: 'router' as const, label: 'Area 0 (new)', accent: CCNA },
          { id: 'mid', x: 450, y: 180, type: 'router' as const, label: 'Area 1', sub: 'transit', accent: CCNP, pulse: true },
          { id: 'a0b', x: 720, y: 180, type: 'router' as const, label: 'Area 0 (merged)', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'a0a', to: 'mid', state: 'up' },
          { id: 'b', from: 'mid', to: 'a0b', state: 'up' },
          { id: 'v', from: 'a0a', to: 'a0b', state: 'up', label: 'virtual link' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Multi-area OSPF scale aape: dar area ni potani LSDB, SPF, aney Type 1/2 LSA area ma j rahe. ABR Type 3 summary thi cross-area connect kare. Stub external block kare, NSSA external inject with limits, summarization thi upstream flap nathi joto. Virtual link e emergency fix.',
    hi: 'Multi-area OSPF scale दे: हर area की अपनी LSDB, SPF, और Type 1/2 LSA area में ही रहें। ABR Type 3 summary से cross-area connect करे। Stub external block करे, NSSA external inject with limits, summarization से upstream flap नहीं देखे। Virtual link emergency fix है।',
    en: 'Multi-area OSPF brings scale: each area has its own LSDB, SPF, and Type 1/2 LSAs stay inside. The ABR connects areas with Type 3 summaries. Stub blocks externals, NSSA injects externals under limits, summarisation hides flaps from the upstream. Virtual links are an emergency fix.',
  },
  check: {
    q: H(
      'Branch area ma external EIGRP redistribute karvi chhe, pan Internet na 500k routes nathi joitya. Ko aekat area type?',
      'Branch area में external EIGRP redistribute करनी है, पर Internet के 500k routes नहीं चाहिए। कौन सा area type?',
      'A branch area needs to redistribute external EIGRP but does not want the 500k internet routes. Which area type?',
    ),
    options: [
      H('NSSA', 'NSSA', 'NSSA'),
      H('Stub', 'Stub', 'Stub'),
      H('Totally Stubby', 'Totally Stubby', 'Totally Stubby'),
    ],
    answer: 0,
    explain: H(
      'Stub aney Totally Stubby external inject karva na j nathi aapta — Type 7 nathi chalaata. NSSA e khas kari aa use case mate: local external inject karva de (Type 7), bakina Type 5 block.',
      'Stub और Totally Stubby external inject करने ही नहीं देते — Type 7 नहीं चलाते। NSSA खासकर इसी use case के लिए: local external inject करने दे (Type 7), बाकी Type 5 block।',
      'Stub and Totally Stubby do not permit external injection — no Type 7. NSSA is designed for exactly this case: allow local external injection (Type 7), block the rest of Type 5.',
    ),
  },
}

/* ═══════════════════ p2l3 · EIGRP and DUAL in Depth ═══════════════════ */

export const p2l3: LessonSpec = {
  why: {
    gu: 'EIGRP Cisco nu proprietary (have open standard) advanced distance-vector protocol. OSPF kartaa saral configuration, fast convergence, aney DUAL algorithm je loop-free backup rastao pehlanthi j tyar rakhe — link ghate to tya j backup ma switch, 1 second ma.',
    hi: 'EIGRP Cisco का proprietary (अब open standard) advanced distance-vector protocol। OSPF से आसान configuration, fast convergence, और DUAL algorithm जो loop-free backup रास्ते पहले से ही तैयार रखे — link गिरे तो तुरंत backup में switch, 1 second में।',
    en: 'EIGRP is Cisco’s proprietary (now open) advanced distance-vector protocol. Simpler configuration than OSPF, fast convergence, and the DUAL algorithm keeps loop-free backup paths ready in advance — link drops, switch to backup in one second.',
  },
  steps: [
    {
      ms: 3000,
      label: H('Successor — mukhyo rasto', 'Successor — मुख्य रास्ता', 'Successor — the main path'),
      text: {
        beginner: {
          gu: 'EIGRP table ma dar network na mate "Successor" ek j hoy — e best next-hop router jenu feasible distance (FD) sauthi ochhu chhe. E routing table ma install thai jay, same bijja protocols jevu.',
          hi: 'EIGRP table में हर network के लिए "Successor" एक ही हो — वह best next-hop router जिसकी feasible distance (FD) सबसे कम है। वह routing table में install हो जाए, same बाकी protocols जैसे।',
          en: 'In an EIGRP table every network has one "Successor" — the best next-hop router, the one with the lowest feasible distance (FD). It installs into the routing table like any other protocol.',
        },
        exam: {
          gu: 'FD = total metric destination sudhi local router thi. Advertised Distance (AD) = neighbour thi destination sudhi, neighbour e report karyu. EIGRP metric: bandwidth, delay, (optionally load, reliability, MTU).',
          hi: 'FD = total metric destination तक local router से। Advertised Distance (AD) = neighbour से destination तक, neighbour ने report किया। EIGRP metric: bandwidth, delay, (optionally load, reliability, MTU)।',
          en: 'FD = total metric from the local router to the destination. Advertised Distance (AD) = from the neighbour to the destination, as reported. EIGRP metric: bandwidth and delay (optionally load, reliability, MTU).',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'me', x: 180, y: 220, type: 'router' as const, label: 'me', accent: CCNA },
          { id: 'n1', x: 450, y: 120, type: 'router' as const, label: 'Neighbor A', sub: 'FD 100 · Successor', accent: 'var(--nq-ok)', pulse: t > 0.3 },
          { id: 'n2', x: 450, y: 320, type: 'router' as const, label: 'Neighbor B', sub: 'FD 150 · FS?', accent: WARN },
          { id: 'd', x: 720, y: 220, type: 'server' as const, label: '10.9.9.0', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'me', to: 'n1', state: 'up', flowing: t > 0.3 },
          { id: 'b', from: 'me', to: 'n2', state: 'up' },
          { id: 'c', from: 'n1', to: 'd', state: 'up', flowing: t > 0.3 },
          { id: 'e', from: 'n2', to: 'd', state: 'up' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Feasible Successor — tayar backup', 'Feasible Successor — तैयार backup', 'Feasible Successor — the ready backup'),
      text: {
        beginner: {
          gu: 'Hu je loop-free backup pehlanthi j tyar rakhu — jena AD (neighbour thi destination) tamara FD (Successor sudhi) karta ochhi hoy. E guarantee karse ke pachhadi jay to loop nahi thay. Primary ghate to recompute nathi karvanu — Feasible Successor sidho install thay.',
          hi: 'यह loop-free backup पहले से तैयार रखे — जिसकी AD (neighbour से destination) आपके FD (Successor तक) से कम हो। यह guarantee करे कि पीछे न जाए तो loop न हो। Primary गिरे तो recompute नहीं करना — Feasible Successor सीधा install हो।',
          en: 'A loop-free backup kept ready — one whose AD (neighbour to destination) is less than your FD (via the Successor). That guarantees no loop. Primary fails? No recompute — the Feasible Successor installs directly.',
        },
        exam: {
          gu: 'Feasibility Condition: AD < FD. Agar koi neighbor FS qualify na kare, DUAL query send kare bijja neighbours ne — e slower path.',
          hi: 'Feasibility Condition: AD < FD। अगर कोई neighbor FS qualify न करे, DUAL query send करे बाकी neighbours को — वह slower path।',
          en: 'Feasibility Condition: AD < FD. If no neighbour qualifies as FS, DUAL sends a query to other neighbours — a slower path.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'me', x: 180, y: 220, type: 'router' as const, label: 'me', sub: 'FD 100', accent: CCNA },
          { id: 'n1', x: 450, y: 120, type: 'router' as const, label: 'A', sub: t > 0.3 ? 'down ✕' : 'Successor', accent: t > 0.3 ? 'var(--nq-err)' : 'var(--nq-ok)' },
          { id: 'n2', x: 450, y: 320, type: 'router' as const, label: 'B', sub: t > 0.3 ? 'now Successor' : 'FS (AD 80 < FD 100)', accent: t > 0.3 ? 'var(--nq-ok)' : BEG, pulse: t > 0.3 },
          { id: 'd', x: 720, y: 220, type: 'server' as const, label: '10.9.9.0', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'me', to: 'n1', state: t > 0.3 ? 'down' : 'up' },
          { id: 'b', from: 'me', to: 'n2', state: 'up', flowing: t > 0.3 },
          { id: 'c', from: 'n1', to: 'd', state: t > 0.3 ? 'down' : 'up' },
          { id: 'e', from: 'n2', to: 'd', state: 'up', flowing: t > 0.3 },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('Query scope — SIA nu dar', 'Query scope — SIA का डर', 'Query scope — the SIA risk'),
      text: {
        beginner: {
          gu: 'Agar FS nathi, DUAL query send kare badha neighbours ne: "10.9.9.0 mate tamari pase rasto chhe?" Darek neighbour reply aape, jyare badha reply aave tyare j local router aagad vadhe. Ek slow neighbour badha neighbours ne saathe atkaave — Stuck In Active (SIA) — 3 minutes ni problem.',
          hi: 'अगर FS नहीं, DUAL query send करे सारे neighbours को: "10.9.9.0 के लिए तुम्हारे पास रास्ता है?" हर neighbour reply दे, जब सारे reply आएं तब local router आगे बढ़े। एक slow neighbour सारे neighbours को अटकाए — Stuck In Active (SIA) — 3 minutes की problem।',
          en: 'With no FS, DUAL queries all neighbours: "do you have a path to 10.9.9.0?" Each neighbour replies, and the local router only advances when every reply is in. One slow neighbour holds up all neighbours — Stuck In Active (SIA) — a 3-minute problem.',
        },
        exam: {
          gu: 'Query boundary thi SIA ni chance ghate: stub routers (`eigrp stub`), summarization, aney route filtering. Stub router query ne forward nathi karto — leaf site sense bane.',
          hi: 'Query boundary से SIA की chance घटे: stub routers (`eigrp stub`), summarization, और route filtering। Stub router query को forward न करे — leaf site sense बने।',
          en: 'Query boundaries cut the SIA risk: stub routers (`eigrp stub`), summarisation, and route filtering. A stub router does not forward queries — makes sense on a leaf site.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'me', x: 180, y: 220, type: 'router' as const, label: 'me', sub: t > 0.3 ? 'querying' : undefined, accent: CCNA, pulse: t > 0.3 },
          { id: 'n1', x: 450, y: 100, type: 'router' as const, label: 'N1', accent: CCNA },
          { id: 'n2', x: 450, y: 220, type: 'router' as const, label: 'N2 slow', sub: t > 0.5 ? 'SIA risk' : undefined, accent: WARN },
          { id: 'n3', x: 450, y: 340, type: 'router' as const, label: 'N3', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'me', to: 'n1', state: 'up', flowing: t > 0.3 && t < 0.6 },
          { id: 'b', from: 'me', to: 'n2', state: 'up', flowing: t > 0.3 },
          { id: 'c', from: 'me', to: 'n3', state: 'up', flowing: t > 0.3 && t < 0.6 },
        ],
        packets:
          t > 0.3 && t < 0.6
            ? [
                { id: 'q1', from: 'me', to: 'n1', t: 0.1 + ease((t - 0.3) / 0.3) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'query' },
                { id: 'q2', from: 'me', to: 'n2', t: 0.1 + ease((t - 0.3) / 0.3) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'query' },
                { id: 'q3', from: 'me', to: 'n3', t: 0.1 + ease((t - 0.3) / 0.3) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'query' },
              ]
            : [],
      }),
    },
    {
      ms: 2800,
      label: H('Metric — bandwidth ane delay', 'Metric — bandwidth और delay', 'Metric — bandwidth and delay'),
      text: {
        beginner: {
          gu: 'EIGRP ni metric OSPF karta rich: bandwidth (bottleneck link ni, hop vahelanu nahi) + total delay. Fast link ne prefer, slow ne avoid. Formula: 256 × (10^7 / min-BW + sum-delay / 10).',
          hi: 'EIGRP की metric OSPF से rich: bandwidth (bottleneck link की, पहले hop की नहीं) + total delay। Fast link को prefer, slow को avoid। Formula: 256 × (10^7 / min-BW + sum-delay / 10)।',
          en: 'EIGRP’s metric is richer than OSPF’s: bandwidth (of the bottleneck link, not just the first hop) + total delay. Prefer fast links, avoid slow ones. Formula: 256 × (10^7 / min-BW + sum-delay / 10).',
        },
        exam: {
          gu: 'Wide metrics (EIGRP Named Mode): larger scale support kare, 100G+ links ne pan distinguish kare. Default K values: K1=K3=1, K2=K4=K5=0. Mismatch thi neighbour na bane.',
          hi: 'Wide metrics (EIGRP Named Mode): larger scale support करे, 100G+ links को भी distinguish करे। Default K values: K1=K3=1, K2=K4=K5=0। Mismatch से neighbour न बने।',
          en: 'Wide metrics (EIGRP Named Mode): support larger scale, distinguish 100G+ links too. Default K values: K1=K3=1, K2=K4=K5=0. A mismatch prevents neighbour formation.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'me', x: 180, y: 200, type: 'router' as const, label: 'me', accent: CCNA },
          { id: 'f', x: 450, y: 100, type: 'router' as const, label: 'via Fast', sub: '1Gbps · low delay · metric 1024', accent: 'var(--nq-ok)', pulse: true },
          { id: 's', x: 450, y: 300, type: 'router' as const, label: 'via Slow', sub: '10Mbps · higher delay · metric 100k', accent: WARN },
          { id: 'd', x: 720, y: 200, type: 'server' as const, label: 'dest', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'me', to: 'f', state: 'up', flowing: true },
          { id: 'b', from: 'me', to: 's', state: 'up' },
          { id: 'c', from: 'f', to: 'd', state: 'up', flowing: true },
          { id: 'e', from: 's', to: 'd', state: 'up' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'EIGRP ni ane: Successor mukhyo rasto, Feasible Successor loop-free backup pehlanthi tyar (AD < FD). FS male to sub-second failover; na male to DUAL query jay baaki neighbours ne — SIA risk. Metric bandwidth + delay par based. Stub routers query scope ghate aney SIA thi bachave.',
    hi: 'EIGRP की खासियत: Successor मुख्य रास्ता, Feasible Successor loop-free backup पहले से तैयार (AD < FD)। FS मिले तो sub-second failover; न मिले तो DUAL query जाए बाकी neighbours को — SIA risk। Metric bandwidth + delay पर based। Stub routers query scope घटाएं और SIA से बचाएं।',
    en: 'EIGRP in essence: Successor is the main path, Feasible Successor is the loop-free backup kept ready (AD < FD). FS available → sub-second failover; not available → DUAL queries other neighbours — SIA risk. Metric is based on bandwidth + delay. Stub routers cut query scope and avoid SIA.',
  },
  check: {
    q: H(
      'Successor ghate, pan Feasible Successor nathi. DUAL shu kare?',
      'Successor गिरे, पर Feasible Successor नहीं है। DUAL क्या करे?',
      'Successor fails and there is no Feasible Successor. What does DUAL do?',
    ),
    options: [
      H('Query mokale badha neighbours ne — slow path', 'Query भेजे सारे neighbours को — slow path', 'Sends queries to all neighbours — the slow path'),
      H('Routing table mathi kadhi nakhe', 'Routing table से निकाल दे', 'Removes it from the routing table'),
      H('FS vagar bhi FS tarike install kare', 'FS बिना भी FS के रूप में install करे', 'Installs anyway as FS'),
    ],
    answer: 0,
    explain: H(
      'FS pehlanthi tyar hoy to tarat install thai jay (sub-second). FS na hoy to DUAL "active state" ma jay aney badha neighbours ne query mokale — e replies aave tyare j aagad vadhe. Dhir neighbour hoy to SIA ni risk.',
      'FS पहले से तैयार हो तो तुरंत install हो (sub-second)। FS न हो तो DUAL "active state" में जाए और सारे neighbours को query भेजे — उनके replies आने पर ही आगे बढ़े। धीमा neighbour हो तो SIA की risk।',
      'With an FS ready, it installs instantly (sub-second). Without one, DUAL goes into "active state" and queries all neighbours — only advances when all replies are in. A slow neighbour means SIA risk.',
    ),
  },
}

/* ═══════════════════ p2l4 · BGP Fundamentals ═══════════════════ */

export const p2l4: LessonSpec = {
  why: {
    gu: 'BGP Internet ni spine chhe — 70+ lakh routes, 70,000 autonomous systems. OSPF/EIGRP ek organization ni andar chale (IGP), BGP badha organizations vachhe (EGP). State machine, attributes, policy — BGP enterprise ne multi-ISP, scale, aney traffic engineering ni kalpana aape.',
    hi: 'BGP Internet की spine है — 70+ लाख routes, 70,000 autonomous systems। OSPF/EIGRP एक organization के अंदर चले (IGP), BGP कई organizations के बीच (EGP)। State machine, attributes, policy — BGP enterprise को multi-ISP, scale, और traffic engineering की ताकत दे।',
    en: 'BGP is the internet’s spine — 7 lakh+ routes, 70,000 autonomous systems. OSPF/EIGRP run inside one organisation (IGP), BGP runs between organisations (EGP). State machine, attributes, policy — BGP gives enterprises multi-ISP, scale and traffic-engineering power.',
  },
  steps: [
    {
      ms: 3000,
      label: H('AS — autonomous system', 'AS — autonomous system', 'AS — autonomous system'),
      text: {
        beginner: {
          gu: 'AS ek organization no routing domain chhe — single policy thi chalatu network. Enterprise private AS (64512-65534) vaprey, ISP public AS (IANA thi assigned). Dar AS no apno number — aa number BGP ma identity chhe.',
          hi: 'AS एक organization का routing domain है — single policy से चलने वाला network। Enterprise private AS (64512-65534) वापरे, ISP public AS (IANA से assigned)। हर AS का अपना number — यही number BGP में identity है।',
          en: 'An AS is one organisation’s routing domain — a network run under a single policy. Enterprises use private AS numbers (64512-65534); ISPs use public ones (assigned by IANA). Each AS has its own number — that number is its identity in BGP.',
        },
        exam: {
          gu: '4-byte AS numbers hvanu thi standard (RFC 4893), 32-bit range. ASN 65535 reserved. Private range 64512-65534 (2-byte), 4200000000-4294967294 (4-byte).',
          hi: '4-byte AS numbers अब standard हैं (RFC 4893), 32-bit range। ASN 65535 reserved। Private range 64512-65534 (2-byte), 4200000000-4294967294 (4-byte)।',
          en: '4-byte AS numbers are now standard (RFC 4893), 32-bit range. ASN 65535 is reserved. Private ranges: 64512-65534 (2-byte), 4200000000-4294967294 (4-byte).',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 180, y: 180, type: 'cloud' as const, label: 'AS 65001', sub: 'Mumbai Enterprise', accent: BEG },
          { id: 'b', x: 450, y: 180, type: 'cloud' as const, label: 'AS 15169', sub: 'Google', accent: CCNA },
          { id: 'c', x: 720, y: 180, type: 'cloud' as const, label: 'AS 32934', sub: 'Facebook', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'a', to: 'b', state: 'up', label: 'BGP' },
          { id: 'b', from: 'b', to: 'c', state: 'up', label: 'BGP' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('eBGP ane iBGP', 'eBGP और iBGP', 'eBGP and iBGP'),
      text: {
        beginner: {
          gu: 'eBGP: bej AS vachhe — Internet. Routes milese tyare directly jodayel eBGP neighbour thi hoy (default TTL 1). iBGP: ek j AS ni andar — iBGP routers vachhe ek AS ni routes share kare, kem ke eBGP se shikhela routes transit kari shake. Rule: iBGP routes bijja iBGP neighbours ne forward nathi thati (loop prevention).',
          hi: 'eBGP: दो AS के बीच — Internet। Routes मिलें तो सीधे जुड़े eBGP neighbour से (default TTL 1)। iBGP: एक ही AS के अंदर — iBGP routers के बीच एक AS की routes share करें, क्योंकि eBGP से सीखी routes transit कर सकें। Rule: iBGP routes बाकी iBGP neighbours को forward न हों (loop prevention)।',
          en: 'eBGP: between two ASes — the internet. Routes arrive from a directly-connected eBGP neighbour (default TTL 1). iBGP: inside one AS — iBGP routers share one AS’s routes with each other, so eBGP-learned routes can transit. Rule: iBGP routes are not forwarded to other iBGP neighbours (loop prevention).',
        },
        exam: {
          gu: 'eBGP AD 20, iBGP AD 200 (lower trust ke IGP metrics vagar). iBGP full mesh jarur (N × (N-1)/2 sessions) — ane solution Route Reflector.',
          hi: 'eBGP AD 20, iBGP AD 200 (कम trust कि IGP metrics के बिना)। iBGP full mesh चाहिए (N × (N-1)/2 sessions) — और solution Route Reflector।',
          en: 'eBGP AD 20, iBGP AD 200 (less trust without IGP metrics). iBGP needs full mesh (N × (N-1)/2 sessions) — the solution is Route Reflectors.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'r1', x: 180, y: 220, type: 'router' as const, label: 'R1 (AS 100)', accent: CCNA },
          { id: 'r2', x: 400, y: 220, type: 'router' as const, label: 'R2 (AS 100)', accent: CCNA },
          { id: 'r3', x: 620, y: 220, type: 'router' as const, label: 'R3 (AS 200)', accent: CCNP },
          { id: 'r4', x: 840, y: 220, type: 'router' as const, label: 'R4 (AS 200)', accent: CCNP },
        ],
        links: [
          { id: 'ib1', from: 'r1', to: 'r2', state: 'up', label: 'iBGP' },
          { id: 'e', from: 'r2', to: 'r3', state: 'up', label: 'eBGP' },
          { id: 'ib2', from: 'r3', to: 'r4', state: 'up', label: 'iBGP' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('State machine — Idle thi Established', 'State machine — Idle से Established', 'State machine — Idle to Established'),
      text: {
        beginner: {
          gu: 'BGP neighbour session chhe states ma: Idle → Connect → Active → OpenSent → OpenConfirm → Established. Est thaya pachhi j routes exchange thay. Agar koi state atkai jay — mostly Active ma — to typically authentication, ACL, ke IP mismatch problem.',
          hi: 'BGP neighbour session छह states में: Idle → Connect → Active → OpenSent → OpenConfirm → Established। Established के बाद ही routes exchange हों। कोई state अटके — ज़्यादातर Active में — तो typically authentication, ACL, या IP mismatch की problem।',
          en: 'A BGP neighbour session moves through six states: Idle → Connect → Active → OpenSent → OpenConfirm → Established. Only after Established do routes exchange. Stuck in a state — usually Active — typically means an authentication, ACL or IP mismatch.',
        },
        exam: {
          gu: 'TCP 179 par jady. Keepalives dar 60s (default), hold-time 180s. Established thaya pachhi Update messages routes carry kare, Keepalive alive rakhey, Notification error ane close.',
          hi: 'TCP 179 पर जुड़ें। Keepalives हर 60s (default), hold-time 180s। Established के बाद Update messages routes carry करें, Keepalive alive रखें, Notification error और close।',
          en: 'TCP 179. Keepalives every 60s (default), hold-time 180s. After Established, Update messages carry routes, Keepalives keep the session alive, Notifications signal errors and close.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's', x: 400, y: 200, type: 'router' as const, label: 'Session', sub: t < 0.2 ? 'Idle' : t < 0.4 ? 'Connect' : t < 0.6 ? 'OpenSent' : t < 0.8 ? 'OpenConfirm' : 'Established', accent: t > 0.8 ? 'var(--nq-ok)' : WARN, pulse: true },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('Attributes — nirnay ni samagri', 'Attributes — निर्णय की सामग्री', 'Attributes — the raw material for decisions'),
      text: {
        beginner: {
          gu: 'BGP routes OSPF/EIGRP jevu "best metric wins" nathi chalavtu. Dar route ni saathe attributes avey: AS-path (kai ASes paar kari), next-hop, local preference, MED, origin, communities. Path selection algorithm 13 tie-breakers ma e badha compare kare.',
          hi: 'BGP routes OSPF/EIGRP जैसा "best metric wins" नहीं चलाता। हर route के साथ attributes आएं: AS-path (कौन से ASes पार किए), next-hop, local preference, MED, origin, communities। Path selection algorithm 13 tie-breakers में यह सब compare करे।',
          en: 'BGP routes do not run "best metric wins" like OSPF/EIGRP. Each route carries attributes: AS-path (which ASes it crossed), next-hop, local preference, MED, origin, communities. The path-selection algorithm compares them across 13 tie-breakers.',
        },
        exam: {
          gu: 'Well-known mandatory (dar router recognize kare aney forward kare): AS-path, Next-hop, Origin. Well-known discretionary: Local Preference, Atomic Aggregate. Optional transitive: Community, AS-path Aggregator. Optional non-transitive: MED, Originator-ID, Cluster-list.',
          hi: 'Well-known mandatory (हर router recognize करे और forward करे): AS-path, Next-hop, Origin। Well-known discretionary: Local Preference, Atomic Aggregate। Optional transitive: Community, AS-path Aggregator। Optional non-transitive: MED, Originator-ID, Cluster-list।',
          en: 'Well-known mandatory (every router recognises and forwards): AS-path, Next-hop, Origin. Well-known discretionary: Local Preference, Atomic Aggregate. Optional transitive: Community, AS-path Aggregator. Optional non-transitive: MED, Originator-ID, Cluster-list.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'r', x: 450, y: 200, type: 'router' as const, label: 'BGP route', sub: '10.0.0.0/8', accent: CCNP, pulse: true },
        ],
      }),
      aside: () => ({
        title: H('Attributes', 'Attributes', 'Attributes'),
        head: ['attribute', 'meaning'],
        rows: [
          ['AS-path', '100 200 300'],
          ['Next-hop', '10.1.1.1'],
          ['Local-pref', '100 (higher = better)'],
          ['MED', '50 (lower = better)'],
          ['Origin', 'IGP > EGP > ?'],
          ['Community', 'tag for policy'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'BGP ASes vachhe no protocol — eBGP bahar, iBGP andar. TCP 179 par session 6 states ma establish thay. Routes attributes saathe avey (AS-path, next-hop, local-pref, MED, origin, community) je 13-step path selection ne drive kare. Enterprise mate Internet gateway, multi-homing, aney traffic engineering nu tool.',
    hi: 'BGP ASes के बीच का protocol — eBGP बाहर, iBGP अंदर। TCP 179 पर session 6 states में establish हो। Routes attributes के साथ आएं (AS-path, next-hop, local-pref, MED, origin, community) जो 13-step path selection drive करें। Enterprise के लिए Internet gateway, multi-homing, और traffic engineering का tool।',
    en: 'BGP is the protocol between ASes — eBGP outside, iBGP inside. A session establishes over TCP 179 through 6 states. Routes arrive with attributes (AS-path, next-hop, local-pref, MED, origin, community) that drive the 13-step path selection. Enterprises use it for internet gateways, multi-homing and traffic engineering.',
  },
  check: {
    q: H(
      'iBGP routes beeji iBGP neighbours ne kem forward nathi thati?',
      'iBGP routes बाकी iBGP neighbours को क्यों forward नहीं होतीं?',
      'Why aren’t iBGP routes forwarded to other iBGP neighbours?',
    ),
    options: [
      H('Loop prevention mate — iBGP ma AS-path nu modification nathi thatu', 'Loop prevention के लिए — iBGP में AS-path का modification नहीं', 'Loop prevention — iBGP does not modify AS-path'),
      H('Em j bani gayelu, koi reason nathi', 'ऐसे ही है, कोई reason नहीं', 'It just is, no reason'),
      H('iBGP same AS ma loop nathi banavi shakti', 'iBGP same AS में loop नहीं बना सकती', 'iBGP cannot create loops within the same AS'),
    ],
    answer: 0,
    explain: H(
      'eBGP AS-path ma apnu ASN prepend kare jyare route AS pass kare — e loop detect karva mate. iBGP andar AS-path change nathi thatu, to loop pakdai nahi — rule thi iBGP route ni further forwarding ban kari che. Solution: iBGP full mesh ke Route Reflector.',
      'eBGP AS-path में अपना ASN prepend करे जब route AS pass करे — loop detect करने के लिए। iBGP अंदर AS-path change नहीं हो, तो loop पकड़ा न जाए — rule से iBGP route की further forwarding ban है। Solution: iBGP full mesh या Route Reflector।',
      'eBGP prepends its own ASN to AS-path when a route crosses an AS — that detects loops. Inside iBGP, AS-path does not change, so loops cannot be detected — the rule forbids further forwarding of iBGP routes. Solution: iBGP full mesh or Route Reflectors.',
    ),
  },
}

/* ═══════════════════ p2l5 · BGP Path Selection ═══════════════════ */

export const p2l5: LessonSpec = {
  why: {
    gu: '10.0.0.0/8 na 5 rastao avey BGP ma — darek alag AS-path, alag next-hop, alag attributes saathe. BGP ne ek select karvo pade routing table ma install karva mate. 13 tie-breakers ni list crm thi evaluate thay — upar thi niche, pehla distinction J jeete.',
    hi: '10.0.0.0/8 के 5 रास्ते आएं BGP में — हर एक अलग AS-path, अलग next-hop, अलग attributes के साथ। BGP को एक select करना पड़े routing table में install करने के लिए। 13 tie-breakers की list क्रम से evaluate हो — ऊपर से नीचे, पहला distinction ही जीते।',
    en: 'Five paths for 10.0.0.0/8 arrive in BGP — each with a different AS-path, next-hop and attributes. BGP must pick one to install in the routing table. A list of 13 tie-breakers is walked in order — top to bottom, the first distinction wins.',
  },
  steps: [
    {
      ms: 3000,
      label: H('Step 1-3 — weight, local-pref, locally originated', 'Step 1-3 — weight, local-pref, locally originated', 'Step 1-3 — weight, local-pref, locally originated'),
      text: {
        beginner: {
          gu: '1. Weight sauthi upar — Cisco-specific, ek router par j rahe, higher wins (default 0). 2. Local Preference — AS-wide, iBGP par share, higher wins (default 100). Enterprise ma outbound traffic ne steer karva mate — "mumbai ISP primary, delhi backup".  3. Locally originated (network statement, aggregate, redistribute) prefer, received thi.',
          hi: '1. Weight सबसे ऊपर — Cisco-specific, एक router पर ही रहे, higher wins (default 0)। 2. Local Preference — AS-wide, iBGP पर share, higher wins (default 100)। Enterprise में outbound traffic steer करने के लिए — "मुंबई ISP primary, दिल्ली backup"। 3. Locally originated (network statement, aggregate, redistribute) prefer, received से।',
          en: '1. Weight is first — Cisco-specific, stays on one router, higher wins (default 0). 2. Local Preference — AS-wide, shared over iBGP, higher wins (default 100). Enterprises use it to steer outbound traffic — "Mumbai ISP primary, Delhi backup". 3. Locally originated (network statement, aggregate, redistribute) preferred over received.',
        },
        exam: {
          gu: 'Weight exam ma yaad rakhvi (Cisco-specific). Local-pref outbound ne choose kare, MED inbound ne nudge kare (tutorial ma aage).',
          hi: 'Weight exam में याद रखना (Cisco-specific)। Local-pref outbound चुने, MED inbound को nudge करे (tutorial में आगे)।',
          en: 'Remember Weight for the exam (Cisco-specific). Local-pref picks outbound, MED nudges inbound (covered later).',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'me', x: 450, y: 220, type: 'router' as const, label: 'me', accent: CCNA },
          { id: 'p1', x: 150, y: 100, type: 'router' as const, label: 'path 1', sub: t > 0.3 ? 'weight 200 ← win' : 'weight 100', accent: t > 0.3 ? 'var(--nq-ok)' : BEG, pulse: t > 0.3 },
          { id: 'p2', x: 150, y: 220, type: 'router' as const, label: 'path 2', sub: 'weight 150', accent: WARN },
          { id: 'p3', x: 150, y: 340, type: 'router' as const, label: 'path 3', sub: 'weight 50', accent: 'var(--nq-text-mute)' },
        ],
        links: [
          { id: 'a', from: 'p1', to: 'me', state: 'up', flowing: t > 0.3 },
          { id: 'b', from: 'p2', to: 'me', state: 'up' },
          { id: 'c', from: 'p3', to: 'me', state: 'up' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Step 4 — shortest AS-path', 'Step 4 — shortest AS-path', 'Step 4 — shortest AS-path'),
      text: {
        beginner: {
          gu: 'Agar upper na tie-breakers na male to AS-path ni length jovami: "ketla ASes paar karya chhe". Shortest wins. Traffic engineering ni most common trick — AS-path prepending: tamaro ASN two-three vaar add karo kone AS-path artificially lambo banavva, to e path ne other-side thi reject thai jay.',
          hi: 'ऊपर के tie-breakers न मिलें तो AS-path की length देखें: "कितने ASes पार किए"। Shortest wins। Traffic engineering की most common trick — AS-path prepending: अपना ASN दो-तीन बार add करें AS-path artificially लंबा बनाने के लिए, तो वह path दूसरी तरफ से reject हो।',
          en: 'If the top tie-breakers tie, look at AS-path length: how many ASes crossed. Shortest wins. The most common traffic-engineering trick is AS-path prepending: add your own ASN two or three times to artificially lengthen the AS-path, so the other side rejects that path.',
        },
        exam: {
          gu: '`bgp bestpath as-path ignore` thi aa skip thay. Confed sequence in AS-path counts as 0, segment type matters.',
          hi: '`bgp bestpath as-path ignore` से यह skip हो। Confed sequence in AS-path counts as 0, segment type matters।',
          en: '`bgp bestpath as-path ignore` skips this step. Confed sequences in AS-path count as 0, segment type matters.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'me', x: 180, y: 220, type: 'router' as const, label: 'me', accent: CCNA },
          { id: 'p1', x: 450, y: 120, type: 'router' as const, label: 'via A', sub: 'AS-path: 100 200', accent: 'var(--nq-ok)', pulse: t > 0.3 },
          { id: 'p2', x: 450, y: 320, type: 'router' as const, label: 'via B', sub: 'AS-path: 300 400 500 600', accent: 'var(--nq-text-mute)' },
          { id: 'd', x: 720, y: 220, type: 'server' as const, label: 'dest', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'me', to: 'p1', state: 'up', flowing: t > 0.3 },
          { id: 'b', from: 'me', to: 'p2', state: 'up' },
          { id: 'c', from: 'p1', to: 'd', state: 'up', flowing: t > 0.3 },
          { id: 'e', from: 'p2', to: 'd', state: 'up' },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('Step 5-7 — origin, MED, eBGP over iBGP', 'Step 5-7 — origin, MED, eBGP over iBGP', 'Step 5-7 — origin, MED, eBGP over iBGP'),
      text: {
        beginner: {
          gu: '5. Origin: IGP (i) > EGP (e) > Incomplete (?) — most trusted pehla. 6. MED (Multi-Exit Discriminator) — lower wins (default 0). Inbound traffic steer karva mate jyare ek j AS saathe batarya links hoy. Default ma MED ek j AS vachhe compare thay. 7. eBGP > iBGP: external route internal thi preferred (different AS better).',
          hi: '5. Origin: IGP (i) > EGP (e) > Incomplete (?) — most trusted पहले। 6. MED (Multi-Exit Discriminator) — lower wins (default 0)। Inbound traffic steer करने के लिए जब एक ही AS के साथ कई links हों। Default में MED एक ही AS के बीच compare हो। 7. eBGP > iBGP: external route internal से preferred।',
          en: '5. Origin: IGP (i) > EGP (e) > Incomplete (?) — most trusted first. 6. MED (Multi-Exit Discriminator) — lower wins (default 0). Used to steer inbound traffic when there are multiple links to the same AS. By default MED is only compared within one AS. 7. eBGP > iBGP: external route preferred over internal.',
        },
        exam: {
          gu: '`bgp always-compare-med` thi different ASes vachhe pan compare thay. `bgp deterministic-med` ne pan recognize karo.',
          hi: '`bgp always-compare-med` से different ASes के बीच भी compare हो। `bgp deterministic-med` को भी recognize करें।',
          en: '`bgp always-compare-med` enables comparison across different ASes. Also recognise `bgp deterministic-med`.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'me', x: 450, y: 200, type: 'router' as const, label: 'me', accent: CCNA, pulse: true },
        ],
      }),
      aside: () => ({
        title: H('Tie-breaker order', 'Tie-breaker order', 'Tie-breaker order'),
        head: ['#', 'rule', 'wins'],
        rows: [
          ['1', 'Weight', 'higher'],
          ['2', 'Local-Pref', 'higher'],
          ['3', 'Locally originated', 'yes > no'],
          ['4', 'AS-path length', 'shorter'],
          ['5', 'Origin', 'i > e > ?'],
          ['6', 'MED', 'lower'],
          ['7', 'eBGP > iBGP', 'external wins'],
        ],
      }),
    },
    {
      ms: 3000,
      label: H('Step 8-13 — IGP metric, oldest, router-ID, etc.', 'Step 8-13 — IGP metric, oldest, router-ID, etc.', 'Step 8-13 — IGP metric, oldest, router-ID, etc.'),
      text: {
        beginner: {
          gu: '8. IGP metric next-hop sudhi (closer wins). 9. eBGP paths vachhe oldest route (stability). 10. Lower BGP router-ID. 11. Shorter cluster-list (RR deployments). 12. Lower neighbour IP. Lower sauthi rare — ek-be routes avey te point sudhi j convergence atak.',
          hi: '8. IGP metric next-hop तक (closer wins)। 9. eBGP paths के बीच oldest route (stability)। 10. Lower BGP router-ID। 11. Shorter cluster-list (RR deployments)। 12. Lower neighbour IP। सबसे नीचे rare — एक-दो routes आएं तो वहां convergence रुके।',
          en: '8. IGP metric to next-hop (closer wins). 9. Among eBGP paths, oldest route (stability). 10. Lower BGP router-ID. 11. Shorter cluster-list (RR deployments). 12. Lower neighbour IP. The bottom is rare — convergence stops where only one or two routes arrive.',
        },
        exam: {
          gu: 'ECMP (multipath) step 8 pachhi ja activate thay — jo badha earlier tie-breakers equal hoy to. `maximum-paths <n>` thi enable.',
          hi: 'ECMP (multipath) step 8 के बाद ही activate हो — जो सारे earlier tie-breakers equal हों। `maximum-paths <n>` से enable।',
          en: 'ECMP (multipath) only activates after step 8 — only if all earlier tie-breakers tie. Enable with `maximum-paths <n>`.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'me', x: 450, y: 200, type: 'router' as const, label: 'bestpath', sub: 'walking 13 steps', accent: CCNP, pulse: true },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'BGP best-path selection 13 rules na ladder: Weight → Local-Pref → Locally originated → AS-path length → Origin → MED → eBGP > iBGP → IGP metric → ... — upar thi niche, pehlanu tie-breaker j jeete. Enterprise ma Weight aney Local-Pref outbound control kare, AS-path prepending ane MED inbound. Baki ni steps rarely dekhay.',
    hi: 'BGP best-path selection 13 rules की ladder: Weight → Local-Pref → Locally originated → AS-path length → Origin → MED → eBGP > iBGP → IGP metric → ... — ऊपर से नीचे, पहला tie-breaker ही जीते। Enterprise में Weight और Local-Pref outbound control करें, AS-path prepending और MED inbound। बाकी steps rarely दिखें।',
    en: 'BGP best-path selection is a ladder of 13 rules: Weight → Local-Pref → Locally originated → AS-path length → Origin → MED → eBGP > iBGP → IGP metric → … — top to bottom, the first distinction wins. Enterprises use Weight and Local-Pref to control outbound, AS-path prepending and MED for inbound. The rest rarely matter.',
  },
  check: {
    q: H(
      'Outbound traffic ne steer karva mate "Mumbai ISP primary, Delhi backup" karvu chhe. Shu vaprasho?',
      'Outbound traffic steer करने के लिए "मुंबई ISP primary, दिल्ली backup" चाहिए। क्या वापरेंगे?',
      'To steer outbound traffic with "Mumbai ISP primary, Delhi backup", what do you use?',
    ),
    options: [
      H('Local Preference (higher = better)', 'Local Preference (higher = better)', 'Local Preference (higher = better)'),
      H('MED (lower = better)', 'MED (lower = better)', 'MED (lower = better)'),
      H('AS-path prepending', 'AS-path prepending', 'AS-path prepending'),
    ],
    answer: 0,
    explain: H(
      'Local-Pref outbound ne control kare — iBGP par share thay, AS-wide. Higher wins, etle Mumbai ne 200 ane Delhi ne 100 set karo. MED ane AS-path prepending inbound traffic (bijja AS tamara parthi kai rastathi aave) ne influence kare.',
      'Local-Pref outbound को control करे — iBGP पर share हो, AS-wide। Higher wins, तो Mumbai को 200 और Delhi को 100 set करें। MED और AS-path prepending inbound traffic (बाकी AS तुम्हारे पास किस रास्ते से आएं) को influence करें।',
      'Local-Pref controls outbound — shared over iBGP, AS-wide. Higher wins, so set Mumbai to 200 and Delhi to 100. MED and AS-path prepending influence inbound traffic (how other ASes reach you).',
    ),
  },
}

/* ═══════════════════ p2l6 · Multicast and QoS ═══════════════════ */

export const p2l6: LessonSpec = {
  why: {
    gu: 'Unicast ek thi ek mokale, broadcast badha ne. Pan 500 users ne IP video stream joievu chhe — unicast thi 500 copies banavava mathi pade, broadcast thi em pan jaroor nathi tya pahonche. Multicast en: ek stream, badha subscribers sudhi, efficiently. Ane QoS nkki kare kyo traffic drop thay kyo priority mile.',
    hi: 'Unicast एक से एक को भेजे, broadcast सबको। पर 500 users को IP video stream चाहिए — unicast से 500 copies बनानी पड़ें, broadcast से बेकार जगह भी पहुंचे। Multicast: एक stream, सारे subscribers तक, efficiently। और QoS तय करे कौन सा traffic drop हो कौन को priority मिले।',
    en: 'Unicast sends one-to-one, broadcast to all. But 500 users need an IP video stream — unicast makes 500 copies, broadcast wastes bandwidth where nobody needs it. Multicast: one stream, to all subscribers, efficiently. And QoS decides which traffic drops and which gets priority.',
  },
  steps: [
    {
      ms: 3000,
      label: H('Multicast — ek thi ghana subscribers', 'Multicast — एक से कई subscribers', 'Multicast — one to many subscribers'),
      text: {
        beginner: {
          gu: 'Source ek j stream mokale 224.0.0.0/4 ni koi "group address" par. Routers e stream ne replicate kare ane jya subscribers chhe tya mokale. Subscriber banva mate PC IGMP join mokale, router ni group join ma add thay. Agar koi subscriber nathi, stream tya j atak.',
          hi: 'Source एक ही stream भेजे 224.0.0.0/4 की किसी "group address" पर। Routers उस stream को replicate करें और जहां subscribers हैं वहां भेजें। Subscriber बनने के लिए PC IGMP join भेजे, router के group join में add हो। कोई subscriber न हो तो stream वहीं रुके।',
          en: 'The source sends one stream to a "group address" in 224.0.0.0/4. Routers replicate the stream and send it where subscribers are. To subscribe, a PC sends an IGMP join and is added to the router’s group. If no one is subscribed the stream stops there.',
        },
        exam: {
          gu: '224.0.0.0/4 class D. Reserved: 224.0.0.0/24 local link (routers nahi forward kare), 239.0.0.0/8 administratively scoped. IGMPv2 default, IGMPv3 source-specific.',
          hi: '224.0.0.0/4 class D। Reserved: 224.0.0.0/24 local link (routers forward न करें), 239.0.0.0/8 administratively scoped। IGMPv2 default, IGMPv3 source-specific।',
          en: '224.0.0.0/4 class D. Reserved: 224.0.0.0/24 local link (routers do not forward), 239.0.0.0/8 administratively scoped. IGMPv2 default, IGMPv3 source-specific.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'src', x: 150, y: 220, type: 'server' as const, label: 'Video source', sub: '239.1.1.1', accent: CCNP, pulse: true },
          { id: 'r1', x: 370, y: 220, type: 'router' as const, label: 'R1', accent: CCNA },
          { id: 'r2', x: 600, y: 120, type: 'router' as const, label: 'R2', accent: CCNA },
          { id: 'r3', x: 600, y: 320, type: 'router' as const, label: 'R3', accent: CCNA },
          { id: 'u1', x: 800, y: 100, type: 'pc' as const, label: 'User', accent: BEG },
          { id: 'u2', x: 800, y: 320, type: 'pc' as const, label: 'User', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'src', to: 'r1', state: 'up', flowing: true },
          { id: 'b', from: 'r1', to: 'r2', state: 'up', flowing: t > 0.3 },
          { id: 'c', from: 'r1', to: 'r3', state: 'up', flowing: t > 0.3 },
          { id: 'd', from: 'r2', to: 'u1', state: 'up', flowing: t > 0.5 },
          { id: 'e', from: 'r3', to: 'u2', state: 'up', flowing: t > 0.5 },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('PIM — routers vachhenu multicast routing', 'PIM — routers के बीच का multicast routing', 'PIM — multicast routing between routers'),
      text: {
        beginner: {
          gu: 'PIM (Protocol Independent Multicast) multicast tree banave — source ne root rakhi ne, subscribers ne leaves. Sparse Mode: subscribers thoda hoy to use, shared tree thi start ane pachhi source-specific ma switch. Dense Mode: badha node interested ganaay, flood-and-prune — old aney rare.',
          hi: 'PIM (Protocol Independent Multicast) multicast tree बनाए — source को root रखकर, subscribers को leaves। Sparse Mode: subscribers कम हों तो use, shared tree से start और फिर source-specific में switch। Dense Mode: सारे node interested मानें, flood-and-prune — पुराना और rare।',
          en: 'PIM (Protocol Independent Multicast) builds a multicast tree — source at the root, subscribers as leaves. Sparse Mode: used when subscribers are few, starts from a shared tree and switches to source-specific. Dense Mode: assumes all nodes interested, flood-and-prune — old and rare.',
        },
        exam: {
          gu: 'Rendezvous Point (RP) PIM-SM nu meeting point — sources register ane subscribers subscribe tya. (S,G) source-specific state, (*,G) shared tree. SPT switchover default threshold 0.',
          hi: 'Rendezvous Point (RP) PIM-SM का meeting point — sources register और subscribers subscribe वहां। (S,G) source-specific state, (*,G) shared tree। SPT switchover default threshold 0।',
          en: 'Rendezvous Point (RP) is the PIM-SM meeting point — sources register and subscribers subscribe there. (S,G) source-specific state, (*,G) shared tree. SPT switchover default threshold 0.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'rp', x: 450, y: 100, type: 'router' as const, label: 'RP', accent: CCNP, pulse: true },
          { id: 'src', x: 150, y: 250, type: 'server' as const, label: 'Source', accent: CCNA },
          { id: 'sub1', x: 450, y: 320, type: 'pc' as const, label: 'Sub', accent: BEG },
          { id: 'sub2', x: 750, y: 250, type: 'pc' as const, label: 'Sub', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'src', to: 'rp', state: 'up', label: 'register' },
          { id: 'b', from: 'rp', to: 'sub1', state: 'up', label: 'shared tree' },
          { id: 'c', from: 'rp', to: 'sub2', state: 'up', label: 'shared tree' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('QoS — classify, mark, queue', 'QoS — classify, mark, queue', 'QoS — classify, mark, queue'),
      text: {
        beginner: {
          gu: 'QoS pipeline: 1. Classify — "aa VoIP, aa web, aa backup". 2. Mark — packet par label (DSCP value) lagavi, bakina devices ne kahi devi. 3. Queue — priorities ni list ma mukvu. 4. Shape/Police — bandwidth limit. Trust boundary: badhu classify access edge par thai jay, core ma fakt marking vanchvu.',
          hi: 'QoS pipeline: 1. Classify — "यह VoIP, यह web, यह backup"। 2. Mark — packet पर label (DSCP value) लगाएं, बाकी devices को बता दे। 3. Queue — priorities की list में डालें। 4. Shape/Police — bandwidth limit। Trust boundary: सब classify access edge पर हो, core में केवल marking पढ़ें।',
          en: 'QoS pipeline: 1. Classify — "this is VoIP, this is web, this is backup". 2. Mark — attach a label (DSCP value) to the packet so other devices know. 3. Queue — place into priority queues. 4. Shape/Police — bandwidth limits. Trust boundary: classify at the access edge, read markings in the core.',
        },
        exam: {
          gu: 'DSCP values: EF (46) voice, AF41 (34) video, CS6 (48) routing protocols, default 0 best-effort. Policing drops excess, shaping buffers it. Policy map ma class-map saathe actions.',
          hi: 'DSCP values: EF (46) voice, AF41 (34) video, CS6 (48) routing protocols, default 0 best-effort। Policing drops excess, shaping buffers it। Policy map में class-map के साथ actions।',
          en: 'DSCP values: EF (46) voice, AF41 (34) video, CS6 (48) routing protocols, default 0 best-effort. Policing drops excess, shaping buffers it. Policy maps hold class-maps with actions.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'c', x: 150, y: 200, type: 'router' as const, label: '1 · Classify', accent: CCNA },
          { id: 'm', x: 350, y: 200, type: 'router' as const, label: '2 · Mark', sub: 'DSCP EF', accent: CCNP, pulse: t > 0.3 },
          { id: 'q', x: 550, y: 200, type: 'router' as const, label: '3 · Queue', sub: 'priority', accent: CCNP },
          { id: 's', x: 750, y: 200, type: 'router' as const, label: '4 · Shape', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'c', to: 'm', state: 'up', flowing: true },
          { id: 'b', from: 'm', to: 'q', state: 'up', flowing: true },
          { id: 'd', from: 'q', to: 's', state: 'up', flowing: true },
        ],
      }),
    },
    {
      ms: 2800,
      label: H('Voice ne priority, bulk ne backseat', 'Voice को priority, bulk को backseat', 'Voice to priority, bulk to the back'),
      text: {
        beginner: {
          gu: 'Classic enterprise policy: Voice ne Low Latency Queue (LLQ) ma — strict priority, hamesha pehla serve. Video ne CBWFQ ma 30% bandwidth guarantee. Business apps 20%, best-effort 10%. Bulk backup traffic WRED (Weighted Random Early Detection) thi throttle — congestion pehla aggressively drop.',
          hi: 'Classic enterprise policy: Voice को Low Latency Queue (LLQ) में — strict priority, हमेशा पहले serve। Video को CBWFQ में 30% bandwidth guarantee। Business apps 20%, best-effort 10%। Bulk backup traffic WRED (Weighted Random Early Detection) से throttle — congestion से पहले aggressively drop।',
          en: 'Classic enterprise policy: Voice into the Low Latency Queue (LLQ) — strict priority, always served first. Video into CBWFQ with 30% bandwidth guaranteed. Business apps 20%, best-effort 10%. Bulk backup traffic throttled with WRED (Weighted Random Early Detection) — dropped aggressively before congestion.',
        },
        exam: {
          gu: 'LLQ priority queue voice ne cap kare (konse na saath bijji queues ne starve thi bachave). CBWFQ bandwidth guarantee aape pan strict priority nahi. Shaping burst allow kare, policing drop.',
          hi: 'LLQ priority queue voice को cap करे (कभी भी बाकी queues को starve न करे)। CBWFQ bandwidth guarantee दे पर strict priority नहीं। Shaping burst allow करे, policing drop।',
          en: 'The LLQ caps voice (so it never starves the other queues). CBWFQ guarantees bandwidth without strict priority. Shaping allows bursts, policing drops them.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'q1', x: 200, y: 100, type: 'server' as const, label: 'LLQ · voice', sub: 'strict priority', accent: 'var(--nq-ok)', pulse: true },
          { id: 'q2', x: 200, y: 200, type: 'server' as const, label: 'Video 30%', accent: CCNA },
          { id: 'q3', x: 200, y: 300, type: 'server' as const, label: 'Business 20%', accent: CCNP },
          { id: 'q4', x: 200, y: 400, type: 'server' as const, label: 'Bulk · WRED', accent: WARN },
          { id: 'o', x: 600, y: 250, type: 'router' as const, label: 'output interface', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'q1', to: 'o', state: 'up', flowing: true },
          { id: 'b', from: 'q2', to: 'o', state: 'up', flowing: true },
          { id: 'c', from: 'q3', to: 'o', state: 'up', flowing: true },
          { id: 'd', from: 'q4', to: 'o', state: 'up' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Multicast ek stream ne badha subscribers sudhi efficiently pahocchade: IGMP thi subscriber join, PIM thi routers vachhe tree. QoS 4 steps: classify (shu chhe?), mark (label), queue (priority), shape (limit). Voice ne LLQ, video ne guaranteed, bulk ne last.',
    hi: 'Multicast एक stream को सारे subscribers तक efficiently पहुंचाए: IGMP से subscriber join, PIM से routers के बीच tree। QoS 4 steps: classify (क्या है?), mark (label), queue (priority), shape (limit)। Voice को LLQ, video को guaranteed, bulk को last।',
    en: 'Multicast delivers one stream to many subscribers efficiently: IGMP for subscriber join, PIM for the tree between routers. QoS in 4 steps: classify (what is it?), mark (label), queue (priority), shape (limit). Voice to LLQ, video to guaranteed, bulk to last.',
  },
  check: {
    q: H(
      'Voice traffic ne QoS ma kya mukvu?',
      'Voice traffic को QoS में कहां रखें?',
      'Where does voice traffic go in a QoS policy?',
    ),
    options: [
      H('LLQ (Low Latency Queue) — strict priority', 'LLQ (Low Latency Queue) — strict priority', 'LLQ (Low Latency Queue) — strict priority'),
      H('CBWFQ with 10% bandwidth', 'CBWFQ with 10% bandwidth', 'CBWFQ with 10% bandwidth'),
      H('Default best-effort', 'Default best-effort', 'Default best-effort'),
    ],
    answer: 0,
    explain: H(
      'Voice latency ane jitter ne tolerance nathi — 150ms thi vadhu to call quality kharab thai jay. LLQ strict priority aape — queue ma kai bhi hoy, voice pehla serve thay. Pan LLQ ma cap pan hoy (other queues ne starve na kare).',
      'Voice latency और jitter को tolerate न करे — 150ms से ज़्यादा तो call quality खराब हो। LLQ strict priority दे — queue में कुछ भी हो, voice पहले serve हो। पर LLQ पर cap भी हो (बाकी queues को starve न करे)।',
      'Voice does not tolerate latency and jitter — beyond 150ms call quality falls. LLQ gives strict priority — whatever is in the queue, voice is served first. But LLQ is also capped (so it does not starve the other queues).',
    ),
  },
}
