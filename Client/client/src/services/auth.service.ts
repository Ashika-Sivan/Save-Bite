import type { signupData } from "../types/auth.types";
import api from "./api";

export const singupUser=async(data:signupData)=>{
    const res=await api.post("/signup",data)
    return res.data
}