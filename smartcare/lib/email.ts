export interface SendEmailOptions {
  to:      string;
  subject: string;
  html:    string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const user     = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;

  if (!user || !password) {
    return { success: false, error: "GMAIL_USER or GMAIL_APP_PASSWORD not set in .env.local" };
  }

  try {
    const res = await fetch("/api/send-email", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ to, subject, html }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error ?? "Failed to send email" };
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function layout(content: string): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;padding:40px 20px;">
      <div style="background:#fff;border-radius:12px;padding:32px;max-width:520px;margin:0 auto;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
          <div style="background:#2563eb;border-radius:10px;width:36px;height:36px;text-align:center;line-height:36px;">
            <span style="color:#fff;font-size:18px;">&#9829;</span>
          </div>
          <div>
            <div style="font-weight:700;font-size:15px;color:#0f172a;">SmartCare</div>
            <div style="font-size:11px;color:#64748b;">Hospital Management System</div>
          </div>
        </div>
        ${content}
        <div style="margin-top:28px;padding-top:18px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;text-align:center;">
          SmartCare &mdash; Automated message, please do not reply.
        </div>
      </div>
    </div>
  `;
}

function infoBox(
  bg: string,
  border: string,
  rows: { label: string; value: string }[]
): string {
  const rowsHtml = rows
    .map(
      (r) => `
      <div
        style="
          display:flex;
          align-items:flex-start;
          gap:12px;
          padding:8px 0;
          border-bottom:1px solid rgba(0,0,0,0.05);
        "
      >
        <span
          style="
            min-width:70px;
            font-size:13px;
            color:#64748b;
            font-weight:500;
          "
        >
          ${r.label}:
        </span>

        <span
          style="
            font-size:13px;
            font-weight:600;
            color:#0f172a;
            flex:1;
          "
        >
          ${r.value}
        </span>
      </div>`
    )
    .join("");

  return `
    <div
      style="
        background:${bg};
        border:1px solid ${border};
        border-radius:10px;
        padding:16px 18px;
        margin-bottom:20px;
      "
    >
      ${rowsHtml}
    </div>
  `;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export function appointmentConfirmationEmail(data: {
  patientName: string;
  date:        string;
  time:        string;
  notes?:      string;
}): { subject: string; html: string } {
  const rows = [
    { label: "Date",  value: data.date },
    { label: "Time",  value: data.time },
    ...(data.notes ? [{ label: "Notes", value: data.notes }] : []),
  ];

  return {
    subject: `Appointment Confirmed — ${data.date} at ${data.time}`,
    html: layout(`
      <h2 style="font-size:19px;font-weight:700;color:#0f172a;margin:0 0 8px;">Appointment Confirmed</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;">
        Hello ${data.patientName}, your appointment has been booked successfully.
      </p>
      ${infoBox("#eff6ff", "#bfdbfe", rows)}
      <p style="font-size:13px;color:#64748b;margin:0;">
        Please arrive <strong>10 minutes early</strong>.
      </p>
    `),
  };
}

export function appointmentReminderEmail(data: {
  patientName: string;
  date:        string;
  time:        string;
}): { subject: string; html: string } {
  return {
    subject: `Reminder: Appointment Tomorrow at ${data.time}`,
    html: layout(`
      <h2 style="font-size:19px;font-weight:700;color:#0f172a;margin:0 0 8px;">Appointment Reminder</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;">
        Hello ${data.patientName}, your appointment is <strong>tomorrow</strong>.
      </p>
      ${infoBox("#f0fdf4", "#bbf7d0", [
        { label: "Date", value: data.date },
        { label: "Time", value: data.time },
      ])}
      <p style="font-size:13px;color:#64748b;margin:0;">
        Bring any previous reports and arrive <strong>10 minutes early</strong>.
      </p>
    `),
  };
}

export function appointmentCancelledEmail(data: {
  patientName: string;
  date:        string;
  time:        string;
}): { subject: string; html: string } {
  return {
    subject: `Appointment Cancelled — ${data.date}`,
    html: layout(`
      <h2 style="font-size:19px;font-weight:700;color:#0f172a;margin:0 0 8px;">Appointment Cancelled</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;">
        Hello ${data.patientName}, your appointment on
        <strong>${data.date} at ${data.time}</strong> has been cancelled.
      </p>
      <p style="font-size:13px;color:#64748b;margin:0;">
        Please contact us to reschedule at your earliest convenience.
      </p>
    `),
  };
}

export function otpEmail(data: {
  name: string;
  otp:  string;
}): { subject: string; html: string } {
  return {
    subject: `Your SmartCare verification code: ${data.otp}`,
    html: layout(`
      <h2 style="font-size:19px;font-weight:700;color:#0f172a;margin:0 0 8px;">Verification Code</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;">
        Hello ${data.name}, use the code below to verify your identity.
      </p>
      <div style="background:#f1f5f9;border-radius:10px;padding:20px;text-align:center;margin-bottom:20px;letter-spacing:10px;">
        <span style="font-size:36px;font-weight:800;color:#1e293b;font-family:monospace;">
          ${data.otp}
        </span>
      </div>
      <p style="font-size:13px;color:#64748b;margin:0;">
        Expires in <strong>10 minutes</strong>.
        If you did not request this, please ignore this email.
      </p>
    `),
  };
}

export function prescriptionEmail(data: {
  patientName:   string;
  date:          string;
  medications:   string;
  instructions?: string;
}): { subject: string; html: string } {
  return {
    subject: `Your Prescription — ${data.date}`,
    html: layout(`
      <h2 style="font-size:19px;font-weight:700;color:#0f172a;margin:0 0 8px;">Prescription Ready</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;">
        Hello ${data.patientName}, your prescription dated <strong>${data.date}</strong>.
      </p>
      <div style="margin-bottom:16px;">
        <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">
          Medications
        </div>
        <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:14px;font-size:13px;color:#4c1d95;white-space:pre-line;line-height:1.7;">
          ${data.medications}
        </div>
      </div>
      ${
        data.instructions
          ? `<div>
              <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">
                Instructions
              </div>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;font-size:13px;color:#334155;line-height:1.7;">
                ${data.instructions}
              </div>
            </div>`
          : ""
      }
    `),
  };
}

export function welcomeEmail(data: {
  name: string;
  role: string;
}): { subject: string; html: string } {
  return {
    subject: `Welcome to SmartCare, ${data.name}!`,
    html: layout(`
      <h2 style="font-size:19px;font-weight:700;color:#0f172a;margin:0 0 8px;">Welcome to SmartCare!</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;">
        Hello ${data.name}, your account has been created successfully.
      </p>
      ${infoBox("#eff6ff", "#bfdbfe", [{ label: "Role", value: data.role }])}
      <p style="font-size:13px;color:#64748b;margin:0;">
        Log in to manage patients, appointments and prescriptions.
      </p>
    `),
  };
}

export function riskAlertEmail(data: {
  patientName:    string;
  riskScore:      number;
  riskLevel:      string;
  riskFactors:    string[];
  recommendation: string;
}): { subject: string; html: string } {
  const factorsHtml = data.riskFactors
    .map(
      (f) => `<li style="margin-bottom:4px;font-size:13px;color:#334155;">${f}</li>`
    )
    .join("");

  const levelColor =
    data.riskLevel === "high"   ? "#dc2626" :
    data.riskLevel === "medium" ? "#d97706" :
    "#16a34a";

  return {
    subject: `⚠ Risk Alert: ${data.patientName} — Score ${data.riskScore}/100`,
    html: layout(`
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Patient</div>
            <div style="font-size:16px;font-weight:600;color:#0f172a;">${data.patientName}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px;color:#64748b;margin-bottom:4px;">Risk score</div>
            <div style="font-size:28px;font-weight:700;color:${levelColor};">${data.riskScore}<span style="font-size:14px;font-weight:400;">/100</span></div>
          </div>
        </div>
      </div>
      <h3 style="font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Risk factors identified</h3>
      <ul style="margin:0 0 16px;padding-left:18px;">${factorsHtml}</ul>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;">
        <div style="font-size:11px;color:#64748b;margin-bottom:4px;">Recommended action</div>
        <div style="font-size:13px;color:#0f172a;">${data.recommendation}</div>
      </div>
    `),
  };
}

export function clinicSummaryEmail(data: {
  period:           string;
  overview:         string;
  patientInsights:  string[];
  apptStats:        string[];
  healthTrends:     string[];
  recommendations:  string[];
  alerts:           string[];
}): { subject: string; html: string } {
  const listHtml = (items: string[], color: string) =>
    items.map((i) =>
      `<li style="margin-bottom:6px;font-size:13px;color:${color};padding-left:4px;">${i}</li>`
    ).join("");

  const section = (title: string, icon: string, items: string[], bg: string, border: string) =>
    items.length === 0 ? "" : `
      <div style="margin-bottom:16px;">
        <div style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">
          ${icon} ${title}
        </div>
        <div style="background:${bg};border:1px solid ${border};border-radius:8px;padding:12px 16px;">
          <ul style="margin:0;padding-left:16px;">${listHtml(items, "#334155")}</ul>
        </div>
      </div>`;

  const alertsHtml = data.alerts.length > 0
    ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
        <div style="font-size:12px;font-weight:600;color:#dc2626;margin-bottom:6px;">⚠ ALERTS</div>
        <ul style="margin:0;padding-left:16px;">${listHtml(data.alerts, "#dc2626")}</ul>
      </div>`
    : "";

  return {
    subject: `SmartCare Clinic Summary — ${data.period}`,
    html: layout(`
      <h2 style="font-size:19px;font-weight:700;color:#0f172a;margin:0 0 4px;">Clinic Summary Report</h2>
      <p style="font-size:12px;color:#64748b;margin:0 0 20px;">${data.period}</p>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
        <p style="font-size:13px;color:#0c4a6e;line-height:1.6;margin:0;">${data.overview}</p>
      </div>

      ${alertsHtml}
      ${section("Patient Insights",    "👥", data.patientInsights, "#f8fafc", "#e2e8f0")}
      ${section("Appointment Stats",   "📅", data.apptStats,       "#f8fafc", "#e2e8f0")}
      ${section("Health Trends",       "📈", data.healthTrends,    "#f0fdf4", "#bbf7d0")}
      ${section("Recommendations",     "✅", data.recommendations, "#faf5ff", "#e9d5ff")}
    `),
  };
}
