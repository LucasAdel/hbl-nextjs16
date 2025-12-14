import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePortalOrAdminAuth } from "@/lib/auth/portal-auth";
import { requireAdminAuth } from "@/lib/auth/admin-auth";

interface Invoice {
  amount: number;
  status: string;
  due_date: string | null;
}

/**
 * GET /api/portal/invoices
 * Get invoices for a client
 * SECURITY: Requires authentication. Users can only view their own invoices.
 * Admins can view any user's invoices.
 */
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

    // SECURITY: Verify user is authenticated and authorized
    const authResult = await requirePortalOrAdminAuth(email);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // Use verified email for query (admin can query any email, users only their own)
    const queryEmail = authResult.user.isAdmin ? email : authResult.user.email;

    const supabase = await createClient();

    // Get all invoices for this client
    const { data: invoices, error } = await supabase
      .from("client_invoices")
      .select("*")
      .eq("email", queryEmail.toLowerCase())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invoices:", error);
      return NextResponse.json(
        { error: "Failed to fetch invoices" },
        { status: 500 }
      );
    }

    // Calculate stats
    const stats = {
      total: 0,
      paid: 0,
      outstanding: 0,
      overdue: 0,
    };

    const now = new Date();

    for (const invoice of (invoices as Invoice[]) || []) {
      stats.total += invoice.amount;

      if (invoice.status === "paid") {
        stats.paid += invoice.amount;
      } else if (["sent", "overdue"].includes(invoice.status)) {
        stats.outstanding += invoice.amount;

        if (invoice.due_date && new Date(invoice.due_date) < now) {
          stats.overdue += invoice.amount;
        }
      }
    }

    return NextResponse.json({
      invoices: invoices || [],
      stats,
    });
  } catch (error) {
    console.error("Invoices fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/portal/invoices
 * Update invoice status (mark as paid, viewed)
 * SECURITY: Requires authentication. Users can only update their own invoices.
 * Admins can update any invoice.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, action, paymentMethod, clientEmail } = body;

    if (!invoiceId || !action) {
      return NextResponse.json(
        { error: "Invoice ID and action required" },
        { status: 400 }
      );
    }

    // SECURITY: Verify user is authenticated
    const authResult = await requirePortalOrAdminAuth(clientEmail);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const supabase = await createClient();

    // SECURITY: For non-admins, verify the invoice belongs to them
    if (!authResult.user.isAdmin) {
      const { data: invoice } = await supabase
        .from("client_invoices")
        .select("email")
        .eq("id", invoiceId)
        .single();

      if (!invoice || invoice.email.toLowerCase() !== authResult.user.email.toLowerCase()) {
        console.warn(`SECURITY: User ${authResult.user.email} attempted to modify invoice ${invoiceId} belonging to another user`);
        return NextResponse.json(
          { error: "Forbidden - You can only update your own invoices" },
          { status: 403 }
        );
      }
    }

    if (action === "mark_paid") {
      const { error } = await supabase
        .from("client_invoices")
        .update({
          status: "paid",
          paid_date: new Date().toISOString(),
          payment_method: paymentMethod || "online",
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId);

      if (error) {
        console.error("Error updating invoice:", error);
        return NextResponse.json(
          { error: "Failed to update invoice" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (action === "mark_viewed") {
      // Just update the timestamp to track when invoice was viewed
      // Status remains the same since "viewed" is not a valid status
      const { error } = await supabase
        .from("client_invoices")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId)
        .eq("status", "sent");

      if (error) {
        console.error("Error updating invoice:", error);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Invoice update error:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portal/invoices
 * Create a new invoice
 * SECURITY: Admin only - only staff/admins can create invoices
 */
export async function POST(request: NextRequest) {
  // SECURITY: Only admins can create invoices
  const authResult = await requireAdminAuth();
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const {
      clientEmail,
      matterId,
      matterName,
      invoiceNumber,
      amount,
      taxAmount,
      dueDate,
      description,
    } = body;

    if (!clientEmail || !invoiceNumber || !amount) {
      return NextResponse.json(
        { error: "Client email, invoice number, and amount required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const totalAmount = amount + (taxAmount || amount * 0.1);

    const { data: invoice, error } = await supabase
      .from("client_invoices")
      .insert({
        email: clientEmail.toLowerCase(),
        matter_id: matterId || null,
        invoice_number: invoiceNumber,
        amount,
        status: "sent",
        due_date: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating invoice:", error);
      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("Invoice creation error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
