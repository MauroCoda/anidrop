"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";

import type { AnimeAIContent } from "@/src/lib/openai";

export type AnimeAIInitialFields = {
  ai_summary: string | null;
  why_watch: string | null;
  perfect_if_you_like: string | null;
};

type Props = {
  animeId: number;
  initial: AnimeAIInitialFields;
  /** True when Supabase already had all three AI fields on SSR (source of truth). */
  serverCacheComplete: boolean;
};

function hasFullAi(f: AnimeAIInitialFields): boolean {
  return (
    Boolean(f.ai_summary?.trim()) &&
    Boolean(f.why_watch?.trim()) &&
    Boolean(f.perfect_if_you_like?.trim())
  );
}

function InsightCard({
  eyebrow,
  body,
}: {
  eyebrow: string;
  body: string;
}) {
  return (
    <article className="rounded-xl border border-white/[0.08] bg-zinc-950/50 p-4 shadow-inner shadow-black/30 ring-1 ring-violet-500/[0.06] sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-400/85">
        {eyebrow}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-200 sm:text-[0.9375rem] sm:leading-relaxed">
        {body}
      </p>
    </article>
  );
}

export function AnimeAISections({
  animeId,
  initial,
  serverCacheComplete,
}: Props) {
  const router = useRouter();
  const [fields, setFields] = useState<AnimeAIInitialFields>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const [persistedAfterWrite, setPersistedAfterWrite] = useState(false);

  const fullFromState = useMemo(() => hasFullAi(fields), [fields]);

  const showAnyCard = useMemo(
    () =>
      Boolean(fields.ai_summary?.trim()) ||
      Boolean(fields.why_watch?.trim()) ||
      Boolean(fields.perfect_if_you_like?.trim()),
    [fields],
  );

  const showAIBadge = useMemo(
    () =>
      showAnyCard && (serverCacheComplete || persistedAfterWrite),
    [persistedAfterWrite, serverCacheComplete, showAnyCard],
  );

  const generate = useCallback(
    async (regenerate: boolean) => {
      if (inFlightRef.current) {
        return;
      }
      inFlightRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/anime/generate-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: animeId, regenerate }),
        });
        const body = (await res.json().catch(() => null)) as {
          error?: string;
          details?: string;
          generatedContent?: AnimeAIContent;
          content?: AnimeAIContent;
          savedToSupabase?: boolean;
          supabaseError?: string | null;
          cache?: { status?: string };
        } | null;

        const generated =
          body?.generatedContent ?? body?.content ?? undefined;

        if (!res.ok || !body || !generated) {
          const msg =
            typeof body?.error === "string"
              ? body.error
              : `Request failed (${res.status})`;
          const details =
            typeof body?.details === "string" ? ` ${body.details}` : "";
          setError(`${msg}${details}`.trim());
          return;
        }

        const c = generated;
        setFields({
          ai_summary: c.ai_summary,
          why_watch: c.why_watch,
          perfect_if_you_like: c.perfect_if_you_like,
        });

        const saved = body.savedToSupabase === true;
        setPersistedAfterWrite(saved);

        const cacheStatus = body.cache?.status;
        if (
          saved &&
          (cacheStatus === "ok" || cacheStatus === "hit")
        ) {
          router.refresh();
        } else if (!saved && typeof body.supabaseError === "string" && body.supabaseError) {
          setError(
            `Generated on the server but not saved to Supabase: ${body.supabaseError}`,
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Request failed");
      } finally {
        setLoading(false);
        inFlightRef.current = false;
      }
    },
    [animeId, router],
  );

  return (
    <section
      className="border-t border-white/[0.05] px-5 py-6 sm:px-7 sm:py-7 md:px-8"
      aria-labelledby="ai-insights-heading"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="ai-insights-heading"
              className="text-lg font-bold tracking-tight text-white sm:text-xl"
            >
              AI insights
            </h2>
            {showAIBadge ? (
              <span className="inline-flex items-center rounded-md border border-violet-500/30 bg-violet-950/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-200/95">
                AI Generated
              </span>
            ) : null}
          </div>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500 sm:text-[13px]">
            Concise, spoiler-free copy. Cached in Supabase after the first
            successful run.
          </p>
        </div>
        {!fullFromState ? (
          <div className="shrink-0 sm:pt-0.5">
            <button
              type="button"
              onClick={() => void generate(false)}
              disabled={loading}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-violet-500/35 bg-violet-600/90 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-0 sm:py-2"
            >
              {loading ? (
                <>
                  <span
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden
                  />
                  Generating…
                </>
              ) : (
                "Generate AI insights"
              )}
            </button>
          </div>
        ) : process.env.NODE_ENV === "development" ? (
          <div className="shrink-0 sm:pt-0.5">
            <button
              type="button"
              onClick={() => void generate(true)}
              disabled={loading}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-[11px] font-semibold text-amber-100 transition hover:bg-amber-900/50 disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-0"
            >
              {loading ? "Regenerating…" : "Regenerate (dev)"}
            </button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-zinc-400" role="status" aria-live="polite">
          Generating AI content… this usually takes a few seconds.
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-lg border border-red-500/25 bg-red-950/35 px-3 py-2 text-sm text-red-200/95">
          {error}
        </p>
      ) : null}

      {showAnyCard ? (
        <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
          {fields.ai_summary?.trim() ? (
            <InsightCard eyebrow="AI summary" body={fields.ai_summary.trim()} />
          ) : null}
          {fields.why_watch?.trim() ? (
            <InsightCard eyebrow="Why watch" body={fields.why_watch.trim()} />
          ) : null}
          {fields.perfect_if_you_like?.trim() ? (
            <InsightCard
              eyebrow="Perfect if you like"
              body={fields.perfect_if_you_like.trim()}
            />
          ) : null}
        </div>
      ) : !loading ? (
        <p className="mt-4 text-sm text-zinc-500">
          No AI insights yet. Use the button above to generate once your server
          has{" "}
          <code className="rounded bg-zinc-800 px-1 py-0.5 text-[11px] text-zinc-300">
            OPENAI_API_KEY
          </code>{" "}
          (and Supabase for caching).
        </p>
      ) : null}
    </section>
  );
}
