"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { AlertTriangle, Mail, Loader2, User } from "lucide-react";
import type { PatientRiskResult } from "@/lib/risk";

interface RiskPatientCardProps {
  result:       PatientRiskResult;
  patientEmail?: string;
}

const levelConfig = {
  high:   { bar: "bg-red-500",    badge: "bg-red-100 text-red-700",    label: "High risk"    },
  medium: { bar: "bg-amber-500",  badge: "bg-amber-100 text-amber-700", label: "Medium risk"  },
  low:    { bar: "bg-green-500",  badge: "bg-green-100 text-green-700", label: "Low risk"     },
};

const severityColor = {
  high:   "text-red-600",
  medium: "text-amber-600",
  low:    "text-slate-500",
};

export default function RiskPatientCard({
  result,
  patientEmail,
}: RiskPatientCardProps) {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const cfg = levelConfig[result.risk_level];

  const handleAlert = async () => {
    if (!patientEmail) {
      toast({
        title:       "No email on file",
        description: "This patient does not have an email address.",
        variant:     "destructive",
      });
      return;
    }

    setSending(true);
    try {
      await fetch("/api/send-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "risk_alert",
          to:   patientEmail,
          data: {
            patientName:    result.patient_name,
            riskScore:      result.risk_score,
            riskLevel:      result.risk_level,
            riskFactors:    result.risk_factors.map((f) => f.factor),
            recommendation: result.recommendation,
          },
        }),
      });
      toast({ title: "Alert sent", description: `Email sent to ${result.patient_name}` });
    } catch {
      toast({ title: "Failed to send alert", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 rounded-lg">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">
                {result.patient_name}
              </p>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                cfg.badge
              )}>
                {cfg.label}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-slate-900">
              {result.risk_score}
            </p>
            <p className="text-xs text-slate-400">/ 100</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", cfg.bar)}
            style={{ width: `${result.risk_score}%` }}
          />
        </div>

        {/* Risk factors */}
        <div className="space-y-1 mb-3">
          {result.risk_factors.slice(0, 3).map((f, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <AlertTriangle className={cn(
                "w-3 h-3 mt-0.5 shrink-0",
                severityColor[f.severity]
              )} />
              <p className="text-xs text-slate-600">{f.factor}</p>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 mb-3 leading-relaxed">
          {result.recommendation}
        </p>

        {/* Alert button */}
        {result.risk_level !== "low" && (
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-2 text-xs"
            onClick={handleAlert}
            disabled={sending}
          >
            {sending
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Sending...</>
              : <><Mail className="w-3 h-3" /> Send alert email</>
            }
          </Button>
        )}
      </CardContent>
    </Card>
  );
}