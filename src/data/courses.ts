import type { TrackId } from '../store/useApp'

export type LessonKind = 'concept' | 'config' | 'lab' | 'project' | 'quiz'

export interface Bi { gu: string; en: string; hi?: string }

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
  hi: string,
  en: string,
  bgu: string,
  bhi: string,
  ben: string,
  minutes: number,
  kind: LessonKind = 'concept',
  ready = false,
): Lesson => ({ id, title: { gu, hi, en }, blurb: { gu: bgu, hi: bhi, en: ben }, minutes, kind, ready })

/* ───────────────────────── BEGINNER ───────────────────────── */

const beginner: Track = {
  id: 'beginner',
  code: 'FOUNDATION',
  title: { gu: 'Networking Foundation', hi: 'Networking Foundation', en: 'Networking Foundation' },
  subtitle: {
    gu: 'શૂન્યથી શરૂ. કોઈ CLI નહીં, કોઈ અઘરા શબ્દ નહીં — ફક્ત ચિત્રો અને સમજ.',
    hi: 'शून्य से शुरू। कोई CLI नहीं, कोई कठिन शब्द नहीं — केवल चित्र और समझ।',
    en: 'Start from zero. No CLI, no jargon — just pictures and understanding.',
  },
  prereq: { gu: 'કોઈ પૂર્વજ્ઞાન જરૂરી નથી', hi: 'कोई पूर्वज्ञान आवश्यक नहीं', en: 'No prior knowledge needed' },
  accent: 'var(--nq-beginner)',
  hours: 15,
  modules: [
    {
      id: 'b1',
      title: { gu: 'Network એટલે શું?', hi: 'Network क्या है?', en: 'What is a Network?' },
      lessons: [
        L('b1l1', 'બે કમ્પ્યુટર વાત કેવી રીતે કરે?', 'दो कंप्यूटर बात कैसे करते हैं?', 'How do two computers talk?',
          'બે ડબ્બા, એક વાયર, એક સંદેશ. નેટવર્કિંગ આટલેથી જ શરૂ થાય છે.',
          'दो डिब्बे, एक तार, एक संदेश। नेटवर्किंग यहीं से शुरू होती है।',
          'Two boxes, one wire, one message. All of networking starts here.', 25, 'concept', true),
        L('b1l2', 'Cable, WiFi અને Signal', 'Cable, WiFi और Signal', 'Cables, WiFi and Signals',
          'ડેટા ખરેખર શેમાં મુસાફરી કરે — તાંબુ, કાચ કે હવા.',
          'डेटा असल में किसमें यात्रा करता है — तांबा, कांच या हवा।',
          'What data actually travels through — copper, glass or air.', 20, 'concept', true),
        L('b1l3', 'LAN, WAN અને Internet', 'LAN, WAN और Internet', 'LAN, WAN and the Internet',
          'ઘરથી શહેર અને શહેરથી દુનિયા સુધીનો નકશો.',
          'घर से शहर और शहर से दुनिया तक का नक्शा।',
          'The map from your home to your city to the world.', 20, 'concept', true),
        L('b1l4', 'Client અને Server', 'Client और Server', 'Clients and Servers',
          'કોણ માગે છે અને કોણ આપે છે — દરેક વાતચીતના બે છેડા.',
          'कौन मांगता है और कौन देता है — हर बातचीत के दो सिरे।',
          'Who asks and who answers — the two ends of every conversation.', 15, 'concept', true),
        L('b1l5', 'નેટવર્કમાં કોણ કોણ હોય', 'नेटवर्क में कौन-कौन होता है', 'The cast of a network',
          'PC, Switch, Router, Firewall, Server — દરેકનું કામ એક વાક્યમાં.',
          'PC, Switch, Router, Firewall, Server — हर एक का काम एक वाक्य में।',
          'PC, Switch, Router, Firewall, Server — each one in a single line.', 25, 'concept', true),
      ],
    },
    {
      id: 'b2',
      title: { gu: 'સરનામાં', hi: 'पते', en: 'Addresses' },
      lessons: [
        L('b2l1', 'IP Address', 'IP Address', 'IP Address',
          'કમ્પ્યુટરનું ઘરનું સરનામું. 192.168.1.1 માં દરેક આંકડો શું કહે છે.',
          'कंप्यूटर का घर का पता। 192.168.1.1 में हर अंक क्या कहता है।',
          'A computer home address. What each number in 192.168.1.1 means.', 30, 'concept', true),
        L('b2l2', 'MAC Address', 'MAC Address', 'MAC Address',
          'જન્મથી મળેલું નામ — કાર્ડ પર છપાયેલું, કદી બદલાતું નથી.',
          'जन्म से मिला नाम — कार्ड पर छपा हुआ, कभी बदलता नहीं।',
          'The name you are born with — burned into the card, never changes.', 20, 'concept', true),
        L('b2l3', 'IP vs MAC — બંને કેમ?', 'IP vs MAC — दोनों क्यों?', 'IP vs MAC — why both?',
          'એક જ animation જે આ આખી ગૂંચ કાયમ માટે ઉકેલી દે છે.',
          'एक ही animation जो इस पूरी उलझन को हमेशा के लिए सुलझा देता है।',
          'The one animation that untangles this confusion for good.', 30, 'concept', true),
        L('b2l4', 'Public vs Private IP', 'Public vs Private IP', 'Public vs Private IP',
          'ઘરનો રૂમ નંબર અને આખા બિલ્ડિંગનું સરનામું — બંનેનો ફરક.',
          'घर का कमरा नंबर और पूरी बिल्डिंग का पता — दोनों में फर्क।',
          'Your room number versus the whole building address.', 25, 'concept', true),
        L('b2l5', 'Binary — સહેલી રીતે', 'Binary — आसान तरीके से', 'Binary made easy',
          'આઠ બલ્બ ચાલુ કે બંધ. બસ આટલું જ. ગણિત નહીં, ચિત્ર.',
          'आठ बल्ब चालू या बंद। बस इतना ही। गणित नहीं, चित्र।',
          'Eight light bulbs, on or off. That is all. A picture, not maths.', 30, 'concept', true),
      ],
    },
    {
      id: 'b3',
      title: { gu: 'ડેટા કેવી રીતે પહોંચે', hi: 'डेटा कैसे पहुंचता है', en: 'How data gets there' },
      lessons: [
        L('b3l1', 'Packet એટલે શું', 'Packet क्या है', 'What is a packet?',
          'મોટી ફાઈલ કેમ ટુકડામાં વહેંચાઈને જાય છે.',
          'बड़ी फाइल क्यों टुकड़ों में बंटकर जाती है।',
          'Why a big file is chopped into small pieces before it travels.', 20, 'concept', true),
        L('b3l2', 'OSI ના 7 Layers', 'OSI के 7 Layers', 'The 7 OSI Layers',
          'સાત માળનું બિલ્ડિંગ — દરેક માળે ડેટા પર એક નવું કવર ચઢે.',
          'सात मंजिला बिल्डिंग — हर मंजिल पर डेटा पर एक नया कवर चढ़ता है।',
          'A seven-floor building — each floor wraps the data in a new envelope.', 40, 'concept', true),
        L('b3l3', 'TCP vs UDP', 'TCP vs UDP', 'TCP vs UDP',
          'રજિસ્ટર્ડ પોસ્ટ (ખાતરી સાથે) અને સાદું પોસ્ટકાર્ડ (ઝડપી).',
          'रजिस्टर्ड पोस्ट (रसीद के साथ) बनाम साधारण पोस्टकार्ड (तेज)।',
          'Registered post with a receipt, versus a quick postcard.', 30, 'concept', true),
        L('b3l4', 'Port Numbers', 'Port Numbers', 'Port Numbers',
          'એક જ ઘરમાં ઘણા દરવાજા — 80, 443, 22, 53 કોના માટે.',
          'एक ही घर में कई दरवाजे — 80, 443, 22, 53 किसके लिए।',
          'Many doors in one house — who 80, 443, 22 and 53 belong to.', 25, 'concept', true),
        L('b3l5', 'Protocol એટલે શું', 'Protocol क्या है', 'What is a protocol?',
          'બે જણ વાત કરવા માટે પહેલેથી નક્કી કરેલા નિયમો.',
          'दो मशीनें बात शुरू करने से पहले जिन नियमों पर सहमत होती हैं।',
          'The rules two machines agree on before they start talking.', 20, 'concept', true),
      ],
    },
    {
      id: 'b4',
      title: { gu: 'રોજિંદું Internet', hi: 'रोज़ाना का Internet', en: 'The Internet you use daily' },
      lessons: [
        L('b4l1', 'google.com ટાઈપ કરો ત્યારે શું થાય', 'google.com टाइप करते ही क्या होता है', 'What happens when you type google.com',
          'આખો પ્રવાસ, પગલે પગલે. આ એક પાઠ આખો કોર્સ જોડી દે છે.',
          'पूरी यात्रा, कदम-दर-कदम। यह एक पाठ पूरे कोर्स को जोड़ देता है।',
          'The whole journey, step by step. The lesson that ties it all together.', 45, 'concept', true),
        L('b4l2', 'DNS', 'DNS', 'DNS',
          'નામને નંબરમાં બદલતી ઈન્ટરનેટની ફોનબુક.',
          'नाम को नंबर में बदलती Internet की फोनबुक।',
          'The internet phone book, turning names into numbers.', 30, 'concept', true),
        L('b4l3', 'DHCP', 'DHCP', 'DHCP',
          'આવો, આ તમારું IP, વાપરો — આપોઆપ સરનામું મળવાની રીત.',
          'लो, यह आपका IP, इस्तेमाल करो — पते अपने आप कैसे मिलते हैं।',
          'Here, take this IP — how addresses get handed out automatically.', 25, 'concept', true),
        L('b4l4', 'WiFi Router અંદરથી', 'WiFi Router अंदर से', 'Inside your WiFi router',
          'તમારા ઘરનું નાનું બોક્સ ખરેખર કેટલાં કામ કરે છે.',
          'आपके घर का छोटा सा बॉक्स असल में कितने काम करता है।',
          'How many jobs that little box at home is actually doing.', 30, 'concept', true),
        L('b4l5', 'Firewall અને સુરક્ષા', 'Firewall और सुरक्षा', 'Firewalls and security',
          'કોણ અંદર આવી શકે અને કોણ નહીં — દરવાજા પરનો ચોકીદાર.',
          'कौन अंदर आ सकता है और कौन नहीं — दरवाज़े पर खड़ा पहरेदार।',
          'Who gets in and who does not — the guard at the door.', 25, 'concept', true),
      ],
    },
  ],
}

