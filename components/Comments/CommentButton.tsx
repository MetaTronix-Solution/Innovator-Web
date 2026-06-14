"use client";

import { memo } from "react";
import { MessageCircle } from "lucide-react";

interface CommentButtonProps {
  count: number;
  active: boolean;
  onClick: () => void;
}

const CommentButton = memo(({ count, active, onClick }: CommentButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 cursor-pointer rounded-lg transition-all hover:bg-accent font-semibold text-sm ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <MessageCircle
        size={18}
        className={`transition-all ${active ? "fill-primary/10 text-primary" : ""}`}
      />
      <span className={active ? "text-primary" : ""}>{count}</span>
    </button>
  );
});

CommentButton.displayName = "CommentButton";
export default CommentButton;
