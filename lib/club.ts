/**
 * Mock data layer for The Backchannel.
 *
 * Shapes mirror the eventual Supabase tables (episodes / votes / participants)
 * so swapping this file for real queries later is a drop-in change.
 *
 * TO ADD A TOPIC: add an Episode to EPISODES below. It ships at /e/<slug>
 * on the next push. The root page always shows EPISODES[0].
 */

export type CampKey = "a" | "b";

export interface Camp {
  key: CampKey;
  name: string;
  /** Which riso ink this camp prints in. */
  color: "red" | "blue";
  /** Gut-reaction count seeded from "the room so far". */
  votes: number;
  seatsTotal: number;
  seatsClaimed: number;
}

export interface WallQuote {
  id: string;
  text: string;
  alias: string;
  camp: CampKey;
  resonates: number;
  yours?: boolean;
}

/** Visual skin for an episode page. */
export type ThemeName = "broadsheet" | "gloss" | "terminal" | "ledger";

export interface Episode {
  id: string;
  /** URL slug: the episode lives at /e/<slug> */
  slug: string;
  number: number;
  hook: string;
  kicker: string;
  /** Masthead dateline, e.g. "Season One · Week 3 of 4". */
  dateline?: string;
  /** Masthead volume label; defaults to "Vol. I". */
  volume?: string;
  /** Which design skin to render. Defaults to "broadsheet". */
  theme?: ThemeName;
  camps: Record<CampKey, Camp>;
  /** ISO date the ballot closes — drives the countdown. */
  closesAt: string;
  /** Where "claim your seat" ultimately points (the conversational study). */
  conversationUrl: string;
  status: "live" | "revealed" | "sealed";
  /** For revealed episodes: how the room moved, for the archive. */
  reveal?: { finalSplit: [number, number]; movedPts: number; movedToward: string };
  /** Seeded quote wall for this topic. */
  wall?: WallQuote[];
  /** Topic-flavored ticker lines; falls back to TICKER_ITEMS. */
  ticker?: string[];
  /** Topic-flavored pseudonym generator lists. */
  aliasFlavor?: { adjectives: string[]; nouns: string[] };
}

/** Next Friday 18:00 local — keeps the demo countdown alive forever. */
export function nextFriday18(): Date {
  const now = new Date();
  const d = new Date(now);
  const day = d.getDay(); // 0 Sun .. 5 Fri
  let add = (5 - day + 7) % 7;
  if (add === 0 && d.getHours() >= 18) add = 7;
  d.setDate(d.getDate() + add);
  d.setHours(18, 0, 0, 0);
  return d;
}

const DATING_WALL: WallQuote[] = [
  {
    id: "q1",
    text: "My grandmother met three people in her whole life. She chose well once. That was enough.",
    alias: "an old soul",
    camp: "a",
    resonates: 89,
  },
  {
    id: "q2",
    text: "We treat strangers like inventory and wonder why nobody feels rare.",
    alias: "a quiet contrarian",
    camp: "a",
    resonates: 67,
  },
  {
    id: "q3",
    text: "The apps didn’t ruin love. They just showed us the queue.",
    alias: "a patient cynic",
    camp: "b",
    resonates: 54,
  },
  {
    id: "q4",
    text: "I don’t miss the person. I miss being the version of me that texted first.",
    alias: "a recovering optimist",
    camp: "b",
    resonates: 41,
  },
];

const AI_WALL: WallQuote[] = [
  {
    id: "ai1",
    text: "My junior year taught me everything my senior title now gets paid for. Cut the rung and the ladder falls.",
    alias: "a well-read witness",
    camp: "b",
    resonates: 73,
  },
  {
    id: "ai2",
    text: "Every tool that scared us made more of us. This one just types faster.",
    alias: "an unrepentant realist",
    camp: "a",
    resonates: 58,
  },
  {
    id: "ai3",
    text: "We didn’t automate the work. We automated the apprenticeship.",
    alias: "a midnight archivist",
    camp: "b",
    resonates: 91,
  },
];

const GLOSS_WALL: WallQuote[] = [
  {
    id: "g1",
    text: "The ritual isn’t the products. It’s ten minutes a day where nobody needs me.",
    alias: "the buttery loyalist",
    camp: "a",
    resonates: 94,
  },
  {
    id: "g2",
    text: "Half these serums are moisturizer in a trench coat.",
    alias: "the matte skeptic",
    camp: "b",
    resonates: 87,
  },
  {
    id: "g3",
    text: "You don’t need 12 steps. You need water, SPF, and to log off.",
    alias: "the barefaced realist",
    camp: "b",
    resonates: 71,
  },
  {
    id: "g4",
    text: "My shelf is a shrine to the person I’m becoming. Mind your business.",
    alias: "the glazed maximalist",
    camp: "a",
    resonates: 63,
  },
];

