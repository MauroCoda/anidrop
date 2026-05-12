import type { Metadata } from "next";
import Link from "next/link";

import { AnimeCard } from "@/src/components/AnimeCard";
import { Hero } from "@/src/components/Hero";
import { HomeTrendingClient } from "@/src/components/HomeTrendingClient";
import { Navbar } from "@/src/components/Navbar";
import { SectionHeader } from "@/src/components/SectionHeader";
import {
  getCurrentSeasonAnime,
  getCurrentSeasonYear,
  getTrendingAnime,
} from "@/src/lib/anilist";
import { getSiteUrl } from "@/src/lib/site";

const siteUrl = getSiteUrl();

const homeDescription =
  "Trending charts, this season's popular anime, live search, scores, genres, and trailers — a compact dark catalog powered by AniList.";

export const metadata: Metadata = {
  title: "Trending & seasonal anime",
  description: homeDescription,
  keywords: [
    "anime",
    "trending anime",
    "seasonal anime",
    "anime search",
    "anime catalog",
    "AniList",
    "AniDrop",
  ],
  openGraph: {
    title: "Trending & seasonal anime | AniDrop",
    description: homeDescription,
    ...(siteUrl ? { url: new URL("/", siteUrl).href } : {}),
  },
  twitter: {
    title: "Trending & seasonal anime | AniDrop",
    description: homeDescription,
  },
  alternates: siteUrl ? { canonical: new URL("/", siteUrl).href } : undefined,
};

export default async function Home() {
  let trending: Awaited<ReturnType<typeof getTrendingAnime>> = [];
  let season: Awaited<ReturnType<typeof getCurrentSeasonAnime>> = [];
  let trendingError: string | null = null;
  let seasonError: string | null = null;

  try {
    trending = await getTrendingAnime(12);
  } catch (err) {
    trendingError =
      err instanceof Error ? err.message : "Could not load trending anime.";
  }

  try {
    season = await getCurrentSeasonAnime(8);
  } catch (err) {
    seasonError =
      err instanceof Error
        ? err.message
        : "Could not load this season's anime.";
  }

  const { season: seasonKey, year } = getCurrentSeasonYear();
  const seasonSubtitle = `${seasonKey.charAt(0) + seasonKey.slice(1).toLowerCase()} ${year}`;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-zinc-950/80 text-white backdrop-blur-[2px]">
      <Navbar />
      <div className="mx-auto w-full min-w-0 max-w-[90rem] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <Hero />

        <section
          id="trending"
          className="scroll-mt-20 border-t border-transparent pt-8 md:pt-10"
        >
          <SectionHeader
            title="Trending Now"
            subtitle="High-momentum titles on AniList — refreshed on a short cache for snappy loads."
            action={
              <Link
                href="https://anilist.co/search/anime/trending"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-violet-400 transition hover:text-violet-300"
              >
                View All
              </Link>
            }
          />

          {trendingError ? (
            <p className="mb-6 rounded-2xl border border-amber-500/25 bg-amber-950/30 px-4 py-3 text-sm text-amber-100 sm:px-5">
              {trendingError} You can still search below.
            </p>
          ) : null}

          <HomeTrendingClient initialTrending={trendingError ? [] : trending} />
        </section>

        <section
          id="this-season"
          className="scroll-mt-20 mt-14 border-t border-white/[0.06] pt-10 md:mt-20 md:pt-16"
        >
          <SectionHeader
            title="This Season"
            subtitle={`${seasonSubtitle} — popular new & continuing series in this cour.`}
            action={
              <Link
                href={`https://anilist.co/search/anime?season=${seasonKey}&seasonYear=${year}&sort=POPULARITY_DESC`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-violet-400 transition hover:text-violet-300"
              >
                AniList
              </Link>
            }
          />

          {seasonError ? (
            <p className="rounded-2xl border border-red-500/30 bg-red-950/40 px-5 py-4 text-red-200">
              {seasonError}
            </p>
          ) : season.length === 0 ? (
            <p className="text-sm text-zinc-500">No seasonal entries available.</p>
          ) : (
            <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {season.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  footerLabel="This season"
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
