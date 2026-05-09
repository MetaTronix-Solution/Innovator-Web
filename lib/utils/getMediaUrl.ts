const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getMediaUrl = (path?: string | null, fallback = ""): string => {
  if (!path || path === "null") return fallback;

  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  if (url.startsWith("http://")) {
    return `/api/media?url=${encodeURIComponent(url)}`;
  }

  return url;
};
