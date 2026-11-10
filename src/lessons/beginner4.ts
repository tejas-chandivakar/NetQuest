import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'

/* ------------------------------------------------------------------ b4l1 */

export const b4l1: LessonSpec = {
  why: {
    gu: 'આ એક પાઠ આખો કોર્સ જોડી દે છે. google.com લખીને Enter દબાવવા અને પાનું દેખાવા વચ્ચે અડધી સેકન્ડમાં છ-સાત અલગ વસ્તુઓ થાય છે — અને તમે એ બધી અત્યાર સુધી અલગ અલગ શીખી છે. હવે એમને ક્રમમાં જોઈએ.',
    en: 'This one lesson ties the whole course together. Between pressing Enter on google.com and the page appearing, six or seven separate things happen in half a second — and you have already learnt each one separately. Now we watch them in order.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: '1 · મારું સરનામું શું?', en: '1 · What is my address?' },
      text: {
        beginner: {
          gu: 'સૌથી પહેલાં તો તમારા લેપટોપ પાસે પોતાનું સરનામું હોવું જોઈએ. એ router ને પૂછે છે: "મને એક IP આપો". Router જવાબમાં IP, mask અને gateway આપે છે. આ DHCP છે, અને એ તમે WiFi સાથે જોડાયા ત્યારે જ થઈ ગયું હતું.',
          en: 'First your laptop needs an address of its own. It asks the router: "give me an IP". The router hands back an IP, a mask and a gateway. That is DHCP, and it already happened the moment you joined the WiFi.',
        },
        exam: {
          gu: 'DHCP DORA: Discover (broadcast) → Offer → Request → Acknowledge. Client ને IP, mask, default gateway અને DNS server મળે છે.',
          en: 'DHCP DORA: Discover (broadcast) → Offer → Request → Acknowledge. The client receives an IP, mask, default gateway and DNS server.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p', x: 230, y: 240, type: 'laptop' as const, label: 'Your laptop', sub: t > 0.6 ? '192.168.1.10' : 'no address', accent: BEG, pulse: t > 0.6 },
          { id: 'r', x: 630, y: 240, type: 'router' as const, label: 'Router', sub: 'DHCP server', accent: CCNP },
        ],
        links: [{ id: 'l', from: 'p', to: 'r', state: 'up', flowing: true }],
        packets:
          t < 0.5
            ? [{ id: 'd', from: 'p', to: 'r', t: 0.08 + ease(t / 0.5) * 0.84, color: 'var(--nq-pkt-dns)', label: 'DHCP: need an IP' }]
            : [{ id: 'o', from: 'r', to: 'p', t: 0.08 + ease((t - 0.5) / 0.5) * 0.84, color: 'var(--nq-ok)', label: 'take 192.168.1.10' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: '2 · google.com નું IP શું?', en: '2 · What is google.com’s IP?' },
      text: {
        beginner: {
          gu: 'તમે google.com લખ્યું, પણ નેટવર્ક નામ સમજતું નથી — એને નંબર જોઈએ. એટલે લેપટોપ DNS server ને પૂછે છે: "google.com નું IP શું?" અને જવાબ મળે છે: 142.250.x.x. આ એક પગલું ન થાય તો કશું આગળ વધે નહીં.',
          en: 'You typed google.com, but the network does not understand names — it needs a number. So the laptop asks a DNS server: "what is google.com’s IP?" and gets back 142.250.x.x. Without this step nothing moves.',
        },
        exam: {
          gu: 'DNS query UDP 53 પર જાય છે. Local cache → recursive resolver → root → TLD → authoritative. જવાબ TTL સુધી cache થાય છે.',
          en: 'The DNS query goes over UDP 53: local cache → recursive resolver → root → TLD → authoritative. The answer is cached for its TTL.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p', x: 200, y: 240, type: 'laptop' as const, label: 'Your laptop', accent: BEG },
          { id: 'd', x: 630, y: 240, type: 'server' as const, label: 'DNS server', accent: 'var(--nq-pkt-dns)', pulse: t > 0.45 },
        ],
        links: [{ id: 'l', from: 'p', to: 'd', state: 'up', flowing: true }],
        packets:
          t < 0.5
            ? [{ id: 'q', from: 'p', to: 'd', t: 0.08 + ease(t / 0.5) * 0.84, color: 'var(--nq-pkt-dns)', label: 'google.com = ?' }]
            : [{ id: 'a', from: 'd', to: 'p', t: 0.08 + ease((t - 0.5) / 0.5) * 0.84, color: 'var(--nq-ok)', label: '142.250.183.78' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: '3 · ગેટ સુધીનો રસ્તો શોધો', en: '3 · Find the way to the gate' },
      text: {
        beginner: {
          gu: 'IP મળી ગયું, પણ એ બીજા નેટવર્કમાં છે — એટલે packet router ને આપવું પડશે. પણ router નું MAC શું? લેપટોપ LAN પર બૂમ પાડે છે: "192.168.1.1 કોણ છે?" Router જવાબ આપે છે. આ ARP છે.',
          en: 'We have the IP, but it is on another network — so the packet must go to the router. What is the router’s MAC, though? The laptop shouts across the LAN: "who has 192.168.1.1?" The router answers. That is ARP.',
        },
        exam: {
          gu: 'ARP request broadcast (ff:ff:ff:ff:ff:ff) જાય છે, ARP reply unicast આવે છે. પરિણામ ARP cache માં લખાય છે.',
          en: 'The ARP request is broadcast to ff:ff:ff:ff:ff:ff and the ARP reply comes back unicast. The result is stored in the ARP cache.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p', x: 200, y: 240, type: 'laptop' as const, label: 'Your laptop', accent: BEG },
          { id: 'r', x: 630, y: 240, type: 'router' as const, label: 'Router', sub: '192.168.1.1', accent: CCNP, pulse: t > 0.45 },
        ],
        links: [{ id: 'l', from: 'p', to: 'r', state: 'up', flowing: true }],
        packets:
          t < 0.5
            ? [{ id: 'q', from: 'p', to: 'r', t: 0.08 + ease(t / 0.5) * 0.84, color: 'var(--nq-pkt-dns)', label: 'who has .1?' }]
            : [{ id: 'a', from: 'r', to: 'p', t: 0.08 + ease((t - 0.5) / 0.5) * 0.84, color: 'var(--nq-pkt-ctrl)', label: 'that is my MAC' }],
      }),
      aside: (t) => ({
        title: { gu: 'ARP cache', en: 'ARP cache' },
        head: ['IP', 'MAC'],
        rows: t > 0.5 ? [['192.168.1.1', '00c1.bbbb.0001']] : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: '4 · TCP જોડાણ બને', en: '4 · TCP opens the connection' },
      text: {
        beginner: {
          gu: 'હવે લેપટોપ Google ના server સાથે જોડાણ બનાવે છે — ત્રણ સંદેશની ઔપચારિકતા: SYN, SYN-ACK, ACK. આ પછી જ અસલ માગણી મોકલાય છે. Website માટે TCP જ વપરાય, કારણ કે પાનાનો એકેય અક્ષર ખોવાવો ન જોઈએ.',
          en: 'Now the laptop opens a connection to Google’s server — the three-message ceremony: SYN, SYN-ACK, ACK. Only after that is the real request sent. Websites use TCP because not a single character of the page may go missing.',
        },
        exam: {
          gu: 'Destination port 443 (HTTPS). Handshake પછી TLS negotiation થાય છે, પછી જ encrypted HTTP request જાય છે.',
          en: 'The destination port is 443 (HTTPS). After the handshake comes the TLS negotiation, and only then the encrypted HTTP request.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p', x: 170, y: 240, type: 'laptop' as const, label: 'Laptop', accent: BEG },
          { id: 'r', x: 420, y: 240, type: 'router' as const, label: 'Router', accent: CCNP },
          { id: 's', x: 690, y: 240, type: 'server' as const, label: 'Google', sub: ':443', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'p', to: 'r', state: 'up', flowing: true },
          { id: 'b', from: 'r', to: 's', state: 'up', flowing: true },
        ],
        packets:
          t < 0.34
            ? [{ id: 'syn', from: 'r', to: 's', t: 0.08 + ease(t / 0.34) * 0.84, color: 'var(--nq-pkt-tcp)', label: 'SYN' }]
            : t < 0.67
              ? [{ id: 'sa', from: 's', to: 'r', t: 0.08 + ease((t - 0.34) / 0.33) * 0.84, color: 'var(--nq-pkt-ctrl)', label: 'SYN-ACK' }]
              : [{ id: 'ack', from: 'r', to: 's', t: 0.08 + ease((t - 0.67) / 0.33) * 0.84, color: 'var(--nq-ok)', label: 'ACK' }],
      }),
    },
    {
      ms: 3000,
      label: { gu: '5 · પાનું માગો', en: '5 · Ask for the page' },
      text: {
        beginner: {
          gu: 'જોડાણ તૈયાર. હવે browser કહે છે: "મને મુખ્ય પાનું આપો" — GET /. આ માગણી router, ISP અને દુનિયાભરના ઘણા routers પાર કરીને Google સુધી પહોંચે છે. દરેક router પોતાના routing table માં જોઈને આગળનો રસ્તો નક્કી કરે છે.',
          en: 'The connection is ready. Now the browser says: "give me the main page" — GET /. That request crosses your router, your ISP and many routers worldwide to reach Google. Each router consults its routing table and picks the next hop.',
        },
        exam: {
          gu: 'દરેક hop પર L2 header rewrite થાય, TTL ઘટે, અને longest-prefix match થી next hop નક્કી થાય. Source/destination IP અકબંધ રહે (NAT સિવાય).',
          en: 'At each hop the L2 header is rewritten, the TTL decrements, and longest-prefix match picks the next hop. The source and destination IPs stay intact (except at NAT).',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p', x: 120, y: 250, type: 'laptop' as const, label: 'Laptop', accent: BEG },
          { id: 'r', x: 300, y: 250, type: 'router' as const, label: 'Router', accent: CCNP },
          { id: 'i', x: 480, y: 200, type: 'cloud' as const, label: 'ISP · internet', accent: CCNA },
          { id: 's', x: 710, y: 250, type: 'server' as const, label: 'Google', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'p', to: 'r', state: 'up', flowing: true },
          { id: 'b', from: 'r', to: 'i', state: 'up', flowing: t > 0.3 },
          { id: 'c', from: 'i', to: 's', state: 'up', flowing: t > 0.6 },
        ],
        packets:
          t < 0.3
            ? [{ id: 'g', from: 'p', to: 'r', t: ease(t / 0.3), color: 'var(--nq-pkt-data)', label: 'GET /' }]
            : t < 0.6
              ? [{ id: 'g', from: 'r', to: 'i', t: ease((t - 0.3) / 0.3), color: 'var(--nq-pkt-data)', label: 'GET /' }]
              : [{ id: 'g', from: 'i', to: 's', t: ease((t - 0.6) / 0.4), color: 'var(--nq-pkt-data)', label: 'GET /' }],
      }),
    },
    {
      ms: 3200,
      label: { gu: '6 · પાનું પાછું આવે', en: '6 · The page comes back' },
      text: {
        beginner: {
          gu: 'Google પાનું શોધે છે અને હજારો નાના ટુકડામાં કાપીને પાછું મોકલે છે. એ જ રસ્તે ઊલટા ફરીને તમારા લેપટોપ સુધી આવે છે, ત્યાં ફરી જોડાઈને આખું પાનું બને — અને screen પર દેખાય. આ બધું અડધી સેકન્ડમાં.',
          en: 'Google finds the page, chops it into thousands of pieces and sends it back. They retrace the same road to your laptop, are reassembled into the whole page — and it appears on screen. All of it in half a second.',
        },
        exam: {
          gu: 'Return path માં source/destination ઊલટાં થાય છે. NAT router translation table માં જોઈને inside host શોધે છે, અને TCP port થી સાચો browser process મળે છે.',
          en: 'On the return path source and destination are swapped. The NAT router looks up its translation table to find the inside host, and the TCP port identifies the right browser process.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p', x: 120, y: 250, type: 'laptop' as const, label: 'Laptop', sub: t > 0.8 ? 'page loaded ✓' : undefined, accent: BEG, pulse: t > 0.8 },
          { id: 'r', x: 300, y: 250, type: 'router' as const, label: 'Router', accent: CCNP },
          { id: 'i', x: 480, y: 200, type: 'cloud' as const, label: 'internet', accent: CCNA },
          { id: 's', x: 710, y: 250, type: 'server' as const, label: 'Google', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'p', to: 'r', state: 'up', flowing: true },
          { id: 'b', from: 'r', to: 'i', state: 'up', flowing: true },
          { id: 'c', from: 'i', to: 's', state: 'up', flowing: true },
        ],
        packets:
          t < 0.33
            ? [{ id: 'h', from: 's', to: 'i', t: ease(t / 0.33), color: 'var(--nq-ok)', label: '200 OK' }]
            : t < 0.66
              ? [{ id: 'h', from: 'i', to: 'r', t: ease((t - 0.33) / 0.33), color: 'var(--nq-ok)', label: 'page data' }]
              : [{ id: 'h', from: 'r', to: 'p', t: ease((t - 0.66) / 0.34), color: 'var(--nq-ok)', label: 'page data' }],
      }),
      aside: (t) => ({
        title: { gu: 'આખો ક્રમ', en: 'The whole sequence' },
        head: ['#', 'step', 'done'],
        rows: [
          ['1', 'DHCP — get an IP', '✓'],
          ['2', 'DNS — name to IP', '✓'],
          ['3', 'ARP — find the gateway', '✓'],
          ['4', 'TCP — handshake', '✓'],
          ['5', 'HTTP — ask for page', '✓'],
          ['6', 'page rendered', t > 0.8 ? '✓' : '…'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Enter દબાવવાથી પાનું દેખાવા સુધી: DHCP (મારું IP) → DNS (એનું IP) → ARP (ગેટનો રસ્તો) → TCP (જોડાણ) → HTTP (માગણી) → ટુકડા પાછા આવીને પાનું. આ આખો કોર્સ એક જ પ્રવાસમાં.',
    en: 'From Enter to page: DHCP (my IP) → DNS (its IP) → ARP (the way to the gate) → TCP (connection) → HTTP (request) → pieces return and the page appears. The whole course in one journey.',
  },
  check: {
    q: {
      gu: 'google.com લખ્યા પછી સૌથી પહેલું કયું પગલું થાય (તમારું IP મળી ગયા પછી)?',
      en: 'After typing google.com, which step comes first (once you already have an IP)?',
    },
    options: [
      { gu: 'DNS — નામનું IP શોધવું', en: 'DNS — resolve the name to an IP' },
      { gu: 'HTTP — પાનું માગવું', en: 'HTTP — ask for the page' },
      { gu: 'TCP handshake', en: 'The TCP handshake' },
    ],
    answer: 0,
    explain: {
      gu: 'IP ખબર ન હોય ત્યાં સુધી TCP જોડાણ કોની સાથે કરવું એ જ નક્કી ન થાય. એટલે DNS સૌથી પહેલું આવે.',
      en: 'Until you know the IP there is nothing to open a TCP connection to. DNS has to come first.',
    },
  },
}

/* ------------------------------------------------------------------ b4l2 */

export const b4l2: LessonSpec = {
  why: {
    gu: 'તમે ક્યારેય IP સરનામું યાદ રાખીને website ખોલી નથી. DNS એ કામ ચૂપચાપ કરે છે — અને જ્યારે એ બગડે ત્યારે "internet બંધ છે" એવું લાગે છે, જોકે internet તો બરાબર ચાલુ હોય છે.',
    en: 'You have never opened a website by remembering its IP. DNS does that quietly — and when it breaks it feels like "the internet is down", even though the internet is perfectly fine.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'નામ સહેલું, નંબર અઘરો', en: 'Names are easy, numbers are not' },
      text: {
        beginner: {
          gu: 'કમ્પ્યુટર ફક્ત નંબર સમજે છે: 142.250.183.78. માણસ નામ યાદ રાખે છે: google.com. DNS એ બંને વચ્ચેનો અનુવાદક છે — ઈન્ટરનેટની ફોનબુક, જે નામ લઈને નંબર પાછો આપે છે.',
          en: 'Computers only understand numbers: 142.250.183.78. People remember names: google.com. DNS is the translator between the two — the internet’s phone book, taking a name and handing back a number.',
        },
        exam: {
          gu: 'DNS hierarchical distributed database છે. Resource records: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (name server).',
          en: 'DNS is a hierarchical distributed database. Record types: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (name server).',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'p', x: 250, y: 230, type: 'laptop' as const, label: 'You', sub: 'google.com', accent: BEG },
          { id: 'd', x: 620, y: 230, type: 'server' as const, label: 'DNS', sub: '142.250.183.78', accent: 'var(--nq-pkt-dns)', pulse: true },
        ],
        links: [{ id: 'l', from: 'p', to: 'd', state: 'up' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'પહેલાં પોતાની યાદશક્તિ તપાસો', en: 'Check your own memory first' },
      text: {
        beginner: {
          gu: 'DNS પૂછવા જતાં પહેલાં કમ્પ્યુટર પોતાની નોંધ તપાસે છે: "આ નામ મેં હમણાં જ પૂછ્યું હતું?" જો હા, તો જવાબ ત્યાં જ મળી જાય અને કોઈને પૂછવું જ ન પડે. એટલે જ બીજી વાર website ઝડપથી ખૂલે છે.',
          en: 'Before asking anyone, the computer checks its own notes: "did I look this up recently?" If so the answer is right there and nobody needs asking. That is why a site opens faster the second time.',
        },
        exam: {
          gu: 'Resolution order: browser cache → OS cache → hosts file → configured resolver. દરેક cached entry TTL પૂરો થતાં જ expire થાય.',
          en: 'Resolution order: browser cache → OS cache → hosts file → the configured resolver. Each cached entry expires when its TTL runs out.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p', x: 430, y: 230, type: 'laptop' as const, label: 'Your laptop', sub: t > 0.5 ? 'found in cache ✓' : 'checking cache…', accent: BEG, pulse: t > 0.5 },
        ],
      }),
      aside: (t) => ({
        title: { gu: 'DNS cache', en: 'DNS cache' },
        head: ['name', 'IP', 'TTL'],
        rows:
          t > 0.5
            ? [
                ['google.com', '142.250.183.78', '243 s'],
                ['github.com', '140.82.112.3', '58 s'],
              ]
            : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'ન મળે તો પૂછવા નીકળો', en: 'If not, go and ask' },
      text: {
        beginner: {
          gu: 'યાદ ન હોય તો લેપટોપ DNS server ને પૂછે છે — સામાન્ય રીતે તમારા ISP નું કે Google નું 8.8.8.8. એ પણ ન જાણતું હોય તો એ ઉપરના servers ને પૂછે છે, એક પછી એક, જ્યાં સુધી જવાબ ન મળે.',
          en: 'If it is not remembered the laptop asks a DNS server — usually your ISP’s, or Google’s 8.8.8.8. If that one does not know either it asks the servers above it, one after another, until an answer comes.',
        },
        exam: {
          gu: 'Recursive resolver root → TLD (.com) → authoritative name server સુધી iterative queries કરે છે અને અંતે client ને એક જ final answer આપે છે.',
          en: 'The recursive resolver walks root → TLD (.com) → authoritative name server with iterative queries and returns a single final answer to the client.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p', x: 110, y: 250, type: 'laptop' as const, label: 'You', accent: BEG },
          { id: 'r', x: 300, y: 250, type: 'server' as const, label: 'Resolver', sub: '8.8.8.8', accent: 'var(--nq-pkt-dns)' },
          { id: 'tld', x: 500, y: 160, type: 'server' as const, label: '.com', accent: CCNA },
          { id: 'auth', x: 700, y: 280, type: 'server' as const, label: 'google.com', sub: 'authoritative', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'p', to: 'r', state: 'up', flowing: true },
          { id: 'b', from: 'r', to: 'tld', state: 'up', flowing: t > 0.3 },
          { id: 'c', from: 'r', to: 'auth', state: 'up', flowing: t > 0.6 },
        ],
        packets:
          t < 0.3
            ? [{ id: 'q', from: 'p', to: 'r', t: ease(t / 0.3), color: 'var(--nq-pkt-dns)', label: 'google.com?' }]
            : t < 0.6
              ? [{ id: 'q', from: 'r', to: 'tld', t: ease((t - 0.3) / 0.3), color: 'var(--nq-pkt-dns)', label: 'who knows .com?' }]
              : [{ id: 'q', from: 'r', to: 'auth', t: ease((t - 0.6) / 0.4), color: 'var(--nq-pkt-dns)', label: 'google.com?' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'જવાબ મળે અને યાદ રહે', en: 'The answer arrives and is remembered' },
      text: {
        beginner: {
          gu: 'જવાબ મળે એટલે લેપટોપ એને થોડો સમય યાદ રાખી લે છે (TTL). એટલે એ જ website ફરી ખોલો તો આ આખી દોડધામ કરવી પડતી નથી — તરત ખૂલે છે.',
          en: 'Once the answer comes back the laptop remembers it for a while (the TTL). So reopening the same site skips this entire errand — it just loads.',
        },
        exam: {
          gu: 'TTL record owner નક્કી કરે છે. ટૂંકો TTL ઝડપી failover આપે પણ query load વધારે; લાંબો TTL ઊલટું.',
          en: 'The record owner sets the TTL. A short TTL gives faster failover but more query load; a long TTL does the opposite.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p', x: 230, y: 230, type: 'laptop' as const, label: 'You', sub: t > 0.5 ? '142.250.183.78 ✓' : undefined, accent: BEG, pulse: t > 0.5 },
          { id: 'r', x: 630, y: 230, type: 'server' as const, label: 'Resolver', accent: 'var(--nq-pkt-dns)' },
        ],
        links: [{ id: 'l', from: 'p', to: 'r', state: 'up', flowing: true }],
        packets: [{ id: 'a', from: 'r', to: 'p', t: 0.08 + ease(t) * 0.84, color: 'var(--nq-ok)', label: '142.250.183.78' }],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'DNS બગડે ત્યારે', en: 'When DNS breaks' },
      text: {
        beginner: {
          gu: 'DNS બંધ પડે ત્યારે વિચિત્ર લક્ષણ દેખાય છે: ping 8.8.8.8 કામ કરે પણ કોઈ website ન ખૂલે. એનો અર્થ નેટવર્ક બરાબર છે, ફક્ત નામનો અનુવાદ થતો નથી. Troubleshooting માં આ સૌથી ઉપયોગી સંકેત છે.',
          en: 'When DNS fails the symptom is distinctive: ping 8.8.8.8 works but no website opens. That means the network is fine and only name translation is failing. It is one of the most useful clues in troubleshooting.',
        },
        exam: {
          gu: 'IP થી કામ ચાલે પણ name થી નહીં = DNS issue. `nslookup` અથવા `dig` થી resolver ને સીધું ચકાસો.',
          en: 'Working by IP but not by name means a DNS issue. Test the resolver directly with `nslookup` or `dig`.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p', x: 180, y: 240, type: 'laptop' as const, label: 'You', accent: BEG },
          { id: 'd', x: 430, y: 150, type: 'server' as const, label: 'DNS', sub: 'down', accent: 'var(--nq-err)' },
          { id: 's', x: 690, y: 300, type: 'server' as const, label: '8.8.8.8', sub: 'reachable', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'p', to: 'd', state: 'down' },
          { id: 'b', from: 'p', to: 's', state: 'up', flowing: true },
        ],
        packets:
          t < 0.5
            ? [{ id: 'x', from: 'p', to: 'd', t: 0.08 + ease(t / 0.5) * 0.4, color: 'var(--nq-err)', label: 'name ✕' }]
            : [{ id: 'o', from: 'p', to: 's', t: 0.08 + ease((t - 0.5) / 0.5) * 0.84, color: 'var(--nq-ok)', label: 'IP ✓' }],
      }),
    },
  ],
  takeaway: {
    gu: 'DNS નામને IP માં બદલે છે. પહેલાં પોતાની cache, પછી resolver, પછી ઉપરના servers. જવાબ TTL સુધી યાદ રહે. IP થી ping ચાલે પણ નામથી નહીં — તો વાંક DNS નો છે, નેટવર્કનો નહીં.',
    en: 'DNS turns a name into an IP. First its own cache, then the resolver, then the servers above. The answer is kept for its TTL. If ping by IP works but by name does not, blame DNS, not the network.',
  },
  check: {
    q: {
      gu: 'ping 8.8.8.8 ચાલે છે પણ કોઈ website ખૂલતી નથી. શું ખરાબી છે?',
      en: 'ping 8.8.8.8 works but no website opens. What is broken?',
    },
    options: [
      { gu: 'DNS — નામનો અનુવાદ થતો નથી', en: 'DNS — name resolution is failing' },
      { gu: 'વાયર કપાઈ ગયો છે', en: 'The cable is cut' },
      { gu: 'IP address ખોટું છે', en: 'The IP address is wrong' },
    ],
    answer: 0,
    explain: {
      gu: 'Ping પહોંચે છે એનો અર્થ રસ્તો અને સરનામું બંને બરાબર છે. ફક્ત નામનો IP મળતો નથી — એ DNS નું કામ છે.',
      en: 'A successful ping proves the path and the addressing are fine. Only the name lookup is failing, and that is DNS.',
    },
  },
}

