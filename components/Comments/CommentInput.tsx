"use client";

import React from "react";
import { Loader2, Send } from "lucide-react";

interface CommentInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  isSubmitting: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  size?: "sm" | "md" | "xs";
  showCancel?: boolean;
}

const CommentInput = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
  placeholder = "Write a comment…",
  autoFocus = false,
  size = "md",
  showCancel = false,
}: CommentInputProps) => {
  const isXs = size === "xs";

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`flex-1 bg-muted/40 rounded-full px-4 outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground ${
          isXs ? "py-1 text-xs" : "py-2 text-sm"
        }`}
      />
      <button
        type="submit"
        disabled={isSubmitting || !value.trim()}
        className="text-primary disabled:opacity-40 hover:text-primary/80 transition-colors shrink-0"
      >
        {isSubmitting ? (
          <Loader2 size={isXs ? 12 : 16} className="animate-spin" />
        ) : (
          <Send size={isXs ? 12 : 16} className="text-foreground" />
        )}
      </button>
      {showCancel && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground text-xs hover:text-foreground transition-colors shrink-0"
        >
          Cancel
        </button>
      )}
    </form>
  );
};

export default CommentInput;
