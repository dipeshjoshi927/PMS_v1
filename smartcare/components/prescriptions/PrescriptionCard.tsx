import Link from "next/link";
import { Prescription } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, User, ChevronRight } from "lucide-react";

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
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer group">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-purple-50 rounded-xl shrink-0">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5 group-hover:text-purple-600 transition-colors">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{patientName}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {prescription.date}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-400 shrink-0 mt-0.5 transition-colors" />
              </div>
              <div className="mt-2.5 space-y-1.5">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Medications
                  </p>
                  <p className="text-sm text-slate-700 line-clamp-2">
                    {prescription.medications}
                  </p>
                </div>
                {prescription.instructions && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                      Instructions
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1">
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