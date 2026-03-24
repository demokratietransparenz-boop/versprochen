import { supabase } from "@/lib/supabase";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TopicScoreTable } from "@/components/TopicScoreTable";
import { ScoreText } from "@/components/TrafficLight";
import { PARTY_COLORS } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";

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

  if (isAll) {
    const { data: allAnalyses } = await supabase
      .from("analyses")
      .select("alignment, vote_id, votes!inner(topic_category)")
      .eq("party_id", party.id)
      .gte("confidence", 0.8);

    totalAnalyses = allAnalyses?.length ?? 0;

    if (allAnalyses?.length) {
      const totalAlignment = allAnalyses.reduce((sum, a) => sum + a.alignment, 0);
      overallScoreValue = Math.round((totalAlignment / allAnalyses.length) * 100);

      consistentCount = allAnalyses.filter((a) => a.alignment >= 0.5).length;
      deviationCount = allAnalyses.filter((a) => a.alignment < 0.5).length;

      const topicAgg: Record<string, { sum: number; count: number }> = {};
      for (const a of allAnalyses) {
        const topic = (a as any).votes?.topic_category;
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
  } else {
    // Same logic as "all" but filtered by parliament
    const { data: parlAnalyses } = await supabase
      .from("analyses")
      .select("alignment, vote_id, votes!inner(topic_category, parliament_id)")
      .eq("party_id", party.id)
      .eq("votes.parliament_id", parliament.id)
      .gte("confidence", 0.8);

    totalAnalyses = parlAnalyses?.length ?? 0;

    if (parlAnalyses?.length) {
      const totalAlignment = parlAnalyses.reduce((sum, a) => sum + a.alignment, 0);
      overallScoreValue = Math.round((totalAlignment / parlAnalyses.length) * 100);

      consistentCount = parlAnalyses.filter((a) => a.alignment >= 0.5).length;
      deviationCount = parlAnalyses.filter((a) => a.alignment < 0.5).length;

      const topicAgg: Record<string, { sum: number; count: number }> = {};
      for (const a of parlAnalyses) {
        const topic = (a as any).votes?.topic_category;
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
  const profile = PARTY_PROFILES[party.name];

  // Generate neutral assessment based on data
  const strongTopics = topicScoresFormatted.filter((t) => t.score >= 70).map((t) => t.category);
  const weakTopics = topicScoresFormatted.filter((t) => t.score < 40).map((t) => t.category);

  let assessment = "";
  if (overallScoreValue >= 70) {
    assessment = `Die ${party.name} zeigt eine hohe Übereinstimmung zwischen Wahlprogramm und Abstimmungsverhalten. In ${totalAnalyses} analysierten Abstimmungen wurde ${consistentCount} Mal im Einklang mit dem Wahlprogramm gestimmt.`;
  } else if (overallScoreValue >= 50) {
    assessment = `Die ${party.name} zeigt eine gemischte Bilanz. In ${totalAnalyses} analysierten Abstimmungen stimmt das Verhalten in etwa der Hälfte der Fälle mit dem Wahlprogramm überein.`;
  } else {
    assessment = `Die ${party.name} weicht in vielen Fällen von ihrem Wahlprogramm ab. Von ${totalAnalyses} analysierten Abstimmungen wurden ${deviationCount} als Abweichung bewertet.`;
  }

  if (strongTopics.length > 0) {
    assessment += ` Besonders programmtreu zeigt sich die Partei bei: ${strongTopics.join(", ")}.`;
  }
  if (weakTopics.length > 0) {
    assessment += ` Deutliche Abweichungen gibt es bei: ${weakTopics.join(", ")}.`;
  }

  const breadcrumbLabel = isAll ? "Alle Wahlperioden" : (parliament.state ?? parliament.name);

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Übersicht", href: `/?parliament=${params.parliament}` },
          { label: breadcrumbLabel, href: `/?parliament=${params.parliament}` },
          { label: party.name },
        ]}
      />

      {/* Party Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: PARTY_COLORS[party.name] ?? "#888" }}
        >
          {party.name}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{party.name}</h1>
          <p className="text-[13px] text-gray-400">
            {party.full_name} · {parliament.legislature} · {memberCount} Abgeordnete
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            <ScoreText score={overallScoreValue} />
          </div>
          <div className="text-[11px] text-gray-400">Gesamtscore</div>
        </div>
      </div>

      {/* Party Profile */}
      {profile && (
        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-2">Über die Partei</h3>
          <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
            {profile.summary}
          </p>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            <strong className="text-gray-700">Programmatische Schwerpunkte:</strong> {profile.positions}
          </p>
        </div>
      )}

      {/* Data-Based Assessment */}
      <div className="border border-blue-100 bg-blue-50 rounded-lg p-5 mb-6">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-2">
          Datenbasierte Einschätzung
        </h3>
        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
          {assessment}
        </p>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="text-center bg-white rounded px-3 py-2">
            <div className="text-lg font-bold text-gray-900">{totalAnalyses}</div>
            <div className="text-[10px] text-gray-400">Analysierte Abstimmungen</div>
          </div>
          <div className="text-center bg-white rounded px-3 py-2">
            <div className="text-lg font-bold text-[#2e7d32]">{consistentCount}</div>
            <div className="text-[10px] text-gray-400">Konsistent</div>
          </div>
          <div className="text-center bg-white rounded px-3 py-2">
            <div className="text-lg font-bold text-[#c62828]">{deviationCount}</div>
            <div className="text-[10px] text-gray-400">Abweichungen</div>
          </div>
        </div>
      </div>

      {/* Topic Scores */}
      <TopicScoreTable topics={topicScoresFormatted} />

      {/* Most Reliable Members */}
      {reliableMembers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
            Programmtreueste Abgeordnete
          </h3>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left">
                <th className="py-2 text-gray-500 font-medium">Name</th>
                <th className="py-2 text-gray-500 font-medium text-right">Konsistent</th>
                <th className="py-2 text-gray-500 font-medium text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {reliableMembers.map((m) => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="py-2">
                    <Link href={`/abgeordnete/${m.id}`} className="hover:text-[#1a56b8]">
                      {m.name}
                    </Link>
                    {m.constituency && (
                      <span className="text-gray-400 text-[11px] ml-1">· {m.constituency}</span>
                    )}
                    {m.legislature && (
                      <span className="text-gray-400 text-[11px] ml-1">· {m.legislature}</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-gray-500">
                    {m.consistent} / {m.total}
                  </td>
                  <td className="py-2 text-right">
                    <span className="font-semibold text-[#2e7d32]">{m.score}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Most Deviating Members */}
      {deviatingMembers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
            Abgeordnete mit den meisten Abweichungen
          </h3>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left">
                <th className="py-2 text-gray-500 font-medium">Name</th>
                <th className="py-2 text-gray-500 font-medium text-right">Abweichungen</th>
                <th className="py-2 text-gray-500 font-medium text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {deviatingMembers.map((m) => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="py-2">
                    <Link href={`/abgeordnete/${m.id}`} className="hover:text-[#1a56b8]">
                      {m.name}
                    </Link>
                    {m.constituency && (
                      <span className="text-gray-400 text-[11px] ml-1">· {m.constituency}</span>
                    )}
                    {m.legislature && (
                      <span className="text-gray-400 text-[11px] ml-1">· {m.legislature}</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <span className={`font-semibold ${
                      m.deviations >= 5 ? "text-[#c62828]" : m.deviations >= 2 ? "text-[#e65100]" : "text-gray-500"
                    }`}>
                      {m.deviations}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <span className="font-semibold text-gray-500">{m.score}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-[11px] text-gray-400 mt-4 pt-4 border-t border-gray-100">
        Hinweis: Die Einschätzung basiert ausschließlich auf dem automatisierten Abgleich von Wahlprogramm-Positionen
        mit namentlichen Abstimmungen. Nicht alle parlamentarischen Aktivitäten werden durch Abstimmungen abgebildet.
        Die Bewertung erhebt keinen Anspruch auf Vollständigkeit.
      </div>
    </div>
  );
}
