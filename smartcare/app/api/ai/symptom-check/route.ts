import { NextRequest, NextResponse } from "next/server";
import { checkSymptoms } from "@/lib/groq";

const rateLimitMap = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now    = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }

  if (record.count >= 10) return true;

  record.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const { symptoms, age, gender } = await req.json();

    if (!symptoms || symptoms.trim().length < 3) {
      return NextResponse.json(
        { error: "Please describe your symptoms in more detail." },
        { status: 400 }
      );
    }

    if (symptoms.length > 1000) {
      return NextResponse.json(
        { error: "Symptom description too long. Maximum 1000 characters." },
        { status: 400 }
      );
    }

    const result = await checkSymptoms(symptoms.trim(), age, gender);

    return NextResponse.json(result);
  } catch (err: unknown) {
        console.error("Symptom check error:", err);

        const message =
            err instanceof Error
            ? err.message
            : "Analysis failed. Please try again.";

        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
  }
}