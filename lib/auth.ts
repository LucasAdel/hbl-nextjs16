// Auth utilities and types
import { createClient } from "@/lib/supabase/client";

export type UserRole = "admin" | "staff" | "client";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { firstName?: string; lastName?: string; role?: UserRole }
) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: metadata?.firstName,
        last_name: metadata?.lastName,
        role: metadata?.role || "client",
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

// Sign in with Google OAuth
export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  return { data, error };
}

// Sign out
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email || "",
    role: (user.user_metadata?.role as UserRole) || "client",
    firstName: user.user_metadata?.first_name,
    lastName: user.user_metadata?.last_name,
    avatarUrl: user.user_metadata?.avatar_url,
  };
}

// Request password reset
export async function requestPasswordReset(email: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { data, error };
}

// Update password
export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
}

// Update user profile
export async function updateProfile(updates: {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser({
    data: {
      first_name: updates.firstName,
      last_name: updates.lastName,
      avatar_url: updates.avatarUrl,
    },
  });
  return { data, error };
}
