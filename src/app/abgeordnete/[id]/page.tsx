import { supabase } from "@/lib/supabase";
import { Breadcrumb } from "@/components/Breadcrumb";
import { VoteAnalysisCard } from "@/components/VoteAnalysisCard";
import { ScoreText } from "@/components/TrafficLight";
import { PARTY_COLORS } from "@/lib/constants";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AbgeordnetePage({
  params,
}: {
  params: { id: string };
}) {
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

  // Compute topic breakdown — if actual vote matches expected, count as consistent
  const topicStats: Record<string, { consistent: number; deviating: number }> = {};
  for (const a of memberAnalyses) {
    const topic = (a as any).votes.topic_category;
    if (!topic) continue;
    if (!topicStats[topic]) topicStats[topic] = { consistent: 0, deviating: 0 };
    const actualResult = voteResultMap.get(a.vote_id) ?? "";
    const votesMatch = actualResult.toLowerCase() === a.expected_vote?.toLowerCase();
    const effectiveAlignment = votesMatch ? Math.max(a.alignment, 0.7) : a.alignment;
    if (effectiveAlignment >= 0.5) {
      topicStats[topic].consistent++;
    } else {
      topicStats[topic].deviating++;
    }
  }

  const sortedTopics = Object.entries(topicStats)
    .sort((a, b) => b[1].deviating - a[1].deviating);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Übersicht", href: "/" },
          {
            label: parliament.state ?? parliament.name,
            href: `/?parliament=${parliament.id}`,
          },
          {
            label: party.name,
            href: `/partei/${parliament.id}/${party.id}`,
          },
          { label: member.name },
        ]}
      />

      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: PARTY_COLORS[party.name] ?? "#888" }}
        >
          {party.name.substring(0, 3)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{member.name}</h1>
          <p className="text-[13px] text-gray-400">
            {party.name} · Wahlkreis {member.constituency ?? "—"}
            {member.primary_committee ? ` · ${member.primary_committee}` : ""}
          </p>
        </div>
        {memberScore && (
          <div className="text-right">
            <div className="text-3xl font-bold">
              <ScoreText score={memberScore.score} />
            </div>
            <div className="text-[11px] text-gray-400">Übereinstimmung</div>
          </div>
        )}
      </div>

      {/* Topic Deviation Chart */}
      {sortedTopics.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
            Abstimmungsverhalten nach Themenbereich
          </h3>
          <div className="space-y-2">
            {sortedTopics.map(([topic, stats]) => {
              const total = stats.consistent + stats.deviating;
              const consistentPct = Math.round((stats.consistent / total) * 100);
              const deviatingPct = 100 - consistentPct;
              return (
                <div key={topic} className="flex items-center gap-3 text-[13px]">
                  <div className="w-32 text-gray-700 shrink-0">{topic}</div>
                  <div className="flex-1 flex h-5 rounded overflow-hidden bg-gray-100">
                    {consistentPct > 0 && (
                      <div
                        className="bg-[#2e7d32] flex items-center justify-center text-white text-[10px] font-medium"
                        style={{ width: `${consistentPct}%` }}
                      >
                        {stats.consistent}
                      </div>
                    )}
                    {deviatingPct > 0 && (
                      <div
                        className="bg-[#c62828] flex items-center justify-center text-white text-[10px] font-medium"
                        style={{ width: `${deviatingPct}%` }}
                      >
                        {stats.deviating}
                      </div>
                    )}
                  </div>
                  <div className="w-20 text-right text-gray-400 text-[11px]">
                    {stats.consistent} / {total}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2 text-[11px] text-gray-400">
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#2e7d32] mr-1"></span>Konsistent</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#c62828] mr-1"></span>Abweichung</span>
          </div>
        </div>
      )}

      <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
        Abstimmungsverhalten ({memberAnalyses.length} analysierte Abstimmungen)
      </h3>

      {memberAnalyses.map((a: any, i: number) => (
        <VoteAnalysisCard
          key={i}
          analysis={{
            vote_title: a.votes.title,
            vote_date: a.votes.date,
            actual_result: voteResultMap.get(a.vote_id) ?? "abwesend",
            expected_vote: a.expected_vote,
            alignment: a.alignment,
            reasoning: a.reasoning,
            reasoning_simple: a.reasoning_simple,
            confidence: a.confidence,
            source_url: a.votes.source_url,
            promise_source: a.promises.source,
          }}
        />
      ))}

      {memberAnalyses.length === 0 && (
        <p className="text-sm text-gray-400">
          Noch keine analysierten Abstimmungen für diesen Abgeordneten.
        </p>
      )}
    </div>
  );
}
