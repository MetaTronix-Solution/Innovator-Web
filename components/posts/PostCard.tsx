"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import Image from "next/image";
import { User, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { repostPost, updatePost } from "@/lib/services/postService";
import { getComments, postComment } from "@/lib/services/commentService";
import FollowToggle from "../FollowToggle";
import SharePostModal from "../SharePostModal";
import { useDispatch, useSelector } from "react-redux";
import {
  addPostToTop,
  togglePostReaction,
  removePost,
  removePostsByUser,
} from "@/lib/store/features/postsSlice";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import PostCardSkeleton from "./PostCardSkeleton";
import LazyVideo from "./LazyVideo";
import MediaCarousel from "./MediaCarousel";
import CommentSection from "./CommentSection";
import RepostModal from "./RepostModal";
import RepostCard from "./RepostCard";
import ReactionsModal from "./ReactionsModal";
import ReactionButton from "./ReactionButton";
import PostCardMenu from "./PostCardMenu";
import { RootState } from "@/lib/store/store";
import Link from "next/link";
import CommentButton from "./CommentButton";
import RepostButton from "./RepostButton";
import { useSession } from "next-auth/react";

export const renderedPosts = new Set<string>();

const PostCard = ({ post }: { post: any; index?: number }) => {
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
  const [localReaction, setLocalReaction] = useState<string | null>(
    post.current_user_reaction ?? null,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(
    post.content || post.caption || "",
  );
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    setLocalReaction(post.current_user_reaction ?? null);
    setLocalCount(post.like_count ?? 0);
  }, [post.id, post.current_user_reaction, post.like_count]);

  const cardRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  const { data: session } = useSession();

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const isOwnPost = currentUser?.id === post.user_id;

  const isRepost = !!post.shared_post_details;
  const caption = post.caption || post.content || "";
  const avatarUrl = getMediaUrl(post.avatar);

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

  const fetchReactionCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${post.id}/reactions-list/`);
      if (!res.ok) return;
      const data = await res.json();
      const reactions = Array.isArray(data) ? data : (data.results ?? []);
      setLocalCount(reactions.length);
      const myReaction = reactions.find((r: any) => r.user === currentUser?.id);
      const finalReaction = myReaction?.type ?? null;
      setLocalReaction(finalReaction);
      dispatch(
        togglePostReaction({
          postId: post.id,
          reactionType: finalReaction,
        }),
      );
    } catch {}
  }, [post.id, currentUser?.id, dispatch]);

  useEffect(() => {
    if (isVisible) fetchReactionCount();
  }, [isVisible]);

  const handleReact = useCallback(
    async (reactionType: string | null) => {
      const prevReaction = localReaction;

      setLocalReaction(reactionType);
      dispatch(
        togglePostReaction({ postId: post.id, reactionType: reactionType }),
      );

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

        if (!res.ok) throw new Error("Failed to sync");

        fetchReactionCount();
      } catch (err) {
        setLocalReaction(prevReaction);
        dispatch(
          togglePostReaction({ postId: post.id, reactionType: prevReaction }),
        );
        toast.error("Could not update reaction.");
      }
    },
    [post.id, post.type, dispatch, fetchReactionCount, localReaction],
  );

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

  const handleEditSave = useCallback(async () => {
    if (!editContent.trim()) return;
    setIsSavingEdit(true);
    try {
      await updatePost(post.id, { content: editContent });
      toast.success("Post updated!");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update post");
    } finally {
      setIsSavingEdit(false);
    }
  }, [editContent, post.id]);

  const handleDeleted = useCallback(() => {
    dispatch(removePost(post.id));
  }, [dispatch, post.id]);

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
            src={getMediaUrl(post.video) || ""}
            poster={getMediaUrl(post.thumbnail) || undefined}
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
            poster={getMediaUrl(post.thumbnail) || undefined}
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

                {!isOwnPost && (
                  <FollowToggle
                    userId={post.user_id}
                    initialIsFollowed={post.is_followed}
                    username={post.username}
                    variant="text"
                  />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                {formatRelativeTime(post.created_at)}
              </p>
            </div>
          </div>

          <PostCardMenu
            postId={post.id}
            isOwnPost={isOwnPost}
            content={caption}
            userId={post.user_id}
            onDeleted={handleDeleted}
            onEditClick={() => {
              setEditContent(caption);
              setIsEditing(true);
            }}
            onBlocked={() => dispatch(removePostsByUser(post.user_id))}
          />
        </div>

        {isRepost ? (
          <RepostCard post={post} formatRelativeTime={formatRelativeTime} />
        ) : (
          <>
            {isEditing ? (
              <div className="px-4 pb-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  autoFocus
                  className="w-full bg-muted/40 border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={isSavingEdit || !editContent.trim()}
                    className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
                  >
                    {isSavingEdit && (
                      <Loader2 size={13} className="animate-spin" />
                    )}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              caption && (
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
              )
            )}
            {!isEditing && renderMedia()}
          </>
        )}

        <div className="px-4 py-2 flex items-center justify-between border-t border-border/50">
          <div className="flex gap-1">
            <ReactionButton
              currentReaction={localReaction}
              count={localCount}
              onReact={handleReact}
              onCountClick={() => {
                if (localCount > 0) setShowReactionsModal(true);
              }}
            />
            <CommentButton
              count={post.comments_count || 0}
              active={showComments}
              onClick={() => setShowComments((v) => !v)}
            />
            <RepostButton
              count={post.repost_count}
              onClick={() => setIsRepostModalOpen(true)}
            />
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
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

        {showComments && (
          <CommentSection
            currentUserId={session?.user?.id}
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

      {showReactionsModal && (
        <ReactionsModal
          postId={post.id}
          contentType={post.type}
          onClose={() => setShowReactionsModal(false)}
        />
      )}

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
