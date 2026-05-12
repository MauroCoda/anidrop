/**
 * Canonical site URL for metadata, sitemap, and robots.
 * Set `NEXT_PUBLIC_SITE_URL` on Vercel (e.g. https://your-domain.com).
 * Falls back to `VERCEL_URL` (https://…) when unset.
 */
export function getSiteUrl(): URL | undefined {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    try {
      const normalized = explicit.replace(/\/+$/, "");
      return new URL(normalized);
    } catch {
      return undefined;
    }
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    try {
      return new URL(`https://${vercel}`);
    } catch {
      return undefined;
    }
  }
  return undefined;
}
