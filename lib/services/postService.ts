export const repostPost = async (
  postId: string,
  caption: string,
  originalData: any,
) => {
  const response = await fetch(`/api/posts/${postId}/repost`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      caption,
      originalPostId: postId,
      originalContent: originalData.content || originalData.caption,
      originalMedia: originalData.mediaFile,
      originalAuthor: originalData.username,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to repost");
  }

  return result;
};
