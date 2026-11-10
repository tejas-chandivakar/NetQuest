import type { LessonSpec } from '../components/AnimatedLesson'
import type { NodeSpec } from '../components/Topology'
import { ease } from '../lib/useStepPlayer'

const MAC = {
  pc1: '001a.1111.0001',
  pc2: '001a.2222.0002',
  pc3: '001a.3333.0003',
  pc4: '001a.4444.0004',
}

const sw = (pulse = false): NodeSpec => ({
  id: 'sw',
  x: 430,
  y: 215,
  type: 'switch',
  label: 'SW1',
  sub: '8 ports',
  pulse,
})

const pcs = (dim: string[] = []): NodeSpec[] => [
  { id: 'pc1', x: 140, y: 95, type: 'pc', label: 'PC1', sub: 'Fa0/1', accent: 'var(--nq-beginner)', dim: dim.includes('pc1') },
  { id: 'pc2', x: 140, y: 335, type: 'pc', label: 'PC2', sub: 'Fa0/2', dim: dim.includes('pc2') },
  { id: 'pc3', x: 720, y: 95, type: 'pc', label: 'PC3', sub: 'Fa0/3', accent: 'var(--nq-ccna)', dim: dim.includes('pc3') },
  { id: 'pc4', x: 720, y: 335, type: 'pc', label: 'PC4', sub: 'Fa0/4', dim: dim.includes('pc4') },
]

const wires = (flowing: string[] = []) =>
  (['pc1', 'pc2', 'pc3', 'pc4'] as const).map((p) => ({
    id: `l-${p}`,
    from: p,
    to: 'sw',
    state: 'up' as const,
    flowing: flowing.includes(p),
  }))

const EMPTY = { head: ['VLAN', 'MAC Address', 'Type', 'Port'], rows: [] as string[][] }
const TITLE = { gu: 'SW1 નું MAC Address Table', en: 'MAC address table on SW1' }

