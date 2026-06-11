"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Send, CornerDownRight, MessageSquare } from "lucide-react";
import { getComments, postComment } from "@/lib/services/commentService";
import { toast } from "sonner";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

interface Props {
  reelId: string;
  commentsCount: number;
  onClose: () => void;
}

interface ReplyTarget {
  id: string;
  username: string;
}

export default function ReelCommentsDrawer({
  reelId,
  commentsCount,
  onClose,
}: Props) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getComments(reelId, "reel");
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
      if (!newComment.trim()) return;
      setIsSubmitting(true);
      try {
        const payload = replyTo
          ? {
              id: reelId,
              content: newComment,
              type: "reel" as const,
              parentId: replyTo.id,
            }
          : { id: reelId, content: newComment, type: "reel" as const };

        const created = await postComment(
          payload.id,
          payload.content,
          payload.type,
        );

        if (replyTo) {
          setComments((prev) =>
            prev.map((c) => {
              if (c.id === replyTo.id) {
                return { ...c, replies: [created, ...(c.replies || [])] };
              }
              return c;
            }),
          );
        } else {
          setComments((prev) => [created, ...prev]);
        }

        setNewComment("");
        setReplyTo(null);
        toast.success(replyTo ? "Reply posted!" : "Comment posted!");
      } catch (err: any) {
        toast.error(err.message || "Failed to post comment.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [newComment, reelId, replyTo],
  );

  const handleReplyAction = (commentId: string, username: string) => {
    setReplyTo({ id: commentId, username });
    setNewComment(`@${username} `);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const cancelReply = () => {
    setReplyTo(null);
    setNewComment("");
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "Just now";
    const diff = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000,
    );
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!mounted) return null;

  const CommentNode = ({
    comment,
    isReply = false,
  }: {
    comment: any;
    isReply?: boolean;
  }) => {
    const avatar = getMediaUrl(comment.avatar || comment.user?.profile?.avatar);
    const username =
      comment.username || comment.user?.username || comment.full_name || "User";

    return (
      <div className={`flex gap-3 ${isReply ? "mt-3 ml-6" : ""}`}>
        <div
          className={`${isReply ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs"} rounded-full bg-muted border border-border overflow-hidden shrink-0 relative`}
        >
          {avatar ? (
            <Image
              src={avatar}
              alt={username}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground bg-accent">
              {username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-foreground">
              {username}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatTime(comment.created_at || comment.createdAt)}
            </span>
          </div>

          <div className="flex items-end gap-3">
            <p className="text-sm text-foreground/90 mt-0.5 leading-relaxed break-words">
              {comment.content || comment.text}
            </p>

            {!isReply && (
              <button
                onClick={() => handleReplyAction(comment.id, username)}
                className="shrink-0 mb-0.5 text-[11px] text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                Reply
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex justify-end"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="bg-card flex flex-col h-full w-[400px] shadow-2xl border-l border-border/40 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50 backdrop-blur-md">
          <h3 className="font-semibold text-sm text-foreground">
            {commentsCount} Comments
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-accent transition-colors text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-12">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-border/20 pb-4 last:border-0 last:pb-0"
              >
                <CommentNode comment={comment} />

                {comment.replies && comment.replies.length > 0 && (
                  <div className="space-y-1 relative before:absolute before:left-3 before:top-2 before:bottom-3 before:w-[1px] before:bg-border/60">
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id} className="flex items-start">
                        <CornerDownRight
                          size={12}
                          className="text-muted-foreground/50 mt-5 ml-3 shrink-0"
                        />
                        <div className="flex-1">
                          <CommentNode comment={reply} isReply />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border/50 p-3 bg-background/30 backdrop-blur-sm">
          {replyTo && (
            <div className="flex items-center justify-between bg-accent/60 px-3 py-1.5 rounded-t-lg border-x border-t border-border text-xs text-muted-foreground mb-[-1px]">
              <span>
                Replying to{" "}
                <b className="text-foreground">@{replyTo.username}</b>
              </span>
              <button
                onClick={cancelReply}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? "Write a reply…" : "Add a comment…"}
              className="flex-1 bg-muted/50 border border-border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60 transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0 shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
