export const repostPost = async (postId: string, caption: string) => {
  const response = await fetch(`/api/posts/${postId}/repost`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: caption }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to repost");
  return result;
};

export const updatePost = async (
  postId: string,
  payload: { content?: string; media?: File[] },
) => {
  const formData = new FormData();

  if (payload.content !== undefined) {
    formData.append("content", payload.content);
  }

  if (payload.media?.length) {
    payload.media.forEach((file) => formData.append("media", file));
  }

  const response = await fetch(`/api/posts/${postId}`, {
    method: "PATCH",
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to update post");
  return result;
};

export const deletePost = async (postId: string) => {
  const response = await fetch(`/api/posts/${postId}`, {
    method: "DELETE",
  });

  if (response.status === 204) return null;

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to delete post");
  return result;
};

export const getPostById = async (postId: string) => {
  const response = await fetch(`/api/posts/${postId}`, {
    method: "GET",
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Failed to fetch post");
  return result.data ?? result;
};
