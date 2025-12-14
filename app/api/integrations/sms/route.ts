import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendSMS,
  sendTemplatedSMS,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  isValidAustralianMobile,
  parseIncomingSMS,
  SMS_TEMPLATES,
} from "@/lib/integrations/twilio";

// GET /api/integrations/sms - Get SMS templates and status
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

    // Return available templates
    const templates = Object.entries(SMS_TEMPLATES).map(([key, value]) => ({
      id: key,
      type: value.type,
      template: value.template,
      variables: value.variables,
    }));

    return NextResponse.json({
      configured: Boolean(process.env.TWILIO_ACCOUNT_SID),
      templates,
    });
  } catch (error) {
    console.error("SMS API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/integrations/sms - Send SMS notification
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
    const { action, to, message, template, variables } = body;

    // Validate phone number
    if (to && !isValidAustralianMobile(to)) {
      return NextResponse.json(
        { error: "Invalid Australian mobile number" },
        { status: 400 }
      );
    }

    if (action === "send" && to && message) {
      // Send custom SMS
      const result = await sendSMS({ to, body: message });
      return NextResponse.json(result);
    }

    if (action === "send-template" && to && template && variables) {
      // Send templated SMS
      const result = await sendTemplatedSMS(template, to, variables);
      return NextResponse.json(result);
    }

    if (action === "appointment-confirmation") {
      const { phone, clientName, date, time } = body;
      if (!phone || !clientName || !date || !time) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
      const result = await sendAppointmentConfirmation(
        phone,
        clientName,
        date,
        time
      );
      return NextResponse.json(result);
    }

    if (action === "appointment-reminder") {
      const { phone, date, time, location } = body;
      if (!phone || !date || !time || !location) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
      const result = await sendAppointmentReminder(phone, date, time, location);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("SMS send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/integrations/sms/webhook - Handle incoming SMS (Twilio webhook)
export async function PUT(request: NextRequest) {
  try {
    // Verify Twilio signature in production
    const formData = await request.formData();
    const body = {
      From: formData.get("From") as string,
      Body: formData.get("Body") as string,
      MessageSid: formData.get("MessageSid") as string,
    };

    const parsed = parseIncomingSMS(body);

    // Handle different actions
    if (parsed.action === "confirm") {
      // Find and confirm the appointment
      // In production, look up appointment by phone number and update status
    } else if (parsed.action === "cancel") {
      // Find and cancel the appointment
    } else if (parsed.action === "stop") {
      // Opt out user from SMS notifications
    }

    // Return TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thank you for your response. We've recorded it.</Message>
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("SMS webhook error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
