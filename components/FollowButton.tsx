"use client";

import { useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { updateFollowing } from "@/lib/store/features/authSlice";

interface FollowButtonProps {
  userId: string;
  username?: string;
  initialIsFollowed?: boolean;
  onFollowChange?: (isFollowed: boolean) => void;
}

export default function FollowButton({
  userId,
  username,
  initialIsFollowed = false,
  onFollowChange,
}: FollowButtonProps) {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(false);

  const isFollowed = username
    ? (currentUser?.following_usernames?.includes(username) ??
      initialIsFollowed)
    : initialIsFollowed;

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);

    const newState = !isFollowed;
    const endpoint = isFollowed
      ? `/api/users/${userId}/unfollow/`
      : `/api/users/${userId}/follow/`;

    // Optimistic update — instant UI change
    if (username) {
      dispatch(updateFollowing({ username, isFollowing: newState }));
    }
    onFollowChange?.(newState);

    try {
      const res = await fetch(endpoint, { method: "POST" });

      if (!res.ok) {
        // API failed — rollback to original state
        if (username) {
          dispatch(updateFollowing({ username, isFollowing: isFollowed }));
        }
        onFollowChange?.(isFollowed);
        if (res.status === 401) window.location.href = "/login";
      }
      // No refreshUser() — optimistic update is the source of truth
    } catch (err) {
      // Network error — rollback
      if (username) {
        dispatch(updateFollowing({ username, isFollowing: isFollowed }));
      }
      onFollowChange?.(isFollowed);
      console.error("Follow/Unfollow error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={isFollowed ? "secondary" : "outline"}
      disabled={loading}
      onClick={handleFollow}
      className={`h-8 px-3 rounded-full transition-all active:scale-95 shadow-sm ${
        isFollowed
          ? "border-primary/20 text-primary hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          : "border-primary/20 hover:border-primary hover:bg-primary hover:text-white"
      }`}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin mr-1.5" />
      ) : isFollowed ? (
        <UserCheck size={14} className="mr-1.5" />
      ) : (
        <UserPlus size={14} className="mr-1.5" />
      )}
      <span className="text-xs font-bold">
        {loading ? "..." : isFollowed ? "Following" : "Follow"}
      </span>
    </Button>
  );
}
