import { NextResponse } from "next/server";

import {
  animeCacheHasFullAiContent,
  animeCacheRowToAIContent,
  animeDetailToCacheUpsert,
  getCachedAnimeById,
  upsertAnimeCache,
} from "@/src/lib/anime-cache";
import { getAnimeById } from "@/src/lib/anilist";
import { generateAnimeAIContent, type AnimeAIContent } from "@/src/lib/openai";
import { isSupabaseConfigured } from "@/src/lib/supabase";

export const runtime = "nodejs";

type Body = {
  id?: number | string;
  /** Dev-only: bypass cache hit and re-run OpenAI (ignored in production). */
  regenerate?: boolean;
};

type CachePayload =
  | { status: "hit"; rowId: number }
  | { status: "ok"; rowId: number }
  | { status: "skipped"; reason: string }
  | { status: "error"; message: string; code?: string };

function parsePostBody(body: unknown): {
  id: number | null;
  forceRegenerate: boolean;
} {
  if (!body || typeof body !== "object") {
    return { id: null, forceRegenerate: false };
  }
  const raw = body as Body;
  const n =
    typeof raw.id === "string"
      ? Number.parseInt(raw.id, 10)
      : Number(raw.id);
  if (!Number.isFinite(n) || n <= 0) {
    return { id: null, forceRegenerate: false };
  }
  const forceRegenerate =
    Boolean(raw.regenerate) && process.env.NODE_ENV === "development";
  return { id: Math.floor(n), forceRegenerate };
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

  const { id, forceRegenerate } = parsePostBody(body);
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

  let cached = null;
  if (isSupabaseConfigured()) {
    cached = await getCachedAnimeById(id);
  }

  if (cached && animeCacheHasFullAiContent(cached) && !forceRegenerate) {
    const content: AnimeAIContent = animeCacheRowToAIContent(cached);
    const cache: CachePayload = { status: "hit", rowId: cached.id };
    return NextResponse.json({
      source: "cache" as const,
      content,
      cache,
    });
  }

  let content: AnimeAIContent;
  try {
    content = await generateAnimeAIContent(anime);
  } catch (e) {
    const message = e instanceof Error ? e.message : "OpenAI request failed";
    const missingKey = message.includes("OPENAI_API_KEY");
    return NextResponse.json(
      {
        error: missingKey ? "OpenAI is not configured." : "AI generation failed.",
        details: message,
      },
      { status: missingKey ? 503 : 500 },
    );
  }

  let cache: CachePayload;

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

  return NextResponse.json({
    source: "generated" as const,
    content,
    cache,
  });
}
