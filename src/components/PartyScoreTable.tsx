import Link from "next/link";
import { ScoreBar, ScoreText } from "./TrafficLight";
import { PARTY_COLORS } from "@/lib/constants";

interface PartyScore {
  party_id: string;
  party_name: string;
  score: number;
  trend: number;
  vote_count: number;
  parliament_slug: string;
}

export function PartyScoreTable({ parties }: { parties: PartyScore[] }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
        Partei-Scores
      </h3>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b-2 border-gray-200 text-left">
            <th className="py-2 text-gray-500 font-medium">Partei</th>
            <th className="py-2 text-gray-500 font-medium">Gesamtscore</th>
            <th className="py-2 text-gray-500 font-medium">Tendenz</th>
            <th className="py-2 text-gray-500 font-medium text-right">Abstimmungen</th>
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
              <td className="py-2.5">
                <span
                  className={
                    p.trend > 0
                      ? "text-[#2e7d32]"
                      : p.trend < 0
                        ? "text-[#c62828]"
                        : "text-gray-400"
                  }
                >
                  {p.trend > 0 ? "+" : ""}
                  {p.trend}%
                </span>
              </td>
              <td className="py-2.5 text-right text-gray-400">{p.vote_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
