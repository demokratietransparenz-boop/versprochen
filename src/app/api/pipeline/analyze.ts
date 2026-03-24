import type { SupabaseClient } from "@supabase/supabase-js";
import { analyzeAlignment } from "@/lib/claude";
import { computeFactionResult } from "@/lib/scoring";

export async function analyzeMatches(db: SupabaseClient) {
  const { data: pending, error } = await db
    .from("analyses")
    .select(`
      id, vote_id, promise_id, party_id, expected_vote,
      votes!inner(title, parliament_id),
      promises!inner(text, source),
      parties!inner(name)
    `)
    .eq("confidence", 0);

  if (error) throw new Error(`Failed to fetch pending analyses: ${error.message}`);
  if (!pending?.length) return { status: "skipped", detail: "No analyses pending" };

  let analyzed = 0;

  for (const row of pending) {
    try {
      const { data: voteResults } = await db
        .from("vote_results")
        .select("result, members!inner(party_id)")
        .eq("vote_id", row.vote_id)
        .eq("members.party_id", row.party_id);

      const factionResult = voteResults?.length
        ? computeFactionResult(voteResults.map((r: any) => ({ result: r.result })))
        : "enthaltung";

      const result = await analyzeAlignment(
        (row as any).parties.name,
        (row as any).promises.text,
        (row as any).promises.source,
        (row as any).votes.title,
        (row as any).expected_vote,
        factionResult
      );

      await db
        .from("analyses")
        .update({
          alignment: result.alignment,
          reasoning: result.reasoning,
          reasoning_simple: result.reasoning_simple,
          confidence: result.confidence,
        })
        .eq("id", row.id);

      analyzed++;
    } catch (err) {
      await db.from("pipeline_logs").insert({
        vote_id: row.vote_id,
        step: "analyze",
        status: "error",
        error_message: err instanceof Error ? err.message : "Unknown",
      });
    }
  }

  return { status: "success", detail: `${analyzed}/${pending.length} analyses completed` };
}
