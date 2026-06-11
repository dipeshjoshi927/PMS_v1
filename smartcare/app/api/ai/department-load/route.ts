import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";
import { predictDepartmentLoad } from "@/lib/risk";

export async function GET() {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const db = new Databases(client);
    const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

    const res = await db.listDocuments(DB, "appointments", [
      Query.orderDesc("date"),
      Query.limit(100),
    ]);

    const appointments = res.documents.map((a) => ({
      date:   a.date,
      status: a.status,
      notes:  a.notes ?? "",
    }));

    const predictions = await predictDepartmentLoad(appointments);

    return NextResponse.json({ predictions });
  } catch (err: unknown) {
  console.error("Department load error:", err);

  const message =
    err instanceof Error ? err.message : "Prediction failed.";

  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}
}