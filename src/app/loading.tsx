import { AnimeCardSkeletonGrid } from "@/src/components/AnimeCardSkeleton";

export default function HomeLoading() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-zinc-950/80 text-white backdrop-blur-[2px]">
      <div className="flex min-w-0 flex-col gap-4 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <div className="h-8 w-36 animate-pulse rounded-lg bg-zinc-800/90 sm:h-9 sm:w-44" />
        <div className="flex flex-wrap gap-3">
          <div className="h-4 w-14 animate-pulse rounded bg-zinc-800/80" />
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-800/80" />
          <div className="h-4 w-16 animate-pulse rounded bg-zinc-800/80" />
        </div>
      </div>

      <div className="px-4 py-12 text-center sm:px-6 sm:py-20">
        <div className="mx-auto h-9 max-w-md animate-pulse rounded-lg bg-zinc-800/80 sm:h-11 sm:max-w-xl" />
        <div className="mx-auto mt-4 h-4 max-w-sm animate-pulse rounded bg-zinc-800/60" />
        <div className="mx-auto mt-2 h-4 max-w-xs animate-pulse rounded bg-zinc-800/50" />
        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center">
          <div className="h-11 flex-1 animate-pulse rounded-xl bg-violet-950/50 sm:max-w-[11rem]" />
          <div className="h-11 flex-1 animate-pulse rounded-xl bg-zinc-800/70 sm:max-w-[11rem]" />
        </div>
      </div>

      <div className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-44 animate-pulse rounded-lg bg-zinc-800/90 sm:h-9 sm:w-52" />
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-800/60" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-zinc-800/70" />
        </div>
        <div className="mb-6 h-12 w-full animate-pulse rounded-xl bg-zinc-800/70 sm:h-[3.25rem]" />
        <AnimeCardSkeletonGrid count={8} />
      </div>

      <div className="border-t border-white/[0.06] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 mt-10 flex min-w-0 flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-800/90" />
            <div className="h-3 w-32 animate-pulse rounded bg-zinc-800/60" />
          </div>
        </div>
        <AnimeCardSkeletonGrid count={4} />
      </div>
    </main>
  );
}
