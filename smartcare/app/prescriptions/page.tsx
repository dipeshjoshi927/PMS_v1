"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import PrescriptionCard from "@/components/prescriptions/PrescriptionCard";
import PrescriptionForm from "@/components/prescriptions/PrescriptionForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getPrescriptions, createPrescription } from "@/lib/prescriptions";
import { getPatients } from "@/lib/patients";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, ClipboardList } from "lucide-react";
import type { Prescription, Patient } from "@/types";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients,      setPatients]      = useState<Patient[]>([]);
  const [patientMap,    setPatientMap]    = useState<Record<string, string>>({});
  const [search,        setSearch]        = useState("");
  const [open,          setOpen]          = useState(false);
  const [loading,       setLoading]       = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [pr, p] = await Promise.all([getPrescriptions(), getPatients()]);
      setPrescriptions(pr);
      setPatients(p);
      const map: Record<string, string> = {};
      p.forEach((pt) => { map[pt.$id] = pt.name; });
      setPatientMap(map);
    } catch {
      toast({ title: "Error loading prescriptions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (
    data: Omit<Prescription, "$id" | "$createdAt" | "$updatedAt">
  ) => {
    await createPrescription(data);

    // Optionally email the prescription to the patient
    const patient = patients.find((p) => p.$id === data.patient_id);
    if (patient?.email) {
      await fetch("/api/send-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "prescription",
          to:   patient.email,
          data: {
            patientName:  patient.name,
            date:         data.date,
            medications:  data.medications,
            instructions: data.instructions,
          },
        }),
      }).catch(() => {});
    }

    toast({ title: "Prescription saved successfully" });
    setOpen(false);
    fetchData();
  };

  const filtered = prescriptions.filter((pr) => {
    const name = patientMap[pr.patient_id] ?? "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      pr.medications.toLowerCase().includes(search.toLowerCase()) ||
      pr.date.includes(search)
    );
  });

  return (
    <DashboardLayout>
      <Header
        title="Prescriptions"
        subtitle={`${prescriptions.length} total prescriptions`}
      />
      <div className="p-6 lg:p-8 space-y-5">

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search by patient, medication or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0">
                <Plus className="w-4 h-4" /> New Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Write New Prescription</DialogTitle>
              </DialogHeader>
              <PrescriptionForm
                patients={patients}
                onSubmit={handleSubmit}
                onCancel={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">No prescriptions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((pr) => (
              <PrescriptionCard
                key={pr.$id}
                prescription={pr}
                patientName={patientMap[pr.patient_id] ?? "Unknown"}
              />
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}