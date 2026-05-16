"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import Image from "next/image";
import {
  EllipsisVertical,
  MessageCircle,
  Repeat2,
  User,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { repostPost } from "@/lib/services/postService";
import { getComments, postComment } from "@/lib/services/commentService";
import FollowToggle from "../FollowToggle";
import SharePostModal from "../SharePostModal";
import { useDispatch, useSelector } from "react-redux";
import {
  addPostToTop,
  togglePostReaction,
} from "@/lib/store/features/postsSlice";
import { useRouter } from "next/navigation";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

import PostCardSkeleton from "./PostCardSkeleton";
import LazyVideo from "./LazyVideo";
import MediaCarousel from "./MediaCarousel";
import ActionButton from "./ActionButton";
import CommentSection from "./CommentSection";
import RepostModal from "./RepostModal";
import RepostCard from "./RepostCard";
import ReactionsModal from "./ReactionsModal";
import ReactionButton from "./ReactionButton";
import { RootState } from "@/lib/store/store";
import Link from "next/link";

const renderedPosts = new Set<string>();

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
  const [isExpanded, setIsExpanded] = useState(false);
  const wasRendered = renderedPosts.has(post.id);
  const [isVisible, setIsVisible] = useState(wasRendered);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [localCount, setLocalCount] = useState<number>(post.like_count ?? 0);

  const cardRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const isRepost = !!post.shared_post_details;

  useEffect(() => {
    if (wasRendered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          renderedPosts.add(post.id);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "200px" },
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (showComments) handleFetchComments();
  }, [showComments]);

  const formatRelativeTime = useCallback((dateString: string) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}${days === 1 ? " day" : " days"} ago`;
    }
    return date.toLocaleDateString();
  }, []);

  const handleFetchComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      const data = await getComments(post.id, post.type || "post");
      setComments(data);
    } catch {
      toast.error("Failed to load comments.");
    } finally {
      setIsLoadingComments(false);
    }
  }, [post.id, post.type]);

  const handleCommentSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;
      setIsSubmittingComment(true);
      try {
        const created = await postComment(
          post.id,
          newComment,
          post.type || "post",
        );
        setComments((prev) => [created, ...prev]);
        setNewComment("");
        toast.success("Comment posted!");
      } catch (err: any) {
        toast.error(err.message || "Failed to post comment.");
      } finally {
        setIsSubmittingComment(false);
      }
    },
    [newComment, post.id, post.type],
  );

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const fetchReactionCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}/reactions-list/`);
      if (!res.ok) return;
      const data = await res.json();
      const reactions = Array.isArray(data) ? data : (data.results ?? []);

      setLocalCount(reactions.length);

      const myReaction = reactions.find((r: any) => r.user === currentUser?.id);
      dispatch(
        togglePostReaction({
          postId: post.id,
          reactionType: myReaction?.type ?? null,
        }),
      );
    } catch {}
  }, [post.id, currentUser?.id, dispatch]);

  // Only on mount — not after every reaction
  useEffect(() => {
    if (isVisible) fetchReactionCount();
  }, [isVisible]); // ← intentionally omit fetchReactionCount from deps

  const handleReact = useCallback(
    async (reactionType: string) => {
      const prevReaction = post.current_user_reaction;
      const isSameReaction = prevReaction === reactionType;
      const nextReaction = isSameReaction ? null : reactionType;

      const delta =
        !prevReaction && nextReaction
          ? 1
          : prevReaction && !nextReaction
            ? -1
            : 0;

      dispatch(
        togglePostReaction({ postId: post.id, reactionType: nextReaction }),
      );
      setLocalCount((c) => Math.max(0, c + delta));

      try {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: post.id,
            type: reactionType,
            contentType: post.type,
          }),
        });
        if (!res.ok) {
          if (res.status === 401) router.push("/login");
          throw new Error("Failed to sync reaction");
        }
      } catch {
        // Rollback on failure
        dispatch(
          togglePostReaction({ postId: post.id, reactionType: prevReaction }),
        );
        setLocalCount((c) => Math.max(0, c - delta));
      }
    },
    [post.id, post.current_user_reaction, dispatch, router],
  );

  const handleShare = useCallback(async () => {
    setIsShareModalOpen(true);
  }, []);

  const handleRepostSubmit = useCallback(async () => {
    if (!repostCaption.trim()) return;
    setIsSubmitting(true);
    try {
      const newPost = await repostPost(post.id, repostCaption);
      dispatch(addPostToTop(newPost));
      toast.success("Successfully reposted!");
      setIsRepostModalOpen(false);
      setRepostCaption("");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [repostCaption, post.id]);

  const liked = post.current_user_reaction === "like";
  const avatarUrl = getMediaUrl(post.avatar);
  const caption = post.caption || post.content || "";

  if (!isVisible) {
    return (
      <div ref={cardRef}>
        <PostCardSkeleton />
      </div>
    );
  }

  const renderMedia = () => {
    if (isRepost) return null;

    if (post.media?.length > 0) {
      return <MediaCarousel media={post.media} thumbnail={post.thumbnail} />;
    }

    if (post.video) {
      return (
        <div className="w-full bg-black flex items-center justify-center min-h-[350px] relative border-y border-border/40">
          <LazyVideo
            src={getMediaUrl(post.video)}
            poster={getMediaUrl(post.thumbnail)}
            className="w-full max-h-[600px] object-contain"
          />
        </div>
      );
    }

    const singleUrl = getMediaUrl(post.file || post.image_url);
    if (!singleUrl) return null;

    const isVideo = singleUrl
      .toLowerCase()
      .split(/[?#]/)[0]
      .match(/\.(mp4|webm|mov|m4v|m3u8)$/);

    return (
      <div className="w-full bg-muted/20 flex items-center justify-center min-h-[350px] relative border-y border-border/40">
        {isVideo ? (
          <LazyVideo
            src={singleUrl}
            poster={getMediaUrl(post.thumbnail)}
            className="w-full max-h-[600px] object-contain"
          />
        ) : (
          <div className="relative w-full h-[400px]">
            <Image
              src={singleUrl}
              alt="Post media"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-contain"
              loading="eager"
              unoptimized
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        ref={cardRef}
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm mb-4 transition-all hover:shadow-md"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/${post.user_id}`}
              className="group transition-transform active:scale-95"
            >
              <div className="w-11 h-11 rounded-full bg-muted border-2 border-primary/20 flex items-center justify-center overflow-hidden shrink-0 relative group-hover:border-primary transition-colors">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={post.username || "avatar"}
                    fill
                    sizes="44px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <User size={24} className="text-muted-foreground/60" />
                )}
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/${post.user_id}`}
                  className="hover:underline decoration-[#ff6b00] underline-offset-2 transition-all"
                >
                  <p className="font-bold text-foreground text-sm">
                    {post.full_name || post.username}
                  </p>
                </Link>
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

        {/* Content */}
        {isRepost ? (
          <RepostCard post={post} formatRelativeTime={formatRelativeTime} />
        ) : (
          <>
            {caption && (
              <div className="px-4 pb-3">
                <p
                  className={`text-[15px] text-foreground/90 leading-relaxed whitespace-pre-wrap transition-all duration-300 ${
                    !isExpanded ? "line-clamp-2" : ""
                  }`}
                >
                  {caption}
                </p>
                {caption.length > 100 && (
                  <button
                    onClick={() => setIsExpanded((v) => !v)}
                    className="text-primary hover:text-primary/80 text-sm font-semibold mt-1 transition-colors"
                  >
                    {isExpanded ? "Show less" : "more"}
                  </button>
                )}
              </div>
            )}
            {renderMedia()}
          </>
        )}

        {/* Footer */}
        <div className="px-4 py-2 flex items-center justify-between border-t border-border/50">
          <div className="flex gap-1">
            <ReactionButton
              currentReaction={post.current_user_reaction ?? null}
              count={localCount}
              onReact={handleReact}
              onCountClick={() => {
                if (localCount > 0) setShowReactionsModal(true);
              }}
            />
            <ActionButton
              icon={
                <MessageCircle
                  size={18}
                  className={showComments ? "text-primary fill-primary/10" : ""}
                />
              }
              label={post.comments_count || 0}
              onClick={() => setShowComments((v) => !v)}
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
            className="p-2 hover:bg-accent rounded-full cursor-pointer text-muted-foreground transition-all"
          >
            <Send size={18} />
          </button>
          <SharePostModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            post={post}
          />
        </div>

        {/* Comments */}
        {showComments && (
          <CommentSection
            comments={comments}
            newComment={newComment}
            isLoadingComments={isLoadingComments}
            isSubmittingComment={isSubmittingComment}
            onCommentChange={setNewComment}
            onCommentSubmit={handleCommentSubmit}
            formatTime={formatRelativeTime}
          />
        )}
      </div>

      {/* Reactions Modal */}
      {showReactionsModal && (
        <ReactionsModal
          postId={post.id}
          contentType={post.type}
          onClose={() => setShowReactionsModal(false)}
        />
      )}

      {/* Repost Modal */}
      {isRepostModalOpen && (
        <RepostModal
          post={post}
          repostCaption={repostCaption}
          isSubmitting={isSubmitting}
          formatRelativeTime={formatRelativeTime}
          onClose={() => setIsRepostModalOpen(false)}
          onCaptionChange={setRepostCaption}
          onSubmit={handleRepostSubmit}
        />
      )}
    </>
  );
};

export default memo(PostCard);
