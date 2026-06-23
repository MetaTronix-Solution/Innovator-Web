"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ChevronDown, ChevronUp, User, Users } from "lucide-react";
import { useSelector } from "react-redux";
import FollowButton from "./FollowButton";

interface SuggestedUser {
  user_id: string;
  username: string;
  full_name: string;
  avatar: string | null;
  mutual_count: number;
  reason: string;
}

const UserSuggestion = () => {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(5);
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const INITIAL_LIMIT = 5;

  const getMediaUrl = (url?: string | null): string => {
    if (!url || url === "null") return "";
    if (url.startsWith("http://"))
      return `/api/media?url=${encodeURIComponent(url)}`;
    return url;
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const res = await fetch("/api/suggestions");
        if (!res.ok) throw new Error("Failed");
        setUsers(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  const visibleUsers = users.slice(0, displayLimit);
  const isExpanded = displayLimit >= users.length;
  const toggle = () =>
    setDisplayLimit(isExpanded ? INITIAL_LIMIT : users.length);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-[11px] text-muted-foreground italic tracking-wide">
          Loading…
        </span>
      </div>
    );
  }

  if (!users.length) return null;

  return (
    <div
      className="glass-card glass-float rounded-3xl overflow-hidden relative backdrop-blur-2xl transition-shadow duration-300 hover:shadow-[0_35px_65px_-15px_rgb(0_0_0/0.25),0_15px_25px_-8px_rgb(0_0_0/0.15)]"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none rounded-3xl">
        <div className="glass-orb absolute inset-0" />

        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/[0.03] dark:from-white/10 dark:to-transparent" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/75 to-transparent dark:via-white/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-zinc-500 dark:text-zinc-400" />
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
              SUGGESTED FOR YOU
            </span>
          </div>
          {users.length > 0 && (
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-300 bg-black/5 dark:bg-white/10 rounded-full px-3 py-1">
              {users.length} new
            </span>
          )}
        </div>

        {/* User Rows - Previous Hover Effect Restored */}
        <div className="flex flex-col">
          {visibleUsers.map((user, i) => (
            <div
              key={user.user_id}
              className="group flex items-center gap-3.5 px-5 py-3.5 transition-all duration-200 hover:bg-black/[0.03] dark:hover:bg-white/10 relative hover:scale-[1.01] active:scale-[0.985]"
              style={{
                borderBottom:
                  i < visibleUsers.length - 1
                    ? "1px solid var(--row-divider, rgba(0,0,0,0.06))"
                    : "none",
              }}
            >
              <Link
                href={`/${user.user_id}`}
                className="absolute inset-0 z-0"
                aria-label={`View ${user.full_name || user.username}'s profile`}
              />

              {/* Avatar */}
              <div className="relative h-10 w-10 rounded-full overflow-hidden ring-1 ring-black/10 dark:ring-white/10 shrink-0 z-10 transition-transform group-hover:scale-105">
                {user.avatar && user.avatar !== "null" ? (
                  <Image
                    src={getMediaUrl(user.avatar)}
                    alt={user.username}
                    fill
                    className="object-cover cursor-pointer"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                    <User
                      size={20}
                      className="text-zinc-400 dark:text-zinc-400"
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 z-10">
                <h4 className="text-[14.5px] font-semibold text-zinc-900 dark:text-white truncate">
                  {user.full_name || user.username}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Users
                    size={11}
                    className="text-zinc-500 dark:text-zinc-500"
                  />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {user.mutual_count} mutual friends
                  </span>
                </div>
              </div>

              {/* Follow Button */}
              <div className="z-20 relative shrink-0">
                <FollowButton
                  userId={user.user_id}
                  initialIsFollowed={false}
                  onFollowChange={(f) =>
                    console.log(
                      `${user.username} ${f ? "followed" : "unfollowed"}`,
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* See More */}
        {users.length > INITIAL_LIMIT && (
          <button
            onClick={toggle}
            className="w-full py-4 text-sm font-semibold text-zinc-600 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 border-t border-black/5 dark:border-white/10 active:bg-black/10 dark:active:bg-white/15"
          >
            {isExpanded ? (
              <>
                See less <ChevronUp size={16} />
              </>
            ) : (
              <>
                See more <ChevronDown size={16} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserSuggestion;
