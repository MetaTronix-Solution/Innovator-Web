"use client";

import React, { memo, useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";
import { Comment } from "@/types/comment";

interface CommentSectionProps {
  comments: Comment[];
  newComment: string;
  isLoadingComments: boolean;
  isSubmittingComment: boolean;
  onCommentChange: (val: string) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  formatTime: (date: string) => string;
  currentUserId?: string;
  currentUsername?: string;
}

const CommentSection = ({
  comments: initialComments,
  newComment,
  isLoadingComments,
  isSubmittingComment,
  onCommentChange,
  onCommentSubmit,
  formatTime,
  currentUserId,
  currentUsername,
}: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

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

  return (
    <div className="border-t border-border/50 bg-muted/10">
      <div className="px-4 py-3 border-b border-border/30">
        <CommentInput
          value={newComment}
          onChange={onCommentChange}
          onSubmit={onCommentSubmit}
          isSubmitting={isSubmittingComment}
          placeholder="Write a comment…"
          size="md"
        />
      </div>

      <div className="px-4 py-2 space-y-1 max-h-[360px] overflow-y-auto">
        {isLoadingComments ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-6">
            <p className="text-md">No comments yet.</p>
            <p className="text-lg mt-1">Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              formatTime={formatTime}
              currentUserId={currentUserId}
              currentUsername={currentUsername}
              onDeleted={handleCommentDeleted}
              onUpdated={handleCommentUpdated}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default memo(CommentSection);
