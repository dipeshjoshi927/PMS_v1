import Link from "next/link";
import { Patient } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, MapPin, ChevronRight, Mail } from "lucide-react";

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
      <Card className="group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-clinical">
        <CardContent className="pb-4 pt-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-primary">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate font-semibold text-slate-950 transition-colors group-hover:text-primary">
                  {patient.name}
                </h3>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-primary" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500">{patient.age} yrs</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${genderColor[patient.gender]}`}>
                  {patient.gender}
                </span>
              </div>
              <div className="mt-3 space-y-1.5">
                {patient.phone && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="w-3 h-3" />
                    {patient.phone}
                  </p>
                )}
                {patient.email && (
                  <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                    <Mail className="h-3 w-3 shrink-0" />
                    {patient.email}
                  </p>
                )}
                {patient.address && (
                  <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {patient.address}
                  </p>
                )}
              </div>
              {patient.medical_history && (
                <p className="mt-3 line-clamp-2 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
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
