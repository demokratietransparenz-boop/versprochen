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
        {/* Font size controls */}
        <span className="flex items-center gap-1">
          <button
            onClick={decreaseFontSize}
            className="text-blue-600 hover:text-blue-800 font-semibold px-1"
            aria-label="Schrift verkleinern"
            title="Schrift verkleinern"
          >
            A-
          </button>
          <span className="text-gray-400 text-[10px]">{fontSize}px</span>
          <button
            onClick={increaseFontSize}
            className="text-blue-600 hover:text-blue-800 font-semibold px-1"
            aria-label="Schrift vergrößern"
            title="Schrift vergrößern"
          >
            A+
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
