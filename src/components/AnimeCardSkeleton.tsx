type SkeletonVariant = "poster" | "catalog";

export function AnimeCardSkeleton({
  variant = "poster",
}: {
  variant?: SkeletonVariant;
}) {
  const catalog = variant === "catalog";
  const shell = catalog ? "rounded-xl" : "rounded-[1.35rem]";
  const frame = catalog
    ? "h-44 sm:h-48 md:h-52 lg:h-[220px] xl:h-[248px]"
    : "aspect-[3/4]";

  return (
    <div
      className={`flex min-w-0 flex-col overflow-hidden border border-white/[0.07] bg-zinc-900/80 ring-1 ring-white/[0.04] ${shell}`}
      aria-hidden
    >
      <div className={`relative w-full animate-pulse bg-zinc-800/90 ${frame}`} />
      <div
        className={`border-t border-white/[0.06] bg-zinc-950/90 ${catalog ? "px-2.5 py-1.5" : "px-3.5 py-2.5 sm:px-4 sm:py-3"}`}
      >
        <div
          className={`animate-pulse rounded bg-zinc-700/80 ${catalog ? "h-2 w-12" : "h-2.5 w-16"}`}
        />
      </div>
    </div>
  );
}

export function AnimeCardSkeletonGrid({
  count = 8,
  variant = "poster",
}: {
  count?: number;
  variant?: SkeletonVariant;
}) {
  const grid =
    variant === "catalog"
      ? "grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      : "grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4";

  return (
    <div className={grid}>
      {Array.from({ length: count }, (_, i) => (
        <AnimeCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}
