// "use client";

// import { useState, useRef, useCallback, memo } from "react";
// import { ThumbsUp } from "lucide-react";
// import ReactionPicker, { REACTIONS } from "./ReactionPicker";

// interface ReactionButtonProps {
//   currentReaction: string | null;
//   count: number;
//   onReact: (type: string) => void;
//   onCountClick: () => void;
// }

// const REACTION_COLORS: Record<string, string> = {
//   like: "text-blue-500",
//   love: "text-rose-500",
//   haha: "text-yellow-500",
//   wow: "text-yellow-500",
//   sad: "text-yellow-500",
//   angry: "text-orange-500",
// };

// const ReactionButton = memo(
//   ({ currentReaction, count, onReact, onCountClick }: ReactionButtonProps) => {
//     const [showPicker, setShowPicker] = useState(false);
//     const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

//     const reaction = REACTIONS.find((r) => r.type === currentReaction);
//     const color = currentReaction
//       ? REACTION_COLORS[currentReaction]
//       : "text-muted-foreground";

//     // Long press (mobile) or hover (desktop) to open picker
//     const handleMouseDown = useCallback(() => {
//       holdTimer.current = setTimeout(() => setShowPicker(true), 400);
//     }, []);

//     const handleMouseUp = useCallback(() => {
//       if (holdTimer.current) clearTimeout(holdTimer.current);
//     }, []);

//     const handleMouseEnter = useCallback(() => {
//       holdTimer.current = setTimeout(() => setShowPicker(true), 500);
//     }, []);

//     const handleMouseLeave = useCallback(() => {
//       if (holdTimer.current) clearTimeout(holdTimer.current);
//     }, []);

//     // Quick tap/click — toggle current reaction or default to "like"
//     const handleClick = useCallback(() => {
//       if (holdTimer.current) clearTimeout(holdTimer.current);
//       if (showPicker) return;
//       onReact(currentReaction ?? "like");
//     }, [currentReaction, onReact, showPicker]);

//     return (
//       <div
//         className="relative flex items-center rounded-lg"
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={() => {
//           handleMouseLeave();
//         }}
//       >
//         {showPicker && (
//           <ReactionPicker
//             onSelect={onReact}
//             onClose={() => setShowPicker(false)}
//           />
//         )}

//         {/* Reaction icon button */}
//         <button
//           onMouseDown={handleMouseDown}
//           onMouseUp={handleMouseUp}
//           onTouchStart={handleMouseDown}
//           onTouchEnd={handleMouseUp}
//           onClick={handleClick}
//           className={`flex items-center gap-1.5 pl-3 pr-1 py-2 rounded-l-lg transition-all hover:bg-accent ${color}`}
//         >
//           {reaction ? (
//             <span className="text-lg leading-none">{reaction.emoji}</span>
//           ) : (
//             <ThumbsUp size={18} />
//           )}
//           {reaction && (
//             <span className="text-xs font-semibold capitalize">
//               {reaction.label}
//             </span>
//           )}
//         </button>

//         {/* Count — click opens reactions modal */}
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             if (count > 0) onCountClick();
//           }}
//           className={`pr-3 py-2 rounded-r-lg text-sm font-semibold transition-all hover:bg-accent ${
//             count > 0 ? "hover:underline cursor-pointer" : "cursor-default"
//           } ${currentReaction ? color : "text-muted-foreground"}`}
//         >
//           {count}
//         </button>
//       </div>
//     );
//   },
// );

// ReactionButton.displayName = "ReactionButton";
// export default ReactionButton;

"use client";

import { useState, useRef, useCallback, memo } from "react";
import { ThumbsUp } from "lucide-react";
import ReactionPicker, { REACTIONS } from "./ReactionPicker";

interface ReactionButtonProps {
  currentReaction: string | null;
  count: number;
  onReact: (type: string) => void;
  onCountClick: () => void;
}

const REACTION_COLORS: Record<string, string> = {
  like: "text-blue-500",
  love: "text-rose-500",
  haha: "text-yellow-500",
  wow: "text-yellow-500",
  sad: "text-yellow-500",
  angry: "text-orange-500",
};

const ReactionButton = memo(
  ({ currentReaction, count, onReact, onCountClick }: ReactionButtonProps) => {
    const [showPicker, setShowPicker] = useState(false);
    const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const didHold = useRef(false);

    const reaction = REACTIONS.find((r) => r.type === currentReaction);
    const color = currentReaction
      ? REACTION_COLORS[currentReaction]
      : "text-muted-foreground";

    const openPicker = useCallback(() => {
      didHold.current = true;
      setShowPicker(true);
    }, []);

    const handleMouseEnter = useCallback(() => {
      holdTimer.current = setTimeout(openPicker, 500);
    }, [openPicker]);

    const handleMouseLeave = useCallback(() => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    }, []);

    const handleMouseDown = useCallback(() => {
      didHold.current = false;
      holdTimer.current = setTimeout(openPicker, 400);
    }, [openPicker]);

    const handleMouseUp = useCallback(() => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    }, []);

    // Quick click — toggle current reaction or default to "like"
    const handleClick = useCallback(() => {
      if (didHold.current) {
        didHold.current = false;
        return;
      }
      if (holdTimer.current) clearTimeout(holdTimer.current);
      if (showPicker) return;
      onReact(currentReaction ?? "like");
    }, [currentReaction, onReact, showPicker]);

    return (
      <div
        className="relative flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => {
          handleMouseLeave();
          setShowPicker(false);
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

        {/* Icon + count as one unified button — like Facebook */}
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all hover:bg-accent font-semibold text-sm ${color}`}
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
              if (count > 0) onCountClick();
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
