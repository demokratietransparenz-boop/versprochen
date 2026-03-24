import type { SupabaseClient } from "@supabase/supabase-js";
import { matchVoteToPromise } from "@/lib/claude";

export async function matchVotesToPromises(db: SupabaseClient) {
  const { data: votes, error } = await db
    .from("votes")
    .select("id, parliament_id, title, description, date, topic_category")
    .eq("analysis_status", "pending")
    .not("topic_category", "is", null);

  if (error) throw new Error(`Failed to fetch votes for matching: ${error.message}`);
  if (!votes?.length) return { status: "skipped", detail: "No votes to match" };

  const { data: parties } = await db
    .from("parties")
    .select("id, name");

  if (!parties?.length) return { status: "skipped", detail: "No parties found" };

  let matched = 0;
  let notAssignable = 0;

  for (const vote of votes) {
    let voteHasMatch = false;

    for (const party of parties) {
      const { data: promises } = await db
        .from("promises")
        .select("id, text")
        .eq("party_id", party.id)
        .eq("parliament_id", vote.parliament_id)
        .eq("topic_category", vote.topic_category);

      if (!promises?.length) continue;

      try {
        const indexedPromises = promises.map((p, i) => ({ index: i + 1, text: p.text }));
        const result = await matchVoteToPromise(
          party.name,
          vote.title,
          vote.description,
          vote.date,
          indexedPromises
        );

        if (result.match !== null && result.expected_vote) {
          const matchedPromise = promises[result.match - 1];
          if (matchedPromise) {
            await db.from("analyses").upsert({
              vote_id: vote.id,
              promise_id: matchedPromise.id,
              party_id: party.id,
              expected_vote: result.expected_vote,
              alignment: 0,
              reasoning: result.reasoning,
              reasoning_simple: null,
              confidence: 0,
            }, { onConflict: "vote_id,party_id" });
            voteHasMatch = true;
            matched++;
          }
        }
      } catch (err) {
        await db.from("pipeline_logs").insert({
          vote_id: vote.id,
          step: "match",
          status: "error",
          error_message: `Party ${party.name}: ${err instanceof Error ? err.message : "Unknown"}`,
        });
      }
    }

    await db
      .from("votes")
      .update({ analysis_status: voteHasMatch ? "analyzed" : "not_assignable" })
      .eq("id", vote.id);

    if (!voteHasMatch) notAssignable++;
  }

  return { status: "success", detail: `${matched} matches, ${notAssignable} not assignable` };
}
