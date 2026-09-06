"use client";

import { Prescription, Patient } from "@/types";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintPrescriptionProps {
  prescription: Prescription;
  patient:      Patient;
  doctorName?:  string;
}

export default function PrintPrescription({
  prescription,
  patient,
  doctorName = "Dr. Smith",
}: PrintPrescriptionProps) {
  const handlePrint = () => window.print();

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 no-print"
        onClick={handlePrint}
      >
        <Printer className="w-4 h-4" /> Print
      </Button>

      <div className="hidden print:block p-8 max-w-2xl mx-auto font-sans">

        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">SmartCare Hospital</h1>
          <p className="text-sm text-slate-500">Hospital Management System</p>
          <div className="mt-2 flex justify-between text-sm">
            <span className="font-medium">{doctorName}</span>
            <span>Date: {prescription.date}</span>
          </div>
        </div>

        <div className="mb-6 rounded border border-slate-200 bg-slate-50 p-4">
          <h2 className="font-semibold text-slate-700 mb-2">Patient Information</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500">Name: </span>
              <span className="font-medium">{patient.name}</span>
            </div>
            <div>
              <span className="text-slate-500">Age: </span>
              <span className="font-medium">{patient.age} years</span>
            </div>
            <div>
              <span className="text-slate-500">Gender: </span>
              <span className="font-medium capitalize">{patient.gender}</span>
            </div>
            <div>
              <span className="text-slate-500">Phone: </span>
              <span className="font-medium">{patient.phone}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl font-serif text-slate-700">℞</span>
            <h2 className="font-semibold text-slate-700 text-lg">Medications</h2>
          </div>
          <div className="min-h-32 rounded border border-slate-200 p-4">
            <p className="whitespace-pre-line text-sm leading-relaxed">
              {prescription.medications}
            </p>
          </div>
        </div>

        {prescription.instructions && (
          <div className="mb-6">
            <h2 className="font-semibold text-slate-700 mb-2">Instructions</h2>
            <p className="rounded border border-slate-200 p-4 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
              {prescription.instructions}
            </p>
          </div>
        )}

        <div className="mt-12 flex justify-between text-sm border-t pt-4">
          <div>
            <div className="h-10 border-b border-slate-400 w-40 mb-1" />
            <p className="text-slate-500">Doctor&apos;s Signature</p>
          </div>
          <div className="text-right text-slate-400">
            <p>SmartCare Hospital</p>
            <p>Printed: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

      </div>
    </>
  );
}
