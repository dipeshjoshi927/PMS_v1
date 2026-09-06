import Link from "next/link";
import { Prescription } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, FileText, User, ChevronRight } from "lucide-react";

interface PrescriptionCardProps {
  prescription: Prescription;
  patientName:  string;
}

export default function PrescriptionCard({
  prescription,
  patientName,
}: PrescriptionCardProps) {
  return (
    <Link href={`/prescriptions/${prescription.$id}`}>
      <Card className="group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-clinical">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-950 transition-colors group-hover:text-violet-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{patientName}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="h-3 w-3" />
                    {prescription.date}
                  </p>
                </div>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-violet-500" />
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Medications
                  </p>
                  <p className="line-clamp-3 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                    {prescription.medications}
                  </p>
                </div>
                {prescription.instructions && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Instructions
                    </p>
                    <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                      {prescription.instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
