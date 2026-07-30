
export interface IPasswordResetTokenService {
  generateAndStore(userId: string): Promise<string>; // returns raw token
  resolve(token: string): Promise<string | null>;     // returns userId or null
  invalidate(token: string): Promise<void>;
}