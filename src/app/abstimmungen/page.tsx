import { supabase } from "@/lib/supabase";
import { AbstimmungenClient } from "@/components/AbstimmungenClient";

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
  let memberVoteMap: Record<string, string> = {};
  let memberInfo: { name: string; partyName: string } | null = null;
  if (searchParams.member) {
    const { data: member } = await supabase
      .from("members")
      .select("id, name, party_id, parties!inner(name)")
      .eq("id", searchParams.member)
      .single();

    if (member) {
      memberInfo = { name: member.name, partyName: (member as any).parties.name };
    }

    const { data: memberVotes } = await supabase
      .from("vote_results")
      .select("vote_id, result")
      .eq("member_id", searchParams.member)
      .in("vote_id", voteIds.length > 0 ? voteIds : ["00000000-0000-0000-0000-000000000000"]);

    for (const mv of memberVotes ?? []) {
      memberVoteMap[mv.vote_id] = mv.result;
    }
  }

  // Compute average alignment per vote (or per party if filtered)
  const avgAlignmentMap: Record<string, { avg: number; parties: string[] }> = {};
  const grouped = new Map<string, { alignments: number[]; parties: string[] }>();
  for (const a of analyses) {
    const g = grouped.get(a.vote_id) ?? { alignments: [], parties: [] };
    g.alignments.push(a.alignment);
    g.parties.push((a as any).parties.name);
    grouped.set(a.vote_id, g);
  }
  for (const [voteId, g] of grouped) {
    avgAlignmentMap[voteId] = {
      avg: g.alignments.reduce((a, b) => a + b, 0) / g.alignments.length,
      parties: [...new Set(g.parties)],
    };
  }

  // If party or member filter active, only show votes that have analyses
  let filteredVotes = votes ?? [];
  if (searchParams.party) {
    const analysisVoteIds = new Set(analyses.map((a) => a.vote_id));
    filteredVotes = filteredVotes.filter((v) => analysisVoteIds.has(v.id));
  }
  if (searchParams.member) {
    filteredVotes = filteredVotes.filter((v) => memberVoteMap[v.id]);
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

  // Get all members (paginated to bypass Supabase 1000-row limit)
  let allMembers: any[] = [];
  let memberOffset = 0;
  const memberBatchSize = 1000;
  while (true) {
    let memberQuery = supabase
      .from("members")
      .select("id, name, parties!inner(name)")
      .order("name")
      .range(memberOffset, memberOffset + memberBatchSize - 1);

    if (searchParams.party) {
      memberQuery = memberQuery.eq("party_id", searchParams.party);
    }

    const { data: batch } = await memberQuery;
    if (!batch?.length) break;
    allMembers.push(...batch);
    if (batch.length < memberBatchSize) break;
    memberOffset += memberBatchSize;
  }
  const filterMembers = allMembers;

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

  // Serialize vote data for client
  const voteRows = filteredVotes.map((v: any) => ({
    id: v.id,
    title: v.title,
    date: v.date,
    topic_category: v.topic_category,
    source_url: v.source_url,
    legislature: v.parliaments?.legislature ?? null,
  }));

  return (
    <AbstimmungenClient
      filteredVotes={voteRows}
      avgAlignmentMap={avgAlignmentMap}
      memberVoteMap={memberVoteMap}
      memberInfo={memberInfo}
      showMemberColumn={!!searchParams.member}
      filterParliaments={
        filterParliaments?.map((p) => ({
          value: p.id,
          label: p.legislature,
        })) ?? []
      }
      filterCategories={usedCategories.map((c) => ({ value: c, label: c }))}
      filterParties={
        filterParties?.map((p) => ({ value: p.id, label: p.name })) ?? []
      }
      filterMembers={[...uniqueMembers.values()].sort((a, b) => a.label.localeCompare(b.label))}
    />
  );
}
