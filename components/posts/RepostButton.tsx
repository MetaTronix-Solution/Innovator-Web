"use client";

import { useState, useRef, useCallback, memo, useEffect } from "react";
import { Repeat2 } from "lucide-react";

interface RepostButtonProps {
  label?: string;
  count?: number;
  onClick: () => void;
}

const RepostButton = memo(
  ({ label = "Repost", count, onClick }: RepostButtonProps) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleClick = useCallback(() => {
      setIsAnimating(true);
      animTimer.current = setTimeout(() => setIsAnimating(false), 600);
      onClick();
    }, [onClick]);

    useEffect(() => {
      return () => {
        if (animTimer.current) clearTimeout(animTimer.current);
      };
    }, []);

    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-2 cursor-pointer rounded-lg transition-all hover:bg-accent font-semibold text-sm ${
          isAnimating ? "text-green-500" : "text-muted-foreground"
        } hover:text-green-500`}
      >
        <Repeat2
          size={18}
          className={`transition-transform duration-500 ${isAnimating ? "rotate-180" : ""}`}
        />
        <span>{count !== undefined ? count : label}</span>
      </button>
    );
  },
);

RepostButton.displayName = "RepostButton";
export default RepostButton;
