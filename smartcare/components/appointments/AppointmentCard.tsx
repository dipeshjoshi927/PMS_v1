"use client";

import Link from "next/link";
import { Appointment } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusBadge from "./StatusBadge";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { updateAppointmentStatus } from "@/lib/appointments";

interface AppointmentCardProps {
  appointment:    Appointment;
  patientName:    string;
  onStatusChange?: (status: Appointment["status"]) => void;
}

export default function AppointmentCard({
  appointment,
  patientName,
  onStatusChange,
}: AppointmentCardProps) {
  const handleStatus = async (status: string) => {
    try {
      const nextStatus = status as Appointment["status"];
      if (onStatusChange) {
        onStatusChange(nextStatus);
      } else {
        await updateAppointmentStatus(appointment.$id, nextStatus);
      }
    } catch {}
  };

  return (
    <Card className="transition-all duration-200 hover:border-primary/30 hover:shadow-clinical">
      <CardContent className="py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <Link href={`/appointments/${appointment.$id}`}>
                  <p className="flex items-center gap-1.5 font-semibold text-slate-950 transition-colors hover:text-primary">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {patientName}
                  </p>
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {appointment.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(appointment.time)}
                  </span>
                </div>
                {appointment.notes && (
                  <p className="text-xs text-slate-400 mt-1.5 flex items-start gap-1">
                    <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{appointment.notes}</span>
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={appointment.status} />
                <Select
                  value={appointment.status}
                  onValueChange={handleStatus}
                >
                  <SelectTrigger size="sm" className="w-32 text-xs border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
