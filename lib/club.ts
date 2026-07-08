/**
 * Mock data layer for The Backchannel.
 *
 * Shapes mirror the eventual Supabase tables (episodes / votes / participants)
 * so swapping this file for real queries later is a drop-in change.
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

export interface Episode {
  id: string;
  number: number;
  hook: string;
  kicker: string;
  camps: Record<CampKey, Camp>;
  /** ISO date the ballot closes — drives the countdown. */
  closesAt: string;
  /** Where "claim your seat" ultimately points (the conversational study). */
  conversationUrl: string;
  status: "live" | "revealed" | "sealed";
  /** For revealed episodes: how the room moved, for the archive. */
  reveal?: { finalSplit: [number, number]; movedPts: number; movedToward: string };
}

export interface WallQuote {
  id: string;
  text: string;
  alias: string;
  camp: CampKey;
  resonates: number;
  yours?: boolean;
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

export const CURRENT_EPISODE: Episode = {
  id: "ep-003",
  number: 3,
  kicker: "This week’s hot take",
  hook: "Dating apps have made us worse at love.",
  camps: {
    a: { key: "a", name: "Blame the apps", color: "red", votes: 47, seatsTotal: 12, seatsClaimed: 8 },
    b: { key: "b", name: "Blame ourselves", color: "blue", votes: 33, seatsTotal: 12, seatsClaimed: 5 },
  },
  closesAt: nextFriday18().toISOString(),
  conversationUrl: "#claim",
  status: "live",
};

export const ARCHIVE: Episode[] = [
  {
    id: "ep-001",
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

export const WALL: WallQuote[] = [
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

const ADJECTIVES = [
  "quiet", "patient", "recovering", "hopeless", "reluctant", "midnight",
  "polite", "stubborn", "tender", "suspicious", "caffeinated", "analog",
  "well-read", "unrepentant", "part-time", "born-again",
];

const NOUNS = [
  "contrarian", "romantic", "optimist", "cynic", "archivist", "heretic",
  "diplomat", "moderate", "witness", "idealist", "realist", "correspondent",
  "skeptic", "believer", "insider", "understudy",
];

export function makeAlias(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
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
