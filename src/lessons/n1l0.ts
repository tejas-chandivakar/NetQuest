import type { LessonSpec } from '../components/AnimatedLesson'
import type { ConfigureSpec } from '../components/ConfigureStage'
import { Network } from '../engine/network'

const CCNA = 'var(--nq-ccna)'
const H = (gu: string, hi: string, en: string) => ({ gu, hi, en })

/* ───────────────────────────── Learn ───────────────────────────── */

const term = (sub?: string) => ({
  id: 'r1',
  x: 430,
  y: 210,
  type: 'router' as const,
  label: 'R1',
  sub,
  accent: CCNA,
})

export const n1l0: LessonSpec = {
  why: {
    gu: 'અહીંથી આગળ દરેક પાઠમાં તમે terminal સામે બેસશો. એ કાળી સ્ક્રીન ડરામણી લાગે છે, પણ એમાં ફક્ત એક જ વિચાર છે: તમે અત્યારે કયા ઓરડામાં ઊભા છો. એ સમજાઈ જાય પછી બાકીનું બધું ફક્ત શબ્દો છે.',
    hi: 'यहां से आगे हर पाठ में आप terminal के सामने बैठेंगे। वह काली screen डरावनी लगती है, पर उसमें केवल एक ही विचार है: आप अभी किस कमरे में खड़े हैं। यह समझ आ जाए तो बाकी सब केवल शब्द हैं।',
    en: 'From here on, every lesson puts you at a terminal. That black screen looks forbidding, but it holds one idea only: which room you are standing in. Once that lands, the rest is just vocabulary.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'Prompt પોતે જ બોલે છે', hi: 'Prompt खुद ही बोलता है', en: 'The prompt is already telling you' },
      text: {
        beginner: {
          gu: 'સૌથી પહેલાં દેખાય છે: `R1>`. એમાં બે વાત છે. `R1` એ ઉપકરણનું નામ, અને `>` કહે છે કે તમે સૌથી બહારના ઓરડામાં છો — જ્યાં **જોઈ શકાય, બદલી ન શકાય**. એ એક ચિહ્ન જ તમારી અડધી ગૂંચવણ દૂર કરે છે.',
          hi: 'सबसे पहले दिखता है: `R1>`। इसमें दो बातें हैं। `R1` उपकरण का नाम, और `>` कहता है कि आप सबसे बाहर के कमरे में हैं — जहां **देख सकते हैं, बदल नहीं सकते**। यह एक चिह्न ही आपकी आधी उलझन दूर कर देता है।',
          en: 'The first thing you see is `R1>`. It carries two facts: `R1` is the device name, and `>` says you are in the outermost room, where you can **look but not change**. That one character answers half of the confusion people carry.',
        },
        exam: {
          gu: 'User EXEC mode. `>` એ સૌથી ઓછા અધિકારનું સ્તર છે — મર્યાદિત show commands, ping, traceroute. કોઈ configuration અહીંથી શક્ય નથી.',
          hi: 'User EXEC mode। `>` सबसे कम अधिकार का स्तर है — सीमित show commands, ping, traceroute। कोई configuration यहां से संभव नहीं।',
          en: 'User EXEC mode. The `>` is the lowest privilege level: limited show commands, ping and traceroute. No configuration is possible from here.',
        },
      },
      scene: () => ({ nodes: [term('R1>')] }),
      say: () => ({ nodeId: 'r1', text: H('હું જોવા દઉં, બદલવા નહીં', 'मैं देखने दूंगा, बदलने नहीं', 'I will let you look, not change') }),
      aside: () => ({
        title: H('Prompt વાંચો', 'Prompt पढ़ें', 'Reading the prompt'),
        caption: H('ચિહ્ન કહે છે તમે ક્યાં છો.', 'चिह्न कहता है आप कहां हैं।', 'The symbol says where you are standing.'),
        head: ['prompt', 'means'],
        rows: [['R1>', 'look only']],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'enable — તાળું ખોલો', hi: 'enable — ताला खोलो', en: 'enable — unlock it' },
      text: {
        beginner: {
          gu: '`enable` લખો અને `>` બદલાઈને `#` થઈ જાય. એ **હેશ** કહે છે કે હવે તાળું ખુલ્યું છે. હજી તમે કશું બદલ્યું નથી — પણ હવે બદલી શકો એમ છો. સાચા નેટવર્કમાં અહીં password પુછાય.',
          hi: '`enable` लिखें और `>` बदलकर `#` हो जाता है। वह **hash** कहता है कि अब ताला खुल गया। अभी आपने कुछ बदला नहीं — पर अब बदल सकते हैं। असली network में यहां password पूछा जाता है।',
          en: 'Type `enable` and the `>` turns into `#`. That **hash** means the lock is off. You still have not changed anything — but now you could. On a real device this is where a password is asked for.',
        },
        exam: {
          gu: 'Privileged EXEC mode. બધા show commands, `copy`, `reload`, debug. `enable secret` થી એને સુરક્ષિત રાખવું.',
          hi: 'Privileged EXEC mode। सभी show commands, `copy`, `reload`, debug। `enable secret` से इसे सुरक्षित रखें।',
          en: 'Privileged EXEC mode: every show command, plus copy, reload and debug. Protect it with `enable secret`.',
        },
      },
      scene: (t) => ({ nodes: [term(t > 0.45 ? 'R1#' : 'R1>')] }),
      say: (t) =>
        t > 0.45 ? { nodeId: 'r1', text: H('તાળું ખૂલ્યું', 'ताला खुला', 'Unlocked') } : null,
      aside: (t) => ({
        title: H('Prompt વાંચો', 'Prompt पढ़ें', 'Reading the prompt'),
        caption: H('`#` એટલે તાળું ખુલ્યું.', '`#` यानी ताला खुला।', 'A `#` means the lock is off.'),
        head: ['prompt', 'means'],
        rows:
          t > 0.45
            ? [
                ['R1>', 'look only'],
                ['R1#', 'unlocked'],
              ]
            : [['R1>', 'look only']],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'configure terminal — અંદરના ઓરડે', hi: 'configure terminal — अंदर के कमरे में', en: 'configure terminal — into the inner room' },
      text: {
        beginner: {
          gu: 'હવે `configure terminal` — કે ટૂંકમાં `conf t`. Prompt થાય `R1(config)#`. કૌંસમાં લખેલું જ તમને કહે છે કે **તમે ક્યાં ઊભા છો**. અહીંથી જે લખશો એ ખરેખર સેટિંગ બદલશે.',
          hi: 'अब `configure terminal` — या छोटे में `conf t`। Prompt होता है `R1(config)#`। कोष्ठक में लिखा हुआ ही आपको बताता है कि **आप कहां खड़े हैं**। यहां से जो लिखेंगे वह सच में setting बदलेगा।',
          en: 'Now `configure terminal`, or just `conf t`. The prompt becomes `R1(config)#`. Whatever sits in those brackets is **telling you where you are standing**. From here, what you type actually changes settings.',
        },
        exam: {
          gu: 'Global configuration mode. અહીંથી hostname, routing protocols, ACLs વગેરે. કૌંસ હંમેશા current mode દર્શાવે છે.',
          hi: 'Global configuration mode। यहां से hostname, routing protocols, ACLs वगैरह। कोष्ठक हमेशा current mode दर्शाते हैं।',
          en: 'Global configuration mode: hostname, routing protocols, ACLs and so on. The brackets always name the current mode.',
        },
      },
      scene: (t) => ({ nodes: [term(t > 0.4 ? 'R1(config)#' : 'R1#')] }),
      say: (t) => (t > 0.4 ? { nodeId: 'r1', text: H('હવે લખો એ લાગુ પડશે', 'अब लिखो वह लागू होगा', 'Now what you type sticks') } : null),
      aside: (t) => ({
        title: H('Prompt વાંચો', 'Prompt पढ़ें', 'Reading the prompt'),
        caption: H('કૌંસ હંમેશા ઓરડાનું નામ કહે છે.', 'कोष्ठक हमेशा कमरे का नाम बताते हैं।', 'The brackets always name the room.'),
        head: ['prompt', 'means'],
        rows: [
          ['R1>', 'look only'],
          ['R1#', 'unlocked'],
          ...(t > 0.4 ? [['R1(config)#', 'settings — changes stick']] : []),
        ],
      }),
    },
    {
      ms: 3000,
      label: { gu: 'ઓરડાની અંદર ઓરડો', hi: 'कमरे के अंदर कमरा', en: 'A room inside the room' },
      text: {
        beginner: {
          gu: 'એક પોર્ટ બદલવો હોય તો `interface Gi0/0` લખો — prompt થાય `R1(config-if)#`. હવે તમે **એ એક પોર્ટની અંદર** ઊભા છો, અને જે લખશો એ ફક્ત એને લાગુ પડશે. આ જ રીતે `(config-router)`, `(config-vlan)` આવે છે.',
          hi: 'एक port बदलना हो तो `interface Gi0/0` लिखें — prompt होता है `R1(config-if)#`। अब आप **उस एक port के अंदर** खड़े हैं, और जो लिखेंगे वह केवल उसे लागू होगा। इसी तरह `(config-router)`, `(config-vlan)` आते हैं।',
          en: 'To change one port, type `interface Gi0/0` and the prompt becomes `R1(config-if)#`. You are now standing **inside that one port**, and what you type applies only to it. The same pattern gives you `(config-router)` and `(config-vlan)`.',
        },
        exam: {
          gu: 'Sub-configuration modes. દરેકનો પોતાનો command set છે — global command અહીં નહીં ચાલે અને interface command global માં નહીં ચાલે.',
          hi: 'Sub-configuration modes। हर एक का अपना command set है — global command यहां नहीं चलेगा और interface command global में नहीं चलेगा।',
          en: 'Sub-configuration modes, each with its own command set: a global command will not run here, and an interface command will not run in global.',
        },
      },
      scene: (t) => ({ nodes: [term(t > 0.4 ? 'R1(config-if)#' : 'R1(config)#')] }),
      say: (t) => (t > 0.4 ? { nodeId: 'r1', text: H('હવે ફક્ત Gi0/0 ની વાત', 'अब केवल Gi0/0 की बात', 'Now only about Gi0/0') } : null),
      aside: () => ({
        title: H('ઓરડાની સીડી', 'कमरों की सीढ़ी', 'The ladder of rooms'),
        caption: H('દરેક પગથિયે prompt બદલાય છે.', 'हर सीढ़ी पर prompt बदलता है।', 'The prompt changes at every rung.'),
        head: ['prompt', 'where you are'],
        rows: [
          ['R1>', 'look only'],
          ['R1#', 'unlocked'],
          ['R1(config)#', 'the whole device'],
          ['R1(config-if)#', 'one port'],
          ['R1(config-router)#', 'one protocol'],
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'ભૂલ તમને શીખવે છે', hi: 'गलती आपको सिखाती है', en: 'The error is teaching you' },
      text: {
        beginner: {
          gu: 'ખોટી જગ્યાએ command લખો તો આવે: `% Invalid input detected at \'^\' marker.` પેલું **^ નિશાન જ્યાં છે ત્યાં જ ભૂલ છે** — એની પહેલાંનું બધું સાચું હતું. એટલે આ error ગુસ્સો નથી, આંગળી ચીંધવી છે.',
          hi: 'गलत जगह command लिखें तो आता है: `% Invalid input detected at \'^\' marker.` वह **^ निशान जहां है वहीं गलती है** — उससे पहले का सब सही था। इसलिए यह error गुस्सा नहीं, उंगली दिखाना है।',
          en: 'Put a command in the wrong room and you get `% Invalid input detected at \'^\' marker.` That **caret sits exactly where it stopped understanding** — everything before it was fine. The error is not a rebuke, it is a pointing finger.',
        },
        exam: {
          gu: '`% Invalid input` એટલે આ mode માં આ command નથી, કે argument ખોટો છે. `% Incomplete command` એટલે command સાચું પણ અધૂરું — `?` દબાવીને જુઓ કે હવે શું જોઈએ.',
          hi: '`% Invalid input` यानी इस mode में यह command नहीं, या argument गलत है। `% Incomplete command` यानी command सही पर अधूरा — `?` दबाकर देखें कि अब क्या चाहिए।',
          en: '`% Invalid input` means the command does not exist in this mode, or an argument is wrong. `% Incomplete command` means it was right but unfinished — press `?` to see what it still wants.',
        },
      },
      scene: () => ({ nodes: [term('R1(config)#')] }),
      say: () => ({ nodeId: 'r1', text: H('^ જ્યાં છે ત્યાં ભૂલ છે', '^ जहां है वहीं गलती है', 'The caret marks the spot') }),
      aside: () => ({
        title: H('શું વાંચવું', 'क्या पढ़ना है', 'What to read'),
        caption: H('દરેક ભૂલ કંઈક ચોક્કસ કહે છે.', 'हर error कुछ निश्चित कहता है।', 'Each refusal says something specific.'),
        head: ['message', 'means'],
        rows: [
          ['% Invalid input', 'wrong room, or wrong word'],
          ['% Incomplete command', 'right, but unfinished'],
          ['% Ambiguous command', 'too short — several match'],
        ],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'બે ચાવીઓ જે બધું સહેલું કરે', hi: 'दो चाबियां जो सब आसान करती हैं', en: 'Two keys that change everything' },
      text: {
        beginner: {
          gu: '`?` દબાવો — અહીંથી શું લખી શકાય એની યાદી આવે. અડધું લખીને **Tab** દબાવો — પૂરું થઈ જાય. અને ટૂંકાક્ષર ચાલે છે: `conf t`, `int gi0/0`, `sh ip int br`. CCNA માં કોઈ આખું લખતું નથી.',
          hi: '`?` दबाएं — यहां से क्या लिखा जा सकता है इसकी सूची आती है। आधा लिखकर **Tab** दबाएं — पूरा हो जाता है। और संक्षिप्त रूप चलते हैं: `conf t`, `int gi0/0`, `sh ip int br`। CCNA में कोई पूरा नहीं लिखता।',
          en: 'Press `?` and it lists what can go here. Type half a word and press **Tab** and it finishes. Abbreviations work too: `conf t`, `int gi0/0`, `sh ip int br`. Nobody in a CCNA lab types the whole thing.',
        },
        exam: {
          gu: 'Context-sensitive help કોઈ પણ જગ્યાએ કામ કરે — `show ?`, `ip ?`. Prefix abbreviation ત્યાં સુધી ચાલે જ્યાં સુધી એક જ command મેળ ખાય, નહીંતર Ambiguous આવે.',
          hi: 'Context-sensitive help कहीं भी काम करता है — `show ?`, `ip ?`। Prefix abbreviation तब तक चलता है जब तक एक ही command match हो, वरना Ambiguous आता है।',
          en: 'Context-sensitive help works anywhere: `show ?`, `ip ?`. Prefix abbreviation works as long as exactly one command matches; otherwise you get Ambiguous.',
        },
      },
      scene: () => ({ nodes: [term('R1(config-if)#')] }),
      say: () => ({ nodeId: 'r1', text: H('? પૂછો, Tab પૂરું કરે', '? पूछो, Tab पूरा करे', 'Ask with ?, finish with Tab') }),
      aside: () => ({
        title: H('ટૂંકાક્ષર', 'संक्षिप्त रूप', 'The short forms'),
        caption: H('ડાબું લખો, જમણું ચાલે.', 'बाईं तरफ लिखो, दाईं तरफ चले।', 'Type the left, get the right.'),
        head: ['short', 'full'],
        rows: [
          ['conf t', 'configure terminal'],
          ['int gi0/0', 'interface GigabitEthernet0/0'],
          ['sh ip int br', 'show ip interface brief'],
          ['no shut', 'no shutdown'],
        ],
      }),
    },
    {
      ms: 2600,
      label: { gu: 'બહાર નીકળવું', hi: 'बाहर निकलना', en: 'Getting back out' },
      text: {
        beginner: {
          gu: '`exit` એક પગથિયું પાછું લઈ જાય. `end` એકદમ બહાર — ગમે તેટલા ઊંડા હો તોય સીધા `R1#` પર. ખોવાઈ જાઓ ત્યારે `end` દબાવો અને ફરી શરૂ કરો. એટલું જ.',
          hi: '`exit` एक सीढ़ी पीछे ले जाता है। `end` एकदम बाहर — कितनी भी गहराई में हों तो भी सीधा `R1#` पर। खो जाएं तो `end` दबाएं और फिर शुरू करें। बस इतना ही।',
          en: '`exit` steps back one room. `end` takes you all the way out — however deep you are, straight back to `R1#`. Whenever you feel lost, press `end` and start again. That is the whole escape plan.',
        },
        exam: {
          gu: '`end` બરાબર Ctrl+Z જેવું છે. `do <command>` થી config mode માંથી જ show command ચલાવી શકાય — બહાર નીકળ્યા વગર.',
          hi: '`end` बिल्कुल Ctrl+Z जैसा है। `do <command>` से config mode से ही show command चलाया जा सकता है — बाहर निकले बिना।',
          en: '`end` is the same as Ctrl+Z. And `do <command>` runs a show command from inside config mode without leaving it.',
        },
      },
      scene: (t) => ({ nodes: [term(t > 0.5 ? 'R1#' : 'R1(config-if)#')] }),
      say: (t) => (t > 0.5 ? { nodeId: 'r1', text: H('ખોવાઈ જાઓ તો end', 'खो जाएं तो end', 'Lost? press end') } : null),
      aside: () => ({
        title: H('બહાર નીકળવાના રસ્તા', 'बाहर निकलने के रास्ते', 'Ways out'),
        head: ['command', 'does'],
        rows: [
          ['exit', 'one room back'],
          ['end', 'straight to R1#'],
          ['do show ...', 'look without leaving'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Prompt હંમેશા કહે છે તમે ક્યાં છો: `>` જુઓ, `#` બદલી શકો, `(config)#` આખું ઉપકરણ, `(config-if)#` એક પોર્ટ. `?` પૂછે, Tab પૂરું કરે, `end` બહાર કાઢે, અને `^` ભૂલ ક્યાં છે એ ચીંધે. આટલું જ CLI છે.',
    hi: 'Prompt हमेशा बताता है आप कहां हैं: `>` देखें, `#` बदल सकते हैं, `(config)#` पूरा उपकरण, `(config-if)#` एक port। `?` पूछता है, Tab पूरा करता है, `end` बाहर निकालता है, और `^` गलती कहां है वह दिखाता है। बस इतना ही CLI है।',
    en: 'The prompt always says where you are: `>` look, `#` change, `(config)#` the whole device, `(config-if)#` one port. `?` asks, Tab finishes, `end` escapes, and `^` points at the mistake. That is the entire command line.',
  },
  check: {
    q: {
      gu: 'Prompt `R1(config-if)#` દેખાય છે. તમે ક્યાં છો?',
      hi: 'Prompt `R1(config-if)#` दिख रहा है। आप कहां हैं?',
      en: 'The prompt reads `R1(config-if)#`. Where are you?',
    },
    options: [
      { gu: 'એક પોર્ટની અંદર — જે લખશો એ ફક્ત એને લાગુ પડશે', hi: 'एक port के अंदर — जो लिखेंगे वह केवल उसे लागू होगा', en: 'Inside one port — what you type applies only to it' },
      { gu: 'આખા ઉપકરણની ગોઠવણમાં', hi: 'पूरे उपकरण की settings में', en: 'In the whole-device settings' },
      { gu: 'ફક્ત જોઈ શકાય એવી જગ્યાએ', hi: 'केवल देख सकने वाली जगह पर', en: 'In the look-only room' },
    ],
    answer: 0,
    explain: {
      gu: 'કૌંસમાં `config-if` એટલે interface — તમે એક ચોક્કસ પોર્ટની અંદર ઊભા છો. `exit` એક પગથિયું પાછું લઈ જશે.',
      hi: 'कोष्ठक में `config-if` यानी interface — आप एक निश्चित port के अंदर खड़े हैं। `exit` एक सीढ़ी पीछे ले जाएगा।',
      en: '`config-if` in the brackets means interface: you are standing inside one specific port. `exit` steps you back out.',
    },
  },
}

/* ──────────────────────────── Configure ──────────────────────────── */

function cliLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'Router', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'pc1', name: 'PC1', kind: 'pc', ifaces: ['e0'] })
  const i = n.get('pc1')!.iface('e0')!
  i.ip = '192.168.1.10'
  i.mask = '255.255.255.0'
  n.get('pc1')!.defaultGateway = '192.168.1.1'
  n.connect('pc1', 'e0', 'r1', 'Gi0/0')
  return n
}

export const n1l0Config: ConfigureSpec = {
  build: cliLab,
  viewBox: { w: 760, h: 300 },
  layout: [
    { id: 'pc1', x: 180, y: 150, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'r1', x: 560, y: 150, type: 'router' },
  ],
  terminals: ['r1'],
  success: H(
    'તમે terminal વાપરી લીધું — તાળું ખોલ્યું, ઓરડામાં ગયા, એક પોર્ટ ઊભો કર્યો, અને બહાર નીકળ્યા. આગળના દરેક પાઠમાં આ જ ચાર પગલાં ફરી ફરી આવશે.',
    'आपने terminal का इस्तेमाल कर लिया — ताला खोला, कमरे में गए, एक port खड़ा किया, और बाहर निकले। आगे के हर पाठ में यही चार कदम बार-बार आएंगे।',
    'You have driven a terminal: unlocked it, stepped into the settings, brought a port up, and got back out. Every lesson from here repeats those same four moves.',
  ),
  tasks: [
    {
      id: 'enable',
      instruction: H('તાળું ખોલો', 'ताला खोलो', 'Unlock the device'),
      why: H(
        'Prompt અત્યારે `Router>` છે — એ `>` કહે છે કે તમે ફક્ત જોઈ શકો છો. પહેલાં એ બદલવું પડશે.',
        'Prompt अभी `Router>` है — वह `>` कहता है कि आप केवल देख सकते हैं। पहले यह बदलना पड़ेगा।',
        'The prompt reads `Router>`, and that `>` says you can only look. That has to change first.',
      ),
      hints: [
        H('એક જ શબ્દ. અંગ્રેજીમાં એનો અર્થ જ "ચાલુ કરો" થાય.', 'एक ही शब्द। अंग्रेजी में इसका मतलब ही "चालू करो" होता है।', 'One word. Its plain English meaning is exactly what it does.'),
        H('`en` લખીને Tab દબાવો.', '`en` लिखकर Tab दबाएं।', 'Type `en` and press Tab.'),
        H('enable', 'enable', 'enable'),
      ],
      check: () => true,
      done: H('`#` દેખાયું — તાળું ખુલ્યું', '`#` दिखा — ताला खुला', 'The `#` appeared — it is unlocked'),
    },
    {
      id: 'name',
      instruction: H('ઉપકરણનું નામ R1 કરો', 'उपकरण का नाम R1 करें', 'Rename the device to R1'),
      why: H(
        'નામ બદલવું એ આખા ઉપકરણની વાત છે, કોઈ એક પોર્ટની નહીં — એટલે settings ના ઓરડામાં જવું પડશે. Prompt બદલાય એ જોજો.',
        'नाम बदलना पूरे उपकरण की बात है, किसी एक port की नहीं — इसलिए settings के कमरे में जाना होगा। Prompt बदलते देखें।',
        'A name belongs to the whole device, not to one port, so this needs the settings room. Watch the prompt change as you go.',
      ),
      hints: [
        H('પહેલાં `conf t`, પછી નામ વાળો command.', 'पहले `conf t`, फिर नाम वाला command।', 'First `conf t`, then the command for a name.'),
        H('conf t → hostname <નામ>', 'conf t → hostname <नाम>', 'conf t → hostname <name>'),
        H('conf t\nhostname R1', 'conf t\nhostname R1', 'conf t\nhostname R1'),
      ],
      check: (n) => n.get('r1')?.name === 'R1',
      done: H('Prompt માં જ નામ બદલાઈ ગયું', 'Prompt में ही नाम बदल गया', 'The prompt itself now says R1'),
    },
    {
      id: 'iface',
      instruction: H('Gi0/0 ને સરનામું આપો: 192.168.1.1 / 255.255.255.0', 'Gi0/0 को पता दें: 192.168.1.1 / 255.255.255.0', 'Give Gi0/0 the address 192.168.1.1 / 255.255.255.0'),
      why: H(
        'હવે એક ચોક્કસ પોર્ટની અંદર જવું છે. `interface Gi0/0` લખો અને કૌંસ `(config-if)` થઈ જશે — એ જ કહે છે કે તમે અંદર પહોંચી ગયા.',
        'अब एक निश्चित port के अंदर जाना है। `interface Gi0/0` लिखें और कोष्ठक `(config-if)` हो जाएंगे — वही बताते हैं कि आप अंदर पहुंच गए।',
        'Now you want to be inside one particular port. Type `interface Gi0/0` and the brackets become `(config-if)` — that is how you know you are in.',
      ),
      hints: [
        H('પહેલાં પોર્ટ પસંદ કરો, પછી સરનામું આપો.', 'पहले port चुनें, फिर पता दें।', 'Pick the port first, then give it the address.'),
        H('interface Gi0/0 → ip address <ip> <mask>', 'interface Gi0/0 → ip address <ip> <mask>', 'interface Gi0/0 → ip address <ip> <mask>'),
        H('interface Gi0/0\nip address 192.168.1.1 255.255.255.0', 'interface Gi0/0\nip address 192.168.1.1 255.255.255.0', 'interface Gi0/0\nip address 192.168.1.1 255.255.255.0'),
      ],
      check: (n) => n.get('r1')?.iface('Gi0/0')?.ip === '192.168.1.1',
      done: H('પોર્ટને સરનામું મળ્યું', 'Port को पता मिला', 'The port has its address'),
    },
    {
      id: 'up',
      instruction: H('પોર્ટ ચાલુ કરો', 'Port चालू करें', 'Bring the port up'),
      why: H(
        'Cisco પર દરેક પોર્ટ બંધ અવસ્થામાં જ આવે છે. સરનામું આપ્યું એટલે ચાલુ નથી થઈ જતું — અલગથી કહેવું પડે. આ એક લીટી ભૂલવી એ સૌથી સામાન્ય ભૂલ છે.',
        'Cisco पर हर port बंद अवस्था में ही आता है। पता देने से चालू नहीं हो जाता — अलग से कहना पड़ता है। यह एक लाइन भूलना सबसे आम गलती है।',
        'Every port on a Cisco device arrives switched off. Giving it an address does not turn it on; you have to say so. Forgetting this one line is the most common mistake there is.',
      ),
      hints: [
        H('બે શબ્દ. પહેલો શબ્દ કોઈ પણ command ને ઊલટું કરે છે.', 'दो शब्द। पहला शब्द किसी भी command को उल्टा करता है।', 'Two words. The first one reverses any command.'),
        H('`shutdown` ને ઊલટું કરો.', '`shutdown` को उल्टा करें।', 'Reverse `shutdown`.'),
        H('no shutdown', 'no shutdown', 'no shutdown'),
      ],
      check: (n) => n.get('r1')?.iface('Gi0/0')?.shutdown === false,
      done: H('પોર્ટ up/up થયો', 'Port up/up हो गया', 'The port is up/up'),
    },
    {
      id: 'verify',
      instruction: H('બહાર નીકળીને ચકાસો કે PC1 પહોંચે છે', 'बाहर निकलकर जांचें कि PC1 पहुंच रहा है', 'Get back out and check that PC1 is reachable'),
      why: H(
        'છેલ્લું પગલું હંમેશા ચકાસણી. `end` થી એકદમ બહાર નીકળો, પછી ping કરો. અથવા બહાર નીકળ્યા વગર `do ping ...` પણ ચાલે.',
        'आखिरी कदम हमेशा जांच। `end` से एकदम बाहर निकलें, फिर ping करें। या बाहर निकले बिना `do ping ...` भी चलता है।',
        'The last move is always to check. `end` takes you straight out, then ping. Or stay where you are and use `do ping ...`.',
      ),
      hints: [
        H('`end` પછી ping, કે સીધું `do ping`.', '`end` फिर ping, या सीधा `do ping`।', '`end` then ping, or just `do ping`.'),
        H('ping 192.168.1.10', 'ping 192.168.1.10', 'ping 192.168.1.10'),
        H('end\nping 192.168.1.10', 'end\nping 192.168.1.10', 'end\nping 192.168.1.10'),
      ],
      check: (n) => n.ping('r1', '192.168.1.10').ok,
      done: H('પહોંચે છે — ગોઠવણ કામ કરે છે', 'पहुंच रहा है — configuration काम कर रहा है', 'It replies — the configuration works'),
    },
  ],
}
