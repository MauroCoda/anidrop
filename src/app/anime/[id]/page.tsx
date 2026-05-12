import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnimeCard } from "@/src/components/AnimeCard";
import { AnimeAISections } from "@/src/components/AnimeAISections";
import { SectionHeader } from "@/src/components/SectionHeader";
import { getCachedAnimeById, animeCacheHasFullAiContent } from "@/src/lib/anime-cache";
import {
  getAnimeById,
  getRecommendedAnime,
  type AnimeDetail,
} from "@/src/lib/anilist";
import { truncatePlainText } from "@/src/lib/seo";
import { getSiteUrl } from "@/src/lib/site";

export const dynamic = "force-dynamic";

function buildAnimeDescription(anime: AnimeDetail): string {
  if (anime.description?.trim()) {
    return truncatePlainText(anime.description, 158);
  }
  const genreLine =
    anime.genres.length > 0 ? anime.genres.slice(0, 5).join(", ") : null;
  const tail = genreLine ? ` Genres: ${genreLine}.` : "";
  return truncatePlainText(
    `Watch details, trailer, and scores for ${anime.title} on AniDrop.${tail}`,
    158,
  );
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
  const pageTitle = `${anime.title} | AniDrop`;
  const ogImage =
    anime.bannerImage?.trim() || anime.coverImage?.trim() || null;

  return {
    title: anime.title,
    description,
    keywords: anime.genres.length > 0 ? anime.genres : undefined,
    alternates: site ? { canonical: new URL(path, site).href } : undefined,
    openGraph: {
      type: "website",
      title: pageTitle,
      description,
      url: site ? new URL(path, site).href : undefined,
      images: ogImage
        ? [{ url: ogImage, alt: anime.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
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

function InfoBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "violet" | "cyan";
}) {
  const tones = {
    neutral:
      "border-white/[0.1] bg-zinc-950/70 text-zinc-200 ring-white/[0.04]",
    violet:
      "border-violet-500/25 bg-violet-950/45 text-violet-100 ring-violet-500/10",
    cyan: "border-cyan-500/20 bg-cyan-950/35 text-cyan-100 ring-cyan-500/10",
  } as const;

  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ring-1 sm:text-[11px] ${tones[tone]}`}
    >
      {children}
    </span>
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

  const [anime, recommended, cached] = await Promise.all([
    getAnimeById(id),
    getRecommendedAnime(id, 8),
    getCachedAnimeById(id),
  ]);

  if (!anime) {
    notFound();
  }

  const seasonYear = formatSeasonYear(anime);
  const scoreNum =
    anime.averageScore != null ? (anime.averageScore / 10).toFixed(1) : null;
  const formatStr = formatLabel(anime.format, FORMAT_LABELS);
  const statusStr = formatLabel(anime.status, STATUS_LABELS);
  const episodesStr =
    anime.episodes != null ? `${anime.episodes} eps` : "Episodes TBA";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-zinc-950/80 text-white backdrop-blur-[2px]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex min-w-0 max-w-[90rem] px-4 py-3.5 sm:px-6 lg:px-10">
          <Link
            href="/"
            className="inline-flex min-h-[44px] min-w-0 items-center gap-2 text-sm text-zinc-400 transition hover:text-violet-300 sm:min-h-0"
          >
            <span aria-hidden className="text-lg leading-none">
              ←
            </span>
            <span className="truncate">Back to catalog</span>
          </Link>
        </div>
      </header>

      <div className="relative w-full min-w-0">
        <div className="relative h-[min(42vh,15.5rem)] min-h-[11.5rem] w-full overflow-hidden sm:h-[min(46vh,19rem)] md:h-[min(52vh,22rem)] lg:h-[min(56vh,28rem)] lg:max-h-[31rem]">
          {anime.bannerImage ? (
            <Image
              src={anime.bannerImage}
              alt=""
              fill
              priority
              className="object-cover object-[center_22%]"
              sizes="100vw"
            />
          ) : anime.coverImage ? (
            <Image
              src={anime.coverImage}
              alt=""
              fill
              priority
              className="scale-110 object-cover object-center blur-2xl opacity-45"
              sizes="100vw"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-violet-950/90 via-zinc-950 to-black" />
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/88 to-zinc-950/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/50 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/50 to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto min-w-0 max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="-mt-[4.5rem] sm:-mt-[5.25rem] md:-mt-28">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/75 shadow-[0_28px_80px_-36px_rgba(0,0,0,0.95)] ring-1 ring-violet-500/[0.06] backdrop-blur-xl sm:rounded-3xl">
              <div className="border-b border-white/[0.06] bg-gradient-to-br from-zinc-900/90 via-zinc-950/80 to-zinc-950/95 p-5 sm:p-7 md:p-8">
                <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-stretch md:gap-8">
                  <div className="mx-auto shrink-0 md:mx-0">
                    <div className="relative aspect-[3/4] w-[9.25rem] overflow-hidden rounded-2xl border border-white/12 bg-zinc-800 shadow-[0_18px_48px_-16px_rgba(0,0,0,0.9)] ring-1 ring-violet-500/15 sm:w-44 md:w-[13.5rem]">
                      {anime.coverImage ? (
                        <Image
                          src={anime.coverImage}
                          alt={anime.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 40vw, 216px"
                          priority
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs text-zinc-500">
                          No cover
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                      <InfoBadge tone="violet">{formatStr}</InfoBadge>
                      <InfoBadge tone="cyan">{statusStr}</InfoBadge>
                      {seasonYear ? (
                        <InfoBadge>{seasonYear}</InfoBadge>
                      ) : null}
                      <InfoBadge>{episodesStr}</InfoBadge>
                    </div>

                    <h1 className="mt-4 text-balance text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">
                      {anime.title}
                    </h1>
                    {anime.titleRomaji ? (
                      <p className="mt-2 text-sm text-zinc-400 md:text-base">
                        {anime.titleRomaji}
                      </p>
                    ) : null}

                    {anime.genres.length > 0 ? (
                      <ul className="mt-4 flex flex-wrap justify-center gap-1.5 md:justify-start">
                        {anime.genres.map((g) => (
                          <li key={g}>
                            <span className="inline-block rounded-md border border-violet-500/20 bg-violet-950/25 px-2 py-0.5 text-[11px] font-medium text-violet-200/90 sm:text-xs">
                              {g}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:justify-start md:gap-4">
                      <div className="flex items-baseline gap-1 rounded-xl border border-violet-500/30 bg-violet-950/35 px-4 py-2.5 shadow-inner shadow-black/30">
                        <span className="text-3xl font-black tabular-nums leading-none text-white sm:text-[2.1rem]">
                          {scoreNum ?? "—"}
                        </span>
                        {scoreNum ? (
                          <span className="text-sm font-medium text-zinc-400">
                            /10
                          </span>
                        ) : null}
                      </div>
                      {anime.popularity != null ? (
                        <p className="text-sm text-zinc-500">
                          Popularity{" "}
                          <span className="font-semibold tabular-nums text-zinc-200">
                            #{anime.popularity.toLocaleString()}
                          </span>
                        </p>
                      ) : null}
                    </div>

                    <p className="mt-5 text-[11px] text-zinc-500 sm:text-xs">
                      Metadata from{" "}
                      <a
                        href={`https://anilist.co/anime/${anime.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-violet-400 underline-offset-2 hover:text-violet-300 hover:underline"
                      >
                        AniList
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <section
                className="border-b border-white/[0.05] px-5 py-6 sm:px-7 sm:py-7 md:px-8"
                aria-labelledby="trailer-heading"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400/85">
                      Featured media
                    </p>
                    <h2
                      id="trailer-heading"
                      className="mt-1 text-lg font-bold tracking-tight text-white sm:text-xl"
                    >
                      Trailer
                    </h2>
                  </div>
                </div>
                {anime.trailerYoutubeId ? (
                  <div className="relative mt-5 overflow-hidden rounded-2xl border border-violet-500/20 bg-black shadow-[0_0_0_1px_rgba(139,92,246,0.12),0_24px_56px_-28px_rgba(0,0,0,0.85)] ring-1 ring-inset ring-white/[0.05]">
                    <div className="relative aspect-video w-full">
                      <iframe
                        title={`${anime.title} trailer`}
                        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(anime.trailerYoutubeId)}`}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-zinc-500">
                    No trailer linked on AniList for this title.
                  </p>
                )}
              </section>

              <section
                className="px-5 py-6 sm:px-7 sm:py-7 md:px-8"
                aria-labelledby="synopsis-heading"
              >
                <h2
                  id="synopsis-heading"
                  className="text-lg font-bold tracking-tight text-white sm:text-xl"
                >
                  Synopsis
                </h2>
                {anime.description ? (
                  <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 md:text-[0.9375rem] md:leading-[1.65]">
                    {anime.description}
                  </p>
                ) : (
                  <p className="mt-4 text-sm text-zinc-500">
                    No synopsis available.
                  </p>
                )}
              </section>

              <AnimeAISections
                key={`${anime.id}-${cached?.ai_updated_at ?? "no-ai"}`}
                animeId={anime.id}
                serverCacheComplete={animeCacheHasFullAiContent(cached)}
                initial={{
                  ai_summary: cached?.ai_summary ?? null,
                  why_watch: cached?.why_watch ?? null,
                  perfect_if_you_like: cached?.perfect_if_you_like ?? null,
                }}
              />
            </div>
          </div>

          <section
            className="mt-12 min-w-0 border-t border-white/[0.06] pt-10 sm:mt-14 sm:pt-11"
            aria-labelledby="similar-heading"
          >
            <SectionHeader
              title="Similar picks"
              titleId="similar-heading"
              subtitle="AniList recommendations in the same compact catalog layout as the home dashboard."
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
      </div>
    </main>
  );
}
