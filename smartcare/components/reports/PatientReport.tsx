"use client";

import { 
  Users, 
  UserPlus, 
  UserMinus,
  TrendingUp,
  Calendar,
  Activity,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AgeGroup {
  range: string;
  count: number;
  percentage: number;
}

const ageGroups: AgeGroup[] = [
  { range: "0-17", count: 234, percentage: 18 },
  { range: "18-34", count: 356, percentage: 28 },
  { range: "35-54", count: 389, percentage: 30 },
  { range: "55-74", count: 245, percentage: 19 },
  { range: "75+", count: 60, percentage: 5 },
];

const topConditions = [
  { name: "Hypertension", count: 145 },
  { name: "Diabetes Type 2", count: 123 },
  { name: "Asthma", count: 89 },
  { name: "Arthritis", count: 67 },
  { name: "Heart Disease", count: 45 },
];

export default function PatientReport() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Patient Report</h2>
          <p className="text-sm text-slate-500">Patient demographics and health analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="30days">
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
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Total Patients</p>
                <p className="text-2xl font-bold text-slate-900">1,284</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">+12%</span>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-600">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">New Patients</p>
                <p className="text-2xl font-bold text-slate-900">89</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">+8%</span>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-600">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Returning</p>
                <p className="text-2xl font-bold text-slate-900">245</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">+15%</span>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-violet-600">
                <UserMinus className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Appointments/Patient</p>
                <p className="text-2xl font-bold text-slate-900">2.4</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">+5%</span>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-600">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Age Distribution</CardTitle>
            <CardDescription>Patients by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ageGroups.map((group) => (
                <div key={group.range} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-900">{group.range} years</span>
                    <span className="text-slate-500">{group.count} patients ({group.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${group.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Conditions</CardTitle>
            <CardDescription>Most common health conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topConditions.map((condition, index) => (
                <div key={condition.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-400 w-5">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-900">
                        {condition.name}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {condition.count} patients
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}