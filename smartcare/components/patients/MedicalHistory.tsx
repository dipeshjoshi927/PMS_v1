"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

interface MedicalHistoryProps {
  history: string;
}

export default function MedicalHistory({ history }: MedicalHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  if (!history) {
    return (
      <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-400 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        No medical history recorded
      </div>
    );
  }

  const lines   = history.split("\n");
  const isLong  = lines.length > 4 || history.length > 300;
  const preview = isLong && !expanded
    ? lines.slice(0, 4).join("\n")
    : history;

  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Medical History</span>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
          {preview}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            {expanded
              ? <><ChevronUp className="w-3 h-3" /> Show less</>
              : <><ChevronDown className="w-3 h-3" /> Show more</>
            }
          </button>
        )}
      </div>
    </div>
  );
}