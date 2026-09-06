"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Stethoscope } from "lucide-react";
import type { SymptomCheckResult } from "@/lib/groq";

interface SymptomFormProps {
  onResult: (result: SymptomCheckResult) => void;
}

export default function SymptomForm({ onResult }: SymptomFormProps) {
  const [symptoms, setSymptoms] = useState("");
  const [age,      setAge]      = useState("");
  const [gender,   setGender]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError("Please describe your symptoms.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/symptom-check", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ symptoms, age, gender }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Analysis failed. Please try again.");
        return;
      }

      onResult(data);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="symptoms">
          Describe your symptoms <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="symptoms"
          placeholder="e.g. I have had a severe headache for 2 days, with fever and stiff neck. I also feel nauseous and sensitive to light..."
          rows={5}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          maxLength={1000}
          required
        />
        <p className="text-xs text-slate-400 text-right">
          {symptoms.length}/1000
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="age">Age (optional)</Label>
          <Input
            id="age"
            type="number"
            placeholder="e.g. 35"
            min="1"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Gender (optional)</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full gap-2"
        disabled={loading || !symptoms.trim()}
        size="lg"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing symptoms...</>
          : <><Stethoscope className="w-4 h-4" /> Analyze Symptoms</>
        }
      </Button>
    </form>
  );
}