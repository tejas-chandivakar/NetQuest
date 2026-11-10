import type { ConfigureSpec } from '../components/ConfigureStage'
import { Network } from '../engine/network'

/* ───────── b1l1 · two computers on one cable ───────── */

export const b1l1Config: ConfigureSpec = {
  build: () => {
    const n = new Network()
    n.addDevice({ id: 'pc1', name: 'PC1', kind: 'pc', ifaces: ['e0'] })
    n.addDevice({ id: 'pc2', name: 'PC2', kind: 'pc', ifaces: ['e0'] })
    n.connect('pc1', 'e0', 'pc2', 'e0')
    return n
  },
  layout: [
    { id: 'pc1', x: 240, y: 150, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'pc2', x: 620, y: 150, type: 'pc', accent: 'var(--nq-ccna)' },
  ],
  terminals: ['pc1', 'pc2'],
  viewBox: { w: 860, h: 300 },
  tasks: [
    {
      id: 'pc1-ip',
      instruction: {
        gu: 'PC1 ને સરનામું આપો: 192.168.1.10 / 255.255.255.0',
        en: 'Give PC1 the address 192.168.1.10 / 255.255.255.0',
      },
      why: {
        gu: 'વાયર તો જોડાયેલો છે, પણ સરનામા વગર કોઈ સંદેશ મોકલી શકાય નહીં.',
        en: 'The cable is already connected, but without an address no message can be sent.',
      },
      hints: [
        {
          gu: 'પહેલાં configure mode માં જવું પડશે, પછી interface e0 પસંદ કરવું પડશે.',
          en: 'First get into configuration mode, then select interface e0.',
        },
        {
          gu: 'enable → configure terminal → interface e0 → ip address <IP> <MASK>',
          en: 'enable → configure terminal → interface e0 → ip address <IP> <MASK>',
        },
        {
          gu: 'enable\nconfigure terminal\ninterface e0\nip address 192.168.1.10 255.255.255.0',
          en: 'enable\nconfigure terminal\ninterface e0\nip address 192.168.1.10 255.255.255.0',
        },
      ],
      check: (n) => {
        const i = n.get('pc1')?.iface('e0')
        return i?.ip === '192.168.1.10' && i?.mask === '255.255.255.0' && !i.shutdown
      },
      done: { gu: 'PC1 પાસે સરનામું છે', en: 'PC1 has an address' },
    },
    {
      id: 'pc2-ip',
      instruction: {
        gu: 'PC2 પર જાઓ અને એને 192.168.1.20 / 255.255.255.0 આપો',
        en: 'Switch to PC2 and give it 192.168.1.20 / 255.255.255.0',
      },
      why: {
        gu: 'ઉપરના PC2 ટેબ પર ક્લિક કરો — દરેક ડિવાઇસનું પોતાનું console હોય છે.',
        en: 'Click the PC2 tab above — every device has its own console.',
      },
      hints: [
        { gu: 'PC2 ટેબ પર ક્લિક કરો, પછી એ જ ચાર કમાન્ડ.', en: 'Click the PC2 tab, then the same four commands.' },
        { gu: 'બંને એક જ network માં હોવા જોઈએ: 192.168.1.x', en: 'Both must sit in the same network: 192.168.1.x' },
        {
          gu: 'enable\nconfigure terminal\ninterface e0\nip address 192.168.1.20 255.255.255.0',
          en: 'enable\nconfigure terminal\ninterface e0\nip address 192.168.1.20 255.255.255.0',
        },
      ],
      check: (n) => {
        const i = n.get('pc2')?.iface('e0')
        return i?.ip === '192.168.1.20' && i?.mask === '255.255.255.0' && !i.shutdown
      },
      done: { gu: 'PC2 પાસે સરનામું છે', en: 'PC2 has an address' },
    },
    {
      id: 'ping',
      instruction: {
        gu: 'PC1 પરથી PC2 ને ping કરો',
        en: 'From PC1, ping PC2',
      },
      why: {
        gu: 'Ping એ નેટવર્કનું "હેલો, સંભળાય છે?" છે.',
        en: 'Ping is the network way of asking "hello, can you hear me?"',
      },
      hints: [
        { gu: 'PC1 ટેબ પર જાઓ. Config mode માંથી બહાર નીકળવું પડશે (end).', en: 'Go to the PC1 tab. You need to leave config mode first (end).' },
        { gu: 'end → ping <PC2 નું સરનામું>', en: 'end → ping <PC2 address>' },
        { gu: 'end\nping 192.168.1.20', en: 'end\nping 192.168.1.20' },
      ],
      check: (n) => {
        const a = n.get('pc1')?.iface('e0')
        const b = n.get('pc2')?.iface('e0')
        if (!a?.ip || !b?.ip) return false
        return n.ping('pc1', '192.168.1.20').ok
      },
      done: { gu: 'Ping સફળ — બંને વાત કરે છે', en: 'Ping works — they are talking' },
    },
  ],
  success: {
    gu: 'તમે હમણાં જ તમારું પહેલું નેટવર્ક જાતે configure કર્યું. હવે અજમાવી જુઓ: PC2 પર જઈને interface e0 માં shutdown લખો — અને ઉપરની લિંક લાલ થતી અને ping તૂટતી જુઓ.',
    en: 'You just configured your first network by hand. Now try this: go to PC2, enter interface e0 and type shutdown — watch the link above turn red and the ping break.',
  },
}

