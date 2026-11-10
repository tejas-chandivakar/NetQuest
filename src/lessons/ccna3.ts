import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const WARN = 'var(--nq-warn)'

/* ══════════════════════ n4l1 · DHCP on a router ══════════════════════ */

const dhcpNodes = (pc1Ip?: string, pc2Ip?: string, poolUp?: boolean) => [
  { id: 'r1', x: 150, y: 170, type: 'router' as const, label: 'R1', sub: poolUp ? 'DHCP pool' : '192.168.10.1', accent: poolUp ? CCNA : 'var(--nq-text-mute)', pulse: poolUp },
  { id: 'sw', x: 420, y: 170, type: 'switch' as const, label: 'SW', accent: CCNA },
  { id: 'pc1', x: 700, y: 85, type: 'pc' as const, label: 'PC1', sub: pc1Ip ?? 'no address', accent: pc1Ip ? BEG : 'var(--nq-text-mute)' },
  { id: 'pc2', x: 700, y: 265, type: 'pc' as const, label: 'PC2', sub: pc2Ip ?? 'no address', accent: pc2Ip ? CCNA : 'var(--nq-text-mute)' },
]

const dhcpLinks = [
  { id: 'a', from: 'r1', to: 'sw', state: 'up' as const },
  { id: 'b', from: 'sw', to: 'pc1', state: 'up' as const },
  { id: 'c', from: 'sw', to: 'pc2', state: 'up' as const },
]

