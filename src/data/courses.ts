import type { TrackId } from '../store/useApp'

export type LessonKind = 'concept' | 'config' | 'lab' | 'project' | 'quiz'

export interface Bi { gu: string; en: string }

export interface Lesson {
  id: string
  title: Bi
  blurb: Bi
  minutes: number
  kind: LessonKind
  /** true once the lesson content is actually implemented */
  ready?: boolean
}

export interface Module {
  id: string
  title: Bi
  /** exam-blueprint weight, e.g. "20%" */
  weight?: string
  lessons: Lesson[]
}

export interface Track {
  id: TrackId
  code: string
  title: Bi
  subtitle: Bi
  prereq: Bi
  accent: string
  hours: number
  modules: Module[]
}

const L = (
  id: string,
  gu: string,
  en: string,
  bgu: string,
  ben: string,
  minutes: number,
  kind: LessonKind = 'concept',
  ready = false,
): Lesson => ({ id, title: { gu, en }, blurb: { gu: bgu, en: ben }, minutes, kind, ready })

/* ───────────────────────── BEGINNER ───────────────────────── */

const beginner: Track = {
  id: 'beginner',
  code: 'FOUNDATION',
  title: { gu: 'Networking Foundation', en: 'Networking Foundation' },
  subtitle: {
    gu: 'શૂન્યથી શરૂ. કોઈ CLI નહીં, કોઈ અઘરા શબ્દ નહીં — ફક્ત ચિત્રો અને સમજ.',
    en: 'Start from zero. No CLI, no jargon — just pictures and understanding.',
  },
  prereq: { gu: 'કોઈ પૂર્વજ્ઞાન જરૂરી નથી', en: 'No prior knowledge needed' },
  accent: 'var(--nq-beginner)',
  hours: 15,
  modules: [
    {
      id: 'b1',
      title: { gu: 'Network એટલે શું?', en: 'What is a Network?' },
      lessons: [
        L('b1l1', 'બે કમ્પ્યુટર વાત કેવી રીતે કરે?', 'How do two computers talk?',
          'બે ડબ્બા, એક વાયર, એક સંદેશ. નેટવર્કિંગ આટલેથી જ શરૂ થાય છે.',
          'Two boxes, one wire, one message. All of networking starts here.', 25, 'concept', true),
        L('b1l2', 'Cable, WiFi અને Signal', 'Cables, WiFi and Signals',
          'ડેટા ખરેખર શેમાં મુસાફરી કરે — તાંબુ, કાચ કે હવા.',
          'What data actually travels through — copper, glass or air.', 20),
        L('b1l3', 'LAN, WAN અને Internet', 'LAN, WAN and the Internet',
          'ઘરથી શહેર અને શહેરથી દુનિયા સુધીનો નકશો.',
          'The map from your home to your city to the world.', 20),
        L('b1l4', 'Client અને Server', 'Clients and Servers',
          'કોણ માગે છે અને કોણ આપે છે — દરેક વાતચીતના બે છેડા.',
          'Who asks and who answers — the two ends of every conversation.', 15),
        L('b1l5', 'નેટવર્કમાં કોણ કોણ હોય', 'The cast of a network',
          'PC, Switch, Router, Firewall, Server — દરેકનું કામ એક વાક્યમાં.',
          'PC, Switch, Router, Firewall, Server — each one in a single line.', 25),
      ],
    },
    {
      id: 'b2',
      title: { gu: 'સરનામાં', en: 'Addresses' },
      lessons: [
        L('b2l1', 'IP Address', 'IP Address',
          'કમ્પ્યુટરનું ઘરનું સરનામું. 192.168.1.1 માં દરેક આંકડો શું કહે છે.',
          'A computer home address. What each number in 192.168.1.1 means.', 30),
        L('b2l2', 'MAC Address', 'MAC Address',
          'જન્મથી મળેલું નામ — કાર્ડ પર છપાયેલું, કદી બદલાતું નથી.',
          'The name you are born with — burned into the card, never changes.', 20),
        L('b2l3', 'IP vs MAC — બંને કેમ?', 'IP vs MAC — why both?',
          'એક જ animation જે આ આખી ગૂંચ કાયમ માટે ઉકેલી દે છે.',
          'The one animation that untangles this confusion for good.', 30),
        L('b2l4', 'Public vs Private IP', 'Public vs Private IP',
          'ઘરનો રૂમ નંબર અને આખા બિલ્ડિંગનું સરનામું — બંનેનો ફરક.',
          'Your room number versus the whole building address.', 25),
        L('b2l5', 'Binary — સહેલી રીતે', 'Binary made easy',
          'આઠ બલ્બ ચાલુ કે બંધ. બસ આટલું જ. ગણિત નહીં, ચિત્ર.',
          'Eight light bulbs, on or off. That is all. A picture, not maths.', 30),
      ],
    },
    {
      id: 'b3',
      title: { gu: 'ડેટા કેવી રીતે પહોંચે', en: 'How data gets there' },
      lessons: [
        L('b3l1', 'Packet એટલે શું', 'What is a packet?',
          'મોટી ફાઈલ કેમ ટુકડામાં વહેંચાઈને જાય છે.',
          'Why a big file is chopped into small pieces before it travels.', 20),
        L('b3l2', 'OSI ના 7 Layers', 'The 7 OSI Layers',
          'સાત માળનું બિલ્ડિંગ — દરેક માળે ડેટા પર એક નવું કવર ચઢે.',
          'A seven-floor building — each floor wraps the data in a new envelope.', 40),
        L('b3l3', 'TCP vs UDP', 'TCP vs UDP',
          'રજિસ્ટર્ડ પોસ્ટ (ખાતરી સાથે) અને સાદું પોસ્ટકાર્ડ (ઝડપી).',
          'Registered post with a receipt, versus a quick postcard.', 30),
        L('b3l4', 'Port Numbers', 'Port Numbers',
          'એક જ ઘરમાં ઘણા દરવાજા — 80, 443, 22, 53 કોના માટે.',
          'Many doors in one house — who 80, 443, 22 and 53 belong to.', 25),
        L('b3l5', 'Protocol એટલે શું', 'What is a protocol?',
          'બે જણ વાત કરવા માટે પહેલેથી નક્કી કરેલા નિયમો.',
          'The rules two machines agree on before they start talking.', 20),
      ],
    },
    {
      id: 'b4',
      title: { gu: 'રોજિંદું Internet', en: 'The Internet you use daily' },
      lessons: [
        L('b4l1', 'google.com ટાઈપ કરો ત્યારે શું થાય', 'What happens when you type google.com',
          'આખો પ્રવાસ, પગલે પગલે. આ એક પાઠ આખો કોર્સ જોડી દે છે.',
          'The whole journey, step by step. The lesson that ties it all together.', 45),
        L('b4l2', 'DNS', 'DNS',
          'નામને નંબરમાં બદલતી ઈન્ટરનેટની ફોનબુક.',
          'The internet phone book, turning names into numbers.', 30),
        L('b4l3', 'DHCP', 'DHCP',
          'આવો, આ તમારું IP, વાપરો — આપોઆપ સરનામું મળવાની રીત.',
          'Here, take this IP — how addresses get handed out automatically.', 25),
        L('b4l4', 'WiFi Router અંદરથી', 'Inside your WiFi router',
          'તમારા ઘરનું નાનું બોક્સ ખરેખર કેટલાં કામ કરે છે.',
          'How many jobs that little box at home is actually doing.', 30),
        L('b4l5', 'Firewall અને સુરક્ષા', 'Firewalls and security',
          'કોણ અંદર આવી શકે અને કોણ નહીં — દરવાજા પરનો ચોકીદાર.',
          'Who gets in and who does not — the guard at the door.', 25),
      ],
    },
  ],
}

