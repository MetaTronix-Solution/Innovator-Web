// const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

// export const getMediaUrl = (path?: string | null): string | null => {
//   if (!path || path === "null" || path === undefined) return null;

//   let cleanPath = path.replace(/\\/g, "/");

//   if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
//     if (cleanPath.startsWith("http://")) {
//       return `/api/media?url=${encodeURIComponent(cleanPath)}`;
//     }
//     return cleanPath;
//   }

//   if (cleanPath.startsWith("//")) {
//     return `https:${cleanPath}`;
//   }

//   if (cleanPath.startsWith("/")) {
//     cleanPath = cleanPath.substring(1);
//   }

//   const url = `${BASE_URL}/${cleanPath}`;

//   if (url.startsWith("http://")) {
//     return `/api/media?url=${encodeURIComponent(url)}`;
//   }

//   return url;
// };

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const ECOMMERCE_URL = process.env.NEXT_PUBLIC_ECOMMERCE_URL || "";

export const getMediaUrl = (path?: string | null): string | null => {
  if (!path || path === "null" || path === undefined) return null;

  let cleanPath = path.replace(/\\/g, "/");

  // Already a full URL
  if (cleanPath.startsWith("http://")) {
    // Proxy it to avoid mixed content
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

  // Decide base URL by path content
  const isProductMedia = cleanPath.includes("products");
  const base = isProductMedia ? ECOMMERCE_URL : BACKEND_URL;
  const url = `${base}/${cleanPath}`;

  if (url.startsWith("http://")) {
    return `/api/media?url=${encodeURIComponent(url)}`;
  }

  return url;
};
