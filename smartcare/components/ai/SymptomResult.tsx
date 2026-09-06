"use client";

import { SymptomCheckResult } from "@/lib/groq";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Clock,
  Info,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SymptomResultProps {
  result:   SymptomCheckResult;
  onReset:  () => void;
}

const urgencyConfig = {
  emergency: {
    label: "EMERGENCY",
    color: "bg-red-100 text-red-800 border-red-300",
    bg:    "bg-red-50 border-red-200",
    icon:  ShieldAlert,
    desc:  "Seek immediate emergency care. Call an ambulance or go to the ER now.",
  },
  urgent: {
    label: "URGENT",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    bg:    "bg-orange-50 border-orange-200",
    icon:  AlertTriangle,
    desc:  "See a doctor today or visit an urgent care clinic.",
  },
  routine: {
    label: "ROUTINE",
    color: "bg-green-100 text-green-800 border-green-300",
    bg:    "bg-green-50 border-green-200",
    icon:  Clock,
    desc:  "Schedule an appointment with your doctor at your convenience.",
  },
};

const likelihoodConfig = {
  high:   { color: "bg-red-100 text-red-700",    label: "High"   },
  medium: { color: "bg-amber-100 text-amber-700", label: "Medium" },
  low:    { color: "bg-slate-100 text-slate-600", label: "Low"    },
};

export default function SymptomResult({ result, onReset }: SymptomResultProps) {
  const urgency = urgencyConfig[result.urgency];
  const UrgIcon = urgency.icon;

  return (
    <div className="space-y-4">

      {/* Urgency Banner */}
      <div className={cn(
        "flex items-start gap-3 p-4 rounded-lg border",
        urgency.bg
      )}>
        <UrgIcon className="w-5 h-5 mt-0.5 shrink-0 text-current" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full border",
              urgency.color
            )}>
              {urgency.label}
            </span>
          </div>
          <p className="text-sm font-medium">{urgency.desc}</p>
        </div>
      </div>

      {/* Department */}
      <Card className="">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Recommended department</p>
              <p className="font-semibold text-slate-900">{result.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Possible Conditions */}
      <Card className="">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500" />
            Possible conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.conditions.map((condition, i) => {
            const lh = likelihoodConfig[condition.likelihood];
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <CheckCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-sm text-slate-900">
                      {condition.name}
                    </p>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium",
                      lh.color
                    )}>
                      {lh.label} likelihood
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {condition.description}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Advice */}
      {result.advice && (
        <Card className="">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Immediate advice</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {result.advice}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Medical disclaimer:</strong> {result.disclaimer} This AI tool is
          for informational purposes only and does not replace professional
          medical advice, diagnosis, or treatment.
        </p>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2 pt-1"
      >
        Check different symptoms
      </button>

    </div>
  );
}