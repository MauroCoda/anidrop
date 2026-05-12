import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * AniDrop uses the **anon (public) key** only. Never import or ship the
 * service-role key in app code — it bypasses RLS and must stay server-only
 * in Supabase Dashboard / edge functions, not in this Next.js bundle.
 */

let browserClient: SupabaseClient | undefined;

function readSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return { url, anonKey };
}

/** True when both public Supabase env vars are non-empty (safe to call from build-time code). */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && anonKey);
}

/**
 * Browser + server: creates a Supabase client with the **publishable anon key**.
 * - Browser: one shared instance (auth session + refresh).
 * - Server (RSC, Route Handlers, Server Actions): a new instance per call; no session persistence.
 *
 * When you add generated DB types, switch to `createClient<Database>(...)`.
 */
export function createSupabaseClient(): SupabaseClient {
  const { url, anonKey } = readSupabaseEnv();
  const isBrowser = typeof window !== "undefined";

  if (isBrowser) {
    if (!browserClient) {
      browserClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    }
    return browserClient;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Lightweight connectivity check (no tables required). Uses the Auth service health route.
 * Safe to call from a Route Handler or Server Action for ops/debug — avoid per-request spam in production.
 */
export async function pingSupabase(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message:
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const { url, anonKey } = readSupabaseEnv();
  const base = url.replace(/\/+$/, "");

  try {
    const res = await fetch(`${base}/auth/v1/health`, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      return { ok: true, message: "Supabase Auth health check succeeded." };
    }

    return {
      ok: false,
      message: `Supabase health check failed (HTTP ${res.status}).`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return { ok: false, message: msg };
  }
}
