"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { account, databases, ID } from "@/lib/appwrite";
import { DATABASE_ID, COLLECTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { HeartPulse, Loader2, Eye, EyeOff, Stethoscope, ShieldCheck, Headset, CheckCircle2 } from "lucide-react";

const roles = [
  {
    value: "doctor",
    title: "Doctor",
    description: "Manage consultations, prescriptions, and clinical follow-up.",
    icon: Stethoscope,
  },
  {
    value: "admin",
    title: "Admin",
    description: "Oversee clinic operations, reporting, and team access.",
    icon: ShieldCheck,
  },
  {
    value: "receptionist",
    title: "Receptionist",
    description: "Coordinate registrations, schedules, and patient communication.",
    icon: Headset,
  },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    name:     "",
    email:    "",
    password: "",
    phone:    "",
    role:     "doctor",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const router = useRouter();

  const set = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await account.create(
        ID.unique(),
        form.email,
        form.password,
        form.name
      );

      await account.createEmailPasswordSession(form.email, form.password);

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        user.$id,
        {
          name:  form.name,
          email: form.email,
          phone: form.phone,
          role:  form.role,
        }
      );

      // Send welcome email (non-blocking)
      fetch("/api/send-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "welcome",
          to:   form.email,
          data: { name: form.name, role: form.role },
        }),
      }).catch(() => {});

      router.push("/dashboard");
    } catch (err: unknown) {
       const message =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl items-center justify-center">
      <div className="w-full max-w-3xl">

        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="rounded-lg bg-primary p-3 shadow-lg shadow-cyan-900/10">
            <HeartPulse className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">SmartCare</h1>
            <p className="text-sm text-slate-500">Patient Management System</p>
          </div>
        </div>

        <Card className="border-slate-200 bg-white/95 shadow-clinical backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Create your workspace account</CardTitle>
            <CardDescription>Choose your clinical role and complete your secure profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">
                  {error}
                </div>
              )}

              <div>
                <Label className="mb-3 block">Select role</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  {roles.map(({ value, title, description, icon: Icon }) => {
                    const selected = form.role === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set("role", value)}
                        className={cn(
                          "relative rounded-lg border bg-white p-4 text-left transition-all hover:border-primary/50 hover:bg-cyan-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                          selected
                            ? "border-primary bg-cyan-50 shadow-sm"
                            : "border-slate-200"
                        )}
                        aria-pressed={selected}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className={cn("rounded-md p-2", selected ? "bg-primary text-white" : "bg-slate-100 text-slate-600")}>
                            <Icon className="h-4 w-4" />
                          </span>
                          {selected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                        <p className="font-semibold text-slate-950">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="field-group">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Dr. John Smith"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="field-group">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="field-group">
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+977XXXXXXXXXX"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    required
                    autoComplete="tel"
                  />
                </div>

                <div className="field-group">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />
                      }
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Use at least 8 characters.</p>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>
              </p>

            </form>
          </CardContent>
        </Card>

      </div>
      </div>
    </div>
  );
}
