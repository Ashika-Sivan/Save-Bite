import { UploadApiResponse } from "cloudinary";
import cloudinary from "../../config/cloudinary";

export class CloudinaryService{
    async uploadFile(
        fileBuffer:Buffer,
        folder:string
    ):Promise<UploadApiResponse>{
        return new Promise((resolve,reject)=>{
            const stream=cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type:"auto",

                },
               
            )
        })
    }
}