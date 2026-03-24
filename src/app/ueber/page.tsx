"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { useLanguage } from "@/context/LanguageContext";

export default function UeberPage() {
  const { t } = useLanguage();

  return (
    <div>
      <Breadcrumb items={[{ label: t("breadcrumb.overview"), href: "/" }, { label: t("about.title") }]} />

      <h1 className="text-xl font-bold text-gray-900 mb-4">{t("about.title")}</h1>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
        <p>
          <strong>Versprochen?</strong> {t("about.intro")}
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("about.whyTitle")}</h2>
        <p>{t("about.whyText")}</p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("about.howTitle")}</h2>
        <p>{t("about.howText")}</p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("about.sourcesTitle")}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>{t("about.sourcesVotes")}</strong> {t("about.sourcesVotesText")}</li>
          <li><strong>{t("about.sourcesPrograms")}</strong> {t("about.sourcesProgramsText")}</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("about.neutralityTitle")}</h2>
        <p>{t("about.neutralityText")}</p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("about.openSourceTitle")}</h2>
        <p>
          {t("about.openSourceText")}{" "}
          <a href="https://github.com/demokratietransparenz-boop/versprochen" target="_blank" rel="noopener noreferrer" className="text-[#1a56b8] hover:underline">
            GitHub
          </a>{" "}
          {t("about.openSourceAfter")}
        </p>
      </div>
    </div>
  );
}
