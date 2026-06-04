"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, User } from "lucide-react"; // Added User import
import FollowButton from "@/components/FollowButton";
import { useSelector } from "react-redux";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { RootState } from "@/lib/store/store";
import Link from "next/link";

const FollowerList = () => {
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await fetch("/api/followers");
        const data = await res.json();
        setFollowers(data.followers || data || []);
      } catch (err) {
        console.error("Error fetching followers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowers();
  }, []);

  if (loading)
    return <Loader2 className="animate-spin mx-auto mt-10 text-primary" />;

  if (followers.length === 0)
    return (
      <div className="p-10 text-center text-muted-foreground text-sm">
        No followers yet.
      </div>
    );

  return (
    <div className="divide-y divide-border">
      {followers.map((user: any) => {
        const avatarSrc = getMediaUrl(user.profile?.avatar);

        return (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 hover:bg-accent/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <Link
                href={`/${user.id}`}
                className="relative w-14 h-14 rounded-full border-2 border-primary/20 flex items-center justify-center bg-muted overflow-hidden shrink-0 transition-colors group-hover:border-primary"
              >
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={user.full_name || user.username}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <User size={28} className="text-muted-foreground/60" />
                )}
              </Link>

              <div className="flex flex-col">
                <Link
                  href={`/${user.id}`}
                  className="font-bold text-foreground text-sm"
                >
                  {user.full_name || user.username}
                </Link>
                <span className="text-xs text-primary/80 font-medium uppercase tracking-wider">
                  {user.profile?.occupation || "Innovator"}
                </span>
              </div>
            </div>

            <FollowButton userId={user.id} username={user.username} />
          </div>
        );
      })}
    </div>
  );
};

export default FollowerList;
