import api from "./api";

export const registerVendor=async(formData:FormData)=>{
    const response=await api.post("/vendor/register",FormData);
    return response.data
}

