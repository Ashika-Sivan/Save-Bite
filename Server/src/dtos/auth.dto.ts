// src/dto/auth.dto.ts

export interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface VerifyOtpRequestDTO {
  email: string;
  otp: string;
}

export interface ResendOtpRequestDTO {
  email: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordRequestDTO {
  token: string;
  newPassword: string;
}