"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, UserMinus } from "lucide-react";
import { Button } from "./ui/button";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const FollowingList = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/following")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  const list = data?.following || [];

  return (
    <div className="divide-y divide-border">
      {list.map((user: any) => (
        <UserRow
          key={user.id}
          user={user}
          actionLabel="Following"
          icon={<UserMinus size={16} />}
        />
      ))}
    </div>
  );
};

// Reusable Row Component for both lists
export const UserRow = ({ user, actionLabel, icon }: any) => {
  const getImageUrl = (path: string) => {
    if (!path) return "/google.png";
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-accent/50 transition-all group">
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 rounded-full p-0.5 border-2 border-primary/20 group-hover:border-primary">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src={getImageUrl(user.profile?.avatar)}
              alt="User"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm">
            {user.full_name || user.username}
          </span>
          <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest">
            {user.profile?.occupation || "Innovator"}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="rounded-full h-8 text-xs border-primary/30 text-primary hover:bg-primary hover:text-white gap-2"
      >
        {icon} {actionLabel}
      </Button>
    </div>
  );
};

export default FollowingList;
