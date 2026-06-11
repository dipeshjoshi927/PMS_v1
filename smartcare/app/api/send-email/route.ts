import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  appointmentConfirmationEmail,
  appointmentCancelledEmail,
  prescriptionEmail,
  welcomeEmail,
  riskAlertEmail,
  clinicSummaryEmail,
} from "@/lib/email";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { type, to, data } = await req.json();

    if (!to) {
      return NextResponse.json(
        { error: "Recipient email (to) is required." },
        { status: 400 }
      );
    }

    let subject = "";
    let html    = "";

    switch (type) {
      case "appointment_confirmation":
        ({ subject, html } = appointmentConfirmationEmail(data));
        break;
      case "appointment_cancelled":
        ({ subject, html } = appointmentCancelledEmail(data));
        break;
      case "prescription":
        ({ subject, html } = prescriptionEmail(data));
        break;
      case "welcome":
        ({ subject, html } = welcomeEmail(data));
        break;
      case "custom":
        subject = data.subject;
        html    = data.html;
        break;
      case "risk_alert":
        ({ subject, html } = riskAlertEmail(data));
        break;
      case "clinic_summary":
        ({ subject, html } = clinicSummaryEmail(data));
        break;
      default:
        return NextResponse.json(
          { error: "Invalid email type." },
          { status: 400 }
        );
    }

    await transporter.sendMail({
      from:    `SmartCare <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
      console.error("Email error:", err);

      return NextResponse.json(
        {
          error: err instanceof Error
            ? err.message
            : "Failed to send email.",
        },
        { status: 500 }
      );
  }
}