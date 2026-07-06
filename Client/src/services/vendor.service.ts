import api from "./api";

export const registerVendor=async(data:unknown)=>{
    const response=await api.post("/vendor/register",data);
    return response.data
}

