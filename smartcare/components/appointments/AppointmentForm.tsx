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
import { AlertCircle, CalendarDays, Clock3, Loader2, UserRound } from "lucide-react";
import type { Appointment, Patient } from "@/types";

interface AppointmentFormProps {
  patients:     Patient[];
  initial?:     Partial<Appointment>;
  onSubmit:     (data: Omit<Appointment, "$id" | "$createdAt" | "$updatedAt">) => Promise<void>;
  onCancel:     () => void;
  submitLabel?: string;
}

export default function AppointmentForm({
  patients,
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Book Appointment",
}: AppointmentFormProps) {
  const [form, setForm] = useState({
    patient_id: initial?.patient_id ?? "",
    doctor_id:  initial?.doctor_id  ?? "default_doctor",
    date:       initial?.date       ?? format(new Date(), "yyyy-MM-dd"),
    time:       initial?.time       ?? "09:00",
    status:     initial?.status     ?? "scheduled",
    notes:      initial?.notes      ?? "",
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
    setLoading(true);
    setError("");
    try {
      await onSubmit({ ...form, status: form.status as Appointment["status"] });
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
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <UserRound className="h-4 w-4 text-primary" />
          Patient
        </div>
        <div className="field-group">
          <Label>Patient *</Label>
          <Select
            value={form.patient_id}
            onValueChange={(v) => set("patient_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a patient..." />
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
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CalendarDays className="h-4 w-4 text-emerald-600" />
          Schedule
        </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="field-group">
          <Label>Date *</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </div>
        <div className="field-group">
          <Label>Time *</Label>
          <Input
            type="time"
            value={form.time}
            onChange={(e) => set("time", e.target.value)}
            required
          />
        </div>
      </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Clock3 className="h-4 w-4 text-amber-600" />
          Visit details
        </div>
        <div className="grid gap-4">
          <div className="field-group">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="field-group">
            <Label>Notes</Label>
            <Textarea
              placeholder="Reason for visit, special instructions..."
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
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
