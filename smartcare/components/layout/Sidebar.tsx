"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { account } from "@/lib/appwrite";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  FileText,
  LogOut,
  Heart,
  ChevronRight,
  Stethoscope,
  BrainCircuit,
  FileBarChart,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/prescriptions", label: "Prescriptions", icon: ClipboardList },
  { href: "/reports", label: "Reports", icon: FileText },

  // AI Features
  { href: "/ai-dashboard", label: "AI Dashboard", icon: BrainCircuit },
  { href: "/symptom-checker", label: "Symptom Checker", icon: Stethoscope },
  { href: "/clinic-summary", label: "Clinic Summary", icon: FileBarChart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Logout failed:", error);
    }

    router.push("/login");
  };

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white text-slate-900 shadow-soft">
      {/* Logo / Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
        <div className="rounded-lg bg-primary p-2 shadow-sm">
          <Heart className="w-5 h-5 text-white" />
        </div>

        <div>
          <h1 className="font-bold text-base leading-tight">SmartCare</h1>
          <p className="text-xs text-slate-500">Patient Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />

              <span className="flex-1">{label}</span>

              {active && (
                <ChevronRight className="w-3 h-3 opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200 px-3 pb-5 pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
