"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Breadcrumb } from "@/components/Breadcrumb";
import { TopicScoreTable } from "@/components/TopicScoreTable";
import { ScoreText } from "@/components/TrafficLight";
import { PARTY_COLORS } from "@/lib/constants";
import Link from "next/link";

interface MemberRow {
  id: string;
  name: string;
  constituency: string | null;
  legislature: string;
  score: number;
}

interface ReliableMember extends MemberRow {
  consistent: number;
  total: number;
}

interface DeviatingMember extends MemberRow {
  deviations: number;
  consistent: number;
  total: number;
}

interface TopicScore {
  category: string;
  score: number;
}

interface ParteiClientProps {
  partyName: string;
  partyFullName: string;
  partyId: string;
  parliamentId: string;
  parliamentLegislature: string;
  breadcrumbLabel: string;
  isAll: boolean;
  memberCount: number;
  overallScoreValue: number;
  totalAnalyses: number;
  consistentCount: number;
  deviationCount: number;
  topicScoresFormatted: TopicScore[];
  strongTopics: string[];
  weakTopics: string[];
  reliableMembers: ReliableMember[];
  deviatingMembers: DeviatingMember[];
  profile: {
    summary: string;
    positions: string;
    vision: { de: string; en: string; "de-leicht": string };
    economicImpact: { de: string; en: string; "de-leicht": string };
    scenarios: Array<{
      group: { de: string; en: string; "de-leicht": string };
      icon: string;
      impact: { de: string; en: string; "de-leicht": string };
      verdict: "positiv" | "gemischt" | "negativ";
    }>;
  } | null;
}

