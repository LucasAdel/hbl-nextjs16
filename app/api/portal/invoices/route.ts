import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

// Helper to get untyped access for new tables not yet in types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUntypedClient(supabase: SupabaseClient): any {
  return supabase;
}

interface Invoice {
  total_amount: number;
  status: string;
  due_date: string;
}

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
    const db = getUntypedClient(supabase);

    // Get all invoices for this client
    const { data: invoices, error } = await db
      .from("client_invoices")
      .select("*")
      .eq("client_email", email.toLowerCase())
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
      stats.total += invoice.total_amount;

      if (invoice.status === "paid") {
        stats.paid += invoice.total_amount;
      } else if (["sent", "viewed", "overdue"].includes(invoice.status)) {
        stats.outstanding += invoice.total_amount;

        if (new Date(invoice.due_date) < now) {
          stats.overdue += invoice.total_amount;
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId, action, paymentMethod } = body;

    if (!invoiceId || !action) {
      return NextResponse.json(
        { error: "Invoice ID and action required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const db = getUntypedClient(supabase);

    if (action === "mark_paid") {
      const { error } = await db
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
      const { error } = await db
        .from("client_invoices")
        .update({
          status: "viewed",
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

export async function POST(request: NextRequest) {
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
    const db = getUntypedClient(supabase);

    const totalAmount = amount + (taxAmount || amount * 0.1);

    const { data: invoice, error } = await db
      .from("client_invoices")
      .insert({
        client_email: clientEmail.toLowerCase(),
        matter_id: matterId || null,
        matter_name: matterName || null,
        invoice_number: invoiceNumber,
        amount,
        tax_amount: taxAmount || amount * 0.1,
        total_amount: totalAmount,
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
