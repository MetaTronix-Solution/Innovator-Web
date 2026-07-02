// "use client";

// import React, { useRef } from "react";
// import { Plus, Smile, Send } from "lucide-react";
// import { MediaUploadButton } from "./MediaUploadButton";

// interface ChatInputFormProps {
//   activeChatId: string | null;
//   isSendReady: boolean;
//   typeMessage: string;
//   onTypeMessageChange: (val: string) => void;
//   loading: boolean;
//   hasMediaFiles: boolean;
//   onHasFilesChange: (val: boolean) => void;
//   mediaSendRef: React.MutableRefObject<(() => Promise<void>) | null>;
//   chatPartnerName: string;
//   onSubmit: (e: React.FormEvent) => void;
//   onSentMedia: (newMsg: any) => void;
//   isFloating?: boolean;
// }

// export default function ChatInputForm({
//   activeChatId,
//   isSendReady,
//   typeMessage,
//   onTypeMessageChange,
//   loading,
//   hasMediaFiles,
//   onHasFilesChange,
//   mediaSendRef,
//   chatPartnerName,
//   onSubmit,
//   onSentMedia,
//   isFloating = false,
// }: ChatInputFormProps) {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const placeholderName = chatPartnerName
//     ? chatPartnerName.split(" ")[0]
//     : "User";

//   return (
//     <div className="shrink-0 px-3 py-2.5 border-t border-border/60 bg-background relative">
//       <input ref={fileInputRef} type="file" className="hidden" />
//       <form onSubmit={onSubmit} className="flex items-center gap-2">
//         <div className="flex-1 flex items-center gap-2 bg-muted/40 border border-border/80 rounded-2xl px-3 py-2 focus-within:border-orange-500/40 transition-colors">
//           <button
//             type="button"
//             className="text-muted-foreground/70 hover:text-foreground transition-colors shrink-0"
//           >
//             <Plus size={16} />
//           </button>

//           <MediaUploadButton
//             activeChatId={activeChatId ?? ""}
//             disabled={loading || !isSendReady}
//             onSent={onSentMedia}
//             onHasFilesChange={onHasFilesChange}
//             triggerSendRef={mediaSendRef}
//           />

//           <input
//             ref={inputRef}
//             type="text"
//             value={typeMessage}
//             disabled={loading || (!!activeChatId && !isSendReady)}
//             onChange={(e) => onTypeMessageChange(e.target.value)}
//             placeholder={`Message ${placeholderName}…`}
//             className="flex-1 bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground/40 min-w-0"
//           />

//           <button
//             type="button"
//             className="text-muted-foreground/70 hover:text-foreground transition-colors shrink-0"
//           >
//             <Smile size={16} />
//           </button>
//           {isFloating && (
//             <button
//               type="submit"
//               disabled={
//                 (!typeMessage.trim() && !hasMediaFiles) ||
//                 loading ||
//                 (!!activeChatId && !isSendReady)
//               }
//               className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500 disabled:opacity-30 transition-all active:scale-95 shrink-0"
//             >
//               <Send size={13} />
//             </button>
//           )}
//         </div>

//         {!isFloating && (
//           <button
//             type="submit"
//             disabled={
//               (!typeMessage.trim() && !hasMediaFiles) ||
//               loading ||
//               (!!activeChatId && !isSendReady)
//             }
//             className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500 disabled:opacity-30 transition-all active:scale-95 shrink-0"
//           >
//             <Send size={14} />
//           </button>
//         )}
//       </form>
//     </div>
//   );
// }

"use client";

import React, { useRef } from "react";
import { Plus, Smile, Send } from "lucide-react";
import { MediaUploadButton } from "./MediaUploadButton";

interface ChatInputFormProps {
  activeChatId: string | null;
  isSendReady: boolean;
  typeMessage: string;
  onTypeMessageChange: (val: string) => void;
  loading: boolean;
  hasMediaFiles: boolean;
  onHasFilesChange: (val: boolean) => void;
  mediaSendRef: React.MutableRefObject<(() => Promise<void>) | null>;
  chatPartnerName: string;
  onSubmit: (e: React.FormEvent) => void;
  onSentMedia: (newMsg: any) => void;
  isFloating?: boolean;
}

export default function ChatInputForm({
  activeChatId,
  isSendReady,
  typeMessage,
  onTypeMessageChange,
  loading,
  hasMediaFiles,
  onHasFilesChange,
  mediaSendRef,
  chatPartnerName,
  onSubmit,
  onSentMedia,
  isFloating = false,
}: ChatInputFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholderName = chatPartnerName
    ? chatPartnerName.split(" ")[0]
    : "User";

  return (
    <div className="shrink-0 px-3 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] border-t border-border/60 bg-background relative">
      <input ref={fileInputRef} type="file" className="hidden" />
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-muted/40 border border-border/80 rounded-2xl px-3 py-2 focus-within:border-orange-500/40 transition-colors">
          <MediaUploadButton
            activeChatId={activeChatId ?? ""}
            disabled={loading}
            onSent={onSentMedia}
            onHasFilesChange={onHasFilesChange}
            triggerSendRef={mediaSendRef}
          />

          <input
            ref={inputRef}
            type="text"
            value={typeMessage}
            disabled={loading}
            onChange={(e) => onTypeMessageChange(e.target.value)}
            placeholder={`Message ${placeholderName}…`}
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground/40 min-w-0"
          />

          <button
            type="button"
            className="text-muted-foreground/70 hover:text-foreground transition-colors shrink-0"
          >
            <Smile size={16} />
          </button>

          {isFloating && (
            <button
              type="submit"
              disabled={(!typeMessage.trim() && !hasMediaFiles) || loading}
              className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500 disabled:opacity-30 transition-all active:scale-95 shrink-0"
            >
              <Send size={13} />
            </button>
          )}
        </div>

        {!isFloating && (
          <button
            type="submit"
            disabled={(!typeMessage.trim() && !hasMediaFiles) || loading}
            className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500 disabled:opacity-30 transition-all active:scale-95 shrink-0"
          >
            <Send size={14} />
          </button>
        )}
      </form>
    </div>
  );
}
