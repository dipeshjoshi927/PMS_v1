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
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, ClipboardPlus, Loader2 } from "lucide-react";
import type { Patient } from "@/types";
import { EMAIL_PATTERN, normalizeNepalPhone, validatePatient } from "@/lib/validation";

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
    phone:           initial?.phone           ?? "+977",
    email:           initial?.email           ?? "",
    address:         initial?.address         ?? "",
    medical_history: initial?.medical_history ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState(Boolean(initial?.medical_history));

  const set = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.phone) {
      setError("Name, age and phone are required.");
      return;
    }

    const age = Number(form.age);
    const data = {
      ...form,
      name: form.name.trim(),
      age,
      phone: normalizeNepalPhone(form.phone),
      email: form.email,
      address: form.address.trim(),
      medical_history: form.medical_history.trim(),
      gender: form.gender as Patient["gender"],
    };

    try {
      validatePatient(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check the patient details.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit(data);
    } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const emailIsValid = !form.email || EMAIL_PATTERN.test(form.email);

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
            step="1"
            inputMode="numeric"
            value={form.age}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,3}$/.test(value)) set("age", value);
            }}
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
          <Label>Phone * <span className="text-slate-500">(+977 + 10 digits)</span></Label>
          <Input
            type="tel"
            placeholder="+9779812345678"
            inputMode="numeric"
            pattern="\\+977\\d{10}"
            maxLength={14}
            value={form.phone}
            onChange={(e) => set("phone", normalizeNepalPhone(e.target.value))}
            onBlur={() => set("phone", normalizeNepalPhone(form.phone))}
            required
            aria-describedby="phone-help"
          />
          <p id="phone-help" className="text-xs text-slate-500">
            Enter exactly 10 digits after +977.
          </p>
        </div>

        <div className="field-group">
          <Label htmlFor="patient-email">Email <span className="text-slate-500">(optional)</span></Label>
          <div className="relative">
            <Input
            id="patient-email"
            type="email"
            placeholder="name@gmail.com"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            pattern="[^\\s@]+@[^\\s@]+\\.[A-Za-z]{2,63}"
            title="Use a complete email address such as name@example.com, without spaces."
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => setEmailTouched(true)}
            aria-invalid={emailTouched && !emailIsValid}
            aria-describedby="patient-email-help"
            className={emailTouched && !emailIsValid ? "border-red-400 focus-visible:ring-red-500/30" : ""}
          />
          {form.email && emailIsValid && (
            <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" aria-hidden="true" />
          )}
          </div>
          <p id="patient-email-help" className={emailTouched && !emailIsValid ? "text-xs text-red-600" : "text-xs text-slate-500"}>
            {emailTouched && !emailIsValid
              ? "Use a complete address such as name@gmail.com. Spaces are not allowed."
              : "Use a complete address such as name@gmail.com; leave blank if unavailable."}
          </p>
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ClipboardPlus className="h-4 w-4 text-violet-600" />
            Medical history <span className="font-normal text-slate-500">(optional)</span>
          </div>
          <button
            type="button"
            onClick={() => setShowMedicalHistory((visible) => !visible)}
            aria-expanded={showMedicalHistory}
            aria-controls="medical-history-field"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {showMedicalHistory ? "Hide" : "Add details"}
            {showMedicalHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
        {showMedicalHistory && (
        <div id="medical-history-field" className="mt-4 field-group">
          <Label>Medical History</Label>
          <Textarea
            placeholder="Known conditions, allergies, previous surgeries..."
            rows={3}
            value={form.medical_history}
            onChange={(e) => set("medical_history", e.target.value)}
          />
        </div>
        )}
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