const MONEY_WALL: WallQuote[] = [
  {
    id: "m1",
    text: "I did everything right. Degree, savings, no debt. The house still costs eleven of me.",
    alias: "the recession-scarred saver",
    camp: "a",
    resonates: 96,
  },
  {
    id: "m2",
    text: "My rent went up 40% in three years. My latte budget is not the variable.",
    alias: "the subletting realist",
    camp: "a",
    resonates: 84,
  },
  {
    id: "m3",
    text: "Nobody wants to hear it, but my $9 daily little treat is $3,300 a year.",
    alias: "the compound optimizer",
    camp: "b",
    resonates: 58,
  },
  {
    id: "m4",
    text: "It was never about the latte. It’s about the mindset the latte represents.",
    alias: "the bullish budgeter",
    camp: "b",
    resonates: 47,
  },
];

/**
 * All live topics. EPISODES[0] is the front page; every entry also gets its
 * own page at /e/<slug>.
 */
export const EPISODES: Episode[] = [
  {
    id: "ep-003",
    slug: "dating-apps",
    number: 3,
    kicker: "This week’s hot take",
    dateline: "Season One · Week 3 of 4",
    hook: "Dating apps have made us worse at love.",
    camps: {
      a: { key: "a", name: "Blame the apps", color: "red", votes: 47, seatsTotal: 12, seatsClaimed: 8 },
      b: { key: "b", name: "Blame ourselves", color: "blue", votes: 33, seatsTotal: 12, seatsClaimed: 5 },
    },
    closesAt: nextFriday18().toISOString(),
    conversationUrl: "#claim",
    status: "live",
    wall: DATING_WALL,
  },
  {
    id: "ep-005",
    slug: "ai-coworkers",
    number: 5,
    kicker: "The special edition hot take",
    dateline: "Special Edition · The Work Papers",
    hook: "AI coworkers will make junior jobs obsolete.",
    camps: {
      a: { key: "a", name: "Adapt or die", color: "red", votes: 29, seatsTotal: 12, seatsClaimed: 3 },
      b: { key: "b", name: "Protect the humans", color: "blue", votes: 41, seatsTotal: 12, seatsClaimed: 6 },
    },
    closesAt: nextFriday18().toISOString(),
    conversationUrl: "#claim",
    status: "live",
    wall: AI_WALL,
  },
  {
    id: "ep-006",
    slug: "ten-step-scam",
    number: 6,
    theme: "gloss",
    kicker: "the gloss desk hot take",
    dateline: "The Gloss Desk · beauty week",
    volume: "Vol. II",
    hook: "The 10-step skincare routine is a scam.",
    camps: {
      a: { key: "a", name: "It’s a ritual", color: "red", votes: 44, seatsTotal: 12, seatsClaimed: 7 },
      b: { key: "b", name: "It’s a rip-off", color: "blue", votes: 41, seatsTotal: 12, seatsClaimed: 4 },
    },
    closesAt: nextFriday18().toISOString(),
    conversationUrl: "#claim",
    status: "live",
    wall: GLOSS_WALL,
    ticker: [
      "the gloss desk is open 💋",
      "112 girlies have taken sides",
      "“moisturizer in a trench coat” · overheard in the booths",
      "the reveal drops friday",
      "5 spots left in camp ritual",
      "no surveys ✦ only arguments",
    ],
    aliasFlavor: {
      adjectives: [
        "dewy", "glazed", "matte", "buttery", "barefaced", "cherry-coded",
        "overexfoliated", "fragrance-free", "double-cleansed", "spf-pilled",
        "lit-from-within", "shelfie-proud",
      ],
      nouns: [
        "maximalist", "minimalist", "skeptic", "loyalist", "alchemist",
        "evangelist", "realist", "hoarder", "convert", "purist", "girlie",
        "theorist",
      ],
    },
  },
  {
    id: "ep-007",
    slug: "latte-factor",
    number: 7,
    theme: "ledger",
    kicker: "the money desk hot take",
    dateline: "The Money Desk · millennial edition",
    volume: "Vol. III",
    hook: "Skipping lattes won’t buy you a house.",
    camps: {
      a: { key: "a", name: "Blame the economy", color: "red", votes: 57, seatsTotal: 12, seatsClaimed: 8 },
      b: { key: "b", name: "Blame the lattes", color: "blue", votes: 32, seatsTotal: 12, seatsClaimed: 4 },
    },
    closesAt: nextFriday18().toISOString(),
    conversationUrl: "#claim",
    status: "live",
    wall: MONEY_WALL,
    ticker: [
      "entry № 007: the latte question",
      "debit: rent, +40% in 3 yrs",
      "credit: one $9 little treat",
      "the room moved 9 pts since monday",
      "the ledger closes friday 6 p.m.",
      "no surveys. only arguments.",
      "89 accounts open this week",
    ],
    aliasFlavor: {
      adjectives: [
        "leveraged", "diversified", "overdrafted", "frugal", "bearish",
        "bullish", "401k-pilled", "house-poor", "subletting", "compound",
        "recession-scarred", "cash-only",
      ],
      nouns: [
        "skeptic", "optimizer", "daytrader", "tenant", "saver", "spender",
        "auditor", "forecaster", "hustler", "budgeter", "realist", "landlord",
      ],
    },
  },
];

