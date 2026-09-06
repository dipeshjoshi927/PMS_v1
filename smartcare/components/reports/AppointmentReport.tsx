"use client";

import { useState } from "react";
import { 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppointmentStat {
  title: string;
  value: string | number;
  change: string;
  icon: React.ElementType;
  color: string;
}

interface DailyAppointment {
  day: string;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

const appointmentStats: AppointmentStat[] = [
  { title: "Total Appointments", value: 342, change: "+8%", icon: Calendar, color: "bg-blue-600" },
  { title: "Completed", value: 298, change: "+12%", icon: CheckCircle, color: "bg-emerald-600" },
  { title: "Cancelled", value: 24, change: "-5%", icon: XCircle, color: "bg-red-600" },
  { title: "No Shows", value: 20, change: "-15%", icon: Clock, color: "bg-amber-600" },
];

const dailyData: DailyAppointment[] = [
  { day: "Mon", scheduled: 45, completed: 38, cancelled: 4, noShow: 3 },
  { day: "Tue", scheduled: 52, completed: 46, cancelled: 3, noShow: 3 },
  { day: "Wed", scheduled: 48, completed: 42, cancelled: 4, noShow: 2 },
  { day: "Thu", scheduled: 55, completed: 48, cancelled: 5, noShow: 2 },
  { day: "Fri", scheduled: 50, completed: 44, cancelled: 3, noShow: 3 },
  { day: "Sat", scheduled: 32, completed: 28, cancelled: 2, noShow: 2 },
  { day: "Sun", scheduled: 20, completed: 18, cancelled: 1, noShow: 1 },
];

const timeSlots = [
  { time: "9:00 AM", count: 12 },
  { time: "10:00 AM", count: 15 },
  { time: "11:00 AM", count: 14 },
  { time: "12:00 PM", count: 8 },
  { time: "2:00 PM", count: 16 },
  { time: "3:00 PM", count: 14 },
  { time: "4:00 PM", count: 11 },
];

export default function AppointmentReport() {
  const [period, setPeriod] = useState("30days");

  const maxCount = Math.max(...dailyData.map(d => d.scheduled));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Appointment Report</h2>
          <p className="text-sm text-slate-500">Scheduling efficiency and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {appointmentStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
                    <span className="text-xs text-slate-400">vs last period</span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Daily Appointments</CardTitle>
            <CardDescription>Appointments by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyData.map((day) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900 w-12">{day.day}</span>
                    <span className="text-slate-500">{day.scheduled} scheduled</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(day.completed / maxCount) * 100}%` }}
                    />
                    <div
                      className="h-full bg-red-400"
                      style={{ width: `${(day.cancelled / maxCount) * 100}%` }}
                    />
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${(day.noShow / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-500">Completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="text-xs text-slate-500">Cancelled</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-xs text-slate-500">No Show</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Peak Hours</CardTitle>
            <CardDescription>Most popular appointment times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeSlots.map((slot) => (
                <div key={slot.time} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{slot.time}</span>
                  <div className="flex items-center gap-3 flex-1 mx-4">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${(slot.count / 16) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-slate-500 w-8 text-right">{slot.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Appointment Summary</CardTitle>
          <CardDescription>Key performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-sm text-slate-500">Completion Rate</p>
              <p className="text-2xl font-bold text-slate-900">87%</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-sm text-slate-500">Cancellation Rate</p>
              <p className="text-2xl font-bold text-slate-900">7%</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-sm text-slate-500">No Show Rate</p>
              <p className="text-2xl font-bold text-slate-900">6%</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-sm text-slate-500">Avg. Daily Appointments</p>
              <p className="text-2xl font-bold text-slate-900">43</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}