"use client";

import { useState, useRef, useCallback, memo, useEffect } from "react";
import { createPortal } from "react-dom";
import { ThumbsUp } from "lucide-react";
import ReactionPicker, { REACTIONS } from "./ReactionPicker";

interface ReactionButtonProps {
  currentReaction: string | null;
  count: number;
  onReact: (type: string) => void;
  onCountClick?: () => void;
  variant?: "default" | "reels";
}

const REACTION_COLORS: Record<string, string> = {
  like: "text-blue-500",
  love: "text-rose-500",
  haha: "text-yellow-500",
  wow: "text-yellow-500",
  sad: "text-yellow-500",
  angry: "text-orange-500",
};

const REACTION_COLORS_REELS: Record<string, string> = {
  like: "text-blue-400",
  love: "text-rose-400",
  haha: "text-yellow-400",
  wow: "text-yellow-400",
  sad: "text-yellow-400",
  angry: "text-orange-400",
};

const ReactionButton = memo(
  ({
    currentReaction,
    count,
    onReact,
    onCountClick,
    variant = "default",
  }: ReactionButtonProps) => {
    const [showPicker, setShowPicker] = useState(false);
    const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const didHold = useRef(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const reaction = REACTIONS.find((r) => r.type === currentReaction);
    const colorMap =
      variant === "reels" ? REACTION_COLORS_REELS : REACTION_COLORS;
    const color = currentReaction
      ? colorMap[currentReaction]
      : variant === "reels"
        ? "text-white"
        : "text-muted-foreground";

    const clearLeave = useCallback(() => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    }, []);

    const scheduleClose = useCallback(() => {
      leaveTimer.current = setTimeout(() => setShowPicker(false), 300);
    }, []);

    const openPicker = useCallback(() => {
      didHold.current = true;
      if (variant === "reels" && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPickerPos({
          top: rect.top + rect.height / 2,
          left: rect.left - 12,
        });
      }
      setShowPicker(true);
    }, [variant]);

    const handleMouseDown = useCallback(() => {
      didHold.current = false;
      holdTimer.current = setTimeout(openPicker, 400);
    }, [openPicker]);

    const handleMouseUp = useCallback(() => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    }, []);

    const handleClick = useCallback(() => {
      if (didHold.current) {
        didHold.current = false;
        return;
      }
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (showPicker) return;
      onReact(currentReaction ?? "like");
    }, [currentReaction, onReact, showPicker]);

    useEffect(() => {
      return () => {
        if (holdTimer.current) clearTimeout(holdTimer.current);
        if (leaveTimer.current) clearTimeout(leaveTimer.current);
      };
    }, []);

    // ── Reels variant ──
    if (variant === "reels") {
      return (
        <>
          <div
            className="relative" // Container for picker logic
            onMouseEnter={() => {
              clearLeave();
              holdTimer.current = setTimeout(openPicker, 500);
            }}
            onMouseLeave={() => {
              if (holdTimer.current) clearTimeout(holdTimer.current);
              scheduleClose();
            }}
          >
            {/* Changed to flex-col and matching the ActionBtn structure */}
            <button
              ref={buttonRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              onClick={handleClick}
              className={`flex flex-col items-center gap-1 group transition-all ${color}`}
            >
              <span className="drop-shadow-lg transition-transform group-hover:scale-110 active:scale-90">
                {reaction ? (
                  <span className="text-2xl leading-none">
                    {reaction.emoji}
                  </span>
                ) : (
                  <ThumbsUp
                    size={26}
                    strokeWidth={1.8}
                    className={
                      currentReaction === "like" ? "fill-blue-400" : ""
                    }
                  />
                )}
              </span>

              <span
                className="text-white text-xs font-semibold drop-shadow cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (count > 0) onCountClick?.();
                }}
              >
                {formatCount(count)}
              </span>
            </button>
          </div>

          {showPicker &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 99998,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: pickerPos.top,
                    left: pickerPos.left,
                    transform: "translate(-110%, -50%)", // Moved slightly further left
                    pointerEvents: "auto",
                  }}
                  onMouseEnter={clearLeave}
                  onMouseLeave={scheduleClose}
                >
                  <div className="flex items-center gap-1 bg-card border border-border rounded-full px-3 py-2 shadow-xl">
                    {REACTIONS.map(({ type, emoji, label }) => (
                      <button
                        key={type}
                        onClick={(e) => {
                          e.stopPropagation();
                          onReact(type);
                          setShowPicker(false);
                        }}
                        title={label}
                        className="group flex flex-col items-center transition-transform hover:scale-125 active:scale-110"
                      >
                        <span className="text-2xl leading-none select-none">
                          {emoji}
                        </span>
                        <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 font-medium">
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </>
      );
    }

    // ── Default variant (PostCard) ──
    return (
      <div
        className="relative flex items-center"
        onMouseEnter={() => {
          clearLeave();
          holdTimer.current = setTimeout(openPicker, 500);
        }}
        onMouseLeave={() => {
          if (holdTimer.current) clearTimeout(holdTimer.current);
          scheduleClose();
        }}
      >
        {showPicker && (
          <ReactionPicker
            onSelect={(type) => {
              onReact(type);
              setShowPicker(false);
            }}
            onClose={() => setShowPicker(false)}
          />
        )}
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-2 cursor-pointer rounded-lg transition-all hover:bg-accent font-semibold text-sm ${color}`}
        >
          {reaction ? (
            <span className="text-lg leading-none">{reaction.emoji}</span>
          ) : (
            <ThumbsUp size={18} />
          )}
          <span
            className="cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              if (count > 0) onCountClick?.();
            }}
          >
            {count}
          </span>
        </button>
      </div>
    );
  },
);

ReactionButton.displayName = "ReactionButton";
export default ReactionButton;

function formatCount(val: number): string {
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return String(val);
}
