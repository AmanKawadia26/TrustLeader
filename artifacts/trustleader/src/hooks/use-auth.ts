import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "@workspace/api-client-react";
import { getUserProfile } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";

/** Base URL for email confirmation links (must match Supabase Auth redirect allowlist). */
function authRedirectBase(): string {
  const explicit = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setUser(null);
      return;
    }
    try {
      const profile = await getUserProfile();
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refreshProfile();
      if (!cancelled) setIsLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      await refreshProfile();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setUser(null);
      return null;
    }
    try {
      const profile = await getUserProfile();
      setUser(profile);
      return profile;
    } catch {
      setUser(null);
      return null;
    }
  };

  const register = async (
    email: string,
    password: string,
    intendedRole: "consumer" | "company" | "reseller" = "consumer",
  ) => {
    const base = authRedirectBase();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { intended_role: intendedRole },
        // Without this, Supabase uses the dashboard "Site URL" (often localhost:3000) and links break when the app runs on another port (e.g. Vite 5173).
        emailRedirectTo: base ? `${base}/auth/login` : undefined,
      },
    });
    if (error) throw error;
    await refreshProfile();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    queryClient.clear();
  };

  const getAuthHeaders = () => {
    return {};
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    getAuthHeaders,
    refreshProfile,
  };
}
