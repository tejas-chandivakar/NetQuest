import { cidr } from '../engine/ip'
import type { Device, DeviceKind, Network } from '../engine/network'
import type { LiveTableSpec } from '../components/LiveTable'
import type { Bi } from '../data/courses'

/**
 * The tables a real device keeps, read straight out of the engine.
 *
 * These are the four tables a CCNA candidate is asked to read in an exam, and
 * the engine already maintains all four while a ping runs. Until now only the
 * routing table was ever shown, which on a beginner topology of PCs and a
 * switch is always empty — so the one panel that could have explained how a
 * frame found its way showed "(empty)" and taught nothing.
 */

const H = (gu: string, en: string): Bi => ({ gu, en })

export type TableId = 'ifaces' | 'routes' | 'arp' | 'mac'

const TITLE: Record<TableId, Bi> = {
  ifaces: H('Interfaces', 'Interfaces'),
  routes: H('Routing Table', 'Routing Table'),
  arp: H('ARP Cache', 'ARP Cache'),
  mac: H('MAC Address Table', 'MAC Address Table'),
}

/**
 * An empty table is the most common state a learner meets first, so each one
 * says what would put a line in it rather than just "(empty)".
 */
const EMPTY: Record<TableId, Bi> = {
  ifaces: H('આ ઉપકરણ પર એકેય પોર્ટ નથી.', 'No ports on this device.'),
  routes: H(
    'એકેય રસ્તો નથી — એટલે પોતાના નેટવર્કની બહાર ક્યાંય પહોંચાશે નહીં.',
    'No paths yet, so nothing beyond its own network can be reached.',
  ),
  arp: H(
    'હજી કોઈને ઓળખતું નથી. આ ઉપકરણ જેની સાથે વાત કરશે તેનું hardware સરનામું અહીં લખાઈ જશે.',
    'It knows nobody yet. Whoever this device talks to gets written down here.',
  ),
  mac: H(
    'Switch હજી કશું શીખ્યું નથી. એ ત્યારે જ શીખે છે જ્યારે કોઈ frame એના પોર્ટ પર આવે.',
    'The switch has learnt nothing yet. It only learns when a frame arrives on a port.',
  ),
}

const HEAD: Record<TableId, string[]> = {
  ifaces: ['port', 'address', 'state'],
  routes: ['', 'network', 'via'],
  arp: ['address', 'hardware addr'],
  mac: ['vlan', 'mac address', 'port'],
}

function rowsFor(id: TableId, dev: Device, net: Network): string[][] {
  switch (id) {
    case 'ifaces':
      return dev.ifaces.map((i) => {
        // an SVI has no cable of its own; it is up when the VLAN behind it is
        const up = !i.shutdown && (i.vlanId !== undefined || net.linkUp(dev.id, i.name))
        return [
          i.name,
          i.ip ? cidr(i.ip, i.mask!) : '—',
          i.shutdown ? 'admin down' : up ? 'up/up' : 'down',
        ]
      })
    case 'routes':
      return dev
        .installedRoutes()
        .filter((r) => r.source !== 'L')
        .map((r) => [r.source, cidr(r.prefix, r.mask), r.nextHop ? `via ${r.nextHop}` : (r.iface ?? '—')])
    case 'arp':
      // insertion order is the order they were learnt, which is the story
      return [...dev.arp].map(([ip, mac]) => [ip, mac])
    case 'mac':
      return [...dev.macTable.values()].map((e) => [String(e.vlan), e.mac, e.iface])
  }
}

/** Which tables are worth showing for a device, most telling first. */
export function tableIdsFor(dev: Device): TableId[] {
  const kind: DeviceKind = dev.kind
  if (kind === 'switch') return dev.ipRouting ? ['mac', 'routes', 'ifaces'] : ['mac', 'ifaces']
  if (kind === 'router') return ['routes', 'arp', 'ifaces']
  return ['arp', 'ifaces']
}

export function tableFor(id: TableId, dev: Device, net: Network): LiveTableSpec {
  return {
    title: TITLE[id],
    owner: dev.id,
    head: HEAD[id],
    empty: EMPTY[id],
    rows: rowsFor(id, dev, net),
  }
}

export function tablesFor(dev: Device, net: Network): { id: TableId; spec: LiveTableSpec }[] {
  return tableIdsFor(dev).map((id) => ({ id, spec: tableFor(id, dev, net) }))
}
