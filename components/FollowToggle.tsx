"use client";

import React, { useState, useEffect } from "react";
import { toggleFollowUser } from "@/lib/services/followService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FollowToggleProps {
  userId: string;
  initialIsFollowed: boolean;
  username: string;
  variant?: "text" | "button" | "reels";
  onStatusChange?: (newStatus: boolean) => void;
}

const FollowToggle = ({
  userId,
  initialIsFollowed,
  username,
  variant = "text",
  onStatusChange,
}: FollowToggleProps) => {
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFollowed(initialIsFollowed);
  }, [initialIsFollowed]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading) return;
    setIsLoading(true);
    try {
      await toggleFollowUser(userId, isFollowed);
      const newStatus = !isFollowed;
      setIsFollowed(newStatus);
      if (onStatusChange) onStatusChange(newStatus);
      toast.success(
        newStatus ? `Following ${username}` : `Unfollowed ${username}`,
      );
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const getLabel = () => {
    if (isFollowed) return "Following";
    return "Follow";
  };

  if (variant === "text") {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`text-xs font-bold transition-all flex items-center gap-1 ${
          isFollowed ? "text-muted-foreground" : "text-primary hover:underline"
        }`}
      >
        <span>•</span>
        {isLoading ? (
          <Loader2 size={10} className="animate-spin" />
        ) : (
          getLabel()
        )}
      </button>
    );
  }

  if (variant === "reels") {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`
          text-[11px] font-bold px-3 py-0.5 rounded-full border transition-colors
          flex items-center justify-center gap-1 min-w-[64px]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isFollowed
              ? "bg-secondary-foreground border-white/40 text-secondary "
              : "border-white text-white hover:bg-primary hover:text-black"
          }
        `}
      >
        {isLoading ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          getLabel()
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 ${
        isFollowed
          ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
          : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
      }`}
    >
      {isLoading && <Loader2 size={14} className="animate-spin" />}
      {!isLoading && getLabel()}
    </button>
  );
};

export default FollowToggle;
