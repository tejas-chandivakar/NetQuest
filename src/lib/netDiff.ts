import type { Network } from '../engine/network'

/**
 * What a command actually changed, in the learner's words.
 *
 * IOS says nothing when a command succeeds: you type `vlan 10` and the console
 * sits there. So we compare the network before and after and say out loud what
 * moved. The same diff also tells the drawing which devices to flash.
 */
export interface Bi {
  gu: string
  en: string
}

export interface NetChange {
  lines: Bi[]
  touched: string[]
}

/** A flat, comparable picture of everything a lesson can change. */
type Snapshot = Map<string, string>

export function snapshot(net: Network): Snapshot {
  const s: Snapshot = new Map()
  for (const d of net.devices.values()) {
    const k = (rest: string) => `${d.id}|${rest}`
    s.set(k('name'), d.name)
    s.set(k('routing'), String(d.ipRouting))

    for (const [id, name] of d.vlans) s.set(k(`vlan|${id}`), name)

    for (const i of d.ifaces) {
      const sp = i.switchport
      s.set(
        k(`if|${i.name}`),
        [
          i.ip ?? '-',
          i.mask ?? '-',
          i.shutdown ? 'down' : 'up',
          sp ? `${sp.mode}/${sp.accessVlan ?? '-'}/${sp.nativeVlan ?? '-'}/${(sp.allowedVlans ?? []).join('.')}` : '-',
          i.hsrp ? `hsrp${i.hsrp.group}/${i.hsrp.virtualIp}/${i.hsrp.priority}` : '-',
          i.aclIn ?? '-',
          i.aclOut ?? '-',
          i.description ?? '-',
        ].join(' '),
      )
    }

    for (const r of d.staticRoutes ?? [])
      s.set(k(`route|${r.prefix}/${r.mask}`), r.nextHop ?? r.exitIface ?? "-")

    for (const [name, acl] of d.acls)
      s.set(k(`acl|${name}`), acl.entries.map((e: { action: string; protocol?: string }) => `${e.action}:${e.protocol ?? 'ip'}`).join(','))

    for (const p of d.dhcpPools) s.set(k(`pool|${p.name}`), `${p.network ?? '-'}/${p.gateway ?? '-'}/${p.dns ?? '-'}`)

    if (d.ospf) s.set(k('ospf'), `${d.ospf.pid}:${d.ospf.networks.length}:${(d.ospf.passive ?? []).join('.')}`)
    if (d.eigrp) s.set(k('eigrp'), `${d.eigrp.asn}:${d.eigrp.networks.length}`)
    if (d.rip) s.set(k('rip'), `${d.rip.version}:${d.rip.networks.length}`)
    if (d.bgp) s.set(k('bgp'), `${d.bgp.asn}:${d.bgp.neighbors.length}:${d.bgp.networks.length}`)
    if (d.nat) s.set(k('nat'), JSON.stringify(d.nat))
  }
  return s
}