/* ───────────────────────── CCNA 200-301 ───────────────────────── */

const ccna: Track = {
  id: 'ccna',
  code: '200-301',
  title: { gu: 'CCNA', hi: 'CCNA', en: 'CCNA' },
  subtitle: {
    gu: 'Cisco ના સત્તાવાર છ domain. અહીંથી CLI શરૂ — દરેક topic Learn → Configure → Break.',
    hi: 'Cisco के आधिकारिक छह domain. यहीं से CLI शुरू — हर topic Learn → Configure → Break।',
    en: 'Six official Cisco domains. CLI starts here — every topic is Learn, Configure, Break.',
  },
  prereq: { gu: 'Beginner કોર્સ પૂરો કર્યા પછી', hi: 'Beginner कोर्स पूरा करने के बाद', en: 'After finishing the Beginner track' },
  accent: 'var(--nq-ccna)',
  hours: 60,
  modules: [
    {
      id: 'n1',
      title: { gu: 'Network Fundamentals', hi: 'Network Fundamentals', en: 'Network Fundamentals' },
      weight: '20%',
      lessons: [
        L('n1l0', 'Command Line સાથે ઓળખાણ', 'Command Line से परिचय', 'Meet the command line',
          'પહેલી વાર terminal સામે. Prompt શું કહે છે, modes ની સીડી, અને ભૂલ થાય ત્યારે શું વાંચવું.',
          'पहली बार terminal के सामने। Prompt क्या कह रहा है, modes की सीढ़ी, और गलती होने पर क्या पढ़ना है।',
          'Your first time at a terminal: what the prompt is telling you, the ladder of modes, and what to read when it refuses.', 30, 'concept', true),
        L('n1l1', 'Network Components અને Topology', 'Network Components और Topology', 'Components and Topology Architectures',
          'Router, Switch, Firewall, AP, Controller — અને કયું ક્યાં બેસે.',
          'Router, Switch, Firewall, AP, Controller — और कौन कहां बैठता है।',
          'Routers, switches, firewalls, APs, controllers — and where each sits.', 35),
        L('n1l2', 'Cabling અને Interfaces', 'Cabling और Interfaces', 'Cabling and Interfaces',
          'Copper, Fiber, PoE, duplex અને speed mismatch ની અસર.',
          'Copper, Fiber, PoE, duplex और speed mismatch का असर।',
          'Copper, fiber, PoE, and what a duplex or speed mismatch does.', 30),
        L('n1l3', 'IPv4 Addressing', 'IPv4 Addressing', 'IPv4 Addressing',
          'Classes, private ranges, network, host અને broadcast ને જીવંત જુઓ.',
          'Classes, private ranges, network, host और broadcast को लाइव देखें।',
          'Classes, private ranges, network, host and broadcast seen live.', 40),
        L('n1l4', 'Subnetting — Visual Calculator', 'Subnetting — Visual Calculator', 'Subnetting — Visual Calculator',
          'Slider ખસેડો, 32 bits રંગ બદલે, બધું આપોઆપ ગણાય.',
          'Slider खिसकाएं, 32 bits रंग बदलें, सब कुछ अपने आप गणना हो।',
          'Drag the slider, watch 32 bits recolour and every value recompute.', 60, 'config'),
        L('n1l5', 'VLSM અને Address Plan', 'VLSM और Address Plan', 'VLSM and Address Planning',
          'એક /16 ને આખી કંપનીમાં વિભાગવાર કેવી રીતે વહેંચવું.',
          'एक /16 को पूरी कंपनी में विभाग के अनुसार कैसे बांटें।',
          'How to carve one /16 across a whole company, department by department.', 45, 'lab'),
        L('n1l6', 'IPv6 Addressing', 'IPv6 Addressing', 'IPv6 Addressing',
          'Format, compression, SLAAC અને dual-stack.',
          'Format, compression, SLAAC और dual-stack।',
          'Format, compression, SLAAC and dual-stack.', 40),
        L('n1l7', 'Wireless Principles', 'Wireless Principles', 'Wireless Principles',
          'Channels, SSID, RF basics અને AP modes.',
          'Channels, SSID, RF basics और AP modes।',
          'Channels, SSIDs, RF basics and AP modes.', 30),
      ],
    },
    {
      id: 'n2',
      title: { gu: 'Network Access', hi: 'Network Access', en: 'Network Access' },
      weight: '20%',
      lessons: [
        L('n2l1', 'Switching અને MAC Table', 'Switching और MAC Table', 'Switching and the MAC Table',
          'ખાલી ટેબલથી ભરેલા ટેબલ સુધી — flood, learn, forward.',
          'खाली टेबल से भरे टेबल तक — flood, learn, forward।',
          'From an empty table to a full one — flood, learn, forward.', 35),
        L('n2l2', 'VLAN', 'VLAN', 'VLANs',
          'એક switch, ઘણાં અલગ નેટવર્ક. રંગથી જુઓ અને જાતે બનાવો.',
          'एक switch, कई अलग network. रंग से देखें और खुद बनाएं।',
          'One switch, many separate networks. See it in colour, then build it.', 45, 'config'),
        L('n2l3', 'Trunking અને 802.1Q', 'Trunking और 802.1Q', 'Trunking and 802.1Q',
          'Tag ચઢતો અને ઊતરતો જુઓ, native VLAN ની ભૂલ પકડો.',
          'Tag को चढ़ते और उतरते देखें, native VLAN की गलती पकड़ें।',
          'Watch the tag go on and come off; catch the native VLAN mistake.', 40, 'config'),
        L('n2l4', 'Inter-VLAN Routing', 'Inter-VLAN Routing', 'Inter-VLAN Routing',
          'Router-on-a-stick થી L3 Switch SVI સુધી.',
          'Router-on-a-stick से L3 Switch SVI तक।',
          'From router-on-a-stick to L3 switch SVIs.', 45, 'config'),
        L('n2l5', 'STP', 'STP', 'Spanning Tree Protocol',
          'Loop બનાવો, broadcast storm જુઓ, પછી STP ને બચાવતો જુઓ.',
          'Loop बनाएं, broadcast storm देखें, फिर STP को बचाते देखें।',
          'Build a loop, watch the storm, then watch STP save the network.', 50, 'config'),
        L('n2l6', 'EtherChannel', 'EtherChannel', 'EtherChannel',
          'ઘણી લિંકને એક બનાવવી — LACP અને PAgP.',
          'कई link को एक बनाना — LACP और PAgP।',
          'Bundling many links into one — LACP and PAgP.', 35, 'config'),
        L('n2l7', 'CDP અને LLDP', 'CDP और LLDP', 'CDP and LLDP',
          'પાડોશી જાતે શોધવા — અને એ કેમ જોખમ પણ છે.',
          'पड़ोसी अपने आप खोजना — और यह जोखिम भी क्यों है।',
          'Discovering neighbours automatically — and why that is also a risk.', 20),
      ],
    },
    {
      id: 'n3',
      title: { gu: 'IP Connectivity', hi: 'IP Connectivity', en: 'IP Connectivity' },
      weight: '25%',
      lessons: [
        L('n3l1', 'Routing Table કેવી રીતે વંચાય', 'Routing Table कैसे पढ़ें', 'Reading the routing table',
          'Longest Prefix Match ને bit-by-bit થતું જુઓ.',
          'Longest Prefix Match को bit-by-bit होते देखें।',
          'Watch Longest Prefix Match happen bit by bit.', 40),
        L('n3l2', 'AD અને Metric', 'AD और Metric', 'Administrative Distance and Metric',
          'કોના પર વિશ્વાસ કરવો, અને કયો રસ્તો ટૂંકો.',
          'किस पर भरोसा करें, और कौन सा रास्ता छोटा है।',
          'Who to trust, and which path is shorter.', 30),
        L('n3l3', 'Static Routing', 'Static Routing', 'Static Routing',
          'જાતે રસ્તો લખો અને તરત ટેબલમાં ટપકતો જુઓ.',
          'खुद रास्ता लिखें और उसे तुरंत table में आते देखें।',
          'Write a route by hand and watch it drop into the table.', 45, 'config'),
        L('n3l4', 'Default અને Floating Static', 'Default और Floating Static', 'Default and Floating Static Routes',
          'Primary લિંક તોડો, backup જીવંત થતી જુઓ.',
          'Primary link तोड़ें, backup को जीवित होते देखें।',
          'Break the primary link and watch the backup wake up.', 35, 'config'),
        L('n3l5', 'OSPFv2 — Single Area', 'OSPFv2 — Single Area', 'OSPFv2 — Single Area',
          'Hello થી Full સુધીની state machine, DR/BDR election, SPF tree.',
          'Hello से Full तक की state machine, DR/BDR election, SPF tree।',
          'The state machine from Hello to Full, DR/BDR election and the SPF tree.', 75, 'config'),
        L('n3l6', 'FHRP — HSRP', 'FHRP — HSRP', 'First Hop Redundancy — HSRP',
          'Active router બંધ કરો, એક પણ ping ન ખૂટે.',
          'Active router बंद करें, एक भी ping न खोए।',
          'Kill the active router without dropping a single ping.', 40, 'config'),
      ],
    },
    {
      id: 'n4',
      title: { gu: 'IP Services', hi: 'IP Services', en: 'IP Services' },
      weight: '10%',
      lessons: [
        L('n4l1', 'DHCP — DORA', 'DHCP — DORA', 'DHCP — DORA',
          'ચાર packet ઊડે અને PC ને સરનામું મળે.',
          'चार packet उड़ें और PC को पता मिले।',
          'Four packets fly and the PC gets its address.', 35, 'config'),
        L('n4l2', 'NAT અને PAT', 'NAT और PAT', 'NAT and PAT',
          'Packet બહાર નીકળતાં જ એનું IP બદલાતું જુઓ.',
          'Packet बाहर निकलते ही उसका IP बदलते देखें।',
          'Watch a packet change its IP the moment it steps outside.', 45, 'config'),
        L('n4l3', 'NTP, DNS, SNMP, Syslog', 'NTP, DNS, SNMP, Syslog', 'NTP, DNS, SNMP, Syslog',
          'નેટવર્ક ચલાવવા માટેની રોજિંદી સેવાઓ.',
          'नेटवर्क चलाने के लिए रोज़मर्रा की सेवाएं।',
          'The everyday services that keep a network running.', 35, 'config'),
        L('n4l4', 'QoS પરિચય', 'QoS परिचय', 'Introduction to QoS',
          'Voice ને આગળ, download ને પાછળ — કતાર કેવી રીતે ગોઠવાય.',
          'Voice को आगे, download को पीछे — कतार कैसे लगती है।',
          'Voice first, downloads later — how the queues are arranged.', 30),
      ],
    },
    {
      id: 'n5',
      title: { gu: 'Security Fundamentals', hi: 'Security Fundamentals', en: 'Security Fundamentals' },
      weight: '15%',
      lessons: [
        L('n5l1', 'Device Access — SSH અને AAA', 'Device Access — SSH और AAA', 'Device Access — SSH and AAA',
          'Router ને સુરક્ષિત કરવાનું પહેલું પગલું.',
          'Router को सुरक्षित करने का पहला कदम।',
          'The first thing you do to lock down a router.', 30, 'config'),
        L('n5l2', 'ACL', 'ACL', 'Access Control Lists',
          'Packet દરવાજે આવે, નિયમો ઉપરથી નીચે ચેક થાય, implicit deny ની દીવાલ.',
          'Packet दरवाज़े पर आए, नियम ऊपर से नीचे जांचे जाएं, implicit deny की दीवार।',
          'A packet hits the door, rules run top to bottom, then the implicit deny wall.', 55, 'config'),
        L('n5l3', 'Port Security', 'Port Security', 'Port Security',
          'ખોટું ડિવાઇસ જોડાય અને port બંધ થતો જુઓ.',
          'गलत device जुड़े और port को बंद होते देखें।',
          'Plug in the wrong device and watch the port shut itself.', 30, 'config'),
        L('n5l4', 'DHCP Snooping અને DAI', 'DHCP Snooping और DAI', 'DHCP Snooping and DAI',
          'નકલી DHCP server અને ARP spoofing ને રોકવું.',
          'नकली DHCP server और ARP spoofing को रोकना।',
          'Stopping rogue DHCP servers and ARP spoofing.', 35, 'config'),
        L('n5l5', 'Wireless Security અને VPN', 'Wireless Security और VPN', 'Wireless Security and VPNs',
          'WPA2, WPA3, 802.1X અને site-to-site VPN નો ખ્યાલ.',
          'WPA2, WPA3, 802.1X और site-to-site VPN की अवधारणा।',
          'WPA2, WPA3, 802.1X and the idea behind site-to-site VPNs.', 30),
      ],
    },
    {
      id: 'n6',
      title: { gu: 'Automation અને Programmability', hi: 'Automation और Programmability', en: 'Automation and Programmability' },
      weight: '10%',
      lessons: [
        L('n6l1', 'Controller-based Networking', 'Controller-based Networking', 'Controller-based Networking',
          'પરંપરાગત vs SDN — control plane ક્યાં ગયું.',
          'पारंपरिक vs SDN — control plane कहां चला गया।',
          'Traditional versus SDN — where the control plane went.', 30),
        L('n6l2', 'REST API અને JSON', 'REST API और JSON', 'REST APIs and JSON',
          'Network ને કોડથી પૂછવું અને બદલવું.',
          'Network को code से पूछना और बदलना।',
          'Asking and changing the network from code.', 35),
        L('n6l3', 'Ansible, Puppet, Chef', 'Ansible, Puppet, Chef', 'Ansible, Puppet and Chef',
          'એક સાથે સો ડિવાઇસ કેવી રીતે configure થાય.',
          'एक साथ सौ device कैसे configure होते हैं।',
          'How a hundred devices get configured at once.', 25),
      ],
    },
    {
      id: 'n7',
      title: { gu: 'Projects અને Exam', hi: 'Projects और Exam', en: 'Projects and Exam' },
      lessons: [
        L('n7l1', 'Project 1 — Home / Small Office', 'Project 1 — Home / Small Office', 'Project 1 — Home / Small Office',
          '10 users, ઈન્ટરનેટ, WiFi. પહેલો ખરો ક્લાયન્ટ બ્રીફ.',
          '10 users, Internet, WiFi. पहला असली client brief।',
          'Ten users, internet, WiFi. Your first real client brief.', 60, 'project'),
        L('n7l2', 'Project 2 — Small Business VLAN', 'Project 2 — Small Business VLAN', 'Project 2 — Small Business VLAN',
          '50 users, વિભાગ પ્રમાણે અલગ નેટવર્ક, ACL થી અલગ રાખવું.',
          '50 users, विभाग के अनुसार अलग network, ACL से अलग रखना।',
          'Fifty users, separated by department, kept apart with ACLs.', 90, 'project'),
        L('n7l3', 'Project 3 — Multi-Branch', 'Project 3 — Multi-Branch', 'Project 3 — Multi-Branch',
          '3 ઓફિસ, OSPF multi-area, HSRP અને backup link.',
          '3 ऑफिस, OSPF multi-area, HSRP और backup link।',
          'Three offices, OSPF multi-area, HSRP and a backup link.', 120, 'project'),
        L('n7l4', 'CCNA Exam Simulator', 'CCNA Exam Simulator', 'CCNA Exam Simulator',
          '120 મિનિટ, ટાઈમર સાથે, ખરા exam જેવો.',
          '120 मिनट, timer के साथ, असली exam जैसा।',
          'A hundred and twenty minutes on the clock, built like the real thing.', 120, 'quiz'),
      ],
    },
  ],
}

