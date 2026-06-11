export interface RiskFactor {
  factor:      string;
  severity:    "high" | "medium" | "low";
}

export interface PatientRiskResult {
  patient_id:   string;
  patient_name: string;
  risk_score:   number;
  risk_level:   "high" | "medium" | "low";
  risk_factors: RiskFactor[];
  recommendation: string;
}

export interface RiskScanInput {
  patient_id:          string;
  patient_name:        string;
  age:                 number;
  gender:              string;
  medical_history:     string;
  total_appointments:  number;
  cancelled:           number;
  completed:           number;
  scheduled:           number;
  last_visit_days_ago: number;
}

const SYSTEM_PROMPT = `You are a healthcare risk assessment AI for SmartCare Hospital.
Analyze each patient's data and return ONLY a valid JSON array. No extra text, no markdown.

For each patient return:
{
  "patient_id": "same id as input",
  "patient_name": "same name as input",
  "risk_score": number between 0-100,
  "risk_level": "high|medium|low",
  "risk_factors": [
    { "factor": "description", "severity": "high|medium|low" }
  ],
  "recommendation": "one sentence action recommendation"
}

Scoring guide:
- 70-100 = high risk (needs immediate attention)
- 40-69  = medium risk (needs follow-up)
- 0-39   = low risk (routine monitoring)

Risk factors to consider:
- Age over 60 increases risk
- Serious medical history (diabetes, heart disease, cancer) increases risk
- High cancellation rate (cancelled / total > 0.4) increases risk
- Not visited in over 90 days increases risk
- Many scheduled but not completed appointments increases risk`;

export async function scanPatientRisks(
  patients: RiskScanInput[]
): Promise<PatientRiskResult[]> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY not set in .env.local");
  }

  if (patients.length === 0) return [];

  const BATCH_SIZE = 10;
  const results: PatientRiskResult[] = [];

  for (let i = 0; i < patients.length; i += BATCH_SIZE) {
    const batch = patients.slice(i, i + BATCH_SIZE);

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        model:       "llama-3.3-70b-versatile",
        temperature: 0,
        max_tokens:  2048,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role:    "user",
            content: `Analyze these patients and return a JSON array:\n${JSON.stringify(batch, null, 2)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `Groq API error: ${res.status}`);
    }

    const data  = await res.json();
    const text  = data.choices?.[0]?.message?.content ?? "[]";
    const clean = text.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(clean) as PatientRiskResult[];
      results.push(...parsed);
    } catch {
      console.error("Failed to parse risk batch:", clean);
    }
  }

  return results.sort((a, b) => b.risk_score - a.risk_score);
}

export async function predictDepartmentLoad(
  appointments: { date: string; status: string; notes: string }[]
): Promise<{ department: string; predicted_count: number; trend: "up" | "stable" | "down" }[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      model:       "llama-3.3-70b-versatile",
      temperature: 0,
      max_tokens:  1024,
      messages: [
        {
          role:    "system",
          content: `You are a hospital operations analyst. Given appointment data, predict next 7-day load per department.
Return ONLY a valid JSON array, no markdown:
[{ "department": "name", "predicted_count": number, "trend": "up|stable|down" }]
Base predictions on patterns in the notes and appointment frequency.
Include these departments if relevant: General Medicine, Cardiology, Orthopedics, Pediatrics, Neurology, Emergency.`,
        },
        {
          role:    "user",
          content: `Recent appointments data:\n${JSON.stringify(appointments.slice(0, 50))}`,
        },
      ],
    }),
  });

  const data  = await res.json();
  const text  = data.choices?.[0]?.message?.content ?? "[]";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    return [];
  }
}