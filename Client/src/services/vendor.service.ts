
import api from "./api";

export const registerVendor=async(formData:FormData)=>{
    const response=await api.post("/vendor/register",formData);
    return response.data
}

//  export const checkVendorStatus=async()=>{
//     const navigate=useNavigate()
//     try {
//         const response=await api.get("/vendor/status");
//         console.log('vendor status responne',response.data)
//         const {hasApplication,status}=response.data.data

//         if(!hasApplication){
//             navigate("/vendor/VendorRegister")
//             return 
//         }

//         if(status==="pending"){
//             navigate("/vendor/pending")
//             return 
//         }

//         if(status==="rejected"){
//             navigate("/vendor/rejected")
//             return 
//         }

//         if(status==="approved"){
//             navigate("/vendor/approved")
//             return 
//         }
        
//     } catch (error) {
//         console.error("Failed to check the vendor status",error)
        
//     }
//  }

export const checkVendorStatus=async()=>{
    const response=await api.get("/vendor/status")
    return response.data
}

