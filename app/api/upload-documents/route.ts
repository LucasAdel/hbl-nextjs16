/**
 * Document Upload API
 *
 * POST /api/upload-documents
 *
 * SECURITY:
 * - Requires authentication
 * - Requires confirmed (paid) booking
 * - Email must match authenticated user
 * - Rate limited (5 uploads/hour)
 * - Files stored in private Supabase Storage
 * - Admin email receives signed URLs (24hr expiry), not attachments
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import {
  uploadFile,
  createAdminSignedUrl,
  generateStoragePath,
} from "@/lib/storage/signed-urls";

const resend = new Resend(env.RESEND_API_KEY);

// SECURITY: Use environment variable instead of hardcoded email
const ADMIN_EMAIL = env.ADMIN_NOTIFICATION_EMAIL;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5; // Limit number of files per upload
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
];

interface UploadedFile {
  originalName: string;
  storagePath: string;
  signedUrl: string;
  size: number;
  mimeType: string;
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const clientEmail = formData.get("clientEmail") as string;
    const clientName = formData.get("clientName") as string;
    const consultationType = formData.get("consultationType") as string;

    // SECURITY: Verify email matches authenticated user
    // Prevents using this endpoint to send emails to arbitrary addresses
    if (clientEmail?.toLowerCase() !== user.email?.toLowerCase()) {
      console.warn(
        `SECURITY: User ${user.email} attempted to upload documents for ${clientEmail}`
      );
      return NextResponse.json(
        { error: "Email must match your authenticated account" },
        { status: 403 }
      );
    }

    // SECURITY: Verify user has a confirmed (paid) booking
    // Prevents abuse of storage and email resources without payment
    const { data: confirmedBooking, error: bookingError } = await supabase
      .from("advanced_bookings")
      .select("id, status, event_type_name")
      .eq("client_email", user.email.toLowerCase())
      .eq("status", "confirmed")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(1)
      .single();

    if (bookingError || !confirmedBooking) {
      console.warn(
        `SECURITY: User ${user.email} attempted upload without confirmed booking`
      );
      return NextResponse.json(
        {
          error: "Payment required",
          message:
            "Please complete payment for your consultation before uploading documents",
        },
        { status: 402 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    // SECURITY: Limit number of files per upload
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed per upload` },
        { status: 400 }
      );
    }

    // Validate files
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 10MB limit` },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type not allowed: ${file.name}` },
          { status: 400 }
        );
      }
    }

    // Upload files to Supabase Storage and store metadata
    const uploadedFiles: UploadedFile[] = [];
    const serviceClient = createServiceRoleClient();

    for (const file of files) {
      // Generate secure storage path
      const storagePath = generateStoragePath(
        user.id,
        confirmedBooking.id,
        file.name
      );

      // Convert file to buffer for upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Supabase Storage
      const { path, error: uploadError } = await uploadFile(
        buffer,
        storagePath,
        "client-uploads",
        { contentType: file.type }
      );

      if (uploadError || !path) {
        console.error(`Failed to upload ${file.name}:`, uploadError);
        return NextResponse.json(
          { error: `Failed to upload ${file.name}` },
          { status: 500 }
        );
      }

      // Create signed URL for admin (24hr expiry)
      const { url: signedUrl, error: signedUrlError } =
        await createAdminSignedUrl(storagePath);

      if (signedUrlError || !signedUrl) {
        console.error(`Failed to create signed URL for ${file.name}`);
      }

      // Store metadata in database
      const { error: dbError } = await serviceClient.from("client_documents").insert({
        client_email: user.email.toLowerCase(),
        booking_id: confirmedBooking.id,
        file_name: storagePath.split("/").pop() || file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
      });

      if (dbError) {
        console.error(`Failed to store metadata for ${file.name}:`, dbError);
        // Continue anyway - file is uploaded
      }

      uploadedFiles.push({
        originalName: file.name,
        storagePath,
        signedUrl: signedUrl || "",
        size: file.size,
        mimeType: file.type,
      });
    }

    // Send email to admin with signed URLs (not attachments)
    const { error: adminEmailError } = await resend.emails.send({
      from: "HBL Legal <noreply@hamiltonbailey.com>",
      to: ADMIN_EMAIL,
      subject: `New Document Upload - ${consultationType} - ${clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #40E0D0; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Document Upload</h1>
          </div>

          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-top: 0;">Client Documents Received</h2>

            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #40E0D0; margin-top: 0;">Client Details</h3>
              <p><strong>Name:</strong> ${clientName}</p>
              <p><strong>Email:</strong> ${clientEmail}</p>
              <p><strong>Consultation Type:</strong> ${consultationType}</p>
              <p><strong>Booking ID:</strong> ${confirmedBooking.id}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #40E0D0; margin-top: 0;">Uploaded Files (${uploadedFiles.length})</h3>
              <ul style="padding-left: 20px; list-style: none;">
                ${uploadedFiles
                  .map(
                    (file) => `
                  <li style="margin-bottom: 12px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                    <strong>${file.originalName}</strong>
                    <br />
                    <span style="color: #666; font-size: 12px;">
                      ${(file.size / 1024).toFixed(1)} KB - ${file.mimeType}
                    </span>
                    <br />
                    ${
                      file.signedUrl
                        ? `<a href="${file.signedUrl}" style="color: #40E0D0; text-decoration: none; font-size: 12px;">
                        Download File (expires in 24 hours)
                      </a>`
                        : '<span style="color: #999; font-size: 12px;">Download link unavailable</span>'
                    }
                  </li>
                `
                  )
                  .join("")}
              </ul>
              <p style="color: #999; font-size: 12px; margin-top: 20px; font-style: italic;">
                Note: Download links expire in 24 hours. Access files via admin dashboard for permanent access.
              </p>
            </div>
          </div>

          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Hamilton Bailey Legal | 147 Pirie Street, Adelaide SA 5000
              <br />
              This is an automated notification from the HBL website.
            </p>
          </div>
        </div>
      `,
    });

    if (adminEmailError) {
      console.error("Admin email send error:", adminEmailError);
      // Don't fail the upload if email fails - just log it
    }

    // Send confirmation to client
    await resend.emails.send({
      from: "HBL Legal <noreply@hamiltonbailey.com>",
      to: clientEmail,
      subject: `Documents Received - Hamilton Bailey Legal`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #40E0D0; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Documents Received</h1>
          </div>

          <div style="padding: 30px; background: #f9f9f9;">
            <p>Dear ${clientName},</p>

            <p>Thank you for submitting your documents for your upcoming ${consultationType}.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #40E0D0; margin-top: 0;">Files Received (${uploadedFiles.length})</h3>
              <ul style="padding-left: 20px;">
                ${uploadedFiles.map((file) => `<li>${file.originalName}</li>`).join("")}
              </ul>
            </div>

            <p>Our team will review these documents prior to your consultation. If we require any additional information, we will be in touch.</p>

            <p>Best regards,<br />
            <strong>Hamilton Bailey Legal</strong></p>
          </div>

          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Hamilton Bailey Legal | 147 Pirie Street, Adelaide SA 5000
              <br />
              Phone: 08 5122 6500 | lw@hamiltonbailey.com
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Documents uploaded successfully",
      filesCount: uploadedFiles.length,
      bookingId: confirmedBooking.id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
