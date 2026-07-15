//reUsable helper that uploads any file using that configuration


import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

export const uploadCloudinary=(//is a way to store the images in to the file
    fileBuffer:Buffer,
    folder:string
):Promise<UploadApiResponse>=>{
    return new Promise((resolve,reject)=>{
        const stream=cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type:"auto"//automatically detect the file type
            },
            (error,result)=>{
                if(error||!result){
                    reject(error)
                    return
                }
                resolve(result)
            }
        );
        stream.end(fileBuffer)//file buffer in to upload stream
    })

}
//FLOW
//user select the certificate
//multer recieve file
//req.file.buffer
//uploadCloudinary(buffer,'vendor')
//cloudinary upload the file
//return result=>{public_id:'...',secure_Url:"https://res.cloudinary.com/..."}}
//save the secure url in the mongodb
