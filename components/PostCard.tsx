"use client";

import React, { useState } from "react";
import Image from "next/image";
import { EllipsisVertical, MessageCircle, Send, ThumbsUp } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const formatTime = (dateString: string) => {
  if (!dateString) return "Just now";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds)) return "Recently";

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const PostCard = ({ post, index }: { post: any; index?: number }) => {
  const [isMuted, setIsMuted] = useState(true);

  const getMediaUrl = (url?: string): string => {
    if (!url || url === "" || url === "null") return "";
    return url.startsWith("http")
      ? url
      : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // 1. Universal Media Picker
  const mediaFile = getMediaUrl(
    post.media?.[0]?.file ||
      post.video_url ||
      post.file ||
      post.video ||
      post.reel_url ||
      post.image_url,
  );

  const isVideo = Boolean(
    post.media?.[0]?.media_type?.toLowerCase().includes("video") ||
    ["reel", "video"].includes(post.type?.toLowerCase()) ||
    mediaFile.toLowerCase().match(/\.(mp4|webm|mov|m4v|m3u8)$/),
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-4">
      <div className="p-4 flex items-center justify-between gap-3">
        {/* Left Side: Avatar + Username/Time */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative rounded-full border-2 border-orange-500 p-0.5">
            <Image
              src={getMediaUrl(post.avatar) || "/google.png"}
              alt={post.username || "avatar"}
              fill
              className="rounded-full object-cover"
              unoptimized
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900">
                {post.full_name || post.username}
              </p>

              <button className="text-blue-500 text-xs font-bold hover:text-blue-700 transition-colors">
                • Follow
              </button>
            </div>

            {/* posted time */}
            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
              {post.created_at ? formatTime(post.created_at) : "Just now"}
            </p>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <EllipsisVertical size={20} />
        </button>
      </div>

      {/* Content Text */}
      {post.content && (
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-800 leading-relaxed">
            {post.content}
          </p>
        </div>
      )}

      {/* Media Section - ONLY show if mediaFile exists */}
      {mediaFile ? (
        <div className="w-full bg-black flex items-center justify-center min-h-[300px] relative">
          {isVideo ? (
            <div className="relative group">
              <video
                key={mediaFile}
                muted={isMuted}
                controls
                autoPlay
                loop
                playsInline
                preload="metadata"
                className="w-full max-h-[600px] object-contain"
              >
                <source src={mediaFile} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div className="relative w-full h-[400px]">
              <Image
                src={mediaFile}
                alt="Post content"
                fill
                className="object-contain"
                unoptimized
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          )}
        </div>
      ) : null}

      {/* Footer */}
      <div className="p-4 flex gap-6 text-gray-500 border-t border-gray-50">
        <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
          <span>
            <ThumbsUp size={20} />
          </span>{" "}
          {post.like_count || 0}
        </button>
        <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
          <span>
            <MessageCircle size={20} />
          </span>{" "}
          {post.comments_count || 0}
        </button>

        <button>
          <span>
            <Send size={20} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
