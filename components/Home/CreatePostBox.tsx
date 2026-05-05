"use client";

import React from "react";
import { Video, ImageIcon, Smile } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import Image from "next/image";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const CreatePostBox = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const getProfileImage = () => {
    if (!user?.profile_image) return "/person.png";
    return user.profile_image.startsWith("http")
      ? user.profile_image
      : `${BASE_URL}${user.profile_image}`;
  };

  const firstName =
    user?.full_name?.split(" ")[0] || user?.username || "Innovator";

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-3 md:p-4 mb-4">
      <div className="flex items-center gap-2 md:gap-3 pb-3 border-b border-border">
        <div className="flex-shrink-0 relative">
          <div className="w-9 h-9 md:w-10 md:h-10 relative">
            <Image
              src={getProfileImage()}
              alt={user?.username || "User profile"}
              fill
              className="rounded-full object-cover cursor-pointer hover:opacity-90 border border-border"
              priority
              unoptimized
            />
          </div>
        </div>

        <button className="flex-1 bg-muted hover:bg-accent text-muted-foreground text-left px-4 py-2 md:py-2.5 rounded-full transition-colors text-sm md:text-[17px] truncate">
          What's on your mind, {firstName}?
        </button>
      </div>

      {/* Actions Section */}
      <div className="flex items-center justify-between pt-2">
        <PostAction
          icon={<ImageIcon className="text-[#45bd62]" size={20} />}
          label="Photo"
        />
        <PostAction
          icon={<Video className="text-destructive" size={20} />}
          label="Video"
        />
        {/* Added a third action for better balance on wider mobile screens */}
        <PostAction
          icon={<Smile className="text-[#f7b928]" size={20} />}
          label="Feeling"
          className="hidden sm:flex"
        />
      </div>
    </div>
  );
};

const PostAction = ({ icon, label, className = "" }) => {
  return (
    <div
      className={`flex items-center justify-center gap-2 flex-1 py-2 px-1 rounded-lg cursor-pointer hover:bg-accent transition-all active:scale-95 group ${className}`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-muted-foreground font-semibold text-xs md:text-[15px] group-hover:text-foreground">
        {label}
      </span>
    </div>
  );
};

export default CreatePostBox;
