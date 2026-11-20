import type { BreakSpec } from '../components/BreakStage'
import { Network } from '../engine/network'

/**
 * Break it, Modules 2 and 4.
 *
 * These are the faults that look like something else. A wrong subnet mask
 * reads as "the network is down". A dead DNS server reads as "the internet is
 * down" even though every address still works. A missing NAT rule reads as
 * "my ISP is broken". Each one here is paired with a probe that proves what
 * it actually is.
 */

const H = (gu: string, hi: string, en: string) => ({ gu, hi, en })

function addr(n: Network, id: string, ifn: string, ip: string, mask: string) {
  const i = n.get(id)!.iface(ifn)!
  i.ip = ip
  i.mask = mask
  i.shutdown = false
}

function host(n: Network, id: string, name: string, ip: string, gw?: string, kind: 'pc' | 'server' = 'pc', mask = '255.255.255.0') {
  n.addDevice({ id, name, kind, ifaces: ['e0'] })
  const i = n.get(id)!.iface('e0')!
  i.ip = ip
  i.mask = mask
  if (gw) n.get(id)!.defaultGateway = gw
}

const down = (n: Network, id: string, ifn: string, v: boolean) => {
  n.get(id)!.iface(ifn)!.shutdown = v
  n.rev++
}

/* ═══════════ b2l1 · the address, and the mask nobody reads ═══════════ */

function maskLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'ROUTER', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  host(n, 'pc1', 'PC1', '192.168.1.11', '192.168.1.1')
  host(n, 'pc2', 'PC2', '192.168.1.12', '192.168.1.1')
  host(n, 'web', 'WEB', '203.0.113.9', '203.0.113.1', 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw', 'Fa0/2')
  n.connect('sw', 'Fa0/3', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'web', 'e0')
  addr(n, 'r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '203.0.113.1', '255.255.255.0')
  return n
}

export const b2l1Break: BreakSpec = {
  build: maskLab,
  viewBox: { w: 880, h: 340 },
  layout: [
    { id: 'pc1', x: 110, y: 80, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'pc2', x: 110, y: 270, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 350, y: 175, type: 'switch' },
    { id: 'r1', x: 580, y: 175, type: 'router', accent: 'var(--nq-ccna)' },
    { id: 'web', x: 800, y: 175, type: 'cloud', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'સરનામું અડધી વાત છે — **mask બીજી અડધી**. અને mask એ જ વસ્તુ છે જે કોઈ વાંચતું નથી. અહીંની દરેક ભૂલમાં સરનામું **દેખીતી રીતે બરાબર** લાગે છે.',
    'पता आधी बात है — **mask दूसरी आधी**। और mask वही चीज है जो कोई नहीं पढ़ता। यहां की हर गलती में पता **देखने में बिल्कुल सही** लगता है।',
    'The address is half the story — **the mask is the other half**. And the mask is the part nobody reads. In every fault here the address looks perfectly fine.',
  ),
  actions: [
    {
      id: 'mask',
      label: H('PC1 નો mask /24 થી /25 કરો', 'PC1 का mask /24 से /25 करो', 'Change PC1’s mask from /24 to /25'),
      explain: H(
        'સરનામું `192.168.1.11` એ જ રહે છે. ફક્ત mask `255.255.255.128` થાય — એટલે PC1 માને કે શેરી **અડધી** છે, `.1` થી `.126` સુધી.',
        'पता `192.168.1.11` वही रहता है। केवल mask `255.255.255.128` हो जाता है — यानी PC1 मानता है कि गली **आधी** है, `.1` से `.126` तक।',
        'The address stays `192.168.1.11`. Only the mask becomes `255.255.255.128`, so PC1 now believes the street is **half as long**, `.1` to `.126`.',
      ),
      expect: H(
        'PC2 (`.12`) હજી એ અડધામાં છે, એટલે **એ ચાલશે**. Gateway (`.1`) પણ. ભૂલ અત્યારે **છુપાયેલી** રહેશે — અને `.130` પર બેઠેલા સાથી સાથે જ બહાર આવશે. એટલે જ mask ની ભૂલ પકડવી અઘરી છે.',
        'PC2 (`.12`) अभी भी उस आधे में है, इसलिए **वह चलेगा**। Gateway (`.1`) भी। गलती अभी **छिपी** रहेगी — और `.130` पर बैठे साथी के साथ ही बाहर आएगी। इसीलिए mask की गलती पकड़ना मुश्किल है।',
        'PC2 (`.12`) is still inside that half, so **it keeps working**. So does the gateway (`.1`). The mistake stays **hidden** — and only surfaces against a colleague sitting at `.130`. Which is exactly why mask faults are so hard to catch.',
      ),
      silent: true,
      apply: (n) => addr(n, 'pc1', 'e0', '192.168.1.11', '255.255.255.128'),
      revert: (n) => addr(n, 'pc1', 'e0', '192.168.1.11', '255.255.255.0'),
    },
    {
      id: 'bigmask',
      label: H('PC1 નો mask /16 કરો', 'PC1 का mask /16 करो', 'Widen PC1’s mask to /16'),
      explain: H(
        '`255.255.0.0` — એટલે PC1 માને કે `192.168.*.*` નું **બધું** એની પોતાની શેરીમાં છે, બહારની દુનિયા સહિત નહીં પણ બહુ મોટો ભાગ.',
        '`255.255.0.0` — यानी PC1 मानता है कि `192.168.*.*` का **सब कुछ** उसकी अपनी गली में है।',
        '`255.255.0.0` — PC1 now believes **everything** in `192.168.*.*` is on its own street.',
      ),
      expect: H(
        'પાડોશી તો ચાલે જ છે. પણ હવે PC1 **gateway ને પણ પોતાનો પાડોશી** ગણે… અને એ હજી સાચું છે. આ ભૂલ પણ અહીં ચૂપ રહે છે — મોટો mask ત્યારે જ વાગે જ્યારે બીજી ખરી શેરી એ વ્યાપમાં આવી જાય.',
        'पड़ोसी तो चलता ही है। पर अब PC1 **gateway को भी अपना पड़ोसी** मानता है… और यह अभी सच है। यह गलती भी यहां चुप रहती है — बड़ा mask तब ही लगता है जब दूसरी असली गली उस दायरे में आ जाए।',
        'The neighbour still works. PC1 now treats the gateway as a neighbour too… and that still happens to be true. This one stays quiet here as well — too wide a mask only bites when a genuinely different street falls inside the range.',
      ),
      silent: true,
      apply: (n) => addr(n, 'pc1', 'e0', '192.168.1.11', '255.255.0.0'),
      revert: (n) => addr(n, 'pc1', 'e0', '192.168.1.11', '255.255.255.0'),
    },
    {
      id: 'street',
      label: H('PC2 ને `192.168.2.12` કરો', 'PC2 को `192.168.2.12` करो', 'Put PC2 on `192.168.2.12`'),
      explain: H(
        'એક આંકડો બદલાયો — ત્રીજો. વાયર, switch, mask બધું એ જ.',
        'एक अंक बदला — तीसरा। तार, switch, mask सब वही।',
        'One digit changed, the third one. Same cable, same switch, same mask.',
      ),
      expect: H(
        'હવે **ખરેખર** તૂટ્યું: PC1 માટે PC2 બીજી શેરીમાં છે, એટલે એ packet gateway ને આપે — અને gateway પાસે એ શેરીનો રસ્તો નથી. એક આંકડો, અને પાડોશી અજાણ્યો.',
        'अब **असल में** टूटा: PC1 के लिए PC2 दूसरी गली में है, इसलिए वह packet gateway को देता है — और gateway के पास उस गली का रास्ता नहीं। एक अंक, और पड़ोसी अजनबी।',
        'Now it **genuinely** breaks: to PC1 the neighbour is on another street, so the packet goes to the gateway — which has no road to that street. One digit, and a neighbour becomes a stranger.',
      ),
      apply: (n) => addr(n, 'pc2', 'e0', '192.168.2.12', '255.255.255.0'),
      revert: (n) => addr(n, 'pc2', 'e0', '192.168.1.12', '255.255.255.0'),
    },
  ],
  probes: [
    { id: 'near', from: 'pc1', to: 'pc2', destIp: '192.168.1.12', label: H('PC1 → PC2 (પાડોશી)', 'PC1 → PC2 (पड़ोसी)', 'PC1 → PC2 (neighbour)') },
    { id: 'gw', from: 'pc1', to: 'r1', destIp: '192.168.1.1', label: H('PC1 → gateway', 'PC1 → gateway', 'PC1 → gateway') },
    { id: 'far', from: 'pc1', to: 'web', destIp: '203.0.113.9', label: H('PC1 → બહાર', 'PC1 → बाहर', 'PC1 → outside') },
  ],
}

/* ═══════════ b4l2 · the name dies, the address lives ═══════════ */

function dnsLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'ROUTER', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  host(n, 'pc1', 'PC1', '192.168.1.11', '192.168.1.1')
  host(n, 'dns', 'DNS', '192.168.1.53', '192.168.1.1', 'server')
  host(n, 'web', 'WEB', '203.0.113.9', '203.0.113.1', 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('dns', 'e0', 'sw', 'Fa0/2')
  n.connect('sw', 'Fa0/3', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'web', 'e0')
  addr(n, 'r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '203.0.113.1', '255.255.255.0')
  return n
}

export const b4l2Break: BreakSpec = {
  build: dnsLab,
  viewBox: { w: 880, h: 340 },
  layout: [
    { id: 'pc1', x: 110, y: 175, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'dns', x: 350, y: 60, type: 'server', accent: 'var(--nq-pkt-dns)' },
    { id: 'sw', x: 350, y: 250, type: 'switch' },
    { id: 'r1', x: 580, y: 250, type: 'router', accent: 'var(--nq-ccna)' },
    { id: 'web', x: 800, y: 175, type: 'cloud', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'આ પાઠનો સૌથી કામનો અનુભવ: **DNS તોડો, અને ઇન્ટરનેટ "ગયેલું" લાગશે — જ્યારે એ બિલકુલ ચાલુ હશે.** બંને probe સાથે જુઓ, એ જ આખી વાત કહી દેશે.',
    'इस पाठ का सबसे काम का अनुभव: **DNS तोड़ें, और Internet "गया हुआ" लगेगा — जबकि वह बिल्कुल चालू होगा।** दोनों probe साथ देखें, वही पूरी बात बता देंगे।',
    'The most useful thing in this lesson: **break DNS and the internet will look dead — while it is working perfectly.** Watch both probes together; they tell the whole story.',
  ),
  actions: [
    {
      id: 'dnsdown',
      label: H('DNS server બંધ કરો', 'DNS server बंद करो', 'Take the DNS server down'),
      explain: H(
        'ફોનબુક બંધ. બાકી બધું — router, ISP ની લાઇન, website — ચાલુ જ છે.',
        'फोनबुक बंद। बाकी सब — router, ISP की line, website — चालू ही है।',
        'The phone book closes. Everything else — the router, the ISP line, the website — stays up.',
      ),
      expect: H(
        '**નામ** પૂછવાનું બંધ, પણ **સરનામું** હજી પહોંચે છે. એટલે `google.com` ન ખૂલે પણ `203.0.113.9` ખૂલે. વપરાશકર્તા કહેશે "ઇન્ટરનેટ ગયું" — અને એ ખોટું હશે.',
        '**नाम** पूछना बंद, पर **पता** अभी भी पहुंचता है। इसलिए `google.com` नहीं खुलेगा पर `203.0.113.9` खुलेगा। User कहेगा "Internet गया" — और वह गलत होगा।',
        'You can no longer **ask for a name**, but **addresses still arrive**. So `google.com` fails while `203.0.113.9` loads. The user will say "the internet is down", and they will be wrong.',
      ),
      apply: (n) => down(n, 'dns', 'e0', true),
      revert: (n) => down(n, 'dns', 'e0', false),
    },
    {
      id: 'wrongdns',
      label: H('ખોટું DNS સરનામું આપો', 'गलत DNS पता दो', 'Point at the wrong DNS address'),
      explain: H(
        'DNS server ને `192.168.1.63` પર ખસેડો — PC હજી જૂના `.53` ને પૂછ્યા કરશે.',
        'DNS server को `192.168.1.63` पर ले जाओ — PC अभी भी पुराने `.53` से पूछता रहेगा।',
        'Move the DNS server to `192.168.1.63`, leaving the PC still asking the old `.53`.',
      ),
      expect: H(
        'એ જ લક્ષણ, બીજું કારણ. Server **ચાલુ** છે અને **જોડાયેલો** છે — ફક્ત કોઈ એને પૂછતું નથી. Troubleshooting માં "server ચાલે છે" એ પૂરતું નથી; એ **સાચા સરનામે** ચાલવો જોઈએ.',
        'वही लक्षण, दूसरा कारण। Server **चालू** है और **जुड़ा** है — बस कोई उसे पूछता नहीं। Troubleshooting में "server चल रहा है" काफी नहीं; वह **सही पते पर** चलना चाहिए।',
        'Same symptom, different cause. The server is **up** and **plugged in** — nobody is asking it. "The server is running" is never enough: it has to be running at the address people are using.',
      ),
      apply: (n) => addr(n, 'dns', 'e0', '192.168.1.63', '255.255.255.0'),
      revert: (n) => addr(n, 'dns', 'e0', '192.168.1.53', '255.255.255.0'),
    },
    {
      id: 'wanout',
      label: H('ISP ની લાઇન કાપો', 'ISP की line काटो', 'Cut the ISP line'),
      explain: H('આ વખતે ખરેખર બહારનું જોડાણ તોડો, DNS ને અડ્યા વગર.', 'इस बार असल में बाहर का connection तोड़ो, DNS को छुए बिना।', 'This time genuinely cut the way out, leaving DNS alone.'),
      expect: H(
        'હવે **ઊલટું**: DNS હજી જવાબ આપે છે (એ અંદર જ છે), પણ website પહોંચાતી નથી. બંને probe સરખાવો — **કયું લીલું છે એ જ તમને કારણ કહી દે છે.**',
        'अब **उलटा**: DNS अभी भी जवाब देता है (वह अंदर ही है), पर website पहुंची नहीं जा सकती। दोनों probe की तुलना करें — **कौन सा हरा है वही कारण बताता है।**',
        'Now it is the **other way round**: DNS still answers, because it is inside, while the website is unreachable. Compare the two probes — **which one is green tells you the cause.**',
      ),
      apply: (n) => down(n, 'r1', 'Gi0/1', true),
      revert: (n) => down(n, 'r1', 'Gi0/1', false),
    },
  ],
  probes: [
    { id: 'dns', from: 'pc1', to: 'dns', destIp: '192.168.1.53', label: H('PC1 → DNS (નામ પૂછવું)', 'PC1 → DNS (नाम पूछना)', 'PC1 → DNS (asking a name)') },
    { id: 'ip', from: 'pc1', to: 'web', destIp: '203.0.113.9', label: H('PC1 → સીધું સરનામું', 'PC1 → सीधा पता', 'PC1 → straight to the address') },
  ],
}

/* ═══════════ b4l5 · the firewall rule, and its order ═══════════ */

function fwLab() {
  const n = new Network()
  n.addDevice({ id: 'fw', name: 'FIREWALL', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  host(n, 'pc1', 'PC1', '192.168.1.11', '192.168.1.1')
  host(n, 'srv', 'SERVER', '192.168.1.50', '192.168.1.1', 'server')
  host(n, 'out', 'OUTSIDE', '203.0.113.9', '203.0.113.1', 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('srv', 'e0', 'sw', 'Fa0/2')
  n.connect('sw', 'Fa0/3', 'fw', 'Gi0/0')
  n.connect('fw', 'Gi0/1', 'out', 'e0')
  addr(n, 'fw', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  addr(n, 'fw', 'Gi0/1', '203.0.113.1', '255.255.255.0')
  // The rule already doing its job: nobody outside may reach the server.
  // Note this list is stateless, like a real ACL and unlike a real firewall —
  // so it has to be written narrowly enough that replies to our own outbound
  // traffic still come home. That constraint is the whole of fault 'toowide'.
  n.get('fw')!.acls.set('101', {
    id: '101',
    extended: true,
    entries: [
      { seq: 10, action: 'deny', protocol: 'ip', src: '203.0.113.0', srcWildcard: '0.0.0.255', dst: '192.168.1.50', dstWildcard: '0.0.0.0' },
      { seq: 20, action: 'permit', protocol: 'ip', src: '0.0.0.0', srcWildcard: '255.255.255.255' },
    ],
  })
  n.get('fw')!.iface('Gi0/1')!.aclIn = '101'
  return n
}

export const b4l5Break: BreakSpec = {
  build: fwLab,
  viewBox: { w: 880, h: 340 },
  layout: [
    { id: 'pc1', x: 110, y: 80, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'srv', x: 110, y: 270, type: 'server', accent: 'var(--nq-ccnp)' },
    { id: 'sw', x: 350, y: 175, type: 'switch' },
    { id: 'fw', x: 580, y: 175, type: 'firewall', accent: 'var(--nq-err)' },
    { id: 'out', x: 800, y: 175, type: 'cloud', accent: 'var(--nq-ccnp)' },
  ],
  startsFailing: ['in'],
  intro: H(
    'Firewall પહેલેથી કામ કરે છે: અંદરથી બહાર ચાલે, બહારથી અંદર **નહીં**. એટલે નીચેનું "બહારથી અંદર" probe **શરૂઆતથી જ લાલ** છે — એ જ તો એનું કામ છે. હવે એ નિયમો સાથે રમો.',
    'Firewall पहले से काम कर रहा है: अंदर से बाहर चलता है, बाहर से अंदर **नहीं**। इसलिए नीचे का "बाहर से अंदर" probe **शुरू से ही लाल** है — यही तो उसका काम है। अब उन नियमों के साथ खेलें।',
    'The firewall is already doing its job: out is fine, in is **not**. That is why the "from outside" probe below is **red from the start** — that is the point of it. Now play with the rules.',
  ),
  actions: [
    {
      id: 'open',
      label: H('"બહારથી બધું ખોલો" ઉપર મૂકો', '"बाहर से सब खोलो" ऊपर रखो', 'Put "allow everything in" at the top'),
      explain: H(
        'યાદીમાં **સૌથી ઉપર** એક permit ઉમેરો. નીચેનો deny નિયમ હજી ત્યાં જ છે, ભૂંસ્યો નથી.',
        'सूची में **सबसे ऊपर** एक permit जोड़ें। नीचे का deny नियम अभी भी वहीं है, मिटाया नहीं है।',
        'Add a permit at the **very top** of the list. The deny rule is still there below it, untouched.',
      ),
      expect: H(
        'બહારનું અંદર આવી ગયું — ભલે deny નિયમ હજી લખેલો હોય. કારણ: યાદી **ઉપરથી નીચે** વંચાય છે અને **પહેલો મેળ જીતે છે**. નીચેનો નિયમ કદી વંચાયો જ નહીં.',
        'बाहर का अंदर आ गया — भले deny नियम अभी भी लिखा हो। कारण: सूची **ऊपर से नीचे** पढ़ी जाती है और **पहला मेल जीतता है**। नीचे का नियम कभी पढ़ा ही नहीं गया।',
        'The outside gets in, even though the deny is still written down. Because the list is read **top to bottom** and the **first match wins** — the rule below was never even reached.',
      ),
      apply: (n) => {
        const a = n.get('fw')!.acls.get('101')!
        a.entries.unshift({ seq: 5, action: 'permit', protocol: 'ip', src: '0.0.0.0', srcWildcard: '255.255.255.255' })
        n.rev++
      },
      revert: (n) => {
        const a = n.get('fw')!.acls.get('101')!
        a.entries = a.entries.filter((e) => e.seq !== 5)
        n.rev++
      },
    },
    {
      id: 'toowide',
      label: H('Deny ને બહુ પહોળો કરો', 'Deny को बहुत चौड़ा करो', 'Make the deny too wide'),
      explain: H(
        'Deny નું destination એક server (`192.168.1.50`) ને બદલે **આખું** `192.168.1.0/24` કરી દો — એક wildcard ની ભૂલ.',
        'Deny का destination एक server (`192.168.1.50`) की जगह **पूरा** `192.168.1.0/24` कर दो — एक wildcard की गलती।',
        'Change the deny’s destination from the one server (`192.168.1.50`) to the **whole** `192.168.1.0/24` — one wildcard slip.',
      ),
      expect: H(
        'હવે **તમારો પોતાનો** બહાર ગયેલો packet પાછો આવી શકતો નથી — જવાબ પણ "બહારથી અંદર" જ ગણાય છે. સુરક્ષાના નિયમો આ રીતે જ ઊંધા પડે છે: બચાવવા જતાં પોતાને બહાર કરી બેસવું.',
        'अब **आपका अपना** बाहर गया packet वापस नहीं आ सकता — जवाब भी "बाहर से अंदर" ही गिना जाता है। सुरक्षा के नियम ऐसे ही उलटे पड़ते हैं: बचाने जाते हुए खुद को बाहर कर बैठना।',
        'Now **your own** outbound packet cannot get home — a reply counts as "coming in" too. This is how security rules go wrong: reaching to protect, and shutting yourself out instead.',
      ),
      apply: (n) => {
        const e = n.get('fw')!.acls.get('101')!.entries.find((x) => x.seq === 10)!
        e.dst = '192.168.1.0'
        e.dstWildcard = '0.0.0.255'
        n.rev++
      },
      revert: (n) => {
        const e = n.get('fw')!.acls.get('101')!.entries.find((x) => x.seq === 10)!
        e.dst = '192.168.1.50'
        e.dstWildcard = '0.0.0.0'
        n.rev++
      },
    },
    {
      id: 'remove',
      label: H('Firewall નો નિયમ કાઢી નાખો', 'Firewall का नियम हटा दो', 'Take the firewall rule off'),
      explain: H('ACL ને interface પરથી હટાવો. Firewall ઊભું છે, પણ હવે ફક્ત router છે.', 'ACL को interface से हटाओ। Firewall खड़ा है, पर अब केवल router है।', 'Unhook the ACL from the interface. The firewall is still there, but now it is only a router.'),
      expect: H(
        'બહારનું બધું અંદર. ઉપકરણ હોવું અને **નિયમ લાગુ હોવો** એ બે જુદી વાત છે — "અમારી પાસે firewall છે" એ પોતે કોઈ સુરક્ષા નથી.',
        'बाहर का सब अंदर। उपकरण होना और **नियम लागू होना** दो अलग बातें हैं — "हमारे पास firewall है" खुद कोई सुरक्षा नहीं है।',
        'Everything outside walks in. Owning the box and **having the rule applied** are two different things — "we have a firewall" is not, by itself, security.',
      ),
      apply: (n) => {
        n.get('fw')!.iface('Gi0/1')!.aclIn = undefined
        n.rev++
      },
      revert: (n) => {
        n.get('fw')!.iface('Gi0/1')!.aclIn = '101'
        n.rev++
      },
    },
  ],
  probes: [
    { id: 'out', from: 'pc1', to: 'out', destIp: '203.0.113.9', label: H('અંદરથી બહાર', 'अंदर से बाहर', 'Inside → out') },
    { id: 'in', from: 'out', to: 'srv', destIp: '192.168.1.50', label: H('બહારથી અંદર', 'बाहर से अंदर', 'Outside → in') },
  ],
}
