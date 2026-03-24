import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchVotes, fetchVoteResults } from "@/lib/abgeordnetenwatch";

export async function collectVotes(db: SupabaseClient) {
  const { data: parliaments, error: pErr } = await db
    .from("parliaments")
    .select("id, name, api_source, data_status")
    .neq("data_status", "unavailable");

  if (pErr) throw new Error(`Failed to fetch parliaments: ${pErr.message}`);
  if (!parliaments?.length) return { status: "skipped", detail: "No active parliaments" };

  let newVotes = 0;

  for (const parliament of parliaments) {
    const awId = parseInt(parliament.api_source ?? "0", 10);
    if (!awId) continue;

    const votes = await fetchVotes(awId);

    for (const vote of votes) {
      const sourceUrl = `https://www.abgeordnetenwatch.de/api/v2/polls/${vote.source_id}`;
      const { data: existing } = await db
        .from("votes")
        .select("id")
        .eq("source_url", sourceUrl)
        .single();

      if (existing) continue;

      const { data: insertedVote, error: vErr } = await db
        .from("votes")
        .insert({
          parliament_id: parliament.id,
          title: vote.title,
          description: vote.description,
          date: vote.date,
          source_url: sourceUrl,
          analysis_status: "pending",
        })
        .select("id")
        .single();

      if (vErr) {
        await db.from("pipeline_logs").insert({
          step: "collect",
          status: "error",
          error_message: `Failed to insert vote: ${vErr.message}`,
        });
        continue;
      }

      const results = await fetchVoteResults(vote.source_id);

      const mandateIds = results.map((r) => r.mandate_id);
      const { data: members } = await db
        .from("members")
        .select("id, abgeordnetenwatch_id")
        .in("abgeordnetenwatch_id", mandateIds);

      const memberMap = new Map(members?.map((m) => [m.abgeordnetenwatch_id, m.id]) ?? []);

      const voteResults = results
        .filter((r) => memberMap.has(r.mandate_id))
        .map((r) => ({
          vote_id: insertedVote.id,
          member_id: memberMap.get(r.mandate_id)!,
          result: r.result,
        }));

      if (voteResults.length > 0) {
        await db.from("vote_results").insert(voteResults);
      }

      newVotes++;
    }
  }

  await db.from("pipeline_logs").insert({
    step: "collect",
    status: "success",
    error_message: null,
  });

  return { status: "success", detail: `${newVotes} new votes collected` };
}
