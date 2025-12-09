import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = "lw@hamiltonbailey.com";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/png",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const clientEmail = formData.get("clientEmail") as string;
    const clientName = formData.get("clientName") as string;
    const consultationType = formData.get("consultationType") as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
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

    // Convert files to base64 attachments for email
    const attachments = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        return {
          filename: file.name,
          content: buffer,
        };
      })
    );

    // Send email to admin with attachments
    const { data, error } = await resend.emails.send({
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
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #40E0D0; margin-top: 0;">Uploaded Files (${files.length})</h3>
              <ul style="padding-left: 20px;">
                ${files.map((file) => `
                  <li style="margin-bottom: 8px;">
                    <strong>${file.name}</strong>
                    <br />
                    <span style="color: #666; font-size: 12px;">
                      ${(file.size / 1024).toFixed(1)} KB - ${file.type}
                    </span>
                  </li>
                `).join("")}
              </ul>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Documents are attached to this email for your review.
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
      attachments,
    });

    if (error) {
      console.error("Email send error:", error);
      // Don't fail the upload if email fails - just log it
    }

    // Also send confirmation to client
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
              <h3 style="color: #40E0D0; margin-top: 0;">Files Received (${files.length})</h3>
              <ul style="padding-left: 20px;">
                ${files.map((file) => `<li>${file.name}</li>`).join("")}
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
      message: "Documents uploaded and sent successfully",
      filesCount: files.length,
      fileUrls: files.map((f) => f.name), // Return file names as reference
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
