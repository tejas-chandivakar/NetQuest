import type { LessonSpec } from '../components/AnimatedLesson'

const BEG = 'var(--nq-beginner)'
const CCNA = 'var(--nq-ccna)'
const CCNP = 'var(--nq-ccnp)'
const WARN = 'var(--nq-warn)'
const H = (gu: string, hi: string, en: string) => ({ gu, hi, en })

/* ═══════════════════ p4l1 · Structured Troubleshooting ═══════════════════ */

export const p4l1: LessonSpec = {
  why: {
    gu: '3 AM par call: "Internet nathi chale." 500 ni team panic ma. Tamara pase 15 minutes chhe. Random commands typing karta jashu ke structured approach? CCNP level engineers alag chhe — e method follow kare. Aa lesson e method j shikhavay.',
    hi: '3 AM पर call: "Internet नहीं चल रहा"। 500 की team panic में। आपके पास 15 minutes हैं। Random commands typing करते जाएं या structured approach? CCNP level engineers अलग हैं — वे method follow करें। यही method यह lesson सिखाए।',
    en: '3 AM call: "the internet is down." Team of 500 panicking. You have 15 minutes. Do you type random commands or follow a structured approach? CCNP-level engineers are different — they follow a method. That method is what this lesson teaches.',
  },
  steps: [
    {
      ms: 3000,
      label: H('OSI model — niche thi upar', 'OSI model — नीचे से ऊपर', 'OSI model — bottom up'),
      text: {
        beginner: {
          gu: 'Troubleshooting ni sauthi reliable approach: niche thi shuru karo. Layer 1 (physical) — cable, port? Layer 2 — link state, MAC, VLAN? Layer 3 — IP, subnet, routing? Layer 4 — port, TCP? Upper layers application. Niche thi shuru karvanu kem ke upper layers niche par dependent chhe.',
          hi: 'Troubleshooting का सबसे reliable approach: नीचे से शुरू करें। Layer 1 (physical) — cable, port? Layer 2 — link state, MAC, VLAN? Layer 3 — IP, subnet, routing? Layer 4 — port, TCP? Upper layers application। नीचे से शुरू इसलिए कि upper layers नीचे पर dependent हैं।',
          en: 'The most reliable troubleshooting approach: start at the bottom. Layer 1 (physical) — cable, port? Layer 2 — link state, MAC, VLAN? Layer 3 — IP, subnet, routing? Layer 4 — port, TCP? Upper layers are application. Start bottom-up because upper layers depend on lower ones.',
        },
        exam: {
          gu: 'Bottom-up: physical issues most common (60%+ real-world outages). Top-down: application fail hoy to app server thi start. Divide-and-conquer: middle layer (L3) thi start karo, direction nakki karo. Follow-the-path: packet ne mentally trace karo source thi destination.',
          hi: 'Bottom-up: physical issues most common (60%+ real-world outages)। Top-down: application fail हो तो app server से start। Divide-and-conquer: middle layer (L3) से start, direction तय करें। Follow-the-path: packet को mentally trace करें source से destination।',
          en: 'Bottom-up: physical issues most common (60%+ real-world outages). Top-down: application fails, start at app server. Divide-and-conquer: start at middle layer (L3), decide direction. Follow-the-path: mentally trace the packet from source to destination.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'l7', x: 450, y: 60, type: 'server' as const, label: 'L7 Application', accent: 'var(--nq-text-mute)' },
          { id: 'l4', x: 450, y: 150, type: 'router' as const, label: 'L4 Transport', accent: 'var(--nq-text-mute)' },
          { id: 'l3', x: 450, y: 240, type: 'router' as const, label: 'L3 Network', accent: t > 0.5 ? CCNA : 'var(--nq-text-mute)' },
          { id: 'l2', x: 450, y: 330, type: 'switch' as const, label: 'L2 Data link', accent: t > 0.3 ? CCNA : 'var(--nq-text-mute)' },
          { id: 'l1', x: 450, y: 420, type: 'switch' as const, label: 'L1 Physical', accent: t > 0.1 ? CCNA : BEG, pulse: t > 0.1 && t < 0.3 },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Show commands — right order', 'Show commands — right order', 'Show commands — right order'),
      text: {
        beginner: {
          gu: 'L1: `show interface status`, `show interface counters errors`. L2: `show mac address-table`, `show vlan brief`, `show spanning-tree`. L3: `show ip interface brief`, `show ip route`, `show ip protocols`, `ping`, `traceroute`. L4: `show ip socket`, telnet to port.',
          hi: 'L1: `show interface status`, `show interface counters errors`। L2: `show mac address-table`, `show vlan brief`, `show spanning-tree`। L3: `show ip interface brief`, `show ip route`, `show ip protocols`, `ping`, `traceroute`। L4: `show ip socket`, telnet to port।',
          en: 'L1: `show interface status`, `show interface counters errors`. L2: `show mac address-table`, `show vlan brief`, `show spanning-tree`. L3: `show ip interface brief`, `show ip route`, `show ip protocols`, `ping`, `traceroute`. L4: `show ip socket`, telnet to port.',
        },
        exam: {
          gu: '`show ip interface brief` — one-screen summary interfaces nu. `show ip route <specific-net>` — longest prefix match jue. `debug` sparingly use karo — CPU load aney console flood.',
          hi: '`show ip interface brief` — one-screen summary interfaces का। `show ip route <specific-net>` — longest prefix match देखे। `debug` sparingly use करें — CPU load और console flood।',
          en: '`show ip interface brief` — one-screen interface summary. `show ip route <specific-net>` — shows longest prefix match. Use `debug` sparingly — CPU load and console flood.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'cmd', x: 450, y: 200, type: 'router' as const, label: 'show, ping, trace', accent: CCNP, pulse: true },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('"Pehla kashu badalyu hatu?"', '"पहले क्या बदला था?"', '"What changed recently?"'),
      text: {
        beginner: {
          gu: 'Troubleshooting nu sauthi important question: "kashu badalyu chhe? Kone change karyu? Kyare?" 80% outages recent changes thi j aave — new deployment, config update, upgrade. Change management log, commit history, change tickets check karo pehla. Ek bhavishya ne solve karvano simple way.',
          hi: 'Troubleshooting का सबसे important question: "क्या बदला? किसने change किया? कब?" 80% outages recent changes से ही आते — new deployment, config update, upgrade। Change management log, commit history, change tickets check करें पहले। एक समस्या को solve करने का simple way।',
          en: 'The most important troubleshooting question: "what changed? who changed it? when?" 80% of outages come from recent changes — new deployment, config update, upgrade. Check change management log, commit history, change tickets first. One simple way to solve.',
        },
        exam: {
          gu: '`show archive` configuration history. `show logging` recent events. Version control (git) commits review. Correlation: change timing ane issue start timing match thay to high probability root cause.',
          hi: '`show archive` configuration history। `show logging` recent events। Version control (git) commits review। Correlation: change timing और issue start timing match हो तो high probability root cause।',
          en: '`show archive` configuration history. `show logging` recent events. Review version control (git) commits. Correlation: if change timing matches issue start, high-probability root cause.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'q', x: 450, y: 200, type: 'server' as const, label: 'What changed?', accent: WARN, pulse: true },
        ],
      }),
    },
    {
      ms: 2800,
      label: H('Document, communicate, rollback plan', 'Document, communicate, rollback plan', 'Document, communicate, rollback plan'),
      text: {
        beginner: {
          gu: 'Troubleshoot karta avy badhu document karo: shu try karyu, result shu malyo, next step shu. Stakeholders ne regular update aapo — "still investigating, 15 min ma update". Kathi fix apply karva pehla rollback plan tyar rakho: "aa change kam nathi karyu to kem rollback karvanu".',
          hi: 'Troubleshoot करते समय सब कुछ document करें: क्या try किया, result क्या मिला, next step क्या। Stakeholders को regular update दें — "still investigating, 15 min में update"। कोई fix apply करने से पहले rollback plan तैयार रखें: "यह change काम न करे तो कैसे rollback"।',
          en: 'While troubleshooting document everything: what you tried, what result, what next. Give stakeholders regular updates — "still investigating, update in 15 min". Before applying any fix, keep a rollback plan ready: "if this change does not work, how to rollback".',
        },
        exam: {
          gu: 'Exam note: concept same, timing ane order yaad rakho.',
          hi: 'Exam note: concept same, timing और order याद रखें।',
          en: 'Exam note: same concept, remember timing and order.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'd', x: 220, y: 200, type: 'server' as const, label: 'Document', accent: CCNA },
          { id: 'c', x: 450, y: 200, type: 'server' as const, label: 'Communicate', accent: CCNA },
          { id: 'r', x: 680, y: 200, type: 'server' as const, label: 'Rollback plan', accent: 'var(--nq-ok)', pulse: true },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Structured troubleshooting: approach nakki karo (bottom-up most common), relevant show commands step-by-step, "recently kashu badalyu?" puchho pehla. Document everything, communicate regularly, rollback plan tyar rakho. Random typing nahi — method.',
    hi: 'Structured troubleshooting: approach तय करें (bottom-up most common), relevant show commands step-by-step, "recently क्या बदला?" पहले पूछें। Document everything, communicate regularly, rollback plan तैयार। Random typing नहीं — method।',
    en: 'Structured troubleshooting: pick an approach (bottom-up most common), run relevant show commands step by step, ask "what changed recently?" first. Document everything, communicate regularly, keep a rollback plan ready. Not random typing — method.',
  },
  check: {
    q: H(
      'User "Internet nathi chale" kahi ne call kare. Pehlo question?',
      'User "Internet नहीं चल रहा" कहकर call करे। पहला question?',
      'A user calls saying "internet is down". First question?',
    ),
    options: [
      H('"Hamna kashu badalyu chhe?" ane "kone affect che?"', '"हाल में क्या बदला?" और "किसे affect है?"', '"What changed recently?" and "who is affected?"'),
      H('Reboot everything', 'Reboot everything', 'Reboot everything'),
      H('Random debug commands run karo', 'Random debug commands run करें', 'Run random debug commands'),
    ],
    answer: 0,
    explain: H(
      'Pehla scope nakki karvo: ek user, team, ke building? Scope narrows problem location. Pachhi "kashu badalyu" 80% root cause pakaday. Reboot thi vakyat ochhu solve thay, debug thi CPU/log flood — structured approach ma e last resort.',
      'पहले scope तय करें: एक user, team, या building? Scope problem location narrow करे। फिर "क्या बदला" 80% root cause पकड़े। Reboot से बहुत कम solve, debug से CPU/log flood — structured approach में यह last resort।',
      'First establish scope: one user, team, or building? Scope narrows problem location. Then "what changed" catches 80% of root causes. Reboot rarely solves, debug causes CPU/log flood — in structured approach, that is last resort.',
    ),
  },
}

/* ═══════════════════ p4l2 · Project 4 — Enterprise Campus ═══════════════════ */

export const p4l2: LessonSpec = {
  why: {
    gu: 'Aa project real-world enterprise design chhe: 1000+ users, three-floor building, zero downtime target. Badhu CCNP ni concepts aa ek project ma aave: 3-tier design, VLANs, VRF, OSPF multi-area, HSRP, QoS, security. Darek layer purposeful chhe.',
    hi: 'यह project real-world enterprise design है: 1000+ users, three-floor building, zero downtime target। सारे CCNP concepts इस एक project में आएं: 3-tier design, VLANs, VRF, OSPF multi-area, HSRP, QoS, security। हर layer purposeful है।',
    en: 'This project is a real-world enterprise design: 1000+ users, three-floor building, zero downtime target. All CCNP concepts come together: 3-tier design, VLANs, VRF, OSPF multi-area, HSRP, QoS, security. Each layer purposeful.',
  },
  steps: [
    {
      ms: 3000,
      label: H('Requirements — pehla', 'Requirements — पहले', 'Requirements — first'),
      text: {
        beginner: {
          gu: '1000 users 3 floors par (350 + 350 + 300). Each floor VLANs: corp staff, guest Wi-Fi, IP phones, printers. DC separate, 50 servers. Redundancy: koi single device failure 10 seconds thi vadhu outage na kari shake. Future: 2 vaar grow karva nu budget.',
          hi: '1000 users 3 floors पर (350 + 350 + 300)। Each floor VLANs: corp staff, guest Wi-Fi, IP phones, printers। DC separate, 50 servers। Redundancy: कोई single device failure 10 seconds से ज़्यादा outage न करे। Future: 2 गुना grow करने का budget।',
          en: '1000 users on 3 floors (350 + 350 + 300). Per floor VLANs: corp staff, guest Wi-Fi, IP phones, printers. DC separate, 50 servers. Redundancy: no single device failure causing more than 10 seconds of outage. Future: budget to grow 2x.',
        },
        exam: {
          gu: 'Exam note: concept same, timing ane order yaad rakho.',
          hi: 'Exam note: concept same, timing और order याद रखें।',
          en: 'Exam note: same concept, remember timing and order.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'req', x: 450, y: 200, type: 'server' as const, label: 'Requirements', accent: CCNP, pulse: true },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('3-Tier physical design', '3-Tier physical design', '3-Tier physical design'),
      text: {
        beginner: {
          gu: 'Access: dar floor ma 4 switches (24-port Catalyst 9200, PoE+). Distribution: 2 Catalyst 9500 per floor (HSRP pair). Core: 2 Catalyst 9600 chassis (back-to-back). DC: separate Nexus 9K pair. Uplinks: 10G/25G access-to-dist, 100G dist-to-core.',
          hi: 'Access: हर floor में 4 switches (24-port Catalyst 9200, PoE+)। Distribution: 2 Catalyst 9500 per floor (HSRP pair)। Core: 2 Catalyst 9600 chassis (back-to-back)। DC: separate Nexus 9K pair। Uplinks: 10G/25G access-to-dist, 100G dist-to-core।',
          en: 'Access: 4 switches per floor (24-port Catalyst 9200, PoE+). Distribution: 2 Catalyst 9500 per floor (HSRP pair). Core: 2 Catalyst 9600 chassis (back-to-back). DC: separate Nexus 9K pair. Uplinks: 10G/25G access-to-dist, 100G dist-to-core.',
        },
        exam: {
          gu: 'Exam note: concept same, timing ane order yaad rakho.',
          hi: 'Exam note: concept same, timing और order याद रखें।',
          en: 'Exam note: same concept, remember timing and order.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'c1', x: 400, y: 70, type: 'router' as const, label: 'Core1', accent: CCNP },
          { id: 'c2', x: 600, y: 70, type: 'router' as const, label: 'Core2', accent: CCNP },
          { id: 'd1', x: 200, y: 200, type: 'router' as const, label: 'Dist floor 1', accent: CCNA },
          { id: 'd2', x: 500, y: 200, type: 'router' as const, label: 'Dist floor 2', accent: CCNA },
          { id: 'd3', x: 800, y: 200, type: 'router' as const, label: 'Dist floor 3', accent: CCNA },
          { id: 'dc', x: 400, y: 330, type: 'server' as const, label: 'DC Nexus', accent: CCNA },
        ],
        links: [
          { id: 'cc', from: 'c1', to: 'c2', state: 'up' },
          { id: 'cd1', from: 'c1', to: 'd1', state: 'up' },
          { id: 'cd2', from: 'c1', to: 'd2', state: 'up' },
          { id: 'cd3', from: 'c2', to: 'd2', state: 'up' },
          { id: 'cd4', from: 'c2', to: 'd3', state: 'up' },
          { id: 'dc1', from: 'c1', to: 'dc', state: 'up' },
          { id: 'dc2', from: 'c2', to: 'dc', state: 'up' },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('L3 ane HSRP', 'L3 और HSRP', 'L3 and HSRP'),
      text: {
        beginner: {
          gu: 'Routing OSPF multi-area: Area 0 backbone (core), Area 1 floor 1, Area 2 floor 2, Area 3 floor 3, Area 100 DC. SVIs on distribution. HSRP: dar VLAN par ek active/standby pair — Dist-A active for VLAN 10, Dist-B active for VLAN 20. Load balance ane redundancy.',
          hi: 'Routing OSPF multi-area: Area 0 backbone (core), Area 1 floor 1, Area 2 floor 2, Area 3 floor 3, Area 100 DC। SVIs on distribution। HSRP: हर VLAN पर एक active/standby pair — Dist-A active for VLAN 10, Dist-B active for VLAN 20। Load balance और redundancy।',
          en: 'Routing: OSPF multi-area: Area 0 backbone (core), Area 1 floor 1, Area 2 floor 2, Area 3 floor 3, Area 100 DC. SVIs on distribution. HSRP: active/standby pair per VLAN — Dist-A active for VLAN 10, Dist-B active for VLAN 20. Load balance and redundancy.',
        },
        exam: {
          gu: 'Exam note: concept same, timing ane order yaad rakho.',
          hi: 'Exam note: concept same, timing और order याद रखें।',
          en: 'Exam note: same concept, remember timing and order.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'da', x: 300, y: 150, type: 'router' as const, label: 'Dist-A', sub: 'active VLAN 10', accent: 'var(--nq-ok)', pulse: true },
          { id: 'db', x: 600, y: 150, type: 'router' as const, label: 'Dist-B', sub: 'active VLAN 20', accent: 'var(--nq-ok)', pulse: true },
          { id: 'u1', x: 300, y: 350, type: 'pc' as const, label: 'VLAN 10 user', accent: BEG },
          { id: 'u2', x: 600, y: 350, type: 'pc' as const, label: 'VLAN 20 user', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'da', to: 'u1', state: 'up', flowing: true },
          { id: 'b', from: 'db', to: 'u2', state: 'up', flowing: true },
          { id: 'c', from: 'da', to: 'db', state: 'up' },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('Security, QoS, segmentation', 'Security, QoS, segmentation', 'Security, QoS, segmentation'),
      text: {
        beginner: {
          gu: 'Security: port-security access ports par, DHCP snooping, DAI, 802.1X. VRF: corp separate thi guest. Guest VRF ne corp VRF par ping nathi. ACL inter-VLAN traffic ne restrict kare — "Finance printer access nahi kari shake". QoS: voice EF marking, LLQ ma, video AF41 pre-reserved 30%. Monitoring: NetFlow, syslog to SIEM, SNMP to NMS.',
          hi: 'Security: port-security access ports पर, DHCP snooping, DAI, 802.1X। VRF: corp separate from guest। Guest VRF को corp VRF पर ping नहीं। ACL inter-VLAN traffic restrict करे — "Finance printer access नहीं कर सके"। QoS: voice EF marking, LLQ में, video AF41 pre-reserved 30%। Monitoring: NetFlow, syslog to SIEM, SNMP to NMS।',
          en: 'Security: port-security on access ports, DHCP snooping, DAI, 802.1X. VRF: corp separate from guest. Guest VRF cannot ping corp VRF. ACL restricts inter-VLAN traffic — "Finance cannot reach printers". QoS: voice EF marking, LLQ, video AF41 pre-reserved 30%. Monitoring: NetFlow, syslog to SIEM, SNMP to NMS.',
        },
        exam: {
          gu: 'Exam note: concept same, timing ane order yaad rakho.',
          hi: 'Exam note: concept same, timing और order याद रखें।',
          en: 'Exam note: same concept, remember timing and order.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 's', x: 250, y: 100, type: 'router' as const, label: 'Security', accent: BEG },
          { id: 'q', x: 450, y: 100, type: 'router' as const, label: 'QoS', accent: CCNA },
          { id: 'seg', x: 650, y: 100, type: 'router' as const, label: 'Segmentation', accent: CCNP },
          { id: 'mon', x: 450, y: 280, type: 'server' as const, label: 'Monitoring', accent: 'var(--nq-ok)', pulse: true },
        ],
        links: [
          { id: 'a', from: 's', to: 'mon', state: 'up' },
          { id: 'b', from: 'q', to: 'mon', state: 'up' },
          { id: 'c', from: 'seg', to: 'mon', state: 'up' },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Enterprise campus design: 3-tier (Access-Dist-Core) thi scale, OSPF multi-area thi routing, HSRP thi gateway redundancy, VRF thi tenant isolation, ACL thi policy, QoS thi quality, security features access edge par. Darek block repeat pattern — floor 4 add karvo hoy to copy-paste.',
    hi: 'Enterprise campus design: 3-tier (Access-Dist-Core) से scale, OSPF multi-area से routing, HSRP से gateway redundancy, VRF से tenant isolation, ACL से policy, QoS से quality, security features access edge पर। हर block repeat pattern — floor 4 add करना हो तो copy-paste।',
    en: 'Enterprise campus design: 3-tier (Access-Dist-Core) for scale, OSPF multi-area for routing, HSRP for gateway redundancy, VRF for tenant isolation, ACL for policy, QoS for quality, security features at access edge. Each block a repeat pattern — adding floor 4 means copy-paste.',
  },
  check: {
    q: H(
      'Enterprise campus ma dar VLAN mate gateway redundancy sauthi common keva aape?',
      'Enterprise campus में हर VLAN के लिए gateway redundancy सबसे common कैसे दें?',
      'In enterprise campus, how is per-VLAN gateway redundancy most commonly done?',
    ),
    options: [
      H('Distribution pair par HSRP active/standby', 'Distribution pair पर HSRP active/standby', 'HSRP active/standby on distribution pair'),
      H('Core par single router', 'Core पर single router', 'Single router at core'),
      H('Fakat access switches ne L3 banavi do', 'केवल access switches को L3 बना दें', 'Make access switches L3'),
    ],
    answer: 0,
    explain: H(
      'HSRP (ya VRRP) on distribution pair — standard enterprise design. User no gateway ek virtual IP, bane physical routers VRRP/HSRP process thi vato kare. Core par single router SPOF — nahi acceptable. Access par L3 "routed access" rare design — scale ne complex banave.',
      'HSRP (या VRRP) on distribution pair — standard enterprise design। User का gateway एक virtual IP, दोनों physical routers VRRP/HSRP process से बात करें। Core पर single router SPOF — unacceptable। Access पर L3 "routed access" rare design — scale complex।',
      'HSRP (or VRRP) on distribution pair — standard enterprise design. User gateway is a virtual IP, both physical routers coordinate via HSRP/VRRP. Single router at core is SPOF — unacceptable. L3 at access ("routed access") is rare — makes scale complex.',
    ),
  },
}

/* ═══════════════════ p4l3 · Project 5 — Dual-ISP BGP ═══════════════════ */

export const p4l3: LessonSpec = {
  why: {
    gu: 'Enterprise ne 2 ISPs saathe connect karva chhe for redundancy ane load distribution. BGP ni classical use case. Challenges: outbound steering (ko ISP primary?), inbound steering (bijju AS tamara pase kem aave?), prefix announcements, filtering, loop prevention. Aa project e badha BGP concepts use kare.',
    hi: 'Enterprise को 2 ISPs से connect करना — redundancy और load distribution। BGP की classical use case। Challenges: outbound steering (कौन सा ISP primary?), inbound steering (बाकी AS आप तक कैसे आएं?), prefix announcements, filtering, loop prevention। यह project सारे BGP concepts use करे।',
    en: 'Enterprise connects to 2 ISPs for redundancy and load distribution. Classic BGP use case. Challenges: outbound steering (which ISP primary?), inbound steering (how other ASes reach you?), prefix announcements, filtering, loop prevention. This project uses all BGP concepts.',
  },
  steps: [
    {
      ms: 3000,
      label: H('Dual-homed design', 'Dual-homed design', 'Dual-homed design'),
      text: {
        beginner: {
          gu: 'Enterprise AS 65001. 2 border routers — R1 to ISP-A (AS 100), R2 to ISP-B (AS 200). Both eBGP sessions. R1 ↔ R2 iBGP session (internal). Full Internet routes thi enterprise ne local-pref thi decide karvanu hoy ke Internet kyar thi reach karvu.',
          hi: 'Enterprise AS 65001। 2 border routers — R1 to ISP-A (AS 100), R2 to ISP-B (AS 200)। Both eBGP sessions। R1 ↔ R2 iBGP session (internal)। Full Internet routes से enterprise को local-pref से decide करना — Internet कहां से reach करें।',
          en: 'Enterprise AS 65001. 2 border routers — R1 to ISP-A (AS 100), R2 to ISP-B (AS 200). Both eBGP sessions. R1 ↔ R2 iBGP session (internal). Full internet routes, enterprise uses local-pref to decide how to reach the internet.',
        },
        exam: {
          gu: 'Exam note: concept same, timing ane order yaad rakho.',
          hi: 'Exam note: concept same, timing और order याद रखें।',
          en: 'Exam note: same concept, remember timing and order.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'isp-a', x: 150, y: 100, type: 'cloud' as const, label: 'ISP-A · AS 100', accent: BEG },
          { id: 'isp-b', x: 750, y: 100, type: 'cloud' as const, label: 'ISP-B · AS 200', accent: WARN },
          { id: 'r1', x: 300, y: 250, type: 'router' as const, label: 'R1', accent: CCNA, pulse: true },
          { id: 'r2', x: 600, y: 250, type: 'router' as const, label: 'R2', accent: CCNA, pulse: true },
          { id: 'lan', x: 450, y: 380, type: 'cloud' as const, label: 'Enterprise · AS 65001', accent: CCNP },
        ],
        links: [
          { id: 'a', from: 'isp-a', to: 'r1', state: 'up', label: 'eBGP' },
          { id: 'b', from: 'isp-b', to: 'r2', state: 'up', label: 'eBGP' },
          { id: 'c', from: 'r1', to: 'r2', state: 'up', label: 'iBGP' },
          { id: 'd', from: 'r1', to: 'lan', state: 'up' },
          { id: 'e', from: 'r2', to: 'lan', state: 'up' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Outbound — local-pref', 'Outbound — local-pref', 'Outbound — local-pref'),
      text: {
        beginner: {
          gu: 'Enterprise na users Internet par kem jay — ISP-A thi ke ISP-B thi? Local-Pref nakki kare: R1 par (ISP-A) incoming routes ne LP 200 set karvani, R2 par (ISP-B) LP 100. Higher wins, etle traffic default ISP-A thi outbound jay. ISP-A fail thai to BGP automatically ISP-B via switch.',
          hi: 'Enterprise users Internet पर कैसे जाएं — ISP-A से या ISP-B से? Local-Pref तय करे: R1 पर (ISP-A) incoming routes को LP 200 set करें, R2 पर (ISP-B) LP 100। Higher wins, तो traffic default ISP-A से outbound जाए। ISP-A fail तो BGP automatically ISP-B पर switch।',
          en: 'Enterprise users go to internet via ISP-A or ISP-B? Local-Pref decides: on R1 (ISP-A) set LP 200 on incoming routes, on R2 (ISP-B) LP 100. Higher wins, so traffic defaults to ISP-A outbound. ISP-A fails, BGP auto-switches to ISP-B.',
        },
        exam: {
          gu: '`route-map ISP_A_IN`: `set local-preference 200`. Apply on R1 inbound from ISP-A. Shared via iBGP, etle R2 pan jue ISP-A ni routes LP 200 saathe. LP AS-wide chhe.',
          hi: '`route-map ISP_A_IN`: `set local-preference 200`। Apply on R1 inbound from ISP-A। Shared via iBGP, तो R2 भी देखे ISP-A की routes LP 200 के साथ। LP AS-wide है।',
          en: '`route-map ISP_A_IN`: `set local-preference 200`. Apply on R1 inbound from ISP-A. Shared via iBGP, so R2 also sees ISP-A routes with LP 200. LP is AS-wide.',
        },
      },
      scene: (t) => ({
        nodes: [
          { id: 'r1', x: 250, y: 150, type: 'router' as const, label: 'R1', sub: 'LP 200', accent: 'var(--nq-ok)', pulse: t > 0.3 },
          { id: 'r2', x: 600, y: 150, type: 'router' as const, label: 'R2', sub: 'LP 100', accent: WARN },
          { id: 'u', x: 450, y: 350, type: 'pc' as const, label: 'user', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'u', to: 'r1', state: 'up', flowing: t > 0.3 },
          { id: 'b', from: 'u', to: 'r2', state: 'up' },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Inbound — AS-path prepending', 'Inbound — AS-path prepending', 'Inbound — AS-path prepending'),
      text: {
        beginner: {
          gu: 'Return traffic — bijju AS tamara pase kem aave? ISP-A primary joiyee, ISP-B backup. ISP-A ne shorter AS-path advertise karo, ISP-B ne prepend karelu longer (65001 65001 65001). Other AS BGP best-path step 4 (AS-path length) par jue, prefer shorter (ISP-A thi). ISP-A fail thai to longer-prepended rasto via ISP-B active thai jay.',
          hi: 'Return traffic — बाकी AS आप तक कैसे आएं? ISP-A primary चाहिए, ISP-B backup। ISP-A को shorter AS-path advertise करें, ISP-B को prepend किया longer (65001 65001 65001)। Other AS BGP best-path step 4 (AS-path length) देखे, prefer shorter (ISP-A से)। ISP-A fail तो longer-prepended रास्ता via ISP-B active हो।',
          en: 'Return traffic — how do other ASes reach you? ISP-A primary, ISP-B backup. Advertise shorter AS-path to ISP-A, longer prepended (65001 65001 65001) to ISP-B. Other AS looks at BGP best-path step 4 (AS-path length), prefers shorter (via ISP-A). ISP-A fails, longer-prepended path via ISP-B activates.',
        },
        exam: {
          gu: '`route-map ISP_B_OUT`: `set as-path prepend 65001 65001`. Apply outbound to ISP-B. Note: aa bijji AS ne guarantee nathi — some operators MED ke local-pref thi override kari shake. Dual-ISP thi inbound steering vadhu tricky hoy chhe.',
          hi: '`route-map ISP_B_OUT`: `set as-path prepend 65001 65001`। Apply outbound to ISP-B। Note: यह बाकी AS की guarantee नहीं — कुछ operators MED या local-pref से override कर सकें। Dual-ISP में inbound steering ज़्यादा tricky।',
          en: '`route-map ISP_B_OUT`: `set as-path prepend 65001 65001`. Apply outbound to ISP-B. Note: not guaranteed from other ASes — some operators can override with MED or local-pref. Dual-ISP inbound steering is more tricky.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'o', x: 150, y: 200, type: 'cloud' as const, label: 'Internet', accent: CCNP },
          { id: 'a', x: 400, y: 100, type: 'router' as const, label: 'via ISP-A', sub: 'AS 65001', accent: 'var(--nq-ok)' },
          { id: 'b', x: 400, y: 320, type: 'router' as const, label: 'via ISP-B', sub: 'AS 65001 65001 65001', accent: 'var(--nq-text-mute)' },
          { id: 'e', x: 700, y: 200, type: 'cloud' as const, label: 'Enterprise', accent: BEG },
        ],
        links: [
          { id: 'a', from: 'o', to: 'a', state: 'up', flowing: true },
          { id: 'c', from: 'a', to: 'e', state: 'up', flowing: true },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('Prefix filtering ane security', 'Prefix filtering और security', 'Prefix filtering and security'),
      text: {
        beginner: {
          gu: 'Critical: ISP thi avvi Internet routes filter karvi (bogons, private IPs, your own prefixes — loops). Outbound: fakat tamara allocated prefixes advertise karo, bijjanu transit karvanu nathi. Prefix-list filter aa job kare. Authentication: MD5 password e BGP session par, AS-path max limit.',
          hi: 'Critical: ISP से आने वाली Internet routes filter करें (bogons, private IPs, your own prefixes — loops)। Outbound: केवल आपके allocated prefixes advertise करें, बाकी का transit न करें। Prefix-list filter यह job करे। Authentication: MD5 password BGP session पर, AS-path max limit।',
          en: 'Critical: filter internet routes coming from ISP (bogons, private IPs, your own prefixes — loops). Outbound: advertise only your allocated prefixes, do not transit others. Prefix-list filter does this. Authentication: MD5 password on BGP session, AS-path max limit.',
        },
        exam: {
          gu: '`ip prefix-list BOGON deny 0.0.0.0/8 le 32`, same denies for 10.0.0.0/8, 192.168.0.0/16, etc. `neighbor x.x.x.x prefix-list BOGON in`. `neighbor x.x.x.x maximum-prefix 500000 90 restart 5` — protection mate.',
          hi: '`ip prefix-list BOGON deny 0.0.0.0/8 le 32`, same denies for 10.0.0.0/8, 192.168.0.0/16, etc। `neighbor x.x.x.x prefix-list BOGON in`। `neighbor x.x.x.x maximum-prefix 500000 90 restart 5` — protection के लिए।',
          en: '`ip prefix-list BOGON deny 0.0.0.0/8 le 32`, same denies for 10.0.0.0/8, 192.168.0.0/16, etc. `neighbor x.x.x.x prefix-list BOGON in`. `neighbor x.x.x.x maximum-prefix 500000 90 restart 5` — for protection.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'r', x: 450, y: 200, type: 'router' as const, label: 'border router', sub: 'prefix-list + MD5', accent: 'var(--nq-ok)', pulse: true },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'Dual-ISP BGP: outbound Local-Pref thi (higher = better, iBGP-shared), inbound AS-path prepending thi (longer = less-preferred-by-others). Prefix filtering bogons aney own prefixes block kare, MD5 authentication session protect kare. Full Internet 7L routes manage karvanu hoy to dedicated border routers joievu padse.',
    hi: 'Dual-ISP BGP: outbound Local-Pref से (higher = better, iBGP-shared), inbound AS-path prepending से (longer = less-preferred-by-others)। Prefix filtering bogons और own prefixes block करे, MD5 authentication session protect करे। Full Internet 7L routes manage करने हों तो dedicated border routers चाहिए।',
    en: 'Dual-ISP BGP: outbound via Local-Pref (higher = better, iBGP-shared), inbound via AS-path prepending (longer = less-preferred-by-others). Prefix filtering blocks bogons and own prefixes, MD5 authentication protects session. Full internet 7L routes need dedicated border routers.',
  },
  check: {
    q: H(
      'Dual-ISP ma outbound traffic ne ISP-A primary tarike steer karva mate shu use karsho?',
      'Dual-ISP में outbound traffic को ISP-A primary की तरह steer करने के लिए क्या वापरेंगे?',
      'In dual-ISP, what steers outbound traffic to ISP-A as primary?',
    ),
    options: [
      H('Local-Pref (higher on ISP-A routes)', 'Local-Pref (higher on ISP-A routes)', 'Local-Pref (higher on ISP-A routes)'),
      H('AS-path prepending to ISP-B', 'AS-path prepending to ISP-B', 'AS-path prepending to ISP-B'),
      H('MED (lower to ISP-A)', 'MED (lower to ISP-A)', 'MED (lower to ISP-A)'),
    ],
    answer: 0,
    explain: H(
      'Outbound = tamara AS na users Internet par kem jay. Local-Pref aa decision kare — AS-wide, iBGP par share. Higher LP wins, etle ISP-A routes par LP 200, ISP-B par 100. AS-path prepending inbound ne influence kare (bijji AS tamara pase kem aave). MED ISP ne tell kare (same-AS multiple paths).',
      'Outbound = आपके AS के users Internet पर कैसे जाएं। Local-Pref यह decision करे — AS-wide, iBGP पर share। Higher LP wins, तो ISP-A routes पर LP 200, ISP-B पर 100। AS-path prepending inbound को influence करे (बाकी AS आप तक कैसे)। MED ISP को बताए (same-AS multiple paths)।',
      'Outbound = your AS users to internet. Local-Pref makes the decision — AS-wide, shared over iBGP. Higher LP wins, so LP 200 on ISP-A routes, 100 on ISP-B. AS-path prepending influences inbound (how other ASes reach you). MED tells one ISP (same-AS multiple paths).',
    ),
  },
}

/* ═══════════════════ p4l4 · ENCOR + ENARSI Simulator ═══════════════════ */

export const p4l4: LessonSpec = {
  why: {
    gu: 'Aa final lesson: badhu je shikhyu e ne combine karsho, mock exam settings ma. ENCOR 350-401 (120 minutes, ~100 questions) aney ENARSI 300-410 (90 minutes, ~75 questions) na topics cover thay. Time management, question strategy, aney "ketlak tame janon chhon" nu honest self-check.',
    hi: 'यह final lesson: सब कुछ जो सीखा उसे combine करेंगे, mock exam settings में। ENCOR 350-401 (120 minutes, ~100 questions) और ENARSI 300-410 (90 minutes, ~75 questions) के topics cover हों। Time management, question strategy, और "आप कितना जानते हैं" का honest self-check।',
    en: 'Final lesson: combine everything learned in a mock exam setting. ENCOR 350-401 (120 minutes, ~100 questions) and ENARSI 300-410 (90 minutes, ~75 questions) topics covered. Time management, question strategy, and an honest self-check on "how much you know".',
  },
  steps: [
    {
      ms: 3000,
      label: H('ENCOR 350-401 structure', 'ENCOR 350-401 structure', 'ENCOR 350-401 structure'),
      text: {
        beginner: {
          gu: 'Topics: Architecture (15%), Virtualization (10%), Infrastructure (30%), Network Assurance (10%), Security (20%), Automation (15%). Core concepts: SD-Access, VXLAN, wireless, multicast, QoS, SD-WAN, model-driven telemetry. 120 minutes, mix of multiple choice, drag-drop, simlets.',
          hi: 'Topics: Architecture (15%), Virtualization (10%), Infrastructure (30%), Network Assurance (10%), Security (20%), Automation (15%)। Core concepts: SD-Access, VXLAN, wireless, multicast, QoS, SD-WAN, model-driven telemetry। 120 minutes, mix of multiple choice, drag-drop, simlets।',
          en: 'Topics: Architecture (15%), Virtualization (10%), Infrastructure (30%), Network Assurance (10%), Security (20%), Automation (15%). Core concepts: SD-Access, VXLAN, wireless, multicast, QoS, SD-WAN, model-driven telemetry. 120 minutes, mix of multiple choice, drag-drop, simlets.',
        },
        exam: {
          gu: 'Exam note: concept same, timing ane order yaad rakho.',
          hi: 'Exam note: concept same, timing और order याद रखें।',
          en: 'Exam note: same concept, remember timing and order.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'exam', x: 450, y: 200, type: 'server' as const, label: 'ENCOR 350-401', sub: '120 min · ~100 Q', accent: CCNP, pulse: true },
        ],
      }),
    },
    {
      ms: 3000,
      label: H('ENARSI 300-410 structure', 'ENARSI 300-410 structure', 'ENARSI 300-410 structure'),
      text: {
        beginner: {
          gu: 'Topics: Layer 3 Technologies (35%), VPN Technologies (20%), Infrastructure Security (20%), Infrastructure Services (25%). Deep OSPF, EIGRP, BGP, redistribution, MPLS, DMVPN, VRF, IP SLA. 90 minutes, ~75 questions, more depth than ENCOR in routing.',
          hi: 'Topics: Layer 3 Technologies (35%), VPN Technologies (20%), Infrastructure Security (20%), Infrastructure Services (25%)। Deep OSPF, EIGRP, BGP, redistribution, MPLS, DMVPN, VRF, IP SLA। 90 minutes, ~75 questions, more depth than ENCOR in routing।',
          en: 'Topics: Layer 3 Technologies (35%), VPN Technologies (20%), Infrastructure Security (20%), Infrastructure Services (25%). Deep OSPF, EIGRP, BGP, redistribution, MPLS, DMVPN, VRF, IP SLA. 90 minutes, ~75 questions, more depth than ENCOR in routing.',
        },
        exam: {
          gu: 'Exam note: concept same, timing ane order yaad rakho.',
          hi: 'Exam note: concept same, timing और order याद रखें।',
          en: 'Exam note: same concept, remember timing and order.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'exam', x: 450, y: 200, type: 'server' as const, label: 'ENARSI 300-410', sub: '90 min · ~75 Q', accent: CCNP, pulse: true },
        ],
      }),
    },
    {
      ms: 3200,
      label: H('Exam strategy', 'Exam strategy', 'Exam strategy'),
      text: {
        beginner: {
          gu: '1) Confident questions pehla solve karo, difficult ones mark for review. 2) Elimination strategy: wrong answers eliminate karva sauthi fast. 3) Simlet 10-15 minutes thi vadhu na aape — moov on. 4) Last 10 minutes marked questions review. 5) Guess karo rather than blank — negative marking nathi.',
          hi: '1) Confident questions पहले solve करें, difficult ones mark for review। 2) Elimination strategy: wrong answers eliminate करना सबसे fast। 3) Simlet 10-15 minutes से ज़्यादा न दें — move on। 4) Last 10 minutes marked questions review। 5) Guess करें rather than blank — negative marking नहीं।',
          en: '1) Solve confident questions first, mark difficult ones for review. 2) Elimination strategy: eliminating wrong answers is fastest. 3) Don’t spend more than 10-15 minutes on a simlet — move on. 4) Last 10 minutes to review marked questions. 5) Guess rather than leave blank — no negative marking.',
        },
        exam: {
          gu: 'Exam note: concept same, timing ane order yaad rakho.',
          hi: 'Exam note: concept same, timing और order याद रखें।',
          en: 'Exam note: same concept, remember timing and order.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 's', x: 450, y: 200, type: 'server' as const, label: 'Time + Strategy', accent: 'var(--nq-ok)', pulse: true },
        ],
      }),
    },
    {
      ms: 2800,
      label: H('Hands-on labs — simulator se real', 'Hands-on labs — simulator से real', 'Hands-on labs — simulator to real'),
      text: {
        beginner: {
          gu: 'Theory thi 70% pass thai shakay, pan real-world ane simlet mate hands-on jarur. Cisco Modeling Labs (CML), EVE-NG, GNS3, Packet Tracer — darek nu scope alag. Minimum 50 hours hands-on recommended. OSPF stub areas, BGP attributes, redistribution loops — type karo ane see kem thay.',
          hi: 'Theory से 70% pass हो सके, पर real-world और simlet के लिए hands-on ज़रूरी। Cisco Modeling Labs (CML), EVE-NG, GNS3, Packet Tracer — हर एक का scope अलग। Minimum 50 hours hands-on recommended। OSPF stub areas, BGP attributes, redistribution loops — type करें और देखें कैसे।',
          en: 'Theory can get 70% pass, but real-world and simlets need hands-on. Cisco Modeling Labs (CML), EVE-NG, GNS3, Packet Tracer — each has its scope. Minimum 50 hours hands-on recommended. OSPF stub areas, BGP attributes, redistribution loops — type and watch what happens.',
        },
        exam: {
          gu: 'Exam note: concept same, timing ane order yaad rakho.',
          hi: 'Exam note: concept same, timing और order याद रखें।',
          en: 'Exam note: same concept, remember timing and order.',
        },
      },
      scene: () => ({
        nodes: [
          { id: 'l', x: 450, y: 200, type: 'server' as const, label: 'Labs — hands-on', accent: CCNP, pulse: true },
        ],
      }),
    },
  ],
  takeaway: {
    gu: 'CCNP Enterprise: ENCOR (breadth — architecture, virtualization, infrastructure, security, automation) + ENARSI (depth — routing). Mock tests thi weak areas identify karo, hands-on thi commands memorize ane troubleshooting intuition develop karo. Pass rate strong — pan preparation 300+ hours. Good luck!',
    hi: 'CCNP Enterprise: ENCOR (breadth — architecture, virtualization, infrastructure, security, automation) + ENARSI (depth — routing)। Mock tests से weak areas identify, hands-on से commands memorize और troubleshooting intuition develop। Pass rate strong — पर preparation 300+ hours। Good luck!',
    en: 'CCNP Enterprise: ENCOR (breadth — architecture, virtualization, infrastructure, security, automation) + ENARSI (depth — routing). Mock tests identify weak areas, hands-on memorises commands and develops troubleshooting intuition. Pass rate strong — but 300+ hours of preparation. Good luck!',
  },
  check: {
    q: H(
      'Exam ma ek simlet par tamane 20 minutes thai gaya ne solve nathi thatu. Shu karsho?',
      'Exam में एक simlet पर 20 minutes हो गए पर solve नहीं हो रहा। क्या करेंगे?',
      '20 minutes stuck on one simlet in the exam. What do you do?',
    ),
    options: [
      H('Mark for review, next question par move karo', 'Mark for review, next question पर move करें', 'Mark for review, move to next question'),
      H('Puru simlet complete karva sudhi reheva', 'पूरा simlet complete करने तक रहें', 'Stay until you complete the simlet'),
      H('Random answer apiye j karo', 'Random answer ही कर दें', 'Just pick a random answer'),
    ],
    answer: 0,
    explain: H(
      'One simlet = 1-3 questions worth. Time budget: 120 min / 100 questions = 1.2 min/question average. 20 minutes ek par — 17 questions nu time lost. Mark for review, next moves karo. Last ma available time saathe return, agar baki badhi questions done hoy. Risk management nu classic case.',
      'One simlet = 1-3 questions worth। Time budget: 120 min / 100 questions = 1.2 min/question average। 20 minutes एक पर — 17 questions का time lost। Mark for review, next move करें। Last में available time के साथ return, अगर बाकी सब done हो। Risk management का classic case।',
      'One simlet = 1-3 questions worth. Time budget: 120 min / 100 questions = 1.2 min/question average. 20 minutes on one = 17 questions of time lost. Mark for review, move to next. Return at the end with available time, if the rest is done. Classic risk management.',
    ),
  },
}
