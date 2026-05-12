import { unstable_noStore as noStore } from "next/cache";

import type {
  HomepageSectionRow,
  HomepageSectionUpsert,
} from "@/src/types/homepage-section";
import { createSupabaseClient, isSupabaseConfigured } from "@/src/lib/supabase";

const TABLE = "homepage_sections" as const;

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

function mapRow(data: unknown): HomepageSectionRow | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const r = data as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : null;
  const slug = typeof r.slug === "string" ? r.slug.trim() : "";
  if (!id || !slug) {
    return null;
  }
  const rawIds = r.anime_ids;
  const anime_ids = Array.isArray(rawIds)
    ? rawIds
        .map((x) => {
          if (typeof x === "number" && Number.isFinite(x)) {
            return Math.trunc(x);
          }
          if (typeof x === "string" && /^\d+$/.test(x)) {
            return Math.trunc(Number.parseInt(x, 10));
          }
          return NaN;
        })
        .filter((n): n is number => Number.isFinite(n) && n > 0)
    : [];

  return {
    id,
    slug,
    title: typeof r.title === "string" ? r.title : "",
    subtitle: (r.subtitle as string) ?? null,
    description: (r.description as string) ?? null,
    anime_ids,
    ai_reasoning: (r.ai_reasoning as string) ?? null,
    section_type: (r.section_type as string) ?? null,
    is_active: Boolean(r.is_active),
    month:
      r.month === null || r.month === undefined
        ? 0
        : Number(r.month),
    year:
      r.year === null || r.year === undefined
        ? 0
        : Number(r.year),
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

/** UTC calendar month/year (1–12 / full year) for editorial windows. */
export function currentUtcMonthYear(): { month: number; year: number } {
  const d = new Date();
  return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };
}

/**
 * Active editorial sections for the current UTC month/year, oldest first.
 */
export async function getActiveHomepageSections(): Promise<HomepageSectionRow[]> {
  noStore();
  const supabase = supabaseOrNull();
  if (!supabase) {
    return [];
  }

  const { month, year } = currentUtcMonthYear();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("is_active", true)
    .eq("month", month)
    .eq("year", year)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[homepage_sections] getActiveHomepageSections failed", {
      code: error.code,
      message: error.message,
    });
    return [];
  }

  if (!data?.length) {
    return [];
  }

  return data
    .map((row) => mapRow(row))
    .filter((row): row is HomepageSectionRow => row != null);
}

export async function getHomepageSectionBySlug(
  slug: string,
): Promise<HomepageSectionRow | null> {
  noStore();
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
    console.error("[homepage_sections] getHomepageSectionBySlug failed", {
      slug,
      code: error.code,
      message: error.message,
    });
    return null;
  }

  return mapRow(data);
}

export type UpsertHomepageSectionResult =
  | { ok: true; row: HomepageSectionRow }
  | { ok: false; message: string; code?: string };

/**
 * Insert or update by `slug` (conflict target).
 */
export async function upsertHomepageSection(
  section: HomepageSectionUpsert,
): Promise<UpsertHomepageSectionResult> {
  const supabase = supabaseOrNull();
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const now = new Date().toISOString();
  const payload = {
    slug: section.slug.trim(),
    title: section.title.trim(),
    subtitle: section.subtitle ?? null,
    description: section.description ?? null,
    anime_ids: section.anime_ids.map((n) => Math.trunc(Number(n))).filter((n) => n > 0),
    ai_reasoning: section.ai_reasoning ?? null,
    section_type: section.section_type ?? null,
    is_active: section.is_active ?? true,
    month: Math.trunc(Number(section.month)),
    year: Math.trunc(Number(section.year)),
    updated_at: now,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "slug" })
    .select("*")
    .single();

  if (error) {
    const message =
      [error.message, error.details, error.hint].filter(Boolean).join(" | ") ||
      "Supabase upsert failed";
    console.error("[homepage_sections] upsert failed", {
      slug: payload.slug,
      code: error.code,
      message: error.message,
    });
    return { ok: false, message, code: error.code };
  }

  const row = mapRow(data);
  if (!row) {
    return { ok: false, message: "Upsert returned no parsable row." };
  }
  return { ok: true, row };
}

/**
 * Deactivates all rows for a given UTC month/year (before replacing with a new cron batch).
 */
export async function deactivateHomepageSectionsForMonth(
  year: number,
  month: number,
): Promise<{ ok: boolean; message?: string }> {
  const supabase = supabaseOrNull();
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const { error } = await supabase
    .from(TABLE)
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("year", Math.trunc(year))
    .eq("month", Math.trunc(month));

  if (error) {
    console.error("[homepage_sections] deactivate for month failed", {
      year,
      month,
      code: error.code,
      message: error.message,
    });
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
