import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data } = await supabase
    .from("analyses")
    .select("id, alignment, votes!inner(source_url, title)")
    .lt("alignment", 0.5)
    .gte("confidence", 0.8)
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json(data?.map((d: any) => ({
    title: d.votes.title,
    source_url: d.votes.source_url,
    broken: d.votes.source_url?.includes("dehttps"),
  })));
}
