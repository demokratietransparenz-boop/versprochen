"use client";

import Link from "next/link";
import { ScoreBar, ScoreText } from "./TrafficLight";
import { PARTY_COLORS } from "@/lib/constants";
import { useLanguage } from "@/context/LanguageContext";

interface PartyData {
  id: string;
  name: string;
  fullName: string;
  score: number;
  analysisCount: number;
  consistent: number;
  deviations: number;
}

export function ParteienClient({ parties }: { parties: PartyData[] }) {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t("nav.parties")}
      </h1>
      <p className="text-[14px] text-gray-500 mb-6 max-w-2xl">
        {t("parties.subtitle")}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {parties.map((p) => (
          <Link
            key={p.id}
            href={`/partei/all/${p.id}`}
            className="group block border border-gray-200 rounded-lg p-5 hover:border-[#1a56b8] hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-[11px]"
                style={{ backgroundColor: PARTY_COLORS[p.name] ?? "#888" }}
              >
                {p.name}
              </div>
              <div className="flex-1">
                <h2 className="text-[15px] font-bold text-gray-900 group-hover:text-[#1a56b8] transition-colors">
                  {p.name}
                </h2>
                <p className="text-[11px] text-gray-400">{p.fullName}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold">
                  <ScoreText score={p.score} />
                </div>
              </div>
            </div>

            <ScoreBar score={p.score} />

            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div>
                <div className="text-[13px] font-semibold text-gray-900">{p.analysisCount}</div>
                <div className="text-[10px] text-gray-400">
                  {t("parties.analyses")}
                </div>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#2e7d32]">{p.consistent}</div>
                <div className="text-[10px] text-gray-400">
                  {t("party.consistent")}
                </div>
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#c62828]">{p.deviations}</div>
                <div className="text-[10px] text-gray-400">
                  {t("party.deviations")}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 text-[12px] text-gray-400 group-hover:text-[#1a56b8] transition-colors flex items-center justify-between">
              <span>
                {t("parties.detailLink")}
              </span>
              <span className="text-[14px]">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
