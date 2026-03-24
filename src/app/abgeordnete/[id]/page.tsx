import { supabase } from "@/lib/supabase";
import { Breadcrumb } from "@/components/Breadcrumb";
import { VoteAnalysisCard } from "@/components/VoteAnalysisCard";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export default async function AbgeordnetePage({
  params,
}: {
  params: { id: string };
}) {
  const { data: member } = await supabase
    .from("members")
    .select("*, parties(*), parliaments(*)")
    .eq("id", params.id)
    .single();

  if (!member) return notFound();

  const party = (member as any).parties;
  const parliament = (member as any).parliaments;

  const { data: voteResults } = await supabase
    .from("vote_results")
    .select("vote_id, result")
    .eq("member_id", member.id);

  const voteIds = voteResults?.map((r) => r.vote_id) ?? [];
  const voteResultMap = new Map(voteResults?.map((r) => [r.vote_id, r.result]) ?? []);

  const { data: analyses } = await supabase
    .from("analyses")
    .select(`
      alignment, reasoning, reasoning_simple, confidence, expected_vote, vote_id,
      votes!inner(title, date, source_url),
      promises!inner(source)
    `)
    .eq("party_id", party.id)
    .in("vote_id", voteIds.length > 0 ? voteIds : ["00000000-0000-0000-0000-000000000000"])
    .gte("confidence", 0.8)
    .order("created_at", { ascending: false });

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Übersicht", href: "/" },
          {
            label: parliament.state ?? parliament.name,
            href: `/?parliament=${parliament.id}`,
          },
          {
            label: party.name,
            href: `/partei/${parliament.id}/${party.name.toLowerCase()}`,
          },
          { label: member.name },
        ]}
      />

      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div className="w-14 h-14 bg-gray-200 rounded-full" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">{member.name}</h1>
          <p className="text-[13px] text-gray-400">
            {party.name} · Wahlkreis {member.constituency ?? "—"}
            {member.primary_committee ? ` · ${member.primary_committee}` : ""}
          </p>
        </div>
      </div>

      <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
        Abstimmungsverhalten
      </h3>

      {analyses?.map((a: any, i: number) => (
        <VoteAnalysisCard
          key={i}
          analysis={{
            vote_title: a.votes.title,
            vote_date: a.votes.date,
            actual_result: voteResultMap.get(a.vote_id) ?? "abwesend",
            expected_vote: a.expected_vote,
            alignment: a.alignment,
            reasoning: a.reasoning,
            reasoning_simple: a.reasoning_simple,
            confidence: a.confidence,
            source_url: a.votes.source_url,
            promise_source: a.promises.source,
          }}
        />
      ))}

      {(!analyses || analyses.length === 0) && (
        <p className="text-sm text-gray-400">
          Noch keine analysierten Abstimmungen für diesen Abgeordneten.
        </p>
      )}
    </div>
  );
}
