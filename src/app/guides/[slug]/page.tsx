import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AnimeCard } from "@/src/components/AnimeCard";
import { Navbar } from "@/src/components/Navbar";
import {
  fetchGuideAnimeList,
  getAllGuides,
  getGuideBySlug,
} from "@/src/lib/guides";
import { getSiteUrl } from "@/src/lib/site";

export const revalidate = 3600;

/** New `GUIDES` entries can be served without rebuilding the prerender list. */
export const dynamicParams = true;

export function generateStaticParams(): { slug: string }[] {
  return getAllGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    return { title: "Guide", robots: { index: false, follow: true } };
  }

  const site = getSiteUrl();
  const path = `/guides/${guide.slug}`;
  const ogUrl = site ? new URL(path, site).href : undefined;

  return {
    title: guide.seoTitle,
    description: guide.seoDescription,
    keywords: guide.relatedKeywords,
    alternates: site ? { canonical: new URL(path, site).href } : undefined,
    openGraph: {
      type: "article",
      title: guide.seoTitle,
      description: guide.seoDescription,
      url: ogUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: guide.seoTitle,
      description: guide.seoDescription,
    },
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    notFound();
  }

  const anime = await fetchGuideAnimeList(guide.animeFilter);
  const others = getAllGuides().filter((g) => g.slug !== guide.slug);

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
            <li>
              <Link
                href="/guides"
                className="text-violet-400/90 transition hover:text-violet-300"
              >
                Guides
              </Link>
            </li>
            <li aria-hidden className="text-zinc-600">
              /
            </li>
            <li className="max-w-[min(100%,14rem)] truncate font-medium text-zinc-300">
              {guide.title}
            </li>
          </ol>
        </nav>

        <article className="mt-8 sm:mt-10">
          <header className="max-w-3xl border-l-2 border-violet-500/50 pl-4 sm:pl-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/85 sm:text-[11px]">
              {guide.sectionType.replace(/_/g, " ")}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-[2.4rem]">
              {guide.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              {guide.description}
            </p>
          </header>

          <div className="mt-8 max-w-3xl rounded-2xl border border-white/[0.07] bg-zinc-900/50 p-5 ring-1 ring-violet-500/[0.06] sm:p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-violet-300/90">
              Overview
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-200 sm:text-[0.9375rem] sm:leading-relaxed">
              {guide.intro}
            </p>
          </div>

          <section
            className="mt-10 max-w-3xl"
            aria-labelledby="how-picked-heading"
          >
            <h2
              id="how-picked-heading"
              className="text-lg font-bold tracking-tight text-white sm:text-xl"
            >
              How we picked these anime
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Transparent rules — no black-box ranking on this page.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-300 marker:text-violet-500/90 sm:text-[0.9375rem]">
              {guide.criteria.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section
            className="mt-12 border-t border-white/[0.06] pt-10"
            aria-labelledby="picks-heading"
          >
            <h2
              id="picks-heading"
              className="text-lg font-bold tracking-tight text-white sm:text-xl"
            >
              Picks
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Each card opens the AniDrop anime page (trailer, synopsis, scores,
              optional AI insights).
            </p>

            {anime.length === 0 ? (
              <p className="mt-6 rounded-xl border border-amber-500/25 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
                Could not load titles from AniList right now. Try again shortly
                or browse from the{" "}
                <Link href="/" className="font-medium text-violet-300 underline">
                  homepage
                </Link>
                .
              </p>
            ) : (
              <div className="mt-6 grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {anime.map((item) => (
                  <AnimeCard
                    key={item.id}
                    anime={item}
                    footerLabel="Guide"
                    variant="catalog"
                  />
                ))}
              </div>
            )}
          </section>

          {guide.relatedKeywords.length > 0 ? (
            <section className="mt-10 max-w-3xl" aria-label="Related topics">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Related topics
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {guide.relatedKeywords.map((kw) => (
                  <li key={kw}>
                    <span className="inline-flex rounded-md border border-white/[0.08] bg-zinc-900/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                      {kw}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {others.length > 0 ? (
            <section
              className="mt-14 border-t border-white/[0.06] pt-10"
              aria-labelledby="more-guides-heading"
            >
              <h2
                id="more-guides-heading"
                className="text-lg font-bold tracking-tight text-white sm:text-xl"
              >
                More guides
              </h2>
              <ul className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {others.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="inline-flex rounded-lg border border-violet-500/25 bg-violet-950/30 px-3 py-2 text-sm font-medium text-violet-100 transition hover:border-violet-400/45 hover:bg-violet-900/40"
                    >
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="mt-12 text-center text-sm text-zinc-500 sm:text-left">
            <Link
              href="/guides"
              className="font-medium text-violet-400 transition hover:text-violet-300"
            >
              ← All guides
            </Link>
            <span className="mx-2 text-zinc-600" aria-hidden>
              ·
            </span>
            <Link
              href="/"
              className="font-medium text-violet-400 transition hover:text-violet-300"
            >
              Home
            </Link>
          </p>
        </article>
      </div>
    </main>
  );
}
