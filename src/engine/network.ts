import { broadcastOf, fakeMac, intToIp, ipToInt, maskToPrefix, networkOf, prefixToMask } from './ip'
import { dynamicRoutesFor, type EigrpConfig, type OspfConfig, type RipConfig } from './routing'
import { bgpRoutesFor, type BgpConfig } from './bgp'
import {
  evaluateAcl,
  hsrpActive,
  translateSource,
  type Acl,
  type DhcpBinding,
  type DhcpPool,
  type HsrpConfig,
  type NatBinding,
  type NatConfig,
} from './services'

export type DeviceKind = 'pc' | 'router' | 'switch' | 'server'

export type PortMode = 'access' | 'trunk'

export interface SwitchPort {
  mode: PortMode
  accessVlan: number
  /** undefined means "all VLANs" */
  allowedVlans?: number[]
  nativeVlan: number
}

export interface Iface {
  name: string
  ip?: string
  mask?: string
  shutdown: boolean
  description?: string
  /** physical ports on a switch carry L2 configuration */
  switchport?: SwitchPort
  /** set on an SVI (`interface Vlan10`) */
  vlanId?: number
  /** first hop redundancy on this interface */
  hsrp?: HsrpConfig
  /** access lists applied to this interface */
  aclIn?: string
  aclOut?: string
  peer?: { device: string; iface: string }
}

export interface StaticRoute {
  prefix: string
  mask: string
  nextHop?: string
  exitIface?: string
  ad: number
}

export type RouteSource = 'C' | 'L' | 'S' | 'S*' | 'O' | 'D' | 'B' | 'R'

export interface RouteEntry {
  source: RouteSource
  prefix: string
  mask: string
  nextHop?: string
  iface?: string
  ad: number
  metric: number
}

export interface MacEntry {
  mac: string
  vlan: number
  iface: string
}

export interface DeviceInit {
  id: string
  name: string
  kind: DeviceKind
  ifaces: string[]
}

export function trunkAllows(sp: SwitchPort, vlan: number): boolean {
  return !sp.allowedVlans || sp.allowedVlans.includes(vlan)
}

export class Device {
  id: string
  name: string
  kind: DeviceKind
  ifaces: Iface[]
  staticRoutes: StaticRoute[] = []
  defaultGateway?: string
  /** VLAN database (switches): id -> name */
  vlans = new Map<number, string>()
  /** a layer-3 switch routes between its SVIs only once this is on */
  ipRouting = false
  /** dynamic routing protocol configuration */
  ospf?: OspfConfig
  eigrp?: EigrpConfig
  rip?: RipConfig
  bgp?: BgpConfig
  /** set by Network.addDevice so the device can see learned routes */
  net?: Network
  acls = new Map<string, Acl>()
  nat?: NatConfig
  natTable = new Map<string, NatBinding>()
  dhcpPools: DhcpPool[] = []
  /** addresses excluded before any pool existed */
  pendingExcluded: string[] = []
  dhcpBindings = new Map<string, DhcpBinding>()
  arp = new Map<string, string>()
  macTable = new Map<string, MacEntry>()

  constructor(init: DeviceInit) {
    this.id = init.id
    this.name = init.name
    this.kind = init.kind
    const startsDown = init.kind === 'router'
    this.ifaces = init.ifaces.map((n) => ({
      name: n,
      shutdown: startsDown,
      switchport:
        init.kind === 'switch'
          ? { mode: 'access' as PortMode, accessVlan: 1, nativeVlan: 1 }
          : undefined,
    }))
    if (init.kind === 'switch') this.vlans.set(1, 'default')
  }

  iface(name: string): Iface | undefined {
    const want = name.toLowerCase().replace(/\s+/g, '')
    return this.ifaces.find((i) => i.name.toLowerCase() === want)
  }

  /** Physical ports only — SVIs excluded. */
  ports(): Iface[] {
    return this.ifaces.filter((i) => i.vlanId === undefined)
  }

  svi(vlan: number): Iface | undefined {
    return this.ifaces.find((i) => i.vlanId === vlan)
  }

  mac(ifaceName: string) {
    return fakeMac(`${this.id}/${ifaceName}`)
  }

  activeIfaces(): Iface[] {
    return this.ifaces.filter((i) => !i.shutdown && i.ip && i.mask)
  }

  ownsIp(ip: string): boolean {
    return this.activeIfaces().some((i) => i.ip === ip)
  }

