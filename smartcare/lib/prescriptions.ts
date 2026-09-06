import { databases, ID, Query } from "./appwrite";
import { DATABASE_ID, COLLECTIONS } from "./constants";
import type { Prescription } from "@/types";

export async function getPrescriptions(): Promise<Prescription[]> {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.PRESCRIPTIONS,
    [Query.orderDesc("$createdAt")]
  );
  return res.documents as unknown as Prescription[];
}

export async function getPrescription(id: string): Promise<Prescription> {
  const doc = await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.PRESCRIPTIONS,
    id
  );
  return doc as unknown as Prescription;
}

export async function createPrescription(
  data: Omit<Prescription, "$id" | "$createdAt" | "$updatedAt">
): Promise<Prescription> {
  const doc = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.PRESCRIPTIONS,
    ID.unique(),
    data
  );
  return doc as unknown as Prescription;
}

export async function updatePrescription(
  id: string,
  data: Partial<Omit<Prescription, "$id" | "$createdAt" | "$updatedAt">>
): Promise<Prescription> {
  const doc = await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.PRESCRIPTIONS,
    id,
    data
  );
  return doc as unknown as Prescription;
}

export async function deletePrescription(id: string): Promise<void> {
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PRESCRIPTIONS, id);
}

export async function getPatientPrescriptions(
  patientId: string
): Promise<Prescription[]> {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.PRESCRIPTIONS,
    [
      Query.equal("patient_id", patientId),
      Query.orderDesc("date"),
    ]
  );
  return res.documents as unknown as Prescription[];
}