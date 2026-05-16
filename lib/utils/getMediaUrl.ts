// const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// export const getMediaUrl = (path?: string | null): string | null => {
//   if (!path || path === "null") return null;

//   let url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

//   // Handle insecure content via proxy
//   if (url.startsWith("http://")) {
//     return `/api/media?url=${encodeURIComponent(url)}`;
//   }

//   return url;
// };

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const getMediaUrl = (path?: string | null): string | null => {
  if (!path || path === "null" || path === undefined) return null;

  // 1. Clean up any accidental Windows backslashes from database payloads
  let cleanPath = path.replace(/\\/g, "/");

  // 2. If it's already a complete external HTTP/HTTPS absolute link (e.g., Google OAuth profile photo)
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    // Force insecure HTTP links through your secure media proxy route if needed
    if (cleanPath.startsWith("http://")) {
      return `/api/media?url=${encodeURIComponent(cleanPath)}`;
    }
    return cleanPath;
  }

  // 3. Handle schemeless absolute URLs (e.g., //lh3.googleusercontent.com/...)
  if (cleanPath.startsWith("//")) {
    return `https:${cleanPath}`;
  }

  // 4. Ensure there is exactly one single leading slash between BASE_URL and the path
  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.substring(1);
  }

  const url = `${BASE_URL}/${cleanPath}`;

  // 5. Catch-all fallback for proxying insecure assets
  if (url.startsWith("http://")) {
    return `/api/media?url=${encodeURIComponent(url)}`;
  }

  return url;
};
