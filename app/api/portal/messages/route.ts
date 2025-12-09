import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limiter";
import { SupabaseClient } from "@supabase/supabase-js";

// Helper to get untyped access for new tables not yet in types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUntypedClient(supabase: SupabaseClient): any {
  return supabase;
}

// Rate limit for messages
const MESSAGES_RATE_LIMIT = {
  maxRequests: 30,
  windowMs: 60000,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const matterId = searchParams.get("matterId");

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const db = getUntypedClient(supabase);

    let query = db
      .from("client_messages")
      .select("*")
      .eq("client_email", email.toLowerCase())
      .order("created_at", { ascending: true });

    if (matterId) {
      query = query.eq("matter_id", matterId);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`portal-messages-${clientId}`, MESSAGES_RATE_LIMIT);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;
    const matterId = formData.get("matterId") as string | null;
    const attachment = formData.get("attachment") as File | null;

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const db = getUntypedClient(supabase);

    // Handle file upload if present
    let attachmentUrl: string | null = null;
    let attachmentName: string | null = null;

    if (attachment) {
      const fileName = `${Date.now()}-${attachment.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("client-attachments")
        .upload(`messages/${email}/${fileName}`, attachment);

      if (uploadError) {
        console.error("Upload error:", uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from("client-attachments")
          .getPublicUrl(uploadData.path);
        attachmentUrl = urlData.publicUrl;
        attachmentName = attachment.name;
      }
    }

    // Insert message
    const { data: newMessage, error } = await db
      .from("client_messages")
      .insert({
        client_email: email.toLowerCase(),
        matter_id: matterId || null,
        sender_type: "client",
        sender_name: email.split("@")[0],
        message,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting message:", error);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, messageIds } = body;

    if (action === "mark_read" && messageIds?.length > 0) {
      const supabase = await createClient();
      const db = getUntypedClient(supabase);

      await db
        .from("client_messages")
        .update({ is_read: true })
        .in("id", messageIds);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Message update error:", error);
    return NextResponse.json(
      { error: "Failed to update messages" },
      { status: 500 }
    );
  }
}
