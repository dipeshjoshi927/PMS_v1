import { databases, Query } from "./appwrite";
import { DATABASE_ID, COLLECTIONS } from "./constants";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export interface MonthlyStat {
  month:         string;
  appointments:  number;
  patients:      number;
  prescriptions: number;
}

export interface ReportSummary {
  totalPatients:          number;
  totalAppointments:      number;
  totalPrescriptions:     number;
  todayAppointments:      number;
  completedAppointments:  number;
  cancelledAppointments:  number;
  scheduledAppointments:  number;
  monthly:                MonthlyStat[];
}

export async function getReportSummary(): Promise<ReportSummary> {
  const today = format(new Date(), "yyyy-MM-dd");

  const [patients, appointments, prescriptions, todayAppts] = await Promise.all([
    databases.listDocuments(DATABASE_ID, COLLECTIONS.PATIENTS),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.APPOINTMENTS),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.PRESCRIPTIONS),
    databases.listDocuments(DATABASE_ID, COLLECTIONS.APPOINTMENTS, [
      Query.equal("date", today),
    ]),
  ]);

  const allAppts    = appointments.documents;
  const completed   = allAppts.filter((a) => a.status === "completed").length;
  const cancelled   = allAppts.filter((a) => a.status === "cancelled").length;
  const scheduled   = allAppts.filter((a) => a.status === "scheduled").length;

  const monthly: MonthlyStat[] = [];

  for (let i = 5; i >= 0; i--) {
    const date       = subMonths(new Date(), i);
    const monthLabel = format(date, "MMM yyyy");
    const start      = format(startOfMonth(date), "yyyy-MM-dd");
    const end        = format(endOfMonth(date), "yyyy-MM-dd");
    const yearMonth  = format(date, "yyyy-MM");

    monthly.push({
      month:         monthLabel,
      appointments:  allAppts.filter((a) => a.date >= start && a.date <= end).length,
      patients:      patients.documents.filter((p) => p.$createdAt.slice(0, 7) === yearMonth).length,
      prescriptions: prescriptions.documents.filter((p) => p.date >= start && p.date <= end).length,
    });
  }

  return {
    totalPatients:         patients.total,
    totalAppointments:     appointments.total,
    totalPrescriptions:    prescriptions.total,
    todayAppointments:     todayAppts.total,
    completedAppointments: completed,
    cancelledAppointments: cancelled,
    scheduledAppointments: scheduled,
    monthly,
  };
}