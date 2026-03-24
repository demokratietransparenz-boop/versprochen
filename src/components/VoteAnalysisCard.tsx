"use client";

import { DeviationTag } from "./TrafficLight";
import { useLeichteSprache } from "@/hooks/useLeichteSprache";

interface VoteAnalysis {
  vote_title: string;
  vote_date: string;
  actual_result: string;
  expected_vote: string;
  alignment: number;
  reasoning: string;
  reasoning_simple: string | null;
  confidence: number;
  source_url: string | null;
  promise_source: string | null;
}

export function VoteAnalysisCard({ analysis }: { analysis: VoteAnalysis }) {
  const { active: leichteSprache } = useLeichteSprache();
  const reasoning =
    leichteSprache && analysis.reasoning_simple
      ? analysis.reasoning_simple
      : analysis.reasoning;

  // If actual vote matches expected vote, treat as consistent regardless of KI alignment score
  const votesMatch = analysis.actual_result.toLowerCase() === analysis.expected_vote.toLowerCase();
  const effectiveAlignment = votesMatch ? Math.max(analysis.alignment, 0.7) : analysis.alignment;

  return (
    <div className="border border-gray-200 rounded mb-3 overflow-hidden">
      <div className="px-4 py-3.5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-semibold text-gray-900">
            {analysis.vote_title}
          </span>
          <DeviationTag alignment={effectiveAlignment} />
        </div>
        <div className="text-xs text-gray-500 mb-2">
          Gestimmt:{" "}
          <strong
            className={
              analysis.actual_result === analysis.expected_vote
                ? "text-[#2e7d32]"
                : "text-[#c62828]"
            }
          >
            {analysis.actual_result.toUpperCase()}
          </strong>{" "}
          · Wahlprogramm erwartet:{" "}
          <strong className="text-[#2e7d32]">
            {analysis.expected_vote.toUpperCase()}
          </strong>{" "}
          · {analysis.vote_date}
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded p-2.5 text-xs text-gray-500">
          <strong className="text-gray-700">KI-Analyse:</strong> {reasoning}
          <div className="mt-1 text-[11px] text-gray-400">
            Konfidenz: {Math.round(analysis.confidence * 100)}%
            {analysis.source_url && (
              <>
                {" · "}
                <a
                  href={analysis.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1a56b8]"
                >
                  Quelle anzeigen
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
