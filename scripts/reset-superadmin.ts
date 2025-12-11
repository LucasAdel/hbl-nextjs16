/**
 * Reset superadmin password
 * Run with: npx tsx scripts/reset-superadmin.ts
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
const SITE_URL = "https://hbl-law-staging.netlify.app";

async function main() {
  console.log("🔍 Looking up superadmin:", SUPERADMIN_EMAIL);
  console.log("");

  // Find the user
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
    console.error("❌ User not found:", SUPERADMIN_EMAIL);
    process.exit(1);
  }

  console.log("✅ User found!");
  console.log("   ID:", user.id);
  console.log("   Email:", user.email);
  console.log("   Current Role:", user.user_metadata?.role);
  console.log("");

  // Ensure user has super_admin role
  if (user.user_metadata?.role !== "super_admin") {
    console.log("⚠️  Restoring super_admin role...");

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          role: "super_admin",
        },
      }
    );

    if (updateError) {
      console.error("❌ Failed to update role:", updateError.message);
    } else {
      console.log("✅ Role restored to super_admin");
    }
    console.log("");
  }

  // Generate password reset link with correct redirect
  console.log("🔑 Generating password reset link...");

  const { data: linkData, error: linkError } =
    await supabase.auth.admin.generateLink({
      type: "recovery",
      email: SUPERADMIN_EMAIL,
      options: {
        redirectTo: `${SITE_URL}/auth/callback`,
      },
    });

  if (linkError) {
    console.error("❌ Failed to generate reset link:", linkError.message);
    process.exit(1);
  }

  // Fix the redirect URL in the link
  let resetLink = linkData.properties?.action_link || "";
  // Replace localhost with production URL
  resetLink = resetLink.replace(
    "redirect_to=http://localhost:3000",
    `redirect_to=${encodeURIComponent(SITE_URL + "/auth/callback")}`
  );
  resetLink = resetLink.replace(
    "redirect_to=http%3A%2F%2Flocalhost%3A3000",
    `redirect_to=${encodeURIComponent(SITE_URL + "/auth/callback")}`
  );

  console.log("✅ Password reset link generated!");
  console.log("");
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║ 📧 PASSWORD RESET LINK FOR lw@hamiltonbailey.com               ║");
  console.log("╠════════════════════════════════════════════════════════════════╣");
  console.log("║                                                                ║");
  console.log(`${resetLink}`);
  console.log("║                                                                ║");
  console.log("╠════════════════════════════════════════════════════════════════╣");
  console.log("║ ⏰ This link expires in 24 hours                               ║");
  console.log("║ 🔒 Click to set a new password                                 ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log("");
  console.log("After resetting, you can login at:");
  console.log(`  ${SITE_URL}/login`);
}

main().catch(console.error);