  /** Which VLAN a physical port puts an untagged frame into. */
  portVlan(ifaceName: string): number {
    const sp = this.iface(ifaceName)?.switchport
    if (!sp) return 1
    return sp.mode === 'access' ? sp.accessVlan : sp.nativeVlan
  }

  routingTable(): RouteEntry[] {
    const out: RouteEntry[] = []

    for (const i of this.activeIfaces()) {
      const net = networkOf(i.ip!, i.mask!)
      out.push({ source: 'C', prefix: net, mask: i.mask!, iface: i.name, ad: 0, metric: 0 })
      out.push({ source: 'L', prefix: i.ip!, mask: '255.255.255.255', iface: i.name, ad: 0, metric: 0 })
    }

    for (const r of this.staticRoutes) {
      out.push({
        source: r.prefix === '0.0.0.0' && r.mask === '0.0.0.0' ? 'S*' : 'S',
        prefix: r.prefix,
        mask: r.mask,
        nextHop: r.nextHop,
        iface: r.exitIface,
        ad: r.ad,
        metric: 0,
      })
    }

    for (const r of this.net?.dynamicFor(this) ?? []) out.push(r)

    if (this.defaultGateway) {
      out.push({
        source: 'S*',
        prefix: '0.0.0.0',
        mask: '0.0.0.0',
        nextHop: this.defaultGateway,
        ad: 1,
        metric: 0,
      })
    }

    return out.sort((a, b) => {
      const pa = maskToPrefix(a.mask)
      const pb = maskToPrefix(b.mask)
      if (pa !== pb) return pa - pb
      return ipToInt(a.prefix) - ipToInt(b.prefix)
    })
  }

  /**
   * What `show ip route` actually prints — the FIB, not the RIB.
   *
   * routingTable() lists every candidate the router has heard of. A real
   * router only *installs* the most trusted one per prefix, which is why a
   * floating static with AD 200 is invisible while the AD 1 primary is up,
   * and appears the instant that primary withdraws. Ties on AD stay (that is
   * equal-cost load balancing), so this only drops the ones that lost.
   */
  installedRoutes(): RouteEntry[] {
    const best = new Map<string, number>()
    const table = this.routingTable()
    for (const r of table) {
      const key = `${r.prefix}/${r.mask}`
      const cur = best.get(key)
      if (cur === undefined || r.ad < cur) best.set(key, r.ad)
    }
    return table.filter((r) => r.ad === best.get(`${r.prefix}/${r.mask}`))
  }

  lookup(destIp: string): RouteEntry | null {
    const d = ipToInt(destIp)
    const matches = this.routingTable().filter((r) => {
      const m = ipToInt(r.mask)
      return (d & m) >>> 0 === (ipToInt(r.prefix) & m) >>> 0
    })
    if (!matches.length) return null
    matches.sort((a, b) => {
      const p = maskToPrefix(b.mask) - maskToPrefix(a.mask)
      if (p !== 0) return p
      if (a.ad !== b.ad) return a.ad - b.ad
      return a.metric - b.metric
    })
    return matches[0]
  }
}

export interface Link {
  a: { device: string; iface: string }
  b: { device: string; iface: string }
  cut?: boolean
}

export interface Hop {
  device: string
  deviceName: string
  inIface?: string
  outIface?: string
  nextHopIp?: string
}

export type PingFailure =
  | 'no-source-ip'
  | 'no-route'
  | 'arp-fail'
  | 'iface-down'
  | 'link-down'
  | 'no-ip-routing'
  | 'acl-denied'
  | 'ttl-exceeded'
  | 'no-return-path'
  | 'unreachable'

export interface PingResult {
  ok: boolean
  hops: Hop[]
  failure?: PingFailure
  failedAt?: string
  destIp: string
  sourceIp?: string
  /** address the source was rewritten to by NAT, if any */
  translatedSource?: string
}

interface Endpoint {
  device: string
  iface: string
  /** VLAN the frame was in when it arrived here */
  vlan?: number
}

export class Network {
  devices = new Map<string, Device>()
  links: Link[] = []
  rev = 0

  /** dynamic routes are recomputed only when something actually changed */
  private dynRev = -1
  private dyn = new Map<string, RouteEntry[]>()
  private computing = false

  dynamicFor(dev: Device): RouteEntry[] {
    if (this.computing) return []
    if (this.dynRev !== this.rev) {
      this.computing = true
      try {
        this.dyn = new Map()
        for (const d of this.devices.values()) this.dyn.set(d.id, dynamicRoutesFor(this, d))
        for (const d of this.devices.values()) {
          if (d.bgp) this.dyn.set(d.id, [...(this.dyn.get(d.id) ?? []), ...bgpRoutesFor(this, d)])
        }
        this.dynRev = this.rev
      } finally {
        this.computing = false
      }
    }
    return this.dyn.get(dev.id) ?? []
  }

