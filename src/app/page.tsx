import { supabase } from "@/lib/supabase";
import { ParliamentTabs } from "@/components/ParliamentTabs";
import { PartyScoreTable } from "@/components/PartyScoreTable";
import { DeviationFeed } from "@/components/DeviationFeed";

export const revalidate = 3600;

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

  const activeParliament =
    searchParams.parliament ?? parliaments?.[0]?.id ?? "";

  const activeParlData = parliaments?.find((p) => p.id === activeParliament);

  const { data: latestPeriod } = await supabase
    .from("scores")
    .select("period")
    .eq("parliament_id", activeParliament)
    .eq("scope_type", "party")
    .is("topic_category", null)
    .order("period", { ascending: false })
    .limit(1)
    .single();

  const currentPeriod = latestPeriod?.period;
  let previousPeriod: string | undefined;

  if (currentPeriod) {
    const { data: prevData } = await supabase
      .from("scores")
      .select("period")
      .eq("parliament_id", activeParliament)
      .eq("scope_type", "party")
      .is("topic_category", null)
      .lt("period", currentPeriod)
      .order("period", { ascending: false })
      .limit(1)
      .single();
    previousPeriod = prevData?.period;
  }

  const { data: partyScores } = await supabase
    .from("scores")
    .select("party_id, score, parties!inner(name)")
    .eq("parliament_id", activeParliament)
    .eq("scope_type", "party")
    .eq("period", currentPeriod ?? "")
    .is("topic_category", null)
    .order("score", { ascending: false });

  let previousScores: Record<string, number> = {};
  if (previousPeriod) {
    const { data: prevScores } = await supabase
      .from("scores")
      .select("party_id, score")
      .eq("parliament_id", activeParliament)
      .eq("scope_type", "party")
      .eq("period", previousPeriod)
      .is("topic_category", null);
    previousScores = Object.fromEntries(
      prevScores?.map((s) => [s.party_id, s.score]) ?? []
    );
  }

  const { count: voteCount } = await supabase
    .from("votes")
    .select("id", { count: "exact", head: true })
    .eq("parliament_id", activeParliament)
    .eq("analysis_status", "analyzed");

  const { data: recentAnalyses } = await supabase
    .from("analyses")
    .select(`
      id, alignment, vote_id, confidence,
      votes!inner(title, date, parliament_id, parliaments!inner(name)),
      promises!inner(source),
      parties!inner(name)
    `)
    .eq("votes.parliament_id", activeParliament)
    .gte("confidence", 0.8)
    .order("created_at", { ascending: false })
    .limit(10);

  const formattedParties =
    partyScores?.map((s: any) => ({
      party_id: s.party_id,
      party_name: s.parties.name,
      score: s.score,
      trend: s.score - (previousScores[s.party_id] ?? s.score),
      vote_count: voteCount ?? 0,
      parliament_slug: activeParliament,
    })) ?? [];

  const deviations =
    recentAnalyses?.map((a: any) => ({
      id: a.id,
      party_name: a.parties.name,
      vote_title: a.votes.title,
      promise_source: a.promises.source,
      date: a.votes.date,
      alignment: a.alignment,
      parliament_name: a.votes.parliaments.name,
    })) ?? [];

  return (
    <div>
      <ParliamentTabs
        parliaments={parliaments ?? []}
        activeId={activeParliament}
      />

      <div className="mt-4 text-xs text-gray-400">
        Stand: {currentPeriod ?? "—"} · {voteCount ?? 0} Abstimmungen analysiert
        {activeParlData ? ` · ${activeParlData.legislature}` : ""}
      </div>

      <div className="mt-2">
        <PartyScoreTable parties={formattedParties} />
      </div>

      <DeviationFeed deviations={deviations} />
    </div>
  );
}
