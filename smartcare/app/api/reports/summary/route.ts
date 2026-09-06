import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export async function GET() {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const db    = new Databases(client);
    const DB    = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const today = format(new Date(), "yyyy-MM-dd");

    const [patients, appointments, prescriptions, todayAppts] = await Promise.all([
      db.listDocuments(DB, "patients",      [Query.limit(500)]),
      db.listDocuments(DB, "appointments",  [Query.limit(500)]),
      db.listDocuments(DB, "prescriptions", [Query.limit(500)]),
      db.listDocuments(DB, "appointments",  [
        Query.equal("date", today),
        Query.limit(100),
      ]),
    ]);

    const allAppts  = appointments.documents;
    const completed = allAppts.filter((a) => a.status === "completed").length;
    const cancelled = allAppts.filter((a) => a.status === "cancelled").length;
    const scheduled = allAppts.filter((a) => a.status === "scheduled").length;

    const monthly = [];

    for (let i = 5; i >= 0; i--) {
      const date      = subMonths(new Date(), i);
      const start     = format(startOfMonth(date), "yyyy-MM-dd");
      const end       = format(endOfMonth(date),   "yyyy-MM-dd");
      const yearMonth = format(date, "yyyy-MM");

      monthly.push({
        month:         format(date, "MMM yyyy"),
        appointments:  allAppts.filter(
          (a) => a.date >= start && a.date <= end
        ).length,
        patients:      patients.documents.filter(
          (p) => p.$createdAt.slice(0, 7) === yearMonth
        ).length,
        prescriptions: prescriptions.documents.filter(
          (p) => p.date >= start && p.date <= end
        ).length,
      });
    }

    return NextResponse.json({
      totalPatients:         patients.total,
      totalAppointments:     appointments.total,
      totalPrescriptions:    prescriptions.total,
      todayAppointments:     todayAppts.total,
      completedAppointments: completed,
      cancelledAppointments: cancelled,
      scheduledAppointments: scheduled,
      monthly,
    });

  } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch report.";
        
    return NextResponse.json(
      { error: message ?? "Failed to fetch report." },
      { status: 500 }
    );
  }
}