export type Role = "admin" | "doctor" | "receptionist";

export interface User {
  $id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  $createdAt: string;
  $updatedAt: string;
}