import { supabase } from "@/lib/supabase";
import { ParteienClient } from "@/components/ParteienClient";

export const dynamic = "force-dynamic";

export default async function ParteienPage() {
  const { data: parties } = await supabase
    .from("parties")
    .select("id, name, full_name")
    .order("name");

  const { data: analyses } = await supabase
    .from("analyses")
    .select("party_id, alignment")
    .gte("confidence", 0.8)
    .limit(5000);

  // Aggregate scores per party
  const partyAgg: Record<string, { total: number; alignedSum: number; consistent: number; deviations: number }> = {};
  for (const a of analyses ?? []) {
    if (!partyAgg[a.party_id]) partyAgg[a.party_id] = { total: 0, alignedSum: 0, consistent: 0, deviations: 0 };
    partyAgg[a.party_id].total++;
    partyAgg[a.party_id].alignedSum += a.alignment;
    if (a.alignment >= 0.5) partyAgg[a.party_id].consistent++;
    else partyAgg[a.party_id].deviations++;
  }

  const partyData = (parties ?? [])
    .map((p) => {
      const agg = partyAgg[p.id];
      return {
        id: p.id,
        name: p.name,
        fullName: p.full_name,
        score: agg && agg.total > 0 ? Math.round((agg.alignedSum / agg.total) * 100) : 0,
        analysisCount: agg?.total ?? 0,
        consistent: agg?.consistent ?? 0,
        deviations: agg?.deviations ?? 0,
      };
    })
    .filter((p) => p.analysisCount > 0)
    .sort((a, b) => b.score - a.score);

  return <ParteienClient parties={partyData} />;
}
