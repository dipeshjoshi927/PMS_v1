"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Prescription, Patient } from "@/types";

interface PrescriptionFormProps {
  patients:     Patient[];
  initial?:     Partial<Prescription>;
  onSubmit:     (data: Omit<Prescription, "$id" | "$createdAt" | "$updatedAt">) => Promise<void>;
  onCancel:     () => void;
  submitLabel?: string;
}

export default function PrescriptionForm({
  patients,
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Prescription",
}: PrescriptionFormProps) {
  const [form, setForm] = useState({
    patient_id:   initial?.patient_id   ?? "",
    doctor_id:    initial?.doctor_id    ?? "default_doctor",
    medications:  initial?.medications  ?? "",
    instructions: initial?.instructions ?? "",
    date:         initial?.date         ?? format(new Date(), "yyyy-MM-dd"),
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id) {
      setError("Please select a patient.");
      return;
    }
    if (!form.medications) {
      setError("Medications field is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(form);
    } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Patient *</Label>
        <Select
          value={form.patient_id}
          onValueChange={(v) => set("patient_id", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select patient..." />
          </SelectTrigger>
          <SelectContent>
            {patients.map((p) => (
              <SelectItem key={p.$id} value={p.$id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Date *</Label>
        <Input
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Medications *</Label>
        <Textarea
          placeholder={"1. Paracetamol 500mg — 3x daily after meals\n2. Amoxicillin 250mg — 2x daily"}
          rows={4}
          value={form.medications}
          onChange={(e) => set("medications", e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Instructions</Label>
        <Textarea
          placeholder="Take after meals. Avoid alcohol. Follow up in 7 days."
          rows={3}
          value={form.instructions}
          onChange={(e) => set("instructions", e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}