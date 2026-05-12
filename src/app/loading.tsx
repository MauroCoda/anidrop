import { AnimeCardSkeletonGrid } from "@/src/components/AnimeCardSkeleton";

export default function HomeLoading() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-zinc-950/80 text-white backdrop-blur-[2px]">
      <div className="border-b border-white/10">
        <div className="mx-auto flex min-w-0 max-w-[90rem] flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-10 lg:py-6">
          <div className="h-8 w-36 animate-pulse rounded-lg bg-zinc-800/90 sm:h-9 sm:w-44" />
          <div className="flex flex-wrap gap-3">
            <div className="h-4 w-14 animate-pulse rounded bg-zinc-800/80" />
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-800/80" />
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-800/80" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full min-w-0 max-w-[90rem] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <div className="py-10 text-center sm:py-14">
          <div className="mx-auto h-8 max-w-md animate-pulse rounded-lg bg-zinc-800/80 sm:h-9 sm:max-w-xl" />
          <div className="mx-auto mt-3 h-3.5 max-w-sm animate-pulse rounded bg-zinc-800/60" />
          <div className="mx-auto mt-2 h-3.5 max-w-xs animate-pulse rounded bg-zinc-800/50" />
          <div className="mx-auto mt-7 flex max-w-md flex-col gap-2 sm:mt-8 sm:flex-row sm:justify-center">
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-violet-950/50 sm:max-w-[11rem]" />
            <div className="h-10 flex-1 animate-pulse rounded-xl bg-zinc-800/70 sm:max-w-[11rem]" />
          </div>
        </div>

        <div className="scroll-mt-20 border-t border-transparent pt-8 md:pt-10">
          <div className="mb-5 flex min-w-0 flex-col gap-3 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2 border-l-2 border-violet-500/30 pl-3.5 sm:pl-4">
              <div className="h-7 w-44 animate-pulse rounded-lg bg-zinc-800/90 sm:h-8 sm:w-52" />
              <div className="h-3 max-w-md animate-pulse rounded bg-zinc-800/60" />
            </div>
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-800/70" />
          </div>
          <div className="mx-auto mb-9 max-w-2xl rounded-2xl border border-white/[0.08] bg-zinc-900/50 p-4 sm:mb-11 sm:p-5 lg:max-w-3xl">
            <div className="mx-auto h-3 w-32 animate-pulse rounded bg-zinc-800/60" />
            <div className="mx-auto mt-2 h-3 w-48 animate-pulse rounded bg-zinc-800/45" />
            <div className="mt-3 h-[52px] w-full animate-pulse rounded-xl bg-zinc-800/70" />
          </div>
          <AnimeCardSkeletonGrid count={12} variant="catalog" />
        </div>

        <div className="mt-14 border-t border-white/[0.06] pt-10 md:mt-20 md:pt-16">
          <div className="mb-5 flex min-w-0 flex-col gap-2 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2 border-l-2 border-violet-500/30 pl-3.5 sm:pl-4">
              <div className="h-7 w-40 animate-pulse rounded-lg bg-zinc-800/90 sm:h-8" />
              <div className="h-3 max-w-md animate-pulse rounded bg-zinc-800/60" />
            </div>
          </div>
          <AnimeCardSkeletonGrid count={8} variant="catalog" />
        </div>
      </div>
    </main>
  );
}
