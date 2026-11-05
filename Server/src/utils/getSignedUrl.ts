export const getPresignedImageUrl = async (keyOrUrl: string): Promise<string> => {
  if (!keyOrUrl) return "";

  // If already a full URL (from Cloudinary or anywhere else), return it directly
  if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
    return keyOrUrl;
  }

  return keyOrUrl;
};
