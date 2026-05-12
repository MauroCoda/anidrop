import { AnimeCard } from "@/src/components/AnimeCard";
import { SectionHeader } from "@/src/components/SectionHeader";
import type { TrendingAnime } from "@/src/lib/anilist";
import type { HomepageSectionRow } from "@/src/types/homepage-section";

type Props = {
  sections: HomepageSectionRow[];
  animeById: Map<number, TrendingAnime>;
};

/**
 * Server-only editorial rails. Cards resolve from `animeById`; missing ids are skipped.
 */
export function HomepageEditorialRails({ sections, animeById }: Props) {
  const visible = sections.filter((s) =>
    s.anime_ids.some((id) => animeById.has(id)),
  );

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 space-y-14 md:mt-14 md:space-y-20">
      {visible.map((section) => {
        const cards = section.anime_ids
          .map((id) => animeById.get(id))
          .filter((a): a is TrendingAnime => a != null);

        const sub = section.subtitle?.trim();
        const desc = section.description?.trim();
        const showDesc = Boolean(desc && desc !== sub);

        return (
          <section
            key={section.id}
            className="scroll-mt-20 rounded-2xl border border-violet-500/[0.12] bg-gradient-to-b from-zinc-900/55 via-zinc-950/70 to-zinc-950/90 p-5 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.04] sm:p-6 md:p-8"
            aria-labelledby={`editorial-${section.slug}-heading`}
          >
            <SectionHeader
              title={section.title}
              titleId={`editorial-${section.slug}-heading`}
              subtitle={sub || undefined}
            />

            {showDesc ? (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-[0.9375rem]">
                {desc}
              </p>
            ) : null}

            {section.ai_reasoning?.trim() ? (
              <p className="mt-3 max-w-3xl border-l-2 border-violet-500/40 pl-3 text-xs italic leading-relaxed text-violet-200/75 sm:text-sm">
                {section.ai_reasoning.trim()}
              </p>
            ) : null}

            <div className="mt-6 grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:mt-7 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {cards.map((anime) => (
                <AnimeCard
                  key={`${section.id}-${anime.id}`}
                  anime={anime}
                  footerLabel="Curated"
                  variant="catalog"
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
