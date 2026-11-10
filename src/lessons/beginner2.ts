import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'

/* ------------------------------------------------------------------ b2l1 */

export const b2l1: LessonSpec = {
  why: {
    gu: 'IP address એ નેટવર્કિંગનો સૌથી વધુ વપરાતો શબ્દ છે. 192.168.1.1 જેવા ચાર આંકડા જોઈને કશું ન સમજાય તો આગળનું કશું સમજાશે નહીં — અને સમજાઈ જાય તો subnetting, routing, બધું સહેલું થઈ જાય.',
    en: 'The IP address is the most-used idea in networking. If four numbers like 192.168.1.1 mean nothing to you, nothing later will make sense — and once they do, subnetting and routing become easy.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'ચાર ખાનાં, ચાર આંકડા', en: 'Four boxes, four numbers' },
      text: {
        beginner: {
          gu: 'IPv4 address ચાર આંકડાનું બનેલું હોય છે, વચ્ચે ટપકાં સાથે: 192.168.1.10. દરેક આંકડાને octet કહે છે. દરેક octet 0 થી 255 સુધીનો જ હોઈ શકે — 256 કે 300 ક્યારેય નહીં. એટલે 192.168.1.300 એ ખોટું સરનામું છે.',
          en: 'An IPv4 address is four numbers separated by dots: 192.168.1.10. Each number is an octet, and each octet can only be 0 to 255 — never 256 or 300. So 192.168.1.300 is simply not a valid address.',
        },
        exam: {
          gu: 'IPv4 address 32 bits નું છે, ચાર 8-bit octets માં dotted-decimal રીતે લખાય છે. દરેક octet ની range 0–255 (2^8 = 256 values) છે.',
          en: 'An IPv4 address is 32 bits, written dotted-decimal as four 8-bit octets. Each octet ranges 0–255 (2^8 = 256 values).',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 430, y: 230, type: 'pc' as const, label: 'PC', sub: '192.168.1.10', accent: BEG, pulse: true },
        ],
      }),
      aside: () => ({
        title: { gu: 'ચાર octets', en: 'The four octets' },
        head: ['octet', 'value', 'range'],
        rows: [
          ['1st', '192', '0 – 255'],
          ['2nd', '168', '0 – 255'],
          ['3rd', '1', '0 – 255'],
          ['4th', '10', '0 – 255'],
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'શેરી અને ઘર નંબર', en: 'The street and the house number' },
      text: {
        beginner: {
          gu: 'સરનામાંના બે ભાગ હોય છે — બરાબર જેમ "ગાંધી રોડ, ઘર નંબર 10". પહેલો ભાગ કહે છે કયું નેટવર્ક (કઈ શેરી), છેલ્લો ભાગ કહે છે કયું મશીન (કયું ઘર). 192.168.1 એ શેરી છે, .10 એ ઘર.',
          en: 'An address has two parts — exactly like "Gandhi Road, house 10". The first part says which network (which street), the last says which machine (which house). 192.168.1 is the street, .10 is the house.',
        },
        exam: {
          gu: 'Subnet mask નક્કી કરે છે કે કેટલા bits network portion છે. /24 (255.255.255.0) એટલે પહેલા 24 bits network અને છેલ્લા 8 bits host.',
          en: 'The subnet mask decides how many bits are the network portion. /24 (255.255.255.0) means the first 24 bits are network and the last 8 are host.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'PC A', sub: '192.168.1.10', accent: BEG, pulse: t > 0.4 },
          { id: 'b', x: 640, y: 230, type: 'pc' as const, label: 'PC B', sub: '192.168.1.20', accent: BEG, pulse: t > 0.7 },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up', label: t > 0.5 ? 'same street · 192.168.1' : undefined }],
      }),
      aside: () => ({
        title: { gu: 'શેરી + ઘર', en: 'Street + house' },
        head: ['address', 'network', 'host'],
        rows: [
          ['192.168.1.10', '192.168.1', '.10'],
          ['192.168.1.20', '192.168.1', '.20'],
          ['10.0.5.3', '10.0.5', '.3'],
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'એક જ શેરી = સીધી વાત', en: 'Same street = direct talk' },
      text: {
        beginner: {
          gu: 'બે મશીનનો network ભાગ સરખો હોય (બંને 192.168.1.x) તો એ એક જ શેરીમાં છે — સીધાં વાત કરી શકે, વચ્ચે કોઈની જરૂર નથી. પાડોશીને બૂમ પાડવા જેવું.',
          en: 'If two machines share the network part (both 192.168.1.x) they are on the same street — they can talk directly, no one in between. Like calling across to a neighbour.',
        },
        exam: {
          gu: 'Host destination IP ને પોતાના subnet mask સાથે AND કરીને જુએ છે કે destination local subnet માં છે કે નહીં. હોય તો ARP કરીને સીધું frame મોકલે.',
          en: 'A host ANDs the destination IP with its own subnet mask to see whether the destination is in the local subnet. If it is, it ARPs and frames it directly.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'PC A', sub: '192.168.1.10', accent: BEG },
          { id: 'b', x: 640, y: 230, type: 'pc' as const, label: 'PC B', sub: '192.168.1.20', accent: BEG },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up', flowing: true, label: 'direct' }],
        packets: [{ id: 'p', from: 'a', to: 'b', t: 0.08 + ease(t) * 0.84, color: 'var(--nq-ok)', label: 'direct →' }],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'બીજી શેરી = router જોઈએ', en: 'Different street = you need a router' },
      text: {
        beginner: {
          gu: 'પણ સામેનું મશીન 10.0.0.5 હોય તો? network ભાગ અલગ છે — એ બીજી શેરીમાં છે. હવે સીધી બૂમ નહીં ચાલે. PC એ packet પોતાના router (default gateway) ને આપવું પડશે, અને router આગળ પહોંચાડશે.',
          en: 'But what if the other machine is 10.0.0.5? The network part differs — it is on another street. Shouting will not reach. The PC must hand the packet to its router (the default gateway), which carries it onward.',
        },
        exam: {
          gu: 'Destination local subnet માં ન હોય તો host packet default gateway ના MAC પર મોકલે છે (destination IP એ જ રહે છે, destination MAC બદલાય છે).',
          en: 'When the destination is not in the local subnet the host sends the packet to the default gateway’s MAC — the destination IP stays the same, only the destination MAC changes.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 160, y: 230, type: 'pc' as const, label: 'PC A', sub: '192.168.1.10', accent: BEG },
          { id: 'r', x: 430, y: 230, type: 'router' as const, label: 'Gateway', sub: '192.168.1.1', accent: CCNP, pulse: t > 0.3 && t < 0.7 },
          { id: 'b', x: 700, y: 230, type: 'server' as const, label: 'Server', sub: '10.0.0.5', accent: CCNA },
        ],
        links: [
          { id: 'l1', from: 'a', to: 'r', state: 'up', flowing: t > 0.1, label: '192.168.1.0/24' },
          { id: 'l2', from: 'r', to: 'b', state: 'up', flowing: t > 0.55, label: '10.0.0.0/24' },
        ],
        packets: [
          t < 0.55
            ? { id: 'p', from: 'a', to: 'r', t: 0.08 + ease(t / 0.55) * 0.84, color: 'var(--nq-pkt-data)', label: '→ 10.0.0.5' }
            : { id: 'p', from: 'r', to: 'b', t: 0.08 + ease((t - 0.55) / 0.45) * 0.84, color: 'var(--nq-pkt-data)', label: '→ 10.0.0.5' },
        ],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'ખાસ સરનામાં', en: 'The special addresses' },
      text: {
        beginner: {
          gu: 'દરેક નેટવર્કમાં બે સરનામાં કોઈને આપી શકાતાં નથી. સૌથી પહેલું (192.168.1.0) આખી શેરીનું નામ છે, અને સૌથી છેલ્લું (192.168.1.255) એ "બધાને સંભળાવો" માટેનું broadcast છે. વચ્ચેનાં .1 થી .254 જ મશીનોને મળે.',
          en: 'In every network two addresses cannot be handed to anyone. The first (192.168.1.0) is the name of the street itself, and the last (192.168.1.255) is the broadcast — "tell everyone". Only .1 to .254 in between go to machines.',
        },
        exam: {
          gu: 'Network address (બધા host bits 0) અને broadcast address (બધા host bits 1) assignable નથી. /24 માં 256 − 2 = 254 usable hosts મળે.',
          en: 'The network address (all host bits 0) and broadcast address (all host bits 1) are not assignable. A /24 therefore yields 256 − 2 = 254 usable hosts.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 430, y: 270, type: 'switch' as const, label: 'LAN 192.168.1.0/24', accent: CCNA },
          { id: 'p1', x: 230, y: 140, type: 'pc' as const, label: 'PC1', sub: '.10', accent: BEG },
          { id: 'p2', x: 430, y: 120, type: 'pc' as const, label: 'PC2', sub: '.20', accent: BEG },
          { id: 'p3', x: 630, y: 140, type: 'pc' as const, label: 'PC3', sub: '.30', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'sw', to: 'p1', state: 'up', flowing: t > 0.4 },
          { id: 'b', from: 'sw', to: 'p2', state: 'up', flowing: t > 0.4 },
          { id: 'c', from: 'sw', to: 'p3', state: 'up', flowing: t > 0.4 },
        ],
        packets:
          t > 0.4
            ? [
                { id: 'b1', from: 'sw', to: 'p1', t: 0.1 + ease((t - 0.4) / 0.6) * 0.8, color: 'var(--nq-pkt-dns)', label: '.255' },
                { id: 'b2', from: 'sw', to: 'p2', t: 0.1 + ease((t - 0.4) / 0.6) * 0.8, color: 'var(--nq-pkt-dns)' },
                { id: 'b3', from: 'sw', to: 'p3', t: 0.1 + ease((t - 0.4) / 0.6) * 0.8, color: 'var(--nq-pkt-dns)' },
              ]
            : [],
      }),
      aside: () => ({
        title: { gu: '192.168.1.0/24', en: '192.168.1.0/24' },
        head: ['address', 'meaning'],
        rows: [
          ['192.168.1.0', 'network — the street name'],
          ['192.168.1.1 – .254', 'usable hosts'],
          ['192.168.1.255', 'broadcast — everyone'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'IP address = શેરી + ઘર. શેરી સરખી હોય તો સીધી વાત; અલગ હોય તો router દ્વારા. દરેક શેરીનું પહેલું સરનામું નેટવર્કનું નામ અને છેલ્લું broadcast — એ બે કોઈ મશીનને ન અપાય.',
    en: 'An IP address is street + house. Same street means direct; different streets go through a router. In every street the first address names the network and the last is broadcast — neither goes to a machine.',
  },
  check: {
    q: {
      gu: '192.168.1.10 અને 192.168.2.10 — શું આ બંને સીધી વાત કરી શકે?',
      en: 'Can 192.168.1.10 and 192.168.2.10 talk directly?',
    },
    options: [
      { gu: 'ના — network ભાગ અલગ છે, router જોઈએ', en: 'No — the network part differs, a router is needed' },
      { gu: 'હા — બંનેમાં 192.168 છે એટલે સરખું જ છે', en: 'Yes — both start with 192.168 so they match' },
      { gu: 'હા — છેલ્લો આંકડો બંનેમાં 10 છે', en: 'Yes — the last number is 10 in both' },
    ],
    answer: 0,
    explain: {
      gu: '/24 માં પહેલા ત્રણ આંકડા network છે. 192.168.1 અને 192.168.2 અલગ છે, એટલે એ બે અલગ શેરીઓ છે અને વચ્ચે router જોઈએ.',
      en: 'With a /24 the first three numbers are the network. 192.168.1 and 192.168.2 differ, so they are two separate streets and a router is required.',
    },
  },
}

/* ------------------------------------------------------------------ b2l2 */

export const b2l2: LessonSpec = {
  why: {
    gu: 'દરેક network card ને જન્મથી એક નામ મળે છે જે કદી બદલાતું નથી — MAC address. Switch કેવી રીતે કામ કરે, ARP શું કરે, DHCP કોને IP આપે — આ બધાના મૂળમાં આ એક જ નંબર છે.',
    en: 'Every network card is born with a name that never changes — its MAC address. How a switch works, what ARP does, who DHCP hands an IP to — all of it rests on that one number.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'કાર્ડ પર છપાયેલું નામ', en: 'The name burned into the card' },
      text: {
        beginner: {
          gu: 'દરેક network card માં ફેક્ટરીમાં જ એક નંબર લખાઈ જાય છે: 00:1A:2B:3C:4D:5E જેવો. એને MAC address કહે છે. IP address બદલાઈ શકે — આજે 192.168.1.10, કાલે બીજું. પણ MAC કાર્ડ સાથે જ રહે છે, કાયમ.',
          en: 'Every network card is stamped at the factory with a number like 00:1A:2B:3C:4D:5E. That is its MAC address. An IP can change — 192.168.1.10 today, something else tomorrow. The MAC stays with the card, permanently.',
        },
        exam: {
          gu: 'MAC address 48 bits નું છે, hex માં લખાય. પહેલા 24 bits OUI (vendor) અને પાછલા 24 bits device-specific. એ NIC ના ROM માં burned હોય છે.',
          en: 'A MAC address is 48 bits written in hex: the first 24 bits are the OUI (vendor) and the last 24 are device-specific. It is burned into the NIC’s ROM.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 430, y: 230, type: 'pc' as const, label: 'PC', sub: '00:1A:2B:3C:4D:5E', accent: BEG, pulse: true },
        ],
      }),
      aside: () => ({
        title: { gu: 'MAC ના ભાગ', en: 'Parts of a MAC' },
        head: ['part', 'bytes', 'means'],
        rows: [
          ['00:1A:2B', 'first 3', 'vendor (OUI)'],
          ['3C:4D:5E', 'last 3', 'this card'],
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'દુનિયામાં કોઈ બે સરખા નહીં', en: 'No two alike in the world' },
      text: {
        beginner: {
          gu: 'MAC address આખી દુનિયામાં unique હોય છે. પહેલા ત્રણ બાઈટ કંપનીનું નામ કહે છે (Cisco, Intel, Apple), અને પાછલા ત્રણ એ કંપનીએ આપેલો ક્રમાંક. એટલે બે કાર્ડનો MAC કદી સરખો નથી હોતો.',
          en: 'A MAC address is unique worldwide. The first three bytes identify the maker (Cisco, Intel, Apple) and the last three are that maker’s serial. So no two cards share a MAC.',
        },
        exam: {
          gu: 'IEEE દરેક vendor ને OUI assign કરે છે. એ થકી globally unique addressing મળે છે — અને troubleshooting માં MAC જોઈને vendor ઓળખી શકાય.',
          en: 'IEEE assigns each vendor an OUI, which gives globally unique addressing — and lets you identify a vendor from a MAC while troubleshooting.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 190, y: 160, type: 'pc' as const, label: 'PC1', sub: '001a.1111.0001', accent: BEG },
          { id: 'b', x: 430, y: 160, type: 'laptop' as const, label: 'PC2', sub: '001a.2222.0002', accent: BEG },
          { id: 'c', x: 670, y: 160, type: 'pc' as const, label: 'PC3', sub: '001a.3333.0003', accent: BEG },
          { id: 'd', x: 310, y: 330, type: 'server' as const, label: 'Server', sub: '00b0.aaaa.0009', accent: CCNA },
          { id: 'e', x: 560, y: 330, type: 'router' as const, label: 'Router', sub: '00c1.bbbb.0001', accent: CCNP },
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'Switch MAC થી જ કામ કરે', en: 'A switch works purely by MAC' },
      text: {
        beginner: {
          gu: 'Switch ને IP address સમજાતું જ નથી. એ ફક્ત MAC જુએ છે. "આ frame 001a.3333.0003 માટે છે? એ તો Fa0/3 પર બેઠેલું છે" — અને ત્યાં જ મોકલી દે. એટલે જ MAC ને સમજ્યા વિના switching ન સમજાય.',
          en: 'A switch does not understand IP addresses at all. It looks only at MACs. "This frame is for 001a.3333.0003? That one lives on Fa0/3" — and out it goes. Which is why switching makes no sense without MACs.',
        },
        exam: {
          gu: 'Switch દરેક ingress frame ના source MAC થી CAM table ભરે છે અને destination MAC લુકઅપ કરીને unicast forward કરે છે. અજાણ્યું destination હોય તો flood કરે.',
          en: 'A switch populates its CAM table from the source MAC of every ingress frame and forwards by destination MAC lookup. Unknown destinations are flooded.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 430, y: 260, type: 'switch' as const, label: 'Switch', accent: CCNA, pulse: t > 0.35 && t < 0.65 },
          { id: 'p1', x: 200, y: 130, type: 'pc' as const, label: 'PC1', sub: '…0001', accent: BEG },
          { id: 'p3', x: 660, y: 130, type: 'pc' as const, label: 'PC3', sub: '…0003', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'p1', to: 'sw', state: 'up', flowing: t < 0.5 },
          { id: 'b', from: 'sw', to: 'p3', state: 'up', flowing: t > 0.5 },
        ],
        packets: [
          t < 0.5
            ? { id: 'p', from: 'p1', to: 'sw', t: 0.1 + ease(t / 0.5) * 0.8, color: 'var(--nq-pkt-data)', label: 'to …0003' }
            : { id: 'p', from: 'sw', to: 'p3', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-pkt-data)', label: 'to …0003' },
        ],
      }),
      aside: (t) => ({
        title: { gu: 'Switch નું MAC table', en: 'Switch MAC table' },
        head: ['MAC', 'port'],
        rows: t > 0.35 ? [['001a.1111.0001', 'Fa0/1'], ['001a.3333.0003', 'Fa0/3']] : [['001a.1111.0001', 'Fa0/1']],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'MAC સ્થાનિક, IP દૂર સુધી', en: 'MAC is local, IP goes far' },
      text: {
        beginner: {
          gu: 'મહત્ત્વનો ફરક: MAC ફક્ત એક જ નેટવર્કની અંદર કામ કરે છે. Packet router પાર કરે કે તરત MAC બદલાઈ જાય છે — પણ IP એ જ રહે છે, છેક મંઝિલ સુધી. MAC એ રિક્ષાવાળો, IP એ આખા પ્રવાસનું સરનામું.',
          en: 'The key difference: a MAC only works inside one network. The moment a packet crosses a router the MAC is replaced — but the IP stays the same all the way to the destination. The MAC is the local taxi; the IP is the address for the whole journey.',
        },
        exam: {
          gu: 'દરેક Layer 3 hop પર Layer 2 header rewrite થાય છે; Layer 3 source/destination IP અકબંધ રહે છે (NAT ન હોય ત્યાં સુધી).',
          en: 'The Layer 2 header is rewritten at every Layer 3 hop while the Layer 3 source and destination IPs stay intact (absent NAT).',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 150, y: 230, type: 'pc' as const, label: 'PC A', sub: '192.168.1.10', accent: BEG },
          { id: 'r', x: 430, y: 230, type: 'router' as const, label: 'Router', accent: CCNP },
          { id: 'b', x: 700, y: 230, type: 'server' as const, label: 'Server', sub: '10.0.0.5', accent: CCNA },
        ],
        links: [
          { id: 'l1', from: 'a', to: 'r', state: 'up', flowing: true },
          { id: 'l2', from: 'r', to: 'b', state: 'up', flowing: true },
        ],
        packets: [
          t < 0.5
            ? { id: 'p', from: 'a', to: 'r', t: 0.1 + ease(t / 0.5) * 0.8, color: 'var(--nq-pkt-data)', label: 'MAC: …0001 → R' }
            : { id: 'p', from: 'r', to: 'b', t: 0.1 + ease((t - 0.5) / 0.5) * 0.8, color: 'var(--nq-pkt-ctrl)', label: 'MAC: R → srv' },
        ],
      }),
      aside: (t) => ({
        title: { gu: 'શું બદલાયું?', en: 'What changed?' },
        head: ['field', 'before', 'after'],
        rows:
          t > 0.5
            ? [
                ['dest IP', '10.0.0.5', '10.0.0.5'],
                ['dest MAC', 'router', 'server'],
              ]
            : [
                ['dest IP', '10.0.0.5', '—'],
                ['dest MAC', 'router', '—'],
              ],
      }),
    },
  ],
  takeaway: {
    gu: 'MAC = કાર્ડ પર કાયમ છપાયેલું નામ, આખી દુનિયામાં unique, પણ ફક્ત એક જ નેટવર્કમાં કામનું. Switch એના પર જ ચાલે. Router એને દરેક hop પર બદલી નાખે, જ્યારે IP અકબંધ રહે.',
    en: 'A MAC is a permanent name on the card, unique worldwide, but useful only inside one network. Switches run on it. Routers replace it at every hop while the IP stays untouched.',
  },
  check: {
    q: {
      gu: 'Packet એક router પાર કરે ત્યારે શું બદલાય છે?',
      en: 'When a packet crosses a router, what changes?',
    },
    options: [
      { gu: 'MAC address બદલાય, IP એ જ રહે', en: 'The MAC changes, the IP stays the same' },
      { gu: 'IP બદલાય, MAC એ જ રહે', en: 'The IP changes, the MAC stays the same' },
      { gu: 'બંને બદલાય', en: 'Both change' },
    ],
    answer: 0,
    explain: {
      gu: 'MAC ફક્ત એક link પૂરતું હોય છે, એટલે દરેક hop પર નવો MAC લખાય. IP એ આખા પ્રવાસનું સરનામું છે, એટલે એ બદલાતું નથી.',
      en: 'A MAC is only meaningful on one link, so a new one is written at each hop. The IP is the address for the entire journey, so it does not change.',
    },
  },
}

/* ------------------------------------------------------------------ b2l4 */

export const b2l4: LessonSpec = {
  why: {
    gu: 'દુનિયામાં IPv4 સરનામાં ખૂટી પડ્યાં છે. એનો ઉકેલ એ છે કે ઘરની અંદર બધાં એક જ પ્રકારનાં "ખાનગી" સરનામાં વાપરે અને બહાર જવા માટે એક જ "જાહેર" સરનામું શેર કરે. આ એક યુક્તિ આખા ઈન્ટરનેટને ટકાવી રાખે છે.',
    en: 'The world ran out of IPv4 addresses. The fix: everyone inside uses the same kind of "private" address and shares one "public" address to get out. That single trick is what keeps the internet going.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'ખાનગી સરનામાં — ઘરની અંદર', en: 'Private addresses — inside the house' },
      text: {
        beginner: {
          gu: 'ત્રણ ખાસ રેન્જ છે જે કોઈ પણ વાપરી શકે, મફતમાં: 10.x.x.x, 172.16–31.x.x, અને 192.168.x.x. તમારા ઘરનું WiFi 192.168.1.x વાપરે છે, અને પાડોશીનું પણ એ જ — કોઈ ટકરાવ નહીં, કારણ કે બંને પોતપોતાના ઘરની અંદર છે.',
          en: 'Three ranges are free for anyone to use: 10.x.x.x, 172.16–31.x.x and 192.168.x.x. Your home WiFi uses 192.168.1.x and so does your neighbour’s — no clash, because each stays inside its own house.',
        },
        exam: {
          gu: 'RFC 1918 private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. આ addresses internet પર routable નથી અને ISP એમને drop કરે છે.',
          en: 'RFC 1918 private ranges are 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. These are not routable on the internet and providers drop them.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'sw', x: 430, y: 290, type: 'switch' as const, label: 'Home LAN', accent: BEG },
          { id: 'p1', x: 230, y: 150, type: 'laptop' as const, label: 'Laptop', sub: '192.168.1.10', accent: BEG },
          { id: 'p2', x: 430, y: 130, type: 'laptop' as const, label: 'Phone', sub: '192.168.1.11', accent: BEG },
          { id: 'p3', x: 630, y: 150, type: 'pc' as const, label: 'TV', sub: '192.168.1.12', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'sw', to: 'p1', state: 'up' },
          { id: 'b', from: 'sw', to: 'p2', state: 'up' },
          { id: 'c', from: 'sw', to: 'p3', state: 'up' },
        ],
      }),
      aside: () => ({
        title: { gu: 'ખાનગી રેન્જ', en: 'Private ranges' },
        head: ['range', 'size'],
        rows: [
          ['10.0.0.0/8', 'huge — big companies'],
          ['172.16.0.0/12', 'medium'],
          ['192.168.0.0/16', 'homes, small offices'],
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'જાહેર સરનામું — બહારની દુનિયા', en: 'The public address — the outside world' },
      text: {
        beginner: {
          gu: 'ઈન્ટરનેટ પર દેખાવા માટે જાહેર સરનામું જોઈએ, અને એ ISP આપે છે — ભાડે. તમારા ઘરમાં દસ ઉપકરણ હોય તો પણ ISP એક જ જાહેર સરનામું આપે છે, તમારા router ને.',
          en: 'To be seen on the internet you need a public address, and the ISP hands you one — for a fee. Even with ten devices at home the ISP gives just one public address, to your router.',
        },
        exam: {
          gu: 'Public addresses IANA/RIR દ્વારા allocate થાય છે અને globally unique હોય છે. Residential connection ને સામાન્ય રીતે એક જ dynamic public IP મળે છે.',
          en: 'Public addresses are allocated by IANA/RIRs and are globally unique. A residential line normally gets a single dynamic public IP.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 190, y: 250, type: 'switch' as const, label: 'Home LAN', sub: '192.168.1.x', accent: BEG },
          { id: 'r', x: 430, y: 250, type: 'router' as const, label: 'Router', sub: t > 0.4 ? '49.36.12.7' : undefined, accent: CCNP, pulse: t > 0.4 },
          { id: 'cl', x: 670, y: 220, type: 'cloud' as const, label: 'Internet', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'sw', to: 'r', state: 'up', label: 'private' },
          { id: 'b', from: 'r', to: 'cl', state: 'up', label: t > 0.4 ? 'public' : undefined },
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'NAT — એક સરનામું, બધાં ઉપકરણ', en: 'NAT — one address for everyone' },
      text: {
        beginner: {
          gu: 'તો દસ ઉપકરણ એક જ સરનામું કેવી રીતે વાપરે? Router જાદુ કરે છે: બહાર જતા દરેક packet પર એ ખાનગી સરનામું ભૂંસીને પોતાનું જાહેર સરનામું લખી દે છે, અને યાદ રાખે છે કે કોના માટે શું કર્યું. જવાબ આવે ત્યારે ઊલટું કરીને સાચા ઉપકરણ સુધી પહોંચાડે. આને NAT કહે છે.',
          en: 'So how do ten devices share one address? The router performs a trick: on every outgoing packet it erases the private address, writes its own public one, and remembers what it did for whom. When the reply arrives it reverses the swap and delivers to the right device. That is NAT.',
        },
        exam: {
          gu: 'PAT (NAT overload) દરેક inside session ને અલગ source port આપે છે અને translation table માં inside-local ↔ inside-global mapping રાખે છે. એક જ public IP હજારો sessions સંભાળે છે.',
          en: 'PAT (NAT overload) gives each inside session its own source port and keeps an inside-local ↔ inside-global mapping in the translation table. One public IP serves thousands of sessions.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p1', x: 130, y: 150, type: 'laptop' as const, label: 'Laptop', sub: '192.168.1.10', accent: BEG },
          { id: 'p2', x: 130, y: 330, type: 'laptop' as const, label: 'Phone', sub: '192.168.1.11', accent: BEG },
          { id: 'r', x: 420, y: 240, type: 'router' as const, label: 'NAT router', sub: '49.36.12.7', accent: CCNP, pulse: t > 0.3 && t < 0.7 },
          { id: 'cl', x: 700, y: 240, type: 'cloud' as const, label: 'Internet', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'p1', to: 'r', state: 'up', flowing: true },
          { id: 'b', from: 'p2', to: 'r', state: 'up', flowing: true },
          { id: 'c', from: 'r', to: 'cl', state: 'up', flowing: t > 0.45 },
        ],
        packets:
          t < 0.45
            ? [{ id: 'p', from: 'p1', to: 'r', t: 0.1 + ease(t / 0.45) * 0.8, color: 'var(--nq-pkt-data)', label: 'from 192.168.1.10' }]
            : [{ id: 'p', from: 'r', to: 'cl', t: 0.1 + ease((t - 0.45) / 0.55) * 0.8, color: 'var(--nq-ok)', label: 'from 49.36.12.7' }],
      }),
      aside: (t) => ({
        title: { gu: 'NAT table', en: 'NAT table' },
        head: ['inside', 'outside'],
        rows:
          t > 0.45
            ? [
                ['192.168.1.10:51234', '49.36.12.7:51234'],
                ['192.168.1.11:51235', '49.36.12.7:51235'],
              ]
            : [],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'બહારથી અંદર કેમ ન અવાય', en: 'Why the outside cannot reach in' },
      text: {
        beginner: {
          gu: 'આનો એક આડ ફાયદો છે: બહારથી કોઈ સીધું તમારા લેપટોપ સુધી પહોંચી શકતું નથી, કારણ કે ઈન્ટરનેટને 192.168.1.10 નો કોઈ રસ્તો ખબર જ નથી. એટલે NAT એક મફતનું રક્ષણ પણ આપે છે — જોકે એ ખરો firewall નથી.',
          en: 'There is a side benefit: nobody outside can reach your laptop directly, because the internet has no route to 192.168.1.10 at all. So NAT gives you a layer of protection for free — though it is not a real firewall.',
        },
        exam: {
          gu: 'Translation entry ફક્ત inside-initiated traffic થી બને છે, એટલે unsolicited inbound traffic ને કોઈ mapping મળતું નથી અને એ drop થાય. સાચું security માટે stateful firewall જોઈએ.',
          en: 'A translation entry is only created by inside-initiated traffic, so unsolicited inbound traffic finds no mapping and is dropped. Real security still needs a stateful firewall.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p1', x: 160, y: 240, type: 'laptop' as const, label: 'Laptop', sub: '192.168.1.10', accent: BEG },
          { id: 'r', x: 430, y: 240, type: 'router' as const, label: 'NAT router', accent: CCNP },
          { id: 'cl', x: 700, y: 240, type: 'cloud' as const, label: 'Attacker', accent: 'var(--nq-err)' },
        ],
        links: [
          { id: 'a', from: 'p1', to: 'r', state: 'up' },
          { id: 'b', from: 'r', to: 'cl', state: 'up', flowing: true },
        ],
        packets: [
          { id: 'x', from: 'cl', to: 'r', t: 0.1 + ease(t) * 0.72, color: 'var(--nq-err)', label: 'no mapping · dropped' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'ખાનગી સરનામાં (10.x, 172.16–31.x, 192.168.x) ઘરની અંદર મફત વપરાય પણ ઈન્ટરનેટ પર ચાલે નહીં. Router એમને NAT વડે એક જાહેર સરનામામાં બદલી નાખે છે — એક જ સરનામું, બધાં ઉપકરણ.',
    en: 'Private addresses (10.x, 172.16–31.x, 192.168.x) are free inside but useless on the internet. The router converts them to one public address using NAT — one address, every device.',
  },
  check: {
    q: {
      gu: 'તમારો લેપટોપ 192.168.1.10 છે. ઈન્ટરનેટ પરની website તમને કયું સરનામું જુએ છે?',
      en: 'Your laptop is 192.168.1.10. What address does a website on the internet see?',
    },
    options: [
      { gu: 'Router નું જાહેર સરનામું', en: 'The router’s public address' },
      { gu: '192.168.1.10 — એ જ', en: '192.168.1.10 — the same one' },
      { gu: 'કોઈ સરનામું નહીં', en: 'No address at all' },
    ],
    answer: 0,
    explain: {
      gu: 'Router બહાર જતા packet પર ખાનગી સરનામું ભૂંસીને પોતાનું જાહેર સરનામું લખે છે, એટલે website ને ફક્ત એ જ દેખાય છે.',
      en: 'The router rewrites the private source with its own public address on the way out, so the website only ever sees that.',
    },
  },
}

/* ------------------------------------------------------------------ b2l5 */

const bits = (n: number) => n.toString(2).padStart(8, '0')

export const b2l5: LessonSpec = {
  why: {
    gu: 'Subnetting માં અટકી જવાનું એક જ કારણ હોય છે: binary ડરામણું લાગે છે. પણ binary એટલે આઠ બલ્બ ચાલુ કે બંધ — એટલું જ. એક વાર આ ચિત્ર મનમાં બેસી જાય પછી subnet mask આપોઆપ સમજાય છે.',
    en: 'There is only one reason people stall at subnetting: binary looks frightening. But binary is just eight light bulbs, on or off. Once that picture settles, subnet masks explain themselves.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'આઠ બલ્બ', en: 'Eight light bulbs' },
      text: {
        beginner: {
          gu: 'એક octet એટલે આઠ બલ્બની હાર. દરેક બલ્બ ચાલુ (1) કે બંધ (0) હોઈ શકે. દરેક બલ્બની એક કિંમત હોય છે — ડાબેથી શરૂ કરીને 128, 64, 32, 16, 8, 4, 2, 1. જે બલ્બ ચાલુ હોય એની કિંમત ઉમેરી દો, જવાબ મળી ગયો.',
          en: 'One octet is a row of eight bulbs. Each is on (1) or off (0). Each bulb has a value — from the left: 128, 64, 32, 16, 8, 4, 2, 1. Add up the ones that are on, and that is your number.',
        },
        exam: {
          gu: 'દરેક bit position એ 2 ની ઘાત છે (2^7 થી 2^0). Octet ની value એ બધા set bits ના place values નો સરવાળો છે.',
          en: 'Each bit position is a power of two (2^7 down to 2^0). The octet’s value is the sum of the place values of all set bits.',
        },
      },
      scene: () => ({
        nodes: [{ id: 'a', x: 430, y: 230, type: 'pc' as const, label: 'one octet', sub: '8 bits', accent: BEG, pulse: true }],
      }),
      aside: () => ({
        title: { gu: 'બલ્બની કિંમત', en: 'Bulb values' },
        head: ['bit', 'value'],
        rows: [
          ['1st (leftmost)', '128'],
          ['2nd', '64'],
          ['3rd', '32'],
          ['4th', '16'],
          ['5th', '8'],
          ['6th', '4'],
          ['7th', '2'],
          ['8th (rightmost)', '1'],
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: '192 કેવી રીતે બને', en: 'How 192 is made' },
      text: {
        beginner: {
          gu: 'ચાલો 192 બનાવીએ. પહેલો બલ્બ ચાલુ = 128. બીજો ચાલુ = 64. 128 + 64 = 192. બાકીના છ બલ્બ બંધ. એટલે 192 એટલે binary માં 11000000. બસ આટલું જ — કોઈ ગણિત નહીં, ફક્ત સરવાળો.',
          en: 'Let us build 192. First bulb on = 128. Second on = 64. 128 + 64 = 192. The other six stay off. So 192 in binary is 11000000. That is all there is — no maths, just addition.',
        },
        exam: {
          gu: '192 = 11000000₂. આ pattern /26 subnet mask ના છેલ્લા octet તરીકે ખૂબ જોવા મળે છે (255.255.255.192).',
          en: '192 = 11000000₂. You will meet this pattern constantly as the last octet of a /26 mask (255.255.255.192).',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 430, y: 230, type: 'pc' as const, label: t > 0.6 ? '192' : '…', sub: bits(192), accent: BEG, pulse: t > 0.6 },
        ],
      }),
      aside: (t) => ({
        title: { gu: '192 બનાવીએ', en: 'Building 192' },
        head: ['bulb', 'state', 'adds'],
        rows: [
          ['128', t > 0.2 ? 'ON' : 'off', t > 0.2 ? '128' : '0'],
          ['64', t > 0.4 ? 'ON' : 'off', t > 0.4 ? '64' : '0'],
          ['32', 'off', '0'],
          ['16', 'off', '0'],
          ['total', '', t > 0.6 ? '192' : t > 0.4 ? '192' : t > 0.2 ? '128' : '0'],
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'સૌથી મોટો અને સૌથી નાનો', en: 'The biggest and the smallest' },
      text: {
        beginner: {
          gu: 'બધા આઠ બલ્બ ચાલુ કરો: 128+64+32+16+8+4+2+1 = 255. એટલે જ octet 255 થી ઉપર ન જઈ શકે! અને બધા બંધ કરો તો 0. હવે ખબર પડી કે IP માં 0–255 ની મર્યાદા કેમ છે.',
          en: 'Turn all eight on: 128+64+32+16+8+4+2+1 = 255. That is exactly why an octet cannot go past 255. All off gives 0. Now you know where the 0–255 limit comes from.',
        },
        exam: {
          gu: '2^8 = 256 possible values, 0 થી 255. એ જ કારણે 255.255.255.0 એ "બધા bits on" વાળા ત્રણ octets છે — એટલે /24.',
          en: '2^8 = 256 possible values, 0 through 255. It is also why 255.255.255.0 is three octets of all-ones — that is a /24.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 250, y: 230, type: 'pc' as const, label: '0', sub: bits(0), accent: BEG, dim: t > 0.5 },
          { id: 'b', x: 620, y: 230, type: 'pc' as const, label: '255', sub: bits(255), accent: CCNA, pulse: t > 0.5 },
        ],
      }),
      aside: () => ({
        title: { gu: 'હદ', en: 'The limits' },
        head: ['bits', 'decimal'],
        rows: [
          ['00000000', '0'],
          ['00000001', '1'],
          ['10000000', '128'],
          ['11000000', '192'],
          ['11111111', '255'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'Subnet mask એટલે શું', en: 'What a subnet mask really is' },
      text: {
        beginner: {
          gu: 'હવે મજાની વાત. Subnet mask 255.255.255.0 એટલે શું? એટલે પહેલા 24 બલ્બ ચાલુ અને છેલ્લા 8 બંધ. ચાલુ બલ્બ કહે છે "આટલો ભાગ શેરીનું નામ છે", બંધ બલ્બ કહે છે "આટલો ભાગ ઘરનો નંબર". એટલે જ /24 લખાય છે — 24 બલ્બ ચાલુ.',
          en: 'Now the good part. What does the mask 255.255.255.0 mean? It means the first 24 bulbs are on and the last 8 are off. The ones that are on say "this much is the street name", the ones off say "this much is the house number". That is why we write /24 — twenty-four bulbs on.',
        },
        exam: {
          gu: 'Subnet mask માં contiguous leading ones એ network bits દર્શાવે. Prefix length = set bits ની સંખ્યા. Host bits = 32 − prefix, અને usable hosts = 2^(host bits) − 2.',
          en: 'The contiguous leading ones in a mask mark the network bits. The prefix length is the count of set bits. Host bits = 32 − prefix, and usable hosts = 2^(host bits) − 2.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 430, y: 230, type: 'pc' as const, label: '192.168.1.10 /24', sub: t > 0.4 ? '255.255.255.0' : undefined, accent: BEG, pulse: t > 0.4 },
        ],
      }),
      aside: (t) => ({
        title: { gu: 'Mask ના બલ્બ', en: 'The mask in bulbs' },
        head: ['octet', 'bits', 'part'],
        rows: [
          ['255', '11111111', 'network'],
          ['255', '11111111', 'network'],
          ['255', '11111111', 'network'],
          ['0', '00000000', t > 0.4 ? 'host' : ''],
        ],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'બીજા mask પણ એ જ રીતે', en: 'Other masks work the same way' },
      text: {
        beginner: {
          gu: '/26 એટલે 26 બલ્બ ચાલુ. પહેલા 24 તો આખા ત્રણ octet થઈ ગયા, બાકીના 2 ચોથા octet ના પહેલા બે બલ્બ — એટલે 128+64 = 192. એટલે /26 નો mask 255.255.255.192 થાય. હવે કોઈ પણ /x નો mask તમે જાતે કાઢી શકો.',
          en: '/26 means 26 bulbs on. The first 24 fill three whole octets; the remaining 2 are the first two bulbs of the fourth octet — 128+64 = 192. So /26 is 255.255.255.192. You can now work out any /x yourself.',
        },
        exam: {
          gu: 'સામાન્ય masks: /24 = .0, /25 = .128, /26 = .192, /27 = .224, /28 = .240, /29 = .248, /30 = .252. દરેક પગલે host bits અડધા થાય.',
          en: 'Common masks: /24 = .0, /25 = .128, /26 = .192, /27 = .224, /28 = .240, /29 = .248, /30 = .252. Each step halves the host space.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 250, y: 230, type: 'pc' as const, label: '/24', sub: '255.255.255.0', accent: BEG },
          { id: 'b', x: 430, y: 230, type: 'pc' as const, label: '/26', sub: '255.255.255.192', accent: CCNA, pulse: true },
          { id: 'c', x: 620, y: 230, type: 'pc' as const, label: '/30', sub: '255.255.255.252', accent: CCNP },
        ],
      }),
      aside: () => ({
        title: { gu: 'સામાન્ય masks', en: 'Common masks' },
        head: ['prefix', 'last octet', 'hosts'],
        rows: [
          ['/24', '0', '254'],
          ['/25', '128', '126'],
          ['/26', '192', '62'],
          ['/27', '224', '30'],
          ['/30', '252', '2'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'આઠ બલ્બ: 128, 64, 32, 16, 8, 4, 2, 1. જે ચાલુ હોય એ ઉમેરો — એ જ octet ની કિંમત. બધા ચાલુ = 255, બધા બંધ = 0. Subnet mask એટલે ફક્ત "કેટલા બલ્બ ચાલુ" — /24 એટલે 24 ચાલુ.',
    en: 'Eight bulbs: 128, 64, 32, 16, 8, 4, 2, 1. Add the ones that are on — that is the octet. All on = 255, all off = 0. A subnet mask is only "how many bulbs are on" — /24 means twenty-four.',
  },
  check: {
    q: {
      gu: 'Binary 11100000 નો decimal જવાબ શું?',
      en: 'What is 11100000 in decimal?',
    },
    options: [
      { gu: '224', en: '224' },
      { gu: '192', en: '192' },
      { gu: '240', en: '240' },
    ],
    answer: 0,
    explain: {
      gu: 'પહેલા ત્રણ બલ્બ ચાલુ છે: 128 + 64 + 32 = 224. એ /27 નો છેલ્લો octet છે.',
      en: 'The first three bulbs are on: 128 + 64 + 32 = 224. That is the last octet of a /27.',
    },
  },
}
