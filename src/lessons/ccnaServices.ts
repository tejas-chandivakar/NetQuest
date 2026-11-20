import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const OK = 'var(--nq-ok)'
const WARN = 'var(--nq-warn)'
const ERR = 'var(--nq-err)'
const MUTE = 'var(--nq-text-mute)'
const H = (gu: string, hi: string, en: string) => ({ gu, hi, en })

/* ═══════════════════ n4l3 · NTP, DNS, SNMP, Syslog ═══════════════════ */

export const n4l3: LessonSpec = {
  why: {
    gu: 'આ ચાર સેવાઓ કોઈ packet ને આગળ નથી મોકલતી — તોય એમના વગર નેટવર્ક **ચલાવી** શકાતું નથી. એક સમય આપે, એક નામ, એક આંકડા, અને એક બનેલી ઘટનાઓની નોંધ. ચારે મળીને તમને "શું થયું હતું?" નો જવાબ આપે.',
    hi: 'ये चार सेवाएं कोई packet आगे नहीं भेजतीं — फिर भी इनके बिना network **चलाया** नहीं जा सकता। एक समय देती है, एक नाम, एक आंकड़े, और एक घटनाओं का रिकॉर्ड। चारों मिलकर आपको "क्या हुआ था?" का जवाब देती हैं।',
    en: 'None of these four forwards a single packet, and yet without them a network cannot be **run**. One gives you time, one gives you names, one gives you numbers, one gives you a record of what happened. Together they answer the question "what went wrong?".',
  },
  steps: [
    {
      ms: 3200,
      label: H('NTP — બધી ઘડિયાળ એકસરખી', 'NTP — सभी घड़ियां एक समान', 'NTP — every clock the same'),
      text: {
        beginner: {
          gu: 'દરેક ઉપકરણની પોતાની ઘડિયાળ ધીમે ધીમે ખસે છે. બે switch ની ઘડિયાળમાં ચાર મિનિટનો ફરક હોય તો એમના log **સાથે વાંચી શકાતા નથી** — કઈ ઘટના પહેલી બની એ જ ખબર ન પડે. NTP બધાને એક જ ઘડિયાળ સાથે બાંધે.',
          hi: 'हर उपकरण की अपनी घड़ी धीरे-धीरे खिसकती है। दो switches की घड़ी में चार मिनट का फर्क हो तो उनके log **साथ नहीं पढ़े जा सकते** — कौन सी घटना पहले हुई यह पता ही नहीं चलता। NTP सबको एक ही घड़ी से बांधता है।',
          en: 'Every device’s own clock drifts. If two switches are four minutes apart their logs **cannot be read together** — you cannot even tell which event happened first. NTP ties them all to one clock.',
        },
        exam: {
          gu: 'UDP 123. Stratum 0 એ અણુ ઘડિયાળ, stratum 1 એ એનાથી સીધો જોડાયેલો server, અને દરેક hop સ્તર વધારે. `ntp server <ip>`, તપાસવા `show ntp status`. Certificate ની માન્યતા પણ સાચા સમય પર આધારિત છે.',
          hi: 'UDP 123। Stratum 0 परमाणु घड़ी, stratum 1 उससे सीधा जुड़ा server, और हर hop पर स्तर बढ़ता है। `ntp server <ip>`, जांच के लिए `show ntp status`। Certificate की वैधता भी सही समय पर निर्भर है।',
          en: 'UDP 123. Stratum 0 is the atomic clock, stratum 1 a server attached to it, and every hop adds a level. Configure `ntp server <ip>` and check with `show ntp status`. Certificate validity depends on correct time too.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ntp', x: 430, y: 80, type: 'server', label: 'NTP server', sub: 'stratum 1', accent: OK, pulse: t > 0.3 },
          { id: 's1', x: 170, y: 300, type: 'switch', label: 'SW1', sub: t > 0.6 ? '14:02:07' : '14:02:07', accent: CCNA },
          { id: 's2', x: 430, y: 310, type: 'switch', label: 'SW2', sub: t > 0.6 ? '14:02:07' : '13:58:41', accent: t > 0.6 ? OK : ERR },
          { id: 'r1', x: 690, y: 300, type: 'router', label: 'R1', sub: t > 0.6 ? '14:02:07' : '14:09:22', accent: t > 0.6 ? OK : ERR },
        ],
        links: [
          { id: 'a', from: 'ntp', to: 's1', state: 'up', flowing: t > 0.35 },
          { id: 'b', from: 'ntp', to: 's2', state: 'up', flowing: t > 0.35 },
          { id: 'c', from: 'ntp', to: 'r1', state: 'up', flowing: t > 0.35 },
        ],
        packets:
          t > 0.4 && t < 0.65
            ? [
                { id: 'p1', from: 'ntp', to: 's2', t: 0.15 + ease((t - 0.4) / 0.25) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'the time is…' },
                { id: 'p2', from: 'ntp', to: 'r1', t: 0.15 + ease((t - 0.4) / 0.25) * 0.7, color: 'var(--nq-pkt-ctrl)' },
              ]
            : [],
      }),
      aside: (t) => ({
        title: H('ત્રણ log એકસાથે', 'तीन log एक साथ', 'Three logs side by side'),
        caption: t > 0.6
          ? H('હવે ક્રમ વાંચી શકાય છે.', 'अब क्रम पढ़ा जा सकता है।', 'Now the order can be read.')
          : H('કઈ ઘટના પહેલી? કહી શકાતું નથી.', 'कौन सी घटना पहले? नहीं कहा जा सकता।', 'Which came first? There is no telling.'),
        head: ['device', 'its clock says'],
        rows: [
          ['SW1', '14:02:07'],
          ['SW2', t > 0.6 ? '14:02:07 ✓' : '13:58:41 — 3 min behind'],
          ['R1', t > 0.6 ? '14:02:07 ✓' : '14:09:22 — 7 min ahead'],
        ],
      }),
    },
    {
      ms: 3000,
      label: H('DNS — નામથી સરનામું', 'DNS — नाम से पता', 'DNS — a name to an address'),
      text: {
        beginner: {
          gu: 'કોઈ `142.250.195.78` યાદ રાખતું નથી. DNS એ નેટવર્કની ફોનબુક છે: નામ આપો, સરનામું લો. આ તમે Foundation માં જોયું — અહીં મુદ્દો એ છે કે **તમારાં ઉપકરણોને પણ** એની જરૂર પડે છે, nameserver વગર એમનો `ping google.com` પણ નિષ્ફળ જશે.',
          hi: 'कोई `142.250.195.78` याद नहीं रखता। DNS network की फोनबुक है: नाम दें, पता लें। यह आपने Foundation में देखा — यहां बात यह है कि **आपके उपकरणों को भी** इसकी जरूरत पड़ती है, nameserver के बिना उनका `ping google.com` भी असफल होगा।',
          en: 'Nobody memorises `142.250.195.78`. DNS is the network’s phone book: give it a name, get an address. You saw this in Foundation — the point here is that **your own devices need it too**, and without a nameserver even their `ping google.com` fails.',
        },
        exam: {
          gu: 'UDP/TCP 53. `ip name-server <ip>` અને `ip domain-lookup`. ઉપકરણ પર DNS ન હોય અને તમે ખોટું શબ્દ લખો તો IOS એને hostname સમજીને જોવા જાય — એટલે ઘણા `no ip domain-lookup` કરી દે છે.',
          hi: 'UDP/TCP 53। `ip name-server <ip>` और `ip domain-lookup`। उपकरण पर DNS न हो और आप गलत शब्द लिखें तो IOS उसे hostname समझकर खोजने जाता है — इसलिए कई लोग `no ip domain-lookup` कर देते हैं।',
          en: 'UDP and TCP 53. Set `ip name-server <ip>` with `ip domain-lookup`. Mistype a command with lookups on and IOS treats the typo as a hostname and hangs looking for it — which is why many people turn it off with `no ip domain-lookup`.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r', x: 180, y: 210, type: 'router', label: 'R1', accent: CCNA, pulse: t > 0.6 },
          { id: 'dns', x: 560, y: 210, type: 'server', label: 'DNS server', accent: CCNP },
        ],
        links: [{ id: 'l', from: 'r', to: 'dns', state: 'up', flowing: true }],
        packets:
          t < 0.5
            ? [{ id: 'q', from: 'r', to: 'dns', t: 0.15 + ease(t / 0.5) * 0.7, color: 'var(--nq-pkt-dns)', label: 'where is ntp.pool.org?' }]
            : [{ id: 'a', from: 'dns', to: 'r', t: 0.15 + ease((t - 0.5) / 0.5) * 0.7, color: 'var(--nq-ok)', label: '162.159.200.1' }],
      }),
    },
    {
      ms: 3200,
      label: H('Syslog — શું બન્યું એની નોંધ', 'Syslog — क्या हुआ उसकी नोट', 'Syslog — the record of what happened'),
      text: {
        beginner: {
          gu: 'દરેક ઉપકરણ બનતી ઘટનાઓ બોલે છે: port નીચે ગયો, કોઈ login થયું, OSPF પાડોશી ગુમાવ્યો. પણ એ console પર જ રહે — ઉપકરણ reboot થાય એટલે **બધું ગાયબ**. Syslog એ બધું એક server પર મોકલે, જ્યાં એ રહે અને શોધી શકાય.',
          hi: 'हर उपकरण होने वाली घटनाएं बोलता है: port नीचे गया, कोई login हुआ, OSPF पड़ोसी खोया। पर वह console पर ही रहता है — उपकरण reboot होते ही **सब गायब**। Syslog उन सबको एक server पर भेजता है, जहां वे रहते हैं और ढूंढे जा सकते हैं।',
          en: 'Every device narrates what happens to it: a port went down, somebody logged in, an OSPF neighbour was lost. But it stays on the console, and a reboot **wipes the lot**. Syslog sends it all to one server where it persists and can be searched.',
        },
        exam: {
          gu: 'UDP 514. Severity 0 emergency થી 7 debugging — **ઓછો આંકડો વધુ ગંભીર**. `logging host <ip>` અને `logging trap <level>`: તમે જે સ્તર લખો એ **અને એનાથી ગંભીર** બધું જાય.',
          hi: 'UDP 514। Severity 0 emergency से 7 debugging — **कम अंक ज्यादा गंभीर**। `logging host <ip>` और `logging trap <level>`: आप जो स्तर लिखें वह **और उससे गंभीर** सब जाता है।',
          en: 'UDP 514. Severity runs 0 emergency to 7 debugging, so a **lower number is more serious**. `logging host <ip>` with `logging trap <level>` sends that level **and everything more serious**.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's1', x: 150, y: 110, type: 'switch', label: 'SW1', accent: CCNA },
          { id: 's2', x: 150, y: 320, type: 'switch', label: 'SW2', accent: CCNA },
          { id: 'r1', x: 400, y: 380, type: 'router', label: 'R1', accent: CCNA },
          { id: 'log', x: 680, y: 210, type: 'server', label: 'Syslog server', sub: t > 0.5 ? 'everything, in one place' : undefined, accent: t > 0.5 ? OK : MUTE, pulse: t > 0.5 },
        ],
        links: [
          { id: 'a', from: 's1', to: 'log', state: 'up', flowing: t > 0.25 },
          { id: 'b', from: 's2', to: 'log', state: 'up', flowing: t > 0.35 },
          { id: 'c', from: 'r1', to: 'log', state: 'up', flowing: t > 0.45 },
        ],
        packets:
          t > 0.3
            ? [{ id: 'p', from: 's2', to: 'log', t: 0.15 + ease((t - 0.3) / 0.7) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'Fa0/4 went down' }]
            : [],
      }),
      aside: () => ({
        title: H('Severity — ઓછો એટલે ગંભીર', 'Severity — कम यानी गंभीर', 'Severity — lower is worse'),
        head: ['level', 'name', 'example'],
        rows: [
          ['0', 'emergency', 'the device is going down'],
          ['3', 'error', 'an interface flapped'],
          ['5', 'notification', 'somebody logged in'],
          ['7', 'debugging', 'everything, very loudly'],
        ],
        notes: { 3: H('કદી production પર કાયમ ન રાખવું', 'production पर कभी हमेशा के लिए न रखें', 'never leave this on in production') },
      }),
    },
    {
      ms: 3200,
      label: H('SNMP — આંકડા અને ચેતવણી', 'SNMP — आंकड़े और चेतावनी', 'SNMP — the numbers, and the alarm'),
      text: {
        beginner: {
          gu: 'Syslog કહે છે "આ બન્યું". SNMP કહે છે **"અત્યારે આટલું છે"** — CPU 12%, port પર 400 Mbps, temperature 41°C. Monitoring server દર થોડી મિનિટે પૂછે અને આલેખ દોરે. અને કશું ખોટું થાય તો ઉપકરણ **જાતે** trap મોકલે, પૂછ્યા વગર.',
          hi: 'Syslog कहता है "यह हुआ"। SNMP कहता है **"अभी इतना है"** — CPU 12%, port पर 400 Mbps, temperature 41°C। Monitoring server हर कुछ मिनट पूछता है और graph बनाता है। और कुछ गलत हो तो उपकरण **खुद** trap भेजता है, बिना पूछे।',
          en: 'Syslog says "this happened". SNMP says **"this is the value right now"** — CPU at 12%, 400 Mbps on a port, 41 °C. A monitoring server asks every few minutes and draws the graph. And when something goes wrong the device sends a trap **on its own**, unasked.',
        },
        exam: {
          gu: 'UDP 161 polling, 162 trap. v1 અને v2c community string વાપરે — એ **સાદા લખાણમાં** જાય છે, એટલે v3 વાપરો, જેમાં authentication અને encryption છે. `public` અને `private` કદી ન રાખવા.',
          hi: 'UDP 161 polling, 162 trap। v1 और v2c community string इस्तेमाल करते हैं — वह **साधारण text में** जाता है, इसलिए v3 इस्तेमाल करें, जिसमें authentication और encryption है। `public` और `private` कभी न रखें।',
          en: 'UDP 161 for polling, 162 for traps. v1 and v2c use a community string that travels **in clear text**, so use v3, which has authentication and encryption. Never leave `public` and `private` in place.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 220, y: 210, type: 'switch', label: 'SW1', sub: t > 0.6 ? 'Fa0/4 down!' : 'CPU 12% · 41 °C', accent: t > 0.6 ? ERR : CCNA, pulse: t > 0.6 },
          { id: 'nms', x: 640, y: 210, type: 'server', label: 'Monitoring', accent: CCNP },
        ],
        links: [{ id: 'l', from: 'sw', to: 'nms', state: 'up', flowing: true }],
        packets:
          t < 0.55
            ? [
                { id: 'q', from: 'nms', to: 'sw', t: 0.15 + ease(t / 0.55) * 0.3, color: 'var(--nq-pkt-ctrl)', label: 'CPU?' },
                { id: 'a', from: 'sw', to: 'nms', t: 0.55 + ease(t / 0.55) * 0.3, color: 'var(--nq-ok)', label: '12%' },
              ]
            : [{ id: 'tr', from: 'sw', to: 'nms', t: 0.15 + ease((t - 0.55) / 0.45) * 0.7, color: ERR, label: 'TRAP — nobody asked' }],
      }),
      aside: (t) => ({
        title: H('બે રીતે વાત થાય', 'दो तरीकों से बात होती है', 'Two ways it speaks'),
        head: ['way', 'who starts it', 'for'],
        rows: [
          ['poll', 'the server asks', 'graphs, every few minutes'],
          ...(t > 0.55 ? [['trap', 'the device tells', 'something just broke']] : []),
        ],
      }),
    },
    {
      ms: 2800,
      label: H('ચારે મળીને એક જવાબ', 'चारों मिलकर एक जवाब', 'Together they answer one question'),
      text: {
        beginner: {
          gu: 'સવારે ફરિયાદ આવે: "રાત્રે ઇન્ટરનેટ ગયું હતું." હવે જુઓ કેમ ચારેની જરૂર પડી. **SNMP** નો આલેખ બતાવે કે 2:14 વાગ્યે traffic શૂન્ય થયું. **Syslog** એ જ ક્ષણે કહે કે કયો port નીચે ગયો. **NTP** વગર એ બંને સમય મેળ જ ન ખાત. અને **DNS** વગર તમે એ server સુધી પહોંચ્યા જ ન હોત.',
          hi: 'सुबह शिकायत आती है: "रात को Internet गया था।" अब देखें क्यों चारों की जरूरत पड़ी। **SNMP** का graph बताता है कि 2:14 बजे traffic शून्य हुआ। **Syslog** उसी क्षण बताता है कि कौन सा port नीचे गया। **NTP** के बिना वे दोनों समय मेल ही नहीं खाते। और **DNS** के बिना आप उस server तक पहुंचते ही नहीं।',
          en: 'A complaint arrives in the morning: "the internet went down in the night." Now see why you needed all four. **SNMP**’s graph shows traffic hitting zero at 2:14. **Syslog** says which port went down at that same instant. Without **NTP** those two times would never have lined up. And without **DNS** you would not have reached the server to look.',
        },
        exam: {
          gu: 'એટલે આ ચારે નવા નેટવર્કમાં **પહેલા દિવસે** ગોઠવાય, છેલ્લે નહીં. વાંધો આવ્યા પછી log ચાલુ કરવાથી જૂની ઘટના પાછી નથી આવતી.',
          hi: 'इसलिए ये चारों नए network में **पहले दिन** सेट किए जाते हैं, आखिर में नहीं। समस्या आने के बाद log चालू करने से पुरानी घटना वापस नहीं आती।',
          en: 'Which is why all four go in on **day one** of a new network, not last. Turning logging on after the outage does not bring the outage back.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'ntp', x: 150, y: 110, type: 'server', label: 'NTP', sub: 'when', accent: OK },
          { id: 'dns', x: 150, y: 320, type: 'server', label: 'DNS', sub: 'who', accent: CCNP },
          { id: 'log', x: 700, y: 110, type: 'server', label: 'Syslog', sub: 'what happened', accent: WARN },
          { id: 'nms', x: 700, y: 320, type: 'server', label: 'SNMP', sub: 'how much', accent: BEG },
          { id: 'sw', x: 430, y: 215, type: 'switch', label: 'your network', accent: CCNA, pulse: true },
        ],
        links: [
          { id: 'a', from: 'sw', to: 'ntp', state: 'up', flowing: true },
          { id: 'b', from: 'sw', to: 'dns', state: 'up', flowing: true },
          { id: 'c', from: 'sw', to: 'log', state: 'up', flowing: true },
          { id: 'd', from: 'sw', to: 'nms', state: 'up', flowing: true },
        ],
      }),
      aside: () => ({
        title: H('દરેકનો એક સવાલ', 'हर एक का एक सवाल', 'One question each'),
        head: ['service', 'answers', 'port'],
        rows: [
          ['NTP', 'when did it happen?', 'UDP 123'],
          ['DNS', 'what is that name?', '53'],
          ['Syslog', 'what happened?', 'UDP 514'],
          ['SNMP', 'how much, right now?', 'UDP 161/162'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'NTP બધી ઘડિયાળ એક કરે — એના વગર બાકીના ત્રણ **સાથે વાંચી શકાતા નથી**. DNS નામથી સરનામું આપે. Syslog કહે "શું બન્યું" (0 સૌથી ગંભીર, 7 સૌથી વાચાળ). SNMP કહે "અત્યારે કેટલું", અને ખોટું થાય તો જાતે trap મોકલે. ચારે પહેલા દિવસે ગોઠવવાનાં.',
    hi: 'NTP सभी घड़ियों को एक करता है — उसके बिना बाकी तीन **साथ नहीं पढ़े जा सकते**। DNS नाम से पता देता है। Syslog कहता है "क्या हुआ" (0 सबसे गंभीर, 7 सबसे बातूनी)। SNMP कहता है "अभी कितना", और गलत हो तो खुद trap भेजता है। चारों पहले दिन सेट करने हैं।',
    en: 'NTP makes every clock agree — without it the other three **cannot be read together**. DNS turns names into addresses. Syslog says what happened (0 most serious, 7 most talkative). SNMP says how much right now, and sends a trap on its own when something breaks. All four go in on day one.',
  },
  check: {
    q: H(
      'બે switch ના log સરખાવવા છે પણ એમના timestamp ચાર મિનિટ અલગ છે. પહેલાં શું ઠીક કરશો?',
      'दो switches के log की तुलना करनी है पर उनके timestamp चार मिनट अलग हैं। पहले क्या ठीक करेंगे?',
      'You want to compare two switches’ logs but their timestamps are four minutes apart. What do you fix first?',
    ),
    options: [
      H('બંનેને એક જ NTP server પર લઈ જાઓ', 'दोनों को एक ही NTP server पर ले जाएं', 'Point both at the same NTP server'),
      H('Syslog ની severity વધારો', 'Syslog की severity बढ़ाएं', 'Raise the syslog severity level'),
      H('SNMP community string બદલો', 'SNMP community string बदलें', 'Change the SNMP community string'),
    ],
    answer: 0,
    explain: H(
      'ઘડિયાળ મળતી ન હોય ત્યાં સુધી કયો log પહેલો એ **નક્કી જ ન થાય** — ભલે તમે ગમે તેટલું વિગતવાર log કરો. એટલે NTP હંમેશા પહેલું.',
      'घड़ी न मिलने तक कौन सा log पहले यह **तय ही नहीं हो सकता** — भले आप कितना भी विस्तृत log करें। इसलिए NTP हमेशा पहले।',
      'Until the clocks agree there is **no way to establish** which log line came first, however much detail you collect. So NTP comes first, always.',
    ),
  },
}

/* ═══════════════════ n4l4 · introduction to QoS ═══════════════════ */

export const n4l4: LessonSpec = {
  why: {
    gu: 'લિંક ભરાઈ જાય ત્યારે કશુંક તો રાહ જોવું જ પડે. QoS વધુ bandwidth નથી આપતું — એ ફક્ત નક્કી કરે છે **કોણ રાહ જુએ**. અને voice call ને રાહ જોવડાવવી એ સૌથી ખરાબ પસંદગી છે.',
    hi: 'Link भर जाए तो कुछ न कुछ इंतजार करना ही पड़ता है। QoS ज्यादा bandwidth नहीं देता — वह केवल तय करता है **कौन इंतजार करेगा**। और voice call को इंतजार कराना सबसे बुरा विकल्प है।',
    en: 'When a link fills up, something has to wait. QoS does not give you more bandwidth — it only decides **who waits**. And making a voice call wait is the worst choice available.',
  },
  steps: [
    {
      ms: 3200,
      label: H('કતાર ભરાય ત્યારે', 'कतार भरे तब', 'When the queue fills'),
      text: {
        beginner: {
          gu: 'લિંક ખાલી હોય ત્યાં સુધી QoS નું કશું કામ નથી — બધું તરત જાય. પણ કોઈ મોટી ફાઇલ ઉતારે અને લિંક ભરાય, ત્યારે packets **કતારમાં** ઊભા રહે. કતાર ભરાઈ જાય તો નવા packets **ફેંકાઈ** જાય. કોના ફેંકાય? કશું ન કરો તો — જે છેલ્લે આવ્યું એ.',
          hi: 'Link खाली हो तब तक QoS का कोई काम नहीं — सब तुरंत जाता है। पर कोई बड़ी file download करे और link भर जाए, तब packets **कतार में** खड़े रहते हैं। कतार भर जाए तो नए packets **फेंक** दिए जाते हैं। किसके? कुछ न करें तो — जो आखिर में आया वह।',
          en: 'While a link has room QoS has nothing to do: everything goes straight out. But let someone start a large download and the link fills, and packets begin to **queue**. Fill the queue and new packets are **dropped**. Whose? With no policy at all — whichever arrived last.',
        },
        exam: {
          gu: 'Default behaviour: FIFO અને tail drop. એમાં voice અને bulk download સરખા ગણાય, એટલે ખરાબ ક્ષણે બંનેના packets સરખા ફેંકાય.',
          hi: 'Default behaviour: FIFO और tail drop। इसमें voice और bulk download समान माने जाते हैं, इसलिए बुरे क्षण में दोनों के packets समान फेंके जाते हैं।',
          en: 'The default behaviour is FIFO with tail drop, which treats voice and a bulk download as equals — so at the worst moment both lose packets alike.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'v', x: 130, y: 100, type: 'pc', label: 'voice call', accent: OK },
          { id: 'd', x: 130, y: 320, type: 'pc', label: 'big download', accent: WARN },
          { id: 'r', x: 430, y: 210, type: 'router', label: 'R1', sub: t > 0.45 ? 'queue full' : 'queue has room', accent: t > 0.45 ? ERR : CCNA, pulse: t > 0.45 },
          { id: 'out', x: 740, y: 210, type: 'cloud', label: 'WAN link', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'v', to: 'r', state: 'up', flowing: true },
          { id: 'b', from: 'd', to: 'r', state: 'up', flowing: true },
          { id: 'c', from: 'r', to: 'out', state: 'up', flowing: true, label: t > 0.45 ? 'full' : undefined },
        ],
        packets:
          t > 0.5
            ? [{ id: 'x', from: 'v', to: 'r', t: 0.8, color: ERR, label: 'voice dropped ✕' }]
            : [{ id: 'x', from: 'v', to: 'out', t: 0.2 + ease(t / 0.5) * 0.6, color: 'var(--nq-ok)' }],
      }),
      say: (t) => (t > 0.55 ? { nodeId: 'r', text: H('મને બધા સરખા લાગે છે', 'मुझे सब समान लगते हैं', 'they all look the same to me') } : null),
    },
    {
      ms: 3000,
      label: H('બધી ખોટ સરખી નથી', 'सभी नुकसान समान नहीं', 'Not every loss is equal'),
      text: {
        beginner: {
          gu: 'ફાઇલ ઉતારતી વખતે એક packet ખોવાય તો TCP એ ફરી મોકલે — તમને ખબર પણ ન પડે, બસ એક ક્ષણ ધીમું. પણ voice call માં ખોવાયેલા packet ને **ફરી મોકલવાનો અર્થ જ નથી**: એ અવાજ તો ક્યારનો વીતી ગયો. એટલે એ કાયમ માટે તૂટેલો સંભળાય.',
          hi: 'File download के दौरान एक packet खो जाए तो TCP उसे फिर भेजता है — आपको पता भी नहीं चलता, बस एक क्षण धीमा। पर voice call में खोए packet को **फिर भेजने का कोई मतलब नहीं**: वह आवाज तो कब की बीत गई। इसलिए वह हमेशा के लिए टूटी हुई सुनाई देती है।',
          en: 'Lose a packet in a download and TCP sends it again — you never notice, just a moment slower. But in a voice call there is **no point resending** a lost packet: that sound has already gone past. So it stays broken in your ear.',
        },
        exam: {
          gu: 'Voice ની જરૂરિયાત: એક દિશામાં ≤150 ms વિલંબ, ≤30 ms jitter, ≤1% loss. Video થોડું સહન કરે. Data ને વિલંબ વાંધો નથી, પણ loss ખર્ચાળ છે (retransmit).',
          hi: 'Voice की जरूरत: एक दिशा में ≤150 ms देरी, ≤30 ms jitter, ≤1% loss। Video थोड़ा सहन करता है। Data को देरी से परेशानी नहीं, पर loss महंगा है (retransmit)।',
          en: 'Voice needs one-way delay under 150 ms, jitter under 30 ms and loss under 1 %. Video tolerates a little more. Data does not care about delay, but loss costs it a retransmission.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'v', x: 250, y: 110, type: 'pc', label: 'voice', sub: t > 0.4 ? 'lost = gone forever' : undefined, accent: ERR, pulse: t > 0.4 },
          { id: 'd', x: 250, y: 320, type: 'pc', label: 'download', sub: t > 0.6 ? 'lost = sent again' : undefined, accent: OK },
          { id: 'r', x: 650, y: 215, type: 'router', label: 'R1', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'v', to: 'r', state: 'up', flowing: true },
          { id: 'b', from: 'd', to: 'r', state: 'up', flowing: true },
        ],
        packets:
          t > 0.6
            ? [{ id: 'rt', from: 'd', to: 'r', t: 0.15 + ease((t - 0.6) / 0.4) * 0.7, color: 'var(--nq-pkt-tcp)', label: 'retransmit' }]
            : [],
      }),
      aside: () => ({
        title: H('એક packet ખોવાય તો', 'एक packet खो जाए तो', 'If one packet goes missing'),
        head: ['traffic', 'what loss costs'],
        rows: [
          ['voice', 'a gap you can hear — forever'],
          ['video', 'a block of pixels, briefly'],
          ['download', 'nothing — TCP resends it'],
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Packet પર નિશાની લગાવો', 'Packet पर निशान लगाएं', 'Put a mark on the packet'),
      text: {
        beginner: {
          gu: 'Router દરેક packet ખોલીને "આ voice છે?" તપાસે તો બહુ ધીમું પડે. એટલે packet ને **શરૂઆતમાં જ નિશાની** લગાવાય — IP header માં થોડા bits. પછી દરેક router ફક્ત એ નિશાની વાંચે અને તરત નક્કી કરે. નિશાની એક વાર, નિર્ણય દરેક hop પર.',
          hi: 'Router हर packet खोलकर "यह voice है?" जांचे तो बहुत धीमा हो जाए। इसलिए packet पर **शुरुआत में ही निशान** लगाया जाता है — IP header में कुछ bits। फिर हर router केवल वह निशान पढ़ता है और तुरंत तय करता है। निशान एक बार, निर्णय हर hop पर।',
          en: 'A router that opened every packet to ask "is this voice?" would crawl. So the packet gets **marked right at the start** — a few bits in the IP header. After that every router just reads the mark and decides instantly. Marked once, acted on at every hop.',
        },
        exam: {
          gu: 'DSCP એ IP header ના ToS byte ના 6 bits. Voice = EF (46), call signalling = CS3 (24), સામાન્ય data = default (0). Layer 2 પર એને CoS કહે છે (3 bits, trunk પર).',
          hi: 'DSCP IP header के ToS byte के 6 bits हैं। Voice = EF (46), call signalling = CS3 (24), सामान्य data = default (0)। Layer 2 पर इसे CoS कहते हैं (3 bits, trunk पर)।',
          en: 'DSCP is six bits in the IP header’s ToS byte. Voice is EF (46), call signalling CS3 (24), ordinary data default (0). The Layer 2 equivalent is CoS, three bits, carried on a trunk.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'p', x: 130, y: 200, type: 'pc', label: 'IP phone', accent: OK },
          { id: 's', x: 400, y: 200, type: 'switch', label: 'SW1', sub: t > 0.35 ? 'marks it EF' : undefined, accent: t > 0.35 ? OK : CCNA, pulse: t > 0.35 && t < 0.6 },
          { id: 'r', x: 700, y: 200, type: 'router', label: 'R1', sub: t > 0.7 ? 'reads EF, acts' : undefined, accent: CCNA, pulse: t > 0.7 },
        ],
        links: [
          { id: 'a', from: 'p', to: 's', state: 'up', flowing: true },
          { id: 'b', from: 's', to: 'r', state: 'up', flowing: true },
        ],
        packets:
          t < 0.45
            ? [{ id: 'x', from: 'p', to: 's', t: 0.15 + ease(t / 0.45) * 0.7, color: MUTE, label: 'unmarked' }]
            : [{ id: 'x', from: 's', to: 'r', t: 0.15 + ease((t - 0.45) / 0.55) * 0.7, color: 'var(--nq-ok)', label: 'DSCP EF (46)' }],
      }),
      aside: () => ({
        title: H('સામાન્ય નિશાનીઓ', 'सामान्य निशान', 'The marks you will meet'),
        head: ['traffic', 'DSCP'],
        rows: [
          ['voice', 'EF (46)'],
          ['call signalling', 'CS3 (24)'],
          ['video call', 'AF41 (34)'],
          ['everything else', 'default (0)'],
        ],
      }),
    },
    {
      ms: 3400,
      label: H('અલગ કતારો, અલગ વર્તન', 'अलग कतारें, अलग व्यवहार', 'Separate queues, different treatment'),
      text: {
        beginner: {
          gu: 'હવે એક કતારને બદલે **ઘણી** કતાર બનાવો. Voice ને પોતાની કતાર મળે જેને **હંમેશા પહેલાં** ખાલી કરાય. Data ની કતાર બાકી બચેલી જગ્યામાં ચાલે. એ જ ભરાયેલી લિંક પર હવે voice સાફ સંભળાય, અને download થોડો ધીમો થાય — જે કોઈને ખબર જ ન પડે.',
          hi: 'अब एक कतार के बजाय **कई** कतारें बनाएं। Voice को अपनी कतार मिले जिसे **हमेशा पहले** खाली किया जाए। Data की कतार बची जगह में चलती है। उसी भरी link पर अब voice साफ सुनाई देता है, और download थोड़ा धीमा होता है — जिसका किसी को पता ही नहीं चलता।',
          en: 'Now build **several** queues instead of one. Voice gets a queue of its own that is **always emptied first**. Data runs in whatever room is left. On that same full link the call is now clear, and the download is slightly slower — which nobody notices.',
        },
        exam: {
          gu: 'LLQ (low-latency queueing): voice માટે priority queue, બીજા traffic માટે CBWFQ ની bandwidth guarantee. Priority queue ને **મર્યાદા આપવી જ પડે**, નહીં તો voice બીજા બધાને ભૂખે મારે.',
          hi: 'LLQ (low-latency queueing): voice के लिए priority queue, दूसरे traffic के लिए CBWFQ की bandwidth guarantee। Priority queue को **सीमा देनी ही पड़ती है**, वरना voice दूसरों को भूखा मार देगा।',
          en: 'LLQ — low-latency queueing — gives voice a priority queue and the rest CBWFQ bandwidth guarantees. The priority queue **must be capped**, or voice will starve everything else.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'v', x: 130, y: 100, type: 'pc', label: 'voice', accent: OK },
          { id: 'd', x: 130, y: 320, type: 'pc', label: 'download', accent: WARN },
          { id: 'q1', x: 420, y: 100, type: 'switch', label: 'priority queue', sub: t > 0.3 ? 'always first' : undefined, accent: OK, pulse: t > 0.3 },
          { id: 'q2', x: 420, y: 320, type: 'switch', label: 'normal queue', sub: t > 0.3 ? 'whatever is left' : undefined, accent: MUTE },
          { id: 'out', x: 740, y: 210, type: 'cloud', label: 'same full link', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'v', to: 'q1', state: 'up', flowing: true },
          { id: 'b', from: 'd', to: 'q2', state: 'up', flowing: true },
          { id: 'c', from: 'q1', to: 'out', state: 'up', flowing: true },
          { id: 'd2', from: 'q2', to: 'out', state: 'up', flowing: t > 0.5 },
        ],
        packets:
          t > 0.35
            ? [
                { id: 'x', from: 'q1', to: 'out', t: 0.2 + ease((t - 0.35) / 0.65) * 0.6, color: 'var(--nq-ok)', label: 'goes first' },
                ...(t > 0.6 ? [{ id: 'y', from: 'q2', to: 'out', t: 0.2 + ease((t - 0.6) / 0.4) * 0.5, color: 'var(--nq-pkt-tcp)', label: 'waits its turn' }] : []),
              ]
            : [],
      }),
      aside: () => ({
        title: H('એ જ લિંક, બે પરિણામ', 'वही link, दो परिणाम', 'Same link, two outcomes'),
        caption: H('Bandwidth વધ્યું નથી. ક્રમ બદલાયો છે.', 'Bandwidth नहीं बढ़ा। क्रम बदला है।', 'No extra bandwidth. A different order.'),
        head: ['', 'without QoS', 'with QoS'],
        rows: [
          ['voice', 'choppy', 'clear'],
          ['download', 'full speed', 'a little slower'],
        ],
      }),
    },
    {
      ms: 2800,
      label: H('ભરોસો ક્યાં મૂકવો', 'भरोसा कहां रखें', 'Where to place your trust'),
      text: {
        beginner: {
          gu: 'એક ખતરો છે: નિશાની તો કોઈ પણ લગાવી શકે. વપરાશકર્તાનો લેપટોપ પોતાના torrent ને "આ voice છે" કહીને મોકલે તો? એટલે નિયમ છે — **વપરાશકર્તાના port પર કોઈની નિશાની પર ભરોસો ન કરો**. IP phone પર કરો, લેપટોપ પર નહીં.',
          hi: 'एक खतरा है: निशान तो कोई भी लगा सकता है। User का laptop अपने torrent को "यह voice है" कहकर भेजे तो? इसलिए नियम है — **user port पर किसी के निशान पर भरोसा न करें**। IP phone पर करें, laptop पर नहीं।',
          en: 'There is one danger: anybody can set the mark. What stops a user’s laptop labelling its torrent as voice? Hence the rule — **do not trust markings arriving on a user port**. Trust the IP phone; do not trust the laptop behind it.',
        },
        exam: {
          gu: '`mls qos trust dscp` ફક્ત ભરોસાપાત્ર ઉપકરણ તરફ. Trust boundary શક્ય એટલી **ધાર પર** રાખવી — access switch પર, core પર નહીં. અને QoS ભરાયેલી લિંકને સાજી નથી કરતું: કાયમ ભરાયેલી હોય તો વધુ bandwidth જ ઉપાય છે.',
          hi: '`mls qos trust dscp` केवल भरोसेमंद उपकरण की तरफ। Trust boundary जितनी हो सके **किनारे पर** रखें — access switch पर, core पर नहीं। और QoS भरी link को ठीक नहीं करता: हमेशा भरी हो तो ज्यादा bandwidth ही उपाय है।',
          en: 'Use `mls qos trust dscp` only towards devices you trust, and keep the trust boundary as close to the **edge** as possible — on the access switch, not in the core. And QoS does not cure a saturated link: if it is always full, more bandwidth is the only answer.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'ph', x: 140, y: 110, type: 'pc', label: 'IP phone', sub: 'trusted', accent: OK },
          { id: 'lap', x: 140, y: 320, type: 'laptop', label: 'laptop', sub: 'not trusted', accent: ERR },
          { id: 'sw', x: 470, y: 215, type: 'switch', label: 'access switch', sub: 'the trust boundary', accent: CCNA, pulse: true },
          { id: 'core', x: 760, y: 215, type: 'switch', label: 'core', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'ph', to: 'sw', state: 'up', flowing: true },
          { id: 'b', from: 'lap', to: 'sw', state: 'up', flowing: true },
          { id: 'c', from: 'sw', to: 'core', state: 'up', flowing: true },
        ],
        packets: [
          { id: 'x', from: 'ph', to: 'sw', t: 0.6, color: 'var(--nq-ok)', label: 'EF — believed' },
          { id: 'y', from: 'lap', to: 'sw', t: 0.6, color: ERR, label: 'EF — ignored' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'QoS bandwidth નથી આપતું — એ **રાહ કોણ જુએ** એ નક્કી કરે છે. Voice નો ખોવાયેલો packet પાછો આવતો નથી, એટલે એને પોતાની priority કતાર આપો. Packet ને ધાર પર એક વાર નિશાની (DSCP EF = voice) લગાવો, પછી દરેક hop એ જ વાંચે. અને **વપરાશકર્તાના port પરની નિશાની પર ભરોસો ન કરો**.',
    hi: 'QoS bandwidth नहीं देता — वह **इंतजार कौन करेगा** यह तय करता है। Voice का खोया packet वापस नहीं आता, इसलिए उसे अपनी priority कतार दें। Packet पर किनारे पर एक बार निशान (DSCP EF = voice) लगाएं, फिर हर hop वही पढ़ता है। और **user port पर आए निशान पर भरोसा न करें**।',
    en: 'QoS gives you no bandwidth — it decides **who waits**. A lost voice packet never comes back, so give voice a priority queue of its own. Mark the packet once at the edge (DSCP EF for voice) and every hop thereafter just reads it. And **never trust a marking that arrives on a user port**.',
  },
  check: {
    q: H(
      'WAN લિંક આખો દિવસ 100% ભરાયેલી રહે છે અને બધું ધીમું છે. QoS લગાવવાથી શું થશે?',
      'WAN link पूरे दिन 100% भरी रहती है और सब धीमा है। QoS लगाने से क्या होगा?',
      'A WAN link sits at 100 % all day and everything is slow. What does adding QoS achieve?',
    ),
    options: [
      H('Voice બચી જશે, પણ બાકીનું ધીમું જ રહેશે', 'Voice बच जाएगा, पर बाकी धीमा ही रहेगा', 'Voice will be protected, but the rest stays slow'),
      H('બધું ઝડપી થઈ જશે', 'सब तेज हो जाएगा', 'Everything will get faster'),
      H('લિંકની bandwidth વધી જશે', 'Link की bandwidth बढ़ जाएगी', 'The link’s bandwidth will increase'),
    ],
    answer: 0,
    explain: H(
      'QoS એક પણ bit વધારાનો નથી આપતું. એ ફક્ત કતારનો ક્રમ બદલે છે — એટલે તમે જે બચાવવા માગો એ બચે, બાકીનું ભોગવે. કાયમ ભરાયેલી લિંકનો ખરો ઉપાય **વધુ bandwidth** જ છે.',
      'QoS एक भी bit अतिरिक्त नहीं देता। वह केवल कतार का क्रम बदलता है — इसलिए आप जो बचाना चाहें वह बचता है, बाकी भुगतता है। हमेशा भरी link का असली उपाय **ज्यादा bandwidth** ही है।',
      'QoS adds not one bit of capacity. It only reorders the queue, so what you chose to protect survives and the rest absorbs the pain. For a permanently full link the real answer is **more bandwidth**.',
    ),
  },
}
