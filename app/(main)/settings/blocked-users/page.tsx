"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Loader2, Ban } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { toast } from "sonner";

interface BlockedUser {
  id: string;
  username: string;
  full_name: string;
  profile: {
    avatar: string | null;
    bio: string | null;
    occupation: string | null;
    followers_count: number;
  };
}

export default function BlockedUsersPage() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  const fetchBlockedUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users/blocked-list/");
      if (!res.ok) throw new Error("Failed to fetch blocked users");
      const data = await res.json();
      setBlockedUsers(data.blocked_users ?? []);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const handleUnblock = async (user: BlockedUser) => {
    setUnblocking(user.id);
    try {
      const res = await fetch(`/api/users/${user.id}/unblock/`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to unblock user");
      }
      setBlockedUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`Unblocked ${user.username}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to unblock user");
    } finally {
      setUnblocking(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen bg-background text-foreground pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border sticky top-0 bg-background z-10">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-accent transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-base">Blocked Users</h1>
          {!loading && (
            <p className="text-xs text-muted-foreground">
              {blockedUsers.length}{" "}
              {blockedUsers.length === 1 ? "user" : "users"} blocked
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <p className="text-sm text-destructive">{error}</p>
          <button
            onClick={fetchBlockedUsers}
            className="text-sm text-primary font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Ban size={28} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            No blocked users
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Users you block won't be able to see your posts or interact with
            you.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {blockedUsers.map((user) => {
            const avatarUrl = getMediaUrl(user.profile?.avatar);
            const isUnblocking = unblocking === user.id;

            return (
              <li key={user.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-11 h-11 rounded-full bg-muted border border-border overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={user.username}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <User size={20} className="text-muted-foreground/60" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.full_name || user.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{user.username}
                  </p>
                  {user.profile?.occupation && (
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                      {user.profile.occupation}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleUnblock(user)}
                  disabled={isUnblocking}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {isUnblocking ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    "Unblock"
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
