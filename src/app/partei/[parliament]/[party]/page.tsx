import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ParteiClient } from "@/components/ParteiClient";

export const dynamic = "force-dynamic";

// Neutral party descriptions based on public knowledge
interface LangText { de: string; en: string; "de-leicht": string }
interface EconomicScenario {
  group: LangText;
  icon: string;
  impact: LangText;
  verdict: "positiv" | "gemischt" | "negativ";
}
interface PartyProfile {
  summary: string;
  positions: string;
  vision: LangText;
  economicImpact: LangText;
  scenarios: EconomicScenario[];
}
const PARTY_PROFILES: Record<string, PartyProfile> = {
  "SPD": {
    summary: "Die Sozialdemokratische Partei Deutschlands ist eine der ältesten Parteien Deutschlands. Sie positioniert sich als Mitte-Links-Partei mit Schwerpunkten auf sozialer Gerechtigkeit, Arbeitnehmerrechten und einem starken Sozialstaat.",
    positions: "Kernthemen sind Mindestlohn, bezahlbares Wohnen, Klimaschutz mit sozialer Abfederung, Stärkung des öffentlichen Gesundheitswesens und europäische Integration.",
    vision: {
      de: "Die SPD steht für ein Deutschland, in dem der Sozialstaat Menschen in jeder Lebenslage absichert. Wer diese Partei wählt, unterstützt eine Zukunft mit höherem Mindestlohn, bezahlbaren Mieten, einem starken öffentlichen Gesundheitssystem und Klimaschutz, der niemanden zurücklässt. Die SPD setzt auf europäische Zusammenarbeit, Investitionen in Bildung und Infrastruktur, und eine Gesellschaft, in der Arbeit sich lohnt und Wohlstand gerecht verteilt wird.",
      "de-leicht": "Die SPD möchte, dass alle Menschen gut leben können. Sie will: mehr Lohn für Arbeiter, günstigere Wohnungen, gute Krankenhäuser für alle, und Klimaschutz, der fair ist. Sie findet Europa wichtig und will, dass Reiche mehr teilen.",
      en: "The SPD stands for a Germany where the welfare state supports people in every phase of life. Voting for this party means supporting a future with higher minimum wages, affordable housing, a strong public health system, and climate protection that leaves no one behind. The SPD focuses on European cooperation, investment in education and infrastructure, and a society where work pays and prosperity is shared fairly.",
    },
    economicImpact: {
      de: "Höherer Mindestlohn und stärkere Arbeitnehmerrechte würden niedrige Einkommen stärken, könnten aber die Personalkosten für kleine Unternehmen erhöhen. Mehr staatliche Investitionen in Infrastruktur und Bildung könnten langfristig das Wachstum stärken, erfordern aber höhere Staatsausgaben. Die Betonung von Umverteilung bedeutet tendenziell höhere Steuern für Besserverdienende und Unternehmen. Für Arbeitnehmer mit niedrigem und mittlerem Einkommen sind Kaufkraftgewinne zu erwarten, während Selbstständige und Unternehmer mit höheren Abgaben rechnen müssten.",
      "de-leicht": "Wer wenig verdient, bekommt wahrscheinlich mehr Geld. Firmen müssen vielleicht mehr für ihre Arbeiter zahlen. Der Staat gibt mehr Geld aus für Straßen und Schulen. Wer viel verdient, zahlt wahrscheinlich mehr Steuern.",
      en: "A higher minimum wage and stronger worker protections would boost low incomes but could increase labor costs for small businesses. More public investment in infrastructure and education could strengthen long-term growth but requires higher government spending. The emphasis on redistribution means higher taxes for higher earners and corporations. Workers with low to middle incomes can expect purchasing power gains, while self-employed and business owners would face higher contributions.",
    },
    scenarios: [
      { group: { de: "Angestellte & Arbeitnehmer", "de-leicht": "Angestellte", en: "Employees" }, icon: "👔", verdict: "positiv", impact: { de: "Höherer Mindestlohn, stärkerer Kündigungsschutz, bessere Tarifbindung. Reallöhne steigen besonders im Niedriglohnsektor. Mehr Mitbestimmung in Betrieben. Stärkere Absicherung bei Arbeitslosigkeit und Krankheit.", "de-leicht": "Mehr Lohn, besonders für Geringverdiener. Besserer Schutz vor Kündigung. Mehr Mitsprache in der Firma.", en: "Higher minimum wage, stronger dismissal protection, better collective bargaining. Real wages rise especially in the low-wage sector. More co-determination in companies." } },
      { group: { de: "Selbstständige & Freiberufler", "de-leicht": "Selbstständige", en: "Self-employed" }, icon: "💼", verdict: "gemischt", impact: { de: "Pflicht zur Altersvorsorge geplant — mehr Sicherheit, aber weniger Flexibilität. Höhere Sozialabgaben möglich. Zugang zu Arbeitslosenversicherung wird erleichtert. Bürokratie durch neue Regulierungen könnte steigen.", "de-leicht": "Müssen vielleicht mehr für die Rente einzahlen. Dafür besser abgesichert. Mehr Regeln bedeuten mehr Papierkram.", en: "Mandatory pension contributions planned — more security but less flexibility. Higher social contributions possible. Easier access to unemployment insurance. Bureaucracy from new regulations could increase." } },
      { group: { de: "Landwirte", "de-leicht": "Bauern", en: "Farmers" }, icon: "🌾", verdict: "gemischt", impact: { de: "Förderung nachhaltiger Landwirtschaft, aber strengere Umweltauflagen. Subventionen sollen stärker an ökologische Kriterien gebunden werden. Kleine Betriebe profitieren von gezielter Förderung, große konventionelle Betriebe müssen umstellen.", "de-leicht": "Unterstützung für Bio-Bauern. Strengere Regeln für Umweltschutz. Kleine Höfe werden mehr unterstützt als große.", en: "Support for sustainable farming but stricter environmental regulations. Subsidies tied more to ecological criteria. Small farms benefit from targeted support, large conventional farms must adapt." } },
      { group: { de: "Mittelstand & KMU", "de-leicht": "Kleine Firmen", en: "SMEs" }, icon: "🏭", verdict: "gemischt", impact: { de: "Höhere Personalkosten durch Mindestlohn und Sozialabgaben. Dafür Investitionsförderung und bessere Infrastruktur. Fachkräftemangel soll durch Bildungsoffensive und gezielte Migration gelindert werden.", "de-leicht": "Müssen mehr für Arbeiter bezahlen. Dafür gibt es Hilfe für Investitionen und bessere Straßen. Mehr ausgebildete Arbeitskräfte geplant.", en: "Higher labor costs from minimum wage and social contributions. In return, investment support and better infrastructure. Skills shortage addressed through education initiatives and targeted migration." } },
      { group: { de: "Rentner & Senioren", "de-leicht": "Rentner", en: "Retirees" }, icon: "🏡", verdict: "positiv", impact: { de: "Stabilisierung des Rentenniveaus, Grundrente für langjährig Versicherte. Höhere Mütterrente. Ausbau der Pflegeversicherung. Stärkere Belastung jüngerer Generationen durch Umlagefinanzierung.", "de-leicht": "Renten bleiben stabil oder steigen leicht. Grundrente für alle, die lange gearbeitet haben. Bessere Pflege im Alter.", en: "Stabilization of pension levels, basic pension for long-term contributors. Higher mothers' pension. Expansion of care insurance. Higher burden on younger generations through pay-as-you-go financing." } },
      { group: { de: "Immobilienbesitzer & Vermieter", "de-leicht": "Hausbesitzer", en: "Property owners" }, icon: "🏠", verdict: "negativ", impact: { de: "Mietpreisbremse und strengere Regulierung des Wohnungsmarkts. Mieterhöhungen werden begrenzt. Spekulationsgewinne stärker besteuert. Pflicht zu energetischer Sanierung mit teilweiser Förderung.", "de-leicht": "Mieten dürfen nicht so stark steigen. Strengere Regeln für Vermieter. Häuser müssen energiesparender gemacht werden.", en: "Rent controls and stricter housing market regulation. Rent increases capped. Speculation gains taxed more heavily. Mandatory energy renovation with partial subsidies." } },
    ],
  },
  "CDU/CSU": {
    summary: "Die Christlich Demokratische Union und die Christlich-Soziale Union bilden eine Fraktionsgemeinschaft im Bundestag. Sie positioniert sich als bürgerlich-konservative Volkspartei der politischen Mitte.",
    positions: "Kernthemen sind wirtschaftliche Stabilität, innere Sicherheit, eine restriktivere Migrationspolitik, Stärkung der Bundeswehr und die Förderung von Familien und Mittelstand.",
    vision: {
      de: "Die CDU/CSU steht für ein wirtschaftlich starkes und sicheres Deutschland. Wer diese Partei wählt, unterstützt eine Zukunft mit niedrigeren Steuern, weniger Bürokratie, einer starken Bundeswehr und kontrollierter Migration. Die Union setzt auf Eigenverantwortung, Förderung des Mittelstands, traditionelle Familienwerte und solide Staatsfinanzen. Sie will Deutschland als führende Wirtschaftsnation in einem starken Europa erhalten.",
      "de-leicht": "Die CDU/CSU will, dass Deutschland wirtschaftlich stark und sicher ist. Sie will: weniger Steuern, weniger Bürokratie, eine starke Armee und weniger Einwanderung. Familien und kleine Firmen sollen unterstützt werden. Der Staat soll nicht zu viel Geld ausgeben.",
      en: "The CDU/CSU stands for an economically strong and secure Germany. Voting for this party means supporting a future with lower taxes, less bureaucracy, a strong military, and controlled migration. The Union focuses on personal responsibility, support for small and medium businesses, traditional family values, and sound public finances. It aims to maintain Germany as a leading economic power in a strong Europe.",
    },
    economicImpact: {
      de: "Steuersenkungen und Bürokratieabbau würden Unternehmen entlasten und könnten Investitionen anziehen, verringern aber kurzfristig die Staatseinnahmen. Die strikte Einhaltung der Schuldenbremse begrenzt öffentliche Investitionen in Infrastruktur und Digitalisierung. Die Förderung des Mittelstands stärkt das Rückgrat der deutschen Wirtschaft. Höhere Verteidigungsausgaben binden Haushaltsmittel, die anderweitig fehlen. Für Arbeitnehmer bedeutet dies tendenziell stabile, aber nicht steigende Reallöhne, während Unternehmer und Selbstständige von niedrigeren Abgaben profitieren würden.",
      "de-leicht": "Firmen zahlen weniger Steuern und haben weniger Bürokratie. Das kann gut für Jobs sein. Aber der Staat hat dann weniger Geld für Schulen und Straßen. Kleine Firmen werden besonders unterstützt. Mehr Geld geht an die Bundeswehr.",
      en: "Tax cuts and deregulation would ease the burden on businesses and could attract investment, but reduce government revenue in the short term. Strict adherence to the debt brake limits public investment in infrastructure and digitalization. Support for SMEs strengthens the backbone of the German economy. Higher defense spending ties up budget resources needed elsewhere. For workers, this tends to mean stable but not rising real wages, while entrepreneurs and the self-employed would benefit from lower contributions.",
    },
    scenarios: [
      { group: { de: "Angestellte & Arbeitnehmer", "de-leicht": "Angestellte", en: "Employees" }, icon: "👔", verdict: "gemischt", impact: { de: "Moderate Steuersenkungen auch für mittlere Einkommen. Arbeitsmarkt bleibt flexibel — gut für Jobsuche, weniger Schutz bei Kündigung. Keine Mindestlohnerhöhung über die gesetzliche Anpassung hinaus. Stabile Wirtschaft sichert Arbeitsplätze.", "de-leicht": "Etwas weniger Steuern. Jobs bleiben sicher, solange die Wirtschaft läuft. Mindestlohn steigt nur langsam.", en: "Moderate tax cuts for middle incomes. Flexible labor market — good for job seekers, less protection against dismissal. No minimum wage increase beyond statutory adjustment. Stable economy secures jobs." } },
      { group: { de: "Selbstständige & Freiberufler", "de-leicht": "Selbstständige", en: "Self-employed" }, icon: "💼", verdict: "positiv", impact: { de: "Deutlicher Bürokratieabbau und schnellere Genehmigungen. Steuerliche Entlastung durch höhere Freibeträge. Weniger Regulierung bei Unternehmensgründung. Digitalisierung der Verwaltung spart Zeit und Kosten.", "de-leicht": "Weniger Papierkram und Regeln. Weniger Steuern. Firmen gründen wird einfacher. Behörden werden digitaler.", en: "Significant deregulation and faster approvals. Tax relief through higher exemptions. Less regulation for starting businesses. Digitalized administration saves time and costs." } },
      { group: { de: "Landwirte", "de-leicht": "Bauern", en: "Farmers" }, icon: "🌾", verdict: "positiv", impact: { de: "Weniger Bürokratie und praxisnahere Umweltauflagen. Steuerliche Entlastung für landwirtschaftliche Betriebe. Stärkerer Schutz vor billigen Importen. Technologieoffenheit bei Pflanzenschutz und Gentechnik.", "de-leicht": "Weniger Regeln und Papierkram. Weniger Steuern für Bauern. Schutz vor billigen Lebensmitteln aus dem Ausland.", en: "Less bureaucracy and more practical environmental regulations. Tax relief for farms. Stronger protection from cheap imports. Technology openness for crop protection and genetic engineering." } },
      { group: { de: "Mittelstand & KMU", "de-leicht": "Kleine Firmen", en: "SMEs" }, icon: "🏭", verdict: "positiv", impact: { de: "Kernzielgruppe der CDU/CSU-Wirtschaftspolitik. Niedrigere Unternehmenssteuern, weniger Bürokratie, bessere Abschreibungsmöglichkeiten. Förderung von Innovation und Digitalisierung. Fachkräfte-Einwanderung soll vereinfacht werden.", "de-leicht": "Die CDU/CSU will besonders kleinen Firmen helfen. Weniger Steuern, weniger Regeln, mehr Hilfe für neue Technologie.", en: "Core target of CDU/CSU economic policy. Lower corporate taxes, less bureaucracy, better depreciation. Support for innovation and digitalization. Skilled immigration to be simplified." } },
      { group: { de: "Rentner & Senioren", "de-leicht": "Rentner", en: "Retirees" }, icon: "🏡", verdict: "gemischt", impact: { de: "Renten bleiben stabil, aber keine großen Erhöhungen über die Inflation hinaus. Private Altersvorsorge wird gefördert. Pflegereform soll Eigenanteile begrenzen. Höheres Renteneintrittsalter wird diskutiert.", "de-leicht": "Renten bleiben ungefähr gleich. Man soll mehr selbst für das Alter sparen. Pflege soll nicht so teuer sein. Vielleicht muss man länger arbeiten.", en: "Pensions remain stable but no major increases beyond inflation. Private retirement savings promoted. Care reform to limit out-of-pocket costs. Higher retirement age discussed." } },
      { group: { de: "Immobilienbesitzer & Vermieter", "de-leicht": "Hausbesitzer", en: "Property owners" }, icon: "🏠", verdict: "positiv", impact: { de: "Keine Verschärfung der Mietpreisbremse. Förderung von Wohneigentum durch steuerliche Anreize. Mehr Neubau durch Deregulierung der Bauvorschriften. Grunderwerbsteuer-Freibetrag für Ersterwerber.", "de-leicht": "Keine strengeren Miet-Regeln. Hilfe beim Hauskauf durch weniger Steuern. Einfacher bauen durch weniger Vorschriften.", en: "No tightening of rent controls. Promotion of home ownership through tax incentives. More construction through deregulation of building codes. Transfer tax exemption for first-time buyers." } },
    ],
  },
  "GRÜNE": {
    summary: "Bündnis 90/Die Grünen sind aus der Umwelt- und Friedensbewegung hervorgegangen. Die Partei positioniert sich als ökologisch-progressive Kraft im Mitte-Links-Spektrum.",
    positions: "Kernthemen sind Klimaschutz und Energiewende, soziale Gerechtigkeit, Bürgerrechte, europäische Integration und eine wertegeleitete Außenpolitik.",
    vision: {
      de: "Die Grünen stehen für ein klimaneutrales, gerechtes und weltoffenes Deutschland. Wer diese Partei wählt, unterstützt eine Zukunft mit konsequentem Klimaschutz, 100% erneuerbaren Energien, nachhaltiger Wirtschaft und starken Bürgerrechten. Die Grünen setzen auf eine ökologische Transformation, die neue Arbeitsplätze schafft, eine offene und diverse Gesellschaft, und eine europäische Außenpolitik, die auf Werte und Multilateralismus setzt.",
      "de-leicht": "Die Grünen wollen, dass Deutschland das Klima schützt. Sie wollen: nur noch saubere Energie, eine Wirtschaft die der Natur nicht schadet, gleiche Rechte für alle Menschen, und Zusammenarbeit mit anderen Ländern. Sie finden, dass Klimaschutz auch neue Jobs bringen kann.",
      en: "The Greens stand for a climate-neutral, just, and cosmopolitan Germany. Voting for this party means supporting a future with consistent climate action, 100% renewable energy, a sustainable economy, and strong civil rights. The Greens focus on an ecological transformation that creates new jobs, an open and diverse society, and a European foreign policy based on values and multilateralism.",
    },
    economicImpact: {
      de: "Die ökologische Transformation schafft neue Arbeitsplätze in erneuerbaren Energien, Gebäudesanierung und nachhaltiger Technologie, gefährdet aber kurzfristig Jobs in fossilen Industrien. Höhere CO₂-Preise verteuern Energie und Mobilität — mit Sozialausgleich geplant, aber spürbar für Pendler und energieintensive Branchen. Massive Investitionen in Klimaschutz und Infrastruktur erfordern eine Lockerung der Schuldenbremse. Langfristig soll die Transformation Deutschland als Technologieführer positionieren und Energieunabhängigkeit schaffen. Verbraucher müssen mit höheren Preisen für klimaschädliche Produkte rechnen, profitieren aber von besserer Luft, ÖPNV und Energieeffizienz.",
      "de-leicht": "Es gibt neue Jobs bei Solar und Wind, aber manche alten Jobs fallen weg. Strom und Benzin werden teurer, aber dafür soll es Hilfe für arme Menschen geben. Der Staat gibt viel Geld für Klimaschutz aus. Langfristig soll Deutschland weniger abhängig von anderen Ländern für Energie werden.",
      en: "The ecological transformation creates new jobs in renewable energy, building renovation, and sustainable technology, but short-term threatens jobs in fossil industries. Higher CO₂ prices make energy and mobility more expensive — planned with social compensation, but noticeable for commuters and energy-intensive sectors. Massive investments in climate protection require loosening the debt brake. Long-term, the transformation should position Germany as a technology leader and create energy independence. Consumers face higher prices for climate-damaging products but benefit from better air quality, public transport, and energy efficiency.",
    },
    scenarios: [
      { group: { de: "Angestellte & Arbeitnehmer", "de-leicht": "Angestellte", en: "Employees" }, icon: "👔", verdict: "gemischt", impact: { de: "Die ökologische Transformation schafft neue Arbeitsplätze in Zukunftsbranchen wie erneuerbare Energien und Gebäudesanierung. Gleichzeitig erfordern strengere Klimavorgaben Umschulungen und können in fossilen Industrien Jobs kosten. Höhere CO₂-Preise verteuern Pendeln und Energie, sollen aber durch Klimageld sozial ausgeglichen werden.", "de-leicht": "Es gibt neue Jobs bei Wind und Solar. Manche alte Jobs fallen aber weg. Pendeln wird teurer, dafür soll es Geld als Ausgleich geben.", en: "The green transformation creates new jobs in future sectors like renewables and building renovation. At the same time, stricter climate requirements demand retraining and may cost jobs in fossil industries. Higher CO₂ prices increase commuting and energy costs, but are planned to be offset by a climate dividend." } },
      { group: { de: "Selbstständige & Freiberufler", "de-leicht": "Selbstständige", en: "Self-employed" }, icon: "💼", verdict: "gemischt", impact: { de: "Umfangreiche Förderprogramme für grüne Innovation und nachhaltige Geschäftsmodelle. Allerdings steigen Betriebskosten durch höhere CO₂-Bepreisung und strengere Umweltauflagen. Neue Berichtspflichten zur Nachhaltigkeit bedeuten zusätzlichen bürokratischen Aufwand.", "de-leicht": "Es gibt Geld vom Staat für umweltfreundliche Ideen. Aber Energie und Regeln werden teurer. Mehr Papierkram wegen Umwelt-Berichten.", en: "Extensive funding programs for green innovation and sustainable business models. However, operating costs rise through higher CO₂ pricing and stricter environmental regulations. New sustainability reporting requirements mean additional bureaucratic effort." } },
      { group: { de: "Landwirte", "de-leicht": "Bauern", en: "Farmers" }, icon: "🌾", verdict: "gemischt", impact: { de: "Höhere Subventionen für ökologische Landwirtschaft und Umstellung auf Bio-Produktion. Gleichzeitig deutlich strengere Regeln bei Pestizid- und Düngemitteleinsatz sowie höhere Tierwohl-Standards, die erhebliche Investitionen erfordern. Kleine Höfe profitieren stärker von der Förderung als große konventionelle Betriebe.", "de-leicht": "Mehr Geld für Bio-Bauern. Aber strengere Regeln für Pflanzenschutz und Tierhaltung. Das kostet Geld für Umbauten.", en: "Higher subsidies for organic farming and conversion to organic production. At the same time, significantly stricter rules on pesticide and fertilizer use and higher animal welfare standards requiring substantial investment. Small farms benefit more from subsidies than large conventional operations." } },
      { group: { de: "Mittelstand & KMU", "de-leicht": "Kleine Firmen", en: "SMEs" }, icon: "🏭", verdict: "gemischt", impact: { de: "Förderprogramme für grüne Innovation und Energieeffizienz in Unternehmen. Allerdings steigen die Energiekosten durch die Transformation deutlich, und neue Umweltvorschriften erfordern Investitionen. Firmen, die frühzeitig auf Nachhaltigkeit setzen, können langfristig Wettbewerbsvorteile erzielen.", "de-leicht": "Es gibt Hilfe für umweltfreundliche Firmen. Aber Energie wird teurer und es gibt mehr Regeln. Wer früh umstellt, kann langfristig profitieren.", en: "Funding programs for green innovation and energy efficiency in businesses. However, energy costs rise significantly through the transformation, and new environmental regulations require investment. Companies that adopt sustainability early can gain long-term competitive advantages." } },
      { group: { de: "Rentner & Senioren", "de-leicht": "Rentner", en: "Retirees" }, icon: "🏡", verdict: "gemischt", impact: { de: "Garantierente und stabile Rentenanpassungen sichern das Einkommen im Alter. Besserer öffentlicher Nahverkehr und Ausbau barrierefreier Mobilität. Allerdings steigen Energiekosten für Heizen und Strom spürbar, was besonders Rentner mit geringem Einkommen belastet.", "de-leicht": "Renten bleiben sicher. Busse und Bahnen werden besser. Aber Heizen und Strom werden teurer.", en: "Guaranteed minimum pension and stable pension adjustments secure retirement income. Better public transport and expansion of accessible mobility. However, energy costs for heating and electricity rise noticeably, which particularly burdens retirees on low incomes." } },
      { group: { de: "Immobilienbesitzer & Vermieter", "de-leicht": "Hausbesitzer", en: "Property owners" }, icon: "🏠", verdict: "negativ", impact: { de: "Verpflichtende energetische Sanierung von Gebäuden verursacht hohe Investitionskosten, auch wenn Förderprogramme einen Teil abdecken. Strengere Baustandards verteuern Neubauten. Mietpreisregulierungen begrenzen die Möglichkeit, Sanierungskosten auf Mieter umzulegen.", "de-leicht": "Häuser müssen teuer umgebaut werden für den Klimaschutz. Es gibt etwas Hilfe vom Staat, aber es bleibt teuer. Mieten dürfen nicht so stark erhöht werden.", en: "Mandatory energy renovation of buildings causes high investment costs, even though funding programs cover part of them. Stricter building standards make new construction more expensive. Rent regulations limit the ability to pass renovation costs on to tenants." } },
    ],
  },
  "FDP": {
    summary: "Die Freie Demokratische Partei versteht sich als liberale Partei, die individuelle Freiheit, Eigenverantwortung und Marktwirtschaft in den Mittelpunkt stellt.",
    positions: "Kernthemen sind Steuersenkungen, Bürokratieabbau, Digitalisierung, Bildung als Aufstiegsversprechen und die Einhaltung der Schuldenbremse.",
    vision: {
      de: "Die FDP steht für ein Deutschland der individuellen Freiheit und wirtschaftlichen Dynamik. Wer diese Partei wählt, unterstützt eine Zukunft mit deutlich niedrigeren Steuern, massivem Bürokratieabbau, einer digitalen Verwaltung und Bildung als Aufstiegsmotor. Die FDP setzt auf Technologieoffenheit beim Klimaschutz, die Schuldenbremse als Garant solider Finanzen, und eine Gesellschaft, in der der Staat sich zurückhält und Bürger selbst entscheiden.",
      "de-leicht": "Die FDP will, dass Menschen möglichst frei entscheiden können. Sie will: weniger Steuern, weniger Regeln, besseres Internet und Digitalisierung, gute Schulen für alle. Der Staat soll nicht zu viel bestimmen. Beim Klimaschutz soll Technik helfen, nicht Verbote.",
      en: "The FDP stands for a Germany of individual freedom and economic dynamism. Voting for this party means supporting a future with significantly lower taxes, massive deregulation, a digital administration, and education as a driver of social mobility. The FDP focuses on technology-openness in climate protection, the debt brake as a guarantee of sound finances, and a society where the state steps back and citizens decide for themselves.",
    },
    economicImpact: {
      de: "Deutliche Steuersenkungen und Bürokratieabbau würden die Wirtschaft kurzfristig beleben und Deutschland für Investoren attraktiver machen. Die strikte Schuldenbremse verhindert jedoch schuldenfinanzierte Investitionen in marode Infrastruktur. Technologieoffenheit beim Klimaschutz setzt auf Innovation statt Verbote, birgt aber das Risiko, dass notwendige Umstellungen zu langsam kommen. Deregulierung des Arbeitsmarkts bietet mehr Flexibilität für Arbeitgeber, kann aber Arbeitnehmerrechte schwächen. Gutverdiener und Unternehmer profitieren am stärksten, während die Entlastung bei niedrigen Einkommen geringer ausfällt.",
      "de-leicht": "Firmen und Menschen zahlen weniger Steuern. Das soll die Wirtschaft stärker machen. Aber der Staat hat weniger Geld für Reparaturen an Straßen und Brücken. Beim Klimaschutz soll Technik helfen, nicht Regeln. Wer viel verdient, spart am meisten Steuern.",
      en: "Significant tax cuts and deregulation would boost the economy short-term and make Germany more attractive to investors. However, the strict debt brake prevents debt-financed investment in deteriorating infrastructure. Technology-openness in climate protection relies on innovation rather than bans but risks that necessary transitions come too slowly. Labor market deregulation offers more flexibility for employers but can weaken worker protections. High earners and business owners benefit most, while relief for low-income earners is smaller.",
    },
    scenarios: [
      { group: { de: "Angestellte & Arbeitnehmer", "de-leicht": "Angestellte", en: "Employees" }, icon: "👔", verdict: "gemischt", impact: { de: "Steuersenkungen entlasten auch mittlere Einkommen, allerdings profitieren Besserverdienende stärker. Lockerung des Arbeitsrechts schafft mehr Flexibilität, schwächt aber den Kündigungsschutz. Keine aktive Mindestlohnpolitik über die gesetzliche Anpassung hinaus.", "de-leicht": "Etwas weniger Steuern für alle. Aber weniger Schutz bei Kündigung. Mindestlohn steigt nur wie vom Gesetz vorgesehen.", en: "Tax cuts also relieve middle incomes, though higher earners benefit more. Loosening labor law creates more flexibility but weakens dismissal protection. No active minimum wage policy beyond statutory adjustment." } },
      { group: { de: "Selbstständige & Freiberufler", "de-leicht": "Selbstständige", en: "Self-employed" }, icon: "💼", verdict: "positiv", impact: { de: "Massiver Bürokratieabbau und schnellere Genehmigungsverfahren entlasten den Alltag. Niedrigere Steuersätze und höhere Freibeträge stärken die Liquidität. Digitale Verwaltung spart Zeit und Kosten. Weniger staatliche Eingriffe in unternehmerische Entscheidungen.", "de-leicht": "Viel weniger Bürokratie und Regeln. Weniger Steuern. Behördengänge werden digital und schneller. Mehr Freiheit für eigene Entscheidungen.", en: "Massive deregulation and faster approval processes ease daily operations. Lower tax rates and higher exemptions strengthen liquidity. Digital administration saves time and costs. Less government interference in business decisions." } },
      { group: { de: "Landwirte", "de-leicht": "Bauern", en: "Farmers" }, icon: "🌾", verdict: "gemischt", impact: { de: "Weniger Umweltauflagen und mehr Technologieoffenheit bei Pflanzenschutz erleichtern die Bewirtschaftung. Gleichzeitig setzt die FDP auf Marktmechanismen statt Subventionen, was den Wettbewerbsdruck erhöht. Freihandelsabkommen können neue Märkte öffnen, aber auch billigere Konkurrenz ins Land bringen.", "de-leicht": "Weniger Umwelt-Regeln. Aber auch weniger Geld vom Staat. Mehr Konkurrenz durch Importe aus dem Ausland.", en: "Fewer environmental regulations and more technology openness in crop protection ease farming operations. At the same time, the FDP relies on market mechanisms instead of subsidies, increasing competitive pressure. Free trade agreements can open new markets but also bring in cheaper competition." } },
      { group: { de: "Mittelstand & KMU", "de-leicht": "Kleine Firmen", en: "SMEs" }, icon: "🏭", verdict: "positiv", impact: { de: "Steuersenkungen bei Unternehmens- und Einkommensteuer verbessern die Wettbewerbsfähigkeit. Massiver Bürokratieabbau spart Zeit und Kosten. Investitionen in digitale Infrastruktur stärken den Standort. Schnellere Planungs- und Genehmigungsverfahren ermöglichen zügigere Expansion.", "de-leicht": "Deutlich weniger Steuern und Bürokratie. Besseres Internet für Firmen. Schnellere Genehmigungen für Bauprojekte.", en: "Corporate and income tax cuts improve competitiveness. Massive deregulation saves time and money. Investment in digital infrastructure strengthens the business environment. Faster planning and approval processes enable quicker expansion." } },
      { group: { de: "Rentner & Senioren", "de-leicht": "Rentner", en: "Retirees" }, icon: "🏡", verdict: "gemischt", impact: { de: "Einführung einer aktienbasierten Rentenkomponente (Aktienrente) soll die Rente langfristig stabilisieren, birgt aber Marktrisiken. Mehr Eigenverantwortung bei der Altersvorsorge gefordert. Keine Rentenerhöhungen über den gesetzlichen Rahmen hinaus. Senioren mit privater Vorsorge profitieren von Steuersenkungen.", "de-leicht": "Ein Teil der Rente soll über Aktien laufen — das kann mehr Geld bringen, aber auch Risiken haben. Man soll selbst mehr fürs Alter sparen.", en: "Introduction of a stock-based pension component (Aktienrente) aims to stabilize pensions long-term but carries market risks. More personal responsibility for retirement savings is expected. No pension increases beyond the statutory framework. Seniors with private savings benefit from tax cuts." } },
      { group: { de: "Immobilienbesitzer & Vermieter", "de-leicht": "Hausbesitzer", en: "Property owners" }, icon: "🏠", verdict: "positiv", impact: { de: "Keine Verschärfung der Mietpreisbremse, perspektivisch Abschaffung von Mietpreisregulierungen. Steuerliche Anreize für Neubau und Sanierung. Lockerung der Bauvorschriften senkt Baukosten. Grunderwerbsteuer soll für Ersterwerber gesenkt oder abgeschafft werden.", "de-leicht": "Keine strengeren Miet-Regeln. Hilfe beim Bauen durch weniger Vorschriften und weniger Steuern. Erstes Haus kaufen wird günstiger.", en: "No tightening of rent controls, with a view toward abolishing rent regulations. Tax incentives for new construction and renovation. Loosening building regulations reduces construction costs. Property transfer tax to be reduced or eliminated for first-time buyers." } },
    ],
  },
  "AfD": {
    summary: "Die Alternative für Deutschland positioniert sich als rechtspopulistische bis rechtskonservative Partei. Sie entstand 2013 zunächst als EU-kritische Partei und verschob ihren Fokus zunehmend auf Migrationspolitik.",
    positions: "Kernthemen sind eine restriktive Migrationspolitik, EU-Skepsis, Stärkung nationaler Souveränität, Ablehnung der Energiewende in ihrer jetzigen Form und konservative Gesellschaftspolitik.",
    vision: {
      de: "Die AfD steht für ein Deutschland, das nationale Souveränität und kulturelle Identität in den Vordergrund stellt. Wer diese Partei wählt, unterstützt eine Zukunft mit stark begrenzter Einwanderung, Rückführung der EU-Kompetenzen an Nationalstaaten, Beendigung der aktuellen Energiewende zugunsten konventioneller Energiequellen und eine konservative Gesellschaftspolitik. Die AfD setzt auf Grenzschutz, direkte Demokratie und Stärkung der nationalen Eigenständigkeit.",
      "de-leicht": "Die AfD will, dass Deutschland selbst mehr bestimmt. Sie will: viel weniger Einwanderung, weniger Macht für die EU, keine Windräder und Solarpanels wie jetzt, und eine Gesellschaft mit traditionellen Werten. Die Grenzen sollen besser geschützt werden.",
      en: "The AfD stands for a Germany that prioritizes national sovereignty and cultural identity. Voting for this party means supporting a future with strictly limited immigration, returning EU powers to nation states, ending the current energy transition in favor of conventional energy sources, and conservative social policies. The AfD focuses on border security, direct democracy, and strengthening national independence.",
    },
    economicImpact: {
      de: "Die Rückkehr zu konventionellen Energiequellen würde Energiepreise kurzfristig senken, erhöht aber Deutschlands Abhängigkeit von fossilen Importen und isoliert das Land von den globalen Zukunftsmärkten für erneuerbare Energien. Eine stark begrenzte Migration verschärft den Fachkräftemangel in einer alternden Gesellschaft dramatisch. Die EU-Skepsis ist das größte wirtschaftliche Risiko: 60% der deutschen Exporte gehen in die EU — eine Abschottung würde Deutschlands Wirtschaftsmodell fundamental gefährden. Das Beispiel Brexit zeigt: Wirtschaftliche Isolation führt langfristig zu niedrigerem Wachstum, höheren Handelskosten und sinkenden Auslandsinvestitionen. Kurzfristige Entlastungen bei Energie und Regulierung können die langfristigen strukturellen Schäden einer EU-Distanzierung nicht kompensieren.",
      "de-leicht": "Energie wird kurzfristig billiger. Aber langfristig gibt es große Probleme: Deutschland verkauft sehr viel an EU-Länder. Wenn die Zusammenarbeit mit der EU schlechter wird, verliert Deutschland viel Geld und Jobs. Weniger Einwanderer heißt auch, dass Firmen keine Arbeiter finden. Das Beispiel England (Brexit) zeigt: Abschottung macht ein Land langfristig ärmer.",
      en: "Returning to conventional energy would lower prices short-term but increases Germany's dependence on fossil imports and isolates the country from global future markets for renewable energy. Strictly limited migration dramatically worsens the skilled labor shortage in an aging society. EU skepticism is the greatest economic risk: 60% of German exports go to the EU — isolation would fundamentally endanger Germany's economic model. The Brexit example shows: economic isolation leads to lower growth, higher trade costs, and declining foreign investment long-term. Short-term relief on energy and regulation cannot compensate for the long-term structural damage of EU distancing.",
    },
    scenarios: [
      { group: { de: "Angestellte & Arbeitnehmer", "de-leicht": "Angestellte", en: "Employees" }, icon: "👔", verdict: "negativ", impact: { de: "Kurzfristig niedrigere Energiekosten, aber langfristig erhebliche Risiken. Rund 7 Millionen Arbeitsplätze in Deutschland hängen direkt vom EU-Binnenmarkt ab. Eine Distanzierung von der EU würde exportabhängige Branchen wie Automobil, Maschinenbau und Chemie hart treffen. Der verschärfte Fachkräftemangel durch weniger Zuwanderung führt zu Überlastung der bestehenden Belegschaft. Arbeitnehmer in international vernetzten Branchen wären besonders betroffen.", "de-leicht": "Energie wird billiger, aber viele Jobs hängen vom Handel mit der EU ab. 7 Millionen Jobs sind gefährdet, wenn der Handel schwieriger wird. Weniger Einwanderer heißt mehr Arbeit für die Übrigen. Besonders in Autofirmen und Fabriken wird es schwierig.", en: "Lower energy costs short-term but significant long-term risks. Around 7 million jobs in Germany depend directly on the EU single market. Distancing from the EU would hit export-dependent sectors like automotive, engineering, and chemicals hard. The worsening skilled worker shortage from less immigration leads to overloading the existing workforce. Workers in internationally connected industries would be particularly affected." } },
      { group: { de: "Selbstständige & Freiberufler", "de-leicht": "Selbstständige", en: "Self-employed" }, icon: "💼", verdict: "negativ", impact: { de: "Kurzfristig weniger Regulierung und Abgaben. Aber langfristig massive Nachteile: Die Abkehr von EU-Normen zwingt international tätige Selbstständige, doppelte Standards zu erfüllen. Handelsbarrieren mit den 26 EU-Partnern schließen den größten zusammenhängenden Markt der Welt ein. IT-Freiberufler, Berater und Dienstleister verlieren den freien Zugang zu EU-Kunden. Deutsche Zertifizierungen werden im Ausland weniger anerkannt.", "de-leicht": "Kurzfristig weniger Regeln. Aber langfristig große Probleme: Man kann nicht mehr so einfach für EU-Kunden arbeiten. Man braucht andere Genehmigungen. Wer mit dem Ausland arbeitet, hat viel mehr Aufwand.", en: "Less regulation and contributions short-term. But massive long-term disadvantages: departing from EU norms forces internationally active self-employed to meet dual standards. Trade barriers with 26 EU partners restrict access to the world's largest contiguous market. IT freelancers, consultants, and service providers lose free access to EU clients. German certifications become less recognized abroad." } },
      { group: { de: "Landwirte", "de-leicht": "Bauern", en: "Farmers" }, icon: "🌾", verdict: "gemischt", impact: { de: "Kurzfristig profitieren Landwirte von weniger Umweltauflagen und günstigerer Energie. Aber: Ohne EU-Agrarzahlungen (Deutschland erhält jährlich ca. 6 Mrd. Euro aus der EU-Agrarpolitik) bricht eine wichtige Einnahmequelle weg. Der Zugang zu EU-Absatzmärkten wird durch Handelsbarrieren erschwert. Langfristig fehlen durch weniger Migration auch Saisonarbeitskräfte für die Ernte. Die kurzfristige Entlastung wird durch den Verlust von EU-Subventionen und Marktzugang aufgefressen.", "de-leicht": "Kurzfristig weniger Regeln und billigere Energie. Aber: Deutschland bekommt jährlich 6 Milliarden Euro von der EU für Bauern. Das würde wegfallen. Und es wird schwerer, Lebensmittel in die EU zu verkaufen. Auch Erntehelfer aus dem Ausland fehlen.", en: "Farmers benefit short-term from fewer environmental regulations and cheaper energy. But: without EU agricultural payments (Germany receives approx. 6 billion euros annually from EU agricultural policy), a major revenue source disappears. Access to EU markets is hindered by trade barriers. Long-term, fewer migrants also means fewer seasonal workers for harvests. Short-term relief is consumed by loss of EU subsidies and market access." } },
      { group: { de: "Mittelstand & KMU", "de-leicht": "Kleine Firmen", en: "SMEs" }, icon: "🏭", verdict: "negativ", impact: { de: "Kurzfristig weniger Bürokratie und günstigere Energie. Aber der Mittelstand ist das Rückgrat der deutschen Exportwirtschaft, und über 50% der KMU-Exporte gehen in die EU. Zölle, unterschiedliche Produktstandards und Grenzkontrollen würden die Lieferketten empfindlich stören. Der Fachkräftemangel — schon heute das Hauptproblem des Mittelstands — verschärft sich durch die Migrationsbegrenzung massiv. Langfristig droht eine Deindustrialisierung, wie sie in Großbritannien nach dem Brexit begonnen hat.", "de-leicht": "Kurzfristig weniger Regeln und billigere Energie. Aber die Hälfte aller Verkäufe kleiner Firmen ins Ausland geht in die EU. Wenn Handel schwieriger wird, verlieren viele Firmen Kunden. Es fehlen auch Fachkräfte. In England hat man nach dem Brexit gesehen, wie Firmen abwandern.", en: "Less bureaucracy and cheaper energy short-term. But SMEs are the backbone of German exports, and over 50% of SME exports go to the EU. Tariffs, different product standards, and border controls would severely disrupt supply chains. The skills shortage — already the main problem for SMEs — worsens massively with migration limits. Long-term, there is a risk of deindustrialization, as has begun in the UK after Brexit." } },
      { group: { de: "Rentner & Senioren", "de-leicht": "Rentner", en: "Retirees" }, icon: "🏡", verdict: "gemischt", impact: { de: "Kurzfristig niedrigere Energiekosten für Heizen und Strom. Aber: Das Rentensystem ist ein Umlageverfahren — es braucht junge Beitragszahler. Weniger Zuwanderung bei gleichzeitig alternder Bevölkerung bedeutet langfristig entweder sinkende Renten oder steigende Beiträge. Der wirtschaftliche Rückgang durch EU-Isolation würde die Steuereinnahmen senken, die den Bundeszuschuss zur Rente finanzieren. Die kurzfristige Energieersparnis kann die langfristige Rentenunsicherheit nicht aufwiegen.", "de-leicht": "Heizen wird billiger. Aber: Renten werden von jungen Arbeitern bezahlt. Wenn weniger Menschen einwandern, gibt es weniger Einzahler. Langfristig können die Renten sinken. Wenn die Wirtschaft durch weniger EU-Handel schrumpft, hat der Staat auch weniger Geld für Rentenzuschüsse.", en: "Lower energy costs for heating and electricity short-term. But: the pension system is pay-as-you-go — it needs young contributors. Less immigration with an simultaneously aging population means either declining pensions or rising contributions long-term. Economic decline from EU isolation would reduce tax revenues that fund the federal pension supplement. Short-term energy savings cannot offset long-term pension insecurity." } },
      { group: { de: "Immobilienbesitzer & Vermieter", "de-leicht": "Hausbesitzer", en: "Property owners" }, icon: "🏠", verdict: "gemischt", impact: { de: "Keine Pflicht zur energetischen Sanierung spart kurzfristig Investitionskosten. Weniger Bauregulierung erleichtert Bauvorhaben. Aber: Immobilienwerte korrelieren mit wirtschaftlicher Stärke. Eine durch EU-Isolation geschwächte Wirtschaft senkt die Nachfrage nach Gewerbe- und Wohnimmobilien. In strukturschwachen Regionen droht Leerstand. Ohne internationale Investoren und EU-Freizügigkeit sinkt die Nachfrage in Ballungsräumen. Der Immobilienmarkt lebt von wirtschaftlicher Stabilität — die durch Abschottung gefährdet wäre.", "de-leicht": "Keine teuren Sanierungen. Weniger Bau-Regeln. Aber: Wenn die Wirtschaft schrumpft, sinkt auch der Wert von Häusern. Weniger Menschen kommen nach Deutschland, also weniger Nachfrage nach Wohnungen. In vielen Gegenden könnten Wohnungen leer stehen.", en: "No mandatory energy renovation saves investment costs short-term. Less building regulation eases construction. But: property values correlate with economic strength. An economy weakened by EU isolation reduces demand for commercial and residential property. Structural vacancy threatens weaker regions. Without international investors and EU freedom of movement, demand drops in metropolitan areas. The property market thrives on economic stability — which isolation would endanger." } },
    ],
  },
  "LINKE": {
    summary: "Die Linke ist eine demokratisch-sozialistische Partei, die aus der PDS und der WASG hervorgegangen ist. Sie positioniert sich als linke Opposition mit Fokus auf soziale Gerechtigkeit.",
    positions: "Kernthemen sind Umverteilung von Vermögen, Verstaatlichung von Schlüsselindustrien, antimilitaristische Außenpolitik, Mietpreisbremsen und die Stärkung öffentlicher Daseinsvorsorge.",
    vision: {
      de: "Die Linke steht für ein Deutschland mit deutlich weniger sozialer Ungleichheit. Wer diese Partei wählt, unterstützt eine Zukunft mit Vermögensumverteilung, Verstaatlichung von Wohnungskonzernen und Schlüsselindustrien, einem Mietendeckel, gebührenfreier Bildung und einem Ende aller Bundeswehr-Auslandseinsätze. Die Linke setzt auf eine Gesellschaft, in der Grundbedürfnisse wie Wohnen, Gesundheit und Mobilität nicht dem Markt überlassen werden.",
      "de-leicht": "Die Linke will, dass es weniger Unterschied zwischen Arm und Reich gibt. Sie will: Reiche sollen mehr bezahlen, Mieten sollen billiger werden, große Firmen sollen dem Staat gehören, Schule und Uni sollen kostenlos sein, und die Bundeswehr soll nicht im Ausland kämpfen.",
      en: "The Left Party stands for a Germany with significantly less social inequality. Voting for this party means supporting a future with wealth redistribution, nationalization of housing corporations and key industries, rent caps, tuition-free education, and an end to all foreign military deployments. The Left focuses on a society where basic needs like housing, healthcare, and mobility are not left to the market.",
    },
    economicImpact: {
      de: "Vermögenssteuer und höhere Spitzensteuersätze würden erhebliche Mehreinnahmen generieren, könnten aber Kapitalflucht und Abwanderung von Unternehmen auslösen. Die Verstaatlichung von Wohnungskonzernen würde Mieten deckeln, erfordert aber massive staatliche Investitionen und schreckt private Investoren ab. Ein Mietendeckel würde Mieter sofort entlasten, kann aber langfristig den Neubau bremsen. Gebührenfreie Bildung und ÖPNV stärken die Chancengleichheit, kosten aber Milliarden. Für Geringverdiener und Mieter wären die Auswirkungen positiv, für Vermögende und Unternehmer deutlich negativ.",
      "de-leicht": "Wer reich ist, zahlt viel mehr Steuern. Mieten werden billiger gemacht. Große Wohnungsfirmen sollen dem Staat gehören. Schule und Bus werden kostenlos. Das kostet sehr viel Geld. Manche Firmen könnten ins Ausland gehen. Wer wenig Geld hat, hat mehr davon. Wer viel Geld hat, hat weniger.",
      en: "Wealth taxes and higher top tax rates would generate significant additional revenue but could trigger capital flight and corporate relocation. Nationalization of housing corporations would cap rents but requires massive state investment and deters private investors. A rent cap would immediately relieve tenants but could slow new construction long-term. Free education and public transport strengthen equal opportunity but cost billions. The effects would be positive for low earners and renters, significantly negative for the wealthy and business owners.",
    },
    scenarios: [
      { group: { de: "Angestellte & Arbeitnehmer", "de-leicht": "Angestellte", en: "Employees" }, icon: "👔", verdict: "positiv", impact: { de: "Deutlich höherer Mindestlohn und Einführung einer 4-Tage-Woche bei vollem Lohnausgleich. Stärkung der Gewerkschaften und Ausweitung der Tarifbindung. Besserer Kündigungsschutz und erweiterte Mitbestimmungsrechte. Kostenloser ÖPNV entlastet Pendler.", "de-leicht": "Viel mehr Lohn, besonders für Geringverdiener. Nur noch 4 Tage Arbeit pro Woche. Stärkerer Schutz vor Kündigung. Bus und Bahn werden kostenlos.", en: "Significantly higher minimum wage and introduction of a 4-day work week at full pay. Strengthening of trade unions and expansion of collective bargaining. Better dismissal protection and expanded co-determination rights. Free public transport relieves commuters." } },
      { group: { de: "Selbstständige & Freiberufler", "de-leicht": "Selbstständige", en: "Self-employed" }, icon: "💼", verdict: "negativ", impact: { de: "Deutlich höhere Steuern auf hohe Einkommen und Vermögen. Pflicht zur Sozialversicherung für alle Selbstständigen erhöht die Abgabenlast. Strengere Regulierung und mehr Arbeitnehmerrechte erhöhen die Kosten bei Beschäftigung von Personal. Bürokratie steigt durch neue Melde- und Dokumentationspflichten.", "de-leicht": "Viel höhere Steuern, wenn man gut verdient. Pflicht, in die Sozialversicherung einzuzahlen. Mehr Regeln und Papierkram. Personal wird teurer.", en: "Significantly higher taxes on high incomes and wealth. Mandatory social insurance for all self-employed increases the contribution burden. Stricter regulation and more worker rights increase costs when employing staff. Bureaucracy rises from new reporting and documentation requirements." } },
      { group: { de: "Landwirte", "de-leicht": "Bauern", en: "Farmers" }, icon: "🌾", verdict: "gemischt", impact: { de: "Gezielte Förderung kleiner und mittlerer Bauernhöfe sowie ökologischer Landwirtschaft. Gleichzeitig Bodenreform, die den Zugang zu Land für Großinvestoren einschränkt. Strengere Regulierung industrieller Tierhaltung und Großbetriebe. Höhere Mindestlöhne für Saisonarbeiter erhöhen die Personalkosten.", "de-leicht": "Mehr Geld für kleine Bauernhöfe und Bio-Landwirtschaft. Strengere Regeln für große Betriebe und Massentierhaltung. Erntehelfer müssen besser bezahlt werden.", en: "Targeted support for small and medium farms and organic agriculture. At the same time, land reform restricting large investors' access to farmland. Stricter regulation of industrial animal farming and large operations. Higher minimum wages for seasonal workers increase labor costs." } },
      { group: { de: "Mittelstand & KMU", "de-leicht": "Kleine Firmen", en: "SMEs" }, icon: "🏭", verdict: "negativ", impact: { de: "Deutlich höherer Mindestlohn und Pflicht zur Tarifbindung erhöhen die Personalkosten erheblich. Vermögenssteuer belastet kapitalkräftige Unternehmer. Mehr Regulierung und erweiterte Mitbestimmungsrechte schränken unternehmerische Flexibilität ein. Verstaatlichungen in Schlüsselbranchen verunsichern private Investoren.", "de-leicht": "Viel höhere Lohnkosten durch Mindestlohn und Tarifpflicht. Vermögenssteuer trifft Firmenbesitzer. Mehr Regeln und weniger Flexibilität. Verstaatlichungen machen Investoren nervös.", en: "Significantly higher minimum wage and mandatory collective bargaining substantially increase labor costs. Wealth tax burdens capital-rich entrepreneurs. More regulation and expanded co-determination rights limit entrepreneurial flexibility. Nationalization in key sectors unsettles private investors." } },
      { group: { de: "Rentner & Senioren", "de-leicht": "Rentner", en: "Retirees" }, icon: "🏡", verdict: "positiv", impact: { de: "Deutliche Anhebung der Mindestrente auf ein armutsfestes Niveau. Keine Erhöhung des Renteneintrittsalters. Kostenloser öffentlicher Nahverkehr entlastet den Alltag. Ausbau der Pflegeversicherung und Deckelung der Eigenanteile in Pflegeheimen.", "de-leicht": "Höhere Renten, besonders für Geringverdiener. Nicht länger arbeiten müssen. Kostenlos Bus und Bahn fahren. Pflege im Alter wird besser bezahlt.", en: "Significant increase of the minimum pension to a level that prevents poverty. No increase of the retirement age. Free public transport eases daily life. Expansion of care insurance and capping of out-of-pocket costs in nursing homes." } },
      { group: { de: "Immobilienbesitzer & Vermieter", "de-leicht": "Hausbesitzer", en: "Property owners" }, icon: "🏠", verdict: "negativ", impact: { de: "Bundesweiter Mietendeckel begrenzt Mieteinnahmen drastisch. Verstaatlichung großer Wohnungskonzerne als politisches Ziel. Spekulationssteuer auf Immobiliengewinne und Verbot von Luxussanierungen zur Mieterhöhung. Strengere Regulierung von Kurzzeitvermietungen wie Airbnb.", "de-leicht": "Mieten werden stark begrenzt. Große Vermieter sollen verstaatlicht werden. Gewinne aus Hausverkäufen werden stärker besteuert. Weniger Möglichkeiten, Mieten zu erhöhen.", en: "Nationwide rent cap drastically limits rental income. Nationalization of large housing corporations as a political goal. Speculation tax on real estate gains and ban on luxury renovations to raise rents. Stricter regulation of short-term rentals like Airbnb." } },
    ],
  },
  "BSW": {
    summary: "Das Bündnis Sahra Wagenknecht wurde 2024 gegründet. Die Partei verbindet wirtschaftlich linke Positionen mit konservativen gesellschaftspolitischen Ansichten.",
    positions: "Kernthemen sind soziale Gerechtigkeit, eine restriktivere Migrationspolitik, diplomatische Lösungen im Ukraine-Konflikt, Ablehnung von Waffenlieferungen und Kritik an den etablierten Parteien.",
    vision: {
      de: "Das BSW steht für ein Deutschland, das wirtschaftlich links und gesellschaftspolitisch konservativ denkt. Wer diese Partei wählt, unterstützt eine Zukunft mit höheren Löhnen und besserer Sozialpolitik, aber auch mit kontrollierter Migration und einer Außenpolitik, die auf Diplomatie statt Waffenlieferungen setzt. Das BSW will den Ukraine-Konflikt durch Verhandlungen beenden, Millionäre stärker besteuern und gleichzeitig gesellschaftliche Traditionen bewahren.",
      "de-leicht": "Das BSW will bessere Löhne und mehr Soziales, aber auch weniger Einwanderung. Es will keine Waffen an die Ukraine liefern, sondern Frieden durch Verhandlungen. Reiche sollen mehr Steuern zahlen. Es kritisiert die anderen großen Parteien.",
      en: "The BSW stands for a Germany that thinks economically left and socially conservative. Voting for this party means supporting a future with higher wages and better social policy, but also controlled migration and a foreign policy based on diplomacy rather than arms deliveries. The BSW wants to end the Ukraine conflict through negotiations, tax millionaires more heavily, and preserve social traditions.",
    },
    economicImpact: {
      de: "Höhere Besteuerung von Millionären und Großkonzernen würde Staatseinnahmen erhöhen, könnte aber Investoren verunsichern. Die Forderung nach besseren Löhnen stärkt die Kaufkraft der Arbeitnehmer, erhöht aber Personalkosten. Die Ablehnung von Waffenlieferungen könnte diplomatische Beziehungen zu westlichen Partnern belasten und sicherheitspolitische Konsequenzen haben. Eine restriktivere Migrationspolitik adressiert Integrationsprobleme, verschärft aber den Fachkräftemangel. Das BSW verbindet klassische linke Wirtschaftspolitik mit konservativer Gesellschaftspolitik — ein Ansatz, dessen wirtschaftliche Folgen stark davon abhängen, wie radikal die Umverteilung ausfällt.",
      "de-leicht": "Reiche Menschen und große Firmen sollen mehr Steuern zahlen. Arbeiter sollen bessere Löhne bekommen. Weniger Einwanderer könnten weniger Arbeiter bedeuten. Keine Waffen an andere Länder liefern kann Probleme mit anderen Ländern bringen. Wie stark sich die Wirtschaft ändert, hängt davon ab, wie viel die Partei wirklich umsetzt.",
      en: "Higher taxation of millionaires and large corporations would increase government revenue but could unsettle investors. The demand for better wages strengthens workers' purchasing power but increases labor costs. Rejecting arms deliveries could strain diplomatic relations with Western partners and have security consequences. More restrictive migration addresses integration issues but worsens the skilled labor shortage. The BSW combines classic left-wing economic policy with conservative social policy — an approach whose economic consequences depend heavily on how radical the redistribution turns out to be.",
    },
    scenarios: [
      { group: { de: "Angestellte & Arbeitnehmer", "de-leicht": "Angestellte", en: "Employees" }, icon: "👔", verdict: "positiv", impact: { de: "Forderung nach deutlich höheren Löhnen und besserer sozialer Absicherung. Stärkung der Tarifbindung und Arbeitnehmerrechte. Höhere Besteuerung von Großkonzernen soll Entlastung für Normalverdiener finanzieren. Friedensdiplomatie könnte langfristig Energiekosten senken.", "de-leicht": "Bessere Löhne und mehr soziale Sicherheit. Große Firmen zahlen mehr Steuern, damit normale Leute entlastet werden. Frieden soll Energie billiger machen.", en: "Demand for significantly higher wages and better social security. Strengthening of collective bargaining and worker rights. Higher taxation of large corporations to finance relief for average earners. Peace diplomacy could lower energy costs long-term." } },
      { group: { de: "Selbstständige & Freiberufler", "de-leicht": "Selbstständige", en: "Self-employed" }, icon: "💼", verdict: "gemischt", impact: { de: "Höhere Steuern für Vermögende und Großverdiener belasten gut verdienende Selbstständige. Gleichzeitig verspricht das BSW weniger Bürokratie und einen schlankeren Staat. Die wirtschaftspolitische Ausrichtung auf die Binnenwirtschaft kann neue Chancen eröffnen, aber die außenpolitische Isolation birgt Risiken für international tätige Freiberufler.", "de-leicht": "Wer viel verdient, zahlt mehr Steuern. Dafür soll es weniger Bürokratie geben. Die Außenpolitik könnte den Handel mit manchen Ländern schwieriger machen.", en: "Higher taxes for the wealthy and high earners burden well-earning self-employed. At the same time, the BSW promises less bureaucracy and a leaner state. The economic focus on the domestic economy can open new opportunities, but foreign policy isolation poses risks for internationally active freelancers." } },
      { group: { de: "Landwirte", "de-leicht": "Bauern", en: "Farmers" }, icon: "🌾", verdict: "gemischt", impact: { de: "Unterstützung für regionale Landwirtschaft und kurze Lieferketten stärkt heimische Betriebe. Skepsis gegenüber der EU-Agrarpolitik könnte zu weniger Bürokratie führen, aber auch den Wegfall von EU-Subventionen bedeuten. Fokus auf Ernährungssouveränität begünstigt lokale Produktion.", "de-leicht": "Mehr Unterstützung für regionale Bauern. Kritik an EU-Regeln kann weniger Bürokratie bringen, aber auch weniger EU-Geld. Lokale Lebensmittel werden bevorzugt.", en: "Support for regional agriculture and short supply chains strengthens domestic farms. Skepticism toward EU agricultural policy could reduce bureaucracy but also mean loss of EU subsidies. Focus on food sovereignty favors local production." } },
      { group: { de: "Mittelstand & KMU", "de-leicht": "Kleine Firmen", en: "SMEs" }, icon: "🏭", verdict: "gemischt", impact: { de: "Höhere Lohnforderungen steigern die Personalkosten für kleine und mittlere Unternehmen. Gleichzeitig soll die Stärkung der Binnenwirtschaft und der Kaufkraft die Nachfrage ankurbeln. Weniger Bürokratie wird versprochen, aber die genauen Maßnahmen bleiben oft vage. Höhere Steuern für Großkonzerne könnten kleinere Wettbewerber indirekt begünstigen.", "de-leicht": "Löhne steigen, was für Firmen teurer wird. Dafür kaufen die Leute mehr ein. Weniger Bürokratie ist geplant. Große Firmen zahlen mehr Steuern, was kleinen Firmen helfen kann.", en: "Higher wage demands increase labor costs for small and medium businesses. At the same time, strengthening the domestic economy and purchasing power should boost demand. Less bureaucracy is promised, but specific measures often remain vague. Higher taxes on large corporations could indirectly benefit smaller competitors." } },
      { group: { de: "Rentner & Senioren", "de-leicht": "Rentner", en: "Retirees" }, icon: "🏡", verdict: "positiv", impact: { de: "Forderung nach höheren Renten und Stabilisierung des Rentenniveaus. Friedensdiplomatie und Ablehnung von Waffenlieferungen soll Energiekosten senken, wovon Rentnerhaushalte besonders profitieren würden. Stärkere Besteuerung von Vermögen soll die Rentenkasse stabilisieren. Fokus auf soziale Sicherheit.", "de-leicht": "Höhere Renten versprochen. Frieden soll Heizen billiger machen. Reiche sollen mehr für die Rente bezahlen. Mehr soziale Sicherheit im Alter.", en: "Demand for higher pensions and stabilization of pension levels. Peace diplomacy and rejection of arms deliveries should lower energy costs, benefiting retiree households in particular. Stronger taxation of wealth to stabilize the pension fund. Focus on social security." } },
      { group: { de: "Immobilienbesitzer & Vermieter", "de-leicht": "Hausbesitzer", en: "Property owners" }, icon: "🏠", verdict: "gemischt", impact: { de: "Mietregulierung geplant, aber weniger radikal als bei der Linken — kein Mietendeckel, sondern Begrenzung übermäßiger Mieterhöhungen. Förderung von sozialem Wohnungsbau. Niedrigere Energiekosten durch Friedenspolitik könnten die Nebenkosten senken. Vermögensteuer könnte Immobilienbesitzer mit großem Portfolio treffen.", "de-leicht": "Mieten sollen nicht zu stark steigen, aber es gibt keinen festen Mietendeckel. Günstigere Energie hilft bei den Nebenkosten. Wer viele Häuser besitzt, zahlt vielleicht mehr Steuern.", en: "Rent regulation planned but less radical than the Left Party — no rent cap, but limits on excessive rent increases. Promotion of social housing construction. Lower energy costs through peace policy could reduce utility costs. Wealth tax could affect property owners with large portfolios." } },
    ],
  },
};

