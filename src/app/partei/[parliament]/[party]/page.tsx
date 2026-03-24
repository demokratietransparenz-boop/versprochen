import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ParteiClient } from "@/components/ParteiClient";

export const dynamic = "force-dynamic";

// Neutral party descriptions based on public knowledge
const PARTY_PROFILES: Record<string, { summary: string; positions: string }> = {
  "SPD": {
    summary: "Die Sozialdemokratische Partei Deutschlands ist eine der ältesten Parteien Deutschlands. Sie positioniert sich als Mitte-Links-Partei mit Schwerpunkten auf sozialer Gerechtigkeit, Arbeitnehmerrechten und einem starken Sozialstaat.",
    positions: "Kernthemen sind Mindestlohn, bezahlbares Wohnen, Klimaschutz mit sozialer Abfederung, Stärkung des öffentlichen Gesundheitswesens und europäische Integration.",
  },
  "CDU/CSU": {
    summary: "Die Christlich Demokratische Union und die Christlich-Soziale Union bilden eine Fraktionsgemeinschaft im Bundestag. Sie positioniert sich als bürgerlich-konservative Volkspartei der politischen Mitte.",
    positions: "Kernthemen sind wirtschaftliche Stabilität, innere Sicherheit, eine restriktivere Migrationspolitik, Stärkung der Bundeswehr und die Förderung von Familien und Mittelstand.",
  },
  "GRÜNE": {
    summary: "Bündnis 90/Die Grünen sind aus der Umwelt- und Friedensbewegung hervorgegangen. Die Partei positioniert sich als ökologisch-progressive Kraft im Mitte-Links-Spektrum.",
    positions: "Kernthemen sind Klimaschutz und Energiewende, soziale Gerechtigkeit, Bürgerrechte, europäische Integration und eine wertegeleitete Außenpolitik.",
  },
  "FDP": {
    summary: "Die Freie Demokratische Partei versteht sich als liberale Partei, die individuelle Freiheit, Eigenverantwortung und Marktwirtschaft in den Mittelpunkt stellt.",
    positions: "Kernthemen sind Steuersenkungen, Bürokratieabbau, Digitalisierung, Bildung als Aufstiegsversprechen und die Einhaltung der Schuldenbremse.",
  },
  "AfD": {
    summary: "Die Alternative für Deutschland positioniert sich als rechtspopulistische bis rechtskonservative Partei. Sie entstand 2013 zunächst als EU-kritische Partei und verschob ihren Fokus zunehmend auf Migrationspolitik.",
    positions: "Kernthemen sind eine restriktive Migrationspolitik, EU-Skepsis, Stärkung nationaler Souveränität, Ablehnung der Energiewende in ihrer jetzigen Form und konservative Gesellschaftspolitik.",
  },
  "LINKE": {
    summary: "Die Linke ist eine demokratisch-sozialistische Partei, die aus der PDS und der WASG hervorgegangen ist. Sie positioniert sich als linke Opposition mit Fokus auf soziale Gerechtigkeit.",
    positions: "Kernthemen sind Umverteilung von Vermögen, Verstaatlichung von Schlüsselindustrien, antimilitaristische Außenpolitik, Mietpreisbremsen und die Stärkung öffentlicher Daseinsvorsorge.",
  },
  "BSW": {
    summary: "Das Bündnis Sahra Wagenknecht wurde 2024 gegründet. Die Partei verbindet wirtschaftlich linke Positionen mit konservativen gesellschaftspolitischen Ansichten.",
    positions: "Kernthemen sind soziale Gerechtigkeit, eine restriktivere Migrationspolitik, diplomatische Lösungen im Ukraine-Konflikt, Ablehnung von Waffenlieferungen und Kritik an den etablierten Parteien.",
  },
};

