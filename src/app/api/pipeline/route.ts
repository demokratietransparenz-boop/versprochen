import { NextRequest, NextResponse } from "next/server";
import { collectVotes } from "./collect";
import { categorizeNewVotes } from "./categorize";
import { matchVotesToPromises } from "./match";
import { analyzeMatches } from "./analyze";
import { aggregateScores } from "./aggregate";
import { getServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.PIPELINE_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getServiceClient();
  const results: Record<string, { status: string; detail?: string }> = {};

  try {
    results.collect = await collectVotes(db);
    results.categorize = await categorizeNewVotes(db);
    results.match = await matchVotesToPromises(db);
    results.analyze = await analyzeMatches(db);
    results.aggregate = await aggregateScores(db);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message, results }, { status: 500 });
  }
}
