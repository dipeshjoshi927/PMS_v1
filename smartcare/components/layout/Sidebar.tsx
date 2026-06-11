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
    <div className="flex flex-col w-64 min-h-screen bg-slate-900 text-white shrink-0">
      {/* Logo / Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/60">
        <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
          <Heart className="w-5 h-5 text-white" />
        </div>

        <div>
          <h1 className="font-bold text-base leading-tight">SmartCare</h1>
          <p className="text-xs text-slate-400">Hospital Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
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
      <div className="px-3 pt-4 pb-5 border-t border-slate-700/60">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}