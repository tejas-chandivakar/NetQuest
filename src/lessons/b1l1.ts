import type { LessonSpec } from '../components/AnimatedLesson'
import type { NodeSpec } from '../components/Topology'
import { ease } from '../lib/useStepPlayer'

const A = (sub?: string): NodeSpec => ({
  id: 'a',
  x: 215,
  y: 205,
  type: 'pc',
  label: 'Computer A',
  sub,
  accent: 'var(--nq-beginner)',
})

const B = (sub?: string): NodeSpec => ({
  id: 'b',
  x: 645,
  y: 205,
  type: 'pc',
  label: 'Computer B',
  sub,
  accent: 'var(--nq-ccna)',
})

const IP_A = '192.168.1.10'
const IP_B = '192.168.1.20'

export const b1l1: LessonSpec = {
  why: {
    gu: 'આખું ઈન્ટરનેટ — દુનિયાના કરોડો કમ્પ્યુટર — આ એક જ વાત પર ઊભું છે: બે મશીન એકબીજાને સંદેશ મોકલે. એ એક વાત સમજાઈ જાય, પછી બાકીનું બધું એનું જ મોટું સ્વરૂપ છે.',
    en: 'The entire internet — hundreds of millions of machines — rests on one idea: two machines sending each other a message. Understand that one thing and everything else is just a bigger version of it.',
  },
  steps: [
    {
      ms: 2200,
      label: { gu: 'બે કમ્પ્યુટર, પણ એકલાં', en: 'Two computers, alone' },
      text: {
        beginner: {
          gu: 'અહીં બે કમ્પ્યુટર છે. બંને ચાલુ છે, બંને કામ કરે છે — પણ એકબીજા વિશે કશું જ જાણતાં નથી. વચ્ચે કોઈ રસ્તો નથી, એટલે કોઈ વાત થઈ શકતી નથી. આ સ્થિતિને આપણે "network નથી" કહીએ.',
          en: 'Here are two computers. Both are powered on and working — but neither knows the other exists. There is no path between them, so no conversation can happen. This is what "no network" looks like.',
        },
        exam: {
          gu: 'બે end devices (hosts), બંને પાસે NIC છે, પણ કોઈ shared medium નથી. Layer 1 (Physical) ગેરહાજર છે, એટલે ઉપરનો કોઈ પણ layer કામ કરી શકે નહીં.',
          en: 'Two end devices (hosts), each with a NIC, but no shared medium. Layer 1 (Physical) is absent, so no layer above it can function.',
        },
      },
      scene: () => ({ nodes: [A(), B()], links: [] }),
      say: () => ({ nodeId: 'a', text: { gu: 'મને B વિશે કશી ખબર નથી', en: 'I have no idea B exists' } }),
    },
    {
      ms: 2400,
      label: { gu: 'એક વાયર જોડો', en: 'Connect one cable' },
      text: {
        beginner: {
          gu: 'હવે બંને વચ્ચે એક વાયર જોડ્યો. બસ આટલું જ — અને તકનીકી રીતે તમારું પહેલું network બની ગયું! વાયર એ રસ્તો છે; સંદેશ હજી મોકલ્યો નથી, પણ હવે મોકલી શકાય એમ છે.',
          en: 'Now we connect one cable between them. That is all it takes — technically, you have just built your first network. The cable is the road; nothing has been sent yet, but now it can be.',
        },
        exam: {
          gu: 'Physical layer સ્થાપિત થયું. બે hosts વચ્ચે direct link એ સૌથી નાનું possible LAN છે. Link ઉપર electrical signalling શરૂ થાય અને interface state up/up થાય.',
          en: 'The physical layer is established. A direct link between two hosts is the smallest possible LAN. Signalling begins and the interface state goes up/up.',
        },
      },
      scene: (t) => ({
        nodes: [A(), B()],
        links: [
          {
            id: 'ab',
            from: 'a',
            to: 'b',
            state: t > 0.55 ? 'up' : 'idle',
            label: t > 0.75 ? 'up / up' : undefined,
          },
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'દરેકને સરનામું જોઈએ', en: 'Each one needs an address' },
      text: {
        beginner: {
          gu: 'રસ્તો તો બન્યો, પણ સંદેશ કોને આપવો? એટલે દરેક કમ્પ્યુટરને એક સરનામું આપીએ છીએ — જેમ દરેક ઘરને નંબર હોય છે. એને IP address કહે છે. હવે A જાણે છે કે B નું સરનામું 192.168.1.20 છે.',
          en: 'The road exists, but who do we hand the message to? So we give each computer an address — just as every house has a number. This is the IP address. Now A knows B lives at 192.168.1.20.',
        },
        exam: {
          gu: 'દરેક host ને એક જ subnet માંથી IPv4 address અપાયું (192.168.1.0/24). એક જ subnet હોવાથી traffic local રહે છે — કોઈ router કે default gateway ની જરૂર નથી.',
          en: 'Each host is addressed from the same subnet (192.168.1.0/24). Because they share a subnet the traffic stays local — no router or default gateway is required.',
        },
      },
      scene: (t) => ({
        nodes: [
          { ...A(t > 0.3 ? IP_A : undefined), pulse: t > 0.3 && t < 0.62 },
          { ...B(t > 0.62 ? IP_B : undefined), pulse: t > 0.62 },
        ],
        links: [{ id: 'ab', from: 'a', to: 'b', state: 'up' }],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'સંદેશ packet બને', en: 'The message becomes a packet' },
      text: {
        beginner: {
          gu: 'A ને "Hello" મોકલવું છે. એ સીધો શબ્દ નથી મોકલતો — એને એક પરબીડિયામાં મૂકે છે. પરબીડિયા પર બે વસ્તુ લખેલી હોય છે: કોના તરફથી (192.168.1.10) અને કોના માટે (192.168.1.20). આ પરબીડિયાને packet કહે છે.',
          en: 'A wants to send "Hello". It does not send the bare word — it puts it inside an envelope. The envelope carries two things: who it is from (192.168.1.10) and who it is for (192.168.1.20). That envelope is a packet.',
        },
        exam: {
          gu: 'Data ને encapsulate કરાય છે: payload ઉપર IP header ચઢે જેમાં source અને destination address હોય, અને એની ઉપર Ethernet frame header (source/destination MAC) ચઢે.',
          en: 'The data is encapsulated: an IP header carrying source and destination addresses is added to the payload, and an Ethernet frame header with source and destination MAC wraps that.',
        },
      },
      scene: (t) => ({
        nodes: [A(IP_A), B(IP_B)],
        links: [{ id: 'ab', from: 'a', to: 'b', state: 'up' }],
        packets:
          t > 0.25
            ? [{ id: 'p', from: 'a', to: 'b', t: 0.055, color: 'var(--nq-pkt-data)', label: 'Hello →' }]
            : [],
      }),
      say: () => ({ nodeId: 'a', text: { gu: 'પરબીડિયા પર B નું સરનામું લખું છું', en: 'Writing B’s address on the envelope' } }),
    },
    {
      ms: 3000,
      label: { gu: 'Packet મુસાફરી કરે', en: 'The packet travels' },
      text: {
        beginner: {
          gu: 'પરબીડિયું વાયર પર નીકળ્યું અને B તરફ દોડે છે. વાયરમાં એ વીજળીના સંકેત રૂપે જાય છે — એટલું ઝડપી કે આંખે દેખાય નહીં. અહીં આપણે એને ધીમું કરીને જોઈએ છીએ.',
          en: 'The envelope is on the wire now, racing toward B. Inside the cable it travels as electrical signals — far too fast to see. Here we have slowed it right down.',
        },
        exam: {
          gu: 'Frame bits તરીકે medium પર transmit થાય છે. B નું NIC destination MAC પોતાનું છે કે નહીં એ જુએ છે; મેળ ખાય તો frame ઉપરના layers સુધી પહોંચે, નહીંતર drop થાય.',
          en: 'The frame is transmitted onto the medium as bits. B’s NIC checks whether the destination MAC is its own; on a match the frame is passed up the stack, otherwise it is dropped.',
        },
      },
      scene: (t) => ({
        nodes: [A(IP_A), B(IP_B), ],
        links: [{ id: 'ab', from: 'a', to: 'b', state: 'up', flowing: true }],
        packets: [
          { id: 'p', from: 'a', to: 'b', t: 0.055 + ease(t) * 0.89, color: 'var(--nq-pkt-data)', label: 'Hello →' },
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'B જવાબ આપે', en: 'B answers back' },
      text: {
        beginner: {
          gu: 'B ને પરબીડિયું મળ્યું, ખોલ્યું, અને "Hello" વાંચ્યું. હવે એ એ જ રસ્તે જવાબ મોકલે છે — પણ આ વખતે પરબીડિયા પરના બે સરનામાં ઊલટાં થઈ જાય છે. નેટવર્કિંગમાં લગભગ દરેક વાત આવી જ હોય છે: એક પૂછે, બીજો જવાબ આપે.',
          en: 'B received the envelope, opened it, and read "Hello". Now it sends a reply back along the same road — except the two addresses on the envelope are swapped. Almost everything in networking looks like this: one side asks, the other answers.',
        },
        exam: {
          gu: 'Return traffic માં source અને destination fields ઊલટાં થાય છે. આ request/response જોડી TCP થી HTTP સુધી દરેક protocol નો પાયો છે.',
          en: 'In the return traffic the source and destination fields are swapped. This request/response pair is the basis of every protocol from TCP up to HTTP.',
        },
      },
      scene: (t) => ({
        nodes: [A(IP_A), { ...B(IP_B), pulse: t < 0.2 }],
        links: [{ id: 'ab', from: 'a', to: 'b', state: 'up', flowing: true }],
        packets: [
          { id: 'r', from: 'b', to: 'a', t: 0.055 + ease(Math.max(0, (t - 0.15) / 0.85)) * 0.89, color: 'var(--nq-pkt-ctrl)', label: '← Hi A' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Network એટલે ખાસ કશું નહીં — એક રસ્તો, બે સરનામાં, અને એક પરબીડિયું. આગળ જે પણ આવશે (switch, router, OSPF, BGP) એ બધું આ ત્રણ વસ્તુને મોટા પાયે ગોઠવવાની રીતો જ છે.',
    en: 'A network is nothing exotic — a path, two addresses, and an envelope. Everything that follows (switches, routers, OSPF, BGP) is just a way of arranging those same three things at a larger scale.',
  },
  check: {
    q: {
      gu: 'વાયર જોડ્યા પછી પણ સંદેશ ન પહોંચે તો સૌથી પહેલાં શું તપાસશો?',
      en: 'The cable is connected but the message still does not arrive. What do you check first?',
    },
    options: [
      { gu: 'બંને કમ્પ્યુટરનાં IP સરનામાં', en: 'The IP addresses on both computers' },
      { gu: 'કમ્પ્યુટરનો રંગ', en: 'The colour of the computers' },
      { gu: 'વાયરની લંબાઈ બરાબર 3 મીટર છે કે નહીં', en: 'Whether the cable is exactly 3 metres long' },
    ],
    answer: 0,
    explain: {
      gu: 'રસ્તો હોવો પૂરતું નથી — પરબીડિયા પર સાચું સરનામું પણ જોઈએ. બંને એક જ network ના સરનામાં ધરાવે છે કે નહીં એ પહેલી તપાસ છે.',
      en: 'A path alone is not enough — the envelope also needs the right address. Checking whether both sit in the same network is the first thing to do.',
    },
  },
}
