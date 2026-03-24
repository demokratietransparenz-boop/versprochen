"use client";

import Link from "next/link";
import { ScoreBar, ScoreText } from "./TrafficLight";
import { PARTY_COLORS } from "@/lib/constants";
import { useLanguage } from "@/context/LanguageContext";

interface PartyScore {
  party_id: string;
  party_name: string;
  score: number;
  analysis_count: number;
  parliament_slug: string;
}

export function PartyScoreTable({
  parties,
  voteCount,
}: {
  parties: PartyScore[];
  voteCount: number;
}) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">
          {t("scores.title")}
        </h3>
        <span className="text-[12px] text-gray-400">
          {t("scores.basedOn")} {voteCount} {t("scores.analyzedVotes")}
        </span>
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b-2 border-gray-200 text-left">
            <th className="py-2 text-gray-500 font-medium">{t("scores.party")}</th>
            <th className="py-2 text-gray-500 font-medium">{t("scores.overallScore")}</th>
            <th className="py-2 text-gray-500 font-medium text-right">{t("scores.analyses")}</th>
          </tr>
        </thead>
        <tbody>
          {parties.map((p) => (
            <tr key={p.party_id} className="border-b border-gray-100">
              <td className="py-2.5">
                <Link
                  href={`/partei/${p.parliament_slug}/${p.party_id}`}
                  className="hover:text-[#1a56b8]"
                >
                  <span
                    className="inline-block w-3 h-3 rounded-sm mr-2 align-middle"
                    style={{ backgroundColor: PARTY_COLORS[p.party_name] ?? "#888" }}
                  />
                  <strong>{p.party_name}</strong>
                </Link>
              </td>
              <td className="py-2.5">
                <ScoreText score={p.score} /> <ScoreBar score={p.score} />
              </td>
              <td className="py-2.5 text-right text-gray-400">{p.analysis_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
