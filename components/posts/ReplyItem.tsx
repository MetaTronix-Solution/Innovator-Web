// "use client";

// import React, { memo, useState, useCallback } from "react";
// import { Loader2, Pencil, Trash2, User } from "lucide-react";
// import { toast } from "sonner";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { getMediaUrl } from "@/lib/utils/getMediaUrl";
// import { Reply } from "@/types/comment";
// import CommentInput from "./CommentInput";

// interface ReplyItemProps {
//   reply: Reply;
//   formatTime: (date: string) => string;
//   currentUserId?: string;
//   currentUsername?: string;
//   onDeleted: (replyId: string) => void;
//   onUpdated: (replyId: string, newContent: string) => void;
// }

// const ReplyItem = memo(
//   ({
//     reply,
//     formatTime,
//     currentUserId,
//     currentUsername,
//     onDeleted,
//     onUpdated,
//   }: ReplyItemProps) => {
//     const [showReplyInput, setShowReplyInput] = useState(false);
//     const [replyText, setReplyText] = useState("");
//     const [isSubmittingReply, setIsSubmittingReply] = useState(false);

//     const [isEditing, setIsEditing] = useState(false);
//     const [editText, setEditText] = useState(reply.content);
//     const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
//     const [isDeleting, setIsDeleting] = useState(false);

//     const [nestedReplies, setNestedReplies] = useState<Reply[]>(
//       reply.replies ?? [],
//     );

//     const avatarUrl = getMediaUrl(reply.avatar) || "";
//     const isOwner = currentUserId === reply.user_id;

//     const handleEdit = useCallback(
//       async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!editText.trim() || editText.trim() === reply.content) {
//           setIsEditing(false);
//           return;
//         }
//         setIsSubmittingEdit(true);
//         try {
//           const res = await fetch(`/api/replies/${reply.id}`, {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ content: editText.trim() }),
//           });
//           if (!res.ok) throw new Error();
//           onUpdated(reply.id, editText.trim());
//           setIsEditing(false);
//           toast.success("Reply updated!");
//         } catch {
//           toast.error("Failed to update reply");
//         } finally {
//           setIsSubmittingEdit(false);
//         }
//       },
//       [editText, reply.content, reply.id, onUpdated],
//     );

//     const handleDelete = useCallback(async () => {
//       if (!confirm("Delete this reply?")) return;
//       setIsDeleting(true);
//       try {
//         const res = await fetch(`/api/replies/${reply.id}`, {
//           method: "DELETE",
//         });
//         if (!res.ok) throw new Error();
//         onDeleted(reply.id);
//         toast.success("Reply deleted");
//       } catch {
//         toast.error("Failed to delete reply");
//       } finally {
//         setIsDeleting(false);
//       }
//     }, [reply.id, onDeleted]);

//     const handleSubmitNestedReply = useCallback(
//       async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!replyText.trim()) return;
//         setIsSubmittingReply(true);
//         try {
//           const res = await fetch("/api/replies", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               parent: reply.id,
//               content: replyText.trim(),
//             }),
//           });
//           if (!res.ok) throw new Error();
//           const created: Reply = await res.json();
//           setNestedReplies((prev) => [...prev, created]);
//           setReplyText("");
//           setShowReplyInput(false);
//           toast.success("Reply posted!");
//         } catch {
//           toast.error("Failed to post reply");
//         } finally {
//           setIsSubmittingReply(false);
//         }
//       },
//       [reply.id, replyText],
//     );

//     const handleNestedDeleted = useCallback((id: string) => {
//       setNestedReplies((prev) => prev.filter((r) => r.id !== id));
//     }, []);

//     const handleNestedUpdated = useCallback((id: string, content: string) => {
//       setNestedReplies((prev) =>
//         prev.map((r) => (r.id === id ? { ...r, content } : r)),
//       );
//     }, []);

//     return (
//       <div className="py-1">
//         <div className="flex gap-2 pl-2">
//           <Avatar size="sm" className="mt-0.5 shrink-0">
//             <AvatarImage src={avatarUrl} alt={reply.username} />
//             <AvatarFallback>
//               <User size={11} className="text-muted-foreground" />
//             </AvatarFallback>
//           </Avatar>

