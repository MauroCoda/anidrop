import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnimeCard } from "@/src/components/AnimeCard";
import { SectionHeader } from "@/src/components/SectionHeader";
import {
  getAnimeById,
  getRecommendedAnime,
  type AnimeDetail,
} from "@/src/lib/anilist";
import { getSiteUrl } from "@/src/lib/site";

function truncateMetaText(text: string, max: number): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) {
    return collapsed;
  }
  return `${collapsed.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function buildAnimeDescription(anime: AnimeDetail): string {
  if (anime.description?.trim()) {
    return truncateMetaText(anime.description, 160);
  }
  const genreLine =
    anime.genres.length > 0 ? anime.genres.slice(0, 5).join(", ") : null;
  const tail = genreLine ? ` Genres: ${genreLine}.` : "";
  return `Details, trailer, and scores for ${anime.title}.${tail}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return { title: "Anime", robots: { index: false, follow: true } };
  }

  const anime = await getAnimeById(id);
  if (!anime) {
    return {
      title: "Anime not found",
      robots: { index: false, follow: true },
    };
  }

  const description = buildAnimeDescription(anime);
  const site = getSiteUrl();
  const path = `/anime/${id}`;

  return {
    title: anime.title,
    description,
    keywords: anime.genres.length > 0 ? anime.genres : undefined,
    alternates: site ? { canonical: new URL(path, site).href } : undefined,
    openGraph: {
      title: anime.title,
      description,
      url: site ? new URL(path, site).href : undefined,
      images: anime.coverImage
        ? [{ url: anime.coverImage, alt: anime.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: anime.title,
      description,
      ...(anime.coverImage ? { images: [anime.coverImage] } : {}),
    },
  };
}

const FORMAT_LABELS: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};

const STATUS_LABELS: Record<string, string> = {
  RELEASING: "Airing",
  FINISHED: "Ended",
  NOT_YET_RELEASED: "Not yet aired",
  CANCELLED: "Cancelled",
  HIATUS: "Hiatus",
};

function formatLabel(value: string | null, map: Record<string, string>): string {
  if (!value) {
    return "—";
  }
  return map[value] ?? value.replace(/_/g, " ");
}

function formatSeasonYear(anime: AnimeDetail): string | null {
  if (!anime.season && anime.seasonYear == null) {
    return null;
  }
  const s = anime.season
    ? anime.season.charAt(0) + anime.season.slice(1).toLowerCase()
    : null;
  if (s && anime.seasonYear != null) {
    return `${s} ${anime.seasonYear}`;
  }
  if (anime.seasonYear != null) {
    return String(anime.seasonYear);
  }
  return s;
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  const display =
    value === null || value === undefined || value === ""
      ? "—"
      : typeof value === "number"
        ? value.toLocaleString()
        : value;

  return (
    <div className="min-w-0 rounded-xl border border-white/[0.08] bg-zinc-900/60 px-3 py-3 ring-1 ring-white/[0.03] sm:px-4 sm:py-3">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-zinc-100">
        {display}
      </dd>
    </div>
  );
}

