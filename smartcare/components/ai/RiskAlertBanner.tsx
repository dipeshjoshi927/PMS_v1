"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";

interface RiskAlertBannerProps {
  highRiskCount: number;
}

export default function RiskAlertBanner({ highRiskCount }: RiskAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || highRiskCount === 0) return null;

  return (
    <div className="bg-red-50 border-b border-red-200">
      <div className="flex items-center justify-between px-8 py-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">
            <strong>{highRiskCount} patient{highRiskCount > 1 ? "s" : ""}</strong> flagged
            as high risk and require{highRiskCount === 1 ? "s" : ""} immediate attention.{" "}
            <Link
              href="/ai-dashboard"
              className="underline font-medium hover:text-red-900"
            >
              View AI Dashboard →
            </Link>
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-red-100 transition-colors"
        >
          <X className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}