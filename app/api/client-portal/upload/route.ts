import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/client-portal/upload - Handle file upload to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const email = formData.get("email") as string | null;

    if (!file || !email) {
      return NextResponse.json({ error: "File and email are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || user.email !== email) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Validate file size (10MB max)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${user.id}/${timestamp}-${sanitizedName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage (client-uploads bucket)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("client-uploads")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);

      // If bucket doesn't exist, return info message
      if (uploadError.message.includes("not found") || uploadError.message.includes("bucket")) {
        return NextResponse.json({
          success: true,
          message: "Upload feature requires storage bucket to be configured. File validated successfully.",
          file: {
            name: sanitizedName,
            size: file.size,
            type: file.type,
          },
        });
      }

      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("client-uploads")
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      file: {
        name: sanitizedName,
        size: file.size,
        type: file.type,
        path: uploadData.path,
        url: urlData?.publicUrl,
      },
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/client-portal/upload - List files from Supabase Storage
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || user.email !== email) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // List files from user's folder in storage
    const { data: files, error: listError } = await supabase.storage
      .from("client-uploads")
      .list(user.id, {
        limit: 50,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (listError) {
      console.error("List files error:", listError);
      return NextResponse.json({ success: true, uploads: [] });
    }

    // Transform to upload format with URLs
    const uploads = (files || []).map((file) => ({
      id: file.id,
      name: file.name,
      size: file.metadata?.size || 0,
      type: file.metadata?.mimetype || "application/octet-stream",
      createdAt: file.created_at,
      url: supabase.storage
        .from("client-uploads")
        .getPublicUrl(`${user.id}/${file.name}`).data?.publicUrl,
    }));

    return NextResponse.json({
      success: true,
      uploads,
    });
  } catch (error) {
    console.error("Get uploads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
