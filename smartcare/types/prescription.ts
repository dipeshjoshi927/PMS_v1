export interface Prescription {
  $id: string;
  patient_id: string;
  doctor_id: string;
  medications: string;
  instructions: string;
  date: string;
  $createdAt: string;
  $updatedAt: string;
}