import api from './api'
export interface signupData{
    name:string;
    email:string;
    password:string;
    phone?:string
}

export const signupUser=async(data:signupData)=>{//here the data parameter follow the signup structure
    const response=await api.post("/auth/register",data)
    return response.data
}

export const sendOtp = async (email: string) => {
  const response = await api.post("/auth/send-otp", { email });
  return response.data;
};

export const verifyOtp=async(email:string,otp:string)=>{
    const response=await api.post("/auth/verify-otp",{
        email,
        otp 
    })
     return response.data
}

export const resendOtp=async(email:string)=>{
    const response=await api.post("/auth/resend-otp",{
        email
    })
    return response.data
}

export const login=async(loginData:{email:string,password:string})=>{
    const response=await api.post("/auth/login",loginData,{
    })
    return response.data
}

export const logout=async()=>{
    const response=await api.post("/auth/logout")
    return response.data
}
export const refreshAccessToken=async()=>{
    const response=await api.post("/auth/refresh")
    return response.data//request for refresh token
}
export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const registerVendor=async(data:unknown)=>{
    const response=await api.post("/vendor/register",data);
    return response.data
}
 export const forgotPassword=async(email:string)=>{
    const response=await api.post("/auth/forgot-password",{email})
    return response.data
 }
 export const resetPassword=async(data:{
    token:string;
    newPassword:string
 })=>{
    const response=await api.post("/auth/reset-password",data);
    return response.data
 }
