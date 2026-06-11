"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import MedicalHistory from "@/components/patients/MedicalHistory";
import StatusBadge from "@/components/appointments/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPatient, deletePatient } from "@/lib/patients";
import { getPatientAppointments } from "@/lib/appointments";
import { getPatientPrescriptions } from "@/lib/prescriptions";
import { useToast } from "@/components/ui/use-toast";
import { formatDate, formatTime } from "@/lib/utils";
import {
  User, Phone, MapPin, Calendar,
  FileText, Pencil, Trash2, ArrowLeft, Clock,
} from "lucide-react";
import type { Patient, Appointment, Prescription } from "@/types";

export default function PatientDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const router     = useRouter();
  const { toast }  = useToast();

  const [patient,       setPatient]       = useState<Patient | null>(null);
  const [appointments,  setAppointments]  = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [deleting,      setDeleting]      = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, a, pr] = await Promise.all([
          getPatient(id),
          getPatientAppointments(id),
          getPatientPrescriptions(id),
        ]);
        setPatient(p);
        setAppointments(a as Appointment[]);
        setPrescriptions(pr);
      } catch {
        toast({ title: "Patient not found", variant: "destructive" });
        router.push("/patients");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this patient? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deletePatient(id);
      toast({ title: "Patient deleted" });
      router.push("/patients");
    } catch {
      toast({ title: "Could not delete patient", variant: "destructive" });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="clinical-page">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) return null;

  return (
    <DashboardLayout>
      <Header title={patient.name} subtitle="Patient record" />
      <div className="clinical-page">

        <div className="flex items-center justify-between">
          <Link href="/patients">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Patients
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/patients/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Pencil className="w-4 h-4" /> Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="space-y-4">
            <Card className="">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" /> Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-medium">{patient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Age</span>
                  <span className="font-medium">{patient.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-medium capitalize">{patient.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered</span>
                  <span className="font-medium">{formatDate(patient.$createdAt)}</span>
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs">@</span>
                    <span>{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{patient.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <MedicalHistory history={patient.medical_history} />
          </div>

          <div className="lg:col-span-2 space-y-4">

            <Card className="">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  Appointments ({appointments.length})
                </CardTitle>
                <Link href="/appointments">
                  <Button size="sm" variant="outline">+ Book</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    No appointments yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {appointments.map((a) => (
                      <Link key={a.$id} href={`/appointments/${a.$id}`}>
                        <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                          <div>
                            <p className="text-sm font-medium">{a.date}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(a.time)}
                              {a.notes && ` · ${a.notes}`}
                            </p>
                          </div>
                          <StatusBadge status={a.status} size="sm" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  Prescriptions ({prescriptions.length})
                </CardTitle>
                <Link href="/prescriptions">
                  <Button size="sm" variant="outline">+ New</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {prescriptions.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    No prescriptions yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {prescriptions.map((pr) => (
                      <Link key={pr.$id} href={`/prescriptions/${pr.$id}`}>
                        <div className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                          <div className="flex justify-between mb-1">
                            <p className="text-sm font-medium">Prescription</p>
                            <p className="text-xs text-slate-400">{pr.date}</p>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">
                            {pr.medications}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}