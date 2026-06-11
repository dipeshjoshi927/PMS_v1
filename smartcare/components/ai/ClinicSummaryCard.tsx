"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Users, Calendar, TrendingUp,
   AlertTriangle, Lightbulb,
} from "lucide-react";
import type { ClinicSummary } from "@/lib/groq";

interface ClinicSummaryCardProps {
  summary:  ClinicSummary;
  onEmail?: () => void;
  emailing?: boolean;
}

interface SectionProps {
  title:   string;
  items:   string[];
  icon:    React.ElementType;
  iconBg:  string;
  iconColor: string;
}

function SummarySection({ title, items, icon: Icon, iconBg, iconColor }: SectionProps) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-lg", iconBg)}>
          <Icon className={cn("w-3.5 h-3.5", iconColor)} />
        </div>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {title}
        </p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="text-slate-300 mt-0.5 shrink-0">—</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ClinicSummaryCard({
  summary,
  onEmail,
  emailing,
}: ClinicSummaryCardProps) {
  return (
    <div className="space-y-4">

      {/* Alerts */}
      {summary.alerts.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
              Alerts
            </p>
            {summary.alerts.map((a, i) => (
              <p key={i} className="text-sm text-red-700">{a}</p>
            ))}
          </div>
        </div>
      )}

      {/* Overview */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Executive Overview — {summary.period}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
            {summary.overview}
          </p>
        </CardContent>
      </Card>

      {/* Sections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 space-y-5">
            <SummarySection
              title="Patient Insights"
              items={summary.patient_insights}
              icon={Users}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            <SummarySection
              title="Appointment Stats"
              items={summary.appointment_stats}
              icon={Calendar}
              iconBg="bg-green-50"
              iconColor="text-green-600"
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 space-y-5">
            <SummarySection
              title="Health Trends"
              items={summary.health_trends}
              icon={TrendingUp}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
            />
            <SummarySection
              title="Recommendations"
              items={summary.recommendations}
              icon={Lightbulb}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />
          </CardContent>
        </Card>
      </div>

      {/* Generated at + email */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-400">
          Generated {new Date(summary.generated_at).toLocaleString()}
        </p>
        {onEmail && (
          <Button
            size="sm"
            variant="outline"
            onClick={onEmail}
            disabled={emailing}
            className="gap-2 text-xs"
          >
            {emailing ? "Sending..." : "Email this report"}
          </Button>
        )}
      </div>

    </div>
  );
}