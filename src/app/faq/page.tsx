export const dynamic = "force-dynamic";

const FAQ_ITEMS = [
  {
    category: "Allgemein",
    questions: [
      {
        q: "Was ist Versprochen?",
        a: "Versprochen? ist eine unabhängige Plattform, die automatisch überprüft, ob Parteien im Bundestag so abstimmen, wie sie es in ihren Wahlprogrammen versprochen haben. Ziel ist maximale Transparenz über das Abstimmungsverhalten von Parteien und Abgeordneten.",
      },
      {
        q: "Wer steht hinter dem Projekt?",
        a: "Versprochen? ist ein gemeinnütziges Civic-Tech-Projekt. Die Plattform ist Open Source und wird ehrenamtlich betrieben. Es gibt keine Verbindung zu Parteien, Verbänden oder politischen Organisationen.",
      },
      {
        q: "Ist die Plattform politisch neutral?",
        a: "Ja. Die Bewertungen basieren ausschließlich auf dem automatisierten Abgleich von Wahlprogramm-Positionen mit dem tatsächlichen Abstimmungsverhalten. Es gibt keine redaktionelle Gewichtung oder politische Einordnung. Jede Bewertung ist mit Quellen belegt, damit Sie sich selbst ein Bild machen können.",
      },
    ],
  },
  {
    category: "Methodik",
    questions: [
      {
        q: "Wie werden die Abstimmungsdaten erfasst?",
        a: "Nach jeder Sitzungswoche werden automatisch alle neuen namentlichen Abstimmungen über die öffentliche API von abgeordnetenwatch.de abgerufen. Für jede Abstimmung wird erfasst: Titel, Beschreibung, Datum und das individuelle Stimmverhalten jedes Abgeordneten (Ja, Nein, Enthaltung, Abwesend). Jede Abstimmung ist mit einem Link zur Originalquelle versehen.",
      },
      {
        q: "Woher kommen die Wahlversprechen?",
        a: "Die Positionen der Parteien werden aus den offiziellen Wahlprogrammen und den strukturierten Daten des Wahl-O-Mat extrahiert. Eine KI identifiziert konkrete, überprüfbare Versprechen und ordnet sie Themenbereichen zu.",
      },
      {
        q: "Wie werden Abstimmungen Themenbereichen zugeordnet?",
        a: "Jede Abstimmung wird automatisch einer Themenkategorie zugeordnet: Umwelt, Soziales, Wirtschaft, Migration, Bildung, Gesundheit, Sicherheit, Digitales, Außenpolitik, Finanzen oder Sonstiges. Dies geschieht durch eine KI-Analyse des Abstimmungstitels und der Beschreibung.",
      },
      {
        q: "Wie funktioniert der KI-Abgleich?",
        a: "Für jede namentliche Abstimmung prüft eine KI (Claude von Anthropic), ob ein passendes Wahlversprechen existiert. Wenn ja, bewertet sie: Wie hätte die Partei laut Wahlprogramm abstimmen sollen? Stimmt das mit dem tatsächlichen Verhalten überein? Wird keine passende Position gefunden, wird die Abstimmung als 'nicht zuordenbar' markiert und fließt nicht in den Score ein.",
      },
      {
        q: "Wie wird die Übereinstimmung bewertet?",
        a: "Wurde eine Zuordnung gefunden, bewertet die KI die Übereinstimmung zwischen dem tatsächlichen Abstimmungsverhalten und der Position im Wahlprogramm. Das Ergebnis ist ein Wert zwischen 0% (kompletter Widerspruch) und 100% (volle Übereinstimmung). Das Fraktionsergebnis wird als Mehrheitsvotum berechnet: Stimmt die Mehrheit der Fraktionsmitglieder mit Ja, gilt das Fraktionsergebnis als 'Ja' (und umgekehrt). Abwesende werden nicht mitgezählt.",
      },
      {
        q: "Was bedeutet der Gesamtscore?",
        a: "Der Gesamtscore zeigt den Prozentsatz der Übereinstimmung zwischen Wahlprogramm und Abstimmungsverhalten. 100% bedeutet: Die Partei hat in jeder analysierten Abstimmung so gestimmt, wie es ihr Wahlprogramm erwarten lässt. 0% bedeutet: Die Partei hat in keiner analysierten Abstimmung programmkonform gestimmt.",
      },
      {
        q: "Was bedeuten die Farben Grün, Gelb und Rot?",
        a: "Grün (≥ 70%): Hohe Übereinstimmung mit dem Wahlprogramm. Gelb (40–69%): Gemischte Bilanz mit sowohl programmkonformem als auch abweichendem Verhalten. Rot (< 40%): Häufige Abweichungen vom Wahlprogramm.",
      },
      {
        q: "Was ist die Konfidenz-Schwelle?",
        a: "Jede KI-Analyse wird mit einem Konfidenzwert versehen (0–100%). Nur Analysen mit einer Konfidenz von mindestens 80% werden in die Score-Berechnung einbezogen und öffentlich angezeigt. Analysen unter diesem Schwellenwert werden verworfen, um die Qualität der Bewertungen sicherzustellen.",
      },
      {
        q: "Welches KI-Modell wird verwendet?",
        a: "Für die Analyse wird Claude Sonnet von Anthropic verwendet. Alle Parteien werden mit identischen Prompt-Templates bewertet, um Neutralität zu gewährleisten. Die Prompts sind im Quellcode auf GitHub einsehbar.",
      },
    ],
  },
  {
    category: "Zugeordnete Analysen",
    questions: [
      {
        q: "Warum haben manche Parteien mehr zugeordnete Analysen als andere?",
        a: "Nicht jede Abstimmung lässt sich einem Wahlversprechen zuordnen. Die KI erstellt nur dann eine Analyse, wenn sie ein passendes Versprechen findet. Parteien mit breiterem Themenspektrum oder spezifischeren Positionen in ihrem Wahlprogramm erhalten daher mehr Zuordnungen. Das ist methodisch korrekt — eine Partei sollte nur bewertet werden, wenn sie tatsächlich eine Position zum Thema hat.",
      },
      {
        q: "Sind Parteien mit weniger Analysen schlechter bewertet?",
        a: "Nein, die Anzahl der Analysen beeinflusst nicht den Score. Allerdings ist der Score bei weniger Analysen weniger aussagekräftig, da die Stichprobe kleiner ist. Deshalb zeigen wir die Anzahl der zugeordneten Analysen transparent an.",
      },
      {
        q: "Kann eine Abstimmung mehreren Parteien zugeordnet werden?",
        a: "Ja. Jede Abstimmung wird separat für jede Partei geprüft. Eine Abstimmung über das Klimaschutzgesetz kann z.B. für die Grünen einem Umwelt-Versprechen zugeordnet werden und für die FDP einem Wirtschafts-Versprechen — mit unterschiedlichen erwarteten Stimmverhalten.",
      },
    ],
  },
  {
    category: "Abgeordnete",
    questions: [
      {
        q: "Wie wird das Verhalten einzelner Abgeordneter bewertet?",
        a: "Für jede analysierte Abstimmung prüfen wir, wie der einzelne Abgeordnete gestimmt hat und vergleichen das mit der erwarteten Position laut Wahlprogramm seiner Partei. So ergibt sich ein individueller Übereinstimmungsscore.",
      },
      {
        q: "Was bedeutet 'Abwesend' bei einer Abstimmung?",
        a: "Wenn ein Abgeordneter bei einer namentlichen Abstimmung nicht anwesend war, wird dies separat erfasst. Abwesenheit wird nicht als Abweichung gewertet, aber transparent angezeigt — denn Anwesenheit bei Abstimmungen gehört zu den Kernaufgaben eines Volksvertreters.",
      },
      {
        q: "Warum haben manche Abgeordnete sehr wenige analysierte Abstimmungen?",
        a: "Das kann mehrere Gründe haben: Der Abgeordnete ist erst kürzlich ins Parlament eingezogen, hat das Mandat vorzeitig niedergelegt, oder es gab in seinem Themenbereich wenige namentliche Abstimmungen. Namentliche Abstimmungen sind nur ein Teil der parlamentarischen Arbeit.",
      },
    ],
  },
  {
    category: "Einschränkungen",
    questions: [
      {
        q: "Bildet der Score die gesamte Arbeit einer Partei ab?",
        a: "Nein. Namentliche Abstimmungen sind nur ein Ausschnitt der parlamentarischen Arbeit. Ausschussarbeit, Gesetzesinitiativen, Anfragen, Verhandlungen und Kompromissfindung werden nicht erfasst. Eine Partei kann programmatisch arbeiten, auch wenn einzelne Abstimmungen abweichen — etwa bei Koalitionskompromissen.",
      },
      {
        q: "Kann die KI Fehler machen?",
        a: "Ja. Die KI-Zuordnung ist nicht perfekt. Es kann vorkommen, dass ein Wahlversprechen falsch einer Abstimmung zugeordnet wird, oder dass die erwartete Stimmrichtung nicht korrekt eingeschätzt wird. Deshalb zeigen wir bei jeder Analyse die Begründung der KI, den Konfidenzwert und Links zu den Originalquellen — damit Sie die Bewertung selbst nachprüfen können.",
      },
      {
        q: "Warum werden nur namentliche Abstimmungen erfasst?",
        a: "Bei namentlichen Abstimmungen wird das Stimmverhalten jedes einzelnen Abgeordneten protokolliert und öffentlich zugänglich gemacht. Bei anderen Abstimmungsformen (Handzeichen, Hammelsprung) gibt es keine individuellen Daten. Namentliche Abstimmungen finden typischerweise bei besonders wichtigen oder umstrittenen Themen statt.",
      },
      {
        q: "Werden auch Landtage abgedeckt?",
        a: "Aktuell konzentriert sich Versprochen? auf den Bundestag (19., 20. und 21. Wahlperiode). Die Abdeckung von Landtagen ist geplant, hängt aber von der Verfügbarkeit maschinenlesbarer Abstimmungsdaten ab, die je nach Bundesland stark variiert.",
      },
    ],
  },
  {
    category: "Transparenz & Open Source",
    questions: [
      {
        q: "Kann ich die Daten selbst überprüfen?",
        a: "Ja. Jede Analyse enthält: einen Link zur Abstimmung auf abgeordnetenwatch.de, den zugeordneten Wahlprogramm-Abschnitt, die Begründung der KI-Bewertung und den Konfidenzwert. Sie können jede einzelne Bewertung anhand der Originalquellen nachvollziehen.",
      },
      {
        q: "Ist der Quellcode öffentlich?",
        a: "Ja. Der gesamte Quellcode ist auf GitHub verfügbar. Die Analyse-Pipeline, die Datenbank-Struktur und die Bewertungslogik sind vollständig transparent und können von jedem eingesehen werden.",
      },
      {
        q: "Wie oft werden die Daten aktualisiert?",
        a: "Die Daten werden nach jeder Sitzungswoche des Bundestages aktualisiert. Neue Abstimmungen werden automatisch erfasst, von der KI analysiert und in die Scores eingerechnet.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        FAQ & Methodik
      </h1>
      <p className="text-[14px] text-gray-500 mb-8 max-w-2xl">
        Hier finden Sie Antworten auf die wichtigsten Fragen zur Methodik,
        Datengrundlage und den Grenzen unserer Analyse.
      </p>

      <div className="space-y-8">
        {FAQ_ITEMS.map((section) => (
          <div key={section.category}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              {section.category}
            </h2>
            <div className="space-y-4">
              {section.questions.map((item, i) => (
                <details
                  key={i}
                  className="group bg-gray-50 rounded-lg"
                >
                  <summary className="cursor-pointer px-5 py-3.5 text-[14px] font-medium text-gray-900 hover:text-[#1a56b8] list-none flex items-center justify-between">
                    <span>{item.q}</span>
                    <span className="text-gray-400 group-open:rotate-180 transition-transform text-[12px] ml-4 shrink-0">
                      ▼
                    </span>
                  </summary>
                  <div className="px-5 pb-4 text-[13px] text-gray-600 leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-100 text-[12px] text-gray-400">
        Haben Sie eine Frage, die hier nicht beantwortet wird? Schreiben Sie uns
        — wir erweitern diese FAQ regelmäßig.
      </div>
    </div>
  );
}
