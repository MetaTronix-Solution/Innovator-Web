"use client";

import { memo } from "react";

export const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😡", label: "Angry" },
];

interface ReactionPickerProps {
  onSelect: (type: string) => void;
  onClose: () => void;
}

const ReactionPicker = memo(({ onSelect, onClose }: ReactionPickerProps) => (
  <div className="absolute bottom-full left-0 mb-2 z-50" onMouseLeave={onClose}>
    <div className="flex items-center gap-1 bg-card border border-border rounded-full px-3 py-2 shadow-xl">
      {REACTIONS.map(({ type, emoji, label }) => (
        <button
          key={type}
          onClick={() => {
            onSelect(type);
            onClose();
          }}
          title={label}
          className="group flex flex-col items-center transition-transform hover:scale-125 active:scale-110"
        >
          <span className="text-2xl leading-none select-none">{emoji}</span>
          <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 font-medium">
            {label}
          </span>
        </button>
      ))}
    </div>
    {/* Arrow */}
    <div className="w-3 h-3 bg-card border-b border-r border-border rotate-45 ml-4 -mt-1.5" />
  </div>
));

ReactionPicker.displayName = "ReactionPicker";
export default ReactionPicker;
