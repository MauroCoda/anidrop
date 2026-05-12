import { NextResponse } from "next/server";

import {
  animeDetailToCacheUpsert,
  upsertAnimeCache,
} from "@/src/lib/anime-cache";
import { getAnimeById } from "@/src/lib/anilist";
import { generateAnimeAIContent } from "@/src/lib/openai";
import { isSupabaseConfigured } from "@/src/lib/supabase";

export const runtime = "nodejs";

type Body = {
  id?: number | string;
};

function parseId(body: unknown): number | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const raw = (body as Body).id;
  const n = typeof raw === "string" ? Number.parseInt(raw, 10) : Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    return null;
  }
  return Math.floor(n);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const id = parseId(body);
  if (id == null) {
    return NextResponse.json(
      { error: "Provide a positive numeric `id` (AniList media id)." },
      { status: 400 },
    );
  }

  let anime;
  try {
    anime = await getAnimeById(id);
  } catch (e) {
    const message = e instanceof Error ? e.message : "AniList request failed";
    return NextResponse.json(
      { error: "Could not load anime from AniList.", details: message },
      { status: 502 },
    );
  }

  if (!anime) {
    return NextResponse.json({ error: "Anime not found." }, { status: 404 });
  }

  let content;
  try {
    content = await generateAnimeAIContent(anime);
  } catch (e) {
    const message = e instanceof Error ? e.message : "OpenAI request failed";
    const missingKey = message.includes("OPENAI_API_KEY");
    return NextResponse.json(
      { error: missingKey ? "OpenAI is not configured." : "AI generation failed.", details: message },
      { status: missingKey ? 503 : 500 },
    );
  }

  let cache:
    | { status: "ok"; rowId: number }
    | { status: "skipped"; reason: string }
    | { status: "error"; message: string; code?: string };

  if (isSupabaseConfigured()) {
    const payload = animeDetailToCacheUpsert(anime, content);
    const res = await upsertAnimeCache(payload);
    if (res.ok) {
      cache = { status: "ok", rowId: res.row.id };
    } else {
      cache = { status: "error", message: res.message, code: res.code };
    }
  } else {
    cache = {
      status: "skipped",
      reason: "Supabase env vars not set; skipped upsert.",
    };
  }

  return NextResponse.json({ content, cache });
}
