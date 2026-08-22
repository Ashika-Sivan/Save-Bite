// @ts-ignore
import exifParser from "exif-parser";

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

    // EXIF stores wall-clock local time string "YYYY:MM:DD HH:MM:SS" (e.g., 18:54 for 6:54 PM IST).
    // exif-parser parses this string into Date.UTC(YYYY, MM-1, DD, HH, MM, SS).
    // Since Indian Standard Time is UTC+5:30 (19,800,000 ms), subtracting 5:30 yields the true UTC Date.
    // When saved to MongoDB and formatted in IST (+5:30) on the frontend, it restores the exact 6:54 PM IST!
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
    console.error("Failed to parse EXIF metadata:", error);
    return {
      photoCapturedAt: null,
      isTimestampValid: null,
    };
  }
}
