import { DeviationTag } from "./TrafficLight";

interface Deviation {
  id: string;
  party_name: string;
  vote_title: string;
  promise_source: string | null;
  date: string;
  alignment: number;
  parliament_name: string;
}

export function DeviationFeed({ deviations }: { deviations: Deviation[] }) {
  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
        Aktuelle Abweichungen
      </h3>
      <div className="border border-gray-200 rounded overflow-hidden">
        {deviations.map((d, i) => (
          <div
            key={d.id}
            className={`flex items-start gap-3 px-4 py-3 ${
              i < deviations.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <DeviationTag alignment={d.alignment} />
            <div>
              <div className="text-[13px] text-gray-900">
                <strong>{d.party_name}</strong> — {d.vote_title}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {d.promise_source ? `Quelle: ${d.promise_source} · ` : ""}
                {d.parliament_name} · {d.date}
              </div>
            </div>
          </div>
        ))}
        {deviations.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Noch keine Analysen vorhanden.
          </div>
        )}
      </div>
    </div>
  );
}
