import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "@workspace/api-client-react";
import { getUserProfile } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";
import { getAuthRedirectOrigin } from "@/lib/auth-redirect-origin";

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
    const base = getAuthRedirectOrigin();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { intended_role: intendedRole },
        emailRedirectTo: `${base}/auth/login`,
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
