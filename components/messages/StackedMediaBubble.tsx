// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import {
//   X,
//   ChevronLeft,
//   ChevronRight,
//   Download,
//   Play,
//   MoreHorizontal,
// } from "lucide-react";
// import { getMediaUrl } from "@/lib/utils/getMediaUrl";
// import { getMediaType } from "@/components/messages/MediaUploadButton";
// import { cn } from "@/lib/utils";

// interface StackedMediaBubbleProps {
//   attachments: string[];
//   isMine: boolean;
//   onMenuOpen?: (e: React.MouseEvent) => void;
// }

// function Lightbox({
//   items,
//   startIndex,
//   onClose,
// }: {
//   items: { src: string; type: "image" | "video" }[];
//   startIndex: number;
//   onClose: () => void;
// }) {
//   const [current, setCurrent] = useState(startIndex);
//   const item = items[current];

//   return (
//     <div
//       className="fixed inset-0 z-[200] bg-black/90 flex flex-col"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className="flex items-center justify-between px-4 py-3 shrink-0">
//         <span className="text-white/60 text-sm">
//           {current + 1} / {items.length}
//         </span>
//         <div className="flex gap-2">
//           <a
//             href={item.src}
//             download
//             className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <Download size={14} />
//           </a>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
//           >
//             <X size={16} />
//           </button>
//         </div>
//       </div>

//       <div className="flex-1 flex items-center justify-center relative px-12">
//         {item.type === "image" ? (
//           <div className="relative w-full h-full max-w-2xl">
//             <Image
//               src={item.src}
//               alt=""
//               fill
//               className="object-contain"
//               unoptimized
//             />
//           </div>
//         ) : (
//           <video
//             key={item.src}
//             src={item.src}
//             controls
//             autoPlay
//             className="max-w-full max-h-full rounded-lg"
//           />
//         )}

//         {items.length > 1 && (
//           <>
//             <button
//               onClick={() => setCurrent((i) => Math.max(0, i - 1))}
//               disabled={current === 0}
//               className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-20"
//             >
//               <ChevronLeft size={20} />
//             </button>
//             <button
//               onClick={() =>
//                 setCurrent((i) => Math.min(items.length - 1, i + 1))
//               }
//               disabled={current === items.length - 1}
//               className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-20"
//             >
//               <ChevronRight size={20} />
//             </button>
//           </>
//         )}
//       </div>

//       {/* Thumbnail strip */}
//       {items.length > 1 && (
//         <div className="flex items-center justify-center gap-2 px-4 py-3 shrink-0 overflow-x-auto">
//           {items.map((it, i) => (
//             <button
//               key={i}
//               onClick={() => setCurrent(i)}
//               className={`relative shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
//                 i === current
//                   ? "border-white scale-110"
//                   : "border-white/20 opacity-50 hover:opacity-80"
//               }`}
//             >
//               {it.type === "image" ? (
//                 <Image
//                   src={it.src}
//                   alt=""
//                   fill
//                   className="object-cover"
//                   unoptimized
//                 />
//               ) : (
//                 <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
//                   <Play size={12} className="text-white" />
//                 </div>
//               )}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default function StackedMediaBubble({
//   attachments,
//   isMine,
//   onMenuOpen,
// }: StackedMediaBubbleProps) {
//   const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

//   const items = attachments.map((src) => ({
//     src: getMediaUrl(src) || src,
//     type:
//       getMediaType(src) === "video" ? ("video" as const) : ("image" as const),
//   }));

//   const total = items.length;
//   const STACK_OFFSET = 6;

//   if (total === 1) {
//     const item = items[0];
//     return (
//       <>
//         <div
//           className="relative cursor-pointer rounded-xl overflow-hidden"
//           style={{ width: 180, height: 180 }}
//           onClick={() => setLightboxIndex(0)}
//         >
//           {item.type === "image" ? (
//             <Image
//               src={item.src}
//               alt=""
//               fill
//               className="object-cover hover:brightness-90 transition-all"
//               unoptimized
//             />
//           ) : (
//             <>
//               <video
//                 src={item.src}
//                 className="w-full h-full object-cover opacity-90"
//                 muted
//                 preload="metadata"
//               />
//               <div className="absolute inset-0 flex items-center justify-center bg-black/25">
//                 <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
//                   <Play size={16} className="text-gray-900 ml-0.5" />
//                 </div>
//               </div>
//             </>
//           )}

