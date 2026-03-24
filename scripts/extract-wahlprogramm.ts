/**
 * Extract positions from a Wahlprogramm PDF using Claude.
 *
 * Usage:
 *   npx tsx scripts/extract-wahlprogramm.ts --party SPD --parliament-id <uuid> --pdf wahlprogramm-spd.pdf
 */

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const TOPIC_CATEGORIES = [
  "Klimapolitik", "Sozialpolitik", "Wirtschaft", "Migration", "Bildung",
  "Gesundheit", "Sicherheit", "Digitales", "Außenpolitik", "Finanzen",
];

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

async function main() {
  const args = process.argv.slice(2);
  const partyName = args[args.indexOf("--party") + 1];
  const parliamentId = args[args.indexOf("--parliament-id") + 1];
  const pdfPath = args[args.indexOf("--pdf") + 1];

  if (!partyName || !parliamentId || !pdfPath) {
    console.error("Usage: npx tsx scripts/extract-wahlprogramm.ts --party <name> --parliament-id <uuid> --pdf <path>");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const db = createClient(supabaseUrl, serviceKey);
  const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const { data: party } = await db.from("parties").select("id").eq("name", partyName).single();
  if (!party) { console.error(`Party ${partyName} not found`); process.exit(1); }

  const pdfBuffer = readFileSync(pdfPath);
  const pdfBase64 = pdfBuffer.toString("base64");

  console.log(`Extracting positions from ${pdfPath} for ${partyName}...`);

  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
        },
        {
          type: "text",
          text: `Extrahiere alle konkreten politischen Positionen und Versprechen aus diesem Wahlprogramm.

Für jede Position:
1. Der Originaltext (1-2 Sätze, direkt aus dem Programm)
2. Die Seitenzahl oder der Abschnitt
3. Die Themenkategorie: ${TOPIC_CATEGORIES.join(", ")}
4. Eine Version in Leichter Sprache (kurze Sätze, einfache Wörter)

Antworte als JSON-Array:
[{"text": "...", "source": "Wahlprogramm S. X", "topic_category": "...", "text_simple": "..."}]

Extrahiere mindestens 30 Positionen, die sich auf konkrete Abstimmungen beziehen könnten.`,
        },
      ],
    }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    console.error("No text in Claude response");
    process.exit(1);
  }

  const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("No JSON array found in response");
    console.error(textBlock.text.substring(0, 500));
    process.exit(1);
  }

  const positions = JSON.parse(jsonMatch[0]);
  console.log(`Extracted ${positions.length} positions`);

  let inserted = 0;
  for (const pos of positions) {
    const { error } = await db.from("promises").insert({
      party_id: party.id,
      parliament_id: parliamentId,
      topic_category: pos.topic_category,
      text: pos.text,
      text_simple: pos.text_simple,
      source: pos.source,
    });

    if (error) {
      console.error(`Error: ${error.message}`);
    } else {
      inserted++;
    }
  }

  console.log(`Inserted ${inserted}/${positions.length} promises for ${partyName}`);
}

main().catch(console.error);
