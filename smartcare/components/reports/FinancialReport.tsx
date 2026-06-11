"use client";

import { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Receipt,
  Wallet,
  Download,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Transaction {
  id: string;
  patient: string;
  service: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "refunded";
  method: "card" | "cash" | "insurance";
}

const mockTransactions: Transaction[] = [
  { id: "1", patient: "Sarah Johnson", service: "General Checkup", amount: 150, date: "2024-01-15", status: "paid", method: "card" },
  { id: "2", patient: "Michael Chen", service: "Lab Test - Blood Work", amount: 200, date: "2024-01-15", status: "paid", method: "insurance" },
  { id: "3", patient: "Emily Davis", service: "Dental Cleaning", amount: 100, date: "2024-01-14", status: "pending", method: "cash" },
  { id: "4", patient: "James Wilson", service: "Consultation", amount: 200, date: "2024-01-14", status: "paid", method: "card" },
  { id: "5", patient: "Amanda Brown", service: "X-Ray", amount: 250, date: "2024-01-13", status: "paid", method: "insurance" },
  { id: "6", patient: "Robert Taylor", service: "Follow-up", amount: 75, date: "2024-01-13", status: "refunded", method: "card" },
  { id: "7", patient: "Lisa Anderson", service: "Annual Physical", amount: 180, date: "2024-01-12", status: "paid", method: "card" },
  { id: "8", patient: "David Martinez", service: "Prescription", amount: 45, date: "2024-01-12", status: "paid", method: "cash" },
];

const summaryCards = [
  { title: "Total Revenue", value: "$48,520", change: "+23%", icon: DollarSign, color: "bg-emerald-600" },
  { title: "Pending Payments", value: "$2,340", change: "-5%", icon: Receipt, color: "bg-amber-600" },
  { title: "Average Transaction", value: "$142", change: "+8%", icon: Wallet, color: "bg-blue-600" },
  { title: "Insurance Claims", value: "$12,450", change: "+15%", icon: CreditCard, color: "bg-violet-600" },
];

export default function FinancialReport() {
  const [dateRange, setDateRange] = useState("30days");

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "paid": return "bg-emerald-100 text-emerald-700";
      case "pending": return "bg-amber-100 text-amber-700";
      case "refunded": return "bg-red-100 text-red-700";
    }
  };

  const getMethodIcon = (method: Transaction["method"]) => {
    switch (method) {
      case "card": return CreditCard;
      case "cash": return Wallet;
      case "insurance": return Receipt;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financial Report</h2>
          <p className="text-sm text-slate-500">Revenue, transactions, and payment analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select range" />
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
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                  <div className="flex items-center gap-1">
                    {card.change.startsWith("+") ? (
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${card.change.startsWith("+") ? "text-emerald-600" : "text-red-600"}`}>
                      {card.change}
                    </span>
                    <span className="text-xs text-slate-400">vs last period</span>
                  </div>
                </div>
                <div className={`p-2.5 rounded-lg ${card.color}`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          <CardDescription>Latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockTransactions.map((transaction) => {
              const MethodIcon = getMethodIcon(transaction.method);
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-slate-200">
                      <MethodIcon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-slate-900">{transaction.patient}</p>
                      <p className="text-xs text-slate-500">{transaction.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500">{transaction.date}</span>
                    <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                    <span className="text-sm font-semibold text-slate-900 w-20 text-right">
                      ${transaction.amount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}