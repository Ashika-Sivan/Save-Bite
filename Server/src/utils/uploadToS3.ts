import cloudinary from "../config/cloudinary";
import { Logger } from "./logger";

interface UploadedFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
}

interface UploadResponse {
    key: string;
}

/**
 * Uploads a file buffer directly to Cloudinary.
 * Returns the permanent secure URL (or Cloudinary public_id).
 * Using the secure_url ensures it works transparently wherever URLs are rendered!
 */
export const uploadToS3 = async (
    file: UploadedFile,
    folder: string
): Promise<UploadResponse> => {
    try {
        return await new Promise<UploadResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `savebite/${folder}`,
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error || !result) {
                        Logger.error("Cloudinary upload failed:", error);
                        return reject(error || new Error("Cloudinary upload failed"));
                    }
                    // Return the secure direct URL as the key
                    resolve({ key: result.secure_url });
                }
            );

            uploadStream.end(file.buffer);
        });
    } catch (error) {
        Logger.error("Error uploading to Cloudinary:", error);
        throw error;
    }
};
