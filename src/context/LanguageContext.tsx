"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type Language = "de" | "de-leicht" | "en";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLeichteSprache: boolean;
  isEnglish: boolean;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  t: (key: string) => string;
}

// Translation dictionary
const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "nav.overview": {
    de: "Übersicht",
    "de-leicht": "Übersicht",
    en: "Overview",
  },
  "nav.votes": {
    de: "Abstimmungen",
    "de-leicht": "Abstimmungen",
    en: "Votes",
  },
  "nav.faq": {
    de: "FAQ & Methodik",
    "de-leicht": "Fragen & Methode",
    en: "FAQ & Methodology",
  },
  "nav.about": {
    de: "Über das Projekt",
    "de-leicht": "Über das Projekt",
    en: "About the Project",
  },
  "nav.methodology": {
    de: "Methodik",
    "de-leicht": "Methode",
    en: "Methodology",
  },
  // TopBar
  "topbar.motto": {
    de: "Transparenz für die Demokratie",
    "de-leicht": "Mehr Durchblick in der Politik",
    en: "Transparency for Democracy",
  },
  // Hero section
  "hero.title": {
    de: "Versprochen?",
    "de-leicht": "Versprochen?",
    en: "Promised?",
  },
  "hero.subtitle": {
    de: "Halten Parteien, was sie im Wahlprogramm versprechen? Diese Seite vergleicht automatisch das Abstimmungsverhalten im Bundestag mit den Positionen aus den Wahlprogrammen der Parteien — transparent, nachvollziehbar und für jeden zugänglich.",
    "de-leicht":
      "Machen die Parteien das, was sie vor der Wahl versprochen haben? Hier kannst du das prüfen. Wir schauen uns an, wie die Parteien im Bundestag abstimmen und ob das zu ihren Versprechen passt.",
    en: "Do parties keep the promises they make in their election programs? This site automatically compares voting behavior in the Bundestag with party manifesto positions — transparent, traceable, and accessible to everyone.",
  },
  "hero.howItWorks": {
    de: "So funktioniert es",
    "de-leicht": "So funktioniert es",
    en: "How it works",
  },
  "hero.step1.title": {
    de: "Wahlprogramme analysieren:",
    "de-leicht": "Wahlprogramme lesen:",
    en: "Analyze election programs:",
  },
  "hero.step1.text": {
    de: "Wir extrahieren zentrale Positionen und Versprechen aus den offiziellen Wahlprogrammen der Parteien.",
    "de-leicht":
      "Wir lesen die Wahlprogramme der Parteien und schreiben auf, was sie versprechen.",
    en: "We extract key positions and promises from the official party election programs.",
  },
  "hero.step2.title": {
    de: "Abstimmungen erfassen:",
    "de-leicht": "Abstimmungen sammeln:",
    en: "Record votes:",
  },
  "hero.step2.text": {
    de: "Nach jeder Sitzungswoche werden alle namentlichen Abstimmungen aus dem Bundestag erfasst — inklusive wie jeder einzelne Abgeordnete gestimmt hat.",
    "de-leicht":
      "Wir sammeln alle Abstimmungen aus dem Bundestag. Wir wissen, wie jeder Abgeordnete gestimmt hat.",
    en: "After each session week, all recorded votes from the Bundestag are captured — including how each individual member voted.",
  },
  "hero.step3.title": {
    de: "KI-Abgleich:",
    "de-leicht": "Computer-Vergleich:",
    en: "AI comparison:",
  },
  "hero.step3.text": {
    de: "Eine KI vergleicht jede Abstimmung mit den passenden Wahlversprechen und bewertet, ob die Partei ihrem Programm treu geblieben ist.",
    "de-leicht":
      "Ein Computer vergleicht die Abstimmungen mit den Versprechen. Er prüft, ob die Parteien sich an ihre Versprechen halten.",
    en: "An AI compares each vote with the matching election promises and evaluates whether the party has remained true to its program.",
  },
  "hero.step4.title": {
    de: "Transparenz:",
    "de-leicht": "Alles offen:",
    en: "Transparency:",
  },
  "hero.step4.text": {
    de: "Jede Bewertung ist mit Quellenlinks belegt — zum Wahlprogramm und zur offiziellen Abstimmung. Sie entscheiden selbst.",
    "de-leicht":
      "Du kannst alles selbst nachprüfen. Wir zeigen dir die Quellen zu jeder Bewertung.",
    en: "Every assessment is backed by source links — to the election program and the official vote. You decide for yourself.",
  },
  "hero.stat.votes": {
    de: "Abstimmungen",
    "de-leicht": "Abstimmungen",
    en: "Votes",
  },
  "hero.stat.members": {
    de: "Abgeordnete",
    "de-leicht": "Abgeordnete",
    en: "Members",
  },
  "hero.stat.individualVotes": {
    de: "Einzelstimmen",
    "de-leicht": "Einzelstimmen",
    en: "Individual Votes",
  },
  "hero.stat.periods": {
    de: "Wahlperioden",
    "de-leicht": "Wahlperioden",
    en: "Legislative Periods",
  },
  // FAQ page
  "faq.title": {
    de: "FAQ & Methodik",
    "de-leicht": "Fragen & Methode",
    en: "FAQ & Methodology",
  },
  "faq.subtitle": {
    de: "Hier finden Sie Antworten auf die wichtigsten Fragen zur Methodik, Datengrundlage und den Grenzen unserer Analyse.",
    "de-leicht":
      "Hier beantworten wir die wichtigsten Fragen. Wir erklären, wie wir arbeiten und woher unsere Daten kommen.",
    en: "Here you will find answers to the most important questions about methodology, data sources, and the limitations of our analysis.",
  },
  // DeviationFeed
  "feed.title": {
    de: "Aktuelle Abweichungen",
    "de-leicht": "Wo Parteien anders gestimmt haben",
    en: "Recent Deviations",
  },
  "feed.empty": {
    de: "Noch keine Analysen vorhanden.",
    "de-leicht": "Es gibt noch keine Ergebnisse.",
    en: "No analyses available yet.",
  },
  "feed.program": {
    de: "Wahlprogramm:",
    "de-leicht": "Wahlprogramm:",
    en: "Election program:",
  },
  "feed.expected": {
    de: "Erwartet:",
    "de-leicht": "Erwartet:",
    en: "Expected:",
  },
  "feed.actual": {
    de: "Tatsächlich:",
    "de-leicht": "Wirklich:",
    en: "Actual:",
  },
  "feed.aiAnalysis": {
    de: "KI-Analyse:",
    "de-leicht": "Computer-Ergebnis:",
    en: "AI Analysis:",
  },
  "feed.confidence": {
    de: "Konfidenz:",
    "de-leicht": "Sicherheit:",
    en: "Confidence:",
  },
  // PartyScoreTable
  "scores.title": {
    de: "Partei-Scores",
    "de-leicht": "Ergebnisse der Parteien",
    en: "Party Scores",
  },
  "scores.basedOn": {
    de: "Basierend auf",
    "de-leicht": "Basierend auf",
    en: "Based on",
  },
  "scores.analyzedVotes": {
    de: "analysierten Abstimmungen",
    "de-leicht": "geprüften Abstimmungen",
    en: "analyzed votes",
  },
  "scores.party": {
    de: "Partei",
    "de-leicht": "Partei",
    en: "Party",
  },
  "scores.overallScore": {
    de: "Gesamtscore",
    "de-leicht": "Gesamt-Ergebnis",
    en: "Overall Score",
  },
  "scores.analyses": {
    de: "Zugeordnete Analysen",
    "de-leicht": "Geprüfte Abstimmungen",
    en: "Matched Analyses",
  },
  // Parliament tabs
  "tabs.allPeriods": {
    de: "Alle Wahlperioden",
    "de-leicht": "Alle Wahlperioden",
    en: "All Legislative Periods",
  },
  // VoteAnalysisCard labels
  "analysis.voted": {
    de: "Gestimmt:",
    "de-leicht": "Hat gestimmt:",
    en: "Voted:",
  },
  "analysis.expected": {
    de: "Wahlprogramm erwartet:",
    "de-leicht": "Versprochen war:",
    en: "Program expected:",
  },
  "analysis.aiLabel": {
    de: "KI-Analyse:",
    "de-leicht": "Computer-Ergebnis:",
    en: "AI Analysis:",
  },
  "analysis.confidence": {
    de: "Konfidenz:",
    "de-leicht": "Sicherheit:",
    en: "Confidence:",
  },
};

