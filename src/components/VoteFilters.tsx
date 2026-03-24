"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

interface FilterOption {
  value: string;
  label: string;
}

export function VoteFilters({
  parliaments,
  categories,
  parties,
  members,
}: {
  parliaments: FilterOption[];
  categories: FilterOption[];
  parties: FilterOption[];
  members: FilterOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const currentParliament = searchParams.get("parliament") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentParty = searchParams.get("party") ?? "";
  const currentMember = searchParams.get("member") ?? "";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/abstimmungen?${params.toString()}`);
  }

  return (
    <div className="flex gap-3 mb-4 flex-wrap">
      <select
        value={currentParliament}
        onChange={(e) => updateFilter("parliament", e.target.value)}
        className="text-[13px] border border-gray-200 rounded px-3 py-1.5 bg-white text-gray-700"
      >
        <option value="">{t("filters.allPeriods")}</option>
        {parliaments.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      <select
        value={currentCategory}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="text-[13px] border border-gray-200 rounded px-3 py-1.5 bg-white text-gray-700"
      >
        <option value="">{t("filters.allTopics")}</option>
        {categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        value={currentParty}
        onChange={(e) => updateFilter("party", e.target.value)}
        className="text-[13px] border border-gray-200 rounded px-3 py-1.5 bg-white text-gray-700"
      >
        <option value="">{t("filters.allParties")}</option>
        {parties.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      <select
        value={currentMember}
        onChange={(e) => updateFilter("member", e.target.value)}
        className="text-[13px] border border-gray-200 rounded px-3 py-1.5 bg-white text-gray-700"
      >
        <option value="">{t("filters.allMembers")}</option>
        {members.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      {(currentParliament || currentCategory || currentParty || currentMember) && (
        <a
          href="/abstimmungen"
          className="text-[12px] text-[#1a56b8] hover:underline self-center"
        >
          {t("filters.reset")}
        </a>
      )}
    </div>
  );
}
