

import { IUser } from "../../../models/user/user.model";
import {
  IRegisterRequestDTO,
  ILoginRequestDTO,
  IVerifyOtpRequestDTO,
  IResendOtpRequestDTO,
  IForgotPasswordRequestDTO,
  IResetPasswordRequestDTO,
  ILoginServiceResult,
} from "../../../dtos/auth.dto"

export interface IAuthService {
  register(data: IRegisterRequestDTO): Promise<IUser>;

  resendOtp(data: IResendOtpRequestDTO): Promise<boolean>;

  verifyOtp(data: IVerifyOtpRequestDTO): Promise<IUser | null>;

  login(data: ILoginRequestDTO): Promise<ILoginServiceResult>;
  

  refreshToken(refreshToken: string): Promise<{ accessToken: string }>;

  getMe(userId: string): Promise<IUser | null>;

  forgotPassword(data: IForgotPasswordRequestDTO): Promise<{ message: string }>;

  resetPassword(data: IResetPasswordRequestDTO): Promise<{ message: string }>;
  

}