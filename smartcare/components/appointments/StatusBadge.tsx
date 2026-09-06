import { AppointmentStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: AppointmentStatus;
  size?:  "sm" | "md";
}

const styles: Record<AppointmentStatus, string> = {
  scheduled: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const dots: Record<AppointmentStatus, string> = {
  scheduled: "bg-cyan-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-500",
};

export default function StatusBadge({
  status,
  size = "md",
}: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium capitalize",
      styles[status],
      size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1"
    )}>
      <span className={cn(
        "rounded-full shrink-0",
        dots[status],
        size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
      )} />
      {status}
    </span>
  );
}
