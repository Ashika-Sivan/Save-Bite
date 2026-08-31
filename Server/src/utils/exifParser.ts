
import exifParser from "exif-parser";
import { Logger } from "./logger";

export interface ExifValidationResult {
  photoCapturedAt: Date | null;
  isTimestampValid: boolean | null;
}

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


    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
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
