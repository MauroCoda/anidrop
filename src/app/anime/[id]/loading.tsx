export default function AnimeDetailLoading() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-zinc-950/80 text-white backdrop-blur-[2px]">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-[90rem] px-4 py-3.5 sm:px-6 lg:px-10">
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-800 sm:w-36" />
        </div>
      </header>

      <div className="relative h-[min(42vh,15.5rem)] min-h-[11.5rem] w-full animate-pulse bg-zinc-900 sm:h-[min(46vh,19rem)] md:h-[min(52vh,22rem)] lg:h-[min(56vh,28rem)] lg:max-h-[31rem]" />

      <div className="relative z-10 mx-auto min-w-0 max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="-mt-[4.5rem] sm:-mt-[5.25rem] md:-mt-28">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/70 ring-1 ring-white/[0.04] sm:rounded-3xl">
            <div className="border-b border-white/[0.06] p-5 sm:p-7 md:p-8">
              <div className="flex min-w-0 flex-col gap-6 md:flex-row md:gap-8">
                <div className="mx-auto shrink-0 md:mx-0">
                  <div className="aspect-[3/4] w-[9.25rem] animate-pulse rounded-2xl bg-zinc-800 sm:w-44 md:w-[13.5rem]" />
                </div>
                <div className="min-w-0 flex-1 space-y-3 text-center md:text-left">
                  <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                    <div className="h-7 w-14 animate-pulse rounded-lg bg-zinc-800/80" />
                    <div className="h-7 w-16 animate-pulse rounded-lg bg-zinc-800/80" />
                    <div className="h-7 w-24 animate-pulse rounded-lg bg-zinc-800/80" />
                  </div>
                  <div className="mx-auto h-9 max-w-lg animate-pulse rounded-lg bg-zinc-800 md:mx-0" />
                  <div className="mx-auto h-4 w-56 animate-pulse rounded bg-zinc-800/70 md:mx-0" />
                  <div className="mx-auto mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                    <div className="h-6 w-14 animate-pulse rounded-md bg-zinc-800/70" />
                    <div className="h-6 w-16 animate-pulse rounded-md bg-zinc-800/70" />
                    <div className="h-6 w-12 animate-pulse rounded-md bg-zinc-800/70" />
                  </div>
                  <div className="mx-auto mt-4 h-14 w-28 animate-pulse rounded-xl bg-zinc-800/70 md:mx-0" />
                </div>
              </div>
            </div>

            <div className="border-b border-white/[0.05] px-5 py-6 sm:px-7 md:px-8">
              <div className="h-5 w-24 animate-pulse rounded bg-zinc-800/80" />
              <div className="mt-5 aspect-video w-full animate-pulse rounded-2xl bg-zinc-800/60" />
            </div>

            <div className="px-5 py-6 sm:px-7 md:px-8">
              <div className="h-5 w-28 animate-pulse rounded bg-zinc-800/80" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-zinc-800/50" />
                <div className="h-3 w-full animate-pulse rounded bg-zinc-800/50" />
                <div className="h-3 max-w-md animate-pulse rounded bg-zinc-800/40" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-10 sm:mt-14">
          <div className="mb-5 flex flex-col gap-2 border-l-2 border-violet-500/30 pl-3.5 sm:mb-7 sm:pl-4">
            <div className="h-7 w-40 animate-pulse rounded-lg bg-zinc-800/90" />
            <div className="h-3 max-w-md animate-pulse rounded bg-zinc-800/60" />
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-900/80"
              >
                <div className="h-44 animate-pulse bg-zinc-800/90 sm:h-48" />
                <div className="border-t border-white/[0.06] px-2.5 py-1.5">
                  <div className="h-2 w-12 animate-pulse rounded bg-zinc-800/80" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