  addDevice(init: DeviceInit): Device {
    const d = new Device(init)
    d.net = this
    this.devices.set(d.id, d)
    this.rev++
    return d
  }

  get(id: string): Device | undefined {
    return this.devices.get(id)
  }

  byName(name: string): Device | undefined {
    const n = name.toLowerCase()
    return [...this.devices.values()].find((d) => d.name.toLowerCase() === n)
  }

  connect(aDev: string, aIf: string, bDev: string, bIf: string) {
    const a = this.get(aDev)
    const b = this.get(bDev)
    if (!a || !b) throw new Error(`connect: unknown device ${aDev}/${bDev}`)
    const ai = a.iface(aIf)
    const bi = b.iface(bIf)
    if (!ai || !bi) throw new Error(`connect: unknown interface ${aIf}/${bIf}`)
    ai.peer = { device: bDev, iface: bIf }
    bi.peer = { device: aDev, iface: aIf }
    this.links.push({ a: { device: aDev, iface: aIf }, b: { device: bDev, iface: bIf } })
    this.rev++
    return this
  }

  linkFor(deviceId: string, ifaceName: string): Link | undefined {
    return this.links.find(
      (l) =>
        (l.a.device === deviceId && l.a.iface === ifaceName) ||
        (l.b.device === deviceId && l.b.iface === ifaceName),
    )
  }

  linkUp(deviceId: string, ifaceName: string): boolean {
    const dev = this.get(deviceId)
    const i = dev?.iface(ifaceName)
    if (!dev || !i || i.shutdown || !i.peer) return false
    const link = this.linkFor(deviceId, ifaceName)
    if (!link || link.cut) return false
    const peer = this.get(i.peer.device)
    const peerIf = peer?.iface(i.peer.iface)
    return !!peerIf && !peerIf.shutdown
  }

  setLinkCut(deviceId: string, ifaceName: string, cut: boolean) {
    const link = this.linkFor(deviceId, ifaceName)
    if (link) {
      link.cut = cut
      this.rev++
    }
  }

  /**
   * Everything a frame leaving this interface can reach without passing
   * through a router: the broadcast domain. Switches forward it only to
   * ports that carry the frame's VLAN, so two VLANs on one switch are two
   * separate domains — which is the whole point of a VLAN.
   *
   * Pass `learnMac` to have every switch along the way record the sender,
   * exactly as MAC learning works.
   */
  segmentOf(deviceId: string, ifaceName: string, learnMac?: string): Endpoint[] {
    const dev = this.get(deviceId)
    const start = dev?.iface(ifaceName)
    if (!dev || !start) return []

    const out: Endpoint[] = []
    const seen = new Set<string>()
    const queue: Endpoint[] = []

    if (dev.kind === 'switch' && start.vlanId !== undefined) {
      // leaving an SVI: the frame enters every port carrying that VLAN
      for (const p of dev.ports()) {
        const sp = p.switchport
        if (!sp || p.shutdown) continue
        if (sp.mode === 'access' && sp.accessVlan === start.vlanId) {
          queue.push({ device: deviceId, iface: p.name, vlan: undefined })
        } else if (sp.mode === 'trunk' && trunkAllows(sp, start.vlanId)) {
          queue.push({ device: deviceId, iface: p.name, vlan: start.vlanId })
        }
      }
    } else {
      queue.push({ device: deviceId, iface: ifaceName, vlan: undefined })
    }

    while (queue.length) {
      const cur = queue.shift()!
      const key = `${cur.device}/${cur.iface}/${cur.vlan ?? '-'}`
      if (seen.has(key)) continue
      seen.add(key)

      const d = this.get(cur.device)
      const i = d?.iface(cur.iface)
      if (!d || !i || i.shutdown || !i.peer) continue
      if (this.linkFor(cur.device, cur.iface)?.cut) continue

      const pdev = this.get(i.peer.device)
      const pif = pdev?.iface(i.peer.iface)
      if (!pdev || !pif || pif.shutdown) continue

      if (pdev.kind !== 'switch') {
        out.push({ device: pdev.id, iface: pif.name })
        continue
      }

      /* ── switch ingress ── */
      const sp = pif.switchport
      if (!sp) continue

      let vlan: number
      if (sp.mode === 'access') {
        // a tagged frame from a trunk only belongs here if the tags agree
        if (cur.vlan !== undefined && cur.vlan !== sp.accessVlan) continue
        vlan = sp.accessVlan
      } else {
        vlan = cur.vlan ?? sp.nativeVlan
        if (!trunkAllows(sp, vlan)) continue
      }

      if (learnMac) pdev.macTable.set(learnMac, { mac: learnMac, vlan, iface: pif.name })

      // the switch's own SVI for this VLAN is reachable here
      const svi = pdev.svi(vlan)
      if (svi && !svi.shutdown) out.push({ device: pdev.id, iface: svi.name })

      // flood onward to every other port carrying this VLAN
      for (const p of pdev.ports()) {
        if (p.name === pif.name || p.shutdown) continue
        const psp = p.switchport
        if (!psp) continue
        if (psp.mode === 'access' && psp.accessVlan === vlan) {
          queue.push({ device: pdev.id, iface: p.name, vlan: undefined })
        } else if (psp.mode === 'trunk' && trunkAllows(psp, vlan)) {
          queue.push({ device: pdev.id, iface: p.name, vlan })
        }
      }
    }

    return out
  }

