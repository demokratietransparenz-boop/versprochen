"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-12 border-t border-gray-200 bg-gray-50 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Brand */}
          <div>
            <Link href="/" className="text-[18px] font-bold text-gray-900 tracking-tight">
              Versprochen<span className="text-[#c41e3a]">?</span>
            </Link>
            <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t("footer.navigation")}
            </h4>
            <div className="flex flex-col gap-1.5 text-[13px]">
              <Link href="/" className="text-gray-600 hover:text-[#1a56b8]">{t("nav.overview")}</Link>
              <Link href="/parteien" className="text-gray-600 hover:text-[#1a56b8]">{t("nav.parties")}</Link>
              <Link href="/abstimmungen" className="text-gray-600 hover:text-[#1a56b8]">{t("nav.votes")}</Link>
              <Link href="/faq" className="text-gray-600 hover:text-[#1a56b8]">{t("nav.faq")}</Link>
            </div>
          </div>

          {/* Projekt */}
          <div>
            <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t("footer.project")}
            </h4>
            <div className="flex flex-col gap-1.5 text-[13px]">
              <Link href="/ueber" className="text-gray-600 hover:text-[#1a56b8]">{t("nav.about")}</Link>
              <a
                href="https://github.com/demokratietransparenz-boop/versprochen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#1a56b8]"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 text-[11px] text-gray-400 flex flex-col sm:flex-row justify-between gap-2">
          <span>
            {t("footer.dataSources")}
          </span>
          <span>
            {t("footer.aiDisclaimer")}
          </span>
        </div>
      </div>
    </footer>
  );
}
