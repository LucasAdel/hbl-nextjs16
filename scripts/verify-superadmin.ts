/**
 * Verify and configure superadmin user
 * Run with: npx tsx scripts/verify-superadmin.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const SUPERADMIN_EMAIL = "lw@hamiltonbailey.com";

async function main() {
  console.log("🔍 Checking superadmin user:", SUPERADMIN_EMAIL);
  console.log("");

  // List all users and find the superadmin
  const { data: usersData, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("❌ Failed to list users:", listError.message);
    process.exit(1);
  }

  const user = usersData.users.find(
    (u) => u.email?.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
  );

  if (!user) {
    console.log("❌ User not found:", SUPERADMIN_EMAIL);
    console.log("");
    console.log("Creating superadmin user...");

    // Create the user with a temporary password
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: SUPERADMIN_EMAIL,
        email_confirm: true,
        user_metadata: {
          role: "admin",
          first_name: "Lawrence",
          last_name: "Wang",
        },
      });

    if (createError) {
      console.error("❌ Failed to create user:", createError.message);
      process.exit(1);
    }

    console.log("✅ Created superadmin user:", newUser.user.id);
    console.log("");
    console.log("🔑 Generating password reset link...");

    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "recovery",
        email: SUPERADMIN_EMAIL,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hbl-law-staging.netlify.app"}/auth/callback`,
        },
      });

    if (linkError) {
      console.error("❌ Failed to generate reset link:", linkError.message);
    } else {
      console.log("✅ Password reset link generated!");
      console.log("");
      console.log("📧 Reset Link:");
      console.log(linkData.properties?.action_link);
    }
    return;
  }

  console.log("✅ User found!");
  console.log("   ID:", user.id);
  console.log("   Email:", user.email);
  console.log("   Role:", user.user_metadata?.role || "NO ROLE SET");
  console.log("   Created:", user.created_at);
  console.log("   Last Sign In:", user.last_sign_in_at || "Never");
  console.log("   Email Confirmed:", user.email_confirmed_at ? "Yes" : "No");
  console.log("");

  // Check if role is admin or super_admin
  const userRole = user.user_metadata?.role;
  const validAdminRoles = ["admin", "super_admin", "staff"];

  if (!validAdminRoles.includes(userRole)) {
    console.log("⚠️  User does not have admin role. Updating to super_admin...");

    const { data: updatedUser, error: updateError } =
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          role: "super_admin",
        },
      });

    if (updateError) {
      console.error("❌ Failed to update role:", updateError.message);
    } else {
      console.log("✅ Updated user role to super_admin");
    }
  } else {
    console.log("✅ User has valid admin role:", userRole);
  }

  // Generate a password reset link
  console.log("");
  console.log("🔑 Generating password reset link...");

  const { data: linkData, error: linkError } =
    await supabase.auth.admin.generateLink({
      type: "recovery",
      email: SUPERADMIN_EMAIL,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hbl-law-staging.netlify.app"}/auth/callback`,
      },
    });

  if (linkError) {
    console.error("❌ Failed to generate reset link:", linkError.message);
    process.exit(1);
  }

  console.log("✅ Password reset link generated!");
  console.log("");
  console.log("========================================");
  console.log("📧 PASSWORD RESET LINK:");
  console.log("========================================");
  console.log(linkData.properties?.action_link);
  console.log("========================================");
  console.log("");
  console.log("⏰ This link expires in 24 hours");
  console.log("🔒 Click the link to set a new password");
}

main().catch(console.error);
