"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import PatientCard from "@/components/patients/PatientCard";
import PatientTable from "@/components/patients/PatientTable";
import PatientForm from "@/components/patients/PatientForm";
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
import { getPatients, createPatient, updatePatient } from "@/lib/patients";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, LayoutGrid, List, UserRoundCheck } from "lucide-react";
import type { Patient } from "@/types";

type View = "grid" | "table";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search,   setSearch]   = useState("");
  const [view,     setView]     = useState<View>("grid");
  const [open,     setOpen]     = useState(false);
  const [editing,  setEditing]  = useState<Patient | null>(null);
  const [loading,  setLoading]  = useState(true);
  const { toast } = useToast();

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch {
      toast({ title: "Error loading patients", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.address?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (
    data: Omit<Patient, "$id" | "$createdAt" | "$updatedAt">
  ) => {
    if (editing) {
      await updatePatient(editing.$id, data);
      toast({ title: "Patient updated successfully" });
    } else {
      await createPatient(data);
      toast({ title: "Patient added successfully" });
    }
    setOpen(false);
    setEditing(null);
    fetchPatients();
  };

  const handleEdit = (patient: Patient) => {
    setEditing(patient);
    setOpen(true);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) setEditing(null);
  };

  return (
    <DashboardLayout>
      <Header title="Patients" subtitle={`${patients.length} total patients`} />
      <div className="clinical-page">

        <div className="clinical-panel p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search by name, phone or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="flex overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              <button
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={`p-2 transition-colors ${
                  view === "grid"
                    ? "bg-primary text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("table")}
                aria-label="Table view"
                className={`p-2 transition-colors ${
                  view === "table"
                    ? "bg-primary text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button className="shrink-0 gap-2">
                  <Plus className="w-4 h-4" /> Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {editing ? "Edit Patient" : "Add New Patient"}
                  </DialogTitle>
                </DialogHeader>
                <PatientForm
                  initial={editing ?? undefined}
                  onSubmit={handleSubmit}
                  onCancel={() => handleOpenChange(false)}
                  submitLabel={editing ? "Save Changes" : "Add Patient"}
                />
              </DialogContent>
            </Dialog>
          </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-50 text-primary">
              {search ? <Search className="h-6 w-6" /> : <UserRoundCheck className="h-6 w-6" />}
            </div>
            <p className="text-lg font-semibold text-slate-900">No patients found</p>
            <p className="mt-1 text-sm">
              {search
                ? "Try a different search term"
                : "Add your first patient to get started"
              }
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <PatientCard key={p.$id} patient={p} />
            ))}
          </div>
        ) : (
          <PatientTable patients={filtered} onEdit={handleEdit} />
        )}

      </div>
    </DashboardLayout>
  );
}
