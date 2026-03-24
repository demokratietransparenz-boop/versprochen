import { supabase } from "@/lib/supabase";
import { DeviationTag } from "@/components/TrafficLight";
import { TOPIC_CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AbstimmungenPage({
  searchParams,
}: {
  searchParams: { parliament?: string; category?: string };
}) {
  let query = supabase
    .from("votes")
    .select(`
      id, title, date, topic_category, source_url, analysis_status,
      parliaments!inner(name)
    `)
    .eq("analysis_status", "analyzed")
    .order("date", { ascending: false })
    .limit(100);

  if (searchParams.parliament) {
    query = query.eq("parliament_id", searchParams.parliament);
  }
  if (searchParams.category) {
    query = query.eq("topic_category", searchParams.category);
  }

  const { data: votes } = await query;

  const voteIds = votes?.map((v) => v.id) ?? [];
  const { data: analyses } = await supabase
    .from("analyses")
    .select("vote_id, alignment, confidence")
    .in("vote_id", voteIds.length > 0 ? voteIds : ["00000000-0000-0000-0000-000000000000"])
    .gte("confidence", 0.8);

  const avgAlignmentMap = new Map<string, number>();
  if (analyses) {
    const grouped = new Map<string, number[]>();
    for (const a of analyses) {
      const arr = grouped.get(a.vote_id) ?? [];
      arr.push(a.alignment);
      grouped.set(a.vote_id, arr);
    }
    for (const [voteId, alignments] of grouped) {
      avgAlignmentMap.set(
        voteId,
        alignments.reduce((a, b) => a + b, 0) / alignments.length
      );
    }
  }

  const { data: filterParliaments } = await supabase
    .from("parliaments")
    .select("id, name, state")
    .neq("data_status", "unavailable");

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Abstimmungen</h2>

      <div className="flex gap-3 mb-4 flex-wrap">
        <select className="text-[13px] border border-gray-200 rounded px-3 py-1.5 bg-white text-gray-700">
          <option value="">Alle Parlamente</option>
          {filterParliaments?.map((p) => (
            <option key={p.id} value={p.id}>{p.state ?? p.name}</option>
          ))}
        </select>
        <select className="text-[13px] border border-gray-200 rounded px-3 py-1.5 bg-white text-gray-700">
          <option value="">Alle Themenbereiche</option>
          {TOPIC_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b-2 border-gray-200 text-left bg-gray-50">
              <th className="py-2 px-4 text-gray-500 font-medium">Datum</th>
              <th className="py-2 px-4 text-gray-500 font-medium">Titel</th>
              <th className="py-2 px-4 text-gray-500 font-medium">Thema</th>
              <th className="py-2 px-4 text-gray-500 font-medium">Übereinstimmung</th>
            </tr>
          </thead>
          <tbody>
            {votes?.map((v: any) => {
              const avg = avgAlignmentMap.get(v.id);
              return (
                <tr key={v.id} className="border-b border-gray-100">
                  <td className="py-2.5 px-4 text-gray-400 whitespace-nowrap">
                    {v.date}
                  </td>
                  <td className="py-2.5 px-4">
                    {v.source_url ? (
                      <a
                        href={v.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1a56b8] hover:underline"
                      >
                        {v.title}
                      </a>
                    ) : (
                      v.title
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-gray-500">
                    {v.topic_category ?? "—"}
                  </td>
                  <td className="py-2.5 px-4">
                    {avg !== undefined ? (
                      <DeviationTag alignment={avg} />
                    ) : (
                      <span className="text-gray-400 text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