export const n2l1: LessonSpec = {
  viewBox: { w: 860, h: 430 },
  why: {
    gu: 'Switch કોઈ નકશો લઈને નથી આવતું — એ ખાલી ટેબલ સાથે જન્મે છે અને વપરાશમાંથી જ શીખે છે. આ "શીખવાની" પ્રક્રિયા સમજાય એટલે VLAN, STP અને port security — બધું સહેલું થઈ જાય.',
    en: 'A switch does not arrive with a map. It is born with an empty table and learns purely from the traffic it sees. Once this learning sinks in, VLANs, STP and port security all become easy.',
  },
  steps: [
    {
      ms: 2400,
      label: { gu: 'ખાલી ટેબલ સાથે શરૂઆત', en: 'It starts out knowing nothing' },
      text: {
        beginner: {
          gu: 'Switch હમણાં જ ચાલુ થયું. ચાર કમ્પ્યુટર જોડાયેલાં છે, પણ switch ને ખબર નથી કે કયો કમ્પ્યુટર કયા પોર્ટ પાછળ બેઠો છે. એનું ટેબલ તદ્દન ખાલી છે.',
          en: 'The switch has just been powered on. Four computers are plugged in, but it has no idea which computer sits behind which port. Its table is completely empty.',
        },
        exam: {
          gu: 'CAM table ખાલી છે. દરેક host પાસે પોતાનું burned-in MAC છે, પણ switch એ ત્યારે જ શીખે જ્યારે એ host પાસેથી frame આવે.',
          en: 'The CAM table is empty. Each host has its own burned-in MAC, but the switch only learns one when a frame arrives from that host.',
        },
      },
      scene: () => ({ nodes: [sw(), ...pcs()], links: wires() }),
      aside: () => ({ title: TITLE, ...EMPTY }),
    },
    {
      ms: 2800,
      label: { gu: 'PC1 એક frame મોકલે', en: 'PC1 sends a frame' },
      text: {
        beginner: {
          gu: 'PC1 ને PC3 સાથે વાત કરવી છે. એ frame મોકલે છે — જેના પર "કોના તરફથી: PC1" અને "કોના માટે: PC3" લખેલું છે. Frame Fa0/1 પોર્ટ થઈને switch માં ઘૂસે છે.',
          en: 'PC1 wants to talk to PC3, so it sends a frame marked "from PC1, to PC3". The frame enters the switch through port Fa0/1.',
        },
        exam: {
          gu: 'Frame Fa0/1 પર ingress થાય છે. Source MAC 001a.1111.0001, destination MAC 001a.3333.0003.',
          en: 'The frame ingresses on Fa0/1 with source MAC 001a.1111.0001 and destination MAC 001a.3333.0003.',
        },
      },
      scene: (t) => ({
        nodes: [sw(), ...pcs()],
        links: wires(['pc1']),
        packets: [{ id: 'f', from: 'pc1', to: 'sw', t: ease(t) * 0.88, color: 'var(--nq-pkt-data)', label: 'PC1 → PC3' }],
      }),
      aside: () => ({ title: TITLE, ...EMPTY }),
    },
    {
      ms: 3000,
      label: { gu: 'Switch મોકલનારને શીખે', en: 'The switch learns the sender' },
      text: {
        beginner: {
          gu: 'અહીં જાદુ થાય છે. Switch વિચારે છે: "આ frame Fa0/1 પરથી આવ્યું, અને એના પર લખ્યું છે કે PC1 તરફથી. એટલે PC1 ચોક્કસ Fa0/1 પાછળ જ હશે." — અને એ ટેબલમાં લખી લે છે. કોઈએ એને કહ્યું નહીં; એ જાતે શીખ્યું.',
          en: 'Here is the trick. The switch reasons: "this frame came in on Fa0/1 and says it is from PC1, so PC1 must live behind Fa0/1" — and writes that down. Nobody told it; it worked it out.',
        },
        exam: {
          gu: 'Source MAC learning: switch ingress port સામે source MAC ને CAM table માં નોંધે છે, VLAN સાથે. Entry નો aging timer સામાન્ય રીતે 300 સેકન્ડનો હોય છે.',
          en: 'Source MAC learning: the switch records the source MAC against the ingress port in the CAM table, together with the VLAN. The entry ages out after 300 seconds by default.',
        },
      },
      scene: () => ({
        nodes: [sw(true), ...pcs(['pc2', 'pc3', 'pc4'])],
        links: wires(),
      }),
      aside: () => ({
        title: TITLE,
        head: EMPTY.head,
        rows: [['1', MAC.pc1, 'DYNAMIC', 'Fa0/1']],
      }),
    },
    {
      ms: 3400,
      label: { gu: 'મેળવનાર અજાણ્યો — બધે મોકલો', en: 'Receiver unknown — flood it' },
      text: {
        beginner: {
          gu: 'પણ PC3 ક્યાં છે એ હજી ખબર નથી. તો switch શું કરે? એ frame ને બાકીના **બધા** પોર્ટ પર મોકલી દે છે — "જેનું હોય એ લઈ લે". PC2 અને PC4 જોશે કે આ એમના માટે નથી અને ફેંકી દેશે. ફક્ત PC3 એને સ્વીકારશે.',
          en: 'But it still does not know where PC3 is. So what does it do? It sends the frame out of **every** other port — "whoever this belongs to, take it". PC2 and PC4 will see it is not for them and discard it. Only PC3 keeps it.',
        },
        exam: {
          gu: 'Unknown unicast flooding: destination MAC CAM table માં ન હોય તો frame એ જ VLAN ના બાકીના બધા ports પર મોકલાય છે (ingress port સિવાય).',
          en: 'Unknown unicast flooding: when the destination MAC is not in the CAM table the frame goes out of every other port in the same VLAN, excluding the ingress port.',
        },
      },
      scene: (t) => ({
        nodes: [sw(), ...pcs()],
        links: wires(['pc2', 'pc3', 'pc4']),
        packets: (['pc2', 'pc3', 'pc4'] as const).map((p) => ({
          id: `fl-${p}`,
          from: 'sw',
          to: p,
          t: ease(t) * 0.88,
          color: p === 'pc3' ? 'var(--nq-pkt-data)' : 'var(--nq-text-mute)',
          label: p === 'pc3' ? 'mine!' : undefined,
        })),
      }),
      aside: () => ({
        title: TITLE,
        head: EMPTY.head,
        rows: [['1', MAC.pc1, 'DYNAMIC', 'Fa0/1']],
      }),
    },
    {
      ms: 3200,
      label: { gu: 'PC3 જવાબ આપે — અને શીખાય છે', en: 'PC3 replies — and gets learned' },
      text: {
        beginner: {
          gu: 'PC3 જવાબ મોકલે છે. એ frame Fa0/3 પરથી આવે છે, એટલે switch હવે PC3 ને પણ ટેબલમાં લખી લે છે. એક જ વાતચીતમાં એણે બે વસ્તુ શીખી લીધી.',
          en: 'PC3 sends its reply. That frame arrives on Fa0/3, so the switch now writes PC3 into the table too. One short exchange and it has learned two things.',
        },
        exam: {
          gu: 'Return frame નું source MAC learning થાય છે. હવે બંને entries CAM table માં છે, એટલે આ જોડી વચ્ચેનું traffic unicast forwarding તરીકે જ જશે.',
          en: 'Source MAC learning happens on the return frame. With both entries now in the CAM table, traffic between this pair is forwarded as unicast from here on.',
        },
      },
      scene: (t) => ({
        nodes: [sw(t > 0.7), ...pcs()],
        links: wires(['pc3']),
        packets: [{ id: 'r', from: 'pc3', to: 'sw', t: ease(t) * 0.88, color: 'var(--nq-pkt-ctrl)', label: 'PC3 → PC1' }],
      }),
      aside: (t) => ({
        title: TITLE,
        head: EMPTY.head,
        rows:
          t > 0.7
            ? [
                ['1', MAC.pc1, 'DYNAMIC', 'Fa0/1'],
                ['1', MAC.pc3, 'DYNAMIC', 'Fa0/3'],
              ]
            : [['1', MAC.pc1, 'DYNAMIC', 'Fa0/1']],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'હવે સીધું જ — કોઈ flooding નહીં', en: 'Now it goes straight there' },
      text: {
        beginner: {
          gu: 'PC1 ફરી PC3 ને મોકલે છે. આ વખતે switch ટેબલ જુએ છે, PC3 ને Fa0/3 પર શોધે છે, અને frame **ફક્ત ત્યાં જ** મોકલે છે. PC2 અને PC4 ને હવે કંઈ દેખાતું જ નથી. આ જ switch ની ખૂબી છે — hub બધાને બધું સંભળાવતો, switch ફક્ત જેને જોઈએ એને જ આપે છે.',
          en: 'PC1 sends to PC3 again. This time the switch checks the table, finds PC3 on Fa0/3, and sends the frame **only there**. PC2 and PC4 see nothing at all. That is the whole point of a switch — a hub shouted at everybody, a switch delivers only to the one who needs it.',
        },
        exam: {
          gu: 'Known unicast forwarding. એટલે જ switch દરેક port ને પોતાનું collision domain આપે છે, જ્યારે broadcast domain આખા VLAN માટે એક જ રહે છે.',
          en: 'Known unicast forwarding. This is why a switch gives every port its own collision domain, while the broadcast domain stays shared across the VLAN.',
        },
      },
      scene: (t) => ({
        nodes: [sw(), ...pcs(['pc2', 'pc4'])],
        links: wires(['pc1', 'pc3']),
        packets: [
          {
            id: 'd',
            from: t < 0.5 ? 'pc1' : 'sw',
            to: t < 0.5 ? 'sw' : 'pc3',
            t: ease(t < 0.5 ? t * 2 : (t - 0.5) * 2) * 0.88,
            color: 'var(--nq-ok)',
            label: 'Fa0/3',
          },
        ],
      }),
      aside: () => ({
        title: TITLE,
        head: EMPTY.head,
        rows: [
          ['1', MAC.pc1, 'DYNAMIC', 'Fa0/1'],
          ['1', MAC.pc3, 'DYNAMIC', 'Fa0/3'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Switch એક જ નિયમથી ચાલે છે: "આવતા frame પરથી મોકલનાર શીખો; જતા frame માટે ટેબલ જુઓ — ન મળે તો બધે મોકલો." આટલું જ. એના પર જ VLAN, STP અને port security ઊભાં છે.',
    en: 'A switch runs on one rule: learn the sender from what comes in; look up the receiver for what goes out, and flood it if you cannot find it. That is all. VLANs, STP and port security are all built on top of it.',
  },
  check: {
    q: {
      gu: 'Switch ને PC3 નું સરનામું ટેબલમાં ન મળે તો એ frame નું શું કરે?',
      en: 'When the switch cannot find PC3 in its table, what does it do with the frame?',
    },
    options: [
      { gu: 'બાકીના બધા પોર્ટ પર મોકલી દે', en: 'Sends it out of every other port' },
      { gu: 'Frame ફેંકી દે', en: 'Drops the frame' },
      { gu: 'PC1 ને પાછું મોકલે', en: 'Sends it back to PC1' },
    ],
    answer: 0,
    explain: {
      gu: 'એને unknown unicast flooding કહે છે. Switch ફેંકી દેવાને બદલે બધે મોકલે છે — અને જવાબ આવે એટલે આગલી વખતે એને ખબર હોય છે.',
      en: 'This is called unknown unicast flooding. Rather than drop it, the switch sends it everywhere — and once the reply comes back, next time it knows.',
    },
  },
}