  resolveOnSegment(deviceId: string, ifaceName: string, ip: string, learnMac?: string): Device | null {
    const eps = this.segmentOf(deviceId, ifaceName, learnMac)
    for (const ep of eps) {
      const d = this.get(ep.device)
      if (d?.ownsIp(ip)) return d
    }
    // nobody owns it for real — it may be a virtual address shared by a pair
    return hsrpActive(this, eps, ip)
  }

  /** Is this device currently the HSRP active router for that virtual address? */
  hsrpOwns(dev: Device, ip: string): boolean {
    for (const i of dev.ifaces) {
      if (i.shutdown || i.hsrp?.virtualIp !== ip) continue
      const group = [{ device: dev.id, iface: i.name }, ...this.segmentOf(dev.id, i.name)]
      return hsrpActive(this, group, ip)?.id === dev.id
    }
    return false
  }

  sourceIpFor(dev: Device, destIp: string): string | undefined {
    const route = dev.lookup(destIp)
    if (route?.iface) {
      const i = dev.iface(route.iface)
      if (i?.ip) return i.ip
    }
    return dev.activeIfaces()[0]?.ip
  }

  /**
   * A ping only succeeds if the echo arrives AND the reply finds its way
   * home, so the return path is walked separately.
   */
  ping(fromId: string, destIp: string, maxHops = 16): PingResult {
    const start = this.get(fromId)
    if (!start) return { ok: false, hops: [], failure: 'unreachable', destIp }

    const sourceIp = this.sourceIpFor(start, destIp)
    if (!sourceIp) {
      return { ok: false, hops: [], failure: 'no-source-ip', failedAt: fromId, destIp }
    }

    const forward = this.forward(start, destIp, maxHops, sourceIp)
    forward.sourceIp = sourceIp
    if (!forward.ok) return forward

    const target = this.get(forward.hops.at(-1)!.device)!
    const replyTo = forward.translatedSource ?? sourceIp
    const back = this.forward(target, replyTo, maxHops, destIp)
    if (!back.ok) {
      return {
        ok: false,
        hops: forward.hops,
        failure: 'no-return-path',
        failedAt: back.failedAt ?? target.id,
        destIp,
        sourceIp,
      }
    }
    return forward
  }

