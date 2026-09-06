"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import ClinicSummaryCard from "@/components/ai/ClinicSummaryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { account } from "@/lib/appwrite";
import { Loader2, FileBarChart, Sparkles } from "lucide-react";
import type { ClinicSummary } from "@/lib/groq";

export default function ClinicSummaryPage() {
  const [summary,    setSummary]    = useState<ClinicSummary | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [emailing,   setEmailing]   = useState(false);
  const [emailTo,    setEmailTo]    = useState("");
  const [error,      setError]      = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setSummary(null);

    try {
      const res  = await fetch("/api/ai/clinic-summary");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to generate summary.");
        return;
      }

      setSummary(data.summary);

      // Pre-fill email with logged in user's email
      account.get()
        .then((u) => setEmailTo(u.email ?? ""))
        .catch(() => {});
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    if (!summary || !emailTo) return;
    setEmailing(true);

    try {
      const res = await fetch("/api/send-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "clinic_summary",
          to:   emailTo,
          data: {
            period:          summary.period,
            overview:        summary.overview,
            patientInsights: summary.patient_insights,
            apptStats:       summary.appointment_stats,
            healthTrends:    summary.health_trends,
            recommendations: summary.recommendations,
            alerts:          summary.alerts,
          },
        }),
      });

      if (!res.ok) {
        toast({ title: "Failed to send email", variant: "destructive" });
        return;
      }

      toast({ title: "Report emailed successfully", description: `Sent to ${emailTo}` });
    } catch {
      toast({ title: "Email failed", variant: "destructive" });
    } finally {
      setEmailing(false);
    }
  };

  return (
    <DashboardLayout>
      <Header
        title="Clinic Summary"
        subtitle="AI-generated monthly clinic report"
      />
      <div className="clinical-page">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Generate panel */}
          <Card className="">
            <CardContent className="pt-6 pb-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 mb-1">
                    Generate clinic report
                  </p>
                  <p className="text-sm text-slate-500">
                    AI reads all your clinic data and generates a structured
                    monthly summary with insights, trends and recommendations.
                  </p>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="gap-2 shrink-0"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                    : <><Sparkles className="w-4 h-4" /> Generate Summary</>
                  }
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading state */}
          {loading && (
            <Card className="">
              <CardContent className="py-16 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Analyzing clinic data...</p>
                <p className="text-sm text-slate-400 mt-1">
                  Reading patients, appointments and prescriptions
                </p>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {!loading && !summary && (
            <Card className="">
              <CardContent className="py-16 text-center">
                <FileBarChart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No summary generated yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  Click Generate Summary to create your clinic report
                </p>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {!loading && summary && (
            <>
              <ClinicSummaryCard
                summary={summary}
                onEmail={handleEmail}
                emailing={emailing}
              />

              {/* Email section */}
              <Card className="">
                <CardContent className="pt-5 pb-5">
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    Email this report
                  </p>
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor="emailTo" className="text-xs text-slate-500">
                        Recipient email
                      </Label>
                      <Input
                        id="emailTo"
                        type="email"
                        placeholder="doctor@hospital.com"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleEmail}
                        disabled={emailing || !emailTo}
                        variant="outline"
                      >
                        {emailing ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}