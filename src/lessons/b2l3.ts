import type { LessonSpec } from '../components/AnimatedLesson'
import type { NodeSpec } from '../components/Topology'
import { ease } from '../lib/useStepPlayer'

const MAC = {
  pc1: '001a.aaaa.0001',
  pc2: '001a.bbbb.0002',
  pc3: '001a.cccc.0003',
}

const sw = (pulse = false): NodeSpec => ({
  id: 'sw',
  x: 420,
  y: 215,
  type: 'switch',
  label: 'Switch',
  pulse,
})

const nodes = (opts: { dim?: string[]; pulse?: string } = {}): NodeSpec[] => [
  {
    id: 'pc1',
    x: 130,
    y: 215,
    type: 'pc',
    label: 'PC1',
    sub: '192.168.1.10',
    accent: 'var(--nq-beginner)',
    dim: opts.dim?.includes('pc1'),
    pulse: opts.pulse === 'pc1',
  },
  sw(),
  {
    id: 'pc2',
    x: 720,
    y: 110,
    type: 'pc',
    label: 'PC2',
    sub: '192.168.1.20',
    accent: 'var(--nq-ccna)',
    dim: opts.dim?.includes('pc2'),
    pulse: opts.pulse === 'pc2',
  },
  {
    id: 'pc3',
    x: 720,
    y: 325,
    type: 'pc',
    label: 'PC3',
    sub: '192.168.1.30',
    dim: opts.dim?.includes('pc3'),
    pulse: opts.pulse === 'pc3',
  },
]

const wires = (flowing: string[] = []) =>
  (['pc1', 'pc2', 'pc3'] as const).map((p) => ({
    id: `l-${p}`,
    from: p,
    to: 'sw',
    state: 'up' as const,
    flowing: flowing.includes(p),
  }))

const ARP_TITLE = { gu: 'PC1 નું ARP Table', hi: 'PC1 की ARP Table', en: "PC1's ARP table" }
const ARP_HEAD = ['Internet Address', 'Physical Address', 'Type']

