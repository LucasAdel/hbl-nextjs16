"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "staff" | "client";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  emailConfirmedAt?: string;
  createdAt?: string;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email || "",
    role: (user.user_metadata?.role as UserRole) || "client",
    firstName: user.user_metadata?.first_name,
    lastName: user.user_metadata?.last_name,
    avatarUrl: user.user_metadata?.avatar_url,
    emailConfirmedAt: user.email_confirmed_at,
    createdAt: user.created_at,
  };
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setError(userError.message);
        setUser(null);
        return;
      }

      if (supabaseUser) {
        setUser(mapSupabaseUser(supabaseUser));
        setError(null);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError("Failed to fetch user");
      setUser(null);
    }
  }, [supabase.auth]);

  useEffect(() => {
    // Get initial user
    refreshUser().finally(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(mapSupabaseUser(session.user));
          setError(null);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        } else if (event === "USER_UPDATED" && session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          setUser(mapSupabaseUser(session.user));
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser, supabase.auth]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError(signOutError.message);
      } else {
        setUser(null);
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Failed to sign out");
    } finally {
      setLoading(false);
    }
  }, [supabase.auth, router]);

  const updateProfile = useCallback(
    async (updates: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      try {
        const { data, error: updateError } = await supabase.auth.updateUser({
          data: {
            first_name: updates.firstName,
            last_name: updates.lastName,
            avatar_url: updates.avatarUrl,
          },
        });

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        if (data.user) {
          setUser(mapSupabaseUser(data.user));
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: "Failed to update profile" };
      }
    },
    [supabase.auth]
  );

  const updatePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        // First verify current password by attempting to sign in
        if (user?.email) {
          const { error: verifyError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
          });

          if (verifyError) {
            return { success: false, error: "Current password is incorrect" };
          }
        }

        // Update to new password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: "Failed to update password" };
      }
    },
    [supabase.auth, user?.email]
  );

  const updateEmail = useCallback(
    async (newEmail: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          email: newEmail,
        });

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        return { success: true };
      } catch (err) {
        return { success: false, error: "Failed to update email" };
      }
    },
    [supabase.auth]
  );

  const deleteAccount = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    // Note: Account deletion typically requires server-side admin action
    // This is a placeholder - implement via API route with service role
    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.error || "Failed to delete account" };
      }

      await signOut();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Failed to delete account" };
    }
  }, [signOut]);

  return {
    user,
    loading,
    error,
    signOut,
    refreshUser,
    updateProfile,
    updatePassword,
    updateEmail,
    deleteAccount,
  };
}

// Export a simpler hook for just checking auth status
export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session?.user);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return { isAuthenticated, isLoading };
}
