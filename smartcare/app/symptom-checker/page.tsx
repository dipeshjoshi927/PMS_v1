"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import SymptomForm from "@/components/ai/SymptomForm";
import SymptomResult from "@/components/ai/SymptomResult";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, ShieldCheck } from "lucide-react";
import type { SymptomCheckResult } from "@/lib/groq";

export default function SymptomCheckerPage() {
  const [result, setResult] = useState<SymptomCheckResult | null>(null);

  return (
    <DashboardLayout>
      <Header
        title="AI Symptom Checker"
        subtitle="Powered by Llama 3.3 70B via Groq"
      />
      <div className="clinical-page">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Info cards */}
          {!result && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon:  Brain,
                  color: "bg-purple-50 text-purple-600",
                  title: "AI powered",
                  desc:  "Llama 3.3 70B analysis",
                },
                {
                  icon:  Activity,
                  color: "bg-blue-50 text-blue-600",
                  title: "Instant results",
                  desc:  "Under 3 seconds",
                },
                {
                  icon:  ShieldCheck,
                  color: "bg-green-50 text-green-600",
                  title: "Private",
                  desc:  "Not stored anywhere",
                },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col items-center text-center p-4 bg-white rounded-lg border border-slate-100 shadow-sm"
                >
                  <div className={`p-2 rounded-lg mb-2 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Main card */}
          <Card className="">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                {result ? "Analysis results" : "Enter your symptoms"}
              </CardTitle>
              {!result && (
                <p className="text-sm text-slate-500">
                  Describe what you are experiencing in as much detail as
                  possible. The more detail you provide, the more accurate
                  the analysis.
                </p>
              )}
            </CardHeader>
            <CardContent>
              {result
                ? <SymptomResult result={result} onReset={() => setResult(null)} />
                : <SymptomForm onResult={setResult} />
              }
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}