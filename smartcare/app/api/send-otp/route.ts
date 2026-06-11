import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { otpEmail } from "@/lib/email";

const otpStore = new Map<string, { code: string; expires: number }>();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json() as {
      email: string;
      name?: string;
    };

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const code    = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, { code, expires });

    const { subject, html } = otpEmail({ name: name ?? "User", otp: code });

    await transporter.sendMail({
      from:    `SmartCare <${process.env.GMAIL_USER}>`,
      to:      email,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
      console.error("OTP error:", err);
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Failed to send OTP.",
        },
        { status: 500 }
      );
    }
}

export { otpStore };