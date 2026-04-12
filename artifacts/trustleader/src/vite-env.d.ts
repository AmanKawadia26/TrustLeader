/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  /** Optional. If set, email confirmation redirects use this origin (production). If unset, current browser origin is used (any dev port). Must be listed under Supabase Auth → Redirect URLs. */
  readonly VITE_AUTH_REDIRECT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
