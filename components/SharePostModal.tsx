"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Send, Search, User } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

interface Follower {
  id: string | number;
  username: string;
  full_name?: string;
  avatar?: string;
}

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string | number;
    username: string;
  };
}

export default function SharePostModal({
  isOpen,
  onClose,
  post,
}: SharePostModalProps) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const postUrl = post?.id ? `${window.location.origin}/post/${post.id}` : "";
  const shareText = encodeURIComponent(
    `Check out this post by ${post.username} on Innovator!`,
  );

  const externalOptions = [
    {
      name: "WhatsApp",
      color: "bg-green-500",
      url: `https://wa.me/?text=${shareText}%20${postUrl}`,
      icon: "W",
    },
    {
      name: "Facebook",
      color: "bg-blue-600",
      url: `https://www.facebook.com/sharer/sharer.php?u=${postUrl}`,
      icon: "f",
    },
    {
      name: "Twitter",
      color: "bg-black",
      url: `https://twitter.com/intent/tweet?text=${shareText}&url=${postUrl}`,
      icon: "𝕏",
    },
  ];

  useEffect(() => {
    if (isOpen) fetchFollowers();
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/mutual-users");
      const data = await res.json();

      if (data.mutual_friends && Array.isArray(data.mutual_friends)) {
        setFollowers(data.mutual_friends);
      } else if (Array.isArray(data)) {
        setFollowers(data);
      } else {
        setFollowers([]);
      }
    } catch (err) {
      toast.error("Failed to load followers");
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    toast.success("Link copied to clipboard!");
  };

  if (!isOpen) return null;

  const filtered = Array.isArray(followers)
    ? followers.filter((f: any) =>
        f.username?.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
    : [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">Share Post</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              placeholder="Search followers..."
              className="w-full bg-muted/50 border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 min-h-[200px]">
          {loading ? (
            <div className="flex justify-center p-4 text-sm text-muted-foreground">
              Loading followers...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <User size={32} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">
                {debouncedQuery
                  ? `No user found with "${debouncedQuery}"`
                  : "No followers found."}
              </p>
            </div>
          ) : (
            filtered.map((follower: any) => {
              const avatarSrc = getMediaUrl(follower?.avatar);

              return (
                <div
                  key={follower.id}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative rounded-full border-2 border-primary/20 flex items-center justify-center bg-muted overflow-hidden shrink-0">
                      {avatarSrc ? (
                        <Image
                          src={avatarSrc}
                          alt={follower.username}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <User size={20} className="text-muted-foreground/60" />
                      )}
                    </div>

                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate">
                        {follower.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {follower.full_name || follower.username}
                      </p>
                    </div>
                  </div>

                  <button className="bg-[#ff6b00] hover:bg-[#e66000] text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95">
                    Send
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t bg-muted/20 space-y-4">
          <div className="flex justify-around">
            {externalOptions.map((opt) => (
              <a
                key={opt.name}
                href={opt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`${opt.color} w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg`}
                >
                  <span className="text-lg font-bold">{opt.icon}</span>
                </div>
                <span className="text-[10px] font-medium">{opt.name}</span>
              </a>
            ))}
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1"
            >
              <div className="bg-secondary w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                <Copy size={18} />
              </div>
              <span className="text-[10px] font-medium">Copy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
