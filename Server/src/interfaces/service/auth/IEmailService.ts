
export interface IEmailService {
  sendOtpEmail(email: string, otp: string): Promise<void>;
  sendResetPasswordEmail(email: string, token: string, role?: string): Promise<void>;
}