/**
 * Origin used for Supabase email confirmation (`emailRedirectTo`) and related redirects.
 * Must match entries under Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.
 *
 * Priority:
 * 1. VITE_AUTH_REDIRECT_URL — set manually in Vercel if you need a fixed production domain.
 * 2. VITE_SITE_URL — same origin as SEO canonicals.
 * 3. VITE_VERCEL_DEPLOYMENT_URL — injected at build from VERCEL_URL (see vite.config.ts); correct for preview + production deploys on Vercel.
 * 4. Dev: current browser origin (any local port).
 * 5. Production fallback — primary Vercel production app (override via env for other domains).
 */
export function getAuthRedirectOrigin(): string {
  const explicit = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const siteUrl = import.meta.env.VITE_SITE_URL?.trim();
  if (siteUrl) return siteUrl.replace(/\/$/, "");

  const vercelDeployment = import.meta.env.VITE_VERCEL_DEPLOYMENT_URL?.trim();
  if (vercelDeployment) return vercelDeployment.replace(/\/$/, "");

  if (import.meta.env.DEV && typeof window !== "undefined") {
    return window.location.origin;
  }

  return "https://trust-leader-trustleader.vercel.app";
}
