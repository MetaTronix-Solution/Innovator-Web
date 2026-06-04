// "use client";

// import React, { useState, useEffect, memo } from "react";
// import { ThumbsUp } from "lucide-react";
// import ReactionPicker, { REACTIONS } from "./ReactionPicker";

// interface ReactionButtonProps {
//   currentReaction: string | null;
//   count: number;
//   onReact: (type: string | null) => void;
//   onCountClick?: () => void;
//   variant?: "reels" | "post";
//   isVertical?: boolean;
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
//   ({
//     currentReaction,
//     count,
//     onReact,
//     onCountClick,
//     variant,
//     isVertical,
//   }: ReactionButtonProps) => {
//     const [showPicker, setShowPicker] = useState(false);
//     const [optimisticReaction, setOptimisticReaction] =
//       useState(currentReaction);
//     const [optimisticCount, setOptimisticCount] = useState(count);

//     useEffect(() => {
//       setOptimisticReaction(currentReaction);
//       setOptimisticCount(count);
//     }, [currentReaction, count]);

//     const handleSelect = (type: string | null) => {
//       setShowPicker(false);

//       const isSame = type === currentReaction;
//       const nextReaction = isSame ? null : type;

//       setOptimisticReaction(nextReaction);
//       setOptimisticCount((prev) => {
//         if (nextReaction === null) {
//           return currentReaction ? Math.max(0, prev - 1) : prev;
//         }
//         if (currentReaction === null) {
//           return prev + 1;
//         }
//         return prev;
//       });

//       onReact(nextReaction);
//     };

//     const reaction = REACTIONS.find((r) => r.type === optimisticReaction);
//     const color = optimisticReaction
//       ? REACTION_COLORS[optimisticReaction]
//       : "text-muted-foreground";

//     return (
//       <div
//         className="relative flex items-center"
//         onMouseLeave={() => setShowPicker(false)}
//       >
//         {showPicker && (
//           <ReactionPicker
//             onSelect={handleSelect}
//             onClose={() => setShowPicker(false)}
//             variant={variant}
//           />
//         )}

//         <button
//           onClick={() => handleSelect(optimisticReaction ? null : "like")}
//           onMouseEnter={() => setShowPicker(true)}
//           className={`flex items-center ${isVertical ? "flex-col gap-1" : "flex-row gap-1.5"} px-3 py-2 cursor-pointer rounded-lg transition-all hover:scale-105 font-semibold text-sm ${color}`}
//         >
//           <div className="flex items-center justify-center">
//             {reaction ? (
//               <span className="text-lg leading-none">{reaction.emoji}</span>
//             ) : (
//               <ThumbsUp
//                 className={
//                   variant === "reels" ? "text-white" : "text-muted-foreground"
//                 }
//                 size={isVertical ? 24 : 18}
//               />
//             )}
//           </div>

//           <span
//             className={`cursor-pointer ${
//               variant === "reels" ? "text-white" : "text-muted-foreground"
//             } hover:underline text-xs`}
//             onClick={(e) => {
//               e.stopPropagation();
//               onCountClick?.();
//             }}
//           >
//             {optimisticCount}
//           </span>
//         </button>
//       </div>
//     );
//   },
// );

// ReactionButton.displayName = "ReactionButton";
// export default ReactionButton;

"use client";

import React, { useState, memo } from "react";
import { ThumbsUp } from "lucide-react";
import ReactionPicker, { REACTIONS } from "./ReactionPicker";

interface ReactionButtonProps {
  currentReaction: string | null;
  count: number;
  onReact: (type: string | null) => void;
  onCountClick?: () => void;
  variant?: "reels" | "post";
  isVertical?: boolean;
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
  ({
    currentReaction,
    count,
    onReact,
    onCountClick,
    variant,
    isVertical,
  }: ReactionButtonProps) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleSelect = (type: string | null) => {
      setShowPicker(false);
      const nextReaction = type === currentReaction ? null : type;
      onReact(nextReaction); // PostCard handles all state updates
    };

    const reaction = REACTIONS.find((r) => r.type === currentReaction);
    const color = currentReaction
      ? REACTION_COLORS[currentReaction]
      : "text-muted-foreground";

    return (
      <div
        className="relative flex items-center"
        onMouseLeave={() => setShowPicker(false)}
      >
        {showPicker && (
          <ReactionPicker
            onSelect={handleSelect}
            onClose={() => setShowPicker(false)}
            variant={variant}
          />
        )}

        <button
          onClick={() => handleSelect(currentReaction ? null : "like")}
          onMouseEnter={() => setShowPicker(true)}
          className={`flex items-center ${isVertical ? "flex-col gap-1" : "flex-row gap-1.5"} px-3 py-2 cursor-pointer rounded-lg transition-all hover:scale-105 font-semibold text-sm ${color}`}
        >
          <div className="flex items-center justify-center">
            {reaction ? (
              <span className="text-lg leading-none">{reaction.emoji}</span>
            ) : (
              <ThumbsUp
                className={
                  variant === "reels" ? "text-white" : "text-muted-foreground"
                }
                size={isVertical ? 24 : 18}
              />
            )}
          </div>

          <span
            className={`cursor-pointer ${
              variant === "reels" ? "text-white" : "text-muted-foreground"
            } hover:underline text-xs`}
            onClick={(e) => {
              e.stopPropagation();
              onCountClick?.();
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
