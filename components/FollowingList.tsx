"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, User } from "lucide-react";
import FollowButton from "@/components/FollowButton";
import { useSelector } from "react-redux";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

const FollowingList = () => {
  const [followings, setFollowings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const fetchFollowings = async () => {
      try {
        const res = await fetch("/api/following");
        const data = await res.json();
        setFollowings(data.following || data || []);
      } catch (err) {
        console.error("Error fetching followings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowings();
  }, []);

  if (loading)
    return <Loader2 className="animate-spin mx-auto mt-10 text-primary" />;

  return (
    <div className="divide-y divide-border">
      {followings.length > 0 ? (
        followings.map((user: any) => {
          const avatarSrc = getMediaUrl(user.profile?.avatar);

          return (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 hover:bg-accent/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full border-2 border-primary/20 flex items-center justify-center bg-muted overflow-hidden shrink-0 transition-colors group-hover:border-primary">
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
                </div>

                <div className="flex flex-col">
                  <span className="font-bold text-foreground text-sm">
                    {user.full_name || user.username}
                  </span>
                  <span className="text-xs text-primary/80 font-medium uppercase tracking-wider">
                    {user.profile?.occupation || "Innovator"}
                  </span>
                </div>
              </div>

              <FollowButton
                userId={user.id}
                username={user.username}
                initialIsFollowed={
                  currentUser?.following_usernames?.includes(user.username) ??
                  true
                }
              />
            </div>
          );
        })
      ) : (
        <div className="p-10 text-center text-muted-foreground text-sm">
          You are not following anyone yet.
        </div>
      )}
    </div>
  );
};

export default FollowingList;