export default async function ParteiPage({
  params,
}: {
  params: { parliament: string; party: string };
}) {
  const isAll = params.parliament === "all";

  const { data: party } = await supabase
    .from("parties")
    .select("*")
    .eq("id", params.party)
    .single();

  if (!party) return notFound();

  let parliament: any = null;
  let parliamentIds: string[] = [];

  if (isAll) {
    const { data: allParliaments } = await supabase
      .from("parliaments")
      .select("id, name, legislature")
      .neq("data_status", "unavailable");
    parliamentIds = allParliaments?.map((p) => p.id) ?? [];
    parliament = { id: "all", name: "Bundestag", legislature: "Alle Wahlperioden" };
  } else {
    const { data: p } = await supabase
      .from("parliaments")
      .select("*")
      .eq("id", params.parliament)
      .single();
    if (!p) return notFound();
    parliament = p;
    parliamentIds = [p.id];
  }

  // Compute scores from analyses
  let overallScoreValue = 0;
  let topicScoresFormatted: { category: string; score: number }[] = [];
  let totalAnalyses = 0;
  let consistentCount = 0;
  let deviationCount = 0;

  {
    const analysisQuery = supabase
      .from("analyses")
      .select("alignment, vote_id, confidence")
      .eq("party_id", party.id)
      .gte("confidence", 0.8)
      .limit(2000);

    const { data: rawAnalyses } = await analysisQuery;

    let filteredAnalyses = rawAnalyses ?? [];
    if (!isAll) {
      const { data: parlVotes } = await supabase
        .from("votes")
        .select("id")
        .eq("parliament_id", parliament.id);
      const parlVoteIds = new Set(parlVotes?.map((v) => v.id) ?? []);
      filteredAnalyses = filteredAnalyses.filter((a) => parlVoteIds.has(a.vote_id));
    }

    totalAnalyses = filteredAnalyses.length;

    if (filteredAnalyses.length) {
      const totalAlignment = filteredAnalyses.reduce((sum, a) => sum + a.alignment, 0);
      overallScoreValue = Math.round((totalAlignment / filteredAnalyses.length) * 100);

      consistentCount = filteredAnalyses.filter((a) => a.alignment >= 0.5).length;
      deviationCount = filteredAnalyses.filter((a) => a.alignment < 0.5).length;
    }

    const voteIds = filteredAnalyses.map((a) => a.vote_id);
    if (voteIds.length > 0) {
      const { data: voteTopics } = await supabase
        .from("votes")
        .select("id, topic_category")
        .in("id", voteIds);

      const topicMap = new Map(voteTopics?.map((v) => [v.id, v.topic_category]) ?? []);

      const topicAgg: Record<string, { sum: number; count: number }> = {};
      for (const a of filteredAnalyses) {
        const topic = topicMap.get(a.vote_id);
        if (!topic) continue;
        if (!topicAgg[topic]) topicAgg[topic] = { sum: 0, count: 0 };
        topicAgg[topic].sum += a.alignment;
        topicAgg[topic].count++;
      }
      topicScoresFormatted = Object.entries(topicAgg)
        .map(([cat, agg]) => ({
          category: cat,
          score: Math.round((agg.sum / agg.count) * 100),
        }))
        .sort((a, b) => b.score - a.score);
    }
  }

  // Get members
  let membersQuery = supabase
    .from("members")
    .select("id, name, constituency, parliament_id, parliaments!inner(legislature)")
    .eq("party_id", party.id);

  if (!isAll) {
    membersQuery = membersQuery.eq("parliament_id", parliament.id);
  }

  const { data: partyMembers } = await membersQuery;
  const memberCount = partyMembers?.length ?? 0;
  const memberMap = new Map(partyMembers?.map((m) => [m.id, m]) ?? []);

  // Get all analyses for this party
  const { data: partyAnalyses } = await supabase
    .from("analyses")
    .select("vote_id, alignment, expected_vote")
    .eq("party_id", party.id)
    .gte("confidence", 0.8);

  // Get vote_results for all party members
  const memberIds = partyMembers?.map((m) => m.id) ?? [];

  let allVoteResults: any[] = [];
  if (memberIds.length > 0) {
    for (let i = 0; i < memberIds.length; i += 500) {
      const chunk = memberIds.slice(i, i + 500);
      const { data } = await supabase
        .from("vote_results")
        .select("member_id, vote_id, result")
        .in("member_id", chunk);
      allVoteResults.push(...(data ?? []));
    }
  }

  // Count deviations and consistent votes per member
  const analysisMap = new Map(partyAnalyses?.map((a) => [a.vote_id, a]) ?? []);
  const memberStats: Record<string, { consistent: number; deviations: number; absent: number; total: number }> = {};

  for (const vr of allVoteResults) {
    const analysis = analysisMap.get(vr.vote_id);
    if (!analysis) continue;

    if (!memberStats[vr.member_id]) {
      memberStats[vr.member_id] = { consistent: 0, deviations: 0, absent: 0, total: 0 };
    }
    memberStats[vr.member_id].total++;

    if (vr.result === "abwesend") {
      memberStats[vr.member_id].absent++;
      continue;
    }

    const votesMatch = vr.result.toLowerCase() === analysis.expected_vote?.toLowerCase();
    const effectiveAlignment = votesMatch ? Math.max(analysis.alignment, 0.7) : analysis.alignment;
    if (effectiveAlignment >= 0.5) {
      memberStats[vr.member_id].consistent++;
    } else {
      memberStats[vr.member_id].deviations++;
    }
  }

  // Most deviating members
  const deviatingMembers = Object.entries(memberStats)
    .filter(([_, s]) => s.deviations > 0)
    .sort((a, b) => b[1].deviations - a[1].deviations)
    .slice(0, 15)
    .map(([id, stats]) => {
      const m = memberMap.get(id) as any;
      return {
        id,
        name: m?.name ?? "Unbekannt",
        constituency: m?.constituency ?? null,
        legislature: m?.parliaments?.legislature ?? "",
        deviations: stats.deviations,
        consistent: stats.consistent,
        total: stats.total,
        score: stats.total > 0 ? Math.round(((stats.consistent) / (stats.total - stats.absent)) * 100) : 0,
      };
    });

  // Most reliable members (highest consistency, minimum 3 votes)
  const reliableMembers = Object.entries(memberStats)
    .filter(([_, s]) => (s.total - s.absent) >= 3)
    .sort((a, b) => {
      const scoreA = a[1].consistent / (a[1].total - a[1].absent);
      const scoreB = b[1].consistent / (b[1].total - b[1].absent);
      return scoreB - scoreA;
    })
    .slice(0, 15)
    .map(([id, stats]) => {
      const m = memberMap.get(id) as any;
      const votedTotal = stats.total - stats.absent;
      return {
        id,
        name: m?.name ?? "Unbekannt",
        constituency: m?.constituency ?? null,
        legislature: m?.parliaments?.legislature ?? "",
        consistent: stats.consistent,
        total: votedTotal,
        score: votedTotal > 0 ? Math.round((stats.consistent / votedTotal) * 100) : 0,
      };
    });

  // Party profile data
  const profile = PARTY_PROFILES[party.name] ?? null;

  // Generate strong/weak topics
  const strongTopics = topicScoresFormatted.filter((t) => t.score >= 70).map((t) => t.category);
  const weakTopics = topicScoresFormatted.filter((t) => t.score < 40).map((t) => t.category);

  const breadcrumbLabel = isAll ? "Alle Wahlperioden" : (parliament.state ?? parliament.name);

  return (
    <ParteiClient
      partyName={party.name}
      partyFullName={party.full_name}
      partyId={party.id}
      parliamentId={params.parliament}
      parliamentLegislature={parliament.legislature}
      breadcrumbLabel={breadcrumbLabel}
      isAll={isAll}
      memberCount={memberCount}
      overallScoreValue={overallScoreValue}
      totalAnalyses={totalAnalyses}
      consistentCount={consistentCount}
      deviationCount={deviationCount}
      topicScoresFormatted={topicScoresFormatted}
      strongTopics={strongTopics}
      weakTopics={weakTopics}
      reliableMembers={reliableMembers}
      deviatingMembers={deviatingMembers}
      profile={profile}
    />
  );
}
