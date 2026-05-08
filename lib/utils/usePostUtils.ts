"use client";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const usePostUtils = () => {
  const getMediaUrl = (url?: string): string => {
    if (!url || url === "" || url === "null") return "";
    if (url.startsWith("http")) return url;
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `${BASE_URL}${cleanPath}`;
  };

  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} h ago`;
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
    return date.toLocaleDateString();
  };

  const isVideoUrl = (url: string): boolean =>
    !!url
      .toLowerCase()
      .split(/[?#]/)[0]
      .match(/\.(mp4|webm|mov|m4v|m3u8)$/);

  return { getMediaUrl, formatRelativeTime, isVideoUrl };
};

export default usePostUtils;
