import { timingSafeEqual } from "crypto";

import { NextResponse } from "next/server";

import {
  animeCacheHasFullAiContent,
  buildAnimeCacheUpsertRow,
  getCachedAnimeById,
  upsertAnimeCache,
} from "@/src/lib/anime-cache";
import {
  getAnimeById,
  getCurrentSeasonAnime,
  getTrendingAnime,
} from "@/src/lib/anilist";
import { generateAnimeAIContent } from "@/src/lib/openai";
import { isSupabaseConfigured } from "@/src/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Allow long runs on Vercel / similar hosts (many sequential OpenAI calls). */
export const maxDuration = 300;

/**
 * Monthly AI pre-generation for trending + current-season anime (deduped, capped).
 *
 * ## Security
 * - Never call from the browser. Use a scheduler (CI, external cron, etc.) with
 *   `Authorization: Bearer <CRON_SECRET>` only.
 * - Set `CRON_SECRET` in the server environment (same value you send as Bearer).
 *
 * ## Vercel Cron (optional)
 * Vercel’s built-in `vercel.json` `crons` entries invoke your URL on a schedule
 * but **do not** attach custom `Authorization` headers by default. Options:
 * 1. Prefer **GitHub Actions** (or another cron) on a monthly schedule:
 *    `curl -sS -X POST "https://<your-domain>/api/cron/monthly-generation" \
 *      -H "Authorization: Bearer $CRON_SECRET"`
 * 2. Or use a Vercel **Cron** hitting a thin internal route that forwards with
 *    the secret stored only in env (still server-side).
 * 3. Schedule: e.g. first day of month — `0 5 1 * *` (UTC) in your scheduler.
 *
 * ## Env
 * - `CRON_SECRET` — required to authorize this handler.
 * - `OPENAI_API_KEY` — required for generations (never `NEXT_PUBLIC_*`).
 * - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required to upsert.
 */

const MAX_UNIQUE_IDS = 20;
const ANILIST_PAGE_SIZE = 12;
/** Pause after each OpenAI + upsert to reduce burst rate (ms). */
const DELAY_AFTER_GENERATION_MS = 900;

type SummaryBody = {
  totalFound: number;
  generated: number;
  skipped: number;
  failed: number;
  errors: string[];
};

function bearerToken(request: Request): string | null {
  const raw = request.headers.get("authorization");
  if (!raw) {
    return null;
  }
  const m = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return m?.[1]?.trim() ?? null;
}

function cronSecretConfigured(): boolean {
  return Boolean(process.env.CRON_SECRET?.trim());
}

function isAuthorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  const token = bearerToken(request);
  if (!expected || !token) {
    return false;
  }
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(token, "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

function mergeUniqueIds(
  trending: { id: number }[],
  season: { id: number }[],
  cap: number,
): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const item of [...trending, ...season]) {
    const id = Math.trunc(Number(item.id));
    if (!Number.isFinite(id) || id <= 0 || seen.has(id)) {
      continue;
    }
    seen.add(id);
    out.push(id);
    if (out.length >= cap) {
      break;
    }
  }
  return out;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function handleMonthlyGeneration(request: Request): Promise<NextResponse> {
  if (request.method !== "GET" && request.method !== "POST") {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405, headers: { Allow: "GET, POST" } },
    );
  }

  if (!cronSecretConfigured()) {
    return NextResponse.json(
      { error: "Server misconfiguration: CRON_SECRET is not set." },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 },
    );
  }

  let ids: number[] = [];
  try {
    const [trending, season] = await Promise.all([
      getTrendingAnime(ANILIST_PAGE_SIZE),
      getCurrentSeasonAnime(ANILIST_PAGE_SIZE),
    ]);
    ids = mergeUniqueIds(trending, season, MAX_UNIQUE_IDS);
  } catch (e) {
    const message = e instanceof Error ? e.message : "AniList request failed";
    return NextResponse.json(
      {
        totalFound: 0,
        generated: 0,
        skipped: 0,
        failed: 0,
        errors: [`AniList: ${message}`],
      } satisfies SummaryBody,
      { status: 502 },
    );
  }

  const errors: string[] = [];
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]!;
    const label = `id ${id}`;

    try {
      const cached = await getCachedAnimeById(id);
      if (animeCacheHasFullAiContent(cached)) {
        skipped += 1;
        continue;
      }

      const anime = await getAnimeById(id);
      if (!anime) {
        failed += 1;
        errors.push(`${label}: AniList returned no media.`);
        continue;
      }

      const ai = await generateAnimeAIContent(anime);
      const payload = buildAnimeCacheUpsertRow(anime, ai);
      const res = await upsertAnimeCache(payload);

      if (!res.ok) {
        failed += 1;
        errors.push(`${label}: ${res.message}`);
      } else {
        generated += 1;
      }

      if (i < ids.length - 1) {
        await delay(DELAY_AFTER_GENERATION_MS);
      }
    } catch (e) {
      failed += 1;
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${label}: ${msg}`);
      if (i < ids.length - 1) {
        await delay(DELAY_AFTER_GENERATION_MS);
      }
    }
  }

  const body: SummaryBody = {
    totalFound: ids.length,
    generated,
    skipped,
    failed,
    errors,
  };

  return NextResponse.json(body);
}

export async function GET(request: Request) {
  return handleMonthlyGeneration(request);
}

export async function POST(request: Request) {
  return handleMonthlyGeneration(request);
}
