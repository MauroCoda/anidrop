/**
 * Row shape for `public.anime_cache` (Supabase).
 * Timestamps are ISO strings from PostgREST JSON.
 */
export type AnimeCacheRow = {
  id: number;
  slug: string;
  title_romaji: string | null;
  title_english: string | null;
  cover_image: string | null;
  banner_image: string | null;
  description: string | null;
  genres: string[];
  average_score: number | null;
  popularity: number | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  season: string | null;
  season_year: number | null;
  trailer_site: string | null;
  trailer_id: string | null;
  ai_summary: string | null;
  why_watch: string | null;
  perfect_if_you_like: string | null;
  seo_title: string | null;
  seo_description: string | null;
  anilist_updated_at: string | null;
  ai_updated_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Fields you typically send on upsert; DB defaults `created_at` / `updated_at` if omitted.
 */
export type AnimeCacheUpsert = {
  id: number;
  slug: string;
  title_romaji?: string | null;
  title_english?: string | null;
  cover_image?: string | null;
  banner_image?: string | null;
  description?: string | null;
  genres?: string[] | null;
  average_score?: number | null;
  popularity?: number | null;
  format?: string | null;
  status?: string | null;
  episodes?: number | null;
  season?: string | null;
  season_year?: number | null;
  trailer_site?: string | null;
  trailer_id?: string | null;
  ai_summary?: string | null;
  why_watch?: string | null;
  perfect_if_you_like?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  anilist_updated_at?: string | null;
  ai_updated_at?: string | null;
  created_at?: string;
  updated_at?: string;
};