/* ------------------------------------------------------------------ b4l3 */

export const b4l3: LessonSpec = {
  why: {
    gu: 'તમે કોઈ નવા WiFi સાથે જોડાઓ અને તરત internet ચાલુ — કોઈએ IP સરનામું લખ્યું નહીં, mask નહીં, gateway નહીં. એ બધું DHCP એ ચાર સંદેશમાં કરી આપ્યું, બે સેકન્ડની અંદર.',
    en: 'You join a new WiFi and the internet just works — nobody typed an IP, a mask or a gateway. DHCP did all of it in four messages, inside two seconds.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'હાથે લખવાની તકલીફ', en: 'The trouble with typing it by hand' },
      text: {
        beginner: {
          gu: 'દરેક મશીનમાં જાતે IP લખવું પડે તો? 200 લોકોની ઓફિસમાં 200 વાર. અને બે જણને ભૂલથી એક જ IP આપી દો તો બંનેનું નેટવર્ક બગડે. એટલે આ કામ એક મશીનને સોંપી દેવાય છે.',
          en: 'What if you had to type an IP into every machine? Two hundred times in a 200-person office. And if two people accidentally get the same IP, both break. So the job is handed to a machine instead.',
        },
        exam: {
          gu: 'Static addressing servers અને network devices માટે જ રાખવું; end hosts માટે DHCP વાપરવું. Duplicate IP એ સૌથી સામાન્ય manual-config ભૂલ છે.',
          en: 'Keep static addressing for servers and network devices; use DHCP for end hosts. A duplicate IP is the most common manual-configuration mistake.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 250, y: 230, type: 'pc' as const, label: 'PC A', sub: '192.168.1.50', accent: 'var(--nq-err)', pulse: true },
          { id: 'b', x: 620, y: 230, type: 'pc' as const, label: 'PC B', sub: '192.168.1.50', accent: 'var(--nq-err)', pulse: true },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'down', label: 'duplicate IP!' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'D — બૂમ પાડો', en: 'D — shout out' },
      text: {
        beginner: {
          gu: 'નવું મશીન ચાલુ થાય ત્યારે એની પાસે કોઈ સરનામું હોતું નથી, એટલે એ કોને પૂછે એ પણ ખબર નથી. તો એ આખા નેટવર્કમાં બૂમ પાડે છે: "કોઈ DHCP server છે? મને સરનામું જોઈએ!" આ Discover છે.',
          en: 'A new machine has no address, so it does not even know who to ask. It shouts to the whole network: "is there a DHCP server? I need an address!" That is Discover.',
        },
        exam: {
          gu: 'DHCPDISCOVER broadcast છે: source 0.0.0.0, destination 255.255.255.255, UDP 68 → 67.',
          en: 'DHCPDISCOVER is a broadcast: source 0.0.0.0, destination 255.255.255.255, UDP 68 → 67.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'n', x: 200, y: 240, type: 'pc' as const, label: 'New PC', sub: '0.0.0.0', accent: BEG, pulse: true },
          { id: 'sw', x: 430, y: 240, type: 'switch' as const, label: 'Switch', accent: CCNA },
          { id: 'd', x: 670, y: 240, type: 'router' as const, label: 'DHCP server', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'n', to: 'sw', state: 'up', flowing: true },
          { id: 'b', from: 'sw', to: 'd', state: 'up', flowing: t > 0.4 },
        ],
        packets:
          t < 0.5
            ? [{ id: 'q', from: 'n', to: 'sw', t: 0.1 + ease(t / 0.5) * 0.8, color: 'var(--nq-pkt-dns)', label: 'DISCOVER' }]
            : [{ id: 'q', from: 'sw', to: 'd', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-pkt-dns)', label: 'DISCOVER' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'O — server ઓફર કરે', en: 'O — the server offers' },
      text: {
        beginner: {
          gu: 'DHCP server બૂમ સાંભળે છે, પોતાની યાદીમાંથી એક ખાલી સરનામું શોધે છે અને કહે છે: "આ લો — 192.168.1.50, સાથે mask અને gateway પણ." આ Offer છે. એ હજી આપ્યું નથી, ફક્ત ઓફર કર્યું છે.',
          en: 'The DHCP server hears the shout, finds a free address in its list and says: "here, take 192.168.1.50, with a mask and a gateway." That is the Offer. Nothing is assigned yet — it is only offered.',
        },
        exam: {
          gu: 'DHCPOFFER માં yiaddr, subnet mask, default gateway, DNS servers અને lease time હોય છે. Server એ address ને થોડી વાર માટે reserve રાખે છે.',
          en: 'The DHCPOFFER carries yiaddr, the subnet mask, default gateway, DNS servers and the lease time. The server reserves that address briefly.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'n', x: 200, y: 240, type: 'pc' as const, label: 'New PC', accent: BEG },
          { id: 'd', x: 670, y: 240, type: 'router' as const, label: 'DHCP server', accent: CCNP, pulse: t < 0.3 },
        ],
        links: [{ id: 'l', from: 'n', to: 'd', state: 'up', flowing: true }],
        packets: [{ id: 'o', from: 'd', to: 'n', t: 0.08 + ease(t) * 0.84, color: 'var(--nq-pkt-ctrl)', label: 'OFFER 192.168.1.50' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'R — માગી લો', en: 'R — ask for it' },
      text: {
        beginner: {
          gu: 'મશીન ઓફર સ્વીકારે છે અને ઔપચારિક રીતે માગે છે: "હા, મને એ જ સરનામું આપો." આ પણ broadcast માં જાય છે, જેથી બીજા DHCP servers પણ જાણે કે આ ક્લાયન્ટે બીજાની ઓફર લઈ લીધી.',
          en: 'The machine accepts and formally requests: "yes, give me that one." This also goes out as a broadcast, so any other DHCP servers learn that this client took someone else’s offer.',
        },
        exam: {
          gu: 'DHCPREQUEST broadcast છે અને એમાં chosen server નું identifier હોય છે, જેથી બીજા servers પોતાની offers પાછી ખેંચી લે.',
          en: 'DHCPREQUEST is broadcast and carries the chosen server’s identifier, so the other servers withdraw their offers.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'n', x: 200, y: 240, type: 'pc' as const, label: 'New PC', accent: BEG, pulse: t < 0.3 },
          { id: 'd', x: 670, y: 240, type: 'router' as const, label: 'DHCP server', accent: CCNP },
        ],
        links: [{ id: 'l', from: 'n', to: 'd', state: 'up', flowing: true }],
        packets: [{ id: 'r', from: 'n', to: 'd', t: 0.08 + ease(t) * 0.84, color: 'var(--nq-pkt-tcp)', label: 'REQUEST .50' }],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'A — મંજૂર, અને વપરાશ શરૂ', en: 'A — acknowledged, and off you go' },
      text: {
        beginner: {
          gu: 'Server છેલ્લે કહે છે "મંજૂર" અને સરનામું તમારું થઈ ગયું. સાથે એક મુદત પણ આવે છે — lease. મુદત પૂરી થાય એ પહેલાં મશીન આપોઆપ renew કરી લે છે, એટલે તમને ખબર પણ પડતી નથી.',
          en: 'Finally the server says "acknowledged" and the address is yours. It comes with a deadline — the lease. The machine renews automatically before it expires, so you never notice.',
        },
        exam: {
          gu: 'DHCPACK પછી client ARP થી duplicate check કરે છે. Lease ના 50% (T1) પર renew અને 87.5% (T2) પર rebind કરે છે.',
          en: 'After the DHCPACK the client does a duplicate check with ARP. It renews at 50% of the lease (T1) and rebinds at 87.5% (T2).',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'n', x: 200, y: 240, type: 'pc' as const, label: 'New PC', sub: t > 0.5 ? '192.168.1.50 ✓' : '0.0.0.0', accent: BEG, pulse: t > 0.5 },
          { id: 'd', x: 670, y: 240, type: 'router' as const, label: 'DHCP server', accent: CCNP },
        ],
        links: [{ id: 'l', from: 'n', to: 'd', state: 'up', flowing: true }],
        packets: [{ id: 'a', from: 'd', to: 'n', t: 0.08 + ease(t) * 0.84, color: 'var(--nq-ok)', label: 'ACK · lease 24h' }],
      }),
      aside: (t) => ({
        title: { gu: 'મળેલી માહિતી', en: 'What you received' },
        head: ['setting', 'value'],
        rows:
          t > 0.5
            ? [
                ['IP address', '192.168.1.50'],
                ['subnet mask', '255.255.255.0'],
                ['gateway', '192.168.1.1'],
                ['DNS', '8.8.8.8'],
                ['lease', '24 hours'],
              ]
            : [],
      }),
    },
  ],
  takeaway: {
    gu: 'DHCP ચાર પગલાંમાં સરનામું આપે: Discover (બૂમ) → Offer (ઓફર) → Request (માગણી) → Acknowledge (મંજૂરી). સાથે mask, gateway અને DNS પણ મળે, અને એક મુદત — જે આપોઆપ renew થાય.',
    en: 'DHCP hands out an address in four steps: Discover → Offer → Request → Acknowledge. You also get the mask, gateway and DNS, plus a lease that renews itself.',
  },
  check: {
    q: {
      gu: 'DHCP નો પહેલો સંદેશ broadcast કેમ હોય છે?',
      en: 'Why is the first DHCP message a broadcast?',
    },
    options: [
      { gu: 'કારણ કે client ને હજી DHCP server નું સરનામું ખબર નથી', en: 'Because the client does not yet know the DHCP server’s address' },
      { gu: 'કારણ કે broadcast ઝડપી હોય છે', en: 'Because broadcasts are faster' },
      { gu: 'કારણ કે switch એ જ સમજે છે', en: 'Because that is all a switch understands' },
    ],
    answer: 0,
    explain: {
      gu: 'નવા મશીન પાસે ન તો પોતાનું સરનામું હોય છે ન તો server નું. એટલે એકમાત્ર રસ્તો બધાને સંભળાવવાનો છે — broadcast.',
      en: 'A new machine has neither its own address nor the server’s. The only option is to shout to everyone — a broadcast.',
    },
  },
}

/* ------------------------------------------------------------------ b4l4 */

export const b4l4: LessonSpec = {
  why: {
    gu: 'ઘરનું WiFi બોક્સ દેખાવમાં એક જ વસ્તુ લાગે છે, પણ અંદર ચાર અલગ ઉપકરણો બેઠેલાં છે. એ ચાર ઓળખી લો તો ઘરની કોઈ પણ internet સમસ્યા તમે જાતે ઉકેલી શકો.',
    en: 'The WiFi box at home looks like one device, but four separate devices live inside it. Recognise those four and you can fix almost any home internet problem yourself.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'એક બોક્સ, ચાર કામ', en: 'One box, four jobs' },
      text: {
        beginner: {
          gu: 'તમારા ઘરનું બોક્સ ખરેખર ચાર વસ્તુ એકમાં છે: એક switch (વાયર જોડવા), એક access point (WiFi માટે), એક router (બહાર જવા), અને એક DHCP server (સરનામાં વહેંચવા). કંપનીઓ ચારેયને એક ડબ્બામાં મૂકી દે છે.',
          en: 'Your home box is really four things in one: a switch (for the wired ports), an access point (for WiFi), a router (to get out) and a DHCP server (to hand out addresses). Manufacturers simply pack all four into one case.',
        },
        exam: {
          gu: 'SOHO device = integrated L2 switch + 802.11 AP + L3 router + DHCP/NAT/firewall services. Enterprise માં આ દરેક અલગ device હોય છે.',
          en: 'A SOHO device is an integrated L2 switch, 802.11 AP, L3 router and DHCP/NAT/firewall services. In an enterprise each of those is a separate box.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'b', x: 430, y: 230, type: 'router' as const, label: 'Home WiFi box', sub: 'four devices in one', accent: CCNP, pulse: true },
        ],
      }),
      aside: () => ({
        title: { gu: 'અંદર શું છે', en: 'What is inside' },
        head: ['part', 'job'],
        rows: [
          ['Switch', 'the 4 LAN ports'],
          ['Access point', 'the WiFi'],
          ['Router', 'the way out'],
          ['DHCP + NAT', 'addresses, sharing'],
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'Switch નો ભાગ', en: 'The switch part' },
      text: {
        beginner: {
          gu: 'પાછળના ચાર પીળા ખાનાં — એ switch છે. એમાં જોડાયેલા બધા ઉપકરણો એક જ નેટવર્કમાં છે અને સીધાં વાત કરી શકે છે. તમારું smart TV અને તમારો PC એકબીજાને આ switch થી જ જુએ છે.',
          en: 'The four yellow sockets on the back — that is the switch. Everything plugged into them is on one network and can talk directly. Your smart TV and your PC see each other through exactly this switch.',
        },
        exam: {
          gu: 'LAN ports એક જ VLAN/broadcast domain માં હોય છે અને WiFi SSID પણ સામાન્ય રીતે એ જ bridge માં આવે છે.',
          en: 'The LAN ports sit in one VLAN/broadcast domain, and the WiFi SSID is usually bridged into the same domain.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'b', x: 430, y: 290, type: 'switch' as const, label: 'switch part', accent: CCNA, pulse: true },
          { id: 'tv', x: 230, y: 150, type: 'pc' as const, label: 'Smart TV', accent: BEG },
          { id: 'pc', x: 630, y: 150, type: 'pc' as const, label: 'PC', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'b', to: 'tv', state: 'up', flowing: t > 0.4 },
          { id: 'c', from: 'b', to: 'pc', state: 'up', flowing: t > 0.4 },
        ],
        packets:
          t > 0.4
            ? [{ id: 'p', from: 'pc', to: 'tv', t: 0.1 + ease((t - 0.4) / 0.6) * 0.8, color: 'var(--nq-pkt-data)' }]
            : [],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'Access Point નો ભાગ', en: 'The access point part' },
      text: {
        beginner: {
          gu: 'અંદરનો બીજો ભાગ radio છે — એ જ તમારું WiFi છે. એ વાયરવાળા નેટવર્કને હવામાં લંબાવે છે. એટલે તમારો ફોન (WiFi થી) અને તમારો PC (વાયરથી) એક જ નેટવર્કમાં જ ગણાય છે.',
          en: 'The second part inside is a radio — that is your WiFi. It extends the wired network into the air. Which is why your phone (on WiFi) and your PC (on cable) count as being on the same network.',
        },
        exam: {
          gu: 'AP wireless clients ને wired bridge સાથે જોડે છે. એક જ SSID એક જ VLAN માં map થાય છે, એટલે L2 adjacency જળવાય છે.',
          en: 'The AP bridges wireless clients onto the wired segment. One SSID maps to one VLAN, which preserves L2 adjacency.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ap', x: 430, y: 270, type: 'ap' as const, label: 'AP part', sub: 'the WiFi', accent: CCNP, pulse: true },
          { id: 'ph', x: 230, y: 140, type: 'laptop' as const, label: 'Phone', accent: BEG },
          { id: 'lt', x: 630, y: 140, type: 'laptop' as const, label: 'Laptop', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'ap', to: 'ph', state: 'up', flowing: true },
          { id: 'b', from: 'ap', to: 'lt', state: 'up', flowing: true },
        ],
        packets: [
          { id: 'w', from: 'ap', to: 'ph', t: 0.1 + ease(t) * 0.8, color: 'var(--nq-pkt-ctrl)' },
          { id: 'x', from: 'ap', to: 'lt', t: 0.1 + ease(Math.max(0, t - 0.25) / 0.75) * 0.8, color: 'var(--nq-pkt-ctrl)' },
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'Router + NAT નો ભાગ', en: 'The router and NAT part' },
      text: {
        beginner: {
          gu: 'ત્રીજો ભાગ router છે — ઘરનું નેટવર્ક અને ISP વચ્ચેનો દરવાજો. એ જ NAT પણ કરે છે: ઘરના બધાં ઉપકરણોને એક જ જાહેર સરનામા પાછળ છુપાવી દે છે. અને DHCP server પણ એ જ ચલાવે છે.',
          en: 'The third part is the router — the door between your home network and the ISP. It also performs NAT, hiding every device at home behind one public address. And it runs the DHCP server too.',
        },
        exam: {
          gu: 'WAN interface ISP પાસેથી public IP મેળવે છે (DHCP/PPPoE). Inside interfaces પર NAT overload અને stateful inspection ચાલે છે.',
          en: 'The WAN interface gets a public IP from the ISP (DHCP or PPPoE). NAT overload and stateful inspection run against the inside interfaces.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'lan', x: 180, y: 240, type: 'switch' as const, label: 'home LAN', sub: '192.168.1.x', accent: CCNA },
          { id: 'r', x: 430, y: 240, type: 'router' as const, label: 'router part', sub: 'NAT + DHCP', accent: CCNP, pulse: t > 0.3 && t < 0.7 },
          { id: 'isp', x: 690, y: 240, type: 'cloud' as const, label: 'ISP', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'lan', to: 'r', state: 'up', flowing: true, label: 'private' },
          { id: 'b', from: 'r', to: 'isp', state: 'up', flowing: t > 0.45, label: 'public' },
        ],
        packets:
          t < 0.45
            ? [{ id: 'p', from: 'lan', to: 'r', t: 0.1 + ease(t / 0.45) * 0.8, color: 'var(--nq-pkt-data)', label: '192.168.1.10' }]
            : [{ id: 'p', from: 'r', to: 'isp', t: 0.1 + ease((t - 0.45) / 0.55) * 0.8, color: 'var(--nq-ok)', label: '49.36.12.7' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'બગડે ત્યારે ક્યાં જોવું', en: 'Where to look when it breaks' },
      text: {
        beginner: {
          gu: 'હવે troubleshooting સહેલું થઈ ગયું. WiFi દેખાય પણ internet નહીં → router/ISP નો ભાગ. એક જ ઉપકરણ ન ચાલે → એનું સરનામું કે port. બધું ધીમું → WiFi માં ખલેલ. સમસ્યાને ચારમાંથી એક ભાગ સુધી લઈ જાઓ, પછી ઉકેલ સરળ.',
          en: 'Troubleshooting is now easy. WiFi visible but no internet → the router/ISP part. Only one device failing → its address or its port. Everything slow → WiFi interference. Narrow the fault to one of the four parts and the fix follows.',
        },
        exam: {
          gu: 'Bottom-up approach: L1 (cable/signal) → L2 (association/switching) → L3 (addressing/gateway) → L4+ (NAT, DNS). દરેક પગલે એક જ variable બદલો.',
          en: 'Work bottom-up: L1 (cable/signal) → L2 (association/switching) → L3 (addressing/gateway) → L4+ (NAT, DNS). Change one variable at a time.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ph', x: 140, y: 240, type: 'laptop' as const, label: 'Phone', accent: BEG },
          { id: 'ap', x: 330, y: 240, type: 'ap' as const, label: 'AP', accent: CCNP },
          { id: 'r', x: 520, y: 240, type: 'router' as const, label: 'Router', accent: CCNP },
          { id: 'isp', x: 710, y: 240, type: 'cloud' as const, label: 'ISP', accent: t > 0.5 ? 'var(--nq-err)' : BEG },
        ],
        links: [
          { id: 'a', from: 'ph', to: 'ap', state: 'up', label: 'ok' },
          { id: 'b', from: 'ap', to: 'r', state: 'up', label: 'ok' },
          { id: 'c', from: 'r', to: 'isp', state: t > 0.5 ? 'down' : 'up', label: t > 0.5 ? 'fault here' : undefined },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'ઘરનું WiFi બોક્સ = switch + access point + router + DHCP/NAT, બધું એક ડબ્બામાં. સમસ્યા આવે ત્યારે "કયો ભાગ?" એ પૂછો — WiFi નો, સરનામાંનો, કે બહાર જવાનો — અને જવાબ મળી જશે.',
    en: 'A home WiFi box is a switch plus an access point plus a router plus DHCP/NAT, all in one case. When something breaks, ask "which part?" — the WiFi, the addressing, or the way out — and the answer appears.',
  },
  check: {
    q: {
      gu: 'WiFi જોડાય છે, signal પૂરો છે, પણ કોઈ website ખૂલતી નથી અને બીજાં ઉપકરણોમાં પણ એવું જ. ક્યાં જોશો?',
      en: 'WiFi connects with full signal, but no website opens — and it is the same on every device. Where do you look?',
    },
    options: [
      { gu: 'Router નો બહાર જવાનો ભાગ કે ISP', en: 'The router’s way out, or the ISP' },
      { gu: 'ફોનનું WiFi antenna', en: 'The phone’s WiFi antenna' },
      { gu: 'Switch ના પીળા ખાનાં', en: 'The yellow switch sockets' },
    ],
    answer: 0,
    explain: {
      gu: 'WiFi જોડાય છે એટલે access point અને સરનામાંનો ભાગ બરાબર છે. બધાં ઉપકરણોમાં સરખી સમસ્યા એટલે વાંક સહિયારા ભાગનો — router નું WAN કે ISP.',
      en: 'WiFi associating proves the access point and addressing are fine. The same fault on every device points at the shared part — the router’s WAN side or the ISP.',
    },
  },
}

/* ------------------------------------------------------------------ b4l5 */

export const b4l5: LessonSpec = {
  why: {
    gu: 'નેટવર્ક બનાવવું અડધું કામ છે; એને સુરક્ષિત રાખવું બાકીનું અડધું. Firewall એ પહેલી અને સૌથી અગત્યની દીવાલ છે — અને એનો વિચાર એટલો સાદો છે કે એક વાર સમજ્યા પછી ACL પણ સહેલા લાગશે.',
    en: 'Building a network is half the job; keeping it safe is the other half. The firewall is the first and most important wall — and its idea is so simple that ACLs will look easy once you have it.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'દરવાજા પરનો ચોકીદાર', en: 'The guard at the door' },
      text: {
        beginner: {
          gu: 'Firewall એ તમારા નેટવર્ક અને બહારની દુનિયા વચ્ચે બેઠેલો ચોકીદાર છે. દરેક packet એની પાસેથી પસાર થાય છે, અને એ દરેકને જોઈને એક જ નિર્ણય લે છે: જવા દેવું કે રોકવું.',
          en: 'A firewall is the guard sitting between your network and the outside world. Every packet passes it, and for each one it makes a single decision: allow or block.',
        },
        exam: {
          gu: 'Firewall traffic ને policy સામે evaluate કરે છે: source/destination IP, protocol, port અને connection state. Match થાય એ પહેલા rule પ્રમાણે action લેવાય.',
          en: 'A firewall evaluates traffic against a policy: source and destination IP, protocol, port and connection state. The first matching rule decides the action.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'lan', x: 180, y: 240, type: 'switch' as const, label: 'Your LAN', accent: CCNA },
          { id: 'fw', x: 430, y: 240, type: 'firewall' as const, label: 'Firewall', accent: 'var(--nq-err)', pulse: true },
          { id: 'cl', x: 680, y: 240, type: 'cloud' as const, label: 'Internet', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'lan', to: 'fw', state: 'up' },
          { id: 'b', from: 'fw', to: 'cl', state: 'up' },
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'અંદરથી બહાર — છૂટ', en: 'Inside to outside — allowed' },
      text: {
        beginner: {
          gu: 'તમે website ખોલો કે email જુઓ — એ બધું અંદરથી બહાર જાય છે, અને એને સામાન્ય રીતે છૂટ હોય છે. કારણ સાદું છે: શરૂઆત તમે કરી છે, એટલે એ તમને જોઈતું જ છે.',
          en: 'Opening a website or checking email goes from inside to outside, and that is normally allowed. The reason is simple: you started it, so it is something you wanted.',
        },
        exam: {
          gu: 'Outbound session માટે firewall state table માં entry બને છે: 5-tuple, sequence numbers અને timers સાથે.',
          en: 'An outbound session creates an entry in the firewall state table with the 5-tuple, sequence numbers and timers.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc', x: 180, y: 240, type: 'pc' as const, label: 'Your PC', accent: BEG },
          { id: 'fw', x: 430, y: 240, type: 'firewall' as const, label: 'Firewall', accent: 'var(--nq-err)' },
          { id: 'cl', x: 680, y: 240, type: 'cloud' as const, label: 'Internet', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'pc', to: 'fw', state: 'up', flowing: true },
          { id: 'b', from: 'fw', to: 'cl', state: 'up', flowing: t > 0.45 },
        ],
        packets:
          t < 0.5
            ? [{ id: 'o', from: 'pc', to: 'fw', t: 0.1 + ease(t / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'you started it' }]
            : [{ id: 'o', from: 'fw', to: 'cl', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'allowed ✓' }],
      }),
      aside: (t) => ({
        title: { gu: 'State table', en: 'State table' },
        head: ['inside', 'outside', 'state'],
        rows: t > 0.5 ? [['192.168.1.10:51234', '142.250.183.78:443', 'established']] : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'જવાબ પાછો — છૂટ', en: 'The reply back — allowed' },
      text: {
        beginner: {
          gu: 'Website નો જવાબ પાછો આવે ત્યારે firewall પોતાની નોંધ જુએ છે: "હા, આની માગણી અંદરથી જ ગઈ હતી." એટલે એ જવા દે છે. આ યાદ રાખવાની ખાસિયતને stateful કહે છે.',
          en: 'When the website’s reply arrives the firewall checks its notes: "yes, this was asked for from inside." So it lets it through. That memory is what makes a firewall stateful.',
        },
        exam: {
          gu: 'Return packet state table ની entry સાથે match થાય છે, એટલે કોઈ explicit inbound rule વગર પણ permit થાય છે. Entry timeout પછી દૂર થાય છે.',
          en: 'The return packet matches the state table entry and is permitted without any explicit inbound rule. The entry is removed after its timeout.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc', x: 180, y: 240, type: 'pc' as const, label: 'Your PC', accent: BEG, pulse: t > 0.8 },
          { id: 'fw', x: 430, y: 240, type: 'firewall' as const, label: 'Firewall', sub: 'remembers', accent: 'var(--nq-err)' },
          { id: 'cl', x: 680, y: 240, type: 'cloud' as const, label: 'Internet', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'pc', to: 'fw', state: 'up', flowing: t > 0.45 },
          { id: 'b', from: 'fw', to: 'cl', state: 'up', flowing: true },
        ],
        packets:
          t < 0.5
            ? [{ id: 'r', from: 'cl', to: 'fw', t: 0.1 + ease(t / 0.5) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'the reply' }]
            : [{ id: 'r', from: 'fw', to: 'pc', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-ok)', label: 'matched ✓' }],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'બહારથી અંદર — ના', en: 'Outside to inside — denied' },
      text: {
        beginner: {
          gu: 'હવે કોઈ અજાણ્યું બહારથી સીધું અંદર આવવા માગે છે. Firewall પોતાની નોંધમાં જુએ છે — કોઈ એવી માગણી અંદરથી ગઈ જ નથી. એટલે એ ચૂપચાપ રોકી દે છે. આ જ તમારું મુખ્ય રક્ષણ છે.',
          en: 'Now something unknown from outside wants to come straight in. The firewall checks its notes — no such request ever went out from inside. So it drops it quietly. That is your main protection.',
        },
        exam: {
          gu: 'Unsolicited inbound traffic ને કોઈ state entry મળતી નથી અને default deny લાગુ પડે છે. ખાસ કરીને જાહેર service માટે explicit permit rule જોઈએ.',
          en: 'Unsolicited inbound traffic finds no state entry and hits the default deny. A public service needs an explicit permit rule instead.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc', x: 180, y: 240, type: 'pc' as const, label: 'Your PC', accent: BEG },
          { id: 'fw', x: 430, y: 240, type: 'firewall' as const, label: 'Firewall', accent: 'var(--nq-err)', pulse: t > 0.5 },
          { id: 'cl', x: 680, y: 240, type: 'cloud' as const, label: 'Attacker', accent: 'var(--nq-err)' },
        ],
        links: [
          { id: 'a', from: 'pc', to: 'fw', state: 'up' },
          { id: 'b', from: 'fw', to: 'cl', state: 'up', flowing: true },
        ],
        packets: [
          { id: 'x', from: 'cl', to: 'fw', t: 0.1 + ease(t) * 0.72, color: 'var(--nq-err)', label: 'no match · dropped ✕' },
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'નિયમો લખવા', en: 'Writing the rules' },
      text: {
        beginner: {
          gu: 'ક્યારેક બહારથી અંદર આવવા દેવું હોય — જેમ કે તમારા ઓફિસના web server સુધી. તો એના માટે ખાસ નિયમ લખાય: "ફક્ત 443 પર, ફક્ત આ એક server સુધી, બાકી બધું બંધ." નિયમો ઉપરથી નીચે વંચાય અને પહેલો મેળ ખાતો નિયમ જીતે.',
          en: 'Sometimes you do want inbound traffic — to your office web server, say. Then you write a specific rule: "only on 443, only to this one server, everything else denied." Rules are read top to bottom and the first match wins.',
        },
        exam: {
          gu: 'ACL માં order અગત્યનો છે: પહેલો match લાગુ પડે અને અંતે implicit deny any હોય છે. Specific rules પહેલાં, broad rules પછી.',
          en: 'In an ACL order matters: the first match applies and an implicit deny any sits at the end. Put specific rules before broad ones.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'cl', x: 170, y: 240, type: 'cloud' as const, label: 'Internet', accent: BEG },
          { id: 'fw', x: 430, y: 240, type: 'firewall' as const, label: 'Firewall', sub: 'permit 443 only', accent: 'var(--nq-err)' },
          { id: 'web', x: 690, y: 160, type: 'server' as const, label: 'Web server', sub: ':443', accent: CCNA },
          { id: 'db', x: 690, y: 330, type: 'server' as const, label: 'Database', sub: 'private', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'cl', to: 'fw', state: 'up', flowing: true },
          { id: 'b', from: 'fw', to: 'web', state: 'up', flowing: t < 0.5 },
          { id: 'c', from: 'fw', to: 'db', state: 'down' },
        ],
        packets:
          t < 0.5
            ? [{ id: 'ok', from: 'cl', to: 'web', t: 0.08 + ease(t / 0.5) * 0.84, color: 'var(--nq-ok)', label: ':443 permit ✓' }]
            : [{ id: 'no', from: 'cl', to: 'fw', t: 0.08 + ease((t - 0.5) / 0.5) * 0.42, color: 'var(--nq-err)', label: 'db · deny ✕' }],
      }),
      aside: () => ({
        title: { gu: 'નિયમોનો ક્રમ', en: 'Rule order' },
        head: ['#', 'rule', 'action'],
        rows: [
          ['1', 'tcp any → web :443', 'permit'],
          ['2', 'any → database', 'deny'],
          ['3', 'any → any', 'deny (implicit)'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Firewall દરેક packet જોઈને જવા દેવું કે રોકવું એ નક્કી કરે. અંદરથી શરૂ થયેલી વાતનો જવાબ છૂટ પામે; બહારથી આવેલું અજાણ્યું રોકાય. ખાસ જોઈએ તો એક ચોક્કસ નિયમ લખો — અને યાદ રાખો કે અંતે બધું જ બંધ હોય છે.',
    en: 'A firewall inspects every packet and decides allow or block. Replies to conversations you started get through; unsolicited inbound traffic does not. If you need an exception, write one specific rule — and remember that everything else is denied at the end.',
  },
  check: {
    q: {
      gu: 'Firewall "stateful" છે એનો અર્થ શું?',
      en: 'What does it mean that a firewall is "stateful"?',
    },
    options: [
      { gu: 'એ યાદ રાખે છે કે કઈ વાત અંદરથી શરૂ થઈ હતી', en: 'It remembers which conversations started from inside' },
      { gu: 'એ દરેક packet ને અલગ અલગ જુએ છે, કશું યાદ રાખ્યા વગર', en: 'It looks at every packet separately, remembering nothing' },
      { gu: 'એ ફક્ત દિવસે ચાલુ રહે છે', en: 'It only runs during the day' },
    ],
    answer: 0,
    explain: {
      gu: 'Stateful એટલે firewall ચાલુ sessions ની નોંધ રાખે છે. એટલે એ જવાબને ઓળખીને જવા દે છે, પણ અજાણ્યા inbound ને રોકે છે.',
      en: 'Stateful means the firewall keeps a record of live sessions. That lets it recognise and admit replies while still blocking unsolicited inbound traffic.',
    },
  },
}
