"use client";

import React, { useState, useCallback, memo } from "react";
import Image from "next/image";
import { User, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { toast } from "sonner";

interface Reply {
  id: string;
  user_id: string;
  username: string;
  avatar?: string;
  content: string;
  created_at: string;
}

interface Comment {
  id: string;
  user_id: string;
  username: string;
  avatar?: string;
  content: string;
  created_at: string;
  replies_count?: number;
  replies?: Reply[];
}

interface CommentSectionProps {
  comments: Comment[];
  newComment: string;
  isLoadingComments: boolean;
  isSubmittingComment: boolean;
  onCommentChange: (val: string) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  formatTime: (date: string) => string;
}

const CommentSection = ({
  comments,
  newComment,
  isLoadingComments,
  isSubmittingComment,
  onCommentChange,
  onCommentSubmit,
  formatTime,
}: CommentSectionProps) => {
  return (
    <div className="border-t border-border/50 bg-muted/10">
      {/* Comment input */}
      <form
        onSubmit={onCommentSubmit}
        className="flex items-center gap-2 px-4 py-3 border-b border-border/30"
      >
        <input
          type="text"
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Write a comment…"
          className="flex-1 bg-muted/40 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={isSubmittingComment || !newComment.trim()}
          className="text-primary text-sm font-semibold disabled:opacity-40 hover:text-primary/80 transition-colors"
        >
          {isSubmittingComment ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Post"
          )}
        </button>
      </form>

      {/* Comments list */}
      <div className="px-4 py-2 space-y-1 max-h-[360px] overflow-y-auto">
        {isLoadingComments ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-6">
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              formatTime={formatTime}
            />
          ))
        )}
      </div>
    </div>
  );
};

const CommentItem = memo(
  ({
    comment,
    formatTime,
  }: {
    comment: Comment;
    formatTime: (date: string) => string;
  }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replies, setReplies] = useState<Reply[]>(comment.replies ?? []);
    const [showReplies, setShowReplies] = useState(false);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [repliesCount, setRepliesCount] = useState(
      comment.replies_count ?? 0,
    );

    const avatarUrl = getMediaUrl(comment.avatar);

    const fetchReplies = useCallback(async () => {
      if (replies.length > 0) {
        setShowReplies((v) => !v);
        return;
      }
      setIsLoadingReplies(true);
      try {
        const res = await fetch(`/api/replies?comment_id=${comment.id}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setReplies(list);
        setShowReplies(true);
      } catch {
        toast.error("Failed to load replies");
      } finally {
        setIsLoadingReplies(false);
      }
    }, [comment.id, replies.length]);

    const handleSubmitReply = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        try {
          const res = await fetch("/api/replies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              parent: comment.id,
              content: replyText.trim(),
            }),
          });
          if (!res.ok) throw new Error();
          const created = await res.json();
          setReplies((prev) => [...prev, created]);
          setRepliesCount((c) => c + 1);
          setReplyText("");
          setShowReplyInput(false);
          setShowReplies(true);
          toast.success("Reply posted!");
        } catch {
          toast.error("Failed to post reply");
        } finally {
          setIsSubmitting(false);
        }
      },
      [comment.id, replyText],
    );

    return (
      <div className="py-2">
        {/* Comment */}
        <div className="flex gap-2.5">
          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 relative mt-0.5">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={comment.username}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <User size={14} className="text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-muted/40 rounded-2xl px-3 py-2 inline-block max-w-full">
              <p className="text-xs font-semibold text-foreground">
                {comment.username}
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed mt-0.5 break-words">
                {comment.content}
              </p>
            </div>

            {/* Actions row */}
            <div className="flex items-center gap-3 mt-1 px-1">
              <span className="text-[11px] text-muted-foreground">
                {formatTime(comment.created_at)}
              </span>
              <button
                onClick={() => setShowReplyInput((v) => !v)}
                className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                Reply
              </button>
              {repliesCount > 0 && (
                <button
                  onClick={fetchReplies}
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {isLoadingReplies ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : showReplies ? (
                    <ChevronUp size={12} />
                  ) : (
                    <ChevronDown size={12} />
                  )}
                  {showReplies
                    ? "Hide"
                    : `${repliesCount} ${repliesCount === 1 ? "reply" : "replies"}`}
                </button>
              )}
            </div>

            {/* Reply input */}
            {showReplyInput && (
              <form
                onSubmit={handleSubmitReply}
                className="flex items-center gap-2 mt-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.username}…`}
                  autoFocus
                  className="flex-1 bg-muted/40 rounded-full px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !replyText.trim()}
                  className="text-primary text-xs font-semibold disabled:opacity-40 hover:text-primary/80 transition-colors shrink-0"
                >
                  {isSubmitting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    "Post"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyInput(false);
                    setReplyText("");
                  }}
                  className="text-muted-foreground text-xs hover:text-foreground transition-colors shrink-0"
                >
                  Cancel
                </button>
              </form>
            )}

            {/* Replies list */}
            {showReplies && replies.length > 0 && (
              <div className="mt-2 space-y-2 pl-1 border-l-2 border-border/40 ml-1">
                {replies.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

CommentItem.displayName = "CommentItem";

const ReplyItem = memo(
  ({
    reply,
    formatTime,
  }: {
    reply: Reply;
    formatTime: (date: string) => string;
  }) => {
    const avatarUrl = getMediaUrl(reply.avatar);

    return (
      <div className="flex gap-2 pl-2 py-1">
        <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 relative mt-0.5">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={reply.username}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <User size={11} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-muted/30 rounded-2xl px-3 py-1.5 inline-block max-w-full">
            <p className="text-[11px] font-semibold text-foreground">
              {reply.username}
            </p>
            <p className="text-xs text-foreground/90 leading-relaxed mt-0.5 break-words">
              {reply.content}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 px-1">
            {formatTime(reply.created_at)}
          </p>
        </div>
      </div>
    );
  },
);

ReplyItem.displayName = "ReplyItem";
export default memo(CommentSection);