export default async function AnimePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  const [anime, recommended] = await Promise.all([
    getAnimeById(id),
    getRecommendedAnime(id, 8),
  ]);

  if (!anime) {
    notFound();
  }

  const seasonYear = formatSeasonYear(anime);
  const scoreDisplay =
    anime.averageScore != null
      ? `${(anime.averageScore / 10).toFixed(1)} / 10`
      : null;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-zinc-950/80 text-white backdrop-blur-[2px]">
      <header className="border-b border-white/10 px-4 py-4 sm:px-8">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm text-zinc-400 transition hover:text-violet-300 sm:min-h-0"
        >
          <span aria-hidden className="text-lg leading-none">
            ←
          </span>
          Back to home
        </Link>
      </header>

      <div className="relative h-[min(42vh,22rem)] w-full overflow-hidden sm:h-[min(44vh,26rem)]">
        {anime.bannerImage ? (
          <Image
            src={anime.bannerImage}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : anime.coverImage ? (
          <Image
            src={anime.coverImage}
            alt=""
            fill
            priority
            className="scale-110 object-cover blur-xl opacity-40"
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-violet-950/80 via-zinc-950 to-black" />
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/30"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 sm:px-8">
        <div className="-mt-20 flex min-w-0 flex-col items-center gap-8 sm:-mt-24 md:flex-row md:items-end md:gap-10">
          <div className="relative aspect-[3/4] w-40 max-w-[min(100%,13rem)] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.85)] ring-1 ring-violet-500/15 sm:w-48 sm:max-w-none">
            {anime.coverImage ? (
              <Image
                src={anime.coverImage}
                alt={anime.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 208px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs text-zinc-500">
                No cover
              </div>
            )}
          </div>

          <div className="w-full min-w-0 flex-1 text-center md:text-left">
            <h1 className="text-balance text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">
              {anime.title}
            </h1>
            {anime.titleRomaji ? (
              <p className="mt-2 text-sm text-zinc-400">{anime.titleRomaji}</p>
            ) : null}

            {anime.genres.length > 0 ? (
              <ul className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                {anime.genres.map((g) => (
                  <li
                    key={g}
                    className="rounded-lg border border-violet-500/25 bg-violet-950/35 px-2.5 py-1 text-xs font-medium text-violet-200/90"
                  >
                    {g}
                  </li>
                ))}
              </ul>
            ) : null}

            <dl className="mt-6 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <Stat label="Score" value={scoreDisplay} />
              <Stat
                label="Popularity"
                value={anime.popularity}
              />
              <Stat
                label="Status"
                value={formatLabel(anime.status, STATUS_LABELS)}
              />
              <Stat
                label="Format"
                value={formatLabel(anime.format, FORMAT_LABELS)}
              />
              <Stat
                label="Episodes"
                value={anime.episodes}
              />
              <Stat
                label="Season"
                value={seasonYear}
              />
            </dl>

            <p className="mt-5 text-xs text-zinc-500">
              Data from{" "}
              <a
                href={`https://anilist.co/anime/${anime.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 underline-offset-2 hover:text-violet-300 hover:underline"
              >
                AniList
              </a>
            </p>
          </div>
        </div>

        <section
          className="mt-10 rounded-2xl border border-white/[0.07] bg-zinc-900/40 p-5 ring-1 ring-white/[0.04] sm:mt-12 sm:p-8"
          aria-labelledby="trailer-heading"
        >
          <h2
            id="trailer-heading"
            className="text-lg font-bold text-white"
          >
            Trailer
          </h2>
          {anime.trailerYoutubeId ? (
            <div className="relative mt-4 aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg shadow-black/40 md:mx-0 mx-auto">
              <iframe
                title={`${anime.title} trailer`}
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(anime.trailerYoutubeId)}`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">No trailer available.</p>
          )}
        </section>

        <section
          className="mt-10 rounded-2xl border border-white/[0.07] bg-zinc-900/40 p-5 ring-1 ring-white/[0.04] sm:mt-12 sm:p-8"
          aria-labelledby="synopsis-heading"
        >
          <h2
            id="synopsis-heading"
            className="text-lg font-bold text-white"
          >
            Synopsis
          </h2>
          {anime.description ? (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {anime.description}
            </p>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">No synopsis available.</p>
          )}
        </section>

        <section
          className="mt-12 border-t border-white/[0.06] pt-10 sm:mt-14 sm:pt-12"
          aria-labelledby="similar-heading"
        >
          <SectionHeader
            title="You may also like"
            titleId="similar-heading"
            subtitle="Curated picks from AniList based on this show — same compact tiles as the home catalog."
          />
          {recommended.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No recommendations available from AniList for this title.
            </p>
          ) : (
            <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {recommended.map((item) => (
                <AnimeCard
                  key={item.id}
                  anime={item}
                  footerLabel="Similar"
                  variant="catalog"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
