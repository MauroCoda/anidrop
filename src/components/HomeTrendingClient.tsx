"use client";

import { useEffect, useState } from "react";

import { AnimeCard } from "@/src/components/AnimeCard";
import { AnimeCardSkeletonGrid } from "@/src/components/AnimeCardSkeleton";
import type { TrendingAnime } from "@/src/lib/anilist";

type Props = {
  initialTrending: TrendingAnime[];
};

export function HomeTrendingClient({ initialTrending }: Props) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [searchResults, setSearchResults] = useState<TrendingAnime[] | null>(
    null,
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), 400);
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
  /** Cleared input → show trending immediately (do not wait for debounce). */
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

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 min-w-0">
        <label htmlFor="anime-search" className="sr-only">
          Search anime
        </label>
        <input
          id="anime-search"
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anime…"
          autoComplete="off"
          className="w-full min-w-0 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-white shadow-inner shadow-black/20 outline-none ring-1 ring-white/[0.04] transition placeholder:text-zinc-500 focus:border-violet-500/40 focus:ring-violet-500/25 sm:text-base"
        />
      </div>

      {showSearchError ? (
        <p className="mb-6 rounded-xl border border-red-500/25 bg-red-950/35 px-4 py-3 text-sm text-red-200">
          {searchError}
        </p>
      ) : null}

      {showSkeleton ? (
        <AnimeCardSkeletonGrid count={8} />
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {!showTrending && searchActive && gridList.length === 0 ? (
            <p className="col-span-full text-center text-sm text-zinc-500 sm:text-left">
              No results found.
            </p>
          ) : null}
          {gridList.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              footerLabel={footerLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
