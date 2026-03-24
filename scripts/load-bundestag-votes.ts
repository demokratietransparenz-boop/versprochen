/**
 * Load all votes from the 20. Bundestag (legislature 132 on abgeordnetenwatch.de)
 * into the Supabase database.
 *
 * Usage:
 *   npx tsx scripts/load-bundestag-votes.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qzlyurajxcwoljsrsakh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6bHl1cmFqeGN3b2xqc3JzYWtoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM0ODc5NywiZXhwIjoyMDg5OTI0Nzk3fQ.7QYIsPd5Q3mUP7HkIZ1IGcxs3GmiwiPjM6hhUgXzAVg";

const AW_BASE = "https://www.abgeordnetenwatch.de/api/v2";
const LEGISLATURE_ID = 132;

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Helpers ---

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function categorize(title: string): string | null {
  const t = title.toLowerCase();
  const rules: [string, string[]][] = [
    ["Gesundheit", ["gesundheit", "pflege", "pandemie", "corona", "impf", "kranken", "medizin", "patient", "triage", "organ"]],
    ["Migration", ["migration", "migrant", "asyl", "flüchtling", "zuwander", "aufenthalt", "abschieb", "einwander", "fachkräfteeinwander"]],
    ["Außenpolitik", ["außenpolitik", "nato", "ukraine", "russland", "china", "afghanistan", "bundeswehr", "verteidigung", "rüstung", "waffen", "militär", "soldat", "sondervermögen", "auslandseinsatz", "europa", "eu-", "sanktion"]],
    ["Finanzen", ["finanz", "steuer", "haushalt", "schulden", "bundeshaushalt", "etat", "bürgergeld", "rente", "inflation", "stabil"]],
    ["Bildung", ["bildung", "schule", "universität", "forschung", "wissenschaft", "bafög", "studier"]],
    ["Sicherheit", ["sicherheit", "polizei", "terrorismus", "kriminal", "strafrecht", "verfassungsschutz", "nachrichtendienst", "cybersicher", "messer"]],
    ["Umwelt", ["umwelt", "klima", "energie", "erneuerbar", "kohle", "emission", "co2", "solar", "wind", "atomkraft", "kernkraft", "heizung", "gebäudeenergie", "naturschutz", "wasser", "lng"]],
    ["Soziales", ["sozial", "mindestlohn", "arbeit", "wohnung", "miete", "kinder", "familie", "gleichstellung", "inklusion", "barriere", "selbstbestimmung", "schwanger"]],
    ["Wirtschaft", ["wirtschaft", "industrie", "handel", "lieferkette", "wettbewerb", "digital", "unternehm", "gewerbe", "landwirtschaft", "agrar", "cannabis"]],
    ["Digitales", ["digital", "daten", "internet", "online", "ki ", "künstliche intelligenz", "telekommunikation", "chatcontrol"]],
  ];
  for (const [cat, keywords] of rules) {
    if (keywords.some((kw) => t.includes(kw))) return cat;
  }
  return null;
}

// Map API party names to our DB names
function normalizePartyName(name: string): string {
  if (name === "CDU" || name === "CSU") return "CDU/CSU";
  if (name.includes("Grünen") || name === "GRÜNE" || name.includes("Bündnis 90")) return "GRÜNE";
  if (name === "DIE LINKE" || name === "DIE LINKE." || name.includes("LINKE")) return "LINKE";
  if (name === "Sozialdemokratische Partei Deutschlands") return "SPD";
  if (name === "Freie Demokratische Partei") return "FDP";
  if (name === "Alternative für Deutschland") return "AfD";
  if (name.includes("fraktionslos")) return "fraktionslos";
  if (name === "Bündnis Sahra Wagenknecht" || name === "BSW") return "BSW";
  return name;
}

function mapVoteResult(vote: string): "ja" | "nein" | "enthaltung" | "abwesend" {
  switch (vote) {
    case "yes": return "ja";
    case "no": return "nein";
    case "abstain": return "enthaltung";
    case "no_show": return "abwesend";
    default: return "abwesend";
  }
}

// --- Main ---

async function main() {
  console.log("=== Loading 20. Bundestag Votes ===\n");

  // Step 1: Check existing parliaments
  const { data: existingParliaments } = await db.from("parliaments").select("*");
  console.log("Existing parliaments:", JSON.stringify(existingParliaments, null, 2));

  // Find or create the Bundestag 20. Wahlperiode entry
  let parliamentId: string;
  const existing = existingParliaments?.find(
    (p) => p.name === "Bundestag" && p.legislature === "20. Wahlperiode"
  );
  if (existing) {
    parliamentId = existing.id;
    console.log(`Found existing Bundestag 20. WP: ${parliamentId}`);
    // Update to active if needed
    if (existing.data_status !== "active") {
      await db.from("parliaments").update({ data_status: "active" }).eq("id", parliamentId);
    }
  } else {
    // Check if there's a generic Bundestag entry to keep, or create new
    const { data: inserted, error } = await db
      .from("parliaments")
      .insert({
        name: "Bundestag",
        state: null,
        legislature: "20. Wahlperiode",
        api_source: "abgeordnetenwatch",
        data_status: "active",
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to insert parliament: ${error.message}`);
    parliamentId = inserted.id;
    console.log(`Created Bundestag 20. WP: ${parliamentId}`);
  }

  // Step 2: Ensure parties exist
  const { data: existingParties } = await db.from("parties").select("*");
  console.log("Existing parties:", existingParties?.map((p) => p.name).join(", "));

  const partyDefs: { name: string; full_name: string; color: string }[] = [
    { name: "SPD", full_name: "Sozialdemokratische Partei Deutschlands", color: "#E3000F" },
    { name: "CDU/CSU", full_name: "Christlich Demokratische Union / Christlich-Soziale Union", color: "#000000" },
    { name: "GRÜNE", full_name: "Bündnis 90/Die Grünen", color: "#64A12D" },
    { name: "FDP", full_name: "Freie Demokratische Partei", color: "#FFED00" },
    { name: "AfD", full_name: "Alternative für Deutschland", color: "#009EE0" },
    { name: "LINKE", full_name: "DIE LINKE", color: "#BE3075" },
    { name: "BSW", full_name: "Bündnis Sahra Wagenknecht", color: "#731432" },
    { name: "fraktionslos", full_name: "Fraktionslose Abgeordnete", color: "#888888" },
  ];

  const partyMap = new Map<string, string>();
  for (const p of existingParties ?? []) {
    partyMap.set(p.name, p.id);
  }
  for (const def of partyDefs) {
    if (!partyMap.has(def.name)) {
      const { data, error } = await db
        .from("parties")
        .insert(def)
        .select()
        .single();
      if (error) {
        console.warn(`Party insert error for ${def.name}: ${error.message}`);
      } else {
        partyMap.set(def.name, data.id);
        console.log(`Created party: ${def.name}`);
      }
    }
  }
  console.log(`Party map: ${partyMap.size} parties\n`);

  // Step 3: Load members for legislature 132
  console.log("--- Loading members ---");
  const { data: existingMembers } = await db
    .from("members")
    .select("id, abgeordnetenwatch_id")
    .eq("parliament_id", parliamentId);

  const memberAwIdMap = new Map<string, string>(); // aw_id -> member uuid
  for (const m of existingMembers ?? []) {
    if (m.abgeordnetenwatch_id) memberAwIdMap.set(m.abgeordnetenwatch_id, m.id);
  }
  console.log(`Existing members for this parliament: ${memberAwIdMap.size}`);

  let membersInserted = 0;
  let memberOffset = 0;
  const batchSize = 200;

  while (true) {
    const url = `${AW_BASE}/candidacies-mandates?parliament_period=${LEGISLATURE_ID}&range_start=${memberOffset}&range_end=${memberOffset + batchSize}`;
    console.log(`Fetching members: offset ${memberOffset}...`);
    const data = await fetchJson(url);
    const mandates = data.data;
    if (!mandates || mandates.length === 0) break;

    for (const m of mandates) {
      const politician = m.politician;
      if (!politician) continue;

      const awId = String(politician.id);
      if (memberAwIdMap.has(awId)) continue;

      // Get party from the fraction_membership or party info
      let partyName = "fraktionslos";
      if (m.fraction_membership && m.fraction_membership.length > 0) {
        const lastFraction = m.fraction_membership[m.fraction_membership.length - 1];
        if (lastFraction.fraction) {
          partyName = normalizePartyName(lastFraction.fraction.label || lastFraction.fraction.full_name || "fraktionslos");
        }
      } else if (m.party && m.party.label) {
        partyName = normalizePartyName(m.party.label);
      }

      const partyId = partyMap.get(partyName);
      if (!partyId) {
        console.warn(`No party found for "${partyName}" (member: ${politician.label}), skipping`);
        continue;
      }

      const { data: inserted, error } = await db
        .from("members")
        .insert({
          name: politician.label || `${politician.first_name} ${politician.last_name}`,
          party_id: partyId,
          parliament_id: parliamentId,
          abgeordnetenwatch_id: awId,
          constituency: m.electoral_data?.constituency?.label || null,
        })
        .select("id")
        .single();

      if (error) {
        console.warn(`Member insert error for ${politician.label}: ${error.message}`);
      } else {
        memberAwIdMap.set(awId, inserted.id);
        membersInserted++;
      }
    }

    if (mandates.length < batchSize) break;
    memberOffset += batchSize;
    await sleep(300);
  }
  console.log(`Members inserted: ${membersInserted}, total in DB: ${memberAwIdMap.size}\n`);

  // Step 4: Load polls
  console.log("--- Loading polls/votes ---");
  const { data: existingVotes } = await db
    .from("votes")
    .select("id, source_url")
    .eq("parliament_id", parliamentId);

  const existingVoteUrls = new Set(existingVotes?.map((v) => v.source_url) ?? []);
  console.log(`Existing votes for this parliament: ${existingVoteUrls.size}`);

  let pollOffset = 0;
  let allPolls: any[] = [];

  while (true) {
    const url = `${AW_BASE}/polls?field_legislature=${LEGISLATURE_ID}&range_start=${pollOffset}&range_end=${pollOffset + batchSize}`;
    console.log(`Fetching polls: offset ${pollOffset}...`);
    const data = await fetchJson(url);
    const polls = data.data;
    if (!polls || polls.length === 0) break;
    allPolls.push(...polls);
    if (polls.length < batchSize) break;
    pollOffset += batchSize;
    await sleep(300);
  }
  console.log(`Total polls from API: ${allPolls.length}`);

  let votesInserted = 0;
  let voteResultsInserted = 0;
  const voteIdMap = new Map<number, string>(); // poll_id -> vote uuid

  // Build map for existing votes
  for (const v of existingVotes ?? []) {
    // Try to extract poll id from source_url
    voteIdMap.set(0, v.id); // placeholder
  }

  for (const poll of allPolls) {
    const slug = poll.field_poll_date
      ? poll.label
          .toLowerCase()
          .replace(/[äÄ]/g, "ae")
          .replace(/[öÖ]/g, "oe")
          .replace(/[üÜ]/g, "ue")
          .replace(/[ß]/g, "ss")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      : "";

    // Use the abgeordnetenwatch URL from the API if available
    const sourceUrl = poll.abgeordnetenwatch_url ||
      `https://www.abgeordnetenwatch.de/bundestag/20/abstimmungen/${slug}`;

    if (existingVoteUrls.has(sourceUrl)) {
      // Find vote id for vote_results
      const existing = existingVotes?.find((v) => v.source_url === sourceUrl);
      if (existing) voteIdMap.set(poll.id, existing.id);
      continue;
    }

    const category = categorize(poll.label);

    const { data: inserted, error } = await db
      .from("votes")
      .insert({
        parliament_id: parliamentId,
        title: poll.label,
        description: poll.field_intro || null,
        date: poll.field_poll_date,
        source_url: sourceUrl,
        topic_category: category,
        analysis_status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.warn(`Vote insert error for "${poll.label}": ${error.message}`);
      continue;
    }

    voteIdMap.set(poll.id, inserted.id);
    votesInserted++;
  }
  console.log(`Votes inserted: ${votesInserted}\n`);

  // Step 5: Load individual vote results for each poll
  console.log("--- Loading vote results ---");

  // Check which votes already have results
  const voteIdsWithData = new Set<string>();
  for (const [pollId, voteUuid] of voteIdMap) {
    if (pollId === 0) continue;
    const { count } = await db
      .from("vote_results")
      .select("id", { count: "exact", head: true })
      .eq("vote_id", voteUuid);
    if (count && count > 0) {
      voteIdsWithData.add(voteUuid);
    }
  }
  console.log(`Votes already with results: ${voteIdsWithData.size}`);

  for (const poll of allPolls) {
    const voteUuid = voteIdMap.get(poll.id);
    if (!voteUuid) continue;
    if (voteIdsWithData.has(voteUuid)) continue;

    // Fetch individual votes for this poll
    let voteOffset = 0;
    let pollVoteResults: any[] = [];

    while (true) {
      const url = `${AW_BASE}/votes?poll=${poll.id}&range_start=${voteOffset}&range_end=${voteOffset + 400}`;
      try {
        const data = await fetchJson(url);
        const votes = data.data;
        if (!votes || votes.length === 0) break;
        pollVoteResults.push(...votes);
        if (votes.length < 400) break;
        voteOffset += 400;
      } catch (e: any) {
        console.warn(`Error fetching votes for poll ${poll.id}: ${e.message}`);
        break;
      }
      await sleep(200);
    }

    if (pollVoteResults.length === 0) {
      await sleep(200);
      continue;
    }

    // Build batch insert
    const rows: { vote_id: string; member_id: string; result: string }[] = [];
    for (const v of pollVoteResults) {
      const mandate = v.mandate;
      if (!mandate) continue;

      // The mandate has a politician reference
      const politicianId = mandate.politician?.id || v.mandate?.id;
      if (!politicianId) continue;

      // Try to find the member by aw_id of the politician
      // The mandate links to a politician; we stored politician.id as abgeordnetenwatch_id
      let memberId: string | undefined;

      // v.mandate could have politician info directly or we need to extract
      // In the API, vote.mandate.politician.id is the politician ID
      if (mandate.politician?.id) {
        memberId = memberAwIdMap.get(String(mandate.politician.id));
      }
      if (!memberId && mandate.id) {
        // Sometimes we might need to match by mandate id
        // Skip if we can't match
        continue;
      }
      if (!memberId) continue;

      rows.push({
        vote_id: voteUuid,
        member_id: memberId,
        result: mapVoteResult(v.vote),
      });
    }

    if (rows.length > 0) {
      // Insert in batches of 500
      for (let i = 0; i < rows.length; i += 500) {
        const batch = rows.slice(i, i + 500);
        const { error } = await db.from("vote_results").insert(batch);
        if (error) {
          console.warn(`Vote results insert error for poll ${poll.id}: ${error.message}`);
        } else {
          voteResultsInserted += batch.length;
        }
      }
    }

    console.log(`Poll ${poll.id} "${poll.label.substring(0, 50)}...": ${rows.length} vote results`);
    await sleep(300);
  }

  console.log("\n=== FINAL COUNTS ===");
  console.log(`Parliament: ${parliamentId}`);
  console.log(`Members inserted: ${membersInserted} (total: ${memberAwIdMap.size})`);
  console.log(`Votes inserted: ${votesInserted}`);
  console.log(`Vote results inserted: ${voteResultsInserted}`);
  console.log("Done!");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
