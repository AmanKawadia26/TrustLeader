import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";

const base =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ??
  (typeof window !== "undefined" ? window.location.origin : "");

setBaseUrl(base || null);

setAuthTokenGetter(async () => {
  const { data } = await import("./supabase").then((m) => m.supabase.auth.getSession());
  return data.session?.access_token ?? null;
});
