import type { LessonSpec } from '../components/AnimatedLesson'
import type { ConfigureSpec } from '../components/ConfigureStage'
import { Network } from '../engine/network'

const CCNA = 'var(--nq-ccna)'
const H = (gu: string, en: string) => ({ gu, en })

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
    en: 'From here on, every lesson puts you at a terminal. That black screen looks forbidding, but it holds one idea only: which room you are standing in. Once that lands, the rest is just vocabulary.',
  },
  steps: [
    {
      ms: 2600,
      label: { gu: 'Prompt પોતે જ બોલે છે', en: 'The prompt is already telling you' },
      text: {
        beginner: {
          gu: 'સૌથી પહેલાં દેખાય છે: `R1>`. એમાં બે વાત છે. `R1` એ ઉપકરણનું નામ, અને `>` કહે છે કે તમે સૌથી બહારના ઓરડામાં છો — જ્યાં **જોઈ શકાય, બદલી ન શકાય**. એ એક ચિહ્ન જ તમારી અડધી ગૂંચવણ દૂર કરે છે.',
          en: 'The first thing you see is `R1>`. It carries two facts: `R1` is the device name, and `>` says you are in the outermost room, where you can **look but not change**. That one character answers half of the confusion people carry.',
        },
        exam: {
          gu: 'User EXEC mode. `>` એ સૌથી ઓછા અધિકારનું સ્તર છે — મર્યાદિત show commands, ping, traceroute. કોઈ configuration અહીંથી શક્ય નથી.',
          en: 'User EXEC mode. The `>` is the lowest privilege level: limited show commands, ping and traceroute. No configuration is possible from here.',
        },
      },
      scene: () => ({ nodes: [term('R1>')] }),
      say: () => ({ nodeId: 'r1', text: H('હું જોવા દઉં, બદલવા નહીં', 'I will let you look, not change') }),
      aside: () => ({
        title: H('Prompt વાંચો', 'Reading the prompt'),
        caption: H('ચિહ્ન કહે છે તમે ક્યાં છો.', 'The symbol says where you are standing.'),
        head: ['prompt', 'means'],
        rows: [['R1>', 'look only']],
      }),
    },
    {
      ms: 2800,
      label: { gu: 'enable — તાળું ખોલો', en: 'enable — unlock it' },
      text: {
        beginner: {
          gu: '`enable` લખો અને `>` બદલાઈને `#` થઈ જાય. એ **હેશ** કહે છે કે હવે તાળું ખુલ્યું છે. હજી તમે કશું બદલ્યું નથી — પણ હવે બદલી શકો એમ છો. સાચા નેટવર્કમાં અહીં password પુછાય.',
          en: 'Type `enable` and the `>` turns into `#`. That **hash** means the lock is off. You still have not changed anything — but now you could. On a real device this is where a password is asked for.',
        },
        exam: {
          gu: 'Privileged EXEC mode. બધા show commands, `copy`, `reload`, debug. `enable secret` થી એને સુરક્ષિત રાખવું.',
          en: 'Privileged EXEC mode: every show command, plus copy, reload and debug. Protect it with `enable secret`.',
        },
      },
      scene: (t) => ({ nodes: [term(t > 0.45 ? 'R1#' : 'R1>')] }),
      say: (t) =>
        t > 0.45 ? { nodeId: 'r1', text: H('તાળું ખૂલ્યું', 'Unlocked') } : null,
      aside: (t) => ({
        title: H('Prompt વાંચો', 'Reading the prompt'),
        caption: H('`#` એટલે તાળું ખુલ્યું.', 'A `#` means the lock is off.'),
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
      label: { gu: 'configure terminal — અંદરના ઓરડે', en: 'configure terminal — into the inner room' },
      text: {
        beginner: {
          gu: 'હવે `configure terminal` — કે ટૂંકમાં `conf t`. Prompt થાય `R1(config)#`. કૌંસમાં લખેલું જ તમને કહે છે કે **તમે ક્યાં ઊભા છો**. અહીંથી જે લખશો એ ખરેખર સેટિંગ બદલશે.',
          en: 'Now `configure terminal`, or just `conf t`. The prompt becomes `R1(config)#`. Whatever sits in those brackets is **telling you where you are standing**. From here, what you type actually changes settings.',
        },
        exam: {
          gu: 'Global configuration mode. અહીંથી hostname, routing protocols, ACLs વગેરે. કૌંસ હંમેશા current mode દર્શાવે છે.',
          en: 'Global configuration mode: hostname, routing protocols, ACLs and so on. The brackets always name the current mode.',
        },
      },
      scene: (t) => ({ nodes: [term(t > 0.4 ? 'R1(config)#' : 'R1#')] }),
      say: (t) => (t > 0.4 ? { nodeId: 'r1', text: H('હવે લખો એ લાગુ પડશે', 'Now what you type sticks') } : null),
      aside: (t) => ({
        title: H('Prompt વાંચો', 'Reading the prompt'),
        caption: H('કૌંસ હંમેશા ઓરડાનું નામ કહે છે.', 'The brackets always name the room.'),
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
      label: { gu: 'ઓરડાની અંદર ઓરડો', en: 'A room inside the room' },
      text: {
        beginner: {
          gu: 'એક પોર્ટ બદલવો હોય તો `interface Gi0/0` લખો — prompt થાય `R1(config-if)#`. હવે તમે **એ એક પોર્ટની અંદર** ઊભા છો, અને જે લખશો એ ફક્ત એને લાગુ પડશે. આ જ રીતે `(config-router)`, `(config-vlan)` આવે છે.',
          en: 'To change one port, type `interface Gi0/0` and the prompt becomes `R1(config-if)#`. You are now standing **inside that one port**, and what you type applies only to it. The same pattern gives you `(config-router)` and `(config-vlan)`.',
        },
        exam: {
          gu: 'Sub-configuration modes. દરેકનો પોતાનો command set છે — global command અહીં નહીં ચાલે અને interface command global માં નહીં ચાલે.',
          en: 'Sub-configuration modes, each with its own command set: a global command will not run here, and an interface command will not run in global.',
        },
      },
      scene: (t) => ({ nodes: [term(t > 0.4 ? 'R1(config-if)#' : 'R1(config)#')] }),
      say: (t) => (t > 0.4 ? { nodeId: 'r1', text: H('હવે ફક્ત Gi0/0 ની વાત', 'Now only about Gi0/0') } : null),
      aside: () => ({
        title: H('ઓરડાની સીડી', 'The ladder of rooms'),
        caption: H('દરેક પગથિયે prompt બદલાય છે.', 'The prompt changes at every rung.'),
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
      label: { gu: 'ભૂલ તમને શીખવે છે', en: 'The error is teaching you' },
      text: {
        beginner: {
          gu: 'ખોટી જગ્યાએ command લખો તો આવે: `% Invalid input detected at \'^\' marker.` પેલું **^ નિશાન જ્યાં છે ત્યાં જ ભૂલ છે** — એની પહેલાંનું બધું સાચું હતું. એટલે આ error ગુસ્સો નથી, આંગળી ચીંધવી છે.',
          en: 'Put a command in the wrong room and you get `% Invalid input detected at \'^\' marker.` That **caret sits exactly where it stopped understanding** — everything before it was fine. The error is not a rebuke, it is a pointing finger.',
        },
        exam: {
          gu: '`% Invalid input` એટલે આ mode માં આ command નથી, કે argument ખોટો છે. `% Incomplete command` એટલે command સાચું પણ અધૂરું — `?` દબાવીને જુઓ કે હવે શું જોઈએ.',
          en: '`% Invalid input` means the command does not exist in this mode, or an argument is wrong. `% Incomplete command` means it was right but unfinished — press `?` to see what it still wants.',
        },
      },
      scene: () => ({ nodes: [term('R1(config)#')] }),
      say: () => ({ nodeId: 'r1', text: H('^ જ્યાં છે ત્યાં ભૂલ છે', 'The caret marks the spot') }),
      aside: () => ({
        title: H('શું વાંચવું', 'What to read'),
        caption: H('દરેક ભૂલ કંઈક ચોક્કસ કહે છે.', 'Each refusal says something specific.'),
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
      label: { gu: 'બે ચાવીઓ જે બધું સહેલું કરે', en: 'Two keys that change everything' },
      text: {
        beginner: {
          gu: '`?` દબાવો — અહીંથી શું લખી શકાય એની યાદી આવે. અડધું લખીને **Tab** દબાવો — પૂરું થઈ જાય. અને ટૂંકાક્ષર ચાલે છે: `conf t`, `int gi0/0`, `sh ip int br`. CCNA માં કોઈ આખું લખતું નથી.',
          en: 'Press `?` and it lists what can go here. Type half a word and press **Tab** and it finishes. Abbreviations work too: `conf t`, `int gi0/0`, `sh ip int br`. Nobody in a CCNA lab types the whole thing.',
        },
        exam: {
          gu: 'Context-sensitive help કોઈ પણ જગ્યાએ કામ કરે — `show ?`, `ip ?`. Prefix abbreviation ત્યાં સુધી ચાલે જ્યાં સુધી એક જ command મેળ ખાય, નહીંતર Ambiguous આવે.',
          en: 'Context-sensitive help works anywhere: `show ?`, `ip ?`. Prefix abbreviation works as long as exactly one command matches; otherwise you get Ambiguous.',
        },
      },
      scene: () => ({ nodes: [term('R1(config-if)#')] }),
      say: () => ({ nodeId: 'r1', text: H('? પૂછો, Tab પૂરું કરે', 'Ask with ?, finish with Tab') }),
      aside: () => ({
        title: H('ટૂંકાક્ષર', 'The short forms'),
        caption: H('ડાબું લખો, જમણું ચાલે.', 'Type the left, get the right.'),
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
      label: { gu: 'બહાર નીકળવું', en: 'Getting back out' },
      text: {
        beginner: {
          gu: '`exit` એક પગથિયું પાછું લઈ જાય. `end` એકદમ બહાર — ગમે તેટલા ઊંડા હો તોય સીધા `R1#` પર. ખોવાઈ જાઓ ત્યારે `end` દબાવો અને ફરી શરૂ કરો. એટલું જ.',
          en: '`exit` steps back one room. `end` takes you all the way out — however deep you are, straight back to `R1#`. Whenever you feel lost, press `end` and start again. That is the whole escape plan.',
        },
        exam: {
          gu: '`end` બરાબર Ctrl+Z જેવું છે. `do <command>` થી config mode માંથી જ show command ચલાવી શકાય — બહાર નીકળ્યા વગર.',
          en: '`end` is the same as Ctrl+Z. And `do <command>` runs a show command from inside config mode without leaving it.',
        },
      },
      scene: (t) => ({ nodes: [term(t > 0.5 ? 'R1#' : 'R1(config-if)#')] }),
      say: (t) => (t > 0.5 ? { nodeId: 'r1', text: H('ખોવાઈ જાઓ તો end', 'Lost? press end') } : null),
      aside: () => ({
        title: H('બહાર નીકળવાના રસ્તા', 'Ways out'),
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
    en: 'The prompt always says where you are: `>` look, `#` change, `(config)#` the whole device, `(config-if)#` one port. `?` asks, Tab finishes, `end` escapes, and `^` points at the mistake. That is the entire command line.',
  },
  check: {
    q: {
      gu: 'Prompt `R1(config-if)#` દેખાય છે. તમે ક્યાં છો?',
      en: 'The prompt reads `R1(config-if)#`. Where are you?',
    },
    options: [
      { gu: 'એક પોર્ટની અંદર — જે લખશો એ ફક્ત એને લાગુ પડશે', en: 'Inside one port — what you type applies only to it' },
      { gu: 'આખા ઉપકરણની ગોઠવણમાં', en: 'In the whole-device settings' },
      { gu: 'ફક્ત જોઈ શકાય એવી જગ્યાએ', en: 'In the look-only room' },
    ],
    answer: 0,
    explain: {
      gu: 'કૌંસમાં `config-if` એટલે interface — તમે એક ચોક્કસ પોર્ટની અંદર ઊભા છો. `exit` એક પગથિયું પાછું લઈ જશે.',
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
    'You have driven a terminal: unlocked it, stepped into the settings, brought a port up, and got back out. Every lesson from here repeats those same four moves.',
  ),
  tasks: [
    {
      id: 'enable',
      instruction: H('તાળું ખોલો', 'Unlock the device'),
      why: H(
        'Prompt અત્યારે `Router>` છે — એ `>` કહે છે કે તમે ફક્ત જોઈ શકો છો. પહેલાં એ બદલવું પડશે.',
        'The prompt reads `Router>`, and that `>` says you can only look. That has to change first.',
      ),
      hints: [
        H('એક જ શબ્દ. અંગ્રેજીમાં એનો અર્થ જ "ચાલુ કરો" થાય.', 'One word. Its plain English meaning is exactly what it does.'),
        H('`en` લખીને Tab દબાવો.', 'Type `en` and press Tab.'),
        H('enable', 'enable'),
      ],
      check: () => true,
      done: H('`#` દેખાયું — તાળું ખુલ્યું', 'The `#` appeared — it is unlocked'),
    },
    {
      id: 'name',
      instruction: H('ઉપકરણનું નામ R1 કરો', 'Rename the device to R1'),
      why: H(
        'નામ બદલવું એ આખા ઉપકરણની વાત છે, કોઈ એક પોર્ટની નહીં — એટલે settings ના ઓરડામાં જવું પડશે. Prompt બદલાય એ જોજો.',
        'A name belongs to the whole device, not to one port, so this needs the settings room. Watch the prompt change as you go.',
      ),
      hints: [
        H('પહેલાં `conf t`, પછી નામ વાળો command.', 'First `conf t`, then the command for a name.'),
        H('conf t → hostname <નામ>', 'conf t → hostname <name>'),
        H('conf t\nhostname R1', 'conf t\nhostname R1'),
      ],
      check: (n) => n.get('r1')?.name === 'R1',
      done: H('Prompt માં જ નામ બદલાઈ ગયું', 'The prompt itself now says R1'),
    },
    {
      id: 'iface',
      instruction: H('Gi0/0 ને સરનામું આપો: 192.168.1.1 / 255.255.255.0', 'Give Gi0/0 the address 192.168.1.1 / 255.255.255.0'),
      why: H(
        'હવે એક ચોક્કસ પોર્ટની અંદર જવું છે. `interface Gi0/0` લખો અને કૌંસ `(config-if)` થઈ જશે — એ જ કહે છે કે તમે અંદર પહોંચી ગયા.',
        'Now you want to be inside one particular port. Type `interface Gi0/0` and the brackets become `(config-if)` — that is how you know you are in.',
      ),
      hints: [
        H('પહેલાં પોર્ટ પસંદ કરો, પછી સરનામું આપો.', 'Pick the port first, then give it the address.'),
        H('interface Gi0/0 → ip address <ip> <mask>', 'interface Gi0/0 → ip address <ip> <mask>'),
        H('interface Gi0/0\nip address 192.168.1.1 255.255.255.0', 'interface Gi0/0\nip address 192.168.1.1 255.255.255.0'),
      ],
      check: (n) => n.get('r1')?.iface('Gi0/0')?.ip === '192.168.1.1',
      done: H('પોર્ટને સરનામું મળ્યું', 'The port has its address'),
    },
    {
      id: 'up',
      instruction: H('પોર્ટ ચાલુ કરો', 'Bring the port up'),
      why: H(
        'Cisco પર દરેક પોર્ટ બંધ અવસ્થામાં જ આવે છે. સરનામું આપ્યું એટલે ચાલુ નથી થઈ જતું — અલગથી કહેવું પડે. આ એક લીટી ભૂલવી એ સૌથી સામાન્ય ભૂલ છે.',
        'Every port on a Cisco device arrives switched off. Giving it an address does not turn it on; you have to say so. Forgetting this one line is the most common mistake there is.',
      ),
      hints: [
        H('બે શબ્દ. પહેલો શબ્દ કોઈ પણ command ને ઊલટું કરે છે.', 'Two words. The first one reverses any command.'),
        H('`shutdown` ને ઊલટું કરો.', 'Reverse `shutdown`.'),
        H('no shutdown', 'no shutdown'),
      ],
      check: (n) => n.get('r1')?.iface('Gi0/0')?.shutdown === false,
      done: H('પોર્ટ up/up થયો', 'The port is up/up'),
    },
    {
      id: 'verify',
      instruction: H('બહાર નીકળીને ચકાસો કે PC1 પહોંચે છે', 'Get back out and check that PC1 is reachable'),
      why: H(
        'છેલ્લું પગલું હંમેશા ચકાસણી. `end` થી એકદમ બહાર નીકળો, પછી ping કરો. અથવા બહાર નીકળ્યા વગર `do ping ...` પણ ચાલે.',
        'The last move is always to check. `end` takes you straight out, then ping. Or stay where you are and use `do ping ...`.',
      ),
      hints: [
        H('`end` પછી ping, કે સીધું `do ping`.', '`end` then ping, or just `do ping`.'),
        H('ping 192.168.1.10', 'ping 192.168.1.10'),
        H('end\nping 192.168.1.10', 'end\nping 192.168.1.10'),
      ],
      check: (n) => n.ping('r1', '192.168.1.10').ok,
      done: H('પહોંચે છે — ગોઠવણ કામ કરે છે', 'It replies — the configuration works'),
    },
  ],
}
