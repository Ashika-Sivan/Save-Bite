import { GetObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getSignedS3Url=async(
    key:string
):Promise<string>=>{
    const command=new GetObjectCommand({//to read s3 file=>object
        Bucket:process.env.AWS_S3_BUCKET_NAME,
        Key:key
    })
    return await getSignedUrl(s3Client,command,{//generate the temp url,ok
        expiresIn:60*10//only for 10 min
    })
}
//aws give an option to the vendor to temporarly see the file from partucular buckt