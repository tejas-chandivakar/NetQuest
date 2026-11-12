import JourneyPlayer, { type JourneySpec } from '../components/JourneyPlayer'

/* ─────────────── b4l1 · what happens when you type google.com ─────────────── */

const googleJourney: JourneySpec = {
  intro: {
    gu: 'તમે google.com લખીને Enter દબાવ્યું. હવે દરેક પગલે નક્કી કરો કે પછી શું થવું જોઈએ.',
    en: 'You have typed google.com and pressed Enter. At each step, decide what has to happen next.',
  },
  done: {
    gu: 'પાનું આવી ગયું — અને તમે આખો રસ્તો જાતે કાઢ્યો.',
    en: 'The page is up — and you worked out the whole route yourself.',
  },
  beats: [
    {
      ask: { gu: 'લેપટોપ હમણાં જ WiFi સાથે જોડાયું. સૌથી પહેલાં એને શું જોઈએ?', en: 'The laptop has just joined the WiFi. What does it need first of all?' },
      options: [
        { gu: 'પોતાનું સરનામું', en: 'An address of its own' },
        { gu: 'Google નું સરનામું', en: 'Google’s address' },
        { gu: 'Router નું MAC', en: 'The router’s MAC' },
      ],
      answer: 0,
      wrong: { gu: 'પોતાનું સરનામું જ ન હોય તો જવાબ પાછો ક્યાં આવશે? પહેલાં એ.', en: 'Without an address of its own, where would any answer come back to? That comes first.' },
      did: { gu: 'DHCP — પોતાનું સરનામું માગ્યું', en: 'DHCP — asked for its own address' },
      detail: { gu: '192.168.1.10, gateway .1, DNS 8.8.8.8', en: '192.168.1.10, gateway .1, DNS 8.8.8.8' },
    },
    {
      ask: { gu: 'સરનામું મળી ગયું. હવે "google.com" નું શું કરવું?', en: 'It has an address. What now has to happen to "google.com"?' },
      options: [
        { gu: 'સીધું એ નામે packet મોકલો', en: 'Send a packet straight to that name' },
        { gu: 'એનું IP શોધો', en: 'Find out its IP' },
      ],
      answer: 1,
      wrong: { gu: 'નેટવર્ક નામ સમજતું જ નથી — એને આંકડો જોઈએ.', en: 'The network does not understand names at all. It needs a number.' },
      did: { gu: 'DNS — નામનું IP મળ્યું', en: 'DNS — turned the name into an address' },
      detail: { gu: 'google.com → 142.250.183.78', en: 'google.com → 142.250.183.78' },
    },
    {
      ask: { gu: '142.250.183.78 બીજા નેટવર્કમાં છે. Packet કોને આપવું?', en: '142.250.183.78 is on another network. Who should the packet be handed to?' },
      options: [
        { gu: 'Gateway ને — પણ એનું MAC પહેલાં શોધવું પડે', en: 'The gateway — but its MAC has to be found first' },
        { gu: 'સીધું Google ને', en: 'Straight to Google' },
      ],
      answer: 0,
      wrong: { gu: 'બીજા નેટવર્કમાં સીધું પહોંચાય નહીં. પહેલાં દરવાજા સુધી.', en: 'You cannot reach another network directly. First get to the door.' },
      did: { gu: 'ARP — gateway નું MAC મળ્યું', en: 'ARP — found the gateway’s MAC' },
      detail: { gu: '192.168.1.1 is at 00c1.bbbb.0001', en: '192.168.1.1 is at 00c1.bbbb.0001' },
    },
    {
      ask: { gu: 'રસ્તો ખુલ્લો છે. પાનું માગતાં પહેલાં શું?', en: 'The path is open. What has to happen before asking for the page?' },
      options: [
        { gu: 'સીધી માગણી મોકલો', en: 'Just send the request' },
        { gu: 'પહેલાં જોડાણ બનાવો', en: 'Open a connection first' },
      ],
      answer: 1,
      wrong: { gu: 'Website માટે TCP વપરાય — અને TCP પહેલાં હાથ મિલાવે છે.', en: 'Websites use TCP, and TCP shakes hands before anything else.' },
      did: { gu: 'TCP — ત્રણ સંદેશનું જોડાણ', en: 'TCP — the three-message handshake' },
      detail: { gu: 'SYN → SYN-ACK → ACK, port 443', en: 'SYN → SYN-ACK → ACK, to port 443' },
    },
    {
      ask: { gu: 'જોડાણ તૈયાર. હવે?', en: 'The connection is up. Now what?' },
      options: [
        { gu: 'પાનું માગો', en: 'Ask for the page' },
        { gu: 'ફરી DNS પૂછો', en: 'Ask DNS again' },
      ],
      answer: 0,
      did: { gu: 'HTTP — પાનું માગ્યું', en: 'HTTP — asked for the page' },
      detail: { gu: 'GET /  → 200 OK', en: 'GET /  → 200 OK' },
    },
  ],
}

