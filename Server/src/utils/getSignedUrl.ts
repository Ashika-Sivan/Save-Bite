import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3";
import { Logger } from "./logger";

export const getPresignedImageUrl = async (keyOrUrl: string): Promise<string> => {
  if (!keyOrUrl) return "";

  let key = keyOrUrl;
  if (keyOrUrl.includes(".amazonaws.com/")) {
    const parts = keyOrUrl.split(".amazonaws.com/");
    key = parts[1] || keyOrUrl;
  } else if (keyOrUrl.startsWith("http") && !keyOrUrl.includes("s3")) {
    return keyOrUrl;
  }

  const bucketName = process.env.AWS_S3_BUCKET_NAME || "savebite-storage-ashika";
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    // Generate pre-signed URL valid for 7 days:
    return await getSignedUrl(s3Client, command, { expiresIn: 604800 });
  } catch (error) {
    Logger.error("Failed to generate presigned S3 URL:", error);
    return keyOrUrl;
  }
};
