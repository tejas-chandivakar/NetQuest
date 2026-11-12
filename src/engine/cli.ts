import { Network, type Device, type SwitchPort } from './network'
import { neighborViews, routerIdOf, type Proto } from './routing'
import { dhcpRequest, parseAclTarget, type AclProtocol } from './services'
import { bgpRouterId, bgpSessions, computeBgp } from './bgp'
import { cidr, intToIp, isIp, isValidMask, maskToPrefix, prefixToMask } from './ip'

export type CliMode =
  | 'user'
  | 'priv'
  | 'config'
  | 'config-if'
  | 'config-vlan'
  | 'config-router'
  | 'config-dhcp'

export type LineKind = 'in' | 'out' | 'err' | 'info' | 'ok'

export interface CliLine {
  text: string
  kind: LineKind
}

export interface CliCtx {
  net: Network
  dev: Device
  session: CliSession
}

type ArgType = 'ip' | 'mask' | 'word' | 'number' | 'rest'

interface ArgSpec {
  name: string
  type: ArgType
  optional?: boolean
}

/** A bilingual string. Declared here so the engine stays free of UI imports. */
export interface CmdText {
  gu: string
  en: string
}

interface CmdDef {
  modes: CliMode[]
  words: string[]
  args?: ArgSpec[]
  help: string
  /** what this command actually does, in words a beginner can use */
  means?: CmdText
  run: (ctx: CliCtx, args: string[]) => CliLine[] | void
}

const out = (...t: string[]): CliLine[] => t.map((text) => ({ text, kind: 'out' as const }))
const err = (t: string): CliLine[] => [{ text: t, kind: 'err' }]
const info = (t: string): CliLine[] => [{ text: t, kind: 'info' }]

const INVALID = "% Invalid input detected at '^' marker."
const INCOMPLETE = '% Incomplete command.'

function pad(s: string, n: number) {
  return s.length >= n ? s : s + ' '.repeat(n - s.length)
}

function ifaceStatus(net: Network, dev: Device, name: string) {
  const i = dev.iface(name)!
  if (i.shutdown) return { status: 'administratively down', proto: 'down' }
  if (!i.peer) return { status: 'down', proto: 'down' }
  return net.linkUp(dev.id, name)
    ? { status: 'up', proto: 'up' }
    : { status: 'up', proto: 'down' }
}

function portOf(dev: Device, ifaceName?: string): SwitchPort | undefined {
  if (!ifaceName) return undefined
  const i = dev.iface(ifaceName)
  return i?.switchport
}

/** "10,20" or "10-12" or "10,20-22" -> [10,20,21,22]; null if malformed. */
function parseVlanList(list: string): number[] | null {
  const acc: number[] = []
  for (const part of list.split(',')) {
    const range = /^(\d+)-(\d+)$/.exec(part)
    if (range) {
      const a = Number(range[1])
      const b = Number(range[2])
      if (a > b) return null
      for (let v = a; v <= b; v++) acc.push(v)
    } else if (/^\d+$/.test(part)) {
      acc.push(Number(part))
    } else {
      return null
    }
  }
  return acc.length ? [...new Set(acc)] : null
}

function ipToIntLocal(ip: string): number {
  return ip.split('.').reduce((acc, o) => (acc << 8) + Number(o), 0) >>> 0
}

/** Is this device the one answering for its own HSRP virtual address? */
function hsrpSelfActive(net: Network, dev: Device, ifaceName: string): boolean {
  const vip = dev.iface(ifaceName)?.hsrp?.virtualIp
  if (!vip) return false
  const peer = net.segmentOf(dev.id, ifaceName)
  let bestPriority = dev.iface(ifaceName)!.hsrp!.priority
  for (const ep of peer) {
    const other = net.get(ep.device)?.iface(ep.iface)
    if (other?.hsrp?.virtualIp === vip && !other.shutdown && other.hsrp.priority > bestPriority) {
      return false
    }
  }
  return true
}

/* ────────────────────────── command table ────────────────────────── */

