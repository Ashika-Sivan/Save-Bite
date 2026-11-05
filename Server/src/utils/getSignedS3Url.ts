import { Logger } from "./logger";

/**
 * Resolves an image key or URL for display.
 * Since Cloudinary returns full HTTPS URLs (e.g. https://res.cloudinary.com/...),
 * if the key is already a full URL, we return it directly!
 * If it's an old S3 key, we return a fallback or the key itself gracefully.
 */
export const getSignedS3Url = async (keyOrUrl: string): Promise<string> => {
    if (!keyOrUrl) return "";

    // If it's already a full URL (from Cloudinary or external), return directly
    if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
        return keyOrUrl;
    }

    // Return the key as is (prevents AWS S3 crashes for missing buckets)
    return keyOrUrl;
};
