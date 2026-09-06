import { databases, ID, Query } from "./appwrite";
import { DATABASE_ID, COLLECTIONS } from "./constants";
import type { Patient } from "@/types";
import { normalizeNepalPhone, validatePatient } from "./validation";

export async function getPatients(): Promise<Patient[]> {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.PATIENTS,
    [Query.orderDesc("$createdAt")]
  );
  return res.documents as unknown as Patient[];
}

export async function getPatient(id: string): Promise<Patient> {
  const doc = await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.PATIENTS,
    id
  );
  return doc as unknown as Patient;
}

export async function createPatient(
  data: Omit<Patient, "$id" | "$createdAt" | "$updatedAt">
): Promise<Patient> {
  const normalized = { ...data, phone: normalizeNepalPhone(data.phone) };
  validatePatient(normalized);
  const doc = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.PATIENTS,
    ID.unique(),
    normalized
  );
  return doc as unknown as Patient;
}

export async function updatePatient(
  id: string,
  data: Partial<Omit<Patient, "$id" | "$createdAt" | "$updatedAt">>
): Promise<Patient> {
  if (data.age !== undefined && (!Number.isInteger(data.age) || data.age < 0 || data.age > 150)) {
    throw new Error("Age must be a whole number between 0 and 150.");
  }
  if (data.phone !== undefined) {
    const phone = normalizeNepalPhone(data.phone);
    if (!/^\+977\d{10}$/.test(phone)) {
      throw new Error("Phone number must be +977 followed by exactly 10 digits.");
    }
    data = { ...data, phone };
  }
  const doc = await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.PATIENTS,
    id,
    data
  );
  return doc as unknown as Patient;
}

export async function deletePatient(id: string): Promise<void> {
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PATIENTS, id);
}

export async function getPatientAppointments(patientId: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.APPOINTMENTS,
    [
      Query.equal("patient_id", patientId),
      Query.orderDesc("date"),
    ]
  );
  return res.documents;
}
