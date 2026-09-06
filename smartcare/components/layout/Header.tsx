"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Bell } from "lucide-react";
import MobileSidebar from "./MobileSidebar";
import ThemeToggle from "@/components/theme-toggle";

interface HeaderProps {
  title:    string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    account.get()
      .then((u) => setUserName(u.name))
      .catch(() => {});
  }, []);

  return (
    <header className="app-header sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:gap-4 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex min-w-0 items-center gap-3">
        <MobileSidebar />
        <div className="min-w-0">
        <h1 className="truncate text-lg font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-2xl">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</p>
        )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <button className="relative hidden rounded-md p-2 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:block" aria-label="Notifications">
          <Bell className="w-5 h-5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-white px-2 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-sm font-semibold text-slate-700 sm:inline">{userName}</span>
        </div>
      </div>
    </header>
  );
}
