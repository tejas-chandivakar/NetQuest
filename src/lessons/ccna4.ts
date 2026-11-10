import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const WARN = 'var(--nq-warn)'
const MUTE = 'var(--nq-text-mute)'

/* ══════════════════════ n7l1 · Project 1 — small office ══════════════════════ */

const p1 = (stage: number) => [
  { id: 'pc1', x: 80, y: 85, type: 'pc' as const, label: 'PC1', sub: stage >= 4 ? '192.168.1.10' : undefined, accent: stage >= 1 ? BEG : MUTE, dim: stage < 1 },
  { id: 'pc2', x: 80, y: 285, type: 'pc' as const, label: 'PC2', sub: stage >= 4 ? '192.168.1.11' : undefined, accent: stage >= 1 ? BEG : MUTE, dim: stage < 1 },
  { id: 'sw', x: 290, y: 185, type: 'switch' as const, label: 'SW1', accent: stage >= 1 ? CCNA : MUTE, dim: stage < 1 },
  { id: 'r1', x: 500, y: 185, type: 'router' as const, label: 'OFFICE-RTR', sub: stage >= 2 ? '192.168.1.1' : undefined, accent: stage >= 2 ? CCNA : MUTE, dim: stage < 2 },
  { id: 'isp', x: 690, y: 185, type: 'router' as const, label: 'ISP', sub: '203.0.113.1', accent: stage >= 3 ? CCNP : MUTE, dim: stage < 3 },
  { id: 'web', x: 850, y: 185, type: 'server' as const, label: 'WEB', sub: '198.51.100.20', accent: stage >= 3 ? CCNP : MUTE, dim: stage < 3 },
]

const p1Links = (stage: number) => [
  { id: 'a', from: 'pc1', to: 'sw', state: (stage >= 1 ? 'up' : 'idle') as 'up' | 'idle' },
  { id: 'b', from: 'pc2', to: 'sw', state: (stage >= 1 ? 'up' : 'idle') as 'up' | 'idle' },
  { id: 'c', from: 'sw', to: 'r1', state: (stage >= 2 ? 'up' : 'idle') as 'up' | 'idle' },
  { id: 'd', from: 'r1', to: 'isp', state: (stage >= 3 ? 'up' : 'idle') as 'up' | 'idle' },
  { id: 'e', from: 'isp', to: 'web', state: (stage >= 3 ? 'up' : 'idle') as 'up' | 'idle' },
]

