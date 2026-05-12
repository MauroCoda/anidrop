/**
 * Canonical production site configuration.
 * `getSiteUrl()` uses this in production unless `NEXT_PUBLIC_SITE_URL` is set
 * (e.g. staging or local overrides).
 *
 * We intentionally do **not** fall back to `VERCEL_URL`, so preview deployments
 * are not used as canonical origins for sitemap, robots, or Open Graph.
 */
export const siteConfig = {
  url: "https://anidrop.app",
} as const;

/**
 * Canonical site base URL for metadata, sitemap, and robots.
 * Override with `NEXT_PUBLIC_SITE_URL` when needed (trimmed, no trailing slash).
 */
export function getSiteUrl(): URL | undefined {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    try {
      const normalized = explicit.replace(/\/+$/, "");
      return new URL(normalized);
    } catch {
      /* fall through */
    }
  }
  if (process.env.NODE_ENV === "production") {
    try {
      return new URL(siteConfig.url);
    } catch {
      return undefined;
    }
  }
  return undefined;
}
