import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const OK = 'var(--nq-ok)'
const ERR = 'var(--nq-err)'
const MUTE = 'var(--nq-text-mute)'
const H = (gu: string, en: string) => ({ gu, en })

/* ═══════════════════ n2l7 · CDP and LLDP ═══════════════════ */

export const n2l7: LessonSpec = {
  why: {
    gu: 'કોઈ નકશો નથી, કોઈ label નથી, અને રૅકમાં વીસ કેબલ. એક command તમને કહી દે કે **આ port ના બીજા છેડે કોણ છે** — અને એ જ command હુમલાખોરને પણ એ જ કહી દે. આ પાઠ એ બંને બાજુનો છે.',
    en: 'No diagram, no labels, twenty cables in the rack. One command tells you **who is on the far end of this port** — and tells an attacker exactly the same thing. This lesson is both sides of that.',
  },
  steps: [
    {
      ms: 3000,
      label: H('દરેક ઉપકરણ પોતાનું નામ પોકારે', 'Every device calls out its own name'),
      text: {
        beginner: {
          gu: 'દર 60 સેકન્ડે દરેક Cisco ઉપકરણ પોતાના દરેક port પર એક નાનું announcement મોકલે: "હું SW1 છું, Catalyst 2960, આ મારો port Gi0/1, IOS આ version". કોઈ પૂછતું નથી — એ જાતે જ બોલે છે.',
          en: 'Every sixty seconds each Cisco device sends a small announcement out of every port: "I am SW1, a Catalyst 2960, this is my port Gi0/1, and here is my IOS version." Nobody asked. It simply says so.',
        },
        exam: {
          gu: 'CDP Cisco નું પોતાનું, Layer 2 પર ચાલે — એટલે IP સરનામાં વગર પણ કામ કરે. Default: 60 સેકન્ડે announcement, 180 સેકન્ડ holdtime.',
          en: 'CDP is Cisco’s own and runs at Layer 2, so it works even with no IP addresses configured at all. By default it announces every 60 seconds with a 180-second holdtime.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw1', x: 220, y: 200, type: 'switch', label: 'SW1', sub: 'Catalyst 2960', accent: CCNA, pulse: t > 0.3 },
          { id: 'sw2', x: 650, y: 200, type: 'switch', label: 'SW2', accent: CCNA },
        ],
        links: [{ id: 'l', from: 'sw1', to: 'sw2', state: 'up', flowing: t > 0.25 }],
        packets:
          t > 0.3
            ? [{ id: 'p', from: 'sw1', to: 'sw2', t: 0.15 + ease((t - 0.3) / 0.7) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'I am SW1, port Gi0/1' }]
            : [],
      }),
      say: (t) => (t > 0.5 ? { nodeId: 'sw1', text: H('કોઈએ પૂછ્યું નથી — તોય', 'nobody asked — all the same') } : null),
    },
    {
      ms: 3200,
      label: H('એક command, આખો નકશો', 'One command, the whole map'),
      text: {
        beginner: {
          gu: 'બધા પાડોશી સાંભળીને યાદી બનાવે. `show cdp neighbors` ચલાવો અને **તમારા રૅકનો નકશો** મળી જાય: કયા port પર કોણ, અને એના કયા port પર. Label વગરના રૅકમાં આ સોનું છે.',
          en: 'Every neighbour listens and keeps a list. Run `show cdp neighbors` and you get **a map of your own rack**: who is on which port, and which of their ports it is. In an unlabelled rack this is gold.',
        },
        exam: {
          gu: '`show cdp neighbors detail` પાડોશીનું IP સરનામું પણ આપે — એટલે ત્યાં telnet/SSH કરી શકાય, ભલે એનું સરનામું ક્યાંય લખ્યું ન હોય.',
          en: '`show cdp neighbors detail` adds the neighbour’s IP address, which lets you SSH straight there even when that address is written down nowhere.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw1', x: 400, y: 200, type: 'switch', label: 'SW1', sub: 'you are here', accent: OK, pulse: true },
          { id: 'sw2', x: 730, y: 90, type: 'switch', label: 'SW2', accent: t > 0.3 ? CCNA : MUTE },
          { id: 'r1', x: 730, y: 320, type: 'router', label: 'R1', accent: t > 0.5 ? CCNA : MUTE },
          { id: 'ap', x: 130, y: 200, type: 'ap', label: 'AP-12', accent: t > 0.7 ? CCNP : MUTE },
        ],
        links: [
          { id: 'a', from: 'sw1', to: 'sw2', state: 'up', flowing: t > 0.3 },
          { id: 'b', from: 'sw1', to: 'r1', state: 'up', flowing: t > 0.5 },
          { id: 'c', from: 'ap', to: 'sw1', state: 'up', flowing: t > 0.7 },
        ],
      }),
      aside: (t) => ({
        title: H('show cdp neighbors', 'show cdp neighbors'),
        caption: H('રૅક ખોલ્યા વગર બનેલો નકશો.', 'A map built without opening the rack.'),
        head: ['my port', 'neighbour', 'their port'],
        rows: [
          ...(t > 0.3 ? [['Gi0/1', 'SW2', 'Gi0/2']] : []),
          ...(t > 0.5 ? [['Gi0/24', 'R1', 'Gi0/0']] : []),
          ...(t > 0.7 ? [['Fa0/5', 'AP-12', 'Gi0']] : []),
        ],
        empty: H('હજી કોઈ પાડોશી સંભળાયો નથી…', 'no neighbour heard yet…'),
      }),
    },
    {
      ms: 3000,
      label: H('LLDP — બધા માટેનું', 'LLDP — the one everybody speaks'),
      text: {
        beginner: {
          gu: 'CDP ફક્ત Cisco ઉપકરણો વચ્ચે ચાલે. તમારા રૅકમાં HP નું switch કે Aruba નું AP હોય તો એ CDP માં **દેખાશે નહીં**. LLDP એ જ કામનું ખુલ્લું ધોરણ છે — બધી કંપનીઓ સમજે. ફરક એટલો કે એ મોટાભાગે **બંધ** આવે, એટલે ચાલુ કરવું પડે.',
          en: 'CDP only works between Cisco devices. An HP switch or an Aruba AP in your rack simply **will not appear**. LLDP is the open standard for the same job, which every vendor understands. The catch is that it usually ships **switched off**, so you have to turn it on.',
        },
        exam: {
          gu: 'Global પર `lldp run`, પછી interface પર `lldp transmit` અને `lldp receive`. જોવા માટે `show lldp neighbors`. બંને સાથે ચાલી શકે.',
          en: 'Turn it on globally with `lldp run`, then `lldp transmit` and `lldp receive` on the interface, and read it with `show lldp neighbors`. Both protocols can run at once.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw1', x: 400, y: 200, type: 'switch', label: 'SW1', sub: 'Cisco', accent: OK, pulse: true },
          { id: 'c', x: 730, y: 110, type: 'switch', label: 'SW2', sub: 'Cisco — seen by CDP', accent: CCNA },
          { id: 'o', x: 730, y: 320, type: 'switch', label: 'HP switch', sub: t > 0.5 ? 'seen, once LLDP is on' : 'invisible to CDP', accent: t > 0.5 ? OK : ERR, pulse: t > 0.5 },
        ],
        links: [
          { id: 'a', from: 'sw1', to: 'c', state: 'up', flowing: true },
          { id: 'b', from: 'sw1', to: 'o', state: t > 0.5 ? 'up' : 'idle', flowing: t > 0.5 },
        ],
        packets:
          t > 0.55
            ? [{ id: 'p', from: 'o', to: 'sw1', t: 0.15 + ease((t - 0.55) / 0.45) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'LLDP: I am here too' }]
            : [],
      }),
      aside: () => ({
        title: H('બે પ્રોટોકોલ, એક કામ', 'Two protocols, one job'),
        head: ['', 'CDP', 'LLDP'],
        rows: [
          ['works with', 'Cisco only', 'every vendor'],
          ['out of the box', 'on', 'off'],
          ['turn it on', '—', 'lldp run'],
        ],
      }),
    },
    {
      ms: 3400,
      label: H('એ જ ભેટ હુમલાખોરને', 'The same gift, to an attacker'),
      text: {
        beginner: {
          gu: 'હવે ઊંધી બાજુ. કોઈ reception ના ખાલી port માં લેપટોપ ભરાવે અને સાંભળે — switch એને **પોતાની મેળે** કહી દેશે: model કયું, IOS કયું version, port કયો. જૂના IOS ની જાણીતી નબળાઈ શોધવા માટે એટલું પૂરતું છે.',
          en: 'Now the other way round. Somebody plugs a laptop into a spare port in reception and listens — and the switch tells them, **unprompted**: which model, which IOS version, which port. That is quite enough to go looking up a known weakness in an old IOS.',
        },
        exam: {
          gu: 'એટલે નિયમ: વપરાશકર્તાના ports અને ખાસ કરીને બહાર જતી લિંક પર બંધ કરો. Interface પર `no cdp enable`, આખા ઉપકરણ પર `no cdp run`. IP Phone વાળા ports પર ચાલુ રાખવું પડે — ત્યાં CDP જ voice VLAN આપે છે.',
          en: 'Hence the rule: switch it off on user ports and especially on anything facing outward — `no cdp enable` on the interface, `no cdp run` for the whole device. Keep it on where IP phones live, though: CDP is what hands them their voice VLAN.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 400, y: 200, type: 'switch', label: 'SW1', sub: t > 0.6 ? 'no cdp enable' : 'Catalyst 2960, IOS 15.0(2)', accent: t > 0.6 ? OK : ERR, pulse: true },
          { id: 'bad', x: 740, y: 200, type: 'laptop', label: 'reception port', sub: t > 0.6 ? 'hears nothing' : 'listening', accent: t > 0.6 ? MUTE : ERR },
        ],
        links: [{ id: 'l', from: 'sw', to: 'bad', state: t > 0.6 ? 'idle' : 'up', flowing: t <= 0.6 }],
        packets:
          t < 0.6
            ? [{ id: 'p', from: 'sw', to: 'bad', t: 0.15 + ease(t / 0.6) * 0.7, color: ERR, label: 'model + IOS version' }]
            : [],
      }),
      say: (t) =>
        t > 0.65 ? { nodeId: 'bad', text: H('હવે કશું સંભળાતું નથી', 'nothing to hear now') } : null,
      aside: (t) => ({
        title: H('એ port પર શું સંભળાય', 'What is audible on that port'),
        head: ['field', 'given away'],
        rows: t > 0.6 ? [] : [
          ['device', 'SW1'],
          ['platform', 'cisco WS-C2960-24TT-L'],
          ['version', 'IOS 15.0(2)SE'],
          ['port', 'FastEthernet0/8'],
        ],
        empty: H('કશું નહીં — CDP એ port પર બંધ છે.', 'Nothing — CDP is off on that port.'),
      }),
    },
    {
      ms: 2800,
      label: H('ક્યાં ચાલુ, ક્યાં બંધ', 'On where, off where'),
      text: {
        beginner: {
          gu: 'નિયમ યાદ રાખવો સહેલો છે. **અંદરની તરફ** — switch થી switch, switch થી router — ચાલુ રાખો: ત્યાં એ તમને રૅકનો નકશો આપે છે. **બહારની તરફ** — વપરાશકર્તાના port, ISP ની લિંક, મહેમાનનું Wi-Fi — બંધ કરો: ત્યાં એ ફક્ત માહિતી આપી દે છે.',
          en: 'The rule is easy to hold on to. **Facing inward** — switch to switch, switch to router — leave it on: there it hands you a map of your rack. **Facing outward** — user ports, the ISP link, guest Wi-Fi — turn it off: there it only hands information away.',
        },
        exam: {
          gu: 'ISP તરફ CDP ચાલુ રાખવું એ ખાસ ખરાબ છે — તમારા નેટવર્કની વિગત બીજી કંપનીને પહોંચે. અને CDP/LLDP neighbour હોવું એ "લિંક ઠીક છે" નો પુરાવો નથી: એ Layer 2 પૂરતું છે, IP ખોટું હોય તોય એ દેખાશે.',
          en: 'Leaving CDP on towards an ISP is particularly poor — your internal detail lands in another company. And a CDP or LLDP neighbour is not proof the link is healthy: it only proves Layer 2, and it will still appear with the IP addressing completely wrong.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'u', x: 130, y: 110, type: 'pc', label: 'user port', sub: 'off', accent: MUTE },
          { id: 'sw', x: 400, y: 200, type: 'switch', label: 'SW1', accent: CCNA, pulse: true },
          { id: 'sw2', x: 400, y: 350, type: 'switch', label: 'SW2', sub: 'on', accent: OK },
          { id: 'r', x: 680, y: 110, type: 'router', label: 'R1', sub: 'on', accent: OK },
          { id: 'isp', x: 760, y: 320, type: 'cloud', label: 'ISP', sub: 'off', accent: MUTE },
        ],
        links: [
          { id: 'a', from: 'u', to: 'sw', state: 'idle' },
          { id: 'b', from: 'sw', to: 'sw2', state: 'up', flowing: true },
          { id: 'c', from: 'sw', to: 'r', state: 'up', flowing: true },
          { id: 'd', from: 'r', to: 'isp', state: 'idle' },
        ],
      }),
      aside: () => ({
        title: H('સાદો નિયમ', 'The simple rule'),
        head: ['link faces', 'CDP / LLDP'],
        rows: [
          ['your own kit', 'on — it is your map'],
          ['a user or a guest', 'off'],
          ['another company', 'off, always'],
          ['an IP phone', 'on — it needs it'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'CDP અને LLDP દર મિનિટે પોતાનું નામ, model અને port પોકારે છે — એટલે `show cdp neighbors` તમને label વગરના રૅકનો નકશો આપી દે. CDP ફક્ત Cisco, LLDP બધા માટે પણ **બંધ આવે** (`lldp run`). અને એ જ માહિતી કોઈ પણ સાંભળી શકે, એટલે **અંદર ચાલુ, બહાર બંધ**.',
    en: 'CDP and LLDP call out their name, model and port every minute, which is how `show cdp neighbors` hands you a map of an unlabelled rack. CDP is Cisco-only; LLDP works with everyone but **ships off** (`lldp run`). And anyone can listen to the same announcement, so: **on facing inward, off facing out**.',
  },
  check: {
    q: H(
      'તમારા Cisco switch પર HP નું switch જોડાયેલું છે પણ `show cdp neighbors` માં દેખાતું નથી. કારણ?',
      'An HP switch is plugged into your Cisco switch but does not appear in `show cdp neighbors`. Why?',
    ),
    options: [
      H('CDP ફક્ત Cisco નું છે — LLDP ચાલુ કરો', 'CDP is Cisco-only — turn on LLDP'),
      H('કેબલ ખરાબ છે', 'The cable is faulty'),
      H('બંનેનાં IP સરનામાં જુદા subnet માં છે', 'Their IP addresses are in different subnets'),
    ],
    answer: 0,
    explain: H(
      'CDP Cisco નું પોતાનું protocol છે, એટલે બીજી કંપનીનું ઉપકરણ એ બોલતું જ નથી. બંને બાજુ `lldp run` કરો અને એ દેખાશે. કેબલ ખરાબ હોત તો port જ નીચે હોત, અને CDP/LLDP Layer 2 પર ચાલે — IP સાથે એને કશી લેવાદેવા નથી.',
      'CDP is Cisco’s own protocol, so another vendor’s device simply does not speak it. Run `lldp run` on both sides and it appears. A faulty cable would have left the port down, and CDP and LLDP work at Layer 2 — the IP addressing has nothing to do with it.',
    ),
  },
}
