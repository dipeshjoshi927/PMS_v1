import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title:    string;
  value:    number | string;
  icon:     LucideIcon;
  color:    "blue" | "green" | "orange" | "purple" | "red";
  loading?: boolean;
  suffix?:  string;
}

const colorMap = {
  blue:   { bg: "bg-cyan-50",    icon: "text-cyan-600",    value: "text-slate-950" },
  green:  { bg: "bg-emerald-50", icon: "text-emerald-600", value: "text-slate-950" },
  orange: { bg: "bg-amber-50",   icon: "text-amber-600",   value: "text-slate-950" },
  purple: { bg: "bg-violet-50",  icon: "text-violet-600",  value: "text-slate-950" },
  red:    { bg: "bg-red-50",     icon: "text-red-600",     value: "text-slate-950" },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
  suffix,
}: StatCardProps) {
  const c = colorMap[color];

  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-clinical">
      <CardContent className="pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <p className={cn("text-3xl font-bold tracking-tight", c.value)}>
              {loading ? (
                <span className="inline-block w-12 h-8 bg-slate-100 rounded animate-pulse" />
              ) : (
                <>
                  {value}
                  {suffix && (
                    <span className="text-lg font-normal text-slate-400 ml-1">
                      {suffix}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
          <div className={cn("rounded-lg p-3", c.bg)}>
            <Icon className={cn("w-6 h-6", c.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
