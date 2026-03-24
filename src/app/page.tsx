import { supabase } from "@/lib/supabase";
import { cleanSourceUrl } from "@/lib/constants";
import { ParliamentTabs } from "@/components/ParliamentTabs";
import { PartyScoreTable } from "@/components/PartyScoreTable";
import { DeviationFeed } from "@/components/DeviationFeed";
import { HeroSection } from "@/components/HeroSection";
import { PeriodSummary } from "@/components/PeriodSummary";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { parliament?: string };
}) {
  const { data: parliaments } = await supabase
    .from("parliaments")
    .select("id, name, state, legislature")
    .neq("data_status", "unavailable")
    .order("name");

  const activeParliament = searchParams.parliament ?? "all";
  const isAll = activeParliament === "all";

  const parliamentIds = isAll
    ? (parliaments?.map((p) => p.id) ?? [])
    : [activeParliament];

  // Get vote count across selected parliament(s)
  let voteCount = 0;
  if (isAll) {
    const { count } = await supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("analysis_status", "analyzed");
    voteCount = count ?? 0;
  } else {
    const { count } = await supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("parliament_id", activeParliament)
      .eq("analysis_status", "analyzed");
    voteCount = count ?? 0;
  }

  // For "all" mode, compute aggregate scores directly from analyses
  // For single parliament, use the scores table
  let formattedParties: any[] = [];

  if (isAll) {
    // Aggregate: count analyses per party, compute alignment average
    const { data: allAnalyses } = await supabase
      .from("analyses")
      .select("party_id, alignment, expected_vote, vote_id, parties!inner(name)")
      .gte("confidence", 0.8);

    // Group by party
    const partyAgg: Record<string, { name: string; total: number; alignedSum: number }> = {};
    for (const a of allAnalyses ?? []) {
      const pid = a.party_id;
      const pname = (a as any).parties.name;
      if (!partyAgg[pid]) partyAgg[pid] = { name: pname, total: 0, alignedSum: 0 };
      partyAgg[pid].total++;
      partyAgg[pid].alignedSum += a.alignment;
    }

    formattedParties = Object.entries(partyAgg)
      .map(([pid, agg]) => ({
        party_id: pid,
        party_name: agg.name,
        score: agg.total > 0 ? Math.round((agg.alignedSum / agg.total) * 100) : 0,
        analysis_count: agg.total,
        parliament_slug: "all",
      }))
      .sort((a, b) => b.score - a.score);
  } else {
    // Aggregate directly from analyses, filtered by parliament
    const { data: parlAnalyses } = await supabase
      .from("analyses")
      .select("party_id, alignment, votes!inner(parliament_id), parties!inner(name)")
      .eq("votes.parliament_id", activeParliament)
      .gte("confidence", 0.8);

    const partyAgg2: Record<string, { name: string; total: number; alignedSum: number }> = {};
    for (const a of parlAnalyses ?? []) {
      const pid = a.party_id;
      const pname = (a as any).parties.name;
      if (!partyAgg2[pid]) partyAgg2[pid] = { name: pname, total: 0, alignedSum: 0 };
      partyAgg2[pid].total++;
      partyAgg2[pid].alignedSum += a.alignment;
    }

    formattedParties = Object.entries(partyAgg2)
      .map(([pid, agg]) => ({
        party_id: pid,
        party_name: agg.name,
        score: agg.total > 0 ? Math.round((agg.alignedSum / agg.total) * 100) : 0,
        analysis_count: agg.total,
        parliament_slug: activeParliament,
      }))
      .sort((a, b) => b.score - a.score);
  }

  // Recent analyses (deviations feed)
  let recentQuery = supabase
    .from("analyses")
    .select(`
      id, alignment, vote_id, confidence, expected_vote, reasoning, reasoning_simple,
      votes!inner(title, date, source_url, parliament_id, parliaments!inner(name, legislature)),
      promises!inner(source, text),
      parties!inner(name)
    `)
    .gte("confidence", 0.8)
    .lt("alignment", 0.5)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!isAll) {
    recentQuery = recentQuery.eq("votes.parliament_id", activeParliament);
  }

  const { data: recentAnalyses } = await recentQuery;

  const deviations = recentAnalyses?.map((a: any) => ({
    id: a.id,
    party_name: a.parties.name,
    vote_title: a.votes.title,
    promise_source: a.promises.source,
    promise_text: a.promises.text,
    expected_vote: a.expected_vote,
    reasoning: a.reasoning,
    reasoning_simple: a.reasoning_simple,
    date: a.votes.date,
    alignment: a.alignment,
    confidence: a.confidence,
    parliament_name: `${a.votes.parliaments.name} (${a.votes.parliaments.legislature})`,
    source_url: cleanSourceUrl(a.votes.source_url),
  })) ?? [];

  const activeParlData = parliaments?.find((p) => p.id === activeParliament);
  const periodLabel = activeParlData?.legislature ?? null;

  const { count: totalMembers } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true });

  const { count: totalVoteResults } = await supabase
    .from("vote_results")
    .select("id", { count: "exact", head: true });

  const { count: totalVotes } = await supabase
    .from("votes")
    .select("id", { count: "exact", head: true });

  return (
    <div>
      <HeroSection
        stats={{
          totalVotes: totalVotes ?? 0,
          totalMembers: totalMembers ?? 0,
          totalVoteResults: totalVoteResults ?? 0,
          parliamentCount: parliaments?.length ?? 0,
        }}
      />

      <ParliamentTabs
        parliaments={parliaments ?? []}
        activeId={activeParliament}
      />

      <PeriodSummary
        periodLabel={periodLabel}
        voteCount={voteCount}
        parliamentCount={isAll && parliaments ? parliaments.length : null}
        isAll={isAll}
      />

      <div className="mt-2">
        <PartyScoreTable parties={formattedParties} voteCount={voteCount} />
      </div>

      <DeviationFeed deviations={deviations} />
    </div>
  );
}
