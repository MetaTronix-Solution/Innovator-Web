const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const getMediaUrl = (path?: string | null): string | null => {
  if (!path || path === "null" || path === undefined) return null;

  let cleanPath = path.replace(/\\/g, "/");

  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    if (cleanPath.startsWith("http://")) {
      return `/api/media?url=${encodeURIComponent(cleanPath)}`;
    }
    return cleanPath;
  }

  if (cleanPath.startsWith("//")) {
    return `https:${cleanPath}`;
  }

  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.substring(1);
  }

  const url = `${BASE_URL}/${cleanPath}`;

  if (url.startsWith("http://")) {
    return `/api/media?url=${encodeURIComponent(url)}`;
  }

  return url;
};
