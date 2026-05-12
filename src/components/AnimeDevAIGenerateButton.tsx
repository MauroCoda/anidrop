"use client";

import { useState } from "react";

type Props = {
  animeId: number;
};

export function AnimeDevAIGenerateButton({ animeId }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  async function onClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/anime/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: animeId }),
      });
      const body = (await res.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      if (!res.ok) {
        const err =
          typeof body?.error === "string"
            ? body.error
            : `Request failed (${res.status})`;
        const details =
          typeof body?.details === "string" ? `\n${body.details}` : "";
        setMessage(`${err}${details}`);
        return;
      }
      setMessage(JSON.stringify(body, null, 2));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-500/35 bg-amber-950/30 px-3 py-3 ring-1 ring-amber-500/15">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200/90">
        Dev only
      </p>
      <p className="mt-1 text-xs text-amber-100/85">
        Calls server route → OpenAI → optional Supabase upsert. Never runs in
        production builds.
      </p>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="mt-2.5 rounded-lg border border-amber-400/40 bg-amber-900/40 px-3 py-2 text-xs font-semibold text-amber-50 transition hover:bg-amber-800/50 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate AI + upsert cache"}
      </button>
      {message ? (
        <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-white/10 bg-black/40 p-2 text-left text-[11px] leading-relaxed text-zinc-300">
          {message}
        </pre>
      ) : null}
    </div>
  );
}
