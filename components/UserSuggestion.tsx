"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link"; // Imported Link
import { Loader2, Sparkles, ChevronDown, ChevronUp, User } from "lucide-react";
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
    if (url.startsWith("http://")) {
      return `/api/media?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadSuggestions = async () => {
      try {
        const res = await fetch("/api/suggestions");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [isAuthenticated]);

  const visibleUsers = users.slice(0, displayLimit);
  const isFullyExpanded = displayLimit >= users.length;

  const toggleDisplay = () => {
    if (isFullyExpanded) {
      setDisplayLimit(INITIAL_LIMIT);
    } else {
      setDisplayLimit(users.length);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-medium italic">
          Loading...
        </span>
      </div>
    );
  }

  if (!users.length) return null;

  return (
    <div className="flex flex-col">
      <div className="divide-y divide-border/40">
        {visibleUsers.map((user) => (
          <div
            key={user.user_id}
            className="flex items-center justify-between p-3 transition-colors hover:bg-accent/40 relative group"
          >
            <Link
              href={`/${user.user_id}`}
              className="absolute inset-0 z-0"
              aria-label={`View ${user.full_name || user.username}'s profile`}
            />

            <div className="flex items-center gap-3 min-w-0 z-10 pointer-events-none">
              <div className="relative h-10 w-10 shrink-0 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-all shadow-sm">
                {user.avatar && user.avatar !== "null" ? (
                  <Image
                    src={getMediaUrl(user.avatar)}
                    alt={user.username}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <User
                    size={22}
                    className="text-muted-foreground/60 block leading-none"
                  />
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate tracking-tight">
                  {user.full_name || user.username}
                </h4>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Sparkles size={10} />
                    <span>{user.mutual_count} mutual friends</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column Action: Elevated z-index to sit cleanly on top of the Link overlay */}
            <div className="z-20 relative">
              <FollowButton
                userId={user.user_id}
                initialIsFollowed={false}
                onFollowChange={(isFollowed) => {
                  console.log(
                    `${user.username} is now ${isFollowed ? "followed" : "unfollowed"}`,
                  );
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* See More Button */}
      {users.length > INITIAL_LIMIT && (
        <button
          onClick={toggleDisplay}
          className="w-full py-3 text-xs font-bold text-primary hover:bg-accent/60 transition-colors flex items-center justify-center gap-2 border-t border-border/40"
        >
          {isFullyExpanded ? (
            <>
              See Less <ChevronUp size={14} />
            </>
          ) : (
            <>
              See More <ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default UserSuggestion;
