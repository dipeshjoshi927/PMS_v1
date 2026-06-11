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
  onStatusChange?: () => void;
}

export default function AppointmentCard({
  appointment,
  patientName,
  onStatusChange,
}: AppointmentCardProps) {
  const handleStatus = async (status: string) => {
    try {
      await updateAppointmentStatus(
        appointment.$id,
        status as Appointment["status"]
      );
      onStatusChange?.();
    } catch {}
  };

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-slate-100 rounded-xl shrink-0">
            <Calendar className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <Link href={`/appointments/${appointment.$id}`}>
                  <p className="font-semibold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {patientName}
                  </p>
                </Link>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
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
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={appointment.status} />
                <Select
                  value={appointment.status}
                  onValueChange={handleStatus}
                >
                  <SelectTrigger className="w-28 h-7 text-xs border-slate-200">
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