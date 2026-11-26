import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const WARN = 'var(--nq-warn)'
const H = (gu: string, hi: string, en: string) => ({ gu, hi, en })

/* ═══════════════════ p1l1 · Enterprise Design — Three Tier ═══════════════════ */

export const p1l1: LessonSpec = {
  why: {
    gu: 'એક ઓફિસમાં પાંચ switch હતા — ઠીક ચાલે. હજાર user, ત્રણ માળ, પચાસ switch? એક જ flat layout હવે fail થાય. Three-tier design એ problem ને ત્રણ અલગ ભાગમાં વહેંચીને દરેકને એક જ કામ આપે છે.',
    hi: 'एक ऑफिस में पांच switch थे — ठीक चले। हजार user, तीन माले, पचास switch? एक flat layout अब fail हो जाए। Three-tier design समस्या को तीन अलग हिस्सों में बांटकर हर एक को एक ही काम देता है।',
    en: 'Five switches in one office — fine. A thousand users, three floors, fifty switches? A single flat layout starts to fail. The three-tier design splits the problem into three layers and gives each one a single job.',
  },
  steps: [
    {
      ms: 2800,
      label: H('Access — જ્યાં user જોડાય', 'Access — जहां user जुड़े', 'Access — where users plug in'),
      text: {
        beginner: {
          gu: 'સૌથી નીચેનું layer. અહીં PC, printer, ફોન, AP — બધા જોડાય. એક જ કામ: endpoint ને network માં લાવવું. Port security, VLAN assignment, PoE — બધું અહીં.',
          hi: 'सबसे नीचे का layer। यहां PC, printer, phone, AP — सब जुड़ें। एक ही काम: endpoint को network में लाना। Port security, VLAN assignment, PoE — सब यहां।',
          en: 'The bottom layer. PCs, printers, phones and APs all plug in here. One job: get the endpoint onto the network. Port security, VLAN assignment, PoE — all of it lives here.',
        },
        exam: {
          gu: 'Access layer લગભગ બધા Layer 2 features ધરાવે: 802.1Q, STP, port security, DHCP snooping, DAI. Catalyst 9200/9300 જેવા સામાન્ય.',
          hi: 'Access layer लगभग सारे Layer 2 features रखे: 802.1Q, STP, port security, DHCP snooping, DAI। Catalyst 9200/9300 जैसे सामान्य।',
          en: 'The access layer carries nearly all Layer 2 features: 802.1Q, STP, port security, DHCP snooping, DAI. Catalyst 9200/9300 are typical.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a1', x: 220, y: 300, type: 'switch' as const, label: 'Access · floor 1', accent: BEG, pulse: true },
          { id: 'a2', x: 480, y: 300, type: 'switch' as const, label: 'Access · floor 2', accent: BEG },
          { id: 'a3', x: 740, y: 300, type: 'switch' as const, label: 'Access · floor 3', accent: BEG },
          { id: 'p1', x: 140, y: 400, type: 'pc' as const, label: 'PC', accent: BEG },
          { id: 'p2', x: 300, y: 400, type: 'pc' as const, label: 'PC', accent: BEG },
          { id: 'p3', x: 820, y: 400, type: 'pc' as const, label: 'PC', accent: BEG },
        ],
        links: [
          { id: 'x', from: 'p1', to: 'a1', state: 'up' },
          { id: 'y', from: 'p2', to: 'a1', state: 'up' },
          { id: 'z', from: 'p3', to: 'a3', state: 'up' },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('Distribution — માળનો વચ્ચેનો સ્તર', 'Distribution — माले का बीच का layer', 'Distribution — the floor aggregator'),
      text: {
        beginner: {
          gu: 'Access થી ઉપર. અહીં દરેક માળના ઘણા access switch ભેગા થાય. અહીં જ Layer 3 શરૂ થાય: SVI, inter-VLAN routing, redistribution, policy — બધો નિર્ણય લેવાનો work. "Floor boss" જેવું.',
          hi: 'Access के ऊपर। यहां हर माले के कई access switch जुड़ें। यहीं Layer 3 शुरू हो: SVI, inter-VLAN routing, redistribution, policy — सारे निर्णय लेने का काम। "Floor boss" जैसा।',
          en: 'Above access. Several access switches from one floor converge here. Layer 3 starts here: SVIs, inter-VLAN routing, redistribution, policy — all the decision-making. The "floor boss".',
        },
        exam: {
          gu: 'Distribution હંમેશા L3; redundancy માટે HSRP/VRRP. Summarization પણ અહીં — upstream ને ફક્ત aggregates દેખાય.',
          hi: 'Distribution हमेशा L3; redundancy के लिए HSRP/VRRP। Summarization भी यहीं — upstream को केवल aggregates दिखें।',
          en: 'Distribution is always L3, with HSRP/VRRP for redundancy. Summarisation lives here too — the upstream sees only aggregates.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'd1', x: 320, y: 180, type: 'router' as const, label: 'Dist · floor 1', accent: CCNA, pulse: t > 0.3 },
          { id: 'd2', x: 640, y: 180, type: 'router' as const, label: 'Dist · floor 2', accent: CCNA, pulse: t > 0.3 },
          { id: 'a1', x: 220, y: 330, type: 'switch' as const, label: 'A1', accent: BEG },
          { id: 'a2', x: 420, y: 330, type: 'switch' as const, label: 'A2', accent: BEG },
          { id: 'a3', x: 540, y: 330, type: 'switch' as const, label: 'A3', accent: BEG },
          { id: 'a4', x: 740, y: 330, type: 'switch' as const, label: 'A4', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'd1', to: 'a1', state: 'up', flowing: t > 0.3 },
          { id: 'b', from: 'd1', to: 'a2', state: 'up', flowing: t > 0.3 },
          { id: 'c', from: 'd2', to: 'a3', state: 'up', flowing: t > 0.3 },
          { id: 'd', from: 'd2', to: 'a4', state: 'up', flowing: t > 0.3 },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('Core — ઝડપી highway', 'Core — तेज़ highway', 'Core — the fast highway'),
      text: {
        beginner: {
          gu: 'સૌથી ઉપરનો layer. અહીં કોઈ policy નથી, કોઈ filter નથી — ફક્ત "packet ને શક્ય તેટલી ઝડપે આગળ વધાર". Distribution વચ્ચેની મહારસ્તો. 100G, 400G લિંક અહીં જ.',
          hi: 'सबसे ऊपर का layer। यहां कोई policy नहीं, कोई filter नहीं — केवल "packet को यथासंभव तेज़ आगे बढ़ा"। Distribution के बीच का महा-रास्ता। 100G, 400G link यहीं।',
          en: 'The top layer. No policy, no filtering — just "move the packet as fast as possible". The superhighway between distribution blocks. The 100G and 400G links live here.',
        },
        exam: {
          gu: 'Core ને simple રાખો — ફક્ત routing, કોઈ ACL/QoS નહીં. Convergence ઝડપી રાખવા BFD, ECMP વપરાય.',
          hi: 'Core को simple रखें — केवल routing, कोई ACL/QoS नहीं। Convergence तेज रखने के लिए BFD, ECMP वापरें।',
          en: 'Keep the core simple — routing only, no ACLs or QoS. Use BFD and ECMP to keep convergence fast.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'c1', x: 380, y: 80, type: 'router' as const, label: 'Core1', accent: CCNP, pulse: t > 0.4 },
          { id: 'c2', x: 580, y: 80, type: 'router' as const, label: 'Core2', accent: CCNP, pulse: t > 0.4 },
          { id: 'd1', x: 220, y: 220, type: 'router' as const, label: 'Dist A', accent: CCNA },
          { id: 'd2', x: 480, y: 220, type: 'router' as const, label: 'Dist B', accent: CCNA },
          { id: 'd3', x: 740, y: 220, type: 'router' as const, label: 'Dist C', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'c1', to: 'd1', state: 'up', flowing: t > 0.4 },
          { id: 'b', from: 'c1', to: 'd2', state: 'up', flowing: t > 0.4 },
          { id: 'c', from: 'c2', to: 'd2', state: 'up', flowing: t > 0.4 },
          { id: 'd', from: 'c2', to: 'd3', state: 'up', flowing: t > 0.4 },
          { id: 'e', from: 'c1', to: 'c2', state: 'up', label: '100G' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('દરેક ને એક કામ', 'हर एक को एक काम', 'Each layer, one job'),
      text: {
        beginner: {
          gu: 'મહત્વ એ છે કે layers ભેગાં ન કરવા. Access પર Layer 3 ન કરો, Core પર ACL ન લગાવો. એક jam થાય તો troubleshooting ઝડપી — તમે જાણો છો કે problem કયા layer માં શોધવી.',
          hi: 'महत्वपूर्ण यह है कि layers को मिलाएं नहीं। Access पर Layer 3 न करें, Core पर ACL न लगाएं। कोई jam हो तो troubleshooting तेज — आप जानते हैं कि समस्या किस layer में ढूंढनी है।',
          en: 'The point is not to mix layers. Do not do Layer 3 on access, do not put ACLs on core. When something jams, troubleshooting is faster — you know which layer to look at.',
        },
        exam: {
          gu: 'Modular design માં દરેક block (floor, building, DC) એક જ રીતે બને — બીજો block ઉમેરવો હોય તો pattern repeat. Collapsed core (distribution + core એક) નાના sites માટે OK.',
          hi: 'Modular design में हर block (floor, building, DC) एक ही तरह से बने — दूसरा block जोड़ना हो तो pattern repeat। Collapsed core (distribution + core एक) छोटे sites के लिए ठीक।',
          en: 'In a modular design every block (floor, building, DC) is built the same way — adding another means repeating the pattern. A collapsed core (distribution + core combined) is fine for smaller sites.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'c1', x: 400, y: 80, type: 'router' as const, label: 'Core', accent: CCNP },
          { id: 'c2', x: 600, y: 80, type: 'router' as const, label: 'Core', accent: CCNP },
          { id: 'd1', x: 200, y: 200, type: 'router' as const, label: 'Dist', accent: CCNA },
          { id: 'd2', x: 500, y: 200, type: 'router' as const, label: 'Dist', accent: CCNA },
          { id: 'd3', x: 800, y: 200, type: 'router' as const, label: 'Dist', accent: CCNA },
          { id: 'a1', x: 140, y: 320, type: 'switch' as const, label: 'Access', accent: BEG },
          { id: 'a2', x: 260, y: 320, type: 'switch' as const, label: 'Access', accent: BEG },
          { id: 'a3', x: 440, y: 320, type: 'switch' as const, label: 'Access', accent: BEG },
          { id: 'a4', x: 560, y: 320, type: 'switch' as const, label: 'Access', accent: BEG },
          { id: 'a5', x: 740, y: 320, type: 'switch' as const, label: 'Access', accent: BEG },
          { id: 'a6', x: 860, y: 320, type: 'switch' as const, label: 'Access', accent: BEG },
        ],
        links: [
          { id: 'cc', from: 'c1', to: 'c2', state: 'up' },
          { id: 'cd1', from: 'c1', to: 'd1', state: 'up' },
          { id: 'cd2', from: 'c1', to: 'd2', state: 'up' },
          { id: 'cd3', from: 'c2', to: 'd2', state: 'up' },
          { id: 'cd4', from: 'c2', to: 'd3', state: 'up' },
          { id: 'da1', from: 'd1', to: 'a1', state: 'up' },
          { id: 'da2', from: 'd1', to: 'a2', state: 'up' },
          { id: 'da3', from: 'd2', to: 'a3', state: 'up' },
          { id: 'da4', from: 'd2', to: 'a4', state: 'up' },
          { id: 'da5', from: 'd3', to: 'a5', state: 'up' },
          { id: 'da6', from: 'd3', to: 'a6', state: 'up' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Three-tier એ scale નો જવાબ છે. Access user ને જોડે, Distribution policy અને L3 કરે, Core ફક્ત ઝડપી forwarding. દરેક layer નું એક જ કામ — એટલે fault isolation સહેલું અને નવા block ઉમેરવા easy.',
    hi: 'Three-tier scale का जवाब है। Access user को जोड़े, Distribution policy और L3 करे, Core केवल तेज़ forwarding। हर layer का एक ही काम — तो fault isolation आसान और नए block जोड़ना easy।',
    en: 'Three-tier is the answer to scale. Access attaches users, distribution does policy and L3, core just forwards fast. One job per layer — so fault isolation is easy and adding new blocks is painless.',
  },
  check: {
    q: H(
      'Three-tier design માં inter-VLAN routing કયા layer પર કરવું જોઈએ?',
      'Three-tier design में inter-VLAN routing किस layer पर करना चाहिए?',
      'Where in a three-tier design should inter-VLAN routing be done?',
    ),
    options: [
      H('Distribution', 'Distribution', 'Distribution'),
      H('Access — user ની નજીક', 'Access — user के करीब', 'Access — closest to the user'),
      H('Core — સૌથી ઝડપી', 'Core — सबसे तेज़', 'Core — the fastest'),
    ],
    answer: 0,
    explain: H(
      'Distribution Layer 3 ની જગ્યા છે. Access પર L2 રાખો (simple, cheap), Core ને ઝડપી rakho (no policy). Distribution જ એ જગ્યા છે જ્યાં SVI, HSRP, routing decisions થાય.',
      'Distribution Layer 3 की जगह है। Access पर L2 रखें (simple, cheap), Core को तेज़ रखें (no policy)। Distribution ही वह जगह है जहां SVI, HSRP, routing decisions हों।',
      'Distribution is where Layer 3 belongs. Keep access on L2 (simple, cheap) and core fast (no policy). Distribution is where SVIs, HSRP and routing decisions happen.',
    ),
  },
}

/* ═══════════════════ p1l2 · SD-Access and Fabric ═══════════════════ */

export const p1l2: LessonSpec = {
  why: {
    gu: 'પારંપરિક network માં દરેક switch પર જાતે VLAN, ACL, QoS configure કરવા પડે. 200 switch હોય તો 200 ઠેકાણે. SD-Access એ બધું એક controller થી કરે — અને policy user ના identity સાથે ચોંટે, port સાથે નહીં.',
    hi: 'पारंपरिक network में हर switch पर खुद VLAN, ACL, QoS configure करने पड़ें। 200 switch हों तो 200 जगह। SD-Access यह सब एक controller से करे — और policy user की identity के साथ जुड़े, port के साथ नहीं।',
    en: 'In a traditional network you configure VLANs, ACLs and QoS on every switch by hand. Two hundred switches, two hundred places. SD-Access does it all from one controller — and the policy sticks to a user’s identity, not a port.',
  },
  steps: [
    {
      ms: 3000,
      label: H('બે layer — underlay અને overlay', 'दो layer — underlay और overlay', 'Two layers — underlay and overlay'),
      text: {
        beginner: {
          gu: 'Underlay એ ખરેખરનું physical network — routers, switches, cables, IS-IS. એનું એક જ કામ: દરેક fabric node સુધી IP reachability. Overlay એ ઉપર ચાલતું logical fabric — જ્યાં user ના packets જાય. બંને સાથે કામ કરે પણ એકબીજાથી સ્વતંત્ર.',
          hi: 'Underlay असली physical network — routers, switches, cables, IS-IS। उसका एक ही काम: हर fabric node तक IP reachability। Overlay ऊपर चलने वाला logical fabric — जहां user के packets जाएं। दोनों साथ काम करें पर एक-दूसरे से स्वतंत्र।',
          en: 'The underlay is the real physical network — routers, switches, cables, IS-IS. Its only job: IP reachability between every fabric node. The overlay is the logical fabric on top, where user packets actually travel. They work together but stay independent.',
        },
        exam: {
          gu: 'Underlay typically IS-IS with /32 loopbacks. Overlay VXLAN encapsulation વાપરે — original packet VXLAN header માં wrap થાય અને underlay પર UDP 4789 તરીકે જાય.',
          hi: 'Underlay typically IS-IS with /32 loopbacks। Overlay VXLAN encapsulation वापरे — original packet VXLAN header में wrap हो और underlay पर UDP 4789 के रूप में जाए।',
          en: 'The underlay is typically IS-IS with /32 loopbacks. The overlay uses VXLAN encapsulation — the original packet is wrapped in a VXLAN header and travels on the underlay as UDP 4789.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'e1', x: 180, y: 120, type: 'switch' as const, label: 'Edge 1', accent: CCNA },
          { id: 'e2', x: 780, y: 120, type: 'switch' as const, label: 'Edge 2', accent: CCNA },
          { id: 'u1', x: 350, y: 280, type: 'router' as const, label: 'Underlay', accent: BEG },
          { id: 'u2', x: 620, y: 280, type: 'router' as const, label: 'Underlay', accent: BEG },
        ],
        links: [
          { id: 'ov', from: 'e1', to: 'e2', state: 'up', label: t > 0.4 ? 'overlay · VXLAN' : undefined, flowing: t > 0.4 },
          { id: 'a', from: 'e1', to: 'u1', state: 'up' },
          { id: 'b', from: 'u1', to: 'u2', state: 'up' },
          { id: 'c', from: 'u2', to: 'e2', state: 'up' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Controller — DNA Center', 'Controller — DNA Center', 'The controller — DNA Center'),
      text: {
        beginner: {
          gu: 'બધું એક જગ્યાએથી ચાલે. Admin GUI પર policy લખે — "Finance users printers ને access કરી શકે, બીજા નહીં" — અને DNA Center એને બધા fabric nodes પર push કરે. ખોટી typing નહીં, 200 copies નહીં.',
          hi: 'सब एक जगह से चले। Admin GUI पर policy लिखे — "Finance users printers को access कर सकें, बाकी नहीं" — और DNA Center उसे सारे fabric nodes पर push करे। गलत typing नहीं, 200 copies नहीं।',
          en: 'Everything is driven from one place. The admin writes a policy in the GUI — "Finance users may reach the printers, others may not" — and DNA Center pushes it to every fabric node. No typos, no two hundred copies.',
        },
        exam: {
          gu: 'DNA Center REST API, model-driven telemetry (gNMI/Netconf), અને ISE સાથે integration વાપરે. Policy groups scalable group tags (SGT) થી ઓળખાય.',
          hi: 'DNA Center REST API, model-driven telemetry (gNMI/Netconf), और ISE के साथ integration वापरे। Policy groups scalable group tags (SGT) से पहचाने जाएं।',
          en: 'DNA Center uses REST APIs, model-driven telemetry (gNMI/Netconf) and integration with ISE. Policy groups are identified by scalable group tags (SGTs).',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'dna', x: 480, y: 100, type: 'server' as const, label: 'DNA Center', accent: CCNP, pulse: t > 0.2 },
          { id: 's1', x: 200, y: 280, type: 'switch' as const, label: 'Fabric', accent: CCNA },
          { id: 's2', x: 400, y: 280, type: 'switch' as const, label: 'Fabric', accent: CCNA },
          { id: 's3', x: 600, y: 280, type: 'switch' as const, label: 'Fabric', accent: CCNA },
          { id: 's4', x: 780, y: 280, type: 'switch' as const, label: 'Fabric', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'dna', to: 's1', state: 'up', flowing: t > 0.3 },
          { id: 'b', from: 'dna', to: 's2', state: 'up', flowing: t > 0.3 },
          { id: 'c', from: 'dna', to: 's3', state: 'up', flowing: t > 0.3 },
          { id: 'd', from: 'dna', to: 's4', state: 'up', flowing: t > 0.3 },
        ],
        packets:
          t > 0.4
            ? [
                { id: 'p1', from: 'dna', to: 's2', t: 0.1 + ease((t - 0.4) / 0.6) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'policy push' },
                { id: 'p2', from: 'dna', to: 's3', t: 0.05 + ease((t - 0.4) / 0.6) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'policy push' },
              ]
            : [],
      }),
    },
    {
      ms: 3200,
      label: H('Policy user સાથે ચાલે', 'Policy user के साथ चले', 'Policy follows the user'),
      text: {
        beginner: {
          gu: 'પારંપરિક network માં policy port કે VLAN સાથે બંધાય — user એક ટેબલથી બીજા ટેબલ પર જાય એટલે આખું reconfiguration. SD-Access માં policy identity સાથે ચોંટે: Finance user જ્યાં પણ બેસે, એની rules એની સાથે આવે.',
          hi: 'पारंपरिक network में policy port या VLAN के साथ बंधे — user एक desk से दूसरे desk पर जाए तो पूरा reconfiguration। SD-Access में policy identity के साथ जुड़े: Finance user जहां भी बैठे, उसके rules उसके साथ आएं।',
          en: 'In a traditional network policy binds to a port or VLAN — a user moves desks and the whole thing has to be reconfigured. In SD-Access the policy sticks to the identity: a Finance user, wherever they sit, carries their rules with them.',
        },
        exam: {
          gu: 'ISE 802.1X thi user authenticate કરે, SGT assign કરે. Edge switch packet માં SGT embed કરે (CMD field). Egress edge policy enforce કરે — source અને destination SGT ના combination પર.',
          hi: 'ISE 802.1X से user authenticate करे, SGT assign करे। Edge switch packet में SGT embed करे (CMD field)। Egress edge policy enforce करे — source और destination SGT के combination पर।',
          en: 'ISE authenticates the user with 802.1X and assigns an SGT. The edge switch embeds the SGT in the packet (the CMD field). The egress edge enforces policy on the combination of source and destination SGT.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'u', x: t > 0.5 ? 650 : 150, y: 250, type: 'pc' as const, label: 'Finance user', sub: 'SGT 10', accent: BEG, pulse: true },
          { id: 'e1', x: 300, y: 250, type: 'switch' as const, label: 'Edge A', accent: CCNA },
          { id: 'e2', x: 550, y: 250, type: 'switch' as const, label: 'Edge B', accent: CCNA },
          { id: 'p', x: 800, y: 120, type: 'server' as const, label: 'Printer · SGT 30', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'e1', to: 'e2', state: 'up' },
          { id: 'b', from: 'e2', to: 'p', state: 'up' },
        ],
      }),
      say: () => ({ nodeId: 'u', text: H('મારી policy મારી સાથે આવી', 'मेरी policy मेरे साथ आई', 'my policy came with me') }),
    },
    {
      ms: 2800,
      label: H('ફાયદા — અને કિંમત', 'फायदे — और कीमत', 'The benefits — and the price'),
      text: {
        beginner: {
          gu: 'મોટો ફાયદો: hundreds of switches ને એક policy, zero manual typing, user mobility સચવાય. પણ કિંમત પણ છે — DNA Center licensing, ISE, compatible Catalyst 9000 hardware, અને team ને new skill set.',
          hi: 'बड़ा फायदा: hundreds of switches के लिए एक policy, zero manual typing, user mobility सुरक्षित। पर कीमत भी है — DNA Center licensing, ISE, compatible Catalyst 9000 hardware, और team को new skill set।',
          en: 'Big upside: one policy for hundreds of switches, no manual typing, user mobility preserved. But there is a cost too — DNA Center licensing, ISE, compatible Catalyst 9000 hardware, and a new skill set for the team.',
        },
        exam: {
          gu: 'Fabric roles: Control plane node (LISP map server), Edge node (user attach + VXLAN encap), Border node (fabric થી outside). Small deployment માં એક device બે role કરી શકે.',
          hi: 'Fabric roles: Control plane node (LISP map server), Edge node (user attach + VXLAN encap), Border node (fabric से outside)। Small deployment में एक device दो role कर सके।',
          en: 'Fabric roles: control plane node (LISP map server), edge node (user attach + VXLAN encap), border node (fabric to outside). In a small deployment one device can hold two roles.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'cp', x: 450, y: 100, type: 'server' as const, label: 'Control Plane', sub: 'LISP map', accent: CCNP },
          { id: 'b1', x: 200, y: 250, type: 'router' as const, label: 'Border', sub: 'to outside', accent: WARN },
          { id: 'e1', x: 450, y: 280, type: 'switch' as const, label: 'Edge', sub: 'to user', accent: CCNA },
          { id: 'e2', x: 700, y: 280, type: 'switch' as const, label: 'Edge', sub: 'to user', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'cp', to: 'b1', state: 'up' },
          { id: 'b', from: 'cp', to: 'e1', state: 'up' },
          { id: 'c', from: 'cp', to: 'e2', state: 'up' },
          { id: 'd', from: 'b1', to: 'e1', state: 'up' },
          { id: 'e', from: 'e1', to: 'e2', state: 'up' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'SD-Access = underlay (IP reachability) + overlay (VXLAN) + controller (DNA Center) + identity (SGT). Policy user સાથે ચાલે, scale sahelo. પણ licensing, hardware અને team ni skill nu investment pan jarur chhe.',
    hi: 'SD-Access = underlay (IP reachability) + overlay (VXLAN) + controller (DNA Center) + identity (SGT)। Policy user के साथ चले, scale आसान। पर licensing, hardware और team की skill का investment भी जरूरी।',
    en: 'SD-Access = underlay (IP reachability) + overlay (VXLAN) + controller (DNA Center) + identity (SGT). Policy follows the user, scale is easy. But licensing, hardware and team skill are also required investments.',
  },
  check: {
    q: H(
      'SD-Access માં overlay શું વાપરે છે original user packet ને wrap કરવા?',
      'SD-Access में overlay क्या वापरे original user packet को wrap करने के लिए?',
      'What does SD-Access overlay use to wrap the original user packet?',
    ),
    options: [
      H('VXLAN', 'VXLAN', 'VXLAN'),
      H('GRE', 'GRE', 'GRE'),
      H('MPLS', 'MPLS', 'MPLS'),
    ],
    answer: 0,
    explain: H(
      'SD-Access overlay VXLAN વાપરે — original packet VXLAN header માં wrap થાય અને underlay પર UDP 4789 તરીકે જાય. SGT પણ VXLAN header માં carry થાય.',
      'SD-Access overlay VXLAN वापरे — original packet VXLAN header में wrap हो और underlay पर UDP 4789 के रूप में जाए। SGT भी VXLAN header में carry हो।',
      'SD-Access overlay uses VXLAN — the original packet is wrapped in a VXLAN header and travels on the underlay as UDP 4789. The SGT is also carried in the VXLAN header.',
    ),
  },
}

/* ═══════════════════ p1l3 · VRF, GRE and IPsec ═══════════════════ */

export const p1l3: LessonSpec = {
  why: {
    gu: 'એક જ router પર બે client ની traffic અલગ રાખવી છે — એ પણ એમના સરખા IP ને confusion વિના. બીજી તરફ બે offices ને Internet પાર secure tunnel થી જોડવા છે. એક problem VRF solve કરે, બીજો GRE+IPsec.',
    hi: 'एक ही router पर दो client की traffic अलग रखनी है — वह भी उनके समान IP में confusion के बिना। दूसरी तरफ दो offices को Internet पार secure tunnel से जोड़ने हैं। एक समस्या VRF solve करे, दूसरी GRE+IPsec।',
    en: 'You want to keep two clients’ traffic apart on one router — even if their IPs overlap. And you want two offices joined across the internet with a secure tunnel. VRF solves one, GRE+IPsec the other.',
  },
  steps: [
    {
      ms: 3000,
      label: H('VRF — એક router, ઘણા નકશા', 'VRF — एक router, कई नक्शे', 'VRF — one router, many maps'),
      text: {
        beginner: {
          gu: 'Router પાસે normally એક જ routing table હોય. VRF એને ઘણા અલગ tables માં વિભાજિત કરે — દરેક VRF નું પોતાનું table, પોતાની interface list, પોતાની routes. બે customer નું 10.0.0.0/8 overlap થાય તોય એકબીજા સાથે ભળે નહીં.',
          hi: 'Router के पास normally एक ही routing table हो। VRF उसे कई अलग tables में बांटे — हर VRF की अपनी table, अपनी interface list, अपनी routes। दो customer का 10.0.0.0/8 overlap हो तो भी एक-दूसरे से न मिले।',
          en: 'A router normally has one routing table. VRF slices it into many separate ones — each VRF has its own table, its own interface list, its own routes. Two customers’ 10.0.0.0/8 can overlap without ever touching.',
        },
        exam: {
          gu: 'VRF-Lite કોઈ MPLS વિના ચાલે. `ip vrf CUSTOMER_A`, પછી interface પર `ip vrf forwarding CUSTOMER_A`. Routes જોવા: `show ip route vrf CUSTOMER_A`.',
          hi: 'VRF-Lite बिना MPLS चले। `ip vrf CUSTOMER_A`, फिर interface पर `ip vrf forwarding CUSTOMER_A`। Routes देखें: `show ip route vrf CUSTOMER_A`।',
          en: 'VRF-Lite runs without MPLS. `ip vrf CUSTOMER_A`, then `ip vrf forwarding CUSTOMER_A` on the interface. View routes with `show ip route vrf CUSTOMER_A`.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'r', x: 450, y: 200, type: 'router' as const, label: 'R1', sub: 'two VRFs', accent: CCNP, pulse: true },
          { id: 'a1', x: 150, y: 100, type: 'pc' as const, label: 'Cust A', sub: '10.0.0.5', accent: BEG },
          { id: 'a2', x: 750, y: 100, type: 'pc' as const, label: 'Cust A', sub: '10.0.0.6', accent: BEG },
          { id: 'b1', x: 150, y: 310, type: 'pc' as const, label: 'Cust B', sub: '10.0.0.5', accent: WARN },
          { id: 'b2', x: 750, y: 310, type: 'pc' as const, label: 'Cust B', sub: '10.0.0.6', accent: WARN },
        ],
        links: [
          { id: 'aa', from: 'a1', to: 'r', state: 'up', label: 'VRF A' },
          { id: 'ab', from: 'r', to: 'a2', state: 'up', label: 'VRF A' },
          { id: 'ba', from: 'b1', to: 'r', state: 'up', label: 'VRF B' },
          { id: 'bb', from: 'r', to: 'b2', state: 'up', label: 'VRF B' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('GRE — tunnel ની નળી', 'GRE — tunnel की नली', 'GRE — the tunnel pipe'),
      text: {
        beginner: {
          gu: 'બે office વચ્ચે Internet પર જોડાણ જોઈએ — પણ એમની LAN ખાનગી સરનામાં (10.1.1.0 અને 10.2.2.0) વાપરે છે. GRE એક virtual નળી બનાવે: original packet (private src/dst સાથે) GRE header માં wrap થાય અને બહારના public IP પર મુસાફરી કરે. બીજા છેડે unwrap.',
          hi: 'दो office के बीच Internet पर जुड़ाव चाहिए — पर उनकी LAN निजी पते (10.1.1.0 और 10.2.2.0) वापरें। GRE एक virtual नली बनाए: original packet (private src/dst के साथ) GRE header में wrap हो और बाहर public IP पर यात्रा करे। दूसरे छोर पर unwrap।',
          en: 'Two offices need to join over the internet — but their LANs use private addressing (10.1.1.0 and 10.2.2.0). GRE builds a virtual pipe: the original packet (private src/dst) is wrapped in a GRE header and travels on the outside public IPs. At the far end, unwrap.',
        },
        exam: {
          gu: 'GRE multi-protocol tunnel છે (IPv4, IPv6, multicast બધું). Configuration: `interface Tunnel 0`, `tunnel source <ip>`, `tunnel destination <ip>`. Overhead 24 bytes. GRE alone encrypt નથી કરતું — એના પર IPsec લગાવવું પડે.',
          hi: 'GRE multi-protocol tunnel है (IPv4, IPv6, multicast सब)। Configuration: `interface Tunnel 0`, `tunnel source <ip>`, `tunnel destination <ip>`। Overhead 24 bytes। GRE अकेला encrypt नहीं करता — उस पर IPsec लगाना पड़े।',
          en: 'GRE is a multi-protocol tunnel (IPv4, IPv6, multicast, all of it). Configure with `interface Tunnel 0`, `tunnel source <ip>`, `tunnel destination <ip>`. Overhead is 24 bytes. GRE alone does not encrypt — you layer IPsec on top.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r1', x: 180, y: 200, type: 'router' as const, label: 'R1 · 203.0.113.1', accent: CCNA },
          { id: 'net', x: 480, y: 200, type: 'cloud' as const, label: 'Internet', accent: 'var(--nq-text-mute)' },
          { id: 'r2', x: 780, y: 200, type: 'router' as const, label: 'R2 · 198.51.100.1', accent: CCNA },
        ],
        links: [
          { id: 'tun', from: 'r1', to: 'r2', state: 'up', label: 'GRE tunnel', flowing: t > 0.3 },
        ],
        packets:
          t > 0.3
            ? [
                { id: 'p', from: 'r1', to: 'r2', t: 0.1 + ease((t - 0.3) / 0.7) * 0.8, color: 'var(--nq-pkt-data)', label: 'inner: 10.1→10.2' },
              ]
            : [],
      }),
    },
    {
      ms: 3200,
      label: H('IPsec — બંધ પરબીડિયું', 'IPsec — बंद लिफाफा', 'IPsec — the sealed envelope'),
      text: {
        beginner: {
          gu: 'GRE tunnel readable છે — Internet પર કોઈ sniff કરે તો original packet વાંચી શકે. IPsec એને encrypt કરે. બંને routers પહેલા IKE થી ચાવીઓ exchange કરે, પછી દરેક packet ESP header સાથે encrypt થઈને જાય. Sniffer ને ફક્ત garbage દેખાય.',
          hi: 'GRE tunnel readable है — Internet पर कोई sniff करे तो original packet पढ़ सके। IPsec उसे encrypt करे। दोनों routers पहले IKE से चाबियां exchange करें, फिर हर packet ESP header के साथ encrypt होकर जाए। Sniffer को केवल garbage दिखे।',
          en: 'A GRE tunnel is readable — anyone sniffing the internet can read the original packet. IPsec encrypts it. The two routers first exchange keys with IKE, then every packet travels encrypted with an ESP header. The sniffer sees only garbage.',
        },
        exam: {
          gu: 'IKE phase 1 (ISAKMP SA, authentication, DH key exchange), phase 2 (IPsec SA, actual data encryption). ESP data encrypt કરે, AH ફક્ત integrity (હવે ઓછું વપરાય). Transport mode (host-to-host) vs Tunnel mode (gateway-to-gateway).',
          hi: 'IKE phase 1 (ISAKMP SA, authentication, DH key exchange), phase 2 (IPsec SA, actual data encryption)। ESP data encrypt करे, AH केवल integrity (अब कम वापरा जाता)। Transport mode (host-to-host) vs Tunnel mode (gateway-to-gateway)।',
          en: 'IKE phase 1 (ISAKMP SA, authentication, DH key exchange), phase 2 (IPsec SA, actual data encryption). ESP encrypts the data, AH does integrity only (rarely used now). Transport mode (host-to-host) vs tunnel mode (gateway-to-gateway).',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r1', x: 180, y: 200, type: 'router' as const, label: 'R1', sub: 'GRE + IPsec', accent: 'var(--nq-ok)', pulse: t > 0.3 },
          { id: 'net', x: 480, y: 200, type: 'cloud' as const, label: 'Internet', accent: 'var(--nq-text-mute)' },
          { id: 'spy', x: 480, y: 340, type: 'laptop' as const, label: 'sniffer', sub: t > 0.5 ? 'unreadable' : undefined, accent: 'var(--nq-text-mute)' },
          { id: 'r2', x: 780, y: 200, type: 'router' as const, label: 'R2', sub: 'GRE + IPsec', accent: 'var(--nq-ok)', pulse: t > 0.3 },
        ],
        links: [
          { id: 'tun', from: 'r1', to: 'r2', state: 'up', label: 'encrypted', flowing: true },
        ],
        packets: [
          { id: 'p', from: 'r1', to: 'r2', t: 0.1 + ease(Math.min(1, t)) * 0.8, color: 'var(--nq-ok)', label: '8f3a…c1d9' },
        ],
      }),
    },
    {
      ms: 2800,
      label: H('GRE over IPsec — બંને સાથે', 'GRE over IPsec — दोनों साथ', 'GRE over IPsec — both together'),
      text: {
        beginner: {
          gu: 'Classic combination: GRE આપે flexibility (routing protocols, multicast, IPv6 — બધું tunnel માં), IPsec આપે security. GRE outer, IPsec એને encrypt કરે. એટલે OSPF tunnel ની અંદર ચાલી શકે અને traffic sniff-proof રહે.',
          hi: 'Classic combination: GRE दे flexibility (routing protocols, multicast, IPv6 — सब tunnel में), IPsec दे security। GRE outer, IPsec उसे encrypt करे। तो OSPF tunnel के अंदर चल सके और traffic sniff-proof रहे।',
          en: 'The classic combination: GRE gives flexibility (routing protocols, multicast, IPv6 — all in the tunnel), IPsec gives security. GRE outer, IPsec encrypts it. So OSPF runs inside the tunnel and the traffic stays sniff-proof.',
        },
        exam: {
          gu: 'Tunnel interface પર `tunnel protection ipsec profile <name>` — GRE packet IPsec થી wrap થાય. DMVPN પણ આ model જ વાપરે, પણ dynamic IP ના spokes સાથે.',
          hi: 'Tunnel interface पर `tunnel protection ipsec profile <name>` — GRE packet IPsec से wrap हो। DMVPN भी यही model वापरे, पर dynamic IP के spokes के साथ।',
          en: '`tunnel protection ipsec profile <name>` on the tunnel interface — GRE packets get wrapped by IPsec. DMVPN uses the same model, but with spokes on dynamic IPs.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'r1', x: 200, y: 200, type: 'router' as const, label: 'R1', accent: CCNA },
          { id: 'r2', x: 760, y: 200, type: 'router' as const, label: 'R2', accent: CCNA },
        ],
        links: [
          { id: 'tun', from: 'r1', to: 'r2', state: 'up', label: 'GRE over IPsec — OSPF inside', flowing: true },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'VRF એક router ને અનેક અલગ nakshao ma vibhajit kare — overlapping IPs chale. GRE private LANs ne Internet par jodva ni nalee bane, aney IPsec ene encrypt kare. Routing protocols aney multicast jarur hoy to GRE over IPsec vapaarvanu.',
    hi: 'VRF एक router को कई अलग नक्शों में बांटे — overlapping IPs चलें। GRE private LANs को Internet पर जोड़ने की नली बने, और IPsec उसे encrypt करे। Routing protocols और multicast चाहिए तो GRE over IPsec वापरें।',
    en: 'VRF splits one router into many separate maps — overlapping IPs are fine. GRE builds a pipe to join private LANs over the internet, and IPsec encrypts it. When you need routing protocols and multicast, use GRE over IPsec.',
  },
  check: {
    q: H(
      'બે office ને Internet પર જોડવા છે, tunnel ની અંદર OSPF ચલાવવું છે, અને traffic encrypted જોઈએ. શું વાપરશો?',
      'दो office को Internet पर जोड़ना है, tunnel के अंदर OSPF चलाना है, और traffic encrypted चाहिए। क्या वापरेंगे?',
      'Two offices need to join over the internet, run OSPF inside the tunnel, and the traffic must be encrypted. What do you use?',
    ),
    options: [
      H('GRE over IPsec', 'GRE over IPsec', 'GRE over IPsec'),
      H('Pure IPsec tunnel mode', 'Pure IPsec tunnel mode', 'Pure IPsec tunnel mode'),
      H('MPLS VPN', 'MPLS VPN', 'MPLS VPN'),
    ],
    answer: 0,
    explain: H(
      'Pure IPsec unicast IP જ carry કરે — multicast અને routing protocols નહીં. GRE multi-protocol છે (OSPF Hello multicast છે), એટલે GRE જોઈએ. પણ GRE alone encrypt નથી કરતું, એટલે IPsec એના પર.',
      'Pure IPsec unicast IP ही carry करे — multicast और routing protocols नहीं। GRE multi-protocol है (OSPF Hello multicast है), तो GRE चाहिए। पर GRE अकेला encrypt नहीं करता, तो IPsec उसके ऊपर।',
      'Pure IPsec carries unicast IP only — no multicast or routing protocols. GRE is multi-protocol (OSPF Hello is multicast), so you need GRE. But GRE alone does not encrypt, hence IPsec on top.',
    ),
  },
}

/* ═══════════════════ p1l4 · LISP and VXLAN ═══════════════════ */

export const p1l4: LessonSpec = {
  why: {
    gu: 'પારંપરિક IP માં સરનામું બે વાતો એક સાથે કહે છે: **તમે કોણ છો** (identity) અને **તમે ક્યાં છો** (location). એટલે user એક સ્થળે બીજા સ્થળે જાય તો સરનામું બદલવું પડે. LISP એ બે વાતો અલગ કરે — અને એ જ fabric networks નો પાયો છે.',
    hi: 'पारंपरिक IP में पता दो बातें एक साथ कहे: **आप कौन हैं** (identity) और **आप कहां हैं** (location)। तो user एक जगह से दूसरी जगह जाए तो पता बदलना पड़े। LISP यह दो बातें अलग करे — और यही fabric networks का आधार है।',
    en: 'In traditional IP an address says two things at once: **who you are** (identity) and **where you are** (location). So when a user moves, the address has to change. LISP separates the two — and that is the basis of fabric networks.',
  },
  steps: [
    {
      ms: 3000,
      label: H('બે સરનામાં — EID અને RLOC', 'दो पते — EID और RLOC', 'Two addresses — EID and RLOC'),
      text: {
        beginner: {
          gu: 'LISP દરેક endpoint માટે બે અલગ addresses રાખે: **EID** (Endpoint ID — તમે કોણ છો, બદલાતું નથી) અને **RLOC** (Routing Locator — તમે અત્યારે ક્યાંથી જોડાયેલા છો, બદલાઈ શકે). એક map એ બે ને જોડે.',
          hi: 'LISP हर endpoint के लिए दो अलग addresses रखे: **EID** (Endpoint ID — आप कौन हैं, नहीं बदले) और **RLOC** (Routing Locator — आप अभी कहां से जुड़े हैं, बदल सकता है)। एक map इन दोनों को जोड़े।',
          en: 'LISP keeps two addresses per endpoint: **EID** (Endpoint ID — who you are, unchanging) and **RLOC** (Routing Locator — where you currently connect, may change). A map joins the two.',
        },
        exam: {
          gu: 'EID host નું logical address છે (10.1.1.5 જેવું), RLOC એ xTR નું physical address (edge router). Mapping EID → RLOC map server/resolver પર store થાય.',
          hi: 'EID host का logical address है (10.1.1.5 जैसा), RLOC xTR का physical address (edge router)। Mapping EID → RLOC map server/resolver पर store हो।',
          en: 'EID is the host’s logical address (like 10.1.1.5), RLOC is the xTR’s physical address (the edge router). The EID → RLOC mapping is stored on a map server/resolver.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'u', x: 180, y: 240, type: 'pc' as const, label: 'User', sub: 'EID 10.1.1.5', accent: BEG, pulse: true },
          { id: 'e', x: 420, y: 240, type: 'router' as const, label: 'xTR', sub: 'RLOC 203.0.113.1', accent: CCNA },
          { id: 'm', x: 700, y: 140, type: 'server' as const, label: 'Map Server', sub: 'EID → RLOC', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'u', to: 'e', state: 'up' },
          { id: 'b', from: 'e', to: 'm', state: 'up' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('પૂછો, encapsulate કરો, મોકલો', 'पूछें, encapsulate करें, भेजें', 'Ask, encapsulate, send'),
      text: {
        beginner: {
          gu: 'Source xTR ને destination EID માટે packet મળે. એ map resolver ને પૂછે: "10.2.2.5 ક્યાં છે?" Jawab aave: "RLOC 198.51.100.2 par". Source xTR original packet ne outer header (destination RLOC saathe) ma wrap kare ane modhve. Dusre chede xTR unwrap kare.',
          hi: 'Source xTR को destination EID के लिए packet मिले। वह map resolver से पूछे: "10.2.2.5 कहां है?" जवाब आए: "RLOC 198.51.100.2 पर"। Source xTR original packet को outer header (destination RLOC के साथ) में wrap करे और भेजे। दूसरे छोर पर xTR unwrap करे।',
          en: 'The source xTR receives a packet for a destination EID. It asks the map resolver: "where is 10.2.2.5?" The answer comes: "at RLOC 198.51.100.2". The source xTR wraps the original packet in an outer header (with the destination RLOC) and sends it. The far xTR unwraps it.',
        },
        exam: {
          gu: 'LISP encapsulation outer IP + UDP (port 4341) + LISP header + inner IP. Control plane UDP 4342. Pull-based: xTR જરૂર પડે ત્યારે pooche, 24-hour cache.',
          hi: 'LISP encapsulation outer IP + UDP (port 4341) + LISP header + inner IP। Control plane UDP 4342। Pull-based: xTR जरूरत पड़े तो पूछे, 24-hour cache।',
          en: 'LISP encapsulation: outer IP + UDP (port 4341) + LISP header + inner IP. Control plane on UDP 4342. Pull-based: the xTR asks only when needed and caches the answer for 24 hours.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's', x: 100, y: 280, type: 'pc' as const, label: 'src EID', accent: BEG },
          { id: 'x1', x: 280, y: 280, type: 'router' as const, label: 'src xTR', accent: CCNA },
          { id: 'm', x: 480, y: 100, type: 'server' as const, label: 'Map Resolver', accent: CCNP, pulse: t > 0.3 && t < 0.6 },
          { id: 'x2', x: 680, y: 280, type: 'router' as const, label: 'dst xTR', accent: CCNA },
          { id: 'd', x: 860, y: 280, type: 'pc' as const, label: 'dst EID', accent: BEG },
        ],
        links: [
          { id: 'q', from: 'x1', to: 'm', state: 'up', flowing: t > 0.2 && t < 0.5 },
          { id: 't', from: 'x1', to: 'x2', state: 'up', flowing: t > 0.5 },
          { id: 'e', from: 'x2', to: 'd', state: 'up', flowing: t > 0.8 },
          { id: 'f', from: 's', to: 'x1', state: 'up' },
        ],
        packets:
          t > 0.3 && t < 0.5
            ? [{ id: 'q', from: 'x1', to: 'm', t: 0.1 + ease((t - 0.3) / 0.2) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'map request' }]
            : t > 0.5
              ? [{ id: 'p', from: 'x1', to: 'x2', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-pkt-data)', label: 'encapsulated' }]
              : [],
      }),
    },
    {
      ms: 3200,
      label: H('VXLAN — Layer 2 ને WAN પર', 'VXLAN — Layer 2 को WAN पर', 'VXLAN — Layer 2 over the WAN'),
      text: {
        beginner: {
          gu: 'VXLAN LISP નું સગું છે: એ પણ encapsulation. પણ એ ethernet frame ને UDP માં wrap કરે, એટલે આખું L2 segment (broadcast domain) WAN પાર જઈ શકે. VM એક data center થી બીજા DC માં migrate થાય અને એનું MAC/IP બદલાય નહીં.',
          hi: 'VXLAN LISP का रिश्तेदार है: वह भी encapsulation। पर वह ethernet frame को UDP में wrap करे, तो पूरा L2 segment (broadcast domain) WAN पार जा सके। VM एक data center से दूसरे DC में migrate हो और उसका MAC/IP न बदले।',
          en: 'VXLAN is LISP’s cousin: it is also encapsulation. But it wraps an ethernet frame inside UDP, so an entire L2 segment (broadcast domain) can cross the WAN. A VM migrates from one data centre to another and its MAC/IP do not change.',
        },
        exam: {
          gu: 'VXLAN header 24-bit VNI (VXLAN Network Identifier) ધરાવે — 16 million segments possible (VLAN ના 4094 ની સામે). UDP 4789. Underlay IP network જોઈએ, VTEP (VXLAN Tunnel Endpoint) encapsulation કરે.',
          hi: 'VXLAN header 24-bit VNI (VXLAN Network Identifier) रखे — 16 million segments possible (VLAN के 4094 के मुकाबले)। UDP 4789। Underlay IP network चाहिए, VTEP (VXLAN Tunnel Endpoint) encapsulation करे।',
          en: 'The VXLAN header carries a 24-bit VNI (VXLAN Network Identifier) — 16 million segments possible (vs VLAN’s 4094). UDP 4789. Needs an underlay IP network; a VTEP (VXLAN Tunnel Endpoint) does the encapsulation.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'v1', x: 150, y: 180, type: 'server' as const, label: 'VM', sub: 'DC 1', accent: BEG, pulse: t < 0.5 },
          { id: 't1', x: 320, y: 180, type: 'router' as const, label: 'VTEP', accent: CCNA },
          { id: 'u', x: 480, y: 180, type: 'cloud' as const, label: 'WAN (IP)', accent: 'var(--nq-text-mute)' },
          { id: 't2', x: 640, y: 180, type: 'router' as const, label: 'VTEP', accent: CCNA },
          { id: 'v2', x: 810, y: 180, type: 'server' as const, label: 'VM moved', sub: 'DC 2', accent: CCNP, pulse: t > 0.5 },
        ],
        links: [
          { id: 'tun', from: 't1', to: 't2', state: 'up', label: 'VXLAN', flowing: t > 0.4 },
          { id: 'a', from: 'v1', to: 't1', state: 'up' },
          { id: 'b', from: 't2', to: 'v2', state: 'up' },
        ],
      }),
    },
    {
      ms: 2800,
      label: H('બંને fabric નો પાયો', 'दोनों fabric की नींव', 'The basis of both fabrics'),
      text: {
        beginner: {
          gu: 'SD-Access LISP (control plane) + VXLAN (data plane) વાપરે: LISP map server કહે "આ EID અહીં છે", VXLAN actual packet carry કરે. Data center નું VXLAN EVPN bhi એ જ વિચાર — identity અને location separate.',
          hi: 'SD-Access LISP (control plane) + VXLAN (data plane) वापरे: LISP map server कहे "यह EID यहां है", VXLAN actual packet carry करे। Data center का VXLAN EVPN भी यही विचार — identity और location अलग।',
          en: 'SD-Access uses LISP (control plane) + VXLAN (data plane): the LISP map server says "this EID is here", VXLAN carries the actual packet. VXLAN EVPN in the data centre uses the same idea — identity and location separated.',
        },
        exam: {
          gu: 'EVPN BGP-based control plane for VXLAN. MAC-IP bindings MP-BGP થી advertise થાય. Benefits: broadcast suppression, ARP optimization, host mobility, multi-tenancy.',
          hi: 'EVPN BGP-based control plane for VXLAN। MAC-IP bindings MP-BGP से advertise हों। Benefits: broadcast suppression, ARP optimization, host mobility, multi-tenancy।',
          en: 'EVPN is a BGP-based control plane for VXLAN. MAC-IP bindings are advertised by MP-BGP. Benefits: broadcast suppression, ARP optimisation, host mobility, multi-tenancy.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'cp', x: 450, y: 100, type: 'server' as const, label: 'LISP control', sub: 'identity map', accent: CCNP, pulse: true },
          { id: 'dp', x: 450, y: 320, type: 'cloud' as const, label: 'VXLAN data', sub: 'actual packets', accent: CCNA, pulse: true },
          { id: 's1', x: 200, y: 210, type: 'switch' as const, label: 'Edge', accent: BEG },
          { id: 's2', x: 700, y: 210, type: 'switch' as const, label: 'Edge', accent: BEG },
        ],
        links: [
          { id: 'a', from: 's1', to: 'cp', state: 'up' },
          { id: 'b', from: 's2', to: 'cp', state: 'up' },
          { id: 'c', from: 's1', to: 'dp', state: 'up' },
          { id: 'd', from: 's2', to: 'dp', state: 'up' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'LISP identity (EID) ને location (RLOC) થી અલગ કરે — user એક જગ્યાએથી બીજી જગ્યાએ જાય તોય એનું EID એ જ. VXLAN L2 segments ને IP WAN પર carry કરે, 16M segments scale. SD-Access અને modern DC fabrics બંનેનો પાયો આ બે technologies પર.',
    hi: 'LISP identity (EID) को location (RLOC) से अलग करे — user एक जगह से दूसरी जगह जाए तो भी उसका EID वही। VXLAN L2 segments को IP WAN पर carry करे, 16M segments scale। SD-Access और modern DC fabrics दोनों की नींव इन दो technologies पर।',
    en: 'LISP separates identity (EID) from location (RLOC) — a user moves and their EID stays the same. VXLAN carries L2 segments over an IP WAN, scaling to 16M segments. SD-Access and modern DC fabrics both rest on these two technologies.',
  },
  check: {
    q: H(
      'User લેપટોપ લઈને મુંબઈ office થી દિલ્હી office જાય. LISP માં શું બદલાય?',
      'User लैपटॉप लेकर मुंबई office से दिल्ली office जाए। LISP में क्या बदले?',
      'A user takes their laptop from the Mumbai office to the Delhi office. In LISP, what changes?',
    ),
    options: [
      H('RLOC બદલાય, EID એ જ રહે', 'RLOC बदले, EID वही रहे', 'The RLOC changes, the EID stays the same'),
      H('EID બદલાય, RLOC એ જ રહે', 'EID बदले, RLOC वही रहे', 'The EID changes, the RLOC stays the same'),
      H('બંને બદલાય', 'दोनों बदलें', 'Both change'),
    ],
    answer: 0,
    explain: H(
      'EID એ user ની identity છે — એ બદલાતી નથી. RLOC એ attach point (જે edge router પર user જોડાયેલ છે) નું સરનામું — એ બદલાય. Map server નવા RLOC ને update કરે, અને traffic આપોઆપ નવી જગ્યાએ રૂટ થાય. એ જ તો point છે.',
      'EID user की identity है — वह नहीं बदलती। RLOC attach point (जिस edge router पर user जुड़ा है) का पता — वह बदले। Map server नए RLOC को update करे, और traffic अपने आप नई जगह route हो। यही तो point है।',
      'The EID is the user’s identity — it does not change. The RLOC is the address of the attachment point (the edge router they are plugged into) — that changes. The map server updates the new RLOC and traffic routes to the new place automatically. That is the whole point.',
    ),
  },
}
