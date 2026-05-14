"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, User } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

const REACTION_EMOJI: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

interface Reaction {
  id: string;
  user: string;
  username: string;
  full_name?: string;
  avatar?: string | null;
  type: string;
  content_type: string;
  created_at: string;
}

interface ReactionsModalProps {
  postId: string | number;
  contentType?: string;
  onClose: () => void;
}

const TABS = ["All", "like", "love", "haha", "wow", "sad", "angry"];

export default function ReactionsModal({
  postId,
  contentType = "post",
  onClose,
}: ReactionsModalProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const fetchReactions = async () => {
      setIsLoading(true);
      try {
        const type = contentType === "reel" ? "reels" : "posts";

        const res = await fetch(`/api/posts/${postId}/reactions-list`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        setReactions(Array.isArray(data) ? data : (data.results ?? []));
      } catch {
        setReactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReactions();
  }, [postId, contentType]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered =
    activeTab === "All"
      ? reactions
      : reactions.filter((r) => r.type === activeTab);

  const countFor = (type: string) =>
    reactions.filter((r) => r.type === type).length;

  const presentTabs = TABS.filter((t) => t === "All" || countFor(t) > 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h2 className="font-bold text-foreground text-base">Reactions</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-full text-muted-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto shrink-0 scrollbar-none">
          {presentTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {tab !== "All" && (
                <span className="text-base leading-none">
                  {REACTION_EMOJI[tab]}
                </span>
              )}
              <span>
                {tab === "All" ? `All ${reactions.length}` : countFor(tab)}
              </span>
            </button>
          ))}
        </div>

        <div className="h-px bg-border mx-4 shrink-0" />

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-1">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-32" />
                  <div className="h-2.5 bg-muted rounded w-20" />
                </div>
                <div className="w-7 h-7 rounded-full bg-muted" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              No reactions yet
            </p>
          ) : (
            // 4. Fix the list item — key, emoji lookup, avatar
            filtered.map((reaction) => {
              const avatarUrl = getMediaUrl(reaction.avatar ?? "");
              return (
                <div
                  key={reaction.id} // ← use unique "id" field
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className="relative w-10 h-10 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={reaction.username}
                          fill
                          sizes="40px"
                          className="object-cover rounded-full"
                          unoptimized
                        />
                      ) : (
                        <User size={20} className="text-muted-foreground/60" />
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-sm leading-none bg-card rounded-full border border-border p-0.5">
                      {REACTION_EMOJI[reaction.type] ?? "👍"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {reaction.full_name || reaction.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{reaction.username}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
