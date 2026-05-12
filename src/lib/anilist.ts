const ANILIST_API = "https://graphql.anilist.co";

/** Normalized anime record for UI (mapped from AniList GraphQL). */
export type TrendingAnime = {
  id: number;
  title: string;
  coverImage: string;
  genres: string[];
  averageScore: number | null;
  format: string | null;
  status: string | null;
};

type MediaNode = {
  id: number;
  title: {
    romaji: string;
    english: string | null;
  };
  coverImage: {
    large: string | null;
  } | null;
  genres: string[];
  averageScore: number | null;
  format: string | null;
  status: string | null;
};

type PageQueryResponse = {
  data?: {
    Page?: {
      media?: MediaNode[];
    };
  };
  errors?: Array<{ message: string }>;
};

function mapMedia(node: MediaNode): TrendingAnime {
  const title =
    node.title.english?.trim() || node.title.romaji || "Untitled";

  return {
    id: node.id,
    title,
    coverImage: node.coverImage?.large?.trim() || "",
    genres: node.genres ?? [],
    averageScore: node.averageScore,
    format: node.format ?? null,
    status: node.status ?? null,
  };
}

const TRENDING_QUERY = `
  query TrendingAnime($perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        genres
        averageScore
        format
        status
      }
    }
  }
`;

export async function getTrendingAnime(
  perPage = 12,
): Promise<TrendingAnime[]> {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: TRENDING_QUERY,
      variables: { perPage },
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`AniList request failed (${res.status})`);
  }

  const json = (await res.json()) as PageQueryResponse;

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  const media = json.data?.Page?.media;
  if (!media?.length) {
    return [];
  }

  return media.map(mapMedia);
}

const SEARCH_ANIME_QUERY = `
  query SearchAnime($search: String, $perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(type: ANIME, search: $search, sort: SEARCH_MATCH) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        genres
        averageScore
        format
        status
      }
    }
  }
`;

export async function searchAnime(
  query: string,
  perPage = 24,
): Promise<TrendingAnime[]> {
  const search = query.trim();
  if (search === "") {
    return [];
  }

  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: SEARCH_ANIME_QUERY,
      variables: { search, perPage },
    }),
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`AniList request failed (${res.status})`);
  }

  const json = (await res.json()) as PageQueryResponse;

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  const media = json.data?.Page?.media;
  if (!media?.length) {
    return [];
  }

  return media.map(mapMedia);
}

/** AniList catalogue season + year for the current seasonal window. */
export function getCurrentSeasonYear(): { season: string; year: number } {
  const d = new Date();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  if (month === 12) {
    return { season: "WINTER", year: year + 1 };
  }
  if (month <= 2) {
    return { season: "WINTER", year: year };
  }
  if (month <= 5) {
    return { season: "SPRING", year: year };
  }
  if (month <= 8) {
    return { season: "SUMMER", year: year };
  }
  return { season: "FALL", year: year };
}

const SEASON_ANIME_QUERY = `
  query SeasonAnime($season: MediaSeason, $seasonYear: Int, $perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(
        type: ANIME
        season: $season
        seasonYear: $seasonYear
        sort: POPULARITY_DESC
      ) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
        genres
        averageScore
        format
        status
      }
    }
  }
`;

export async function getCurrentSeasonAnime(
  perPage = 8,
): Promise<TrendingAnime[]> {
  const { season, year } = getCurrentSeasonYear();

  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: SEASON_ANIME_QUERY,
      variables: { season, seasonYear: year, perPage },
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`AniList request failed (${res.status})`);
  }

  const json = (await res.json()) as PageQueryResponse;

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  const media = json.data?.Page?.media;
  if (!media?.length) {
    return [];
  }

  return media.map(mapMedia);
}

/** Full anime record for detail page (from Media by id). */
export type AnimeDetail = {
  id: number;
  title: string;
  titleRomaji: string | null;
  description: string | null;
  coverImage: string;
  bannerImage: string | null;
  genres: string[];
  averageScore: number | null;
  popularity: number | null;
  status: string | null;
  format: string | null;
  episodes: number | null;
  season: string | null;
  seasonYear: number | null;
  trailerYoutubeId: string | null;
};

type MediaByIdNode = {
  id: number;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  coverImage: {
    large: string | null;
    extraLarge: string | null;
  } | null;
  bannerImage: string | null;
  genres: string[] | null;
  averageScore: number | null;
  popularity: number | null;
  status: string | null;
  format: string | null;
  episodes: number | null;
  season: string | null;
  seasonYear: number | null;
  trailer: {
    id: string | null;
    site: string | null;
  } | null;
};

type MediaByIdResponse = {
  data?: { Media?: MediaByIdNode | null };
  errors?: Array<{ message: string }>;
};

function pickTitle(node: MediaByIdNode): {
  display: string;
  romaji: string | null;
} {
  const en = node.title.english?.trim();
  const romaji = node.title.romaji?.trim() || null;
  const native = node.title.native?.trim();
  const display = en || romaji || native || "Untitled";
  return { display, romaji: romaji && romaji !== display ? romaji : null };
}

function normalizeDescription(raw: string | null): string | null {
  if (raw == null || raw.trim() === "") {
    return null;
  }
  const stripped = raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
  return stripped === "" ? null : stripped;
}

function parseYoutubeTrailerId(node: MediaByIdNode): string | null {
  const t = node.trailer;
  if (!t?.id || !t.site?.trim()) {
    return null;
  }
  if (t.site.trim().toLowerCase() !== "youtube") {
    return null;
  }
  const id = String(t.id).trim();
  if (!/^[a-zA-Z0-9_-]{6,32}$/.test(id)) {
    return null;
  }
  return id;
}

function mapMediaDetail(node: MediaByIdNode): AnimeDetail {
  const { display, romaji } = pickTitle(node);
  const cover =
    node.coverImage?.extraLarge?.trim() ||
    node.coverImage?.large?.trim() ||
    "";

  return {
    id: node.id,
    title: display,
    titleRomaji: romaji,
    description: normalizeDescription(node.description),
    coverImage: cover,
    bannerImage: node.bannerImage?.trim() || null,
    genres: node.genres?.filter(Boolean) ?? [],
    averageScore: node.averageScore,
    popularity: node.popularity ?? null,
    status: node.status ?? null,
    format: node.format ?? null,
    episodes: node.episodes ?? null,
    season: node.season ?? null,
    seasonYear: node.seasonYear ?? null,
    trailerYoutubeId: parseYoutubeTrailerId(node),
  };
}

const MEDIA_BY_ID_QUERY = `
  query MediaById($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description(asHtml: false)
      coverImage {
        large
        extraLarge
      }
      bannerImage
      genres
      averageScore
      popularity
      status
      format
      episodes
      season
      seasonYear
      trailer {
        id
        site
      }
    }
  }
`;

export async function getAnimeById(id: number): Promise<AnimeDetail | null> {
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: MEDIA_BY_ID_QUERY,
      variables: { id },
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`AniList request failed (${res.status})`);
  }

  const json = (await res.json()) as MediaByIdResponse;

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  const media = json.data?.Media;
  if (!media) {
    return null;
  }

  return mapMediaDetail(media);
}
