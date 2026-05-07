"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  EllipsisVertical,
  MessageCircle,
  ThumbsUp,
  Repeat2,
  X,
  Share2,
  Loader2,
  User,
  SendHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { repostPost } from "@/lib/services/postService";
import { getComments, postComment } from "@/lib/services/commentService";
import FollowToggle from "./FollowToggle";
import SharePostModal from "./SharePostModal";
import { useDispatch } from "react-redux";
import { togglePostReaction } from "@/lib/store/features/postsSlice";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const PostCard = ({ post, index }: { post: any; index?: number }) => {
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [repostCaption, setRepostCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const dispatch = useDispatch();

  // Carousel State
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showComments) {
      handleFetchComments();
    }
  }, [showComments]);

  const handleFetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const data = await getComments(post.id, post.type || "post");
      setComments(data);
    } catch (err) {
      toast.error("Failed to load comments.");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const createdComment = await postComment(
        post.id,
        newComment,
        post.type || "post",
      );
      setComments((prev) => [createdComment, ...prev]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getMediaUrl = (url?: string): string => {
    if (!url || url === "" || url === "null") return "";
    if (url.startsWith("http")) return url;
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `${BASE_URL}${cleanPath}`;
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const newIndex = Math.round(scrollLeft / width);
    setCurrentMediaIndex(newIndex);
  };

  const avatarUrl = getMediaUrl(post.avatar);

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} h ago`;
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    // 1. Determine if we are liking or unliking
    const isUnliking = post.current_user_reaction === "like";
    const newReaction = isUnliking ? null : "like";

    dispatch(
      togglePostReaction({
        postId: post.id,
        reactionType: newReaction,
      }),
    );

    try {
      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          type: "like",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // If unauthorized (cookie expired), maybe redirect to login
        if (response.status === 401) {
          router.push("/login");
        }
        throw new Error(errorData.detail || "Failed to sync reaction");
      }
    } catch (error) {
      // 3. Rollback Redux state if the API call fails
      dispatch(
        togglePostReaction({
          postId: post.id,
          reactionType: isUnliking ? "like" : null,
        }),
      );
      console.error("Reaction error:", error);
    }
  };

  const handleShare = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
      navigator
        .share({
          title: `Post by ${post.username}`,
          text: post.caption || post.content,
          url: `${window.location.origin}/post/${post.id}`,
        })
        .catch(console.error);
    } else {
      setIsShareModalOpen(true);
    }
  };

  const handleRepostSubmit = async () => {
    if (!repostCaption.trim()) return;
    setIsSubmitting(true);
    try {
      await repostPost(post.id, repostCaption, {
        content: post.caption || post.content,
        mediaFile: post.video || getMediaUrl(post.media?.[0]?.file),
        username: post.username,
      });
      toast.success("Successfully reposted!");
      setIsRepostModalOpen(false);
      setRepostCaption("");
      window.location.reload();
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const liked = post.current_user_reaction === "like";

  return (
    <>
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm mb-4 transition-all hover:shadow-md">
        {/* Header */}
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={post.username || "avatar"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <User size={24} className="text-muted-foreground/60" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground text-sm">
                  {post.full_name || post.username}
                </p>
                <FollowToggle
                  userId={post.user_id}
                  initialIsFollowed={post.is_followed}
                  username={post.username}
                  variant="text"
                />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                {formatRelativeTime(post.created_at)}
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors">
            <EllipsisVertical size={18} />
          </button>
        </div>

        {/* Text Content */}
        {(post.caption || post.content) && (
          <div className="px-4 pb-3">
            <p className="text-[15px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {post.caption || post.content}
            </p>
          </div>
        )}

        {/* Media Section - UPDATED to handle both structures */}
        {(() => {
          // 1. Check if we have a media array (posts with multiple media)
          if (post.media && post.media.length > 0) {
            return (
              <div className="w-full bg-muted/20 relative border-y border-border/40 group">
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth min-h-[350px]"
                  style={{ scrollbarWidth: "none" }}
                >
                  {post.media.map((item: any, idx: number) => {
                    const fileUrl = getMediaUrl(item.file);
                    const isVideoItem =
                      item.media_type === "video" ||
                      fileUrl
                        .toLowerCase()
                        .split(/[?#]/)[0]
                        .match(/\.(mp4|webm|mov|m4v|m3u8)$/);
                    return (
                      <div
                        key={item.id || idx}
                        className="w-full shrink-0 snap-center flex items-center justify-center bg-black/5 relative min-h-[350px]"
                      >
                        {isVideoItem ? (
                          <video
                            controls
                            className="w-full max-h-[500px] object-contain"
                            poster={getMediaUrl(post.thumbnail)}
                            playsInline
                          >
                            <source src={fileUrl} type="video/mp4" />
                          </video>
                        ) : (
                          <div className="relative w-full h-[400px]">
                            <Image
                              src={fileUrl}
                              alt={`Media ${idx}`}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {post.media.length > 1 && (
                  <>
                    <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10">
                      {currentMediaIndex + 1} / {post.media.length}
                    </div>
                    <button
                      onClick={() => {
                        if (scrollRef.current)
                          scrollRef.current.scrollLeft -=
                            scrollRef.current.offsetWidth;
                      }}
                      className={`absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 p-1.5 rounded-full shadow-md transition-opacity ${currentMediaIndex === 0 ? "opacity-0" : "opacity-100"}`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (scrollRef.current)
                          scrollRef.current.scrollLeft +=
                            scrollRef.current.offsetWidth;
                      }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 p-1.5 rounded-full shadow-md transition-opacity ${currentMediaIndex === post.media.length - 1 ? "opacity-0" : "opacity-100"}`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
            );
          }

          // 2. Check for single video (reel structure)
          if (post.video) {
            const videoUrl = getMediaUrl(post.video);
            return (
              <div className="w-full bg-black flex items-center justify-center min-h-[350px] relative border-y border-border/40">
                <video
                  controls
                  className="w-full max-h-[600px] object-contain"
                  poster={getMediaUrl(post.thumbnail)}
                  playsInline
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            );
          }

          // 3. Check for single image/file (post structure)
          const singleMediaUrl = getMediaUrl(post.file || post.image_url);
          if (singleMediaUrl) {
            const isVideo = singleMediaUrl
              .toLowerCase()
              .split(/[?#]/)[0]
              .match(/\.(mp4|webm|mov|m4v|m3u8)$/);

            return (
              <div className="w-full bg-muted/20 flex items-center justify-center min-h-[350px] relative border-y border-border/40">
                {isVideo ? (
                  <video
                    controls
                    className="w-full max-h-[600px] object-contain"
                    poster={getMediaUrl(post.thumbnail)}
                    playsInline
                  >
                    <source src={singleMediaUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="relative w-full h-[400px]">
                    <Image
                      src={singleMediaUrl}
                      alt="Post media"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            );
          }

          // 4. No media found
          return null;
        })()}

        {/* Footer Actions */}
        <div className="px-4 py-2 flex items-center justify-between border-t border-border/50">
          <div className="flex gap-2">
            <ActionButton
              icon={
                <ThumbsUp
                  size={18}
                  fill={liked ? "currentColor" : "none"}
                  className={`transition-colors duration-200 ${liked ? "text-primary" : ""}`}
                />
              }
              label={post.like_count ?? 0}
              onClick={handleLike}
              active={liked}
            />
            <ActionButton
              icon={
                <MessageCircle
                  size={18}
                  className={showComments ? "text-primary fill-primary/10" : ""}
                />
              }
              label={post.comments_count || 0}
              onClick={() => setShowComments(!showComments)}
              active={showComments}
            />
            <ActionButton
              icon={<Repeat2 size={18} />}
              label="Repost"
              onClick={() => setIsRepostModalOpen(true)}
            />
          </div>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-all"
          >
            <Share2 size={18} />
          </button>
          <SharePostModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            post={post}
          />
        </div>

        {/* Comments Drawer */}
        {showComments && (
          <div className="border-t border-border/50 bg-muted/5 animate-in fade-in slide-in-from-top-1 duration-200">
            <form
              onSubmit={handleCommentSubmit}
              className="p-4 flex gap-3 items-center"
            >
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                <User size={16} className="text-muted-foreground" />
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary disabled:opacity-30"
                >
                  {isSubmittingComment ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <SendHorizontal size={18} />
                  )}
                </button>
              </div>
            </form>

            <div className="px-4 pb-4 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {isLoadingComments ? (
                <div className="flex justify-center py-6">
                  <Loader2
                    className="animate-spin text-muted-foreground"
                    size={24}
                  />
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 animate-in fade-in duration-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
                      {comment.user_avatar ? (
                        <Image
                          src={getMediaUrl(comment.user_avatar)}
                          alt="user"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <User size={14} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="bg-muted/40 rounded-2xl rounded-tl-none px-3 py-2">
                        <p className="text-xs font-bold text-foreground">
                          {comment.username || "Anonymous"}
                        </p>
                        <p className="text-sm text-foreground/80">
                          {comment.content}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground px-1">
                        {formatRelativeTime(comment.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    No comments yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Repost Modal */}
      {isRepostModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
          <div className="bg-card border border-border w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-bold text-xl text-foreground">Repost</h3>
              <button
                onClick={() => setIsRepostModalOpen(false)}
                className="p-2 hover:bg-accent rounded-full text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 relative rounded-full bg-muted overflow-hidden shrink-0">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="avatar"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <User size={24} className="m-2" />
                  )}
                </div>
                <textarea
                  autoFocus
                  placeholder="Add your thoughts..."
                  className="w-full bg-transparent resize-none text-foreground text-lg focus:outline-none min-h-[80px]"
                  value={repostCaption}
                  onChange={(e) => setRepostCaption(e.target.value)}
                />
              </div>
              <button
                onClick={handleRepostSubmit}
                disabled={isSubmitting || !repostCaption.trim()}
                className="w-full bg-primary text-primary-foreground px-8 py-2.5 rounded-full font-bold transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Sharing..." : "Repost Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ActionButton = ({ icon, label, onClick, active = false }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-accent ${active ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"}`}
  >
    {icon}
    <span className="text-sm font-semibold">{label}</span>
  </button>
);

export default PostCard;
