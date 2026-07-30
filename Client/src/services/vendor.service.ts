
import api from "./api";

export const registerVendor=async(formData:FormData)=>{
    const response=await api.post("/vendor/register",formData);
    return response.data
}



export const checkVendorStatus=async()=>{
    const response=await api.get("/vendor/status")
    return response.data
}

