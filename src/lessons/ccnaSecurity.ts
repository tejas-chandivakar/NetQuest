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

/* ═══════════════════ n5l1 · device access — SSH and AAA ═══════════════════ */

export const n5l1: LessonSpec = {
  why: {
    gu: 'નેટવર્ક ગમે તેટલું સરસ ગોઠવ્યું હોય, જો કોઈ router માં ઘૂસી શકે તો બધું નકામું. અને જૂનું Telnet તમારો password **સાદા લખાણમાં** તારે મોકલે છે — કોઈ પણ વાંચી શકે એવો.',
    hi: 'Network चाहे कितनी भी अच्छी तरह सेट हो, अगर कोई router में घुस सके तो सब बेकार। और पुराना Telnet आपका password **सादे पाठ में** तार पर भेजता है — कोई भी पढ़ सके ऐसा।',
    en: 'However well the network is built, it is worthless if somebody can get into the router. And old Telnet sends your password down the wire **in plain text**, for anyone at all to read.',
  },
  steps: [
    {
      ms: 3200,
      label: H('Telnet — બધું ખુલ્લું', 'Telnet — सब कुछ खुला', 'Telnet — everything in the open'),
      text: {
        beginner: {
          gu: 'Telnet માં તમે જે લખો એ **જેમનું તેમ** તાર પર જાય — username, password, દરેક command. વચ્ચે કોઈ સાંભળતું હોય તો એને તમારું password વાંચવા કશું તોડવું પણ ન પડે. એ ત્યાં લખેલું જ હોય.',
          hi: 'Telnet में आप जो लिखें वह **जस का तस** तार पर जाए — username, password, हर command। बीच में कोई सुन रहा हो तो उसे आपका password पढ़ने के लिए कुछ तोड़ना भी न पड़े। वह वहां लिखा ही हो।',
          en: 'Everything you type in Telnet goes onto the wire **exactly as typed** — username, password, every command. Anyone listening in between does not have to break anything to read your password. It is simply there.',
        },
        exam: {
          gu: 'Telnet TCP 23, SSH TCP 22. આધુનિક નેટવર્કમાં Telnet કદી ન વાપરવું. `transport input ssh` લાઇન પર લખીને Telnet બંધ કરી દેવું.',
          hi: 'Telnet TCP 23, SSH TCP 22। आधुनिक network में Telnet कभी न वापरें। `transport input ssh` line पर लिखकर Telnet बंद कर दें।',
          en: 'Telnet is TCP 23, SSH TCP 22. Telnet has no place in a modern network — shut it off with `transport input ssh` on the vty lines.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 160, y: 200, type: 'laptop', label: 'admin', accent: BEG },
          { id: 'spy', x: 430, y: 350, type: 'laptop', label: 'listening', sub: t > 0.5 ? 'got it' : undefined, accent: t > 0.5 ? ERR : MUTE, pulse: t > 0.5 },
          { id: 'r', x: 700, y: 200, type: 'router', label: 'R1', accent: CCNA },
        ],
        links: [{ id: 'l', from: 'a', to: 'r', state: 'up', flowing: true, label: 'Telnet' }],
        packets: [
          { id: 'p', from: 'a', to: 'r', t: 0.15 + ease(Math.min(1, t)) * 0.7, color: ERR, label: 'password: cisco123' },
        ],
      }),
      say: (t) => (t > 0.55 ? { nodeId: 'spy', text: H('કશું તોડવું પડ્યું નહીં', 'कुछ तोड़ना नहीं पड़ा', 'nothing had to be broken') } : null),
    },
    {
      ms: 3200,
      label: H('SSH — તાર પર બધું બંધ', 'SSH — तार पर सब बंद', 'SSH — sealed on the wire'),
      text: {
        beginner: {
          gu: 'SSH એ જ વાત કરે, પણ **બંધ પરબીડિયામાં**. જોડાણ શરૂ થતાં બંને છેડા ચાવીઓ બદલે અને પછી બધું encrypt થાય. વચ્ચેનો જાસૂસ હવે ફક્ત અર્થહીન અક્ષરો જુએ. એટલે router પર SSH ચાલુ કરવું એ પહેલું સુરક્ષા પગલું છે.',
          hi: 'SSH वही बात करे, पर **बंद लिफाफे में**। जुड़ाव शुरू होते ही दोनों छोर चाबियां बदलें और फिर सब encrypt हो। बीच का जासूस अब केवल अर्थहीन अक्षर देखे। इसलिए router पर SSH चालू करना पहला सुरक्षा कदम है।',
          en: 'SSH holds the same conversation, but **inside a sealed envelope**. The two ends swap keys as the session opens and everything after that is encrypted. The listener in the middle now sees meaningless characters. Turning SSH on is the first security step on any router.',
        },
        exam: {
          gu: 'ચાર વસ્તુ જોઈએ જ: `hostname`, `ip domain-name`, `crypto key generate rsa` (1024 bits કે વધુ), અને એક local user. પછી line પર `transport input ssh` અને `login local`. SSH v2 જ વાપરવું: `ip ssh version 2`.',
          hi: 'चार चीजें चाहिए ही: `hostname`, `ip domain-name`, `crypto key generate rsa` (1024 bits या ज्यादा), और एक local user। फिर line पर `transport input ssh` और `login local`। SSH v2 ही वापरें: `ip ssh version 2`।',
          en: 'Four things are required: a `hostname`, an `ip domain-name`, `crypto key generate rsa` at 1024 bits or more, and a local user. Then `transport input ssh` and `login local` on the lines. Insist on version 2 with `ip ssh version 2`.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 160, y: 200, type: 'laptop', label: 'admin', accent: BEG },
          { id: 'spy', x: 430, y: 350, type: 'laptop', label: 'listening', sub: t > 0.4 ? 'unreadable' : undefined, accent: MUTE },
          { id: 'r', x: 700, y: 200, type: 'router', label: 'R1', sub: t > 0.3 ? 'rsa key 2048' : undefined, accent: t > 0.3 ? OK : CCNA, pulse: t > 0.3 },
        ],
        links: [{ id: 'l', from: 'a', to: 'r', state: 'up', flowing: true, label: 'SSH' }],
        packets: [
          { id: 'p', from: 'a', to: 'r', t: 0.15 + ease(Math.min(1, t)) * 0.7, color: 'var(--nq-ok)', label: '8f3a…c1d9' },
        ],
      }),
      aside: () => ({
        title: H('SSH ચાલુ કરવા ચાર વસ્તુ', 'SSH चालू करने को चार चीजें', 'Four things SSH needs'),
        head: ['#', 'what', 'why'],
        rows: [
          ['1', 'hostname', 'the key is named after it'],
          ['2', 'ip domain-name', 'so is the rest of the name'],
          ['3', 'crypto key generate rsa', 'the key itself'],
          ['4', 'a local username', 'somebody to let in'],
        ],
        notes: { 2: H('1024 bits થી ઓછું ન રાખવું', '1024 bits से कम न रखें', 'never below 1024 bits') },
      }),
    },
    {
      ms: 3000,
      label: H('દરેકનો પોતાનો password', 'हर एक का अपना password', 'A password each'),
      text: {
        beginner: {
          gu: 'ઘણી જગ્યાએ એક જ password હોય છે જે ટીમમાં બધા જાણે. પછી કોઈ નોકરી છોડે તો? એ હજી જાણે છે. અને log માં ફક્ત "કોઈ login થયું" લખાય — **કોણ** એ નહીં. એટલે દરેક વ્યક્તિને પોતાનું નામ અને password આપો.',
          hi: 'कई जगह एक ही password होता है जिसे team में सब जानते हैं। फिर कोई नौकरी छोड़े तो? वह अब भी जानता है। और log में केवल "कोई login हुआ" लिखा जाए — **कौन** नहीं। इसलिए हर व्यक्ति को अपना नाम और password दें।',
          en: 'Many places have one password that the whole team knows. Then somebody leaves — and still knows it. And the log only says "somebody logged in", never **who**. So give each person their own name and password.',
        },
        exam: {
          gu: '`username tejas secret <pw>` વાપરવું — `secret` એ hash કરે છે, `password` નહીં. અને `enable secret` વાપરવું, `enable password` નહીં: જૂનું type 7 encryption મિનિટોમાં ઉકેલાય છે.',
          hi: '`username tejas secret <pw>` वापरें — `secret` hash करता है, `password` नहीं। और `enable secret` वापरें, `enable password` नहीं: पुराना type 7 encryption मिनटों में टूटता है।',
          en: 'Use `username tejas secret <pw>` — `secret` hashes it, `password` does not. And use `enable secret`, never `enable password`: the old type 7 encryption is reversed in minutes.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'u1', x: 140, y: 100, type: 'laptop', label: 'tejas', accent: OK },
          { id: 'u2', x: 140, y: 320, type: 'laptop', label: 'priya', accent: OK },
          { id: 'r', x: 560, y: 210, type: 'router', label: 'R1', accent: CCNA, pulse: t > 0.4 },
        ],
        links: [
          { id: 'a', from: 'u1', to: 'r', state: 'up', flowing: t < 0.5 },
          { id: 'b', from: 'u2', to: 'r', state: 'up', flowing: t >= 0.5 },
        ],
      }),
      aside: (t) => ({
        title: H('હવે log કોણ કહે છે', 'अब log कौन कहता है', 'What the log can say now'),
        head: ['time', 'event'],
        rows: [
          ['14:02', t > 0.4 ? 'tejas logged in from 10.1.1.50' : 'somebody logged in'],
          ...(t > 0.6 ? [['14:19', 'priya logged in from 10.1.1.77']] : []),
        ],
      }),
    },
    {
      ms: 3400,
      label: H('સો ઉપકરણ હોય ત્યારે — AAA', 'सौ उपकरण हों तब — AAA', 'When there are a hundred devices — AAA'),
      text: {
        beginner: {
          gu: 'દરેક ઉપકરણ પર દરેક વ્યક્તિનું username? દસ ઉપકરણ સુધી ઠીક. સો હોય અને કોઈ નોકરી છોડે તો **સો જગ્યાએ** ભૂંસવું પડે — અને એક ભૂલાઈ જાય એટલે દરવાજો ખુલ્લો. એટલે બધા ઉપકરણો એક **જ** server ને પૂછે.',
          hi: 'हर उपकरण पर हर व्यक्ति का username? दस उपकरण तक ठीक। सौ हों और कोई नौकरी छोड़े तो **सौ जगहों** पर मिटाना पड़े — और एक भूल जाए तो दरवाजा खुला। इसलिए सारे उपकरण एक **ही** server से पूछें।',
          en: 'Every person’s username on every device? Fine up to about ten. With a hundred, somebody leaving means deleting them in **a hundred places** — and one you forget is a door left open. So instead every device asks **one** server.',
        },
        exam: {
          gu: 'ત્રણ A: Authentication (તમે કોણ છો), Authorization (તમે શું કરી શકો), Accounting (તમે શું કર્યું). TACACS+ (TCP 49) આ ત્રણે અલગ કરે અને આખું packet encrypt કરે — network ઉપકરણ માટે એ જ પસંદગી. RADIUS (UDP 1812/1813) ફક્ત password encrypt કરે, અને વપરાશકર્તાના access માટે વધુ વપરાય.',
          hi: 'तीन A: Authentication (आप कौन हैं), Authorization (आप क्या कर सकते हैं), Accounting (आपने क्या किया)। TACACS+ (TCP 49) इन तीनों को अलग करता है और पूरा packet encrypt करता है — network उपकरण के लिए यही पसंद। RADIUS (UDP 1812/1813) केवल password encrypt करता है, और उपयोगकर्ता access के लिए ज्यादा वापरा जाता है।',
          en: 'Three As: authentication (who you are), authorization (what you may do), accounting (what you did). TACACS+ (TCP 49) separates all three and encrypts the whole packet — the usual choice for network devices. RADIUS (UDP 1812/1813) encrypts only the password and is more often used for user access.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'u', x: 120, y: 210, type: 'laptop', label: 'tejas', accent: BEG },
          { id: 'r1', x: 400, y: 90, type: 'router', label: 'R1', accent: CCNA },
          { id: 'r2', x: 400, y: 210, type: 'switch', label: 'SW1', accent: CCNA },
          { id: 'r3', x: 400, y: 330, type: 'router', label: 'R2', accent: CCNA },
          { id: 'aaa', x: 730, y: 210, type: 'server', label: 'AAA server', sub: t > 0.4 ? 'one list, one place' : undefined, accent: t > 0.4 ? OK : MUTE, pulse: t > 0.4 },
        ],
        links: [
          { id: 'x', from: 'u', to: 'r2', state: 'up', flowing: t < 0.4 },
          { id: 'a', from: 'r1', to: 'aaa', state: 'up', flowing: t > 0.4 },
          { id: 'b', from: 'r2', to: 'aaa', state: 'up', flowing: t > 0.4 },
          { id: 'c', from: 'r3', to: 'aaa', state: 'up', flowing: t > 0.4 },
        ],
        packets:
          t > 0.45
            ? [{ id: 'p', from: 'r2', to: 'aaa', t: 0.15 + ease((t - 0.45) / 0.55) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'is tejas allowed?' }]
            : [],
      }),
      aside: () => ({
        title: H('ત્રણ A', 'तीन A', 'The three As'),
        head: ['A', 'asks'],
        rows: [
          ['Authentication', 'are you really tejas?'],
          ['Authorization', 'may tejas run this command?'],
          ['Accounting', 'what did tejas do, and when?'],
        ],
      }),
    },
    {
      ms: 2800,
      label: H('Server ન પહોંચે તો?', 'Server न पहुंचे तो?', 'And when the server cannot be reached?'),
      text: {
        beginner: {
          gu: 'એક ભયાનક સંભાવના: AAA server બંધ પડે, અને હવે **કોઈ જ** login ન કરી શકે — તમે પણ નહીં. એટલે હંમેશા એક local username રાખો, અને એને **છેલ્લો વિકલ્પ** બનાવો. પહેલાં server ને પૂછો; એ ન મળે તો જ local.',
          hi: 'एक भयानक संभावना: AAA server बंद हो जाए, और अब **कोई भी** login न कर सके — आप भी नहीं। इसलिए हमेशा एक local username रखें, और उसे **आखिरी विकल्प** बनाएं। पहले server से पूछें; वह न मिले तो ही local।',
          en: 'One frightening possibility: the AAA server goes down and now **nobody** can log in — you included. So always keep one local username and make it the **last resort**. Ask the server first; fall back to local only when it cannot be reached.',
        },
        exam: {
          gu: '`aaa authentication login default group tacacs+ local` — ક્રમ ડાબેથી જમણે. `local` છેલ્લે ન લખો તો server જતાં જ તમે તમારા જ નેટવર્કમાંથી બહાર. અને console line પર પણ આ તપાસી લેવું, બહાર નીકળતાં પહેલાં.',
          hi: '`aaa authentication login default group tacacs+ local` — क्रम बाएं से दाएं। `local` आखिर में न लिखें तो server जाते ही आप अपने ही network से बाहर। और console line पर भी यह जांच लें, बाहर निकलने से पहले।',
          en: '`aaa authentication login default group tacacs+ local` — the methods are tried left to right. Leave `local` off the end and losing the server locks you out of your own network. Test it on the console line too, before you log out.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'u', x: 150, y: 210, type: 'laptop', label: 'tejas', accent: BEG },
          { id: 'r', x: 450, y: 210, type: 'router', label: 'R1', sub: t > 0.5 ? 'falling back to local' : undefined, accent: t > 0.5 ? OK : CCNA, pulse: t > 0.5 },
          { id: 'aaa', x: 760, y: 210, type: 'server', label: 'AAA server', sub: 'down ✕', accent: ERR },
        ],
        links: [
          { id: 'a', from: 'u', to: 'r', state: 'up', flowing: true },
          { id: 'b', from: 'r', to: 'aaa', state: 'down' },
        ],
      }),
      say: (t) =>
        t > 0.55 ? { nodeId: 'r', text: H('Server નથી — local વાપરું', 'Server नहीं — local वापरूं', 'no server — I will use local') } : null,
      aside: () => ({
        title: H('ક્રમ ડાબેથી જમણે', 'क्रम बाएं से दाएं', 'Tried left to right'),
        head: ['order', 'method', 'when'],
        rows: [
          ['1', 'group tacacs+', 'normally'],
          ['2', 'local', 'only if the server is unreachable'],
        ],
        notes: { 1: H('આ ભૂલાય તો તમે જ બહાર', 'यह भूले तो आप ही बाहर', 'forget this and you are the one locked out') },
      }),
    },
  ],
  takeaway: {
    gu: 'Telnet password સાદા લખાણમાં મોકલે — કદી ન વાપરવું. SSH ચાલુ કરવા ચાર વસ્તુ: hostname, domain-name, RSA key, local user. દરેક વ્યક્તિને પોતાનું username આપો (`secret`, `password` નહીં) જેથી log **કોણ** કહી શકે. ઘણાં ઉપકરણ હોય તો AAA — પણ **હંમેશા `local` છેલ્લે રાખો**.',
    hi: 'Telnet password सादे पाठ में भेजे — कभी न वापरें। SSH चालू करने को चार चीजें: hostname, domain-name, RSA key, local user। हर व्यक्ति को अपना username दें (`secret`, `password` नहीं) ताकि log **कौन** कह सके। कई उपकरण हों तो AAA — पर **हमेशा `local` आखिर में रखें**।',
    en: 'Telnet sends the password in clear text — never use it. SSH needs four things: hostname, domain name, RSA key and a local user. Give each person their own username (`secret`, never `password`) so the log can say **who**. At scale use AAA — but **always keep `local` on the end**.',
  },
  check: {
    q: H(
      '`aaa authentication login default group tacacs+` લખ્યું અને TACACS+ server બંધ પડ્યો. શું થશે?',
      '`aaa authentication login default group tacacs+` लिखा और TACACS+ server बंद हो गया। क्या होगा?',
      'You configured `aaa authentication login default group tacacs+` and the TACACS+ server goes down. What happens?',
    ),
    options: [
      H('કોઈ login ન કરી શકે — તમે પણ નહીં', 'कोई login न कर सके — आप भी नहीं', 'Nobody can log in, you included'),
      H('આપોઆપ local username વપરાશે', 'अपने आप local username वापरा जाएगा', 'It falls back to the local usernames automatically'),
      H('Login password વગર ચાલશે', 'Login password बिना चलेगा', 'Logins will succeed without a password'),
    ],
    answer: 0,
    explain: H(
      'યાદીમાં ફક્ત એક જ method છે, એટલે એ નિષ્ફળ જાય તો બીજું કશું બાકી નથી. છેડે `local` લખવું જ પડે — અને console પર એ ચાલે છે કે નહીં એ **બહાર નીકળતાં પહેલાં** તપાસવું.',
      'सूची में केवल एक ही method है, तो वह असफल हो तो और कुछ बाकी नहीं। आखिर में `local` लिखना ही पड़े — और console पर वह चलता है या नहीं यह **बाहर निकलने से पहले** जांचें।',
      'There is only one method in the list, so when it fails there is nothing left to try. `local` has to be on the end — and you check that it works on the console **before** you log out.',
    ),
  },
}

