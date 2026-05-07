export const toggleFollowUser = async (userId: string, isFollowed: boolean) => {
  const action = isFollowed ? "unfollow" : "follow";

  const response = await fetch(`/api/users/${userId}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Failed to ${action} user`);
  }

  return data;
};
