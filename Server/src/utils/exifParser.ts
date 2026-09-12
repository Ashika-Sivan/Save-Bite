//allow the backend to read exif metadata from an image
import exifParser from "exif-parser";
import { Logger } from "./logger";

export interface ExifValidationResult {//funcion return (shape)
  photoCapturedAt: Date | null;
  isTimestampValid: boolean | null;
}
/*
this is actually create a function which extract the timestamp and also the validation
imageBuffer is actually the uploaded image,so uploaded file rep as buffer :-uploadPhoto=>backend(binary data (recieve))=>buffer
*/
export function extractAndValidateExifTimestamp(
  imageBuffer: Buffer,
  pickupWindowStart: Date,
  pickupWindowEnd: Date
): ExifValidationResult {
  try {
    const parser = exifParser.create(imageBuffer);
    const result = parser.parse();

    const timestampInSeconds =
      result.tags?.DateTimeOriginal || result.tags?.CreateDate || result.tags?.ModifyDate;

    if (!timestampInSeconds) {
      return {
        photoCapturedAt: null,
        isTimestampValid: null,
      };
    }


    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;//19,800,000 milliseconds
    const rawUtcMs = timestampInSeconds * 1000;
    const photoCapturedAt = new Date(rawUtcMs - IST_OFFSET_MS);

    const startMs = new Date(pickupWindowStart).getTime();
    const endMs = new Date(pickupWindowEnd).getTime();
    const capturedMs = photoCapturedAt.getTime();

    const isTimestampValid = capturedMs >= startMs && capturedMs <= endMs;

    return {
      photoCapturedAt,
      isTimestampValid,
    };
  } catch (error) {
    Logger.error("Failed to parse EXIF metadata:", error);
    return {
      photoCapturedAt: null,
      isTimestampValid: null,
    };
  }
}