export const n7l1: LessonSpec = {
  why: {
    gu: 'અત્યાર સુધી તમે એક એક વસ્તુ અલગ શીખી — IP, routing, DHCP, NAT. હવે પહેલી વાર કોઈ ગ્રાહક આવીને કહે છે "મારી ઓફિસનું નેટવર્ક બનાવી આપો". કયા ક્રમે શું કરવું એ જ ખરી કુશળતા છે.',
    en: 'So far you have learnt each piece on its own — addressing, routing, DHCP, NAT. Now, for the first time, a client walks in and says "build my office network". Knowing what to do in which order is the real skill.',
  },
  viewBox: { w: 920, h: 380 },
  steps: [
    {
      ms: 3000,
      label: { gu: 'ગ્રાહકનું કહેવું', en: 'The client brief' },
      text: {
        beginner: {
          gu: '"અમે દસ જણ છીએ. બધાને internet જોઈએ, અને બધાને એકબીજાની ફાઈલ શેર કરવી છે. કોઈને સરનામાં હાથે લખવાં નથી — બધું આપોઆપ થવું જોઈએ. ISP એ એક જ જાહેર સરનામું આપ્યું છે." આટલું જ. હવે આને નેટવર્કમાં બદલો.',
          en: '"There are ten of us. Everyone needs internet and everyone shares files. Nobody wants to type addresses — it should all be automatic. The ISP gave us one public address." That is the whole brief. Now turn it into a network.',
        },
        exam: {
          gu: 'Requirements: એક LAN subnet, dynamic addressing, default route બહાર, અને એક public IP પાછળ PAT. આ એક small-office edge design છે.',
          en: 'Requirements: one LAN subnet, dynamic addressing, a default route outward, and PAT behind a single public IP. This is a small-office edge design.',
        },
      },
      scene: () => ({
        nodes: p1(0),
        links: p1Links(0),
      }),
      aside: () => ({
        title: { gu: 'શું જોઈએ', en: 'What is needed' },
        head: ['need', 'answer'],
        rows: [
          ['ten users on one network', 'a switch + one subnet'],
          ['no typing addresses', 'DHCP'],
          ['reach the internet', 'default route'],
          ['one public IP only', 'PAT'],
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: '1 · અંદરનું નેટવર્ક', en: '1 · The inside network' },
      text: {
        beginner: {
          gu: 'શરૂઆત હંમેશા અંદરથી. દસ માણસ એટલે એક /24 પૂરતું છે — 192.168.1.0/24, 254 સરનામાં. બધાં PC switch સાથે જોડાય, અને એ બધાં એક જ નેટવર્કમાં હોવાથી અત્યારે જ એકબીજાની ફાઈલ જોઈ શકે છે.',
          en: 'Always start inside. Ten people fit comfortably in a /24 — 192.168.1.0/24, 254 addresses. Every PC plugs into the switch, and since they share one network they can already see each other’s files.',
        },
        exam: {
          gu: 'Access switch default VLAN 1 પર કામ કરે છે; અહીં VLAN segmentation ની જરૂર નથી કારણ કે એક જ user group છે.',
          en: 'The access switch works on the default VLAN 1; no VLAN segmentation is needed here because there is only one user group.',
        },
      },
      scene: (t) => ({
        nodes: p1(1),
        links: p1Links(1).map((l) => ({ ...l, flowing: t > 0.5 && (l.id === 'a' || l.id === 'b') })),
        packets:
          t > 0.5
            ? [{ id: 'p', from: 'pc1', to: 'pc2', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'file share ✓' }]
            : [],
      }),
    },
    {
      ms: 2800,
      label: { gu: '2 · Gateway ઊભો કરો', en: '2 · Stand up the gateway' },
      text: {
        beginner: {
          gu: 'બહાર જવા માટે દરવાજો જોઈએ. Router ના અંદરના interface પર 192.168.1.1 મૂકો — એ જ દરેક PC નું default gateway બનશે. અને interface ચાલુ કરવાનું ભૂલતા નહીં: Cisco router ના બધા interfaces default માં બંધ હોય છે.',
          en: 'Getting out needs a door. Put 192.168.1.1 on the router’s inside interface — that becomes every PC’s default gateway. And remember to switch the interface on: every interface on a Cisco router starts shut down.',
        },
        exam: {
          gu: '`interface Gi0/0` → `ip address 192.168.1.1 255.255.255.0` → `no shutdown`. એ વગર interface administratively down રહે છે.',
          en: '`interface Gi0/0`, then `ip address 192.168.1.1 255.255.255.0`, then `no shutdown`. Without the last line the interface stays administratively down.',
        },
      },
      scene: (t) => ({
        nodes: p1(2),
        links: p1Links(2).map((l) => ({ ...l, flowing: t > 0.5 && l.id === 'c' })),
        packets:
          t > 0.5
            ? [{ id: 'p', from: 'pc1', to: 'r1', t: 0.06 + ease((t - 0.5) / 0.5) * 0.84, color: 'var(--nq-pkt-data)', label: 'reaches the gate ✓' }]
            : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: '3 · ISP તરફ રસ્તો', en: '3 · The road to the ISP' },
      text: {
        beginner: {
          gu: 'ISP એ તમને એક WAN સરનામું આપ્યું છે. એ બહારના interface પર મૂકો, અને પછી એક default route લખો: 0.0.0.0/0 → ISP. આ એક લીટી કહે છે "જે કશું ઓળખાતું ન હોય એ બધું ISP ને આપી દે" — એટલે આખું internet.',
          en: 'The ISP gave you a WAN address. Put it on the outside interface, then write one default route: 0.0.0.0/0 toward the ISP. That line says "anything I do not recognise, hand to the ISP" — which is the whole internet.',
        },
        exam: {
          gu: '`ip route 0.0.0.0 0.0.0.0 203.0.113.1`. Enterprise edge પર એક જ upstream હોય ત્યારે static default એ BGP કરતાં સરળ અને પૂરતો છે.',
          en: '`ip route 0.0.0.0 0.0.0.0 203.0.113.1`. With a single upstream at the edge a static default is simpler than BGP and entirely sufficient.',
        },
      },
      scene: (t) => ({
        nodes: p1(3).map((n) => (n.id === 'r1' ? { ...n, sub: t > 0.4 ? '0.0.0.0/0 → ISP' : '192.168.1.1' } : n)),
        links: p1Links(3).map((l) => ({ ...l, flowing: t > 0.5 && (l.id === 'd' || l.id === 'e') })),
        packets:
          t > 0.5
            ? [{ id: 'p', from: 'r1', to: 'web', t: 0.06 + ease((t - 0.5) / 0.5) * 0.84, color: 'var(--nq-pkt-data)', label: 'out to the world' }]
            : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: '4 · DHCP — સરનામાં આપોઆપ', en: '4 · DHCP — addresses without typing' },
      text: {
        beginner: {
          gu: 'ગ્રાહકે કહ્યું હતું "હાથે લખવું નથી". એટલે router પર DHCP pool બનાવો. પણ પહેલાં .1 થી .9 અનામત રાખો — gateway, printer અને server માટે. પછી pool માં network, gateway અને DNS ત્રણેય આપો.',
          en: 'The client said "no typing". So build a DHCP pool on the router. But first reserve .1 to .9 for the gateway, the printer and the server. Then give the pool a network, a gateway and a DNS server.',
        },
        exam: {
          gu: 'Router પોતે DHCP server છે એટલે helper-address ની જરૂર નથી — pool એ જ subnet માં છે જેના પર interface બેઠું છે.',
          en: 'The router is itself the DHCP server, so no helper-address is needed — the pool sits in the same subnet as the interface.',
        },
      },
      scene: (t) => ({
        nodes: p1(t > 0.6 ? 4 : 3),
        links: p1Links(3).map((l) => ({ ...l, flowing: l.id === 'a' || l.id === 'b' })),
        packets:
          t < 0.6
            ? [{ id: 'd', from: 'pc1', to: 'r1', t: 0.06 + ease(t / 0.6) * 0.84, color: 'var(--nq-pkt-dns)', label: 'DISCOVER' }]
            : [{ id: 'a', from: 'r1', to: 'pc1', t: 0.06 + ease((t - 0.6) / 0.4) * 0.84, color: 'var(--nq-ok)', label: 'ACK · .10 ✓' }],
      }),
      aside: (t) => ({
        title: { gu: 'DHCP pool', en: 'DHCP pool' },
        head: ['setting', 'value'],
        rows: [
          ['excluded', '192.168.1.1 – .9'],
          ['network', '192.168.1.0/24'],
          ['default-router', '192.168.1.1'],
          ['PC1 got', t > 0.6 ? '192.168.1.10 ✓' : '…'],
        ],
      }),
    },
    {
      ms: 3200,
      label: { gu: '5 · NAT — છેલ્લો ટુકડો', en: '5 · NAT — the last piece' },
      text: {
        beginner: {
          gu: 'બધું તૈયાર લાગે છે, પણ ping હજી નિષ્ફળ જશે! કારણ કે PC નું 192.168.1.10 internet પર ચાલતું નથી. એટલે PAT ઉમેરો: અંદરનાં બધાં સરનામાં router ના એક જ જાહેર સરનામા પાછળ છુપાવો. અને `ip nat inside`/`outside` ભૂલશો નહીં.',
          en: 'It all looks finished, yet the ping will still fail — because 192.168.1.10 does not work on the internet. So add PAT: hide every inside address behind the router’s one public address. And do not forget `ip nat inside` and `outside`.',
        },
        exam: {
          gu: 'ACL થી inside addresses match કરો, પછી `ip nat inside source list 1 interface Gi0/1 overload`. Interfaces પર inside/outside markings ફરજિયાત.',
          en: 'Match the inside addresses with an ACL, then `ip nat inside source list 1 interface Gi0/1 overload`. The inside/outside interface markings are mandatory.',
        },
      },
      scene: (t) => ({
        nodes: p1(4).map((n) => (n.id === 'r1' ? { ...n, sub: t > 0.3 ? 'PAT · 203.0.113.2' : '192.168.1.1', pulse: t > 0.3 } : n)),
        links: p1Links(4).map((l) => ({ ...l, flowing: true })),
        packets:
          t < 0.45
            ? [{ id: 'p', from: 'pc1', to: 'r1', t: 0.06 + ease(t / 0.45) * 0.84, color: 'var(--nq-pkt-data)', label: 'src 192.168.1.10' }]
            : [{ id: 'p', from: 'r1', to: 'web', t: 0.06 + ease((t - 0.45) / 0.55) * 0.84, color: 'var(--nq-ok)', label: 'src 203.0.113.2 ✓' }],
      }),
    },
    {
      ms: 3000,
      label: { gu: '6 · ચકાસો — ગ્રાહકની દરેક માગણી', en: '6 · Verify — every line of the brief' },
      text: {
        beginner: {
          gu: 'છેલ્લું પગલું હંમેશા ચકાસણી, અને એ ગ્રાહકના શબ્દો સામે જ કરો. PC એકબીજાને ping કરે છે? ✓ સરનામું આપોઆપ મળ્યું? ✓ Internet પહોંચે છે? ✓ એક જ જાહેર સરનામું વપરાય છે? ✓ ત્રણેય માગણી પૂરી — કામ પૂરું.',
          en: 'The last step is always verification, measured against the client’s own words. Do the PCs ping each other? Yes. Did they get addresses automatically? Yes. Does the internet work? Yes. Is one public address serving everyone? Yes. The brief is met.',
        },
        exam: {
          gu: 'Verification commands: `show ip interface brief`, `show ip route`, `show ip dhcp binding`, `show ip nat translations`, અને end-to-end ping.',
          en: 'Verification commands: `show ip interface brief`, `show ip route`, `show ip dhcp binding`, `show ip nat translations`, plus an end-to-end ping.',
        },
      },
      scene: (t) => ({
        nodes: p1(4),
        links: p1Links(4).map((l) => ({ ...l, flowing: true })),
        packets: [
          { id: 'p', from: 'pc1', to: 'web', t: 0.04 + ease(t) * 0.92, color: 'var(--nq-ok)', label: 'end to end ✓' },
        ],
      }),
      aside: () => ({
        title: { gu: 'ગ્રાહકની માગણી', en: 'Against the brief' },
        head: ['asked for', 'done'],
        rows: [
          ['everyone shares files', '✓ one subnet'],
          ['no typing addresses', '✓ DHCP'],
          ['everyone gets internet', '✓ default route'],
          ['one public address', '✓ PAT'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'દરેક project નો ક્રમ એક જ છે: અંદરનું નેટવર્ક → gateway → બહારનો રસ્તો → સરનામાં આપોઆપ → NAT → ચકાસણી. અંદરથી બહાર તરફ કામ કરો, અને છેલ્લે ગ્રાહકના શબ્દો સામે દરેક માગણી ટિક કરો.',
    en: 'Every project follows one order: the inside network, the gateway, the way out, automatic addressing, NAT, then verification. Work from the inside outward, and at the end tick every line of the brief.',
  },
  check: {
    q: {
      gu: 'બધું configure કર્યું, PC ને સરનામું પણ મળ્યું, પણ internet નથી ચાલતું. સૌથી સંભવિત કારણ?',
      en: 'Everything is configured and the PCs got addresses, but there is no internet. The most likely cause?',
    },
    options: [
      { gu: 'NAT નથી — ખાનગી સરનામું બહાર ચાલતું નથી', en: 'NAT is missing — a private address cannot work outside' },
      { gu: 'Switch ખોટો છે', en: 'The switch is the wrong model' },
      { gu: 'DHCP pool નાનો છે', en: 'The DHCP pool is too small' },
    ],
    answer: 0,
    explain: {
      gu: 'સરનામું મળ્યું એટલે DHCP અને gateway બરાબર છે. પણ 192.168.x.x internet પર routable નથી — એને PAT થી જાહેર સરનામામાં બદલવું જ પડે.',
      en: 'Getting an address proves DHCP and the gateway are fine. But 192.168.x.x is not routable on the internet; PAT must translate it to the public address.',
    },
  },
}

/* ══════════════════════ n7l2 · Project 2 — departments apart ══════════════════════ */

const p2 = (opts: { split: boolean; svi: boolean; acl: boolean }) => [
  { id: 'sales1', x: 110, y: 80, type: 'pc' as const, label: 'SALES-PC', sub: '10.10.10.10', accent: opts.split ? BEG : MUTE },
  { id: 'sales2', x: 110, y: 290, type: 'pc' as const, label: 'SALES-PRN', sub: '10.10.10.11', accent: opts.split ? BEG : MUTE },
  {
    id: 'sw',
    x: 450,
    y: 185,
    type: 'switch' as const,
    label: 'CORE-SW',
    sub: opts.acl ? 'ACL applied' : opts.svi ? 'SVIs · routing on' : opts.split ? 'VLAN 10 + 20' : 'one flat network',
    accent: opts.acl ? 'var(--nq-err)' : CCNA,
    pulse: opts.svi,
  },
  { id: 'hr1', x: 790, y: 80, type: 'pc' as const, label: 'HR-PC', sub: '10.20.20.10', accent: opts.split ? CCNP : MUTE },
  { id: 'hr2', x: 790, y: 290, type: 'server' as const, label: 'HR-SRV', sub: '10.20.20.50', accent: opts.split ? CCNP : MUTE },
]

const p2Links = [
  { id: 'a', from: 'sales1', to: 'sw', state: 'up' as const },
  { id: 'b', from: 'sales2', to: 'sw', state: 'up' as const },
  { id: 'c', from: 'hr1', to: 'sw', state: 'up' as const },
  { id: 'd', from: 'hr2', to: 'sw', state: 'up' as const },
]

export const n7l2: LessonSpec = {
  why: {
    gu: 'પહેલો project બધાને જોડવા વિશે હતો. આ બીજો એનાથી ઊલટો છે: બધાંને અલગ રાખવા વિશે. અને આ ખરી દુનિયાનો સૌથી સામાન્ય પ્રશ્ન છે — "HR નો ડેટા Sales ન જોઈ શકે, પણ બંનેએ એક જ printer વાપરવાનો છે."',
    en: 'The first project was about joining everyone together. This one is the opposite: keeping them apart. And it is the most common real-world ask there is — "Sales must not see HR data, but both share one printer."',
  },
  viewBox: { w: 900, h: 380 },
  steps: [
    {
      ms: 3000,
      label: { gu: 'ગ્રાહકનું કહેવું', en: 'The client brief' },
      text: {
        beginner: {
          gu: '"પચાસ જણ છીએ — Sales અને HR. HR પાસે પગાર અને કરારના કાગળ છે, એ Sales ના લોકોએ ન જોવા જોઈએ. પણ બંનેએ એક જ printer અને એક જ internet વાપરવાનાં છે." એટલે અલગ પણ રાખવા અને જોડવા પણ — બંને એકસાથે.',
          en: '"Fifty of us — Sales and HR. HR holds salary and contract files that Sales must never see. But both share one printer and one internet line." So they must be separated and connected at the same time.',
        },
        exam: {
          gu: 'Requirements: Layer 2 segmentation (VLAN), દરેક VLAN માટે અલગ subnet અને gateway (SVI), અને selective Layer 3 filtering (ACL).',
          en: 'Requirements: Layer 2 segmentation (VLANs), a separate subnet and gateway per VLAN (SVIs), and selective Layer 3 filtering (an ACL).',
        },
      },
      scene: (t) => ({
        nodes: p2({ split: false, svi: false, acl: false }),
        links: p2Links.map((l) => ({ ...l, flowing: t > 0.4 })),
        packets:
          t > 0.4
            ? [{ id: 'bad', from: 'sales1', to: 'hr2', t: 0.06 + ease((t - 0.4) / 0.6) * 0.88, color: WARN, label: 'Sales can read HR ✕' }]
            : [],
      }),
      aside: () => ({
        title: { gu: 'બે વિરોધી માગણી', en: 'Two opposing needs' },
        head: ['need', 'tool'],
        rows: [
          ['keep HR data private', 'VLAN + ACL'],
          ['share the printer', 'inter-VLAN routing'],
          ['both reach the internet', 'one gateway'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: '1 · બે જૂથ પાડો', en: '1 · Split them into two groups' },
      text: {
        beginner: {
          gu: 'પહેલું પગલું VLAN. VLAN 10 ને SALES નામ આપો, VLAN 20 ને HR. પછી ports ને એમાં વહેંચો. આ ક્ષણે એક switch બે અલગ switch જેવો વર્તવા લાગે છે — અને Sales નો broadcast HR સુધી પહોંચવાનો બંધ થઈ જાય છે.',
          en: 'The first step is VLANs. Name VLAN 10 SALES and VLAN 20 HR, then hand the ports out between them. From this moment one switch behaves as two — and Sales broadcasts stop reaching HR.',
        },
        exam: {
          gu: 'દરેક VLAN એક અલગ broadcast domain બને છે. બે અલગ subnets પણ જોઈએ: 10.10.10.0/24 અને 10.20.20.0/24.',
          en: 'Each VLAN becomes its own broadcast domain, and each needs its own subnet: 10.10.10.0/24 and 10.20.20.0/24.',
        },
      },
      scene: (t) => ({
        nodes: p2({ split: t > 0.35, svi: false, acl: false }),
        links: p2Links,
        packets:
          t > 0.6
            ? [{ id: 'x', from: 'sales1', to: 'sw', t: 0.1 + ease((t - 0.6) / 0.4) * 0.7, color: 'var(--nq-err)', label: 'blocked at L2 ✕' }]
            : [],
      }),
      aside: (t) => ({
        title: { gu: 'VLAN assignment', en: 'VLAN assignment' },
        head: ['port', 'device', 'vlan'],
        rows:
          t > 0.35
            ? [
                ['Fa0/1', 'SALES-PC', '10'],
                ['Fa0/2', 'SALES-PRN', '10'],
                ['Fa0/3', 'HR-PC', '20'],
                ['Fa0/4', 'HR-SRV', '20'],
              ]
            : [],
      }),
    },
    {
      ms: 3200,
      label: { gu: '2 · પણ હવે બહુ અલગ થઈ ગયાં', en: '2 · But now they are too separate' },
      text: {
        beginner: {
          gu: 'VLAN એ કામ તો કર્યું — કદાચ જરૂર કરતાં વધારે સારું. હવે Sales HR સુધી પહોંચતું નથી, પણ સાથે સાથે printer પણ નથી પહોંચતું અને બહાર જવાનો રસ્તો પણ નથી. દીવાલ ઊભી થઈ ગઈ, હવે એમાં એક દરવાજો જોઈએ.',
          en: 'The VLANs worked — perhaps too well. Sales cannot reach HR, but it also cannot reach the printer or the way out. The wall is up; now it needs a door.',
        },
        exam: {
          gu: 'Inter-VLAN traffic માટે Layer 3 device જોઈએ. Options: router-on-a-stick (subinterfaces) અથવા L3 switch પર SVI — બીજું વધુ scalable છે.',
          en: 'Inter-VLAN traffic needs a Layer 3 device: either router-on-a-stick with subinterfaces, or SVIs on an L3 switch — the latter scales better.',
        },
      },
      scene: (t) => ({
        nodes: p2({ split: true, svi: false, acl: false }),
        links: p2Links,
        packets: [
          { id: 'x', from: 'sales1', to: 'sw', t: 0.1 + ease(t) * 0.7, color: 'var(--nq-err)', label: 'no path to HR ✕' },
        ],
      }),
    },
    {
      ms: 3200,
      label: { gu: '3 · SVI — switch ને router બનાવો', en: '3 · SVIs — make the switch route' },
      text: {
        beginner: {
          gu: 'અલગ router ખરીદવાની જરૂર નથી. એ જ switch ની અંદર દરેક VLAN માટે એક virtual interface બનાવો — SVI. VLAN 10 ને 10.10.10.1 અને VLAN 20 ને 10.20.20.1 આપો, પછી `ip routing` ચાલુ કરો. હવે switch બંને VLAN વચ્ચે routing કરશે.',
          en: 'You do not need a separate router. Inside the same switch create one virtual interface per VLAN — an SVI. Give VLAN 10 the address 10.10.10.1 and VLAN 20 the address 10.20.20.1, then turn on `ip routing`. The switch now routes between them.',
        },
        exam: {
          gu: '`interface vlan 10` → `ip address …` → `no shutdown`, દરેક VLAN માટે. પછી global `ip routing` — એ વગર SVI બને પણ routing થાય નહીં.',
          en: '`interface vlan 10`, `ip address …`, `no shutdown` for each VLAN, then global `ip routing`. Without that last command the SVIs exist but nothing routes.',
        },
      },
      scene: (t) => ({
        nodes: p2({ split: true, svi: t > 0.35, acl: false }),
        links: p2Links.map((l) => ({ ...l, flowing: t > 0.55 })),
        packets:
          t > 0.55
            ? [{ id: 'p', from: 'sales1', to: 'hr2', t: 0.06 + ease((t - 0.55) / 0.45) * 0.88, color: 'var(--nq-ok)', label: 'routed ✓' }]
            : [],
      }),
      aside: (t) => ({
        title: { gu: 'SVI', en: 'SVIs' },
        head: ['interface', 'address', 'serves'],
        rows:
          t > 0.35
            ? [
                ['vlan 10', '10.10.10.1', 'Sales gateway'],
                ['vlan 20', '10.20.20.1', 'HR gateway'],
                ['ip routing', 'enabled', 'both'],
              ]
            : [],
      }),
    },
    {
      ms: 3200,
      label: { gu: '4 · હવે ફરી એ જ સમસ્યા', en: '4 · And the original problem is back' },
      text: {
        beginner: {
          gu: 'Routing ચાલુ કરતાં જ બધું જોડાઈ ગયું — અને Sales ફરી HR નો server જોઈ શકે છે! આ નિરાશાજનક લાગે, પણ એ બરાબર છે: પહેલાં રસ્તો બનાવવો પડે, પછી જ એના પર દરવાન મૂકી શકાય. ACL ને કામ કરવા માટે routing હોવું જ જોઈએ.',
          en: 'The moment routing is on, everything reconnects — and Sales can see the HR server again. It feels like a step backwards, but it is correct: you must build the road before you can post a guard on it. An ACL needs routing to act on.',
        },
        exam: {
          gu: 'ACL routing path પર લાગુ પડે છે, એટલે inter-VLAN routing પહેલાં જોઈએ. Filtering એ connectivity નો વિકલ્પ નથી — એની ઉપરનું સ્તર છે.',
          en: 'An ACL acts on the routing path, so inter-VLAN routing must exist first. Filtering is not a substitute for connectivity — it is a layer on top of it.',
        },
      },
      scene: (t) => ({
        nodes: p2({ split: true, svi: true, acl: false }),
        links: p2Links.map((l) => ({ ...l, flowing: true })),
        packets: [
          { id: 'bad', from: 'sales1', to: 'hr2', t: 0.06 + ease(t) * 0.88, color: WARN, label: 'Sales reads HR again ✕' },
        ],
      }),
    },
    {
      ms: 3400,
      label: { gu: '5 · ACL — ચોક્કસ એક દરવાજો બંધ', en: '5 · The ACL — close exactly one door' },
      text: {
        beginner: {
          gu: 'હવે ચોકસાઈનું કામ. એક ACL લખો જે ફક્ત એક વસ્તુ રોકે: Sales થી HR ના server સુધી — deny. પછી એક લીટી ઉમેરો: બાકીનું બધું permit. આ બીજી લીટી અગત્યની છે, નહીંતર અદૃશ્ય `deny any any` printer અને internet પણ બંધ કરી દેશે.',
          en: 'Now the precise work. Write an ACL that blocks exactly one thing: Sales to the HR server — deny. Then add a line permitting everything else. That second line matters, because otherwise the invisible `deny any any` would also cut the printer and the internet.',
        },
        exam: {
          gu: 'Extended ACL source અને destination બંને જુએ છે. Order: deny specific પહેલાં, permit any any પછી. Implicit deny ને યાદ રાખીને હંમેશા explicit permit ઉમેરો.',
          en: 'An extended ACL matches source and destination. Order matters: the specific deny first, then permit any any. Remember the implicit deny and always add the explicit permit.',
        },
      },
      scene: (t) => ({
        nodes: p2({ split: true, svi: true, acl: t > 0.3 }),
        links: p2Links.map((l) => ({ ...l, flowing: true })),
        packets:
          t > 0.45
            ? [
                { id: 'x', from: 'sales1', to: 'sw', t: 0.1 + ease((t - 0.45) / 0.55) * 0.7, color: 'var(--nq-err)', label: 'to HR-SRV · deny ✕' },
                { id: 'ok', from: 'sales2', to: 'hr1', t: 0.06 + ease((t - 0.45) / 0.55) * 0.88, color: 'var(--nq-ok)', label: 'printer · permit ✓' },
              ]
            : [],
      }),
      aside: (t) => ({
        title: { gu: 'ACL 110', en: 'ACL 110' },
        head: ['#', 'rule', 'action'],
        rows:
          t > 0.3
            ? [
                ['10', 'sales → 10.20.20.50', 'deny'],
                ['20', 'any → any', 'permit'],
                ['—', 'implicit', '(never reached)'],
              ]
            : [],
      }),
    },
    {
      ms: 3200,
      label: { gu: '6 · બંને માગણી એકસાથે પૂરી', en: '6 · Both needs met at once' },
      text: {
        beginner: {
          gu: 'હવે ત્રણેય ચકાસો. Sales થી HR ના server સુધી — બંધ ✓. Sales થી printer સુધી — ચાલુ ✓. બંનેથી internet — ચાલુ ✓. "અલગ રાખો પણ જોડો" એ વિરોધાભાસી લાગતી માગણી ખરેખર ત્રણ સ્તરોમાં ઉકેલાઈ: VLAN અલગ રાખે, SVI જોડે, ACL ચોક્કસ અપવાદ કાપે.',
          en: 'Now check all three. Sales to the HR server — blocked. Sales to the printer — working. Both to the internet — working. The contradictory-sounding brief is really solved in three layers: VLANs separate, SVIs connect, and the ACL cuts one precise exception.',
        },
        exam: {
          gu: 'આ defence in depth નો નાનો દાખલો છે: L2 segmentation, L3 reachability, અને L3/L4 filtering — દરેક સ્તર પોતાનું કામ કરે.',
          en: 'This is defence in depth in miniature: L2 segmentation, L3 reachability and L3/L4 filtering, each layer doing its own job.',
        },
      },
      scene: (t) => ({
        nodes: p2({ split: true, svi: true, acl: true }),
        links: p2Links.map((l) => ({ ...l, flowing: true })),
        packets: [
          { id: 'ok', from: 'sales1', to: 'hr1', t: 0.06 + ease(t) * 0.88, color: 'var(--nq-ok)', label: 'allowed ✓' },
          { id: 'no', from: 'sales2', to: 'sw', t: 0.1 + ease(Math.max(0, t - 0.2) / 0.8) * 0.7, color: 'var(--nq-err)', label: 'HR-SRV denied ✕' },
        ],
      }),
      aside: () => ({
        title: { gu: 'ગ્રાહકની માગણી', en: 'Against the brief' },
        head: ['asked for', 'done'],
        rows: [
          ['Sales cannot see HR data', '✓ ACL'],
          ['both share the printer', '✓ SVI routing'],
          ['both reach the internet', '✓ permit any'],
          ['departments separated', '✓ VLANs'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'ક્રમ ઊલટો ન કરો: પહેલાં VLAN થી અલગ કરો, પછી SVI થી જોડો, અને છેલ્લે ACL થી ચોક્કસ અપવાદ કાપો. વચ્ચે એક તબક્કો એવો આવશે જ્યાં બધું ફરી ખુલ્લું દેખાશે — એ ભૂલ નથી, એ જરૂરી પગલું છે.',
    en: 'Do not reverse the order: separate with VLANs, reconnect with SVIs, then cut one precise exception with an ACL. There will be a stage where everything looks wide open again — that is not a mistake, it is a necessary step.',
  },
  check: {
    q: {
      gu: 'ACL માં ફક્ત "deny sales → HR server" લખ્યું અને બીજું કશું નહીં. શું થશે?',
      en: 'Your ACL has only "deny sales → HR server" and nothing else. What happens?',
    },
    options: [
      { gu: 'બધું બંધ થઈ જશે — અદૃશ્ય deny any any ને કારણે', en: 'Everything is blocked — because of the invisible deny any any' },
      { gu: 'ફક્ત HR server બંધ, બાકી બધું ચાલુ', en: 'Only the HR server is blocked, everything else works' },
      { gu: 'કશું બંધ નહીં થાય', en: 'Nothing is blocked at all' },
    ],
    answer: 0,
    explain: {
      gu: 'દરેક ACL ના અંતે ન દેખાતી `deny any any` હોય છે. એટલે deny લખ્યા પછી `permit ip any any` ઉમેરવું જ પડે, નહીંતર printer અને internet પણ કપાઈ જશે.',
      en: 'Every ACL ends with an unseen `deny any any`, so after the deny you must add `permit ip any any` or the printer and the internet are cut too.',
    },
  },
}
