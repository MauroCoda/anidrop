import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/src/components/Navbar";
import { getAllGuides } from "@/src/lib/guides";
import { getSiteUrl } from "@/src/lib/site";

const siteUrl = getSiteUrl();

const pageDescription =
  "Spoiler-light AniDrop guides: seasonal standouts, genre picks, taste clusters, and discovery rails — each backed by live AniList data.";

export const metadata: Metadata = {
  title: "Anime guides",
  description: pageDescription,
  alternates: siteUrl ? { canonical: new URL("/guides", siteUrl).href } : undefined,
  openGraph: {
    title: "Anime guides | AniDrop",
    description: pageDescription,
    ...(siteUrl ? { url: new URL("/guides", siteUrl).href } : {}),
  },
};

export default function GuidesIndexPage() {
  const guides = getAllGuides();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-zinc-950/80 text-white backdrop-blur-[2px]">
      <Navbar />
      <div className="mx-auto w-full min-w-0 max-w-[90rem] px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-10 lg:px-10">
        <nav
          className="text-xs text-zinc-500 sm:text-sm"
          aria-label="Breadcrumb"
        >
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                href="/"
                className="text-violet-400/90 transition hover:text-violet-300"
              >
                Home
              </Link>
            </li>
            <li aria-hidden className="text-zinc-600">
              /
            </li>
            <li className="font-medium text-zinc-300">Guides</li>
          </ol>
        </nav>

        <header className="mt-8 max-w-3xl border-l-2 border-violet-500/50 pl-4 sm:mt-10 sm:pl-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-400/85 sm:text-[11px]">
            Editorial
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-[2.35rem]">
            Anime guides
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Short, practical routes into the catalog — powered by AniList signals
            (seasonal charts, genres, recommendations, trending bands). No
            OpenAI on these pages; just structured picks and links into full
            detail views.
          </p>
        </header>

        <ul className="mt-12 grid min-w-0 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 xl:max-w-5xl">
          {guides.map((guide) => (
            <li key={guide.slug} className="min-w-0">
              <Link
                href={`/guides/${guide.slug}`}
                className="group block h-full min-h-[11rem] rounded-2xl border border-violet-500/[0.14] bg-gradient-to-br from-zinc-900/80 via-zinc-950/90 to-black p-5 shadow-[0_22px_60px_-38px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.05] transition hover:border-violet-400/35 hover:shadow-[0_28px_70px_-32px_rgba(139,92,246,0.22)] sm:p-6"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400/80">
                  {guide.sectionType.replace(/_/g, " ")}
                </p>
                <h2 className="mt-2 text-lg font-bold tracking-tight text-white group-hover:text-violet-100 sm:text-xl">
                  {guide.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                  {guide.description}
                </p>
                <p className="mt-4 text-xs font-semibold text-violet-300/95 transition group-hover:text-violet-200">
                  Read guide →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
