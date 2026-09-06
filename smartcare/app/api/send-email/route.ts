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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_TYPES = new Set([
  "appointment_confirmation",
  "appointment_cancelled",
  "prescription",
  "welcome",
  "risk_alert",
  "clinic_summary",
]);
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function isRateLimited(req: NextRequest): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now >= record.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  if (record.count >= 10) return true;
  record.count++;
  return false;
}

function isSameOrigin(req: NextRequest): boolean {
  return req.headers.get("origin") === req.nextUrl.origin;
}

function isText(value: unknown, maxLength = 2_000): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

function isTextList(value: unknown, maxItems = 20): value is string[] {
  return Array.isArray(value) && value.length <= maxItems && value.every((item) => isText(item));
}

function hasValidTemplateData(type: string, value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;

  switch (type) {
    case "appointment_confirmation":
      return isText(data.patientName) && isText(data.date, 20) && isText(data.time, 20) &&
        (data.notes === undefined || isText(data.notes));
    case "appointment_cancelled":
      return isText(data.patientName) && isText(data.date, 20) && isText(data.time, 20);
    case "prescription":
      return isText(data.patientName) && isText(data.date, 20) && isText(data.medications) &&
        (data.instructions === undefined || isText(data.instructions));
    case "welcome":
      return isText(data.name) && ["admin", "doctor", "receptionist"].includes(String(data.role));
    case "risk_alert":
      return isText(data.patientName) && typeof data.riskScore === "number" &&
        Number.isFinite(data.riskScore) && data.riskScore >= 0 && data.riskScore <= 100 &&
        ["high", "medium", "low"].includes(String(data.riskLevel)) &&
        isTextList(data.riskFactors, 10) && isText(data.recommendation);
    case "clinic_summary":
      return isText(data.period, 100) && isText(data.overview) &&
        isTextList(data.patientInsights) && isTextList(data.apptStats) &&
        isTextList(data.healthTrends) && isTextList(data.recommendations) && isTextList(data.alerts);
    default:
      return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, to, data } = await req.json();

    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    if (isRateLimited(req)) {
      return NextResponse.json({ error: "Too many email requests. Please wait a minute." }, { status: 429 });
    }

    if (typeof to !== "string" || !EMAIL_PATTERN.test(to) || typeof type !== "string" ||
      !EMAIL_TYPES.has(type) || !hasValidTemplateData(type, data)) {
      return NextResponse.json(
        { error: "Invalid email request." },
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
        { error: "Failed to send email." },
        { status: 500 }
      );
  }
}
