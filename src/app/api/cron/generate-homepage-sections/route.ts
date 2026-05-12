import { timingSafeEqual } from "crypto";

import { NextResponse } from "next/server";

import { generateHomepageSections } from "@/src/lib/homepage-ai";
import {
  currentUtcMonthYear,
  deactivateHomepageSectionsForMonth,
  upsertHomepageSection,
} from "@/src/lib/homepage-sections";
import {
  getCurrentSeasonAnime,
  getTrendingAnime,
  type TrendingAnime,
} from "@/src/lib/anilist";
import { isSupabaseConfigured } from "@/src/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Regenerates AI-curated homepage sections for the **current UTC month** and
 * stores them in `homepage_sections`.
 *
 * ## Security
 * - Server-only Route Handler. Never call from the browser.
 * - `Authorization: Bearer <CRON_SECRET>` (same pattern as other AniDrop crons).
 *
 * ## Vercel / external schedulers
 * - Example: `curl -sS -X POST "https://<host>/api/cron/generate-homepage-sections" \
 *     -H "Authorization: Bearer $CRON_SECRET"`
 * - Schedule monthly or weekly; homepage reads rows for the active calendar month.
 *
 * ## Env
 * - `CRON_SECRET`, `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_*` (anon URL + key).
 */

const TRENDING_POOL = 24;
const SEASON_POOL = 24;
const MAX_POOL = 48;

type SummaryBody = {
  generatedSections: number;
  savedSections: number;
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

function mergeUniqueAnime(
  trending: TrendingAnime[],
  season: TrendingAnime[],
  cap: number,
): TrendingAnime[] {
  const seen = new Set<number>();
  const out: TrendingAnime[] = [];
  for (const item of [...trending, ...season]) {
    const id = Math.trunc(Number(item.id));
    if (!Number.isFinite(id) || id <= 0 || seen.has(id)) {
      continue;
    }
    seen.add(id);
    out.push(item);
    if (out.length >= cap) {
      break;
    }
  }
  return out;
}

async function handle(request: Request): Promise<NextResponse> {
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

  const errors: string[] = [];
  let pool: TrendingAnime[] = [];

  try {
    const [trending, season] = await Promise.all([
      getTrendingAnime(TRENDING_POOL),
      getCurrentSeasonAnime(SEASON_POOL),
    ]);
    pool = mergeUniqueAnime(trending, season, MAX_POOL);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AniList request failed";
    errors.push(`AniList: ${msg}`);
    return NextResponse.json(
      { generatedSections: 0, savedSections: 0, errors } satisfies SummaryBody,
      { status: 502 },
    );
  }

  if (pool.length < 8) {
    errors.push("Not enough unique anime from AniList to curate sections.");
    return NextResponse.json(
      { generatedSections: 0, savedSections: 0, errors } satisfies SummaryBody,
      { status: 422 },
    );
  }

  const { month, year } = currentUtcMonthYear();

  let generated: Awaited<ReturnType<typeof generateHomepageSections>> = [];
  try {
    generated = await generateHomepageSections(pool);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "OpenAI failed";
    errors.push(msg);
    return NextResponse.json(
      {
        generatedSections: 0,
        savedSections: 0,
        errors,
      } satisfies SummaryBody,
      { status: 500 },
    );
  }

  const deactivated = await deactivateHomepageSectionsForMonth(year, month);
  if (!deactivated.ok && deactivated.message) {
    errors.push(`Deactivate previous rows: ${deactivated.message}`);
  }

  let savedSections = 0;
  for (const section of generated) {
    const res = await upsertHomepageSection({
      slug: section.slug,
      title: section.title,
      subtitle: section.subtitle || null,
      description: section.description || null,
      anime_ids: section.anime_ids,
      ai_reasoning: section.ai_reasoning,
      section_type: section.section_type,
      is_active: true,
      month,
      year,
    });
    if (!res.ok) {
      errors.push(`slug ${section.slug}: ${res.message}`);
    } else {
      savedSections += 1;
    }
  }

  const body: SummaryBody = {
    generatedSections: generated.length,
    savedSections,
    errors,
  };

  const status =
    generated.length > 0 && savedSections === 0 ? 500 : 200;
  return NextResponse.json(body, { status });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
