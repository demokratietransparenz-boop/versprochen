"use client";

import { useLanguage } from "@/context/LanguageContext";

/**
 * Backwards-compatible hook. Delegates to the new LanguageContext.
 */
export function useLeichteSprache() {
  const { language, setLanguage, isLeichteSprache } = useLanguage();

  return {
    active: isLeichteSprache,
    toggle: () => {
      setLanguage(isLeichteSprache ? "de" : "de-leicht");
    },
  };
}
