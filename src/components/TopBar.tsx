"use client";

import { useLanguage } from "@/context/LanguageContext";

export function TopBar() {
  const {
    language,
    setLanguage,
    t,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
  } = useLanguage();

  return (
    <div className="bg-gray-100 border-b border-gray-300 px-6 py-1.5 text-xs text-gray-500 flex justify-between">
      <span>{t("topbar.motto")}</span>
      <div className="flex gap-3 items-center">
        {/* Font size: 3 fixed options */}
        <span className="flex items-center gap-0.5">
          <button
            onClick={() => setFontSize(14)}
            className={`px-1.5 ${fontSize === 14 ? "text-blue-700 font-semibold" : "text-blue-600"} hover:underline`}
            title="Kleine Schrift"
          >
            <span className="text-[11px]">A</span>
          </button>
          <button
            onClick={() => setFontSize(16)}
            className={`px-1.5 ${fontSize === 16 ? "text-blue-700 font-semibold" : "text-blue-600"} hover:underline`}
            title="Normale Schrift"
          >
            <span className="text-[14px]">A</span>
          </button>
          <button
            onClick={() => setFontSize(20)}
            className={`px-1.5 ${fontSize === 20 ? "text-blue-700 font-semibold" : "text-blue-600"} hover:underline`}
            title="Große Schrift"
          >
            <span className="text-[18px]">A</span>
          </button>
        </span>

        <span className="text-gray-300">|</span>

        {/* Leichte Sprache toggle */}
        <button
          onClick={() =>
            setLanguage(language === "de-leicht" ? "de" : "de-leicht")
          }
          className={`${
            language === "de-leicht"
              ? "text-blue-700 font-semibold"
              : "text-blue-600"
          } hover:underline`}
        >
          {language === "de-leicht"
            ? "\u2713 Leichte Sprache"
            : "Leichte Sprache"}
        </button>

        <span className="text-gray-300">|</span>

        {/* Language selector DE | EN */}
        <span className="flex items-center gap-1">
          <button
            onClick={() => setLanguage("de")}
            className={`${
              language === "de" || language === "de-leicht"
                ? "text-blue-700 font-semibold"
                : "text-blue-600"
            } hover:underline`}
          >
            DE
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setLanguage("en")}
            className={`${
              language === "en"
                ? "text-blue-700 font-semibold"
                : "text-blue-600"
            } hover:underline`}
          >
            EN
          </button>
        </span>
      </div>
    </div>
  );
}