export const B4L1Journey = () => <JourneyPlayer spec={googleJourney} />

/* ─────────────────────────── b4l2 · DNS lookup ─────────────────────────── */

const dnsJourney: JourneySpec = {
  intro: {
    gu: 'કોઈએ shop.example.com લખ્યું અને એ નામ પહેલાં ક્યારેય પુછાયું નથી. જવાબ ક્યાંથી આવશે?',
    en: 'Someone typed shop.example.com and that name has never been looked up before. Where will the answer come from?',
  },
  done: {
    gu: 'સરનામું મળી ગયું — અને હવે તે થોડા સમય માટે યાદ પણ રહેશે.',
    en: 'The address is found — and now it will be remembered for a while.',
  },
  beats: [
    {
      ask: { gu: 'સૌથી પહેલાં ક્યાં જોવું?', en: 'Where should it look first?' },
      options: [
        { gu: 'પોતાની જ નોંધમાં', en: 'In its own notes' },
        { gu: 'સીધું root server ને', en: 'Straight to a root server' },
      ],
      answer: 0,
      wrong: { gu: 'પૂછવા નીકળતાં પહેલાં પોતાની cache જોવી — એ સૌથી સસ્તું.', en: 'Before asking anyone, check your own cache. It is the cheapest answer there is.' },
      did: { gu: 'Cache જોઈ — ખાલી હતી', en: 'Checked the cache — empty' },
    },
    {
      ask: { gu: 'Cache ખાલી છે. હવે કોને પૂછવું?', en: 'The cache is empty. Who gets asked now?' },
      options: [
        { gu: 'Resolver ને — જે બાકીનું કામ કરશે', en: 'The resolver — it will do the rest of the chasing' },
        { gu: 'Google ને', en: 'Google' },
      ],
      answer: 0,
      did: { gu: 'Resolver ને પૂછ્યું', en: 'Asked the resolver' },
      detail: { gu: 'UDP 53 પર', en: 'over UDP 53' },
    },
    {
      ask: { gu: 'Resolver પણ નથી જાણતું. એ સૌથી પહેલાં કોને પૂછે?', en: 'The resolver does not know either. Who does it ask first?' },
      options: [
        { gu: 'Root — જે કહેશે .com કોણ સંભાળે છે', en: 'Root — which says who handles .com' },
        { gu: 'example.com ને સીધું', en: 'example.com directly' },
      ],
      answer: 0,
      wrong: { gu: 'example.com ક્યાં છે એ જ ખબર નથી. ઉપરથી નીચે ઊતરવું પડે.', en: 'It does not yet know where example.com lives. You have to come down from the top.' },
      did: { gu: 'Root ને પૂછ્યું', en: 'Asked a root server' },
      detail: { gu: '.com આ servers સંભાળે છે', en: '.com is handled by these servers' },
    },
    {
      ask: { gu: '.com કોણ સંભાળે છે એ ખબર પડી. હવે?', en: 'It knows who handles .com. Now?' },
      options: [
        { gu: '.com ને પૂછો કે example.com કોનું', en: 'Ask .com who owns example.com' },
        { gu: 'ફરી root ને પૂછો', en: 'Ask root again' },
      ],
      answer: 0,
      did: { gu: '.com ને પૂછ્યું', en: 'Asked the .com servers' },
      detail: { gu: 'example.com ના name servers મળ્યા', en: 'got example.com’s name servers' },
    },
    {
      ask: { gu: 'છેલ્લું પગલું?', en: 'The last step?' },
      options: [
        { gu: 'example.com ને પૂછો — એ જ ખરો માલિક', en: 'Ask example.com itself — it is the actual owner' },
        { gu: 'જવાબ અનુમાનથી બનાવો', en: 'Guess the answer' },
      ],
      answer: 0,
      did: { gu: 'Authoritative server પાસેથી જવાબ', en: 'Got the answer from the authoritative server' },
      detail: { gu: 'shop.example.com → 203.0.113.40, TTL 300', en: 'shop.example.com → 203.0.113.40, TTL 300' },
    },
  ],
}

