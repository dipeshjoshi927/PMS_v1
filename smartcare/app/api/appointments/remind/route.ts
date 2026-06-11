import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";
import nodemailer from "nodemailer";
import { appointmentReminderEmail } from "@/lib/email";
import { format, addDays } from "date-fns";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST() {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const db       = new Databases(client);
    const DB       = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

    const { documents, total } = await db.listDocuments(DB, "appointments", [
      Query.equal("date",   tomorrow),
      Query.equal("status", "scheduled"),
    ]);

    if (total === 0) {
      return NextResponse.json({
        sent:    0,
        message: "No appointments tomorrow.",
      });
    }

    let sent    = 0;
    let failed  = 0;
    const errors: string[] = [];

    for (const appt of documents) {
      try {
        const patient = await db.getDocument(DB, "patients", appt.patient_id);

        if (!patient.email) {
          errors.push(`${patient.name}: no email address`);
          failed++;
          continue;
        }

        const { subject, html } = appointmentReminderEmail({
          patientName: patient.name,
          date:        appt.date,
          time:        appt.time,
        });

        await transporter.sendMail({
          from:    `SmartCare <${process.env.GMAIL_USER}>`,
          to:      patient.email,
          subject,
          html,
        });

        sent++;
      } catch (err: unknown) {
          if (err instanceof Error) {
            errors.push(`${appt.$id}: ${err.message}`);
          } else {
            errors.push(`${appt.$id}: ${String(err)}`);
          }
          failed++;
}
    }

    return NextResponse.json({
      sent,
      failed,
      total,
      ...(errors.length > 0 ? { errors } : {}),
    });
  } catch (err: unknown) {
      return NextResponse.json(
        {
          error: err instanceof Error
            ? err.message
            : "Failed to send reminders.",
        },
        { status: 500 }
      );
    }
}

