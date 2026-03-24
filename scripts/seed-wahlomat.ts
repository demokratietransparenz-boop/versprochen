/**
 * Seed script for importing Wahl-O-Mat data into the promises table.
 *
 * Usage:
 *   npx tsx scripts/seed-wahlomat.ts data/wahlomat-btw2025.json
 *
 * Expected JSON format:
 * [
 *   {
 *     "thesis_id": "1",
 *     "thesis_text": "Deutschland soll aus der NATO austreten.",
 *     "party": "SPD",
 *     "position": "ablehnung",
 *     "reasoning": "Die SPD steht zur NATO...",
 *     "topic_category": "Außenpolitik"
 *   },
 *   ...
 * ]
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

interface WahlomatEntry {
  thesis_id: string;
  thesis_text: string;
  party: string;
  position: "zustimmung" | "neutral" | "ablehnung";
  reasoning: string;
  topic_category: string;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx scripts/seed-wahlomat.ts <path-to-json>");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const db = createClient(supabaseUrl, serviceKey);

  const entries: WahlomatEntry[] = JSON.parse(readFileSync(filePath, "utf-8"));
  console.log(`Loaded ${entries.length} Wahl-O-Mat entries`);

  const { data: parliament } = await db
    .from("parliaments")
    .select("id")
    .eq("name", "Bundestag")
    .single();

  if (!parliament) {
    console.error("Bundestag not found in parliaments table. Seed parliaments first.");
    process.exit(1);
  }

  const { data: parties } = await db.from("parties").select("id, name");
  const partyMap = new Map(parties?.map((p) => [p.name, p.id]) ?? []);

  let inserted = 0;
  for (const entry of entries) {
    const partyId = partyMap.get(entry.party);
    if (!partyId) {
      console.warn(`Party not found: ${entry.party}, skipping`);
      continue;
    }

    const positionText =
      entry.position === "zustimmung"
        ? `Dafür: ${entry.thesis_text}`
        : entry.position === "ablehnung"
          ? `Dagegen: ${entry.thesis_text}`
          : `Neutral: ${entry.thesis_text}`;

    const { error } = await db.from("promises").insert({
      party_id: partyId,
      parliament_id: parliament.id,
      topic_category: entry.topic_category,
      text: `${positionText}\n\nBegründung: ${entry.reasoning}`,
      source: `Wahl-O-Mat These ${entry.thesis_id}`,
      wahlomat_thesis_id: entry.thesis_id,
    });

    if (error) {
      console.error(`Error inserting: ${error.message}`);
    } else {
      inserted++;
    }
  }

  console.log(`Inserted ${inserted}/${entries.length} promises`);
}

main().catch(console.error);
