"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import AIDashboardStats from "@/components/ai/AIDashboardStats";
import RiskPatientCard from "@/components/ai/RiskPatientCard";
import DepartmentLoadChart from "@/components/ai/DeparmentLoadChart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { getPatients } from "@/lib/patients";
import { RefreshCw, ShieldCheck } from "lucide-react";
import type { PatientRiskResult } from "@/lib/risk";
import type { Patient } from "@/types";

interface RiskScanResponse {
  patients: PatientRiskResult[];
  summary:  { high: number; medium: number; low: number };
}

interface DeptLoadResponse {
  predictions: { department: string; predicted_count: number; trend: "up" | "stable" | "down" }[];
}

export default function AIDashboardPage() {
  const [riskData,     setRiskData]     = useState<RiskScanResponse | null>(null);
  const [deptLoad,     setDeptLoad]     = useState<DeptLoadResponse | null>(null);
  const [patients,     setPatients]     = useState<Patient[]>([]);
  const [riskLoading,  setRiskLoading]  = useState(true);
  const [deptLoading,  setDeptLoading]  = useState(true);
  const [filter,       setFilter]       = useState<"all" | "high" | "medium" | "low">("all");
  const { toast } = useToast();

  const fetchRiskData = async () => {
    setRiskLoading(true);
    try {
      const [riskRes, patientsData] = await Promise.all([
        fetch("/api/ai/risk-scan"),
        getPatients(),
      ]);
      const risk = await riskRes.json();
      setRiskData(risk);
      setPatients(patientsData);
    } catch {
      toast({ title: "Failed to load risk data", variant: "destructive" });
    } finally {
      setRiskLoading(false);
    }
  };

  const fetchDeptLoad = async () => {
    setDeptLoading(true);
    try {
      const res  = await fetch("/api/ai/department-load");
      const data = await res.json();
      setDeptLoad(data);
    } catch {
      toast({ title: "Failed to load department predictions", variant: "destructive" });
    } finally {
      setDeptLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
    fetchDeptLoad();
  }, []);

  const getPatientEmail = (patientId: string) =>
    patients.find((p) => p.$id === patientId)?.email ?? undefined;

  const filteredPatients = (riskData?.patients ?? []).filter((p) =>
    filter === "all" ? true : p.risk_level === filter
  ) ?? [];

  const summary = riskData?.summary ?? { high: 0, medium: 0, low: 0 };
  const total   = (summary.high + summary.medium + summary.low);

  return (
    <DashboardLayout>
      <Header
        title="AI Dashboard"
        subtitle="Risk analysis powered by Llama 3.3 70B"
      />
      <div className="clinical-page">

        {/* Stats */}
        <AIDashboardStats
          high={summary.high}
          medium={summary.medium}
          low={summary.low}
          total={total}
          loading={riskLoading}
        />

        {/* Department load */}
        <DepartmentLoadChart
          predictions={deptLoad?.predictions ?? []}
          loading={deptLoading}
        />

        {/* Patient risk list */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-base font-semibold text-slate-900">
              Patient risk assessment
            </h2>
            <div className="flex items-center gap-2">
              {/* Filter buttons */}
              <div className="flex border rounded-lg overflow-hidden text-xs">
                {(["all", "high", "medium", "low"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 capitalize transition-colors ${
                      filter === f
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-xs"
                onClick={() => { fetchRiskData(); fetchDeptLoad(); }}
                disabled={riskLoading}
              >
                <RefreshCw className={`w-3 h-3 ${riskLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {riskLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">
                {filter === "all"
                  ? "No patients scanned yet"
                  : `No ${filter} risk patients`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((p) => (
                <RiskPatientCard
                  key={p.patient_id}
                  result={p}
                  patientEmail={getPatientEmail(p.patient_id)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}