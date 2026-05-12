import Image from "next/image";
import Link from "next/link";

import type { TrendingAnime } from "@/src/lib/anilist";

export type AnimeCardProps = {
  anime: TrendingAnime;
  /** Footer chip label (e.g. Trending, This season, Results). */
  footerLabel?: string;
};

function formatScoreDisplay(score: number | null): string {
  if (score == null) {
    return "—";
  }
  return (score / 10).toFixed(1);
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
  NOT_YET_RELEASED: "Soon",
  CANCELLED: "Cancelled",
  HIATUS: "Hiatus",
};

function topLeftBadge(anime: TrendingAnime): string | null {
  if (anime.format) {
    return FORMAT_LABELS[anime.format] ?? anime.format.replace(/_/g, " ");
  }
  if (anime.status) {
    return STATUS_LABELS[anime.status] ?? anime.status.replace(/_/g, " ");
  }
  return null;
}

export function AnimeCard({ anime, footerLabel = "Trending" }: AnimeCardProps) {
  const badge = topLeftBadge(anime);
  const scoreText = formatScoreDisplay(anime.averageScore);

  return (
    <Link
      href={`/anime/${anime.id}`}
      aria-label={`${anime.title} — view details`}
      className="group block h-full min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 rounded-[1.35rem]"
    >
      <article
        className={[
          "relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[1.35rem]",
          "border border-white/[0.07] bg-zinc-900/95",
          "shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.04]",
          "transition-[box-shadow,border-color,transform,ring-color] duration-300 ease-out",
          "hover:-translate-y-0.5",
          "hover:border-violet-400/20 hover:shadow-[0_24px_56px_-16px_rgba(139,92,246,0.32),0_0_0_1px_rgba(139,92,246,0.12)]",
          "hover:ring-violet-500/25",
        ].join(" ")}
      >
        <div className="relative aspect-[3/4] w-full min-h-0 shrink-0 overflow-hidden bg-zinc-800">
          {anime.coverImage ? (
            <Image
              src={anime.coverImage}
              alt=""
              fill
              className="z-0 object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-zinc-800 text-xs text-zinc-500">
              No cover
            </div>
          )}

          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[36%] bg-gradient-to-b from-black/55 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[58%] bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"
            aria-hidden
          />

          {badge ? (
            <div className="absolute left-2.5 top-2.5 z-10 sm:left-3 sm:top-3">
              <span className="inline-flex max-w-[min(100%,11rem)] items-center truncate rounded-lg border border-white/15 bg-black/45 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-100 shadow-sm backdrop-blur-md sm:px-2.5 sm:text-[11px]">
                {badge}
              </span>
            </div>
          ) : null}

          <div className="absolute right-2.5 top-2.5 z-10 sm:right-3 sm:top-3">
            <span
              className={[
                "inline-flex items-center gap-0.5 rounded-lg border px-2 py-1 text-xs font-bold tabular-nums shadow-md backdrop-blur-md sm:px-2.5 sm:text-sm",
                anime.averageScore != null
                  ? "border-violet-400/35 bg-violet-950/75 text-violet-100"
                  : "border-white/10 bg-black/50 text-zinc-400",
              ].join(" ")}
              aria-label={
                anime.averageScore != null
                  ? `Average score ${scoreText} out of 10`
                  : "No score"
              }
            >
              <span className="text-violet-300/95" aria-hidden>
                ★
              </span>
              {scoreText}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-3.5 pb-4 pt-14 sm:p-4 sm:pb-5 sm:pt-16">
            <h4 className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-white drop-shadow-md sm:text-lg">
              {anime.title}
            </h4>
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-300/95 sm:text-xs">
              {anime.genres.length > 0
                ? anime.genres.join(" · ")
                : "Genres TBA"}
            </p>
          </div>
        </div>

        <div className="flex items-center border-t border-white/[0.06] bg-zinc-950/90 px-3.5 py-2.5 sm:px-4 sm:py-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 sm:text-[11px]">
            {footerLabel}
          </span>
        </div>
      </article>
    </Link>
  );
}
