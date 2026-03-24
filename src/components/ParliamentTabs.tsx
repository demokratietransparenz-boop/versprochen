"use client";

import Link from "next/link";

interface Parliament {
  id: string;
  name: string;
  state: string | null;
  legislature: string;
}

export function ParliamentTabs({
  parliaments,
  activeId,
}: {
  parliaments: Parliament[];
  activeId: string; // "all" or a specific parliament ID
}) {
  // Group by name (e.g. "Bundestag" with multiple Wahlperioden)
  const groups = new Map<string, Parliament[]>();
  for (const p of parliaments) {
    const key = p.state ?? p.name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  return (
    <div className="mt-5 space-y-2">
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/?parliament=all"
          className={`px-3.5 py-1.5 rounded text-[13px] font-medium ${
            activeId === "all"
              ? "bg-[#1a56b8] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Alle Wahlperioden
        </Link>
        {parliaments
          .sort((a, b) => b.legislature.localeCompare(a.legislature))
          .map((p) => (
          <Link
            key={p.id}
            href={`/?parliament=${p.id}`}
            className={`px-3.5 py-1.5 rounded text-[13px] font-medium ${
              p.id === activeId
                ? "bg-[#1a56b8] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.legislature}
          </Link>
        ))}
      </div>
    </div>
  );
}
