

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3";


// //aws give an option to the vendor to temporarly see the file from partucular buckt

export const getSignedS3Url=async(key:string):Promise<string>=>{
    const bucketName=process.env.AWS_S3_BUCKET_NAME;
    if(!bucketName){
        throw new Error(`s3 bucket name is missing`);
    }
    const command=new GetObjectCommand({
        Bucket:bucketName,
        Key:key,
    })
    return await getSignedUrl(s3Client,command,{expiresIn:60*10})
}