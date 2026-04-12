/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  /** If set, wins over other origins for Supabase emailRedirectTo. Must be in Supabase Redirect URLs. */
  readonly VITE_AUTH_REDIRECT_URL?: string;
  /** Injected in vite.config from VERCEL_URL during Vercel builds (https://…). */
  readonly VITE_VERCEL_DEPLOYMENT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
