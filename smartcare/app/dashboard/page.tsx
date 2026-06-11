"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import RecentAppointments from "@/components/dashboard/RecentAppointments";
import QuickActions from "@/components/dashboard/QuickActions";
import RiskAlertBanner from "@/components/ai/RiskAlertBanner";
import { getPatients } from "@/lib/patients";
import { getAppointments, getTodayAppointments } from "@/lib/appointments";
import { getPrescriptions } from "@/lib/prescriptions";
import { useToast } from "@/components/ui/use-toast";
import { Users, Calendar, ClipboardList, TrendingUp } from "lucide-react";
import type { Appointment, Patient } from "@/types";

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [prescCount, setPrescCount] = useState(0);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [patientMap, setPatientMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, a, pr, t] = await Promise.all([
          getPatients(),
          getAppointments(),
          getPrescriptions(),
          getTodayAppointments(),
        ]);

        setPatients(p);
        setAppointments(a);
        setPrescCount(pr.length);
        setTodayCount(t.length);

        const map: Record<string, string> = {};
        p.forEach((pt) => {
          map[pt.$id] = pt.name;
        });
        setPatientMap(map);

        // Risk scan
        fetch("/api/ai/risk-scan")
          .then((r) => r.json())
          .then((data) => setHighRiskCount(data?.summary?.high ?? 0))
          .catch(() => {});
      } catch {
        toast({
          title: "Error loading dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [toast]);

  return (
    <DashboardLayout>
      <Header
        title="Dashboard"
        subtitle={format(new Date(), "EEEE, MMMM do yyyy")}
      />

      <div className="p-6 lg:p-8 space-y-6">

        {/* Risk banner */}
        <RiskAlertBanner highRiskCount={highRiskCount} />

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value={patients.length}
            icon={Users}
            color="blue"
            loading={loading}
          />

          <StatCard
            title="Total Appointments"
            value={appointments.length}
            icon={Calendar}
            color="green"
            loading={loading}
          />

          <StatCard
            title="Today's Appointments"
            value={todayCount}
            icon={TrendingUp}
            color="orange"
            loading={loading}
          />

          <StatCard
            title="Prescriptions Issued"
            value={prescCount}
            icon={ClipboardList}
            color="purple"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentAppointments
              appointments={appointments.slice(0, 6)}
              patientNames={patientMap}
              loading={loading}
            />
          </div>

          <div>
            <QuickActions />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}