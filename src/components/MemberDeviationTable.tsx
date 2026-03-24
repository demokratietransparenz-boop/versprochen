import Link from "next/link";

interface MemberDeviation {
  id: string;
  name: string;
  constituency: string | null;
  deviations: number;
}

export function MemberDeviationTable({ members }: { members: MemberDeviation[] }) {
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
        Abgeordnete mit den meisten Abweichungen
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
                    · Wahlkreis {m.constituency}
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
                  {m.deviations} Abweichungen
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
