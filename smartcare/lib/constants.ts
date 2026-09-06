export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export const COLLECTIONS = {
  USERS:         "users",
  PATIENTS:      "patients",
  APPOINTMENTS:  "appointments",
  PRESCRIPTIONS: "prescriptions",
} as const;