/* ═══════════════════ n5l3 · port security ═══════════════════ */

export const n5l3: LessonSpec = {
  why: {
    gu: 'સ્વાગત કક્ષમાં એક ખાલી network socket છે. કોઈ પણ ત્યાં પોતાનો લેપટોપ — કે પોતાનું switch — ભરાવી શકે, અને એ ક્ષણે એ તમારા નેટવર્કની અંદર છે. Port security એ એ socket પર તાળું છે.',
    hi: 'स्वागत कक्ष में एक खाली network socket है। कोई भी वहां अपना लैपटॉप — या अपना switch — लगा सकता है, और उस क्षण वह आपके network के अंदर है। Port security उस socket पर ताला है।',
    en: 'There is a spare network socket in reception. Anyone can plug their laptop into it — or their own switch — and at that moment they are inside your network. Port security is the lock on that socket.',
  },
  steps: [
    {
      ms: 3000,
      label: H('ખાલી socket એ ખુલ્લો દરવાજો', 'खाली socket एक खुला दरवाजा', 'A spare socket is an open door'),
      text: {
        beginner: {
          gu: 'Switch ને કશી પરવા નથી કે બીજા છેડે કોણ છે. કેબલ ભરાય, link ઊભી થાય, DHCP સરનામું આપે — અને અજાણ્યું ઉપકરણ અંદર. કોઈ password નહીં, કોઈ સવાલ નહીં. એ **default** વર્તન છે.',
          hi: 'Switch को कोई परवाह नहीं कि दूसरे छोर पर कौन है। Cable लगे, link खड़ी हो, DHCP पता दे — और अनजान उपकरण अंदर। कोई password नहीं, कोई सवाल नहीं। यह **default** व्यवहार है।',
          en: 'A switch does not care who is on the other end. The cable goes in, the link comes up, DHCP hands out an address, and a stranger is inside. No password, no questions. That is the **default** behaviour.',
        },
        exam: {
          gu: 'એટલે જે port વપરાતા નથી એ `shutdown` રાખવા, અને એમને એક ખાલી "parking" VLAN માં મૂકવા — default VLAN 1 માં નહીં.',
          hi: 'इसलिए जो port वापरे नहीं जाते उन्हें `shutdown` रखें, और उन्हें एक खाली "parking" VLAN में रखें — default VLAN 1 में नहीं।',
          en: 'Which is why unused ports should be left `shutdown` and parked in an unused VLAN, never left in the default VLAN 1.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 420, y: 210, type: 'switch', label: 'SW1', accent: CCNA },
          { id: 'ok', x: 140, y: 110, type: 'pc', label: 'the real PC', accent: OK },
          { id: 'bad', x: 740, y: 310, type: 'laptop', label: 'stranger', sub: t > 0.4 ? 'inside now' : 'reception socket', accent: t > 0.4 ? ERR : MUTE, pulse: t > 0.4 },
        ],
        links: [
          { id: 'a', from: 'ok', to: 'sw', state: 'up', flowing: true },
          { id: 'b', from: 'sw', to: 'bad', state: t > 0.3 ? 'up' : 'idle', flowing: t > 0.3 },
        ],
        packets:
          t > 0.45
            ? [{ id: 'p', from: 'sw', to: 'bad', t: 0.15 + ease((t - 0.45) / 0.55) * 0.7, color: ERR, label: 'here is an IP address' }]
            : [],
      }),
    },
    {
      ms: 3200,
      label: H('Port ને યાદ રાખવા દો', 'Port को याद रखने दें', 'Let the port remember'),
      text: {
        beginner: {
          gu: 'Port security કહે છે: "આ port પર **કેટલાં** ઉપકરણ, અને **કયાં**". Switch પહેલું MAC સરનામું જુએ અને એને યાદ રાખી લે. પછી બીજું કોઈ MAC એ જ port પર દેખાય તો એ ઘુસણખોર છે.',
          hi: 'Port security कहता है: "इस port पर **कितने** उपकरण, और **कौन से**"। Switch पहला MAC पता देखे और उसे याद रख ले। फिर कोई दूसरा MAC उसी port पर दिखे तो वह घुसपैठिया है।',
          en: 'Port security says: "on this port, **how many** devices, and **which**". The switch sees the first MAC address and remembers it. After that, any other MAC appearing on that port is an intruder.',
        },
        exam: {
          gu: '`switchport port-security` ચાલુ કરે, `maximum <n>` સંખ્યા નક્કી કરે (default 1). MAC હાથે લખાય, કે `sticky` થી જાતે શીખાય. **Access port પર જ ચાલે** — trunk પર નહીં.',
          hi: '`switchport port-security` चालू करे, `maximum <n>` संख्या तय करे (default 1)। MAC हाथ से लिखें, या `sticky` से खुद सीखे। **Access port पर ही चले** — trunk पर नहीं।',
          en: '`switchport port-security` enables it and `maximum <n>` sets the count (default 1). The MAC can be typed by hand or learned with `sticky`. It only works on an **access port**, never a trunk.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 540, y: 210, type: 'switch', label: 'SW1', sub: t > 0.4 ? 'Fa0/4 remembers one MAC' : undefined, accent: t > 0.4 ? OK : CCNA, pulse: t > 0.4 },
          { id: 'pc', x: 180, y: 210, type: 'pc', label: 'PC1', sub: '00:1A:2B:3C:4D:5E', accent: BEG },
        ],
        links: [{ id: 'a', from: 'pc', to: 'sw', state: 'up', flowing: true }],
        packets:
          t > 0.3 && t < 0.7
            ? [{ id: 'p', from: 'pc', to: 'sw', t: 0.15 + ease((t - 0.3) / 0.4) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'this is my MAC' }]
            : [],
      }),
      aside: (t) => ({
        title: H('Port શું યાદ રાખે છે', 'Port क्या याद रखता है', 'What the port remembers'),
        head: ['port', 'allowed', 'learned'],
        rows: [
          ['Fa0/4', 'max 1', t > 0.4 ? '00:1A:2B:3C:4D:5E (sticky)' : 'nothing yet'],
        ],
        empty: H('હજી કશું શીખ્યું નથી.', 'अभी कुछ सीखा नहीं।', 'nothing learned yet.'),
      }),
    },
    {
      ms: 3400,
      label: H('ખોટું ઉપકરણ આવે ત્યારે', 'गलत उपकरण आए तब', 'When the wrong device arrives'),
      text: {
        beginner: {
          gu: 'હવે કોઈ એ કેબલ કાઢીને પોતાનો લેપટોપ ભરાવે. Switch નવું MAC જુએ, યાદ રાખેલા સાથે મેળ ખાતું નથી — અને **violation** થાય. Default વર્તન સૌથી કડક છે: port તરત જ બંધ, `err-disabled`. કોઈ વાટાઘાટ નહીં.',
          hi: 'अब कोई वह cable निकालकर अपना लैपटॉप लगाए। Switch नया MAC देखे, याद रखे से मेल नहीं खाता — और **violation** हो। Default व्यवहार सबसे सख्त है: port तुरंत बंद, `err-disabled`। कोई बातचीत नहीं।',
          en: 'Now somebody unplugs that cable and puts their own laptop in. The switch sees a new MAC, it does not match the one remembered, and that is a **violation**. The default response is the strictest one: the port shuts immediately into `err-disabled`. No negotiation.',
        },
        exam: {
          gu: 'ત્રણ mode: `shutdown` (default — err-disabled, log, counter), `restrict` (frame ફેંકે, log અને counter રાખે), `protect` (ચૂપચાપ ફેંકે — કશી ખબર ન પડે, એટલે લગભગ કદી ન વાપરવું).',
          hi: 'तीन mode: `shutdown` (default — err-disabled, log, counter), `restrict` (frame फेंके, log और counter रखे), `protect` (चुपचाप फेंके — कुछ पता न चले, इसलिए लगभग कभी न वापरें)।',
          en: 'Three modes: `shutdown` (the default — err-disabled, a log and a counter), `restrict` (drops the frames but still logs and counts) and `protect` (drops them silently, telling you nothing, which is why it is nearly always the wrong choice).',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 540, y: 210, type: 'switch', label: 'SW1', sub: t > 0.5 ? 'Fa0/4 err-disabled' : 'Fa0/4 up', accent: t > 0.5 ? ERR : OK, pulse: true },
          { id: 'bad', x: 180, y: 210, type: 'laptop', label: 'stranger', sub: 'AA:BB:CC:DD:EE:FF', accent: ERR },
        ],
        links: [{ id: 'a', from: 'bad', to: 'sw', state: t > 0.5 ? 'down' : 'up', flowing: t <= 0.5 }],
        packets:
          t < 0.5
            ? [{ id: 'p', from: 'bad', to: 'sw', t: 0.15 + ease(t / 0.5) * 0.7, color: ERR, label: 'a different MAC' }]
            : [],
      }),
      say: (t) =>
        t > 0.55 ? { nodeId: 'sw', text: H('એ MAC મેં યાદ નથી રાખ્યું', 'वह MAC मैंने याद नहीं रखा', 'that is not the MAC I remember') } : null,
      aside: (t) => ({
        title: H('ત્રણ વિકલ્પ', 'तीन विकल्प', 'The three responses'),
        head: ['mode', 'frame', 'log', 'port'],
        rows: [
          ['shutdown', 'dropped', 'yes', t > 0.5 ? 'err-disabled ←' : 'err-disabled'],
          ['restrict', 'dropped', 'yes', 'stays up'],
          ['protect', 'dropped', 'no', 'stays up'],
        ],
        notes: { 2: H('ચૂપ રહે એટલે તમને ખબર જ ન પડે', 'चुप रहे तो आपको पता ही न चले', 'it stays silent, so you never find out') },
      }),
    },
    {
      ms: 3000,
      label: H('બંધ થયેલો port પાછો ચાલુ', 'बंद हुआ port वापस चालू', 'Bringing a shut port back'),
      text: {
        beginner: {
          gu: 'Err-disabled port જાતે પાછો નથી આવતો. કોઈએ જઈને `shutdown` પછી `no shutdown` કરવું પડે. નાના નેટવર્કમાં એ બરાબર છે — તમને ખબર પડે કે કશુંક થયું. પણ સો port હોય તો દર વખતે જવું ભારે પડે, એટલે timer મૂકી શકાય.',
          hi: 'Err-disabled port खुद वापस नहीं आता। किसी को जाकर `shutdown` फिर `no shutdown` करना पड़े। छोटे network में यह ठीक है — आपको पता चले कि कुछ हुआ। पर सौ port हों तो हर बार जाना भारी, तो timer लगा सकते हैं।',
          en: 'An err-disabled port does not come back on its own. Somebody has to go and issue `shutdown` then `no shutdown`. In a small network that is fine — it makes sure you hear about it. With a hundred ports it gets heavy, so you can set a timer instead.',
        },
        exam: {
          gu: '`errdisable recovery cause psecure-violation` અને `errdisable recovery interval 300`. તપાસવા: `show port-security interface <x>` — છેલ્લું violation કયા MAC થી થયું એ પણ દેખાય.',
          hi: '`errdisable recovery cause psecure-violation` और `errdisable recovery interval 300`। जांचें: `show port-security interface <x>` — आखिरी violation किस MAC से हुआ यह भी दिखे।',
          en: '`errdisable recovery cause psecure-violation` with `errdisable recovery interval 300`. Check with `show port-security interface <x>`, which also names the MAC that caused the last violation.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 430, y: 210, type: 'switch', label: 'SW1', sub: t > 0.55 ? 'Fa0/4 up again' : 'Fa0/4 err-disabled', accent: t > 0.55 ? OK : ERR, pulse: true },
          { id: 'pc', x: 150, y: 210, type: 'pc', label: 'the real PC', sub: t > 0.55 ? 'back on' : 'still cut off', accent: t > 0.55 ? OK : MUTE },
          { id: 'adm', x: 730, y: 310, type: 'laptop', label: 'admin', sub: t > 0.35 ? 'shut / no shut' : undefined, accent: t > 0.35 ? OK : MUTE },
        ],
        links: [
          { id: 'a', from: 'pc', to: 'sw', state: t > 0.55 ? 'up' : 'down', flowing: t > 0.55 },
          { id: 'b', from: 'adm', to: 'sw', state: 'up', flowing: t > 0.35 },
        ],
      }),
    },
    {
      ms: 2800,
      label: H('ક્યાં લગાવવું, ક્યાં નહીં', 'कहां लगाएं, कहां नहीं', 'Where it belongs, and where it does not'),
      text: {
        beginner: {
          gu: 'Port security **વપરાશકર્તાના port** માટે છે — ટેબલ, સ્વાગત કક્ષ, સભાખંડ. Switch થી switch જતી trunk પર એ કદી ન લગાવવું: ત્યાં તો સેંકડો MAC સરનામાં આવવાનાં જ છે, અને તમે તમારો જ uplink બંધ કરી બેસશો.',
          hi: 'Port security **उपयोगकर्ता के port** के लिए है — डेस्क, स्वागत कक्ष, सभा कक्ष। Switch से switch जाती trunk पर कभी न लगाएं: वहां तो सैकड़ों MAC पते आने ही हैं, और आप अपना ही uplink बंद कर बैठेंगे।',
          en: 'Port security is for **user ports** — desks, reception, meeting rooms. Never put it on a trunk between switches: hundreds of MAC addresses are supposed to arrive there, and you will shut down your own uplink.',
        },
        exam: {
          gu: 'IP Phone વાળા port પર `maximum 2` જોઈએ (ફોન + એની પાછળનો PC) — કે voice VLAN માટે `maximum 3`. એક જ ભૂલથી આખા માળનો ફોન બંધ થઈ શકે.',
          hi: 'IP Phone वाले port पर `maximum 2` चाहिए (फोन + उसके पीछे का PC) — या voice VLAN के लिए `maximum 3`। एक ही गलती से पूरे floor का फोन बंद हो सकता है।',
          en: 'A port with an IP phone needs `maximum 2` for the phone and the PC behind it, or 3 where a voice VLAN is involved. One slip here takes the phones off an entire floor.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'u', x: 130, y: 110, type: 'pc', label: 'desk', sub: 'port security ✓', accent: OK },
          { id: 'ph', x: 130, y: 320, type: 'pc', label: 'IP phone + PC', sub: 'maximum 2', accent: WARN },
          { id: 'sw', x: 450, y: 215, type: 'switch', label: 'SW1', accent: CCNA, pulse: true },
          { id: 'up', x: 760, y: 215, type: 'switch', label: 'uplink trunk', sub: 'never here ✕', accent: ERR },
        ],
        links: [
          { id: 'a', from: 'u', to: 'sw', state: 'up' },
          { id: 'b', from: 'ph', to: 'sw', state: 'up' },
          { id: 'c', from: 'sw', to: 'up', state: 'up', flowing: true },
        ],
      }),
      aside: () => ({
        title: H('Maximum કેટલું', 'Maximum कितना', 'What maximum to use'),
        head: ['port', 'maximum'],
        rows: [
          ['one PC at a desk', '1'],
          ['IP phone with a PC', '2 (or 3 with a voice VLAN)'],
          ['a trunk to another switch', 'do not enable it at all'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Port security એ access port પર તાળું છે: **કેટલાં** MAC અને **કયાં**. `sticky` થી પહેલું MAC જાતે શીખાય. Violation થાય તો default `shutdown` — port err-disabled, અને કોઈએ જઈને ચાલુ કરવો પડે. `protect` ચૂપ રહે એટલે લગભગ કદી ન વાપરવું. અને **trunk પર કદી નહીં**.',
    hi: 'Port security access port पर ताला है: **कितने** MAC और **कौन से**। `sticky` से पहला MAC खुद सीखे। Violation हो तो default `shutdown` — port err-disabled, और किसी को जाकर चालू करना पड़े। `protect` चुप रहे तो लगभग कभी न वापरें। और **trunk पर कभी नहीं**।',
    en: 'Port security is a lock on an access port: **how many** MACs and **which ones**. `sticky` learns the first one for you. A violation triggers the default `shutdown`, leaving the port err-disabled until somebody brings it back. Avoid `protect`, which tells you nothing. And **never on a trunk**.',
  },
  check: {
    q: H(
      'ટેબલ પર IP phone છે અને એની પાછળ PC. `maximum 1` રાખો તો?',
      'डेस्क पर IP phone है और उसके पीछे PC। `maximum 1` रखें तो?',
      'A desk has an IP phone with a PC behind it. What happens if you leave `maximum 1`?',
    ),
    options: [
      H('બીજું ઉપકરણ violation ગણાશે અને port બંધ થશે', 'दूसरा उपकरण violation माना जाएगा और port बंद होगा', 'The second device is a violation and the port shuts'),
      H('બંને ચાલશે — ફોન ગણાતો નથી', 'दोनों चलेंगे — फोन गिना नहीं जाता', 'Both work — a phone does not count'),
      H('PC ચાલશે, ફોન નહીં', 'PC चलेगा, फोन नहीं', 'The PC works and the phone does not'),
    ],
    answer: 0,
    explain: H(
      'Switch માટે ફોન અને PC બંને અલગ MAC સરનામાં છે. બીજું દેખાતાં જ violation — અને default mode માં port err-disabled. એટલે ફોન વાળા port પર `maximum 2` (કે voice VLAN સાથે 3).',
      'Switch के लिए फोन और PC दोनों अलग MAC पते हैं। दूसरा दिखते ही violation — और default mode में port err-disabled। इसलिए फोन वाले port पर `maximum 2` (या voice VLAN के साथ 3)।',
      'To the switch the phone and the PC are two separate MAC addresses. The second one is a violation, and in the default mode the port goes err-disabled. So a phone port needs `maximum 2`, or 3 with a voice VLAN.',
    ),
  },
}

/* ═══════════════════ n5l4 · DHCP snooping and DAI ═══════════════════ */

export const n5l4: LessonSpec = {
  why: {
    gu: 'DHCP અને ARP બંને **ભરોસા પર** બનેલા છે: જે જવાબ આપે એના પર વિશ્વાસ. એ ભરોસો તોડવો સહેલો છે, અને તોડનાર તમારો આખો traffic પોતાના થઈને પસાર કરાવી શકે — કોઈને ખબર પડ્યા વગર.',
    hi: 'DHCP और ARP दोनों **भरोसे पर** बने हैं: जो जवाब दे उस पर विश्वास। वह भरोसा तोड़ना आसान है, और तोड़ने वाला आपका सारा traffic अपने होकर गुजारा सकता है — किसी को पता चले बिना।',
    en: 'DHCP and ARP are both built on **trust**: believe whoever answers. That trust is easy to break, and whoever breaks it can route your entire traffic through themselves — without anyone noticing.',
  },
  steps: [
    {
      ms: 3200,
      label: H('નકલી DHCP server', 'नकली DHCP server', 'The rogue DHCP server'),
      text: {
        beginner: {
          gu: 'PC જાગે અને બૂમ પાડે "કોઈ મને સરનામું આપશે?" — આખા VLAN માં. ખરો server જવાબ આપે, પણ હુમલાખોરનો લેપટોપ પણ આપી શકે. અને PC **જે પહેલો આવે** એને માને. હુમલાખોર નજીક હોય તો એ જ જીતે.',
          hi: 'PC जागे और चिल्लाए "कोई मुझे पता देगा?" — पूरे VLAN में। असली server जवाब दे, पर हमलावर का लैपटॉप भी दे सकता है। और PC **जो पहले आए** उसे माने। हमलावर पास हो तो वही जीते।',
          en: 'A PC wakes up and shouts "will anyone give me an address?" across the whole VLAN. The real server answers — but so can an attacker’s laptop. And the PC believes **whichever arrives first**. Sitting closer, the attacker usually wins.',
        },
        exam: {
          gu: 'DHCP DISCOVER એ broadcast છે, એટલે VLAN માં બધા સાંભળે. Client પહેલો OFFER સ્વીકારે — કોઈ ચકાસણી નથી, કોઈ સહી નથી.',
          hi: 'DHCP DISCOVER broadcast है, तो VLAN में सब सुनें। Client पहला OFFER स्वीकार करे — कोई जांच नहीं, कोई हस्ताक्षर नहीं।',
          en: 'The DHCP DISCOVER is a broadcast, so the whole VLAN hears it, and the client takes the first OFFER. There is no verification and no signature anywhere in that exchange.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc', x: 130, y: 210, type: 'pc', label: 'PC1', accent: BEG, pulse: t < 0.3 },
          { id: 'sw', x: 420, y: 210, type: 'switch', label: 'SW1', accent: CCNA },
          { id: 'srv', x: 740, y: 90, type: 'server', label: 'real DHCP', accent: OK },
          { id: 'bad', x: 740, y: 330, type: 'laptop', label: 'rogue', sub: t > 0.5 ? 'answered first' : undefined, accent: ERR, pulse: t > 0.5 },
        ],
        links: [
          { id: 'a', from: 'pc', to: 'sw', state: 'up', flowing: true },
          { id: 'b', from: 'sw', to: 'srv', state: 'up', flowing: t < 0.5 },
          { id: 'c', from: 'sw', to: 'bad', state: 'up', flowing: t > 0.35 },
        ],
        packets:
          t < 0.35
            ? [{ id: 'd', from: 'pc', to: 'sw', t: 0.15 + ease(t / 0.35) * 0.7, color: 'var(--nq-pkt-dns)', label: 'anyone? (broadcast)' }]
            : [{ id: 'o', from: 'bad', to: 'pc', t: 0.15 + ease((t - 0.35) / 0.65) * 0.7, color: ERR, label: 'gateway = me' }],
      }),
    },
    {
      ms: 3200,
      label: H('વચ્ચે બેસી જવું', 'बीच में बैठ जाना', 'Sitting in the middle'),
      text: {
        beginner: {
          gu: 'નકલી server એ **પોતાનું સરનામું gateway તરીકે** આપ્યું. હવે PC બહાર જવા માટેનું બધું એને જ મોકલશે. એ વાંચે, પછી ખરા gateway ને આગળ મોકલે — બધું **ચાલતું રહે**, એટલે કોઈને શંકા પણ ન જાય. એને man-in-the-middle કહે છે.',
          hi: 'नकली server ने **अपना पता gateway के रूप में** दिया। अब PC बाहर जाने के लिए सब कुछ उसे ही भेजेगा। वह पढ़े, फिर असली gateway को आगे भेजे — सब कुछ **चलता रहे**, तो किसी को शक भी न हो। इसे man-in-the-middle कहते हैं।',
          en: 'The rogue server handed out **its own address as the gateway**. Now everything the PC sends outward goes to it first. It reads it, then forwards it to the real gateway — so everything **keeps working**, and nobody suspects a thing. This is a man-in-the-middle.',
        },
        exam: {
          gu: 'એ જ રીતે DNS server પણ પોતાનો આપી શકે, એટલે નામ પણ એ નક્કી કરે. લક્ષણ: `ipconfig` માં અજાણ્યું gateway, કે traceroute માં વધારાનો hop.',
          hi: 'उसी तरह DNS server भी अपना दे सकता है, तो नाम भी वही तय करे। लक्षण: `ipconfig` में अनजान gateway, या traceroute में अतिरिक्त hop।',
          en: 'The same offer can set the DNS server too, which hands over control of names as well. The symptoms are an unfamiliar gateway in `ipconfig`, or an extra hop in a traceroute.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc', x: 120, y: 210, type: 'pc', label: 'PC1', sub: 'gw = the rogue', accent: WARN },
          { id: 'bad', x: 420, y: 210, type: 'laptop', label: 'attacker', sub: 'reading everything', accent: ERR, pulse: true },
          { id: 'gw', x: 740, y: 210, type: 'router', label: 'real gateway', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'pc', to: 'bad', state: 'up', flowing: true },
          { id: 'b', from: 'bad', to: 'gw', state: 'up', flowing: true },
        ],
        packets: [
          { id: 'p', from: 'pc', to: 'bad', t: 0.15 + ease(Math.min(1, t)) * 0.3, color: ERR, label: 'password…' },
          ...(t > 0.5 ? [{ id: 'q', from: 'bad', to: 'gw', t: 0.15 + ease((t - 0.5) / 0.5) * 0.7, color: WARN, label: 'forwarded on' }] : []),
        ],
      }),
      say: (t) => (t > 0.6 ? { nodeId: 'pc', text: H('બધું બરાબર ચાલે છે…', 'सब ठीक चल रहा है…', 'everything seems fine…') } : null),
    },
    {
      ms: 3200,
      label: H('DHCP snooping — કયા port પરથી જવાબ ચાલે', 'DHCP snooping — किस port से जवाब चले', 'DHCP snooping — which ports may answer'),
      text: {
        beginner: {
          gu: 'ઉપાય સાદો છે. Switch ને કહો કે DHCP નો **જવાબ** ફક્ત અમુક port પરથી આવી શકે — જ્યાં ખરો server છે. બાકી બધા port "untrusted": ત્યાંથી સવાલ આવે તો ચાલે, પણ **જવાબ આવે તો ફેંકી દો**.',
          hi: 'उपाय सीधा है। Switch को बताएं कि DHCP का **जवाब** केवल कुछ port से आ सकता है — जहां असली server है। बाकी सारे port "untrusted": वहां से सवाल आए तो चले, पर **जवाब आए तो फेंक दें**।',
          en: 'The fix is simple. Tell the switch that DHCP **replies** may only arrive on certain ports — the ones where the real server lives. Every other port is untrusted: questions from there are fine, but **an answer gets thrown away**.',
        },
        exam: {
          gu: '`ip dhcp snooping`, `ip dhcp snooping vlan <n>`, અને server/uplink તરફના port પર `ip dhcp snooping trust`. Untrusted port પરથી આવતા OFFER, ACK અને NAK ફેંકાય.',
          hi: '`ip dhcp snooping`, `ip dhcp snooping vlan <n>`, और server/uplink की तरफ के port पर `ip dhcp snooping trust`। Untrusted port से आते OFFER, ACK और NAK फेंक दिए जाएं।',
          en: 'Enable with `ip dhcp snooping` and `ip dhcp snooping vlan <n>`, then `ip dhcp snooping trust` on the ports facing the server or uplink. OFFER, ACK and NAK arriving on an untrusted port are discarded.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'pc', x: 130, y: 210, type: 'pc', label: 'PC1', accent: BEG },
          { id: 'sw', x: 430, y: 210, type: 'switch', label: 'SW1', sub: t > 0.3 ? 'snooping on' : undefined, accent: t > 0.3 ? OK : CCNA, pulse: t > 0.3 },
          { id: 'srv', x: 740, y: 90, type: 'server', label: 'real DHCP', sub: 'trusted port', accent: OK },
          { id: 'bad', x: 740, y: 330, type: 'laptop', label: 'rogue', sub: t > 0.5 ? 'reply dropped ✕' : 'untrusted port', accent: t > 0.5 ? MUTE : ERR },
        ],
        links: [
          { id: 'a', from: 'pc', to: 'sw', state: 'up', flowing: true },
          { id: 'b', from: 'sw', to: 'srv', state: 'up', flowing: true },
          { id: 'c', from: 'sw', to: 'bad', state: t > 0.5 ? 'idle' : 'up', flowing: t <= 0.5 },
        ],
        packets:
          t > 0.4
            ? [{ id: 'x', from: 'bad', to: 'sw', t: 0.72, color: t > 0.5 ? ERR : WARN, label: t > 0.5 ? 'dropped ✕' : 'gateway = me' }]
            : [],
      }),
      aside: () => ({
        title: H('Port ને બે ભાગમાં વહેંચો', 'Port को दो भागों में बांटें', 'Two kinds of port'),
        head: ['port faces', 'trust', 'may send a DHCP reply'],
        rows: [
          ['the DHCP server', 'trusted', 'yes'],
          ['another switch (uplink)', 'trusted', 'yes'],
          ['a user', 'untrusted', 'no — dropped'],
        ],
      }),
    },
    {
      ms: 3400,
      label: H('એ જ યાદી ARP માટે — DAI', 'वही सूची ARP के लिए — DAI', 'The same list, for ARP — DAI'),
      text: {
        beginner: {
          gu: 'બીજો હુમલો ARP થી થાય: "gateway નું MAC મારું છે" એમ ખોટું કહેવું. પણ snooping ચાલુ હોય ત્યારે switch એ **દરેક સરનામું કોને અપાયું એની યાદી** બનાવતું હોય છે. DAI એ જ યાદી વાપરે: ARP નો દાવો યાદી સાથે મેળ ન ખાય તો frame ફેંકી દે.',
          hi: 'दूसरा हमला ARP से हो: "gateway का MAC मेरा है" ऐसा झूठ। पर snooping चालू हो तो switch एक **सूची बनाता है कि कौन सा पता किसे दिया गया**। DAI वही सूची वापरे: ARP का दावा सूची से मेल न खाए तो frame फेंक दे।',
          en: 'The other attack comes through ARP: claiming falsely that "the gateway’s MAC is mine". But with snooping on, the switch has been keeping **a list of which address went to whom**. DAI uses that same list: an ARP claim that does not match it is discarded.',
        },
        exam: {
          gu: '`ip arp inspection vlan <n>`. DAI snooping binding table પર **આધાર રાખે** — એટલે DHCP snooping પહેલાં જોઈએ જ. Static IP વાળાં ઉપકરણો માટે ARP ACL જાતે લખવી પડે.',
          hi: '`ip arp inspection vlan <n>`। DAI snooping binding table पर **निर्भर करता है** — तो DHCP snooping पहले चाहिए ही। Static IP वाले उपकरणों के लिए ARP ACL हाथ से लिखना पड़े।',
          en: '`ip arp inspection vlan <n>`. DAI **depends on** the snooping binding table, so DHCP snooping has to be in place first. Statically addressed devices need an ARP ACL written by hand.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'sw', x: 430, y: 210, type: 'switch', label: 'SW1', sub: t > 0.45 ? 'checks the list' : undefined, accent: OK, pulse: t > 0.45 },
          { id: 'bad', x: 130, y: 300, type: 'laptop', label: 'attacker', sub: t > 0.55 ? 'frame dropped ✕' : undefined, accent: ERR },
          { id: 'gw', x: 740, y: 150, type: 'router', label: 'real gateway', accent: CCNA },
        ],
        links: [
          { id: 'a', from: 'bad', to: 'sw', state: t > 0.55 ? 'down' : 'up', flowing: t <= 0.55 },
          { id: 'b', from: 'sw', to: 'gw', state: 'up', flowing: true },
        ],
        packets:
          t < 0.55
            ? [{ id: 'p', from: 'bad', to: 'sw', t: 0.15 + ease(t / 0.55) * 0.7, color: ERR, label: 'I am 10.1.1.1' }]
            : [],
      }),
      aside: (t) => ({
        title: H('Snooping ની યાદી', 'Snooping की सूची', 'The snooping binding table'),
        caption: H('DHCP એ બનાવી, DAI એ વાપરે.', 'DHCP ने बनाई, DAI वापरे।', 'DHCP built it; DAI reads it.'),
        head: ['MAC', 'got this IP', 'on port'],
        rows: [
          ['00:1A:2B:…:5E', '10.1.1.50', 'Fa0/4'],
          ['00:4F:9C:…:11', '10.1.1.51', 'Fa0/5'],
          ...(t > 0.5 ? [['AA:BB:CC:…:FF', 'claims 10.1.1.1 — not in the list', 'Fa0/9 ✕']] : []),
        ],
      }),
    },
    {
      ms: 2800,
      label: H('ક્રમ મહત્વનો છે', 'क्रम महत्वपूर्ण है', 'The order matters'),
      text: {
        beginner: {
          gu: 'બે વાત યાદ રાખો. પહેલી: **DHCP snooping પહેલાં**, DAI પછી — કારણ કે DAI એની યાદી પર જ જીવે છે. બીજી: uplink ને trusted કરવાનું ભૂલશો નહીં, નહીં તો બીજા switch પરના બધા લોકોને સરનામું મળવાનું જ બંધ થઈ જશે.',
          hi: 'दो बातें याद रखें। पहली: **DHCP snooping पहले**, DAI बाद में — क्योंकि DAI उसकी सूची पर ही जीता है। दूसरी: uplink को trusted करना न भूलें, वरना दूसरे switch के सारे लोगों को पता मिलना ही बंद हो जाएगा।',
          en: 'Two things to hold on to. First, **DHCP snooping goes in before** DAI, because DAI lives off its table. Second, do not forget to trust the uplink, or everyone behind the next switch simply stops getting addresses.',
        },
        exam: {
          gu: 'Port security (MAC), DHCP snooping (સરનામું કોણ આપે), DAI (ARP નો દાવો) — ત્રણે access layer પર સાથે ચાલે અને એકબીજાને પૂરક છે. આ ત્રણને મળીને Layer 2 hardening કહે છે.',
          hi: 'Port security (MAC), DHCP snooping (पता कौन दे), DAI (ARP का दावा) — तीनों access layer पर साथ चलें और एक-दूसरे के पूरक हैं। इन तीनों को मिलाकर Layer 2 hardening कहते हैं।',
          en: 'Port security (the MAC), DHCP snooping (who may hand out addresses) and DAI (who may claim one) all run together at the access layer and complement each other. Together they are what people mean by Layer 2 hardening.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 180, y: 110, type: 'switch', label: '1 · DHCP snooping', sub: 'builds the list', accent: OK },
          { id: 'b', x: 180, y: 320, type: 'switch', label: '2 · DAI', sub: 'reads the list', accent: CCNA },
          { id: 'c', x: 600, y: 215, type: 'switch', label: 'access switch', sub: 'both, plus port security', accent: CCNP, pulse: true },
        ],
        links: [
          { id: 'x', from: 'a', to: 'c', state: 'up', flowing: true },
          { id: 'y', from: 'b', to: 'c', state: 'up', flowing: true },
        ],
      }),
      aside: () => ({
        title: H('ત્રણ તાળાં, એક જ જગ્યાએ', 'तीन ताले, एक ही जगह', 'Three locks, one place'),
        head: ['feature', 'stops'],
        rows: [
          ['Port security', 'an unknown device plugging in'],
          ['DHCP snooping', 'a fake server handing out addresses'],
          ['DAI', 'a fake claim to be the gateway'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'DHCP અને ARP બંને જે બોલે એને માની લે છે. DHCP snooping કહે છે કે **જવાબ** ફક્ત trusted port પરથી જ ચાલે — અને સાથે સાથે "કયું MAC, કયું IP, કયા port પર" ની યાદી બનાવે. DAI એ જ યાદી વાપરીને ખોટા ARP દાવા ફેંકે. એટલે **snooping પહેલાં, DAI પછી**.',
    hi: 'DHCP और ARP दोनों जो बोले उसे मान लेते हैं। DHCP snooping कहता है कि **जवाब** केवल trusted port से ही चले — और साथ-साथ "कौन सा MAC, कौन सा IP, किस port पर" की सूची बनाए। DAI वही सूची वापरकर गलत ARP दावे फेंके। तो **snooping पहले, DAI बाद में**।',
    en: 'DHCP and ARP both believe whatever they are told. DHCP snooping says **replies** may only come from trusted ports, and while doing so it builds a list of which MAC holds which IP on which port. DAI reads that list to throw out false ARP claims. So: **snooping first, DAI second**.',
  },
  check: {
    q: H(
      'DHCP snooping ચાલુ કર્યું અને બીજા switch પાછળના બધા વપરાશકર્તાઓને સરનામું મળવાનું બંધ થયું. શું ભૂલાયું?',
      'DHCP snooping चालू किया और दूसरे switch के पीछे के सारे उपयोगकर्ताओं को पता मिलना बंद हो गया। क्या भूल गए?',
      'You turned on DHCP snooping and everyone behind the next switch stopped getting addresses. What was missed?',
    ),
    options: [
      H('Uplink port ને `trust` કરવાનું', 'Uplink port को `trust` करना', 'Marking the uplink port as `trust`'),
      H('DAI પહેલાં ચાલુ કરવાનું', 'DAI पहले चालू करना', 'Turning on DAI first'),
      H('DHCP server નું સરનામું બદલવાનું', 'DHCP server का पता बदलना', 'Changing the DHCP server’s address'),
    ],
    answer: 0,
    explain: H(
      'Snooping ચાલુ કરતાં **બધા port untrusted** બની જાય. Server નો જવાબ uplink થઈને આવે છે, એટલે એ port trusted ન હોય તો એ જવાબ ફેંકાઈ જાય — અને એ બાજુના બધા સરનામા વગર રહી જાય.',
      'Snooping चालू करते ही **सारे port untrusted** बन जाएं। Server का जवाब uplink से आता है, तो वह port trusted न हो तो जवाब फेंक दिया जाए — और वह बाजू के सारे पते बिना रह जाएं।',
      'Enabling snooping makes **every port untrusted**. The server’s reply arrives over the uplink, so unless that port is trusted the reply is discarded and everyone on the far side is left without an address.',
    ),
  },
}

/* ═══════════════════ n5l5 · wireless security and VPNs ═══════════════════ */

export const n5l5: LessonSpec = {
  why: {
    gu: 'તાર પર traffic ચોરવા માટે ઇમારતમાં ઘૂસવું પડે. હવામાં એ **પાર્કિંગમાં બેઠાં બેઠાં** થઈ શકે. એ જ સવાલ બે જગ્યાએ આવે છે — Wi-Fi પર, અને ઇન્ટરનેટ પર બે ઓફિસ જોડતી વખતે. જવાબ પણ એક જ છે: encryption.',
    hi: 'तार पर traffic चुराने के लिए इमारत में घुसना पड़े। हवा में यह **पार्किंग में बैठे-बैठे** हो सकता है। यही सवाल दो जगहों पर आता है — Wi-Fi पर, और internet पर दो ऑफिस जोड़ते समय। जवाब भी एक ही है: encryption।',
    en: 'Stealing traffic from a cable means getting into the building. From the air it can be done **from the car park**. The same question comes up twice — on Wi-Fi, and when joining two offices across the internet. The answer is the same both times: encryption.',
  },
  steps: [
    {
      ms: 3000,
      label: H('હવા બધા માટે ખુલ્લી છે', 'हवा सबके लिए खुली है', 'The air is open to everyone'),
      text: {
        beginner: {
          gu: 'AP જે મોકલે એ **દરેક** સાંભળી શકે જે રેન્જમાં હોય — તમે એને કેબલની જેમ અમુક જગ્યાએ મર્યાદિત કરી શકતા નથી. ખુલ્લા (open) Wi-Fi પર એટલે દરેક packet વાંચી શકાય. Encryption વગર hotel નું Wi-Fi એટલે જાહેરમાં બોલવું.',
          hi: 'AP जो भेजे वह **हर कोई** सुन सके जो range में हो — आप उसे cable की तरह किसी जगह सीमित नहीं कर सकते। खुले (open) Wi-Fi पर यानी हर packet पढ़ा जा सके। Encryption बिना hotel का Wi-Fi यानी सार्वजनिक रूप से बोलना।',
          en: 'Whatever the AP sends, **everyone** in range can hear — you cannot confine it to a place the way a cable does. On open Wi-Fi that means every packet is readable. Without encryption, hotel Wi-Fi is speaking out loud in public.',
        },
        exam: {
          gu: 'WEP તૂટેલું છે (મિનિટોમાં), WPA અને TKIP પણ. આજે WPA2 (AES-CCMP) લઘુત્તમ છે, અને WPA3 પસંદગીનું.',
          hi: 'WEP टूटा है (मिनटों में), WPA और TKIP भी। आज WPA2 (AES-CCMP) न्यूनतम है, और WPA3 पसंदीदा।',
          en: 'WEP is broken (in minutes), and so are WPA and TKIP. WPA2 with AES-CCMP is today’s minimum, and WPA3 the preference.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ap', x: 420, y: 180, type: 'ap', label: 'open Wi-Fi', accent: ERR, pulse: true },
          { id: 'u', x: 150, y: 300, type: 'laptop', label: 'guest', accent: BEG },
          { id: 'spy', x: 730, y: 320, type: 'laptop', label: 'the car park', sub: t > 0.4 ? 'reading it all' : undefined, accent: t > 0.4 ? ERR : MUTE, pulse: t > 0.4 },
        ],
        links: [
          { id: 'a', from: 'u', to: 'ap', state: 'up', flowing: true },
          { id: 'b', from: 'ap', to: 'spy', state: t > 0.35 ? 'up' : 'idle', flowing: t > 0.35 },
        ],
        packets:
          t > 0.35
            ? [{ id: 'p', from: 'ap', to: 'spy', t: 0.15 + ease((t - 0.35) / 0.65) * 0.7, color: ERR, label: 'readable' }]
            : [],
      }),
    },
    {
      ms: 3200,
      label: H('એક password કે દરેકનો પોતાનો', 'एक password या हर एक का अपना', 'One password, or one each'),
      text: {
        beginner: {
          gu: 'WPA2 ની બે રીત છે. **Personal** — એક જ password બધા જાણે. ઘર માટે ઠીક, પણ ઓફિસમાં કોઈ નોકરી છોડે તો બધાનું બદલવું પડે. **Enterprise** — દરેક પોતાના username/password થી જોડાય, અને એ AAA server ચકાસે. એક વ્યક્તિ જાય તો એક entry ભૂંસો, બસ.',
          hi: 'WPA2 के दो तरीके हैं। **Personal** — एक ही password सब जानें। घर के लिए ठीक, पर ऑफिस में कोई नौकरी छोड़े तो सबका बदलना पड़े। **Enterprise** — हर कोई अपने username/password से जुड़े, और AAA server जांचे। एक व्यक्ति जाए तो एक entry मिटा दें, बस।',
          en: 'WPA2 comes two ways. **Personal**: one password everybody knows. Fine at home, but in an office one person leaving means changing it for everyone. **Enterprise**: each person joins with their own username and password, checked by an AAA server. Somebody leaves, you delete one entry, done.',
        },
        exam: {
          gu: 'Personal = PSK (pre-shared key). Enterprise = 802.1X, જેમાં supplicant (client), authenticator (AP/switch) અને authentication server (RADIUS). EAP એ એમની વચ્ચેની ભાષા.',
          hi: 'Personal = PSK (pre-shared key)। Enterprise = 802.1X, जिसमें supplicant (client), authenticator (AP/switch) और authentication server (RADIUS)। EAP उनके बीच की भाषा।',
          en: 'Personal is a PSK, a pre-shared key. Enterprise is 802.1X, with a supplicant (the client), an authenticator (the AP or switch) and an authentication server (RADIUS). EAP is the language between them.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'u', x: 130, y: 210, type: 'laptop', label: 'tejas', accent: BEG },
          { id: 'ap', x: 400, y: 210, type: 'ap', label: 'AP', sub: t > 0.4 ? 'authenticator' : undefined, accent: CCNP },
          { id: 'aaa', x: 720, y: 210, type: 'server', label: 'RADIUS', sub: t > 0.5 ? 'checks each person' : undefined, accent: t > 0.5 ? OK : MUTE, pulse: t > 0.5 },
        ],
        links: [
          { id: 'a', from: 'u', to: 'ap', state: 'up', flowing: true },
          { id: 'b', from: 'ap', to: 'aaa', state: 'up', flowing: t > 0.4 },
        ],
        packets:
          t > 0.45
            ? [{ id: 'p', from: 'ap', to: 'aaa', t: 0.15 + ease((t - 0.45) / 0.55) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'is this really tejas?' }]
            : [],
      }),
      aside: () => ({
        title: H('બે રીત', 'दो तरीके', 'The two ways'),
        head: ['', 'Personal (PSK)', 'Enterprise (802.1X)'],
        rows: [
          ['credentials', 'one shared password', 'one per person'],
          ['somebody leaves', 'change it for everyone', 'delete one account'],
          ['suits', 'home, a small shop', 'any office'],
        ],
      }),
    },
    {
      ms: 3000,
      label: H('WPA3 શું સુધારે છે', 'WPA3 क्या सुधारता है', 'What WPA3 improves'),
      text: {
        beginner: {
          gu: 'WPA2-Personal માં એક નબળાઈ છે: હુમલાખોર જોડાણની શરૂઆત રેકોર્ડ કરી લે અને પછી **ઘરે બેસીને** password ગણતો રહે. WPA3 એ રીત બંધ કરે — દરેક અનુમાન માટે એણે ફરી live પ્રયત્ન કરવો પડે, એટલે ધીમો અને પકડાય એવો.',
          hi: 'WPA2-Personal में एक कमजोरी है: हमलावर जुड़ाव की शुरुआत रिकॉर्ड कर ले और फिर **घर बैठे** password गिनता रहे। WPA3 वह तरीका बंद करे — हर अनुमान के लिए उसे फिर live प्रयास करना पड़े, तो धीमा और पकड़ में आने वाला।',
          en: 'WPA2-Personal has a weakness: an attacker records the start of a session and then grinds away at the password **at home, offline**. WPA3 closes that off — every guess has to be made live against the AP, which is slow and noticeable.',
        },
        exam: {
          gu: 'WPA3-Personal માં SAE (Simultaneous Authentication of Equals) PSK ની જગ્યાએ. એ forward secrecy પણ આપે: password પછીથી મળે તોય જૂનું રેકોર્ડ કરેલું traffic ઉકલતું નથી. ખુલ્લા નેટવર્ક માટે OWE.',
          hi: 'WPA3-Personal में SAE (Simultaneous Authentication of Equals) PSK की जगह। यह forward secrecy भी देता है: password बाद में मिले तो भी पुराना रिकॉर्ड किया traffic नहीं खुलता। खुले network के लिए OWE।',
          en: 'WPA3-Personal replaces the PSK handshake with SAE, Simultaneous Authentication of Equals. It also gives forward secrecy: learning the password later does not decrypt traffic recorded earlier. For open networks there is OWE.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ap', x: 400, y: 190, type: 'ap', label: t > 0.45 ? 'WPA3' : 'WPA2', accent: t > 0.45 ? OK : WARN, pulse: true },
          { id: 'spy', x: 740, y: 310, type: 'laptop', label: 'attacker', sub: t > 0.45 ? 'must guess live — slow' : 'guessing offline', accent: t > 0.45 ? MUTE : ERR },
          { id: 'u', x: 140, y: 300, type: 'laptop', label: 'laptop', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'u', to: 'ap', state: 'up', flowing: true },
          { id: 'b', from: 'ap', to: 'spy', state: t > 0.45 ? 'idle' : 'up', flowing: t <= 0.45 },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('બે ઓફિસ, વચ્ચે ઇન્ટરનેટ', 'दो ऑफिस, बीच में internet', 'Two offices, internet in between'),
      text: {
        beginner: {
          gu: 'હવે એ જ સવાલ મોટા પાયે. મુંબઈ અને દિલ્હીની ઓફિસ જોડવી છે. ખાનગી લાઇન ભાડે લેવી મોંઘી છે, એટલે **ઇન્ટરનેટ** વાપરો — પણ ત્યાં તો બધું ખુલ્લું છે. VPN એ ઇન્ટરનેટની આરપાર એક **બંધ નળી** બનાવે: અંદર તમારો traffic, બહારથી ફક્ત અર્થહીન.',
          hi: 'अब वही सवाल बड़े पैमाने पर। मुंबई और दिल्ली की ऑफिस जोड़नी है। निजी line किराए पर महंगी है, तो **internet** वापरें — पर वहां तो सब खुला है। VPN internet के आर-पार एक **बंद नली** बनाए: अंदर आपका traffic, बाहर से केवल अर्थहीन।',
          en: 'Now the same question at scale. You need to join the Mumbai and Delhi offices. A private leased line is expensive, so you use **the internet** — where everything is in the open. A VPN builds a **sealed tube** across it: your traffic inside, meaningless from outside.',
        },
        exam: {
          gu: 'Site-to-site VPN IPsec વાપરે: IKE ચાવીઓ નક્કી કરે, ESP data encrypt કરે. બંને છેડે router/firewall, અને વપરાશકર્તાને કશી ખબર ન પડે — એમને એ બસ "ઓફિસનું નેટવર્ક" લાગે.',
          hi: 'Site-to-site VPN IPsec वापरे: IKE चाबियां तय करे, ESP data encrypt करे। दोनों छोर पर router/firewall, और उपयोगकर्ता को कुछ पता नहीं — उन्हें यह बस "ऑफिस का network" लगे।',
          en: 'A site-to-site VPN uses IPsec: IKE negotiates the keys and ESP encrypts the data. A router or firewall sits at each end and users never know — to them it is simply "the office network".',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'a', x: 130, y: 210, type: 'router', label: 'Mumbai', accent: CCNA },
          { id: 'net', x: 430, y: 210, type: 'cloud', label: 'internet', sub: t > 0.4 ? 'cannot read it' : 'wide open', accent: t > 0.4 ? MUTE : ERR },
          { id: 'b', x: 740, y: 210, type: 'router', label: 'Delhi', accent: CCNA },
        ],
        links: [
          { id: 'x', from: 'a', to: 'net', state: 'up', flowing: true, label: t > 0.4 ? 'IPsec' : undefined },
          { id: 'y', from: 'net', to: 'b', state: 'up', flowing: true, label: t > 0.4 ? 'IPsec' : undefined },
        ],
        packets: [
          { id: 'p', from: 'a', to: 'b', t: 0.15 + ease(Math.min(1, t)) * 0.7, color: t > 0.4 ? OK : ERR, label: t > 0.4 ? 'encrypted' : 'readable' },
        ],
      }),
    },
    {
      ms: 2800,
      label: H('ઘરેથી કામ કરનાર માટે', 'घर से काम करने वाले के लिए', 'For the person working from home'),
      text: {
        beginner: {
          gu: 'બીજી જાત: એક વ્યક્તિ, ઘરેથી. એના લેપટોપ પર VPN client ચાલે અને ઓફિસના firewall સાથે નળી બનાવે. પછી એનો લેપટોપ **જાણે ઓફિસમાં જ હોય** — એ જ સરનામાં, એ જ server, એ જ printer પણ.',
          hi: 'दूसरी किस्म: एक व्यक्ति, घर से। उसके लैपटॉप पर VPN client चले और ऑफिस के firewall के साथ नली बनाए। फिर उसका लैपटॉप **मानो ऑफिस में ही हो** — वही पते, वही server, वही printer भी।',
          en: 'The other kind: one person, at home. A VPN client on their laptop builds a tube to the office firewall. After that the laptop behaves **as though it were in the office** — same addressing, same servers, even the same printer.',
        },
        exam: {
          gu: 'Remote-access VPN મોટે ભાગે SSL/TLS (443) વાપરે, કારણ કે એ port લગભગ બધે ખુલ્લો હોય. Split tunnel માં ફક્ત ઓફિસનું traffic નળીમાં જાય; full tunnel માં બધું — વધુ સુરક્ષિત, પણ ઓફિસની લિંક પર ભાર.',
          hi: 'Remote-access VPN ज्यादातर SSL/TLS (443) वापरे, क्योंकि वह port लगभग हर जगह खुला होता है। Split tunnel में केवल ऑफिस का traffic नली में जाए; full tunnel में सब — ज्यादा सुरक्षित, पर ऑफिस की link पर भार।',
          en: 'Remote-access VPNs mostly use SSL/TLS on 443, because that port is open nearly everywhere. Split tunnelling sends only office traffic down the tube; full tunnelling sends everything — safer, but it loads the office link.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'h', x: 140, y: 300, type: 'laptop', label: 'home', sub: 'VPN client', accent: BEG, pulse: true },
          { id: 'net', x: 430, y: 200, type: 'cloud', label: 'internet', accent: MUTE },
          { id: 'fw', x: 700, y: 120, type: 'firewall', label: 'office firewall', accent: ERR },
          { id: 'srv', x: 740, y: 330, type: 'server', label: 'office server', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'h', to: 'net', state: 'up', flowing: true, label: 'TLS 443' },
          { id: 'b', from: 'net', to: 'fw', state: 'up', flowing: true },
          { id: 'c', from: 'fw', to: 'srv', state: 'up', flowing: true },
        ],
      }),
      aside: () => ({
        title: H('બે જાતના VPN', 'दो तरह के VPN', 'Two kinds of VPN'),
        head: ['kind', 'joins', 'usually'],
        rows: [
          ['site-to-site', 'office to office', 'IPsec, always on'],
          ['remote-access', 'one person to the office', 'TLS, on demand'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'હવા બધા માટે ખુલ્લી છે, એટલે WPA2 (AES) લઘુત્તમ અને WPA3 પસંદગીનું. ઘરે **Personal** (એક password), ઓફિસે **Enterprise** (802.1X — દરેકનો પોતાનો, RADIUS ચકાસે). અને ઇન્ટરનેટ પાર જવું હોય તો VPN: ઓફિસ-થી-ઓફિસ માટે IPsec, એકલા વપરાશકર્તા માટે TLS.',
    hi: 'हवा सबके लिए खुली है, तो WPA2 (AES) न्यूनतम और WPA3 पसंदीदा। घर में **Personal** (एक password), ऑफिस में **Enterprise** (802.1X — हर एक का अपना, RADIUS जांचे)। और internet पार जाना हो तो VPN: ऑफिस-से-ऑफिस के लिए IPsec, अकेले उपयोगकर्ता के लिए TLS।',
    en: 'The air is open to everyone, so WPA2 with AES is the minimum and WPA3 the preference. At home use **Personal** (one password); in an office use **Enterprise** (802.1X, one identity each, checked by RADIUS). And to cross the internet, a VPN: IPsec for office to office, TLS for a single person.',
  },
  check: {
    q: H(
      'ઓફિસમાં WPA2-Personal છે અને એક કર્મચારી નોકરી છોડે છે. શું કરવું પડે?',
      'ऑफिस में WPA2-Personal है और एक कर्मचारी नौकरी छोड़ता है। क्या करना पड़े?',
      'An office runs WPA2-Personal and an employee leaves. What has to happen?',
    ),
    options: [
      H('બધાનો password બદલવો — એ એક જ છે', 'सबका password बदलना — वह एक ही है', 'Change the password for everyone — there is only one'),
      H('ફક્ત એનું account ભૂંસવું', 'केवल उसका account मिटाना', 'Just delete that person’s account'),
      H('કશું નહીં — એ જાતે ભૂલી જશે', 'कुछ नहीं — वह खुद भूल जाएगा', 'Nothing — they will forget it'),
    ],
    answer: 0,
    explain: H(
      'Personal માં **એક જ** વહેંચાયેલું password છે, એટલે એને ભૂંસવાનો કોઈ રસ્તો નથી — બધાનું બદલવું પડે. એટલે જ ઓફિસમાં Enterprise (802.1X) વાપરવું, જ્યાં એક entry ભૂંસવાથી કામ પતે.',
      'Personal में **एक ही** साझा password है, तो उसे मिटाने का कोई तरीका नहीं — सबका बदलना पड़े। इसीलिए ऑफिस में Enterprise (802.1X) वापरें, जहां एक entry मिटाने से काम बन जाए।',
      'Personal has **one** shared password, so there is no way to revoke it for one person — everyone’s has to change. Which is exactly why offices use Enterprise (802.1X), where deleting a single account is enough.',
    ),
  },
}
