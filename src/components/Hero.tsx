export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-2 py-10 text-center sm:px-4 sm:py-14 md:py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-400/80">
        Discovery dashboard
      </p>
      <h2 className="mt-3 max-w-3xl text-2xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
        Your Anime
        <span className="text-violet-500"> Hype Radar</span>
      </h2>

      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:mt-4 sm:text-base">
        Trending, seasonal, and search — a fast, dark catalog powered by AniList.
      </p>

      <div className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:mt-8 sm:max-w-lg sm:flex-row sm:justify-center sm:gap-3">
        <a
          href="#trending"
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-center text-sm font-semibold transition hover:bg-violet-500 sm:px-6 sm:py-3"
        >
          Browse trending
        </a>

        <a
          href="#this-season"
          className="rounded-xl border border-white/10 px-5 py-2.5 text-center text-sm font-semibold transition hover:border-white/25 sm:px-6 sm:py-3"
        >
          This season
        </a>
      </div>
    </section>
  );
}
