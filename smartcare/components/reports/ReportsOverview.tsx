"use client";

import { 
  TrendingUp, 
  Users, 
  Calendar,
  FileText,
  DollarSign,
  Download,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


interface ReportMetric {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ElementType;
}

const metrics: ReportMetric[] = [
  { title: "Total Patients", value: "1,284", change: "+12%", trend: "up", icon: Users },
  { title: "Appointments", value: "342", change: "+8%", trend: "up", icon: Calendar },
  { title: "Revenue", value: "$48,520", change: "+23%", trend: "up", icon: DollarSign },
  { title: "Prescriptions", value: "567", change: "+5%", trend: "up", icon: FileText },
];

const topServices = [
  { name: "General Checkup", count: 145, revenue: 14500 },
  { name: "Dental Cleaning", count: 89, revenue: 8900 },
  { name: "Lab Tests", count: 67, revenue: 13400 },
  { name: "Consultation", count: 45, revenue: 9000 },
  { name: "X-Ray", count: 23, revenue: 4600 },
];

export default function ReportsOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports Overview</h2>
          <p className="text-sm text-slate-500">Track your clinic performance and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">{metric.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-600">{metric.change}</span>
                    <span className="text-xs text-slate-400">vs last month</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-600">
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-400 w-5">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {service.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">{service.count} visits</span>
                    <span className="text-sm font-medium text-slate-900">
                      ${service.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-48 gap-2">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month) => {
                const height = 20 + Math.random() * 60;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-blue-600 rounded-t-md hover:bg-blue-700 transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-slate-500">{month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}