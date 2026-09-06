"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import PrintPrescription from "@/components/prescriptions/PrintPrescription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPrescription, deletePrescription } from "@/lib/prescriptions";
import { getPatient } from "@/lib/patients";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, FileText, User, Trash2 } from "lucide-react";
import type { Prescription, Patient } from "@/types";

export default function PrescriptionDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const { toast } = useToast();

  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [patient,      setPatient]      = useState<Patient | null>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const pr = await getPrescription(id);
        setPrescription(pr);
        const p = await getPatient(pr.patient_id);
        setPatient(p);
      } catch {
        toast({ title: "Prescription not found", variant: "destructive" });
        router.push("/prescriptions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this prescription?")) return;
    await deletePrescription(id);
    toast({ title: "Prescription deleted" });
    router.push("/prescriptions");
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

  if (!prescription || !patient) return null;

  return (
    <DashboardLayout>
      <Header title="Prescription Details" />
      <div className="clinical-page">

        <div className="flex items-center justify-between no-print">
          <Link href="/prescriptions">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <PrintPrescription prescription={prescription} patient={patient} />
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Card className="">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" /> Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold text-slate-900">{patient.name}</p>
              <p className="text-slate-500">{patient.age} yrs · {patient.gender}</p>
              <p className="text-slate-500">{patient.phone}</p>
              <p className="text-xs text-slate-400">Date: {prescription.date}</p>
              <Link href={`/patients/${patient.$id}`}>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-4">
            <Card className="">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" /> Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-lg">
                  {prescription.medications}
                </p>
              </CardContent>
            </Card>

            {prescription.instructions && (
              <Card className="">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-lg">
                    {prescription.instructions}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}