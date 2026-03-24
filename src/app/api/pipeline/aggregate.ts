import type { SupabaseClient } from "@supabase/supabase-js";
import { computePartyScore, computeMemberDeviations } from "@/lib/scoring";
import { getTrafficLight, TOPIC_CATEGORIES } from "@/lib/constants";

function getCurrentPeriod(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-KW${String(week).padStart(2, "0")}`;
}

export async function aggregateScores(db: SupabaseClient) {
  const period = getCurrentPeriod();

  const { data: parliaments } = await db
    .from("parliaments")
    .select("id")
    .neq("data_status", "unavailable");

  if (!parliaments?.length) return { status: "skipped", detail: "No active parliaments" };

  for (const parliament of parliaments) {
    const { data: partyIds } = await db
      .from("members")
      .select("party_id")
      .eq("parliament_id", parliament.id);

    const uniquePartyIds = [...new Set(partyIds?.map((p) => p.party_id) ?? [])];

    for (const partyId of uniquePartyIds) {
      const { data: analyses } = await db
        .from("analyses")
        .select("alignment, confidence, promises!inner(topic_category, parliament_id)")
        .eq("party_id", partyId)
        .eq("promises.parliament_id", parliament.id);

      if (!analyses?.length) continue;

      const overallScore = computePartyScore(analyses);
      await upsertScore(db, {
        scope_type: "party",
        party_id: partyId,
        member_id: null,
        parliament_id: parliament.id,
        topic_category: null,
        score: overallScore,
        traffic_light: getTrafficLight(overallScore),
        period,
      });

      for (const category of TOPIC_CATEGORIES) {
        const topicAnalyses = analyses.filter(
          (a: any) => a.promises.topic_category === category
        );
        if (!topicAnalyses.length) continue;

        const topicScore = computePartyScore(topicAnalyses);
        await upsertScore(db, {
          scope_type: "party",
          party_id: partyId,
          member_id: null,
          parliament_id: parliament.id,
          topic_category: category,
          score: topicScore,
          traffic_light: getTrafficLight(topicScore),
          period,
        });
      }
    }

    const { data: members } = await db
      .from("members")
      .select("id, party_id")
      .eq("parliament_id", parliament.id);

    for (const member of members ?? []) {
      const { data: memberVoteResults } = await db
        .from("vote_results")
        .select("vote_id, result")
        .eq("member_id", member.id);

      if (!memberVoteResults?.length) continue;

      const voteIds = memberVoteResults.map((r) => r.vote_id);
      const { data: memberAnalyses } = await db
        .from("analyses")
        .select("alignment")
        .eq("party_id", member.party_id)
        .in("vote_id", voteIds);

      if (!memberAnalyses?.length) continue;

      const deviations = computeMemberDeviations(memberAnalyses);
      const total = memberAnalyses.length;
      const memberScore = total > 0 ? Math.round(((total - deviations) / total) * 100) : 100;

      await upsertScore(db, {
        scope_type: "member",
        party_id: null,
        member_id: member.id,
        parliament_id: parliament.id,
        topic_category: null,
        score: memberScore,
        traffic_light: getTrafficLight(memberScore),
        period,
      });
    }
  }

  await db.from("pipeline_logs").insert({
    step: "aggregate",
    status: "success",
  });

  return { status: "success", detail: `Scores aggregated for period ${period}` };
}

async function upsertScore(
  db: SupabaseClient,
  score: {
    scope_type: string;
    party_id: string | null;
    member_id: string | null;
    parliament_id: string;
    topic_category: string | null;
    score: number;
    traffic_light: string;
    period: string;
  }
) {
  await db.from("scores").insert({
    ...score,
    updated_at: new Date().toISOString(),
  });
}
