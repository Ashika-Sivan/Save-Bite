import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3";

import path from "path"

interface UploadedFile{
    buffer:Buffer;
    originalname:string;
    mimetype:string

}

interface S3UploadResponse{
    key:string;
}

export const uploadToS3=async(
    file:UploadedFile,
    folder:string
):Promise<S3UploadResponse>=>{
    const bucketName=process.env.AWS_S3_BUCKET_NAME;
    if(!bucketName){
        throw new Error("Bucket name is missing")
    }
    const extension=path.extname(file.originalname);//jpg
    const fileName=`${crypto.randomUUID()}${extension}`;//unique file name prevent from duplication
    const key=`${folder}/${fileName}`
    const command=new PutObjectCommand({
        Bucket:bucketName,
        Key:key,
        Body:file.buffer,
        ContentType:file.mimetype,//jpg/png

    });

    await s3Client.send(command)
    return {
        key
    }
}

//take a file and upload to s3