const COMMANDS: CmdDef[] = [
  {
    modes: ['user'],
    words: ['enable'],
    help: 'Turn on privileged commands',
    means: { gu: 'ચાલુ કરો — હવે તમે જોઈ પણ શકો અને બદલી પણ શકો.', en: 'Unlock the device. Until you do, you can only look, not change.' },
    run: ({ session }) => {
      session.mode = 'priv'
    },
  },
  {
    modes: ['priv'],
    words: ['disable'],
    help: 'Turn off privileged commands',
    means: { gu: 'પાછા જાઓ — હવે ફક્ત જોઈ શકાશે.', en: 'Step back down to look-only mode.' },
    run: ({ session }) => {
      session.mode = 'user'
    },
  },
  {
    modes: ['priv'],
    words: ['configure', 'terminal'],
    help: 'Enter configuration mode',
    means: { gu: 'બદલાવ કરવાની જગ્યાએ જાઓ. હવે જે લખશો એ સેટિંગ બદલશે.', en: 'Enter the place where settings are changed. From here, what you type takes effect.' },
    run: ({ session }) => {
      session.mode = 'config'
      return info('Enter configuration commands, one per line.  End with CNTL/Z.')
    },
  },
  {
    modes: ['config', 'config-if', 'config-vlan', 'config-router', 'config-dhcp'],
    words: ['exit'],
    help: 'Exit from the current mode',
    means: { gu: 'એક પગથિયું પાછા — જેમ ફોલ્ડરમાંથી બહાર.', en: 'Back up one level, like stepping out of a folder.' },
    run: ({ session }) => {
      session.mode = session.mode === 'config' ? 'priv' : 'config'
      session.iface = undefined
      session.vlan = undefined
    },
  },
  {
    modes: ['user', 'priv'],
    words: ['exit'],
    help: 'Exit from the EXEC',
    means: { gu: 'સત્ર બંધ કરો.', en: 'Close the session.' },
    run: ({ session }) => {
      session.mode = 'user'
    },
  },
  {
    modes: ['config', 'config-if', 'config-vlan', 'config-router', 'config-dhcp'],
    words: ['end'],
    help: 'Exit to privileged EXEC mode',
    means: { gu: 'એકદમ બહાર — ગમે તેટલા ખાનામાંથી સીધા ઉપર.', en: 'Jump straight back to the top, however deep you are.' },
    run: ({ session }) => {
      session.mode = 'priv'
      session.iface = undefined
      session.vlan = undefined
      session.router = undefined
    },
  },
  {
    modes: ['config'],
    words: ['hostname'],
    args: [{ name: 'WORD', type: 'word' }],
    help: 'Set system network name',
    means: { gu: 'ઉપકરણનું નામ બદલો — prompt માં એ જ દેખાશે.', en: 'Rename the device. The prompt changes to match.' },
    run: ({ dev }, [name]) => {
      dev.name = name
    },
  },
  {
    // real IOS lets you jump straight from one interface to another
    modes: ['config', 'config-if'],
    words: ['interface'],
    args: [{ name: 'IFACE', type: 'word' }],
    help: 'Select an interface to configure',
    means: { gu: 'કયા પોર્ટ પર કામ કરવું એ પસંદ કરો.', en: 'Pick which port you are about to configure.' },
    run: ({ dev, session, net }, [name]) => {
      let i = dev.iface(name)
      const svi = /^vlan\s*(\d+)$/i.exec(name.replace(/\s+/g, ''))
      if (!i && svi && dev.kind === 'switch') {
        const id = Number(svi[1])
        i = { name: `Vlan${id}`, shutdown: false, vlanId: id }
        dev.ifaces.push(i)
        net.rev++
      }
      if (!i) return err(INVALID)
      session.mode = 'config-if'
      session.iface = i.name
    },
  },
  {
    modes: ['config-if'],
    words: ['ip', 'address'],
    args: [
      { name: 'A.B.C.D', type: 'ip' },
      { name: 'MASK', type: 'mask' },
    ],
    help: 'Set the IP address of an interface',
    means: { gu: 'આ પોર્ટને સરનામું આપો.', en: 'Give this port its address on the network.' },
    run: ({ dev, session, net }, [ip, mask]) => {
      const i = dev.iface(session.iface!)!
      i.ip = ip
      i.mask = mask
      net.rev++
      return info(`% Address ${cidr(ip, mask)} configured on ${i.name}`)
    },
  },
  {
    modes: ['config-if'],
    words: ['no', 'ip', 'address'],
    help: 'Remove the IP address',
    means: { gu: 'સરનામું કાઢી નાખો.', en: 'Take the address off this port.' },
    run: ({ dev, session, net }) => {
      const i = dev.iface(session.iface!)!
      i.ip = undefined
      i.mask = undefined
      net.rev++
    },
  },
  {
    modes: ['config-if'],
    words: ['shutdown'],
    help: 'Shut the interface down',
    means: { gu: 'પોર્ટ બંધ કરો — વાયર જોડેલો હોય તો પણ.', en: 'Switch the port off, even with a cable plugged in.' },
    run: ({ dev, session, net }) => {
      const i = dev.iface(session.iface!)!
      i.shutdown = true
      net.rev++
      return info(`%LINK-5-CHANGED: Interface ${i.name}, changed state to administratively down`)
    },
  },
  {
    modes: ['config-if'],
    words: ['no', 'shutdown'],
    help: 'Bring the interface up',
    means: { gu: 'પોર્ટ ચાલુ કરો. Cisco પર બધા પોર્ટ બંધ જ હોય છે.', en: 'Switch the port on. Every port on a Cisco device starts off.' },
    run: ({ dev, session, net }) => {
      const i = dev.iface(session.iface!)!
      i.shutdown = false
      net.rev++
      const lines = [`%LINK-5-CHANGED: Interface ${i.name}, changed state to up`]
      if (net.linkUp(dev.id, i.name)) {
        lines.push(
          `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${i.name}, changed state to up`,
        )
      }
      return lines.map((text) => ({ text, kind: 'info' as const }))
    },
  },
  {
    modes: ['config-if'],
    words: ['description'],
    args: [{ name: 'LINE', type: 'rest' }],
    help: 'Interface specific description',
    means: { gu: 'આ પોર્ટ શેના માટે છે એની નોંધ.', en: 'A note to yourself about what this port is for.' },
    run: ({ dev, session }, [text]) => {
      dev.iface(session.iface!)!.description = text
    },
  },
  {
    modes: ['config'],
    words: ['ip', 'route'],
    args: [
      { name: 'A.B.C.D', type: 'ip' },
      { name: 'MASK', type: 'mask' },
      { name: 'NEXT-HOP', type: 'word' },
      { name: 'DISTANCE', type: 'number', optional: true },
    ],
    help: 'Establish static routes',
    means: { gu: 'હાથે એક રસ્તો લખો: આ નેટવર્ક જોઈએ તો આને આપી દેજે.', en: 'Write a path by hand: for this network, hand the packet to that neighbour.' },
    run: ({ dev, net }, [prefix, mask, via, ad]) => {
      const isIface = !isIp(via)
      if (isIface && !dev.iface(via)) return err(INVALID)
      dev.staticRoutes = dev.staticRoutes.filter(
        (r) => !(r.prefix === prefix && r.mask === mask && (r.nextHop === via || r.exitIface === via)),
      )
      dev.staticRoutes.push({
        prefix,
        mask,
        nextHop: isIface ? undefined : via,
        exitIface: isIface ? dev.iface(via)!.name : undefined,
        ad: ad ? Number(ad) : 1,
      })
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['no', 'ip', 'route'],
    args: [
      { name: 'A.B.C.D', type: 'ip' },
      { name: 'MASK', type: 'mask' },
      { name: 'NEXT-HOP', type: 'word', optional: true },
    ],
    help: 'Remove a static route',
    means: { gu: 'લખેલો રસ્તો કાઢી નાખો.', en: 'Remove a path you wrote earlier.' },
    run: ({ dev, net }, [prefix, mask, via]) => {
      dev.staticRoutes = dev.staticRoutes.filter(
        (r) => !(r.prefix === prefix && r.mask === mask && (!via || r.nextHop === via || r.exitIface === via)),
      )
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['ip', 'default-gateway'],
    args: [{ name: 'A.B.C.D', type: 'ip' }],
    help: 'Set the default gateway (hosts and L2 switches)',
    means: { gu: 'Switch માટે બહાર જવાનો દરવાજો.', en: 'Tell a switch which way is out.' },
    run: ({ dev, net }, [gw]) => {
      dev.defaultGateway = gw
      net.rev++
    },
  },

  /* -- layer 2: VLANs and switchports -- */
  {
    modes: ['config'],
    words: ['vlan'],
    args: [{ name: 'VLAN-ID', type: 'number' }],
    help: 'Create a VLAN and enter VLAN configuration',
    means: { gu: 'એક નવું જૂથ બનાવો — switch ની અંદર એક અદૃશ્ય દીવાલ.', en: 'Create a group — an invisible wall inside the switch.' },
    run: ({ dev, session, net }, [id]) => {
      if (dev.kind !== 'switch') return err(INVALID)
      const v = Number(id)
      if (v < 1 || v > 4094) return err(INVALID)
      if (!dev.vlans.has(v)) dev.vlans.set(v, `VLAN${String(v).padStart(4, '0')}`)
      session.mode = 'config-vlan'
      session.vlan = v
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['no', 'vlan'],
    args: [{ name: 'VLAN-ID', type: 'number' }],
    help: 'Delete a VLAN',
    means: { gu: 'જૂથ મિટાવો.', en: 'Delete the group.' },
    run: ({ dev, net }, [id]) => {
      dev.vlans.delete(Number(id))
      net.rev++
    },
  },
  {
    modes: ['config-vlan'],
    words: ['name'],
    args: [{ name: 'WORD', type: 'word' }],
    help: 'Name the VLAN',
    means: { gu: 'જૂથને ઓળખવામાં સરળ પડે એવું નામ.', en: 'Give the group a name you will recognise.' },
    run: ({ dev, session, net }, [nm]) => {
      if (session.vlan !== undefined) dev.vlans.set(session.vlan, nm)
      net.rev++
    },
  },
  {
    modes: ['config-if'],
    words: ['switchport', 'mode', 'access'],
    help: 'Set the port as an access port',
    means: { gu: 'આ પોર્ટ એક જ જૂથનો રહેશે, ઘણા નહીં.', en: 'This port will carry one group only, not many.' },
    run: ({ dev, session, net }) => {
      const sp = portOf(dev, session.iface)
      if (!sp) return err(INVALID)
      sp.mode = 'access'
      net.rev++
    },
  },
  {
    modes: ['config-if'],
    words: ['switchport', 'mode', 'trunk'],
    help: 'Set the port as a trunk',
    means: { gu: 'આ પોર્ટ એક જ વાયર પર બધાં જૂથ લઈ જશે.', en: 'This port will carry every group down one cable.' },
    run: ({ dev, session, net }) => {
      const sp = portOf(dev, session.iface)
      if (!sp) return err(INVALID)
      sp.mode = 'trunk'
      net.rev++
    },
  },
  {
    modes: ['config-if'],
    words: ['switchport', 'access', 'vlan'],
    args: [{ name: 'VLAN-ID', type: 'number' }],
    help: 'Put this access port into a VLAN',
    means: { gu: 'આ પોર્ટ કયા જૂથનો છે એ નક્કી કરો.', en: 'Say which group this port belongs to.' },
    run: ({ dev, session, net }, [id]) => {
      const sp = portOf(dev, session.iface)
      if (!sp) return err(INVALID)
      const v = Number(id)
      sp.accessVlan = v
      if (!dev.vlans.has(v)) dev.vlans.set(v, `VLAN${String(v).padStart(4, '0')}`)
      net.rev++
      return info(`% Access VLAN set to ${v} on ${session.iface}`)
    },
  },
  {
    modes: ['config-if'],
    words: ['switchport', 'trunk', 'allowed', 'vlan'],
    args: [{ name: 'LIST', type: 'word' }],
    help: 'VLANs allowed to cross this trunk',
    means: { gu: 'Trunk પર કયાં જૂથ જવા દેવાં એ મર્યાદિત કરો.', en: 'Limit which groups may cross this trunk.' },
    run: ({ dev, session, net }, [list]) => {
      const sp = portOf(dev, session.iface)
      if (!sp) return err(INVALID)
      if (list.toLowerCase() === 'all') sp.allowedVlans = undefined
      else {
        const parsed = parseVlanList(list)
        if (!parsed) return err(INVALID)
        sp.allowedVlans = parsed
      }
      net.rev++
    },
  },
  {
    modes: ['config-if'],
    words: ['switchport', 'trunk', 'native', 'vlan'],
    args: [{ name: 'VLAN-ID', type: 'number' }],
    help: 'Native (untagged) VLAN on this trunk',
    means: { gu: 'Trunk પર જે જૂથને tag લાગતો નથી એ. બંને છેડે સરખો જ હોવો જોઈએ.', en: 'The one group that crosses a trunk untagged. It must match at both ends.' },
    run: ({ dev, session, net }, [id]) => {
      const sp = portOf(dev, session.iface)
      if (!sp) return err(INVALID)
      sp.nativeVlan = Number(id)
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['ip', 'routing'],
    help: 'Enable routing between SVIs (layer-3 switch)',
    means: { gu: 'Switch ને routing કરતો કરો — એ વગર SVI બને પણ કામ ન કરે.', en: 'Let the switch route between groups. Without it the SVIs exist but nothing moves.' },
    run: ({ dev, net }) => {
      dev.ipRouting = true
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['no', 'ip', 'routing'],
    help: 'Disable routing between SVIs',
    means: { gu: 'Switch નું routing બંધ કરો.', en: 'Stop the switch routing.' },
    run: ({ dev, net }) => {
      dev.ipRouting = false
      net.rev++
    },
  },

  /* -- dynamic routing protocols -- */
  {
    modes: ['config'],
    words: ['router', 'ospf'],
    args: [{ name: 'PROCESS-ID', type: 'number' }],
    help: 'Open Shortest Path First',
    means: { gu: 'OSPF ચાલુ કરો — routers આપોઆપ નકશો વહેંચશે.', en: 'Start OSPF so the routers share their maps with each other.' },
    run: ({ dev, session, net }, [pid]) => {
      dev.ospf = dev.ospf ?? {
        pid: Number(pid),
        networks: [],
        passive: [],
        referenceBandwidth: 100_000,
      }
      dev.ospf.pid = Number(pid)
      session.mode = 'config-router'
      session.router = 'ospf'
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['router', 'eigrp'],
    args: [{ name: 'AS-NUMBER', type: 'number' }],
    help: 'Enhanced Interior Gateway Routing Protocol',
    means: { gu: 'EIGRP ચાલુ કરો. AS નંબર બધે સરખો હોવો જોઈએ.', en: 'Start EIGRP. The AS number must match on every router.' },
    run: ({ dev, session, net }, [asn]) => {
      dev.eigrp = dev.eigrp ?? { asn: Number(asn), networks: [], passive: [], autoSummary: false }
      dev.eigrp.asn = Number(asn)
      session.mode = 'config-router'
      session.router = 'eigrp'
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['router', 'rip'],
    help: 'Routing Information Protocol',
    means: { gu: 'RIP ચાલુ કરો — સૌથી જૂનું અને સરળ, hop ગણે છે.', en: 'Start RIP, the oldest and simplest: it just counts hops.' },
    run: ({ dev, session, net }) => {
      dev.rip = dev.rip ?? { version: 1, networks: [], passive: [], autoSummary: true }
      session.mode = 'config-router'
      session.router = 'rip'
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['no', 'router', 'ospf'],
    args: [{ name: 'PROCESS-ID', type: 'number' }],
    help: 'Remove the OSPF process',
    means: { gu: 'OSPF બંધ કરો.', en: 'Turn OSPF off.' },
    run: ({ dev, net }) => {
      dev.ospf = undefined
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['no', 'router', 'eigrp'],
    args: [{ name: 'AS-NUMBER', type: 'number' }],
    help: 'Remove the EIGRP process',
    means: { gu: 'EIGRP બંધ કરો.', en: 'Turn EIGRP off.' },
    run: ({ dev, net }) => {
      dev.eigrp = undefined
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['no', 'router', 'rip'],
    help: 'Remove the RIP process',
    means: { gu: 'RIP બંધ કરો.', en: 'Turn RIP off.' },
    run: ({ dev, net }) => {
      dev.rip = undefined
      net.rev++
    },
  },
  {
    modes: ['config-router'],
    words: ['network'],
    args: [
      { name: 'A.B.C.D', type: 'ip' },
      { name: 'REST', type: 'rest' },
    ],
    help: 'Networks this process runs on',
    means: { gu: 'આ નેટવર્ક બીજાઓને જણાવો — અને અહીંથી પાડોશી શોધો.', en: 'Advertise this network to the others, and look for neighbours on it.' },
    run: ({ dev, session, net }, [ip, rest]) => {
      const parts = (rest ?? '').trim().split(/\s+/).filter(Boolean)
      if (session.router === 'ospf') {
        if (parts.length < 3 || parts[1].toLowerCase() !== 'area') return err(INCOMPLETE)
        if (!isIp(parts[0])) return err(INVALID)
        if (!/^\d+$/.test(parts[2])) return err(INVALID)
        dev.ospf!.networks.push({ ip, wildcard: parts[0], area: Number(parts[2]) })
      } else if (session.router === 'eigrp') {
        if (parts.length && !isIp(parts[0])) return err(INVALID)
        dev.eigrp!.networks.push({ ip, wildcard: parts[0] })
      } else if (session.router === 'bgp') {
        if (parts.length >= 2 && parts[0].toLowerCase() === 'mask') {
          if (!isValidMask(parts[1])) return err(INVALID)
          dev.bgp!.networks.push({ ip, mask: parts[1] })
        } else if (!parts.length) {
          dev.bgp!.networks.push({ ip, mask: '255.255.255.0' })
        } else {
          return err(INVALID)
        }
      } else {
        if (parts.length) return err(INVALID)
        dev.rip!.networks.push(ip)
      }
      net.rev++
    },
  },
  {
    modes: ['config-router'],
    words: ['router-id'],
    args: [{ name: 'A.B.C.D', type: 'ip' }],
    help: 'Set the router ID',
    means: { gu: 'આ router ની ઓળખ નક્કી કરો.', en: 'Fix this router\'s identity instead of letting it pick one.' },
    run: ({ dev, session, net }, [id]) => {
      if (session.router !== 'ospf') return err(INVALID)
      dev.ospf!.routerId = id
      net.rev++
    },
  },
  {
    modes: ['config-router'],
    words: ['version'],
    args: [{ name: 'VERSION', type: 'number' }],
    help: 'RIP version',
    means: { gu: 'RIP નું નવું સંસ્કરણ વાપરો — જેથી subnet માહિતી પણ જાય.', en: 'Use the newer RIP, which carries subnet masks too.' },
    run: ({ dev, session, net }, [v]) => {
      if (session.router !== 'rip') return err(INVALID)
      dev.rip!.version = Number(v)
      net.rev++
    },
  },
  {
    modes: ['config-router'],
    words: ['no', 'auto-summary'],
    help: 'Stop summarising at classful boundaries',
    means: { gu: 'નેટવર્ક જાતે ભેગાં કરવાનું બંધ કરો — લગભગ હંમેશા જોઈએ.', en: 'Stop it lumping subnets together. Almost always what you want.' },
    run: ({ dev, session, net }) => {
      if (session.router === 'rip') dev.rip!.autoSummary = false
      else if (session.router === 'eigrp') dev.eigrp!.autoSummary = false
      net.rev++
    },
  },
  {
    modes: ['config-router'],
    words: ['passive-interface'],
    args: [{ name: 'IFACE', type: 'word' }],
    help: 'Send no updates out of this interface',
    means: { gu: 'આ પોર્ટ પર પાડોશી શોધવાનું બંધ — પણ નેટવર્ક જાહેર થતું રહે.', en: 'Stop looking for neighbours on this port but keep advertising it. Use it on ports facing PCs.' },
    run: ({ dev, session, net }, [name]) => {
      const i = dev.iface(name)
      if (!i) return err(INVALID)
      const cfg = session.router === 'ospf' ? dev.ospf : session.router === 'eigrp' ? dev.eigrp : dev.rip
      cfg?.passive.push(i.name)
      net.rev++
    },
  },
  {
    modes: ['config-router'],
    words: ['auto-cost', 'reference-bandwidth'],
    args: [{ name: 'MBPS', type: 'number' }],
    help: 'OSPF reference bandwidth in Mbps',
    means: { gu: 'Cost કઈ ઝડપે ગણવી એ બદલો — આધુનિક લિંક માટે જરૂરી.', en: 'Change the speed OSPF measures cost against. Needed once links are faster than 100 Mbps.' },
    run: ({ dev, session, net }, [mbps]) => {
      if (session.router !== 'ospf') return err(INVALID)
      dev.ospf!.referenceBandwidth = Number(mbps) * 1000
      net.rev++
    },
  },

  /* -- access lists -- */
  {
    modes: ['config'],
    words: ['access-list'],
    args: [
      { name: 'NUMBER', type: 'number' },
      { name: 'REST', type: 'rest' },
    ],
    help: 'Add an entry to a numbered access list',
    means: { gu: 'એક નિયમ લખો — કોને જવા દેવું અને કોને રોકવું.', en: 'Write one rule about who may pass and who may not.' },
    run: ({ dev, net }, [num, rest]) => {
      const id = String(Number(num))
      const n = Number(num)
      const extended = n >= 100
      const parts = (rest ?? '').trim().split(/\s+/).filter(Boolean)
      const action = parts.shift()?.toLowerCase()
      if (action !== 'permit' && action !== 'deny') return err(INVALID)

      let protocol: AclProtocol = 'ip'
      if (extended) {
        const proto = parts.shift()?.toLowerCase()
        if (!proto || !['ip', 'icmp', 'tcp', 'udp'].includes(proto)) return err(INVALID)
        protocol = proto as AclProtocol
      }

      const src = parseAclTarget(parts)
      if (!src) return err(INCOMPLETE)
      let dst
      if (extended) {
        dst = parseAclTarget(src.rest)
        if (!dst) return err(INCOMPLETE)
      }

      const acl = dev.acls.get(id) ?? { id, extended, entries: [] }
      acl.entries.push({
        seq: (acl.entries.at(-1)?.seq ?? 0) + 10,
        action,
        protocol,
        src: src.ip,
        srcWildcard: src.wildcard,
        dst: dst?.ip,
        dstWildcard: dst?.wildcard,
      })
      dev.acls.set(id, acl)
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['no', 'access-list'],
    args: [{ name: 'NUMBER', type: 'number' }],
    help: 'Delete an access list',
    means: { gu: 'નિયમોની આખી યાદી મિટાવો.', en: 'Delete the whole list of rules.' },
    run: ({ dev, net }, [num]) => {
      dev.acls.delete(String(Number(num)))
      net.rev++
    },
  },
  {
    modes: ['config-if'],
    words: ['ip', 'access-group'],
    args: [
      { name: 'NUMBER', type: 'number' },
      { name: 'DIRECTION', type: 'word' },
    ],
    help: 'Apply an access list to this interface',
    means: { gu: 'નિયમો આ પોર્ટ પર લગાવો. લખવાથી કશું ન થાય — લગાવવો પડે.', en: 'Apply the rules to this port. Writing them alone does nothing.' },
    run: ({ dev, session, net }, [num, dir]) => {
      const i = dev.iface(session.iface!)!
      const d = dir.toLowerCase()
      if (d !== 'in' && d !== 'out') return err(INVALID)
      if (d === 'in') i.aclIn = String(Number(num))
      else i.aclOut = String(Number(num))
      net.rev++
    },
  },

  /* -- network address translation -- */
  {
    modes: ['config-if'],
    words: ['ip', 'nat', 'inside'],
    help: 'Mark this interface as the inside of a NAT boundary',
    means: { gu: 'આ બાજુ ઘરની અંદર ગણાશે.', en: 'Mark this side as inside your network.' },
    run: ({ dev, session, net }) => {
      dev.nat = dev.nat ?? { inside: [], outside: [], overload: false, statics: [] }
      const name = dev.iface(session.iface!)!.name
      if (!dev.nat.inside.includes(name)) dev.nat.inside.push(name)
      net.rev++
    },
  },
  {
    modes: ['config-if'],
    words: ['ip', 'nat', 'outside'],
    help: 'Mark this interface as the outside of a NAT boundary',
    means: { gu: 'આ બાજુ બહારની દુનિયા ગણાશે.', en: 'Mark this side as the outside world.' },
    run: ({ dev, session, net }) => {
      dev.nat = dev.nat ?? { inside: [], outside: [], overload: false, statics: [] }
      const name = dev.iface(session.iface!)!.name
      if (!dev.nat.outside.includes(name)) dev.nat.outside.push(name)
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['ip', 'nat', 'pool'],
    args: [{ name: 'NAME', type: 'word' }, { name: 'REST', type: 'rest' }],
    help: 'Define a pool of public addresses',
    means: { gu: 'બહાર જતાં વાપરવા માટેનાં જાહેર સરનામાંનો જથ્થો.', en: 'A pool of public addresses to hand out on the way out.' },
    run: ({ dev, net }, [name, rest]) => {
      const parts = (rest ?? '').trim().split(/\s+/).filter(Boolean)
      if (parts.length < 4 || parts[2].toLowerCase() !== 'netmask') return err(INCOMPLETE)
      if (!isIp(parts[0]) || !isIp(parts[1]) || !isValidMask(parts[3])) return err(INVALID)
      dev.nat = dev.nat ?? { inside: [], outside: [], overload: false, statics: [] }
      dev.nat.pool = { name, start: parts[0], end: parts[1], mask: parts[3] }
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['ip', 'nat', 'inside', 'source'],
    args: [{ name: 'REST', type: 'rest' }],
    help: 'Translate inside addresses on the way out',
    means: { gu: 'અંદરનાં સરનામાં બહારનામાં બદલો. overload લખો એટલે એક જ સરનામા પાછળ બધાં.', en: 'Swap inside addresses for an outside one. Add overload and everyone shares a single address.' },
    run: ({ dev, net }, [rest]) => {
      const parts = (rest ?? '').trim().split(/\s+/).filter(Boolean)
      dev.nat = dev.nat ?? { inside: [], outside: [], overload: false, statics: [] }

      if (parts[0]?.toLowerCase() === 'static') {
        if (!isIp(parts[1]) || !isIp(parts[2])) return err(INVALID)
        dev.nat.statics.push({ inside: parts[1], outside: parts[2] })
        net.rev++
        return
      }
      if (parts[0]?.toLowerCase() !== 'list' || !parts[1]) return err(INCOMPLETE)
      dev.nat.aclId = String(Number(parts[1]))
      const via = parts[2]?.toLowerCase()
      if (via === 'interface') {
        if (!parts[3] || !dev.iface(parts[3])) return err(INVALID)
        dev.nat.pool = undefined
      } else if (via === 'pool') {
        if (!parts[3]) return err(INCOMPLETE)
      } else {
        return err(INCOMPLETE)
      }
      dev.nat.overload = parts.some((x) => x.toLowerCase() === 'overload')
      net.rev++
    },
  },

  /* -- first hop redundancy -- */
  {
    modes: ['config-if'],
    words: ['standby'],
    args: [{ name: 'GROUP', type: 'number' }, { name: 'REST', type: 'rest' }],
    help: 'HSRP group settings',
    means: { gu: 'બે routers એક નકલી gateway વહેંચે — એક પડે તો બીજો સંભાળી લે.', en: 'Two routers share one pretend gateway, so if one dies the other takes over.' },
    run: ({ dev, session, net }, [group, rest]) => {
      const i = dev.iface(session.iface!)!
      const parts = (rest ?? '').trim().split(/\s+/).filter(Boolean)
      const kw = parts[0]?.toLowerCase()
      i.hsrp = i.hsrp ?? { group: Number(group), virtualIp: '', priority: 100, preempt: false }
      i.hsrp.group = Number(group)

      if (kw === 'ip') {
        if (!isIp(parts[1])) return err(INVALID)
        i.hsrp.virtualIp = parts[1]
      } else if (kw === 'priority') {
        if (!/^\d+$/.test(parts[1] ?? '')) return err(INVALID)
        i.hsrp.priority = Number(parts[1])
      } else if (kw === 'preempt') {
        i.hsrp.preempt = true
      } else {
        return err(INCOMPLETE)
      }
      net.rev++
    },
  },

  /* -- DHCP -- */
  {
    modes: ['config'],
    words: ['ip', 'dhcp', 'pool'],
    args: [{ name: 'NAME', type: 'word' }],
    help: 'Create a DHCP pool',
    means: { gu: 'સરનામાં વહેંચવા માટેનો જથ્થો બનાવો.', en: 'Start a pool of addresses to hand out automatically.' },
    run: ({ dev, session, net }, [name]) => {
      if (!dev.dhcpPools.some((x) => x.name === name)) {
        dev.dhcpPools.push({ name, network: '', mask: '', excluded: [] })
      }
      session.mode = 'config-dhcp'
      session.dhcpPool = name
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['ip', 'dhcp', 'excluded-address'],
    args: [{ name: 'A.B.C.D', type: 'ip' }, { name: 'REST', type: 'rest' }],
    help: 'Addresses the server must not hand out',
    means: { gu: 'આ સરનામાં કોઈને ન અપાય — router, printer, server માટે બાજુ પર.', en: 'Keep these addresses back for the router, printers and servers.' },
    run: ({ dev, net }, [start, rest]) => {
      const end = (rest ?? '').trim()
      const pool = dev.dhcpPools[0]
      const list: string[] = [start]
      if (end && isIp(end)) {
        let a = ipToIntLocal(start)
        const b = ipToIntLocal(end)
        while (a <= b) {
          list.push(intToIp(a))
          a++
        }
      }
      for (const pl of dev.dhcpPools.length ? dev.dhcpPools : pool ? [pool] : []) {
        pl.excluded.push(...list)
      }
      dev.pendingExcluded = [...(dev.pendingExcluded ?? []), ...list]
      net.rev++
    },
  },
  {
    modes: ['config-dhcp'],
    words: ['network'],
    args: [{ name: 'A.B.C.D', type: 'ip' }, { name: 'MASK', type: 'mask' }],
    help: 'Range this pool serves',
    means: { gu: 'જથ્થામાંથી કયા નેટવર્કનાં સરનામાં આપવાં.', en: 'Which network the pool hands addresses out from.' },
    run: ({ dev, session, net }, [ip, mask]) => {
      const pool = dev.dhcpPools.find((x) => x.name === session.dhcpPool)
      if (!pool) return err(INVALID)
      pool.network = ip
      pool.mask = mask
      pool.excluded.push(...(dev.pendingExcluded ?? []))
      net.rev++
    },
  },
  {
    modes: ['config-dhcp'],
    words: ['default-router'],
    args: [{ name: 'A.B.C.D', type: 'ip' }],
    help: 'Gateway handed to clients',
    means: { gu: 'જેને સરનામું મળે એને કયું gateway આપવું.', en: 'The way out that everyone receiving an address should use.' },
    run: ({ dev, session, net }, [ip]) => {
      const pool = dev.dhcpPools.find((x) => x.name === session.dhcpPool)
      if (!pool) return err(INVALID)
      pool.gateway = ip
      net.rev++
    },
  },
  {
    modes: ['config-dhcp'],
    words: ['dns-server'],
    args: [{ name: 'A.B.C.D', type: 'ip' }],
    help: 'DNS server handed to clients',
    means: { gu: 'નામને IP માં બદલનાર server કોણ છે.', en: 'Which server turns names into addresses.' },
    run: ({ dev, session, net }, [ip]) => {
      const pool = dev.dhcpPools.find((x) => x.name === session.dhcpPool)
      if (!pool) return err(INVALID)
      pool.dns = ip
      net.rev++
    },
  },
  {
    modes: ['config-if'],
    words: ['ip', 'address', 'dhcp'],
    help: 'Get an address from a DHCP server',
    means: { gu: 'આ પોર્ટ પોતાનું સરનામું માગી લે — હાથે લખવાને બદલે.', en: 'Let this port ask for its own address instead of being told.' },
    run: ({ dev, session, net }) => {
      const i = dev.iface(session.iface!)!
      const lease = dhcpRequest(net, dev, i.name)
      if (!lease) return err('% DHCP: no server answered (request timed out)')
      i.ip = lease.ip
      i.mask = lease.mask
      if (lease.gateway) dev.defaultGateway = lease.gateway
      net.rev++
      return info(
        `% Interface ${i.name} assigned DHCP address ${lease.ip}, mask ${lease.mask}, from ${lease.server}`,
      )
    },
  },

  /* -- BGP -- */
  {
    modes: ['config'],
    words: ['router', 'bgp'],
    args: [{ name: 'AS-NUMBER', type: 'number' }],
    help: 'Border Gateway Protocol',
    means: { gu: 'BGP ચાલુ કરો — આખું internet આના પર ચાલે છે.', en: 'Start BGP, the protocol the whole internet runs on.' },
    run: ({ dev, session, net }, [asn]) => {
      dev.bgp = dev.bgp ?? { asn: Number(asn), neighbors: [], networks: [] }
      dev.bgp.asn = Number(asn)
      session.mode = 'config-router'
      session.router = 'bgp'
      net.rev++
    },
  },
  {
    modes: ['config'],
    words: ['no', 'router', 'bgp'],
    args: [{ name: 'AS-NUMBER', type: 'number' }],
    help: 'Remove the BGP process',
    means: { gu: 'BGP બંધ કરો.', en: 'Turn BGP off.' },
    run: ({ dev, net }) => {
      dev.bgp = undefined
      net.rev++
    },
  },
  {
    modes: ['config-router'],
    words: ['neighbor'],
    args: [
      { name: 'A.B.C.D', type: 'ip' },
      { name: 'REST', type: 'rest' },
    ],
    help: 'Define a BGP peer',
    means: { gu: 'બીજા છેડાનો router કોણ છે એ કહો — બંનેએ એકબીજાનું નામ લખવું પડે.', en: 'Name the router at the far end. Both sides must name each other.' },
    run: ({ dev, session, net }, [ip, rest]) => {
      if (session.router !== 'bgp' || !dev.bgp) return err(INVALID)
      const parts = (rest ?? '').trim().split(/\s+/).filter(Boolean)
      const kw = parts[0]?.toLowerCase()
      let nb = dev.bgp.neighbors.find((x) => x.ip === ip)

      if (kw === 'remote-as') {
        if (!/^\d+$/.test(parts[1] ?? '')) return err(INVALID)
        if (!nb) {
          nb = { ip, remoteAs: Number(parts[1]) }
          dev.bgp.neighbors.push(nb)
        } else {
          nb.remoteAs = Number(parts[1])
        }
      } else if (kw === 'weight' || kw === 'local-preference') {
        if (!nb) return err('% Specify remote-as for the neighbor first')
        nb.localPref = Number(parts[1])
      } else if (kw === 'route-reflector-client') {
        if (!nb) return err('% Specify remote-as for the neighbor first')
        nb.routeReflectorClient = true
      } else {
        return err(INCOMPLETE)
      }
      net.rev++
    },
  },
  {
    modes: ['config-router'],
    words: ['bgp', 'router-id'],
    args: [{ name: 'A.B.C.D', type: 'ip' }],
    help: 'Set the BGP router ID',
    means: { gu: 'BGP માટે આ router ની ઓળખ નક્કી કરો.', en: 'Fix this router\'s identity for BGP.' },
    run: ({ dev, session, net }, [id]) => {
      if (session.router !== 'bgp' || !dev.bgp) return err(INVALID)
      dev.bgp.routerId = id
      net.rev++
    },
  },

  /* -- show commands -- */
  {
    modes: ['priv', 'user'],
    words: ['show', 'ip', 'interface', 'brief'],
    help: 'Interface status and configuration summary',
    means: { gu: 'બધા પોર્ટ એક યાદીમાં — સરનામું અને ચાલુ/બંધ. સામાન્ય રીતે પહેલું ચેક.', en: 'Every port in one list with its address and whether it is up. Usually the first thing to check.' },
    run: ({ dev, net }) => {
      const rows = [
        `${pad('Interface', 24)}${pad('IP-Address', 17)}${pad('OK?', 5)}${pad('Method', 8)}${pad('Status', 23)}Protocol`,
      ]
      for (const i of dev.ifaces) {
        const st = ifaceStatus(net, dev, i.name)
        rows.push(
          pad(i.name, 24) +
            pad(i.ip ?? 'unassigned', 17) +
            pad(i.ip ? 'YES' : 'YES', 5) +
            pad(i.ip ? 'manual' : 'unset', 8) +
            pad(st.status, 23) +
            st.proto,
        )
      }
      return out(...rows)
    },
  },
  {
    modes: ['priv', 'user'],
    words: ['show', 'ip', 'route'],
    help: 'IP routing table',
    means: { gu: 'Router કયા કયા રસ્તા જાણે છે એ બતાવે.', en: 'Every path this router knows. If a network is missing here, it cannot be reached.' },
    run: ({ dev }) => {
      const table = dev.installedRoutes()
      const header = [
        'Codes: C - connected, L - local, S - static, S* - default',
        '',
      ]
      if (!table.length) return out(...header, '     (routing table is empty)')

      const body = table.map((r) => {
        const via = r.nextHop
          ? `via ${r.nextHop}`
          : r.iface
            ? `is directly connected, ${r.iface}`
            : ''
        const dist = r.source === 'C' || r.source === 'L' ? '' : `[${r.ad}/${r.metric}] `
        return `${pad(r.source, 5)}${pad(cidr(r.prefix, r.mask), 21)}${dist}${via}`.replace(/\s+$/, '')
      })
      const gw = dev.defaultGateway || table.some((r) => r.source === 'S*')
      return out(
        ...header,
        ...body,
        '',
        gw ? 'Gateway of last resort is set' : 'Gateway of last resort is not set',
      )
    },
  },
  {
    modes: ['priv', 'user'],
    words: ['show', 'arp'],
    help: 'ARP table',
    means: { gu: 'કયા IP નું કયું MAC એ યાદ રાખેલું છે.', en: 'Which MAC address goes with which IP, as recently learnt.' },
    run: ({ dev }) => {
      if (!dev.arp.size) return out('Protocol  Address          Age   Hardware Addr   Type   Interface', '          (empty)')
      const rows = ['Protocol  Address          Age   Hardware Addr   Type   Interface']
      for (const [ip, mac] of dev.arp) {
        rows.push(`Internet  ${pad(ip, 17)}0     ${pad(mac, 16)}ARPA`)
      }
      return out(...rows)
    },
  },
  {
    modes: ['priv'],
    words: ['show', 'running-config'],
    help: 'Current operating configuration',
    means: { gu: 'અત્યારની આખી ગોઠવણ એક સાથે.', en: 'The entire current configuration in one go.' },
    run: ({ dev }) => {
      const l: string[] = ['!', `hostname ${dev.name}`, '!']
      for (const i of dev.ifaces) {
        l.push(`interface ${i.name}`)
        if (i.description) l.push(` description ${i.description}`)
        if (i.ip && i.mask) l.push(` ip address ${i.ip} ${i.mask}`)
        else l.push(' no ip address')
        l.push(i.shutdown ? ' shutdown' : ' no shutdown')
        l.push('!')
      }
      for (const r of dev.staticRoutes) {
        l.push(
          `ip route ${r.prefix} ${r.mask} ${r.nextHop ?? r.exitIface}${r.ad !== 1 ? ` ${r.ad}` : ''}`,
        )
      }
      if (dev.defaultGateway) l.push(`ip default-gateway ${dev.defaultGateway}`)
      l.push('!', 'end')
      return out(...l)
    },
  },

  {
    modes: ['priv', 'user'],
    words: ['show', 'vlan', 'brief'],
    help: 'VLAN database',
    means: { gu: 'કયાં જૂથ છે અને કયો પોર્ટ કયા જૂથમાં છે.', en: 'Which groups exist and which port sits in each.' },
    run: ({ dev }) => {
      if (dev.kind !== 'switch') return err(INVALID)
      const rows = [`${pad('VLAN', 6)}${pad('Name', 22)}${pad('Status', 10)}Ports`]
      for (const [id, name] of [...dev.vlans.entries()].sort((a, b) => a[0] - b[0])) {
        const ports = dev
          .ports()
          .filter((p) => p.switchport?.mode === 'access' && p.switchport.accessVlan === id)
          .map((p) => p.name)
          .join(', ')
        rows.push(pad(String(id), 6) + pad(name, 22) + pad('active', 10) + ports)
      }
      return out(...rows)
    },
  },
  {
    modes: ['priv', 'user'],
    words: ['show', 'mac', 'address-table'],
    help: 'MAC address table',
    means: { gu: 'Switch કોણ કયા પોર્ટ પર બેઠું છે એ શીખ્યું એ.', en: 'What the switch has learnt about who sits on which port.' },
    run: ({ dev }) => {
      const rows = [`${pad('Vlan', 8)}${pad('Mac Address', 20)}${pad('Type', 10)}Ports`]
      if (!dev.macTable.size) return out(...rows, '        (no entries learned yet)')
      for (const e of dev.macTable.values()) {
        rows.push(pad(String(e.vlan), 8) + pad(e.mac, 20) + pad('DYNAMIC', 10) + e.iface)
      }
      return out(...rows)
    },
  },
  {
    modes: ['priv', 'user'],
    words: ['show', 'interfaces', 'trunk'],
    help: 'Trunk ports',
    means: { gu: 'કઈ લિંક trunk છે અને કેટલાં જૂથ લઈ જાય છે.', en: 'Which links are trunks and which groups cross them.' },
    run: ({ dev }) => {
      const trunks = dev.ports().filter((p) => p.switchport?.mode === 'trunk')
      if (!trunks.length) return out('(no trunk ports configured)')
      const rows = [`${pad('Port', 14)}${pad('Mode', 10)}${pad('Native vlan', 14)}Vlans allowed`]
      for (const p of trunks) {
        const sp = p.switchport!
        rows.push(
          pad(p.name, 14) +
            pad('on', 10) +
            pad(String(sp.nativeVlan), 14) +
            (sp.allowedVlans ? sp.allowedVlans.join(',') : '1-4094'),
        )
      }
      return out(...rows)
    },
  },

  {
    modes: ['priv', 'user'],
    words: ['show', 'ip', 'ospf', 'neighbor'],
    help: 'OSPF neighbours',
    means: { gu: 'OSPF માં કોની સાથે દોસ્તી થઈ છે એ. ખાલી હોય તો કશુંક મેળ નથી ખાતું.', en: 'Which OSPF neighbours this router has found. Empty means something does not match.' },
    run: ({ dev, net }) => {
      if (!dev.ospf) return out('% OSPF is not running on this device')
      const rows = [
        `${pad('Neighbor ID', 17)}${pad('Pri', 5)}${pad('State', 14)}${pad('Address', 17)}Interface`,
      ]
      const views = neighborViews(net, dev, 'ospf')
      if (!views.length) return out(...rows, '        (no neighbours yet)')
      for (const v of views) {
        rows.push(pad(v.id, 17) + pad('1', 5) + pad(v.state, 14) + pad(v.address, 17) + v.iface)
      }
      return out(...rows)
    },
  },
  {
    modes: ['priv', 'user'],
    words: ['show', 'ip', 'eigrp', 'neighbors'],
    help: 'EIGRP neighbours',
    means: { gu: 'EIGRP માં કોની સાથે દોસ્તી થઈ છે એ.', en: 'Which EIGRP neighbours this router has found.' },
    run: ({ dev, net }) => {
      if (!dev.eigrp) return out('% EIGRP is not running on this device')
      const rows = [`EIGRP-IPv4 Neighbors for AS(${dev.eigrp.asn})`, `${pad('H', 4)}${pad('Address', 17)}Interface`]
      const views = neighborViews(net, dev, 'eigrp')
      if (!views.length) return out(...rows, '    (no neighbours yet)')
      views.forEach((v, i) => rows.push(pad(String(i), 4) + pad(v.address, 17) + v.iface))
      return out(...rows)
    },
  },
  {
    modes: ['priv', 'user'],
    words: ['show', 'ip', 'protocols'],
    help: 'Routing protocol information',
    means: { gu: 'કયાં routing protocols ચાલે છે અને શું જણાવે છે.', en: 'Which routing protocols are running and what each advertises.' },
    run: ({ dev, net }) => {
      const rows: string[] = []
      if (dev.ospf) {
        rows.push(
          `Routing Protocol is "ospf ${dev.ospf.pid}"`,
          `  Router ID ${routerIdOf(dev)}`,
          '  Routing for Networks:',
          ...dev.ospf.networks.map((n) => `    ${n.ip} ${n.wildcard} area ${n.area}`),
          `  Neighbours: ${neighborViews(net, dev, 'ospf').length}`,
          '  Distance: 110',
          '',
        )
      }
      if (dev.eigrp) {
        rows.push(
          `Routing Protocol is "eigrp ${dev.eigrp.asn}"`,
          '  Routing for Networks:',
          ...dev.eigrp.networks.map((n) => `    ${n.ip}${n.wildcard ? ' ' + n.wildcard : ''}`),
          `  Neighbours: ${neighborViews(net, dev, 'eigrp').length}`,
          '  Distance: internal 90',
          '',
        )
      }
      if (dev.rip) {
        rows.push(
          'Routing Protocol is "rip"',
          `  Version ${dev.rip.version}`,
          '  Routing for Networks:',
          ...dev.rip.networks.map((n) => `    ${n}`),
          '  Distance: 120',
          '',
        )
      }
      if (!rows.length) return out('% No routing protocol is running')
      return out(...rows)
    },
  },

  {
    modes: ['priv', 'user'],
    words: ['show', 'access-lists'],
    help: 'Access list contents',
    means: { gu: 'લખેલા બધા નિયમો, ક્રમમાં — અને કેટલી વાર મેળ ખાયો.', en: 'Every rule you wrote, in order, with how often each has matched.' },
    run: ({ dev }) => {
      if (!dev.acls.size) return out('(no access lists configured)')
      const rows: string[] = []
      for (const acl of dev.acls.values()) {
        rows.push(`${acl.extended ? 'Extended' : 'Standard'} IP access list ${acl.id}`)
        for (const e of acl.entries) {
          const tgt = (ip: string, wc: string) =>
            ip === '0.0.0.0' && wc === '255.255.255.255'
              ? 'any'
              : wc === '0.0.0.0'
                ? `host ${ip}`
                : `${ip} ${wc}`
          rows.push(
            `    ${e.seq} ${e.action} ${acl.extended ? e.protocol + ' ' : ''}${tgt(e.src, e.srcWildcard)}` +
              (acl.extended && e.dst ? ` ${tgt(e.dst, e.dstWildcard ?? '255.255.255.255')}` : ''),
          )
        }
      }
      return out(...rows)
    },
  },
  {
    modes: ['priv', 'user'],
    words: ['show', 'ip', 'nat', 'translations'],
    help: 'NAT translation table',
    means: { gu: 'અંદરનું કયું સરનામું અત્યારે કયા બહારના સરનામા પાછળ છુપાયું છે.', en: 'Which inside address is currently hiding behind which outside one.' },
    run: ({ dev }) => {
      const rows = [`${pad('Pro', 6)}${pad('Inside global', 20)}Inside local`]
      if (!dev.natTable.size) return out(...rows, '      (no translations yet)')
      for (const b of dev.natTable.values()) {
        rows.push(pad(b.protocol, 6) + pad(b.insideGlobal, 20) + b.insideLocal)
      }
      return out(...rows)
    },
  },
  {
    modes: ['priv', 'user'],
    words: ['show', 'standby', 'brief'],
    help: 'HSRP status',
    means: { gu: 'કયો router અત્યારે કામ કરે છે અને કોણ તૈયાર ઊભો છે.', en: 'Which router is doing the work and which is standing by.' },
    run: ({ dev, net }) => {
      const rows = [`${pad('Interface', 12)}${pad('Grp', 5)}${pad('Pri', 5)}${pad('State', 10)}Virtual IP`]
      const any = dev.ifaces.filter((i) => i.hsrp)
      if (!any.length) return out('(HSRP is not configured)')
      for (const i of any) {
        const active = net.resolveOnSegment(dev.id, i.name, i.hsrp!.virtualIp)
        const state = active?.id === dev.id || net.get(dev.id)?.iface(i.name)?.ip === i.hsrp!.virtualIp
          ? 'Active'
          : hsrpSelfActive(net, dev, i.name)
            ? 'Active'
            : 'Standby'
        rows.push(
          pad(i.name, 12) +
            pad(String(i.hsrp!.group), 5) +
            pad(String(i.hsrp!.priority), 5) +
            pad(state, 10) +
            i.hsrp!.virtualIp,
        )
      }
      return out(...rows)
    },
  },
  {
    modes: ['priv', 'user'],
    words: ['show', 'ip', 'dhcp', 'binding'],
    help: 'DHCP leases handed out',
    means: { gu: 'કોને કયું સરનામું આપ્યું અને ક્યાં સુધી.', en: 'Who was given which address, and until when.' },
    run: ({ dev }) => {
      const rows = [`${pad('IP address', 18)}Client`]
      if (!dev.dhcpBindings.size) return out(...rows, '    (no leases yet)')
      for (const b of dev.dhcpBindings.values()) rows.push(pad(b.ip, 18) + b.client)
      return out(...rows)
    },
  },

  {
    modes: ['priv', 'user'],
    words: ['show', 'ip', 'bgp'],
    help: 'BGP table',
    means: { gu: 'BGP માંથી શીખેલા રસ્તા અને કોની મારફતે.', en: 'Paths learnt through BGP and who they came from.' },
    run: ({ dev, net }) => {
      if (!dev.bgp) return out('% BGP is not running on this device')
      const paths = computeBgp(net).get(dev.id) ?? []
      const rows = [
        `BGP table version 1, local router ID is ${bgpRouterId(dev)}`,
        `${pad('   Network', 21)}${pad('Next Hop', 17)}${pad('LocPrf', 8)}Path`,
      ]
      if (!paths.length) return out(...rows, '   (no prefixes)')
      for (const p of paths) {
        rows.push(
          pad(`*> ${p.prefix}/${maskToPrefix(p.mask)}`, 21) +
            pad(p.nextHop === '0.0.0.0' ? '0.0.0.0' : p.nextHop, 17) +
            pad(String(p.localPref), 8) +
            (p.asPath.length ? p.asPath.join(' ') + ' i' : 'i'),
        )
      }
      return out(...rows)
    },
  },
  {
    modes: ['priv', 'user'],
    words: ['show', 'ip', 'bgp', 'summary'],
    help: 'BGP neighbour summary',
    means: { gu: 'BGP ની કોની સાથે વાત ચાલે છે એની ટૂંક યાદી.', en: 'A short list of who BGP is talking to, and whether it is working.' },
    run: ({ dev, net }) => {
      if (!dev.bgp) return out('% BGP is not running on this device')
      const rows = [
        `BGP router identifier ${bgpRouterId(dev)}, local AS number ${dev.bgp.asn}`,
        `${pad('Neighbor', 17)}${pad('AS', 8)}${pad('State', 14)}Prefixes`,
      ]
      const live = bgpSessions(net, dev)
      for (const nb of dev.bgp.neighbors) {
        const up = live.some((x) => x.neighbor.ip === nb.ip)
        rows.push(
          pad(nb.ip, 17) + pad(String(nb.remoteAs), 8) + pad(up ? 'Established' : 'Idle', 14) + (up ? '1' : '0'),
        )
      }
      return out(...rows)
    },
  },

  /* -- exec tools -- */
  {
    modes: ['priv'],
    words: ['clear', 'arp-cache'],
    help: 'Empty the ARP cache',
    means: { gu: 'યાદ રાખેલા IP-MAC જોડાં ભૂલી જાઓ — ફરી શીખશે.', en: 'Forget the learnt IP-to-MAC pairs so they are learnt again.' },
    run: ({ dev }) => {
      dev.arp.clear()
      return info('% ARP cache cleared')
    },
  },
  {
    modes: ['priv'],
    words: ['clear', 'mac', 'address-table'],
    help: 'Empty the MAC address table',
    means: { gu: 'Switch જે શીખ્યું એ ભૂલી જાય — ફરી શીખશે.', en: 'Make the switch forget what it learnt so it learns again.' },
    run: ({ dev }) => {
      dev.macTable.clear()
      return info('% MAC address table cleared')
    },
  },
  {
    modes: ['priv', 'user'],
    words: ['ping'],
    args: [{ name: 'A.B.C.D', type: 'ip' }],
    help: 'Send echo messages',
    means: { gu: 'સામે પહોંચાય છે કે નહીં એ ચકાસો — સૌથી ઉપયોગી કમાન્ડ.', en: 'Check whether you can reach the far end. The most useful command there is.' },
    run: ({ dev, net }, [ip]) => {
      const r = net.ping(dev.id, ip)
      const head = out(
        `Type escape sequence to abort.`,
        `Sending 5, 100-byte ICMP Echos to ${ip}, timeout is 2 seconds:`,
      )
      if (r.ok) {
        return [
          ...head,
          { text: '!!!!!', kind: 'ok' },
          {
            text: `Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms`,
            kind: 'ok',
          },
        ]
      }
      const why: Record<string, string> = {
        'no-source-ip': '% No valid source address — configure an IP on an interface first.',
        'no-route': `% No route to ${ip} in the routing table.`,
        'arp-fail': '% Nothing answered on that segment (ARP failed).',
        'iface-down': '% Outgoing interface is administratively down.',
        'link-down': '% The link behind the outgoing interface is down.',
        'ttl-exceeded': '% TTL exceeded — the packet is going in circles.',
        unreachable: '% Destination unreachable.',
      }
      return [
        ...head,
        { text: '.....', kind: 'err' },
        { text: 'Success rate is 0 percent (0/5)', kind: 'err' },
        { text: why[r.failure ?? 'unreachable'], kind: 'err' },
      ]
    },
  },
  {
    modes: ['priv', 'user'],
    words: ['traceroute'],
    args: [{ name: 'A.B.C.D', type: 'ip' }],
    help: 'Trace the route to a destination',
    means: { gu: 'રસ્તામાં કોણ કોણ આવે છે અને ક્યાં અટકે છે.', en: 'Every hop along the way, and where it stops if it fails.' },
    run: ({ dev, net }, [ip]) => {
      const r = net.ping(dev.id, ip)
      const rows = [`Tracing the route to ${ip}`, '']
      r.hops.forEach((h, i) => {
        const addr = h.nextHopIp ?? ip
        rows.push(`  ${i + 1}  ${pad(addr, 17)}${h.deviceName}  1 msec  1 msec  2 msec`)
      })
      if (!r.ok) rows.push('  *  *  *   (unreachable)')
      return out(...rows)
    },
  },
]

/* ────────────────────────── parsing ────────────────────────── */

interface MatchResult {
  def?: CmdDef
  argTokens: string[]
  error?: CliLine[]
}

function candidatesFor(mode: CliMode) {
  return COMMANDS.filter((c) => c.modes.includes(mode))
}

/** IOS-style prefix match: "conf t" matches "configure terminal". */
function matchCommand(mode: CliMode, tokens: string[]): MatchResult {
  let pool = candidatesFor(mode)
  let i = 0

  while (i < tokens.length) {
    const tk = tokens[i].toLowerCase()
    const next = pool.filter((c) => c.words.length > i && c.words[i].startsWith(tk))

    if (next.length === 0) {
      // the keyword part is over — anything left belongs to the arguments
      const exact = pool.filter((c) => c.words.length === i)
      if (exact.length === 1) return { def: exact[0], argTokens: tokens.slice(i) }
      return { argTokens: [], error: caretError(tokens, i) }
    }

    const ambiguous = new Set(next.map((c) => c.words[i].toLowerCase()))
    if (ambiguous.size > 1 && next.every((c) => c.words[i].toLowerCase() !== tk)) {
      return {
        argTokens: [],
        error: err(`% Ambiguous command:  "${tokens.join(' ')}"`),
      }
    }

    pool = next
    i++

    const complete = pool.filter((c) => c.words.length === i)
    if (complete.length === 1 && pool.length === 1) {
      return { def: complete[0], argTokens: tokens.slice(i) }
    }
    if (complete.length === 1 && i === tokens.length) {
      return { def: complete[0], argTokens: [] }
    }
  }

  const done = pool.filter((c) => c.words.length === tokens.length)
  if (done.length === 1) return { def: done[0], argTokens: [] }
  if (pool.length) return { argTokens: [], error: err(INCOMPLETE) }
  return { argTokens: [], error: caretError(tokens, 0) }
}

function caretError(tokens: string[], index: number): CliLine[] {
  const before = tokens.slice(0, index).join(' ')
  const offset = before.length ? before.length + 1 : 0
  return [
    { text: `${' '.repeat(offset)}^`, kind: 'err' },
    { text: INVALID, kind: 'err' },
  ]
}

function validateArgs(def: CmdDef, tokens: string[]): { values: string[]; error?: CliLine[] } {
  const specs = def.args ?? []
  const values: string[] = []

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i]
    if (spec.type === 'rest') {
      values.push(tokens.slice(i).join(' '))
      return { values }
    }
    const tk = tokens[i]
    if (tk === undefined) {
      if (spec.optional) break
      return { values, error: err(INCOMPLETE) }
    }
    if (spec.type === 'ip' && !isIp(tk)) return { values, error: caretError(tokens, i) }
    if (spec.type === 'mask' && !isValidMask(tk)) return { values, error: caretError(tokens, i) }
    if (spec.type === 'number' && !/^\d+$/.test(tk)) return { values, error: caretError(tokens, i) }
    values.push(tk)
  }

  if (tokens.length > specs.length && specs.at(-1)?.type !== 'rest') {
    return { values, error: caretError(tokens, specs.length) }
  }
  return { values }
}

/* ────────────────────────── session ────────────────────────── */

export class CliSession {
  net: Network
  deviceId: string
  mode: CliMode = 'user'
  iface?: string
  vlan?: number
  router?: Proto | 'bgp'
  dhcpPool?: string
  history: string[] = []

  constructor(net: Network, deviceId: string) {
    this.net = net
    this.deviceId = deviceId
  }

  get dev(): Device {
    return this.net.get(this.deviceId)!
  }

  prompt(): string {
    const n = this.dev.name
    switch (this.mode) {
      case 'user':
        return `${n}>`
      case 'priv':
        return `${n}#`
      case 'config':
        return `${n}(config)#`
      case 'config-if':
        return `${n}(config-if)#`
      case 'config-vlan':
        return `${n}(config-vlan)#`
      case 'config-router':
        return `${n}(config-router)#`
      case 'config-dhcp':
        return `${n}(dhcp-config)#`
    }
  }

  /** List what can be typed right now (the `?` key). */
  help(partial = ''): CliLine[] {
    const p = partial.trim().toLowerCase()
    const seen = new Map<string, string>()
    for (const c of candidatesFor(this.mode)) {
      const w = c.words[0]
      if (p && !w.startsWith(p)) continue
      if (!seen.has(w)) seen.set(w, c.help)
    }
    if (!seen.size) return err('% Unrecognized command')
    return [...seen.entries()].map(([w, h]) => ({
      text: `  ${pad(w, 20)}${h}`,
      kind: 'out' as const,
    }))
  }

  /** Tab-completion: returns the completed line, or the original. */
  complete(line: string): string {
    const tokens = line.trim().split(/\s+/)
    if (!tokens.length) return line
    const last = tokens.at(-1)!.toLowerCase()
    const depth = tokens.length - 1
    const pool = candidatesFor(this.mode).filter((c) =>
      c.words.slice(0, depth).every((w, i) => w.startsWith(tokens[i].toLowerCase())),
    )
    const opts = new Set(
      pool.filter((c) => c.words.length > depth && c.words[depth].startsWith(last)).map((c) => c.words[depth]),
    )
    if (opts.size === 1) {
      tokens[depth] = [...opts][0]
      return tokens.join(' ') + ' '
    }
    return line
  }

  exec(raw: string): CliLine[] {
    const line = raw.trim()
    const result: CliLine[] = [{ text: `${this.prompt()} ${raw}`, kind: 'in' }]
    if (!line) return result
    this.history.push(line)

    if (line === '?') return [...result, ...this.help()]
    if (line.endsWith('?')) return [...result, ...this.help(line.slice(0, -1))]

    const tokens = line.split(/\s+/)

    // `do <exec command>` runs a privileged command without leaving config mode
    if (
      (this.mode === 'config' || this.mode === 'config-if') &&
      tokens[0].toLowerCase() === 'do' &&
      tokens.length > 1
    ) {
      const saved = this.mode
      this.mode = 'priv'
      const sub = this.exec(tokens.slice(1).join(' '))
      this.mode = saved
      return [...result, ...sub.slice(1)]
    }

    const m = matchCommand(this.mode, tokens)
    if (m.error) return [...result, ...m.error]
    if (!m.def) return [...result, ...err(INCOMPLETE)]

    const { values, error } = validateArgs(m.def, m.argTokens)
    if (error) return [...result, ...error]

    const produced = m.def.run({ net: this.net, dev: this.dev, session: this }, values)
    return [...result, ...(produced ?? [])]
  }
}

export { prefixToMask, maskToPrefix, intToIp }

/* ──────────────── explaining a command, outside a session ──────────────── */

/** Human-readable name of each mode, for a breadcrumb. */
export const MODE_NAME: Record<CliMode, CmdText> = {
  user: { gu: 'જોઈ શકો', en: 'look only' },
  priv: { gu: 'ચાલુ', en: 'unlocked' },
  config: { gu: 'ગોઠવણ', en: 'settings' },
  'config-if': { gu: 'પોર્ટ', en: 'a port' },
  'config-vlan': { gu: 'જૂથ', en: 'a group' },
  'config-router': { gu: 'protocol', en: 'a protocol' },
  'config-dhcp': { gu: 'DHCP જથ્થો', en: 'a DHCP pool' },
}

/** The mode a command line needs, and what it means — without running it. */
export function explainCommand(raw: string): { words: string[]; means?: CmdText; modes: CliMode[] } | undefined {
  const tokens = raw.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return undefined

  // try every mode, since a line is explained on its own, out of context
  for (const mode of [
    'config-if',
    'config-router',
    'config-dhcp',
    'config-vlan',
    'config',
    'priv',
    'user',
  ] as CliMode[]) {
    const m = matchCommand(mode, tokens)
    if (m.def) return { words: m.def.words, means: m.def.means, modes: m.def.modes }
  }
  return undefined
}

/** Every command, for a reference list. */
export function allCommands(): { words: string[]; help: string; means?: CmdText; modes: CliMode[] }[] {
  return COMMANDS.map((c) => ({ words: c.words, help: c.help, means: c.means, modes: c.modes }))
}
