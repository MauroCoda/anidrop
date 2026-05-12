export function Navbar() {
  return (
    <nav
      className="flex min-w-0 flex-col gap-4 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-8 lg:py-6"
      aria-label="Primary"
    >
      <h1 className="shrink-0 text-2xl font-bold tracking-wide sm:text-3xl">
        Ani<span className="text-violet-500">Drop</span>
      </h1>

      <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-300 sm:justify-end sm:gap-x-6 sm:text-sm">
        <a
          href="#trending"
          className="whitespace-nowrap transition hover:text-white"
        >
          Trending
        </a>
        <a
          href="#this-season"
          className="whitespace-nowrap transition hover:text-white"
        >
          This season
        </a>
        <span className="whitespace-nowrap text-zinc-600">Upcoming</span>
      </div>
    </nav>
  );
}
