import { ScoreText } from "./TrafficLight";

interface TopicScore {
  category: string;
  score: number;
}

export function TopicScoreTable({ topics }: { topics: TopicScore[] }) {
  return (
    <div className="mb-6">
      <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
        Themenbereich-Scores
      </h3>
      <table className="w-full text-[13px]">
        <tbody>
          {topics.map((t) => (
            <tr key={t.category} className="border-b border-gray-100">
              <td className="py-2 text-gray-700">{t.category}</td>
              <td className="py-2 w-16 text-right">
                <ScoreText score={t.score} />
              </td>
              <td className="py-2 px-3 w-28">
                <div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: `${t.score >= 70 ? "#e8f5e9" : t.score >= 50 ? "#fff3e0" : "#ffebee"}` }}
                >
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${t.score}%`,
                      backgroundColor: `${t.score >= 70 ? "#2e7d32" : t.score >= 50 ? "#e65100" : "#c62828"}`,
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
