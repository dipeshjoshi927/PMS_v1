"use client";

import Link from "next/link";
import { Appointment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface RecentAppointmentsProps {
  appointments: Appointment[];
  patientNames: Record<string, string>;
  loading?:     boolean;
}

const statusStyles: Record<string, string> = {
  scheduled: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export default function RecentAppointments({
  appointments,
  patientNames,
  loading,
}: RecentAppointmentsProps) {
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          Recent Appointments
        </CardTitle>
        <Link
          href="/appointments"
          className="text-xs text-blue-600 hover:underline font-medium"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
          ))
        ) : appointments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-slate-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">No appointments yet</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <Link key={appt.$id} href={`/appointments/${appt.$id}`}>
              <div className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 p-3 transition-colors hover:bg-cyan-50/70">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-800 truncate">
                    {patientNames[appt.patient_id] ?? "Unknown Patient"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {appt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(appt.time)}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ml-3 ${statusStyles[appt.status]}`}>
                  {appt.status}
                </span>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
