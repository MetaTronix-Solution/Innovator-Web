"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ChevronDown, ChevronUp, User, Users } from "lucide-react";
import { useSelector } from "react-redux";
import FollowButton from "./FollowButton";
import GlassCard from "@/components/GlassCard";

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
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

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

  const handleFollowChange = (userId: string, followed: boolean) => {
    if (!followed) return;
    setExitingIds((prev) => new Set(prev).add(userId));
    setTimeout(() => {
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }, 300);
  };

  if (loading) {
    return (
      <GlassCard
        borderRadius={12}
        className="w-full"
        style={{ minHeight: "320px" }}
      >
        <div
          className="flex flex-col items-center justify-center gap-2"
          style={{ minHeight: "320px" }}
        >
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-[11px] text-muted-foreground italic tracking-wide">
            Loading…
          </span>
        </div>
      </GlassCard>
    );
  }

  if (!users.length) return null;

  return (
    <GlassCard
      borderRadius={12}
      displacementScale={30}
      blur={0.6}
      saturation={140}
      className="w-full"
      style={{}}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-zinc-500 dark:text-zinc-400" />
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
            Suggested for you
          </span>
        </div>
        {users.length > 0 && (
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-300 bg-black/5 dark:bg-white/10 rounded-full px-3 py-1">
            {users.length} new
          </span>
        )}
      </div>

      {/* User Rows */}
      <div className="flex flex-col">
        {visibleUsers.map((user, i) => (
          <div
            key={user.user_id}
            className="group flex items-center gap-3.5 px-5 py-3.5 transition-all duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.06] relative hover:scale-[1.01] active:scale-[0.985]"
            style={{
              borderBottom:
                i < visibleUsers.length - 1
                  ? "1px solid var(--row-divider, rgba(0,0,0,0.06))"
                  : "none",
              maxHeight: exitingIds.has(user.user_id) ? "0px" : "72px",
              opacity: exitingIds.has(user.user_id) ? 0 : 1,
              transform: exitingIds.has(user.user_id)
                ? "translateX(12px) scale(0.97)"
                : undefined,
              overflow: "hidden",
              transition:
                "max-height 300ms ease, opacity 250ms ease, transform 250ms ease",
              pointerEvents: exitingIds.has(user.user_id) ? "none" : undefined,
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
            <div className="flex-1 min-w-0 z-10 cursor-pointer">
              <h4 className="text-[14.5px] font-semibold text-zinc-900 dark:text-white truncate">
                {user.full_name || user.username}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Users size={11} className="text-zinc-500 dark:text-zinc-500" />
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
                onFollowChange={(f) => handleFollowChange(user.user_id, f)}
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
    </GlassCard>
  );
};

export default UserSuggestion;
