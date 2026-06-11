import { databases, ID, Query } from "./appwrite";
import { DATABASE_ID, COLLECTIONS } from "./constants";
import type { Appointment, AppointmentStatus } from "@/types";
import { format } from "date-fns";

export async function getAppointments(): Promise<Appointment[]> {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.APPOINTMENTS,
    [Query.orderDesc("date")]
  );
  return res.documents as unknown as Appointment[];
}

export async function getAppointment(id: string): Promise<Appointment> {
  const doc = await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.APPOINTMENTS,
    id
  );
  return doc as unknown as Appointment;
}

export async function getTodayAppointments(): Promise<Appointment[]> {
  const today = format(new Date(), "yyyy-MM-dd");
  const res   = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.APPOINTMENTS,
    [
      Query.equal("date", today),
      Query.orderAsc("time"),
    ]
  );
  return res.documents as unknown as Appointment[];
}

export async function createAppointment(
  data: Omit<Appointment, "$id" | "$createdAt" | "$updatedAt">
): Promise<Appointment> {
  const doc = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.APPOINTMENTS,
    ID.unique(),
    data
  );
  return doc as unknown as Appointment;
}

export async function updateAppointment(
  id: string,
  data: Partial<Omit<Appointment, "$id" | "$createdAt" | "$updatedAt">>
): Promise<Appointment> {
  const doc = await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.APPOINTMENTS,
    id,
    data
  );
  return doc as unknown as Appointment;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<Appointment> {
  const doc = await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.APPOINTMENTS,
    id,
    { status }
  );
  return doc as unknown as Appointment;
}

export async function deleteAppointment(id: string): Promise<void> {
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.APPOINTMENTS, id);
}

export async function getPatientAppointments(
  patientId: string
): Promise<Appointment[]> {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.APPOINTMENTS,
    [
      Query.equal("patient_id", patientId),
      Query.orderDesc("date"),
    ]
  );
  return res.documents as unknown as Appointment[];
}