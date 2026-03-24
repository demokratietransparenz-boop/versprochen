import { supabase } from "@/lib/supabase";
import { cleanSourceUrl } from "@/lib/constants";
import { notFound } from "next/navigation";
import { AbgeordneteClient } from "@/components/AbgeordneteClient";

export const dynamic = "force-dynamic";

export default async function AbgeordnetePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { topic?: string; status?: string };
}) {
  const activeTopic = searchParams.topic || null;
  const activeStatus = searchParams.status || null;
  const { data: member } = await supabase
    .from("members")
    .select("*, parties(*), parliaments(*)")
    .eq("id", params.id)
    .single();

  if (!member) return notFound();

  const party = (member as any).parties;
  const parliament = (member as any).parliaments;

  // Get member score
  const { data: memberScore } = await supabase
    .from("scores")
    .select("score, period")
    .eq("scope_type", "member")
    .eq("member_id", member.id)
    .order("period", { ascending: false })
    .limit(1)
    .single();

  // Get all analyses for this party
  const { data: partyAnalyses } = await supabase
    .from("analyses")
    .select(`
      vote_id, alignment, confidence, expected_vote, reasoning, reasoning_simple,
      votes!inner(title, date, source_url, topic_category),
      promises!inner(source, text)
    `)
    .eq("party_id", party.id)
    .gte("confidence", 0.8)
    .order("created_at", { ascending: false });

  // Get member's individual vote results
  const { data: voteResults } = await supabase
    .from("vote_results")
    .select("vote_id, result")
    .eq("member_id", member.id);

  const voteResultMap = new Map(voteResults?.map((r) => [r.vote_id, r.result]) ?? []);

  // Filter analyses to only those where the member participated
  const memberAnalyses = partyAnalyses?.filter((a: any) => voteResultMap.has(a.vote_id)) ?? [];

  // Compute topic breakdown with three categories: consistent, deviating, absent
  const topicStats: Record<string, { consistent: number; deviating: number; absent: number }> = {};
  let totalAbsent = 0;
  for (const a of memberAnalyses) {
    const topic = (a as any).votes.topic_category;
    if (!topic) continue;
    if (!topicStats[topic]) topicStats[topic] = { consistent: 0, deviating: 0, absent: 0 };
    const actualResult = voteResultMap.get(a.vote_id) ?? "";
    if (actualResult === "abwesend") {
      topicStats[topic].absent++;
      totalAbsent++;
      continue;
    }
    const votesMatch = actualResult.toLowerCase() === a.expected_vote?.toLowerCase();
    const effectiveAlignment = votesMatch ? Math.max(a.alignment, 0.7) : a.alignment;
    if (effectiveAlignment >= 0.5) {
      topicStats[topic].consistent++;
    } else {
      topicStats[topic].deviating++;
    }
  }

  const sortedTopics = Object.entries(topicStats)
    .sort((a, b) => (b[1].deviating + b[1].absent) - (a[1].deviating + a[1].absent))
    .map(([topic, stats]) => ({ topic, ...stats }));

  // Filter analyses for display based on active filters
  const filteredAnalyses = memberAnalyses
    .filter((a: any) => {
      if (activeTopic && (a as any).votes.topic_category !== activeTopic) return false;
      if (activeStatus) {
        const result = voteResultMap.get(a.vote_id) ?? "abwesend";
        if (activeStatus === "abwesend") return result === "abwesend";
        const votesMatch = result.toLowerCase() === a.expected_vote?.toLowerCase();
        const eff = votesMatch ? Math.max(a.alignment, 0.7) : a.alignment;
        if (activeStatus === "konsistent") return result !== "abwesend" && eff >= 0.5;
        if (activeStatus === "abweichung") return result !== "abwesend" && eff < 0.5;
      }
      return true;
    })
    .map((a: any) => ({
      vote_id: a.vote_id,
      vote_title: a.votes.title,
      vote_date: a.votes.date,
      vote_source_url: cleanSourceUrl(a.votes.source_url),
      vote_topic_category: a.votes.topic_category,
      alignment: a.alignment,
      confidence: a.confidence,
      expected_vote: a.expected_vote,
      reasoning: a.reasoning,
      reasoning_simple: a.reasoning_simple,
      promise_source: a.promises.source,
      actual_result: voteResultMap.get(a.vote_id) ?? "abwesend",
    }));

  return (
    <AbgeordneteClient
      memberId={params.id}
      memberName={member.name}
      partyName={party.name}
      partyId={party.id}
      parliamentId={parliament.id}
      parliamentState={parliament.state ?? null}
      parliamentName={parliament.name}
      constituency={member.constituency ?? null}
      primaryCommittee={member.primary_committee ?? null}
      memberScore={memberScore?.score ?? null}
      sortedTopics={sortedTopics}
      totalAbsent={totalAbsent}
      totalAnalyses={memberAnalyses.length}
      analyses={filteredAnalyses}
      activeTopic={activeTopic}
      activeStatus={activeStatus}
    />
  );
}