export default async function ParteiPage({
  params,
}: {
  params: { parliament: string; party: string };
}) {
  const isAll = params.parliament === "all";

  const { data: party } = await supabase
    .from("parties")
    .select("*")
    .eq("id", params.party)
    .single();

  if (!party) return notFound();

  let parliament: any = null;
  let parliamentIds: string[] = [];

  if (isAll) {
    const { data: allParliaments } = await supabase
      .from("parliaments")
      .select("id, name, legislature")
      .neq("data_status", "unavailable");
    parliamentIds = allParliaments?.map((p) => p.id) ?? [];
    parliament = { id: "all", name: "Bundestag", legislature: "Alle Wahlperioden" };
  } else {
    const { data: p } = await supabase
      .from("parliaments")
      .select("*")
      .eq("id", params.parliament)
      .single();
    if (!p) return notFound();
    parliament = p;
    parliamentIds = [p.id];
  }

  // Compute scores from analyses
  let overallScoreValue = 0;
  let topicScoresFormatted: { category: string; score: number }[] = [];
  let totalAnalyses = 0;
  let consistentCount = 0;
  let deviationCount = 0;

  {
    const analysisQuery = supabase
      .from("analyses")
      .select("alignment, vote_id, confidence")
      .eq("party_id", party.id)
      .gte("confidence", 0.8)
      .limit(2000);

    const { data: rawAnalyses } = await analysisQuery;

    let filteredAnalyses = rawAnalyses ?? [];
    if (!isAll) {
      const { data: parlVotes } = await supabase
        .from("votes")
        .select("id")
        .eq("parliament_id", parliament.id);
      const parlVoteIds = new Set(parlVotes?.map((v) => v.id) ?? []);
      filteredAnalyses = filteredAnalyses.filter((a) => parlVoteIds.has(a.vote_id));
    }

    totalAnalyses = filteredAnalyses.length;

    if (filteredAnalyses.length) {
      const totalAlignment = filteredAnalyses.reduce((sum, a) => sum + a.alignment, 0);
      overallScoreValue = Math.round((totalAlignment / filteredAnalyses.length) * 100);

      consistentCount = filteredAnalyses.filter((a) => a.alignment >= 0.5).length;
      deviationCount = filteredAnalyses.filter((a) => a.alignment < 0.5).length;
    }

    const voteIds = filteredAnalyses.map((a) => a.vote_id);
    if (voteIds.length > 0) {
      const { data: voteTopics } = await supabase
        .from("votes")
        .select("id, topic_category")
        .in("id", voteIds);

      const topicMap = new Map(voteTopics?.map((v) => [v.id, v.topic_category]) ?? []);

      const topicAgg: Record<string, { sum: number; count: number }> = {};
      for (const a of filteredAnalyses) {
        const topic = topicMap.get(a.vote_id);
        if (!topic) continue;
        if (!topicAgg[topic]) topicAgg[topic] = { sum: 0, count: 0 };
        topicAgg[topic].sum += a.alignment;
        topicAgg[topic].count++;
      }
      topicScoresFormatted = Object.entries(topicAgg)
        .map(([cat, agg]) => ({
          category: cat,
          score: Math.round((agg.sum / agg.count) * 100),
        }))
        .sort((a, b) => b.score - a.score);
    }
  }

  // Get members
  let membersQuery = supabase
    .from("members")
    .select("id, name, constituency, parliament_id, parliaments!inner(legislature)")
    .eq("party_id", party.id);

  if (!isAll) {
    membersQuery = membersQuery.eq("parliament_id", parliament.id);
  }

  const { data: partyMembers } = await membersQuery;
  const memberCount = partyMembers?.length ?? 0;
  const memberMap = new Map(partyMembers?.map((m) => [m.id, m]) ?? []);

  // Get all analyses for this party
  const { data: partyAnalyses } = await supabase
    .from("analyses")
    .select("vote_id, alignment, expected_vote")
    .eq("party_id", party.id)
    .gte("confidence", 0.8);

  // Get vote_results for all party members
  const memberIds = partyMembers?.map((m) => m.id) ?? [];

  let allVoteResults: any[] = [];
  if (memberIds.length > 0) {
    for (let i = 0; i < memberIds.length; i += 500) {
      const chunk = memberIds.slice(i, i + 500);
      const { data } = await supabase
        .from("vote_results")
        .select("member_id, vote_id, result")
        .in("member_id", chunk);
      allVoteResults.push(...(data ?? []));
    }
  }

  // Count deviations and consistent votes per member
  const analysisMap = new Map(partyAnalyses?.map((a) => [a.vote_id, a]) ?? []);
  const memberStats: Record<string, { consistent: number; deviations: number; absent: number; total: number }> = {};

  for (const vr of allVoteResults) {
    const analysis = analysisMap.get(vr.vote_id);
    if (!analysis) continue;

    if (!memberStats[vr.member_id]) {
      memberStats[vr.member_id] = { consistent: 0, deviations: 0, absent: 0, total: 0 };
    }
    memberStats[vr.member_id].total++;

    if (vr.result === "abwesend") {
      memberStats[vr.member_id].absent++;
      continue;
    }

    const votesMatch = vr.result.toLowerCase() === analysis.expected_vote?.toLowerCase();
    const effectiveAlignment = votesMatch ? Math.max(analysis.alignment, 0.7) : analysis.alignment;
    if (effectiveAlignment >= 0.5) {
      memberStats[vr.member_id].consistent++;
    } else {
      memberStats[vr.member_id].deviations++;
    }
  }

  // Most deviating members
  const deviatingMembers = Object.entries(memberStats)
    .filter(([_, s]) => s.deviations > 0)
    .sort((a, b) => b[1].deviations - a[1].deviations)
    .slice(0, 15)
    .map(([id, stats]) => {
      const m = memberMap.get(id) as any;
      return {
        id,
        name: m?.name ?? "Unbekannt",
        constituency: m?.constituency ?? null,
        legislature: m?.parliaments?.legislature ?? "",
        deviations: stats.deviations,
        consistent: stats.consistent,
        total: stats.total,
        score: stats.total > 0 ? Math.round(((stats.consistent) / (stats.total - stats.absent)) * 100) : 0,
      };
    });

  // Most reliable members (highest consistency, minimum 3 votes)
  const reliableMembers = Object.entries(memberStats)
    .filter(([_, s]) => (s.total - s.absent) >= 3)
    .sort((a, b) => {
      const scoreA = a[1].consistent / (a[1].total - a[1].absent);
      const scoreB = b[1].consistent / (b[1].total - b[1].absent);
      return scoreB - scoreA;
    })
    .slice(0, 15)
    .map(([id, stats]) => {
      const m = memberMap.get(id) as any;
      const votedTotal = stats.total - stats.absent;
      return {
        id,
        name: m?.name ?? "Unbekannt",
        constituency: m?.constituency ?? null,
        legislature: m?.parliaments?.legislature ?? "",
        consistent: stats.consistent,
        total: votedTotal,
        score: votedTotal > 0 ? Math.round((stats.consistent / votedTotal) * 100) : 0,
      };
    });

  // Party profile data
  const profile = PARTY_PROFILES[party.name] ?? null;

  // Generate strong/weak topics
  const strongTopics = topicScoresFormatted.filter((t) => t.score >= 70).map((t) => t.category);
  const weakTopics = topicScoresFormatted.filter((t) => t.score < 40).map((t) => t.category);

  const breadcrumbLabel = isAll ? "Alle Wahlperioden" : (parliament.state ?? parliament.name);

  return (
    <ParteiClient
      partyName={party.name}
      partyFullName={party.full_name}
      partyId={party.id}
      parliamentId={params.parliament}
      parliamentLegislature={parliament.legislature}
      breadcrumbLabel={breadcrumbLabel}
      isAll={isAll}
      memberCount={memberCount}
      overallScoreValue={overallScoreValue}
      totalAnalyses={totalAnalyses}
      consistentCount={consistentCount}
      deviationCount={deviationCount}
      topicScoresFormatted={topicScoresFormatted}
      strongTopics={strongTopics}
      weakTopics={weakTopics}
      reliableMembers={reliableMembers}
      deviatingMembers={deviatingMembers}
      profile={profile}
    />
  );
}
