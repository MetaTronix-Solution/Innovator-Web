"use client";

import { memo } from "react";

export const REACTIONS = [
  {
    type: "like",
    emoji: "💡",
    label: "Inspire",
    color: "hover:bg-yellow-500/10",
  },
  { type: "love", emoji: "❤️", label: "Love", color: "hover:bg-red-500/10" },
  { type: "haha", emoji: "😂", label: "Haha", color: "hover:bg-orange-500/10" },
  { type: "wow", emoji: "😮", label: "Wow", color: "hover:bg-blue-500/10" },
  { type: "sad", emoji: "😢", label: "Sad", color: "hover:bg-indigo-500/10" },
  { type: "angry", emoji: "😡", label: "Angry", color: "hover:bg-rose-500/10" },
];

interface ReactionPickerProps {
  onSelect: (type: string) => void;
  onClose: () => void;
  variant?: "reels" | "post";
}

const ReactionPicker = memo(
  ({ onSelect, onClose, variant = "post" }: ReactionPickerProps) => (
    <div
      className={`absolute z-50 ${variant === "reels" ? "right-full top-0 mr-3" : "bottom-full left-0 mb-3"}`}
    >
      <div
        className={`flex items-end bg-card/95 backdrop-blur-md border border-border/60 rounded-2xl shadow-2xl ${variant === "reels" ? "gap-0.5 px-2 py-2" : "gap-1 px-3 py-3"}`}
      >
        {REACTIONS.map(({ type, emoji, label, color }) => (
          <button
            key={type}
            onClick={() => {
              onSelect(type);
              onClose();
            }}
            className={`
               group flex flex-col items-center gap-1 rounded-xl
               transition-all duration-150 cursor-pointer
               hover:scale-125 hover:-translate-y-1 active:scale-110
               ${variant === "reels" ? "px-1.5 py-1" : "px-2 py-1.5"}
               ${color}
            `}
          >
            <span
              className={`leading-none select-none drop-shadow-sm ${variant === "reels" ? "text-xl" : "text-2xl"}`}
            >
              {emoji}
            </span>
            <span
              className={`font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-150 whitespace-nowrap ${variant === "reels" ? "text-[7px]" : "text-[9px]"}`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      <div
        className={`w-3 h-3 bg-card/95 border-border/60 rotate-45 ${
          variant === "reels"
            ? "absolute top-1/2 -right-1.5 -translate-y-1/2 border-t border-r"
            : "ml-5 -mt-1.5 border-b border-r"
        }`}
      />
    </div>
  ),
);

ReactionPicker.displayName = "ReactionPicker";
export default ReactionPicker;
