"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import StatusBadge from "@/components/appointments/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from "@/lib/appointments";
import { getPatient } from "@/lib/patients";
import { useToast } from "@/components/ui/use-toast";
import { formatTime } from "@/lib/utils";
import {
  ArrowLeft, Calendar, Clock,
  User, FileText, Trash2,
} from "lucide-react";
import type { Appointment, Patient } from "@/types";

export default function AppointmentDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const { toast } = useToast();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient,     setPatient]     = useState<Patient | null>(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const a = await getAppointment(id);
        setAppointment(a);
        const p = await getPatient(a.patient_id);
        setPatient(p);
      } catch {
        toast({ title: "Appointment not found", variant: "destructive" });
        router.push("/appointments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!appointment) return;
    await updateAppointmentStatus(id, status as Appointment["status"]);
    setAppointment({ ...appointment, status: status as Appointment["status"] });
    toast({ title: `Status updated to ${status}` });
  };

  const handleDelete = async () => {
    if (!confirm("Delete this appointment?")) return;
    await deleteAppointment(id);
    toast({ title: "Appointment deleted" });
    router.push("/appointments");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="clinical-page">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!appointment) return null;

  return (
    <DashboardLayout>
      <Header title="Appointment Details" />
      <div className="clinical-page">

        <div className="flex items-center justify-between">
          <Link href="/appointments">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Card className="">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Appointment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="font-medium">{appointment.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-slate-500">Time</p>
                  <p className="font-medium">{formatTime(appointment.time)}</p>
                </div>
              </div>
              {appointment.notes && (
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500">Notes</p>
                    <p className="font-medium text-sm">{appointment.notes}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 mb-2">Status</p>
                <div className="flex items-center gap-3">
                  <StatusBadge status={appointment.status} />
                  <Select
                    value={appointment.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-36 h-8 text-xs">
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
            </CardContent>
          </Card>

          {patient && (
            <Card className="">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Patient Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <User className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="font-medium">{patient.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Age</p>
                    <p className="font-medium">{patient.age} yrs</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Gender</p>
                    <p className="font-medium capitalize">{patient.gender}</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
                <Link href={`/patients/${patient.$id}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Full Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}