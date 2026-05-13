import { Loader2, User, SendHorizontal } from "lucide-react";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  comments: any[];
  newComment: string;
  isLoadingComments: boolean;
  isSubmittingComment: boolean;
  onCommentChange: (value: string) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  formatTime: (d: string) => string;
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
    <div className="border-t border-border/50 bg-muted/5 animate-in fade-in slide-in-from-top-1 duration-200">
      <form onSubmit={onCommentSubmit} className="p-4 flex gap-3 items-center">
        <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center">
          <User size={16} className="text-muted-foreground" />
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full bg-muted/50 border border-border rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={isSubmittingComment || !newComment.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary disabled:opacity-30"
          >
            {isSubmittingComment ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <SendHorizontal size={18} />
            )}
          </button>
        </div>
      </form>

      <div className="px-4 pb-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {isLoadingComments ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              formatTime={formatTime}
            />
          ))
        ) : (
          <p className="text-center py-6 text-sm text-muted-foreground">
            No comments yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
