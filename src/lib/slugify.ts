/**
 * URL-safe slug for Latin / Latin-script titles (NFKD + strip marks).
 * Falls back to empty string when nothing alphanumeric remains.
 */
export function slugify(raw: string): string {
  const trimmed = raw.normalize("NFKD").trim();
  const stripped = trimmed.replace(/[\u0300-\u036f]/g, "");
  return stripped
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

const MAX_SLUG_BASE_LEN = 80;

export type AnimeSlugSource = {
  id: number;
  title: string;
  titleRomaji?: string | null;
};

/**
 * Single path segment: `{slugified-title}-{anilistId}`.
 * Trailing numeric id is the source of truth for lookups (see parse).
 */
export function buildAnimeRouteSegment(anime: AnimeSlugSource): string {
  let base = slugify(anime.title);
  if (!base && anime.titleRomaji) {
    base = slugify(anime.titleRomaji);
  }
  if (!base) {
    base = "anime";
  }
  if (base.length > MAX_SLUG_BASE_LEN) {
    base = base.slice(0, MAX_SLUG_BASE_LEN).replace(/-+$/g, "") || "anime";
  }
  const id = Math.trunc(Number(anime.id));
  return `${base}-${id}`;
}

export function animeDetailPath(anime: AnimeSlugSource): string {
  return `/anime/${buildAnimeRouteSegment(anime)}`;
}

/**
 * Accepts `/anime/178701` (legacy) or `/anime/witch-hat-atelier-178701`.
 * Returns AniList media id or null.
 */
export function parseAnilistIdFromAnimeRouteParam(param: string): number | null {
  const trimmed = param.trim();
  if (!trimmed) {
    return null;
  }
  if (/^\d+$/.test(trimmed)) {
    const n = Math.trunc(Number.parseInt(trimmed, 10));
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  const m = trimmed.match(/-(\d+)$/);
  if (!m?.[1]) {
    return null;
  }
  const n = Math.trunc(Number.parseInt(m[1], 10));
  return Number.isFinite(n) && n > 0 ? n : null;
}
