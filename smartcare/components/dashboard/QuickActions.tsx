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
    color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
  },
  {
    label: "Book Appointment",
    href:  "/appointments",
    icon:  CalendarPlus,
    color: "bg-green-50 text-green-600 hover:bg-green-100",
  },
  {
    label: "New Prescription",
    href:  "/prescriptions",
    icon:  ClipboardPlus,
    color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
  },
  {
    label: "View Reports",
    href:  "/reports",
    icon:  FileBarChart,
    color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
  },
];

export default function QuickActions() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <div className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors cursor-pointer ${color}`}>
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