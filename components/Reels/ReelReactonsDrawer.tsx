"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

const REACTION_EMOJI: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

interface Props {
  reelId: string;
  onClose: () => void;
}

export default function ReelReactionsDrawer({ reelId, onClose }: Props) {
  const [reactions, setReactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchReactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/posts/${reelId}/reactions-list/`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReactions(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [reelId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  const reactionTypes = [
    "all",
    ...Array.from(new Set(reactions.map((r) => r.type))),
  ];
  const filtered =
    activeFilter === "all"
      ? reactions
      : reactions.filter((r) => r.type === activeFilter);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex justify-end"
      style={{ background: "rgba(0,0,0,0.3)" }}
      onClick={onClose}
    >
      <div
        className="bg-card flex flex-col h-full w-[400px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="font-semibold text-sm text-foreground">Reactions</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-accent transition-colors text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {reactionTypes.length > 1 && (
          <div className="flex gap-2 px-4 py-2 border-b border-border/50 overflow-x-auto">
            {reactionTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeFilter === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {type !== "all" && <span>{REACTION_EMOJI[type] ?? "👍"}</span>}
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={22} className="animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              No reactions yet.
            </p>
          ) : (
            filtered.map((reaction, i) => {
              const avatar = getMediaUrl(reaction.avatar);
              return (
                <div key={reaction.id ?? i} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-muted border border-border overflow-hidden relative">
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt={reaction.username || "user"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {(reaction.username || "U")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-sm leading-none">
                      {REACTION_EMOJI[reaction.type] ?? "👍"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {reaction.full_name || reaction.username}
                    </p>
                    {reaction.username && reaction.full_name && (
                      <p className="text-xs text-muted-foreground">
                        @{reaction.username}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