export const B4L2Journey = () => <JourneyPlayer spec={dnsJourney} />

/* ─────────────────────────── b4l3 · DHCP DORA ─────────────────────────── */

const dhcpJourney: JourneySpec = {
  intro: {
    gu: 'એક નવું મશીન ચાલુ થયું. એની પાસે કશું જ નથી — સરનામું નહીં, અને કોને પૂછવું એ પણ ખબર નહીં.',
    en: 'A new machine has just booted. It has nothing — no address, and no idea who to ask.',
  },
  done: {
    gu: 'ચાર સંદેશ, બે સેકન્ડ — અને મશીન નેટવર્ક પર આવી ગયું.',
    en: 'Four messages, two seconds — and the machine is on the network.',
  },
  beats: [
    {
      ask: { gu: 'કોઈનું સરનામું ખબર નથી. સંદેશ કોને મોકલવો?', en: 'It knows nobody’s address. Who does it send to?' },
      options: [
        { gu: 'બધાને — broadcast', en: 'Everyone — a broadcast' },
        { gu: 'Router ને', en: 'The router' },
      ],
      answer: 0,
      wrong: { gu: 'Router નું સરનામું પણ ખબર નથી. એકમાત્ર રસ્તો બધાને સંભળાવવાનો.', en: 'It does not know the router’s address either. The only option is to shout to everyone.' },
      did: { gu: 'D — Discover, બધાને', en: 'D — Discover, to everyone' },
      detail: { gu: 'from 0.0.0.0 to 255.255.255.255', en: 'from 0.0.0.0 to 255.255.255.255' },
    },
    {
      ask: { gu: 'Server એ બૂમ સાંભળી. એ શું કરે?', en: 'The server heard the shout. What does it do?' },
      options: [
        { gu: 'એક ખાલી સરનામું ઓફર કરે', en: 'Offers a free address' },
        { gu: 'સીધું સરનામું આપી દે', en: 'Just assigns the address' },
      ],
      answer: 0,
      wrong: { gu: 'હજી આપ્યું નથી — ઓફર કર્યું છે. બીજા servers પણ ઓફર કરી શકે.', en: 'It has not given it yet, only offered. Other servers may be offering too.' },
      did: { gu: 'O — Offer', en: 'O — Offer' },
      detail: { gu: '192.168.1.50 લો, gateway .1', en: 'take 192.168.1.50, gateway .1' },
    },
    {
      ask: { gu: 'ઓફર ગમી. મશીન શું કરે — અને કોને કહે?', en: 'It likes the offer. What does it do, and who does it tell?' },
      options: [
        { gu: 'બધાને કહે કે એ લઈ રહ્યું છે', en: 'Tells everyone that it is taking it' },
        { gu: 'ચૂપચાપ વાપરવા લાગે', en: 'Quietly starts using it' },
      ],
      answer: 0,
      wrong: { gu: 'બીજા servers એ પણ ઓફર કરી હશે — એમને ખબર પડવી જોઈએ કે એ હવે મુક્ત છે.', en: 'Other servers may have offered too, and they need to know their offer is free again.' },
      did: { gu: 'R — Request, ફરી બધાને', en: 'R — Request, broadcast again' },
    },
    {
      ask: { gu: 'છેલ્લો સંદેશ?', en: 'The last message?' },
      options: [
        { gu: 'Server મંજૂરી આપે, મુદત સાથે', en: 'The server acknowledges, with a lease' },
        { gu: 'કશું નહીં, કામ પૂરું', en: 'Nothing more, it is done' },
      ],
      answer: 0,
      did: { gu: 'A — Acknowledge', en: 'A — Acknowledge' },
      detail: { gu: 'મુદત 24 કલાક, અડધે renew થશે', en: '24-hour lease, renews halfway' },
    },
  ],
}

export const B4L3Journey = () => <JourneyPlayer spec={dhcpJourney} />
