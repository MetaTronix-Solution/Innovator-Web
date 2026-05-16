import { memo } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

const CommentItem = memo(
  ({
    comment,
    formatTime,
  }: {
    comment: any;
    formatTime: (d: string) => string;
  }) => (
    <div className="flex gap-3 animate-in fade-in duration-300">
      <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
        {comment.user_avatar ? (
          <Image
            src={getMediaUrl(comment.user_avatar) || ""}
            alt="user"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <User size={14} className="text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <div className="bg-muted/40 rounded-2xl rounded-tl-none px-3 py-2">
          <p className="text-xs font-bold text-foreground">
            {comment.username || "Anonymous"}
          </p>
          <p className="text-sm text-foreground/80">{comment.content}</p>
        </div>
        <p className="text-[10px] text-muted-foreground px-1">
          {formatTime(comment.created_at)}
        </p>
      </div>
    </div>
  ),
);
CommentItem.displayName = "CommentItem";

export default CommentItem;