//           <div className="flex-1 min-w-0">
//             {isEditing ? (
//               <div className="mt-1">
//                 <CommentInput
//                   value={editText}
//                   onChange={setEditText}
//                   onSubmit={handleEdit}
//                   onCancel={() => {
//                     setIsEditing(false);
//                     setEditText(reply.content);
//                   }}
//                   isSubmitting={isSubmittingEdit}
//                   placeholder="Edit reply…"
//                   autoFocus
//                   size="xs"
//                   showCancel
//                 />
//               </div>
//             ) : (
//               <div className="bg-muted/30 rounded-2xl px-3 py-1.5 inline-block max-w-full">
//                 <p className="text-[11px] font-semibold text-foreground">
//                   {reply.username}
//                 </p>
//                 <p className="text-xs text-foreground/90 leading-relaxed break-words">
//                   {reply.content}
//                 </p>
//               </div>
//             )}

//             <div className="flex items-center gap-3 mt-0.5 px-1">
//               <span className="text-[10px] text-muted-foreground">
//                 {formatTime(reply.created_at)}
//               </span>
//               <button
//                 onClick={() => setShowReplyInput((v) => !v)}
//                 className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors"
//               >
//                 Reply
//               </button>
//               {/* {isOwner && (
//                 <>
//                   <button
//                     onClick={() => {
//                       setEditText(reply.content);
//                       setIsEditing(true);
//                     }}
//                     className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors"
//                   >
//                     <Pencil size={10} />
//                     Edit
//                   </button>
//                   <button
//                     onClick={handleDelete}
//                     disabled={isDeleting}
//                     className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
//                   >
//                     {isDeleting ? (
//                       <Loader2 size={10} className="animate-spin" />
//                     ) : (
//                       <Trash2 size={10} />
//                     )}
//                     Delete
//                   </button>
//                 </>
//               )} */}
//             </div>

