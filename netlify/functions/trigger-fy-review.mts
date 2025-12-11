import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

/**
 * Australian Financial Year Document Review Trigger
 *
 * Runs annually on May 1st to send review reminders to customers who purchased
 * Tenant Doctor or Service Agreements. Reviews should be completed before
 * June 30 (Australian FY end) to ensure agreements reflect any business changes.
 *
 * This aligns with best practice for medical practice legal documents:
 * - Tenant Doctor Service Agreements
 * - Practitioner Service Agreements
 * - Partnership Agreements
 */

export default async (req: Request) => {
  console.log("📅 Triggering Australian FY document review reminders...");

  // Use Netlify.env for environment variables
  const supabaseUrl = Netlify.env.get("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceKey = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase configuration");
    return new Response(
      JSON.stringify({ error: "Missing Supabase configuration" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get current year for tracking
    const currentYear = new Date().getFullYear();
    const fyEndDate = `${currentYear}-06-30`;

    // Find all customers who purchased relevant documents and haven't been
    // enrolled in FY review this year
    const { data: eligibleCustomers, error: fetchError } = await supabase
      .from("purchases")
      .select("email, product_id, product_name, created_at")
      .or(
        "product_name.ilike.%tenant doctor%,product_name.ilike.%service agreement%,product_id.ilike.%tenant-doctor%,product_id.ilike.%service-agreement%"
      )
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching eligible customers:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!eligibleCustomers || eligibleCustomers.length === 0) {
      console.log("No eligible customers for FY review reminders");
      return new Response(
        JSON.stringify({ success: true, enrolled: 0, message: "No eligible customers" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Deduplicate by email (one reminder per customer, not per document)
    const uniqueEmails = [...new Set(eligibleCustomers.map((c) => c.email))];
    console.log(`Found ${uniqueEmails.length} unique customers with relevant documents`);

    let enrolled = 0;
    let skipped = 0;

    for (const email of uniqueEmails) {
      // Check if already enrolled in FY review this year
      const { data: existingEnrollment } = await supabase
        .from("email_sequence_enrollments")
        .select("id")
        .eq("email", email)
        .eq("sequence_type", "financial_year_review")
        .gte("created_at", `${currentYear}-01-01`)
        .limit(1);

      if (existingEnrollment && existingEnrollment.length > 0) {
        skipped++;
        continue;
      }

      // Enroll in FY review sequence
      const { error: enrollError } = await supabase
        .from("email_sequence_enrollments")
        .insert({
          email,
          sequence_type: "financial_year_review",
          current_step: 1,
          status: "active",
          next_email_at: new Date().toISOString(), // Send immediately
          metadata: {
            fy_year: currentYear,
            fy_end_date: fyEndDate,
            trigger: "annual_may_schedule",
          },
        });

      if (enrollError) {
        console.error(`Error enrolling ${email}:`, enrollError);
        continue;
      }

      enrolled++;
    }

    console.log(
      `✅ FY Review: Enrolled ${enrolled} customers, skipped ${skipped} (already enrolled this year)`
    );

    return new Response(
      JSON.stringify({
        success: true,
        enrolled,
        skipped,
        totalEligible: uniqueEmails.length,
        fyYear: currentYear,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("FY review trigger error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to trigger FY review reminders" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Netlify scheduled function configuration
// Runs annually on May 1st at 9:00 AM ACST (Adelaide time)
// Cron: minute hour day-of-month month day-of-week
// May 1st = month 5, day 1
// 9:00 AM ACST = 23:30 UTC previous day (April 30) due to UTC+9:30 offset
// Using May 1 00:00 UTC to be safe (early morning May 1 in Adelaide)
export const config: Config = {
  schedule: "0 0 1 5 *", // May 1st at midnight UTC (9:30 AM ACST)
};
