-- AniDrop: cached anime + future AI fields
-- Apply in Supabase Dashboard → SQL Editor (or `supabase db push` if using CLI).
-- Uses publishable anon access patterns; tighten policies before exposing untrusted clients.

create table if not exists public.anime_cache (
  id bigint primary key,
  slug text not null unique,
  title_romaji text,
  title_english text,
  cover_image text,
  banner_image text,
  description text,
  genres text[] not null default '{}'::text[],
  average_score int,
  popularity int,
  format text,
  status text,
  episodes int,
  season text,
  season_year int,
  trailer_site text,
  trailer_id text,
  ai_summary text,
  why_watch text,
  perfect_if_you_like text,
  seo_title text,
  seo_description text,
  anilist_updated_at timestamptz,
  ai_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.anime_cache is
  'Server-side cache of AniList anime rows + optional AI/SEO fields. Populated by a sync job; app reads via anon key when wired.';

-- slug: unique constraint supplies a btree index
create index if not exists anime_cache_season_year_idx
  on public.anime_cache (season_year);

create index if not exists anime_cache_season_cour_idx
  on public.anime_cache (season, season_year);

create index if not exists anime_cache_genres_gin_idx
  on public.anime_cache using gin (genres);

create index if not exists anime_cache_average_score_idx
  on public.anime_cache (average_score desc nulls last);

create index if not exists anime_cache_popularity_idx
  on public.anime_cache (popularity desc nulls last);

alter table public.anime_cache enable row level security;

-- Public read (catalog pages once wired to cache)
create policy "anime_cache_select_public"
  on public.anime_cache
  for select
  using (true);

-- Writes with the publishable anon key (same key ships to the browser).
-- Replace with service-role Edge Function or stricter checks before production if needed.
create policy "anime_cache_insert_publishable"
  on public.anime_cache
  for insert
  with check (true);

create policy "anime_cache_update_publishable"
  on public.anime_cache
  for update
  using (true)
  with check (true);

-- Ensure anon/authenticated can read/write (run if policies exist but reads fail)
grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.anime_cache to anon, authenticated;
