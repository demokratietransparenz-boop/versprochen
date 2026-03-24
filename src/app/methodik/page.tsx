"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { useLanguage } from "@/context/LanguageContext";

export default function MethodikPage() {
  const { t } = useLanguage();

  return (
    <div>
      <Breadcrumb items={[{ label: t("breadcrumb.overview"), href: "/" }, { label: t("methodik.title") }]} />

      <h1 className="text-xl font-bold text-gray-900 mb-4">{t("methodik.title")}</h1>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
        <p>
          {t("methodik.intro")}
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("methodik.dataCollection")}</h2>
        <p>
          {t("methodik.dataCollectionText")}
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("methodik.topicCategorization")}</h2>
        <p>
          {t("methodik.topicCategorizationText")}
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("methodik.promiseMatching")}</h2>
        <p>
          {t("methodik.promiseMatchingText")}
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("methodik.alignmentAssessment")}</h2>
        <p>
          {t("methodik.alignmentAssessmentText1")}
        </p>
        <p>
          {t("methodik.alignmentAssessmentText2")}
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("methodik.trafficLight")}</h2>
        <div className="border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="py-2 px-4 text-left text-gray-500 font-medium">{t("methodik.color")}</th>
                <th className="py-2 px-4 text-left text-gray-500 font-medium">{t("methodik.score")}</th>
                <th className="py-2 px-4 text-left text-gray-500 font-medium">{t("methodik.meaning")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-4"><span className="inline-block w-3 h-3 rounded-full bg-[#2e7d32]"></span> {t("methodik.greenLabel")}</td>
                <td className="py-2 px-4">{"\u2265"} 70%</td>
                <td className="py-2 px-4">{t("methodik.greenMeaning")}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-4"><span className="inline-block w-3 h-3 rounded-full bg-[#e65100]"></span> {t("methodik.yellowLabel")}</td>
                <td className="py-2 px-4">50–69%</td>
                <td className="py-2 px-4">{t("methodik.yellowMeaning")}</td>
              </tr>
              <tr>
                <td className="py-2 px-4"><span className="inline-block w-3 h-3 rounded-full bg-[#c62828]"></span> {t("methodik.redLabel")}</td>
                <td className="py-2 px-4">&lt; 50%</td>
                <td className="py-2 px-4">{t("methodik.redMeaning")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("methodik.confidenceThreshold")}</h2>
        <p>
          {t("methodik.confidenceThresholdText")}
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("methodik.limitations")}</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{t("methodik.limitation1")}</li>
          <li>{t("methodik.limitation2")}</li>
          <li>{t("methodik.limitation3")}</li>
          <li>{t("methodik.limitation4")}</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">{t("methodik.aiModel")}</h2>
        <p>
          {t("methodik.aiModelText")}{" "}
          <a href="https://github.com/demokratietransparenz-boop/versprochen" target="_blank" rel="noopener noreferrer" className="text-[#1a56b8] hover:underline">
            {t("methodik.sourceCode")}
          </a>{" "}
          {t("methodik.aiModelAfter")}
        </p>
      </div>
    </div>
  );
}
