import Link from "next/link";
import { Patient } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, MapPin, ChevronRight } from "lucide-react";

interface PatientCardProps {
  patient: Patient;
}

const genderColor = {
  male:   "bg-blue-50 text-blue-700",
  female: "bg-pink-50 text-pink-700",
  other:  "bg-slate-50 text-slate-700",
};

export default function PatientCard({ patient }: PatientCardProps) {
  return (
    <Link href={`/patients/${patient.$id}`}>
      <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer group">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {patient.name}
                </h3>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500">{patient.age} yrs</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${genderColor[patient.gender]}`}>
                  {patient.gender}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {patient.phone && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />
                    {patient.phone}
                  </p>
                )}
                {patient.address && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {patient.address}
                  </p>
                )}
              </div>
              {patient.medical_history && (
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 border-t border-slate-100 pt-2">
                  {patient.medical_history}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}