export const b2l3: LessonSpec = {
  viewBox: { w: 860, h: 430 },
  why: {
    gu: 'તમે હંમેશાં IP સરનામું વાપરો છો, પણ વાયર પર ખરેખર MAC સરનામું જ ચાલે છે. તો વચ્ચેનો પુલ કોણ બાંધે? ARP. આ એક વસ્તુ સમજાય એટલે "ping કેમ નથી જતી" ના અડધા જવાબ મળી જાય છે.',
    hi: 'आप हमेशा IP पता इस्तेमाल करते हैं, पर तार पर असल में MAC पता ही चलता है। तो बीच का पुल कौन बांधता है? ARP। यह एक चीज समझ में आ जाए तो "ping क्यों नहीं जाती" के आधे जवाब मिल जाते हैं।',
    en: 'You always type an IP address, but what actually moves on the wire is a MAC address. So who builds the bridge between the two? ARP. Understand this one thing and half of all "why is my ping failing" questions answer themselves.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'બે સરનામાં, બે જુદા કામ', hi: 'दो पते, दो अलग काम', en: 'Two addresses, two different jobs' },
      text: {
        beginner: {
          gu: 'PC1 પાસે PC2 નું IP સરનામું છે: 192.168.1.20. પણ frame મોકલવા માટે એને MAC સરનામું જોઈએ — અને એ એની પાસે નથી. એ જાણે છે કે "કોને" મોકલવું છે, પણ "ક્યાં" એ ખબર નથી.',
          hi: 'PC1 के पास PC2 का IP पता है: 192.168.1.20। पर frame भेजने के लिए उसे MAC पता चाहिए — और वह उसके पास नहीं है। वह जानता है कि "किसे" भेजना है, पर "कहां" यह पता नहीं।',
          en: 'PC1 has PC2’s IP address: 192.168.1.20. But to send a frame it needs a MAC address — and it does not have one. It knows who it wants, but not where they are.',
        },
        exam: {
          gu: 'Layer 3 destination ખબર છે, Layer 2 destination નથી. Encapsulation પૂરું થઈ શકતું નથી કારણ કે Ethernet header નું destination MAC field ભરી શકાતું નથી.',
          hi: 'Layer 3 destination पता है, Layer 2 destination नहीं। Encapsulation पूरा नहीं हो सकता क्योंकि Ethernet header का destination MAC field भरा नहीं जा सकता।',
          en: 'The layer 3 destination is known, the layer 2 destination is not. Encapsulation cannot complete because the destination MAC field of the Ethernet header cannot be filled in.',
        },
      },
      scene: () => ({ nodes: nodes({ pulse: 'pc1' }), links: wires() }),
      aside: () => ({ title: ARP_TITLE, head: ARP_HEAD, rows: [] }),
    },
    {
      ms: 3400,
      label: { gu: 'બધાને મોટેથી પૂછો', hi: 'सबसे जोर से पूछो', en: 'Shout the question to everybody' },
      text: {
        beginner: {
          gu: 'PC1 એક સવાલ બધાને મોકલે છે: "192.168.1.20 કોનું સરનામું છે? હોય તો મને તમારું MAC કહો." આ સવાલ દરેક કમ્પ્યુટર સુધી પહોંચે છે — કારણ કે PC1 ને ખબર જ નથી કે પૂછવું કોને. આને ARP Request કહે છે, અને એ broadcast હોય છે.',
          hi: 'PC1 एक सवाल सबको भेजता है: "192.168.1.20 किसका पता है? हो तो मुझे अपना MAC बताओ।" यह सवाल हर कंप्यूटर तक पहुंचता है — क्योंकि PC1 को पता ही नहीं कि पूछे किसे। इसे ARP Request कहते हैं, और यह broadcast होता है।',
          en: 'PC1 shouts a question to everyone: "who owns 192.168.1.20? If it is you, tell me your MAC." The question reaches every computer, because PC1 has no idea who to ask. This is an ARP request, and it is a broadcast.',
        },
        exam: {
          gu: 'ARP Request broadcast થાય છે: destination MAC ffff.ffff.ffff. એ આખા broadcast domain માં જાય છે — એટલે કે એ જ VLAN ના દરેક port પર.',
          hi: 'ARP Request broadcast होती है: destination MAC ffff.ffff.ffff। यह पूरे broadcast domain में जाती है — यानी उसी VLAN के हर port पर।',
          en: 'The ARP request is broadcast to ffff.ffff.ffff. It reaches the entire broadcast domain, meaning every port in the same VLAN.',
        },
      },
      scene: (t) => ({
        nodes: nodes(),
        links: wires(t > 0.4 ? ['pc1', 'pc2', 'pc3'] : ['pc1']),
        packets:
          t < 0.45
            ? [
                {
                  id: 'q',
                  from: 'pc1',
                  to: 'sw',
                  t: ease(t / 0.45) * 0.88,
                  color: 'var(--nq-warn)',
                  label: 'who has it?',
                },
              ]
            : (['pc2', 'pc3'] as const).map((p) => ({
                id: `b-${p}`,
                from: 'sw',
                to: p,
                t: ease((t - 0.45) / 0.55) * 0.88,
                color: 'var(--nq-warn)',
                label: 'ff:ff:ff:ff:ff:ff',
              })),
      }),
      aside: () => ({ title: ARP_TITLE, head: ARP_HEAD, rows: [] }),
    },
    {
      ms: 3000,
      label: { gu: 'જેનું હોય એ જ જવાબ આપે', hi: 'जिसका हो वही जवाब देता है', en: 'Only the owner answers' },
      text: {
        beginner: {
          gu: 'PC3 સવાલ સાંભળે છે, જુએ છે કે "એ મારું સરનામું નથી", અને ચૂપ રહે છે. PC2 જુએ છે કે "અરે, એ તો હું જ છું!" અને જવાબ આપે છે. ખાસ વાત: જવાબ બધાને નથી જતો — ફક્ત PC1 ને જ.',
          hi: 'PC3 सवाल सुनता है, देखता है कि "यह मेरा पता नहीं है", और चुप रहता है। PC2 देखता है कि "अरे, यह तो मैं ही हूं!" और जवाब देता है। खास बात: जवाब सबको नहीं जाता — केवल PC1 को।',
          en: 'PC3 hears the question, sees it is not its address, and stays quiet. PC2 sees "that is me!" and answers. Note the difference: the answer does not go to everybody — only to PC1.',
        },
        exam: {
          gu: 'ARP Reply unicast છે, requester ના MAC તરફ. બાકીના hosts request drop કરી દે છે. PC2 પણ આ વખતે PC1 ની entry શીખી લે છે.',
          hi: 'ARP Reply unicast है, requester के MAC की तरफ। बाकी hosts request drop कर देते हैं। PC2 भी इस दौरान PC1 की entry सीख लेता है।',
          en: 'The ARP reply is unicast back to the requester. Every other host silently drops the request. PC2 also learns PC1 in the process.',
        },
      },
      scene: (t) => ({
        nodes: nodes({ dim: ['pc3'], pulse: t < 0.3 ? 'pc2' : undefined }),
        links: wires(['pc2']),
        packets: [
          {
            id: 'a',
            from: t < 0.5 ? 'pc2' : 'sw',
            to: t < 0.5 ? 'sw' : 'pc1',
            t: ease(t < 0.5 ? t * 2 : (t - 0.5) * 2) * 0.88,
            color: 'var(--nq-ok)',
            label: '001a.bbbb.0002',
          },
        ],
      }),
      aside: () => ({ title: ARP_TITLE, head: ARP_HEAD, rows: [] }),
    },
    {
      ms: 2800,
      label: { gu: 'જવાબ નોંધી લેવાય છે', hi: 'जवाब नोट कर लिया जाता है', en: 'The answer gets written down' },
      text: {
        beginner: {
          gu: 'PC1 જવાબ મળતાં જ એને એક નાની નોટબુકમાં લખી લે છે: "192.168.1.20 એટલે 001a.bbbb.0002". આને ARP cache કહે છે. હવે આ જ કમ્પ્યુટરને ફરી મોકલવું હોય તો પૂછવું નહીં પડે.',
          hi: 'PC1 जवाब मिलते ही उसे एक छोटी नोटबुक में लिख लेता है: "192.168.1.20 यानी 001a.bbbb.0002"। इसे ARP cache कहते हैं। अब इसी कंप्यूटर को फिर भेजना हो तो पूछना नहीं पड़ेगा।',
          en: 'The moment the answer arrives, PC1 writes it into a little notebook: "192.168.1.20 means 001a.bbbb.0002". This is the ARP cache. Next time it needs the same computer, it will not have to ask.',
        },
        exam: {
          gu: 'ARP cache માં entry બને છે. Windows પર default timeout થોડી મિનિટનો, Cisco IOS પર 4 કલાકનો હોય છે. "show arp" થી જોઈ શકાય અને "clear arp-cache" થી ખાલી કરી શકાય.',
          hi: 'ARP cache में entry बनती है। Windows पर default timeout कुछ मिनटों का, Cisco IOS पर 4 घंटे का होता है। "show arp" से देखा जा सकता है और "clear arp-cache" से खाली किया जा सकता है।',
          en: 'The entry lands in the ARP cache. The default timeout is a few minutes on Windows and four hours on Cisco IOS. You can see it with "show arp" and empty it with "clear arp-cache".',
        },
      },
      scene: () => ({ nodes: nodes({ pulse: 'pc1' }), links: wires() }),
      aside: (t) => ({
        title: ARP_TITLE,
        head: ARP_HEAD,
        rows: t > 0.25 ? [['192.168.1.20', MAC.pc2, 'dynamic']] : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'હવે ખરો સંદેશ જાય', hi: 'अब असली संदेश जाता है', en: 'Now the real message can go' },
      text: {
        beginner: {
          gu: 'બધું તૈયાર છે. હવે PC1 નું frame નીકળે છે જેના પર બંને સરનામાં છે — IP પર 192.168.1.20 અને MAC પર 001a.bbbb.0002. Switch એને સીધું PC2 સુધી પહોંચાડે છે.',
          hi: 'सब तैयार है। अब PC1 का frame निकलता है जिस पर दोनों पते हैं — IP पर 192.168.1.20 और MAC पर 001a.bbbb.0002। Switch इसे सीधा PC2 तक पहुंचाता है।',
          en: 'Everything is ready. PC1’s frame now leaves carrying both addresses — 192.168.1.20 at the IP layer and 001a.bbbb.0002 at the MAC layer. The switch takes it straight to PC2.',
        },
        exam: {
          gu: 'Encapsulation પૂરું થયું. દરેક ping, દરેક HTTP request — બધા પહેલાં આ જ ARP પગલું વટાવે છે, ભલે તમને દેખાય નહીં.',
          hi: 'Encapsulation पूरा हुआ। हर ping, हर HTTP request — सब पहले यही ARP कदम पार करते हैं, भले आपको दिखे नहीं।',
          en: 'Encapsulation is complete. Every ping and every HTTP request crosses this same ARP step first, even though you never see it.',
        },
      },
      scene: (t) => ({
        nodes: nodes({ dim: ['pc3'] }),
        links: wires(['pc1', 'pc2']),
        packets: [
          {
            id: 'd',
            from: t < 0.5 ? 'pc1' : 'sw',
            to: t < 0.5 ? 'sw' : 'pc2',
            t: ease(t < 0.5 ? t * 2 : (t - 0.5) * 2) * 0.88,
            color: 'var(--nq-pkt-data)',
            label: 'Hello',
          },
        ],
      }),
      aside: () => ({
        title: ARP_TITLE,
        head: ARP_HEAD,
        rows: [['192.168.1.20', MAC.pc2, 'dynamic']],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'બીજા network માટે? Gateway ને પૂછો', hi: 'दूसरे network के लिए? Gateway से पूछो', en: 'A different network? Ask the gateway' },
      text: {
        beginner: {
          gu: 'એક અગત્યની વાત: જો સામેવાળો બીજા network માં હોય, તો PC1 એનું MAC કદી નથી પૂછતો — કારણ કે એ broadcast ત્યાં સુધી પહોંચે જ નહીં. એ બદલે **પોતાના router (gateway) નું** MAC પૂછે છે, અને frame એને સોંપી દે છે. "આગળ તમે સંભાળો."',
          hi: 'एक महत्वपूर्ण बात: अगर सामने वाला दूसरे network में हो, तो PC1 उसका MAC कभी नहीं पूछता — क्योंकि broadcast वहां तक पहुंचती ही नहीं। उसके बजाय **अपने router (gateway) का** MAC पूछता है, और frame उसे सौंप देता है। "आगे आप संभालो।"',
          en: 'One important twist: if the other machine is in a different network, PC1 never asks for its MAC — the broadcast would never reach it. Instead it asks for **its own router’s** MAC and hands the frame to the gateway. "You take it from here."',
        },
        exam: {
          gu: 'Destination જો local subnet માં ન હોય તો host default gateway માટે ARP કરે છે. એટલે જ દૂરના બધા destinations માટે ARP cache માં gateway નું એક જ entry દેખાય છે.',
          hi: 'Destination अगर local subnet में न हो तो host default gateway के लिए ARP करता है। इसीलिए दूर के सभी destinations के लिए ARP cache में gateway की एक ही entry दिखती है।',
          en: 'When the destination is outside the local subnet the host ARPs for the default gateway instead. That is why one gateway entry in the ARP cache serves every remote destination.',
        },
      },
      scene: () => ({
        nodes: nodes({ dim: ['pc2', 'pc3'], pulse: 'pc1' }),
        links: wires(),
      }),
      aside: () => ({
        title: ARP_TITLE,
        head: ARP_HEAD,
        rows: [
          ['192.168.1.20', MAC.pc2, 'dynamic'],
          ['192.168.1.1', '001a.9999.0001', 'dynamic'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'IP કહે છે "કોને", MAC કહે છે "ક્યાં", અને ARP એ બંનેને જોડતો સવાલ છે: "આ IP કોનું છે?" — એક વાર પુછાય, જવાબ નોંધાય, પછી થોડો વખત વાપર્યા કરાય.',
    hi: 'IP कहता है "किसे", MAC कहता है "कहां", और ARP इन दोनों को जोड़ने वाला सवाल है: "यह IP किसका है?" — एक बार पूछा जाता है, जवाब नोट होता है, फिर थोड़ी देर इस्तेमाल होता रहता है।',
    en: 'IP says who, MAC says where, and ARP is the question that joins them: "who owns this IP?" — asked once, written down, and reused for a while.',
  },
  check: {
    q: {
      gu: 'PC1 ને બીજા શહેરના server (બીજા network માં) સાથે વાત કરવી છે. એ કોનું MAC પૂછશે?',
      hi: 'PC1 को दूसरे शहर के server (दूसरे network में) से बात करनी है। वह किसका MAC पूछेगा?',
      en: 'PC1 wants to reach a server in another network. Whose MAC does it ask for?',
    },
    options: [
      { gu: 'પોતાના router (default gateway) નું', hi: 'अपने router (default gateway) का', en: "Its own router's (the default gateway)" },
      { gu: 'દૂરના server નું', hi: 'दूर के server का', en: "The remote server's" },
      { gu: 'કોઈનું નહીં — ARP ની જરૂર જ નથી', hi: 'किसी का नहीं — ARP की जरूरत ही नहीं', en: 'Nobody — no ARP is needed' },
    ],
    answer: 0,
    explain: {
      gu: 'ARP નો સવાલ broadcast છે, અને broadcast પોતાના network ની બહાર જતો નથી. એટલે દૂરના કોઈનું MAC મેળવી જ ન શકાય — frame હંમેશાં પહેલાં gateway ને સોંપાય છે.',
      hi: 'ARP का सवाल broadcast है, और broadcast अपने network के बाहर नहीं जाता। इसलिए दूर के किसी का MAC मिल ही नहीं सकता — frame हमेशा पहले gateway को सौंपा जाता है।',
      en: 'An ARP question is a broadcast, and broadcasts never leave the local network. So a remote MAC can never be learned — the frame is always handed to the gateway first.',
    },
  },
}
