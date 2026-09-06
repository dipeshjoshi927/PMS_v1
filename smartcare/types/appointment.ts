export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface Appointment {
  $id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes: string;
  $createdAt: string;
  $updatedAt: string;
}