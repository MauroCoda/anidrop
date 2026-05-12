import { NextRequest, NextResponse } from "next/server";

import { searchAnime } from "@/src/lib/anilist";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q === "") {
    return NextResponse.json([]);
  }

  try {
    const data = await searchAnime(q, 24);
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
