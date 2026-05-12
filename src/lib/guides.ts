import {
  getCurrentSeasonAnime,
  getPopularAnimeByGenre,
  getRecommendedAnime,
  getTrendingAnime,
  type TrendingAnime,
} from "@/src/lib/anilist";

/** How to resolve catalog rows for a guide (AniList only — no OpenAI). */
export type GuideAnimeFilter =
  | { type: "current_season"; limit: number }
  | { type: "genre_popular"; genre: string; limit: number }
  | { type: "recommended_from"; seedMediaId: number; limit: number }
  | { type: "trending_slice"; start: number; end: number };

export type GuideDefinition = {
  slug: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  sectionType: string;
  animeFilter: GuideAnimeFilter;
  intro: string;
  criteria: string[];
  relatedKeywords: string[];
};

const FRIEREN_ANILIST_ID = 154587;

export const GUIDES: GuideDefinition[] = [
  {
    slug: "best-anime-this-season",
    title: "Best anime this season",
    description:
      "Popular new and continuing series in the current cour — picked from AniList’s seasonal chart without story spoilers.",
    seoTitle: "Best anime this season | AniDrop guides",
    seoDescription:
      "See what’s landing strongest this cour: a curated grid from the current seasonal lineup, plus how we shortlist titles on AniDrop.",
    sectionType: "seasonal_picks",
    animeFilter: { type: "current_season", limit: 16 },
    intro:
      "This page highlights standouts from the current seasonal window on AniList — the same cour you’ll see on the homepage. We focus on momentum, breadth of genres, and clear metadata (format, score, status) so you can sample safely without plot reveals.",
    criteria: [
      "Titles must be airing or scheduled in the current AniList season for this page.",
      "Sorted by seasonal popularity — a practical proxy for what the community is watching right now.",
      "We avoid synopsis deep-dives; use official blurbs and genres on the detail pages when you want more.",
    ],
    relatedKeywords: [
      "seasonal anime",
      "current season anime",
      "new anime",
      "AniList season chart",
    ],
  },
  {
    slug: "best-action-anime",
    title: "Best action anime to start now",
    description:
      "High-energy picks tagged with Action on AniList — popularity-ranked so the list stays fresh and readable.",
    seoTitle: "Best action anime | AniDrop guides",
    seoDescription:
      "Action-forward anime picks ranked by popularity on AniList. Short, spoiler-free framing and links into AniDrop detail pages.",
    sectionType: "genre_action",
    animeFilter: { type: "genre_popular", genre: "Action", limit: 16 },
    intro:
      "Action means different things to everyone — here we anchor on AniList’s Action genre tag and rank by global popularity so the page stays approachable. It’s a starting line, not a verdict: open a few cards, compare formats (TV vs movie), and follow what fits your taste.",
    criteria: [
      "Pool: anime with the Action genre on AniList.",
      "Ordering: POPULARITY_DESC within that pool.",
      "No episode-by-episode commentary — we keep this page as a routing hub into full detail + trailers.",
    ],
    relatedKeywords: [
      "action anime",
      "popular action anime",
      "shonen action",
      "anime recommendations",
    ],
  },
  {
    slug: "anime-like-frieren",
    title: "Anime like Frieren",
    description:
      "Community-rated recommendations adjacent to Frieren: Beyond Journey’s End — mood-adjacent picks without spoiling either show.",
    seoTitle: "Anime like Frieren | AniDrop guides",
    seoDescription:
      "Explore AniList-powered recommendations similar to Frieren. Spoiler-free guide copy with links into AniDrop’s anime pages.",
    sectionType: "taste_cluster",
    animeFilter: {
      type: "recommended_from",
      seedMediaId: FRIEREN_ANILIST_ID,
      limit: 14,
    },
    intro:
      "If you want more of that reflective fantasy adventure rhythm, AniList’s recommendation graph from Frieren is a strong, crowd-sourced signal. We surface those links here so you can browse cover art, scores, and trailers before committing — still spoiler-light on this guide page.",
    criteria: [
      "Source: AniList recommendations attached to Frieren: Beyond Journey’s End.",
      "Sorted by community rating on the recommendation edges.",
      "We don’t narrate plot beats — jump into each title’s detail page for synopsis and trailer.",
    ],
    relatedKeywords: [
      "Frieren similar anime",
      "fantasy adventure anime",
      "healing fantasy anime",
      "Iyashikei fantasy",
    ],
  },
  {
    slug: "hidden-gems-this-month",
    title: "Hidden gems on the radar",
    description:
      "Deeper cuts from the trending pool — titles trending on AniList but slightly off the absolute front page of the chart.",
    seoTitle: "Hidden gems anime this month | AniDrop guides",
    seoDescription:
      "Trending anime a little further down the momentum list — a practical “second scroll” for discovery on AniDrop, without spoilers.",
    sectionType: "discovery_rail",
    animeFilter: { type: "trending_slice", start: 12, end: 28 },
    intro:
      "“Hidden gem” is subjective — here we use a simple, transparent rule: take AniList’s trending list and highlight a band below the top few slots so you still get momentum-backed picks without rehashing the same #1–#5 everywhere. It’s editorially honest and easy to reproduce next month.",
    criteria: [
      "Base list: TRENDING_DESC on AniList.",
      "Selection window: roughly positions 13–28 after fetch (zero-based slice 12..28).",
      "We still avoid story spoilers; treat this as a discovery hopper into detail pages.",
    ],
    relatedKeywords: [
      "underrated anime",
      "trending anime deep cuts",
      "anime discovery",
      "what to watch next",
    ],
  },
];

export function getAllGuides(): GuideDefinition[] {
  return [...GUIDES];
}

export function getGuideBySlug(slug: string): GuideDefinition | undefined {
  const s = slug.trim();
  return GUIDES.find((g) => g.slug === s);
}

export function getGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}

/**
 * Loads catalog rows for a guide. Uses AniList only (no OpenAI, no API keys in client bundles).
 */
export async function fetchGuideAnimeList(
  filter: GuideAnimeFilter,
): Promise<TrendingAnime[]> {
  try {
    switch (filter.type) {
      case "current_season": {
        return await getCurrentSeasonAnime(filter.limit);
      }
      case "genre_popular": {
        return await getPopularAnimeByGenre(filter.genre, filter.limit);
      }
      case "recommended_from": {
        return await getRecommendedAnime(filter.seedMediaId, filter.limit);
      }
      case "trending_slice": {
        const end = Math.max(filter.end, filter.start + 1);
        const list = await getTrendingAnime(end);
        return list.slice(filter.start, filter.end);
      }
    }
  } catch {
    return [];
  }
}
