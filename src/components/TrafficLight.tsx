import { getScoreColor, getScoreBgColor } from "@/lib/constants";

export function ScoreBar({ score }: { score: number }) {
  return (
    <span
      className="inline-block w-20 h-1.5 rounded-full align-middle ml-1.5 relative"
      style={{ backgroundColor: getScoreBgColor(score) }}
    >
      <span
        className="absolute left-0 top-0 h-1.5 rounded-full"
        style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
      />
    </span>
  );
}

export function ScoreText({ score }: { score: number }) {
  return (
    <span className="font-semibold" style={{ color: getScoreColor(score) }}>
      {score}%
    </span>
  );
}

export function DeviationTag({ alignment }: { alignment: number }) {
  if (alignment >= 0.7) {
    return (
      <span className="bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-semibold px-2 py-0.5 rounded">
        KONSISTENT
      </span>
    );
  }
  if (alignment >= 0.5) {
    return (
      <span className="bg-[#fff3e0] text-[#e65100] text-[10px] font-semibold px-2 py-0.5 rounded">
        TEILWEISE
      </span>
    );
  }
  return (
    <span className="bg-[#ffebee] text-[#c62828] text-[10px] font-semibold px-2 py-0.5 rounded">
      ABWEICHUNG
    </span>
  );
}
