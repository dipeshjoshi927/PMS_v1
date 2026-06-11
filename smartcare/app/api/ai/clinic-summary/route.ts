import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";
import { generateClinicSummary } from "@/lib/groq";
import { format, startOfMonth, endOfMonth } from "date-fns";

export async function GET() {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const db  = new Databases(client);
    const DB  = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const now = new Date();

    const monthStart     = format(startOfMonth(now), "yyyy-MM-dd");
    const monthEnd       = format(endOfMonth(now), "yyyy-MM-dd");

    const [
      allPatients,
      allAppointments,
      allPrescriptions,
      thisMonthPatients,
    ] = await Promise.all([
      db.listDocuments(DB, "patients",      [Query.limit(500)]),
      db.listDocuments(DB, "appointments",  [Query.limit(500)]),
      db.listDocuments(DB, "prescriptions", [Query.limit(500)]),
      db.listDocuments(DB, "patients", [
        Query.greaterThanEqual("$createdAt", monthStart),
        Query.lessThanEqual("$createdAt", monthEnd),
      ]),
    ]);

    const appointments = allAppointments.documents;
    const patients     = allPatients.documents;

    const completed = appointments.filter((a) => a.status === "completed").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;
    const scheduled = appointments.filter((a) => a.status === "scheduled").length;

    const ageGroups = [
      { range: "0-17",  count: patients.filter((p) => p.age <= 17).length },
      { range: "18-35", count: patients.filter((p) => p.age >= 18 && p.age <= 35).length },
      { range: "36-55", count: patients.filter((p) => p.age >= 36 && p.age <= 55).length },
      { range: "56-70", count: patients.filter((p) => p.age >= 56 && p.age <= 70).length },
      { range: "71+",   count: patients.filter((p) => p.age >= 71).length },
    ];

    const allHistory = patients
      .map((p) => p.medical_history ?? "")
      .join(" ")
      .toLowerCase();

    const knownConditions = [
      "diabetes", "hypertension", "asthma", "heart disease",
      "arthritis", "depression", "anxiety", "cancer", "thyroid",
    ];

    const commonConditions = knownConditions
      .filter((c) => allHistory.includes(c))
      .slice(0, 5);

    const allNotes    = appointments.map((a) => a.notes ?? "").join(" ").toLowerCase();
    const departments = [
      "cardiology", "orthopedics", "pediatrics",
      "neurology", "general medicine", "emergency",
    ];
    const topDepartments = departments
      .filter((d) => allNotes.includes(d))
      .slice(0, 3);

    const summary = await generateClinicSummary({
      totalPatients:        allPatients.total,
      newPatientsThisMonth: thisMonthPatients.total,
      totalAppointments:    allAppointments.total,
      completedAppts:       completed,
      cancelledAppts:       cancelled,
      scheduledAppts:       scheduled,
      totalPrescriptions:   allPrescriptions.total,
      commonConditions:     commonConditions.length > 0 ? commonConditions : ["General"],
      ageGroups,
      topDepartments:       topDepartments.length > 0 ? topDepartments : ["General Medicine"],
    });

    return NextResponse.json({ summary });
  } catch (err: unknown) {
    console.error("Clinic summary error:", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to generate summary.",
      },
      { status: 500 }
    );
  }
}
