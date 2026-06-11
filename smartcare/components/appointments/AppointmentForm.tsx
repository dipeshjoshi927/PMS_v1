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

      <div className="grid grid-cols-2 gap-4">
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
          <Label>Time *</Label>
          <Input
            type="time"
            value={form.time}
            onChange={(e) => set("time", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
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

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea
          placeholder="Reason for visit, special instructions..."
          rows={3}
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
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