//             {showReplyInput && (
//               <div className="mt-2">
//                 <CommentInput
//                   value={replyText}
//                   onChange={setReplyText}
//                   onSubmit={handleSubmitNestedReply}
//                   onCancel={() => {
//                     setShowReplyInput(false);
//                     setReplyText("");
//                   }}
//                   isSubmitting={isSubmittingReply}
//                   placeholder={`Reply to ${reply.username}…`}
//                   autoFocus
//                   size="xs"
//                   showCancel
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {nestedReplies.length > 0 && (
//           <div className="mt-1 ml-4 border-l-2 border-border/30 pl-2 space-y-1">
//             {nestedReplies.map((nested) => (
//               <ReplyItem
//                 key={nested.id}
//                 reply={nested}
//                 formatTime={formatTime}
//                 currentUserId={currentUserId}
//                 onDeleted={handleNestedDeleted}
//                 onUpdated={handleNestedUpdated}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   },
// );

// ReplyItem.displayName = "ReplyItem";
// export default ReplyItem;

"use client";

import React, { memo, useState, useCallback } from "react";
import { User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { Reply } from "@/types/comment";
import CommentInput from "./CommentInput";
import CommentMenu from "./CommentMenu";

interface ReplyItemProps {
  reply: Reply;
  formatTime: (date: string) => string;
  currentUserId?: string;
  currentUsername?: string;
  onDeleted: (replyId: string) => void;
  onUpdated: (replyId: string, newContent: string) => void;
}

const ReplyItem = memo(
  ({
    reply,
    formatTime,
    currentUserId,
    currentUsername,
    onDeleted,
    onUpdated,
  }: ReplyItemProps) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(reply.content);
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const [nestedReplies, setNestedReplies] = useState<Reply[]>(
      reply.replies ?? [],
    );

    const avatarUrl = getMediaUrl(reply.avatar) || "";
    const isOwner = !!currentUsername && currentUsername === reply.username;

    const handleEdit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editText.trim() || editText.trim() === reply.content) {
          setIsEditing(false);
          return;
        }
        setIsSubmittingEdit(true);
        try {
          const res = await fetch(`/api/replies/${reply.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: editText.trim() }),
          });
          if (!res.ok) throw new Error();
          onUpdated(reply.id, editText.trim());
          setIsEditing(false);
          toast.success("Reply updated!");
        } catch {
          toast.error("Failed to update reply");
        } finally {
          setIsSubmittingEdit(false);
        }
      },
      [editText, reply.content, reply.id, onUpdated],
    );

    const handleDelete = useCallback(async () => {
      if (!confirm("Delete this reply?")) return;
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/replies/${reply.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error();
        onDeleted(reply.id);
        toast.success("Reply deleted");
      } catch {
        toast.error("Failed to delete reply");
      } finally {
        setIsDeleting(false);
      }
    }, [reply.id, onDeleted]);

    const handleReport = useCallback(() => {
      // TODO: wire up your report API
      toast.info(`Reported reply by ${reply.username}`);
    }, [reply.username]);

    const handleBlock = useCallback(() => {
      // TODO: wire up your block API
      toast.info(`Blocked ${reply.username}`);
    }, [reply.username]);

    const handleSubmitNestedReply = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setIsSubmittingReply(true);
        try {
          const res = await fetch("/api/replies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              parent: reply.id,
              content: replyText.trim(),
            }),
          });
          if (!res.ok) throw new Error();
          const created: Reply = await res.json();
          setNestedReplies((prev) => [...prev, created]);
          setReplyText("");
          setShowReplyInput(false);
          toast.success("Reply posted!");
        } catch {
          toast.error("Failed to post reply");
        } finally {
          setIsSubmittingReply(false);
        }
      },
      [reply.id, replyText],
    );

    const handleNestedDeleted = useCallback((id: string) => {
      setNestedReplies((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const handleNestedUpdated = useCallback((id: string, content: string) => {
      setNestedReplies((prev) =>
        prev.map((r) => (r.id === id ? { ...r, content } : r)),
      );
    }, []);

    return (
      <div
        className="py-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex gap-2 pl-2">
          <Avatar size="sm" className="mt-0.5 shrink-0">
            <AvatarImage src={avatarUrl} alt={reply.username} />
            <AvatarFallback>
              <User size={11} className="text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="mt-1">
                <CommentInput
                  value={editText}
                  onChange={setEditText}
                  onSubmit={handleEdit}
                  onCancel={() => {
                    setIsEditing(false);
                    setEditText(reply.content);
                  }}
                  isSubmitting={isSubmittingEdit}
                  placeholder="Edit reply…"
                  autoFocus
                  size="xs"
                  showCancel
                />
              </div>
            ) : (
              <div className="flex items-start gap-1">
                {/* Reply bubble */}
                <div className="bg-muted/30 rounded-2xl px-3 py-1.5 inline-block max-w-full">
                  <p className="text-[11px] font-semibold text-foreground">
                    {reply.username}
                  </p>
                  <p className="text-xs text-foreground/90 leading-relaxed break-words">
                    {reply.content}
                  </p>
                </div>

                {/* Three-dot menu — visible only on hover */}
                <div
                  className={`
                    mt-0.5 transition-opacity duration-150
                    ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}
                  `}
                >
                  <CommentMenu
                    isOwner={isOwner}
                    isDeleting={isDeleting}
                    onEdit={() => {
                      setEditText(reply.content);
                      setIsEditing(true);
                    }}
                    onDelete={handleDelete}
                    onReport={handleReport}
                    onBlock={handleBlock}
                  />
                </div>
              </div>
            )}

            {/* Action row */}
            <div className="flex items-center gap-3 mt-0.5 px-1">
              <span className="text-[10px] text-muted-foreground">
                {formatTime(reply.created_at)}
              </span>
              <button
                onClick={() => setShowReplyInput((v) => !v)}
                className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                Reply
              </button>
            </div>

            {/* Nested reply input */}
            {showReplyInput && (
              <div className="mt-2">
                <CommentInput
                  value={replyText}
                  onChange={setReplyText}
                  onSubmit={handleSubmitNestedReply}
                  onCancel={() => {
                    setShowReplyInput(false);
                    setReplyText("");
                  }}
                  isSubmitting={isSubmittingReply}
                  placeholder={`Reply to ${reply.username}…`}
                  autoFocus
                  size="xs"
                  showCancel
                />
              </div>
            )}
          </div>
        </div>

        {/* Nested replies */}
        {nestedReplies.length > 0 && (
          <div className="mt-1 ml-4 border-l-2 border-border/30 pl-2 space-y-1">
            {nestedReplies.map((nested) => (
              <ReplyItem
                key={nested.id}
                reply={nested}
                formatTime={formatTime}
                currentUserId={currentUserId}
                currentUsername={currentUsername}
                onDeleted={handleNestedDeleted}
                onUpdated={handleNestedUpdated}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

ReplyItem.displayName = "ReplyItem";
export default ReplyItem;
