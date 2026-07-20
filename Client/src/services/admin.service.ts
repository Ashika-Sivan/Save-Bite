import api from "./api";
type AdminLoginData={
    email:string;
    password:string
}


export const adminLogin=async(data:AdminLoginData)=>{
    const response=await api.post("/auth/login",data)
    return response.data
}