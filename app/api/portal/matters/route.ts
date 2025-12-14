import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Query client_matters table
    const { data: matters, error } = await supabase
      .from("client_matters")
      .select("*")
      .eq("client_email", email.toLowerCase())
      .order("created_at", { ascending: false });

    if (error) {
      // Table might not exist yet - return empty array
      console.error("Error fetching matters:", error);
      return NextResponse.json({ matters: [] });
    }

    return NextResponse.json({ matters: matters || [] });
  } catch (error) {
    console.error("Matters fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch matters" },
      { status: 500 }
    );
  }
}
