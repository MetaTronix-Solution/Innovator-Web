const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const ECOMMERCE_URL = process.env.NEXT_PUBLIC_ECOMMERCE_URL || "";

export const getMediaUrl = (path?: string | null): string | null => {
  if (!path || path === "null" || path === undefined) return null;

  let cleanPath = path.replace(/\\/g, "/");

  if (cleanPath.startsWith("http://")) {
    return `/api/media?url=${encodeURIComponent(cleanPath)}`;
  }

  if (cleanPath.startsWith("https://")) {
    return cleanPath;
  }

  if (cleanPath.startsWith("//")) {
    return `https:${cleanPath}`;
  }

  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.substring(1);
  }

  const isProductMedia = cleanPath.includes("products");
  const base = isProductMedia ? ECOMMERCE_URL : BACKEND_URL;
  const url = `${base}/${cleanPath}`;

  if (url.startsWith("http://")) {
    return `/api/media?url=${encodeURIComponent(url)}`;
  }

  return url;
};
