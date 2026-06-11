"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getReportSummary, type ReportSummary } from "@/lib/reports";
import { useToast } from "@/components/ui/use-toast";
import {
  Users, Calendar, ClipboardList,
  TrendingUp, CheckCircle, XCircle, Clock,
} from "lucide-react";

export default function ReportsPage() {
  const [data,    setData]    = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getReportSummary()
      .then(setData)
      .catch(() => toast({ title: "Error loading reports", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const maxAppts = data
    ? Math.max(...data.monthly.map((m) => m.appointments), 1)
    : 1;

  const statusRows = [
    {
      label: "Scheduled",
      value: data?.scheduledAppointments ?? 0,
      icon:  Clock,
      color: "text-blue-600",
      bg:    "bg-blue-50",
      bar:   "bg-blue-500",
    },
    {
      label: "Completed",
      value: data?.completedAppointments ?? 0,
      icon:  CheckCircle,
      color: "text-green-600",
      bg:    "bg-green-50",
      bar:   "bg-green-500",
    },
    {
      label: "Cancelled",
      value: data?.cancelledAppointments ?? 0,
      icon:  XCircle,
      color: "text-red-600",
      bg:    "bg-red-50",
      bar:   "bg-red-500",
    },
  ];

  return (
    <DashboardLayout>
      <Header title="Reports" subtitle="Summary statistics and analytics" />
      <div className="clinical-page">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value={data?.totalPatients ?? 0}
            icon={Users}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Total Appointments"
            value={data?.totalAppointments ?? 0}
            icon={Calendar}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Total Prescriptions"
            value={data?.totalPrescriptions ?? 0}
            icon={ClipboardList}
            color="purple"
            loading={loading}
          />
          <StatCard
            title="Today's Appointments"
            value={data?.todayAppointments ?? 0}
            icon={TrendingUp}
            color="orange"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card className="">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Appointment Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {statusRows.map(({ label, value, icon: Icon, color, bg, bar }) => {
                    const total = data?.totalAppointments || 1;
                    const pct   = Math.round((value / total) * 100);
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${bg}`}>
                              <Icon className={`w-3.5 h-3.5 ${color}`} />
                            </div>
                            <span className="font-medium">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">{value} appts</span>
                            <span className={`font-semibold ${color}`}>{pct}%</span>
                          </div>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${bar} rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Appointments — Last 6 Months
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-48 rounded-lg" />
              ) : (
                <div className="flex items-end gap-2 h-48 pt-4">
                  {data?.monthly.map((m) => {
                    const heightPct = Math.max(
                      (m.appointments / maxAppts) * 100,
                      4
                    );
                    return (
                      <div
                        key={m.month}
                        className="flex-1 flex flex-col items-center gap-1 group"
                      >
                        <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          {m.appointments}
                        </span>
                        <div
                          className="w-full relative flex items-end"
                          style={{ height: "140px" }}
                        >
                          <div
                            className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all duration-300 cursor-default"
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 text-center leading-tight">
                          {m.month.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        <Card className="">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Monthly Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-48 rounded-lg" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 pr-4 font-semibold text-slate-600">
                        Month
                      </th>
                      <th className="text-right py-2 px-4 font-semibold text-slate-600">
                        New Patients
                      </th>
                      <th className="text-right py-2 px-4 font-semibold text-slate-600">
                        Appointments
                      </th>
                      <th className="text-right py-2 pl-4 font-semibold text-slate-600">
                        Prescriptions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.monthly.map((m) => (
                      <tr
                        key={m.month}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 pr-4 font-medium text-slate-800">
                          {m.month}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          {m.patients}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          {m.appointments}
                        </td>
                        <td className="py-3 pl-4 text-right text-slate-600">
                          {m.prescriptions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-200">
                      <td className="py-3 pr-4 font-semibold text-slate-800">
                        Total
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {data?.totalPatients}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {data?.totalAppointments}
                      </td>
                      <td className="py-3 pl-4 text-right font-semibold">
                        {data?.totalPrescriptions}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}