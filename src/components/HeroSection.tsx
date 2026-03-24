"use client";

import { useLanguage } from "@/context/LanguageContext";

interface HeroStats {
  totalVotes: number;
  totalMembers: number;
  totalVoteResults: number;
  parliamentCount: number;
}

export function HeroSection({ stats }: { stats: HeroStats }) {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a6b] text-white rounded-lg px-6 py-8 -mx-4 mb-6">
      <h1 className="text-2xl font-bold mb-2">{t("hero.title")}</h1>
      <p className="text-[15px] text-blue-100 leading-relaxed max-w-2xl mb-4">
        {t("hero.subtitle")}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 mb-5">
        <div className="bg-white/10 rounded px-3 py-2.5 text-center">
          <div className="text-xl font-bold">
            {stats.totalVotes.toLocaleString("de-DE")}
          </div>
          <div className="text-[11px] text-blue-200">
            {t("hero.stat.votes")}
          </div>
        </div>
        <div className="bg-white/10 rounded px-3 py-2.5 text-center">
          <div className="text-xl font-bold">
            {stats.totalMembers.toLocaleString("de-DE")}
          </div>
          <div className="text-[11px] text-blue-200">
            {t("hero.stat.members")}
          </div>
        </div>
        <div className="bg-white/10 rounded px-3 py-2.5 text-center">
          <div className="text-xl font-bold">
            {stats.totalVoteResults.toLocaleString("de-DE")}
          </div>
          <div className="text-[11px] text-blue-200">
            {t("hero.stat.individualVotes")}
          </div>
        </div>
        <div className="bg-white/10 rounded px-3 py-2.5 text-center">
          <div className="text-xl font-bold">{stats.parliamentCount}</div>
          <div className="text-[11px] text-blue-200">
            {t("hero.stat.periods")}
          </div>
        </div>
      </div>

      <details className="text-[13px] text-blue-200">
        <summary className="cursor-pointer hover:text-white font-medium">
          {t("hero.howItWorks")}
        </summary>
        <div className="mt-3 space-y-2 text-blue-100 leading-relaxed">
          <div className="flex gap-2">
            <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold shrink-0">
              1
            </span>
            <span>
              <strong>{t("hero.step1.title")}</strong> {t("hero.step1.text")}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold shrink-0">
              2
            </span>
            <span>
              <strong>{t("hero.step2.title")}</strong> {t("hero.step2.text")}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold shrink-0">
              3
            </span>
            <span>
              <strong>{t("hero.step3.title")}</strong> {t("hero.step3.text")}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold shrink-0">
              4
            </span>
            <span>
              <strong>{t("hero.step4.title")}</strong> {t("hero.step4.text")}
            </span>
          </div>
        </div>
      </details>
    </div>
  );
}
