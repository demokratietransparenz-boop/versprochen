import { Breadcrumb } from "@/components/Breadcrumb";

export default function UeberPage() {
  return (
    <div>
      <Breadcrumb items={[{ label: "Übersicht", href: "/" }, { label: "Über das Projekt" }]} />

      <h1 className="text-xl font-bold text-gray-900 mb-4">Über das Projekt</h1>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
        <p>
          <strong>Versprochen?</strong> ist ein unabhängiges Civic-Tech-Projekt, das maximale Transparenz
          über das Abstimmungsverhalten deutscher Parteien und Abgeordneter schafft. Wir vergleichen
          automatisiert, ob Parteien im Bundestag und in den Landtagen so abstimmen, wie sie es in
          ihren Wahlprogrammen versprochen haben.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">Warum dieses Projekt?</h2>
        <p>
          In einer funktionierenden Demokratie müssen Wählerinnen und Wähler nachvollziehen können,
          ob ihre gewählten Vertreter die Versprechen aus dem Wahlkampf einhalten. Diese Information
          ist zwar öffentlich zugänglich — Abstimmungsergebnisse werden vom Bundestag veröffentlicht,
          Wahlprogramme stehen auf den Partei-Websites — aber der Abgleich zwischen beidem ist
          zeitaufwändig und komplex. Versprochen? automatisiert diesen Abgleich und macht ihn für
          alle zugänglich.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">Wie funktioniert es?</h2>
        <p>
          Nach jeder Sitzungswoche werden automatisch die neuesten Abstimmungen aus dem Bundestag
          und den Landtagen abgerufen. Eine KI (Claude von Anthropic) analysiert jede Abstimmung
          und prüft, ob sie sich auf eine Position im Wahlprogramm einer Partei bezieht. Wird eine
          Übereinstimmung gefunden, bewertet die KI, ob die Partei gemäß ihrem Wahlprogramm
          abgestimmt hat.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">Datenquellen</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Abstimmungsdaten:</strong> abgeordnetenwatch.de API und Bundestag Open Data</li>
          <li><strong>Wahlprogramme:</strong> Offizielle Wahlprogramme der Parteien + Wahl-O-Mat-Daten der Bundeszentrale für politische Bildung</li>
        </ul>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">Neutralität</h2>
        <p>
          Versprochen? ist parteipolitisch neutral. Alle Parteien werden mit identischen Methoden
          und Maßstäben bewertet. Die KI-Analyse verwendet für jede Partei die gleichen Prompts
          und Bewertungskriterien. Jede Bewertung wird mit einer Begründung und einem Konfidenzwert
          veröffentlicht, damit Nutzer die Einschätzung der KI selbst nachvollziehen können.
        </p>

        <h2 className="text-lg font-semibold text-gray-900 mt-6">Open Source</h2>
        <p>
          Der gesamte Quellcode ist öffentlich auf{" "}
          <a href="https://github.com/demokratietransparenz-boop/versprochen" target="_blank" rel="noopener noreferrer" className="text-[#1a56b8] hover:underline">
            GitHub
          </a>{" "}
          verfügbar. Beiträge und Feedback sind willkommen.
        </p>
      </div>
    </div>
  );
}
