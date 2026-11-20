import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const OK = 'var(--nq-ok)'
const WARN = 'var(--nq-warn)'
const H = (gu: string, hi: string, en: string) => ({ gu, hi, en })

/* ═══════════════════ n2l4 · inter-VLAN routing ═══════════════════ */

export const n2l4: LessonSpec = {
  why: {
    gu: 'VLAN બનાવ્યા પછી તરત જ કોઈ ફરિયાદ કરે છે: "Sales હવે Accounts ને ping નથી કરી શકતું." એ ભૂલ નથી — એ જ તો VLAN નું કામ હતું. પણ હવે એમને સાચવીને ફરી જોડવા પડે.',
    hi: 'VLAN बनाने के तुरंत बाद कोई शिकायत करता है: "Sales अब Accounts को ping नहीं कर पा रहा।" यह गलती नहीं — यही तो VLAN का काम था। पर अब इन्हें सावधानी से फिर जोड़ना पड़ता है।',
    en: 'The moment you finish building VLANs somebody complains that Sales can no longer reach Accounts. That is not a fault — it is exactly what VLANs are for. But now you have to join them back up, carefully.',
  },
  steps: [
    {
      ms: 2800,
      label: H('દીવાલ ઊભી થઈ ગઈ', 'दीवार खड़ी हो गई', 'The wall is up'),
      text: {
        beginner: {
          gu: 'બંને PC એક જ switch પર છે, બંને જોડાયેલા છે — તોય packet પહોંચતું નથી. કારણ: switch એક VLAN નો frame બીજા VLAN ના port પર **કદી** મોકલતું નથી. એ નિયમ તોડવા switch પાસે કોઈ રસ્તો જ નથી.',
          hi: 'दोनों PC एक ही switch पर हैं, दोनों जुड़े हैं — फिर भी packet नहीं पहुंचता। कारण: switch एक VLAN का frame दूसरे VLAN के port पर **कभी** नहीं भेजता। इस नियम को तोड़ने का switch के पास कोई रास्ता ही नहीं।',
          en: 'Both PCs sit on the same switch, both are plugged in, and still nothing arrives. The reason: a switch **never** forwards a frame from one VLAN out of another VLAN’s port. It has no mechanism to break that rule.',
        },
        exam: {
          gu: 'VLAN એ broadcast domain છે, અને broadcast domain ઓળંગવા માટે Layer 3 device જોઈએ. Switch Layer 2 પર કામ કરે છે, એટલે એ એકલું આ ન કરી શકે.',
          hi: 'VLAN broadcast domain है, और broadcast domain पार करने के लिए Layer 3 device चाहिए। Switch Layer 2 पर काम करता है, इसलिए वह अकेला यह नहीं कर सकता।',
          en: 'A VLAN is a broadcast domain, and crossing a broadcast domain needs a Layer 3 device. A switch works at Layer 2, so on its own it cannot do this.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc1', x: 130, y: 110, type: 'pc' as const, label: 'PC1', sub: 'VLAN 10 · 10.0.10.5', accent: BEG },
          { id: 'sw', x: 430, y: 210, type: 'switch' as const, label: 'SW1', accent: CCNA },
          { id: 'pc2', x: 130, y: 320, type: 'pc' as const, label: 'PC2', sub: 'VLAN 20 · 10.0.20.5', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'pc1', to: 'sw', state: 'up' as const, flowing: t > 0.2 && t < 0.6 },
          { id: 'b', from: 'sw', to: 'pc2', state: 'idle' as const },
        ],
        packets:
          t > 0.25
            ? [{ id: 'p', from: 'pc1', to: 'sw', t: 0.1 + ease(Math.min(1, (t - 0.25) / 0.4)) * 0.8, color: t > 0.65 ? 'var(--nq-err)' : 'var(--nq-pkt-data)', label: t > 0.65 ? 'dropped ✕' : '→ PC2' }]
            : [],
      }),
      say: (t) => (t > 0.65 ? { nodeId: 'sw', text: H('જુદું VLAN — હું ન મોકલી શકું', 'अलग VLAN — मैं नहीं भेज सकता', 'different VLAN — not mine to forward') } : null),
    },
    {
      ms: 3000,
      label: H('દરવાજો બહાર છે', 'दरवाजा बाहर है', 'The door is outside'),
      text: {
        beginner: {
          gu: 'Switch પોતે ન કરી શકે, એટલે frame ને **બહાર router પાસે** મોકલવું પડે. Router પાસે બંને VLAN માં એક-એક સરનામું હોય, એટલે એ બંનેનો gateway બની શકે: VLAN 10 માટે 10.0.10.1, VLAN 20 માટે 10.0.20.1.',
          hi: 'Switch खुद नहीं कर सकता, इसलिए frame को **बाहर router के पास** भेजना पड़ता है। Router के पास दोनों VLAN में एक-एक पता होता है, इसलिए वह दोनों का gateway बन सकता है: VLAN 10 के लिए 10.0.10.1, VLAN 20 के लिए 10.0.20.1।',
          en: 'The switch cannot do it, so the frame has to go **out to a router**. The router holds one address inside each VLAN, which lets it be the gateway for both: 10.0.10.1 for VLAN 10 and 10.0.20.1 for VLAN 20.',
        },
        exam: {
          gu: 'બે VLAN = બે subnet = બે gateway સરનામાં. PC નો default gateway એના પોતાના VLAN વાળું સરનામું હોવું જોઈએ, બીજાનું નહીં — એ બહુ સામાન્ય ભૂલ છે.',
          hi: 'दो VLAN = दो subnet = दो gateway पते। PC का default gateway उसके अपने VLAN वाला पता होना चाहिए, दूसरे का नहीं — यह बहुत आम गलती है।',
          en: 'Two VLANs mean two subnets, which mean two gateway addresses. Each PC’s default gateway must be the one inside its own VLAN, not the other — a very common misconfiguration.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'pc1', x: 110, y: 110, type: 'pc' as const, label: 'PC1', sub: 'gw 10.0.10.1', accent: BEG },
          { id: 'sw', x: 390, y: 210, type: 'switch' as const, label: 'SW1', accent: CCNA },
          { id: 'pc2', x: 110, y: 320, type: 'pc' as const, label: 'PC2', sub: 'gw 10.0.20.1', accent: CCNP },
          { id: 'r1', x: 710, y: 210, type: 'router' as const, label: 'R1', sub: 'both gateways', accent: OK, pulse: true },
        ],
        links: [
          { id: 'a', from: 'pc1', to: 'sw', state: 'up' as const },
          { id: 'b', from: 'sw', to: 'pc2', state: 'up' as const },
          { id: 'c', from: 'sw', to: 'r1', state: 'up' as const },
        ],
      }),
      aside: () => ({
        title: H('R1 કોનો gateway છે', 'R1 किसका gateway है', 'What R1 is the gateway for'),
        head: ['VLAN', 'subnet', 'R1 address'],
        rows: [
          ['10', '10.0.10.0/24', '10.0.10.1'],
          ['20', '10.0.20.0/24', '10.0.20.1'],
        ],
      }),
    },
    {
      ms: 3200,
      label: H('એક કેબલ, બે ઓળખ', 'एक cable, दो पहचान', 'One cable, two identities'),
      text: {
        beginner: {
          gu: 'પણ router સુધી તો **એક જ કેબલ** જાય છે. એક port પર બે સરનામાં કેવી રીતે? ઉકેલ: એ એક physical port ને **ટુકડાઓમાં** વહેંચો — `Gi0/0.10` અને `Gi0/0.20`. દરેક ટુકડો એક VLAN નો tag ઓળખે અને એનું પોતાનું સરનામું રાખે. લિંક trunk હોય, એટલે tag સાચવાઈને આવે.',
          hi: 'पर router तक तो **एक ही cable** जाता है। एक port पर दो पते कैसे? हल: उस एक physical port को **टुकड़ों में** बांटें — `Gi0/0.10` और `Gi0/0.20`। हर टुकड़ा एक VLAN का tag पहचानता है और अपना पता रखता है। Link trunk हो, ताकि tag सुरक्षित आएं।',
          en: 'But there is only **one cable** going to the router. How do you put two addresses on one port? You slice that one physical port into **pieces** — `Gi0/0.10` and `Gi0/0.20`. Each piece answers to one VLAN tag and carries its own address. The link is a trunk, so the tags arrive intact.',
        },
        exam: {
          gu: 'Router-on-a-stick. દરેક subinterface પર `encapsulation dot1q <vlan>` પછી `ip address`. Switch બાજુનો port `switchport mode trunk` હોવો જ જોઈએ — access હશે તો ફક્ત એક VLAN ચાલશે અને બાકીનું ચૂપચાપ નિષ્ફળ જશે.',
          hi: 'Router-on-a-stick। हर subinterface पर `encapsulation dot1q <vlan>` फिर `ip address`। Switch तरफ का port `switchport mode trunk` होना ही चाहिए — access होगा तो केवल एक VLAN चलेगा और बाकी चुपचाप असफल होगा।',
          en: 'This is router-on-a-stick. Each subinterface takes `encapsulation dot1q <vlan>` and then an `ip address`. The switch side must be `switchport mode trunk` — leave it as access and exactly one VLAN works while the rest fails silently.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 240, y: 210, type: 'switch' as const, label: 'SW1', sub: 'trunk →', accent: CCNA },
          { id: 'r1', x: 680, y: 210, type: 'router' as const, label: 'R1', sub: t > 0.4 ? 'Gi0/0.10 + Gi0/0.20' : 'Gi0/0', accent: t > 0.4 ? OK : CCNA, pulse: t > 0.4 },
        ],
        links: [{ id: 'c', from: 'sw', to: 'r1', state: 'up' as const, flowing: true, label: '802.1Q trunk' }],
        packets: [
          { id: 'a', from: 'sw', to: 'r1', t: 0.15 + ease(Math.min(1, t)) * 0.7, color: 'var(--nq-pkt-data)', label: 'tag 10' },
          { id: 'b', from: 'r1', to: 'sw', t: 0.15 + ease(Math.min(1, t)) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'tag 20' },
        ],
      }),
      aside: (t) => ({
        title: H('એક port ના ટુકડા', 'एक port के टुकड़े', 'The pieces of one port'),
        caption: H('ભૌતિક રીતે એક, તાર્કિક રીતે બે.', 'भौतिक रूप से एक, तार्किक रूप से दो।', 'One physically, two logically.'),
        head: ['subinterface', 'tag', 'ip address'],
        rows:
          t > 0.4
            ? [
                ['Gi0/0.10', 'dot1q 10', '10.0.10.1/24'],
                ['Gi0/0.20', 'dot1q 20', '10.0.20.1/24'],
              ]
            : [['Gi0/0', '—', 'no address yet']],
      }),
    },
    {
      ms: 3200,
      label: H('પ્રવાસ પૂરો', 'यात्रा पूरी', 'The round trip'),
      text: {
        beginner: {
          gu: 'હવે PC1 નું packet gateway સુધી જાય, trunk પર tag 10 સાથે router પહોંચે, `Gi0/0.10` પર ઊતરે. Router જુએ કે મંઝિલ 10.0.20.0 છે — એ તો એના `Gi0/0.20` પર જ છે. એટલે **tag બદલીને** એ જ કેબલ પર પાછું મોકલે. એક જ તાર પર જઈને એ જ તારે પાછું.',
          hi: 'अब PC1 का packet gateway तक जाता है, trunk पर tag 10 के साथ router पहुंचता है, `Gi0/0.10` पर उतरता है। Router देखता है कि मंजिल 10.0.20.0 है — वह तो उसके `Gi0/0.20` पर ही है। इसलिए **tag बदलकर** उसी cable पर वापस भेजता है। एक ही तार पर जाकर उसी तार से वापस।',
          en: 'Now PC1’s packet goes to its gateway, crosses the trunk tagged 10 and lands on `Gi0/0.10`. The router sees the destination is 10.0.20.0 — which is sitting on its own `Gi0/0.20`. So it **changes the tag** and sends it back down the same cable. Out one wire and back in the same one.',
        },
        exam: {
          gu: 'એટલે જ એને "stick" કહે છે — traffic એક જ લિંક પર બે વાર ચાલે, એટલે એ લિંક bottleneck બની શકે. મોટી જગ્યાએ એટલે Layer 3 switch વપરાય.',
          hi: 'इसीलिए इसे "stick" कहते हैं — traffic एक ही link पर दो बार चलता है, इसलिए वह link bottleneck बन सकती है। बड़ी जगहों पर इसलिए Layer 3 switch इस्तेमाल होता है।',
          en: 'That is why it is called a stick — the traffic traverses the one link twice, so that link can become a bottleneck. Which is why larger sites use a Layer 3 switch instead.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc1', x: 110, y: 110, type: 'pc' as const, label: 'PC1', accent: BEG },
          { id: 'sw', x: 390, y: 210, type: 'switch' as const, label: 'SW1', accent: CCNA },
          { id: 'pc2', x: 110, y: 320, type: 'pc' as const, label: 'PC2', accent: CCNP, pulse: t > 0.8 },
          { id: 'r1', x: 710, y: 210, type: 'router' as const, label: 'R1', accent: OK, pulse: t > 0.4 && t < 0.6 },
        ],
        links: [
          { id: 'a', from: 'pc1', to: 'sw', state: 'up' as const, flowing: t < 0.3 },
          { id: 'c', from: 'sw', to: 'r1', state: 'up' as const, flowing: t > 0.2 && t < 0.75 },
          { id: 'b', from: 'sw', to: 'pc2', state: 'up' as const, flowing: t > 0.75 },
        ],
        packets:
          t < 0.3
            ? [{ id: 'p', from: 'pc1', to: 'sw', t: 0.15 + ease(t / 0.3) * 0.7, color: 'var(--nq-pkt-data)' }]
            : t < 0.5
              ? [{ id: 'p', from: 'sw', to: 'r1', t: 0.15 + ease((t - 0.3) / 0.2) * 0.7, color: 'var(--nq-pkt-data)', label: 'tag 10' }]
              : t < 0.75
                ? [{ id: 'p', from: 'r1', to: 'sw', t: 0.15 + ease((t - 0.5) / 0.25) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'tag 20' }]
                : [{ id: 'p', from: 'sw', to: 'pc2', t: 0.15 + ease((t - 0.75) / 0.25) * 0.7, color: 'var(--nq-ok)', label: 'arrived' }],
      }),
    },
    {
      ms: 2800,
      label: H('મોટી જગ્યાએ: SVI', 'बड़ी जगहों पर: SVI', 'At scale: the SVI'),
      text: {
        beginner: {
          gu: 'Layer 3 switch પાસે અંદર જ routing છે. એટલે બહારનો router અને એ trunk કેબલ બંનેની જરૂર નથી — તમે switch ની અંદર જ `interface vlan 10` બનાવીને એને સરનામું આપો. એને **SVI** કહે છે. એ જ વિચાર, પણ traffic બોક્સની બહાર નીકળતું જ નથી.',
          hi: 'Layer 3 switch के पास अंदर ही routing है। इसलिए बाहर का router और वह trunk cable दोनों की जरूरत नहीं — आप switch के अंदर ही `interface vlan 10` बनाकर उसे पता देते हैं। इसे **SVI** कहते हैं। वही विचार, पर traffic box के बाहर निकलता ही नहीं।',
          en: 'A Layer 3 switch already has routing inside it. So you need neither the outside router nor that trunk cable — you create `interface vlan 10` within the switch itself and give it an address. That is an **SVI**. Same idea, except the traffic never leaves the box.',
        },
        exam: {
          gu: 'SVI ત્યારે જ up થાય જ્યારે એ VLAN અસ્તિત્વમાં હોય અને એમાં ઓછામાં ઓછો એક active access port હોય. `ip routing` ચાલુ કરવાનું ભૂલાય તો SVI તો ઊભા દેખાય પણ એમની વચ્ચે routing ન થાય.',
          hi: 'SVI तभी up होता है जब वह VLAN मौजूद हो और उसमें कम से कम एक active access port हो। `ip routing` चालू करना भूल जाएं तो SVI तो खड़े दिखते हैं पर उनके बीच routing नहीं होती।',
          en: 'An SVI only comes up when the VLAN exists and has at least one active access port in it. Forget `ip routing` and the SVIs appear up while nothing routes between them.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'pc1', x: 150, y: 110, type: 'pc' as const, label: 'PC1', accent: BEG },
          { id: 'sw', x: 500, y: 210, type: 'switch' as const, label: 'L3 Switch', sub: 'vlan 10 + vlan 20 inside', accent: OK, pulse: true },
          { id: 'pc2', x: 150, y: 320, type: 'pc' as const, label: 'PC2', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'pc1', to: 'sw', state: 'up' as const, flowing: true },
          { id: 'b', from: 'sw', to: 'pc2', state: 'up' as const, flowing: true },
        ],
      }),
      aside: () => ({
        title: H('બે રીતો સરખાવો', 'दो तरीकों की तुलना', 'The two ways side by side'),
        head: ['', 'router-on-a-stick', 'L3 switch SVI'],
        rows: [
          ['hardware', 'router + trunk', 'one switch'],
          ['traffic', 'crosses the link twice', 'stays inside'],
          ['suits', 'small sites, labs', 'anything larger'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Switch એકલું VLAN ઓળંગી ન શકે — એ Layer 2 છે. કાં તો એક trunk પર router લગાવો અને એના port ને `Gi0/0.10`, `Gi0/0.20` જેવા ટુકડામાં વહેંચો, કાં તો Layer 3 switch ની અંદર `interface vlan 10` બનાવો. બંને એક જ કામ કરે: **દરેક VLAN માં એક gateway સરનામું મૂકવું.**',
    hi: 'Switch अकेला VLAN पार नहीं कर सकता — वह Layer 2 है। या तो एक trunk पर router लगाएं और उसके port को `Gi0/0.10`, `Gi0/0.20` जैसे टुकड़ों में बांटें, या Layer 3 switch के अंदर `interface vlan 10` बनाएं। दोनों एक ही काम करते हैं: **हर VLAN में एक gateway पता रखना।**',
    en: 'A switch alone cannot cross a VLAN boundary — it is Layer 2. Either hang a router off a trunk and slice its port into `Gi0/0.10` and `Gi0/0.20`, or build `interface vlan 10` inside a Layer 3 switch. Both do the same job: **put a gateway address inside every VLAN.**',
  },
  check: {
    q: H(
      'Router-on-a-stick ગોઠવ્યું પણ ફક્ત VLAN 10 ચાલે છે, VLAN 20 નહીં. પહેલાં શું તપાસશો?',
      'Router-on-a-stick सेट किया पर केवल VLAN 10 चल रहा है, VLAN 20 नहीं। पहले क्या जांचेंगे?',
      'You built router-on-a-stick but only VLAN 10 works, not VLAN 20. What would you check first?',
    ),
    options: [
      H('Switch નો port trunk છે કે access', 'Switch का port trunk है या access', 'Whether the switch port is a trunk or an access port'),
      H('PC2 ની કેબલ', 'PC2 का cable', 'PC2’s cable'),
      H('Router નું hostname', 'Router का hostname', 'The router’s hostname'),
    ],
    answer: 0,
    explain: H(
      'Access port પર ફક્ત એક જ VLAN પસાર થાય — એટલે બરાબર એક VLAN ચાલે અને બાકીનાં ચૂપચાપ નિષ્ફળ જાય. આ લક્ષણ લગભગ હંમેશા એ જ કહે છે.',
      'Access port पर केवल एक ही VLAN गुजरता है — इसलिए ठीक एक VLAN चलता है और बाकी चुपचाप असफल होते हैं। यह लक्षण लगभग हमेशा यही कहता है।',
      'An access port carries exactly one VLAN, so exactly one VLAN works and the others fail silently. That symptom almost always means this.',
    ),
  },
}

/* ═══════════════════ n1l6 · IPv6 addressing ═══════════════════ */

export const n1l6: LessonSpec = {
  why: {
    gu: 'IPv4 ના સરનામાં ખૂટી ગયાં — ખરેખર, 2011 માં. IPv6 એમાં થોડા ઉમેરતું નથી; એ એટલાં બધાં આપે છે કે ફરી ક્યારેય ખૂટે નહીં. અને એ લંબાઈ ડરામણી લાગે છે ત્યાં સુધી જ, જ્યાં સુધી એના ભાગ પાડતાં ન આવડે.',
    hi: 'IPv4 के पते खत्म हो गए — सच में, 2011 में। IPv6 उसमें कुछ और नहीं जोड़ता; वह इतने सारे देता है कि फिर कभी खत्म न हों। और वह लंबाई डरावनी तभी तक लगती है जब तक इसके हिस्से करना न आए।',
    en: 'IPv4 ran out of addresses — genuinely, in 2011. IPv6 does not add a few more; it hands out so many that running out stops being a thing. And its length only looks frightening until you learn where to cut it.',
  },
  steps: [
    {
      ms: 2800,
      label: H('કેટલાં વધારે?', 'कितने ज्यादा?', 'How many more?'),
      text: {
        beginner: {
          gu: 'IPv4 માં 32 bits છે — લગભગ 4 અબજ સરનામાં. IPv6 માં **128 bits** છે. એ ચાર ગણાં નથી — દરેક ઉમેરાયેલો bit સંખ્યા બમણી કરે છે, એટલે આંકડો એટલો મોટો બને કે પૃથ્વીના દરેક રેતીના કણને પોતાનું નેટવર્ક મળે.',
          hi: 'IPv4 में 32 bits हैं — लगभग 4 अरब पते। IPv6 में **128 bits** हैं। यह चार गुना नहीं — हर जोड़ा गया bit संख्या दोगुनी करता है, इसलिए आंकड़ा इतना बड़ा बनता है कि पृथ्वी के हर रेत के कण को अपना network मिल जाए।',
          en: 'IPv4 has 32 bits — about four billion addresses. IPv6 has **128 bits**. That is not four times as many: each added bit doubles the count, so the number grows large enough to give every grain of sand on earth its own network.',
        },
        exam: {
          gu: '2^128 ≈ 3.4 × 10^38. લખવાની રીત hexadecimal છે, 16-bit ના આઠ જૂથ colon થી અલગ — દા.ત. `2001:0db8:0000:0000:0000:0000:0000:0001`.',
          hi: '2^128 ≈ 3.4 × 10^38। लिखने का तरीका hexadecimal है, 16-bit के आठ समूह colon से अलग — जैसे `2001:0db8:0000:0000:0000:0000:0000:0001`।',
          en: '2^128 ≈ 3.4 × 10^38. It is written in hexadecimal as eight 16-bit groups separated by colons, for example `2001:0db8:0000:0000:0000:0000:0000:0001`.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'v4', x: 250, y: 150, type: 'cloud' as const, label: 'IPv4 · 32 bits', sub: '4.3 billion', accent: WARN },
          { id: 'v6', x: 620, y: 260, type: 'cloud' as const, label: 'IPv6 · 128 bits', sub: t > 0.4 ? '340 undecillion' : '…', accent: t > 0.4 ? OK : 'var(--nq-text-mute)', pulse: t > 0.4 },
        ],
      }),
      aside: () => ({
        title: H('લંબાઈનો ફરક', 'लंबाई का फर्क', 'What the extra bits buy'),
        head: ['', 'bits', 'addresses'],
        rows: [
          ['IPv4', '32', '4,294,967,296'],
          ['IPv6', '128', '3.4 × 10³⁸'],
        ],
      }),
    },
    {
      ms: 3200,
      label: H('ટૂંકું લખવાના બે નિયમ', 'छोटा लिखने के दो नियम', 'Two rules for writing it shorter'),
      text: {
        beginner: {
          gu: 'કોઈ એ આખું લખતું નથી. બે નિયમ છે. **પહેલો:** દરેક જૂથમાં આગળનાં શૂન્ય કાઢી નાખો — `0db8` એટલે `db8`. **બીજો:** સળંગ આખાં-શૂન્ય જૂથો એક `::` થી બદલો. બસ, આખા સરનામામાં **એક જ વાર** — નહીં તો કેટલાં જૂથ હતાં એ કોઈ કહી ન શકે.',
          hi: 'कोई इसे पूरा नहीं लिखता। दो नियम हैं। **पहला:** हर समूह में आगे के शून्य हटा दें — `0db8` यानी `db8`। **दूसरा:** लगातार सभी-शून्य वाले समूहों को एक `::` से बदल दें। बस, पूरे पते में **केवल एक बार** — वरना कितने समूह थे यह कोई नहीं बता सकता।',
          en: 'Nobody writes it out in full. There are two rules. **First:** drop the leading zeros in each group, so `0db8` becomes `db8`. **Second:** replace one run of all-zero groups with `::`. Only **once** in an address, though — otherwise nobody can work out how many groups each gap stood for.',
        },
        exam: {
          gu: 'બે `::` વાળું સરનામું અમાન્ય છે. બે સરખી લંબાઈના શૂન્ય-ભાગ હોય તો RFC 5952 કહે છે કે **ડાબો** સંકેલો.',
          hi: 'दो `::` वाला पता अमान्य है। दो समान लंबाई के शून्य-भाग हों तो RFC 5952 कहता है **बाईं तरफ** वाला संकुचित करें।',
          en: 'An address with two `::` is invalid. When two zero runs are the same length, RFC 5952 says compress the **leftmost** one.',
        },
      },
      scene: (t) => ({
        nodes: [
          {
            id: 'a',
            x: 430,
            y: 200,
            type: 'server' as const,
            label:
              t > 0.7
                ? '2001:db8::1'
                : t > 0.35
                  ? '2001:db8:0:0:0:0:0:1'
                  : '2001:0db8:0000:0000:0000:0000:0000:0001',
            sub: t > 0.7 ? 'rule 2 — the gap' : t > 0.35 ? 'rule 1 — leading zeros gone' : 'the full thing',
            accent: t > 0.7 ? OK : CCNA,
            pulse: t > 0.7,
          },
        ],
      }),
      aside: (t) => ({
        title: H('એક જ સરનામું, ત્રણ રીતે', 'वही पता, तीन तरीकों से', 'One address, three ways'),
        caption: H('ત્રણેય બિલકુલ એક જ છે.', 'तीनों बिल्कुल एक ही हैं।', 'All three are exactly the same address.'),
        head: ['step', 'address'],
        rows: [
          ['full', '2001:0db8:0000:0000:0000:0000:0000:0001'],
          ...(t > 0.35 ? [['no leading zeros', '2001:db8:0:0:0:0:0:1']] : []),
          ...(t > 0.7 ? [['with ::', '2001:db8::1']] : []),
        ],
      }),
    },
    {
      ms: 3000,
      label: H('ભાગ પાડવાની જગ્યા', 'हिस्से करने की जगह', 'Where to cut it'),
      text: {
        beginner: {
          gu: 'IPv6 સરનામું લગભગ હંમેશા વચ્ચેથી બે સરખા ભાગમાં કપાય: પહેલાં 64 bits **નેટવર્ક**, પછીનાં 64 bits **યજમાન**. એટલે subnetting ની મોટાભાગની ગણતરી ગાયબ થઈ જાય — તમે `/64` વાપરો છો, બસ. અને દરેક `/64` માં IPv4 ની આખી દુનિયા કરતાં વધુ સરનામાં છે.',
          hi: 'IPv6 पता लगभग हमेशा बीच से दो समान हिस्सों में कटता है: पहले 64 bits **network**, बाद के 64 bits **host**। इसलिए subnetting की ज्यादातर गणना गायब हो जाती है — आप `/64` इस्तेमाल करते हैं, बस। और हर `/64` में IPv4 की पूरी दुनिया से ज्यादा पते हैं।',
          en: 'An IPv6 address is nearly always cut straight down the middle: the first 64 bits are the **network**, the last 64 the **host**. Most subnetting arithmetic simply disappears — you use a `/64` and that is that. And a single `/64` holds more addresses than the entire IPv4 internet.',
        },
        exam: {
          gu: 'ISP સામાન્ય રીતે સાઇટને `/48` આપે, એટલે 65,536 `/64` subnets બને — VLAN દીઠ એક, આરામથી. `/64` થી નાનું વાપરવાથી SLAAC તૂટે છે.',
          hi: 'ISP आमतौर पर site को `/48` देता है, इसलिए 65,536 `/64` subnets बनते हैं — हर VLAN के लिए एक, आराम से। `/64` से छोटा इस्तेमाल करने पर SLAAC टूटता है।',
          en: 'An ISP typically hands a site a `/48`, which yields 65,536 `/64` subnets — one per VLAN, comfortably. Going smaller than a `/64` breaks SLAAC.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'n', x: 270, y: 180, type: 'cloud' as const, label: '2001:db8:acad:10', sub: t > 0.3 ? 'first 64 bits — the network' : undefined, accent: CCNA, pulse: t > 0.3 },
          { id: 'h', x: 640, y: 260, type: 'pc' as const, label: '::1', sub: t > 0.5 ? 'last 64 bits — the host' : undefined, accent: t > 0.5 ? BEG : 'var(--nq-text-mute)' },
        ],
        links: [{ id: 'l', from: 'n', to: 'h', state: 'up' as const }],
      }),
      aside: () => ({
        title: H('ક્યાં કપાય', 'कहां कटता है', 'Where the cut falls'),
        head: ['part', 'bits', 'says'],
        rows: [
          ['prefix', '64', 'which network'],
          ['interface ID', '64', 'which device on it'],
        ],
      }),
    },
    {
      ms: 3200,
      label: H('દરેક port ને એકથી વધુ સરનામાં', 'हर port को एक से ज्यादा पते', 'More than one address per port'),
      text: {
        beginner: {
          gu: 'IPv4 માં એક port = એક સરનામું. IPv6 માં એવું નથી. દરેક interface પાસે **link-local** સરનામું હોય જ છે — `fe80::` થી શરૂ, આપોઆપ બનેલું, ફક્ત એ એક કેબલ પૂરતું. અને એની ઉપર **global** સરનામું, જે ખરેખર ઇન્ટરનેટ પર વપરાય.',
          hi: 'IPv4 में एक port = एक पता। IPv6 में ऐसा नहीं। हर interface के पास **link-local** पता होता ही है — `fe80::` से शुरू, अपने आप बना, केवल उसी एक cable तक सीमित। और उसके ऊपर **global** पता, जो असल में Internet पर इस्तेमाल होता है।',
          en: 'In IPv4 one port means one address. Not in IPv6. Every interface always has a **link-local** address — starting `fe80::`, generated automatically, valid only on that one wire. On top of that sits a **global** address, the one the internet actually uses.',
        },
        exam: {
          gu: 'Link-local જરૂરી છે: neighbour discovery અને routing protocol adjacency એના પર જ ચાલે. Global સરનામું SLAAC (RA માંથી prefix + જાતે બનાવેલો interface ID), DHCPv6, કે હાથે ગોઠવાય.',
          hi: 'Link-local जरूरी है: neighbour discovery और routing protocol adjacency उसी पर चलते हैं। Global पता SLAAC (RA से prefix + खुद बनाया interface ID), DHCPv6, या हाथ से सेट होता है।',
          en: 'The link-local is mandatory: neighbour discovery and routing-protocol adjacencies run over it. The global one arrives by SLAAC (a prefix from an RA plus a self-made interface ID), by DHCPv6, or by hand.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc', x: 200, y: 200, type: 'pc' as const, label: 'PC', sub: t > 0.25 ? 'fe80::a1 (link-local)' : undefined, accent: BEG, pulse: t > 0.25 && t < 0.5 },
          { id: 'r', x: 560, y: 200, type: 'router' as const, label: 'R1', sub: t > 0.25 ? 'fe80::1 (link-local)' : undefined, accent: CCNA },
        ],
        links: [{ id: 'l', from: 'pc', to: 'r', state: 'up' as const, flowing: t > 0.4 }],
        packets:
          t > 0.45
            ? [{ id: 'p', from: 'r', to: 'pc', t: 0.15 + ease((t - 0.45) / 0.55) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'RA: use 2001:db8:acad:10::/64' }]
            : [],
      }),
      say: (t) => (t > 0.85 ? { nodeId: 'pc', text: H('ઠીક — 2001:db8:acad:10::a1', 'ठीक — 2001:db8:acad:10::a1', 'right — 2001:db8:acad:10::a1') } : null),
      aside: (t) => ({
        title: H('PC ના સરનામાં', 'PC के पते', 'The PC’s addresses'),
        head: ['kind', 'address', 'good for'],
        rows: [
          ['link-local', 'fe80::a1', 'this cable only'],
          ...(t > 0.85 ? [['global', '2001:db8:acad:10::a1', 'the internet']] : []),
        ],
      }),
    },
    {
      ms: 2800,
      label: H('બંને સાથે ચાલે', 'दोनों साथ चलते हैं', 'Both at once'),
      text: {
        beginner: {
          gu: 'એક રાતમાં દુનિયા બદલાવાની નથી, એટલે મોટાભાગનાં નેટવર્ક **બંને** ચલાવે છે — એને dual-stack કહે છે. એક જ interface પર IPv4 સરનામું અને IPv6 સરનામું બંને, બે અલગ routing tables, અને દરેક જોડાણ જે ઉપલબ્ધ હોય એ વાપરે.',
          hi: 'एक रात में दुनिया बदलने वाली नहीं, इसलिए ज्यादातर networks **दोनों** चलाते हैं — इसे dual-stack कहते हैं। एक ही interface पर IPv4 पता और IPv6 पता दोनों, दो अलग routing tables, और हर connection जो उपलब्ध हो वह इस्तेमाल करता है।',
          en: 'The world is not changing overnight, so most networks run **both** — dual-stack. One interface carries an IPv4 address and an IPv6 address, there are two separate routing tables, and each connection takes whichever is available.',
        },
        exam: {
          gu: '`show ipv6 route` અલગ છે `show ip route` થી — બંને જોવા પડે. Dual-stack માં IPv6 ને પ્રાધાન્ય મળે છે, એટલે IPv6 તૂટેલું હશે તો જોડાણો ધીમાં પડશે ભલે IPv4 બરાબર હોય.',
          hi: '`show ipv6 route` अलग है `show ip route` से — दोनों देखने पड़ते हैं। Dual-stack में IPv6 को प्राथमिकता मिलती है, इसलिए IPv6 टूटा होगा तो connections धीमे होंगे भले IPv4 ठीक हो।',
          en: '`show ipv6 route` is a separate table from `show ip route`, and you have to look at both. Hosts prefer IPv6 when dual-stacked, so broken IPv6 makes connections slow even while IPv4 is perfectly fine.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'pc', x: 200, y: 200, type: 'pc' as const, label: 'PC', sub: '10.0.10.5 + 2001:db8::a1', accent: BEG, pulse: true },
          { id: 'r', x: 560, y: 200, type: 'router' as const, label: 'R1', sub: 'dual-stack', accent: OK },
        ],
        links: [{ id: 'l', from: 'pc', to: 'r', state: 'up' as const, flowing: true }],
        packets: [
          { id: 'a', from: 'pc', to: 'r', t: 0.35, color: 'var(--nq-pkt-tcp)', label: 'IPv4' },
          { id: 'b', from: 'pc', to: 'r', t: 0.7, color: 'var(--nq-pkt-ctrl)', label: 'IPv6' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: '128 bits, hexadecimal માં આઠ જૂથ. આગળનાં શૂન્ય કાઢો, અને સળંગ શૂન્ય-જૂથોને **એક જ વાર** `::` થી બદલો. વચ્ચેથી કપાય: પહેલાં 64 નેટવર્ક, પછીનાં 64 યજમાન — એટલે લગભગ હંમેશા `/64`. દરેક interface પાસે `fe80::` વાળું link-local હોય જ, અને એની ઉપર global.',
    hi: '128 bits, hexadecimal में आठ समूह। आगे के शून्य हटाएं, और लगातार शून्य-समूहों को **केवल एक बार** `::` से बदलें। बीच से कटता है: पहले 64 network, बाद के 64 host — इसलिए लगभग हमेशा `/64`। हर interface के पास `fe80::` वाला link-local होता ही है, और उसके ऊपर global।',
    en: '128 bits, eight hexadecimal groups. Drop leading zeros and replace one run of zero groups — **only one** — with `::`. The cut falls in the middle: first 64 bits network, last 64 host, which is why it is nearly always a `/64`. Every interface always has an `fe80::` link-local, with a global address on top.',
  },
  check: {
    q: H(
      '`2001:0db8:0000:0000:ab00:0000:0000:0001` નું સાચું ટૂંકું રૂપ કયું?',
      '`2001:0db8:0000:0000:ab00:0000:0000:0001` का सही छोटा रूप कौन सा?',
      'Which is the correct shortened form of `2001:0db8:0000:0000:ab00:0000:0000:0001`?',
    ),
    options: [
      H('2001:db8::ab00:0:0:1', '2001:db8::ab00:0:0:1', '2001:db8::ab00:0:0:1'),
      H('2001:db8::ab00::1', '2001:db8::ab00::1', '2001:db8::ab00::1'),
      H('2001:db8:0:0:ab00::0001', '2001:db8:0:0:ab00::0001', '2001:db8:0:0:ab00::0001'),
    ],
    answer: 0,
    explain: H(
      'બે શૂન્ય-ભાગ છે, પણ `::` **એક જ વાર** વપરાય — એટલે બીજો વિકલ્પ અમાન્ય. બે ભાગ સરખી લંબાઈના હોવાથી ડાબો સંકેલાય, અને આગળનાં શૂન્ય પણ કાઢવાનાં — એટલે ત્રીજો અધૂરો છે.',
      'दो शून्य-भाग हैं, पर `::` **केवल एक बार** इस्तेमाल होता है — इसलिए दूसरा विकल्प अमान्य। दो भाग समान लंबाई के होने से बाईं तरफ वाला संकुचित होता है, और आगे के शून्य भी हटाने हैं — इसलिए तीसरा अधूरा है।',
      'There are two zero runs, but `::` may appear **only once**, which rules out the second. The runs are the same length so the leftmost is compressed, and leading zeros go too — which leaves the third one half-done.',
    ),
  },
}
