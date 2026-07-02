export function formatRelativeTime(dateString: string): string {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}${days === 1 ? " day" : " days"} ago`;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateSeparator(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  const isSameYear = date.getFullYear() === today.getFullYear();

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: isSameYear ? undefined : "numeric",
  });
}
