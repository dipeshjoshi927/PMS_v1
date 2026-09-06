import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomInt } from "crypto";
import { otpEmail } from "@/lib/email";
import { otpStore } from "@/lib/otp-store";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function generateOTP(): string {
  return randomInt(100000, 1_000_000).toString();
}

function isRateLimited(req: NextRequest): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now >= record.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 10 * 60_000 });
    return false;
  }
  if (record.count >= 5) return true;
  record.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json() as {
      email: string;
      name?: string;
    };

    if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (isRateLimited(req)) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again later." },
        { status: 429 }
      );
    }

    const code    = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000;

    otpStore.set(email.toLowerCase(), { code, expires, attempts: 0 });

    const { subject, html } = otpEmail({ name: name ?? "User", otp: code });

    await transporter.sendMail({
      from:    `SmartCare <${process.env.GMAIL_USER}>`,
      to:      email.toLowerCase(),
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
      console.error("OTP error:", err);
      return NextResponse.json(
        {
          error:
          "Failed to send OTP.",
        },
        { status: 500 }
      );
    }
}
