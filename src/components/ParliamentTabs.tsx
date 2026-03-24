"use client";

import Link from "next/link";

interface Parliament {
  id: string;
  name: string;
  state: string | null;
}

export function ParliamentTabs({
  parliaments,
  activeId,
}: {
  parliaments: Parliament[];
  activeId: string;
}) {
  return (
    <div className="flex gap-2 flex-wrap mt-5">
      {parliaments.map((p) => (
        <Link
          key={p.id}
          href={`/?parliament=${p.id}`}
          className={`px-3.5 py-1.5 rounded text-[13px] font-medium ${
            p.id === activeId
              ? "bg-[#1a56b8] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {p.state ?? p.name}
        </Link>
      ))}
    </div>
  );
}
