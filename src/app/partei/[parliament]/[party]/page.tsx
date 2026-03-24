import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ParteiClient } from "@/components/ParteiClient";

export const dynamic = "force-dynamic";

// Neutral party descriptions based on public knowledge
const PARTY_PROFILES: Record<string, { summary: string; positions: string; vision: { de: string; en: string; "de-leicht": string } }> = {
  "SPD": {
    summary: "Die Sozialdemokratische Partei Deutschlands ist eine der ältesten Parteien Deutschlands. Sie positioniert sich als Mitte-Links-Partei mit Schwerpunkten auf sozialer Gerechtigkeit, Arbeitnehmerrechten und einem starken Sozialstaat.",
    positions: "Kernthemen sind Mindestlohn, bezahlbares Wohnen, Klimaschutz mit sozialer Abfederung, Stärkung des öffentlichen Gesundheitswesens und europäische Integration.",
    vision: {
      de: "Die SPD steht für ein Deutschland, in dem der Sozialstaat Menschen in jeder Lebenslage absichert. Wer diese Partei wählt, unterstützt eine Zukunft mit höherem Mindestlohn, bezahlbaren Mieten, einem starken öffentlichen Gesundheitssystem und Klimaschutz, der niemanden zurücklässt. Die SPD setzt auf europäische Zusammenarbeit, Investitionen in Bildung und Infrastruktur, und eine Gesellschaft, in der Arbeit sich lohnt und Wohlstand gerecht verteilt wird.",
      "de-leicht": "Die SPD möchte, dass alle Menschen gut leben können. Sie will: mehr Lohn für Arbeiter, günstigere Wohnungen, gute Krankenhäuser für alle, und Klimaschutz, der fair ist. Sie findet Europa wichtig und will, dass Reiche mehr teilen.",
      en: "The SPD stands for a Germany where the welfare state supports people in every phase of life. Voting for this party means supporting a future with higher minimum wages, affordable housing, a strong public health system, and climate protection that leaves no one behind. The SPD focuses on European cooperation, investment in education and infrastructure, and a society where work pays and prosperity is shared fairly.",
    },
  },
  "CDU/CSU": {
    summary: "Die Christlich Demokratische Union und die Christlich-Soziale Union bilden eine Fraktionsgemeinschaft im Bundestag. Sie positioniert sich als bürgerlich-konservative Volkspartei der politischen Mitte.",
    positions: "Kernthemen sind wirtschaftliche Stabilität, innere Sicherheit, eine restriktivere Migrationspolitik, Stärkung der Bundeswehr und die Förderung von Familien und Mittelstand.",
    vision: {
      de: "Die CDU/CSU steht für ein wirtschaftlich starkes und sicheres Deutschland. Wer diese Partei wählt, unterstützt eine Zukunft mit niedrigeren Steuern, weniger Bürokratie, einer starken Bundeswehr und kontrollierter Migration. Die Union setzt auf Eigenverantwortung, Förderung des Mittelstands, traditionelle Familienwerte und solide Staatsfinanzen. Sie will Deutschland als führende Wirtschaftsnation in einem starken Europa erhalten.",
      "de-leicht": "Die CDU/CSU will, dass Deutschland wirtschaftlich stark und sicher ist. Sie will: weniger Steuern, weniger Bürokratie, eine starke Armee und weniger Einwanderung. Familien und kleine Firmen sollen unterstützt werden. Der Staat soll nicht zu viel Geld ausgeben.",
      en: "The CDU/CSU stands for an economically strong and secure Germany. Voting for this party means supporting a future with lower taxes, less bureaucracy, a strong military, and controlled migration. The Union focuses on personal responsibility, support for small and medium businesses, traditional family values, and sound public finances. It aims to maintain Germany as a leading economic power in a strong Europe.",
    },
  },
  "GRÜNE": {
    summary: "Bündnis 90/Die Grünen sind aus der Umwelt- und Friedensbewegung hervorgegangen. Die Partei positioniert sich als ökologisch-progressive Kraft im Mitte-Links-Spektrum.",
    positions: "Kernthemen sind Klimaschutz und Energiewende, soziale Gerechtigkeit, Bürgerrechte, europäische Integration und eine wertegeleitete Außenpolitik.",
    vision: {
      de: "Die Grünen stehen für ein klimaneutrales, gerechtes und weltoffenes Deutschland. Wer diese Partei wählt, unterstützt eine Zukunft mit konsequentem Klimaschutz, 100% erneuerbaren Energien, nachhaltiger Wirtschaft und starken Bürgerrechten. Die Grünen setzen auf eine ökologische Transformation, die neue Arbeitsplätze schafft, eine offene und diverse Gesellschaft, und eine europäische Außenpolitik, die auf Werte und Multilateralismus setzt.",
      "de-leicht": "Die Grünen wollen, dass Deutschland das Klima schützt. Sie wollen: nur noch saubere Energie, eine Wirtschaft die der Natur nicht schadet, gleiche Rechte für alle Menschen, und Zusammenarbeit mit anderen Ländern. Sie finden, dass Klimaschutz auch neue Jobs bringen kann.",
      en: "The Greens stand for a climate-neutral, just, and cosmopolitan Germany. Voting for this party means supporting a future with consistent climate action, 100% renewable energy, a sustainable economy, and strong civil rights. The Greens focus on an ecological transformation that creates new jobs, an open and diverse society, and a European foreign policy based on values and multilateralism.",
    },
  },
  "FDP": {
    summary: "Die Freie Demokratische Partei versteht sich als liberale Partei, die individuelle Freiheit, Eigenverantwortung und Marktwirtschaft in den Mittelpunkt stellt.",
    positions: "Kernthemen sind Steuersenkungen, Bürokratieabbau, Digitalisierung, Bildung als Aufstiegsversprechen und die Einhaltung der Schuldenbremse.",
    vision: {
      de: "Die FDP steht für ein Deutschland der individuellen Freiheit und wirtschaftlichen Dynamik. Wer diese Partei wählt, unterstützt eine Zukunft mit deutlich niedrigeren Steuern, massivem Bürokratieabbau, einer digitalen Verwaltung und Bildung als Aufstiegsmotor. Die FDP setzt auf Technologieoffenheit beim Klimaschutz, die Schuldenbremse als Garant solider Finanzen, und eine Gesellschaft, in der der Staat sich zurückhält und Bürger selbst entscheiden.",
      "de-leicht": "Die FDP will, dass Menschen möglichst frei entscheiden können. Sie will: weniger Steuern, weniger Regeln, besseres Internet und Digitalisierung, gute Schulen für alle. Der Staat soll nicht zu viel bestimmen. Beim Klimaschutz soll Technik helfen, nicht Verbote.",
      en: "The FDP stands for a Germany of individual freedom and economic dynamism. Voting for this party means supporting a future with significantly lower taxes, massive deregulation, a digital administration, and education as a driver of social mobility. The FDP focuses on technology-openness in climate protection, the debt brake as a guarantee of sound finances, and a society where the state steps back and citizens decide for themselves.",
    },
  },
  "AfD": {
    summary: "Die Alternative für Deutschland positioniert sich als rechtspopulistische bis rechtskonservative Partei. Sie entstand 2013 zunächst als EU-kritische Partei und verschob ihren Fokus zunehmend auf Migrationspolitik.",
    positions: "Kernthemen sind eine restriktive Migrationspolitik, EU-Skepsis, Stärkung nationaler Souveränität, Ablehnung der Energiewende in ihrer jetzigen Form und konservative Gesellschaftspolitik.",
    vision: {
      de: "Die AfD steht für ein Deutschland, das nationale Souveränität und kulturelle Identität in den Vordergrund stellt. Wer diese Partei wählt, unterstützt eine Zukunft mit stark begrenzter Einwanderung, Rückführung der EU-Kompetenzen an Nationalstaaten, Beendigung der aktuellen Energiewende zugunsten konventioneller Energiequellen und eine konservative Gesellschaftspolitik. Die AfD setzt auf Grenzschutz, direkte Demokratie und Stärkung der nationalen Eigenständigkeit.",
      "de-leicht": "Die AfD will, dass Deutschland selbst mehr bestimmt. Sie will: viel weniger Einwanderung, weniger Macht für die EU, keine Windräder und Solarpanels wie jetzt, und eine Gesellschaft mit traditionellen Werten. Die Grenzen sollen besser geschützt werden.",
      en: "The AfD stands for a Germany that prioritizes national sovereignty and cultural identity. Voting for this party means supporting a future with strictly limited immigration, returning EU powers to nation states, ending the current energy transition in favor of conventional energy sources, and conservative social policies. The AfD focuses on border security, direct democracy, and strengthening national independence.",
    },
  },
  "LINKE": {
    summary: "Die Linke ist eine demokratisch-sozialistische Partei, die aus der PDS und der WASG hervorgegangen ist. Sie positioniert sich als linke Opposition mit Fokus auf soziale Gerechtigkeit.",
    positions: "Kernthemen sind Umverteilung von Vermögen, Verstaatlichung von Schlüsselindustrien, antimilitaristische Außenpolitik, Mietpreisbremsen und die Stärkung öffentlicher Daseinsvorsorge.",
    vision: {
      de: "Die Linke steht für ein Deutschland mit deutlich weniger sozialer Ungleichheit. Wer diese Partei wählt, unterstützt eine Zukunft mit Vermögensumverteilung, Verstaatlichung von Wohnungskonzernen und Schlüsselindustrien, einem Mietendeckel, gebührenfreier Bildung und einem Ende aller Bundeswehr-Auslandseinsätze. Die Linke setzt auf eine Gesellschaft, in der Grundbedürfnisse wie Wohnen, Gesundheit und Mobilität nicht dem Markt überlassen werden.",
      "de-leicht": "Die Linke will, dass es weniger Unterschied zwischen Arm und Reich gibt. Sie will: Reiche sollen mehr bezahlen, Mieten sollen billiger werden, große Firmen sollen dem Staat gehören, Schule und Uni sollen kostenlos sein, und die Bundeswehr soll nicht im Ausland kämpfen.",
      en: "The Left Party stands for a Germany with significantly less social inequality. Voting for this party means supporting a future with wealth redistribution, nationalization of housing corporations and key industries, rent caps, tuition-free education, and an end to all foreign military deployments. The Left focuses on a society where basic needs like housing, healthcare, and mobility are not left to the market.",
    },
  },
  "BSW": {
    summary: "Das Bündnis Sahra Wagenknecht wurde 2024 gegründet. Die Partei verbindet wirtschaftlich linke Positionen mit konservativen gesellschaftspolitischen Ansichten.",
    positions: "Kernthemen sind soziale Gerechtigkeit, eine restriktivere Migrationspolitik, diplomatische Lösungen im Ukraine-Konflikt, Ablehnung von Waffenlieferungen und Kritik an den etablierten Parteien.",
    vision: {
      de: "Das BSW steht für ein Deutschland, das wirtschaftlich links und gesellschaftspolitisch konservativ denkt. Wer diese Partei wählt, unterstützt eine Zukunft mit höheren Löhnen und besserer Sozialpolitik, aber auch mit kontrollierter Migration und einer Außenpolitik, die auf Diplomatie statt Waffenlieferungen setzt. Das BSW will den Ukraine-Konflikt durch Verhandlungen beenden, Millionäre stärker besteuern und gleichzeitig gesellschaftliche Traditionen bewahren.",
      "de-leicht": "Das BSW will bessere Löhne und mehr Soziales, aber auch weniger Einwanderung. Es will keine Waffen an die Ukraine liefern, sondern Frieden durch Verhandlungen. Reiche sollen mehr Steuern zahlen. Es kritisiert die anderen großen Parteien.",
      en: "The BSW stands for a Germany that thinks economically left and socially conservative. Voting for this party means supporting a future with higher wages and better social policy, but also controlled migration and a foreign policy based on diplomacy rather than arms deliveries. The BSW wants to end the Ukraine conflict through negotiations, tax millionaires more heavily, and preserve social traditions.",
    },
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
