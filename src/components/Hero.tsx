export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-24 lg:py-32">
      <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
        Your Anime
        <span className="text-violet-500"> Hype Radar</span>
      </h2>

      <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:mt-6 sm:text-lg">
        Discover trending anime, upcoming releases,
        hidden gems and what&apos;s worth watching next.
      </p>

      <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
        <a
          href="#trending"
          className="rounded-xl bg-violet-600 px-6 py-3 text-center text-sm font-semibold transition hover:bg-violet-500 sm:text-base"
        >
          Explore Trending
        </a>

        <a
          href="#this-season"
          className="rounded-xl border border-white/10 px-6 py-3 text-center text-sm font-semibold transition hover:border-white/30 sm:text-base"
        >
          This season
        </a>
      </div>
    </section>
  );
}
