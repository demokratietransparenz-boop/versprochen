"use client";

import { DeviationTag } from "./TrafficLight";
import { useLanguage } from "@/context/LanguageContext";

interface Deviation {
  id: string;
  party_name: string;
  vote_title: string;
  promise_source: string | null;
  promise_text: string;
  expected_vote: string;
  reasoning: string;
  reasoning_simple: string | null;
  date: string;
  alignment: number;
  confidence: number;
  parliament_name: string;
  source_url: string | null;
}

export function DeviationFeed({ deviations }: { deviations: Deviation[] }) {
  const { language, t } = useLanguage();

  const useSimpleReasoning = language === "de-leicht";

  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
        {t("feed.title")}
      </h3>
      <div className="border border-gray-200 rounded overflow-hidden">
        {deviations.map((d, i) => {
          const reasoning =
            useSimpleReasoning && d.reasoning_simple
              ? d.reasoning_simple
              : d.reasoning;

          return (
            <div key={d.id} className={`px-4 py-3 ${i < deviations.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div className="flex items-center gap-3 mb-2">
                <DeviationTag alignment={d.alignment} />
                <div className="text-[13px] text-gray-900">
                  <strong>{d.party_name}</strong> — {d.vote_title}
                </div>
              </div>
              <div className="ml-0 bg-gray-50 border border-gray-100 rounded p-3 text-xs">
                <div className="text-gray-700 mb-1.5">
                  <strong>{t("feed.program")}</strong> &bdquo;{d.promise_text}&ldquo;
                  <span className="text-gray-400 ml-1">({d.promise_source})</span>
                </div>
                <div className="text-gray-500 mb-1.5">
                  {t("feed.expected")} <strong className="text-gray-900">{d.expected_vote.toUpperCase()}</strong> &middot;
                  {" "}{t("feed.actual")} <strong className="text-gray-900">
                    {d.alignment >= 0.5 ? d.expected_vote.toUpperCase() : (d.expected_vote === "ja" ? "NEIN" : "JA")}
                  </strong> &middot;
                  {" "}{d.parliament_name} &middot; {d.date}
                </div>
                <div className="text-gray-500">
                  <strong className="text-gray-700">{t("feed.aiAnalysis")}</strong> {reasoning}
                  <span className="text-gray-400 ml-1">
                    ({t("feed.confidence")} {Math.round(d.confidence * 100)}%)
                  </span>
                </div>
                <div className="flex gap-3 mt-2 pt-2 border-t border-gray-100">
                  {d.source_url && (
                    <a
                      href={d.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-[#1a56b8] hover:underline"
                    >
                      abgeordnetenwatch.de
                    </a>
                  )}
                  <a
                    href="https://www.bundestag.de/parlament/plenum/abstimmung/liste"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-[#1a56b8] hover:underline"
                  >
                    bundestag.de
                  </a>
                  <span className="text-[12px] text-gray-400">{d.date}</span>
                </div>
              </div>
            </div>
          );
        })}
        {deviations.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            {t("feed.empty")}
          </div>
        )}
      </div>
    </div>
  );
}
