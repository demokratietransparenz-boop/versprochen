import { supabase } from "@/lib/supabase";
import { cleanSourceUrl } from "@/lib/constants";
import { ParliamentTabs } from "@/components/ParliamentTabs";
import { PartyScoreTable } from "@/components/PartyScoreTable";
import { DeviationFeed } from "@/components/DeviationFeed";

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
  const periodLabel = isAll
    ? "Alle Wahlperioden"
    : activeParlData?.legislature ?? "";

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
      {/* Hero / Einführung */}
      <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a6b] text-white rounded-lg px-6 py-8 -mx-4 mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Versprochen?
        </h1>
        <p className="text-[15px] text-blue-100 leading-relaxed max-w-2xl mb-4">
          Halten Parteien, was sie im Wahlprogramm versprechen? Diese Seite
          vergleicht automatisch das Abstimmungsverhalten im Bundestag mit den
          Positionen aus den Wahlprogrammen der Parteien — transparent,
          nachvollziehbar und für jeden zugänglich.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 mb-5">
          <div className="bg-white/10 rounded px-3 py-2.5 text-center">
            <div className="text-xl font-bold">{totalVotes?.toLocaleString("de-DE") ?? 0}</div>
            <div className="text-[11px] text-blue-200">Abstimmungen</div>
          </div>
          <div className="bg-white/10 rounded px-3 py-2.5 text-center">
            <div className="text-xl font-bold">{totalMembers?.toLocaleString("de-DE") ?? 0}</div>
            <div className="text-[11px] text-blue-200">Abgeordnete</div>
          </div>
          <div className="bg-white/10 rounded px-3 py-2.5 text-center">
            <div className="text-xl font-bold">{totalVoteResults?.toLocaleString("de-DE") ?? 0}</div>
            <div className="text-[11px] text-blue-200">Einzelstimmen</div>
          </div>
          <div className="bg-white/10 rounded px-3 py-2.5 text-center">
            <div className="text-xl font-bold">{parliaments?.length ?? 0}</div>
            <div className="text-[11px] text-blue-200">Wahlperioden</div>
          </div>
        </div>

        <details className="text-[13px] text-blue-200">
          <summary className="cursor-pointer hover:text-white font-medium">
            So funktioniert es
          </summary>
          <div className="mt-3 space-y-2 text-blue-100 leading-relaxed">
            <div className="flex gap-2">
              <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold shrink-0">1</span>
              <span><strong>Wahlprogramme analysieren:</strong> Wir extrahieren zentrale Positionen und Versprechen aus den offiziellen Wahlprogrammen der Parteien.</span>
            </div>
            <div className="flex gap-2">
              <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold shrink-0">2</span>
              <span><strong>Abstimmungen erfassen:</strong> Nach jeder Sitzungswoche werden alle namentlichen Abstimmungen aus dem Bundestag erfasst — inklusive wie jeder einzelne Abgeordnete gestimmt hat.</span>
            </div>
            <div className="flex gap-2">
              <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold shrink-0">3</span>
              <span><strong>KI-Abgleich:</strong> Eine KI vergleicht jede Abstimmung mit den passenden Wahlversprechen und bewertet, ob die Partei ihrem Programm treu geblieben ist.</span>
            </div>
            <div className="flex gap-2">
              <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold shrink-0">4</span>
              <span><strong>Transparenz:</strong> Jede Bewertung ist mit Quellenlinks belegt — zum Wahlprogramm und zur offiziellen Abstimmung. Sie entscheiden selbst.</span>
            </div>
          </div>
        </details>
      </div>

      <ParliamentTabs
        parliaments={parliaments ?? []}
        activeId={activeParliament}
      />

      <div className="mt-4 text-xs text-gray-400">
        {periodLabel} · {voteCount} Abstimmungen analysiert
        {isAll && parliaments
          ? ` · ${parliaments.length} Wahlperioden`
          : ""}
      </div>

      <div className="mt-2">
        <PartyScoreTable parties={formattedParties} voteCount={voteCount} />
      </div>

      <DeviationFeed deviations={deviations} />
    </div>
  );
}
