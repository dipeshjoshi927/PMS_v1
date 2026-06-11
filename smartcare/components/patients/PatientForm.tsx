"use client";

import { useState } from "react";
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
import { AlertCircle, Loader2 } from "lucide-react";
import type { Patient } from "@/types";

interface PatientFormProps {
  initial?:     Partial<Patient>;
  onSubmit:     (data: Omit<Patient, "$id" | "$createdAt" | "$updatedAt">) => Promise<void>;
  onCancel:     () => void;
  submitLabel?: string;
}

export default function PatientForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Patient",
}: PatientFormProps) {
  const [form, setForm] = useState({
    name:            initial?.name            ?? "",
    age:             initial?.age?.toString() ?? "",
    gender:          initial?.gender          ?? "male",
    phone:           initial?.phone           ?? "",
    email:           initial?.email           ?? "",
    address:         initial?.address         ?? "",
    medical_history: initial?.medical_history ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.phone) {
      setError("Name, age and phone are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        ...form,
        age:    parseInt(form.age),
        gender: form.gender as Patient["gender"],
      });
    } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Patient identity</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="field-group sm:col-span-2">
          <Label>Full Name *</Label>
          <Input
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <Label>Age *</Label>
          <Input
            type="number"
            placeholder="25"
            min="0"
            max="150"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <Label>Gender *</Label>
          <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Contact details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="field-group">
          <Label>Phone *</Label>
          <Input
            placeholder="+977XXXXXXXXXX"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            required
          />
        </div>

        <div className="field-group">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="patient@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>

        <div className="field-group sm:col-span-2">
          <Label>Address</Label>
          <Input
            placeholder="Kathmandu, Nepal"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <div className="field-group">
          <Label>Medical History</Label>
          <Textarea
            placeholder="Known conditions, allergies, previous surgeries..."
            rows={3}
            value={form.medical_history}
            onChange={(e) => set("medical_history", e.target.value)}
          />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
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
