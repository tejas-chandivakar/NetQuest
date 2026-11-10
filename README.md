# NetQuest

Learn networking by watching it happen — from zero to CCNP, with animation, an IOS-style CLI and hands-on labs.

Three courses:

| Track | Code | Lessons | Hours |
|---|---|---|---|
| Networking Foundation | FOUNDATION | 20 | ~15 |
| CCNA | 200-301 | 36 | ~60 |
| CCNP Enterprise | ENCOR + ENARSI | 20 | ~80 |

Every topic runs in three stages: **Learn** (watch the animation) → **Configure** (type real
commands, each line advances the animation) → **Break it** (shut a link, change a timer, see
what the network does).

Two language layers, switchable at any time:

- **Beginner mode** — plain, everyday language, no jargon
- **Exam mode** — exact Cisco terminology and exam phrasing

Plus a Gujarati / English toggle across the whole app.

## Run it

```bash
npm install
npm run dev     # http://localhost:5180
```

```bash
npm run build   # static output in dist/ — deploys free to Vercel, Netlify or Cloudflare Pages
```

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · Zustand · custom SVG topology renderer.
No backend: everything runs in the browser, progress is kept in `localStorage`.

## Layout

```
src/
  components/   Layout, Topology (SVG renderer), AnimatedLesson, PlayerBar
  data/         courses.ts — the full three-track catalogue
  lessons/      one file per built lesson + registry.ts
  lib/          useStepPlayer (animation clock), i18n
  pages/        Home, TrackPage, LessonPage
  store/        useApp — mode, language, progress
```

## Adding a lesson

Write a `LessonSpec` (why it matters, animated steps, takeaway, quick check) in
`src/lessons/<id>.ts`, then register it in `src/lessons/registry.ts`. The id must match a
lesson id in `src/data/courses.ts`. Lessons not yet built show a roadmap card instead.

## The engine

`src/engine/` is a real network simulator with no UI dependencies:

- `ip.ts` — IPv4 maths: masks, prefixes, wildcards, network/broadcast, validation
- `network.ts` — devices, interfaces, links, VLAN-aware broadcast domains, routing
  tables, longest-prefix match with AD and metric tie-breaks, and a hop-by-hop `ping`
  that checks the return path too and reports exactly why it failed
- `routing.ts` — OSPF, EIGRP and RIP: adjacency rules (area, AS, passive interfaces),
  OSPF cost from bandwidth, the EIGRP composite metric, RIP hop count, and a shared
  Dijkstra that each protocol weighs its own way
- `bgp.ts` — eBGP and iBGP sessions, AS-path loop prevention, iBGP split horizon, and
  the path-selection tie-breaks (local preference, AS-path length, MED, eBGP over iBGP)
- `services.ts` — access lists (standard and extended, first match wins, implicit deny),
  NAT and PAT, HSRP election, and DHCP address assignment
- `cli.ts` — an IOS-style parser: user → privileged → config → interface / VLAN /
  router / DHCP modes, prefix abbreviation (`conf t`, `int gi0/0`), `?` help, Tab
  completion, `do <command>`, and the real error strings

The engine is the single source of truth: the CLI mutates it, and the drawing, the
interface table and the routing table all read from it. An animation can never drift
from what the configuration actually says.

`npm test` runs 102 tests across IP maths, switching, VLANs, routing protocols, BGP,
services — and a suite that replays the solution to every lab to prove each one is
still completable.

## One interface everywhere

Two rules hold the interface still:

- **Beginner and Exam change the words, never the interface.** One stylesheet, one set of
  colours, one layout, so switching modes moves nothing on screen.
- **Learn, Configure and Break it share one shape.** All three render through
  `StageLayout`: a coloured note strip, the drawing with its controls in the same panel,
  then two columns — what is happening on the left, the working surface on the right.
  Switching tabs never rearranges the page.

## Status

All three stages are built:

- **Learn** — stepped animation with narration in four combinations
  (Beginner/Exam x Gujarati/English), play / pause / step / speed, and a quick check
- **Configure** — a live IOS console; every command redraws the topology and the tables.
  Tasks tick themselves off by inspecting engine state, with three escalating hint levels
- **Break it** — fault switches over a working network, plus ping probes that animate the
  packet hop by hop and explain the failure

**Networking Foundation is complete** — all 20 lessons have a Learn animation, so a
beginner can go from "two computers, one wire" to "what happens when you type
google.com" without hitting a gap.

| Lesson | Learn | Configure | Break it |
|---|:--:|:--:|:--:|
| `b1l1` How two computers talk | yes | yes | yes |
| `b1l2` Cables, WiFi and signals | yes | — | — |
| `b1l3` LAN, WAN and the Internet | yes | — | — |
| `b1l4` Clients and servers | yes | — | — |
| `b1l5` The cast of a network | yes | — | — |
| `b2l1` IP address | yes | — | — |
| `b2l2` MAC address | yes | — | — |
| `b2l3` IP vs MAC, and ARP | yes | — | — |
| `b2l4` Public vs private IP | yes | — | — |
| `b2l5` Binary made easy | yes | — | — |
| `b3l1` What is a packet | yes | — | — |
| `b3l2` The 7 OSI layers | yes | — | — |
| `b3l3` TCP vs UDP | yes | — | — |
| `b3l4` Port numbers | yes | — | — |
| `b3l5` What is a protocol | yes | — | — |
| `b4l1` When you type google.com | yes | — | — |
| `b4l2` DNS | yes | — | — |
| `b4l3` DHCP | yes | — | — |
| `b4l4` Inside your WiFi router | yes | — | — |
| `b4l5` Firewalls and security | yes | — | — |
| `n1l4` Subnetting | — | calculator | — |
| `n2l1` Switching and the MAC table | yes | — | — |
| `n2l2` VLANs | — | yes | yes |
| `n2l3` Trunking and 802.1Q | — | yes | — |
| `n3l3` Static routing | — | yes | yes |
| `n3l5` OSPF single area | — | yes | yes |
| `n3l6` HSRP | — | yes | yes |
| `n4l1` DHCP | — | yes | — |
| `n4l2` NAT and PAT | — | yes | yes |
| `n5l2` Access control lists | — | yes | yes |
| `n7l1` Project 1 — small office | — | yes | — |
| `n7l2` Project 2 — departments apart | — | yes | — |
| `p2l4` BGP with two providers | — | yes | — |

Every CCNA and CCNP lesson not listed above shows a roadmap card until its spec is written.

Not built yet: Learn animations for most of CCNA and CCNP; STP, QoS and multicast in the
engine; the drag-and-drop topology builder; projects 3 to 5; and the quiz, flashcard and
exam-simulator work.