//           {onMenuOpen && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onMenuOpen(e);
//               }}
//               className={cn(
//                 "absolute z-[99] top-2 opacity-0 group-hover/stack:opacity-100 transition-opacity",
//                 "p-1 rounded-full bg-black/50 text-white hover:bg-black/70",
//                 isMine ? "left-2" : "right-2",
//               )}
//             >
//               <MoreHorizontal className="w-3.5 h-3.5" />
//             </button>
//           )}
//         </div>
//         {lightboxIndex !== null && (
//           <Lightbox
//             items={items}
//             startIndex={lightboxIndex}
//             onClose={() => setLightboxIndex(null)}
//           />
//         )}
//       </>
//     );
//   }

//   const visibleCount = Math.min(total, 3);
//   const stackCards = items.slice(0, visibleCount);

//   return (
//     <>
//       <div
//         className="relative cursor-pointer"
//         style={{
//           width: 180 + (visibleCount - 1) * STACK_OFFSET,
//           height: 180 + (visibleCount - 1) * STACK_OFFSET,
//         }}
//         onClick={() => setLightboxIndex(0)}
//       >
//         {stackCards.map((item, i) => {
//           const reverseIndex = visibleCount - 1 - i;
//           const offset = reverseIndex * STACK_OFFSET;
//           const rotate = reverseIndex === 0 ? 0 : reverseIndex === 1 ? -4 : 6;
//           const scale = 1 - reverseIndex * 0.04;
//           const zIndex = i;

//           return (
//             <div
//               key={i}
//               className="absolute rounded-xl overflow-hidden border-2 border-card shadow-md"
//               style={{
//                 width: 180,
//                 height: 180,
//                 top: offset,
//                 left: isMine ? 0 : offset,
//                 right: isMine ? offset : 0,
//                 transform: `rotate(${rotate}deg) scale(${scale})`,
//                 transformOrigin: "center center",
//                 zIndex,
//                 transition: "transform 0.2s ease",
//               }}
//             >
//               {item.type === "image" ? (
//                 <Image
//                   src={item.src}
//                   alt=""
//                   fill
//                   className="object-cover"
//                   unoptimized
//                 />
//               ) : (
//                 <>
//                   <video
//                     src={item.src}
//                     className="w-full h-full object-cover opacity-90"
//                     muted
//                     preload="metadata"
//                   />
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/25">
//                     <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
//                       <Play size={14} className="text-gray-900 ml-0.5" />
//                     </div>
//                   </div>
//                 </>
//               )}

//               {reverseIndex === 0 && total > 1 && (
//                 <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
//                   {total} photos
//                 </div>
//               )}
//             </div>
//           );
//         })}

//         {onMenuOpen && (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onMenuOpen(e);
//             }}
//             className={cn(
//               "absolute z-[99] top-2 opacity-0 group-hover/stack:opacity-100 transition-opacity",
//               "p-1 rounded-full bg-black/50 text-white hover:bg-black/70",
//               isMine ? "left-2" : "right-2",
//             )}
//             title="Message options"
//           >
//             <MoreHorizontal className="w-3.5 h-3.5" />
//           </button>
//         )}
//       </div>

//       {lightboxIndex !== null && (
//         <Lightbox
//           items={items}
//           startIndex={lightboxIndex}
//           onClose={() => setLightboxIndex(null)}
//         />
//       )}
//     </>
//   );
// }

"use client";

import { useState } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Play,
  MoreHorizontal,
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { getMediaType } from "@/components/messages/MediaUploadButton";
import { cn } from "@/lib/utils";

interface StackedMediaBubbleProps {
  attachments: string[];
  isMine: boolean;
  onMenuOpen?: (e: React.MouseEvent) => void;
}

