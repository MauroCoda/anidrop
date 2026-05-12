"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type KeyboardEvent } from "react";

import { AnimeCard } from "@/src/components/AnimeCard";
import { AnimeCardSkeletonGrid } from "@/src/components/AnimeCardSkeleton";
import type { TrendingAnime } from "@/src/lib/anilist";
import { animeDetailPath } from "@/src/lib/slugify";

type Props = {
  initialTrending: TrendingAnime[];
};

const FORMAT_MAP: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};

function formatFormatLabel(format: string | null): string | null {
  if (!format) {
    return null;
  }
  return FORMAT_MAP[format] ?? format.replace(/_/g, " ");
}

function metaLine(anime: TrendingAnime): string | null {
  const y = anime.seasonYear ?? anime.startDateYear;
  const fmt = formatFormatLabel(anime.format);
  if (y != null && fmt) {
    return `${y} · ${fmt}`;
  }
  if (y != null) {
    return String(y);
  }
  if (fmt) {
    return fmt;
  }
  return null;
}

export function HomeTrendingClient({ initialTrending }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [searchResults, setSearchResults] = useState<TrendingAnime[] | null>(
    null,
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), 320);
    return () => clearTimeout(id);
  }, [query]);

  /* eslint-disable react-hooks/set-state-in-effect -- debounced search + abortable fetch */
  useEffect(() => {
    const q = debounced.trim();
    if (q === "") {
      setSearchResults(null);
      setSearchError(null);
      setSearchLoading(false);
      return;
    }

    const ac = new AbortController();
    setSearchLoading(true);
    setSearchError(null);

    fetch(`/api/anime/search?q=${encodeURIComponent(q)}`, {
      signal: ac.signal,
    })
      .then(async (r) => {
        if (!r.ok) {
          const body = (await r.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "Search failed");
        }
        return r.json() as Promise<TrendingAnime[]>;
      })
      .then((data) => {
        if (!ac.signal.aborted) {
          setSearchResults(data);
        }
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") {
          return;
        }
        if (!ac.signal.aborted) {
          setSearchError(e instanceof Error ? e.message : "Search failed");
          setSearchResults(null);
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) {
          setSearchLoading(false);
        }
      });

    return () => ac.abort();
  }, [debounced]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const trimmedQuery = query.trim();
  const trimmedDebounced = debounced.trim();
  const showTrending = trimmedQuery === "";
  const waitingForDebounce =
    trimmedQuery !== "" && trimmedQuery !== trimmedDebounced;
  const searchActive = trimmedDebounced !== "";

  const showSearchError = !showTrending && searchError;
  const showSkeleton =
    !showTrending &&
    (waitingForDebounce || (searchActive && searchLoading));

  const gridList: TrendingAnime[] = showTrending
    ? initialTrending
    : showSkeleton
      ? []
      : (searchResults ?? []);

  const footerLabel = showTrending ? "Trending" : "Results";

  const dropdownOpen = trimmedQuery !== "";
  const previewList = (searchResults ?? []).slice(0, 8);

  function handleEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") {
      return;
    }
    const first = previewList[0] ?? gridList[0];
    if (first) {
      e.preventDefault();
      router.push(animeDetailPath(first));
    }
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div className="relative z-20 mx-auto mb-9 min-w-0 max-w-2xl sm:mb-11 lg:max-w-3xl">
        <div className="rounded-2xl border border-white/[0.09] bg-gradient-to-b from-zinc-900/70 to-zinc-950/75 p-4 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.85),0_0_0_1px_rgba(139,92,246,0.08)] ring-1 ring-violet-500/[0.09] backdrop-blur-md sm:p-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300/75 sm:text-[11px]">
            Search the catalog
          </p>
          <p className="mt-1 text-center text-xs text-zinc-500 sm:text-[13px]">
            Live suggestions — press Enter to open the first match.
          </p>
          <label htmlFor="anime-search" className="sr-only">
            Search anime
          </label>
          <input
            id="anime-search"
            type="search"
            enterKeyHint="go"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleEnter}
            placeholder="Titles, studios, genres…"
            autoComplete="off"
            className="mt-3.5 w-full min-w-0 rounded-xl border border-white/12 bg-black/50 px-4 py-3.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none ring-1 ring-white/[0.06] transition placeholder:text-zinc-600 focus:border-violet-500/45 focus:shadow-[inset_0_1px_0_rgba(139,92,246,0.08),0_0_0_3px_rgba(139,92,246,0.12)] focus:ring-violet-500/30 sm:min-h-[52px] sm:py-4 sm:text-base"
          />
        </div>

        {dropdownOpen ? (
          <div
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(70vh,22rem)] overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-zinc-950/95 py-1 shadow-2xl shadow-black/60 ring-1 ring-violet-500/15 backdrop-blur-md sm:max-h-96"
            role="listbox"
            aria-label="Search suggestions"
          >
            {showSearchError ? (
              <p className="px-3 py-3 text-sm text-red-300">{searchError}</p>
            ) : null}

            {!showSearchError && waitingForDebounce ? (
              <p className="px-3 py-3 text-sm text-zinc-500">Searching…</p>
            ) : null}

            {!showSearchError &&
            searchActive &&
            searchLoading &&
            !waitingForDebounce ? (
              <p className="px-3 py-3 text-sm text-zinc-500">Loading…</p>
            ) : null}

            {!showSearchError &&
            searchActive &&
            !searchLoading &&
            !waitingForDebounce &&
            previewList.length === 0 ? (
              <p className="px-3 py-3 text-sm text-zinc-500">No matches.</p>
            ) : null}

            {!showSearchError &&
              previewList.map((anime) => {
                const meta = metaLine(anime);
                return (
                  <Link
                    key={anime.id}
                    href={animeDetailPath(anime)}
                    className="flex min-w-0 gap-3 px-3 py-2.5 transition hover:bg-violet-950/35"
                    role="option"
                  >
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md border border-white/10 bg-zinc-800">
                      {anime.coverImage ? (
                        <Image
                          src={anime.coverImage}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {anime.title}
                      </p>
                      {meta ? (
                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                          {meta}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
          </div>
        ) : null}
      </div>

      {showSkeleton ? (
        <AnimeCardSkeletonGrid count={12} variant="catalog" />
      ) : (
        <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {!showTrending && searchActive && gridList.length === 0 ? (
            <p className="col-span-full py-6 text-center text-sm text-zinc-500 sm:text-left">
              No results found.
            </p>
          ) : null}
          {gridList.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              footerLabel={footerLabel}
              variant="catalog"
            />
          ))}
        </div>
      )}
    </div>
  );
}
