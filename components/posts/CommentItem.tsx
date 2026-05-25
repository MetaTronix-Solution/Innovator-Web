"use client";

import React, { memo, useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { Reply, Comment } from "@/types/comment";
import ReplyItem from "./ReplyItem";
import CommentInput from "./CommentInput";

interface CommentItemProps {
  comment: Comment;
  formatTime: (date: string) => string;
  currentUserId?: string;
  onDeleted: (commentId: string) => void;
  onUpdated: (commentId: string, newContent: string) => void;
}

const CommentItem = memo(
  ({
    comment,
    formatTime,
    currentUserId,
    onDeleted,
    onUpdated,
  }: CommentItemProps) => {
    const [replies, setReplies] = useState<Reply[]>(comment.replies ?? []);
    const [repliesCount, setRepliesCount] = useState(
      comment.replies_count ?? 0,
    );
    const [showReplies, setShowReplies] = useState(false);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);

    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content);
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const avatarUrl = getMediaUrl(comment.avatar);

    const isOwner = !!currentUserId && currentUserId === comment.user_id;

    const fetchReplies = useCallback(async () => {
      if (replies.length > 0) {
        setShowReplies((v) => !v);
        return;
      }
      setIsLoadingReplies(true);
      try {
        const res = await fetch(`/api/replies?comment_id=${comment.id}`);
        const data = await res.json();
        const list: Reply[] = Array.isArray(data) ? data : (data.results ?? []);
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
        setIsSubmittingReply(true);
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
          const created: Reply = await res.json();
          setReplies((prev) => [...prev, created]);
          setRepliesCount((c) => c + 1);
          setReplyText("");
          setShowReplyInput(false);
          setShowReplies(true);
          toast.success("Reply posted!");
        } catch {
          toast.error("Failed to post reply");
        } finally {
          setIsSubmittingReply(false);
        }
      },
      [comment.id, replyText],
    );

    const handleEdit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editText.trim() || editText.trim() === comment.content) {
          setIsEditing(false);
          return;
        }
        setIsSubmittingEdit(true);
        try {
          const res = await fetch(`/api/comments/${comment.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: editText.trim() }),
          });
          if (!res.ok) throw new Error();
          onUpdated(comment.id, editText.trim());
          setIsEditing(false);
          toast.success("Comment updated!");
        } catch {
          toast.error("Failed to update comment");
        } finally {
          setIsSubmittingEdit(false);
        }
      },
      [editText, comment.content, comment.id, onUpdated],
    );

    const handleDelete = useCallback(async () => {
      if (!confirm("Delete this comment?")) return;
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/comments/${comment.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error();
        onDeleted(comment.id);
        toast.success("Comment deleted");
      } catch {
        toast.error("Failed to delete comment");
      } finally {
        setIsDeleting(false);
      }
    }, [comment.id, onDeleted]);

    const handleReplyDeleted = useCallback((replyId: string) => {
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
      setRepliesCount((c) => Math.max(0, c - 1));
    }, []);

    const handleReplyUpdated = useCallback(
      (replyId: string, newContent: string) => {
        setReplies((prev) =>
          prev.map((r) =>
            r.id === replyId ? { ...r, content: newContent } : r,
          ),
        );
      },
      [],
    );

    return (
      <div className="py-2">
        <div className="flex gap-2.5">
          <Avatar size="default" className="mt-0.5 shrink-0">
            <AvatarImage src={avatarUrl ?? undefined} alt={comment.username} />

            <AvatarFallback>
              <User size={14} className="text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="mt-1">
                <CommentInput
                  value={editText}
                  onChange={setEditText}
                  onSubmit={handleEdit}
                  onCancel={() => {
                    setIsEditing(false);
                    setEditText(comment.content);
                  }}
                  isSubmitting={isSubmittingEdit}
                  placeholder="Edit comment…"
                  autoFocus
                  size="sm"
                  showCancel
                />
              </div>
            ) : (
              <div className="bg-muted/40 rounded-2xl px-3 py-2 inline-block max-w-full">
                <p className="text-xs font-semibold text-foreground">
                  {comment.username}
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed mt-0.5 break-words">
                  {comment.content}
                </p>
              </div>
            )}

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
              {isOwner && (
                <>
                  <button
                    onClick={() => {
                      setEditText(comment.content);
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Pencil size={11} />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                  >
                    {isDeleting ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Trash2 size={11} />
                    )}
                    Delete
                  </button>
                </>
              )}
            </div>

            {showReplyInput && (
              <div className="mt-2">
                <CommentInput
                  value={replyText}
                  onChange={setReplyText}
                  onSubmit={handleSubmitReply}
                  onCancel={() => {
                    setShowReplyInput(false);
                    setReplyText("");
                  }}
                  isSubmitting={isSubmittingReply}
                  placeholder={`Reply to ${comment.username}…`}
                  autoFocus
                  size="xs"
                  showCancel
                />
              </div>
            )}

            {showReplies && replies.length > 0 && (
              <div className="mt-2 space-y-2 pl-1 border-l-2 border-border/40 ml-1">
                {replies.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    formatTime={formatTime}
                    currentUserId={currentUserId}
                    onDeleted={handleReplyDeleted}
                    onUpdated={handleReplyUpdated}
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
export default CommentItem;
