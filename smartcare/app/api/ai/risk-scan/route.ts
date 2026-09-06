import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";
import { scanPatientRisks, type RiskScanInput } from "@/lib/risk";
import { differenceInDays, parseISO } from "date-fns";

export async function GET() {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const db = new Databases(client);
    const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

    const [patientsRes, appointmentsRes] = await Promise.all([
      db.listDocuments(DB, "patients",     [Query.limit(100)]),
      db.listDocuments(DB, "appointments", [Query.orderDesc("date"), Query.limit(500)]),
    ]);

    const patients     = patientsRes.documents;
    const appointments = appointmentsRes.documents;
    const today        = new Date();

    const inputs: RiskScanInput[] = patients.map((p) => {
      const patientAppts = appointments.filter((a) => a.patient_id === p.$id);

      const cancelled  = patientAppts.filter((a) => a.status === "cancelled").length;
      const completed  = patientAppts.filter((a) => a.status === "completed").length;
      const scheduled  = patientAppts.filter((a) => a.status === "scheduled").length;

      const lastAppt   = [...patientAppts].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      const lastVisitDaysAgo = lastAppt
        ? differenceInDays(today, parseISO(lastAppt.date))
        : 999;

      return {
        patient_id:          p.$id,
        patient_name:        p.name,
        age:                 p.age          ?? 0,
        gender:              p.gender       ?? "unknown",
        medical_history:     p.medical_history ?? "",
        total_appointments:  patientAppts.length,
        cancelled,
        completed,
        scheduled,
        last_visit_days_ago: lastVisitDaysAgo,
      };
    });

    if (inputs.length === 0) {
      return NextResponse.json({
        patients: [],
        summary:  { high: 0, medium: 0, low: 0 },
      });
    }

    const results = await scanPatientRisks(inputs);

    const summary = {
      high:   results.filter((r) => r.risk_level === "high").length,
      medium: results.filter((r) => r.risk_level === "medium").length,
      low:    results.filter((r) => r.risk_level === "low").length,
    };

    return NextResponse.json({ patients: results, summary });
  } catch (err: unknown) {
    console.error("Risk scan error:", err);

    return NextResponse.json(
      {
        error: err instanceof Error
           ? err.message
           : "Risk scan failed.",
      },
       { status: 500 }
    );
  }
}