// ─── Types ───────────────────────────────────────────────────────────────────

export interface SymptomCheckResult {
  conditions: {
    name:        string;
    likelihood:  "high" | "medium" | "low";
    description: string;
  }[];
  department:  string;
  urgency:     "emergency" | "urgent" | "routine";
  advice:      string;
  disclaimer:  string;
}

export interface ClinicSummary {
  generated_at:      string;
  period:            string;
  overview:          string;
  patient_insights:  string[];
  appointment_stats: string[];
  health_trends:     string[];
  recommendations:   string[];
  alerts:            string[];
}

export interface RiskFactor {
  factor:   string;
  severity: "high" | "medium" | "low";
}

export interface PatientRiskResult {
  patient_id:     string;
  patient_name:   string;
  risk_score:     number;
  risk_level:     "high" | "medium" | "low";
  risk_factors:   RiskFactor[];
  recommendation: string;
}

// ─── Core fetch helper ───────────────────────────────────────────────────────

interface GroqMessage {
  role:    "system" | "user" | "assistant";
  content: string;
}

async function callGroq(
  messages:       GroqMessage[],
  maxTokens:      number  = 1024,
  temperature:    number  = 0,
  model:          string  = "openai/gpt-oss-20b",
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set in .env.local");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens:  maxTokens,
      messages,
      // Force JSON output — prevents markdown wrapping
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Groq API error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// ─── JSON parser ─────────────────────────────────────────────────────────────

function parseJSON<T>(text: string, label: string): T {
  const clean = text
    .replace(/^```(?:json)?/m, "")
    .replace(/```$/m, "")
    .trim();

  try {
    return JSON.parse(clean) as T;
  } catch {
    console.error(`[groq] Failed to parse ${label}:`, clean.slice(0, 200));
    throw new Error(`AI returned an unexpected format for ${label}. Please try again.`);
  }
}

// ─── Symptom checker ─────────────────────────────────────────────────────────

const SYMPTOM_SYSTEM = `You are a medical triage assistant for SmartCare Hospital.
Analyze the patient symptoms and return a JSON object with EXACTLY this structure:

{
  "conditions": [
    {
      "name": "condition name",
      "likelihood": "high|medium|low",
      "description": "one sentence describing this condition"
    }
  ],
  "department": "most appropriate hospital department",
  "urgency": "emergency|urgent|routine",
  "advice": "1-2 sentences of immediate actionable advice",
  "disclaimer": "This is not a medical diagnosis. Please consult a qualified doctor immediately."
}

Rules you must follow:
1. Return 2-4 conditions, ordered from highest to lowest likelihood
2. urgency levels: emergency=life-threatening now, urgent=needs care within hours/today, routine=can wait for appointment
3. If any emergency symptoms present (chest pain, stroke signs, difficulty breathing, severe bleeding) — urgency MUST be emergency
4. department must be specific: e.g. "Cardiology", "Neurology", "Orthopedics", "General Medicine", "Pediatrics", "Emergency"
5. Never state a definitive diagnosis — use words like "possible", "may indicate", "could suggest"
6. Consider patient age and gender when provided — they significantly affect likelihood`;

export async function checkSymptoms(
  symptoms: string,
  age?:     string,
  gender?:  string
): Promise<SymptomCheckResult> {
  // Build a rich user message with all available context
  const contextParts = [`Patient symptoms: ${symptoms}`];
  if (age)    contextParts.push(`Patient age: ${age} years`);
  if (gender) contextParts.push(`Patient gender: ${gender}`);
  contextParts.push(`Current date: ${new Date().toISOString().split("T")[0]}`);

  const text = await callGroq(
    [
      { role: "system", content: SYMPTOM_SYSTEM },
      { role: "user",   content: contextParts.join("\n") },
    ],
    1024,
    0   // temperature=0 for consistent, safe medical outputs
  );

  const result = parseJSON<SymptomCheckResult>(text, "symptom check");

  // Validate required fields
  if (!result.conditions || !Array.isArray(result.conditions)) {
    throw new Error("Invalid AI response structure. Please try again.");
  }
  if (!result.urgency || !["emergency", "urgent", "routine"].includes(result.urgency)) {
    result.urgency = "routine";
  }
  if (!result.department) {
    result.department = "General Medicine";
  }
  if (!result.disclaimer) {
    result.disclaimer = "This is not a medical diagnosis. Please consult a qualified doctor immediately.";
  }

  return result;
}

// ─── Risk scoring ─────────────────────────────────────────────────────────────

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

const RISK_SYSTEM = `You are a clinical risk assessment AI for SmartCare Hospital.
Analyze the provided patient data and return a JSON array.

Each element must have EXACTLY this structure:
{
  "patient_id": "same id as input",
  "patient_name": "same name as input",
  "risk_score": <integer 0-100>,
  "risk_level": "high|medium|low",
  "risk_factors": [
    { "factor": "specific risk factor description", "severity": "high|medium|low" }
  ],
  "recommendation": "one specific, actionable recommendation sentence"
}

Scoring criteria — apply all that are relevant:
- Age 60-74: +10 points | Age 75+: +20 points
- Serious conditions (diabetes, cancer, heart disease, COPD): +15 each
- Moderate conditions (hypertension, asthma, arthritis): +8 each
- Cancellation rate > 50%: +15 | 30-50%: +8
- Last visit > 180 days ago: +15 | 90-180 days: +8 | 30-90 days: +3
- Zero completed appointments: +10
- Multiple scheduled but not completed: +5

Risk levels: 70-100=high, 40-69=medium, 0-39=low

Important: Return ONLY the JSON array, no other text.`;

export async function scanPatientRisks(
  patients: RiskScanInput[]
): Promise<PatientRiskResult[]> {
  if (patients.length === 0) return [];

  const BATCH_SIZE = 8;
  const results: PatientRiskResult[] = [];

  for (let i = 0; i < patients.length; i += BATCH_SIZE) {
    const batch = patients.slice(i, i + BATCH_SIZE);

    const text = await callGroq(
      [
        { role: "system", content: RISK_SYSTEM },
        {
          role:    "user",
          content: `Analyze these ${batch.length} patients:\n${JSON.stringify(batch, null, 2)}`,
        },
      ],
      2048,
      0
    );

    try {
      // response_format json_object only works for single objects
      // so we need to handle array parsing carefully
      const clean   = text.replace(/^```(?:json)?/m, "").replace(/```$/m, "").trim();
      const parsed  = JSON.parse(clean);
      const array   = Array.isArray(parsed) ? parsed : parsed.patients ?? parsed.results ?? [];
      results.push(...(array as PatientRiskResult[]));
    } catch {
      console.error("[groq] Failed to parse risk batch:", text.slice(0, 200));
    }

    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < patients.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return results.sort((a, b) => b.risk_score - a.risk_score);
}

// ─── Department load prediction ───────────────────────────────────────────────

export interface DepartmentPrediction {
  department:      string;
  predicted_count: number;
  trend:           "up" | "stable" | "down";
}

const DEPT_SYSTEM = `You are a hospital operations analyst.
Given recent appointment data, predict the next 7-day patient load per department.
Return a JSON array with EXACTLY this structure:

[
  {
    "department": "department name",
    "predicted_count": <integer>,
    "trend": "up|stable|down"
  }
]

Include only departments with predicted_count > 0.
Base predictions on the frequency of appointment notes mentioning each department.
If notes are sparse, use typical hospital distribution patterns.
Departments to consider: General Medicine, Cardiology, Orthopedics, Pediatrics, Neurology, Emergency, Dermatology, ENT.`;

export async function predictDepartmentLoad(
  appointments: { date: string; status: string; notes: string }[]
): Promise<DepartmentPrediction[]> {
  const text = await callGroq(
    [
      { role: "system", content: DEPT_SYSTEM },
      {
        role:    "user",
        content: `Recent appointment data (${appointments.length} records):\n${JSON.stringify(appointments.slice(0, 50), null, 2)}`,
      },
    ],
    512,
    0
  );

  try {
    const clean  = text.replace(/^```(?:json)?/m, "").replace(/```$/m, "").trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed : parsed.predictions ?? [];
  } catch {
    console.error("[groq] Failed to parse dept load:", text.slice(0, 200));
    return [];
  }
}

// ─── Clinic summary ───────────────────────────────────────────────────────────

const SUMMARY_SYSTEM = `You are a senior healthcare analyst generating a monthly clinic performance report.
Given clinic statistics, return a JSON object with EXACTLY this structure:

{
  "generated_at": "<current ISO datetime>",
  "period": "<Month YYYY>",
  "overview": "<2-3 sentences summarizing overall clinic performance using specific numbers>",
  "patient_insights": [
    "<specific insight using actual numbers>",
    "<specific insight using actual numbers>",
    "<specific insight using actual numbers>"
  ],
  "appointment_stats": [
    "<stat with percentage or number>",
    "<stat with percentage or number>",
    "<stat with percentage or number>"
  ],
  "health_trends": [
    "<trend observed in patient data>",
    "<trend observed in patient data>",
    "<trend observed in patient data>"
  ],
  "recommendations": [
    "<specific, actionable recommendation>",
    "<specific, actionable recommendation>",
    "<specific, actionable recommendation>"
  ],
  "alerts": ["<critical issue if any, otherwise empty array>"]
}

Rules:
1. Use the exact numbers provided — do not invent statistics
2. Calculate percentages where useful (e.g. completion rate = completed/total * 100)
3. Identify the cancellation rate — if > 30% flag it as an alert
4. patient_insights must reference actual age groups and conditions provided
5. recommendations must be specific and actionable, not generic
6. Be professional, concise and data-driven`;

export async function generateClinicSummary(data: {
  totalPatients:        number;
  newPatientsThisMonth: number;
  totalAppointments:    number;
  completedAppts:       number;
  cancelledAppts:       number;
  scheduledAppts:       number;
  totalPrescriptions:   number;
  commonConditions:     string[];
  ageGroups:            { range: string; count: number }[];
  topDepartments:       string[];
}): Promise<ClinicSummary> {
  // Pre-calculate key metrics so the AI works with enriched data
  const completionRate  = data.totalAppointments > 0
    ? Math.round((data.completedAppts / data.totalAppointments) * 100)
    : 0;
  const cancellationRate = data.totalAppointments > 0
    ? Math.round((data.cancelledAppts / data.totalAppointments) * 100)
    : 0;
  const largestAgeGroup = data.ageGroups.reduce(
    (max, g) => g.count > max.count ? g : max,
    { range: "unknown", count: 0 }
  );

  const enrichedData = {
    ...data,
    completionRate:    `${completionRate}%`,
    cancellationRate:  `${cancellationRate}%`,
    largestAgeGroup:   largestAgeGroup.range,
    prescriptionsPerPatient: data.totalPatients > 0
      ? (data.totalPrescriptions / data.totalPatients).toFixed(1)
      : "0",
    currentDate: new Date().toISOString(),
    currentPeriod: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
  };

  const text = await callGroq(
    [
      { role: "system", content: SUMMARY_SYSTEM },
      {
        role:    "user",
        content: `Generate clinic summary report for this data:\n${JSON.stringify(enrichedData, null, 2)}`,
      },
    ],
    1500,   // more tokens for richer output
    0.1     // slight temperature for more natural language while keeping accuracy
  );

  const result = parseJSON<ClinicSummary>(text, "clinic summary");

  // Ensure all required fields exist
  return {
    generated_at:      result.generated_at      ?? new Date().toISOString(),
    period:            result.period             ?? enrichedData.currentPeriod,
    overview:          result.overview           ?? "Summary unavailable.",
    patient_insights:  result.patient_insights   ?? [],
    appointment_stats: result.appointment_stats  ?? [],
    health_trends:     result.health_trends      ?? [],
    recommendations:   result.recommendations    ?? [],
    alerts:            result.alerts             ?? [],
  };
}