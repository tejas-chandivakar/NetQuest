import type { BreakSpec } from '../components/BreakStage'
import { Network, type Device } from '../engine/network'

/**
 * Break it, the second batch.
 *
 * b3l2 is the one worth reading first. Four faults, four layers, and the
 * learner sees the same symptom every time — "it cannot reach" — while the
 * failure reason underneath changes. That reason is the whole of
 * troubleshooting, and it is much easier to feel here than to memorise.
 */

const H = (gu: string, en: string) => ({ gu, en })

function addr(n: Network, id: string, ifn: string, ip: string, mask: string) {
  const i = n.get(id)!.iface(ifn)!
  i.ip = ip
  i.mask = mask
  i.shutdown = false
}

function host(n: Network, id: string, name: string, ip: string, gw?: string, kind: 'pc' | 'server' = 'pc') {
  n.addDevice({ id, name, kind, ifaces: ['e0'] })
  const i = n.get(id)!.iface('e0')!
  i.ip = ip
  i.mask = '255.255.255.0'
  if (gw) n.get(id)!.defaultGateway = gw
}

const down = (n: Network, id: string, ifn: string, v: boolean) => {
  n.get(id)!.iface(ifn)!.shutdown = v
  n.rev++
}

const access = (d: Device, port: string, vlan: number) => {
  const sp = d.iface(port)!.switchport!
  sp.mode = 'access'
  sp.accessVlan = vlan
  if (!d.vlans.has(vlan)) d.vlans.set(vlan, `VLAN${vlan}`)
}

/* ═══════════ b3l2 · the same symptom, four different layers ═══════════ */

function layerLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'ROUTER', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  host(n, 'pc1', 'PC1', '192.168.1.11', '192.168.1.1')
  host(n, 'pc2', 'PC2', '192.168.1.12', '192.168.1.1')
  host(n, 'srv', 'SERVER', '10.5.5.50', '10.5.5.1', 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('pc2', 'e0', 'sw', 'Fa0/2')
  n.connect('sw', 'Fa0/3', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'srv', 'e0')
  addr(n, 'r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '10.5.5.1', '255.255.255.0')
  const sw = n.get('sw')!
  for (const p of ['Fa0/1', 'Fa0/2', 'Fa0/3']) access(sw, p, 1)
  return n
}

export const b3l2Break: BreakSpec = {
  build: layerLab,
  viewBox: { w: 880, h: 340 },
  layout: [
    { id: 'pc1', x: 110, y: 80, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'pc2', x: 110, y: 270, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 350, y: 175, type: 'switch' },
    { id: 'r1', x: 580, y: 175, type: 'router', accent: 'var(--nq-ccna)' },
    { id: 'srv', x: 800, y: 175, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'ચાર ભૂલો, **ચાર જુદા layer**. વપરાશકર્તા દરેક વખતે એક જ વાક્ય કહેશે — "પહોંચાતું નથી". પણ **કારણ** દર વખતે જુદું હશે, અને એ કારણ નીચે લખેલું દેખાશે. એ જ troubleshooting છે: લક્ષણ એક, layer જુદો.',
    'Four faults, **four different layers**. The user will say the same sentence every time — "it will not connect". But the **reason** underneath changes each time, and it is printed below. That is troubleshooting in one picture: one symptom, different layers.',
  ),
  actions: [
    {
      id: 'l1',
      label: H('Layer 1 — વાયર કાઢો', 'Layer 1 — pull the cable'),
      explain: H('સૌથી નીચેનો layer: ભૌતિક સંકેત જ નથી.', 'The bottom layer: there is simply no signal.'),
      expect: H(
        'કારણ વંચાશે **link down**. અહીં IP, MAC, કશાનો સવાલ જ નથી — ઉપરના છ layer ને કામ કરવાનો મોકો જ મળતો નથી. એટલે **હંમેશા અહીંથી તપાસ શરૂ કરવી**.',
        'The reason will read **link down**. No question of IP or MAC arises here — the six layers above never get a chance to run. Which is why you always start your checking here.',
      ),
      apply: (n) => down(n, 'pc1', 'e0', true),
      revert: (n) => down(n, 'pc1', 'e0', false),
    },
    {
      id: 'l2',
      label: H('Layer 2 — PC1 ને બીજા VLAN માં', 'Layer 2 — move PC1 to another VLAN'),
      explain: H(
        'વાયર જોડાયેલો, સંકેત આવે છે — પણ switch એ port ને બીજા જૂથમાં મૂકી દીધો.',
        'The cable is in and the signal arrives — but the switch has put that port in a different group.',
      ),
      expect: H(
        'કારણ બદલાઈને **ARP નિષ્ફળ** થશે. Layer 1 બરાબર છે! PC1 બૂમ પાડે છે પણ એની બૂમ બીજા જૂથ સુધી પહોંચતી જ નથી. સરનામું સાચું, રસ્તો સાચો, **પાડોશી ગુમ**.',
        'The reason changes to **ARP failed**. Layer 1 is fine! PC1 is calling out, and its call never leaves its group. Right address, right route, **no neighbour**.',
      ),
      apply: (n) => {
        access(n.get('sw')!, 'Fa0/1', 99)
        n.rev++
      },
      revert: (n) => {
        access(n.get('sw')!, 'Fa0/1', 1)
        n.rev++
      },
    },
    {
      id: 'l3',
      label: H('Layer 3 — router નો રસ્તો ભૂંસો', 'Layer 3 — erase the router’s road'),
      explain: H(
        'Router નો server તરફનો port બંધ કરો. LAN બાજુ બધું જેમનું તેમ.',
        'Shut the router’s port towards the server. Everything on the LAN side is untouched.',
      ),
      expect: H(
        'હવે કારણ **રસ્તો નથી** જેવું બનશે. PC1 નો packet gateway સુધી **પહોંચે** છે — Layer 1 અને 2 બંને બરાબર — પણ ત્યાંથી આગળ જવાનો રસ્તો નથી. પાડોશી મળે છે, મંઝિલ નહીં.',
        'Now the reason becomes something like **no road**. PC1’s packet **does reach** the gateway — layers 1 and 2 are both fine — and there is no onward path from there. The neighbour is found; the destination is not.',
      ),
      apply: (n) => down(n, 'r1', 'Gi0/1', true),
      revert: (n) => down(n, 'r1', 'Gi0/1', false),
    },
    {
      id: 'l4',
      label: H('Layer 4 — નિયમથી રોકો', 'Layer 4 — block it with a rule'),
      explain: H(
        'બધું ભૌતિક રીતે બરાબર, રસ્તો પણ છે — પણ router ને કહો કે આ traffic પસાર ન થવા દે.',
        'Everything is physically fine and the road exists — but the router is told not to let this traffic through.',
      ),
      expect: H(
        'કારણ **નિયમે રોક્યું**. આ સૌથી કપટી છે: નીચેના ત્રણેય layer **સંપૂર્ણ બરાબર** છે. કેબલ બદલવાથી, IP બદલવાથી, કશાથી ફરક નહીં પડે — જ્યાં સુધી કોઈ નિયમ વાંચે નહીં.',
        'The reason reads **a rule denied it**. This is the sneakiest: all three layers below are **completely fine**. Changing cables or addresses will do nothing at all until somebody reads the rule.',
      ),
      apply: (n) => {
        const r = n.get('r1')!
        r.acls.set('10', {
          id: '10',
          extended: false,
          entries: [{ seq: 10, action: 'deny', protocol: 'ip', src: '192.168.1.0', srcWildcard: '0.0.0.255' }],
        })
        r.iface('Gi0/0')!.aclIn = '10'
        n.rev++
      },
      revert: (n) => {
        n.get('r1')!.iface('Gi0/0')!.aclIn = undefined
        n.rev++
      },
    },
  ],
  probes: [
    { id: 'far', from: 'pc1', to: 'srv', destIp: '10.5.5.50', label: H('PC1 → Server (દૂર)', 'PC1 → Server (far)') },
    { id: 'near', from: 'pc1', to: 'pc2', destIp: '192.168.1.12', label: H('PC1 → PC2 (પાડોશી)', 'PC1 → PC2 (neighbour)') },
  ],
}

/* ═══════════ b4l1 · which step of the journey broke ═══════════ */

function journeyLab() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'ROUTER', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  host(n, 'pc1', 'PC1', '192.168.1.11', '192.168.1.1')
  host(n, 'dns', 'DNS', '192.168.1.53', '192.168.1.1', 'server')
  host(n, 'web', 'GOOGLE', '142.250.195.78', '142.250.195.1', 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('dns', 'e0', 'sw', 'Fa0/2')
  n.connect('sw', 'Fa0/3', 'r1', 'Gi0/0')
  n.connect('r1', 'Gi0/1', 'web', 'e0')
  addr(n, 'r1', 'Gi0/0', '192.168.1.1', '255.255.255.0')
  addr(n, 'r1', 'Gi0/1', '142.250.195.1', '255.255.255.0')
  return n
}

export const b4l1Break: BreakSpec = {
  build: journeyLab,
  viewBox: { w: 880, h: 340 },
  layout: [
    { id: 'pc1', x: 110, y: 175, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'dns', x: 350, y: 60, type: 'server', accent: 'var(--nq-pkt-dns)' },
    { id: 'sw', x: 350, y: 255, type: 'switch' },
    { id: 'r1', x: 590, y: 255, type: 'router', accent: 'var(--nq-ccna)' },
    { id: 'web', x: 800, y: 175, type: 'server', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    '`google.com` ટાઇપ કરો અને ત્રણ વસ્તુ થવી જોઈએ: **gateway મળે → DNS જવાબ આપે → website પહોંચે**. એક એક તોડો — અને જુઓ કે બ્રાઉઝરમાં ભલે એક જ ભૂલ દેખાય, **તૂટેલું પગલું દર વખતે જુદું** છે.',
    'Type `google.com` and three things have to happen: **find the gateway → DNS answers → the site is reachable**. Break them one at a time — and notice that the browser shows one error while the **step that failed is different every time**.',
  ),
  actions: [
    {
      id: 'gw',
      label: H('પહેલું પગલું — gateway ગુમાવો', 'Step one — lose the gateway'),
      explain: H('PC નો gateway ભૂંસો. DNS અને website બંને ચાલુ જ છે.', 'Erase the PC’s gateway. DNS and the website are both still up.'),
      expect: H(
        '**બધું જ** તૂટ્યું — DNS પણ નહીં, website પણ નહીં. પહેલું પગલું જ ન ચાલે તો પછીનાં બે ને મોકો જ મળતો નથી. એટલે નિષ્ફળતા **ઉપરથી નીચે** નહીં, **શરૂઆતથી** શોધવી.',
        'Everything fails — no DNS, no website. If the first step cannot happen the other two never get a turn. Which is why you hunt a failure **from the start**, not from the end.',
      ),
      apply: (n) => {
        n.get('pc1')!.defaultGateway = undefined
        n.rev++
      },
      revert: (n) => {
        n.get('pc1')!.defaultGateway = '192.168.1.1'
        n.rev++
      },
    },
    {
      id: 'dns',
      label: H('બીજું પગલું — DNS બંધ કરો', 'Step two — stop DNS'),
      explain: H('ફોનબુક બંધ. Gateway અને website બંને ચાલુ.', 'Close the phone book. The gateway and the website are both fine.'),
      expect: H(
        'નામ ન મળે, પણ **સરનામું હજી પહોંચે છે**. એટલે `google.com` નિષ્ફળ અને `142.250.195.78` સફળ. આ જ ફરક તમને કહી દે છે કે ભૂલ **બીજા** પગલામાં છે.',
        'The name cannot be resolved, but **the address still arrives**. So `google.com` fails while `142.250.195.78` works. That difference alone tells you the fault is in **step two**.',
      ),
      apply: (n) => down(n, 'dns', 'e0', true),
      revert: (n) => down(n, 'dns', 'e0', false),
    },
    {
      id: 'site',
      label: H('ત્રીજું પગલું — website બંધ કરો', 'Step three — take the site down'),
      explain: H('Google નો server બંધ. Gateway અને DNS બંને બરાબર.', 'Google’s server goes down. The gateway and DNS are both fine.'),
      expect: H(
        'DNS હજી નામનો જવાબ આપે છે — એટલે સરનામું તો **મળે** છે, પણ ત્યાં કોઈ નથી. "Site ખૂલતી નથી" ના ત્રણેય કારણ અહીં જુદાં દેખાયાં: **તમારું નેટવર્ક, નામ, કે સામેનો server**.',
        'DNS still answers, so the address **is found** and there is nobody at it. All three reasons behind "the site will not load" have now shown themselves apart: **your network, the name, or the far end**.',
      ),
      apply: (n) => down(n, 'web', 'e0', true),
      revert: (n) => down(n, 'web', 'e0', false),
    },
  ],
  probes: [
    { id: 'gw', from: 'pc1', to: 'r1', destIp: '192.168.1.1', label: H('1 · gateway મળે?', '1 · gateway found?') },
    { id: 'dns', from: 'pc1', to: 'dns', destIp: '192.168.1.53', label: H('2 · DNS જવાબ આપે?', '2 · DNS answers?') },
    { id: 'web', from: 'pc1', to: 'web', destIp: '142.250.195.78', label: H('3 · website પહોંચે?', '3 · site reachable?') },
  ],
}

/* ═══════════ b2l4 · what NAT was quietly doing ═══════════ */

function natLab() {
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
  addr(n, 'r1', 'Gi0/1', '203.0.113.7', '255.255.255.0')
  const r = n.get('r1')!
  r.acls.set('1', {
    id: '1',
    extended: false,
    entries: [{ seq: 10, action: 'permit', protocol: 'ip', src: '192.168.1.0', srcWildcard: '0.0.0.255' }],
  })
  r.nat = { inside: ['Gi0/0'], outside: ['Gi0/1'], aclId: '1', overload: true, statics: [] }
  return n
}

export const b2l4Break: BreakSpec = {
  build: natLab,
  viewBox: { w: 880, h: 340 },
  layout: [
    { id: 'pc1', x: 110, y: 80, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'pc2', x: 110, y: 270, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 350, y: 175, type: 'switch' },
    { id: 'r1', x: 580, y: 175, type: 'router', accent: 'var(--nq-ccna)' },
    { id: 'web', x: 800, y: 175, type: 'cloud', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'અંદર ખાનગી સરનામાં (`192.168.1.x`), બહાર એક જ જાહેર સરનામું (`203.0.113.7`). વચ્ચે NAT ચૂપચાપ અનુવાદ કરે છે. **એને બંધ કરો અને જુઓ કે ખાનગી સરનામું ખરેખર એટલે શું.**',
    'Private addresses inside (`192.168.1.x`), one public address outside (`203.0.113.7`), and NAT quietly translating between them. **Switch it off and find out what "private" actually means.**',
  ),
  actions: [
    {
      id: 'nonat',
      label: H('NAT બંધ કરો', 'Switch NAT off'),
      explain: H(
        'Router પરથી અનુવાદ હટાવો. વાયર, રસ્તા, સરનામાં — બધું એ જ રહે છે.',
        'Take the translation off the router. Cables, routes and addresses all stay exactly as they were.',
      ),
      expect: H(
        'હવે packet પર **ખાનગી** સરનામું લખેલું જ બહાર જાય. એ પહોંચે પણ ખરું — પણ **જવાબ પાછો આવી શકતો નથી**, કારણ કે ઇન્ટરનેટ પર `192.168.*` નો કોઈ રસ્તો જ નથી. ખાનગી સરનામું એટલે આ જ: બહાર એનું અસ્તિત્વ નથી.',
        'The packet now leaves with its **private** address still on it. It may even arrive — but **no reply can get home**, because nothing on the internet has a route to `192.168.*`. That is all "private" means: outside, it does not exist.',
      ),
      apply: (n) => {
        n.get('r1')!.nat = undefined
        n.rev++
      },
      revert: (n) => {
        const r = n.get('r1')!
        r.nat = { inside: ['Gi0/0'], outside: ['Gi0/1'], aclId: '1', overload: true, statics: [] }
        n.rev++
      },
    },
    {
      id: 'half',
      label: H('"inside" નું નિશાન કાઢો', 'Unmark the inside interface'),
      explain: H(
        'NAT ગોઠવાયેલું રહે, પણ router ને ખબર ન રહે કે **કઈ બાજુ અંદર** છે.',
        'Leave NAT configured, but stop telling the router **which side is inside**.',
      ),
      expect: H(
        'એ જ પરિણામ, પણ કારણ જુદું: NAT ને **શું અનુવાદ કરવું** એ ખબર નથી. Configuration માં NAT દેખાય છે અને તોય કામ કરતું નથી — આ ભૂલ ખરી દુનિયામાં બહુ થાય છે.',
        'Same outcome, different cause: NAT does not know **what to translate**. The configuration still shows NAT and it still does nothing — a mistake made constantly in the real world.',
      ),
      apply: (n) => {
        n.get('r1')!.nat!.inside = []
        n.rev++
      },
      revert: (n) => {
        n.get('r1')!.nat!.inside = ['Gi0/0']
        n.rev++
      },
    },
    {
      id: 'acl',
      label: H('ફક્ત PC1 ને અનુવાદની પરવાનગી', 'Let only PC1 be translated'),
      explain: H(
        'NAT ની યાદી સાંકડી કરો — ફક્ત `192.168.1.11`. PC2 બાકી રહી જાય.',
        'Narrow the NAT list to just `192.168.1.11`, leaving PC2 out of it.',
      ),
      expect: H(
        'PC1 બહાર જાય, **PC2 નહીં** — એક જ router, એક જ વાયર, એક જ શેરી. એટલે "ઇન્ટરનેટ નથી ચાલતું" ની ફરિયાદ **અમુક જ લોકો** કરે ત્યારે NAT ની યાદી પહેલાં જોવી.',
        'PC1 gets out and **PC2 does not** — same router, same cable, same street. So when only *some* people complain that the internet is down, the NAT list is the first place to look.',
      ),
      apply: (n) => {
        n.get('r1')!.acls.get('1')!.entries[0] = {
          seq: 10,
          action: 'permit',
          protocol: 'ip',
          src: '192.168.1.11',
          srcWildcard: '0.0.0.0',
        }
        n.rev++
      },
      revert: (n) => {
        n.get('r1')!.acls.get('1')!.entries[0] = {
          seq: 10,
          action: 'permit',
          protocol: 'ip',
          src: '192.168.1.0',
          srcWildcard: '0.0.0.255',
        }
        n.rev++
      },
    },
  ],
  probes: [
    { id: 'p1', from: 'pc1', to: 'web', destIp: '203.0.113.9', label: H('PC1 → બહાર', 'PC1 → outside') },
    { id: 'p2', from: 'pc2', to: 'web', destIp: '203.0.113.9', label: H('PC2 → બહાર', 'PC2 → outside') },
  ],
}

/* ═══════════ b4l4 · the one box, function by function ═══════════ */

function homeLab() {
  const n = new Network()
  n.addDevice({ id: 'box', name: 'HOME ROUTER', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'switch part', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  n.addDevice({ id: 'ap', name: 'Wi-Fi part', kind: 'switch', ifaces: ['e0', 'radio'] })
  host(n, 'pc1', 'PC1', '192.168.0.11', '192.168.0.1')
  host(n, 'lap', 'LAPTOP', '192.168.0.12', '192.168.0.1')
  host(n, 'web', 'INTERNET', '203.0.113.9', '203.0.113.1', 'server')
  n.connect('pc1', 'e0', 'sw', 'Fa0/1')
  n.connect('ap', 'e0', 'sw', 'Fa0/2')
  n.connect('lap', 'e0', 'ap', 'radio')
  n.connect('sw', 'Fa0/3', 'box', 'Gi0/0')
  n.connect('box', 'Gi0/1', 'web', 'e0')
  addr(n, 'box', 'Gi0/0', '192.168.0.1', '255.255.255.0')
  addr(n, 'box', 'Gi0/1', '203.0.113.7', '255.255.255.0')
  const b = n.get('box')!
  b.acls.set('1', {
    id: '1',
    extended: false,
    entries: [{ seq: 10, action: 'permit', protocol: 'ip', src: '192.168.0.0', srcWildcard: '0.0.0.255' }],
  })
  b.nat = { inside: ['Gi0/0'], outside: ['Gi0/1'], aclId: '1', overload: true, statics: [] }
  return n
}

export const b4l4Break: BreakSpec = {
  build: homeLab,
  viewBox: { w: 880, h: 360 },
  layout: [
    { id: 'pc1', x: 110, y: 85, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'lap', x: 110, y: 290, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'ap', x: 300, y: 290, type: 'ap', accent: 'var(--nq-dev-ap)' },
    { id: 'sw', x: 380, y: 170, type: 'switch' },
    { id: 'box', x: 620, y: 170, type: 'router', accent: 'var(--nq-ccna)' },
    { id: 'web', x: 810, y: 170, type: 'cloud', accent: 'var(--nq-ccnp)' },
  ],
  intro: H(
    'ઘરનું એક બોક્સ, અંદર જુદા જુદા ભાગ: **switch, Wi-Fi, router અને NAT**. અહીં એ છૂટા પાડીને દોર્યા છે. એક એક ભાગ બંધ કરો — અને **કોને વાગે** એના પરથી જ એ ભાગનું કામ સમજાઈ જશે.',
    'One box at home, with separate parts inside it: **a switch, Wi-Fi, a router and NAT**. Here they are drawn apart. Switch off one part at a time — and **who it hits** will tell you what that part was doing.',
  ),
  actions: [
    {
      id: 'wifi',
      label: H('Wi-Fi નો ભાગ બંધ કરો', 'Switch off the Wi-Fi part'),
      explain: H('બોક્સનો radio બંધ. તારવાળું બધું ચાલુ.', 'The box’s radio goes off. Everything on a cable stays up.'),
      expect: H(
        'ફક્ત **લેપટોપ** ગયું. PC1 ને કશો ફરક નથી — Wi-Fi એ બોક્સનો **એક** ભાગ છે, આખું બોક્સ નહીં.',
        'Only the **laptop** drops. PC1 does not notice — Wi-Fi is **one part** of the box, not the box.',
      ),
      apply: (n) => down(n, 'ap', 'e0', true),
      revert: (n) => down(n, 'ap', 'e0', false),
    },
    {
      id: 'nat',
      label: H('NAT નો ભાગ બંધ કરો', 'Switch off the NAT part'),
      explain: H(
        'અનુવાદ હટાવો. Switch, Wi-Fi અને routing બધું ચાલુ જ રહે.',
        'Remove the translation. The switch, the Wi-Fi and the routing all keep running.',
      ),
      expect: H(
        '**બંને** ઉપકરણોનું ઇન્ટરનેટ ગયું — પણ અંદરોઅંદર? હજી બરાબર. ISP એક જ જાહેર સરનામું આપે છે, અને NAT જ એને બારેય ઉપકરણમાં વહેંચતું હતું.',
        '**Both** devices lose the internet, while they still reach each other indoors. The ISP hands out one public address, and NAT was the thing sharing it between a dozen devices.',
      ),
      apply: (n) => {
        n.get('box')!.nat = undefined
        n.rev++
      },
      revert: (n) => {
        n.get('box')!.nat = {
          inside: ['Gi0/0'],
          outside: ['Gi0/1'],
          aclId: '1',
          overload: true,
          statics: [],
        }
        n.rev++
      },
    },
    {
      id: 'switch',
      label: H('Switch નો ભાગ બંધ કરો', 'Switch off the switch part'),
      explain: H('અંદરના બધા port બંધ. Router અને NAT ચાલુ જ છે.', 'All the inside ports go down. The router and NAT are still running.'),
      expect: H(
        '**બધું જ** ગયું — કારણ કે બાકીના બધા ભાગ સુધી પહોંચવાનો રસ્તો જ આ હતો. બોક્સના ભાગો એકબીજા પર ટકેલા છે: Wi-Fi switch પર, router switch પર, NAT router પર.',
        'Everything goes — because this was the way to all the other parts. The pieces inside the box rest on each other: Wi-Fi on the switch, the router on the switch, NAT on the router.',
      ),
      apply: (n) => {
        for (const p of ['Fa0/1', 'Fa0/2', 'Fa0/3']) down(n, 'sw', p, true)
      },
      revert: (n) => {
        for (const p of ['Fa0/1', 'Fa0/2', 'Fa0/3']) down(n, 'sw', p, false)
      },
    },
  ],
  probes: [
    { id: 'in', from: 'pc1', to: 'lap', destIp: '192.168.0.12', label: H('PC1 → લેપટોપ (અંદર)', 'PC1 → laptop (indoors)') },
    { id: 'pc', from: 'pc1', to: 'web', destIp: '203.0.113.9', label: H('PC1 → ઇન્ટરનેટ', 'PC1 → internet') },
    { id: 'lap', from: 'lap', to: 'web', destIp: '203.0.113.9', label: H('લેપટોપ → ઇન્ટરનેટ', 'Laptop → internet') },
  ],
}
