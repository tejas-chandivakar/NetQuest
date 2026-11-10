import type { ConfigureSpec } from '../components/ConfigureStage'
import { Network } from '../engine/network'

const H = (gu: string, en: string) => ({ gu, en })

function addr(n: Network, id: string, ifn: string, ip: string, mask: string) {
  const i = n.get(id)!.iface(ifn)!
  i.ip = ip
  i.mask = mask
  i.shutdown = false
}

/* ═══════════ Project 1 · Home / Small Office ═══════════ */

function smallOffice() {
  const n = new Network()
  n.addDevice({ id: 'r1', name: 'OFFICE-RTR', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'sw', name: 'SW1', kind: 'switch', ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3'] })
  n.addDevice({ id: 'pc1', name: 'PC1', kind: 'pc', ifaces: ['e0'] })
  n.addDevice({ id: 'pc2', name: 'PC2', kind: 'pc', ifaces: ['e0'] })
  n.addDevice({ id: 'isp', name: 'ISP', kind: 'router', ifaces: ['Gi0/0', 'Gi0/1'] })
  n.addDevice({ id: 'web', name: 'WEB', kind: 'server', ifaces: ['e0'] })

  n.connect('r1', 'Gi0/0', 'sw', 'Fa0/1')
  n.connect('pc1', 'e0', 'sw', 'Fa0/2')
  n.connect('pc2', 'e0', 'sw', 'Fa0/3')
  n.connect('r1', 'Gi0/1', 'isp', 'Gi0/0')
  n.connect('isp', 'Gi0/1', 'web', 'e0')

  // the provider side is already live — it is not yours to configure
  addr(n, 'isp', 'Gi0/0', '203.0.113.1', '255.255.255.252')
  addr(n, 'isp', 'Gi0/1', '198.51.100.1', '255.255.255.0')
  addr(n, 'web', 'e0', '198.51.100.20', '255.255.255.0')
  n.get('web')!.defaultGateway = '198.51.100.1'
  return n
}

export const n7l1Config: ConfigureSpec = {
  build: smallOffice,
  layout: [
    { id: 'pc1', x: 80, y: 85, type: 'pc' as const, accent: 'var(--nq-beginner)' },
    { id: 'pc2', x: 80, y: 285, type: 'pc' as const, accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 290, y: 185, type: 'switch' as const },
    { id: 'r1', x: 500, y: 185, type: 'router' as const },
    { id: 'isp', x: 690, y: 185, type: 'router' as const },
    { id: 'web', x: 850, y: 185, type: 'server' as const, accent: 'var(--nq-ccnp)' },
  ],
  terminals: ['r1', 'pc1', 'pc2'],
  viewBox: { w: 920, h: 380 },
  tasks: [
    {
      id: 'brief',
      instruction: H(
        'ક્લાયન્ટ બ્રીફ વાંચો, પછી LAN બાજુ (Gi0/0) ચાલુ કરો: 192.168.10.1 / 255.255.255.0',
        'Read the brief, then bring up the LAN side (Gi0/0): 192.168.10.1 / 255.255.255.0',
      ),
      why: H(
        '"અમારી નાની ઓફિસ છે, દસેક લોકો. બધાને ઈન્ટરનેટ જોઈએ. અમે કોઈનેય જાતે સરનામું ટાઈપ કરાવવા માગતા નથી. ISP એ અમને એક જ public સરનામું આપ્યું છે." — પહેલું પગલું: ઓફિસની અંદરની બાજુ ઊભી કરો.',
        '"We are a small office, about ten people. Everyone needs internet. We do not want anyone typing addresses by hand. The ISP gave us one public address." — First step: stand up the inside of the office.',
      ),
      hints: [
        H('Router નું LAN interface Gi0/0 છે.', 'The LAN interface on the router is Gi0/0.'),
        H('interface Gi0/0 → ip address … → no shutdown', 'interface Gi0/0 → ip address … → no shutdown'),
        H(
          'enable\nconf t\ninterface Gi0/0\nip address 192.168.10.1 255.255.255.0\nno shutdown',
          'enable\nconf t\ninterface Gi0/0\nip address 192.168.10.1 255.255.255.0\nno shutdown',
        ),
      ],
      check: (n) => {
        const i = n.get('r1')?.iface('Gi0/0')
        return i?.ip === '192.168.10.1' && !i.shutdown
      },
      done: H('LAN બાજુ જીવતી છે', 'The LAN side is alive'),
    },
    {
      id: 'wan',
      instruction: H(
        'WAN બાજુ (Gi0/1) ચાલુ કરો: 203.0.113.2 / 255.255.255.252',
        'Bring up the WAN side (Gi0/1): 203.0.113.2 / 255.255.255.252',
      ),
      why: H('ISP એ આ સરનામું આપ્યું છે. એની બાજુ 203.0.113.1 છે.', 'The ISP handed you this address; their end is 203.0.113.1.'),
      hints: [
        H('બીજું interface.', 'The other interface.'),
        H('/30 એટલે mask 255.255.255.252.', 'A /30 means mask 255.255.255.252.'),
        H(
          'interface Gi0/1\nip address 203.0.113.2 255.255.255.252\nno shutdown',
          'interface Gi0/1\nip address 203.0.113.2 255.255.255.252\nno shutdown',
        ),
      ],
      check: (n) => {
        const i = n.get('r1')?.iface('Gi0/1')
        return i?.ip === '203.0.113.2' && !i.shutdown
      },
      done: H('ISP સાથે જોડાણ', 'Connected to the ISP'),
    },
    {
      id: 'default',
      instruction: H('ઈન્ટરનેટ તરફનો default route ઉમેરો (via 203.0.113.1)', 'Add the default route toward the internet (via 203.0.113.1)'),
      why: H(
        'Router ને આખા ઈન્ટરનેટના રસ્તા યાદ રાખવાની જરૂર નથી. એક લાઈન પૂરતી છે: "જે ખબર ન હોય એ બધું ISP ને મોકલી દો."',
        'The router does not need to memorise the internet. One line is enough: "anything I do not know, send to the ISP".',
      ),
      hints: [
        H('0.0.0.0 0.0.0.0 એટલે "બધું".', '0.0.0.0 0.0.0.0 means "everything".'),
        H('ip route 0.0.0.0 0.0.0.0 <ISP નું સરનામું>', 'ip route 0.0.0.0 0.0.0.0 <ISP address>'),
        H('exit\nip route 0.0.0.0 0.0.0.0 203.0.113.1', 'exit\nip route 0.0.0.0 0.0.0.0 203.0.113.1'),
      ],
      check: (n) => !!n.get('r1')?.staticRoutes.some((r) => r.prefix === '0.0.0.0'),
      done: H('Gateway of last resort સેટ', 'Gateway of last resort is set'),
    },
    {
      id: 'dhcp',
      instruction: H(
        'DHCP ગોઠવો: .1 થી .9 અનામત, pool નું નામ OFFICE, gateway 192.168.10.1',
        'Set up DHCP: reserve .1 to .9, name the pool OFFICE, gateway 192.168.10.1',
      ),
      why: H('ક્લાયન્ટે કહ્યું હતું — કોઈએ જાતે સરનામું ટાઈપ કરવું નહીં પડે.', 'The client asked for this: nobody should have to type an address.'),
      hints: [
        H('પહેલાં excluded, પછી pool.', 'Excluded addresses first, then the pool.'),
        H('ip dhcp excluded-address … → ip dhcp pool OFFICE → network … → default-router …', 'ip dhcp excluded-address … → ip dhcp pool OFFICE → network … → default-router …'),
        H(
          'ip dhcp excluded-address 192.168.10.1 192.168.10.9\nip dhcp pool OFFICE\nnetwork 192.168.10.0 255.255.255.0\ndefault-router 192.168.10.1\ndns-server 8.8.8.8',
          'ip dhcp excluded-address 192.168.10.1 192.168.10.9\nip dhcp pool OFFICE\nnetwork 192.168.10.0 255.255.255.0\ndefault-router 192.168.10.1\ndns-server 8.8.8.8',
        ),
      ],
      check: (n) => {
        const p = n.get('r1')?.dhcpPools.find((x) => x.name.toLowerCase() === 'office')
        return p?.network === '192.168.10.0' && !!p.gateway
      },
      done: H('DHCP સર્વર તૈયાર', 'The DHCP server is ready'),
    },
    {
      id: 'nat',
      instruction: H(
        'NAT ગોઠવો જેથી બધા એક જ public સરનામા પાછળથી બહાર જાય',
        'Configure NAT so everyone leaves behind the one public address',
      ),
      why: H(
        'ISP એ એક જ સરનામું આપ્યું છે, અને 192.168.x ઈન્ટરનેટ પર ચાલતું નથી. ACL + inside/outside + overload — ત્રણેય જોઈશે.',
        'The ISP gave one address, and 192.168.x does not travel the internet. You need all three pieces: the ACL, inside/outside, and overload.',
      ),
      hints: [
        H('પહેલાં ACL, પછી interfaces, પછી એક global લાઈન.', 'ACL first, then the interfaces, then one global line.'),
        H('access-list 1 permit 192.168.10.0 0.0.0.255 → ip nat inside / outside → ip nat inside source list 1 interface Gi0/1 overload', 'access-list 1 permit 192.168.10.0 0.0.0.255 → ip nat inside / outside → ip nat inside source list 1 interface Gi0/1 overload'),
        H(
          'exit\naccess-list 1 permit 192.168.10.0 0.0.0.255\ninterface Gi0/0\nip nat inside\ninterface Gi0/1\nip nat outside\nexit\nip nat inside source list 1 interface Gi0/1 overload',
          'exit\naccess-list 1 permit 192.168.10.0 0.0.0.255\ninterface Gi0/0\nip nat inside\ninterface Gi0/1\nip nat outside\nexit\nip nat inside source list 1 interface Gi0/1 overload',
        ),
      ],
      check: (n) => {
        const nat = n.get('r1')?.nat
        return !!nat?.overload && !!nat.inside.length && !!nat.outside.length && !!nat.aclId
      },
      done: H('એક public સરનામા પાછળ આખી ઓફિસ', 'The whole office hides behind one public address'),
    },
    {
      id: 'clients',
      instruction: H('PC1 અને PC2 પર DHCP થી સરનામાં લો', 'Get addresses by DHCP on PC1 and PC2'),
      hints: [
        H('બંને PC ટેબ પર જવું પડશે.', 'You will need both PC tabs.'),
        H('interface e0 → ip address dhcp', 'interface e0 → ip address dhcp'),
        H('enable\nconf t\ninterface e0\nip address dhcp', 'enable\nconf t\ninterface e0\nip address dhcp'),
      ],
      check: (n) => !!n.get('pc1')?.iface('e0')?.ip && !!n.get('pc2')?.iface('e0')?.ip,
      done: H('બંને PC આપોઆપ ગોઠવાઈ ગયા', 'Both PCs configured themselves'),
    },
    {
      id: 'internet',
      instruction: H('PC1 પરથી ઈન્ટરનેટ (198.51.100.20) ને ping કરો', 'From PC1, ping the internet at 198.51.100.20'),
      why: H('આ જ ક્લાયન્ટની ખરી કસોટી છે.', 'This is the test the client actually cares about.'),
      hints: [
        H('PC1 ટેબ.', 'The PC1 tab.'),
        H('enable → ping 198.51.100.20', 'enable → ping 198.51.100.20'),
        H('end\nping 198.51.100.20', 'end\nping 198.51.100.20'),
      ],
      check: (n) => n.ping('pc1', '198.51.100.20').ok,
      done: H('ઓફિસ ઈન્ટરનેટ પર છે', 'The office is on the internet'),
    },
  ],
  success: H(
    'પ્રોજેક્ટ પૂરો. તમે એક ખાલી router લઈને દસ લોકોની ઓફિસ ચાલુ કરી — addressing, DHCP, default routing અને NAT, બધું એકસાથે કામ કરતું. Router પર આ ત્રણ લખીને ક્લાયન્ટને બતાવો: "show ip interface brief", "show ip dhcp binding", "show ip nat translations".',
    'Project complete. You took a bare router and put a ten-person office online: addressing, DHCP, default routing and NAT, all working together. Show the client these three on the router: "show ip interface brief", "show ip dhcp binding" and "show ip nat translations".',
  ),
}

/* ═══════════ Project 2 · Small Business, departments apart ═══════════ */

function business() {
  const n = new Network()
  n.addDevice({
    id: 'sw',
    name: 'CORE-SW',
    kind: 'switch',
    ifaces: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4'],
  })
  const host = (id: string, name: string, ip: string, port: string, gw: string) => {
    n.addDevice({ id, name, kind: 'pc', ifaces: ['e0'] })
    const i = n.get(id)!.iface('e0')!
    i.ip = ip
    i.mask = '255.255.255.0'
    n.get(id)!.defaultGateway = gw
    n.connect(id, 'e0', 'sw', port)
  }
  host('sales1', 'SALES-PC', '10.10.10.10', 'Fa0/1', '10.10.10.1')
  host('sales2', 'SALES-PRN', '10.10.10.11', 'Fa0/2', '10.10.10.1')
  host('hr1', 'HR-PC', '10.20.20.10', 'Fa0/3', '10.20.20.1')
  host('hr2', 'HR-SRV', '10.20.20.50', 'Fa0/4', '10.20.20.1')
  return n
}

const svi = (n: Network, vlan: number) => n.get('sw')?.svi(vlan)

export const n7l2Config: ConfigureSpec = {
  build: business,
  layout: [
    { id: 'sales1', x: 110, y: 80, type: 'pc' as const, accent: 'var(--nq-beginner)' },
    { id: 'sales2', x: 110, y: 290, type: 'pc' as const, accent: 'var(--nq-beginner)' },
    { id: 'sw', x: 450, y: 185, type: 'switch' as const },
    { id: 'hr1', x: 790, y: 80, type: 'pc' as const, accent: 'var(--nq-ccnp)' },
    { id: 'hr2', x: 790, y: 290, type: 'server' as const, accent: 'var(--nq-ccnp)' },
  ],
  terminals: ['sw', 'sales1', 'hr1'],
  viewBox: { w: 900, h: 380 },
  tasks: [
    {
      id: 'vlans',
      instruction: H(
        'VLAN 10 (SALES) અને VLAN 20 (HR) બનાવો',
        'Create VLAN 10 (SALES) and VLAN 20 (HR)',
      ),
      why: H(
        '"અમારે Sales અને HR ને અલગ રાખવાં છે. HR નો ડેટા Sales ના લોકો ન જોઈ શકે. પણ બંનેએ એક જ printer અને એક જ ઈન્ટરનેટ વાપરવાનાં છે." — પહેલાં જૂથ પાડીએ.',
        '"We want Sales and HR kept apart. Sales must not see HR data. But both share one printer and one internet line." — Start by making the groups.',
      ),
      hints: [
        H('Switch પર બે VLAN.', 'Two VLANs on the switch.'),
        H('vlan 10 → name SALES · vlan 20 → name HR', 'vlan 10 → name SALES · vlan 20 → name HR'),
        H(
          'enable\nconf t\nvlan 10\nname SALES\nexit\nvlan 20\nname HR',
          'enable\nconf t\nvlan 10\nname SALES\nexit\nvlan 20\nname HR',
        ),
      ],
      check: (n) => !!n.get('sw')?.vlans.get(10) && !!n.get('sw')?.vlans.get(20),
      done: H('બે જૂથ બન્યાં', 'Two groups exist'),
    },
    {
      id: 'ports',
      instruction: H(
        'Fa0/1 અને Fa0/2 ને VLAN 10 માં, Fa0/3 અને Fa0/4 ને VLAN 20 માં મૂકો',
        'Put Fa0/1 and Fa0/2 into VLAN 10, and Fa0/3 and Fa0/4 into VLAN 20',
      ),
      hints: [
        H('દરેક port પર બે લાઈન.', 'Two lines on each port.'),
        H('switchport mode access → switchport access vlan <id>', 'switchport mode access → switchport access vlan <id>'),
        H(
          'interface Fa0/1\nswitchport mode access\nswitchport access vlan 10\ninterface Fa0/2\nswitchport access vlan 10\ninterface Fa0/3\nswitchport access vlan 20\ninterface Fa0/4\nswitchport access vlan 20',
          'interface Fa0/1\nswitchport mode access\nswitchport access vlan 10\ninterface Fa0/2\nswitchport access vlan 10\ninterface Fa0/3\nswitchport access vlan 20\ninterface Fa0/4\nswitchport access vlan 20',
        ),
      ],
      check: (n) => {
        const p = (x: string) => n.get('sw')?.iface(x)?.switchport?.accessVlan
        return p('Fa0/1') === 10 && p('Fa0/2') === 10 && p('Fa0/3') === 20 && p('Fa0/4') === 20
      },
      done: H('દરેક ડિવાઇસ પોતાના જૂથમાં', 'Every device is in its group'),
    },
    {
      id: 'svis',
      instruction: H(
        'બંને VLAN માટે SVI બનાવો: Vlan10 = 10.10.10.1/24, Vlan20 = 10.20.20.1/24',
        'Create an SVI for each VLAN: Vlan10 = 10.10.10.1/24 and Vlan20 = 10.20.20.1/24',
      ),
      why: H(
        'દરેક VLAN ને પોતાનું gateway જોઈએ. Switch ની અંદર જ એક "કાલ્પનિક interface" બનાવીએ — એને SVI કહે છે.',
        'Each VLAN needs its own gateway. We build a virtual interface inside the switch itself, called an SVI.',
      ),
      hints: [
        H('interface Vlan10 લખો — એ આપોઆપ બની જશે.', 'Type interface Vlan10 and it is created for you.'),
        H('interface Vlan10 → ip address 10.10.10.1 255.255.255.0', 'interface Vlan10 → ip address 10.10.10.1 255.255.255.0'),
        H(
          'interface Vlan10\nip address 10.10.10.1 255.255.255.0\ninterface Vlan20\nip address 10.20.20.1 255.255.255.0',
          'interface Vlan10\nip address 10.10.10.1 255.255.255.0\ninterface Vlan20\nip address 10.20.20.1 255.255.255.0',
        ),
      ],
      check: (n) => svi(n, 10)?.ip === '10.10.10.1' && svi(n, 20)?.ip === '10.20.20.1',
      done: H('બંને VLAN ને gateway મળ્યું', 'Both VLANs have a gateway'),
    },
    {
      id: 'routing',
      instruction: H('Switch પર routing ચાલુ કરો', 'Turn on routing on the switch'),
      why: H(
        'SVI બની ગયાં છતાં switch હજી બે VLAN વચ્ચે કશું પસાર નહીં કરે — એ Layer 2 ડિવાઇસ છે. એક લાઈન એને Layer 3 બનાવે છે.',
        'The SVIs exist, but the switch still passes nothing between the VLANs — it is a layer 2 device. One line turns it into a layer 3 one.',
      ),
      hints: [
        H('Global config માં એક લાઈન.', 'One line in global config.'),
        H('ip routing', 'ip routing'),
        H('exit\nip routing', 'exit\nip routing'),
      ],
      check: (n) => !!n.get('sw')?.ipRouting,
      done: H('Switch હવે routing કરે છે', 'The switch routes now'),
    },
    {
      id: 'reach',
      instruction: H(
        'ચકાસો કે SALES-PC હવે HR-PC સુધી પહોંચે છે (10.20.20.10)',
        'Check that SALES-PC can now reach HR-PC at 10.20.20.10',
      ),
      why: H(
        'એક ક્ષણ માટે બધું જોડાયેલું છે. હવે આપણે જાણીજોઈને ફક્ત જરૂરી રસ્તો ખુલ્લો રાખીશું.',
        'For a moment everything is connected. Next we deliberately keep open only what is needed.',
      ),
      hints: [
        H('SALES-PC ટેબ પર જાઓ.', 'Go to the SALES-PC tab.'),
        H('enable → ping 10.20.20.10', 'enable → ping 10.20.20.10'),
        H('enable\nping 10.20.20.10', 'enable\nping 10.20.20.10'),
      ],
      check: (n) => n.ping('sales1', '10.20.20.10').ok,
      done: H('Inter-VLAN routing ચાલે છે', 'Inter-VLAN routing works'),
    },
    {
      id: 'protect',
      instruction: H(
        'હવે ક્લાયન્ટની શરત પૂરી કરો: Sales ને HR-SRV (10.20.20.50) સુધી જતાં રોકો, બાકી બધું ચાલુ રાખો',
        'Now meet the client requirement: stop Sales from reaching HR-SRV (10.20.20.50), leaving everything else working',
      ),
      why: H(
        'આખું VLAN બંધ કરવું સહેલું છે, પણ ક્લાયન્ટને એ નથી જોઈતું. ફક્ત એક સર્વર સુધીનો રસ્તો બંધ કરવાનો છે.',
        'Blocking the whole VLAN would be easy, but that is not what the client asked for. Only the path to one server must close.',
      ),
      hints: [
        H('Extended ACL, અને એને Vlan10 પર inbound લગાવો.', 'An extended ACL, applied inbound on Vlan10.'),
        H('access-list 110 deny ip 10.10.10.0 0.0.0.255 host 10.20.20.50 → permit ip any any', 'access-list 110 deny ip 10.10.10.0 0.0.0.255 host 10.20.20.50 → permit ip any any'),
        H(
          'access-list 110 deny ip 10.10.10.0 0.0.0.255 host 10.20.20.50\naccess-list 110 permit ip any any\ninterface Vlan10\nip access-group 110 in',
          'access-list 110 deny ip 10.10.10.0 0.0.0.255 host 10.20.20.50\naccess-list 110 permit ip any any\ninterface Vlan10\nip access-group 110 in',
        ),
      ],
      check: (n) =>
        !n.ping('sales1', '10.20.20.50').ok &&
        n.ping('sales1', '10.20.20.10').ok &&
        n.ping('hr1', '10.10.10.10').ok,
      done: H('HR નો સર્વર સુરક્ષિત, બાકી બધું ચાલુ', 'The HR server is protected, everything else still runs'),
    },
  ],
  success: H(
    'પ્રોજેક્ટ પૂરો — અને આ વખતે તમે ત્રણ વસ્તુ એકસાથે વાપરી: VLAN થી વિભાગ અલગ કર્યા, SVI અને ip routing થી જરૂર પૂરતું જોડ્યા, અને ACL થી ફક્ત એક સર્વરનો દરવાજો બંધ કર્યો. ખરા enterprise નેટવર્કમાં આ ત્રણ સ્તર હંમેશાં સાથે જ વપરાય છે. "show vlan brief", "show ip route" અને "show access-lists" — ત્રણેય જોઈ લો.',
    'Project complete — and this time three things worked together: VLANs separated the departments, SVIs with ip routing joined them where needed, and an ACL closed the door to exactly one server. In real enterprise networks those three layers always travel together. Look at "show vlan brief", "show ip route" and "show access-lists".',
  ),
}
