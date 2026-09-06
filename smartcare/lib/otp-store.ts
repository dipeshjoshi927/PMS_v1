export interface OtpRecord {
  code: string;
  expires: number;
  attempts: number;
}

export const otpStore = new Map<string, OtpRecord>();
