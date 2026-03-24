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
  setFontSize: (size: number) => void;
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

  // Über das Projekt page
  "about.title": {
    de: "Über das Projekt",
    "de-leicht": "Über das Projekt",
    en: "About the Project",
  },
  "about.intro": {
    de: "Versprochen? ist ein unabhängiges Civic-Tech-Projekt, das maximale Transparenz über das Abstimmungsverhalten deutscher Parteien und Abgeordneter schafft. Wir vergleichen automatisiert, ob Parteien im Bundestag und in den Landtagen so abstimmen, wie sie es in ihren Wahlprogrammen versprochen haben.",
    "de-leicht": "Versprochen? ist ein unabhängiges Projekt. Wir prüfen, ob Parteien im Bundestag das tun, was sie vor der Wahl versprochen haben.",
    en: "Versprochen? is an independent civic tech project that creates maximum transparency about the voting behavior of German parties and members of parliament. We automatically compare whether parties in the Bundestag and state parliaments vote as they promised in their election programs.",
  },
  "about.whyTitle": {
    de: "Warum dieses Projekt?",
    "de-leicht": "Warum gibt es dieses Projekt?",
    en: "Why this project?",
  },
  "about.whyText": {
    de: "In einer funktionierenden Demokratie müssen Wählerinnen und Wähler nachvollziehen können, ob ihre gewählten Vertreter die Versprechen aus dem Wahlkampf einhalten. Diese Information ist zwar öffentlich zugänglich — Abstimmungsergebnisse werden vom Bundestag veröffentlicht, Wahlprogramme stehen auf den Partei-Websites — aber der Abgleich zwischen beidem ist zeitaufwändig und komplex. Versprochen? automatisiert diesen Abgleich und macht ihn für alle zugänglich.",
    "de-leicht": "Wähler sollen wissen, ob Politiker ihre Versprechen halten. Die Informationen sind zwar öffentlich, aber es ist schwer, alles zu vergleichen. Versprochen? macht das automatisch.",
    en: "In a functioning democracy, voters must be able to verify whether their elected representatives keep their campaign promises. This information is publicly available — vote results are published by the Bundestag, election programs are on party websites — but comparing the two is time-consuming and complex. Versprochen? automates this comparison and makes it accessible to everyone.",
  },
  "about.howTitle": {
    de: "Wie funktioniert es?",
    "de-leicht": "Wie funktioniert es?",
    en: "How does it work?",
  },
  "about.howText": {
    de: "Nach jeder Sitzungswoche werden automatisch die neuesten Abstimmungen aus dem Bundestag und den Landtagen abgerufen. Eine KI (Claude von Anthropic) analysiert jede Abstimmung und prüft, ob sie sich auf eine Position im Wahlprogramm einer Partei bezieht. Wird eine Übereinstimmung gefunden, bewertet die KI, ob die Partei gemäß ihrem Wahlprogramm abgestimmt hat.",
    "de-leicht": "Nach jeder Sitzungswoche holen wir die neuesten Abstimmungen. Ein Computer prüft, ob die Abstimmung etwas mit dem Wahlprogramm einer Partei zu tun hat. Wenn ja, bewertet der Computer, ob die Partei sich an ihr Versprechen gehalten hat.",
    en: "After each session week, the latest votes from the Bundestag and state parliaments are automatically retrieved. An AI (Claude by Anthropic) analyzes each vote and checks whether it relates to a position in a party's election program. If a match is found, the AI evaluates whether the party voted in accordance with its election program.",
  },
  "about.sourcesTitle": {
    de: "Datenquellen",
    "de-leicht": "Woher kommen die Daten?",
    en: "Data Sources",
  },
  "about.sourcesVotes": {
    de: "Abstimmungsdaten:",
    "de-leicht": "Abstimmungen:",
    en: "Voting data:",
  },
  "about.sourcesVotesText": {
    de: "abgeordnetenwatch.de API und Bundestag Open Data",
    "de-leicht": "abgeordnetenwatch.de und Bundestag",
    en: "abgeordnetenwatch.de API and Bundestag Open Data",
  },
  "about.sourcesPrograms": {
    de: "Wahlprogramme:",
    "de-leicht": "Wahlprogramme:",
    en: "Election programs:",
  },
  "about.sourcesProgramsText": {
    de: "Offizielle Wahlprogramme der Parteien + Wahl-O-Mat-Daten der Bundeszentrale für politische Bildung",
    "de-leicht": "Offizielle Wahlprogramme der Parteien und Wahl-O-Mat",
    en: "Official party election programs + Wahl-O-Mat data from the Federal Agency for Civic Education",
  },
  "about.neutralityTitle": {
    de: "Neutralität",
    "de-leicht": "Wir sind neutral",
    en: "Neutrality",
  },
  "about.neutralityText": {
    de: "Versprochen? ist parteipolitisch neutral. Alle Parteien werden mit identischen Methoden und Maßstäben bewertet. Die KI-Analyse verwendet für jede Partei die gleichen Prompts und Bewertungskriterien. Jede Bewertung wird mit einer Begründung und einem Konfidenzwert veröffentlicht, damit Nutzer die Einschätzung der KI selbst nachvollziehen können.",
    "de-leicht": "Wir behandeln alle Parteien gleich. Der Computer benutzt für alle die gleichen Regeln. Jede Bewertung kann man nachprüfen.",
    en: "Versprochen? is politically neutral. All parties are evaluated using identical methods and standards. The AI analysis uses the same prompts and evaluation criteria for every party. Each assessment is published with reasoning and a confidence score, so users can verify the AI's evaluation themselves.",
  },
  "about.openSourceTitle": {
    de: "Open Source",
    "de-leicht": "Offener Quellcode",
    en: "Open Source",
  },
  "about.openSourceText": {
    de: "Der gesamte Quellcode ist öffentlich auf",
    "de-leicht": "Den ganzen Quellcode kann man auf",
    en: "The entire source code is publicly available on",
  },
  "about.openSourceAfter": {
    de: "verfügbar. Beiträge und Feedback sind willkommen.",
    "de-leicht": "sehen. Mitmachen ist erwünscht.",
    en: "available. Contributions and feedback are welcome.",
  },

  // Abstimmungen page
  "votes.title": {
    de: "Abstimmungen",
    "de-leicht": "Abstimmungen",
    en: "Votes",
  },
  "votes.showingVotesOf": {
    de: "Zeige Abstimmungen von",
    "de-leicht": "Abstimmungen von",
    en: "Showing votes by",
  },
  "votes.found": {
    de: "Abstimmungen gefunden",
    "de-leicht": "Abstimmungen gefunden",
    en: "votes found",
  },
  "votes.date": {
    de: "Datum",
    "de-leicht": "Datum",
    en: "Date",
  },
  "votes.titleHeader": {
    de: "Titel",
    "de-leicht": "Titel",
    en: "Title",
  },
  "votes.period": {
    de: "Wahlperiode",
    "de-leicht": "Wahlperiode",
    en: "Legislative Period",
  },
  "votes.topic": {
    de: "Thema",
    "de-leicht": "Thema",
    en: "Topic",
  },
  "votes.voteResult": {
    de: "Stimme",
    "de-leicht": "Stimme",
    en: "Vote",
  },
  "votes.alignment": {
    de: "Übereinstimmung",
    "de-leicht": "Übereinstimmung",
    en: "Alignment",
  },

  // VoteFilters
  "filters.allPeriods": {
    de: "Alle Wahlperioden",
    "de-leicht": "Alle Wahlperioden",
    en: "All Legislative Periods",
  },
  "filters.allTopics": {
    de: "Alle Themenbereiche",
    "de-leicht": "Alle Themen",
    en: "All Topics",
  },
  "filters.allParties": {
    de: "Alle Parteien",
    "de-leicht": "Alle Parteien",
    en: "All Parties",
  },
  "filters.allMembers": {
    de: "Alle Abgeordneten",
    "de-leicht": "Alle Abgeordneten",
    en: "All Members",
  },
  "filters.reset": {
    de: "Filter zurücksetzen",
    "de-leicht": "Filter löschen",
    en: "Reset filters",
  },

  // Party detail page
  "party.members": {
    de: "Abgeordnete",
    "de-leicht": "Abgeordnete",
    en: "Members",
  },
  "party.overallScore": {
    de: "Gesamtscore",
    "de-leicht": "Gesamt-Ergebnis",
    en: "Overall Score",
  },
  "party.aboutParty": {
    de: "Über die Partei",
    "de-leicht": "Über die Partei",
    en: "About the Party",
  },
  "party.programFocus": {
    de: "Programmatische Schwerpunkte:",
    "de-leicht": "Wichtige Themen:",
    en: "Policy focus areas:",
  },
  "party.dataAssessment": {
    de: "Datenbasierte Einschätzung",
    "de-leicht": "Ergebnis aus den Daten",
    en: "Data-Based Assessment",
  },
  "party.analyzedVotes": {
    de: "Analysierte Abstimmungen",
    "de-leicht": "Geprüfte Abstimmungen",
    en: "Analyzed Votes",
  },
  "party.consistent": {
    de: "Konsistent",
    "de-leicht": "Übereinstimmend",
    en: "Consistent",
  },
  "party.deviations": {
    de: "Abweichungen",
    "de-leicht": "Abweichungen",
    en: "Deviations",
  },
  "party.reliableMembers": {
    de: "Programmtreueste Abgeordnete",
    "de-leicht": "Treueste Abgeordnete",
    en: "Most Program-Loyal Members",
  },
  "party.memberName": {
    de: "Name",
    "de-leicht": "Name",
    en: "Name",
  },
  "party.memberConsistent": {
    de: "Konsistent",
    "de-leicht": "Übereinstimmend",
    en: "Consistent",
  },
  "party.memberScore": {
    de: "Score",
    "de-leicht": "Ergebnis",
    en: "Score",
  },
  "party.deviatingMembers": {
    de: "Abgeordnete mit den meisten Abweichungen",
    "de-leicht": "Abgeordnete mit den meisten Abweichungen",
    en: "Members with Most Deviations",
  },
  "party.memberDeviations": {
    de: "Abweichungen",
    "de-leicht": "Abweichungen",
    en: "Deviations",
  },
  "party.disclaimer": {
    de: "Hinweis: Die Einschätzung basiert ausschließlich auf dem automatisierten Abgleich von Wahlprogramm-Positionen mit namentlichen Abstimmungen. Nicht alle parlamentarischen Aktivitäten werden durch Abstimmungen abgebildet. Die Bewertung erhebt keinen Anspruch auf Vollständigkeit.",
    "de-leicht": "Hinweis: Die Bewertung basiert nur auf Abstimmungen und Wahlprogrammen. Nicht alles, was Abgeordnete tun, wird durch Abstimmungen gezeigt.",
    en: "Note: This assessment is based solely on the automated comparison of election program positions with recorded votes. Not all parliamentary activities are reflected in votes. The evaluation does not claim to be comprehensive.",
  },
  "party.highAlignment": {
    de: "zeigt eine hohe Übereinstimmung zwischen Wahlprogramm und Abstimmungsverhalten.",
    "de-leicht": "stimmt oft so ab, wie im Wahlprogramm versprochen.",
    en: "shows a high alignment between election program and voting behavior.",
  },
  "party.mixedAlignment": {
    de: "zeigt eine gemischte Bilanz.",
    "de-leicht": "hält sich manchmal an das Wahlprogramm und manchmal nicht.",
    en: "shows a mixed record.",
  },
  "party.lowAlignment": {
    de: "weicht in vielen Fällen von ihrem Wahlprogramm ab.",
    "de-leicht": "stimmt oft anders ab als im Wahlprogramm versprochen.",
    en: "deviates from its election program in many cases.",
  },
  "party.inAnalyzedVotes": {
    de: "analysierten Abstimmungen wurde",
    "de-leicht": "geprüften Abstimmungen wurde",
    en: "analyzed votes,",
  },
  "party.timesConsistent": {
    de: "Mal im Einklang mit dem Wahlprogramm gestimmt.",
    "de-leicht": "Mal wie versprochen abgestimmt.",
    en: "times voted in line with the election program.",
  },
  "party.mixedDetail": {
    de: "analysierten Abstimmungen stimmt das Verhalten in etwa der Hälfte der Fälle mit dem Wahlprogramm überein.",
    "de-leicht": "geprüften Abstimmungen passt das Verhalten ungefähr zur Hälfte zum Wahlprogramm.",
    en: "analyzed votes, the behavior matches the election program in roughly half the cases.",
  },
  "party.deviationsRated": {
    de: "als Abweichung bewertet.",
    "de-leicht": "als Abweichung bewertet.",
    en: "rated as deviations.",
  },
  "party.strongTopics": {
    de: "Besonders programmtreu zeigt sich die Partei bei:",
    "de-leicht": "Besonders gut bei:",
    en: "The party is particularly program-loyal in:",
  },
  "party.weakTopics": {
    de: "Deutliche Abweichungen gibt es bei:",
    "de-leicht": "Deutliche Abweichungen bei:",
    en: "Significant deviations in:",
  },
  "party.allPeriods": {
    de: "Alle Wahlperioden",
    "de-leicht": "Alle Wahlperioden",
    en: "All Legislative Periods",
  },

  // TopicScoreTable
  "topics.title": {
    de: "Themenbereich-Scores",
    "de-leicht": "Ergebnisse nach Thema",
    en: "Topic Scores",
  },

  // Member detail page
  "member.constituency": {
    de: "Wahlkreis",
    "de-leicht": "Wahlkreis",
    en: "Constituency",
  },
  "member.alignment": {
    de: "Übereinstimmung",
    "de-leicht": "Übereinstimmung",
    en: "Alignment",
  },
  "member.topicBreakdown": {
    de: "Abstimmungsverhalten nach Themenbereich",
    "de-leicht": "Abstimmungen nach Thema",
    en: "Voting Behavior by Topic",
  },
  "member.absentNote": {
    de: "relevanten Abstimmungen war dieser Abgeordnete abwesend.",
    "de-leicht": "Abstimmungen war dieser Abgeordnete nicht da.",
    en: "relevant votes this member was absent.",
  },
  "member.absentOf": {
    de: "Bei",
    "de-leicht": "Bei",
    en: "In",
  },
  "member.absentVon": {
    de: "von",
    "de-leicht": "von",
    en: "of",
  },
  "member.consistent": {
    de: "Konsistent",
    "de-leicht": "Übereinstimmend",
    en: "Consistent",
  },
  "member.deviation": {
    de: "Abweichung",
    "de-leicht": "Abweichung",
    en: "Deviation",
  },
  "member.absent": {
    de: "Abwesend",
    "de-leicht": "Abwesend",
    en: "Absent",
  },
  "member.votingBehavior": {
    de: "Abstimmungsverhalten",
    "de-leicht": "Abstimmungen",
    en: "Voting Behavior",
  },
  "member.analyzedVotes": {
    de: "analysierte Abstimmungen",
    "de-leicht": "geprüfte Abstimmungen",
    en: "analyzed votes",
  },
  "member.consistentPlural": {
    de: "Konsistent",
    "de-leicht": "Übereinstimmend",
    en: "Consistent",
  },
  "member.deviationsPlural": {
    de: "Abweichungen",
    "de-leicht": "Abweichungen",
    en: "Deviations",
  },
  "member.showAll": {
    de: "Alle anzeigen",
    "de-leicht": "Alle zeigen",
    en: "Show all",
  },
  "member.noAnalyses": {
    de: "Noch keine analysierten Abstimmungen für diesen Abgeordneten.",
    "de-leicht": "Noch keine geprüften Abstimmungen für diesen Abgeordneten.",
    en: "No analyzed votes available for this member yet.",
  },

  // Breadcrumb
  "breadcrumb.overview": {
    de: "Übersicht",
    "de-leicht": "Übersicht",
    en: "Overview",
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
        setFontSize: (size: number) => setFontSize(size),
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
