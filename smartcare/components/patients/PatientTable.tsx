"use client";

import Link from "next/link";
import { Patient } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";

interface PatientTableProps {
  patients: Patient[];
  onEdit?:  (patient: Patient) => void;
}

const genderVariant: Record<string, string> = {
  male:   "bg-blue-100 text-blue-700",
  female: "bg-pink-100 text-pink-700",
  other:  "bg-slate-100 text-slate-700",
};

export default function PatientTable({ patients, onEdit }: PatientTableProps) {
  if (patients.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="font-semibold text-slate-600">Name</TableHead>
            <TableHead className="font-semibold text-slate-600">Age</TableHead>
            <TableHead className="font-semibold text-slate-600">Gender</TableHead>
            <TableHead className="font-semibold text-slate-600">Phone</TableHead>
            <TableHead className="font-semibold text-slate-600">Address</TableHead>
            <TableHead className="font-semibold text-slate-600 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((p) => (
            <TableRow key={p.$id} className="hover:bg-slate-50/80">
              <TableCell className="font-medium text-slate-900">{p.name}</TableCell>
              <TableCell className="text-slate-600">{p.age}</TableCell>
              <TableCell>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${genderVariant[p.gender]}`}>
                  {p.gender}
                </span>
              </TableCell>
              <TableCell className="text-slate-600">{p.phone}</TableCell>
              <TableCell className="text-slate-500 max-w-[160px] truncate">
                {p.address || "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/patients/${p.$id}`}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onEdit(p)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}