  private forward(
    start: Device,
    destIp: string,
    maxHops: number,
    srcIp?: string,
  ): PingResult {
    const hops: Hop[] = []
    let cur: Device = start
    let inIface: string | undefined
    let effectiveSrc = srcIp ?? this.sourceIpFor(start, destIp) ?? '0.0.0.0'
    let translatedSource: string | undefined

    for (let n = 0; n < maxHops; n++) {
      // inbound access list on the interface the packet arrived through
      if (inIface) {
        const inAcl = cur.iface(inIface)?.aclIn
        const acl = inAcl ? cur.acls.get(inAcl) : undefined
        if (acl && evaluateAcl(acl, effectiveSrc, destIp) === 'deny') {
          hops.push({ device: cur.id, deviceName: cur.name, inIface })
          return { ok: false, hops, failure: 'acl-denied', failedAt: cur.id, destIp, translatedSource }
        }
      }

      if (cur.ownsIp(destIp) || this.hsrpOwns(cur, destIp)) {
        hops.push({ device: cur.id, deviceName: cur.name, inIface })
        return { ok: true, hops, destIp, translatedSource }
      }

      // a plain layer-2 switch never routes between VLANs
      if (cur.kind === 'switch' && !cur.ipRouting && cur !== start) {
        hops.push({ device: cur.id, deviceName: cur.name, inIface })
        return { ok: false, hops, failure: 'no-ip-routing', failedAt: cur.id, destIp, translatedSource }
      }

      const route = cur.lookup(destIp)
      if (!route || route.source === 'L') {
        hops.push({ device: cur.id, deviceName: cur.name, inIface })
        return { ok: false, hops, failure: 'no-route', failedAt: cur.id, destIp, translatedSource }
      }

      const outIface = route.iface ?? this.ifaceTowards(cur, route.nextHop)
      if (!outIface) {
        hops.push({ device: cur.id, deviceName: cur.name, inIface })
        return { ok: false, hops, failure: 'no-route', failedAt: cur.id, destIp, translatedSource }
      }

      const ifo = cur.iface(outIface)
      if (!ifo || ifo.shutdown) {
        hops.push({ device: cur.id, deviceName: cur.name, inIface, outIface })
        return { ok: false, hops, failure: 'iface-down', failedAt: cur.id, destIp, translatedSource }
      }
      // an SVI has no cable of its own; its ports carry it
      if (ifo.vlanId === undefined && !this.linkUp(cur.id, outIface)) {
        hops.push({ device: cur.id, deviceName: cur.name, inIface, outIface })
        return { ok: false, hops, failure: 'link-down', failedAt: cur.id, destIp, translatedSource }
      }

      // outbound access list
      const outAclId = ifo.aclOut
      const outAcl = outAclId ? cur.acls.get(outAclId) : undefined
      if (outAcl && evaluateAcl(outAcl, effectiveSrc, destIp) === 'deny') {
        hops.push({ device: cur.id, deviceName: cur.name, inIface, outIface })
        return { ok: false, hops, failure: 'acl-denied', failedAt: cur.id, destIp, translatedSource }
      }

      // network address translation on the way out
      const translated = translateSource(cur, effectiveSrc, outIface)
      if (translated && translated !== effectiveSrc) {
        cur.natTable.set(effectiveSrc, {
          insideLocal: effectiveSrc,
          insideGlobal: translated,
          protocol: 'icmp',
        })
        effectiveSrc = translated
        translatedSource = translated
      }

      const nextHopIp = route.nextHop ?? destIp
      const srcMac = cur.mac(outIface)
      const nextDev = this.resolveOnSegment(cur.id, outIface, nextHopIp, srcMac)
      hops.push({ device: cur.id, deviceName: cur.name, inIface, outIface, nextHopIp })

      if (!nextDev) {
        return { ok: false, hops, failure: 'arp-fail', failedAt: cur.id, destIp, translatedSource }
      }

      // ARP resolved: remember the MAC of the interface that actually answered
      const answering = nextDev.activeIfaces().find((i) => i.ip === nextHopIp)
      cur.arp.set(nextHopIp, nextDev.mac(answering?.name ?? nextDev.ifaces[0]?.name ?? ''))
      // the packet arrives on the next hop's own interface — which is not the
      // directly cabled one when a switch sits in between
      inIface =
        answering?.name ??
        nextDev.ifaces.find((i) => i.hsrp?.virtualIp === nextHopIp)?.name ??
        this.peerIfaceName(cur.id, outIface)
      cur = nextDev
    }

    return { ok: false, hops, failure: 'ttl-exceeded', destIp, translatedSource }
  }

  private peerIfaceName(deviceId: string, ifaceName: string): string | undefined {
    return this.get(deviceId)?.iface(ifaceName)?.peer?.iface
  }

  private ifaceTowards(dev: Device, nextHop?: string): string | undefined {
    if (!nextHop) return undefined
    for (const i of dev.activeIfaces()) {
      if (networkOf(i.ip!, i.mask!) === networkOf(nextHop, i.mask!)) return i.name
    }
    return undefined
  }

  summary() {
    return [...this.devices.values()].map((d) => ({
      id: d.id,
      name: d.name,
      kind: d.kind,
      ifaces: d.ifaces.map((i) => ({ ...i, up: !i.shutdown && this.linkUp(d.id, i.name) })),
    }))
  }
}

export function buildNetwork(fn: (n: Network) => void): Network {
  const n = new Network()
  fn(n)
  return n
}

export { prefixToMask, maskToPrefix, networkOf, broadcastOf, intToIp, ipToInt }
