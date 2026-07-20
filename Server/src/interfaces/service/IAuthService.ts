// src/interfaces/service/IAuthService.ts

import { IUser } from "../../models/user/user.model";
import {
  RegisterRequestDTO,
  LoginRequestDTO,
  VerifyOtpRequestDTO,
  ResendOtpRequestDTO,
  ForgotPasswordRequestDTO,
  ResetPasswordRequestDTO,
} from "../../dtos/auth.dto"

export interface iAuthService {
  register(data: RegisterRequestDTO): Promise<IUser>;

  resendOtp(data: ResendOtpRequestDTO): Promise<boolean>;

  verifyOtp(data: VerifyOtpRequestDTO): Promise<IUser | null>;

  login(data: LoginRequestDTO): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }>;

  refreshToken(refreshToken: string): Promise<{ accessToken: string }>;

  getMe(userId: string): Promise<IUser | null>;

  forgotPassword(data: ForgotPasswordRequestDTO): Promise<{ message: string }>;

  resetPassword(data: ResetPasswordRequestDTO): Promise<{ message: string }>;
}