export function ParteiClient({
  partyName,
  partyFullName,
  partyId,
  parliamentId,
  parliamentLegislature,
  breadcrumbLabel,
  isAll,
  memberCount,
  overallScoreValue,
  totalAnalyses,
  consistentCount,
  deviationCount,
  topicScoresFormatted,
  strongTopics,
  weakTopics,
  reliableMembers,
  deviatingMembers,
  profile,
}: ParteiClientProps) {
  const { t, language } = useLanguage();

  // Build assessment text based on data
  let assessment = "";
  if (overallScoreValue >= 70) {
    assessment = `${partyName} ${t("party.highAlignment")} ${t("party.inAnalyzedVotes").replace("analysierten", String(totalAnalyses))} ${consistentCount} ${t("party.timesConsistent")}`;
  } else if (overallScoreValue >= 50) {
    assessment = `${partyName} ${t("party.mixedAlignment")} ${t("party.mixedDetail").replace("analysierten", String(totalAnalyses))}`;
  } else {
    assessment = `${partyName} ${t("party.lowAlignment")} ${totalAnalyses} ${t("party.inAnalyzedVotes")} ${deviationCount} ${t("party.deviationsRated")}`;
  }

  if (strongTopics.length > 0) {
    assessment += ` ${t("party.strongTopics")} ${strongTopics.join(", ")}.`;
  }
  if (weakTopics.length > 0) {
    assessment += ` ${t("party.weakTopics")} ${weakTopics.join(", ")}.`;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: t("breadcrumb.overview"), href: `/?parliament=${parliamentId}` },
          { label: breadcrumbLabel, href: `/?parliament=${parliamentId}` },
          { label: partyName },
        ]}
      />

      {/* Party Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: PARTY_COLORS[partyName] ?? "#888" }}
        >
          {partyName}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{partyName}</h1>
          <p className="text-[13px] text-gray-400">
            {partyFullName} &middot; {parliamentLegislature} &middot; {memberCount} {t("party.members")}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">
            <ScoreText score={overallScoreValue} />
          </div>
          <div className="text-[11px] text-gray-400">{t("party.overallScore")}</div>
        </div>
      </div>

      {/* Executive Summary / Zukunftsvision */}
      {profile?.vision && (
        <div className="bg-gradient-to-br from-[#0d1b3e] to-[#1a3a6b] text-white rounded-lg p-5 mb-6">
          <h3 className="text-[15px] font-semibold mb-2">
            {language === "en"
              ? `If you vote for ${partyName}, you support this vision:`
              : language === "de-leicht"
                ? `Wenn du ${partyName} wählst, unterstützt du das:`
                : `Wenn Sie ${partyName} wählen, unterstützen Sie diese Zukunftsvision:`}
          </h3>
          <p className="text-[13px] text-blue-100 leading-relaxed">
            {profile.vision[language]}
          </p>
        </div>
      )}

      {/* Economic Impact Assessment */}
      {profile?.economicImpact && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-5 mb-6">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-[18px]">📊</span>
            <h3 className="text-[15px] font-semibold text-gray-900">
              {language === "en"
                ? "Economic Impact Assessment"
                : language === "de-leicht"
                  ? "Was bedeutet das für die Wirtschaft?"
                  : "Wirtschaftliche Folgenabschätzung"}
            </h3>
          </div>
          <p className="text-[13px] text-gray-700 leading-relaxed mb-3">
            {profile.economicImpact[language]}
          </p>
          {/* Scenarios by group */}
          {profile.scenarios && profile.scenarios.length > 0 && (
            <div className="mt-4 pt-3 border-t border-amber-200">
              <h4 className="text-[13px] font-semibold text-gray-900 mb-3">
                {language === "en"
                  ? "Impact by group — what does this mean for you?"
                  : language === "de-leicht"
                    ? "Was bedeutet das für dich?"
                    : "Auswirkungen nach Berufsgruppe — was bedeutet das für Sie?"}
              </h4>
              <div className="space-y-2">
                {profile.scenarios.map((s, i) => (
                  <details key={i} className="group bg-white rounded border border-amber-100">
                    <summary className="cursor-pointer px-4 py-2.5 flex items-center justify-between list-none">
                      <span className="flex items-center gap-2 text-[13px] font-medium text-gray-900">
                        <span className="text-[16px]">{s.icon}</span>
                        {s.group[language]}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          s.verdict === "positiv" ? "bg-green-100 text-green-800" :
                          s.verdict === "negativ" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {language === "en"
                            ? s.verdict === "positiv" ? "positive" : s.verdict === "negativ" ? "negative" : "mixed"
                            : s.verdict === "positiv" ? "positiv" : s.verdict === "negativ" ? "negativ" : "gemischt"}
                        </span>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform text-[10px]">▼</span>
                      </span>
                    </summary>
                    <div className="px-4 pb-3 text-[12px] text-gray-600 leading-relaxed border-t border-amber-50 pt-2">
                      {s.impact[language]}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-amber-700 italic mt-3">
            {language === "en"
              ? "🤖 AI-generated assessment based on the party's program positions and established economic research. This is not a prediction but an informed estimate of likely tendencies."
              : language === "de-leicht"
                ? "🤖 Diese Einschätzung wurde von einer KI erstellt. Sie basiert auf dem Wahlprogramm der Partei und Wissen über Wirtschaft. Es ist keine sichere Vorhersage."
                : "🤖 KI-gestützte Einschätzung basierend auf den Programmpositionen der Partei und wirtschaftswissenschaftlichen Erkenntnissen. Dies ist keine Prognose, sondern eine informierte Abschätzung wahrscheinlicher Tendenzen."}
          </p>
        </div>
      )}

      {/* Party Profile */}
      {profile && (
        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{t("party.aboutParty")}</h3>
          <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
            {profile.summary}
          </p>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            <strong className="text-gray-700">{t("party.programFocus")}</strong> {profile.positions}
          </p>
        </div>
      )}

      {/* Data-Based Assessment */}
      <div className="border border-blue-100 bg-blue-50 rounded-lg p-5 mb-6">
        <h3 className="text-[15px] font-semibold text-gray-900 mb-2">
          {t("party.dataAssessment")}
        </h3>
        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
          {assessment}
        </p>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="text-center bg-white rounded px-3 py-2">
            <div className="text-lg font-bold text-gray-900">{totalAnalyses}</div>
            <div className="text-[10px] text-gray-400">{t("party.analyzedVotes")}</div>
          </div>
          <div className="text-center bg-white rounded px-3 py-2">
            <div className="text-lg font-bold text-[#2e7d32]">{consistentCount}</div>
            <div className="text-[10px] text-gray-400">{t("party.consistent")}</div>
          </div>
          <div className="text-center bg-white rounded px-3 py-2">
            <div className="text-lg font-bold text-[#c62828]">{deviationCount}</div>
            <div className="text-[10px] text-gray-400">{t("party.deviations")}</div>
          </div>
        </div>
      </div>

      {/* Topic Scores */}
      <TopicScoreTable topics={topicScoresFormatted} />

      {/* Most Reliable Members */}
      {reliableMembers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
            {t("party.reliableMembers")}
          </h3>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left">
                <th className="py-2 text-gray-500 font-medium">{t("party.memberName")}</th>
                <th className="py-2 text-gray-500 font-medium text-right">{t("party.memberConsistent")}</th>
                <th className="py-2 text-gray-500 font-medium text-right">{t("party.memberScore")}</th>
              </tr>
            </thead>
            <tbody>
              {reliableMembers.map((m) => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="py-2">
                    <Link href={`/abgeordnete/${m.id}`} className="hover:text-[#1a56b8]">
                      {m.name}
                    </Link>
                    {m.constituency && (
                      <span className="text-gray-400 text-[11px] ml-1">&middot; {m.constituency}</span>
                    )}
                    {m.legislature && (
                      <span className="text-gray-400 text-[11px] ml-1">&middot; {m.legislature}</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-gray-500">
                    {m.consistent} / {m.total}
                  </td>
                  <td className="py-2 text-right">
                    <span className="font-semibold text-[#2e7d32]">{m.score}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Most Deviating Members */}
      {deviatingMembers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
            {t("party.deviatingMembers")}
          </h3>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left">
                <th className="py-2 text-gray-500 font-medium">{t("party.memberName")}</th>
                <th className="py-2 text-gray-500 font-medium text-right">{t("party.memberDeviations")}</th>
                <th className="py-2 text-gray-500 font-medium text-right">{t("party.memberScore")}</th>
              </tr>
            </thead>
            <tbody>
              {deviatingMembers.map((m) => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="py-2">
                    <Link href={`/abgeordnete/${m.id}`} className="hover:text-[#1a56b8]">
                      {m.name}
                    </Link>
                    {m.constituency && (
                      <span className="text-gray-400 text-[11px] ml-1">&middot; {m.constituency}</span>
                    )}
                    {m.legislature && (
                      <span className="text-gray-400 text-[11px] ml-1">&middot; {m.legislature}</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <span className={`font-semibold ${
                      m.deviations >= 5 ? "text-[#c62828]" : m.deviations >= 2 ? "text-[#e65100]" : "text-gray-500"
                    }`}>
                      {m.deviations}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <span className="font-semibold text-gray-500">{m.score}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-[11px] text-gray-400 mt-4 pt-4 border-t border-gray-100">
        {t("party.disclaimer")}
      </div>
    </div>
  );
}
