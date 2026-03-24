import Anthropic from "@anthropic-ai/sdk";
import { TOPIC_CATEGORIES } from "./constants";
import type { TopicCategory } from "./types";

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const RATE_LIMIT_MS = 6000; // 10 calls/min = 1 call per 6s

let lastCallTime = 0;

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

async function rateLimitedCall(prompt: string): Promise<string> {
  const now = Date.now();
  const wait = RATE_LIMIT_MS - (now - lastCallTime);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallTime = Date.now();

  const client = getClient();
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("No text in Claude response");
  return textBlock.text;
}

// --- Prompt builders ---

export function buildCategoryPrompt(title: string, description: string | null): string {
  return `Ordne folgende Bundestagsabstimmung einer Kategorie zu.
Titel: ${title}
Beschreibung: ${description ?? "Keine Beschreibung verfügbar"}

Kategorien: ${TOPIC_CATEGORIES.join(", ")}

Antworte ausschließlich mit dem Kategorienamen.`;
}

export function buildMatchPrompt(
  partyName: string,
  voteTitle: string,
  voteDescription: string | null,
  voteDate: string,
  promises: { index: number; text: string }[]
): string {
  const promiseList = promises.map((p) => `${p.index}. ${p.text}`).join("\n");
  return `Du bist ein neutraler Politikanalyst. Analysiere folgende Abstimmung und prüfe,
ob sie sich auf eine Position im Wahlprogramm bezieht.

ABSTIMMUNG:
Titel: ${voteTitle}
Beschreibung: ${voteDescription ?? "Keine Beschreibung verfügbar"}
Datum: ${voteDate}

WAHLPROGRAMM-POSITIONEN der ${partyName} (gleicher Themenbereich):
${promiseList}

AUFGABE:
1. Gibt es eine passende Position? Antworte mit der Nummer oder "keine".
2. Wenn ja: Wie sollte die Partei laut dieser Position gestimmt haben? (ja/nein)
3. Begründe in einem Satz.

Antworte ausschließlich im folgenden JSON-Format:
{"match": <nummer|null>, "expected_vote": "<ja|nein|null>", "reasoning": "<string>"}`;
}

export function buildAnalysisPrompt(
  partyName: string,
  promiseText: string,
  promiseSource: string | null,
  voteTitle: string,
  expectedVote: string,
  actualResult: string
): string {
  return `Du bist ein neutraler Politikanalyst. Bewerte die Übereinstimmung zwischen
Abstimmungsverhalten und Wahlprogramm-Position.

POSITION aus Wahlprogramm (${partyName}):
"${promiseText}"
Quelle: ${promiseSource ?? "Unbekannt"}

ABSTIMMUNG: ${voteTitle}
Erwartetes Stimmverhalten laut Wahlprogramm: ${expectedVote}
Tatsächliches Stimmverhalten der Fraktion: ${actualResult}

AUFGABE:
1. Bewerte die Übereinstimmung als Zahl zwischen 0.0 (kompletter Widerspruch)
   und 1.0 (volle Übereinstimmung).
2. Begründe in 1-2 Sätzen.
3. Formuliere die Begründung zusätzlich in Leichter Sprache (kurze Sätze,
   einfache Wörter, keine Fremdwörter).
4. Bewerte deine eigene Sicherheit (confidence) als Zahl 0.0-1.0.

Antworte ausschließlich im folgenden JSON-Format:
{"alignment": <float>, "reasoning": "<string>",
 "reasoning_simple": "<string>", "confidence": <float>}`;
}

// --- Response parsers ---

export function parseCategoryResponse(raw: string): TopicCategory | null {
  const trimmed = raw.trim();
  return TOPIC_CATEGORIES.includes(trimmed as TopicCategory)
    ? (trimmed as TopicCategory)
    : null;
}

export interface MatchResult {
  match: number | null;
  expected_vote: "ja" | "nein" | null;
  reasoning: string;
}

export function parseMatchResponse(raw: string): MatchResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in match response");
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    match: parsed.match ?? null,
    expected_vote: parsed.expected_vote ?? null,
    reasoning: parsed.reasoning,
  };
}

export interface AnalysisResult {
  alignment: number;
  reasoning: string;
  reasoning_simple: string;
  confidence: number;
}

export function parseAnalysisResponse(raw: string): AnalysisResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in analysis response");
  const parsed = JSON.parse(jsonMatch[0]);

  if (parsed.alignment < 0 || parsed.alignment > 1) {
    throw new Error(`alignment out of range: ${parsed.alignment}`);
  }
  if (parsed.confidence < 0 || parsed.confidence > 1) {
    throw new Error(`confidence out of range: ${parsed.confidence}`);
  }

  return {
    alignment: parsed.alignment,
    reasoning: parsed.reasoning,
    reasoning_simple: parsed.reasoning_simple,
    confidence: parsed.confidence,
  };
}

// --- API callers with retry ---

async function callWithRetry(prompt: string, maxRetries = 3): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await rateLimitedCall(prompt);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const backoff = Math.pow(4, attempt) * 1000;
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw new Error("Unreachable");
}

export async function categorizeVote(title: string, description: string | null): Promise<TopicCategory | null> {
  const prompt = buildCategoryPrompt(title, description);
  const raw = await callWithRetry(prompt);
  return parseCategoryResponse(raw);
}

export async function matchVoteToPromise(
  partyName: string,
  voteTitle: string,
  voteDescription: string | null,
  voteDate: string,
  promises: { index: number; text: string }[]
): Promise<MatchResult> {
  const prompt = buildMatchPrompt(partyName, voteTitle, voteDescription, voteDate, promises);
  const raw = await callWithRetry(prompt);
  return parseMatchResponse(raw);
}

export async function analyzeAlignment(
  partyName: string,
  promiseText: string,
  promiseSource: string | null,
  voteTitle: string,
  expectedVote: string,
  actualResult: string
): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(partyName, promiseText, promiseSource, voteTitle, expectedVote, actualResult);
  const raw = await callWithRetry(prompt);
  return parseAnalysisResponse(raw);
}
