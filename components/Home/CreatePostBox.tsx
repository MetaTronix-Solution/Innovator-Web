"use client";

import React, { useState, useRef } from "react";
import { Video, ImageIcon, User } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import Image from "next/image";
import CreatePostModal from "./CreatePostModal";
import Link from "next/link";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

const CreatePostBox = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getProfileImage = () => {
    const rawAvatarPath = user?.profile?.avatar || user?.profile_image;

    if (!rawAvatarPath || rawAvatarPath === "null") return null;

    return getMediaUrl(rawAvatarPath);
  };

  const userId = user?.id || user?.user_id;
  const profileImage = getProfileImage();
  const firstName =
    user?.full_name?.split(" ")[0] || user?.username || "Innovator";

  const handleActionClick = (type: "image/*" | "video/*") => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsOpen(true);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-3 md:p-4 mb-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,video/*"
      />

      <div className="flex items-center gap-2 md:gap-3 pb-3 border-b border-border">
        <Link
          href={`/${userId}`}
          className="flex-shrink-0 relative transition-transform active:scale-95"
        >
          <div className="w-12 h-12 relative rounded-full border-2 border-primary/20 p-0 flex items-center justify-center bg-muted overflow-hidden shrink-0">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={user?.username || "User profile"}
                fill
                className="rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                priority
                unoptimized
              />
            ) : (
              <User size={26} className="text-muted-foreground/60" />
            )}
          </div>
        </Link>

        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 bg-muted hover:bg-accent text-muted-foreground text-left px-4 py-2 md:py-2.5 rounded-full transition-colors text-sm md:text-[17px] truncate"
        >
          What's on your mind, {firstName}?
        </button>

        <CreatePostModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedFile(null);
          }}
          user={user}
          profileImage={profileImage}
          initialFile={selectedFile}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <PostAction
          icon={<ImageIcon className="text-[#45bd62]" size={20} />}
          label="Photo"
          onClick={() => handleActionClick("image/*")}
        />
        <PostAction
          icon={<Video className="text-destructive" size={20} />}
          label="Video"
          onClick={() => handleActionClick("video/*")}
        />
      </div>
    </div>
  );
};

const PostAction = ({ icon, label, onClick, className = "" }: any) => {
  return (
    <div
      onClick={onClick}
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
