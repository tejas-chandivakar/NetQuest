import type { LessonSpec } from '../components/AnimatedLesson'
import { ease } from '../lib/useStepPlayer'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const OK = 'var(--nq-ok)'
const WARN = 'var(--nq-warn)'
const ERR = 'var(--nq-err)'
const MUTE = 'var(--nq-text-mute)'
const H = (gu: string, en: string) => ({ gu, en })

/* ═══════════════ n6l1 · controller-based networking ═══════════════ */

export const n6l1: LessonSpec = {
  why: {
    gu: 'અત્યાર સુધી તમે દરેક ઉપકરણ પર જઈને commands લખ્યા. દરેક router પોતે નક્કી કરે છે કે packet ક્યાં મોકલવો. SDN એ **બીજો** વિચાર છે: નિર્ણય એક જગ્યાએ લેવાય, અને ઉપકરણો ફક્ત એનો અમલ કરે.',
    en: 'So far you have typed commands on each device, and each router decides for itself where a packet goes. SDN is a **different** idea: the decisions are made in one place and the devices only carry them out.',
  },
  steps: [
    {
      ms: 3200,
      label: H('દરેક ઉપકરણની અંદર બે ભાગ', 'Two halves inside every device'),
      text: {
        beginner: {
          gu: 'દરેક router ની અંદર બે અલગ કામ ચાલે છે. **Control plane** વિચારે છે — OSPF ચલાવે, routing table બનાવે, નક્કી કરે કે ક્યાં મોકલવું. **Data plane** ફક્ત કરે છે — packet આવે, ટેબલ જુએ, આગળ ધકેલે, લાખો વાર પ્રતિ સેકન્ડ.',
          en: 'Two separate jobs run inside every router. The **control plane** thinks: it runs OSPF, builds the routing table, decides where things should go. The **data plane** only acts: a packet arrives, it checks the table, it pushes the packet on, a million times a second.',
        },
        exam: {
          gu: 'Control plane CPU પર ચાલે, data plane ખાસ hardware (ASIC) પર. ત્રીજું, management plane — SSH, SNMP, syslog — એટલે કે તમે ઉપકરણ સાથે વાત કરો એ રસ્તો.',
          en: 'The control plane runs on the CPU, the data plane on dedicated hardware (ASICs). There is a third, the management plane — SSH, SNMP, syslog — which is how you talk to the device at all.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'c', x: 430, y: 100, type: 'server', label: 'control plane', sub: t > 0.3 ? 'decides — OSPF, tables' : undefined, accent: t > 0.3 ? CCNP : MUTE, pulse: t > 0.3 && t < 0.55 },
          { id: 'd', x: 430, y: 300, type: 'switch', label: 'data plane', sub: t > 0.55 ? 'acts — millions per second' : undefined, accent: t > 0.55 ? OK : MUTE, pulse: t > 0.55 },
        ],
        links: [{ id: 'l', from: 'c', to: 'd', state: 'up', flowing: t > 0.4, label: 'the table' }],
        packets:
          t > 0.6
            ? [{ id: 'p', from: 'd', to: 'c', t: 0.5, color: 'var(--nq-pkt-data)', label: 'packets never stop here' }]
            : [],
      }),
      aside: () => ({
        title: H('એક જ બોક્સમાં બે કામ', 'Two jobs in one box'),
        head: ['plane', 'does', 'runs on'],
        rows: [
          ['control', 'thinks, builds tables', 'the CPU'],
          ['data', 'forwards packets', 'the ASIC'],
          ['management', 'lets you log in', 'the CPU'],
        ],
      }),
    },
    {
      ms: 3000,
      label: H('પરંપરાગત — દરેક પોતાની મેળે', 'Traditional — each one for itself'),
      text: {
        beginner: {
          gu: 'પરંપરાગત નેટવર્કમાં દરેક ઉપકરણનું પોતાનું control plane છે. પચાસ switch એટલે **પચાસ જુદા મગજ**, દરેક પોતાનો નિર્ણય લે. એ મજબૂત છે — એક પડે તો બાકીના ચાલુ રહે — પણ બધાને એકસરખા રાખવા એ તમારું કામ, હાથે.',
          en: 'In a traditional network each device has its own control plane. Fifty switches means **fifty separate brains**, each making its own decisions. That is resilient — one failing leaves the rest running — but keeping them all consistent is your job, by hand.',
        },
        exam: {
          gu: 'એને distributed control plane કહે છે. એનો સૌથી મોટો ખર્ચ: configuration drift — સમય જતાં ઉપકરણો એકબીજાથી જુદાં પડતાં જાય અને કોઈને ખબર પણ ન રહે.',
          en: 'This is a distributed control plane. Its biggest cost is configuration drift: over time the devices quietly diverge from each other and nobody has the full picture.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'a', x: 180, y: 120, type: 'switch', label: 'SW1', sub: 'own brain', accent: CCNA },
          { id: 'b', x: 430, y: 300, type: 'switch', label: 'SW2', sub: 'own brain', accent: CCNA },
          { id: 'c', x: 680, y: 120, type: 'router', label: 'R1', sub: 'own brain', accent: CCNA },
          { id: 'adm', x: 430, y: 60, type: 'laptop', label: 'you', sub: 'fifty logins', accent: WARN, pulse: true },
        ],
        links: [
          { id: 'x', from: 'a', to: 'b', state: 'up' },
          { id: 'y', from: 'b', to: 'c', state: 'up' },
          { id: 'z', from: 'a', to: 'c', state: 'up' },
        ],
      }),
    },
    {
      ms: 3400,
      label: H('Controller — મગજ બહાર કાઢો', 'The controller — lift the brain out'),
      text: {
        beginner: {
          gu: 'SDN નો વિચાર: control plane ને ઉપકરણમાંથી કાઢીને **એક controller** માં મૂકો. હવે controller આખું નેટવર્ક એકસાથે જુએ છે — બધાં ઉપકરણો, બધી લિંક — અને એ **આખા ચિત્ર** જોઈને નિર્ણય લે. ઉપકરણો ફક્ત એના કહેવા પ્રમાણે packets ધકેલે.',
          en: 'The SDN idea: take the control plane out of the devices and put it in **one controller**. The controller now sees the whole network at once — every device, every link — and decides with the **whole picture** in view. The devices just forward as instructed.',
        },
        exam: {
          gu: 'Controller થી ઉપકરણ સુધીની દિશા = **southbound** (OpenFlow, NETCONF, CLI). Controller થી તમારા કે તમારા software સુધી = **northbound** (REST API). ઉત્તર તમારી તરફ, દક્ષિણ ઉપકરણો તરફ.',
          en: 'Controller down to the devices is **southbound** (OpenFlow, NETCONF, even CLI). Controller up to you or your software is **northbound** (a REST API). North faces you, south faces the devices.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ctl', x: 430, y: 80, type: 'server', label: 'Controller', sub: t > 0.3 ? 'sees everything at once' : undefined, accent: t > 0.3 ? OK : MUTE, pulse: t > 0.3 },
          { id: 'a', x: 160, y: 320, type: 'switch', label: 'SW1', sub: t > 0.5 ? 'just forwards' : undefined, accent: t > 0.5 ? MUTE : CCNA },
          { id: 'b', x: 430, y: 330, type: 'switch', label: 'SW2', accent: t > 0.5 ? MUTE : CCNA },
          { id: 'c', x: 700, y: 320, type: 'router', label: 'R1', accent: t > 0.5 ? MUTE : CCNA },
        ],
        links: [
          { id: 'x', from: 'ctl', to: 'a', state: 'up', flowing: t > 0.4, label: t > 0.6 ? 'southbound' : undefined },
          { id: 'y', from: 'ctl', to: 'b', state: 'up', flowing: t > 0.4 },
          { id: 'z', from: 'ctl', to: 'c', state: 'up', flowing: t > 0.4 },
        ],
        packets:
          t > 0.45
            ? [
                { id: 'p1', from: 'ctl', to: 'a', t: 0.15 + ease((t - 0.45) / 0.55) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'forward like this' },
                { id: 'p2', from: 'ctl', to: 'c', t: 0.15 + ease((t - 0.45) / 0.55) * 0.7, color: 'var(--nq-pkt-ctrl)' },
              ]
            : [],
      }),
      aside: () => ({
        title: H('બે દિશા', 'The two directions'),
        caption: H('ઉત્તર તમારી તરફ, દક્ષિણ ઉપકરણો તરફ.', 'North faces you, south faces the devices.'),
        head: ['direction', 'between', 'speaks'],
        rows: [
          ['northbound', 'you ↔ controller', 'REST API'],
          ['southbound', 'controller ↔ devices', 'NETCONF, OpenFlow'],
        ],
      }),
    },
    {
      ms: 3200,
      label: H('"શું જોઈએ" કહો, "કેવી રીતે" નહીં', 'Say what you want, not how'),
      text: {
        beginner: {
          gu: 'આ સૌથી મોટો ફરક છે. પહેલાં તમે લખતા: "SW1 ના Fa0/4 પર VLAN 20, SW2 ના Gi0/1 પર trunk, R1 પર ACL…" — એટલે **કેવી રીતે**. Controller ને તમે કહો: "મહેમાનો ફક્ત ઇન્ટરનેટ જોઈ શકે, અંદરનું કશું નહીં" — એટલે **શું જોઈએ**. બાકીનું એ ગોઠવે.',
          en: 'This is the big shift. You used to write "VLAN 20 on SW1’s Fa0/4, trunk on SW2’s Gi0/1, an ACL on R1…" — that is **how**. To a controller you say "guests may reach the internet and nothing inside" — that is **what**. It works out the rest.',
        },
        exam: {
          gu: 'એને intent-based networking કહે છે. Cisco DNA Center એ Catalyst માટેનો controller છે, SD-WAN માટે vManage, data centre માટે ACI નું APIC.',
          en: 'This is intent-based networking. Cisco’s DNA Center is the controller for Catalyst, vManage for SD-WAN, and APIC for ACI in the data centre.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'you', x: 130, y: 200, type: 'laptop', label: 'you', sub: t > 0.3 ? '"guests: internet only"' : undefined, accent: BEG, pulse: t > 0.3 && t < 0.5 },
          { id: 'ctl', x: 430, y: 200, type: 'server', label: 'Controller', sub: t > 0.5 ? 'works out the how' : undefined, accent: OK, pulse: t > 0.5 },
          { id: 'a', x: 740, y: 90, type: 'switch', label: 'SW1', sub: t > 0.65 ? 'VLAN 20' : undefined, accent: CCNA },
          { id: 'b', x: 740, y: 210, type: 'switch', label: 'SW2', sub: t > 0.65 ? 'trunk' : undefined, accent: CCNA },
          { id: 'c', x: 740, y: 330, type: 'router', label: 'R1', sub: t > 0.65 ? 'ACL' : undefined, accent: CCNA },
        ],
        links: [
          { id: 'x', from: 'you', to: 'ctl', state: 'up', flowing: t > 0.25 },
          { id: 'a1', from: 'ctl', to: 'a', state: 'up', flowing: t > 0.55 },
          { id: 'b1', from: 'ctl', to: 'b', state: 'up', flowing: t > 0.55 },
          { id: 'c1', from: 'ctl', to: 'c', state: 'up', flowing: t > 0.55 },
        ],
      }),
    },
    {
      ms: 2800,
      label: H('કિંમત પણ છે', 'It has a price'),
      text: {
        beginner: {
          gu: 'Controller બધું સહેલું કરે, પણ એ **એક જ જગ્યા** છે જ્યાં બધું ટકેલું છે. એ જાય તો? સારી રચનામાં ઉપકરણો છેલ્લી સૂચના પ્રમાણે ચાલતાં રહે — traffic ચાલુ રહે, ફક્ત નવો ફેરફાર ન થાય. અને controller ને **ખૂબ** સુરક્ષિત રાખવું પડે: એ મળ્યું એટલે આખું નેટવર્ક મળ્યું.',
          en: 'A controller makes everything easier, but it is **one place** that everything now rests on. What if it goes? In a good design the devices keep running on their last instructions — traffic continues, only changes stop. And the controller has to be guarded **extremely** well: own it and you own the network.',
        },
        exam: {
          gu: 'એટલે controller cluster માં ચલાવાય. અને ઘણી આધુનિક રચના hybrid છે: routing ઉપકરણો પોતે ચલાવે (એટલે controller વગર પણ ચાલે), પણ policy અને provisioning controller થી આવે.',
          en: 'Which is why controllers run as a cluster. And most modern designs are hybrid: the devices still run routing themselves so they survive without the controller, while policy and provisioning come from it.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ctl', x: 430, y: 90, type: 'server', label: 'Controller', sub: t > 0.4 ? 'down ✕' : undefined, accent: t > 0.4 ? ERR : OK },
          { id: 'a', x: 180, y: 310, type: 'switch', label: 'SW1', sub: t > 0.5 ? 'still forwarding' : undefined, accent: t > 0.5 ? OK : CCNA },
          { id: 'b', x: 680, y: 310, type: 'switch', label: 'SW2', sub: t > 0.5 ? 'still forwarding' : undefined, accent: t > 0.5 ? OK : CCNA },
        ],
        links: [
          { id: 'x', from: 'ctl', to: 'a', state: t > 0.4 ? 'down' : 'up' },
          { id: 'y', from: 'ctl', to: 'b', state: t > 0.4 ? 'down' : 'up' },
          { id: 'z', from: 'a', to: 'b', state: 'up', flowing: true },
        ],
        packets: [{ id: 'p', from: 'a', to: 'b', t: 0.15 + ease(Math.min(1, t)) * 0.7, color: 'var(--nq-ok)', label: 'traffic carries on' }],
      }),
      aside: () => ({
        title: H('સરખામણી', 'Side by side'),
        head: ['', 'traditional', 'controller-based'],
        rows: [
          ['brains', 'one per device', 'one for all'],
          ['you change it', 'device by device', 'once, centrally'],
          ['one failure', 'loses one device', 'stops changes, not traffic'],
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'દરેક ઉપકરણમાં control plane (વિચારે) અને data plane (કરે) હોય છે. પરંપરાગત નેટવર્કમાં દરેકનું પોતાનું મગજ — મજબૂત, પણ બધાને એકસરખા રાખવા હાથનું કામ. SDN એ મગજ **controller** માં ખસેડે: northbound એ તમારી REST API, southbound એ ઉપકરણો તરફ. તમે "શું જોઈએ" કહો, "કેવી રીતે" એ નક્કી કરે.',
    en: 'Every device holds a control plane that thinks and a data plane that acts. Traditionally each has its own brain — resilient, but keeping them consistent is handwork. SDN moves that brain into a **controller**: northbound is the REST API facing you, southbound faces the devices. You state what you want; it works out how.',
  },
  check: {
    q: H(
      'Controller આધારિત નેટવર્કમાં controller બંધ પડે તો (સારી રચનામાં) શું થાય?',
      'In a well-designed controller-based network, what happens when the controller goes down?',
    ),
    options: [
      H('Traffic ચાલતું રહે, પણ નવા ફેરફાર ન થાય', 'Traffic keeps flowing, but no changes can be made'),
      H('આખું નેટવર્ક તરત બંધ', 'The whole network stops immediately'),
      H('દરેક ઉપકરણ factory settings પર જાય', 'Every device reverts to factory settings'),
    ],
    answer: 0,
    explain: H(
      'Data plane ઉપકરણમાં જ રહે છે — એને controller ની ક્ષણે-ક્ષણે જરૂર નથી. એટલે છેલ્લી મળેલી સૂચના પ્રમાણે packets ધકેલાતા રહે. જે અટકે એ છે **નવા નિર્ણય**: નવી policy, નવું provisioning.',
      'The data plane stays in the device and does not need the controller moment to moment, so packets keep moving on the last instructions received. What stops is **new decisions** — new policy, new provisioning.',
    ),
  },
}

/* ═══════════════════ n6l2 · REST APIs and JSON ═══════════════════ */

export const n6l2: LessonSpec = {
  why: {
    gu: 'CLI માણસ માટે બનેલું છે. `show ip interface brief` નો જવાબ સુંદર ગોઠવેલું **લખાણ** છે — અને program માટે એ વાંચવું દુઃસ્વપ્ન. API એ જ માહિતી એવા આકારમાં આપે જે code સીધું સમજે.',
    en: 'The CLI is built for a person. The answer to `show ip interface brief` is beautifully arranged **text** — and a nightmare for a program to read. An API hands you the same information in a shape code understands directly.',
  },
  steps: [
    {
      ms: 3200,
      label: H('લખાણ ચીરવાની તકલીફ', 'The pain of slicing text'),
      text: {
        beginner: {
          gu: 'Script થી CLI વાપરો તો તમારે **ગણવું** પડે: ત્રીજી લાઇન, સત્તરમો અક્ષર. પછી કોઈ IOS upgrade કરે, એક column ખસે, અને તમારું script ચૂપચાપ ખોટો જવાબ આપવા માંડે. એ ભૂલ પકડાતી નથી — એ જ સૌથી ખતરનાક છે.',
          en: 'Drive the CLI from a script and you end up **counting**: third line, seventeenth character. Then somebody upgrades IOS, a column shifts, and your script quietly starts returning the wrong answer. Nothing errors. That is what makes it dangerous.',
        },
        exam: {
          gu: 'એને screen scraping કહે છે. ચાલે છે, પણ નાજુક. એટલે જ આધુનિક ઉપકરણો API આપે છે — અને એ જ CCNA ના automation domain નો મુદ્દો છે.',
          en: 'This is screen scraping. It works, but it is brittle. Which is precisely why modern devices expose APIs — and why the automation domain exists in CCNA at all.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's', x: 180, y: 210, type: 'laptop', label: 'your script', sub: t > 0.5 ? 'reading column 17…' : undefined, accent: t > 0.5 ? WARN : BEG },
          { id: 'r', x: 620, y: 210, type: 'router', label: 'R1', sub: t > 0.6 ? 'IOS upgraded' : undefined, accent: t > 0.6 ? ERR : CCNA, pulse: t > 0.6 },
        ],
        links: [{ id: 'l', from: 's', to: 'r', state: 'up', flowing: true, label: 'SSH' }],
        packets: [
          { id: 'p', from: 'r', to: 's', t: 0.15 + ease(Math.min(1, t)) * 0.7, color: t > 0.6 ? ERR : 'var(--nq-pkt-data)', label: t > 0.6 ? 'columns moved' : 'text, nicely lined up' },
        ],
      }),
      aside: (t) => ({
        title: H('Script શું જુએ છે', 'What the script sees'),
        caption: t > 0.6
          ? H('એક column ખસ્યો. Script ને ખબર નથી.', 'One column moved. The script has no idea.')
          : H('માણસ માટે સુંદર, code માટે નહીં.', 'Lovely for a person, not for code.'),
        head: ['what it wanted', 'how it had to get it'],
        rows: [
          ['the IP address', 'characters 23 to 38 of line 3'],
          ['the status', t > 0.6 ? 'characters 40 to 46 — now wrong' : 'characters 40 to 46'],
        ],
      }),
    },
    {
      ms: 3200,
      label: H('JSON — code વાંચી શકે એવો આકાર', 'JSON — a shape code can read'),
      text: {
        beginner: {
          gu: 'JSON એ માહિતીને **નામ અને કિંમત** ની જોડીમાં ગોઠવે. `"status": "up"` — કોઈ ગણતરી નહીં, કોઈ column નહીં. Program સીધું નામ માગે અને કિંમત મળે. Column ખસે તોય કશું તૂટતું નથી, કારણ કે ત્યાં column છે જ નહીં.',
          en: 'JSON arranges information as **name and value** pairs. `"status": "up"` — no counting, no columns. A program asks for the name and gets the value. Columns can move all they like, because there are none.',
        },
        exam: {
          gu: 'JSON માં: `{}` object (નામ-કિંમતની જોડી), `[]` array (ક્રમમાં યાદી), `""` string, સાદો આંકડો number, અને `true`/`false`/`null`. XML જૂનો વિકલ્પ, YAML માણસ માટે વધુ વાંચવા જેવો (Ansible એ વાપરે).',
          en: 'JSON uses `{}` for an object of name-value pairs, `[]` for an ordered array, `""` for strings, bare digits for numbers, plus `true`, `false` and `null`. XML is the older alternative; YAML is the more human-readable one, which is what Ansible uses.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's', x: 180, y: 210, type: 'laptop', label: 'your script', sub: t > 0.5 ? 'asks for "status"' : undefined, accent: t > 0.5 ? OK : BEG, pulse: t > 0.5 },
          { id: 'r', x: 620, y: 210, type: 'router', label: 'R1', accent: CCNA },
        ],
        links: [{ id: 'l', from: 's', to: 'r', state: 'up', flowing: true, label: 'HTTPS' }],
        packets: [
          { id: 'p', from: 'r', to: 's', t: 0.15 + ease(Math.min(1, t)) * 0.7, color: 'var(--nq-ok)', label: '{ "status": "up" }' },
        ],
      }),
      aside: () => ({
        title: H('JSON ના ભાગ', 'The pieces of JSON'),
        head: ['symbol', 'means', 'example'],
        rows: [
          ['{ }', 'an object — named values', '{ "name": "Gi0/1" }'],
          ['[ ]', 'an array — a list in order', '[ "Gi0/1", "Gi0/2" ]'],
          ['" "', 'text', '"up"'],
          ['123', 'a number — no quotes', '1500'],
        ],
      }),
    },
    {
      ms: 3400,
      label: H('REST — ચાર ક્રિયાપદ', 'REST — four verbs'),
      text: {
        beginner: {
          gu: 'REST API વેબ જેવી જ રીતે કામ કરે. દરેક વસ્તુનું એક સરનામું (URL) હોય, અને તમે એના પર **ચાર ક્રિયાપદ** માંથી એક વાપરો: `GET` વાંચવા, `POST` નવું બનાવવા, `PUT` બદલવા, `DELETE` કાઢવા. બસ એટલું જ — આખી API એ ચાર પર ઊભી છે.',
          en: 'A REST API works the way the web does. Everything has an address (a URL) and you use one of **four verbs** on it: `GET` to read, `POST` to create, `PUT` to change, `DELETE` to remove. That is all there is — the whole API rests on those four.',
        },
        exam: {
          gu: 'HTTPS (443) પર ચાલે. જવાબમાં status code આવે: 200 OK, 201 બન્યું, 401 તમે કોણ?, 403 તમને પરવાનગી નથી, 404 મળ્યું નહીં, 500 server ની ભૂલ. Cisco માં RESTCONF (REST + YANG) અને NETCONF (XML, SSH પર).',
          en: 'It runs over HTTPS on 443 and replies with a status code: 200 OK, 201 created, 401 who are you, 403 not allowed, 404 not found, 500 the server broke. On Cisco kit this is RESTCONF (REST plus YANG) and NETCONF (XML over SSH).',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's', x: 180, y: 210, type: 'laptop', label: 'your code', accent: BEG },
          { id: 'r', x: 620, y: 210, type: 'router', label: 'R1', sub: t > 0.55 ? 'changed' : undefined, accent: t > 0.55 ? OK : CCNA, pulse: t > 0.55 },
        ],
        links: [{ id: 'l', from: 's', to: 'r', state: 'up', flowing: true }],
        packets:
          t < 0.5
            ? [{ id: 'q', from: 's', to: 'r', t: 0.15 + ease(t / 0.5) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'GET /interfaces/Gi0/1' }]
            : [{ id: 'a', from: 'r', to: 's', t: 0.15 + ease((t - 0.5) / 0.5) * 0.7, color: 'var(--nq-ok)', label: '200 OK + JSON' }],
      }),
      aside: () => ({
        title: H('ચાર ક્રિયાપદ', 'The four verbs'),
        head: ['verb', 'does', 'CLI equivalent'],
        rows: [
          ['GET', 'read it', 'show …'],
          ['POST', 'make a new one', 'the first time you configure it'],
          ['PUT', 'change it', 'configuring it again'],
          ['DELETE', 'remove it', 'no …'],
        ],
      }),
    },
    {
      ms: 3200,
      label: H('કોણ પૂછે છે? — token', 'Who is asking? — the token'),
      text: {
        beginner: {
          gu: 'API પર કોઈ પણ આવીને બદલી ન શકે. પહેલાં તમે username/password થી **એક વાર** login કરો અને બદલામાં **token** મળે — એક લાંબો અક્ષરસમૂહ. પછીની દરેક વિનંતી સાથે એ token મોકલો. એ થોડા કલાકમાં પૂરો થઈ જાય, એટલે ચોરાય તોય કાયમી નુકસાન નહીં.',
          en: 'Not just anyone may change things through an API. You log in **once** with a username and password and get back a **token** — a long string of characters. Every request after that carries the token. It expires in a few hours, so a stolen one does limited harm.',
        },
        exam: {
          gu: 'Token HTTP header માં જાય (દા.ત. `X-Auth-Token` કે `Authorization: Bearer …`). 401 એટલે token ખોટો કે પૂરો થયેલો; 403 એટલે token સાચો પણ **આ કામ માટે** પરવાનગી નથી. એ બે ભેળવવા નહીં.',
          en: 'The token travels in an HTTP header, such as `X-Auth-Token` or `Authorization: Bearer …`. A 401 means the token is wrong or expired; a 403 means the token is fine but you are **not allowed this particular thing**. Do not confuse the two.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 's', x: 180, y: 210, type: 'laptop', label: 'your code', sub: t > 0.5 ? 'has a token' : undefined, accent: t > 0.5 ? OK : BEG },
          { id: 'c', x: 620, y: 210, type: 'server', label: 'Controller', accent: CCNP },
        ],
        links: [{ id: 'l', from: 's', to: 'c', state: 'up', flowing: true }],
        packets:
          t < 0.45
            ? [{ id: 'q', from: 's', to: 'c', t: 0.15 + ease(t / 0.45) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'username + password' }]
            : t < 0.7
              ? [{ id: 'a', from: 'c', to: 's', t: 0.15 + ease((t - 0.45) / 0.25) * 0.7, color: 'var(--nq-ok)', label: 'token: eyJhb…' }]
              : [{ id: 'b', from: 's', to: 'c', t: 0.15 + ease((t - 0.7) / 0.3) * 0.7, color: 'var(--nq-pkt-tcp)', label: 'GET + that token' }],
      }),
      aside: () => ({
        title: H('જવાબના આંકડા', 'The numbers that come back'),
        head: ['code', 'means'],
        rows: [
          ['200', 'here it is'],
          ['201', 'created it'],
          ['401', 'who are you? — bad or expired token'],
          ['403', 'I know you, you may not do that'],
          ['404', 'no such thing'],
        ],
      }),
    },
    {
      ms: 2800,
      label: H('શા માટે આ બધું', 'Why any of this matters'),
      text: {
        beginner: {
          gu: 'એક switch માટે આ બધું વધારે પડતું લાગે — SSH કરીને લખી દેવું સહેલું. પણ **બસો** switch પર એક VLAN ઉમેરવાનું હોય ત્યારે? API સાથે એ એક loop છે. અને એથી વધુ કિંમતી: code એ જ રીતે **તપાસી** પણ શકે — "બધાં ઉપકરણો પર NTP સાચું છે?" બસો login કર્યા વગર.',
          en: 'For one switch this all looks like overkill — SSH in and type it. But what about adding one VLAN across **two hundred** switches? With an API that is a loop. And more valuable still: the same code can **check** as well — "is NTP right on every device?" without two hundred logins.',
        },
        exam: {
          gu: 'એ જ આગળ જતાં "infrastructure as code" બને: configuration git માં રહે, ફેરફાર review થાય, અને જે ચાલે છે એ **લખેલા સાથે મેળ ખાય છે કે નહીં** એ આપોઆપ તપાસાય.',
          en: 'Carried further this becomes infrastructure as code: the configuration lives in git, changes get reviewed, and whether what is running **matches what is written** is checked automatically.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 's', x: 150, y: 210, type: 'laptop', label: 'one loop', sub: 'ten lines of code', accent: OK, pulse: true },
          { id: 'a', x: 560, y: 80, type: 'switch', label: 'SW1', accent: CCNA },
          { id: 'b', x: 560, y: 200, type: 'switch', label: 'SW2', accent: CCNA },
          { id: 'c', x: 560, y: 320, type: 'switch', label: '…SW200', accent: CCNA },
        ],
        links: [
          { id: 'x', from: 's', to: 'a', state: 'up', flowing: true },
          { id: 'y', from: 's', to: 'b', state: 'up', flowing: true },
          { id: 'z', from: 's', to: 'c', state: 'up', flowing: true },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'CLI નો જવાબ માણસ માટેનું લખાણ છે — script એને column ગણીને વાંચે, અને એ નાજુક છે. JSON નામ-કિંમતની જોડી આપે, એટલે code સીધું માગી લે. REST ચાર ક્રિયાપદ પર ચાલે: **GET, POST, PUT, DELETE**, HTTPS પર, token સાથે. 401 એટલે "તમે કોણ?", 403 એટલે "તમને પરવાનગી નથી".',
    en: 'A CLI answer is text for a human — a script reads it by counting columns, and that is brittle. JSON gives name-value pairs, so code asks for what it wants. REST runs on four verbs — **GET, POST, PUT, DELETE** — over HTTPS, carrying a token. A 401 means "who are you?"; a 403 means "not allowed".',
  },
  check: {
    q: H(
      'API પર `GET` મોકલ્યું અને `403` આવ્યું. શું થયું?',
      'You sent a `GET` to an API and got back `403`. What does that mean?',
    ),
    options: [
      H('Token સાચો છે, પણ આ કામ માટે પરવાનગી નથી', 'The token is valid, but you are not allowed this'),
      H('Token ખોટો કે પૂરો થયેલો છે', 'The token is wrong or has expired'),
      H('એવું કશું છે જ નહીં', 'No such thing exists'),
    ],
    answer: 0,
    explain: H(
      '**401** એટલે "તમે કોણ?" — token ખોટો કે પૂરો થયેલો. **403** એટલે "તમને ઓળખ્યા, પણ આ તમારું કામ નથી". અને 404 એટલે વસ્તુ જ નથી. ત્રણે જુદા છે, અને troubleshooting માં એ ફરક બહુ કામ આવે છે.',
      '**401** is "who are you?" — a bad or expired token. **403** is "I know you, and this is not yours to do". A 404 means the thing itself is not there. All three are different, and the distinction saves a lot of time.',
    ),
  },
}

/* ═══════════════ n6l3 · Ansible, Puppet and Chef ═══════════════ */

export const n6l3: LessonSpec = {
  why: {
    gu: 'સો ઉપકરણ પર એક જ ફેરફાર હાથે કરો તો બે વસ્તુ નક્કી છે: બહુ સમય જશે, અને **ક્યાંક એક ભૂલ થશે**. અને એ એક ભૂલ મહિનાઓ સુધી છુપાયેલી રહેશે.',
    en: 'Make the same change on a hundred devices by hand and two things are certain: it will take a long time, and **somewhere you will make a mistake**. And that one mistake will stay hidden for months.',
  },
  steps: [
    {
      ms: 3000,
      label: H('એકસોમી વાર એ જ કામ', 'The hundredth time, the same job'),
      text: {
        beginner: {
          gu: 'નવો syslog server આવ્યો, બધાં ઉપકરણો પર સરનામું બદલવાનું છે. એક ઉપકરણ પર ત્રીસ સેકન્ડ. સો ઉપકરણ એટલે લગભગ એક કલાક — અને ત્રીસમા પછી ધ્યાન ઓછું થવા લાગે. એ જ જગ્યાએ ભૂલ બેસે છે.',
          en: 'A new syslog server arrives and its address has to change on every device. Thirty seconds each. A hundred devices is the best part of an hour — and somewhere after the thirtieth, attention starts to slip. That is where the mistake goes in.',
        },
        exam: {
          gu: 'એને configuration drift કહે છે: ઉપકરણો ધીમે ધીમે એકબીજાથી જુદાં પડે. અને જે ઉપકરણ જુદું છે એ જ અડધી રાતે વાંધો કરે.',
          en: 'This is configuration drift: devices slowly diverging from each other. And it is always the one that diverged that fails in the middle of the night.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'u', x: 150, y: 210, type: 'laptop', label: 'you', sub: t > 0.5 ? '31st device…' : '1st device', accent: t > 0.5 ? WARN : BEG, pulse: true },
          { id: 'a', x: 500, y: 90, type: 'switch', label: 'SW1', sub: 'done ✓', accent: OK },
          { id: 'b', x: 500, y: 210, type: 'switch', label: 'SW2', sub: t > 0.5 ? 'typo — 10.1.1.99' : 'done ✓', accent: t > 0.5 ? ERR : OK },
          { id: 'c', x: 500, y: 330, type: 'switch', label: '…SW100', sub: 'not yet', accent: MUTE },
        ],
        links: [
          { id: 'x', from: 'u', to: 'a', state: 'up' },
          { id: 'y', from: 'u', to: 'b', state: 'up', flowing: true },
          { id: 'z', from: 'u', to: 'c', state: 'idle' },
        ],
      }),
      say: (t) => (t > 0.6 ? { nodeId: 'b', text: H('કોઈને ખબર નહીં પડે', 'nobody will notice') } : null),
    },
    {
      ms: 3200,
      label: H('જોઈતી હાલત લખો, પગલાં નહીં', 'Write the state you want, not the steps'),
      text: {
        beginner: {
          gu: 'Automation tool ને તમે script નથી આપતા. તમે **જોઈતી હાલત** લખો: "દરેક switch પર syslog server 10.1.1.5 હોવો જોઈએ". Tool દરેક ઉપકરણ પર જઈને જુએ — પહેલેથી સાચું છે? તો કશું ન કરે. ખોટું છે? તો ઠીક કરે.',
          en: 'You do not hand an automation tool a script. You write the **state you want**: "every switch must have syslog server 10.1.1.5". The tool visits each device and looks — already correct? then do nothing. Wrong? then fix it.',
        },
        exam: {
          gu: 'એને **idempotent** કહે છે: એ જ વસ્તુ દસ વાર ચલાવો, પરિણામ એક જ. એટલે ગભરાયા વગર ફરી ચલાવી શકાય — અને એ જ એને script થી અલગ પાડે છે.',
          en: 'This property is called **idempotence**: run the same thing ten times and the result is identical. So you can re-run it without fear — and that is exactly what separates it from a script.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'f', x: 150, y: 210, type: 'laptop', label: 'one file', sub: 'syslog = 10.1.1.5', accent: OK, pulse: true },
          { id: 'a', x: 560, y: 90, type: 'switch', label: 'SW1', sub: t > 0.45 ? 'already right — skipped' : undefined, accent: t > 0.45 ? MUTE : CCNA },
          { id: 'b', x: 560, y: 210, type: 'switch', label: 'SW2', sub: t > 0.45 ? 'wrong — fixed' : undefined, accent: t > 0.45 ? OK : CCNA, pulse: t > 0.45 },
          { id: 'c', x: 560, y: 330, type: 'switch', label: 'SW3', sub: t > 0.45 ? 'already right — skipped' : undefined, accent: t > 0.45 ? MUTE : CCNA },
        ],
        links: [
          { id: 'x', from: 'f', to: 'a', state: 'up', flowing: t > 0.3 },
          { id: 'y', from: 'f', to: 'b', state: 'up', flowing: t > 0.3 },
          { id: 'z', from: 'f', to: 'c', state: 'up', flowing: t > 0.3 },
        ],
      }),
      aside: (t) => ({
        title: H('Tool એ શું કર્યું', 'What the tool did'),
        caption: H('ફક્ત જે ખોટું હતું એને જ અડ્યું.', 'It touched only what was wrong.'),
        head: ['device', 'found', 'action'],
        rows: t > 0.45 ? [
          ['SW1', '10.1.1.5', 'nothing — already correct'],
          ['SW2', '10.1.1.99', 'changed'],
          ['SW3', '10.1.1.5', 'nothing — already correct'],
        ] : [],
        empty: H('હજી ચલાવ્યું નથી…', 'not run yet…'),
      }),
    },
    {
      ms: 3200,
      label: H('Push કે pull', 'Push or pull'),
      text: {
        beginner: {
          gu: 'બે રીત છે. **Ansible** push કરે: તમારા લેપટોપ પરથી SSH કરીને ઉપકરણો પર ફેરફાર ધકેલે. ઉપકરણ પર કશું install કરવું ન પડે — network ઉપકરણો માટે એ મોટો ફાયદો છે. **Puppet અને Chef** pull કરે: દરેક ઉપકરણ પર એક agent ચાલે જે દર અડધા કલાકે server પાસે જઈને પૂછે "મારે કેવા હોવું જોઈએ?"',
          en: 'There are two shapes. **Ansible** pushes: it SSHes out from your laptop and applies the change. Nothing has to be installed on the device, which is a large advantage for network kit. **Puppet and Chef** pull: an agent on each device asks a server every half hour "what should I look like?"',
        },
        exam: {
          gu: 'Ansible agentless, YAML માં playbook, SSH/NETCONF વાપરે — એટલે Cisco ઉપકરણો માટે સૌથી વપરાતું. Puppet અને Chef ને agent જોઈએ, એટલે એ server માટે વધુ અનુકૂળ છે. Terraform એથી જુદું: એ cloud સંસાધનો *બનાવે* છે.',
          en: 'Ansible is agentless, writes playbooks in YAML and uses SSH or NETCONF, which makes it the common choice for Cisco kit. Puppet and Chef need an agent, which suits servers better. Terraform is a different thing again: it *creates* cloud resources.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'ans', x: 150, y: 110, type: 'laptop', label: 'Ansible', sub: 'pushes out', accent: OK, pulse: t < 0.5 },
          { id: 'd1', x: 460, y: 110, type: 'switch', label: 'SW1', sub: 'no agent needed', accent: CCNA },
          { id: 'srv', x: 760, y: 320, type: 'server', label: 'Puppet server', accent: CCNP, pulse: t > 0.5 },
          { id: 'd2', x: 420, y: 330, type: 'server', label: 'a server', sub: 'runs an agent', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'ans', to: 'd1', state: 'up', flowing: t < 0.5, label: 'SSH' },
          { id: 'b', from: 'd2', to: 'srv', state: 'up', flowing: t > 0.5, label: 'asks' },
        ],
        packets:
          t < 0.5
            ? [{ id: 'p', from: 'ans', to: 'd1', t: 0.15 + ease(t / 0.5) * 0.7, color: 'var(--nq-pkt-ctrl)', label: 'here is the change' }]
            : [{ id: 'q', from: 'd2', to: 'srv', t: 0.15 + ease((t - 0.5) / 0.5) * 0.7, color: 'var(--nq-pkt-tcp)', label: 'what should I be?' }],
      }),
      aside: () => ({
        title: H('બે રીત', 'The two shapes'),
        head: ['', 'Ansible', 'Puppet / Chef'],
        rows: [
          ['direction', 'push, from you', 'pull, by the device'],
          ['agent on the device', 'none', 'required'],
          ['written in', 'YAML', 'its own language'],
          ['suits', 'network devices', 'servers'],
        ],
      }),
    },
    {
      ms: 3000,
      label: H('પહેલાં કોરું ચલાવો', 'Run it dry first'),
      text: {
        beginner: {
          gu: 'એક જ આદેશથી સો ઉપકરણ બદલાય — એટલે એક જ ભૂલથી સો ઉપકરણ **તૂટે**. એટલે દરેક સારા tool માં "કોરું ચલાવો" છે: એ તપાસે અને કહે કે **શું બદલાત**, પણ કશું અડે નહીં. વાંચો, પછી ખરેખર ચલાવો.',
          en: 'One command changes a hundred devices — which means one mistake **breaks** a hundred devices. So every decent tool has a dry run: it checks and reports **what would change**, touching nothing. Read it, then run it for real.',
        },
        exam: {
          gu: 'Ansible માં `--check` (અને જોવા માટે `--diff`). પહેલાં એક ઉપકરણ પર ચલાવો (`--limit`), પછી બધા પર. અને playbook git માં રાખો — એટલે કોણે, ક્યારે, શું બદલ્યું એ હંમેશા જાણી શકાય.',
          en: 'In Ansible that is `--check`, with `--diff` to see it. Run against one device first with `--limit`, then the rest. And keep the playbook in git, so who changed what, and when, is always answerable.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'u', x: 150, y: 210, type: 'laptop', label: t > 0.5 ? 'now for real' : '--check', sub: t > 0.5 ? 'applying' : 'touching nothing', accent: t > 0.5 ? OK : WARN, pulse: true },
          { id: 'a', x: 560, y: 110, type: 'switch', label: 'SW1', sub: t > 0.5 ? 'changed' : 'would change', accent: t > 0.5 ? OK : MUTE },
          { id: 'b', x: 560, y: 310, type: 'switch', label: 'SW2', sub: t > 0.5 ? 'changed' : 'would change', accent: t > 0.5 ? OK : MUTE },
        ],
        links: [
          { id: 'x', from: 'u', to: 'a', state: 'up', flowing: true },
          { id: 'y', from: 'u', to: 'b', state: 'up', flowing: true },
        ],
      }),
      aside: (t) => ({
        title: t > 0.5 ? H('ખરેખર ચલાવ્યું', 'Applied for real') : H('કોરું ચલાવ્યું', 'Dry run'),
        head: ['device', t > 0.5 ? 'result' : 'would do'],
        rows: [
          ['SW1', t > 0.5 ? 'changed ✓' : 'set syslog to 10.1.1.5'],
          ['SW2', t > 0.5 ? 'changed ✓' : 'set syslog to 10.1.1.5'],
        ],
      }),
    },
    {
      ms: 2800,
      label: H('ખરો ફાયદો: ભરોસો', 'The real gain: confidence'),
      text: {
        beginner: {
          gu: 'લોકો વિચારે છે કે automation નો ફાયદો **ઝડપ** છે. એ સાચું, પણ નાનું. ખરો ફાયદો એ છે કે તમે **ખાતરીથી કહી શકો** કે સો ઉપકરણો પર શું છે — કારણ કે એ એક ફાઇલમાં લખેલું છે, અને tool એ ચકાસી શકે છે. હાથે કરેલા નેટવર્કમાં એ જવાબ કોઈ પાસે નથી હોતો.',
          en: 'People think the gain from automation is **speed**. True, but small. The real gain is that you can **say with certainty** what is on a hundred devices — because it is written in one file and the tool can go and verify it. In a hand-built network nobody actually has that answer.',
        },
        exam: {
          gu: 'એટલે જ CCNA માં આ domain છે. તમને Ansible નિષ્ણાત બનાવવાનો હેતુ નથી — હેતુ એ છે કે CLI એ **એકમાત્ર** રસ્તો નથી એ સમજાય, અને API ને જે આકાર જોઈએ એ ખબર હોય.',
          en: 'Which is why this domain exists in CCNA. The aim is not to make you an Ansible expert, but to make it clear that the CLI is not the **only** way in, and that you know the shape an API expects.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'f', x: 180, y: 210, type: 'laptop', label: 'one file, in git', sub: 'the truth', accent: OK, pulse: true },
          { id: 'a', x: 580, y: 90, type: 'switch', label: 'SW1', sub: 'matches ✓', accent: OK },
          { id: 'b', x: 580, y: 210, type: 'switch', label: 'SW2', sub: 'matches ✓', accent: OK },
          { id: 'c', x: 580, y: 330, type: 'switch', label: '…SW100', sub: 'matches ✓', accent: OK },
        ],
        links: [
          { id: 'x', from: 'f', to: 'a', state: 'up', flowing: true },
          { id: 'y', from: 'f', to: 'b', state: 'up', flowing: true },
          { id: 'z', from: 'f', to: 'c', state: 'up', flowing: true },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Automation tool ને પગલાં નહીં, **જોઈતી હાલત** આપો — એટલે દસ વાર ચલાવો તોય પરિણામ એક જ (idempotent). Ansible push કરે અને ઉપકરણ પર agent નથી જોઈતો, એટલે network માટે એ સૌથી અનુકૂળ; Puppet/Chef agent થી pull કરે. **હંમેશા પહેલાં `--check`**. અને ખરો ફાયદો ઝડપ નહીં — ખાતરી છે.',
    en: 'Give an automation tool the **state you want**, not the steps — so running it ten times leaves the same result (idempotence). Ansible pushes and needs no agent on the device, which suits network kit; Puppet and Chef pull via an agent. **Always `--check` first.** And the real gain is not speed, it is certainty.',
  },
  check: {
    q: H(
      'Ansible playbook બીજી વાર ચલાવ્યું, જ્યારે બધું પહેલેથી સાચું છે. શું થશે?',
      'You run an Ansible playbook a second time, when everything is already correct. What happens?',
    ),
    options: [
      H('કશું બદલાશે નહીં — એ idempotent છે', 'Nothing changes — it is idempotent'),
      H('બધું ફરીથી લખાશે અને ઉપકરણો restart થશે', 'Everything is rewritten and the devices restart'),
      H('Configuration બે વાર ઉમેરાઈ જશે', 'The configuration gets added twice'),
    ],
    answer: 0,
    explain: H(
      'Tool પહેલાં **તપાસે** છે કે જોઈતી હાલત પહેલેથી છે કે નહીં. હોય તો એ ઉપકરણને અડતું જ નથી. એટલે જ ગભરાયા વગર ફરી ચલાવી શકાય — અને એ જ એને સાદા script થી અલગ પાડે છે.',
      'The tool **checks** whether the desired state is already in place, and if it is, it leaves the device alone. That is why it can be re-run without worry — and what separates it from a plain script.',
    ),
  },
}
