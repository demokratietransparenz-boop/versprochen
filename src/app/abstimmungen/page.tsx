import { supabase } from "@/lib/supabase";
import { cleanSourceUrl } from "@/lib/constants";
import { DeviationTag } from "@/components/TrafficLight";
import { VoteFilters } from "@/components/VoteFilters";
import { TOPIC_CATEGORIES } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AbstimmungenPage({
  searchParams,
}: {
  searchParams: {
    parliament?: string;
    category?: string;
    party?: string;
    member?: string;
  };
}) {
  // Build vote query with filters
  let query = supabase
    .from("votes")
    .select(`
      id, title, date, topic_category, source_url, analysis_status,
      parliaments!inner(name, legislature)
    `)
    .eq("analysis_status", "analyzed")
    .order("date", { ascending: false })
    .limit(200);

  if (searchParams.parliament) {
    query = query.eq("parliament_id", searchParams.parliament);
  }
  if (searchParams.category) {
    query = query.eq("topic_category", searchParams.category);
  }

  const { data: votes } = await query;

  // Get analyses for these votes
  const voteIds = votes?.map((v) => v.id) ?? [];
  let analyses: any[] = [];
  if (voteIds.length > 0) {
    let analysisQuery = supabase
      .from("analyses")
      .select("vote_id, alignment, confidence, party_id, parties!inner(name)")
      .in("vote_id", voteIds)
      .gte("confidence", 0.8);

    if (searchParams.party) {
      analysisQuery = analysisQuery.eq("party_id", searchParams.party);
    }

    const { data } = await analysisQuery;
    analyses = data ?? [];
  }

  // If member filter is active, get that member's vote results
  let memberVoteMap = new Map<string, string>();
  let memberInfo: any = null;
  if (searchParams.member) {
    const { data: member } = await supabase
      .from("members")
      .select("id, name, party_id, parties!inner(name)")
      .eq("id", searchParams.member)
      .single();
    memberInfo = member;

    const { data: memberVotes } = await supabase
      .from("vote_results")
      .select("vote_id, result")
      .eq("member_id", searchParams.member)
      .in("vote_id", voteIds.length > 0 ? voteIds : ["00000000-0000-0000-0000-000000000000"]);

    for (const mv of memberVotes ?? []) {
      memberVoteMap.set(mv.vote_id, mv.result);
    }
  }

  // Compute average alignment per vote (or per party if filtered)
  const avgAlignmentMap = new Map<string, { avg: number; parties: string[] }>();
  const grouped = new Map<string, { alignments: number[]; parties: string[] }>();
  for (const a of analyses) {
    const g = grouped.get(a.vote_id) ?? { alignments: [], parties: [] };
    g.alignments.push(a.alignment);
    g.parties.push((a as any).parties.name);
    grouped.set(a.vote_id, g);
  }
  for (const [voteId, g] of grouped) {
    avgAlignmentMap.set(voteId, {
      avg: g.alignments.reduce((a, b) => a + b, 0) / g.alignments.length,
      parties: [...new Set(g.parties)],
    });
  }

  // If party or member filter active, only show votes that have analyses
  let filteredVotes = votes ?? [];
  if (searchParams.party) {
    const analysisVoteIds = new Set(analyses.map((a) => a.vote_id));
    filteredVotes = filteredVotes.filter((v) => analysisVoteIds.has(v.id));
  }
  if (searchParams.member) {
    filteredVotes = filteredVotes.filter((v) => memberVoteMap.has(v.id));
  }

  // Get filter options
  const { data: filterParliaments } = await supabase
    .from("parliaments")
    .select("id, name, legislature")
    .neq("data_status", "unavailable")
    .order("legislature", { ascending: false });

  const { data: filterParties } = await supabase
    .from("parties")
    .select("id, name")
    .order("name");

  // Get members (limit to relevant ones for performance)
  let memberQuery = supabase
    .from("members")
    .select("id, name, parties!inner(name)")
    .order("name")
    .limit(2000);

  if (searchParams.party) {
    memberQuery = memberQuery.eq("party_id", searchParams.party);
  }

  const { data: filterMembers } = await memberQuery;

  // Deduplicate members by name (same person across Wahlperioden)
  const uniqueMembers = new Map<string, { value: string; label: string }>();
  for (const m of filterMembers ?? []) {
    const label = `${m.name} (${(m as any).parties.name})`;
    if (!uniqueMembers.has(m.name)) {
      uniqueMembers.set(m.name, { value: m.id, label });
    }
  }

  // Unique categories from actual data
  const usedCategories = [...new Set(votes?.map((v: any) => v.topic_category).filter(Boolean))].sort();

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Abstimmungen</h2>

      <VoteFilters
        parliaments={
          filterParliaments?.map((p) => ({
            value: p.id,
            label: p.legislature,
          })) ?? []
        }
        categories={usedCategories.map((c) => ({ value: c, label: c }))}
        parties={
          filterParties?.map((p) => ({ value: p.id, label: p.name })) ?? []
        }
        members={[...uniqueMembers.values()].sort((a, b) => a.label.localeCompare(b.label))}
      />

      {memberInfo && (
        <div className="mb-3 text-[13px] text-gray-500 bg-blue-50 border border-blue-100 rounded px-3 py-2">
          Zeige Abstimmungen von <strong>{memberInfo.name}</strong> ({(memberInfo as any).parties.name})
        </div>
      )}

      <div className="text-[11px] text-gray-400 mb-2">
        {filteredVotes.length} Abstimmungen gefunden
      </div>

      <div className="border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b-2 border-gray-200 text-left bg-gray-50">
              <th className="py-2 px-4 text-gray-500 font-medium">Datum</th>
              <th className="py-2 px-4 text-gray-500 font-medium">Titel</th>
              <th className="py-2 px-4 text-gray-500 font-medium">Wahlperiode</th>
              <th className="py-2 px-4 text-gray-500 font-medium">Thema</th>
              {searchParams.member && (
                <th className="py-2 px-4 text-gray-500 font-medium">Stimme</th>
              )}
              <th className="py-2 px-4 text-gray-500 font-medium">Übereinstimmung</th>
            </tr>
          </thead>
          <tbody>
            {filteredVotes.map((v: any) => {
              const info = avgAlignmentMap.get(v.id);
              const memberVote = memberVoteMap.get(v.id);
              return (
                <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2.5 px-4 text-gray-400 whitespace-nowrap">
                    {v.date}
                  </td>
                  <td className="py-2.5 px-4">
                    {v.source_url ? (
                      <a
                        href={cleanSourceUrl(v.source_url) ?? ""}
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
                  <td className="py-2.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                    {v.parliaments?.legislature ?? "—"}
                  </td>
                  <td className="py-2.5 px-4 text-gray-500">
                    {v.topic_category ?? "—"}
                  </td>
                  {searchParams.member && (
                    <td className="py-2.5 px-4">
                      {memberVote ? (
                        <span
                          className={`text-[12px] font-medium px-2 py-0.5 rounded ${
                            memberVote === "ja"
                              ? "bg-green-50 text-green-700"
                              : memberVote === "nein"
                                ? "bg-red-50 text-red-700"
                                : memberVote === "enthaltung"
                                  ? "bg-yellow-50 text-yellow-700"
                                  : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {memberVote.toUpperCase()}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  )}
                  <td className="py-2.5 px-4">
                    {info ? (
                      <DeviationTag alignment={info.avg} />
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
