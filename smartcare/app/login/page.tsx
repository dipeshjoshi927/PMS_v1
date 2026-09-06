"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { account } from "@/lib/appwrite";
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
import { HeartPulse, Loader2, Eye, EyeOff, ShieldCheck, Activity, Stethoscope } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await account.createEmailPasswordSession(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
      err instanceof Error ? err.message : "Invalid email or password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="light-auth-ambient relative min-h-screen bg-slate-50 p-4 dark:bg-slate-950">
      <ThemeToggle className="absolute right-4 top-4 z-10" />
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-lg bg-primary p-3 shadow-lg shadow-cyan-900/10">
                <HeartPulse className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">SmartCare</h1>
                <p className="text-sm font-medium text-slate-500">Enterprise patient management</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-950">
              Secure clinical operations, designed for focused care.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
              Manage patient records, appointments, prescriptions, reports, and AI-assisted insights from one calm workspace.
            </p>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "Secure access" },
                { icon: Activity, label: "Live workflow" },
                { icon: Stethoscope, label: "Clinical ready" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="clinical-panel p-4">
                  <Icon className="mb-3 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold text-slate-700">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
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
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription>Sign in to continue to the clinical workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@smartcare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Register here
                </Link>
              </p>

            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">
          SmartCare &copy; {new Date().getFullYear()} - Secure healthcare management
        </p>

        </div>
      </div>
    </div>
  );
}
