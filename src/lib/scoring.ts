import { CONFIDENCE_THRESHOLD, DEVIATION_THRESHOLD } from "./constants";
import type { VoteResult } from "./types";

export function computeFactionResult(
  votes: { result: VoteResult }[]
): "ja" | "nein" | "enthaltung" {
  const counted = votes.filter((v) => v.result !== "abwesend");
  const ja = counted.filter((v) => v.result === "ja").length;
  const nein = counted.filter((v) => v.result === "nein").length;

  if (ja > nein) return "ja";
  if (nein > ja) return "nein";
  return "enthaltung";
}

export function computePartyScore(
  analyses: { alignment: number; confidence: number }[]
): number {
  const qualifying = analyses.filter((a) => a.confidence >= CONFIDENCE_THRESHOLD);
  if (qualifying.length === 0) return 0;

  const avg = qualifying.reduce((sum, a) => sum + a.alignment, 0) / qualifying.length;
  return Math.round(avg * 100);
}

export function computeMemberDeviations(
  analyses: { alignment: number }[]
): number {
  return analyses.filter((a) => a.alignment < DEVIATION_THRESHOLD).length;
}
