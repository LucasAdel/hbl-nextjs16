/**
 * Referral Database Operations
 * Persists referral data to Supabase
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDb(supabase: SupabaseClient): any {
  return supabase;
}

export type ReferralStatus = "pending" | "signed_up" | "purchased" | "expired";

export interface Referral {
  id: string;
  referrer_email: string;
  referrer_name?: string;
  referred_email: string;
  referral_code: string;
  status: ReferralStatus;
  signup_xp_awarded: number;
  purchase_xp_awarded: number;
  total_xp_awarded: number;
  created_at: string;
  signed_up_at?: string;
  purchased_at?: string;
  expires_at?: string;
}

export interface ReferralLeaderboardEntry {
  email: string;
  name?: string;
  referral_count: number;
  converted_count: number;
  total_xp_earned: number;
  rank?: number;
}

// XP rewards for referrals
const REFERRAL_XP = {
  signup: 75, // XP when referred user signs up
  purchase: 500, // XP when referred user makes first purchase
};

/**
 * Generate unique referral code
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "HBL-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a referral invitation
 */
export async function createReferral(
  referrerEmail: string,
  referredEmail: string,
  referrerName?: string
): Promise<Referral | null> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Check if referral already exists
  const { data: existing } = await db
    .from("referrals")
    .select("*")
    .eq("referrer_email", referrerEmail)
    .eq("referred_email", referredEmail)
    .single();

  if (existing) {
    return existing;
  }

  const referralCode = generateReferralCode();

  const { data, error } = await db
    .from("referrals")
    .insert({
      referrer_email: referrerEmail,
      referrer_name: referrerName,
      referred_email: referredEmail,
      referral_code: referralCode,
      status: "pending",
      signup_xp_awarded: 0,
      purchase_xp_awarded: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating referral:", error);
    return null;
  }

  return data;
}

/**
 * Get referral by code
 */
export async function getReferralByCode(code: string): Promise<Referral | null> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("referrals")
    .select("*")
    .eq("referral_code", code)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Mark referral as signed up and award XP
 */
export async function markReferralSignedUp(referredEmail: string): Promise<number> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Find pending referral for this email
  const { data: referral } = await db
    .from("referrals")
    .select("*")
    .eq("referred_email", referredEmail)
    .eq("status", "pending")
    .single();

  if (!referral) {
    return 0;
  }

  // Update referral status
  await db
    .from("referrals")
    .update({
      status: "signed_up",
      signed_up_at: new Date().toISOString(),
      signup_xp_awarded: REFERRAL_XP.signup,
    })
    .eq("id", referral.id);

  // Award XP to referrer
  await db.from("xp_transactions").insert({
    user_email: referral.referrer_email,
    amount: REFERRAL_XP.signup,
    source: "referral",
    multiplier: 1.0,
    description: "Referral signed up!",
    metadata: { referred_email: referredEmail },
  });

  // Update referrer's total XP in profile
  const { data: profile } = await db
    .from("user_profiles")
    .select("id, total_xp")
    .eq("email", referral.referrer_email)
    .single();

  if (profile) {
    await db
      .from("user_profiles")
      .update({ total_xp: (profile.total_xp || 0) + REFERRAL_XP.signup })
      .eq("id", profile.id);
  }

  return REFERRAL_XP.signup;
}

/**
 * Get referrals made by a user
 */
export async function getUserReferrals(email: string): Promise<Referral[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("referrals")
    .select("*")
    .eq("referrer_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching referrals:", error);
    return [];
  }

  return data || [];
}

/**
 * Get referral stats for a user
 */
export async function getUserReferralStats(email: string): Promise<{
  total: number;
  signedUp: number;
  purchased: number;
  totalXpEarned: number;
}> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data, error } = await db
    .from("referrals")
    .select("status, signup_xp_awarded, purchase_xp_awarded")
    .eq("referrer_email", email);

  if (error || !data) {
    return { total: 0, signedUp: 0, purchased: 0, totalXpEarned: 0 };
  }

  const total = data.length;
  const signedUp = data.filter((r: { status: string }) =>
    r.status === "signed_up" || r.status === "purchased"
  ).length;
  const purchased = data.filter((r: { status: string }) => r.status === "purchased").length;
  const totalXpEarned = data.reduce(
    (sum: number, r: { signup_xp_awarded: number; purchase_xp_awarded: number }) =>
      sum + (r.signup_xp_awarded || 0) + (r.purchase_xp_awarded || 0),
    0
  );

  return { total, signedUp, purchased, totalXpEarned };
}

/**
 * Get referral leaderboard
 */
export async function getReferralLeaderboard(limit: number = 10): Promise<ReferralLeaderboardEntry[]> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Get all referrers with their stats
  const { data, error } = await db
    .from("referrals")
    .select("referrer_email, referrer_name, status, signup_xp_awarded, purchase_xp_awarded");

  if (error || !data) {
    return [];
  }

  // Aggregate by referrer
  const leaderboardMap = new Map<string, ReferralLeaderboardEntry>();

  data.forEach((r: {
    referrer_email: string;
    referrer_name?: string;
    status: string;
    signup_xp_awarded: number;
    purchase_xp_awarded: number;
  }) => {
    const existing = leaderboardMap.get(r.referrer_email) || {
      email: r.referrer_email,
      name: r.referrer_name,
      referral_count: 0,
      converted_count: 0,
      total_xp_earned: 0,
    };

    existing.referral_count++;
    if (r.status === "signed_up" || r.status === "purchased") {
      existing.converted_count++;
    }
    existing.total_xp_earned += (r.signup_xp_awarded || 0) + (r.purchase_xp_awarded || 0);

    leaderboardMap.set(r.referrer_email, existing);
  });

  // Sort by converted count, then total XP
  const leaderboard = Array.from(leaderboardMap.values())
    .sort((a, b) => {
      if (b.converted_count !== a.converted_count) {
        return b.converted_count - a.converted_count;
      }
      return b.total_xp_earned - a.total_xp_earned;
    })
    .slice(0, limit);

  // Add ranks
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return leaderboard;
}

/**
 * Get user's referral code (create if doesn't exist)
 */
export async function getUserReferralCode(email: string, name?: string): Promise<string> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  // Check for existing referral code
  const { data: existing } = await db
    .from("referrals")
    .select("referral_code")
    .eq("referrer_email", email)
    .limit(1);

  if (existing && existing.length > 0) {
    return existing[0].referral_code;
  }

  // Generate new code and create placeholder referral
  const code = generateReferralCode();

  await db.from("referrals").insert({
    referrer_email: email,
    referrer_name: name,
    referred_email: "placeholder@pending.com", // Will be updated when someone uses the code
    referral_code: code,
    status: "pending",
    signup_xp_awarded: 0,
    purchase_xp_awarded: 0,
  });

  return code;
}

/**
 * Check if email was referred
 */
export async function checkIfReferred(email: string): Promise<{
  isReferred: boolean;
  referrerEmail?: string;
}> {
  const supabase = createServiceRoleClient();
  const db = getDb(supabase);

  const { data } = await db
    .from("referrals")
    .select("referrer_email")
    .eq("referred_email", email)
    .in("status", ["signed_up", "purchased"])
    .single();

  if (data) {
    return { isReferred: true, referrerEmail: data.referrer_email };
  }

  return { isReferred: false };
}
