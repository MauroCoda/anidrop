export function AnimeCardSkeleton() {
  return (
    <div
      className="flex min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.07] bg-zinc-900/80 ring-1 ring-white/[0.04]"
      aria-hidden
    >
      <div className="relative aspect-[3/4] w-full animate-pulse bg-zinc-800/90" />
      <div className="border-t border-white/[0.06] bg-zinc-950/90 px-3.5 py-2.5 sm:px-4 sm:py-3">
        <div className="h-2.5 w-16 animate-pulse rounded bg-zinc-700/80" />
      </div>
    </div>
  );
}

export function AnimeCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}
