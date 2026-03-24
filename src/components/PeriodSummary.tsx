"use client";

import { useLanguage } from "@/context/LanguageContext";

interface PeriodSummaryProps {
  periodLabel: string | null;
  voteCount: number;
  parliamentCount: number | null;
  isAll: boolean;
}

export function PeriodSummary({ periodLabel, voteCount, parliamentCount, isAll }: PeriodSummaryProps) {
  const { t } = useLanguage();

  const label = isAll ? t("tabs.allPeriods") : (periodLabel ?? "");

  return (
    <div className="mt-4 text-xs text-gray-400">
      {label} · {voteCount} {t("home.votesAnalyzed")}
      {isAll && parliamentCount
        ? ` · ${parliamentCount} ${t("home.legislativePeriods")}`
        : ""}
    </div>
  );
}
