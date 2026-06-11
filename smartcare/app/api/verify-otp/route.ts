import { NextRequest, NextResponse } from "next/server";

const otpStore = new Map<string, { code: string; expires: number }>();

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json() as {
      email: string;
      code:  string;
    };

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required." },
        { status: 400 }
      );
    }

    const record = otpStore.get(email);

    if (!record) {
      return NextResponse.json(
        { valid: false, error: "No OTP found. Request a new one." },
        { status: 400 }
      );
    }

    if (Date.now() > record.expires) {
      otpStore.delete(email);
      return NextResponse.json(
        { valid: false, error: "OTP expired. Request a new one." },
        { status: 400 }
      );
    }

    if (record.code !== code.trim()) {
      return NextResponse.json(
        { valid: false, error: "Incorrect code. Try again." },
        { status: 400 }
      );
    }

    otpStore.delete(email);
    return NextResponse.json({ valid: true });
  } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Verification failed.";
    return NextResponse.json(
      { error: message ?? "Verification failed." },
      { status: 500 }
    );
  }
}