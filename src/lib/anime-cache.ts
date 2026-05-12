import type { AnimeDetail } from "@/src/lib/anilist";
import type { AnimeAIContent } from "@/src/lib/openai";
import type { AnimeCacheRow, AnimeCacheUpsert } from "@/src/types/anime";
import { createSupabaseClient, isSupabaseConfigured } from "@/src/lib/supabase";

const TABLE = "anime_cache" as const;

export type UpsertAnimeCacheResult =
  | { ok: true; row: AnimeCacheRow }
  | { ok: false; message: string; code?: string };

function supabaseOrNull() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    return createSupabaseClient();
  } catch {
    return null;
  }
}

function mapRow(data: unknown): AnimeCacheRow | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const r = data as Record<string, unknown>;
  const id = typeof r.id === "number" ? r.id : Number(r.id);
  if (!Number.isFinite(id)) {
    return null;
  }
  const slug = typeof r.slug === "string" ? r.slug : null;
  if (!slug) {
    return null;
  }
  const genres = Array.isArray(r.genres)
    ? r.genres.filter((g): g is string => typeof g === "string")
    : [];

  return {
    id,
    slug,
    title_romaji: (r.title_romaji as string) ?? null,
    title_english: (r.title_english as string) ?? null,
    cover_image: (r.cover_image as string) ?? null,
    banner_image: (r.banner_image as string) ?? null,
    description: (r.description as string) ?? null,
    genres,
    average_score:
      r.average_score === null || r.average_score === undefined
        ? null
        : Number(r.average_score),
    popularity:
      r.popularity === null || r.popularity === undefined
        ? null
        : Number(r.popularity),
    format: (r.format as string) ?? null,
    status: (r.status as string) ?? null,
    episodes:
      r.episodes === null || r.episodes === undefined
        ? null
        : Number(r.episodes),
    season: (r.season as string) ?? null,
    season_year:
      r.season_year === null || r.season_year === undefined
        ? null
        : Number(r.season_year),
    trailer_site: (r.trailer_site as string) ?? null,
    trailer_id: (r.trailer_id as string) ?? null,
    ai_summary: (r.ai_summary as string) ?? null,
    why_watch: (r.why_watch as string) ?? null,
    perfect_if_you_like: (r.perfect_if_you_like as string) ?? null,
    seo_title: (r.seo_title as string) ?? null,
    seo_description: (r.seo_description as string) ?? null,
    anilist_updated_at: (r.anilist_updated_at as string) ?? null,
    ai_updated_at: (r.ai_updated_at as string) ?? null,
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

function mapRows(rows: unknown[] | null): AnimeCacheRow[] {
  if (!rows?.length) {
    return [];
  }
  return rows
    .map((row) => mapRow(row))
    .filter((row): row is AnimeCacheRow => row != null);
}

function normalizeSeason(season: string): string {
  return season.trim().toUpperCase();
}

export async function getCachedAnimeById(
  id: number,
): Promise<AnimeCacheRow | null> {
  const supabase = supabaseOrNull();
  if (!supabase || !Number.isFinite(id)) {
    return null;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return null;
  }
  return mapRow(data);
}

export async function getCachedAnimeBySlug(
  slug: string,
): Promise<AnimeCacheRow | null> {
  const supabase = supabaseOrNull();
  if (!supabase || !slug.trim()) {
    return null;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("slug", slug.trim())
    .maybeSingle();

  if (error) {
    return null;
  }
  return mapRow(data);
}

export async function upsertAnimeCache(
  anime: AnimeCacheUpsert,
): Promise<UpsertAnimeCacheResult> {
  const supabase = supabaseOrNull();
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase is not configured.",
      code: "ANIDROP_NO_SUPABASE",
    };
  }

  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    ...anime,
    genres: anime.genres ?? [],
    updated_at: now,
  };
  delete payload.created_at;
  delete payload.updated_at;

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    return { ok: false, message: error.message, code: error.code };
  }

  const row = mapRow(data);
  if (!row) {
    return {
      ok: false,
      message: "Upsert returned no parsable row.",
      code: "ANIDROP_MAP",
    };
  }

  return { ok: true, row };
}

export async function getCachedSeasonAnime(
  season: string,
  year: number,
): Promise<AnimeCacheRow[]> {
  const supabase = supabaseOrNull();
  if (!supabase || !Number.isFinite(year)) {
    return [];
  }

  const s = normalizeSeason(season);
  if (!s) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("season", s)
    .eq("season_year", year)
    .order("popularity", { ascending: false, nullsFirst: false });

  if (error || !data) {
    return [];
  }
  return mapRows(data as unknown[]);
}

/** Stable slug for AniList-backed rows (until you add human slugs). */
export function animeCacheSlugForAnilistId(id: number): string {
  return `anime-${id}`;
}

/**
 * Map an AniList detail record into a Supabase upsert row (plus optional AI fields).
 */
export function animeDetailToCacheUpsert(
  anime: AnimeDetail,
  ai?: AnimeAIContent,
): AnimeCacheUpsert {
  const slug = animeCacheSlugForAnilistId(anime.id);
  const trailer_site = anime.trailerYoutubeId ? "youtube" : null;
  const trailer_id = anime.trailerYoutubeId;

  const base: AnimeCacheUpsert = {
    id: anime.id,
    slug,
    title_romaji: anime.titleRomaji,
    title_english: anime.title,
    cover_image: anime.coverImage?.trim() || null,
    banner_image: anime.bannerImage?.trim() || null,
    description: anime.description,
    genres: anime.genres,
    average_score: anime.averageScore,
    popularity: anime.popularity,
    format: anime.format,
    status: anime.status,
    episodes: anime.episodes,
    season: anime.season,
    season_year: anime.seasonYear,
    trailer_site,
    trailer_id,
  };

  if (!ai) {
    return base;
  }

  const now = new Date().toISOString();
  return {
    ...base,
    ai_summary: ai.ai_summary,
    why_watch: ai.why_watch,
    perfect_if_you_like: ai.perfect_if_you_like,
    seo_title: ai.seo_title,
    seo_description: ai.seo_description,
    ai_updated_at: now,
  };
}

/**
 * Until a dedicated trending signal exists in the table, orders by popularity then score.
 */
export async function getCachedTrendingAnime(
  limit: number,
): Promise<AnimeCacheRow[]> {
  const supabase = supabaseOrNull();
  if (!supabase || limit <= 0) {
    return [];
  }

  const safeLimit = Math.min(Math.floor(limit), 100);

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("popularity", { ascending: false, nullsFirst: false })
    .order("average_score", { ascending: false, nullsFirst: false })
    .limit(safeLimit);

  if (error || !data) {
    return [];
  }
  return mapRows(data as unknown[]);
}
