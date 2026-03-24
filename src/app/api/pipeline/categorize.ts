import type { SupabaseClient } from "@supabase/supabase-js";
import { categorizeVote } from "@/lib/claude";

export async function categorizeNewVotes(db: SupabaseClient) {
  const { data: votes, error } = await db
    .from("votes")
    .select("id, title, description")
    .eq("analysis_status", "pending")
    .is("topic_category", null);

  if (error) throw new Error(`Failed to fetch uncategorized votes: ${error.message}`);
  if (!votes?.length) return { status: "skipped", detail: "No votes to categorize" };

  let categorized = 0;

  for (const vote of votes) {
    try {
      const category = await categorizeVote(vote.title, vote.description);
      if (category) {
        await db.from("votes").update({ topic_category: category }).eq("id", vote.id);
        categorized++;
      }
    } catch (err) {
      await db.from("pipeline_logs").insert({
        vote_id: vote.id,
        step: "categorize",
        status: "error",
        error_message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return { status: "success", detail: `${categorized}/${votes.length} votes categorized` };
}
