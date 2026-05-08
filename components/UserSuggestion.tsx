"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  UserPlus,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User, // Added User icon for fallback
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const INITIAL_LIMIT = 5;

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/suggestions", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
  }, []);

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
          Scanning the network...
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
            onClick={() => router.push(`/profile/${user.username}`)}
            className="flex items-center justify-between p-3 transition-colors hover:bg-accent/40 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative h-10 w-10 shrink-0 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden group-hover:border-primary/50 transition-all shadow-sm">
                {user.avatar && user.avatar !== "null" ? (
                  <Image
                    src={user.avatar}
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

            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 rounded-full border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <UserPlus size={14} className="mr-1.5" />
              <span className="text-xs font-bold">Follow</span>
            </Button>
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