// Simplified FAQ answers for Leichte Sprache and English
export const FAQ_TRANSLATIONS: Record<
  string,
  { q: Record<Language, string>; a: Record<Language, string> }
> = {};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;
const FONT_SIZE_STEP = 2;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de");
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  // Initialize from localStorage/cookie on mount
  useEffect(() => {
    // Read language from cookie
    const langCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("language="));
    if (langCookie) {
      const val = langCookie.split("=")[1] as Language;
      if (val === "de" || val === "de-leicht" || val === "en") {
        setLanguageState(val);
      }
    } else {
      // Backwards compatibility: check old leichte-sprache cookie
      const oldCookie = document.cookie
        .split("; ")
        .find((c) => c.startsWith("leichte-sprache="));
      if (oldCookie?.split("=")[1] === "1") {
        setLanguageState("de-leicht");
      }
    }

    // Read font size from localStorage
    const savedSize = localStorage.getItem("fontSize");
    if (savedSize) {
      const parsed = parseInt(savedSize, 10);
      if (parsed >= MIN_FONT_SIZE && parsed <= MAX_FONT_SIZE) {
        setFontSize(parsed);
      }
    }
  }, []);

  // Apply font size to <html> element
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // Apply lang attribute to <html> element
  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "de";
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    document.cookie = `language=${lang}; path=/; max-age=31536000`;
    // Also set old cookie for backwards compat
    document.cookie = `leichte-sprache=${lang === "de-leicht" ? "1" : "0"}; path=/; max-age=31536000`;
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => {
      const next = Math.min(prev + FONT_SIZE_STEP, MAX_FONT_SIZE);
      localStorage.setItem("fontSize", String(next));
      return next;
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => {
      const next = Math.max(prev - FONT_SIZE_STEP, MIN_FONT_SIZE);
      localStorage.setItem("fontSize", String(next));
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[language] ?? entry["de"] ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isLeichteSprache: language === "de-leicht",
        isEnglish: language === "en",
        fontSize,
        increaseFontSize,
        decreaseFontSize,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
