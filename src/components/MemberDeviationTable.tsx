"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface MemberDeviation {
  id: string;
  name: string;
  constituency: string | null;
  legislature?: string;
  deviations: number;
}

export function MemberDeviationTable({ members }: { members: MemberDeviation[] }) {
  const { t } = useLanguage();

  return (
    <div>
      <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
        {t("memberDeviation.title")}
      </h3>
      <table className="w-full text-[13px]">
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-gray-100">
              <td className="py-2.5">
                <Link href={`/abgeordnete/${m.id}`} className="hover:text-[#1a56b8]">
                  {m.name}
                </Link>
                {m.constituency && (
                  <span className="text-gray-400 text-[11px] ml-1">
                    · {t("memberDeviation.constituency")} {m.constituency}
                  </span>
                )}
                {m.legislature && (
                  <span className="text-gray-400 text-[11px] ml-1">
                    · {m.legislature}
                  </span>
                )}
              </td>
              <td className="py-2.5 text-right">
                <span
                  className={`font-semibold ${
                    m.deviations >= 5
                      ? "text-[#c62828]"
                      : m.deviations >= 2
                        ? "text-[#e65100]"
                        : "text-gray-500"
                  }`}
                >
                  {m.deviations} {t("memberDeviation.deviations")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
