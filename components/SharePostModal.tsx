"use client";

import React, { useState, useEffect } from "react";
import { X, Copy, Send, Search } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function SharePostModal({ isOpen, onClose, post }: any) {
  const [followers, setFollowers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const postUrl = `${window.location.origin}/post/${post.id}`;
  const shareText = encodeURIComponent(
    `Check out this post by ${post.username} on Innovator!`,
  );

  const externalOptions = [
    {
      name: "WhatsApp",
      color: "bg-green-500",
      url: `https://wa.me/?text=${shareText}%20${postUrl}`,
    },
    {
      name: "Facebook",
      color: "bg-blue-600",
      url: `https://www.facebook.com/sharer/sharer.php?u=${postUrl}`,
    },
    {
      name: "Twitter",
      color: "bg-black",
      url: `https://twitter.com/intent/tweet?text=${shareText}&url=${postUrl}`,
    },
  ];

  useEffect(() => {
    if (isOpen) fetchFollowers();
  }, [isOpen]);

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/followers");
      const data = await res.json();

      if (Array.isArray(data)) {
        setFollowers(data);
      } else if (data.results && Array.isArray(data.results)) {
        setFollowers(data.results); // Common in Django Rest Framework
      } else if (data.followers && Array.isArray(data.followers)) {
        setFollowers(data.followers);
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

        {/* Search Followers */}
        <div className="p-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder="Search followers..."
              className="w-full bg-muted/50 border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Followers List */}
        {/* Replace your previous list logic with this */}
        <div className="flex-1 overflow-y-auto p-2 min-h-[200px]">
          {loading ? (
            <div className="flex justify-center p-4 text-sm text-muted-foreground">
              Loading followers...
            </div>
          ) : // Add Array.isArray check here as a safety net
          Array.isArray(followers) ? (
            followers
              .filter((f: any) =>
                f.username?.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map((follower: any) => (
                <div
                  key={follower.id}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                      <Image
                        src={follower.avatar || "/default-avatar.png"}
                        fill
                        alt="user"
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {follower.username}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {follower.full_name}
                      </p>
                    </div>
                  </div>

                  <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90">
                    Send
                  </button>
                </div>
              ))
          ) : (
            <div className="text-center p-4 text-xs text-muted-foreground">
              No followers found.
            </div>
          )}
        </div>

        {/* External Options */}
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
                  <Send size={18} />
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
