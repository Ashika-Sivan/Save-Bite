
export interface IEmailService {
  sendOtpEmail(email: string, otp: string): Promise<void>;
  sendResetPasswordEmail(email: string, token: string): Promise<void>;
}