/* ───────── n3l3 · static routing across two routers ───────── */

export const n3l3Config: ConfigureSpec = {
  build: () => {
    const n = new Network()
    n.addDevice({ id: 'pc1', name: 'PC1', kind: 'pc', ifaces: ['e0'] })
    n.addDevice({ id: 'r1', name: 'R1', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
    n.addDevice({ id: 'r2', name: 'R2', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
    n.addDevice({ id: 'pc2', name: 'PC2', kind: 'pc', ifaces: ['e0'] })

    n.connect('pc1', 'e0', 'r1', 'Gi0/0')
    n.connect('r1', 'Gi0/1', 'r2', 'Gi0/1')
    n.connect('r2', 'Gi0/0', 'pc2', 'e0')

    // the two hosts are pre-configured; the routers are yours to build
    const pc1 = n.get('pc1')!.iface('e0')!
    pc1.ip = '192.168.1.10'
    pc1.mask = '255.255.255.0'
    n.get('pc1')!.defaultGateway = '192.168.1.1'

    const pc2 = n.get('pc2')!.iface('e0')!
    pc2.ip = '192.168.2.10'
    pc2.mask = '255.255.255.0'
    n.get('pc2')!.defaultGateway = '192.168.2.1'

    return n
  },
  layout: [
    { id: 'pc1', x: 105, y: 150, type: 'pc', accent: 'var(--nq-beginner)' },
    { id: 'r1', x: 330, y: 150, type: 'router' },
    { id: 'r2', x: 560, y: 150, type: 'router' },
    { id: 'pc2', x: 775, y: 150, type: 'pc', accent: 'var(--nq-ccnp)' },
  ],
  terminals: ['r1', 'r2', 'pc1'],
  viewBox: { w: 880, h: 300 },
  tasks: [
    {
      id: 'r1-lan',
      instruction: {
        gu: 'R1 નું Gi0/0 (LAN બાજુ) ચાલુ કરો: 192.168.1.1 / 255.255.255.0',
        en: 'Bring up R1 Gi0/0 (the LAN side): 192.168.1.1 / 255.255.255.0',
      },
      why: {
        gu: 'PC1 નું default gateway આ જ સરનામું છે — એટલે R1 એ સરનામું ધારણ કરે તો જ PC1 બહાર જઈ શકે.',
        en: "PC1's default gateway is this address — PC1 can only leave its LAN once R1 owns it.",
      },
      hints: [
        {
          gu: 'Router ના interfaces by default બંધ હોય છે. સરનામું આપ્યા પછી no shutdown ભૂલશો નહીં.',
          en: 'Router interfaces are shut by default. Do not forget no shutdown after the address.',
        },
        {
          gu: 'enable → conf t → interface Gi0/0 → ip address … → no shutdown',
          en: 'enable → conf t → interface Gi0/0 → ip address … → no shutdown',
        },
        {
          gu: 'enable\nconf t\ninterface Gi0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown',
          en: 'enable\nconf t\ninterface Gi0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown',
        },
      ],
      check: (n) => {
        const i = n.get('r1')?.iface('Gi0/0')
        return i?.ip === '192.168.1.1' && i?.mask === '255.255.255.0' && !i.shutdown
      },
      done: { gu: 'R1 Gi0/0 ચાલુ છે', en: 'R1 Gi0/0 is up' },
    },
    {
      id: 'r1-wan',
      instruction: {
        gu: 'R1 નું Gi0/1 (R2 તરફની લિંક): 10.0.0.1 / 255.255.255.252',
        en: 'R1 Gi0/1 (the link toward R2): 10.0.0.1 / 255.255.255.252',
      },
      why: {
        gu: '/30 એટલે ફક્ત બે વાપરી શકાય એવાં સરનામાં — બે router ને જોડતી લિંક માટે બરાબર એટલું જ જોઈએ.',
        en: 'A /30 gives exactly two usable addresses — precisely what a link between two routers needs.',
      },
      hints: [
        { gu: 'બીજું interface પસંદ કરો અને એ જ ત્રણ પગલાં.', en: 'Select the other interface and repeat the same three steps.' },
        { gu: 'interface Gi0/1 → ip address 10.0.0.1 255.255.255.252 → no shutdown', en: 'interface Gi0/1 → ip address 10.0.0.1 255.255.255.252 → no shutdown' },
        {
          gu: 'interface Gi0/1\nip address 10.0.0.1 255.255.255.252\nno shutdown',
          en: 'interface Gi0/1\nip address 10.0.0.1 255.255.255.252\nno shutdown',
        },
      ],
      check: (n) => {
        const i = n.get('r1')?.iface('Gi0/1')
        return i?.ip === '10.0.0.1' && i?.mask === '255.255.255.252' && !i.shutdown
      },
      done: { gu: 'R1 Gi0/1 ચાલુ છે', en: 'R1 Gi0/1 is up' },
    },
    {
      id: 'r2-wan',
      instruction: {
        gu: 'R2 ટેબ પર જાઓ. Gi0/1: 10.0.0.2 / 255.255.255.252',
        en: 'Switch to the R2 tab. Gi0/1: 10.0.0.2 / 255.255.255.252',
      },
      why: {
        gu: 'બંને છેડા એક જ /30 માં હોવા જોઈએ, નહીંતર લિંક ઉપર તો દેખાશે પણ વાત નહીં થાય.',
        en: 'Both ends must sit in the same /30, otherwise the link looks up but nothing passes.',
      },
      hints: [
        { gu: 'ઉપરના R2 ટેબ પર ક્લિક કરો.', en: 'Click the R2 tab above.' },
        { gu: 'enable → conf t → interface Gi0/1 → …', en: 'enable → conf t → interface Gi0/1 → …' },
        {
          gu: 'enable\nconf t\ninterface Gi0/1\nip address 10.0.0.2 255.255.255.252\nno shutdown',
          en: 'enable\nconf t\ninterface Gi0/1\nip address 10.0.0.2 255.255.255.252\nno shutdown',
        },
      ],
      check: (n) => {
        const i = n.get('r2')?.iface('Gi0/1')
        return i?.ip === '10.0.0.2' && i?.mask === '255.255.255.252' && !i.shutdown
      },
      done: { gu: 'R2 Gi0/1 ચાલુ છે — લિંક જીવંત', en: 'R2 Gi0/1 is up — the link is alive' },
    },
    {
      id: 'r2-lan',
      instruction: {
        gu: 'R2 નું Gi0/0 (PC2 ની બાજુ): 192.168.2.1 / 255.255.255.0',
        en: 'R2 Gi0/0 (the PC2 side): 192.168.2.1 / 255.255.255.0',
      },
      hints: [
        { gu: 'PC2 નું gateway 192.168.2.1 છે.', en: "PC2's gateway is 192.168.2.1." },
        { gu: 'interface Gi0/0 → ip address 192.168.2.1 255.255.255.0 → no shutdown', en: 'interface Gi0/0 → ip address 192.168.2.1 255.255.255.0 → no shutdown' },
        {
          gu: 'interface Gi0/0\nip address 192.168.2.1 255.255.255.0\nno shutdown',
          en: 'interface Gi0/0\nip address 192.168.2.1 255.255.255.0\nno shutdown',
        },
      ],
      check: (n) => {
        const i = n.get('r2')?.iface('Gi0/0')
        return i?.ip === '192.168.2.1' && i?.mask === '255.255.255.0' && !i.shutdown
      },
      done: { gu: 'R2 Gi0/0 ચાલુ છે', en: 'R2 Gi0/0 is up' },
    },
    {
      id: 'r1-route',
      instruction: {
        gu: 'R1 ને 192.168.2.0/24 સુધીનો રસ્તો શીખવો (via 10.0.0.2)',
        en: 'Teach R1 the way to 192.168.2.0/24 (via 10.0.0.2)',
      },
      why: {
        gu: 'Router ફક્ત પોતાની સાથે સીધાં જોડાયેલાં networks જાણે છે. દૂરનું network એને કહેવું પડે.',
        en: 'A router only knows the networks directly attached to it. Anything further away must be taught.',
      },
      hints: [
        { gu: 'આ global config માં લખાય છે, interface માં નહીં. (end કે exit કરીને conf t માં આવો.)', en: 'This goes in global config, not under an interface. (exit back to conf t.)' },
        { gu: 'ip route <network> <mask> <next-hop>', en: 'ip route <network> <mask> <next-hop>' },
        { gu: 'exit\nip route 192.168.2.0 255.255.255.0 10.0.0.2', en: 'exit\nip route 192.168.2.0 255.255.255.0 10.0.0.2' },
      ],
      check: (n) =>
        !!n
          .get('r1')
          ?.staticRoutes.some(
            (r) => r.prefix === '192.168.2.0' && r.mask === '255.255.255.0' && r.nextHop === '10.0.0.2',
          ),
      done: { gu: 'R1 જાણે છે કે 192.168.2.0 ક્યાં છે', en: 'R1 knows where 192.168.2.0 lives' },
    },
    {
      id: 'r2-route',
      instruction: {
        gu: 'R2 ને પાછો રસ્તો શીખવો: 192.168.1.0/24 via 10.0.0.1',
        en: 'Teach R2 the way back: 192.168.1.0/24 via 10.0.0.1',
      },
      why: {
        gu: 'જવાબ પણ પાછો આવવો જોઈએ. એક જ દિશાનો રસ્તો હોય તો ping કદી સફળ ન થાય — આ સૌથી સામાન્ય ભૂલ છે.',
        en: 'The reply has to get back too. With a route in only one direction a ping never succeeds — this is the single most common mistake.',
      },
      hints: [
        { gu: 'R2 ટેબ પર જાઓ અને એનું ઊલટું લખો.', en: 'Go to the R2 tab and write the mirror image.' },
        { gu: 'ip route 192.168.1.0 … <R1 નું 10.0.0.x સરનામું>', en: 'ip route 192.168.1.0 … <R1 address on the 10.0.0.x link>' },
        { gu: 'ip route 192.168.1.0 255.255.255.0 10.0.0.1', en: 'ip route 192.168.1.0 255.255.255.0 10.0.0.1' },
      ],
      check: (n) =>
        !!n
          .get('r2')
          ?.staticRoutes.some(
            (r) => r.prefix === '192.168.1.0' && r.mask === '255.255.255.0' && r.nextHop === '10.0.0.1',
          ),
      done: { gu: 'R2 પાસે પાછો રસ્તો છે', en: 'R2 has the return path' },
    },
    {
      id: 'end-to-end',
      instruction: {
        gu: 'PC1 ટેબ પરથી PC2 (192.168.2.10) ને ping કરો',
        en: 'From the PC1 tab, ping PC2 at 192.168.2.10',
      },
      hints: [
        { gu: 'PC1 ટેબ પર જાઓ.', en: 'Switch to the PC1 tab.' },
        { gu: 'enable → ping <PC2 નું સરનામું>', en: 'enable → ping <PC2 address>' },
        { gu: 'enable\nping 192.168.2.10', en: 'enable\nping 192.168.2.10' },
      ],
      check: (n) => n.ping('pc1', '192.168.2.10').ok,
      done: { gu: 'બંને LAN વચ્ચે ping ચાલે છે', en: 'The two LANs can reach each other' },
    },
  ],
  success: {
    gu: 'બે અલગ networks હવે એકબીજા સાથે વાત કરે છે — અને એ તમે જાતે જોડ્યાં. હવે તોડીને જુઓ: R2 પર "no ip route 192.168.1.0 255.255.255.0 10.0.0.1" લખો અને ફરી ping કરો. Packet જશે, પણ જવાબ પાછો નહીં આવે — એટલે ping નિષ્ફળ જશે. આ જ એક દિશાના રસ્તાની ભૂલ છે.',
    en: 'Two separate networks are now talking to each other, and you joined them by hand. Now break it: on R2 type "no ip route 192.168.1.0 255.255.255.0 10.0.0.1" and ping again. The packet gets there, but the reply has no way home — so the ping fails. That is the one-way-route mistake.',
  },
}