/* ───────────────────────── CCNA 200-301 ───────────────────────── */

const ccna: Track = {
  id: 'ccna',
  code: '200-301',
  title: { gu: 'CCNA', en: 'CCNA' },
  subtitle: {
    gu: 'Cisco ના સત્તાવાર છ domain. અહીંથી CLI શરૂ — દરેક topic Learn → Configure → Break.',
    en: 'Six official Cisco domains. CLI starts here — every topic is Learn, Configure, Break.',
  },
  prereq: { gu: 'Beginner કોર્સ પૂરો કર્યા પછી', en: 'After finishing the Beginner track' },
  accent: 'var(--nq-ccna)',
  hours: 60,
  modules: [
    {
      id: 'n1',
      title: { gu: 'Network Fundamentals', en: 'Network Fundamentals' },
      weight: '20%',
      lessons: [
        L('n1l0', 'Command Line સાથે ઓળખાણ', 'Meet the command line',
          'પહેલી વાર terminal સામે. Prompt શું કહે છે, modes ની સીડી, અને ભૂલ થાય ત્યારે શું વાંચવું.',
          'Your first time at a terminal: what the prompt is telling you, the ladder of modes, and what to read when it refuses.', 30, 'concept', true),
        L('n1l1', 'Network Components અને Topology', 'Components and Topology Architectures',
          'Router, Switch, Firewall, AP, Controller — અને કયું ક્યાં બેસે.',
          'Routers, switches, firewalls, APs, controllers — and where each sits.', 35),
        L('n1l2', 'Cabling અને Interfaces', 'Cabling and Interfaces',
          'Copper, Fiber, PoE, duplex અને speed mismatch ની અસર.',
          'Copper, fiber, PoE, and what a duplex or speed mismatch does.', 30),
        L('n1l3', 'IPv4 Addressing', 'IPv4 Addressing',
          'Classes, private ranges, network, host અને broadcast ને જીવંત જુઓ.',
          'Classes, private ranges, network, host and broadcast seen live.', 40),
        L('n1l4', 'Subnetting — Visual Calculator', 'Subnetting — Visual Calculator',
          'Slider ખસેડો, 32 bits રંગ બદલે, બધું આપોઆપ ગણાય.',
          'Drag the slider, watch 32 bits recolour and every value recompute.', 60, 'config'),
        L('n1l5', 'VLSM અને Address Plan', 'VLSM and Address Planning',
          'એક /16 ને આખી કંપનીમાં વિભાગવાર કેવી રીતે વહેંચવું.',
          'How to carve one /16 across a whole company, department by department.', 45, 'lab'),
        L('n1l6', 'IPv6 Addressing', 'IPv6 Addressing',
          'Format, compression, SLAAC અને dual-stack.',
          'Format, compression, SLAAC and dual-stack.', 40),
        L('n1l7', 'Wireless Principles', 'Wireless Principles',
          'Channels, SSID, RF basics અને AP modes.',
          'Channels, SSIDs, RF basics and AP modes.', 30),
      ],
    },
    {
      id: 'n2',
      title: { gu: 'Network Access', en: 'Network Access' },
      weight: '20%',
      lessons: [
        L('n2l1', 'Switching અને MAC Table', 'Switching and the MAC Table',
          'ખાલી ટેબલથી ભરેલા ટેબલ સુધી — flood, learn, forward.',
          'From an empty table to a full one — flood, learn, forward.', 35),
        L('n2l2', 'VLAN', 'VLANs',
          'એક switch, ઘણાં અલગ નેટવર્ક. રંગથી જુઓ અને જાતે બનાવો.',
          'One switch, many separate networks. See it in colour, then build it.', 45, 'config'),
        L('n2l3', 'Trunking અને 802.1Q', 'Trunking and 802.1Q',
          'Tag ચઢતો અને ઊતરતો જુઓ, native VLAN ની ભૂલ પકડો.',
          'Watch the tag go on and come off; catch the native VLAN mistake.', 40, 'config'),
        L('n2l4', 'Inter-VLAN Routing', 'Inter-VLAN Routing',
          'Router-on-a-stick થી L3 Switch SVI સુધી.',
          'From router-on-a-stick to L3 switch SVIs.', 45, 'config'),
        L('n2l5', 'STP', 'Spanning Tree Protocol',
          'Loop બનાવો, broadcast storm જુઓ, પછી STP ને બચાવતો જુઓ.',
          'Build a loop, watch the storm, then watch STP save the network.', 50, 'config'),
        L('n2l6', 'EtherChannel', 'EtherChannel',
          'ઘણી લિંકને એક બનાવવી — LACP અને PAgP.',
          'Bundling many links into one — LACP and PAgP.', 35, 'config'),
        L('n2l7', 'CDP અને LLDP', 'CDP and LLDP',
          'પાડોશી જાતે શોધવા — અને એ કેમ જોખમ પણ છે.',
          'Discovering neighbours automatically — and why that is also a risk.', 20),
      ],
    },
    {
      id: 'n3',
      title: { gu: 'IP Connectivity', en: 'IP Connectivity' },
      weight: '25%',
      lessons: [
        L('n3l1', 'Routing Table કેવી રીતે વંચાય', 'Reading the routing table',
          'Longest Prefix Match ને bit-by-bit થતું જુઓ.',
          'Watch Longest Prefix Match happen bit by bit.', 40),
        L('n3l2', 'AD અને Metric', 'Administrative Distance and Metric',
          'કોના પર વિશ્વાસ કરવો, અને કયો રસ્તો ટૂંકો.',
          'Who to trust, and which path is shorter.', 30),
        L('n3l3', 'Static Routing', 'Static Routing',
          'જાતે રસ્તો લખો અને તરત ટેબલમાં ટપકતો જુઓ.',
          'Write a route by hand and watch it drop into the table.', 45, 'config'),
        L('n3l4', 'Default અને Floating Static', 'Default and Floating Static Routes',
          'Primary લિંક તોડો, backup જીવંત થતી જુઓ.',
          'Break the primary link and watch the backup wake up.', 35, 'config'),
        L('n3l5', 'OSPFv2 — Single Area', 'OSPFv2 — Single Area',
          'Hello થી Full સુધીની state machine, DR/BDR election, SPF tree.',
          'The state machine from Hello to Full, DR/BDR election and the SPF tree.', 75, 'config'),
        L('n3l6', 'FHRP — HSRP', 'First Hop Redundancy — HSRP',
          'Active router બંધ કરો, એક પણ ping ન ખૂટે.',
          'Kill the active router without dropping a single ping.', 40, 'config'),
      ],
    },
    {
      id: 'n4',
      title: { gu: 'IP Services', en: 'IP Services' },
      weight: '10%',
      lessons: [
        L('n4l1', 'DHCP — DORA', 'DHCP — DORA',
          'ચાર packet ઊડે અને PC ને સરનામું મળે.',
          'Four packets fly and the PC gets its address.', 35, 'config'),
        L('n4l2', 'NAT અને PAT', 'NAT and PAT',
          'Packet બહાર નીકળતાં જ એનું IP બદલાતું જુઓ.',
          'Watch a packet change its IP the moment it steps outside.', 45, 'config'),
        L('n4l3', 'NTP, DNS, SNMP, Syslog', 'NTP, DNS, SNMP, Syslog',
          'નેટવર્ક ચલાવવા માટેની રોજિંદી સેવાઓ.',
          'The everyday services that keep a network running.', 35, 'config'),
        L('n4l4', 'QoS પરિચય', 'Introduction to QoS',
          'Voice ને આગળ, download ને પાછળ — કતાર કેવી રીતે ગોઠવાય.',
          'Voice first, downloads later — how the queues are arranged.', 30),
      ],
    },
    {
      id: 'n5',
      title: { gu: 'Security Fundamentals', en: 'Security Fundamentals' },
      weight: '15%',
      lessons: [
        L('n5l1', 'Device Access — SSH અને AAA', 'Device Access — SSH and AAA',
          'Router ને સુરક્ષિત કરવાનું પહેલું પગલું.',
          'The first thing you do to lock down a router.', 30, 'config'),
        L('n5l2', 'ACL', 'Access Control Lists',
          'Packet દરવાજે આવે, નિયમો ઉપરથી નીચે ચેક થાય, implicit deny ની દીવાલ.',
          'A packet hits the door, rules run top to bottom, then the implicit deny wall.', 55, 'config'),
        L('n5l3', 'Port Security', 'Port Security',
          'ખોટું ડિવાઇસ જોડાય અને port બંધ થતો જુઓ.',
          'Plug in the wrong device and watch the port shut itself.', 30, 'config'),
        L('n5l4', 'DHCP Snooping અને DAI', 'DHCP Snooping and DAI',
          'નકલી DHCP server અને ARP spoofing ને રોકવું.',
          'Stopping rogue DHCP servers and ARP spoofing.', 35, 'config'),
        L('n5l5', 'Wireless Security અને VPN', 'Wireless Security and VPNs',
          'WPA2, WPA3, 802.1X અને site-to-site VPN નો ખ્યાલ.',
          'WPA2, WPA3, 802.1X and the idea behind site-to-site VPNs.', 30),
      ],
    },
    {
      id: 'n6',
      title: { gu: 'Automation અને Programmability', en: 'Automation and Programmability' },
      weight: '10%',
      lessons: [
        L('n6l1', 'Controller-based Networking', 'Controller-based Networking',
          'પરંપરાગત vs SDN — control plane ક્યાં ગયું.',
          'Traditional versus SDN — where the control plane went.', 30),
        L('n6l2', 'REST API અને JSON', 'REST APIs and JSON',
          'Network ને કોડથી પૂછવું અને બદલવું.',
          'Asking and changing the network from code.', 35),
        L('n6l3', 'Ansible, Puppet, Chef', 'Ansible, Puppet and Chef',
          'એક સાથે સો ડિવાઇસ કેવી રીતે configure થાય.',
          'How a hundred devices get configured at once.', 25),
      ],
    },
    {
      id: 'n7',
      title: { gu: 'Projects અને Exam', en: 'Projects and Exam' },
      lessons: [
        L('n7l1', 'Project 1 — Home / Small Office', 'Project 1 — Home / Small Office',
          '10 users, ઈન્ટરનેટ, WiFi. પહેલો ખરો ક્લાયન્ટ બ્રીફ.',
          'Ten users, internet, WiFi. Your first real client brief.', 60, 'project'),
        L('n7l2', 'Project 2 — Small Business VLAN', 'Project 2 — Small Business VLAN',
          '50 users, વિભાગ પ્રમાણે અલગ નેટવર્ક, ACL થી અલગ રાખવું.',
          'Fifty users, separated by department, kept apart with ACLs.', 90, 'project'),
        L('n7l3', 'Project 3 — Multi-Branch', 'Project 3 — Multi-Branch',
          '3 ઓફિસ, OSPF multi-area, HSRP અને backup link.',
          'Three offices, OSPF multi-area, HSRP and a backup link.', 120, 'project'),
        L('n7l4', 'CCNA Exam Simulator', 'CCNA Exam Simulator',
          '120 મિનિટ, ટાઈમર સાથે, ખરા exam જેવો.',
          'A hundred and twenty minutes on the clock, built like the real thing.', 120, 'quiz'),
      ],
    },
  ],
}

