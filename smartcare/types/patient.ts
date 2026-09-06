export interface Patient {
  $id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  phone: string;
  email: string;
  address: string;
  medical_history: string;
  $createdAt: string;
  $updatedAt: string;
}