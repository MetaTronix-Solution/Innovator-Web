// import Image from "next/image";
// import { X, User, Send, Loader2 } from "lucide-react";
// import { getMediaUrl } from "@/lib/utils/getMediaUrl";

// interface RepostModalProps {
//   post: any;
//   currentUser: any;
//   repostCaption: string | "";
//   isSubmitting: boolean;
//   formatRelativeTime: (d: string) => string;
//   onClose: () => void;
//   onCaptionChange: (value: string) => void;
//   onSubmit: () => void;
// }

// const RepostModal = ({
//   post,
//   currentUser,
//   repostCaption,
//   isSubmitting,
//   formatRelativeTime,
//   onClose,
//   onCaptionChange,
//   onSubmit,
// }: RepostModalProps) => {
//   const caption = post.caption || post.content || "";

//   const avatarUrl = currentUser?.avatar || currentUser?.image;
//   const profileImage = avatarUrl ? getMediaUrl(avatarUrl) : null;

//   const mediaPreviewUrl = (() => {
//     if (post.media?.length > 0) return getMediaUrl(post.media[0].file);
//     if (post.thumbnail) return getMediaUrl(post.thumbnail);
//     if (post.file) return getMediaUrl(post.file);
//     if (post.image_url) return getMediaUrl(post.image_url);
//     return null;
//   })();

//   const hasVideo = !!post.video || post.media?.[0]?.media_type === "video";

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
//       <div className="absolute inset-0" onClick={onClose} />
//       <div className="bg-card border border-border w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden relative z-[110] animate-in zoom-in-95 duration-300">
//         <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
//           <h3 className="font-bold text-xl text-foreground">Repost</h3>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-6 space-y-5">
//           <div className="flex gap-4">
//             <div className="w-10 h-10 relative rounded-full bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
//               {profileImage ? (
//                 <Image
//                   src={profileImage}
//                   alt="User"
//                   fill
//                   className="object-cover"
//                   unoptimized
//                 />
//               ) : (
//                 <User size={20} className="text-muted-foreground" />
//               )}
//             </div>
//             <textarea
//               autoFocus
//               placeholder="Add your thoughts about this..."
//               className="w-full bg-transparent resize-none text-foreground text-base focus:outline-none min-h-[80px] py-1"
//               value={repostCaption}
//               onChange={(e) => onCaptionChange(e.target.value)}
//             />
//           </div>

//           <div className="border border-border/60 rounded-2xl overflow-hidden bg-muted/20">
//             <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
//               <div className="w-8 h-8 rounded-full bg-muted border border-border relative overflow-hidden shrink-0 flex items-center justify-center">
//                 {post.avatar ? (
//                   <Image
//                     src={getMediaUrl(post.avatar) || ""}
//                     alt={post.username}
//                     fill
//                     className="object-cover"
//                     unoptimized
//                   />
//                 ) : (
//                   <User size={14} className="text-muted-foreground" />
//                 )}
//               </div>
//               <div className="flex flex-col min-w-0">
//                 <span className="text-sm font-bold text-foreground leading-tight truncate">
//                   {post.full_name || post.username}
//                 </span>
//                 <span className="text-xs text-muted-foreground">
//                   @{post.username} · {formatRelativeTime(post.created_at)}
//                 </span>
//               </div>
//             </div>

//             {/* Original caption */}
//             {caption && (
//               <p className="px-4 pb-3 text-sm text-foreground/80 leading-relaxed line-clamp-2">
//                 {caption}
//               </p>
//             )}

