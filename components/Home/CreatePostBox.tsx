"use client";

import React, { useState } from "react";
import { Video, ImageIcon, Smile, User } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import Image from "next/image";
import CreatePostModal from "./CreatePostModal";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const CreatePostBox = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const getProfileImage = () => {
    if (!user?.profile_image) return null;
    return user.profile_image.startsWith("http")
      ? user.profile_image
      : `${BASE_URL}${user.profile_image}`;
  };
  const profileImage = getProfileImage();

  const firstName =
    user?.full_name?.split(" ")[0] || user?.username || "Innovator";

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-3 md:p-4 mb-4">
      <div className="flex items-center gap-2 md:gap-3 pb-3 border-b border-border">
        <div className="flex-shrink-0 relative">
          <div className="w-12 h-12 relative rounded-full border-2 border-primary/20 p-0 flex items-center justify-center bg-muted overflow-hidden shrink-0">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={user?.username || "User profile"}
                fill
                className="rounded-full object-cover cursor-pointer hover:opacity-90"
                priority
                unoptimized
              />
            ) : (
              <User
                size={22}
                className="text-muted-foreground/60 block md:hidden"
              />
            )}
            {!profileImage && (
              <User
                size={26}
                className="text-muted-foreground/60 hidden md:block"
              />
            )}
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 bg-muted hover:bg-accent text-muted-foreground text-left px-4 py-2 md:py-2.5 rounded-full transition-colors text-sm md:text-[17px] truncate"
        >
          What's on your mind, {firstName}?
        </button>
        <CreatePostModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          user={user}
          profileImage={getProfileImage()} // Pass the helper result directly
        />
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
