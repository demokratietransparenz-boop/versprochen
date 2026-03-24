import { supabase } from "@/lib/supabase";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TopicScoreTable } from "@/components/TopicScoreTable";
import { MemberDeviationTable } from "@/components/MemberDeviationTable";
import { ScoreText } from "@/components/TrafficLight";
import { PARTY_COLORS } from "@/lib/constants";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ParteiPage({
  params,
}: {
  params: { parliament: string; party: string };
}) {
  const { data: party } = await supabase
    .from("parties")
    .select("*")
    .eq("id", params.party)
    .single();

  if (!party) return notFound();

  const { data: parliament } = await supabase
    .from("parliaments")
    .select("*")
    .eq("id", params.parliament)
    .single();

  if (!parliament) return notFound();

  const { data: overallScore } = await supabase
    .from("scores")
    .select("score, period")
    .eq("scope_type", "party")
    .eq("party_id", party.id)
    .eq("parliament_id", parliament.id)
    .is("topic_category", null)
    .order("period", { ascending: false })
    .limit(1)
    .single();

  const { data: topicScores } = await supabase
    .from("scores")
    .select("topic_category, score")
    .eq("scope_type", "party")
    .eq("party_id", party.id)
    .eq("parliament_id", parliament.id)
    .not("topic_category", "is", null)
    .eq("period", overallScore?.period ?? "")
    .order("score", { ascending: false });

  const { count: memberCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("party_id", party.id)
    .eq("parliament_id", parliament.id);

  // Get members of THIS party
  const { data: partyMembers } = await supabase
    .from("members")
    .select("id, name, constituency")
    .eq("party_id", party.id)
    .eq("parliament_id", parliament.id);

  const memberMap = new Map(partyMembers?.map((m) => [m.id, m]) ?? []);

  // Get all analyses for this party to count actual deviations per member
  const { data: partyAnalyses } = await supabase
    .from("analyses")
    .select("vote_id, alignment, expected_vote")
    .eq("party_id", party.id)
    .gte("confidence", 0.8);

  // Get vote_results for all party members to count real deviations
  const memberIds = partyMembers?.map((m) => m.id) ?? [];
  const { data: allVoteResults } = memberIds.length > 0
    ? await supabase
        .from("vote_results")
        .select("member_id, vote_id, result")
        .in("member_id", memberIds)
    : { data: [] };

  // Count deviations per member: where member voted differently than expected
  const analysisMap = new Map(partyAnalyses?.map((a) => [a.vote_id, a]) ?? []);
  const memberDeviations: Record<string, number> = {};

  for (const vr of allVoteResults ?? []) {
    const analysis = analysisMap.get(vr.vote_id);
    if (!analysis || vr.result === "abwesend") continue;
    const votesMatch = vr.result.toLowerCase() === analysis.expected_vote?.toLowerCase();
    const effectiveAlignment = votesMatch ? Math.max(analysis.alignment, 0.7) : analysis.alignment;
    if (effectiveAlignment < 0.5) {
      memberDeviations[vr.member_id] = (memberDeviations[vr.member_id] || 0) + 1;
    }
  }

  const filteredMembers = Object.entries(memberDeviations)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([memberId, deviations]) => {
      const member = memberMap.get(memberId);
      return {
        id: memberId,
        name: member?.name ?? "Unbekannt",
        constituency: member?.constituency ?? null,
        deviations,
      };
    });

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Übersicht", href: "/" },
          { label: parliament.state ?? parliament.name, href: `/?parliament=${parliament.id}` },
          { label: party.name },
        ]}
      />

      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div
          className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: PARTY_COLORS[party.name] ?? "#888" }}
        >
          {party.name}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{party.name}</h1>
          <p className="text-[13px] text-gray-400">
            {party.full_name} · {parliament.name} · {parliament.legislature} · {memberCount ?? 0} Abgeordnete
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            <ScoreText score={overallScore?.score ?? 0} />
          </div>
          <div className="text-[11px] text-gray-400">Gesamtscore</div>
        </div>
      </div>

      <TopicScoreTable
        topics={
          topicScores?.map((s) => ({
            category: s.topic_category!,
            score: s.score,
          })) ?? []
        }
      />

      <MemberDeviationTable members={filteredMembers} />
    </div>
  );
}