/* ───────────────────────── CCNP Enterprise ───────────────────────── */

const ccnp: Track = {
  id: 'ccnp',
  code: 'ENCOR + ENARSI',
  title: { gu: 'CCNP Enterprise', en: 'CCNP Enterprise' },
  subtitle: {
    gu: 'ENCOR 350-401 અને ENARSI 300-410. ઊંડાણ, troubleshooting અને મોટા enterprise projects.',
    en: 'ENCOR 350-401 and ENARSI 300-410. Depth, troubleshooting and large enterprise projects.',
  },
  prereq: { gu: 'CCNA પૂરો કર્યા પછી', en: 'After finishing CCNA' },
  accent: 'var(--nq-ccnp)',
  hours: 80,
  modules: [
    {
      id: 'p1',
      title: { gu: 'ENCOR · Architecture અને Virtualization', en: 'ENCOR · Architecture and Virtualization' },
      lessons: [
        L('p1l1', 'Enterprise Design — 3 Tier', 'Enterprise Design — Three Tier',
          'Core, Distribution, Access — અને દરેક સ્તરનું કામ.',
          'Core, distribution, access — and what each layer is for.', 45),
        L('p1l2', 'SD-Access અને Fabric', 'SD-Access and Fabric',
          'Underlay, overlay, અને controller શું કરે.',
          'Underlay, overlay, and what the controller actually does.', 40),
        L('p1l3', 'VRF, GRE અને IPsec', 'VRF, GRE and IPsec',
          'એક જ router માં અલગ અલગ routing tables અને સુરક્ષિત ટનલ.',
          'Separate routing tables inside one router, and secure tunnels.', 50, 'config'),
        L('p1l4', 'LISP અને VXLAN', 'LISP and VXLAN',
          'Location અને identity અલગ કરવાં — fabric નો પાયો.',
          'Separating location from identity — the basis of fabric.', 40),
      ],
    },
    {
      id: 'p2',
      title: { gu: 'ENCOR · Infrastructure', en: 'ENCOR · Infrastructure' },
      lessons: [
        L('p2l1', 'Advanced STP — RSTP અને MST', 'Advanced STP — RSTP and MST',
          'ઝડપી convergence અને ઘણા VLAN માટે એક જ instance.',
          'Faster convergence, and one instance for many VLANs.', 45, 'config'),
        L('p2l2', 'OSPF Multi-Area ઊંડાણમાં', 'OSPF Multi-Area in depth',
          'LSA types 1 થી 7, Stub, Totally Stubby, NSSA, virtual link, summarization.',
          'LSA types 1 to 7, stub, totally stubby, NSSA, virtual links, summarisation.', 90, 'config'),
        L('p2l3', 'EIGRP અને DUAL ઊંડાણમાં', 'EIGRP and DUAL in depth',
          'Successor, Feasible Successor, Query scope અને SIA.',
          'Successor, feasible successor, query scope and SIA.', 70, 'config'),
        L('p2l4', 'BGP — Fundamentals', 'BGP — Fundamentals',
          'eBGP, iBGP, state machine અને attributes.',
          'eBGP, iBGP, the state machine and the attributes.', 80, 'config'),
        L('p2l5', 'BGP — Path Selection', 'BGP — Path Selection',
          '13 પગલાં એક એક કરીને ચલાવો, હારેલા રસ્તા ગ્રે થતા જુઓ.',
          'Step through all thirteen tie-breakers and watch losing paths grey out.', 70, 'config'),
        L('p2l6', 'Multicast અને QoS', 'Multicast and QoS',
          'PIM, IGMP, classification, queuing, policing અને shaping.',
          'PIM, IGMP, classification, queuing, policing and shaping.', 60),
      ],
    },
    {
      id: 'p3',
      title: { gu: 'ENARSI · Advanced Routing', en: 'ENARSI · Advanced Routing' },
      lessons: [
        L('p3l1', 'Redistribution અને એના ફાંદા', 'Redistribution and its traps',
          'Multi-protocol redistribution, routing loop, route-tag થી ઉકેલ.',
          'Multi-protocol redistribution, the loops it causes, and route-tags to fix them.', 75, 'config'),
        L('p3l2', 'Route-map અને PBR', 'Route-maps and PBR',
          'Destination નહીં, source જોઈને રસ્તો નક્કી કરવો.',
          'Choosing a path by source instead of destination.', 55, 'config'),
        L('p3l3', 'BGP Advanced — RR અને Communities', 'BGP Advanced — RR and Communities',
          'Route Reflector, communities, prefix-list filtering, AS-path prepending.',
          'Route reflectors, communities, prefix-list filtering and AS-path prepending.', 80, 'config'),
        L('p3l4', 'DMVPN', 'DMVPN',
          'Phase 1, 2, 3 — hub-and-spoke થી direct spoke-to-spoke સુધી.',
          'Phases 1, 2 and 3 — from hub-and-spoke to direct spoke-to-spoke.', 70, 'config'),
        L('p3l5', 'MPLS અને MP-BGP VPN', 'MPLS and MP-BGP VPN',
          'Label switching અને service provider VPN નો પરિચય.',
          'Label switching and an introduction to service-provider VPNs.', 60),
        L('p3l6', 'VRF-Lite અને IP SLA', 'VRF-Lite and IP SLA',
          'ટ્રાફિક અલગ રાખવો અને લિંક ખરેખર જીવતી છે કે નહીં એ ચકાસવું.',
          'Keeping traffic apart, and testing whether a link is truly alive.', 50, 'config'),
      ],
    },
    {
      id: 'p4',
      title: { gu: 'Troubleshooting અને Projects', en: 'Troubleshooting and Projects' },
      lessons: [
        L('p4l1', 'Structured Troubleshooting', 'Structured Troubleshooting',
          'ક્યાંથી શરૂ કરવું, શું પૂછવું, કઈ show command ક્યારે.',
          'Where to start, what to ask, and which show command when.', 60, 'lab'),
        L('p4l2', 'Project 4 — Enterprise Campus', 'Project 4 — Enterprise Campus',
          '1000+ users, બહુમાળી બિલ્ડિંગ, three-tier, શૂન્ય downtime.',
          'Over a thousand users, multi-floor, three-tier, zero downtime.', 180, 'project'),
        L('p4l3', 'Project 5 — Dual-ISP BGP', 'Project 5 — Dual-ISP BGP',
          'બે ISP, failover, અને traffic engineering બંને દિશામાં.',
          'Two ISPs, failover, and traffic engineering in both directions.', 180, 'project'),
        L('p4l4', 'ENCOR + ENARSI Simulator', 'ENCOR + ENARSI Simulator',
          'બંને exam ના પૂરા ટાઈમ્ડ mock tests.',
          'Full timed mock tests for both exams.', 240, 'quiz'),
      ],
    },
  ],
}

export const TRACKS: Track[] = [beginner, ccna, ccnp]

export const trackById = (id: string) => TRACKS.find((t) => t.id === id)

export function allLessons(t: Track) {
  return t.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id })))
}

export function findLesson(lessonId: string) {
  for (const t of TRACKS) {
    for (const m of t.modules) {
      const idx = m.lessons.findIndex((l) => l.id === lessonId)
      if (idx >= 0) return { track: t, module: m, lesson: m.lessons[idx], index: idx }
    }
  }
  return null
}

/** Flat ordered list of lesson ids in a track, for prev/next navigation. */
export function lessonOrder(t: Track) {
  return allLessons(t).map((l) => l.id)
}

export const KIND_LABEL: Record<LessonKind, Bi> = {
  concept: { gu: 'સમજ', en: 'Concept' },
  config: { gu: 'Configure', en: 'Configure' },
  lab: { gu: 'Lab', en: 'Lab' },
  project: { gu: 'Project', en: 'Project' },
  quiz: { gu: 'Quiz', en: 'Quiz' },
}
