/**
 * Server-only OpenAI helpers. Do not import this module from client components.
 */
import OpenAI from "openai";

import type { AnimeDetail } from "@/src/lib/anilist";

const DEFAULT_MODEL = "gpt-4o-mini";

export type AnimeAIContent = {
  ai_summary: string;
  why_watch: string;
  perfect_if_you_like: string;
  seo_title: string;
  seo_description: string;
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

function buildUserPayload(anime: AnimeDetail): string {
  const desc =
    anime.description && anime.description.length > 1400
      ? `${anime.description.slice(0, 1400)}…`
      : (anime.description ?? "");

  return JSON.stringify(
    {
      id: anime.id,
      title: anime.title,
      title_romaji: anime.titleRomaji,
      genres: anime.genres,
      format: anime.format,
      status: anime.status,
      season: anime.season,
      season_year: anime.seasonYear,
      episodes: anime.episodes,
      average_score_10: anime.averageScore != null ? anime.averageScore / 10 : null,
      description_plaintext: desc,
    },
    null,
    0,
  );
}

function singleLine(s: string, max: number): string {
  const collapsed = s.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) {
    return collapsed;
  }
  return `${collapsed.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function coerceAIContent(raw: unknown): AnimeAIContent {
  const obj =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const pick = (key: string, fallback: string) => {
    const v = obj[key];
    return typeof v === "string" && v.trim() ? v.trim() : fallback;
  };

  const ai_summary = pick(
    "ai_summary",
    "A concise catalog entry for this series based on public metadata.",
  );
  const why_watch = pick(
    "why_watch",
    "Worth sampling if the genres and format match what you enjoy.",
  );
  const perfect_if_you_like = pick(
    "perfect_if_you_like",
    "Fans of similar genres and moods who want a bite-sized preview.",
  );
  let seo_title = pick("seo_title", "Anime on AniDrop");
  let seo_description = pick(
    "seo_description",
    "Discover this title on AniDrop — details, trailer, and scores.",
  );

  seo_title = singleLine(seo_title, 58);
  seo_description = singleLine(seo_description, 155);

  return {
    ai_summary: singleLine(ai_summary, 420),
    why_watch: singleLine(why_watch, 280),
    perfect_if_you_like: singleLine(perfect_if_you_like, 160),
    seo_title,
    seo_description,
  };
}

/**
 * Generates structured English copy for catalog / SEO. Uses OPENAI_API_KEY (server only).
 * Keeps output short, avoids spoilers, and prefers public metadata over speculation.
 */
export async function generateAnimeAIContent(
  anime: AnimeDetail,
): Promise<AnimeAIContent> {
  const client = new OpenAI({ apiKey: readOpenAIKey() });
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;

  const system = [
    "You write short English marketing copy for a dark-themed anime discovery site (AniDrop).",
    "Rules:",
    "- Output ONE JSON object only, no markdown fences, no commentary.",
    "- Keys exactly: ai_summary, why_watch, perfect_if_you_like, seo_title, seo_description.",
    "- ai_summary: max ~2 sentences, teaser tone, zero plot spoilers or twists.",
    "- why_watch: max ~2 sentences; appeal to genre/format fans; no spoilers.",
    "- perfect_if_you_like: one compact phrase (not a list of episode events); suggest tonal comps without spoiling.",
    "- seo_title: under 58 characters; may include the display title; no pipe spam.",
    "- seo_description: max ~155 characters; compelling, no spoilers, no ALL CAPS blocks.",
    "- If synopsis is missing, lean on genres, format, and status only.",
  ].join(" ");

  const user = [
    "Create the JSON fields for this anime metadata object:",
    buildUserPayload(anime),
  ].join("\n");

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.45,
    max_completion_tokens: 500,
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

  return coerceAIContent(parsed);
}