/* ───────────────────────── CCNP Enterprise ───────────────────────── */

const ccnp: Track = {
  id: 'ccnp',
  code: 'ENCOR + ENARSI',
  title: { gu: 'CCNP Enterprise', hi: 'CCNP Enterprise', en: 'CCNP Enterprise' },
  subtitle: {
    gu: 'ENCOR 350-401 અને ENARSI 300-410. ઊંડાણ, troubleshooting અને મોટા enterprise projects.',
    hi: 'ENCOR 350-401 और ENARSI 300-410. गहराई, troubleshooting और बड़े enterprise projects।',
    en: 'ENCOR 350-401 and ENARSI 300-410. Depth, troubleshooting and large enterprise projects.',
  },
  prereq: { gu: 'CCNA પૂરો કર્યા પછી', hi: 'CCNA पूरा करने के बाद', en: 'After finishing CCNA' },
  accent: 'var(--nq-ccnp)',
  hours: 80,
  modules: [
    {
      id: 'p1',
      title: { gu: 'ENCOR · Architecture અને Virtualization', hi: 'ENCOR · Architecture और Virtualization', en: 'ENCOR · Architecture and Virtualization' },
      lessons: [
        L('p1l1', 'Enterprise Design — 3 Tier', 'Enterprise Design — 3 Tier', 'Enterprise Design — Three Tier',
          'Core, Distribution, Access — અને દરેક સ્તરનું કામ.',
          'Core, Distribution, Access — और हर स्तर का काम।',
          'Core, distribution, access — and what each layer is for.', 45),
        L('p1l2', 'SD-Access અને Fabric', 'SD-Access और Fabric', 'SD-Access and Fabric',
          'Underlay, overlay, અને controller શું કરે.',
          'Underlay, overlay, और controller क्या करता है।',
          'Underlay, overlay, and what the controller actually does.', 40),
        L('p1l3', 'VRF, GRE અને IPsec', 'VRF, GRE और IPsec', 'VRF, GRE and IPsec',
          'એક જ router માં અલગ અલગ routing tables અને સુરક્ષિત ટનલ.',
          'एक ही router में अलग-अलग routing tables और सुरक्षित tunnel।',
          'Separate routing tables inside one router, and secure tunnels.', 50, 'config'),
        L('p1l4', 'LISP અને VXLAN', 'LISP और VXLAN', 'LISP and VXLAN',
          'Location અને identity અલગ કરવાં — fabric નો પાયો.',
          'Location और identity को अलग करना — fabric की नींव।',
          'Separating location from identity — the basis of fabric.', 40),
      ],
    },
    {
      id: 'p2',
      title: { gu: 'ENCOR · Infrastructure', hi: 'ENCOR · Infrastructure', en: 'ENCOR · Infrastructure' },
      lessons: [
        L('p2l1', 'Advanced STP — RSTP અને MST', 'Advanced STP — RSTP और MST', 'Advanced STP — RSTP and MST',
          'ઝડપી convergence અને ઘણા VLAN માટે એક જ instance.',
          'तेज़ convergence, और कई VLAN के लिए एक ही instance।',
          'Faster convergence, and one instance for many VLANs.', 45, 'config'),
        L('p2l2', 'OSPF Multi-Area ઊંડાણમાં', 'OSPF Multi-Area गहराई में', 'OSPF Multi-Area in depth',
          'LSA types 1 થી 7, Stub, Totally Stubby, NSSA, virtual link, summarization.',
          'LSA types 1 से 7, Stub, Totally Stubby, NSSA, virtual link, summarization।',
          'LSA types 1 to 7, stub, totally stubby, NSSA, virtual links, summarisation.', 90, 'config'),
        L('p2l3', 'EIGRP અને DUAL ઊંડાણમાં', 'EIGRP और DUAL गहराई में', 'EIGRP and DUAL in depth',
          'Successor, Feasible Successor, Query scope અને SIA.',
          'Successor, Feasible Successor, Query scope और SIA।',
          'Successor, feasible successor, query scope and SIA.', 70, 'config'),
        L('p2l4', 'BGP — Fundamentals', 'BGP — Fundamentals', 'BGP — Fundamentals',
          'eBGP, iBGP, state machine અને attributes.',
          'eBGP, iBGP, state machine और attributes।',
          'eBGP, iBGP, the state machine and the attributes.', 80, 'config'),
        L('p2l5', 'BGP — Path Selection', 'BGP — Path Selection', 'BGP — Path Selection',
          '13 પગલાં એક એક કરીને ચલાવો, હારેલા રસ્તા ગ્રે થતા જુઓ.',
          '13 चरण एक-एक करके चलाएं, हारते रास्तों को grey होते देखें।',
          'Step through all thirteen tie-breakers and watch losing paths grey out.', 70, 'config'),
        L('p2l6', 'Multicast અને QoS', 'Multicast और QoS', 'Multicast and QoS',
          'PIM, IGMP, classification, queuing, policing અને shaping.',
          'PIM, IGMP, classification, queuing, policing और shaping।',
          'PIM, IGMP, classification, queuing, policing and shaping.', 60),
      ],
    },
    {
      id: 'p3',
      title: { gu: 'ENARSI · Advanced Routing', hi: 'ENARSI · Advanced Routing', en: 'ENARSI · Advanced Routing' },
      lessons: [
        L('p3l1', 'Redistribution અને એના ફાંદા', 'Redistribution और उसके जाल', 'Redistribution and its traps',
          'Multi-protocol redistribution, routing loop, route-tag થી ઉકેલ.',
          'Multi-protocol redistribution, routing loop, route-tag से हल।',
          'Multi-protocol redistribution, the loops it causes, and route-tags to fix them.', 75, 'config'),
        L('p3l2', 'Route-map અને PBR', 'Route-map और PBR', 'Route-maps and PBR',
          'Destination નહીં, source જોઈને રસ્તો નક્કી કરવો.',
          'Destination नहीं, source देखकर रास्ता तय करना।',
          'Choosing a path by source instead of destination.', 55, 'config'),
        L('p3l3', 'BGP Advanced — RR અને Communities', 'BGP Advanced — RR और Communities', 'BGP Advanced — RR and Communities',
          'Route Reflector, communities, prefix-list filtering, AS-path prepending.',
          'Route Reflector, communities, prefix-list filtering, AS-path prepending।',
          'Route reflectors, communities, prefix-list filtering and AS-path prepending.', 80, 'config'),
        L('p3l4', 'DMVPN', 'DMVPN', 'DMVPN',
          'Phase 1, 2, 3 — hub-and-spoke થી direct spoke-to-spoke સુધી.',
          'Phase 1, 2, 3 — hub-and-spoke से direct spoke-to-spoke तक।',
          'Phases 1, 2 and 3 — from hub-and-spoke to direct spoke-to-spoke.', 70, 'config'),
        L('p3l5', 'MPLS અને MP-BGP VPN', 'MPLS और MP-BGP VPN', 'MPLS and MP-BGP VPN',
          'Label switching અને service provider VPN નો પરિચય.',
          'Label switching और service provider VPN का परिचय।',
          'Label switching and an introduction to service-provider VPNs.', 60),
        L('p3l6', 'VRF-Lite અને IP SLA', 'VRF-Lite और IP SLA', 'VRF-Lite and IP SLA',
          'ટ્રાફિક અલગ રાખવો અને લિંક ખરેખર જીવતી છે કે નહીં એ ચકાસવું.',
          'Traffic अलग रखना और यह जांचना कि link सच में जीवित है या नहीं।',
          'Keeping traffic apart, and testing whether a link is truly alive.', 50, 'config'),
      ],
    },
    {
      id: 'p4',
      title: { gu: 'Troubleshooting અને Projects', hi: 'Troubleshooting और Projects', en: 'Troubleshooting and Projects' },
      lessons: [
        L('p4l1', 'Structured Troubleshooting', 'Structured Troubleshooting', 'Structured Troubleshooting',
          'ક્યાંથી શરૂ કરવું, શું પૂછવું, કઈ show command ક્યારે.',
          'कहां से शुरू करें, क्या पूछें, कौन सी show command कब।',
          'Where to start, what to ask, and which show command when.', 60, 'lab'),
        L('p4l2', 'Project 4 — Enterprise Campus', 'Project 4 — Enterprise Campus', 'Project 4 — Enterprise Campus',
          '1000+ users, બહુમાળી બિલ્ડિંગ, three-tier, શૂન્ય downtime.',
          '1000+ users, बहुमंजिला बिल्डिंग, three-tier, zero downtime।',
          'Over a thousand users, multi-floor, three-tier, zero downtime.', 180, 'project'),
        L('p4l3', 'Project 5 — Dual-ISP BGP', 'Project 5 — Dual-ISP BGP', 'Project 5 — Dual-ISP BGP',
          'બે ISP, failover, અને traffic engineering બંને દિશામાં.',
          'दो ISP, failover, और दोनों दिशाओं में traffic engineering।',
          'Two ISPs, failover, and traffic engineering in both directions.', 180, 'project'),
        L('p4l4', 'ENCOR + ENARSI Simulator', 'ENCOR + ENARSI Simulator', 'ENCOR + ENARSI Simulator',
          'બંને exam ના પૂરા ટાઈમ્ડ mock tests.',
          'दोनों exam के पूरे timed mock tests।',
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
  concept: { gu: 'સમજ', hi: 'अवधारणा', en: 'Concept' },
  config: { gu: 'Configure', hi: 'Configure', en: 'Configure' },
  lab: { gu: 'Lab', hi: 'Lab', en: 'Lab' },
  project: { gu: 'Project', hi: 'Project', en: 'Project' },
  quiz: { gu: 'Quiz', hi: 'Quiz', en: 'Quiz' },
}
