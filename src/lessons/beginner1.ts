import type { LessonSpec } from '../components/AnimatedLesson'
import type { NodeSpec } from '../components/Topology'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'

/* ------------------------------------------------------------------ b1l2 */

const copperPc = (id: string, x: number, label: string, sub?: string): NodeSpec => ({
  id,
  x,
  y: 200,
  type: 'pc',
  label,
  sub,
  accent: BEG,
})

export const b1l2: LessonSpec = {
  why: {
    gu: 'ડેટા જાદુથી નથી જતો — એ કશાકમાં થઈને જાય છે. તાંબાના વાયરમાં વીજળી, કાચના તારમાં પ્રકાશ, હવામાં રેડિયો તરંગ. કયું માધ્યમ ક્યાં વાપરવું એ ખબર હોય તો અડધી network design ત્યાં જ નક્કી થઈ જાય છે.',
    en: 'Data does not travel by magic — it travels through something. Electricity in copper, light in glass, radio waves in air. Knowing which medium goes where settles half of any network design before you start.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'તાંબાનો વાયર — વીજળી', en: 'Copper — electricity' },
      text: {
        beginner: {
          gu: 'સૌથી સામાન્ય વાયર તાંબાનો હોય છે, જેને Ethernet cable કહે છે. એની અંદર વીજળીના નાના ધક્કા જાય છે. એક ધક્કો = 1, ધક્કો નહીં = 0. બસ આ રીતે આખી ફિલ્મ, આખું ગીત, આખું ઈન્ટરનેટ વહે છે.',
          en: 'The most common cable is copper — the Ethernet cable. Tiny pulses of electricity run inside it. A pulse means 1, no pulse means 0. That is how an entire film, an entire song, the entire internet flows.',
        },
        exam: {
          gu: 'Twisted-pair copper (Cat5e/Cat6) વીજળીના voltage transitions વડે bits મોકલે છે. 100 મીટર સુધી ભરોસાપાત્ર; એથી વધુ અંતરે attenuation અને crosstalk વધે છે.',
          en: 'Twisted-pair copper (Cat5e/Cat6) carries bits as voltage transitions. Reliable to 100 m; beyond that attenuation and crosstalk take over.',
        },
      },
      scene: (t) => ({
        nodes: [copperPc('a', 215, 'PC A'), copperPc('b', 645, 'PC B')],
        links: [{ id: 'ab', from: 'a', to: 'b', state: 'up', label: 'Cat6 copper', flowing: t > 0.4 }],
        packets:
          t > 0.4
            ? [{ id: 'e', from: 'a', to: 'b', t: 0.1 + ease((t - 0.4) / 0.6) * 0.8, color: 'var(--nq-warn)', label: '1 0 1 1' }]
            : [],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'તાંબાની હદ — 100 મીટર', en: 'Copper runs out at 100 m' },
      text: {
        beginner: {
          gu: 'તાંબાની એક મર્યાદા છે: લગભગ 100 મીટર. એથી લાંબો વાયર કરો તો સંકેત એટલો નબળો પડી જાય કે સામેના છેડે 1 અને 0 ઓળખાય જ નહીં. એક બિલ્ડિંગના માળ માટે પૂરતું, પણ બે શહેર જોડવા માટે નકામું.',
          en: 'Copper has a limit: about 100 metres. Run it longer and the signal fades until the far end can no longer tell a 1 from a 0. Fine for one floor of a building, useless for joining two cities.',
        },
        exam: {
          gu: '802.3 standards માં twisted-pair માટે 100 m નો maximum segment length છે. એથી વધુ માટે fibre અથવા intermediate repeater/switch જોઈએ.',
          en: 'The 802.3 standards cap twisted-pair at a 100 m maximum segment length. Beyond that you need fibre or an intermediate repeater/switch.',
        },
      },
      scene: (t) => ({
        nodes: [copperPc('a', 180, 'PC A'), { ...copperPc('b', 680, 'PC B'), dim: t > 0.5 }],
        links: [
          {
            id: 'ab',
            from: 'a',
            to: 'b',
            state: t > 0.5 ? 'down' : 'up',
            label: t > 0.5 ? '250 m — too far' : '250 m',
            flowing: t < 0.5,
          },
        ],
        packets:
          t < 0.55
            ? [{ id: 'e', from: 'a', to: 'b', t: 0.1 + ease(t / 0.55) * 0.45, color: 'var(--nq-err)', label: 'fading…' }]
            : [],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'કાચનો તાર — પ્રકાશ', en: 'Glass — light' },
      text: {
        beginner: {
          gu: 'લાંબા અંતર માટે કાચનો પાતળો તાર વપરાય છે — fibre optic. એમાં વીજળી નહીં, પ્રકાશનો ઝબકારો જાય છે. પ્રકાશ નબળો પડ્યા વગર કિલોમીટરો સુધી દોડે છે, એટલે સમુદ્ર નીચેના કેબલ પણ fibre ના જ હોય છે.',
          en: 'For long distances we use a thin strand of glass — fibre optic. Not electricity but flashes of light travel inside. Light runs for kilometres without fading, which is why undersea cables are fibre too.',
        },
        exam: {
          gu: 'Single-mode fibre 1310/1550 nm લેસર વાપરે અને 10–80 km સુધી પહોંચે; multi-mode LED/VCSEL વાપરે અને campus અંતર (~550 m) માટે સસ્તું પડે.',
          en: 'Single-mode fibre uses 1310/1550 nm lasers and reaches 10–80 km; multi-mode uses LEDs/VCSELs and is cheaper for campus distances (~550 m).',
        },
      },
      scene: (t) => ({
        nodes: [
          { ...copperPc('a', 180, 'Site A'), type: 'router' as const, accent: CCNA },
          { ...copperPc('b', 680, 'Site B'), type: 'router' as const, accent: CCNA },
        ],
        links: [{ id: 'ab', from: 'a', to: 'b', state: 'up', label: 'fibre · 40 km', flowing: t > 0.3 }],
        packets:
          t > 0.3
            ? [{ id: 'l', from: 'a', to: 'b', t: 0.08 + ease((t - 0.3) / 0.7) * 0.84, color: 'var(--nq-info)', label: '光 light' }]
            : [],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'હવા — રેડિયો તરંગ (WiFi)', en: 'Air — radio waves (WiFi)' },
      text: {
        beginner: {
          gu: 'ત્રીજું માધ્યમ કોઈ વાયર જ નથી — હવા. WiFi એ જ છે: Access Point રેડિયો તરંગ હવામાં છોડે, તમારો ફોન એ પકડે. વાયર નહીં એટલે સગવડ વધુ, પણ દીવાલ, અંતર અને બીજા લોકોના WiFi થી ખલેલ પણ વધુ.',
          en: 'The third medium is no cable at all — air. That is WiFi: an Access Point pushes radio waves into the air and your phone catches them. No wire means more convenience, but also more interference from walls, distance and the neighbours.',
        },
        exam: {
          gu: '802.11 2.4 GHz (દૂર પહોંચે, ધીમું, ભીડભાડ) અને 5/6 GHz (ઝડપી, ઓછું અંતર) વાપરે છે. Medium shared છે એટલે CSMA/CA થી collisions ટાળાય છે.',
          en: '802.11 uses 2.4 GHz (further, slower, crowded) and 5/6 GHz (faster, shorter range). The medium is shared, so CSMA/CA is used to avoid collisions.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ap', x: 430, y: 130, type: 'ap' as const, label: 'Access Point', sub: 'WiFi 6', accent: CCNP, pulse: true },
          { id: 'p1', x: 230, y: 290, type: 'laptop' as const, label: 'Laptop', accent: BEG },
          { id: 'p2', x: 630, y: 290, type: 'laptop' as const, label: 'Phone', accent: BEG },
        ],
        links: [
          { id: 'w1', from: 'ap', to: 'p1', state: 'up', flowing: true },
          { id: 'w2', from: 'ap', to: 'p2', state: 'up', flowing: true },
        ],
        packets: [
          { id: 'r1', from: 'ap', to: 'p1', t: 0.1 + ease(t) * 0.8, color: 'var(--nq-pkt-ctrl)' },
          { id: 'r2', from: 'ap', to: 'p2', t: 0.1 + ease(Math.max(0, t - 0.2) / 0.8) * 0.8, color: 'var(--nq-pkt-ctrl)' },
        ],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'ત્રણેય સાથે વપરાય', en: 'All three, together' },
      text: {
        beginner: {
          gu: 'સાચી દુનિયામાં ત્રણેય એકસાથે વપરાય છે. તમારો ફોન WiFi થી router સુધી, router તાંબાના વાયરથી બિલ્ડિંગના switch સુધી, અને ત્યાંથી fibre પર આખી દુનિયા સુધી. એક જ સંદેશ ત્રણ અલગ માધ્યમ બદલે છે — અને એને ખબર પણ નથી પડતી.',
          en: 'In the real world all three work together. Your phone reaches the router over WiFi, the router reaches the building switch over copper, and from there fibre carries it to the world. One message changes medium three times — and never notices.',
        },
        exam: {
          gu: 'Physical layer દરેક hop પર બદલાઈ શકે; upper layers ને એનો ફરક પડતો નથી. એ જ તો layered model નો મુખ્ય ફાયદો છે.',
          en: 'The physical layer can change at every hop and the upper layers are unaffected. That independence is the whole point of a layered model.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ph', x: 130, y: 240, type: 'laptop' as const, label: 'Phone', accent: BEG },
          { id: 'ap', x: 320, y: 240, type: 'ap' as const, label: 'AP', accent: CCNP },
          { id: 'sw', x: 500, y: 240, type: 'switch' as const, label: 'Switch', accent: CCNA },
          { id: 'cl', x: 700, y: 240, type: 'cloud' as const, label: 'Internet', accent: CCNA },
        ],
        links: [
          { id: 'l1', from: 'ph', to: 'ap', state: 'up', label: 'WiFi', flowing: true },
          { id: 'l2', from: 'ap', to: 'sw', state: 'up', label: 'copper', flowing: true },
          { id: 'l3', from: 'sw', to: 'cl', state: 'up', label: 'fibre', flowing: true },
        ],
        packets: [
          t < 0.34
            ? { id: 'p', from: 'ph', to: 'ap', t: ease(t / 0.34), color: 'var(--nq-pkt-data)' }
            : t < 0.67
              ? { id: 'p', from: 'ap', to: 'sw', t: ease((t - 0.34) / 0.33), color: 'var(--nq-pkt-data)' }
              : { id: 'p', from: 'sw', to: 'cl', t: ease((t - 0.67) / 0.33), color: 'var(--nq-pkt-data)' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'તાંબુ = સસ્તું, 100 મીટર સુધી, ઓફિસની અંદર. Fibre = મોંઘું, કિલોમીટરો સુધી, બિલ્ડિંગ અને શહેર જોડવા. WiFi = વાયર વગર, સગવડ માટે, પણ ખલેલ સાથે. એક જ packet આ ત્રણેયમાં થઈને જઈ શકે.',
    en: 'Copper = cheap, up to 100 m, inside an office. Fibre = costly, kilometres, joining buildings and cities. WiFi = no wire, convenient, but noisy. One packet can cross all three.',
  },
  check: {
    q: {
      gu: 'બે બિલ્ડિંગ 2 કિલોમીટર દૂર છે અને જોડવાં છે. શું વાપરશો?',
      en: 'Two buildings 2 km apart need to be connected. What do you use?',
    },
    options: [
      { gu: 'Fibre optic', en: 'Fibre optic' },
      { gu: 'લાંબો Ethernet વાયર', en: 'A very long Ethernet cable' },
      { gu: 'WiFi', en: 'WiFi' },
    ],
    answer: 0,
    explain: {
      gu: 'તાંબુ 100 મીટર પછી કામ ન કરે અને સામાન્ય WiFi આટલે દૂર ન પહોંચે. 2 કિમી માટે fibre એ એકમાત્ર ભરોસાપાત્ર જવાબ છે.',
      en: 'Copper gives up after 100 m and ordinary WiFi will not reach. At 2 km fibre is the only dependable answer.',
    },
  },
}

/* ------------------------------------------------------------------ b1l3 */

export const b1l3: LessonSpec = {
  why: {
    gu: 'LAN, WAN, Internet — આ ત્રણ શબ્દો રોજ સંભળાય છે પણ ફરક ધૂંધળો રહી જાય છે. ફરક ખરેખર એક જ વાતનો છે: નેટવર્ક કેટલું મોટું છે અને એનો માલિક કોણ છે.',
    en: 'LAN, WAN, Internet — three words you hear daily with a blurry line between them. The difference comes down to one thing: how big the network is and who owns it.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'LAN — એક જગ્યાનું નેટવર્ક', en: 'LAN — one place' },
      text: {
        beginner: {
          gu: 'LAN એટલે Local Area Network — એક જ ઘર, એક ઓફિસ કે એક માળનું નેટવર્ક. બધા વાયર અને switch તમારા પોતાના હોય છે, કોઈને ભાડું આપવું પડતું નથી. તમારા ઘરનું WiFi એ LAN જ છે.',
          en: 'A LAN is a Local Area Network — one home, one office, one floor. The cables and switches are yours; you pay no one rent for them. Your home WiFi is a LAN.',
        },
        exam: {
          gu: 'LAN એક single broadcast domain (અથવા VLAN દીઠ એક) હોય છે, high bandwidth અને low latency સાથે, અને સંપૂર્ણપણે organisation ની માલિકીનું હોય છે.',
          en: 'A LAN is a single broadcast domain (or one per VLAN), high bandwidth, low latency, and entirely owned by the organisation.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'sw', x: 430, y: 240, type: 'switch' as const, label: 'Switch', sub: 'your office', accent: BEG, pulse: true },
          { id: 'p1', x: 230, y: 130, type: 'pc' as const, label: 'PC1', accent: BEG },
          { id: 'p2', x: 430, y: 110, type: 'pc' as const, label: 'PC2', accent: BEG },
          { id: 'p3', x: 630, y: 130, type: 'pc' as const, label: 'PC3', accent: BEG },
        ],
        links: [
          { id: 'l1', from: 'sw', to: 'p1', state: 'up' },
          { id: 'l2', from: 'sw', to: 'p2', state: 'up' },
          { id: 'l3', from: 'sw', to: 'p3', state: 'up' },
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'WAN — બે જગ્યા જોડાય', en: 'WAN — two places joined' },
      text: {
        beginner: {
          gu: 'તમારી કંપનીની બીજી ઓફિસ બીજા શહેરમાં છે. બે LAN ને જોડતી લાંબી લાઈનને WAN કહે છે — Wide Area Network. આ લાઈન તમારી પોતાની નથી હોતી; ટેલિકોમ કંપની પાસેથી ભાડે લેવી પડે છે, અને એનું માસિક બિલ આવે છે.',
          en: 'Your company has another office in another city. The long line joining the two LANs is a WAN — a Wide Area Network. That line is not yours; you rent it from a telecom provider and a bill arrives every month.',
        },
        exam: {
          gu: 'WAN link service provider ની માલિકીની હોય છે (MPLS, leased line, broadband). LAN કરતાં ઓછું bandwidth અને વધુ latency — એટલે WAN પર શું મોકલવું એ કાળજીથી નક્કી થાય.',
          en: 'The WAN link is owned by a service provider (MPLS, leased line, broadband). Lower bandwidth and higher latency than a LAN, so what you send across it is chosen carefully.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's1', x: 180, y: 160, type: 'switch' as const, label: 'LAN · Surat', accent: BEG },
          { id: 'r1', x: 310, y: 265, type: 'router' as const, label: 'R1', accent: CCNA },
          { id: 'r2', x: 560, y: 265, type: 'router' as const, label: 'R2', accent: CCNA },
          { id: 's2', x: 690, y: 160, type: 'switch' as const, label: 'LAN · Mumbai', accent: BEG },
        ],
        links: [
          { id: 'a', from: 's1', to: 'r1', state: 'up' },
          { id: 'w', from: 'r1', to: 'r2', state: 'up', label: 'WAN · rented', flowing: t > 0.35 },
          { id: 'b', from: 'r2', to: 's2', state: 'up' },
        ],
        packets:
          t > 0.35
            ? [{ id: 'p', from: 'r1', to: 'r2', t: 0.1 + ease((t - 0.35) / 0.65) * 0.8, color: 'var(--nq-pkt-data)' }]
            : [],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'Internet — બધાનાં નેટવર્કનું નેટવર્ક', en: 'Internet — a network of networks' },
      text: {
        beginner: {
          gu: 'Internet કોઈ એક કંપનીનું નથી. એ દુનિયાભરનાં લાખો નેટવર્ક એકબીજા સાથે જોડાઈને બનેલું છે. તમારું ઘર, તમારી ઓફિસ, Google નો datacenter — બધાં પોતપોતાનાં નેટવર્ક છે, અને બધાં એકબીજા સાથે જોડાયેલાં છે.',
          en: 'The internet belongs to no single company. It is millions of separate networks worldwide, joined to each other. Your home, your office, a Google datacenter — each its own network, all interconnected.',
        },
        exam: {
          gu: 'Internet એ autonomous systems (AS) નો સમૂહ છે જે BGP વડે એકબીજા સાથે routes exchange કરે છે. દરેક AS નો પોતાનો માલિક અને પોતાની policy હોય છે.',
          en: 'The internet is a set of autonomous systems (AS) exchanging routes with each other over BGP. Each AS has its own owner and its own policy.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'home', x: 150, y: 290, type: 'laptop' as const, label: 'Your home', accent: BEG },
          { id: 'isp', x: 330, y: 200, type: 'router' as const, label: 'Your ISP', accent: CCNA },
          { id: 'net', x: 520, y: 140, type: 'cloud' as const, label: 'Internet', sub: 'millions of networks', accent: CCNP, pulse: t > 0.4 },
          { id: 'g', x: 700, y: 280, type: 'server' as const, label: 'Google', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'home', to: 'isp', state: 'up' },
          { id: 'b', from: 'isp', to: 'net', state: 'up', flowing: t > 0.3 },
          { id: 'c', from: 'net', to: 'g', state: 'up', flowing: t > 0.55 },
        ],
        packets:
          t > 0.3
            ? [
                t < 0.6
                  ? { id: 'p', from: 'isp', to: 'net', t: ease((t - 0.3) / 0.3), color: 'var(--nq-pkt-data)' }
                  : { id: 'p', from: 'net', to: 'g', t: ease((t - 0.6) / 0.4), color: 'var(--nq-pkt-data)' },
              ]
            : [],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'ત્રણેયનો નકશો', en: 'The map of all three' },
      text: {
        beginner: {
          gu: 'એક ચિત્રમાં ત્રણેય: અંદર LAN (તમારું), વચ્ચે WAN (ભાડે લીધેલું), બહાર Internet (બધાનું). ઘરથી શહેર અને શહેરથી દુનિયા — આ જ નકશો છે.',
          en: 'All three in one picture: the LAN inside (yours), the WAN in between (rented), the internet outside (everyone’s). Home to city to world — that is the whole map.',
        },
        exam: {
          gu: 'Classic enterprise hierarchy: access/distribution LAN → WAN edge router → service provider → internet. દરેક સીમા પર એક નવી administrative boundary આવે છે.',
          en: 'The classic enterprise hierarchy: access/distribution LAN → WAN edge router → service provider → internet. Each boundary is a new administrative domain.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'p1', x: 110, y: 140, type: 'pc' as const, label: 'PC', accent: BEG },
          { id: 'sw', x: 250, y: 220, type: 'switch' as const, label: 'LAN', sub: 'yours', accent: BEG },
          { id: 'r', x: 420, y: 220, type: 'router' as const, label: 'WAN edge', sub: 'rented', accent: CCNA },
          { id: 'cl', x: 620, y: 180, type: 'cloud' as const, label: 'Internet', sub: "everyone's", accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'p1', to: 'sw', state: 'up', label: 'LAN' },
          { id: 'b', from: 'sw', to: 'r', state: 'up' },
          { id: 'c', from: 'r', to: 'cl', state: 'up', label: 'WAN' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'LAN = એક જગ્યા, તમારી માલિકીનું, ઝડપી. WAN = બે જગ્યા જોડતી ભાડાની લાઈન, ધીમી અને ખર્ચાળ. Internet = બધાનાં નેટવર્ક એકબીજા સાથે જોડાયેલાં. ફરક કદનો છે અને માલિકીનો.',
    en: 'LAN = one place, owned by you, fast. WAN = a rented line joining two places, slower and costly. Internet = everyone’s networks joined together. The difference is size and ownership.',
  },
  check: {
    q: {
      gu: 'તમારી કંપનીની Surat અને Mumbai ઓફિસ જોડતી લાઈનને શું કહેવાય?',
      en: 'What do you call the line joining your company’s Surat and Mumbai offices?',
    },
    options: [
      { gu: 'WAN link', en: 'A WAN link' },
      { gu: 'LAN cable', en: 'A LAN cable' },
      { gu: 'Internet', en: 'The internet' },
    ],
    answer: 0,
    explain: {
      gu: 'બે અલગ જગ્યાનાં LAN ને જોડતી, સામાન્ય રીતે ભાડે લીધેલી લાંબી લાઈન એ WAN link છે.',
      en: 'A long, usually rented line joining LANs in two separate places is a WAN link.',
    },
  },
}

/* ------------------------------------------------------------------ b1l4 */

export const b1l4: LessonSpec = {
  why: {
    gu: 'દરેક વાતચીતમાં એક માગનાર હોય અને એક આપનાર. તમે browser ખોલો એ ક્ષણે તમે client બનો છો અને સામેનું મશીન server. આ એક જોડી સમજાઈ જાય પછી વેબ, email, DNS — બધું એક જ ઢાંચામાં બેસી જાય છે.',
    en: 'Every conversation has one side asking and one side answering. The moment you open a browser you are the client and the far machine is the server. Grasp that pairing and the web, email and DNS all fall into the same shape.',
  },
  steps: [
    {
      ms: 2400,
      label: { gu: 'Client — માગનાર', en: 'The client — who asks' },
      text: {
        beginner: {
          gu: 'Client એ મશીન છે જે કશુંક માગે છે. તમારો લેપટોપ, તમારો ફોન, તમારું TV — બધાં clients છે. એમનું કામ છે: પૂછવું, અને જવાબની રાહ જોવી. એ આખો દિવસ ચાલુ રહેવા જરૂરી નથી.',
          en: 'A client is the machine that asks for something. Your laptop, your phone, your TV — all clients. Their job is to ask and wait for an answer. They do not need to stay on all day.',
        },
        exam: {
          gu: 'Client TCP connection initiate કરે છે — એ ephemeral source port (49152–65535) વાપરે છે અને server ના well-known port તરફ જાય છે.',
          en: 'The client initiates the TCP connection, using an ephemeral source port (49152–65535) toward the server’s well-known port.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'c', x: 230, y: 230, type: 'laptop' as const, label: 'Client', sub: 'your laptop', accent: BEG, pulse: t > 0.3 },
          { id: 's', x: 650, y: 230, type: 'server' as const, label: 'Server', accent: CCNA, dim: true },
        ],
        links: [{ id: 'l', from: 'c', to: 's', state: 'idle' }],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'Server — આપનાર', en: 'The server — who answers' },
      text: {
        beginner: {
          gu: 'Server એ મશીન છે જે જવાબ આપે છે. એ ક્યારેય બંધ થતું નથી — રાત-દિવસ ચાલુ રહે છે, કારણ કે ક્યારે કોણ પૂછશે એની ખબર નથી. એક server હજારો clients ને એકસાથે જવાબ આપી શકે છે.',
          en: 'A server is the machine that answers. It never switches off — it runs day and night, because there is no telling when someone will ask. One server can answer thousands of clients at once.',
        },
        exam: {
          gu: 'Server એક known port પર listen કરે છે (HTTP 80, HTTPS 443) અને દરેક client ને અલગ socket આપે છે. એક જ port હજારો concurrent sessions સંભાળે છે.',
          en: 'The server listens on a known port (HTTP 80, HTTPS 443) and gives each client its own socket. A single port handles thousands of concurrent sessions.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'c', x: 230, y: 230, type: 'laptop' as const, label: 'Client', accent: BEG },
          { id: 's', x: 650, y: 230, type: 'server' as const, label: 'Server', sub: 'always on · :443', accent: CCNA, pulse: t > 0.3 },
        ],
        links: [{ id: 'l', from: 'c', to: 's', state: 'up' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'Request જાય', en: 'The request goes out' },
      text: {
        beginner: {
          gu: 'તમે browser માં સરનામું લખીને Enter દબાવો — એ ક્ષણે client એક request મોકલે છે: "મને આ પાનું આપો". એ request server સુધી પહોંચે છે અને client રાહ જુએ છે.',
          en: 'You type an address and press Enter — at that moment the client sends a request: "give me this page". It reaches the server and the client waits.',
        },
        exam: {
          gu: 'HTTP GET request server ના port 443 પર મોકલાય છે. Client નો ephemeral port જવાબ ક્યાં પાછો આવવો જોઈએ એ નક્કી કરે છે.',
          en: 'An HTTP GET is sent to the server’s port 443. The client’s ephemeral port decides where the answer must come back to.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'c', x: 230, y: 230, type: 'laptop' as const, label: 'Client', accent: BEG },
          { id: 's', x: 650, y: 230, type: 'server' as const, label: 'Server', accent: CCNA },
        ],
        links: [{ id: 'l', from: 'c', to: 's', state: 'up', flowing: true }],
        packets: [
          { id: 'q', from: 'c', to: 's', t: 0.08 + ease(t) * 0.84, color: 'var(--nq-pkt-data)', label: 'GET /page' },
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'Response પાછો આવે', en: 'The response comes back' },
      text: {
        beginner: {
          gu: 'Server પાનું શોધે છે અને પાછું મોકલે છે. તમારા screen પર website દેખાય એ આ જવાબ જ છે. પૂછવું અને જવાબ મળવો — આખો વેબ આના પર જ ચાલે છે, સેકન્ડમાં કરોડો વાર.',
          en: 'The server finds the page and sends it back. The website appearing on your screen is that answer. Ask and answer — the entire web runs on this, millions of times a second.',
        },
        exam: {
          gu: 'Server HTTP 200 OK અને body મોકલે છે. Source/destination ports ઊલટાં થાય છે, એટલે client નું OS જાણે કે આ જવાબ કઈ application નો છે.',
          en: 'The server replies HTTP 200 OK with a body. Source and destination ports are swapped so the client OS knows which application the answer belongs to.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'c', x: 230, y: 230, type: 'laptop' as const, label: 'Client', accent: BEG, pulse: t > 0.8 },
          { id: 's', x: 650, y: 230, type: 'server' as const, label: 'Server', accent: CCNA },
        ],
        links: [{ id: 'l', from: 'c', to: 's', state: 'up', flowing: true }],
        packets: [
          { id: 'a', from: 's', to: 'c', t: 0.08 + ease(t) * 0.84, color: 'var(--nq-ok)', label: '200 OK · page' },
        ],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'એક server, ઘણા clients', en: 'One server, many clients' },
      text: {
        beginner: {
          gu: 'એક જ server એકસાથે હજારો લોકોને જવાબ આપી શકે છે. એટલે જ Google નો એક server તમને, મને અને બીજા લાખો લોકોને એકસાથે સંભાળે છે — દરેકને પોતાનો અલગ જવાબ મળે છે.',
          en: 'One server can answer thousands of people at once. That is how a Google server handles you, me and a million others simultaneously — each getting their own answer.',
        },
        exam: {
          gu: 'દરેક session ને unique 5-tuple ઓળખે છે: source IP, source port, destination IP, destination port, protocol. એ જ કારણે એક listening port પર હજારો sessions ગૂંચવાતી નથી.',
          en: 'Each session is identified by a unique 5-tuple: source IP, source port, destination IP, destination port, protocol. That is why thousands of sessions on one listening port never get confused.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'c1', x: 170, y: 120, type: 'laptop' as const, label: 'Client 1', accent: BEG },
          { id: 'c2', x: 170, y: 240, type: 'pc' as const, label: 'Client 2', accent: BEG },
          { id: 'c3', x: 170, y: 355, type: 'laptop' as const, label: 'Client 3', accent: BEG },
          { id: 's', x: 650, y: 240, type: 'server' as const, label: 'Server', sub: ':443', accent: CCNA, pulse: true },
        ],
        links: [
          { id: 'a', from: 'c1', to: 's', state: 'up', flowing: true },
          { id: 'b', from: 'c2', to: 's', state: 'up', flowing: true },
          { id: 'c', from: 'c3', to: 's', state: 'up', flowing: true },
        ],
        packets: [
          { id: 'p1', from: 's', to: 'c1', t: 0.1 + ease(t) * 0.8, color: 'var(--nq-ok)' },
          { id: 'p2', from: 's', to: 'c2', t: 0.1 + ease(Math.max(0, t - 0.15) / 0.85) * 0.8, color: 'var(--nq-ok)' },
          { id: 'p3', from: 's', to: 'c3', t: 0.1 + ease(Math.max(0, t - 0.3) / 0.7) * 0.8, color: 'var(--nq-ok)' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Client પૂછે, server જવાબ આપે. Client ગમે ત્યારે બંધ થઈ શકે; server હંમેશા ચાલુ રહે. વેબ, email, DNS, file sharing — બધી સેવાઓ આ એક જ જોડીની ઉપર બનેલી છે.',
    en: 'The client asks, the server answers. A client may switch off any time; a server stays up. The web, email, DNS, file sharing — every service is built on that one pairing.',
  },
  check: {
    q: {
      gu: 'Server ની સૌથી અગત્યની ખાસિયત કઈ છે?',
      en: 'What is the defining trait of a server?',
    },
    options: [
      { gu: 'એ હંમેશા ચાલુ રહીને request ની રાહ જુએ છે', en: 'It stays on, waiting for requests' },
      { gu: 'એ ક્યારેય internet સાથે જોડાતું નથી', en: 'It never connects to the internet' },
      { gu: 'એની પાસે screen મોટું હોય છે', en: 'It has a bigger screen' },
    ],
    answer: 0,
    explain: {
      gu: 'Server નું કામ જ જવાબ આપવાનું છે, એટલે એ હંમેશા ચાલુ રહીને listen કરતું હોવું જોઈએ — ક્યારે request આવશે એની ખબર નથી.',
      en: 'A server exists to answer, so it must stay up and listening — there is no telling when a request will arrive.',
    },
  },
}

/* ------------------------------------------------------------------ b1l5 */

export const b1l5: LessonSpec = {
  why: {
    gu: 'દરેક નેટવર્કમાં એક જ પાંચ-છ પ્રકારનાં ઉપકરણ ફરી ફરી દેખાય છે. દરેકનું કામ એક વાક્યમાં ખબર હોય તો કોઈ પણ network diagram જોઈને તરત સમજાઈ જાય કે ક્યાં શું થઈ રહ્યું છે.',
    en: 'Every network is built from the same five or six kinds of device. Know each one’s job in a sentence and you can read any network diagram at a glance.',
  },
  steps: [
    {
      ms: 2400,
      label: { gu: 'PC — વાત કરનાર', en: 'The PC — who talks' },
      text: {
        beginner: {
          gu: 'શરૂઆત end device થી: PC, લેપટોપ, ફોન, પ્રિન્ટર. આ એ મશીનો છે જે ખરેખર વાત કરે છે — બાકીનાં બધાં ઉપકરણો તો ફક્ત એમની વાત પહોંચાડવા માટે જ છે.',
          en: 'Start with the end devices: PCs, laptops, phones, printers. These are the machines that actually talk — every other device exists only to carry their conversation.',
        },
        exam: {
          gu: 'End devices (hosts) traffic ના source અને destination હોય છે. દરેક પાસે NIC, એક IP address અને એક default gateway હોય છે.',
          en: 'End devices (hosts) are the source and destination of traffic. Each has a NIC, an IP address and a default gateway.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'p1', x: 250, y: 230, type: 'pc' as const, label: 'PC', accent: BEG, pulse: true },
          { id: 'p2', x: 450, y: 230, type: 'laptop' as const, label: 'Laptop', accent: BEG },
          { id: 'p3', x: 640, y: 230, type: 'laptop' as const, label: 'Phone', accent: BEG },
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'Switch — ઓફિસની અંદરનો ટપાલી', en: 'The switch — the local postman' },
      text: {
        beginner: {
          gu: 'Switch એક જ ઓફિસનાં બધાં મશીનોને જોડે છે. એનું કામ એક જ છે: જે frame આવે એને સાચા port પર મોકલવો — બધા પર નહીં, ફક્ત જેના માટે છે એના પર. એ ઓફિસની અંદરનો ટપાલી છે.',
          en: 'A switch joins all the machines in one office. Its one job: send each frame out of the right port — not every port, only the one it belongs to. It is the postman inside the building.',
        },
        exam: {
          gu: 'Switch Layer 2 પર કામ કરે છે, MAC address table શીખે છે અને frames ને destination MAC પ્રમાણે forward કરે છે. દરેક port એક separate collision domain છે.',
          en: 'A switch works at Layer 2, learns a MAC address table and forwards frames by destination MAC. Every port is its own collision domain.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 430, y: 250, type: 'switch' as const, label: 'Switch', accent: CCNA, pulse: true },
          { id: 'p1', x: 220, y: 130, type: 'pc' as const, label: 'PC1', accent: BEG },
          { id: 'p2', x: 430, y: 110, type: 'pc' as const, label: 'PC2', accent: BEG },
          { id: 'p3', x: 640, y: 130, type: 'pc' as const, label: 'PC3', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'sw', to: 'p1', state: 'up', flowing: t > 0.25 },
          { id: 'b', from: 'sw', to: 'p2', state: 'up' },
          { id: 'c', from: 'sw', to: 'p3', state: 'up', flowing: t > 0.5 },
        ],
        packets:
          t > 0.25
            ? [
                t < 0.5
                  ? { id: 'p', from: 'p1', to: 'sw', t: ease((t - 0.25) / 0.25), color: 'var(--nq-pkt-data)' }
                  : { id: 'p', from: 'sw', to: 'p3', t: ease((t - 0.5) / 0.5), color: 'var(--nq-pkt-data)' },
              ]
            : [],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'Router — બહાર જવાનો દરવાજો', en: 'The router — the way out' },
      text: {
        beginner: {
          gu: 'Switch ઓફિસની અંદર કામ કરે છે. પણ બીજા નેટવર્કમાં જવું હોય તો? ત્યાં router આવે છે. એ બે અલગ નેટવર્ક વચ્ચે ઊભો રહે છે અને નક્કી કરે છે કે packet કયા રસ્તે આગળ જાય. એ તમારું બહાર જવાનું બારણું છે.',
          en: 'A switch works inside the office. But to reach another network? That is the router. It stands between two different networks and decides which way a packet goes next. It is your door to the outside.',
        },
        exam: {
          gu: 'Router Layer 3 પર કામ કરે છે, routing table માં longest-prefix match કરીને next hop નક્કી કરે છે, અને દરેક interface એક separate broadcast domain હોય છે.',
          en: 'A router works at Layer 3, picks the next hop by longest-prefix match in the routing table, and each interface is its own broadcast domain.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 230, y: 250, type: 'switch' as const, label: 'Switch', accent: CCNA },
          { id: 'r', x: 450, y: 250, type: 'router' as const, label: 'Router', sub: 'gateway', accent: CCNP, pulse: true },
          { id: 'cl', x: 670, y: 220, type: 'cloud' as const, label: 'Internet', accent: CCNA },
          { id: 'p1', x: 150, y: 130, type: 'pc' as const, label: 'PC1', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'p1', to: 'sw', state: 'up' },
          { id: 'b', from: 'sw', to: 'r', state: 'up', flowing: t > 0.2 },
          { id: 'c', from: 'r', to: 'cl', state: 'up', flowing: t > 0.55 },
        ],
        packets:
          t > 0.2
            ? [
                t < 0.55
                  ? { id: 'p', from: 'sw', to: 'r', t: ease((t - 0.2) / 0.35), color: 'var(--nq-pkt-data)' }
                  : { id: 'p', from: 'r', to: 'cl', t: ease((t - 0.55) / 0.45), color: 'var(--nq-pkt-data)' },
              ]
            : [],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'Firewall — દરવાજા પરનો ચોકીદાર', en: 'The firewall — the guard' },
      text: {
        beginner: {
          gu: 'Router બધું બહાર-અંદર જવા દે છે. Firewall એની બાજુમાં ઊભો રહીને જુએ છે કે કોને અંદર આવવા દેવું અને કોને નહીં. અંદરથી બહાર જવું સામાન્ય રીતે છૂટ; બહારથી અંદર આવવું ફક્ત પરવાનગી સાથે.',
          en: 'A router lets everything in and out. A firewall stands beside it deciding who may come in and who may not. Outbound is usually allowed; inbound only with permission.',
        },
        exam: {
          gu: 'Firewall stateful inspection કરે છે: outbound session ની entry યાદ રાખે અને એના જ return traffic ને પાછું આવવા દે. Unsolicited inbound traffic default માં deny થાય.',
          en: 'A firewall does stateful inspection: it remembers the outbound session and permits only its return traffic. Unsolicited inbound traffic is denied by default.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 180, y: 240, type: 'switch' as const, label: 'LAN', accent: CCNA },
          { id: 'fw', x: 400, y: 240, type: 'firewall' as const, label: 'Firewall', accent: 'var(--nq-err)', pulse: true },
          { id: 'cl', x: 650, y: 240, type: 'cloud' as const, label: 'Internet', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'sw', to: 'fw', state: 'up', flowing: true },
          { id: 'b', from: 'fw', to: 'cl', state: 'up', flowing: true },
        ],
        packets:
          t < 0.5
            ? [{ id: 'out', from: 'sw', to: 'fw', t: ease(t / 0.5), color: 'var(--nq-ok)', label: 'out · allowed' }]
            : [{ id: 'in', from: 'cl', to: 'fw', t: ease((t - 0.5) / 0.5) * 0.55, color: 'var(--nq-err)', label: 'in · blocked' }],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'બધાં સાથે — એક સાચું નેટવર્ક', en: 'All together — a real network' },
      text: {
        beginner: {
          gu: 'હવે બધાં સાથે ગોઠવો: PC → Switch → Router → Firewall → Internet, અને ક્યાંક એક Server. દુનિયાનું લગભગ દરેક ઓફિસ નેટવર્ક આ જ આકારનું હોય છે. CCNA ની આખી પરીક્ષા આ ચિત્રને સમજવા અને ગોઠવવા વિશે જ છે.',
          en: 'Now put them together: PC → Switch → Router → Firewall → Internet, with a server somewhere. Nearly every office network in the world has this shape. The whole CCNA exam is about understanding and configuring this picture.',
        },
        exam: {
          gu: 'આ standard enterprise edge design છે: access switch, distribution/core, edge router, firewall, અને DMZ માં servers. આગળના દરેક પાઠ આ ઢાંચાના એક ટુકડા પર ઊંડે જશે.',
          en: 'This is the standard enterprise edge design: access switch, distribution/core, edge router, firewall, and servers in a DMZ. Every later lesson goes deeper into one piece of this frame.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p1', x: 110, y: 130, type: 'pc' as const, label: 'PC1', accent: BEG },
          { id: 'p2', x: 110, y: 330, type: 'laptop' as const, label: 'PC2', accent: BEG },
          { id: 'sw', x: 280, y: 230, type: 'switch' as const, label: 'Switch', accent: CCNA },
          { id: 'r', x: 440, y: 230, type: 'router' as const, label: 'Router', accent: CCNP },
          { id: 'fw', x: 590, y: 230, type: 'firewall' as const, label: 'Firewall', accent: 'var(--nq-err)' },
          { id: 'cl', x: 740, y: 150, type: 'cloud' as const, label: 'Internet', accent: CCNA },
          { id: 'srv', x: 740, y: 340, type: 'server' as const, label: 'Server', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'p1', to: 'sw', state: 'up' },
          { id: 'b', from: 'p2', to: 'sw', state: 'up' },
          { id: 'c', from: 'sw', to: 'r', state: 'up', flowing: t > 0.2 },
          { id: 'd', from: 'r', to: 'fw', state: 'up', flowing: t > 0.45 },
          { id: 'e', from: 'fw', to: 'cl', state: 'up', flowing: t > 0.7 },
          { id: 'f', from: 'fw', to: 'srv', state: 'up' },
        ],
        packets:
          t > 0.2
            ? [
                t < 0.45
                  ? { id: 'p', from: 'sw', to: 'r', t: ease((t - 0.2) / 0.25), color: 'var(--nq-pkt-data)' }
                  : t < 0.7
                    ? { id: 'p', from: 'r', to: 'fw', t: ease((t - 0.45) / 0.25), color: 'var(--nq-pkt-data)' }
                    : { id: 'p', from: 'fw', to: 'cl', t: ease((t - 0.7) / 0.3), color: 'var(--nq-pkt-data)' },
              ]
            : [],
      }),
    },
  ],
  takeaway: {
    gu: 'PC વાત કરે. Switch એક જ નેટવર્કની અંદર પહોંચાડે. Router બે નેટવર્ક વચ્ચે રસ્તો કાઢે. Firewall કોને આવવા દેવું એ નક્કી કરે. Server જવાબ આપે. બસ, આખા નેટવર્કમાં આ પાંચ જ પાત્રો છે.',
    en: 'A PC talks. A switch delivers inside one network. A router finds a path between networks. A firewall decides who may enter. A server answers. Those five are the entire cast.',
  },
  check: {
    q: {
      gu: 'તમારે બે અલગ નેટવર્ક જોડવાં છે. કયું ઉપકરણ જોઈએ?',
      en: 'You need to join two different networks. Which device do you need?',
    },
    options: [
      { gu: 'Router', en: 'A router' },
      { gu: 'Switch', en: 'A switch' },
      { gu: 'બીજો એક PC', en: 'Another PC' },
    ],
    answer: 0,
    explain: {
      gu: 'Switch એક જ નેટવર્કની અંદર કામ કરે છે. બે અલગ નેટવર્ક વચ્ચે રસ્તો કાઢવાનું કામ router નું છે.',
      en: 'A switch works inside one network. Finding a path between two different networks is the router’s job.',
    },
  },
}
