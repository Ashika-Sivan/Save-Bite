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
                resource_type:"auto"
            },
            (error,result)=>{
                if(error||!result){
                    reject(error)
                    return
                }
                resolve(result)
            }
        );
        stream.end(fileBuffer)
    })

}