export const n4l1: LessonSpec = {
  why: {
    gu: 'DHCP તમે પહેલાં જોયું — ચાર packets અને સરનામું મળી ગયું. પણ CCNA માં સવાલ બીજો છે: એ pool તમારે જાતે router પર બનાવવો પડે. એમાં ત્રણ વસ્તુ ખોટી થાય તો આખી ઓફિસ અટકી જાય, અને ત્રણેય જાણીતી છે.',
    en: 'You have seen DHCP already — four packets and an address appears. The CCNA question is different: you have to build that pool on the router yourself. Three things commonly go wrong, and all three are well known.',
  },
  viewBox: { w: 860, h: 360 },
  steps: [
    {
      ms: 2800,
      label: { gu: 'પહેલાં સરનામાં અનામત રાખો', en: 'Reserve the addresses first' },
      text: {
        beginner: {
          gu: 'Pool બનાવતાં પહેલાં એક કામ કરવાનું છે. Router પોતે .1 વાપરે છે, printer .5 પર છે, server .7 પર. DHCP ને એ સરનામાં વહેંચવા ન દેવાય, નહીંતર બે મશીનને એક જ IP મળી જાય. એટલે પહેલાં એમને બાજુ પર કાઢી લો.',
          en: 'There is one job before building the pool. The router itself uses .1, the printer sits on .5, the server on .7. DHCP must never hand those out or two machines end up with one address. So set them aside first.',
        },
        exam: {
          gu: '`ip dhcp excluded-address 192.168.10.1 192.168.10.9` pool બનાવતાં પહેલાં લખો. આ global command છે, pool ની અંદર નહીં.',
          en: 'Write `ip dhcp excluded-address 192.168.10.1 192.168.10.9` before creating the pool. It is a global command, not one inside the pool.',
        },
      },
      scene: () => ({
        nodes: dhcpNodes(undefined, undefined, false),
        links: dhcpLinks,
      }),
      aside: (t) => ({
        title: { gu: 'અનામત', en: 'Reserved' },
        head: ['address', 'for'],
        rows:
          t > 0.35
            ? [
                ['192.168.10.1', 'the router itself'],
                ['192.168.10.5', 'the printer'],
                ['192.168.10.7', 'the server'],
                ['.1 – .9', 'excluded from DHCP'],
              ]
            : [
                ['192.168.10.1', 'the router itself'],
                ['192.168.10.5', 'the printer'],
              ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'Pool બનાવો — ત્રણ લીટી', en: 'Build the pool — three lines' },
      text: {
        beginner: {
          gu: 'હવે pool બનાવો. એમાં ત્રણ વસ્તુ કહેવી પડે: કયા નેટવર્કમાંથી વહેંચવું (`network`), gateway કયું આપવું (`default-router`), અને DNS કયું (`dns-server`). ત્રણેયમાંથી એક ભૂલાય તો PC ને સરનામું મળશે પણ કામ નહીં કરે.',
          en: 'Now build the pool. It needs three things: which network to hand out from (`network`), which gateway to give (`default-router`), and which DNS (`dns-server`). Forget any one of them and the PC gets an address that does not work.',
        },
        exam: {
          gu: '`ip dhcp pool LAN` પછી `network 192.168.10.0 255.255.255.0`, `default-router 192.168.10.1`, `dns-server 8.8.8.8`. Lease default 1 day છે.',
          en: '`ip dhcp pool LAN`, then `network 192.168.10.0 255.255.255.0`, `default-router 192.168.10.1`, `dns-server 8.8.8.8`. The default lease is one day.',
        },
      },
      scene: (t) => ({
        nodes: dhcpNodes(undefined, undefined, t > 0.4),
        links: dhcpLinks,
      }),
      aside: (t) => ({
        title: { gu: 'Pool LAN', en: 'Pool LAN' },
        head: ['setting', 'value'],
        rows: [
          ['network', t > 0.25 ? '192.168.10.0/24' : '…'],
          ['default-router', t > 0.5 ? '192.168.10.1' : '…'],
          ['dns-server', t > 0.75 ? '8.8.8.8' : '…'],
          ['lease', t > 0.75 ? '1 day' : '…'],
        ],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'PC માગે, router આપે', en: 'The PC asks, the router answers' },
      text: {
        beginner: {
          gu: 'PC1 ચાલુ થાય એટલે broadcast કરે છે. Router સાંભળે છે, pool માંથી પહેલું ખાલી સરનામું શોધે — .1 થી .9 અનામત છે એટલે .10 — અને આપી દે છે, સાથે gateway અને DNS પણ. ચાર packets, બે સેકન્ડ.',
          en: 'PC1 boots and broadcasts. The router hears it, finds the first free address in the pool — .1 to .9 are reserved so .10 — and hands it over, along with the gateway and DNS. Four packets, two seconds.',
        },
        exam: {
          gu: 'DORA ચાલે છે. Router binding table માં MAC ↔ IP અને lease expiry નોંધે છે. `show ip dhcp binding` થી જોઈ શકાય.',
          en: 'DORA runs. The router records the MAC-to-IP binding and lease expiry, visible with `show ip dhcp binding`.',
        },
      },
      scene: (t) => ({
        nodes: dhcpNodes(t > 0.7 ? '192.168.10.10' : undefined, undefined, true),
        links: dhcpLinks.map((l) => ({ ...l, flowing: true })),
        packets:
          t < 0.35
            ? [{ id: 'd', from: 'pc1', to: 'r1', t: 0.1 + ease(t / 0.35) * 0.8, color: 'var(--nq-pkt-dns)', label: 'DISCOVER' }]
            : t < 0.7
              ? [{ id: 'o', from: 'r1', to: 'pc1', t: 0.1 + ease((t - 0.35) / 0.35) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'OFFER .10' }]
              : [{ id: 'a', from: 'r1', to: 'pc1', t: 0.1 + ease((t - 0.7) / 0.3) * 0.8, color: 'var(--nq-ok)', label: 'ACK ✓' }],
      }),
      aside: (t) => ({
        title: { gu: 'Binding table', en: 'Binding table' },
        head: ['IP', 'MAC', 'lease'],
        rows: t > 0.7 ? [['192.168.10.10', 'PC1', '1 day']] : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'બીજા PC ને આગળનું સરનામું', en: 'The next PC gets the next address' },
      text: {
        beginner: {
          gu: 'PC2 ચાલુ થાય તો એને .11 મળે છે — કારણ કે .10 પહેલેથી અપાયેલું છે. Router દરેક mapping યાદ રાખે છે, એટલે બે મશીનને કદી એક જ સરનામું નથી મળતું. એ જ તો આખા DHCP નો મુદ્દો છે.',
          en: 'PC2 boots and gets .11, because .10 is already taken. The router remembers every mapping, so two machines never receive one address. That is the entire point of DHCP.',
        },
        exam: {
          gu: 'Router allocate કરતાં પહેલાં ICMP ping થી address મફત છે કે નહીં ચકાસે છે, અને client પણ ARP થી duplicate check કરે છે.',
          en: 'The router pings an address before allocating it, and the client also does a duplicate check with ARP.',
        },
      },
      scene: (t) => ({
        nodes: dhcpNodes('192.168.10.10', t > 0.6 ? '192.168.10.11' : undefined, true),
        links: dhcpLinks.map((l) => ({ ...l, flowing: l.id !== 'b' })),
        packets:
          t < 0.6
            ? [{ id: 'd', from: 'pc2', to: 'r1', t: 0.1 + ease(t / 0.6) * 0.8, color: 'var(--nq-pkt-dns)', label: 'DISCOVER' }]
            : [{ id: 'a', from: 'r1', to: 'pc2', t: 0.1 + ease((t - 0.6) / 0.4) * 0.8, color: 'var(--nq-ok)', label: 'ACK .11' }],
      }),
      aside: (t) => ({
        title: { gu: 'Binding table', en: 'Binding table' },
        head: ['IP', 'MAC', 'lease'],
        rows:
          t > 0.6
            ? [
                ['192.168.10.10', 'PC1', '1 day'],
                ['192.168.10.11', 'PC2', '1 day'],
              ]
            : [['192.168.10.10', 'PC1', '1 day']],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'છટકું — DHCP બીજી બાજુ હોય તો', en: 'The trap — when DHCP is on the far side' },
      text: {
        beginner: {
          gu: 'મોટી કંપનીમાં DHCP server એક જ હોય છે અને દરેક શાખામાં નહીં. પણ DHCP નો પહેલો સંદેશ broadcast છે — અને **router broadcast આગળ નથી મોકલતો**. એટલે બીજી બાજુનાં PC ને કદી જવાબ મળે જ નહીં.',
          en: 'In a large company there is one DHCP server, not one per branch. But the first DHCP message is a broadcast — and **a router does not forward broadcasts**. So PCs on the far side never get an answer.',
        },
        exam: {
          gu: 'Routers broadcast domain ને અટકાવે છે, એટલે DHCPDISCOVER (255.255.255.255) બીજા subnet સુધી પહોંચતું નથી.',
          en: 'Routers terminate the broadcast domain, so a DHCPDISCOVER to 255.255.255.255 never reaches another subnet.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc1', x: 110, y: 230, type: 'pc' as const, label: 'PC1', sub: 'no address', accent: 'var(--nq-text-mute)' },
          { id: 'r1', x: 360, y: 230, type: 'router' as const, label: 'R1', sub: 'blocks broadcast', accent: WARN, pulse: t > 0.5 },
          { id: 'srv', x: 700, y: 230, type: 'server' as const, label: 'DHCP server', sub: '10.0.0.5', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'pc1', to: 'r1', state: 'up', flowing: true },
          { id: 'b', from: 'r1', to: 'srv', state: 'up' },
        ],
        packets: [
          { id: 'x', from: 'pc1', to: 'r1', t: 0.1 + ease(t) * 0.75, color: 'var(--nq-err)', label: 'broadcast stops here ✕' },
        ],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'ઉકેલ — ip helper-address', en: 'The fix — ip helper-address' },
      text: {
        beginner: {
          gu: 'ઉકેલ એક લીટીનો છે. Router ના interface પર `ip helper-address 10.0.0.5` લખો. હવે router broadcast ને પકડીને એને unicast માં બદલી નાખે છે અને સીધો server ને મોકલે છે. Broadcast આગળ નથી જતું — router એનો સંદેશવાહક બની જાય છે.',
          en: 'The fix is one line. On the router’s interface write `ip helper-address 10.0.0.5`. The router now catches the broadcast, converts it to a unicast and sends it straight to the server. The broadcast still does not travel — the router carries the message instead.',
        },
        exam: {
          gu: 'Relay agent broadcast ને unicast કરે છે અને giaddr માં પોતાનું interface IP ભરે છે, જેથી server જાણે કે કયા subnet ના pool માંથી આપવું.',
          en: 'The relay agent rewrites the broadcast as unicast and fills giaddr with its own interface IP, so the server knows which subnet’s pool to allocate from.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc1', x: 110, y: 230, type: 'pc' as const, label: 'PC1', sub: t > 0.75 ? '192.168.10.10 ✓' : 'no address', accent: t > 0.75 ? BEG : 'var(--nq-text-mute)' },
          { id: 'r1', x: 360, y: 230, type: 'router' as const, label: 'R1', sub: 'ip helper-address', accent: CCNA, pulse: t > 0.2 && t < 0.6 },
          { id: 'srv', x: 700, y: 230, type: 'server' as const, label: 'DHCP server', sub: '10.0.0.5', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'pc1', to: 'r1', state: 'up', flowing: true },
          { id: 'b', from: 'r1', to: 'srv', state: 'up', flowing: t > 0.25 },
        ],
        packets:
          t < 0.25
            ? [{ id: 'd', from: 'pc1', to: 'r1', t: 0.1 + ease(t / 0.25) * 0.8, color: 'var(--nq-pkt-dns)', label: 'broadcast' }]
            : t < 0.55
              ? [{ id: 'u', from: 'r1', to: 'srv', t: 0.1 + ease((t - 0.25) / 0.3) * 0.8, color: CCNA, label: 'now unicast →' }]
              : t < 0.78
                ? [{ id: 'o', from: 'srv', to: 'r1', t: 0.1 + ease((t - 0.55) / 0.23) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'OFFER' }]
                : [{ id: 'f', from: 'r1', to: 'pc1', t: 0.1 + ease((t - 0.78) / 0.22) * 0.8, color: 'var(--nq-ok)', label: 'ACK ✓' }],
      }),
    },
  ],
  takeaway: {
    gu: 'Router પર DHCP: પહેલાં `excluded-address` થી સ્થિર સરનામાં બચાવો, પછી pool માં network, default-router અને dns-server ત્રણેય આપો. Server બીજા subnet માં હોય તો interface પર `ip helper-address` — કારણ કે router broadcast આગળ નથી મોકલતો.',
    en: 'DHCP on a router: first protect the static addresses with `excluded-address`, then give the pool a network, a default-router and a dns-server. If the server sits in another subnet, add `ip helper-address` on the interface — because a router will not forward broadcasts.',
  },
  check: {
    q: {
      gu: 'DHCP server બીજા subnet માં છે અને PC ને સરનામું મળતું નથી. શું જોઈએ?',
      en: 'The DHCP server is in another subnet and the PCs get no address. What is needed?',
    },
    options: [
      { gu: 'Router ના interface પર ip helper-address', en: 'ip helper-address on the router interface' },
      { gu: 'દરેક PC પર static IP', en: 'A static IP on every PC' },
      { gu: 'Pool માં વધુ સરનામાં', en: 'More addresses in the pool' },
    ],
    answer: 0,
    explain: {
      gu: 'DHCP નો પહેલો સંદેશ broadcast છે અને router એને આગળ નથી મોકલતો. `ip helper-address` router ને એ broadcast પકડીને server સુધી unicast કરવાનું કહે છે.',
      en: 'The first DHCP message is a broadcast and a router will not forward it. `ip helper-address` tells the router to catch it and unicast it to the server.',
    },
  },
}

/* ══════════════════════ n4l2 · NAT and PAT ══════════════════════ */

const natNodes = (translated: boolean) => [
  { id: 'pc1', x: 95, y: 200, type: 'pc' as const, label: 'PC1', sub: '192.168.1.10', accent: BEG },
  { id: 'r1', x: 320, y: 200, type: 'router' as const, label: 'R1', sub: translated ? 'inside ↔ outside' : undefined, accent: translated ? CCNA : 'var(--nq-text-mute)', pulse: translated },
  { id: 'isp', x: 560, y: 200, type: 'router' as const, label: 'ISP', accent: CCNP },
  { id: 'web', x: 790, y: 200, type: 'server' as const, label: 'Web', sub: '203.0.113.5', accent: CCNP },
]

const natLinks = [
  { id: 'a', from: 'pc1', to: 'r1', state: 'up' as const },
  { id: 'b', from: 'r1', to: 'isp', state: 'up' as const },
  { id: 'c', from: 'isp', to: 'web', state: 'up' as const },
]

export const n4l2: LessonSpec = {
  why: {
    gu: 'ખાનગી સરનામું internet પર જાય તો પહેલા જ router પર ફેંકાઈ જાય છે. NAT એ સરહદ પર ઊભું રહીને packet નું સરનામું બદલી નાખે છે — અને એટલું ચોકસાઈથી યાદ રાખે છે કે જવાબ પાછો સાચા મશીન સુધી પહોંચે.',
    en: 'A private address thrown at the internet is dropped by the first router it meets. NAT stands at the border and rewrites the packet’s address — remembering precisely enough that the reply finds its way back to the right machine.',
  },
  viewBox: { w: 880, h: 400 },
  steps: [
    {
      ms: 2800,
      label: { gu: 'અંદર કોણ, બહાર કોણ', en: 'Which side is inside, which is outside' },
      text: {
        beginner: {
          gu: 'NAT ની પહેલી શરત એ છે કે router ને કહેવું પડે કે કયું interface "અંદર" છે અને કયું "બહાર". આ બે લીટી ભૂલાઈ જાય તો NAT configure કર્યા પછી પણ કશું જ નહીં થાય — અને કોઈ error પણ નહીં આવે.',
          en: 'The first requirement of NAT is telling the router which interface is "inside" and which is "outside". Forget those two lines and NAT will do nothing at all after you configure it — with no error message either.',
        },
        exam: {
          gu: '`ip nat inside` અને `ip nat outside` interface level પર જોઈએ. એ વગર translation rules કદી લાગુ પડતા નથી — આ સૌથી સામાન્ય NAT ભૂલ છે.',
          en: '`ip nat inside` and `ip nat outside` are required at interface level. Without them the translation rules never apply — the single most common NAT mistake.',
        },
      },
      scene: (t) => ({
        nodes: natNodes(false).map((n) =>
          n.id === 'r1'
            ? { ...n, sub: t > 0.45 ? 'Gi0/0 inside · Gi0/1 outside' : undefined, pulse: t > 0.45 }
            : n,
        ),
        links: natLinks.map((l) =>
          l.id === 'a'
            ? { ...l, label: t > 0.45 ? 'inside' : undefined }
            : l.id === 'b'
              ? { ...l, label: t > 0.45 ? 'outside' : undefined }
              : l,
        ),
      }),
    },
    {
      ms: 3000,
      label: { gu: 'ખાનગી packet સરહદ સુધી', en: 'The private packet reaches the border' },
      text: {
        beginner: {
          gu: 'PC1 (192.168.1.10) વેબસાઈટ ખોલે છે. Packet R1 સુધી પહોંચે છે. અહીં જ નિર્ણય થાય છે — જો NAT ન હોય તો એ packet આગળ જાય તો ખરો, પણ ISP એને તરત ફેંકી દે, કારણ કે 192.168.x.x internet પર routable જ નથી.',
          en: 'PC1 (192.168.1.10) opens a website. The packet reaches R1. This is the decision point — without NAT it would go on, but the ISP would drop it instantly, because 192.168.x.x is simply not routable on the internet.',
        },
        exam: {
          gu: 'RFC 1918 addresses internet પર advertise થતાં નથી અને providers એમને filter કરે છે. એટલે outbound traffic માટે translation ફરજિયાત છે.',
          en: 'RFC 1918 addresses are never advertised on the internet and providers filter them, so translation is mandatory for outbound traffic.',
        },
      },
      scene: (t) => ({
        nodes: natNodes(false),
        links: natLinks.map((l) => ({ ...l, flowing: l.id === 'a' })),
        packets: [
          { id: 'p', from: 'pc1', to: 'r1', t: 0.1 + ease(t) * 0.8, color: 'var(--nq-pkt-data)', label: 'src 192.168.1.10' },
        ],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'સરનામું બદલાય', en: 'The address is rewritten' },
      text: {
        beginner: {
          gu: 'અહીં NAT કામ કરે છે. R1 packet ખોલે છે, source સરનામું 192.168.1.10 ભૂંસે છે, અને પોતાનું જાહેર સરનામું 203.0.113.2 લખી દે છે. Destination એ જ રહે છે. પછી એ નોંધ કરે છે કે કોના માટે શું કર્યું — આ નોંધ જ સૌથી અગત્યની છે.',
          en: 'Here NAT does its work. R1 opens the packet, erases the source 192.168.1.10 and writes its own public address 203.0.113.2. The destination is untouched. Then it makes a note of what it did for whom — and that note is the important part.',
        },
        exam: {
          gu: 'Inside-local (192.168.1.10) → inside-global (203.0.113.2). Translation entry બને છે; IP header નો checksum ફરી ગણાય છે.',
          en: 'Inside-local (192.168.1.10) becomes inside-global (203.0.113.2). A translation entry is created and the IP header checksum is recomputed.',
        },
      },
      scene: (t) => ({
        nodes: natNodes(true),
        links: natLinks.map((l) => ({ ...l, flowing: l.id !== 'a' })),
        packets: [
          { id: 'p', from: 'r1', to: 'isp', t: 0.1 + ease(t) * 0.8, color: 'var(--nq-ok)', label: 'src 203.0.113.2' },
        ],
      }),
      aside: (t) => ({
        title: { gu: 'Translation table', en: 'Translation table' },
        head: ['inside local', 'inside global'],
        rows: t > 0.3 ? [['192.168.1.10:51234', '203.0.113.2:51234']] : [],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'જવાબ પાછો — ઊલટું ભાષાંતર', en: 'The reply — translated back' },
      text: {
        beginner: {
          gu: 'Website જવાબ 203.0.113.2 ને મોકલે છે, કારણ કે એને એ જ સરનામું દેખાયું હતું. Packet R1 પર આવે છે, R1 પોતાની નોંધ જુએ છે — "આ તો PC1 માટે હતું" — અને destination બદલીને 192.168.1.10 કરી નાખે છે. PC1 ને કશી ખબર પડતી નથી.',
          en: 'The website replies to 203.0.113.2, because that is the only address it ever saw. The packet arrives at R1, R1 checks its note — "that one was for PC1" — and rewrites the destination to 192.168.1.10. PC1 never knows any of it happened.',
        },
        exam: {
          gu: 'Return traffic માં destination inside-global → inside-local બદલાય છે. Entry ન મળે તો packet drop થાય — એ જ NAT નું implicit security છે.',
          en: 'On the way back the destination changes from inside-global to inside-local. With no matching entry the packet is dropped — which is NAT’s implicit security.',
        },
      },
      scene: (t) => ({
        nodes: natNodes(true),
        links: natLinks.map((l) => ({ ...l, flowing: true })),
        packets:
          t < 0.5
            ? [{ id: 'r', from: 'isp', to: 'r1', t: 0.1 + ease(t / 0.5) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'dst 203.0.113.2' }]
            : [{ id: 'r', from: 'r1', to: 'pc1', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'dst 192.168.1.10 ✓' }],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'PAT — port વડે બધાને સમાવો', en: 'PAT — fitting everyone in with ports' },
      text: {
        beginner: {
          gu: 'પણ ઘરમાં દસ ઉપકરણ અને જાહેર સરનામું એક જ! તો R1 બીજું કામ કરે છે: દરેક વાતચીતને અલગ port number આપે છે. PC1 ને 51234, PC2 ને 51235. સરનામું એક જ, પણ port અલગ — એટલે જવાબ કદી ભળતો નથી. આને PAT કે NAT overload કહે છે.',
          en: 'But there are ten devices at home and only one public address. So R1 does something extra: it gives every conversation its own port number. PC1 gets 51234, PC2 gets 51235. One address, different ports — so the replies never get mixed up. This is PAT, or NAT overload.',
        },
        exam: {
          gu: '`ip nat inside source list 1 interface Gi0/1 overload`. `overload` keyword PAT ચાલુ કરે છે — એક public IP પર ~65,000 concurrent sessions.',
          en: '`ip nat inside source list 1 interface Gi0/1 overload`. The `overload` keyword enables PAT — around 65,000 concurrent sessions behind one public IP.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc1', x: 95, y: 120, type: 'pc' as const, label: 'PC1', sub: '192.168.1.10', accent: BEG },
          { id: 'pc2', x: 95, y: 300, type: 'laptop' as const, label: 'PC2', sub: '192.168.1.11', accent: WARN },
          { id: 'r1', x: 360, y: 210, type: 'router' as const, label: 'R1', sub: '203.0.113.2 · overload', accent: CCNA, pulse: true },
          { id: 'web', x: 720, y: 210, type: 'server' as const, label: 'Web', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'pc1', to: 'r1', state: 'up', flowing: true },
          { id: 'b', from: 'pc2', to: 'r1', state: 'up', flowing: true },
          { id: 'c', from: 'r1', to: 'web', state: 'up', flowing: t > 0.4 },
        ],
        packets:
          t > 0.4
            ? [
                { id: 'p1', from: 'r1', to: 'web', t: 0.1 + ease((t - 0.4) / 0.6) * 0.8, color: 'var(--nq-pkt-data)', label: ':51234' },
                { id: 'p2', from: 'r1', to: 'web', t: 0.05 + ease((t - 0.4) / 0.6) * 0.7, color: 'var(--nq-pkt-ctrl)', label: ':51235' },
              ]
            : [],
      }),
      aside: (t) => ({
        title: { gu: 'એક IP, ઘણા ports', en: 'One IP, many ports' },
        head: ['inside', 'outside'],
        rows:
          t > 0.4
            ? [
                ['192.168.1.10:51234', '203.0.113.2:51234'],
                ['192.168.1.11:51235', '203.0.113.2:51235'],
                ['192.168.1.12:51236', '203.0.113.2:51236'],
              ]
            : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'Static NAT — બહારથી અંદર આવવા દો', en: 'Static NAT — letting the outside in' },
      text: {
        beginner: {
          gu: 'PAT એક દિશામાં જ કામ કરે — અંદરથી શરૂ થાય તો જ. પણ તમારો web server અંદર હોય અને બહારના લોકોને એના સુધી પહોંચવું હોય તો? ત્યાં static NAT વપરાય: એક કાયમી જોડી બનાવી દો, "203.0.113.5 એટલે હંમેશા 192.168.1.50".',
          en: 'PAT works one way only — when the conversation starts inside. But what if your web server is inside and the outside world must reach it? Then you use static NAT: create a permanent pair, "203.0.113.5 always means 192.168.1.50".',
        },
        exam: {
          gu: '`ip nat inside source static 192.168.1.50 203.0.113.5` કાયમી bidirectional mapping બનાવે છે. એ translation table માં હંમેશા હાજર રહે છે.',
          en: '`ip nat inside source static 192.168.1.50 203.0.113.5` creates a permanent bidirectional mapping that is always present in the translation table.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'cl', x: 120, y: 210, type: 'cloud' as const, label: 'Internet', accent: CCNP },
          { id: 'r1', x: 400, y: 210, type: 'router' as const, label: 'R1', sub: t > 0.3 ? 'static NAT' : undefined, accent: CCNA, pulse: t > 0.3 },
          { id: 'srv', x: 710, y: 150, type: 'server' as const, label: 'Web server', sub: '192.168.1.50', accent: CCNA },
          { id: 'pc', x: 710, y: 320, type: 'pc' as const, label: 'PC1', sub: 'not reachable', accent: 'var(--nq-text-mute)' },
        ],
        links: [
          { id: 'a', from: 'cl', to: 'r1', state: 'up', flowing: true },
          { id: 'b', from: 'r1', to: 'srv', state: 'up', flowing: t > 0.4 },
          { id: 'c', from: 'r1', to: 'pc', state: 'up' },
        ],
        packets:
          t < 0.45
            ? [{ id: 'i', from: 'cl', to: 'r1', t: 0.1 + ease(t / 0.45) * 0.8, color: 'var(--nq-pkt-data)', label: '→ 203.0.113.5' }]
            : [{ id: 'i', from: 'r1', to: 'srv', t: 0.1 + ease((t - 0.45) / 0.55) * 0.8, color: 'var(--nq-ok)', label: '→ 192.168.1.50 ✓' }],
      }),
    },
  ],
  takeaway: {
    gu: 'NAT સરહદ પર packet નું સરનામું બદલે છે અને નોંધ રાખે છે જેથી જવાબ પાછો સાચા મશીન સુધી પહોંચે. PAT port વાપરીને એક જ જાહેર સરનામા પાછળ હજારો મશીન સમાવે. બહારથી અંદર આવવા દેવું હોય તો static NAT. અને `ip nat inside/outside` ભૂલશો નહીં.',
    en: 'NAT rewrites a packet’s address at the border and keeps a note so the reply finds the right machine. PAT uses ports to fit thousands of machines behind one public address. To let the outside in, use static NAT. And never forget `ip nat inside/outside`.',
  },
  check: {
    q: {
      gu: 'NAT configure કર્યું પણ કશું translate નથી થતું. સૌથી પહેલાં શું તપાસશો?',
      en: 'NAT is configured but nothing is being translated. What do you check first?',
    },
    options: [
      { gu: 'Interfaces પર ip nat inside અને ip nat outside છે કે નહીં', en: 'Whether ip nat inside and ip nat outside are on the interfaces' },
      { gu: 'PC નું IP સરનામું', en: 'The PC’s IP address' },
      { gu: 'Router નો hostname', en: 'The router’s hostname' },
    ],
    answer: 0,
    explain: {
      gu: 'NAT rules ત્યારે જ લાગુ પડે જ્યારે router ને ખબર હોય કે કયું interface અંદર છે અને કયું બહાર. એ બે લીટી વગર configuration સાચું દેખાય પણ કશું થાય નહીં.',
      en: 'NAT rules only apply once the router knows which interface is inside and which is outside. Without those two lines the configuration looks right but does nothing.',
    },
  },
}

/* ══════════════════════ n5l2 · Access Control Lists ══════════════════════ */

const aclNodes = (aclOn: boolean) => [
  { id: 'guest', x: 95, y: 110, type: 'pc' as const, label: 'Guest', sub: '10.0.2.10', accent: WARN },
  { id: 'staff', x: 95, y: 320, type: 'pc' as const, label: 'Staff', sub: '10.0.1.10', accent: BEG },
  { id: 'sw', x: 330, y: 215, type: 'switch' as const, label: 'SW', accent: CCNA },
  { id: 'r1', x: 560, y: 215, type: 'router' as const, label: 'R1', sub: aclOn ? 'ACL 100 in' : undefined, accent: aclOn ? 'var(--nq-err)' : 'var(--nq-text-mute)', pulse: aclOn },
  { id: 'srv', x: 790, y: 215, type: 'server' as const, label: 'Server', sub: '10.0.9.5', accent: CCNP },
]

const aclLinks = [
  { id: 'a', from: 'guest', to: 'sw', state: 'up' as const },
  { id: 'b', from: 'staff', to: 'sw', state: 'up' as const },
  { id: 'c', from: 'sw', to: 'r1', state: 'up' as const },
  { id: 'd', from: 'r1', to: 'srv', state: 'up' as const },
]

export const n5l2: LessonSpec = {
  why: {
    gu: 'VLAN અને routing ગોઠવાઈ ગયા પછી એક સવાલ બાકી રહે છે: બધાં એકબીજા સુધી પહોંચી શકે છે — પણ શું બધાંએ પહોંચવું જોઈએ? ACL એ router પર લખેલા નિયમો છે જે નક્કી કરે કે કયો packet આગળ જાય અને કયો અહીં જ અટકે.',
    en: 'Once VLANs and routing are in place one question remains: everyone can reach everyone — but should they? An ACL is a list of rules on the router deciding which packet travels on and which stops right there.',
  },
  viewBox: { w: 880, h: 430 },
  steps: [
    {
      ms: 2800,
      label: { gu: 'અત્યારે બધાં બધે પહોંચે છે', en: 'Right now everyone reaches everything' },
      text: {
        beginner: {
          gu: 'Routing બરાબર કામ કરે છે — એટલું બરાબર કે મહેમાનનું લેપટોપ પણ કંપનીના server સુધી પહોંચી જાય છે. Routing નું કામ રસ્તો બનાવવાનું છે, એ પૂછતું નથી કે જવું જોઈએ કે નહીં.',
          en: 'Routing works perfectly — so perfectly that the guest laptop reaches the company server too. Routing’s job is to build a path; it never asks whether anyone should take it.',
        },
        exam: {
          gu: 'Default માં કોઈ filtering નથી; router બધું forward કરે છે જેનો route હોય. Policy enforcement અલગથી ઉમેરવું પડે.',
          en: 'By default there is no filtering; a router forwards anything it has a route for. Policy enforcement has to be added separately.',
        },
      },
      scene: (t) => ({
        nodes: aclNodes(false),
        links: aclLinks.map((l) => ({ ...l, flowing: t > 0.3 })),
        packets:
          t > 0.3
            ? [
                { id: 'g', from: 'guest', to: 'srv', t: 0.06 + ease((t - 0.3) / 0.7) * 0.88, color: WARN, label: 'guest reaches it ✓' },
                { id: 's', from: 'staff', to: 'srv', t: 0.06 + ease(Math.max(0, t - 0.45) / 0.55) * 0.88, color: 'var(--nq-ok)', label: 'staff ✓' },
              ]
            : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'નિયમોની યાદી બનાવો', en: 'Write a list of rules' },
      text: {
        beginner: {
          gu: 'ACL એ ઉપરથી નીચે વંચાતી યાદી છે. દરેક packet એના પર ઊભો રહીને પહેલી લીટીથી તપાસાય છે. મેળ ખાય એટલે નિર્ણય થઈ ગયો — permit કે deny — અને બાકીની લીટીઓ વંચાતી જ નથી. **પહેલો મેળ જીતે.**',
          en: 'An ACL is a list read top to bottom. Every packet is checked against line one first. The moment something matches the decision is made — permit or deny — and the remaining lines are never read. **First match wins.**',
        },
        exam: {
          gu: 'ACL sequential છે અને first match પર evaluation અટકી જાય છે. એટલે specific entries પહેલાં અને general પછી મૂકવા — ઊલટું કરો તો specific rule કદી match નહીં થાય.',
          en: 'An ACL is sequential and evaluation stops at the first match, so specific entries must come before general ones. Reverse them and the specific rule never matches.',
        },
      },
      scene: (t) => ({
        nodes: aclNodes(t > 0.4),
        links: aclLinks,
      }),
      aside: (t) => ({
        title: { gu: 'ACL 100', en: 'ACL 100' },
        head: ['#', 'rule', 'action'],
        rows:
          t > 0.4
            ? [
                ['10', 'ip 10.0.1.0 → 10.0.9.5', 'permit'],
                ['20', 'ip 10.0.2.0 → 10.0.9.5', 'deny'],
              ]
            : [],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'Staff નો packet — પહેલી લીટીએ permit', en: 'The staff packet — permitted on line one' },
      text: {
        beginner: {
          gu: 'Staff નો packet આવે છે. Router પહેલી લીટી વાંચે: "10.0.1.0 થી server સુધી — permit". મેળ ખાઈ ગયો! નિર્ણય થઈ ગયો, packet આગળ જાય છે. બીજી લીટી વંચાતી પણ નથી.',
          en: 'A staff packet arrives. The router reads line one: "10.0.1.0 to the server — permit". It matches. The decision is made and the packet goes through. Line two is never even read.',
        },
        exam: {
          gu: 'Inbound ACL routing decision પહેલાં લાગુ પડે છે. Permit થાય એટલે packet normal forwarding path પર જાય છે.',
          en: 'An inbound ACL is applied before the routing decision. On a permit the packet continues down the normal forwarding path.',
        },
      },
      scene: (t) => ({
        nodes: aclNodes(true),
        links: aclLinks.map((l) => ({ ...l, flowing: l.id === 'b' || l.id === 'c' || (t > 0.5 && l.id === 'd') })),
        packets:
          t < 0.5
            ? [{ id: 's', from: 'staff', to: 'r1', t: 0.06 + ease(t / 0.5) * 0.84, color: 'var(--nq-pkt-data)', label: 'from 10.0.1.10' }]
            : [{ id: 's', from: 'r1', to: 'srv', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'line 10 · permit ✓' }],
      }),
      aside: (t) => ({
        title: { gu: 'તપાસ', en: 'Evaluation' },
        head: ['#', 'rule', 'result'],
        rows: [
          ['10', '10.0.1.0 → server', t > 0.35 ? 'MATCH · permit ←' : 'checking…'],
          ['20', '10.0.2.0 → server', t > 0.35 ? '(not read)' : ''],
        ],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'Guest નો packet — બીજી લીટીએ deny', en: 'The guest packet — denied on line two' },
      text: {
        beginner: {
          gu: 'હવે guest નો packet. પહેલી લીટી વાંચી — 10.0.1.0 નો નથી, મેળ નહીં. બીજી લીટી — 10.0.2.0 થી server, deny. મેળ ખાઈ ગયો. Packet અહીં જ ફેંકાઈ જાય છે અને server સુધી કદી પહોંચતો નથી.',
          en: 'Now a guest packet. Line one is read — not from 10.0.1.0, no match. Line two — from 10.0.2.0 to the server, deny. That matches. The packet is dropped right here and never reaches the server.',
        },
        exam: {
          gu: 'Deny થાય એટલે packet drop થાય છે અને સામાન્ય રીતે ICMP administratively-prohibited પાછો જાય છે (જો `no ip unreachables` ન હોય તો).',
          en: 'On a deny the packet is dropped, usually with an ICMP administratively-prohibited reply (unless `no ip unreachables` is set).',
        },
      },
      scene: (t) => ({
        nodes: aclNodes(true),
        links: aclLinks.map((l) => ({ ...l, flowing: l.id === 'a' || l.id === 'c' })),
        packets: [
          { id: 'g', from: 'guest', to: 'r1', t: 0.06 + ease(Math.min(1, t / 0.65)) * 0.84, color: t > 0.65 ? 'var(--nq-err)' : WARN, label: t > 0.65 ? 'line 20 · deny ✕' : 'from 10.0.2.10' },
        ],
      }),
      say: (t) =>
        t > 0.65
          ? { nodeId: 'r1', text: { gu: 'લીટી 20 મેળ ખાઈ — deny', en: 'Line 20 matched — deny' } }
          : null,
      aside: (t) => ({
        title: { gu: 'તપાસ', en: 'Evaluation' },
        head: ['#', 'rule', 'result'],
        rows: [
          ['10', '10.0.1.0 → server', t > 0.3 ? 'no match' : 'checking…'],
          ['20', '10.0.2.0 → server', t > 0.6 ? 'MATCH · deny ←' : t > 0.3 ? 'checking…' : ''],
        ],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'છેલ્લે એક અદૃશ્ય દીવાલ', en: 'An invisible wall at the end' },
      text: {
        beginner: {
          gu: 'અહીં સૌથી મોટી છટકું છે. દરેક ACL ના છેડે એક લીટી હોય છે જે તમે લખી નથી અને દેખાતી પણ નથી: **deny any any**. એટલે જે કશામાં મેળ ન ખાય એ બધું ફેંકાઈ જાય. એક permit લખીને બાકીનું ખુલ્લું રહેશે એમ માનવું એ સૌથી સામાન્ય ભૂલ છે.',
          en: 'This is the biggest trap. At the end of every ACL sits a line you never wrote and cannot see: **deny any any**. Anything matching nothing above it is dropped. Assuming that one permit leaves the rest open is the most common mistake there is.',
        },
        exam: {
          gu: 'Implicit `deny ip any any` દરેક ACL ના અંતે છે અને `show access-lists` માં દેખાતી નથી. બાકીનું traffic ચાલુ રાખવું હોય તો explicit `permit ip any any` લખવું પડે.',
          en: 'The implicit `deny ip any any` ends every ACL and does not appear in `show access-lists`. To let other traffic through you must write an explicit `permit ip any any`.',
        },
      },
      scene: (t) => ({
        nodes: [
          ...aclNodes(true),
          { id: 'other', x: 95, y: 215, type: 'laptop' as const, label: 'Printer', sub: '10.0.5.10', accent: CCNA },
        ],
        links: [...aclLinks, { id: 'e', from: 'other', to: 'sw', state: 'up' as const, flowing: true }],
        packets: [
          { id: 'o', from: 'other', to: 'r1', t: 0.06 + ease(Math.min(1, t / 0.7)) * 0.84, color: t > 0.7 ? 'var(--nq-err)' : CCNA, label: t > 0.7 ? 'implicit deny ✕' : 'matches nothing…' },
        ],
      }),
      say: (t) =>
        t > 0.7
          ? { nodeId: 'r1', text: { gu: 'કશામાં મેળ નહીં — એટલે બંધ', en: 'Matched nothing — so blocked' } }
          : null,
      aside: (t) => ({
        title: { gu: 'ACL 100 — ખરેખર', en: 'ACL 100 — what it really is' },
        head: ['#', 'rule', 'action'],
        rows: [
          ['10', '10.0.1.0 → server', 'permit'],
          ['20', '10.0.2.0 → server', 'deny'],
          ['—', 'any → any', t > 0.5 ? 'deny (invisible!) ←' : 'deny (invisible)'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'ક્યાં લગાવવો — અને કઈ દિશામાં', en: 'Where to apply it — and in which direction' },
      text: {
        beginner: {
          gu: 'ACL લખવાથી કશું થતું નથી — એને interface પર લગાવવો પડે, અને દિશા કહેવી પડે. જૂનો નિયમ છે: standard ACL destination ની નજીક, extended ACL source ની નજીક. કારણ સાદું છે — નકામો traffic જેટલો વહેલો રોકાય એટલું સારું.',
          en: 'Writing an ACL does nothing — you must apply it to an interface and state a direction. The old rule: standard ACLs near the destination, extended ACLs near the source. The reason is simple — stop unwanted traffic as early as you can.',
        },
        exam: {
          gu: '`ip access-group 100 in` interface પર લગાવે છે. Standard ACL ફક્ત source જુએ છે એટલે source પાસે મૂકો તો બધું જ કપાઈ જાય; extended ACL source અને destination બંને જુએ છે.',
          en: '`ip access-group 100 in` applies it to an interface. A standard ACL matches on source only, so placing it near the source would cut everything; an extended ACL matches both source and destination.',
        },
      },
      scene: (t) => ({
        nodes: aclNodes(true),
        links: aclLinks.map((l) =>
          l.id === 'c' ? { ...l, label: t > 0.4 ? 'ACL applied · in' : undefined, flowing: t > 0.4 } : l,
        ),
        packets:
          t > 0.5
            ? [
                { id: 'g', from: 'guest', to: 'r1', t: 0.06 + ease((t - 0.5) / 0.5) * 0.78, color: 'var(--nq-err)', label: 'stopped early ✕' },
                { id: 's', from: 'staff', to: 'srv', t: 0.06 + ease((t - 0.5) / 0.5) * 0.88, color: 'var(--nq-ok)', label: 'allowed ✓' },
              ]
            : [],
      }),
      aside: () => ({
        title: { gu: 'ક્યાં મૂકવો', en: 'Where to place it' },
        head: ['type', 'matches on', 'place near'],
        rows: [
          ['standard', 'source only', 'the destination'],
          ['extended', 'source + dest + port', 'the source'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'ACL ઉપરથી નીચે વંચાય અને પહેલો મેળ જીતે — બાકીની લીટીઓ વંચાતી જ નથી. છેડે એક અદૃશ્ય `deny any any` હંમેશા બેઠી હોય છે, એટલે જે લખ્યું નથી એ બધું બંધ. લખવાથી કશું ન થાય; interface પર દિશા સાથે લગાવવો પડે.',
    en: 'An ACL is read top to bottom and the first match wins — nothing below it is read. An invisible `deny any any` always sits at the end, so anything you did not write is blocked. Writing it does nothing; you must apply it to an interface with a direction.',
  },
  check: {
    q: {
      gu: 'તમે ACL માં ફક્ત એક લીટી લખી: "permit 10.0.1.0". બાકીના નેટવર્કનું શું થશે?',
      en: 'Your ACL has just one line: "permit 10.0.1.0". What happens to every other network?',
    },
    options: [
      { gu: 'બધું બંધ — છેડે અદૃશ્ય deny any any છે', en: 'All blocked — the invisible deny any any ends the list' },
      { gu: 'બધું ચાલુ — ફક્ત લખેલું જ લાગુ પડે', en: 'All allowed — only what is written applies' },
      { gu: 'કશું નહીં થાય', en: 'Nothing happens at all' },
    ],
    answer: 0,
    explain: {
      gu: 'દરેક ACL ના અંતે ન દેખાતી `deny any any` હોય છે. એક permit લખો એટલે એ એક જ ચાલુ રહે અને બાકીનું બધું કપાઈ જાય — એટલે ACL લગાવતાં પહેલાં હંમેશા વિચારો કે શું ચાલુ રાખવું છે.',
      en: 'Every ACL ends with an unseen `deny any any`. Write one permit and only that survives while everything else is cut — so always think about what must stay allowed before you apply one.',
    },
  },
}