function Lightbox({
  items,
  startIndex,
  onClose,
}: {
  items: { src: string; type: "image" | "video" }[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const item = items[current];

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 flex flex-col"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-white/60 text-sm">
          {current + 1} / {items.length}
        </span>
        <div className="flex gap-2">
          <a
            href={item.src}
            download
            className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={14} />
          </a>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative px-12">
        {item.type === "image" ? (
          <div className="relative w-full h-full max-w-2xl">
            <Image
              src={item.src}
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <video
            key={item.src}
            src={item.src}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg"
          />
        )}

        {items.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((i) => Math.max(0, i - 1))}
              disabled={current === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-20"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() =>
                setCurrent((i) => Math.min(items.length - 1, i + 1))
              }
              disabled={current === items.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-20"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Thumbnail strip */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 shrink-0 overflow-x-auto">
            {items.map((it, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`relative shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  i === current
                    ? "border-white scale-110"
                    : "border-white/20 opacity-50 hover:opacity-80"
                }`}
              >
                {it.type === "image" ? (
                  <Image
                    src={it.src}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <Play size={12} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StackedMediaBubble({
  attachments,
  isMine,
  onMenuOpen,
}: StackedMediaBubbleProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items = attachments.map((src) => ({
    src: getMediaUrl(src) || src,
    type:
      getMediaType(src) === "video" ? ("video" as const) : ("image" as const),
  }));

  const total = items.length;
  const STACK_OFFSET = 6;

  if (total === 1) {
    const item = items[0];
    return (
      <>
        <div
          className="relative cursor-pointer rounded-xl overflow-hidden group/stack"
          style={{ width: 180, height: 180 }}
          onClick={() => setLightboxIndex(0)}
        >
          {item.type === "image" ? (
            <Image
              src={item.src}
              alt=""
              fill
              className="object-cover hover:brightness-90 transition-all"
              unoptimized
            />
          ) : (
            <>
              <video
                src={item.src}
                className="w-full h-full object-cover opacity-90"
                muted
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                  <Play size={16} className="text-gray-900 ml-0.5" />
                </div>
              </div>
            </>
          )}

          {onMenuOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuOpen(e);
              }}
              className={cn(
                "absolute top-2 z-10 p-1 rounded-full",
                "bg-black/50 text-white hover:bg-black/70",
                "opacity-0 group-hover/stack:opacity-100 transition-opacity",
                isMine ? "left-2" : "right-2",
              )}
              title="Message options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {lightboxIndex !== null && (
          <Lightbox
            items={items}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </>
    );
  }

  const visibleCount = Math.min(total, 3);
  const stackCards = items.slice(0, visibleCount);

  return (
    <>
      <div
        className="relative cursor-pointer group/stack"
        style={{
          width: 180 + (visibleCount - 1) * STACK_OFFSET,
          height: 180 + (visibleCount - 1) * STACK_OFFSET,
        }}
        onClick={() => setLightboxIndex(0)}
      >
        {stackCards.map((item, i) => {
          const reverseIndex = visibleCount - 1 - i;
          const offset = reverseIndex * STACK_OFFSET;
          const rotate = reverseIndex === 0 ? 0 : reverseIndex === 1 ? -4 : 6;
          const scale = 1 - reverseIndex * 0.04;
          const zIndex = i;

          return (
            <div
              key={i}
              className="absolute rounded-xl overflow-hidden border-2 border-card shadow-md"
              style={{
                width: 180,
                height: 180,
                top: offset,
                left: offset,
                transform: `rotate(${rotate}deg) scale(${scale})`,
                transformOrigin: "center center",
                zIndex,
                transition: "transform 0.2s ease",
              }}
            >
              {item.type === "image" ? (
                <Image
                  src={item.src}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <>
                  <video
                    src={item.src}
                    className="w-full h-full object-cover opacity-90"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                      <Play size={14} className="text-gray-900 ml-0.5" />
                    </div>
                  </div>
                </>
              )}

              {reverseIndex === 0 && total > 1 && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  {total} photos
                </div>
              )}
            </div>
          );
        })}

        {/* Three-dot button on top of the stack */}
        {onMenuOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuOpen(e);
            }}
            className={cn(
              "absolute top-2 z-[100] p-1 rounded-full",
              "bg-black/50 text-white hover:bg-black/70",
              "opacity-0 group-hover/stack:opacity-100 transition-opacity",
              isMine ? "left-2" : "right-2",
            )}
            title="Message options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={items}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
