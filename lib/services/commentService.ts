export const getComments = async (
  id: string,
  type: "post" | "reel" = "post",
) => {
  const response = await fetch(`/api/comments?id=${id}&type=${type}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to load comments");
  }

  return response.json();
};

export const postComment = async (
  id: string,
  content: string,
  type: "post" | "reel",
) => {
  const response = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, content, type }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to post comment");
  }
  return response.json();
};
