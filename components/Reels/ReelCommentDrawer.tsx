"use client";

import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, MessageSquare } from "lucide-react";
import { getComments } from "@/lib/services/commentService";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils/formatRelativeTime";
import type { Comment } from "@/types/comment";
import CommentItem from "../Comments/CommentItem";
import CommentInput from "../Comments/CommentInput";

interface Props {
  reelId: string;
  commentsCount: number;
  currentUserId?: string;
  currentUsername?: string;
  onClose: () => void;
}

export default function ReelCommentsDrawer({
  reelId,
  commentsCount,
  currentUserId,
  currentUsername,
  onClose,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: Comment[] = await getComments(reelId, "reel");
      setComments(data);
    } catch {
      toast.error("Failed to load comments.");
    } finally {
      setIsLoading(false);
    }
  }, [reelId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = newComment.trim();
      if (!trimmed) return;

      setIsSubmitting(true);
      try {
        const res = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: trimmed,
            object_id: reelId,
            content_type: "reel",
          }),
        });
        if (!res.ok) throw new Error();
        const created: Comment = await res.json();
        setComments((prev) => [created, ...prev]);
        setNewComment("");
        toast.success("Comment posted!");
      } catch {
        toast.error("Failed to post comment.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [newComment, reelId],
  );

  const handleCommentDeleted = useCallback((commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  const handleCommentUpdated = useCallback(
    (commentId: string, newContent: string) => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content: newContent } : c,
        ),
      );
    },
    [],
  );

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex justify-end"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Comments"
    >
      <div
        className="bg-card flex flex-col h-full w-[400px] shadow-2xl border-l border-border/40 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} className="text-muted-foreground" />
            <h3 className="font-semibold text-sm text-foreground">
              {commentsCount} Comments
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close comments"
            className="p-1 rounded-full hover:bg-accent transition-colors text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-border/20">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
              <MessageSquare size={32} className="opacity-30" />
              <p className="text-sm">No comments yet. Be the first!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                formatTime={formatRelativeTime}
                currentUserId={currentUserId}
                currentUsername={currentUsername}
                onDeleted={handleCommentDeleted}
                onUpdated={handleCommentUpdated}
              />
            ))
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border/50 p-3 bg-background/30 backdrop-blur-sm shrink-0">
          <CommentInput
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            placeholder="Add a comment…"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
