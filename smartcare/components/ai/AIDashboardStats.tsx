import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIDashboardStatsProps {
  high:      number;
  medium:    number;
  low:       number;
  total:     number;
  loading:   boolean;
}

export default function AIDashboardStats({
  high, medium, low, total, loading,
}: AIDashboardStatsProps) {
  const cards = [
    {
      title: "Total patients scanned",
      value: total,
      icon:  Users,
      bg:    "bg-blue-50",
      color: "text-blue-600",
    },
    {
      title: "High risk",
      value: high,
      icon:  AlertTriangle,
      bg:    "bg-red-50",
      color: "text-red-600",
    },
    {
      title: "Medium risk",
      value: medium,
      icon:  TrendingUp,
      bg:    "bg-amber-50",
      color: "text-amber-600",
    },
    {
      title: "Low risk",
      value: low,
      icon:  Shield,
      bg:    "bg-green-50",
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ title, value, icon: Icon, bg, color }) => (
        <Card key={title} className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {loading
                    ? <span className="inline-block w-8 h-6 bg-slate-100 rounded animate-pulse" />
                    : value
                  }
                </p>
              </div>
              <div className={cn("p-2 rounded-lg", bg)}>
                <Icon className={cn("w-4 h-4", color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}