"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

const NAV_ITEMS = [
  { href: "/", labelKey: "nav.overview" },
  { href: "/abstimmungen", labelKey: "nav.votes" },
  { href: "/faq", labelKey: "nav.faq" },
  { href: "/ueber", labelKey: "nav.about" },
];

export function Navigation() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b-[3px] border-[#1a56b8]">
      <Link href="/" className="text-[22px] font-bold text-gray-900 tracking-tight">
        Versprochen<span className="text-[#c41e3a]">?</span>
      </Link>
      <div className="flex gap-6 text-sm text-gray-700">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              pathname === item.href
                ? "text-[#1a56b8] font-semibold border-b-2 border-[#1a56b8] pb-0.5"
                : "hover:text-[#1a56b8]"
            }
          >
            {t(item.labelKey)}
          </Link>
        ))}
      </div>
    </nav>
  );
}