//             {/* Original media preview */}
//             {mediaPreviewUrl && (
//               <div className="relative w-full h-44 bg-black/5">
//                 <Image
//                   src={mediaPreviewUrl}
//                   alt="Post media"
//                   fill
//                   className="object-cover"
//                   unoptimized
//                 />
//                 {/* Video play overlay */}
//                 {hasVideo && (
//                   <div className="absolute inset-0 flex items-center justify-center bg-black/30">
//                     <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full">
//                       <svg
//                         className="w-6 h-6 text-white fill-current"
//                         viewBox="0 0 24 24"
//                       >
//                         <path d="M8 5v14l11-7z" />
//                       </svg>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Submit button */}
//           <button
//             onClick={onSubmit}
//             disabled={isSubmitting || !repostCaption.trim()}
//             className="w-full bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
//           >
//             {isSubmitting ? (
//               <Loader2 className="w-5 h-5 animate-spin" />
//             ) : (
//               <Send size={18} />
//             )}
//             {isSubmitting ? "Sharing..." : "Repost Now"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RepostModal;

import Image from "next/image";
import { X, User, Send, Loader2 } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

interface RepostModalProps {
  post: any;
  currentUser: any; // The Redux user object
  repostCaption: string;
  isSubmitting: boolean;
  formatRelativeTime: (d: string) => string;
  onClose: () => void;
  onCaptionChange: (value: string) => void;
  onSubmit: () => void;
}

const RepostModal = ({
  post,
  currentUser,
  repostCaption,
  isSubmitting,
  formatRelativeTime,
  onClose,
  onCaptionChange,
  onSubmit,
}: RepostModalProps) => {
  // 1. Replicating your CreatePostBox image logic
  const getProfileImage = () => {
    const rawAvatarPath =
      currentUser?.profile?.avatar ||
      currentUser?.profile_image ||
      currentUser?.avatar ||
      currentUser?.image;
    if (!rawAvatarPath || rawAvatarPath === "null") return null;
    return getMediaUrl(rawAvatarPath);
  };

  const profileImage = getProfileImage();
  const caption = post.caption || post.content || "";

  const mediaPreviewUrl = (() => {
    if (post.media?.length > 0) return getMediaUrl(post.media[0].file);
    if (post.thumbnail) return getMediaUrl(post.thumbnail);
    if (post.file) return getMediaUrl(post.file);
    if (post.image_url) return getMediaUrl(post.image_url);
    return null;
  })();

  const hasVideo = !!post.video || post.media?.[0]?.media_type === "video";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden relative z-[110] animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Repost</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* User Header Section */}
          <div className="flex gap-3">
            <div className="w-12 h-12 relative rounded-full border border-border flex items-center justify-center bg-muted overflow-hidden shrink-0">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={currentUser?.username || "User"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <User size={24} className="text-muted-foreground/60" />
              )}
            </div>

            <textarea
              autoFocus
              placeholder={`What's on your mind?`}
              className="w-full bg-transparent resize-none text-foreground text-[17px] focus:outline-none min-h-[80px] py-2"
              value={repostCaption}
              onChange={(e) => onCaptionChange(e.target.value)}
            />
          </div>

          {/* Shared Post Preview */}
          <div className="border border-border rounded-xl overflow-hidden bg-muted/30">
            <div className="flex items-center gap-2 p-3">
              <div className="w-8 h-8 rounded-full bg-muted border border-border relative overflow-hidden shrink-0 flex items-center justify-center">
                {post.avatar ? (
                  <Image
                    src={getMediaUrl(post.avatar) || ""}
                    alt={post.username}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <User size={14} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground leading-tight">
                  {post.full_name || post.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(post.created_at)}
                </span>
              </div>
            </div>

            {caption && (
              <p className="px-3 pb-2 text-sm text-foreground/80 line-clamp-2">
                {caption}
              </p>
            )}

            {mediaPreviewUrl && (
              <div className="relative w-full h-40 bg-black/5">
                <Image
                  src={mediaPreviewUrl}
                  alt="Post media"
                  fill
                  className="object-cover"
                  unoptimized
                />
                {hasVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                    ▶
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onSubmit}
            disabled={isSubmitting || !repostCaption.trim()}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
            {isSubmitting ? "Sharing..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepostModal;
