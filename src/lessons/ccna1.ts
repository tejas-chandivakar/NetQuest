import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const WARN = 'var(--nq-warn)'

/* ══════════════════════ n1l4 · Subnetting ══════════════════════ */

export const n1l4: LessonSpec = {
  why: {
    gu: 'Subnetting CCNA નો સૌથી ડરામણો ભાગ ગણાય છે, પણ એનો આખો વિચાર એક જ વાક્યમાં છે: એક મોટી શેરીને દીવાલ નાખીને નાની ગલીઓમાં વહેંચવી. દીવાલ ક્યાં પડે એ subnet mask નક્કી કરે છે.',
    en: 'Subnetting has a reputation as the frightening part of CCNA, but the whole idea fits in one sentence: split one big street into smaller lanes by putting up walls. The subnet mask decides where each wall goes.',
  },
  steps: [
    {
      ms: 2800,
      label: { gu: 'એક મોટી શેરી — 254 ઘર', en: 'One big street — 254 houses' },
      text: {
        beginner: {
          gu: '192.168.1.0/24 એટલે એક શેરી જેમાં 254 ઘર સમાઈ શકે. પણ તમારી ઓફિસમાં ફક્ત ત્રણ વિભાગ છે — Sales માં 20 માણસ, HR માં 10, IT માં 5. બધાને એક જ શેરીમાં મૂકો તો 219 સરનામાં નકામાં પડ્યાં રહે.',
          en: '192.168.1.0/24 is one street with room for 254 houses. But your office has three departments — 20 in Sales, 10 in HR, 5 in IT. Put them all on one street and 219 addresses sit unused.',
        },
        exam: {
          gu: '/24 માં 8 host bits છે: 2^8 − 2 = 254 usable addresses. એક જ broadcast domain હોવાથી દરેક broadcast બધા 254 hosts સુધી પહોંચે છે.',
          en: 'A /24 has 8 host bits: 2^8 − 2 = 254 usable addresses. With one broadcast domain every broadcast reaches all 254 hosts.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'sw', x: 430, y: 290, type: 'switch' as const, label: '192.168.1.0/24', sub: 'one street · 254 houses', accent: CCNA, pulse: true },
          { id: 'a', x: 180, y: 140, type: 'pc' as const, label: 'Sales', sub: '20 users', accent: BEG },
          { id: 'b', x: 430, y: 120, type: 'pc' as const, label: 'HR', sub: '10 users', accent: WARN },
          { id: 'c', x: 680, y: 140, type: 'pc' as const, label: 'IT', sub: '5 users', accent: CCNP },
        ],
        links: [
          { id: 'l1', from: 'sw', to: 'a', state: 'up' },
          { id: 'l2', from: 'sw', to: 'b', state: 'up' },
          { id: 'l3', from: 'sw', to: 'c', state: 'up' },
        ],
      }),
      aside: () => ({
        title: { gu: 'વપરાશ', en: 'Utilisation' },
        head: ['', 'count'],
        rows: [
          ['addresses available', '254'],
          ['actually needed', '35'],
          ['wasted', '219'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'Host bits ઉધાર લો', en: 'Borrow host bits' },
      text: {
        beginner: {
          gu: 'શેરી વહેંચવા માટે આપણે ઘરના નંબર માટેના bits માંથી થોડા ઉધાર લઈએ છીએ અને એમને શેરીના નામમાં ઉમેરી દઈએ છીએ. બે bits ઉધાર લો તો /24 નું /26 થઈ જાય — અને એક શેરીની ચાર ગલીઓ બની જાય.',
          en: 'To split the street we borrow a few bits from the house numbers and hand them to the street name. Borrow two bits and /24 becomes /26 — one street turns into four lanes.',
        },
        exam: {
          gu: 'Borrowed bits ની સંખ્યા n હોય તો 2^n subnets મળે. /24 → /26 એટલે 2 bits, 4 subnets, દરેકમાં 2^6 − 2 = 62 usable hosts.',
          en: 'Borrowing n bits yields 2^n subnets. /24 → /26 borrows 2 bits for 4 subnets, each with 2^6 − 2 = 62 usable hosts.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 430, y: 230, type: 'switch' as const, label: t > 0.5 ? '/26' : '/24', sub: t > 0.5 ? '255.255.255.192' : '255.255.255.0', accent: t > 0.5 ? CCNP : CCNA, pulse: true },
        ],
      }),
      aside: (t) => ({
        title: { gu: 'Bits ઉધાર', en: 'Borrowing bits' },
        head: ['borrowed', 'prefix', 'subnets', 'hosts each'],
        rows: [
          ['0', '/24', '1', '254'],
          ['1', '/25', '2', '126'],
          ['2', '/26', t > 0.5 ? '4 ←' : '4', '62'],
          ['3', '/27', '8', '30'],
          ['4', '/28', '16', '14'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'ચાર ગલીઓ બની', en: 'Four lanes appear' },
      text: {
        beginner: {
          gu: '/26 એટલે દરેક ગલીમાં 64 સરનામાં. એટલે ગલીઓ 0 થી શરૂ થઈને દર 64 પગલે બદલાય: .0, .64, .128, .192. આ 64 ને block size કહે છે — અને subnetting નો આખો જવાબ આ એક આંકડામાં છે.',
          en: 'A /26 gives 64 addresses per lane. So the lanes start at 0 and change every 64 steps: .0, .64, .128, .192. That 64 is the block size — and the whole answer to any subnetting question lives in that one number.',
        },
        exam: {
          gu: 'Block size = 256 − mask octet. /26 માં mask નો છેલ્લો octet 192 છે, એટલે 256 − 192 = 64. Subnets એ જ અંતરે આવે છે.',
          en: 'Block size = 256 − the mask octet. For /26 the last mask octet is 192, so 256 − 192 = 64. The subnets land at that spacing.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 170, y: 150, type: 'switch' as const, label: '.0/26', sub: '.1 – .62', accent: BEG, dim: t < 0.2 },
          { id: 'b', x: 420, y: 150, type: 'switch' as const, label: '.64/26', sub: '.65 – .126', accent: WARN, dim: t < 0.4 },
          { id: 'c', x: 170, y: 330, type: 'switch' as const, label: '.128/26', sub: '.129 – .190', accent: CCNP, dim: t < 0.6 },
          { id: 'd', x: 420, y: 330, type: 'switch' as const, label: '.192/26', sub: '.193 – .254', accent: CCNA, dim: t < 0.8 },
        ],
      }),
      aside: (t) => ({
        title: { gu: 'ચાર subnets', en: 'The four subnets' },
        head: ['network', 'first', 'last', 'broadcast'],
        rows: [
          ['192.168.1.0', '.1', '.62', '.63'],
          t > 0.4 ? ['192.168.1.64', '.65', '.126', '.127'] : ['…', '', '', ''],
          t > 0.6 ? ['192.168.1.128', '.129', '.190', '.191'] : ['…', '', '', ''],
          t > 0.8 ? ['192.168.1.192', '.193', '.254', '.255'] : ['…', '', '', ''],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'દરેક ગલીમાં ત્રણ ખાસ સરનામાં', en: 'Three special addresses per lane' },
      text: {
        beginner: {
          gu: 'દરેક ગલીમાં પહેલું સરનામું ગલીનું નામ છે અને છેલ્લું broadcast. વચ્ચેનાં જ વાપરી શકાય. એટલે 64 માંથી 62 મળે. અને સામાન્ય રીતે એક વધુ router ના gateway માટે જાય — એટલે ખરેખર 61 મશીન બેસે.',
          en: 'In every lane the first address names the lane and the last is its broadcast. Only the middle ones are usable, so 64 gives you 62. One more usually goes to the router as the gateway — leaving room for 61 machines.',
        },
        exam: {
          gu: 'Network address = બધા host bits 0; broadcast = બધા host bits 1. Usable range એ બેની વચ્ચે. Gateway સામાન્ય રીતે પહેલું usable address લે છે.',
          en: 'Network address = all host bits 0; broadcast = all host bits 1. The usable range sits between them, and the gateway conventionally takes the first usable address.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'net', x: 160, y: 230, type: 'switch' as const, label: '192.168.1.64', sub: 'the lane name', accent: 'var(--nq-text-mute)' },
          { id: 'gw', x: 400, y: 230, type: 'router' as const, label: '.65', sub: 'gateway', accent: CCNP, pulse: t > 0.3 },
          { id: 'pc', x: 620, y: 230, type: 'pc' as const, label: '.66 – .126', sub: '61 machines', accent: BEG, pulse: t > 0.6 },
        ],
        links: [
          { id: 'l', from: 'gw', to: 'pc', state: 'up', flowing: t > 0.6 },
        ],
      }),
      aside: () => ({
        title: { gu: '192.168.1.64/26', en: '192.168.1.64/26' },
        head: ['address', 'role'],
        rows: [
          ['192.168.1.64', 'network — not usable'],
          ['192.168.1.65', 'gateway (by convention)'],
          ['192.168.1.66 – .126', 'your machines'],
          ['192.168.1.127', 'broadcast — not usable'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'દરેક વિભાગને પોતાની ગલી', en: 'A lane for each department' },
      text: {
        beginner: {
          gu: 'હવે દરેક વિભાગને પોતાની ગલી મળી. Sales .0/26 માં, HR .64/26 માં, IT .128/26 માં. એકબીજાના broadcast સંભળાતા નથી, અને વચ્ચે router હોવાથી તમે નક્કી કરી શકો કે કોણ કોને મળે.',
          en: 'Now each department has its own lane: Sales in .0/26, HR in .64/26, IT in .128/26. They no longer hear each other’s broadcasts, and because a router sits between them you decide who may reach whom.',
        },
        exam: {
          gu: 'દરેક subnet એક અલગ broadcast domain છે. Inter-subnet traffic router (અથવા L3 switch) થઈને જ જાય, એટલે ત્યાં ACL લગાવી શકાય.',
          en: 'Each subnet is a separate broadcast domain. Inter-subnet traffic must cross a router (or L3 switch), which is exactly where an ACL can be applied.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r', x: 430, y: 240, type: 'router' as const, label: 'Router', accent: CCNP, pulse: true },
          { id: 's', x: 160, y: 120, type: 'pc' as const, label: 'Sales', sub: '.0/26', accent: BEG },
          { id: 'h', x: 700, y: 120, type: 'pc' as const, label: 'HR', sub: '.64/26', accent: WARN },
          { id: 'i', x: 430, y: 390, type: 'pc' as const, label: 'IT', sub: '.128/26', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'r', to: 's', state: 'up', flowing: t > 0.3 },
          { id: 'b', from: 'r', to: 'h', state: 'up', flowing: t > 0.5 },
          { id: 'c', from: 'r', to: 'i', state: 'up', flowing: t > 0.7 },
        ],
        packets:
          t > 0.3
            ? [{ id: 'p', from: 's', to: 'h', t: 0.1 + ease((t - 0.3) / 0.7) * 0.8, color: 'var(--nq-pkt-data)', label: 'via router' }]
            : [],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'VLSM — બધી ગલીઓ સરખી ન હોય', en: 'VLSM — lanes need not be equal' },
      text: {
        beginner: {
          gu: 'IT માં ફક્ત 5 માણસ છે તો એમને 62 સરનામાં શું કામ? એટલે ગલીઓ અલગ અલગ કદની બનાવાય છે — મોટા વિભાગને મોટી, નાનાને નાની. આને VLSM કહે છે. બે router વચ્ચેની લિંક માટે તો /30 પૂરતું છે — ફક્ત બે સરનામાં.',
          en: 'If IT has only five people, why give them 62 addresses? So we build lanes of different sizes — bigger for bigger departments. That is VLSM. A link between two routers needs only a /30 — just two addresses.',
        },
        exam: {
          gu: 'VLSM માં સૌથી મોટી જરૂરિયાતથી શરૂ કરીને ઉતરતા ક્રમે allocate કરો, નહીંતર overlap થાય. Point-to-point links માટે /30 (અથવા /31) વાપરો.',
          en: 'With VLSM allocate from the largest requirement downward, or the blocks will overlap. Use /30 (or /31) for point-to-point links.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 's', x: 160, y: 150, type: 'switch' as const, label: 'Sales /26', sub: '62 hosts', accent: BEG },
          { id: 'h', x: 430, y: 150, type: 'switch' as const, label: 'HR /28', sub: '14 hosts', accent: WARN },
          { id: 'i', x: 680, y: 150, type: 'switch' as const, label: 'IT /29', sub: '6 hosts', accent: CCNA },
          { id: 'l', x: 430, y: 340, type: 'router' as const, label: 'WAN link /30', sub: '2 hosts', accent: CCNP, pulse: true },
        ],
      }),
      aside: () => ({
        title: { gu: 'કદ પ્રમાણે', en: 'Right-sized' },
        head: ['need', 'prefix', 'gives'],
        rows: [
          ['20 users', '/26', '62'],
          ['10 users', '/28', '14'],
          ['5 users', '/29', '6'],
          ['router link', '/30', '2'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Subnetting એટલે host bits ઉધાર લઈને એક નેટવર્કને ઘણાં નાનાંમાં વહેંચવું. Block size = 256 − mask octet, અને subnets એ જ અંતરે આવે. દરેકમાં પહેલું નામ, છેલ્લું broadcast. VLSM થી દરેક ગલી જેટલી જોઈએ એટલી જ મોટી બનાવો.',
    en: 'Subnetting is borrowing host bits to split one network into many. Block size = 256 − the mask octet, and the subnets land at that spacing. In each, the first address names it and the last is broadcast. With VLSM you size every lane to exactly what it needs.',
  },
  check: {
    q: {
      gu: '192.168.1.0/26 પછીનું બીજું subnet કયું?',
      en: 'What is the next subnet after 192.168.1.0/26?',
    },
    options: [
      { gu: '192.168.1.64', en: '192.168.1.64' },
      { gu: '192.168.1.26', en: '192.168.1.26' },
      { gu: '192.168.1.128', en: '192.168.1.128' },
    ],
    answer: 0,
    explain: {
      gu: '/26 નો mask octet 192 છે, એટલે block size = 256 − 192 = 64. Subnets દર 64 પગલે આવે: .0, .64, .128, .192.',
      en: 'The mask octet for /26 is 192, so the block size is 256 − 192 = 64. The subnets step by 64: .0, .64, .128, .192.',
    },
  },
}

/* ══════════════════════ n2l2 · VLANs ══════════════════════ */

const vlanNodes = (v10: boolean, v20: boolean) => [
  { id: 'pc1', x: 140, y: 85, type: 'pc' as const, label: 'PC1', sub: v10 ? 'VLAN 10' : '192.168.1.11', accent: v10 ? BEG : 'var(--nq-text-mute)' },
  { id: 'pc2', x: 140, y: 300, type: 'pc' as const, label: 'PC2', sub: v10 ? 'VLAN 10' : '192.168.1.12', accent: v10 ? BEG : 'var(--nq-text-mute)' },
  { id: 'sw1', x: 430, y: 192, type: 'switch' as const, label: 'SW1', accent: CCNA },
  { id: 'pc3', x: 720, y: 85, type: 'pc' as const, label: 'PC3', sub: v20 ? 'VLAN 20' : '192.168.1.13', accent: v20 ? CCNP : 'var(--nq-text-mute)' },
  { id: 'pc4', x: 720, y: 300, type: 'pc' as const, label: 'PC4', sub: v20 ? 'VLAN 20' : '192.168.1.14', accent: v20 ? CCNP : 'var(--nq-text-mute)' },
]

const vlanLinks = [
  { id: 'l1', from: 'sw1', to: 'pc1', state: 'up' as const },
  { id: 'l2', from: 'sw1', to: 'pc2', state: 'up' as const },
  { id: 'l3', from: 'sw1', to: 'pc3', state: 'up' as const },
  { id: 'l4', from: 'sw1', to: 'pc4', state: 'up' as const },
]

export const n2l2: LessonSpec = {
  why: {
    gu: 'એક switch ખરીદો અને તમને એક નેટવર્ક મળે છે. પણ Sales અને Accounts ને અલગ રાખવાં હોય તો? બીજો switch ખરીદવાની જરૂર નથી — VLAN એક જ switch ને અંદરથી ઘણા switch માં વહેંચી દે છે.',
    en: 'Buy one switch and you get one network. But what if Sales and Accounts must stay apart? You do not need a second switch — a VLAN splits one switch into several from the inside.',
  },
  viewBox: { w: 860, h: 390 },
  steps: [
    {
      ms: 2800,
      label: { gu: 'બધા એક જ નેટવર્કમાં', en: 'Everyone on one network' },
      text: {
        beginner: {
          gu: 'Switch ડબ્બામાંથી કાઢો એટલે એના બધા ports એક જ નેટવર્કમાં હોય છે — VLAN 1 માં. ચારેય PC એકબીજાને જુએ છે, એકબીજાને ping કરી શકે છે, અને એકબીજાના broadcast સાંભળે છે.',
          en: 'Take a switch out of the box and every port sits in one network — VLAN 1. All four PCs see each other, can ping each other, and hear each other’s broadcasts.',
        },
        exam: {
          gu: 'Default માં બધા ports access mode માં VLAN 1 પર હોય છે. એક જ broadcast domain, એક જ MAC address table space.',
          en: 'By default every port is an access port in VLAN 1: one broadcast domain sharing one MAC address table space.',
        },
      },
      scene: (t) => ({
        nodes: vlanNodes(false, false),
        links: vlanLinks,
        packets:
          t > 0.3
            ? [{ id: 'p', from: 'pc1', to: 'pc4', t: 0.1 + ease((t - 0.3) / 0.7) * 0.8, color: 'var(--nq-pkt-data)', label: 'ping ✓' }]
            : [],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'પણ એ જોખમ છે', en: 'But that is a risk' },
      text: {
        beginner: {
          gu: 'Accounts નું કમ્પ્યુટર અને મહેમાનનું લેપટોપ એક જ નેટવર્કમાં હોય એ સારું નથી. વળી કોઈ એક મશીન broadcast નો વરસાદ કરે તો બધાં ધીમાં પડે. મોટા નેટવર્કમાં આ સમસ્યા ગંભીર બને છે.',
          en: 'Having the Accounts machine and a guest laptop on one network is not healthy. And if one machine floods broadcasts, everyone slows down. In a large network that becomes serious.',
        },
        exam: {
          gu: 'મોટું broadcast domain = વધુ ARP/DHCP broadcast દરેક host સુધી, અને કોઈ security boundary નહીં. એ જ બે કારણ VLAN ના મૂળમાં છે.',
          en: 'A large broadcast domain means more ARP and DHCP broadcasts reaching every host, and no security boundary. Those two reasons are the whole motivation for VLANs.',
        },
      },
      scene: (t) => ({
        nodes: vlanNodes(false, false),
        links: vlanLinks.map((l) => ({ ...l, flowing: t > 0.3 })),
        packets:
          t > 0.3
            ? [
                { id: 'b1', from: 'pc1', to: 'sw1', t: 0.1 + ease((t - 0.3) / 0.7) * 0.8, color: WARN, label: 'broadcast' },
                { id: 'b2', from: 'sw1', to: 'pc2', t: 0.1 + ease((t - 0.3) / 0.7) * 0.8, color: WARN },
                { id: 'b3', from: 'sw1', to: 'pc3', t: 0.1 + ease((t - 0.3) / 0.7) * 0.8, color: WARN },
                { id: 'b4', from: 'sw1', to: 'pc4', t: 0.1 + ease((t - 0.3) / 0.7) * 0.8, color: WARN },
              ]
            : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'VLAN બનાવો — એક નંબર, એક નામ', en: 'Create a VLAN — a number and a name' },
      text: {
        beginner: {
          gu: 'VLAN એ switch ની અંદર એક અદૃશ્ય દીવાલ છે. તમે ફક્ત એક નંબર આપો છો — VLAN 10, નામ Sales. આ ક્ષણે switch ની અંદર એક નવું, સાવ ખાલી નેટવર્ક બની જાય છે, જેમાં હજી એકેય port નથી.',
          en: 'A VLAN is an invisible wall inside the switch. You simply give it a number — VLAN 10, named Sales. At that moment a brand-new, completely empty network exists inside the switch, with no ports in it yet.',
        },
        exam: {
          gu: '`vlan 10` + `name Sales` VLAN database માં entry બનાવે છે. Normal range 1–1005, extended 1006–4094. VLAN બન્યું એટલું જ — ports હજી જોડાયા નથી.',
          en: '`vlan 10` plus `name Sales` creates an entry in the VLAN database. The normal range is 1–1005 and extended is 1006–4094. The VLAN now exists, but no ports belong to it.',
        },
      },
      scene: (t) => ({
        nodes: vlanNodes(false, false).map((n) =>
          n.id === 'sw1' ? { ...n, sub: t > 0.4 ? 'VLAN 10 · Sales' : undefined, pulse: t > 0.4 } : n,
        ),
        links: vlanLinks,
      }),
      aside: (t) => ({
        title: { gu: 'VLAN database', en: 'VLAN database' },
        head: ['id', 'name', 'ports'],
        rows:
          t > 0.4
            ? [
                ['1', 'default', 'Fa0/1-4'],
                ['10', 'Sales', '(none yet)'],
              ]
            : [['1', 'default', 'Fa0/1-4']],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'Port ને VLAN માં મૂકો', en: 'Put a port into the VLAN' },
      text: {
        beginner: {
          gu: 'હવે ports ને નવી VLAN માં ખસેડો. Fa0/1 અને Fa0/2 ને VLAN 10 માં મૂક્યા — PC1 અને PC2 હવે Sales માં. PC3 અને PC4 ને VLAN 20 માં મૂકીએ. દીવાલ ઊભી થઈ ગઈ.',
          en: 'Now move ports into the new VLAN. Fa0/1 and Fa0/2 go into VLAN 10 — PC1 and PC2 are now in Sales. Put Fa0/3 and Fa0/4 into VLAN 20. The wall is up.',
        },
        exam: {
          gu: '`switchport mode access` + `switchport access vlan 10`. એક access port એક જ VLAN માં રહી શકે, અને એના પરના frames untagged હોય છે.',
          en: '`switchport mode access` then `switchport access vlan 10`. An access port belongs to exactly one VLAN and its frames travel untagged.',
        },
      },
      scene: (t) => ({
        nodes: vlanNodes(t > 0.3, t > 0.65),
        links: vlanLinks,
      }),
      aside: (t) => ({
        title: { gu: 'Port assignment', en: 'Port assignment' },
        head: ['port', 'vlan'],
        rows: [
          ['Fa0/1', t > 0.3 ? '10' : '1'],
          ['Fa0/2', t > 0.3 ? '10' : '1'],
          ['Fa0/3', t > 0.65 ? '20' : '1'],
          ['Fa0/4', t > 0.65 ? '20' : '1'],
        ],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'દીવાલ કામ કરે છે', en: 'The wall works' },
      text: {
        beginner: {
          gu: 'હવે PC1 થી PC2 ને ping કરો — ચાલે છે, બંને VLAN 10 માં છે. પણ PC1 થી PC3 ને ping કરો — નથી ચાલતું! જોકે બંને એક જ switch માં જોડાયેલા છે અને એમનાં IP પણ એક જ નેટવર્કનાં છે. Switch એ frame ને બીજી VLAN માં જવા જ નથી દેતો.',
          en: 'Ping PC1 to PC2 — it works, both are in VLAN 10. Now ping PC1 to PC3 — it fails. And yet they are plugged into the same switch, with IPs in the same network. The switch simply refuses to let the frame cross into the other VLAN.',
        },
        exam: {
          gu: 'Switch દરેક VLAN માટે અલગ MAC table રાખે છે અને એક VLAN નો frame બીજી VLAN ના port પર કદી forward થતો નથી — IP subnet સરખું હોય તો પણ.',
          en: 'The switch keeps a separate MAC table per VLAN and never forwards a frame from one VLAN out of another VLAN’s port — even when the IP subnet matches.',
        },
      },
      scene: (t) => ({
        nodes: vlanNodes(true, true),
        links: vlanLinks,
        packets:
          t < 0.5
            ? [{ id: 'ok', from: 'pc1', to: 'pc2', t: 0.1 + ease(t / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'same VLAN ✓' }]
            : [{ id: 'no', from: 'pc1', to: 'sw1', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-err)', label: 'VLAN 10 → 20 ✕' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'ફરી જોડવા router જોઈએ', en: 'To rejoin them you need a router' },
      text: {
        beginner: {
          gu: 'VLAN દીવાલ ઊભી કરે છે, અને એ દીવાલ ઓળંગવાનો એક જ રસ્તો છે: Layer 3. Router કે L3 switch વચ્ચે મૂકો તો જ Sales અને Accounts વાત કરી શકે — અને ત્યાં જ તમે ACL લગાવીને નક્કી કરી શકો કે કોણ શું જોઈ શકે.',
          en: 'A VLAN builds a wall, and there is only one way over it: Layer 3. Put a router or an L3 switch in between and Sales can reach Accounts — and that is exactly where an ACL decides who may see what.',
        },
        exam: {
          gu: 'Inter-VLAN routing router-on-a-stick (subinterfaces પર 802.1Q) અથવા L3 switch પર SVI થી થાય છે. દરેક VLAN ને પોતાનું IP subnet અને gateway જોઈએ.',
          en: 'Inter-VLAN routing is done with router-on-a-stick (802.1Q subinterfaces) or SVIs on an L3 switch. Each VLAN needs its own IP subnet and gateway.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc1', x: 120, y: 120, type: 'pc' as const, label: 'PC1', sub: 'VLAN 10', accent: BEG },
          { id: 'sw1', x: 360, y: 240, type: 'switch' as const, label: 'SW1', accent: CCNA },
          { id: 'pc3', x: 120, y: 360, type: 'pc' as const, label: 'PC3', sub: 'VLAN 20', accent: CCNP },
          { id: 'r', x: 660, y: 240, type: 'router' as const, label: 'Router', sub: 'inter-VLAN', accent: CCNP, pulse: t > 0.3 },
        ],
        links: [
          { id: 'a', from: 'sw1', to: 'pc1', state: 'up' },
          { id: 'b', from: 'sw1', to: 'pc3', state: 'up' },
          { id: 'c', from: 'sw1', to: 'r', state: 'up', flowing: t > 0.3, label: 'trunk' },
        ],
        packets:
          t > 0.3
            ? [
                t < 0.65
                  ? { id: 'p', from: 'pc1', to: 'r', t: 0.1 + ease((t - 0.3) / 0.35) * 0.8, color: 'var(--nq-pkt-data)', label: 'up to L3' }
                  : { id: 'p', from: 'r', to: 'pc3', t: 0.1 + ease((t - 0.65) / 0.35) * 0.8, color: 'var(--nq-ok)', label: 'back down ✓' },
              ]
            : [],
      }),
    },
  ],
  takeaway: {
    gu: 'VLAN એક switch ને અંદરથી ઘણા અલગ switch માં વહેંચે છે. એક VLAN નો frame બીજીમાં કદી જતો નથી — IP સરખાં હોય તો પણ. ફરી જોડવા માટે Layer 3 જોઈએ, અને એ જ જગ્યા છે જ્યાં તમે નિયમો લગાવી શકો.',
    en: 'A VLAN splits one switch into several from the inside. A frame in one VLAN never reaches another — even with matching IPs. Rejoining them takes Layer 3, and that is precisely where you can apply rules.',
  },
  check: {
    q: {
      gu: 'PC1 (VLAN 10) અને PC3 (VLAN 20) એક જ switch પર છે અને બંનેનાં IP 192.168.1.x છે. Ping ચાલશે?',
      en: 'PC1 (VLAN 10) and PC3 (VLAN 20) are on the same switch, both with 192.168.1.x addresses. Will ping work?',
    },
    options: [
      { gu: 'ના — VLAN અલગ છે, એટલે frame પહોંચતો જ નથી', en: 'No — different VLANs, so the frame never gets across' },
      { gu: 'હા — IP એક જ નેટવર્કનાં છે એટલે ચાલશે', en: 'Yes — the IPs are in the same network, so it works' },
      { gu: 'હા — એક જ switch પર છે એટલે ચાલશે', en: 'Yes — they are on the same switch, so it works' },
    ],
    answer: 0,
    explain: {
      gu: 'VLAN એ Layer 2 ની દીવાલ છે. Switch એક VLAN નો frame બીજી VLAN ના port પર કદી મોકલતો નથી, ભલે IP subnet સરખું હોય. ઓળંગવા માટે router જોઈએ.',
      en: 'A VLAN is a Layer 2 wall. The switch never sends a frame from one VLAN out of another VLAN’s port, whatever the IP subnet says. Crossing it requires a router.',
    },
  },
}

/* ══════════════════════ n2l3 · Trunking and 802.1Q ══════════════════════ */

const trunkNodes = (tagged: boolean) => [
  { id: 'pc1', x: 105, y: 265, type: 'pc' as const, label: 'PC1', sub: 'VLAN 10', accent: BEG },
  { id: 'sw1', x: 300, y: 100, type: 'switch' as const, label: 'SW1', accent: CCNA },
  { id: 'pc3', x: 360, y: 285, type: 'pc' as const, label: 'PC3', sub: 'VLAN 20', accent: CCNP },
  { id: 'pc4', x: 560, y: 285, type: 'pc' as const, label: 'PC4', sub: 'VLAN 20', accent: CCNP },
  { id: 'sw2', x: 620, y: 100, type: 'switch' as const, label: 'SW2', accent: CCNA, pulse: tagged },
  { id: 'pc2', x: 800, y: 265, type: 'pc' as const, label: 'PC2', sub: 'VLAN 10', accent: BEG },
]

export const n2l3: LessonSpec = {
  why: {
    gu: 'VLAN એક switch પર સહેલી છે. પણ બે switch હોય અને બંને પર એક જ VLAN હોય તો? વચ્ચેની એક જ લિંક પર બંને VLAN નો traffic કેવી રીતે જાય, અને સામે છેડે કેવી રીતે ઓળખાય કે કયો frame કઈ VLAN નો હતો?',
    en: 'VLANs on one switch are easy. But with two switches carrying the same VLANs, how does traffic for both cross a single link — and how does the far end know which frame belonged to which VLAN?',
  },
  viewBox: { w: 900, h: 380 },
  steps: [
    {
      ms: 2800,
      label: { gu: 'બે switch, એક જ VLAN', en: 'Two switches, the same VLANs' },
      text: {
        beginner: {
          gu: 'ઓફિસ વધી એટલે બીજો switch આવ્યો. VLAN 10 (Sales) અને VLAN 20 (Accounts) બંને switch પર છે — PC1 અને PC2 બંને Sales માં, પણ અલગ switch પર. એમને વાત કરવી છે.',
          en: 'The office grew so a second switch arrived. VLAN 10 (Sales) and VLAN 20 (Accounts) exist on both — PC1 and PC2 are both in Sales but on different switches. They need to talk.',
        },
        exam: {
          gu: 'VLAN ID દરેક switch પર locally significant છે, પણ end-to-end connectivity માટે બંને છેડે એ જ VLAN ID હોવું જોઈએ.',
          en: 'A VLAN ID is locally significant to each switch, but end-to-end connectivity needs the same VLAN ID configured at both ends.',
        },
      },
      scene: () => ({
        nodes: trunkNodes(false),
        links: [
          { id: 'a', from: 'sw1', to: 'pc1', state: 'up' },
          { id: 'b', from: 'sw1', to: 'pc3', state: 'up' },
          { id: 'c', from: 'sw2', to: 'pc4', state: 'up' },
          { id: 'd', from: 'sw2', to: 'pc2', state: 'up' },
          { id: 'x', from: 'sw1', to: 'sw2', state: 'idle' },
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'Access link ની મર્યાદા', en: 'What an access link cannot do' },
      text: {
        beginner: {
          gu: 'વચ્ચેની લિંકને સાદા access port તરીકે રાખો તો એ ફક્ત એક જ VLAN વહન કરી શકે. VLAN 10 પસંદ કરો તો Sales તો જોડાય, પણ Accounts નો traffic અટકી જાય. બે VLAN માટે બે અલગ કેબલ નાખવા પડે — અને દસ VLAN હોય તો દસ કેબલ!',
          en: 'Leave the link between them as a plain access port and it can carry only one VLAN. Choose VLAN 10 and Sales connects, but Accounts is stuck. Two VLANs would need two cables — and ten VLANs, ten cables.',
        },
        exam: {
          gu: 'Access port untagged frames વહન કરે છે અને એક જ VLAN માં હોય છે. દરેક VLAN માટે અલગ link એ નથી scalable કે નથી સસ્તું.',
          en: 'An access port carries untagged frames in exactly one VLAN. A separate link per VLAN scales neither in ports nor in cost.',
        },
      },
      scene: (t) => ({
        nodes: trunkNodes(false),
        links: [
          { id: 'a', from: 'sw1', to: 'pc1', state: 'up' },
          { id: 'b', from: 'sw1', to: 'pc3', state: 'up' },
          { id: 'c', from: 'sw2', to: 'pc4', state: 'up' },
          { id: 'd', from: 'sw2', to: 'pc2', state: 'up' },
          { id: 'x', from: 'sw1', to: 'sw2', state: 'up', label: 'access · VLAN 10 only', flowing: t < 0.5 },
        ],
        packets:
          t < 0.5
            ? [{ id: 'ok', from: 'sw1', to: 'sw2', t: 0.1 + ease(t / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'VLAN 10 ✓' }]
            : [{ id: 'no', from: 'sw1', to: 'sw2', t: 0.1 + ease((t - 0.5) / 0.5) * 0.35, color: 'var(--nq-err)', label: 'VLAN 20 ✕' }],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'Trunk — એક લિંક, બધી VLAN', en: 'A trunk — one link, every VLAN' },
      text: {
        beginner: {
          gu: 'ઉકેલ એ છે કે વચ્ચેની લિંકને trunk બનાવો. Trunk એક જ કેબલ પર બધી VLAN નો traffic લઈ જાય છે. પણ તો સામે છેડે ગૂંચવાડો ન થાય? એટલે જ 802.1Q આવે છે.',
          en: 'The answer is to make that link a trunk. A trunk carries traffic for every VLAN down one cable. But then how does the far end keep them apart? That is what 802.1Q is for.',
        },
        exam: {
          gu: '`switchport mode trunk` port ને 802.1Q trunk બનાવે છે. બંને છેડે trunk હોવું જોઈએ — એક છેડે access રહે તો mismatch થાય.',
          en: '`switchport mode trunk` turns the port into an 802.1Q trunk. Both ends must be trunks — leaving one end as access causes a mode mismatch.',
        },
      },
      scene: (t) => ({
        nodes: trunkNodes(t > 0.5),
        links: [
          { id: 'a', from: 'sw1', to: 'pc1', state: 'up' },
          { id: 'b', from: 'sw1', to: 'pc3', state: 'up' },
          { id: 'c', from: 'sw2', to: 'pc4', state: 'up' },
          { id: 'd', from: 'sw2', to: 'pc2', state: 'up' },
          { id: 'x', from: 'sw1', to: 'sw2', state: 'up', label: t > 0.4 ? 'trunk · 802.1Q' : 'access', flowing: t > 0.4 },
        ],
        packets:
          t > 0.5
            ? [
                { id: 'v10', from: 'sw1', to: 'sw2', t: 0.15 + ease((t - 0.5) / 0.5) * 0.7, color: 'var(--nq-pkt-data)', label: 'VLAN 10' },
                { id: 'v20', from: 'sw1', to: 'sw2', t: 0.05 + ease((t - 0.5) / 0.5) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'VLAN 20' },
              ]
            : [],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'Tag ચઢે', en: 'The tag goes on' },
      text: {
        beginner: {
          gu: 'અહીં જ જાદુ છે. Frame trunk પર નીકળે એ પહેલાં switch એના પર એક નાનું લેબલ ચોંટાડે છે: "હું VLAN 10 નો છું". આ 4 byte નું લેબલ એટલે 802.1Q tag. એના વગર સામેના switch ને ખબર જ ન પડે કે frame કઈ VLAN નો હતો.',
          en: 'Here is the trick. Just before a frame leaves on the trunk the switch sticks a small label on it: "I belong to VLAN 10." That four-byte label is the 802.1Q tag. Without it the far switch would have no idea which VLAN the frame came from.',
        },
        exam: {
          gu: '802.1Q tag Ethernet header માં source MAC પછી 4 bytes ઉમેરે છે: TPID 0x8100, priority (CoS), DEI, અને 12-bit VLAN ID. FCS ફરી ગણાય છે.',
          en: 'The 802.1Q tag inserts 4 bytes after the source MAC: TPID 0x8100, a priority (CoS) field, DEI, and a 12-bit VLAN ID. The FCS is recalculated.',
        },
      },
      scene: (t) => ({
        nodes: trunkNodes(true),
        links: [
          { id: 'a', from: 'sw1', to: 'pc1', state: 'up', flowing: t < 0.35 },
          { id: 'x', from: 'sw1', to: 'sw2', state: 'up', label: 'trunk', flowing: t > 0.35 },
          { id: 'd', from: 'sw2', to: 'pc2', state: 'up' },
          { id: 'b', from: 'sw1', to: 'pc3', state: 'up' },
          { id: 'c', from: 'sw2', to: 'pc4', state: 'up' },
        ],
        packets:
          t < 0.35
            ? [{ id: 'p', from: 'pc1', to: 'sw1', t: 0.1 + ease(t / 0.35) * 0.8, color: 'var(--nq-pkt-data)', label: 'untagged' }]
            : [{ id: 'p', from: 'sw1', to: 'sw2', t: 0.1 + ease((t - 0.35) / 0.65) * 0.8, color: WARN, label: 'tagged · VLAN 10' }],
      }),
      aside: (t) => ({
        title: { gu: 'Frame માં શું છે', en: 'Inside the frame' },
        head: ['field', 'value'],
        rows:
          t > 0.35
            ? [
                ['dest MAC', 'PC2'],
                ['src MAC', 'PC1'],
                ['802.1Q tag', 'VLAN 10 ←'],
                ['payload', 'the data'],
              ]
            : [
                ['dest MAC', 'PC2'],
                ['src MAC', 'PC1'],
                ['payload', 'the data'],
              ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'Tag ઊતરે', en: 'The tag comes off' },
      text: {
        beginner: {
          gu: 'સામેનો switch tag વાંચે છે — "VLAN 10" — અને જાણે કે આ frame ક્યાં મોકલવો. પછી એ tag કાઢી નાખે છે અને સાદો frame PC2 ને આપે છે. PC2 ને ખબર પણ નથી કે વચ્ચે કોઈ લેબલ લાગ્યું હતું. VLAN તો switch ની વાત છે, PC ની નહીં.',
          en: 'The far switch reads the tag — VLAN 10 — and knows where the frame belongs. Then it strips the tag off and hands a plain frame to PC2. PC2 never knows a label was ever there. VLANs are a switch concern, not a PC one.',
        },
        exam: {
          gu: 'Egress access port પર tag દૂર થાય છે. End hosts હંમેશા untagged frames જુએ છે (voice VLAN જેવા ખાસ કિસ્સા સિવાય).',
          en: 'The tag is removed on egress at the access port. End hosts always see untagged frames (barring special cases such as a voice VLAN).',
        },
      },
      scene: (t) => ({
        nodes: trunkNodes(true),
        links: [
          { id: 'x', from: 'sw1', to: 'sw2', state: 'up', label: 'trunk', flowing: t < 0.5 },
          { id: 'd', from: 'sw2', to: 'pc2', state: 'up', flowing: t > 0.5 },
          { id: 'a', from: 'sw1', to: 'pc1', state: 'up' },
          { id: 'b', from: 'sw1', to: 'pc3', state: 'up' },
          { id: 'c', from: 'sw2', to: 'pc4', state: 'up' },
        ],
        packets:
          t < 0.5
            ? [{ id: 'p', from: 'sw1', to: 'sw2', t: 0.1 + ease(t / 0.5) * 0.8, color: WARN, label: 'tagged · 10' }]
            : [{ id: 'p', from: 'sw2', to: 'pc2', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'tag off ✓' }],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'Native VLAN — tag વગરનું ખાનું', en: 'The native VLAN — the untagged lane' },
      text: {
        beginner: {
          gu: 'Trunk પર એક VLAN એવી હોય છે જેને tag લાગતો જ નથી — native VLAN, default માં VLAN 1. અહીં જ સૌથી સામાન્ય ભૂલ થાય છે: બે છેડે અલગ native VLAN હોય તો traffic ચૂપચાપ ખોટી VLAN માં ભળી જાય. કોઈ error નહીં, બસ ખોટું વર્તન.',
          en: 'On a trunk one VLAN travels with no tag at all — the native VLAN, VLAN 1 by default. This is where the classic mistake happens: if the two ends disagree on the native VLAN, traffic silently leaks into the wrong one. No error message, just wrong behaviour.',
        },
        exam: {
          gu: 'Native VLAN mismatch CDP/STP errors આપે છે અને VLAN hopping નું જોખમ ઊભું કરે છે. Best practice: બંને છેડે એકસરખું, અને કોઈ unused VLAN વાપરવું.',
          en: 'A native VLAN mismatch raises CDP/STP errors and opens a VLAN-hopping risk. Best practice: match both ends, and set it to an unused VLAN.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw1', x: 260, y: 200, type: 'switch' as const, label: 'SW1', sub: 'native VLAN 1', accent: CCNA },
          { id: 'sw2', x: 640, y: 200, type: 'switch' as const, label: 'SW2', sub: t > 0.4 ? 'native VLAN 99' : 'native VLAN 1', accent: t > 0.4 ? 'var(--nq-err)' : CCNA, pulse: t > 0.4 },
        ],
        links: [
          { id: 'x', from: 'sw1', to: 'sw2', state: t > 0.4 ? 'down' : 'up', label: t > 0.4 ? 'mismatch!' : 'trunk ok', flowing: t < 0.4 },
        ],
        packets:
          t > 0.5
            ? [{ id: 'p', from: 'sw1', to: 'sw2', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-err)', label: 'lands in wrong VLAN' }]
            : [{ id: 'p', from: 'sw1', to: 'sw2', t: 0.1 + ease(t / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'untagged · native' }],
      }),
      aside: () => ({
        title: { gu: 'Trunk પર', en: 'On the trunk' },
        head: ['vlan', 'tagged?'],
        rows: [
          ['1 (native)', 'no — untagged'],
          ['10', 'yes'],
          ['20', 'yes'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Access port એક VLAN વહન કરે, trunk બધી. Trunk પર નીકળતી વખતે frame પર 802.1Q tag ચઢે અને સામે છેડે ઊતરે — એટલે PC ને કદી ખબર પડતી નથી. Native VLAN જ એકમાત્ર untagged રહે છે, અને બંને છેડે એ સરખી ન હોય તો traffic ચૂપચાપ ખોટે રસ્તે જાય.',
    en: 'An access port carries one VLAN, a trunk carries them all. Leaving on a trunk a frame gains an 802.1Q tag and loses it at the far end, so the PC never knows. Only the native VLAN stays untagged — and if the two ends disagree on it, traffic goes quietly astray.',
  },
  check: {
    q: {
      gu: 'Trunk પર frame ને 802.1Q tag કેમ લગાવવો પડે છે?',
      en: 'Why does a frame need an 802.1Q tag on a trunk?',
    },
    options: [
      { gu: 'જેથી સામેનો switch જાણે કે frame કઈ VLAN નો છે', en: 'So the far switch knows which VLAN the frame belongs to' },
      { gu: 'જેથી frame ઝડપથી જાય', en: 'So the frame travels faster' },
      { gu: 'જેથી PC ને VLAN ની ખબર પડે', en: 'So the PC learns about the VLAN' },
    ],
    answer: 0,
    explain: {
      gu: 'એક જ કેબલ પર ઘણી VLAN નો traffic જાય છે. Tag વગર સામેનો switch એમને અલગ પાડી જ ન શકે. PC ને tag દેખાતો જ નથી — એ પહેલાં જ ઊતરી જાય છે.',
      en: 'One cable carries traffic for many VLANs; without the tag the far switch could not tell them apart. The PC never sees the tag — it is stripped before delivery.',
    },
  },
}
