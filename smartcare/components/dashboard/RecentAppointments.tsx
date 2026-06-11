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
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function RecentAppointments({
  appointments,
  patientNames,
  loading,
}: RecentAppointmentsProps) {
  return (
    <Card className="border-0 shadow-sm">
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
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No appointments yet</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <Link key={appt.$id} href={`/appointments/${appt.$id}`}>
              <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
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