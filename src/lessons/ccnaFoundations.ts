import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const WARN = 'var(--nq-warn)'
const H = (gu: string, en: string) => ({ gu, en })

/* ═══════════════════════ n1l3 · IPv4 Addressing ═══════════════════════ */

export const n1l3: LessonSpec = {
  why: {
    gu: 'Foundation માં સરનામું શેરી અને ઘર હતું. CCNA માં એ જ વાત પરીક્ષાની ભાષામાં આવે છે — classes, private ranges, અને કયાં સરનામાં કોઈને ન અપાય. અહીં એ બંને ભાષા જોડી દઈએ.',
    en: 'In Foundation an address was a street and a house. In CCNA the same idea arrives in exam language — classes, private ranges, and which addresses can never be handed out. Here the two vocabularies are joined up.',
  },
  steps: [
    {
      ms: 2800,
      label: H('Classes — જૂનો નકશો', 'Classes — the old map'),
      text: {
        beginner: {
          gu: 'ઘણા વર્ષ પહેલાં સરનામાં ત્રણ ટોપલીમાં વહેંચાયાં હતાં. પહેલો આંકડો જોઈને જ ખબર પડી જતી કે શેરી કેટલી મોટી છે. આજે આ રીતે કોઈ વહેંચતું નથી — **પણ પરીક્ષામાં આવે છે**, અને જૂની ગોઠવણોમાં દેખાય છે.',
          en: 'Years ago addresses were sorted into three buckets, and the first number alone told you how big the street was. Nobody allocates this way today — **but it still comes up in the exam**, and you will meet it in older configurations.',
        },
        exam: {
          gu: 'Class A 1–126 (/8), B 128–191 (/16), C 192–223 (/24). 127 loopback. Classful routing 1993 માં CIDR થી બદલાયું, પણ classful default masks હજી પુછાય છે.',
          en: 'Class A is 1–126 (/8), B is 128–191 (/16), C is 192–223 (/24), and 127 is loopback. Classful routing gave way to CIDR in 1993, but the classful default masks are still examined.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 160, y: 200, type: 'cloud' as const, label: 'Class A', sub: '1 – 126', accent: BEG },
          { id: 'b', x: 430, y: 200, type: 'cloud' as const, label: 'Class B', sub: '128 – 191', accent: CCNA },
          { id: 'c', x: 700, y: 200, type: 'cloud' as const, label: 'Class C', sub: '192 – 223', accent: CCNP },
        ],
      }),
      aside: () => ({
        title: H('ત્રણ ટોપલી', 'The three buckets'),
        caption: H('પહેલો આંકડો જ બધું કહી દેતો.', 'The first number alone told you everything.'),
        head: ['class', 'first octet', 'default mask', 'hosts'],
        rows: [
          ['A', '1 – 126', '/8', '16,777,214'],
          ['B', '128 – 191', '/16', '65,534'],
          ['C', '192 – 223', '/24', '254'],
        ],
      }),
    },
    {
      ms: 3000,
      label: H('ખાનગી રેન્જ — મફત અને અમર્યાદ', 'The private ranges — free and unlimited'),
      text: {
        beginner: {
          gu: 'ત્રણ રેન્જ કોઈની માલિકીની નથી — કોઈ પણ, ગમે ત્યાં વાપરી શકે. તમારા ઘરનું `192.168.1.x` અને પાડોશીનું પણ એ જ. ટકરાવ નથી કારણ કે **એ સરનામાં ઈન્ટરનેટ પર જતાં જ નથી** — દરેક router એમને પોતાની સરહદે રોકી દે છે.',
          en: 'Three ranges belong to nobody — anyone, anywhere may use them. Your home runs `192.168.1.x` and so does your neighbour. There is no clash because **those addresses never travel on the internet**: every provider’s router stops them at the border.',
        },
        exam: {
          gu: 'RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. ISP આ prefixes ને filter કરે છે. 169.254.0.0/16 એ APIPA — DHCP નિષ્ફળ ગયાની નિશાની.',
          en: 'RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Providers filter these prefixes. 169.254.0.0/16 is APIPA — the fingerprint of a DHCP that never answered.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'h1', x: 130, y: 120, type: 'pc' as const, label: 'તમારું ઘર', sub: '192.168.1.10', accent: BEG },
          { id: 'h2', x: 130, y: 320, type: 'pc' as const, label: 'પાડોશી', sub: '192.168.1.10', accent: WARN },
          { id: 'r', x: 430, y: 220, type: 'router' as const, label: 'ISP', accent: CCNP, pulse: t > 0.4 },
          { id: 'net', x: 710, y: 220, type: 'cloud' as const, label: 'Internet', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'h1', to: 'r', state: 'up', flowing: true },
          { id: 'b', from: 'h2', to: 'r', state: 'up', flowing: true },
          { id: 'c', from: 'r', to: 'net', state: 'up' },
        ],
        packets:
          t > 0.35
            ? [{ id: 'x', from: 'h1', to: 'r', t: 0.1 + ease((t - 0.35) / 0.65) * 0.78, color: 'var(--nq-err)', label: 'private — stopped here' }]
            : [],
      }),
      aside: () => ({
        title: H('ખાનગી રેન્જ', 'The private ranges'),
        head: ['range', 'prefix', 'who uses it'],
        rows: [
          ['10.0.0.0', '/8', 'large enterprises'],
          ['172.16.0.0', '/12', 'mid-size networks'],
          ['192.168.0.0', '/16', 'homes, small offices'],
          ['169.254.0.0', '/16', 'nobody answered — APIPA'],
        ],
      }),
    },
    {
      ms: 3000,
      label: H('દરેક શેરીમાં બે સરનામાં બંધ', 'Two addresses in every street are spoken for'),
      text: {
        beginner: {
          gu: 'શેરીનું સૌથી પહેલું સરનામું શેરીનું પોતાનું નામ છે, અને સૌથી છેલ્લું "બધાને સંભળાવો" માટે. એ બે કદી કોઈ મશીનને ન અપાય. એટલે જ `/24` માં 256 નહીં, **254** વાપરી શકાય.',
          en: 'The first address in a street is the street’s own name, and the last is "shout to everyone". Neither can ever go to a machine. That is why a `/24` gives you **254** usable addresses, not 256.',
        },
        exam: {
          gu: 'બધા host bits 0 = network address, બધા 1 = directed broadcast. Usable = 2^h − 2. અપવાદ: /31 point-to-point links પર (RFC 3021) અને /32 loopback.',
          en: 'All host bits zero is the network address, all ones the directed broadcast. Usable = 2^h − 2. The exceptions are /31 on point-to-point links (RFC 3021) and /32 for a loopback.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'net', x: 150, y: 200, type: 'switch' as const, label: '192.168.1.0', sub: 'the street itself', accent: 'var(--nq-text-mute)' },
          { id: 'h', x: 430, y: 200, type: 'pc' as const, label: '.1 – .254', sub: 'the machines', accent: BEG, pulse: t > 0.3 },
          { id: 'b', x: 710, y: 200, type: 'switch' as const, label: '192.168.1.255', sub: 'everyone at once', accent: WARN },
        ],
      }),
      aside: () => ({
        title: H('192.168.1.0/24', '192.168.1.0/24'),
        head: ['address', 'who gets it'],
        rows: [
          ['192.168.1.0', 'nobody — the network'],
          ['192.168.1.1 – .254', 'your 254 machines'],
          ['192.168.1.255', 'nobody — broadcast'],
        ],
      }),
    },
    {
      ms: 2800,
      label: H('એક સરનામું, બે અર્થ', 'One address, two meanings'),
      text: {
        beginner: {
          gu: 'અહીં સૌથી વધુ ગૂંચવાડો થાય છે. `192.168.1.0` શેરીનું નામ છે — **જો mask /24 હોય તો**. પણ mask `/23` હોય તો એ જ સરનામું એક સામાન્ય ઘર બની જાય! **સરનામું એકલું કશું કહેતું નથી; mask સાથે જ અર્થ બને છે.**',
          en: 'This is where most confusion lives. `192.168.1.0` is a street name — **if the mask is /24**. Change the mask to `/23` and that same address becomes an ordinary house. **An address alone says nothing; it only means something alongside its mask.**',
        },
        exam: {
          gu: 'એટલે જ સરનામું હંમેશા prefix સાથે લખાય. `show ip interface brief` માં mask નથી દેખાતો — એ `show ip route` કે `show running-config` માં જોવો પડે.',
          en: 'This is why an address is always written with its prefix. `show ip interface brief` does not show the mask; for that you need `show ip route` or the running configuration.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 250, y: 200, type: 'switch' as const, label: '192.168.1.0 /24', sub: 'a street name', accent: CCNA },
          { id: 'b', x: 620, y: 200, type: 'pc' as const, label: '192.168.1.0 /23', sub: 'an ordinary house', accent: t > 0.5 ? WARN : 'var(--nq-text-mute)', pulse: t > 0.5 },
        ],
      }),
      aside: (t) => ({
        title: H('એ જ સરનામું', 'The very same address'),
        caption: H('ફક્ત mask બદલાયો.', 'Only the mask changed.'),
        head: ['address', 'mask', 'what it is'],
        rows: [
          ['192.168.1.0', '/24', 'the network itself'],
          ...(t > 0.5 ? [['192.168.1.0', '/23', 'a usable host ←']] : []),
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Classes જૂની વહેંચણી છે પણ પરીક્ષામાં આવે. ત્રણ ખાનગી રેન્જ મફત છે કારણ કે એ ઈન્ટરનેટ પર જતી જ નથી. દરેક શેરીમાં પહેલું અને છેલ્લું સરનામું બંધ. અને સૌથી અગત્યનું — **સરનામું mask વગર અધૂરું છે**.',
    en: 'Classes are an old allocation scheme that the exam still asks about. The three private ranges are free precisely because they never travel on the internet. In every street the first and last address are spoken for. And above all — **an address without its mask is only half a fact**.',
  },
  check: {
    q: H(
      '`10.0.0.0` પર ping કરો તો કદી જવાબ નહીં મળે. સૌથી સંભવિત કારણ?',
      'A ping to `10.0.0.0` never answers. The most likely reason?',
    ),
    options: [
      H('એ /8 નું network address છે — કોઈ મશીનનું નથી', 'It is the network address of a /8 — it belongs to no machine'),
      H('10.x.x.x ખાનગી છે એટલે ping ન થાય', 'Private 10.x.x.x addresses cannot be pinged'),
      H('એ સરનામું જ ખોટું છે', 'That is not a valid address at all'),
    ],
    answer: 0,
    explain: H(
      'ખાનગી સરનામાં અંદરથી ખુશીથી ping થાય. પણ `10.0.0.0/8` માં બધા host bits શૂન્ય છે — એ શેરીનું નામ છે, ઘર નહીં, એટલે ત્યાં કોઈ જવાબ આપવા બેઠું જ નથી.',
      'Private addresses ping perfectly well from inside. But in `10.0.0.0/8` every host bit is zero — that is the street’s name rather than a house, so there is nobody there to answer.',
    ),
  },
}

/* ═══════════════════════ n1l5 · VLSM ═══════════════════════ */

export const n1l5: LessonSpec = {
  why: {
    gu: 'Subnetting શીખ્યા પછીનો ખરો સવાલ આ છે: એક `/24` છે અને ચાર વિભાગ છે જેમની જરૂરિયાત સરખી નથી. બધાને સરખા ટુકડા આપો તો સરનામાં ખૂટી પડે. VLSM એ જ સમસ્યાનો જવાબ છે.',
    en: 'The real question after subnetting is this: you have one `/24` and four departments whose needs are nothing alike. Cut it into equal pieces and you run out. VLSM is the answer to exactly that.',
  },
  steps: [
    {
      ms: 3000,
      label: H('સરખા ટુકડા — અને ખૂટી પડ્યા', 'Equal pieces — and they ran out'),
      text: {
        beginner: {
          gu: 'ચાર વિભાગ છે એટલે `/24` ને ચાર સરખા `/26` માં વહેંચીએ — દરેકમાં 62 સરનામાં. પણ Sales માં 100 માણસ છે! **62 પૂરતા નથી.** અને WAN link પર ફક્ત બે સરનામાં જોઈએ છે ત્યાં 62 વેડફાય છે.',
          en: 'Four departments, so cut the `/24` into four equal `/26`s — 62 addresses each. But Sales has 100 people. **Sixty-two is not enough.** Meanwhile the WAN link needs exactly two addresses and is sitting on sixty-two.',
        },
        exam: {
          gu: 'Fixed-length subnetting માં બધા subnets એક જ કદના હોય. એ ત્યારે જ ચાલે જ્યારે બધી જરૂરિયાતો સરખી હોય — જે વાસ્તવિક નેટવર્કમાં ક્યારેય હોતી નથી.',
          en: 'Fixed-length subnetting gives every subnet the same size. That only works when every requirement is the same size, which in a real network it never is.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's', x: 150, y: 130, type: 'switch' as const, label: 'Sales', sub: '100 needed · 62 given', accent: t > 0.4 ? 'var(--nq-err)' : WARN, pulse: t > 0.4 },
          { id: 'h', x: 430, y: 130, type: 'switch' as const, label: 'HR', sub: '20 needed · 62 given', accent: CCNA },
          { id: 'i', x: 710, y: 130, type: 'switch' as const, label: 'IT', sub: '10 needed · 62 given', accent: CCNP },
          { id: 'w', x: 430, y: 330, type: 'router' as const, label: 'WAN link', sub: '2 needed · 62 given', accent: WARN },
        ],
      }),
      aside: () => ({
        title: H('સરખા ભાગ પાડીએ તો', 'If every piece is equal'),
        head: ['area', 'needs', 'gets', ''],
        rows: [
          ['Sales', '100', '62', 'too small'],
          ['HR', '20', '62', '42 wasted'],
          ['IT', '10', '62', '52 wasted'],
          ['WAN link', '2', '62', '60 wasted'],
        ],
      }),
    },
    {
      ms: 3000,
      label: H('મોટાથી શરૂ કરો', 'Start with the biggest'),
      text: {
        beginner: {
          gu: 'VLSM નો આખો નિયમ એક જ વાક્ય છે: **સૌથી મોટી જરૂરિયાતથી શરૂ કરો અને ઉતરતા ક્રમે ચાલો.** નાનાથી શરૂ કરો તો મોટા માટે સળંગ જગ્યા બચતી નથી અને બધું ફરી કરવું પડે.',
          en: 'The whole of VLSM is one sentence: **start with the largest requirement and work downward.** Start small and the big one no longer has a contiguous block to live in, and you begin again.',
        },
        exam: {
          gu: 'દરેક subnet એના કદ પર align થવું જોઈએ — /25 એ 128 ના ગુણાંક પર, /26 એ 64 ના. મોટાથી નાના તરફ જવાથી આ આપોઆપ થાય છે.',
          en: 'Every subnet must align on its own size — a /25 on a multiple of 128, a /26 on 64. Working from large to small makes that happen by itself.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's', x: 180, y: 200, type: 'switch' as const, label: 'Sales /25', sub: '.0 – .127 · 126 usable', accent: BEG, pulse: t > 0.3 },
          { id: 'h', x: 600, y: 200, type: 'switch' as const, label: 'બાકી / left', sub: '.128 – .255', accent: 'var(--nq-text-mute)', dim: t < 0.5 },
        ],
      }),
      aside: (t) => ({
        title: H('પહેલું પગલું', 'The first cut'),
        caption: H('100 જોઈએ, એટલે 128 નો ટુકડો.', 'A hundred needed, so a block of 128.'),
        head: ['area', 'prefix', 'range', 'usable'],
        rows: t > 0.3 ? [['Sales', '/25', '.0 – .127', '126']] : [],
      }),
    },
    {
      ms: 3200,
      label: H('બાકીનામાંથી આગળ કાપો', 'Cut the next from what is left'),
      text: {
        beginner: {
          gu: 'Sales એ `.0 – .127` લીધું. હવે બાકીનું `.128` થી શરૂ થાય છે. HR ને 20 જોઈએ — એટલે `/27` (30 સરનામાં) પૂરતું છે, `.128 – .159`. IT ને 10 જોઈએ — `/28` (14), `.160 – .175`.',
          en: 'Sales took `.0 – .127`, so what remains begins at `.128`. HR needs 20, so a `/27` (30 usable) covers it: `.128 – .159`. IT needs 10, so a `/28` (14 usable): `.160 – .175`.',
        },
        exam: {
          gu: 'દરેક પગલે: જરૂરિયાતથી મોટો સૌથી નાનો block લો, પછી આગળનો block એના પછી તરત શરૂ કરો. Block size = 256 − mask octet.',
          en: 'At each step take the smallest block that still exceeds the requirement, then begin the next one immediately after it. Block size = 256 − the mask octet.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's', x: 150, y: 150, type: 'switch' as const, label: 'Sales /25', sub: '.0 – .127', accent: BEG },
          { id: 'h', x: 430, y: 150, type: 'switch' as const, label: 'HR /27', sub: '.128 – .159', accent: CCNA, dim: t < 0.3 },
          { id: 'i', x: 700, y: 150, type: 'switch' as const, label: 'IT /28', sub: '.160 – .175', accent: CCNP, dim: t < 0.65 },
        ],
      }),
      aside: (t) => ({
        title: H('ઉતરતા ક્રમે', 'Working downward'),
        head: ['area', 'prefix', 'range', 'usable'],
        rows: [
          ['Sales', '/25', '.0 – .127', '126'],
          ...(t > 0.3 ? [['HR', '/27', '.128 – .159', '30']] : []),
          ...(t > 0.65 ? [['IT', '/28', '.160 – .175', '14']] : []),
        ],
      }),
    },
    {
      ms: 3000,
      label: H('WAN link ને /30 પૂરતું', 'A /30 is plenty for a WAN link'),
      text: {
        beginner: {
          gu: 'બે router વચ્ચેની લિંક પર ફક્ત **બે** મશીન છે. એટલે `/30` — ચાર સરનામાં, બે વાપરી શકાય. 62 આપવા એ છપ્પન સરનામાં ફેંકી દેવા બરાબર છે.',
          en: 'A link between two routers has exactly **two** machines on it, so a `/30` — four addresses, two usable. Giving it 62 is throwing sixty away.',
        },
        exam: {
          gu: 'Point-to-point links માટે /30 પ્રમાણભૂત છે; /31 (RFC 3021) બે જ સરનામાં વાપરે અને આધુનિક IOS એને સમર્થન આપે છે.',
          en: '/30 is the standard for point-to-point links; /31 (RFC 3021) uses only two addresses and modern IOS supports it.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r1', x: 250, y: 200, type: 'router' as const, label: 'R1', sub: '.176', accent: CCNA },
          { id: 'r2', x: 610, y: 200, type: 'router' as const, label: 'R2', sub: '.177', accent: CCNA },
        ],
        links: [{ id: 'l', from: 'r1', to: 'r2', state: 'up', label: '/30 · .176 – .179', flowing: t > 0.3 }],
      }),
      aside: () => ({
        title: H('આખી યોજના', 'The finished plan'),
        head: ['area', 'prefix', 'range', 'usable'],
        rows: [
          ['Sales', '/25', '.0 – .127', '126'],
          ['HR', '/27', '.128 – .159', '30'],
          ['IT', '/28', '.160 – .175', '14'],
          ['WAN link', '/30', '.176 – .179', '2'],
          ['still free', '—', '.180 – .255', '76'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'VLSM એટલે દરેક ટુકડાને **જેટલી જરૂર એટલો જ** મોટો બનાવવો. નિયમ એક જ: સૌથી મોટી જરૂરિયાતથી શરૂ કરો, ઉતરતા ક્રમે ચાલો, અને દરેક block પોતાના કદના ગુણાંક પર શરૂ થાય. Router link માટે `/30` — એથી મોટું કદી નહીં.',
    en: 'VLSM is sizing every piece to **exactly what it needs**. One rule covers it: start with the largest requirement, work downward, and let each block start on a multiple of its own size. For a router-to-router link use a `/30` — never anything larger.',
  },
  check: {
    q: H(
      'Sales ને `/25` આપ્યા પછી HR માટે આગળનો block ક્યાંથી શરૂ થાય?',
      'After Sales takes a `/25`, where does the next block for HR begin?',
    ),
    options: [
      H('.128 — કારણ કે /25 એ 128 સરનામાં લીધાં', '.128 — because a /25 consumed 128 addresses'),
      H('.64 — અડધેથી', '.64 — halfway along'),
      H('.126 — છેલ્લા વપરાયેલા પછી', '.126 — just after the last one used'),
    ],
    answer: 0,
    explain: H(
      '`/25` એટલે 128 સરનામાં: `.0` થી `.127`. એટલે પછીનું સળંગ સરનામું `.128` છે. છેલ્લું *વાપરી શકાય* એવું `.126` હતું, પણ broadcast `.127` પણ એ જ block નો ભાગ છે.',
      'A `/25` is 128 addresses: `.0` through `.127`. The next free address is therefore `.128`. The last *usable* one was `.126`, but the broadcast at `.127` still belongs to that block.',
    ),
  },
}
