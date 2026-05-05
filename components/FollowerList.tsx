"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "./ui/button";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const FollowerList = () => {
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await fetch("/api/followers");
        const data = await res.json();
        setFollowers(data.followers || []);
        console.log(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowers();
  }, []);

  const getImageUrl = (path: string) => {
    if (!path) return "/google.png";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  if (loading)
    return <Loader2 className="animate-spin mx-auto mt-10 text-primary" />;

  return (
    <div className="divide-y divide-border">
      {followers.length > 0 ? (
        followers.map((user: any) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 hover:bg-accent/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full p-0.5 border-2 border-primary/20 group-hover:border-primary transition-colors">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={getImageUrl(user.profile?.avatar)}
                    alt={user.full_name || "Innovator"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
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
            <Button
              variant="outline"
              className="rounded-full border-primary text-primary hover:bg-primary hover:text-white gap-2 h-8 text-xs"
            >
              <UserPlus size={14} />
              Follow Back
            </Button>
          </div>
        ))
      ) : (
        <div className="p-10 text-center text-muted-foreground text-sm">
          No followers yet.
        </div>
      )}
    </div>
  );
};

export default FollowerList;
