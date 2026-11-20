import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'

/* ------------------------------------------------------------------ b3l1 */

export const b3l1: LessonSpec = {
  why: {
    gu: 'મોટી ફાઈલ એક આખા ટુકડામાં મોકલાતી નથી — એને નાના ટુકડામાં કાપીને મોકલાય છે. આ એક નિર્ણય નેટવર્કિંગની લગભગ દરેક વસ્તુનું કારણ છે: શા માટે TCP જોઈએ, શા માટે ક્રમાંક જોઈએ, શા માટે ફરી મોકલવું પડે.',
    hi: 'बड़ी फाइल एक पूरे टुकड़े में नहीं भेजी जाती — उसे छोटे टुकड़ों में काटकर भेजा जाता है। यह एक निर्णय networking की लगभग हर चीज का कारण है: क्यों TCP चाहिए, क्यों क्रमांक चाहिए, क्यों फिर से भेजना पड़ता है।',
    en: 'A big file is never sent in one lump — it is chopped into small pieces. That single decision explains almost everything else in networking: why TCP exists, why sequence numbers exist, why anything is ever re-sent.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'એક મોટી ફાઈલ', hi: 'एक बड़ी फाइल', en: 'One big file' },
      text: {
        beginner: {
          gu: 'ધારો કે તમારે 10 MB નો ફોટો મોકલવો છે. એક જ ટુકડામાં મોકલો તો વચ્ચે એક bit બગડે તો આખું 10 MB ફરી મોકલવું પડે. વળી એ એક ટુકડો વાયર પર કબજો કરીને બેસી જાય, બીજા કોઈને વારો જ ન આવે.',
          hi: 'मान लें आपको 10 MB का फोटो भेजना है। एक ही टुकड़े में भेजें तो बीच में एक bit खराब हो जाए तो पूरा 10 MB फिर भेजना पड़े। ऊपर से वह एक टुकड़ा तार पर कब्जा करके बैठ जाए, किसी और की बारी ही न आए।',
          en: 'Say you want to send a 10 MB photo. Send it as one lump and a single corrupted bit means resending all 10 MB. Worse, that one lump hogs the wire and nobody else gets a turn.',
        },
        exam: {
          gu: 'Medium ની MTU મર્યાદા છે (Ethernet માં સામાન્ય રીતે 1500 bytes). એથી મોટો data segment/fragment માં વહેંચાવો જ પડે.',
          hi: 'Medium की MTU सीमा है (Ethernet में आमतौर पर 1500 bytes)। उससे बड़ा data segment/fragment में बांटना ही पड़ता है।',
          en: 'The medium has an MTU limit (typically 1500 bytes on Ethernet). Anything larger must be broken into segments or fragments.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'PC A', sub: 'photo.jpg · 10 MB', accent: BEG, pulse: true },
          { id: 'b', x: 650, y: 230, type: 'pc' as const, label: 'PC B', accent: CCNA },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'ટુકડામાં કાપો', hi: 'टुकड़ों में काटें', en: 'Chop it into pieces' },
      text: {
        beginner: {
          gu: 'એટલે કમ્પ્યુટર ફાઈલને હજારો નાના ટુકડામાં કાપે છે. દરેક ટુકડાને એક packet કહે છે, અને દરેક પર નંબર લખેલો હોય છે: 1, 2, 3… જેથી સામેના છેડે ફરી સાચા ક્રમમાં જોડી શકાય.',
          hi: 'इसलिए कंप्यूटर फाइल को हजारों छोटे टुकड़ों में काटता है। हर टुकड़े को एक packet कहते हैं, और हर एक पर नंबर लिखा होता है: 1, 2, 3… ताकि दूसरे छोर पर फिर से सही क्रम में जोड़ा जा सके।',
          en: 'So the computer chops the file into thousands of small pieces. Each piece is a packet, and each carries a number: 1, 2, 3… so the far end can reassemble them in the right order.',
        },
        exam: {
          gu: 'TCP data ને MSS પ્રમાણે segments માં વહેંચે છે અને દરેકને sequence number આપે છે. Receiver એ sequence numbers થી ordered byte stream ફરી બનાવે છે.',
          hi: 'TCP data को MSS के अनुसार segments में बांटता है और हर एक को sequence number देता है। Receiver sequence numbers से ordered byte stream फिर से बनाता है।',
          en: 'TCP divides data into segments sized by the MSS and numbers each with a sequence number. The receiver rebuilds the ordered byte stream from those numbers.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'PC A', accent: BEG },
          { id: 'b', x: 650, y: 230, type: 'pc' as const, label: 'PC B', accent: CCNA },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up', flowing: t > 0.3 }],
        packets:
          t > 0.3
            ? [
                { id: 'p1', from: 'a', to: 'b', t: 0.08 + ease((t - 0.3) / 0.7) * 0.3, color: 'var(--nq-pkt-data)', label: '#1' },
                { id: 'p2', from: 'a', to: 'b', t: 0.08 + ease((t - 0.3) / 0.7) * 0.18, color: 'var(--nq-pkt-data)', label: '#2' },
                { id: 'p3', from: 'a', to: 'b', t: 0.08 + ease((t - 0.3) / 0.7) * 0.07, color: 'var(--nq-pkt-data)', label: '#3' },
              ]
            : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'ટુકડા જુદા રસ્તે જઈ શકે', hi: 'टुकड़े अलग रास्तों से जा सकते हैं', en: 'Pieces can take different roads' },
      text: {
        beginner: {
          gu: 'મજાની વાત એ છે કે બધા ટુકડા એક જ રસ્તે જાય એવું જરૂરી નથી! એક રસ્તો ભીડવાળો હોય તો કેટલાક packets બીજા રસ્તે નીકળી જાય. એટલે એ અલગ ક્રમમાં પણ પહોંચી શકે — પણ નંબર લખેલા હોવાથી વાંધો નથી.',
          hi: 'मज़े की बात यह है कि सभी टुकड़े एक ही रास्ते से जाएं यह जरूरी नहीं! एक रास्ता भीड़ भरा हो तो कुछ packets दूसरे रास्ते से निकल जाते हैं। इसलिए वे अलग क्रम में भी पहुंच सकते हैं — पर नंबर लिखे होने से कोई दिक्कत नहीं।',
          en: 'Here is the clever part: the pieces need not take the same road. If one path is congested some packets slip down another. They may therefore arrive out of order — but the numbers make that harmless.',
        },
        exam: {
          gu: 'IP એ connectionless છે: દરેક packet independently routed થાય છે. Out-of-order delivery સામાન્ય છે અને TCP એને receiver પર reorder કરીને સુધારે છે.',
          hi: 'IP connectionless है: हर packet independently routed होता है। Out-of-order delivery सामान्य है और TCP उसे receiver पर reorder करके सुधारता है।',
          en: 'IP is connectionless: each packet is routed independently. Out-of-order delivery is normal and TCP corrects it by reordering at the receiver.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 130, y: 240, type: 'pc' as const, label: 'PC A', accent: BEG },
          { id: 'r1', x: 400, y: 130, type: 'router' as const, label: 'Path 1', accent: CCNA },
          { id: 'r2', x: 400, y: 350, type: 'router' as const, label: 'Path 2', accent: CCNP },
          { id: 'b', x: 690, y: 240, type: 'pc' as const, label: 'PC B', accent: CCNA },
        ],
        links: [
          { id: 'a1', from: 'a', to: 'r1', state: 'up', flowing: true },
          { id: 'a2', from: 'a', to: 'r2', state: 'up', flowing: true },
          { id: 'b1', from: 'r1', to: 'b', state: 'up', flowing: true },
          { id: 'b2', from: 'r2', to: 'b', state: 'up', flowing: true },
        ],
        packets:
          t < 0.5
            ? [
                { id: 'p1', from: 'a', to: 'r1', t: ease(t / 0.5), color: 'var(--nq-pkt-data)', label: '#1' },
                { id: 'p2', from: 'a', to: 'r2', t: ease(Math.max(0, t - 0.1) / 0.4), color: 'var(--nq-pkt-tcp)', label: '#2' },
              ]
            : [
                { id: 'p1', from: 'r1', to: 'b', t: ease((t - 0.5) / 0.5), color: 'var(--nq-pkt-data)', label: '#1' },
                { id: 'p2', from: 'r2', to: 'b', t: ease(Math.min(1, (t - 0.42) / 0.5)), color: 'var(--nq-pkt-tcp)', label: '#2' },
              ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'એક ટુકડો ખોવાય તો', hi: 'एक टुकड़ा खो जाए तो', en: 'When one piece goes missing' },
      text: {
        beginner: {
          gu: 'ધારો કે packet #2 રસ્તામાં ખોવાઈ ગયું. હવે આખી 10 MB ફાઈલ ફરી મોકલવાની જરૂર નથી — ફક્ત એ એક જ ટુકડો ફરી માગી લેવાય. આ જ તો ટુકડા કરવાનો સૌથી મોટો ફાયદો છે.',
          hi: 'मान लें packet #2 रास्ते में खो गया। अब पूरी 10 MB फाइल फिर भेजने की जरूरत नहीं — केवल वह एक ही टुकड़ा फिर मांग लिया जाता है। यही तो टुकड़े करने का सबसे बड़ा फायदा है।',
          en: 'Suppose packet #2 is lost en route. There is no need to resend the whole 10 MB — only that one piece is asked for again. That is the biggest payoff of chopping things up.',
        },
        exam: {
          gu: 'Receiver missing segment માટે duplicate ACKs મોકલે છે; sender fast retransmit કરે છે. ફક્ત ખોવાયેલો segment ફરી જાય, આખો stream નહીં.',
          hi: 'Receiver missing segment के लिए duplicate ACKs भेजता है; sender fast retransmit करता है। केवल खोया segment फिर जाता है, पूरा stream नहीं।',
          en: 'The receiver sends duplicate ACKs for the missing segment and the sender performs a fast retransmit. Only the lost segment is resent, not the whole stream.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'PC A', accent: BEG },
          { id: 'b', x: 650, y: 230, type: 'pc' as const, label: 'PC B', accent: CCNA, pulse: t > 0.5 },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up', flowing: true }],
        packets:
          t < 0.45
            ? [{ id: 'lost', from: 'a', to: 'b', t: 0.08 + ease(t / 0.45) * 0.42, color: 'var(--nq-err)', label: '#2 lost ✕' }]
            : t < 0.72
              ? [{ id: 'ack', from: 'b', to: 'a', t: 0.08 + ease((t - 0.45) / 0.27) * 0.84, color: 'var(--nq-pkt-ctrl)', label: 'resend #2' }]
              : [{ id: 'again', from: 'a', to: 'b', t: 0.08 + ease((t - 0.72) / 0.28) * 0.84, color: 'var(--nq-ok)', label: '#2 again' }],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'સામે ફરી જોડાય', hi: 'दूसरे छोर पर फिर से जुड़ता है', en: 'Reassembled at the far end' },
      text: {
        beginner: {
          gu: 'બધા ટુકડા પહોંચી જાય એટલે સામેનું કમ્પ્યુટર નંબર પ્રમાણે ગોઠવીને ફરી આખી ફાઈલ બનાવી દે છે. તમને તો બસ ફોટો દેખાય છે — વચ્ચે હજારો ટુકડા થયા હતા એની ખબર પણ પડતી નથી.',
          hi: 'सभी टुकड़े पहुंच जाएं तो सामने का कंप्यूटर नंबर के अनुसार क्रम में रखकर पूरी फाइल बना देता है। आपको तो बस फोटो दिखता है — बीच में हजारों टुकड़े हुए थे इसका पता भी नहीं चलता।',
          en: 'Once every piece has arrived the far computer sorts them by number and rebuilds the whole file. All you see is the photo — with no hint that it travelled as thousands of fragments.',
        },
        exam: {
          gu: 'TCP receive buffer માં segments reorder થઈને application ને contiguous byte stream તરીકે મળે છે. Application ને segmentation દેખાતું જ નથી.',
          hi: 'TCP receive buffer में segments reorder होकर application को contiguous byte stream के रूप में मिलते हैं। Application को segmentation दिखता ही नहीं।',
          en: 'Segments are reordered in the TCP receive buffer and handed to the application as a contiguous byte stream. The application never sees the segmentation.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'PC A', accent: BEG },
          { id: 'b', x: 650, y: 230, type: 'pc' as const, label: 'PC B', sub: t > 0.6 ? 'photo.jpg ✓' : undefined, accent: CCNA, pulse: t > 0.6 },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up' }],
      }),
      aside: (t) => ({
        title: { gu: 'ફરી જોડાય', hi: 'फिर से जुड़ना', en: 'Reassembly' },
        head: ['#', 'status'],
        rows: [
          ['1', 'received'],
          ['2', t > 0.2 ? 'received' : 'waiting'],
          ['3', t > 0.4 ? 'received' : 'waiting'],
          ['file', t > 0.6 ? 'complete ✓' : 'incomplete'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'મોટો ડેટા નાના નંબરવાળા ટુકડામાં જાય છે. ટુકડા જુદા રસ્તે અને જુદા ક્રમે પહોંચી શકે — નંબર હોવાથી વાંધો નહીં. એક ખોવાય તો ફક્ત એ જ ફરી મોકલાય, આખી ફાઈલ નહીં.',
    hi: 'बड़ा data छोटे नंबर वाले टुकड़ों में जाता है। टुकड़े अलग रास्तों से और अलग क्रम में पहुंच सकते हैं — नंबर होने से कोई दिक्कत नहीं। एक खो जाए तो केवल वही फिर भेजा जाता है, पूरी फाइल नहीं।',
    en: 'Large data travels as small numbered pieces. They may take different roads and arrive out of order — the numbers make that fine. If one is lost, only that one is resent, never the whole file.',
  },
  check: {
    q: {
      gu: 'Packets ને નંબર આપવાનું સૌથી મોટું કારણ શું?',
      hi: 'Packets को नंबर देने का सबसे बड़ा कारण क्या है?',
      en: 'What is the main reason packets are numbered?',
    },
    options: [
      { gu: 'સામેના છેડે સાચા ક્રમમાં ફરી જોડી શકાય', hi: 'दूसरे छोर पर सही क्रम में फिर से जोड़ा जा सके', en: 'So the far end can reassemble them in the right order' },
      { gu: 'એથી packet ઝડપથી જાય', hi: 'इससे packet तेजी से जाए', en: 'So the packets travel faster' },
      { gu: 'Router ને નંબર ગમે છે', hi: 'Router को नंबर पसंद हैं', en: 'Because routers like numbers' },
    ],
    answer: 0,
    explain: {
      gu: 'Packets જુદા રસ્તે જઈ શકે એટલે જુદા ક્રમે પહોંચે. નંબર હોવાથી receiver એમને સાચા ક્રમમાં ગોઠવી શકે અને ખૂટતો ટુકડો ઓળખી શકે.',
      hi: 'Packets अलग रास्तों से जा सकते हैं इसलिए अलग क्रम में पहुंचते हैं। नंबर होने से receiver इन्हें सही क्रम में रख सकता है और खोया टुकड़ा पहचान सकता है।',
      en: 'Packets may take different roads and so arrive out of order. The numbers let the receiver sort them and spot which piece is missing.',
    },
  },
}

/* ------------------------------------------------------------------ b3l2 */

export const b3l2: LessonSpec = {
  why: {
    gu: 'OSI ના સાત layers દરેક પરીક્ષામાં પુછાય છે, પણ એને ગોખવાની જરૂર નથી. એ ખરેખર એક સાદો વિચાર છે: મોટું કામ નાના ભાગમાં વહેંચો, જેથી દરેક ભાગ બીજાની ચિંતા કર્યા વગર પોતાનું કામ કરી શકે.',
    hi: 'OSI के सात layers हर परीक्षा में पूछे जाते हैं, पर इन्हें रटने की जरूरत नहीं। यह असल में एक सरल विचार है: बड़े काम को छोटे हिस्सों में बांटें, ताकि हर हिस्सा दूसरे की चिंता किए बिना अपना काम कर सके।',
    en: 'The seven OSI layers come up in every exam, but there is nothing to memorise. The idea is simple: split a big job into small parts so each can do its work without worrying about the others.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'સાત માળનું બિલ્ડિંગ', hi: 'सात मंजिला बिल्डिंग', en: 'A building with seven floors' },
      text: {
        beginner: {
          gu: 'ડેટા મોકલવાનું કામ સાત ભાગમાં વહેંચાયેલું છે. ઉપરના માળે તમારી application (browser), સૌથી નીચેના માળે વાયર. વચ્ચેના દરેક માળનું પોતાનું એક ચોક્કસ કામ છે — અને એ બીજા માળનું કામ કરવા જતું નથી.',
          hi: 'Data भेजने का काम सात हिस्सों में बंटा है। ऊपर की मंजिल पर आपकी application (browser), सबसे नीचे की मंजिल पर तार। बीच की हर मंजिल का अपना एक निश्चित काम है — और वह दूसरी मंजिल का काम नहीं करती।',
          en: 'Sending data is split into seven jobs. The top floor is your application (the browser), the bottom floor is the wire. Every floor in between has one specific job — and never does another floor’s work.',
        },
        exam: {
          gu: 'OSI model: 7 Application, 6 Presentation, 5 Session, 4 Transport, 3 Network, 2 Data Link, 1 Physical. દરેક layer નીચેના layer ની સેવા વાપરે અને ઉપરનાને સેવા આપે.',
          hi: 'OSI model: 7 Application, 6 Presentation, 5 Session, 4 Transport, 3 Network, 2 Data Link, 1 Physical। हर layer नीचे की layer की सेवा इस्तेमाल करती है और ऊपर वाले को सेवा देती है।',
          en: 'The OSI model: 7 Application, 6 Presentation, 5 Session, 4 Transport, 3 Network, 2 Data Link, 1 Physical. Each layer consumes the service below and provides a service above.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 430, y: 230, type: 'pc' as const, label: 'Your browser', sub: 'layer 7', accent: BEG, pulse: true },
        ],
      }),
      aside: () => ({
        title: { gu: 'સાત માળ', hi: 'सात मंजिलें', en: 'The seven floors' },
        head: ['#', 'layer', 'job'],
        rows: [
          ['7', 'Application', 'the app itself'],
          ['6', 'Presentation', 'format, encrypt'],
          ['5', 'Session', 'keep the chat open'],
          ['4', 'Transport', 'TCP/UDP, ports'],
          ['3', 'Network', 'IP, routing'],
          ['2', 'Data Link', 'MAC, switching'],
          ['1', 'Physical', 'the wire itself'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'દરેક માળે એક કવર ચઢે', hi: 'हर मंजिल पर एक कवर चढ़ता है', en: 'Each floor adds an envelope' },
      text: {
        beginner: {
          gu: 'ડેટા ઉપરથી નીચે ઉતરે છે અને દરેક માળે એના પર એક નવું કવર ચઢે છે. Transport માળે port નંબર ઉમેરાય, Network માળે IP સરનામું, Data Link માળે MAC. અંતે વાયર સુધી પહોંચે ત્યારે એ ત્રણ કવરમાં વીંટળાયેલું હોય છે.',
          hi: 'Data ऊपर से नीचे उतरता है और हर मंजिल पर उस पर एक नया कवर चढ़ता है। Transport मंजिल पर port नंबर जुड़ता है, Network मंजिल पर IP पता, Data Link मंजिल पर MAC। अंत में तार तक पहुंचते समय वह तीन कवरों में लिपटा होता है।',
          en: 'The data walks down and each floor wraps it in another envelope. Transport adds port numbers, Network adds IP addresses, Data Link adds MACs. By the time it reaches the wire it is wrapped three times over.',
        },
        exam: {
          gu: 'Encapsulation: data → segment (TCP/UDP header) → packet (IP header) → frame (Ethernet header + trailer) → bits. દરેક layer પોતાનો PDU બનાવે છે.',
          hi: 'Encapsulation: data → segment (TCP/UDP header) → packet (IP header) → frame (Ethernet header + trailer) → bits। हर layer अपना PDU बनाती है।',
          en: 'Encapsulation: data → segment (TCP/UDP header) → packet (IP header) → frame (Ethernet header and trailer) → bits. Each layer builds its own PDU.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 430, y: 230, type: 'pc' as const, label: 'PC A', sub: t > 0.7 ? 'frame ready' : t > 0.45 ? 'packet' : t > 0.2 ? 'segment' : 'data', accent: BEG, pulse: true },
        ],
      }),
      aside: (t) => ({
        title: { gu: 'કવર ચઢતાં જાય', hi: 'कवर चढ़ते जाते हैं', en: 'Wrapping up' },
        head: ['layer', 'adds', 'now called'],
        rows: [
          ['7 app', 'your data', 'data'],
          ['4 transport', t > 0.2 ? 'port numbers' : '…', t > 0.2 ? 'segment' : '—'],
          ['3 network', t > 0.45 ? 'IP addresses' : '…', t > 0.45 ? 'packet' : '—'],
          ['2 data link', t > 0.7 ? 'MAC addresses' : '…', t > 0.7 ? 'frame' : '—'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'વાયર પર bits જાય', hi: 'तार पर bits जाते हैं', en: 'Bits go onto the wire' },
      text: {
        beginner: {
          gu: 'સૌથી નીચેના માળે બધું ફક્ત 1 અને 0 બની જાય છે, અને વાયર પર નીકળી પડે છે. વાયરને ખબર નથી કે અંદર શું છે — એ તો ફક્ત વીજળીના ધક્કા મોકલે છે.',
          hi: 'सबसे नीचे की मंजिल पर सब कुछ केवल 1 और 0 बन जाता है, और तार पर निकल पड़ता है। तार को नहीं पता कि अंदर क्या है — वह तो केवल बिजली के धक्के भेजता है।',
          en: 'On the bottom floor everything becomes just 1s and 0s and heads out onto the wire. The wire has no idea what is inside — it only pushes pulses of electricity.',
        },
        exam: {
          gu: 'Layer 1 encoding (જેમ કે Manchester, 4B/5B) bits ને signal transitions માં બદલે છે. કોઈ addressing કે error recovery અહીં નથી.',
          hi: 'Layer 1 encoding (जैसे Manchester, 4B/5B) bits को signal transitions में बदलती है। कोई addressing या error recovery यहां नहीं है।',
          en: 'Layer 1 encoding (Manchester, 4B/5B and so on) turns bits into signal transitions. There is no addressing or error recovery here.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'PC A', accent: BEG },
          { id: 'b', x: 650, y: 230, type: 'pc' as const, label: 'PC B', accent: CCNA },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up', flowing: true, label: 'layer 1 · bits' }],
        packets: [{ id: 'p', from: 'a', to: 'b', t: 0.08 + ease(t) * 0.84, color: 'var(--nq-warn)', label: '1011 0010' }],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'સામે કવર ઉખડે', hi: 'सामने कवर उतरते हैं', en: 'The envelopes come off at the far end' },
      text: {
        beginner: {
          gu: 'સામેના કમ્પ્યુટરમાં બરાબર ઊલટું થાય છે: સૌથી નીચેથી ઉપર. Data Link કવર ઉખાડે, Network ઉખાડે, Transport ઉખાડે — અને અંતે browser ને ફક્ત અસલ ડેટા મળે છે, બિલકુલ જેવો મોકલ્યો હતો તેવો.',
          hi: 'सामने के कंप्यूटर में ठीक उल्टा होता है: सबसे नीचे से ऊपर। Data Link कवर उतारता है, Network उतारता है, Transport उतारता है — और अंत में browser को केवल असली data मिलता है, बिल्कुल वैसा ही जैसा भेजा गया था।',
          en: 'At the far computer the exact reverse happens, bottom to top. Data Link peels its envelope, Network peels its own, Transport peels its own — and the browser finally receives the original data, exactly as sent.',
        },
        exam: {
          gu: 'De-encapsulation દરેક layer પર થાય છે: દરેક header check થઈને દૂર થાય અને payload ઉપરના layer ને સોંપાય. આ peer-layer communication નો આધાર છે.',
          hi: 'De-encapsulation हर layer पर होता है: हर header check होकर हटाया जाता है और payload ऊपर वाली layer को सौंपा जाता है। यही peer-layer communication का आधार है।',
          en: 'De-encapsulation happens at each layer: the header is checked, removed, and the payload handed up. This is what makes peer-layer communication work.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'PC A', accent: BEG },
          { id: 'b', x: 650, y: 230, type: 'pc' as const, label: 'PC B', sub: t > 0.7 ? 'your data ✓' : 'unwrapping…', accent: CCNA, pulse: true },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up' }],
      }),
      aside: (t) => ({
        title: { gu: 'કવર ઉખડતાં જાય', hi: 'कवर उतरते जाते हैं', en: 'Unwrapping' },
        head: ['layer', 'removes', 'left with'],
        rows: [
          ['2 data link', t > 0.2 ? 'MAC header' : '…', t > 0.2 ? 'packet' : '—'],
          ['3 network', t > 0.45 ? 'IP header' : '…', t > 0.45 ? 'segment' : '—'],
          ['4 transport', t > 0.7 ? 'port header' : '…', t > 0.7 ? 'data' : '—'],
        ],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'કયું ઉપકરણ કયા માળે', hi: 'कौन सा उपकरण किस मंजिल पर', en: 'Which device lives on which floor' },
      text: {
        beginner: {
          gu: 'હવે બધું જોડાઈ જાય છે: Switch Layer 2 પર કામ કરે (MAC જુએ), Router Layer 3 પર (IP જુએ), Firewall Layer 4 પર (port જુએ). એટલે જ કહેવાય છે "Layer 2 switch" કે "Layer 3 router" — એ એમના માળનું નામ છે.',
          hi: 'अब सब कुछ जुड़ जाता है: Switch Layer 2 पर काम करता है (MAC देखता है), Router Layer 3 पर (IP देखता है), Firewall Layer 4 पर (port देखता है)। इसीलिए कहते हैं "Layer 2 switch" या "Layer 3 router" — यह उनकी मंजिल का नाम है।',
          en: 'Now it all clicks: a switch works at Layer 2 (reads MACs), a router at Layer 3 (reads IPs), a firewall at Layer 4 (reads ports). That is exactly why we say "Layer 2 switch" or "Layer 3 router" — we are naming their floor.',
        },
        exam: {
          gu: 'Troubleshooting માં layer ઓળખવાથી કામ અડધું થઈ જાય: link down = L1/L2, wrong gateway = L3, blocked port = L4, DNS = L7.',
          hi: 'Troubleshooting में layer पहचानने से काम आधा हो जाता है: link down = L1/L2, wrong gateway = L3, blocked port = L4, DNS = L7।',
          en: 'Identifying the layer halves the troubleshooting: link down = L1/L2, wrong gateway = L3, blocked port = L4, DNS = L7.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'p', x: 130, y: 240, type: 'pc' as const, label: 'PC', sub: 'L7 app', accent: BEG },
          { id: 'sw', x: 320, y: 240, type: 'switch' as const, label: 'Switch', sub: 'L2 · MAC', accent: CCNA },
          { id: 'r', x: 510, y: 240, type: 'router' as const, label: 'Router', sub: 'L3 · IP', accent: CCNP },
          { id: 'fw', x: 700, y: 240, type: 'firewall' as const, label: 'Firewall', sub: 'L4 · ports', accent: 'var(--nq-err)' },
        ],
        links: [
          { id: 'a', from: 'p', to: 'sw', state: 'up' },
          { id: 'b', from: 'sw', to: 'r', state: 'up' },
          { id: 'c', from: 'r', to: 'fw', state: 'up' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'સાત માળ એટલે સાત અલગ કામ. જતી વખતે દરેક માળે એક કવર ચઢે, આવતી વખતે ઉખડે. Switch માળ 2 પર, Router માળ 3 પર, Firewall માળ 4 પર — આટલું યાદ રહે તો OSI ગોખવાની જરૂર નથી.',
    hi: 'सात मंजिलें यानी सात अलग काम। जाते समय हर मंजिल पर एक कवर चढ़ता है, आते समय उतरता है। Switch मंजिल 2 पर, Router मंजिल 3 पर, Firewall मंजिल 4 पर — इतना याद रहे तो OSI रटने की जरूरत नहीं।',
    en: 'Seven floors means seven separate jobs. Going out, each floor adds an envelope; coming in, each removes one. Switch on floor 2, router on floor 3, firewall on floor 4 — remember that and there is nothing left to memorise.',
  },
  check: {
    q: {
      gu: 'Router કયા layer પર કામ કરે છે?',
      hi: 'Router किस layer पर काम करता है?',
      en: 'Which layer does a router work at?',
    },
    options: [
      { gu: 'Layer 3 — Network (IP)', hi: 'Layer 3 — Network (IP)', en: 'Layer 3 — Network (IP)' },
      { gu: 'Layer 2 — Data Link (MAC)', hi: 'Layer 2 — Data Link (MAC)', en: 'Layer 2 — Data Link (MAC)' },
      { gu: 'Layer 7 — Application', hi: 'Layer 7 — Application', en: 'Layer 7 — Application' },
    ],
    answer: 0,
    explain: {
      gu: 'Router IP સરનામાં જોઈને રસ્તો નક્કી કરે છે, અને IP એ Layer 3 નું કામ છે. Switch MAC જુએ છે એટલે એ Layer 2 પર છે.',
      hi: 'Router IP पते देखकर रास्ता तय करता है, और IP Layer 3 का काम है। Switch MAC देखता है इसलिए वह Layer 2 पर है।',
      en: 'A router decides the path by looking at IP addresses, and IP is Layer 3. A switch reads MACs, which puts it at Layer 2.',
    },
  },
}

/* ------------------------------------------------------------------ b3l3 */

export const b3l3: LessonSpec = {
  why: {
    gu: 'ડેટા મોકલવાની બે રીત છે: ખાતરી સાથે (ધીમું) અને ઝડપી (ખાતરી વગર). તમારી bank app પહેલી વાપરે, તમારી video call બીજી. ક્યારે કઈ વાપરવી એ ખબર હોવી એ engineer હોવાની નિશાની છે.',
    hi: 'Data भेजने के दो तरीके हैं: गारंटी के साथ (धीमा) और तेज (बिना गारंटी)। आपकी bank app पहला इस्तेमाल करती है, आपकी video call दूसरा। कब कौन सा इस्तेमाल करना है यह पता होना engineer होने की निशानी है।',
    en: 'There are two ways to send data: with a guarantee (slower) and fast (no guarantee). Your banking app picks the first, your video call the second. Knowing which to use when is what makes you an engineer.',
  },
  steps: [
    {
      ms: 2800,
      label: { gu: 'TCP — હાથ મિલાવીને શરૂઆત', hi: 'TCP — हाथ मिलाकर शुरुआत', en: 'TCP — start with a handshake' },
      text: {
        beginner: {
          gu: 'TCP રજિસ્ટર્ડ પોસ્ટ જેવું છે. વાત શરૂ કરતાં પહેલાં એ ત્રણ સંદેશની ઔપચારિકતા કરે છે: "તૈયાર છો?" — "હા, તમે?" — "હા, ચાલો". આને three-way handshake કહે છે. પછી જ અસલ ડેટા જાય.',
          hi: 'TCP रजिस्टर्ड पोस्ट जैसा है। बात शुरू करने से पहले वह तीन संदेशों की औपचारिकता करता है: "तैयार हो?" — "हां, आप?" — "हां, चलो"। इसे three-way handshake कहते हैं। उसके बाद ही असली data जाता है।',
          en: 'TCP is like registered post. Before anything is sent it goes through three messages: "ready?" — "yes, are you?" — "yes, go". That is the three-way handshake. Only then does the real data move.',
        },
        exam: {
          gu: 'Three-way handshake: SYN → SYN-ACK → ACK. આ દરમિયાન બંને બાજુ initial sequence numbers અને window size નક્કી થાય છે.',
          hi: 'Three-way handshake: SYN → SYN-ACK → ACK। इसके दौरान दोनों तरफ initial sequence numbers और window size तय होते हैं।',
          en: 'The three-way handshake is SYN → SYN-ACK → ACK, during which both sides agree initial sequence numbers and window sizes.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'Client', accent: BEG },
          { id: 'b', x: 650, y: 230, type: 'server' as const, label: 'Server', accent: CCNA },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up', flowing: true }],
        packets:
          t < 0.34
            ? [{ id: 's', from: 'a', to: 'b', t: 0.08 + ease(t / 0.34) * 0.84, color: 'var(--nq-pkt-tcp)', label: 'SYN' }]
            : t < 0.67
              ? [{ id: 'sa', from: 'b', to: 'a', t: 0.08 + ease((t - 0.34) / 0.33) * 0.84, color: 'var(--nq-pkt-ctrl)', label: 'SYN-ACK' }]
              : [{ id: 'ack', from: 'a', to: 'b', t: 0.08 + ease((t - 0.67) / 0.33) * 0.84, color: 'var(--nq-ok)', label: 'ACK' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'TCP — દરેક ટુકડાની પહોંચ', hi: 'TCP — हर टुकड़े की रसीद', en: 'TCP — a receipt for every piece' },
      text: {
        beginner: {
          gu: 'TCP માં દરેક ટુકડો પહોંચે એટલે સામેવાળો "મળી ગયું" કહે છે. ન કહે તો મોકલનાર થોડી વાર રાહ જોઈને ફરી મોકલે છે. એટલે ડેટા ખોવાય જ નહીં — પણ આ બધી ઔપચારિકતામાં સમય જાય છે.',
          hi: 'TCP में हर टुकड़ा पहुंचते ही सामने वाला "मिल गया" कहता है। न कहे तो भेजने वाला थोड़ी देर इंतजार करके फिर भेजता है। इसलिए data खोता ही नहीं — पर इस सारी औपचारिकता में समय जाता है।',
          en: 'In TCP every piece that arrives gets an acknowledgement. If none comes back the sender waits a moment and sends it again. So nothing is ever lost — but all that ceremony costs time.',
        },
        exam: {
          gu: 'TCP cumulative ACK, retransmission timers અને sliding window વાપરે છે. એ reliability, ordering અને flow control આપે છે — overhead ની કિંમતે.',
          hi: 'TCP cumulative ACK, retransmission timers और sliding window इस्तेमाल करता है। यह reliability, ordering और flow control देता है — overhead की कीमत पर।',
          en: 'TCP uses cumulative ACKs, retransmission timers and a sliding window. It gives reliability, ordering and flow control — at the cost of overhead.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'Client', accent: BEG },
          { id: 'b', x: 650, y: 230, type: 'server' as const, label: 'Server', accent: CCNA },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up', flowing: true }],
        packets:
          t < 0.5
            ? [{ id: 'd', from: 'a', to: 'b', t: 0.08 + ease(t / 0.5) * 0.84, color: 'var(--nq-pkt-data)', label: 'data #1' }]
            : [{ id: 'k', from: 'b', to: 'a', t: 0.08 + ease((t - 0.5) / 0.5) * 0.84, color: 'var(--nq-ok)', label: 'ACK #1 ✓' }],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'UDP — મોકલ્યું, ભૂલી ગયા', hi: 'UDP — भेजा और भूल गए', en: 'UDP — send it and forget' },
      text: {
        beginner: {
          gu: 'UDP સાદા પોસ્ટકાર્ડ જેવું છે. કોઈ હાથ મિલાવવાનું નહીં, કોઈ પહોંચ નહીં, કોઈ ફરી મોકલવાનું નહીં. ફક્ત મોકલી દો અને આગળ વધો. ખોવાય તો ખોવાય — પણ ઝડપ જબરદસ્ત.',
          hi: 'UDP साधारण पोस्टकार्ड जैसा है। कोई हाथ मिलाना नहीं, कोई रसीद नहीं, कोई फिर भेजना नहीं। बस भेज दो और आगे बढ़ो। खो जाए तो खो जाए — पर रफ्तार जबरदस्त।',
          en: 'UDP is a plain postcard. No handshake, no receipt, no retries. Just send it and move on. If it is lost, it is lost — but it is fast.',
        },
        exam: {
          gu: 'UDP connectionless છે, 8-byte header, કોઈ ACK કે retransmission નહીં. Application ને જોઈતી હોય તો reliability પોતે ઉમેરવી પડે.',
          hi: 'UDP connectionless है, 8-byte header, कोई ACK या retransmission नहीं। Application को चाहिए हो तो reliability खुद जोड़नी पड़ती है।',
          en: 'UDP is connectionless with an 8-byte header, no ACKs and no retransmission. If the application wants reliability it must add its own.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'Phone', accent: BEG },
          { id: 'b', x: 650, y: 230, type: 'server' as const, label: 'Video server', accent: CCNA },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up', flowing: true }],
        packets: [
          { id: 'u1', from: 'b', to: 'a', t: 0.08 + ((t * 1.6) % 1) * 0.84, color: 'var(--nq-pkt-dns)', label: 'frame' },
          { id: 'u2', from: 'b', to: 'a', t: 0.08 + ((t * 1.6 + 0.4) % 1) * 0.84, color: 'var(--nq-pkt-dns)' },
          { id: 'u3', from: 'b', to: 'a', t: 0.08 + ((t * 1.6 + 0.75) % 1) * 0.84, color: 'var(--nq-pkt-dns)' },
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'ખોવાય ત્યારે ફરક દેખાય', hi: 'कुछ खो जाए तब फर्क दिखता है', en: 'The difference shows when something is lost' },
      text: {
        beginner: {
          gu: 'અહીં જ બંનેનો ખરો ફરક દેખાય. Video call માં એક frame ખોવાય તો? UDP એને જવા દે છે — તમને એક ઝબકારો દેખાય અને વાત આગળ ચાલે. જો TCP હોત તો એ frame ફરી માગત, અને ત્યાં સુધી આખી video અટકી જાત. જૂનું frame હવે કામનું જ નથી!',
          hi: 'यहीं दोनों का असली फर्क दिखता है। Video call में एक frame खो जाए तो? UDP उसे जाने देता है — आपको एक चमकती झलक दिखती है और बात आगे चलती है। अगर TCP होता तो वह frame फिर मांगता, और तब तक पूरी video रुक जाती। पुराना frame अब काम का ही नहीं!',
          en: 'Here is where they truly differ. If one frame of a video call is lost, UDP simply lets it go — you see a flicker and the conversation carries on. Had it been TCP, it would demand that frame again and the whole video would stall. An old frame is of no use any more.',
        },
        exam: {
          gu: 'Real-time traffic માટે latency, reliability કરતાં વધુ અગત્યનું છે. એટલે VoIP, video અને gaming UDP વાપરે છે અને loss ને concealment થી સંભાળે છે.',
          hi: 'Real-time traffic के लिए latency, reliability से ज्यादा महत्वपूर्ण है। इसलिए VoIP, video और gaming UDP इस्तेमाल करते हैं और loss को concealment से संभालते हैं।',
          en: 'For real-time traffic latency matters more than reliability, so VoIP, video and gaming use UDP and hide loss with concealment instead.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 150, type: 'laptop' as const, label: 'Video · UDP', accent: BEG },
          { id: 'b', x: 650, y: 150, type: 'server' as const, label: 'keeps going ▶', accent: CCNA },
          { id: 'c', x: 230, y: 330, type: 'laptop' as const, label: 'File · TCP', accent: CCNP },
          { id: 'd', x: 650, y: 330, type: 'server' as const, label: 'waits ⏸', accent: CCNA },
        ],
        links: [
          { id: 'u', from: 'a', to: 'b', state: 'up', flowing: true },
          { id: 't', from: 'c', to: 'd', state: 'up', flowing: t < 0.4 },
        ],
        packets:
          t < 0.4
            ? [
                { id: 'ul', from: 'a', to: 'b', t: 0.08 + ease(t / 0.4) * 0.4, color: 'var(--nq-err)', label: 'lost ✕' },
                { id: 'tl', from: 'c', to: 'd', t: 0.08 + ease(t / 0.4) * 0.4, color: 'var(--nq-err)', label: 'lost ✕' },
              ]
            : [
                { id: 'un', from: 'a', to: 'b', t: 0.08 + ease((t - 0.4) / 0.6) * 0.84, color: 'var(--nq-ok)', label: 'next frame' },
                { id: 'tr', from: 'd', to: 'c', t: 0.08 + ease((t - 0.4) / 0.6) * 0.5, color: 'var(--nq-pkt-ctrl)', label: 'resend!' },
              ],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'કોણ શું વાપરે', hi: 'कौन क्या इस्तेमाल करता है', en: 'Who uses which' },
      text: {
        beginner: {
          gu: 'નિયમ સાદો છે. ડેટા સાચો હોવો જરૂરી હોય તો TCP — website, email, file download, bank. થોડું ખોવાય તો ચાલે પણ ઝડપ જોઈએ તો UDP — video call, live streaming, online game, DNS.',
          hi: 'नियम सरल है। Data सही होना जरूरी हो तो TCP — website, email, file download, bank। थोड़ा खो जाए तो चले पर रफ्तार चाहिए तो UDP — video call, live streaming, online game, DNS।',
          en: 'The rule is simple. If the data must be exactly right, use TCP — websites, email, file downloads, banking. If a little loss is fine but speed matters, use UDP — video calls, live streaming, online games, DNS.',
        },
        exam: {
          gu: 'TCP: HTTP/HTTPS (80/443), SSH (22), SMTP (25), FTP (20/21). UDP: DNS (53), DHCP (67/68), TFTP (69), SNMP (161), RTP/VoIP.',
          hi: 'TCP: HTTP/HTTPS (80/443), SSH (22), SMTP (25), FTP (20/21)। UDP: DNS (53), DHCP (67/68), TFTP (69), SNMP (161), RTP/VoIP।',
          en: 'TCP: HTTP/HTTPS (80/443), SSH (22), SMTP (25), FTP (20/21). UDP: DNS (53), DHCP (67/68), TFTP (69), SNMP (161), RTP/VoIP.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 250, y: 230, type: 'server' as const, label: 'TCP', sub: 'web · mail · files', accent: 'var(--nq-pkt-tcp)', pulse: true },
          { id: 'b', x: 620, y: 230, type: 'server' as const, label: 'UDP', sub: 'video · voice · DNS', accent: 'var(--nq-pkt-dns)', pulse: true },
        ],
      }),
      aside: () => ({
        title: { gu: 'કોણ શું વાપરે', hi: 'कौन क्या इस्तेमाल करता है', en: 'Who uses what' },
        head: ['service', 'port', 'uses'],
        rows: [
          ['HTTPS', '443', 'TCP'],
          ['SSH', '22', 'TCP'],
          ['DNS', '53', 'UDP'],
          ['DHCP', '67/68', 'UDP'],
          ['Video call', 'varies', 'UDP'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'TCP = હાથ મિલાવે, દરેક ટુકડાની પહોંચ લે, ખોવાય તો ફરી મોકલે — ભરોસાપાત્ર પણ ધીમું. UDP = કશું પૂછ્યા વગર મોકલે — ઝડપી પણ ખાતરી વગર. સાચો ડેટા જોઈએ તો TCP, ઝડપ જોઈએ તો UDP.',
    hi: 'TCP = हाथ मिलाता है, हर टुकड़े की रसीद लेता है, खो जाए तो फिर भेजता है — भरोसेमंद पर धीमा। UDP = बिना कुछ पूछे भेजता है — तेज पर बिना गारंटी। सही data चाहिए तो TCP, रफ्तार चाहिए तो UDP।',
    en: 'TCP shakes hands, takes a receipt for every piece and resends what is lost — reliable but slower. UDP sends without asking — fast but with no guarantee. Need it exact, choose TCP; need it now, choose UDP.',
  },
  check: {
    q: {
      gu: 'Live video call માટે કયું વપરાય અને શા માટે?',
      hi: 'Live video call के लिए कौन सा इस्तेमाल होता है और क्यों?',
      en: 'Which is used for a live video call, and why?',
    },
    options: [
      { gu: 'UDP — જૂનું frame ફરી મોકલવાનો કોઈ અર્થ નથી', hi: 'UDP — पुराना frame फिर भेजने का कोई मतलब नहीं', en: 'UDP — resending an old frame is pointless' },
      { gu: 'TCP — દરેક frame પહોંચવું જ જોઈએ', hi: 'TCP — हर frame पहुंचना ही चाहिए', en: 'TCP — every frame must arrive' },
      { gu: 'બંને એકસાથે', hi: 'दोनों एक साथ', en: 'Both at once' },
    ],
    answer: 0,
    explain: {
      gu: 'Video માં એક frame ખોવાય તો એ ફરી માગવામાં જે સમય જાય એટલામાં તો એ frame વાસી થઈ જાય. એટલે UDP એને જવા દે અને આગળ વધે.',
      hi: 'Video में एक frame खो जाए तो उसे फिर मांगने में जो समय जाए उतने में वह frame बासी हो जाता है। इसलिए UDP उसे जाने देता है और आगे बढ़ जाता है।',
      en: 'By the time a lost video frame could be re-fetched it is already stale. UDP lets it go and moves on.',
    },
  },
}

/* ------------------------------------------------------------------ b3l4 */

export const b3l4: LessonSpec = {
  why: {
    gu: 'એક જ કમ્પ્યુટર પર એકસાથે browser, email અને video call ચાલે છે. બધાનો ડેટા એક જ વાયર પર આવે છે — તો કોનો ડેટા કોને આપવો એ કેવી રીતે નક્કી થાય? જવાબ એક જ છે: port numbers.',
    hi: 'एक ही कंप्यूटर पर एक साथ browser, email और video call चलते हैं। सबका data एक ही तार पर आता है — तो किसका data किसे देना है यह कैसे तय हो? जवाब एक ही है: port numbers।',
    en: 'One computer runs a browser, email and a video call at once. All their data arrives on the same wire — so how does it know whose is whose? One answer: port numbers.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'એક ઘર, ઘણા દરવાજા', hi: 'एक घर, कई दरवाजे', en: 'One house, many doors' },
      text: {
        beginner: {
          gu: 'IP સરનામું આખા ઘરને ઓળખાવે છે. પણ ઘરમાં ઘણા ઓરડા છે — browser નો ઓરડો, email નો ઓરડો, video call નો ઓરડો. Port number એ ઓરડાનો નંબર છે. સરનામું + ઓરડો = બરાબર કોના સુધી પહોંચાડવું એ નક્કી.',
          hi: 'IP पता पूरे घर को पहचानता है। पर घर में कई कमरे हैं — browser का कमरा, email का कमरा, video call का कमरा। Port number कमरे का नंबर है। पता + कमरा = ठीक किसे पहुंचाना है यह तय।',
          en: 'The IP address identifies the whole house. But the house has rooms — a room for the browser, one for email, one for the video call. The port number is the room number. Address plus room says exactly who to deliver to.',
        },
        exam: {
          gu: 'Socket = IP address + port + protocol. Transport layer multiplexing એ જ રીતે એક IP પર ઘણી સમાંતર conversations ચલાવે છે.',
          hi: 'Socket = IP address + port + protocol। Transport layer multiplexing इसी तरह एक IP पर कई समानांतर conversations चलाता है।',
          en: 'A socket is IP address + port + protocol. Transport-layer multiplexing is how one IP carries many parallel conversations.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 430, y: 230, type: 'pc' as const, label: 'PC · 192.168.1.10', sub: 'many rooms inside', accent: BEG, pulse: true },
        ],
      }),
      aside: () => ({
        title: { gu: 'એક PC, ઘણા ઓરડા', hi: 'एक PC, कई कमरे', en: 'One PC, many rooms' },
        head: ['app', 'port'],
        rows: [
          ['Browser tab 1', '51234'],
          ['Browser tab 2', '51235'],
          ['Email client', '51236'],
          ['Video call', '51237'],
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'જાણીતા દરવાજા', hi: 'जाने-पहचाने दरवाजे', en: 'The well-known doors' },
      text: {
        beginner: {
          gu: 'Server બાજુના દરવાજા બધાને ખબર હોય છે, જેથી કોઈ પણ પૂછ્યા વગર પહોંચી શકે. Website નો દરવાજો 443, email નો 25, SSH નો 22, DNS નો 53. એટલે જ તમે browser માં ફક્ત નામ લખો છો અને port લખવો પડતો નથી — એ આપોઆપ 443 જાય છે.',
          hi: 'Server की तरफ के दरवाजे सबको पता होते हैं, ताकि कोई भी बिना पूछे पहुंच सके। Website का दरवाजा 443, email का 25, SSH का 22, DNS का 53। इसीलिए आप browser में केवल नाम लिखते हैं और port नहीं लिखना पड़ता — वह अपने आप 443 पर जाता है।',
          en: 'The doors on the server side are publicly known so anyone can arrive without asking. A website is door 443, email 25, SSH 22, DNS 53. That is why you type only a name in the browser — it quietly uses 443.',
        },
        exam: {
          gu: 'Well-known ports 0–1023, registered 1024–49151, dynamic/ephemeral 49152–65535. CCNA માટે 20/21, 22, 23, 25, 53, 67/68, 69, 80, 110, 161, 443 યાદ રાખવા.',
          hi: 'Well-known ports 0–1023, registered 1024–49151, dynamic/ephemeral 49152–65535। CCNA के लिए 20/21, 22, 23, 25, 53, 67/68, 69, 80, 110, 161, 443 याद रखने योग्य।',
          en: 'Well-known ports are 0–1023, registered 1024–49151, dynamic 49152–65535. For CCNA memorise 20/21, 22, 23, 25, 53, 67/68, 69, 80, 110, 161, 443.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 's', x: 430, y: 230, type: 'server' as const, label: 'Server', sub: ':443 :22 :25 :53', accent: CCNA, pulse: true },
        ],
      }),
      aside: () => ({
        title: { gu: 'જાણીતા ports', hi: 'जाने-पहचाने ports', en: 'Well-known ports' },
        head: ['port', 'service', 'proto'],
        rows: [
          ['22', 'SSH', 'TCP'],
          ['25', 'SMTP mail', 'TCP'],
          ['53', 'DNS', 'UDP'],
          ['67/68', 'DHCP', 'UDP'],
          ['80', 'HTTP', 'TCP'],
          ['443', 'HTTPS', 'TCP'],
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'તમારી બાજુનો દરવાજો રેન્ડમ', hi: 'आपकी तरफ का दरवाजा random', en: 'Your own door is random' },
      text: {
        beginner: {
          gu: 'તમારી બાજુ ઊલટું છે: દરેક વખતે નવો, રેન્ડમ દરવાજો વપરાય છે — 51234 જેવો. તમે browser માં બે tab ખોલો તો દરેક tab ને અલગ નંબર મળે છે. એટલે જવાબ આવે ત્યારે કયા tab નો છે એ ખબર પડે.',
          hi: 'आपकी तरफ उलटा है: हर बार नया, random दरवाजा इस्तेमाल होता है — 51234 जैसा। आप browser में दो tab खोलें तो हर tab को अलग नंबर मिलता है। इसलिए जवाब आने पर पता चलता है कि यह किस tab का है।',
          en: 'On your side it is the opposite: a fresh random door each time, something like 51234. Open two browser tabs and each gets its own number, so when answers come back it is clear which tab they belong to.',
        },
        exam: {
          gu: 'Client ephemeral source port OS પસંદ કરે છે. એ જ કારણે 5-tuple unique રહે છે અને return traffic સાચી socket સુધી demultiplex થાય છે.',
          hi: 'Client ephemeral source port OS चुनता है। इसी कारण 5-tuple unique रहता है और return traffic सही socket तक demultiplex होता है।',
          en: 'The OS picks the client’s ephemeral source port. That keeps the 5-tuple unique and lets return traffic demultiplex to the right socket.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 200, y: 150, type: 'laptop' as const, label: 'tab 1', sub: ':51234', accent: BEG },
          { id: 'b', x: 200, y: 330, type: 'laptop' as const, label: 'tab 2', sub: ':51235', accent: BEG },
          { id: 's', x: 650, y: 240, type: 'server' as const, label: 'Server', sub: ':443', accent: CCNA },
        ],
        links: [
          { id: 'l1', from: 'a', to: 's', state: 'up', flowing: true },
          { id: 'l2', from: 'b', to: 's', state: 'up', flowing: true },
        ],
        packets: [
          { id: 'p1', from: 'a', to: 's', t: 0.08 + ease(t) * 0.84, color: 'var(--nq-pkt-tcp)', label: '51234 → 443' },
          { id: 'p2', from: 'b', to: 's', t: 0.08 + ease(Math.max(0, t - 0.2) / 0.8) * 0.84, color: 'var(--nq-pkt-ctrl)', label: '51235 → 443' },
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'જવાબ સાચા ઓરડે પહોંચે', hi: 'जवाब सही कमरे तक पहुंचता है', en: 'The answer finds the right room' },
      text: {
        beginner: {
          gu: 'Server જવાબ મોકલે ત્યારે બે નંબર ઊલટા કરી નાખે છે: હવે 443 થી 51234. તમારું કમ્પ્યુટર એ 51234 જોઈને તરત જાણે કે આ જવાબ પહેલા tab નો છે — અને બીજા tab માં ભૂલથી નથી મૂકતું.',
          hi: 'Server जवाब भेजे तो दो नंबर उलटे कर देता है: अब 443 से 51234। आपका कंप्यूटर वह 51234 देखकर तुरंत जान जाता है कि यह जवाब पहले tab का है — और दूसरे tab में गलती से नहीं डालता।',
          en: 'When the server replies it swaps the two numbers: now 443 to 51234. Your computer sees 51234 and knows at once that this answer belongs to the first tab — and never drops it into the second by mistake.',
        },
        exam: {
          gu: 'Return packet માં source port 443 અને destination port 51234 હોય છે. OS socket table માં એ જોડી શોધીને process ને deliver કરે છે.',
          hi: 'Return packet में source port 443 और destination port 51234 होते हैं। OS socket table में वह जोड़ी ढूंढकर process को deliver करता है।',
          en: 'The return packet has source port 443 and destination port 51234. The OS looks that pair up in its socket table and delivers to the right process.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 200, y: 150, type: 'laptop' as const, label: 'tab 1', sub: ':51234', accent: BEG, pulse: t > 0.7 },
          { id: 'b', x: 200, y: 330, type: 'laptop' as const, label: 'tab 2', sub: ':51235', accent: BEG },
          { id: 's', x: 650, y: 240, type: 'server' as const, label: 'Server', sub: ':443', accent: CCNA },
        ],
        links: [
          { id: 'l1', from: 'a', to: 's', state: 'up', flowing: true },
          { id: 'l2', from: 'b', to: 's', state: 'up' },
        ],
        packets: [
          { id: 'r', from: 's', to: 'a', t: 0.08 + ease(t) * 0.84, color: 'var(--nq-ok)', label: '443 → 51234' },
        ],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'Port બંધ હોય તો', hi: 'Port बंद हो तो', en: 'When a port is closed' },
      text: {
        beginner: {
          gu: 'Firewall નું આખું કામ આ જ નંબરો પર ઊભું છે. "Port 22 બંધ કરો" એટલે SSH બંધ. "Port 443 ખુલ્લો રાખો" એટલે website ચાલુ. એટલે જ port numbers સમજ્યા વગર ACL અને firewall rules લખી શકાતા નથી.',
          hi: 'Firewall का पूरा काम इन्हीं नंबरों पर टिका है। "Port 22 बंद करो" यानी SSH बंद। "Port 443 खुला रखो" यानी website चालू। इसीलिए port numbers समझे बिना ACL और firewall rules नहीं लिखे जा सकते।',
          en: 'A firewall’s entire job rests on these numbers. "Close port 22" means no SSH. "Leave 443 open" means the website still works. Which is why you cannot write an ACL or a firewall rule without understanding ports.',
        },
        exam: {
          gu: 'Extended ACL source/destination IP ઉપરાંત protocol અને port પર match કરે છે — દા.ત. `permit tcp any host 10.0.0.5 eq 443`.',
          hi: 'Extended ACL source/destination IP के अलावा protocol और port पर match करता है — जैसे `permit tcp any host 10.0.0.5 eq 443`।',
          en: 'An extended ACL matches on protocol and port as well as source and destination IP — for example `permit tcp any host 10.0.0.5 eq 443`.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'c', x: 180, y: 240, type: 'laptop' as const, label: 'Client', accent: BEG },
          { id: 'fw', x: 430, y: 240, type: 'firewall' as const, label: 'Firewall', sub: '443 open · 22 closed', accent: 'var(--nq-err)' },
          { id: 's', x: 680, y: 240, type: 'server' as const, label: 'Server', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'c', to: 'fw', state: 'up', flowing: true },
          { id: 'b', from: 'fw', to: 's', state: 'up', flowing: t < 0.5 },
        ],
        packets:
          t < 0.5
            ? [{ id: 'ok', from: 'c', to: 's', t: 0.08 + ease(t / 0.5) * 0.84, color: 'var(--nq-ok)', label: ':443 allowed' }]
            : [{ id: 'no', from: 'c', to: 'fw', t: 0.08 + ease((t - 0.5) / 0.5) * 0.42, color: 'var(--nq-err)', label: ':22 blocked' }],
      }),
    },
  ],
  takeaway: {
    gu: 'IP ઘર શોધે, port ઓરડો શોધે. Server ના દરવાજા જાણીતા (443, 22, 53), તમારી બાજુનો દરેક વખતે નવો. જવાબમાં બે નંબર ઊલટા થાય — એટલે જવાબ સાચા ઓરડે જ પહોંચે.',
    hi: 'IP घर ढूंढता है, port कमरा ढूंढता है। Server के दरवाजे जाने-पहचाने (443, 22, 53), आपकी तरफ का हर बार नया। जवाब में दोनों नंबर उलटे हो जाते हैं — इसलिए जवाब सही कमरे में ही पहुंचता है।',
    en: 'IP finds the house, the port finds the room. Server doors are well known (443, 22, 53); yours is new every time. The reply swaps the two numbers, so it always lands in the right room.',
  },
  check: {
    q: {
      gu: 'તમે browser માં https://example.com લખો તો કયા port પર જાય?',
      hi: 'आप browser में https://example.com लिखें तो किस port पर जाता है?',
      en: 'You type https://example.com in the browser. Which port does it go to?',
    },
    options: [
      { gu: '443', hi: '443', en: '443' },
      { gu: '80', hi: '80', en: '80' },
      { gu: '22', hi: '22', en: '22' },
    ],
    answer: 0,
    explain: {
      gu: 'https એટલે HTTPS, અને એનો જાણીતો દરવાજો 443 છે. સાદું http હોત તો 80 જાત.',
      hi: 'https यानी HTTPS, और इसका जाना-पहचाना दरवाजा 443 है। साधारण http होता तो 80 पर जाता।',
      en: 'https means HTTPS, whose well-known door is 443. Plain http would have gone to 80.',
    },
  },
}

/* ------------------------------------------------------------------ b3l5 */

export const b3l5: LessonSpec = {
  why: {
    gu: 'Protocol શબ્દ દરેક પાઠમાં આવે છે — HTTP, TCP, OSPF, ARP. પણ protocol એટલે ખરેખર શું? ફક્ત એક વાત: બે મશીન વાત શરૂ કરતાં પહેલાં નિયમો પર સંમત થાય છે. એ નિયમોનો સંગ્રહ એટલે protocol.',
    hi: 'Protocol शब्द हर पाठ में आता है — HTTP, TCP, OSPF, ARP। पर protocol असल में क्या है? केवल एक बात: दो मशीनें बात शुरू करने से पहले नियमों पर सहमत होती हैं। उन नियमों का संग्रह ही protocol है।',
    en: 'The word protocol turns up in every lesson — HTTP, TCP, OSPF, ARP. But what is a protocol really? Just this: two machines agreeing on the rules before they start talking. That agreement is the protocol.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'નિયમ વગર ગૂંચવાડો', hi: 'नियम के बिना उलझन', en: 'Without rules, confusion' },
      text: {
        beginner: {
          gu: 'ધારો કે બે માણસ મળે — એક ગુજરાતીમાં બોલે, બીજો જાપાનીઝમાં. બંને બોલે છે, બંને સાંભળે છે, પણ કશું સમજાતું નથી. કમ્પ્યુટર સાથે પણ એવું જ: એક 1 ને "હા" સમજે અને બીજો "ના" — તો વાત શરૂ જ ન થઈ શકે.',
          hi: 'मान लें दो लोग मिलते हैं — एक गुजराती में बोलता है, दूसरा जापानी में। दोनों बोलते हैं, दोनों सुनते हैं, पर कुछ समझ नहीं आता। कंप्यूटर के साथ भी वैसा ही: एक 1 को "हां" समझे और दूसरा "ना" — तो बात शुरू ही नहीं हो सकती।',
          en: 'Imagine two people meeting — one speaks Gujarati, the other Japanese. Both speak, both listen, and nothing gets through. Computers are the same: if one reads a 1 as "yes" and the other as "no", no conversation can begin.',
        },
        exam: {
          gu: 'Protocol વગર syntax (format), semantics (meaning) અને timing — ત્રણેય અનિશ્ચિત રહે છે, એટલે interoperability શક્ય નથી.',
          hi: 'Protocol के बिना syntax (format), semantics (meaning) और timing — तीनों अनिश्चित रहते हैं, इसलिए interoperability संभव नहीं।',
          en: 'Without a protocol the syntax (format), semantics (meaning) and timing are all undefined, so interoperability is impossible.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'PC A', sub: 'speaks X', accent: BEG },
          { id: 'b', x: 650, y: 230, type: 'pc' as const, label: 'PC B', sub: 'speaks Y', accent: CCNP },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up', flowing: true }],
        packets: [
          { id: 'p', from: 'a', to: 'b', t: 0.08 + ease(t) * 0.84, color: 'var(--nq-err)', label: '?? not understood' },
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'Protocol = પહેલેથી નક્કી કરેલા નિયમો', hi: 'Protocol = पहले से तय नियम', en: 'Protocol = rules agreed in advance' },
      text: {
        beginner: {
          gu: 'એટલે પહેલાં જ બધું નક્કી કરી લેવાય છે: સંદેશ કેવો દેખાશે, કયો ભાગ ક્યાં આવશે, પહેલાં કોણ બોલશે, જવાબ કેટલી વારમાં આપવો. આ લખેલા નિયમોના સમૂહને protocol કહે છે — અને દુનિયાભરની કંપનીઓ એ જ નિયમો પાળે છે.',
          hi: 'इसलिए पहले ही सब तय कर लिया जाता है: संदेश कैसा दिखेगा, कौन सा हिस्सा कहां होगा, पहले कौन बोलेगा, जवाब कितनी देर में देना है। इन लिखे नियमों के समूह को protocol कहते हैं — और दुनिया भर की कंपनियां वही नियम मानती हैं।',
          en: 'So everything is settled up front: what a message looks like, which part sits where, who speaks first, how soon a reply must come. That written set of rules is the protocol — and makers worldwide follow the same one.',
        },
        exam: {
          gu: 'Protocols RFC/IEEE standards તરીકે publish થાય છે. એ જ કારણે Cisco router અને Juniper router વચ્ચે OSPF adjacency બની શકે છે.',
          hi: 'Protocols RFC/IEEE standards के रूप में publish होते हैं। इसी कारण Cisco router और Juniper router के बीच OSPF adjacency बन सकती है।',
          en: 'Protocols are published as RFC or IEEE standards. That is exactly why a Cisco router and a Juniper router can form an OSPF adjacency.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 230, y: 230, type: 'pc' as const, label: 'PC A', sub: t > 0.4 ? 'speaks HTTP' : 'speaks X', accent: BEG },
          { id: 'b', x: 650, y: 230, type: 'pc' as const, label: 'PC B', sub: t > 0.4 ? 'speaks HTTP' : 'speaks Y', accent: t > 0.4 ? BEG : CCNP, pulse: t > 0.4 },
        ],
        links: [{ id: 'l', from: 'a', to: 'b', state: 'up', flowing: true }],
        packets:
          t > 0.4
            ? [{ id: 'p', from: 'a', to: 'b', t: 0.08 + ease((t - 0.4) / 0.6) * 0.84, color: 'var(--nq-ok)', label: 'GET /index.html' }]
            : [],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'દરેક કામનો પોતાનો protocol', hi: 'हर काम का अपना protocol', en: 'Every job has its own protocol' },
      text: {
        beginner: {
          gu: 'એક જ protocol બધું ન કરી શકે, એટલે દરેક કામ માટે અલગ છે. Website માટે HTTP, email માટે SMTP, નામ શોધવા માટે DNS, IP મેળવવા માટે DHCP, MAC શોધવા માટે ARP. નામ અલગ, પણ વિચાર એક જ — નક્કી કરેલા નિયમો.',
          hi: 'एक ही protocol सब नहीं कर सकता, इसलिए हर काम के लिए अलग है। Website के लिए HTTP, email के लिए SMTP, नाम ढूंढने के लिए DNS, IP पाने के लिए DHCP, MAC ढूंढने के लिए ARP। नाम अलग, पर विचार एक ही — तय नियम।',
          en: 'No single protocol can do everything, so each job has its own. HTTP for websites, SMTP for email, DNS to look up names, DHCP to get an IP, ARP to find a MAC. Different names, one idea — agreed rules.',
        },
        exam: {
          gu: 'દરેક protocol એના layer પર બેસે છે: HTTP/DNS/DHCP (L7), TCP/UDP (L4), IP/ICMP (L3), ARP/Ethernet (L2).',
          hi: 'हर protocol अपनी layer पर बैठता है: HTTP/DNS/DHCP (L7), TCP/UDP (L4), IP/ICMP (L3), ARP/Ethernet (L2)।',
          en: 'Each protocol sits at its layer: HTTP/DNS/DHCP (L7), TCP/UDP (L4), IP/ICMP (L3), ARP/Ethernet (L2).',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'p', x: 150, y: 240, type: 'pc' as const, label: 'PC', accent: BEG },
          { id: 'd', x: 400, y: 130, type: 'server' as const, label: 'DNS', sub: 'names', accent: 'var(--nq-pkt-dns)' },
          { id: 'w', x: 400, y: 350, type: 'server' as const, label: 'Web', sub: 'HTTP', accent: 'var(--nq-pkt-tcp)' },
          { id: 'h', x: 680, y: 240, type: 'router' as const, label: 'DHCP', sub: 'addresses', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'p', to: 'd', state: 'up', flowing: true },
          { id: 'b', from: 'p', to: 'w', state: 'up', flowing: true },
          { id: 'c', from: 'p', to: 'h', state: 'up', flowing: true },
        ],
      }),
      aside: () => ({
        title: { gu: 'રોજના protocols', hi: 'रोज़ के protocols', en: 'Everyday protocols' },
        head: ['protocol', 'job'],
        rows: [
          ['HTTP/HTTPS', 'fetch web pages'],
          ['DNS', 'name → IP'],
          ['DHCP', 'hand out IPs'],
          ['ARP', 'IP → MAC'],
          ['SMTP', 'send email'],
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'બધા સાથે કામ કરે', hi: 'सब साथ काम करते हैं', en: 'They all work together' },
      text: {
        beginner: {
          gu: 'એક જ વેબપેજ ખોલવામાં ચાર-પાંચ protocols સાથે કામ કરે છે: DHCP તમને IP આપે, DNS નામનો IP શોધે, ARP રસ્તો શોધે, TCP જોડાણ બનાવે, HTTP પાનું માગે. દરેક પોતાનો એક જ ટુકડો કરે છે.',
          hi: 'एक ही webpage खोलने में चार-पांच protocols साथ काम करते हैं: DHCP आपको IP देता है, DNS नाम का IP ढूंढता है, ARP रास्ता ढूंढता है, TCP connection बनाता है, HTTP page मांगता है। हर एक अपना एक ही टुकड़ा करता है।',
          en: 'Opening a single web page takes four or five protocols working together: DHCP gives you an IP, DNS resolves the name, ARP finds the local path, TCP opens the connection, HTTP asks for the page. Each does only its own small piece.',
        },
        exam: {
          gu: 'આ protocol stack છે: દરેક layer નીચેનાની સેવા વાપરે છે. એક layer બદલાય (WiFi થી Ethernet) તો પણ ઉપરનાને ફરક પડતો નથી.',
          hi: 'यह protocol stack है: हर layer नीचे वाली की सेवा इस्तेमाल करती है। एक layer बदल जाए (WiFi से Ethernet) तो भी ऊपर वालों को फर्क नहीं पड़ता।',
          en: 'This is the protocol stack: each layer uses the service below it. Swap one layer (WiFi for Ethernet) and the ones above do not notice.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p', x: 160, y: 240, type: 'laptop' as const, label: 'Your laptop', accent: BEG },
          { id: 'r', x: 420, y: 240, type: 'router' as const, label: 'Router', accent: CCNP },
          { id: 's', x: 690, y: 240, type: 'server' as const, label: 'Web server', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'p', to: 'r', state: 'up', flowing: true },
          { id: 'b', from: 'r', to: 's', state: 'up', flowing: t > 0.5 },
        ],
        packets:
          t < 0.25
            ? [{ id: 'd', from: 'p', to: 'r', t: 0.08 + ease(t / 0.25) * 0.84, color: 'var(--nq-pkt-dns)', label: '1 · DHCP' }]
            : t < 0.5
              ? [{ id: 'n', from: 'p', to: 'r', t: 0.08 + ease((t - 0.25) / 0.25) * 0.84, color: 'var(--nq-pkt-dns)', label: '2 · DNS' }]
              : t < 0.75
                ? [{ id: 'tc', from: 'r', to: 's', t: 0.08 + ease((t - 0.5) / 0.25) * 0.84, color: 'var(--nq-pkt-tcp)', label: '3 · TCP' }]
                : [{ id: 'h', from: 'r', to: 's', t: 0.08 + ease((t - 0.75) / 0.25) * 0.84, color: 'var(--nq-ok)', label: '4 · HTTP' }],
      }),
    },
  ],
  takeaway: {
    gu: 'Protocol એટલે બે મશીન વચ્ચે પહેલેથી નક્કી કરેલા નિયમો — સંદેશ કેવો હોય, કોણ પહેલાં બોલે, જવાબ કેવો હોય. દરેક કામનો પોતાનો protocol છે, અને એક કામ પૂરું કરવા ઘણા સાથે મળીને કામ કરે છે.',
    hi: 'Protocol यानी दो मशीनों के बीच पहले से तय नियम — संदेश कैसा हो, कौन पहले बोले, जवाब कैसा हो। हर काम का अपना protocol है, और एक काम पूरा करने के लिए कई साथ मिलकर काम करते हैं।',
    en: 'A protocol is a set of rules two machines agreed on beforehand — what a message looks like, who speaks first, what a reply must be. Every job has its own, and several work together to finish one task.',
  },
  check: {
    q: {
      gu: 'બે અલગ કંપનીના routers એકબીજા સાથે OSPF ચલાવી શકે છે, કેમ?',
      hi: 'दो अलग कंपनियों के routers एक-दूसरे से OSPF चला सकते हैं, क्यों?',
      en: 'Routers from two different vendors can run OSPF together. Why?',
    },
    options: [
      { gu: 'બંને એક જ જાહેર standard (protocol) પાળે છે', hi: 'दोनों एक ही सार्वजनिक standard (protocol) मानते हैं', en: 'Both follow the same public standard (protocol)' },
      { gu: 'બંને એક જ કંપનીએ બનાવ્યા છે', hi: 'दोनों एक ही कंपनी ने बनाए हैं', en: 'They were built by the same company' },
      { gu: 'એ બિલકુલ શક્ય નથી', hi: 'यह बिल्कुल संभव नहीं', en: 'That is not possible at all' },
    ],
    answer: 0,
    explain: {
      gu: 'OSPF એક open standard છે. બંને કંપનીઓ એ જ લખેલા નિયમો પાળે છે, એટલે એમના routers એકબીજાને સમજી શકે છે.',
      hi: 'OSPF एक open standard है। दोनों कंपनियां वही लिखे नियम मानती हैं, इसलिए उनके routers एक-दूसरे को समझ सकते हैं।',
      en: 'OSPF is an open standard. Both vendors implement the same written rules, so their routers understand each other.',
    },
  },
}
