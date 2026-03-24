"use client";

import { useLanguage, type Language } from "@/context/LanguageContext";

interface FAQItem {
  q: Record<Language, string>;
  a: Record<Language, string>;
}

interface FAQSection {
  category: Record<Language, string>;
  questions: FAQItem[];
}

const FAQ_ITEMS: FAQSection[] = [
  {
    category: {
      de: "Allgemein",
      "de-leicht": "Allgemein",
      en: "General",
    },
    questions: [
      {
        q: {
          de: "Was ist Versprochen?",
          "de-leicht": "Was ist Versprochen?",
          en: "What is Versprochen?",
        },
        a: {
          de: "Versprochen? ist eine unabhängige Plattform, die automatisch überprüft, ob Parteien im Bundestag so abstimmen, wie sie es in ihren Wahlprogrammen versprochen haben. Ziel ist maximale Transparenz über das Abstimmungsverhalten von Parteien und Abgeordneten.",
          "de-leicht":
            "Versprochen? ist eine Internet-Seite. Sie prüft: Halten die Parteien ihre Versprechen? Dafür schaut sie, wie die Parteien im Bundestag abstimmen. Und ob das zu ihren Wahlprogrammen passt.",
          en: "Versprochen? is an independent platform that automatically checks whether parties in the Bundestag vote in line with their election program promises. The goal is maximum transparency about the voting behavior of parties and members of parliament.",
        },
      },
      {
        q: {
          de: "Wer steht hinter dem Projekt?",
          "de-leicht": "Wer macht diese Seite?",
          en: "Who is behind the project?",
        },
        a: {
          de: "Versprochen? ist ein gemeinnütziges Civic-Tech-Projekt. Die Plattform ist Open Source und wird ehrenamtlich betrieben. Es gibt keine Verbindung zu Parteien, Verbänden oder politischen Organisationen.",
          "de-leicht":
            "Diese Seite wird von Freiwilligen gemacht. Sie gehört zu keiner Partei. Der Programm-Code ist öffentlich. Jeder kann ihn sehen.",
          en: "Versprochen? is a non-profit civic tech project. The platform is open source and run by volunteers. There is no connection to parties, associations, or political organizations.",
        },
      },
      {
        q: {
          de: "Ist die Plattform politisch neutral?",
          "de-leicht": "Ist die Seite neutral?",
          en: "Is the platform politically neutral?",
        },
        a: {
          de: "Ja. Die Bewertungen basieren ausschließlich auf dem automatisierten Abgleich von Wahlprogramm-Positionen mit dem tatsächlichen Abstimmungsverhalten. Es gibt keine redaktionelle Gewichtung oder politische Einordnung. Jede Bewertung ist mit Quellen belegt, damit Sie sich selbst ein Bild machen können.",
          "de-leicht":
            "Ja. Ein Computer vergleicht die Wahlprogramme mit den Abstimmungen. Kein Mensch entscheidet, was gut oder schlecht ist. Du kannst alles selbst nachprüfen.",
          en: "Yes. The assessments are based solely on the automated comparison of election program positions with actual voting behavior. There is no editorial weighting or political classification. Every assessment is backed by sources so you can form your own opinion.",
        },
      },
    ],
  },
  {
    category: {
      de: "Methodik",
      "de-leicht": "Methode",
      en: "Methodology",
    },
    questions: [
      {
        q: {
          de: "Wie werden die Abstimmungsdaten erfasst?",
          "de-leicht": "Woher kommen die Daten zu den Abstimmungen?",
          en: "How is the voting data collected?",
        },
        a: {
          de: "Nach jeder Sitzungswoche werden automatisch alle neuen namentlichen Abstimmungen über die öffentliche API von abgeordnetenwatch.de abgerufen. Für jede Abstimmung wird erfasst: Titel, Beschreibung, Datum und das individuelle Stimmverhalten jedes Abgeordneten (Ja, Nein, Enthaltung, Abwesend). Jede Abstimmung ist mit einem Link zur Originalquelle versehen.",
          "de-leicht":
            "Nach jeder Sitzungs-Woche holen wir die neuen Abstimmungen von abgeordnetenwatch.de. Wir wissen dann: Wer hat wie gestimmt? Ja, Nein, oder war nicht da?",
          en: "After each session week, all new recorded votes are automatically retrieved via the public API of abgeordnetenwatch.de. For each vote, we capture: title, description, date, and the individual voting behavior of each member (Yes, No, Abstention, Absent). Each vote includes a link to the original source.",
        },
      },
      {
        q: {
          de: "Woher kommen die Wahlversprechen?",
          "de-leicht": "Woher kommen die Versprechen?",
          en: "Where do the election promises come from?",
        },
        a: {
          de: "Die Positionen der Parteien werden aus den offiziellen Wahlprogrammen und den strukturierten Daten des Wahl-O-Mat extrahiert. Eine KI identifiziert konkrete, überprüfbare Versprechen und ordnet sie Themenbereichen zu.",
          "de-leicht":
            "Wir lesen die Wahlprogramme der Parteien. Und wir nutzen den Wahl-O-Mat. Ein Computer sucht die konkreten Versprechen heraus.",
          en: "Party positions are extracted from the official election programs and the structured data of the Wahl-O-Mat. An AI identifies concrete, verifiable promises and assigns them to topic areas.",
        },
      },
      {
        q: {
          de: "Wie werden Abstimmungen Themenbereichen zugeordnet?",
          "de-leicht": "Wie werden Themen sortiert?",
          en: "How are votes assigned to topic areas?",
        },
        a: {
          de: "Jede Abstimmung wird automatisch einer Themenkategorie zugeordnet: Umwelt, Soziales, Wirtschaft, Migration, Bildung, Gesundheit, Sicherheit, Digitales, Außenpolitik, Finanzen oder Sonstiges. Dies geschieht durch eine KI-Analyse des Abstimmungstitels und der Beschreibung.",
          "de-leicht":
            "Ein Computer ordnet jede Abstimmung einem Thema zu. Zum Beispiel: Umwelt, Soziales, Wirtschaft oder Gesundheit.",
          en: "Each vote is automatically assigned to a topic category: Environment, Social Policy, Economy, Migration, Education, Health, Security, Digital, Foreign Policy, Finance, or Other. This is done through AI analysis of the vote title and description.",
        },
      },
      {
        q: {
          de: "Wie funktioniert der KI-Abgleich?",
          "de-leicht": "Wie vergleicht der Computer?",
          en: "How does the AI comparison work?",
        },
        a: {
          de: "Für jede namentliche Abstimmung prüft eine KI (Claude von Anthropic), ob ein passendes Wahlversprechen existiert. Wenn ja, bewertet sie: Wie hätte die Partei laut Wahlprogramm abstimmen sollen? Stimmt das mit dem tatsächlichen Verhalten überein? Wird keine passende Position gefunden, wird die Abstimmung als 'nicht zuordenbar' markiert und fließt nicht in den Score ein.",
          "de-leicht":
            "Der Computer (Claude von Anthropic) schaut: Gibt es ein Versprechen, das zur Abstimmung passt? Wenn ja, prüft er: Hat die Partei so abgestimmt wie versprochen? Wenn kein Versprechen passt, wird die Abstimmung nicht bewertet.",
          en: "For each recorded vote, an AI (Claude by Anthropic) checks whether a matching election promise exists. If so, it evaluates: How should the party have voted according to its program? Does that match the actual behavior? If no matching position is found, the vote is marked as 'unassignable' and does not affect the score.",
        },
      },
      {
        q: {
          de: "Wie wird die Übereinstimmung bewertet?",
          "de-leicht": "Wie wird das Ergebnis berechnet?",
          en: "How is alignment assessed?",
        },
        a: {
          de: "Wurde eine Zuordnung gefunden, bewertet die KI die Übereinstimmung zwischen dem tatsächlichen Abstimmungsverhalten und der Position im Wahlprogramm. Das Ergebnis ist ein Wert zwischen 0% (kompletter Widerspruch) und 100% (volle Übereinstimmung). Das Fraktionsergebnis wird als Mehrheitsvotum berechnet: Stimmt die Mehrheit der Fraktionsmitglieder mit Ja, gilt das Fraktionsergebnis als 'Ja' (und umgekehrt). Abwesende werden nicht mitgezählt.",
          "de-leicht":
            "Der Computer gibt eine Zahl von 0% bis 100%. 0% heißt: Die Partei hat das Gegenteil von dem gemacht, was sie versprochen hat. 100% heißt: Die Partei hat genau so abgestimmt wie versprochen.",
          en: "If a match is found, the AI evaluates alignment between the actual voting behavior and the election program position. The result is a value between 0% (complete contradiction) and 100% (full alignment). The faction result is calculated as a majority vote: if the majority of faction members vote Yes, the faction result is 'Yes' (and vice versa). Absent members are not counted.",
        },
      },
      {
        q: {
          de: "Was bedeutet der Gesamtscore?",
          "de-leicht": "Was bedeutet die Gesamt-Zahl?",
          en: "What does the overall score mean?",
        },
        a: {
          de: "Der Gesamtscore zeigt den Prozentsatz der Übereinstimmung zwischen Wahlprogramm und Abstimmungsverhalten. 100% bedeutet: Die Partei hat in jeder analysierten Abstimmung so gestimmt, wie es ihr Wahlprogramm erwarten lässt. 0% bedeutet: Die Partei hat in keiner analysierten Abstimmung programmkonform gestimmt.",
          "de-leicht":
            "Die Gesamt-Zahl zeigt: Wie oft hat die Partei so abgestimmt wie versprochen? 100% = immer so wie versprochen. 0% = nie so wie versprochen.",
          en: "The overall score shows the percentage of alignment between the election program and voting behavior. 100% means: the party voted in line with its program in every analyzed vote. 0% means: the party never voted in line with its program.",
        },
      },
      {
        q: {
          de: "Was bedeuten die Farben Grün, Gelb und Rot?",
          "de-leicht": "Was bedeuten die Farben?",
          en: "What do the colors Green, Yellow, and Red mean?",
        },
        a: {
          de: "Grün (≥ 70%): Hohe Übereinstimmung mit dem Wahlprogramm. Gelb (40–69%): Gemischte Bilanz mit sowohl programmkonformem als auch abweichendem Verhalten. Rot (< 40%): Häufige Abweichungen vom Wahlprogramm.",
          "de-leicht":
            "Grün = Die Partei hält sich meistens an ihre Versprechen. Gelb = Manchmal ja, manchmal nein. Rot = Die Partei hält sich oft nicht an ihre Versprechen.",
          en: "Green (>= 70%): High alignment with the election program. Yellow (40-69%): Mixed record with both compliant and deviating behavior. Red (< 40%): Frequent deviations from the election program.",
        },
      },
      {
        q: {
          de: "Was ist die Konfidenz-Schwelle?",
          "de-leicht": "Was bedeutet Sicherheit?",
          en: "What is the confidence threshold?",
        },
        a: {
          de: "Jede KI-Analyse wird mit einem Konfidenzwert versehen (0–100%). Nur Analysen mit einer Konfidenz von mindestens 80% werden in die Score-Berechnung einbezogen und öffentlich angezeigt. Analysen unter diesem Schwellenwert werden verworfen, um die Qualität der Bewertungen sicherzustellen.",
          "de-leicht":
            "Der Computer sagt auch, wie sicher er sich ist. Nur wenn er sich zu mindestens 80% sicher ist, zeigen wir das Ergebnis. So vermeiden wir Fehler.",
          en: "Each AI analysis is given a confidence value (0-100%). Only analyses with a confidence of at least 80% are included in the score calculation and publicly displayed. Analyses below this threshold are discarded to ensure assessment quality.",
        },
      },
      {
        q: {
          de: "Welches KI-Modell wird verwendet?",
          "de-leicht": "Welcher Computer wird benutzt?",
          en: "Which AI model is used?",
        },
        a: {
          de: "Für die Analyse wird Claude Sonnet von Anthropic verwendet. Alle Parteien werden mit identischen Prompt-Templates bewertet, um Neutralität zu gewährleisten. Die Prompts sind im Quellcode auf GitHub einsehbar.",
          "de-leicht":
            "Wir benutzen Claude Sonnet von Anthropic. Alle Parteien werden gleich behandelt. Wie das funktioniert, kann jeder im Internet nachlesen.",
          en: "The analysis uses Claude Sonnet by Anthropic. All parties are evaluated with identical prompt templates to ensure neutrality. The prompts are viewable in the source code on GitHub.",
        },
      },
    ],
  },
  {
    category: {
      de: "Zugeordnete Analysen",
      "de-leicht": "Zugeordnete Prüfungen",
      en: "Matched Analyses",
    },
    questions: [
      {
        q: {
          de: "Warum haben manche Parteien mehr zugeordnete Analysen als andere?",
          "de-leicht": "Warum haben manche Parteien mehr Ergebnisse?",
          en: "Why do some parties have more matched analyses than others?",
        },
        a: {
          de: "Nicht jede Abstimmung lässt sich einem Wahlversprechen zuordnen. Die KI erstellt nur dann eine Analyse, wenn sie ein passendes Versprechen findet. Parteien mit breiterem Themenspektrum oder spezifischeren Positionen in ihrem Wahlprogramm erhalten daher mehr Zuordnungen. Das ist methodisch korrekt — eine Partei sollte nur bewertet werden, wenn sie tatsächlich eine Position zum Thema hat.",
          "de-leicht":
            "Nicht jede Abstimmung passt zu einem Versprechen. Manche Parteien haben mehr Versprechen in ihrem Wahlprogramm. Dann gibt es mehr Ergebnisse. Eine Partei wird nur bewertet, wenn sie etwas zum Thema versprochen hat.",
          en: "Not every vote can be matched to an election promise. The AI only creates an analysis when it finds a matching promise. Parties with a broader range of topics or more specific positions in their program therefore receive more matches. This is methodologically correct — a party should only be evaluated when it actually has a position on the topic.",
        },
      },
      {
        q: {
          de: "Sind Parteien mit weniger Analysen schlechter bewertet?",
          "de-leicht": "Heißt weniger Ergebnisse schlechter?",
          en: "Are parties with fewer analyses rated worse?",
        },
        a: {
          de: "Nein, die Anzahl der Analysen beeinflusst nicht den Score. Allerdings ist der Score bei weniger Analysen weniger aussagekräftig, da die Stichprobe kleiner ist. Deshalb zeigen wir die Anzahl der zugeordneten Analysen transparent an.",
          "de-leicht":
            "Nein. Weniger Ergebnisse bedeutet nicht schlechter. Aber die Zahl ist dann weniger sicher. Deshalb zeigen wir immer, wie viele Abstimmungen geprüft wurden.",
          en: "No, the number of analyses does not affect the score. However, the score is less meaningful with fewer analyses because the sample size is smaller. That's why we transparently display the number of matched analyses.",
        },
      },
      {
        q: {
          de: "Kann eine Abstimmung mehreren Parteien zugeordnet werden?",
          "de-leicht": "Kann eine Abstimmung für mehrere Parteien gelten?",
          en: "Can a vote be assigned to multiple parties?",
        },
        a: {
          de: "Ja. Jede Abstimmung wird separat für jede Partei geprüft. Eine Abstimmung über das Klimaschutzgesetz kann z.B. für die Grünen einem Umwelt-Versprechen zugeordnet werden und für die FDP einem Wirtschafts-Versprechen — mit unterschiedlichen erwarteten Stimmverhalten.",
          "de-leicht":
            "Ja. Jede Partei wird einzeln geprüft. Eine Abstimmung zum Klima kann bei den Grünen ein Umwelt-Versprechen betreffen und bei der FDP ein Wirtschafts-Versprechen.",
          en: "Yes. Each vote is checked separately for each party. A vote on the climate protection law can, for example, be matched to an environmental promise for the Greens and an economic promise for the FDP — with different expected voting behaviors.",
        },
      },
    ],
  },
  {
    category: {
      de: "Abgeordnete",
      "de-leicht": "Abgeordnete",
      en: "Members of Parliament",
    },
    questions: [
      {
        q: {
          de: "Wie wird das Verhalten einzelner Abgeordneter bewertet?",
          "de-leicht": "Wie werden einzelne Abgeordnete bewertet?",
          en: "How is the behavior of individual members evaluated?",
        },
        a: {
          de: "Für jede analysierte Abstimmung prüfen wir, wie der einzelne Abgeordnete gestimmt hat und vergleichen das mit der erwarteten Position laut Wahlprogramm seiner Partei. So ergibt sich ein individueller Übereinstimmungsscore.",
          "de-leicht":
            "Wir schauen: Wie hat ein Abgeordneter gestimmt? Und passt das zum Wahlprogramm seiner Partei? Daraus ergibt sich eine persönliche Bewertung.",
          en: "For each analyzed vote, we check how the individual member voted and compare it with the expected position from their party's election program. This produces an individual alignment score.",
        },
      },
      {
        q: {
          de: "Was bedeutet 'Abwesend' bei einer Abstimmung?",
          "de-leicht": "Was heißt 'Abwesend'?",
          en: "What does 'Absent' mean for a vote?",
        },
        a: {
          de: "Wenn ein Abgeordneter bei einer namentlichen Abstimmung nicht anwesend war, wird dies separat erfasst. Abwesenheit wird nicht als Abweichung gewertet, aber transparent angezeigt — denn Anwesenheit bei Abstimmungen gehört zu den Kernaufgaben eines Volksvertreters.",
          "de-leicht":
            "Wenn ein Abgeordneter nicht da war, zeigen wir das. Es zählt nicht als Fehler. Aber Anwesenheit ist wichtig.",
          en: "If a member was absent during a recorded vote, this is recorded separately. Absence is not counted as a deviation but is displayed transparently — because attendance at votes is one of the core duties of a representative.",
        },
      },
      {
        q: {
          de: "Warum haben manche Abgeordnete sehr wenige analysierte Abstimmungen?",
          "de-leicht": "Warum haben manche Abgeordnete wenig Ergebnisse?",
          en: "Why do some members have very few analyzed votes?",
        },
        a: {
          de: "Das kann mehrere Gründe haben: Der Abgeordnete ist erst kürzlich ins Parlament eingezogen, hat das Mandat vorzeitig niedergelegt, oder es gab in seinem Themenbereich wenige namentliche Abstimmungen. Namentliche Abstimmungen sind nur ein Teil der parlamentarischen Arbeit.",
          "de-leicht":
            "Das kann sein, weil der Abgeordnete noch neu ist. Oder weil es wenige Abstimmungen zu seinen Themen gab. Abstimmungen sind nur ein Teil der Arbeit im Bundestag.",
          en: "There can be several reasons: the member recently joined parliament, resigned early, or there were few recorded votes in their topic area. Recorded votes are only one part of parliamentary work.",
        },
      },
    ],
  },
  {
    category: {
      de: "Einschränkungen",
      "de-leicht": "Grenzen",
      en: "Limitations",
    },
    questions: [
      {
        q: {
          de: "Bildet der Score die gesamte Arbeit einer Partei ab?",
          "de-leicht": "Zeigt die Zahl die ganze Arbeit der Partei?",
          en: "Does the score reflect a party's entire work?",
        },
        a: {
          de: "Nein. Namentliche Abstimmungen sind nur ein Ausschnitt der parlamentarischen Arbeit. Ausschussarbeit, Gesetzesinitiativen, Anfragen, Verhandlungen und Kompromissfindung werden nicht erfasst. Eine Partei kann programmatisch arbeiten, auch wenn einzelne Abstimmungen abweichen — etwa bei Koalitionskompromissen.",
          "de-leicht":
            "Nein. Abstimmungen sind nur ein kleiner Teil der Arbeit. Parteien machen noch viel mehr: zum Beispiel in Ausschüssen, bei Verhandlungen, bei Anfragen. Manchmal stimmen Parteien anders ab, weil sie einen Kompromiss gemacht haben.",
          en: "No. Recorded votes are only a snapshot of parliamentary work. Committee work, legislative initiatives, inquiries, negotiations, and compromise-finding are not captured. A party can work according to its program even if individual votes deviate — for example, due to coalition compromises.",
        },
      },
      {
        q: {
          de: "Kann die KI Fehler machen?",
          "de-leicht": "Kann der Computer Fehler machen?",
          en: "Can the AI make mistakes?",
        },
        a: {
          de: "Ja. Die KI-Zuordnung ist nicht perfekt. Es kann vorkommen, dass ein Wahlversprechen falsch einer Abstimmung zugeordnet wird, oder dass die erwartete Stimmrichtung nicht korrekt eingeschätzt wird. Deshalb zeigen wir bei jeder Analyse die Begründung der KI, den Konfidenzwert und Links zu den Originalquellen — damit Sie die Bewertung selbst nachprüfen können.",
          "de-leicht":
            "Ja, der Computer kann Fehler machen. Deshalb zeigen wir immer, warum er so entschieden hat. Und wir zeigen die Quellen. So kannst du es selbst prüfen.",
          en: "Yes. The AI matching is not perfect. It can happen that an election promise is incorrectly assigned to a vote, or that the expected voting direction is not correctly estimated. That's why we show the AI's reasoning, the confidence value, and links to original sources for every analysis — so you can verify the assessment yourself.",
        },
      },
      {
        q: {
          de: "Warum werden nur namentliche Abstimmungen erfasst?",
          "de-leicht": "Warum nur bestimmte Abstimmungen?",
          en: "Why are only recorded votes captured?",
        },
        a: {
          de: "Bei namentlichen Abstimmungen wird das Stimmverhalten jedes einzelnen Abgeordneten protokolliert und öffentlich zugänglich gemacht. Bei anderen Abstimmungsformen (Handzeichen, Hammelsprung) gibt es keine individuellen Daten. Namentliche Abstimmungen finden typischerweise bei besonders wichtigen oder umstrittenen Themen statt.",
          "de-leicht":
            "Nur bei namentlichen Abstimmungen wissen wir, wer wie gestimmt hat. Bei anderen Abstimmungen gibt es diese Daten nicht. Namentliche Abstimmungen passieren meistens bei wichtigen Themen.",
          en: "In recorded votes, each member's voting behavior is documented and made publicly available. In other voting methods (show of hands, division), there is no individual data. Recorded votes typically occur on particularly important or controversial topics.",
        },
      },
      {
        q: {
          de: "Werden auch Landtage abgedeckt?",
          "de-leicht": "Werden auch Landtage geprüft?",
          en: "Are state parliaments also covered?",
        },
        a: {
          de: "Aktuell konzentriert sich Versprochen? auf den Bundestag (19., 20. und 21. Wahlperiode). Die Abdeckung von Landtagen ist geplant, hängt aber von der Verfügbarkeit maschinenlesbarer Abstimmungsdaten ab, die je nach Bundesland stark variiert.",
          "de-leicht":
            "Im Moment prüfen wir nur den Bundestag. Wir wollen auch Landtage prüfen. Aber dafür brauchen wir gute Daten. Die gibt es noch nicht überall.",
          en: "Currently, Versprochen? focuses on the Bundestag (19th, 20th, and 21st legislative periods). Coverage of state parliaments is planned but depends on the availability of machine-readable voting data, which varies significantly by state.",
        },
      },
    ],
  },
  {
    category: {
      de: "Transparenz & Open Source",
      "de-leicht": "Offenheit & Quellcode",
      en: "Transparency & Open Source",
    },
    questions: [
      {
        q: {
          de: "Kann ich die Daten selbst überprüfen?",
          "de-leicht": "Kann ich alles selbst prüfen?",
          en: "Can I verify the data myself?",
        },
        a: {
          de: "Ja. Jede Analyse enthält: einen Link zur Abstimmung auf abgeordnetenwatch.de, den zugeordneten Wahlprogramm-Abschnitt, die Begründung der KI-Bewertung und den Konfidenzwert. Sie können jede einzelne Bewertung anhand der Originalquellen nachvollziehen.",
          "de-leicht":
            "Ja. Bei jeder Bewertung zeigen wir: einen Link zur Abstimmung, das passende Versprechen, die Begründung des Computers und wie sicher er sich ist. Du kannst alles nachprüfen.",
          en: "Yes. Each analysis contains: a link to the vote on abgeordnetenwatch.de, the matched election program section, the AI's reasoning, and the confidence value. You can trace every single assessment using the original sources.",
        },
      },
      {
        q: {
          de: "Ist der Quellcode öffentlich?",
          "de-leicht": "Ist der Programm-Code öffentlich?",
          en: "Is the source code public?",
        },
        a: {
          de: "Ja. Der gesamte Quellcode ist auf GitHub verfügbar. Die Analyse-Pipeline, die Datenbank-Struktur und die Bewertungslogik sind vollständig transparent und können von jedem eingesehen werden.",
          "de-leicht":
            "Ja. Der ganze Code ist im Internet auf GitHub zu finden. Jeder kann sehen, wie das Programm funktioniert.",
          en: "Yes. The entire source code is available on GitHub. The analysis pipeline, database structure, and evaluation logic are fully transparent and can be viewed by anyone.",
        },
      },
      {
        q: {
          de: "Wie oft werden die Daten aktualisiert?",
          "de-leicht": "Wie oft gibt es neue Daten?",
          en: "How often is the data updated?",
        },
        a: {
          de: "Die Daten werden nach jeder Sitzungswoche des Bundestages aktualisiert. Neue Abstimmungen werden automatisch erfasst, von der KI analysiert und in die Scores eingerechnet.",
          "de-leicht":
            "Nach jeder Sitzungs-Woche im Bundestag kommen neue Daten dazu. Das passiert automatisch.",
          en: "The data is updated after each session week of the Bundestag. New votes are automatically captured, analyzed by the AI, and factored into the scores.",
        },
      },
    ],
  },
];

export default function FAQPage() {
  const { language, t } = useLanguage();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {t("faq.title")}
      </h1>
      <p className="text-[14px] text-gray-500 mb-8 max-w-2xl">
        {t("faq.subtitle")}
      </p>

      <div className="space-y-8">
        {FAQ_ITEMS.map((section) => (
          <div key={section.category.de}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              {section.category[language]}
            </h2>
            <div className="space-y-4">
              {section.questions.map((item, i) => (
                <details
                  key={i}
                  className="group bg-gray-50 rounded-lg"
                >
                  <summary className="cursor-pointer px-5 py-3.5 text-[14px] font-medium text-gray-900 hover:text-[#1a56b8] list-none flex items-center justify-between">
                    <span>{item.q[language]}</span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform text-[12px] ml-4 shrink-0">
                      &#9660;
                    </span>
                  </summary>
                  <div className="px-5 pb-4 text-[13px] text-gray-600 leading-relaxed">
                    {item.a[language]}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
