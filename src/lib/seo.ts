/**
 * Shared SEO helpers (plain text, no HTML).
 */

const META_DESC_MAX = 158;

export function truncatePlainText(text: string, max = META_DESC_MAX): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) {
    return collapsed;
  }
  return `${collapsed.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}
