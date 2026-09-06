import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  CalendarPlus,
  ClipboardPlus,
  FileBarChart,
} from "lucide-react";

const actions = [
  {
    label: "Add Patient",
    href:  "/patients",
    icon:  UserPlus,
    color: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
  },
  {
    label: "Book Appointment",
    href:  "/appointments",
    icon:  CalendarPlus,
    color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  },
  {
    label: "New Prescription",
    href:  "/prescriptions",
    icon:  ClipboardPlus,
    color: "bg-violet-50 text-violet-700 hover:bg-violet-100",
  },
  {
    label: "View Reports",
    href:  "/reports",
    icon:  FileBarChart,
    color: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  },
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <div className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg p-4 text-center transition-all hover:-translate-y-0.5 ${color}`}>
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium text-center leading-tight">
                {label}
              </span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
