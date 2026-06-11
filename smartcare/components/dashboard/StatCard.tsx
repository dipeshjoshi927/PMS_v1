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
  blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   value: "text-blue-700"   },
  green:  { bg: "bg-green-50",  icon: "text-green-600",  value: "text-green-700"  },
  orange: { bg: "bg-orange-50", icon: "text-orange-600", value: "text-orange-700" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", value: "text-purple-700" },
  red:    { bg: "bg-red-50",    icon: "text-red-600",    value: "text-red-700"    },
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
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className={cn("text-3xl font-bold", c.value)}>
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
          <div className={cn("p-3 rounded-xl", c.bg)}>
            <Icon className={cn("w-6 h-6", c.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}