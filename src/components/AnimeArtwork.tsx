"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Props = {
  alt: string;
  compact?: boolean;
  fallbackSrc?: string | null;
  imageClassName?: string;
  primarySrc?: string | null;
  sizes: string;
};

function normalizeSrc(src: string | null | undefined): string | null {
  if (!src) {
    return null;
  }
  const trimmed = src.trim();
  return trimmed ? trimmed : null;
}

function Placeholder({ compact = false }: { compact?: boolean }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.35),transparent_48%),linear-gradient(135deg,rgba(9,9,11,0.98),rgba(24,24,27,0.92)_45%,rgba(8,47,73,0.85))]" />
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundPosition: "center",
          backgroundSize: compact ? "14px 14px" : "20px 20px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        <span
          className={`font-semibold uppercase tracking-[0.22em] text-violet-200/90 ${
            compact ? "text-[8px]" : "text-[10px]"
          }`}
        >
          AniDrop
        </span>
        <span
          className={`mt-1 text-zinc-300/85 ${
            compact ? "text-[9px]" : "text-xs"
          }`}
        >
          No image available
        </span>
      </div>
    </div>
  );
}

export function AnimeArtwork({
  alt,
  compact = false,
  fallbackSrc,
  imageClassName,
  primarySrc,
  sizes,
}: Props) {
  const candidates = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];

    for (const value of [normalizeSrc(primarySrc), normalizeSrc(fallbackSrc)]) {
      if (!value || seen.has(value)) {
        continue;
      }
      seen.add(value);
      out.push(value);
    }

    return out;
  }, [fallbackSrc, primarySrc]);

  const [candidateIndex, setCandidateIndex] = useState(
    candidates.length > 0 ? 0 : -1,
  );

  useEffect(() => {
    setCandidateIndex(candidates.length > 0 ? 0 : -1);
  }, [candidates]);

  const currentSrc =
    candidateIndex >= 0 && candidateIndex < candidates.length
      ? candidates[candidateIndex]
      : null;

  if (!currentSrc) {
    return <Placeholder compact={compact} />;
  }

  return (
    <Image
      key={currentSrc}
      src={currentSrc}
      alt={alt}
      fill
      className={imageClassName}
      sizes={sizes}
      onError={() => {
        setCandidateIndex((index) =>
          index + 1 < candidates.length ? index + 1 : -1,
        );
      }}
    />
  );
}
