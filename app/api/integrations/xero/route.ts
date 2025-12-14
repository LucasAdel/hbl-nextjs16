import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getXeroAuthUrl,
  exchangeCodeForTokens,
  createInvoiceFromBooking,
  getOrganisation,
  saveXeroTokens,
  getValidXeroTokens,
  hasXeroIntegration,
} from "@/lib/integrations/xero";

// GET /api/integrations/xero - Get auth URL or connection status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    if (action === "auth") {
      // Generate OAuth URL
      const state = user.id;
      const authUrl = getXeroAuthUrl(state);
      return NextResponse.json({ authUrl });
    }

    // Check connection status from database
    const userEmail = user.email;
    if (!userEmail) {
      return NextResponse.json({
        connected: false,
        message: "User email not available",
      });
    }

    const isConnected = await hasXeroIntegration(userEmail);

    if (isConnected) {
      // Get org info if connected
      const tokens = await getValidXeroTokens(userEmail);
      if (tokens) {
        const org = await getOrganisation(tokens.accessToken, tokens.tenantId);
        return NextResponse.json({
          connected: true,
          organisation: org.success ? org.data : null,
        });
      }
    }

    return NextResponse.json({
      connected: false,
      message: "Xero integration ready",
    });
  } catch (error) {
    console.error("Xero API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/integrations/xero - Handle callback or create invoice
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const body = await request.json();
    const { action, code, booking } = body;

    if (action === "callback" && code) {
      // Exchange authorization code for tokens
      try {
        const userEmail = user.email;
        if (!userEmail) {
          return NextResponse.json(
            { error: "User email not available" },
            { status: 400 }
          );
        }

        const tokens = await exchangeCodeForTokens(code);

        // Get organisation info to verify connection
        const org = await getOrganisation(tokens.accessToken, tokens.tenantId);

        // Save tokens to database
        await saveXeroTokens(userEmail, tokens);

        return NextResponse.json({
          success: true,
          message: "Xero connected successfully",
          organisation: org.success ? org.data : null,
        });
      } catch (error) {
        console.error("Xero connect error:", error instanceof Error ? error.message : error);
        return NextResponse.json(
          { error: "Failed to connect Xero" },
          { status: 400 }
        );
      }
    }

    if (action === "create-invoice" && booking) {
      const userEmail = user.email;
      if (!userEmail) {
        return NextResponse.json(
          { error: "User email not available" },
          { status: 400 }
        );
      }

      // Retrieve tokens from database (auto-refreshes if needed)
      const tokens = await getValidXeroTokens(userEmail);

      if (!tokens) {
        return NextResponse.json({
          success: false,
          message: "Xero not connected. Please connect Xero first.",
          requiresConnection: true,
        });
      }

      // Create invoice in Xero
      const result = await createInvoiceFromBooking(
        tokens.accessToken,
        tokens.tenantId,
        {
          clientEmail: booking.clientEmail,
          clientName: booking.clientName,
          service: booking.service,
          amount: booking.amount,
          reference: booking.reference,
          dueDate: booking.dueDate,
        }
      );

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: "Invoice created in Xero",
          invoice: result.data,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error || "Failed to create invoice",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Xero API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
