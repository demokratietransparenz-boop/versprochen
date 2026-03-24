import { Breadcrumb } from "@/components/Breadcrumb";

export default function MethodikPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: "Übersicht", href: "/" }, { label: "Methodik" }]} />

      <h1 className="text-xl font-bold text-gray-900 mb-4">Methodik</h1>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
        <p>
          Diese Seite beschreibt, wie Versprochen? Abstimmungsverhalten mit Wahlprogrammen abgleicht
          und bewertet. Transparenz über die Methode ist uns genauso wichtig wie Transparenz über
          die Ergebnisse.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">1. Datensammlung</h2>
        <p>
          Nach jeder Sitzungswoche werden automatisch alle neuen Abstimmungen über die
          abgeordnetenwatch.de API abgerufen. Für jede Abstimmung wird erfasst: Titel, Beschreibung,
          Datum und das individuelle Stimmverhalten jedes Abgeordneten (Ja, Nein, Enthaltung, Abwesend).
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">2. Themen-Kategorisierung</h2>
        <p>
          Jede Abstimmung wird automatisch einer von zehn Themenkategorien zugeordnet:
          Klimapolitik, Sozialpolitik, Wirtschaft, Migration, Bildung, Gesundheit, Sicherheit,
          Digitales, Außenpolitik oder Finanzen. Dies geschieht durch eine KI-Analyse des
          Abstimmungstitels und der Beschreibung.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">3. Zuordnung zu Wahlversprechen</h2>
        <p>
          Für jede Partei wird geprüft, ob die Abstimmung sich auf eine Position im Wahlprogramm
          bezieht. Die KI vergleicht die Abstimmung mit allen Wahlprogramm-Positionen der gleichen
          Themenkategorie und identifiziert die beste Übereinstimmung. Wird keine passende Position
          gefunden, wird die Abstimmung als „nicht zuordenbar" markiert.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">4. Bewertung der Übereinstimmung</h2>
        <p>
          Wurde eine Zuordnung gefunden, bewertet die KI die Übereinstimmung zwischen dem
          tatsächlichen Abstimmungsverhalten der Fraktion und der Position im Wahlprogramm.
          Das Ergebnis ist ein Wert zwischen 0.0 (kompletter Widerspruch) und 1.0 (volle
          Übereinstimmung).
        </p>
        <p>
          Das Fraktionsergebnis wird als Mehrheitsvotum berechnet: Stimmt die Mehrheit der
          Fraktionsmitglieder mit Ja, gilt das Fraktionsergebnis als „Ja" (und umgekehrt).
          Abwesende werden nicht mitgezählt.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">5. Ampelsystem</h2>
        <div className="border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="py-2 px-4 text-left text-gray-500 font-medium">Farbe</th>
                <th className="py-2 px-4 text-left text-gray-500 font-medium">Score</th>
                <th className="py-2 px-4 text-left text-gray-500 font-medium">Bedeutung</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-4"><span className="inline-block w-3 h-3 rounded-full bg-[#2e7d32]"></span> Grün</td>
                <td className="py-2 px-4">≥ 70%</td>
                <td className="py-2 px-4">Partei stimmt überwiegend gemäß Wahlprogramm ab</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-4"><span className="inline-block w-3 h-3 rounded-full bg-[#e65100]"></span> Gelb</td>
                <td className="py-2 px-4">50–69%</td>
                <td className="py-2 px-4">Teilweise Abweichungen vom Wahlprogramm</td>
              </tr>
              <tr>
                <td className="py-2 px-4"><span className="inline-block w-3 h-3 rounded-full bg-[#c62828]"></span> Rot</td>
                <td className="py-2 px-4">&lt; 50%</td>
                <td className="py-2 px-4">Deutliche Abweichungen vom Wahlprogramm</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">6. Konfidenz-Schwelle</h2>
        <p>
          Jede KI-Analyse wird mit einem Konfidenzwert versehen (0–100%). Nur Analysen mit
          einer Konfidenz von mindestens 80% werden in die Score-Berechnung einbezogen und
          öffentlich angezeigt. Analysen unter diesem Schwellenwert werden als „Bewertung unsicher"
          markiert.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">7. Einschränkungen</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Die KI-Analyse kann Fehleinschätzungen enthalten — jede Bewertung wird daher mit Begründung und Quellenverweisen veröffentlicht</li>
          <li>Nicht jede Abstimmung lässt sich einem Wahlversprechen zuordnen — viele Abstimmungen betreffen technische oder prozedurale Fragen</li>
          <li>Wahlprogramme enthalten oft allgemeine Formulierungen, die unterschiedlich interpretiert werden können</li>
          <li>Die Datenverfügbarkeit variiert je nach Landtag</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">8. KI-Modell</h2>
        <p>
          Für die Analyse wird Claude Sonnet von Anthropic verwendet. Alle Parteien werden mit
          identischen Prompt-Templates bewertet, um Neutralität zu gewährleisten. Die Prompts
          sind im{" "}
          <a href="https://github.com/demokratietransparenz-boop/versprochen" target="_blank" rel="noopener noreferrer" className="text-[#1a56b8] hover:underline">
            Quellcode
          </a>{" "}
          einsehbar.
        </p>
      </div>
    </div>
  );
}
