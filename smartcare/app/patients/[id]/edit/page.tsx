"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import PatientForm from "@/components/patients/PatientForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPatient, updatePatient } from "@/lib/patients";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import type { Patient } from "@/types";

export default function EditPatientPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatient(id)
      .then(setPatient)
      .catch(() => {
        toast({ title: "Patient not found", variant: "destructive" });
        router.push("/patients");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (
    data: Omit<Patient, "$id" | "$createdAt" | "$updatedAt">
  ) => {
    await updatePatient(id, data);
    toast({ title: "Patient updated successfully" });
    router.push(`/patients/${id}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header title="Edit Patient" subtitle={patient?.name} />
      <div className="p-6 lg:p-8">
        <Link href={`/patients/${id}`} className="inline-block mb-6">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <Card className="border-0 shadow-sm max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">Edit Patient Details</CardTitle>
          </CardHeader>
          <CardContent>
            {patient && (
              <PatientForm
                initial={patient}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`/patients/${id}`)}
                submitLabel="Save Changes"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}