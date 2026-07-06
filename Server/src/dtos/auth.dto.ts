export interface createUserDTO{
    name:string;
    email:string;
    phone?:string;
    password:string;
}
export interface LoginUserDTO{
    email:string;
    password:string
}
export interface VerfiyOtpDTO{
    email:string;
}
export interface ResendOtpDTO {
  email: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}