const T = {
  nameSet: (v: string) => ({ gu: `ઉપકરણનું નામ હવે ${v}`, en: `The device is now called ${v}` }),
  routingOn: { gu: 'Switch હવે જૂથો વચ્ચે routing કરશે', en: 'The switch will now route between groups' },
  routingOff: { gu: 'Switch નું routing બંધ થયું', en: 'The switch has stopped routing' },
  vlanAdd: (id: string, n: string) => ({ gu: `જૂથ ${id} બન્યું — ${n}`, en: `Group ${id} created — ${n}` }),
  vlanGone: (id: string) => ({ gu: `જૂથ ${id} મિટાવ્યું`, en: `Group ${id} deleted` }),
  ipSet: (i: string, v: string) => ({ gu: `${i} નું સરનામું હવે ${v}`, en: `${i} now answers to ${v}` }),
  ipGone: (i: string) => ({ gu: `${i} પરથી સરનામું ગયું`, en: `${i} has lost its address` }),
  up: (i: string) => ({ gu: `${i} ચાલુ થયું`, en: `${i} came up` }),
  down: (i: string) => ({ gu: `${i} બંધ થયું`, en: `${i} went down` }),
  accessVlan: (i: string, v: string) => ({ gu: `${i} હવે જૂથ ${v} માં`, en: `${i} now belongs to group ${v}` }),
  trunk: (i: string) => ({ gu: `${i} હવે trunk — બધાં જૂથ લઈ જશે`, en: `${i} is now a trunk, carrying every group` }),
  access: (i: string) => ({ gu: `${i} હવે એક જ જૂથનો`, en: `${i} now carries one group only` }),
  aclOn: (i: string, n: string) => ({ gu: `${i} પર નિયમો ${n} લાગ્યા`, en: `Rule list ${n} is now guarding ${i}` }),
  hsrp: (i: string) => ({ gu: `${i} પર નકલી gateway ગોઠવાયું`, en: `${i} now shares a standby gateway` }),
  routeAdd: (p: string, v: string) => ({ gu: `રસ્તો ઉમેરાયો: ${p} → ${v}`, en: `Path added: ${p} via ${v}` }),
  routeGone: (p: string) => ({ gu: `રસ્તો કાઢ્યો: ${p}`, en: `Path removed: ${p}` }),
  aclRule: (n: string) => ({ gu: `નિયમોની યાદી ${n} બદલાઈ`, en: `Rule list ${n} changed` }),
  pool: (n: string) => ({ gu: `DHCP જથ્થો ${n} બદલાયો`, en: `DHCP pool ${n} changed` }),
  proto: (n: string) => ({ gu: `${n} ની ગોઠવણ બદલાઈ`, en: `The ${n} settings changed` }),
  nat: { gu: 'NAT ની ગોઠવણ બદલાઈ', en: 'The NAT settings changed' },
}

/** Compare two snapshots and say, in words, what moved. */
export function describeChange(before: Snapshot, after: Snapshot): NetChange {
  const lines: Bi[] = []
  const touched = new Set<string>()
  const keys = new Set([...before.keys(), ...after.keys()])

  for (const key of keys) {
    const a = before.get(key)
    const b = after.get(key)
    if (a === b) continue

    const [dev, kind, detail = ''] = key.split('|')
    touched.add(dev)

    if (kind === 'name' && b) lines.push(T.nameSet(b))
    else if (kind === 'routing') lines.push(b === 'true' ? T.routingOn : T.routingOff)
    else if (kind === 'vlan') lines.push(b ? T.vlanAdd(detail, b) : T.vlanGone(detail))
    else if (kind === 'route') lines.push(b ? T.routeAdd(detail, b) : T.routeGone(detail))
    else if (kind === 'acl') lines.push(T.aclRule(detail))
    else if (kind === 'pool') lines.push(T.pool(detail))
    else if (kind === 'ospf' || kind === 'eigrp' || kind === 'rip' || kind === 'bgp')
      lines.push(T.proto(kind.toUpperCase()))
    else if (kind === 'nat') lines.push(T.nat)
    else if (kind === 'if') {
      const [aIp, , aState, aSp, aHsrp, aAclIn] = (a ?? '- - - - - - - -').split(' ')
      const [bIp, bMask, bState, bSp, bHsrp, bAclIn] = (b ?? '- - - - - - - -').split(' ')

      if (aIp !== bIp) lines.push(bIp === '-' ? T.ipGone(detail) : T.ipSet(detail, `${bIp}/${bMask}`))
      if (aState !== bState) lines.push(bState === 'up' ? T.up(detail) : T.down(detail))
      if (aSp !== bSp) {
        const [bMode, bVlan] = bSp.split('/')
        const [aMode, aVlan] = aSp.split('/')
        if (aMode !== bMode) lines.push(bMode === 'trunk' ? T.trunk(detail) : T.access(detail))
        if (aVlan !== bVlan && bVlan !== '-') lines.push(T.accessVlan(detail, bVlan))
      }
      if (aHsrp !== bHsrp && bHsrp !== '-') lines.push(T.hsrp(detail))
      if (aAclIn !== bAclIn && bAclIn !== '-') lines.push(T.aclOn(detail, bAclIn))
    }
  }

  return { lines, touched: [...touched] }
}
