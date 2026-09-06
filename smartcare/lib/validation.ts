import type { Patient } from "@/types";

export const NEPAL_PHONE_PATTERN = /^\+977\d{10}$/;
// A practical email check for form input: one @, no whitespace, and a real-looking TLD.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,63}$/;

export function normalizeNepalPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const localNumber = digits.startsWith("977") ? digits.slice(3) : digits;
  return `+977${localNumber.slice(0, 10)}`;
}

export function validatePatient(
  data: Pick<Patient, "name" | "age" | "gender" | "phone" | "email" | "address" | "medical_history">
): void {
  if (!data.name.trim()) {
    throw new Error("Patient name is required.");
  }

  if (!Number.isInteger(data.age) || data.age < 0 || data.age > 150) {
    throw new Error("Age must be a whole number between 0 and 150.");
  }

  if (!NEPAL_PHONE_PATTERN.test(data.phone)) {
    throw new Error("Phone number must be +977 followed by exactly 10 digits.");
  }

  if (data.email && !EMAIL_PATTERN.test(data.email)) {
    throw new Error("Email must be in the format name@example.com and cannot contain spaces.");
  }
}
