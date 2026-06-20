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