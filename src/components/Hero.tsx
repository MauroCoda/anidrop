export function Hero() {
  return (
    <section className="mx-auto flex min-w-0 max-w-4xl flex-col items-center justify-center px-1 py-8 text-center sm:px-3 sm:py-12 md:py-14">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-400/85 sm:text-[11px]">
        Discovery dashboard
      </p>
      <h2 className="mt-2.5 max-w-3xl text-balance text-2xl font-black leading-[1.12] tracking-tight sm:mt-3 sm:text-4xl md:text-[2.65rem] md:leading-[1.08]">
        Your Anime
        <span className="text-violet-500"> Hype Radar</span>
      </h2>

      <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-zinc-400 sm:mt-3.5 sm:text-[0.95rem]">
        Trending, seasonal, and live search in one premium dark catalog — synced with AniList.
      </p>

      <div className="mt-5 flex w-full min-w-0 max-w-md flex-col gap-2 sm:mt-7 sm:max-w-lg sm:flex-row sm:justify-center sm:gap-2.5">
        <a
          href="#trending"
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-center text-sm font-semibold shadow-lg shadow-violet-950/40 transition hover:bg-violet-500 sm:px-6 sm:py-2.5"
        >
          Browse trending
        </a>

        <a
          href="#this-season"
          className="rounded-xl border border-white/12 bg-zinc-950/30 px-5 py-2.5 text-center text-sm font-semibold text-zinc-100 transition hover:border-violet-500/35 hover:bg-zinc-900/50 sm:px-6 sm:py-2.5"
        >
          This season
        </a>
      </div>
    </section>
  );
}
