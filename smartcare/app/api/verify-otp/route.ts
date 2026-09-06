import { NextRequest, NextResponse } from "next/server";
import { otpStore } from "@/lib/otp-store";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json() as {
      email: string;
      code:  string;
    };

    if (typeof email !== "string" || typeof code !== "string" || !email || !/^\d{6}$/.test(code.trim())) {
      return NextResponse.json(
        { error: "Email and code are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    const record = otpStore.get(normalizedEmail);

    if (!record) {
      return NextResponse.json(
        { valid: false, error: "No OTP found. Request a new one." },
        { status: 400 }
      );
    }

    if (Date.now() > record.expires) {
      otpStore.delete(normalizedEmail);
      return NextResponse.json(
        { valid: false, error: "OTP expired. Request a new one." },
        { status: 400 }
      );
    }

    record.attempts++;
    if (record.attempts > 5) {
      otpStore.delete(normalizedEmail);
      return NextResponse.json(
        { valid: false, error: "Too many attempts. Request a new OTP." },
        { status: 429 }
      );
    }

    if (record.code !== code.trim()) {
      return NextResponse.json(
        { valid: false, error: "Incorrect code. Try again." },
        { status: 400 }
      );
    }

    otpStore.delete(normalizedEmail);
    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json(
      { error: "Verification failed." },
      { status: 500 }
    );
  }
}
