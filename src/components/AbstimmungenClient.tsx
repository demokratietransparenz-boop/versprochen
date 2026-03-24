"use client";

import { useLanguage } from "@/context/LanguageContext";
import { DeviationTag } from "@/components/TrafficLight";
import { VoteFilters } from "@/components/VoteFilters";
import { cleanSourceUrl } from "@/lib/constants";
import Link from "next/link";

interface FilterOption {
  value: string;
  label: string;
}

interface VoteRow {
  id: string;
  title: string;
  date: string;
  topic_category: string | null;
  source_url: string | null;
  legislature: string | null;
}

interface AbstimmungenClientProps {
  filteredVotes: VoteRow[];
  avgAlignmentMap: Record<string, { avg: number; parties: string[] }>;
  memberVoteMap: Record<string, string>;
  memberInfo: { name: string; partyName: string } | null;
  showMemberColumn: boolean;
  filterParliaments: FilterOption[];
  filterCategories: FilterOption[];
  filterParties: FilterOption[];
  filterMembers: FilterOption[];
}

export function AbstimmungenClient({
  filteredVotes,
  avgAlignmentMap,
  memberVoteMap,
  memberInfo,
  showMemberColumn,
  filterParliaments,
  filterCategories,
  filterParties,
  filterMembers,
}: AbstimmungenClientProps) {
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">{t("votes.title")}</h2>

      <VoteFilters
        parliaments={filterParliaments}
        categories={filterCategories}
        parties={filterParties}
        members={filterMembers}
      />

      {memberInfo && (
        <div className="mb-3 text-[13px] text-gray-500 bg-blue-50 border border-blue-100 rounded px-3 py-2">
          {t("votes.showingVotesOf")} <strong>{memberInfo.name}</strong> ({memberInfo.partyName})
        </div>
      )}

      <div className="text-[11px] text-gray-400 mb-2">
        {filteredVotes.length} {t("votes.found")}
      </div>

      <div className="border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b-2 border-gray-200 text-left bg-gray-50">
              <th className="py-2 px-4 text-gray-500 font-medium">{t("votes.date")}</th>
              <th className="py-2 px-4 text-gray-500 font-medium">{t("votes.titleHeader")}</th>
              <th className="py-2 px-4 text-gray-500 font-medium">{t("votes.period")}</th>
              <th className="py-2 px-4 text-gray-500 font-medium">{t("votes.topic")}</th>
              {showMemberColumn && (
                <th className="py-2 px-4 text-gray-500 font-medium">{t("votes.voteResult")}</th>
              )}
              <th className="py-2 px-4 text-gray-500 font-medium">{t("votes.alignment")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredVotes.map((v) => {
              const info = avgAlignmentMap[v.id];
              const memberVote = memberVoteMap[v.id];
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
                    {v.legislature ?? "\u2014"}
                  </td>
                  <td className="py-2.5 px-4 text-gray-500">
                    {v.topic_category ?? "\u2014"}
                  </td>
                  {showMemberColumn && (
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
                        "\u2014"
                      )}
                    </td>
                  )}
                  <td className="py-2.5 px-4">
                    {info ? (
                      <DeviationTag alignment={info.avg} />
                    ) : (
                      <span className="text-gray-400 text-[11px]">&mdash;</span>
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
