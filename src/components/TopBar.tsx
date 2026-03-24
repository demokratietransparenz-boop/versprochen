"use client";

import { useLeichteSprache } from "@/hooks/useLeichteSprache";

export function TopBar() {
  const { active, toggle } = useLeichteSprache();

  return (
    <div className="bg-gray-100 border-b border-gray-300 px-6 py-1.5 text-xs text-gray-500 flex justify-between">
      <span>Transparenz für die Demokratie</span>
      <div className="flex gap-3">
        <button
          onClick={toggle}
          className={`${active ? "text-blue-700 font-semibold" : "text-blue-600"} hover:underline`}
        >
          {active ? "✓ Leichte Sprache" : "Leichte Sprache"}
        </button>
        <a href="/ueber" className="hover:text-[#1a56b8]">Über das Projekt</a>
        <a href="/methodik" className="hover:text-[#1a56b8]">Methodik</a>
      </div>
    </div>
  );
}