export const CURRENT_EPISODE: Episode = EPISODES[0];

export function getEpisode(slug: string): Episode | undefined {
  return EPISODES.find((e) => e.slug === slug);
}

export const ARCHIVE: Episode[] = [
  {
    id: "ep-001",
    slug: "remote-work",
    number: 1,
    kicker: "",
    hook: "Remote work is a lie we tell ourselves.",
    camps: {
      a: { key: "a", name: "It’s a lie", color: "red", votes: 58, seatsTotal: 12, seatsClaimed: 12 },
      b: { key: "b", name: "It’s freedom", color: "blue", votes: 42, seatsTotal: 12, seatsClaimed: 12 },
    },
    closesAt: "2026-06-19T18:00:00Z",
    conversationUrl: "#",
    status: "revealed",
    reveal: { finalSplit: [46, 54], movedPts: 12, movedToward: "It’s freedom" },
  },
  {
    id: "ep-002",
    slug: "group-chat",
    number: 2,
    kicker: "",
    hook: "Your group chat knows you better than your therapist.",
    camps: {
      a: { key: "a", name: "Obviously", color: "red", votes: 71, seatsTotal: 12, seatsClaimed: 12 },
      b: { key: "b", name: "That’s the problem", color: "blue", votes: 29, seatsTotal: 12, seatsClaimed: 11 },
    },
    closesAt: "2026-06-26T18:00:00Z",
    conversationUrl: "#",
    status: "revealed",
    reveal: { finalSplit: [64, 36], movedPts: 7, movedToward: "That’s the problem" },
  },
  {
    id: "ep-004",
    slug: "sealed",
    number: 4,
    kicker: "",
    hook: "Sealed until Monday, 9 a.m.",
    camps: {
      a: { key: "a", name: "?", color: "red", votes: 0, seatsTotal: 12, seatsClaimed: 0 },
      b: { key: "b", name: "?", color: "blue", votes: 0, seatsTotal: 12, seatsClaimed: 0 },
    },
    closesAt: "2026-07-17T18:00:00Z",
    conversationUrl: "#",
    status: "sealed",
  },
];

/** Kept for compatibility: the default wall (front-page topic). */
export const WALL: WallQuote[] = DATING_WALL;

export const ADJECTIVES = [
  "quiet", "patient", "recovering", "hopeless", "reluctant", "midnight",
  "polite", "stubborn", "tender", "suspicious", "caffeinated", "analog",
  "well-read", "unrepentant", "part-time", "born-again",
];

export const NOUNS = [
  "contrarian", "romantic", "optimist", "cynic", "archivist", "heretic",
  "diplomat", "moderate", "witness", "idealist", "realist", "correspondent",
  "skeptic", "believer", "insider", "understudy",
];

export function makeAlias(flavor?: { adjectives: string[]; nouns: string[] }): string {
  const adjectives = flavor?.adjectives ?? ADJECTIVES;
  const nouns = flavor?.nouns ?? NOUNS;
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  return `the ${a} ${n}`;
}

export const TICKER_ITEMS = [
  "87 voices this week",
  "the room moved 9 pts since Monday",
  "4 seats left in Camp Blame the Apps",
  "Friday 6 p.m.: the reveal",
  "“we treat strangers like inventory…” · overheard in the booths",
  "no surveys. only arguments.",
  "your gut reaction takes 3 seconds",
];
