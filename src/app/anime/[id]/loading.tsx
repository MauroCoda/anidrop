export default function AnimeDetailLoading() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <header className="border-b border-white/10 px-4 py-4 sm:px-8">
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-800 sm:w-32" />
      </header>

      <div className="relative h-[min(42vh,22rem)] w-full animate-pulse bg-zinc-900 sm:h-[min(44vh,26rem)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20 sm:px-8">
        <div className="-mt-20 flex min-w-0 flex-col items-center gap-8 sm:-mt-24 md:flex-row md:items-end md:gap-10">
          <div className="aspect-[3/4] w-40 shrink-0 animate-pulse rounded-2xl bg-zinc-800 sm:w-48" />
          <div className="w-full min-w-0 flex-1 space-y-3 text-center md:text-left">
            <div className="mx-auto h-9 max-w-lg animate-pulse rounded-lg bg-zinc-800 md:mx-0" />
            <div className="mx-auto h-4 w-56 animate-pulse rounded bg-zinc-800/70 md:mx-0" />
            <div className="mx-auto mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              <div className="h-7 w-16 animate-pulse rounded-lg bg-zinc-800/70" />
              <div className="h-7 w-20 animate-pulse rounded-lg bg-zinc-800/70" />
              <div className="h-7 w-14 animate-pulse rounded-lg bg-zinc-800/70" />
            </div>
            <div className="mt-6 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="h-[4.5rem] animate-pulse rounded-xl bg-zinc-800/70"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 h-48 animate-pulse rounded-2xl bg-zinc-900/70 sm:mt-12 sm:h-56" />

        <div className="mt-10 space-y-3 rounded-2xl border border-white/[0.07] bg-zinc-900/40 p-6 sm:mt-12 sm:p-8">
          <div className="h-6 w-28 animate-pulse rounded bg-zinc-800/80" />
          <div className="h-3 w-full animate-pulse rounded bg-zinc-800/50" />
          <div className="h-3 w-full animate-pulse rounded bg-zinc-800/50" />
          <div className="h-3 max-w-md animate-pulse rounded bg-zinc-800/40" />
        </div>
      </div>
    </main>
  );
}
