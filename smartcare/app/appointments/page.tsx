"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import AppointmentCard from "@/components/appointments/AppointmentCard";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
} from "@/lib/appointments";
import { getPatients } from "@/lib/patients";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, Calendar } from "lucide-react";
import type { Appointment, Patient } from "@/types";

async function notifyPatient(
  type: "appointment_confirmation" | "appointment_cancelled",
  patient: Patient,
  appt: Pick<Appointment, "date" | "time" | "notes">
) {
  if (!patient.email) return;
  await fetch("/api/send-email", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      to:   patient.email,
      data: {
        patientName: patient.name,
        date:        appt.date,
        time:        appt.time,
        notes:       appt.notes,
      },
    }),
  }).catch(() => {});
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients,     setPatients]     = useState<Patient[]>([]);
  const [patientMap,   setPatientMap]   = useState<Record<string, string>>({});
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [open,         setOpen]         = useState(false);
  const [loading,      setLoading]      = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [a, p] = await Promise.all([getAppointments(), getPatients()]);
      setAppointments(a);
      setPatients(p);
      const map: Record<string, string> = {};
      p.forEach((pt) => { map[pt.$id] = pt.name; });
      setPatientMap(map);
    } catch {
      toast({ title: "Error loading appointments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (
    data: Omit<Appointment, "$id" | "$createdAt" | "$updatedAt">
  ) => {
    await createAppointment(data);
    const patient = patients.find((p) => p.$id === data.patient_id);
    if (patient) {
      await notifyPatient("appointment_confirmation", patient, data);
      toast({
        title:       "Appointment booked",
        description: patient.email
          ? "Confirmation email sent."
          : "No email on file — notification skipped.",
      });
    }
    setOpen(false);
    fetchData();
  };

  const handleStatusChange = async (
    apptId:    string,
    newStatus: string,
    patientId: string
  ) => {
    await updateAppointmentStatus(apptId, newStatus as Appointment["status"]);
    if (newStatus === "cancelled") {
      const patient = patients.find((p) => p.$id === patientId);
      const appt    = appointments.find((a) => a.$id === apptId);
      if (patient && appt) {
        await notifyPatient("appointment_cancelled", patient, appt);
      }
    }
    fetchData();
  };

  const filtered = appointments.filter((a) => {
    const name        = patientMap[a.patient_id] ?? "";
    const matchSearch = (
      name.toLowerCase().includes(search.toLowerCase()) ||
      a.date.includes(search)
    );
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <Header
        title="Appointments"
        subtitle={`${appointments.length} total appointments`}
      />
      <div className="p-6 lg:p-8 space-y-5">

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search by patient name or date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0">
                <Plus className="w-4 h-4" /> Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
              </DialogHeader>
              <AppointmentForm
                patients={patients}
                onSubmit={handleSubmit}
                onCancel={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <AppointmentCard
                key={a.$id}
                appointment={a}
                patientName={patientMap[a.patient_id] ?? "Unknown"}
                onStatusChange={() =>
                  handleStatusChange(a.$id, a.status, a.patient_id)
                }
              />
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}