
//convert object to another object

import { IUser } from "../models/user/user.model";

export interface IRegisterRequestDTO {//register expects
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ILoginRequestDTO {
  email: string;
  password: string;
}

export interface IVerifyOtpRequestDTO {
  email: string;
  otp: string;
}

export interface IResendOtpRequestDTO {
  email: string;
}

export interface IForgotPasswordRequestDTO {
  email: string;
}

export interface IResetPasswordRequestDTO {
  token: string;
  newPassword: string;
}

//response DTO
export interface IUserResponseDTO{
  id:string;
  name:string;
  email:string;
  role:string;
  phone?:string;
  isAuthenticated:boolean
}
export interface ILoginResponseDTO{
  user:IUserResponseDTO;
  accessToken:string;


}
export interface IMessageResponseDTO{
  message:string;
}
export interface ILoginServiceResult{
  user:IUser,
  accessToken:string;
  refreshToken:string;

}