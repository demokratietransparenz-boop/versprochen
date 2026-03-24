const BASE_URL = "https://www.abgeordnetenwatch.de/api/v2";
const RATE_LIMIT_MS = 1000; // 60 req/min = ~1 req/sec

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<unknown> {
  const now = Date.now();
  const wait = RATE_LIMIT_MS - (now - lastRequestTime);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestTime = Date.now();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`abgeordnetenwatch API error: ${res.status} ${url}`);
  return res.json();
}

export interface ParsedParliament {
  id: number;
  name: string;
  legislature: string;
}

export function parseParliaments(raw: any): ParsedParliament[] {
  return raw.data.map((p: any) => ({
    id: p.id,
    name: p.label,
    legislature: p.current_project?.label ?? p.label,
  }));
}

export interface ParsedMember {
  name: string;
  party_name: string;
  constituency: string | null;
  abgeordnetenwatch_id: string;
}

export function parseMembers(raw: any): ParsedMember[] {
  return raw.data.map((m: any) => ({
    name: m.label,
    party_name: m.party?.label ?? "Unbekannt",
    constituency: m.electoral_data?.constituency?.label ?? null,
    abgeordnetenwatch_id: String(m.id),
  }));
}

export interface ParsedVote {
  title: string;
  description: string | null;
  date: string;
  source_id: number;
}

export function parseVotesResponse(raw: any): ParsedVote[] {
  return raw.data.map((v: any) => ({
    title: v.label,
    description: v.field_intro ?? null,
    date: v.field_poll_date,
    source_id: v.id,
  }));
}

export interface ParsedVoteResult {
  mandate_id: string;
  result: "ja" | "nein" | "enthaltung" | "abwesend";
}

const VOTE_MAP: Record<string, "ja" | "nein" | "enthaltung" | "abwesend"> = {
  yes: "ja",
  no: "nein",
  abstain: "enthaltung",
  no_show: "abwesend",
};

export function parseVoteResultsResponse(raw: any): ParsedVoteResult[] {
  return raw.data.map((r: any) => ({
    mandate_id: String(r.mandate.id),
    result: VOTE_MAP[r.vote] ?? "abwesend",
  }));
}

export async function fetchParliaments(): Promise<ParsedParliament[]> {
  const data = await rateLimitedFetch(`${BASE_URL}/parliaments?range_end=50`);
  return parseParliaments(data);
}

export async function fetchMembers(parliamentId: number): Promise<ParsedMember[]> {
  const data = await rateLimitedFetch(
    `${BASE_URL}/candidacies-mandates?parliament=${parliamentId}&range_end=1000`
  );
  return parseMembers(data);
}

export async function fetchVotes(parliamentId: number): Promise<ParsedVote[]> {
  const data = await rateLimitedFetch(
    `${BASE_URL}/polls?field_legislature=${parliamentId}&range_end=100&sort_by=field_poll_date&sort_direction=desc`
  );
  return parseVotesResponse(data);
}

export async function fetchVoteResults(pollId: number): Promise<ParsedVoteResult[]> {
  const data = await rateLimitedFetch(
    `${BASE_URL}/votes?poll=${pollId}&range_end=1000`
  );
  return parseVoteResultsResponse(data);
}
