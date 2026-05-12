/**
 * Server-only: curated homepage sections via OpenAI. Do not import from client components.
 */
import OpenAI from "openai";

import type { TrendingAnime } from "@/src/lib/anilist";
import { slugify } from "@/src/lib/slugify";

const DEFAULT_MODEL = "gpt-4o-mini";

export type GeneratedHomepageSection = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  anime_ids: number[];
  ai_reasoning: string;
  section_type: string;
};

function readOpenAIKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to your server environment (never NEXT_PUBLIC_*).",
    );
  }
  return key;
}

function buildAnimeListPayload(animeList: TrendingAnime[]): string {
  const rows = animeList.map((a) => ({
    id: a.id,
    title: a.title,
    genres: a.genres,
    format: a.format,
    status: a.status,
    averageScore: a.averageScore,
    seasonYear: a.seasonYear,
  }));
  return JSON.stringify({ anime: rows }, null, 0);
}

function normalizeSectionSlug(raw: string, index: number): string {
  const base = slugify(raw) || `section-${index + 1}`;
  return base.slice(0, 80);
}

/**
 * Ask OpenAI for ~4 editorial sections using only the given anime ids.
 * Validates ids, slugs, and trims to 4–8 picks per section.
 */
export async function generateHomepageSections(
  animeList: TrendingAnime[],
): Promise<GeneratedHomepageSection[]> {
  if (animeList.length < 8) {
    throw new Error(
      "Need at least ~8 anime entries to curate homepage sections meaningfully.",
    );
  }

  const allowed = new Set(animeList.map((a) => a.id));

  const client = new OpenAI({ apiKey: readOpenAIKey() });
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

  const system = [
    "You are a senior editor for AniDrop, a dark cyber-styled anime discovery site.",
    "Output ONE JSON object only (no markdown fences, no commentary).",
    'Top-level key must be exactly "sections" whose value is an array of 4 objects.',
    "Each object keys exactly: slug, title, subtitle, description, anime_ids, ai_reasoning, section_type.",
    "slug: URL-safe kebab-case in English, unique, max ~48 chars, no spaces.",
    "title, subtitle, description: short punchy English; subtitle optional tone line; description one sentence.",
    "anime_ids: array of 4–8 integers; EVERY id MUST appear in the input anime list only — never invent ids.",
    "ai_reasoning: one sentence on why this grouping fits the theme; no spoilers.",
    "section_type: short machine tag in snake_case (e.g. hidden_gems, fantasy_picks, weekend_watch).",
    "Themes should feel editorial and distinct (not generic 'Top Anime').",
    "No plot spoilers; lean on genres, format, status, and vibe.",
    "Prefer variety across sections (avoid repeating the same ids everywhere when possible).",
  ].join(" ");

  const user = [
    "Curate sections from this pool only (ids are authoritative):",
    buildAnimeListPayload(animeList),
  ].join("\n");

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.55,
    max_completion_tokens: 2200,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const rawText = completion.choices[0]?.message?.content?.trim();
  if (!rawText) {
    throw new Error("OpenAI returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText) as unknown;
  } catch {
    throw new Error("OpenAI returned non-JSON content.");
  }

  const root =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  const rawSections = root.sections;
  if (!Array.isArray(rawSections)) {
    throw new Error('OpenAI JSON must contain a "sections" array.');
  }

  const usedSlugs = new Set<string>();
  const out: GeneratedHomepageSection[] = [];

  for (let i = 0; i < rawSections.length; i++) {
    const item = rawSections[i];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }
    const o = item as Record<string, unknown>;

    let slug = normalizeSectionSlug(
      typeof o.slug === "string" ? o.slug : `section-${i + 1}`,
      i,
    );
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${i + 1}`;
    }
    usedSlugs.add(slug);

    const title =
      typeof o.title === "string" && o.title.trim()
        ? o.title.trim().slice(0, 120)
        : "Spotlight";
    const subtitle =
      typeof o.subtitle === "string" && o.subtitle.trim()
        ? o.subtitle.trim().slice(0, 200)
        : "";
    const description =
      typeof o.description === "string" && o.description.trim()
        ? o.description.trim().slice(0, 320)
        : "";
    const ai_reasoning =
      typeof o.ai_reasoning === "string" && o.ai_reasoning.trim()
        ? o.ai_reasoning.trim().slice(0, 400)
        : "Curated from current trending and seasonal pool.";
    const section_type =
      typeof o.section_type === "string" && o.section_type.trim()
        ? slugify(o.section_type).slice(0, 48) || "curated"
        : "curated";

    const rawIds = o.anime_ids;
    const ids: number[] = [];
    if (Array.isArray(rawIds)) {
      for (const x of rawIds) {
        const id = Math.trunc(Number(x));
        if (Number.isFinite(id) && id > 0 && allowed.has(id) && !ids.includes(id)) {
          ids.push(id);
        }
      }
    }

    const minPicks = 4;
    const maxPicks = 8;
    const picks = ids.slice(0, maxPicks);
    if (picks.length < minPicks) {
      continue;
    }

    out.push({
      slug,
      title,
      subtitle,
      description,
      anime_ids: picks,
      ai_reasoning,
      section_type,
    });
  }

  if (out.length < 3) {
    throw new Error(
      `OpenAI produced too few valid sections (${out.length}); need at least 3.`,
    );
  }

  return out.slice(0, 4);
}
