"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeptPrediction {
  department:      string;
  predicted_count: number;
  trend:           "up" | "stable" | "down";
}

interface DepartmentLoadChartProps {
  predictions: DeptPrediction[];
  loading:     boolean;
}

const trendConfig = {
  up:     { icon: TrendingUp,   color: "text-red-500",   label: "Increasing" },
  stable: { icon: Minus,        color: "text-amber-500", label: "Stable"     },
  down:   { icon: TrendingDown, color: "text-green-500", label: "Decreasing" },
};

const barColors = [
  "bg-blue-500", "bg-purple-500", "bg-teal-500",
  "bg-orange-500", "bg-pink-500", "bg-indigo-500",
];

export default function DepartmentLoadChart({
  predictions,
  loading,
}: DepartmentLoadChartProps) {
  const max = Math.max(...predictions.map((p) => p.predicted_count), 1);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Predicted department load — next 7 days
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-28 h-4 bg-slate-100 rounded animate-pulse" />
                <div className="flex-1 h-6 bg-slate-100 rounded animate-pulse" />
                <div className="w-8 h-4 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : predictions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            Not enough appointment data to predict load.
          </p>
        ) : (
          <div className="space-y-3">
            {predictions.map((p, i) => {
              const pct       = Math.round((p.predicted_count / max) * 100);
              const trendCfg  = trendConfig[p.trend];
              const TrendIcon = trendCfg.icon;

              return (
                <div key={p.department} className="flex items-center gap-3">
                  <p className="text-xs text-slate-600 w-28 shrink-0 truncate font-medium">
                    {p.department}
                  </p>
                  <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        barColors[i % barColors.length]
                      )}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 w-6 text-right shrink-0">
                    {p.predicted_count}
                  </p>
                  <TrendIcon className={cn("w-3.5 h-3.5 shrink-0", trendCfg.color)} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}