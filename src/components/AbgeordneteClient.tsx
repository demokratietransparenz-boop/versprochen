"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Breadcrumb } from "@/components/Breadcrumb";
import { VoteAnalysisCard } from "@/components/VoteAnalysisCard";
import { ScoreText } from "@/components/TrafficLight";
import { PARTY_COLORS } from "@/lib/constants";

interface TopicStat {
  topic: string;
  consistent: number;
  deviating: number;
  absent: number;
}

interface AnalysisRow {
  vote_id: string;
  vote_title: string;
  vote_date: string;
  vote_source_url: string | null;
  vote_topic_category: string | null;
  alignment: number;
  confidence: number;
  expected_vote: string;
  reasoning: string;
  reasoning_simple: string | null;
  promise_source: string | null;
  actual_result: string;
}

interface AbgeordneteClientProps {
  memberId: string;
  memberName: string;
  partyName: string;
  partyId: string;
  parliamentId: string;
  parliamentState: string | null;
  parliamentName: string;
  constituency: string | null;
  primaryCommittee: string | null;
  memberScore: number | null;
  sortedTopics: TopicStat[];
  totalAbsent: number;
  totalAnalyses: number;
  analyses: AnalysisRow[];
  activeTopic: string | null;
  activeStatus: string | null;
}

export function AbgeordneteClient({
  memberId,
  memberName,
  partyName,
  partyId,
  parliamentId,
  parliamentState,
  parliamentName,
  constituency,
  primaryCommittee,
  memberScore,
  sortedTopics,
  totalAbsent,
  totalAnalyses,
  analyses,
  activeTopic,
  activeStatus,
}: AbgeordneteClientProps) {
  const { t } = useLanguage();

  const statusLabels: Record<string, string> = {
    konsistent: t("member.consistent"),
    abweichung: t("member.deviation"),
    abwesend: t("member.absent"),
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: t("breadcrumb.overview"), href: "/" },
          {
            label: parliamentState ?? parliamentName,
            href: `/?parliament=${parliamentId}`,
          },
          {
            label: partyName,
            href: `/partei/${parliamentId}/${partyId}`,
          },
          { label: memberName },
        ]}
      />

      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: PARTY_COLORS[partyName] ?? "#888" }}
        >
          {partyName.substring(0, 3)}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{memberName}</h1>
          <p className="text-[13px] text-gray-400">
            {partyName} &middot; {t("member.constituency")} {constituency ?? "\u2014"}
            {primaryCommittee ? ` \u00b7 ${primaryCommittee}` : ""}
          </p>
        </div>
        {memberScore !== null && (
          <div className="text-right">
            <div className="text-3xl font-bold">
              <ScoreText score={memberScore} />
            </div>
            <div className="text-[11px] text-gray-400">{t("member.alignment")}</div>
          </div>
        )}
      </div>

      {/* Topic Deviation Chart */}
      {sortedTopics.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
            {t("member.topicBreakdown")}
          </h3>
          <div className="space-y-2">
            {sortedTopics.map(({ topic, consistent, deviating, absent }) => {
              const total = consistent + deviating + absent;
              const consistentPct = total > 0 ? Math.round((consistent / total) * 100) : 0;
              const deviatingPct = total > 0 ? Math.round((deviating / total) * 100) : 0;
              const absentPct = 100 - consistentPct - deviatingPct;
              return (
                <a key={topic} href={`/abgeordnete/${memberId}${activeTopic === topic ? "" : `?topic=${encodeURIComponent(topic)}`}`} className={`flex items-center gap-3 text-[13px] rounded px-1 -mx-1 py-0.5 hover:bg-gray-50 cursor-pointer ${activeTopic === topic ? "bg-blue-50 ring-1 ring-[#1a56b8]" : ""}`}>
                  <div className="w-32 text-gray-700 shrink-0">{topic}</div>
                  <div className="flex-1 flex h-5 rounded overflow-hidden bg-gray-100">
                    {consistentPct > 0 && (
                      <div
                        className="bg-[#2e7d32] flex items-center justify-center text-white text-[10px] font-medium"
                        style={{ width: `${consistentPct}%` }}
                      >
                        {consistent}
                      </div>
                    )}
                    {deviatingPct > 0 && (
                      <div
                        className="bg-[#c62828] flex items-center justify-center text-white text-[10px] font-medium"
                        style={{ width: `${deviatingPct}%` }}
                      >
                        {deviating}
                      </div>
                    )}
                    {absentPct > 0 && absent > 0 && (
                      <div
                        className="bg-gray-400 flex items-center justify-center text-white text-[10px] font-medium"
                        style={{ width: `${absentPct}%` }}
                      >
                        {absent}
                      </div>
                    )}
                  </div>
                  <div className="w-24 text-right text-gray-400 text-[11px]">
                    {consistent} / {total}
                  </div>
                </a>
              );
            })}
          </div>
          {totalAbsent > 0 && (
            <div className="mt-2 text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded px-3 py-1.5">
              {t("member.absentOf")} {totalAbsent} {t("member.absentVon")} {totalAnalyses} {t("member.absentNote")}
            </div>
          )}
          <div className="flex gap-4 mt-2 text-[11px]">
            {(["konsistent", "abweichung", "abwesend"] as const).map((status) => {
              const colors = { konsistent: "bg-[#2e7d32]", abweichung: "bg-[#c62828]", abwesend: "bg-gray-400" };
              const isActive = activeStatus === status;
              const topicParam = activeTopic ? `&topic=${encodeURIComponent(activeTopic)}` : "";
              const href = isActive
                ? `/abgeordnete/${memberId}${activeTopic ? `?topic=${encodeURIComponent(activeTopic)}` : ""}`
                : `/abgeordnete/${memberId}?status=${status}${topicParam}`;
              return (
                <a key={status} href={href} className={`px-2 py-0.5 rounded cursor-pointer hover:bg-gray-100 ${isActive ? "bg-blue-50 ring-1 ring-[#1a56b8] text-gray-700" : "text-gray-400"}`}>
                  <span className={`inline-block w-2.5 h-2.5 rounded-sm ${colors[status]} mr-1`}></span>
                  {statusLabels[status]}
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-[15px] font-semibold text-gray-900">
          {t("member.votingBehavior")}
          {activeTopic ? ` \u2014 ${activeTopic}` : ""}
          {activeStatus ? ` \u2014 ${statusLabels[activeStatus] ?? activeStatus}` : !activeTopic ? ` (${totalAnalyses} ${t("member.analyzedVotes")})` : ""}
        </h3>
        {(activeTopic || activeStatus) && (
          <a href={`/abgeordnete/${memberId}`} className="text-[12px] text-[#1a56b8] hover:underline">
            {t("member.showAll")}
          </a>
        )}
      </div>

      {analyses.map((a, i) => (
        <VoteAnalysisCard
          key={i}
          analysis={{
            vote_title: a.vote_title,
            vote_date: a.vote_date,
            actual_result: a.actual_result,
            expected_vote: a.expected_vote,
            alignment: a.alignment,
            reasoning: a.reasoning,
            reasoning_simple: a.reasoning_simple,
            confidence: a.confidence,
            source_url: a.vote_source_url,
            promise_source: a.promise_source,
          }}
        />
      ))}

      {totalAnalyses === 0 && (
        <p className="text-sm text-gray-400">
          {t("member.noAnalyses")}
        </p>
      )}
    </div>
  );
}
