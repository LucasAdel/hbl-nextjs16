import type { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  console.log("🧪 Testing Netlify environment...");

  try {
    const supabaseUrl = Netlify.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const hasServiceKey = !!Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Environment check passed",
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey,
        supabaseUrlPrefix: supabaseUrl?.substring(0, 30) || "not set",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Test error:", errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config: Config = {
  path: "/api/test-env"
};
