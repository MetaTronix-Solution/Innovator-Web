"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import Image from "next/image";
import {
  EllipsisVertical,
  MessageCircle,
  ThumbsUp,
  Repeat2,
  X,
  Loader2,
  User,
  SendHorizontal,
  ChevronLeft,
  ChevronRight,
  Send,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  VolumeX,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { repostPost } from "@/lib/services/postService";
import { getComments, postComment } from "@/lib/services/commentService";
import FollowToggle from "./FollowToggle";
import SharePostModal from "./SharePostModal";
import { useDispatch } from "react-redux";
import { togglePostReaction } from "@/lib/store/features/postsSlice";
import { useRouter } from "next/navigation";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

const PostCardSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm mb-4 animate-pulse">
    <div className="p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-2 bg-muted rounded w-1/5" />
      </div>
    </div>
    <div className="px-4 pb-3 space-y-2">
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-4/5" />
    </div>
    <div className="w-full bg-muted min-h-[300px]" />
    <div className="px-4 py-3 flex gap-4 border-t border-border/50">
      <div className="h-8 bg-muted rounded-lg w-16" />
      <div className="h-8 bg-muted rounded-lg w-16" />
      <div className="h-8 bg-muted rounded-lg w-16" />
    </div>
  </div>
);

const LazyVideo = memo(
  ({
    src,
    poster,
    className,
  }: {
    src: string;
    poster?: string;
    className?: string;
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(1);
    const [progress, setProgress] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [showFeedback, setShowFeedback] = useState(false);

    const fmt = (s: number) => {
      s = Math.floor(s || 0);
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    };

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!videoRef.current) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            videoRef.current.play().catch(() => {});
          } else {
            videoRef.current.pause();
          }
        },
        { rootMargin: "-10% 0px -10% 0px", threshold: [0, 0.7] },
      );
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, []);

    const toggleMute = () => {
      if (!videoRef.current) return;
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    };

    const togglePlay = () => {
      if (!videoRef.current) return;
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();

      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 600);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      if (!videoRef.current) return;
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
      setVolume(v);
      setIsMuted(v === 0);
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const pct = parseFloat(e.target.value);
      setProgress(pct);
      setCurrentTime((pct / 100) * duration);
    };

    const handleSeekCommit = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!videoRef.current) return;
      videoRef.current.currentTime =
        (parseFloat(e.target.value) / 100) * duration;
      setIsSeeking(false);
    };

    const skip = (sec: number) => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + sec),
      );
    };

    return (
      <div
        ref={containerRef}
        className={`relative bg-black group w-full flex items-center justify-center overflow-hidden ${className}`}
        style={{ aspectRatio: "auto" }}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          muted
          loop
          preload="metadata"
          className="w-full object-contain max-h-[500px]"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
          onTimeUpdate={() => {
            if (isSeeking || !videoRef.current) return;
            const pct =
              (videoRef.current.currentTime /
                (videoRef.current.duration || 1)) *
              100;
            setProgress(pct);
            setCurrentTime(videoRef.current.currentTime);
            if (videoRef.current.buffered.length) {
              setBuffered(
                (videoRef.current.buffered.end(
                  videoRef.current.buffered.length - 1,
                ) /
                  videoRef.current.duration) *
                  100,
              );
            }
          }}
          onVolumeChange={() => {
            setIsMuted(videoRef.current?.muted ?? true);
            setVolume(videoRef.current?.volume ?? 1);
          }}
        />

        {showFeedback && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 rounded-full p-4 animate-ping-once">
              {isPlaying ? (
                <Pause size={32} className="text-white" fill="white" />
              ) : (
                <Play size={32} className="text-white" fill="white" />
              )}
            </div>
          </div>
        )}

        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pt-8 pb-3 transition-opacity duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100`}
        >
          <div className="relative mb-2 h-6 flex items-center group/slider">
            <div className="absolute w-full h-1 bg-white/20 rounded-full">
              <div
                className="absolute left-0 top-0 h-full bg-white/40 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              <div
                className="absolute left-0 top-0 h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute h-3 w-3 bg-white rounded-full -top-1 shadow-md lg:opacity-0 lg:group-hover/slider:opacity-100"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress || 0}
              onChange={handleSeekChange}
              onMouseDown={() => setIsSeeking(true)}
              onMouseUp={handleSeekCommit}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10 touch-none"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button onClick={togglePlay} className="text-white p-2">
                {isPlaying ? (
                  <Pause size={20} fill="white" />
                ) : (
                  <Play size={20} fill="white" />
                )}
              </button>

              <button onClick={() => skip(-5)} className="text-white/70 p-2">
                <RotateCcw size={18} />
              </button>
              <button onClick={() => skip(5)} className="text-white/70 p-2">
                <RotateCw size={18} />
              </button>

              <span className="text-white/90 text-[11px] font-medium ml-1 tabular-nums">
                {fmt(currentTime)} / {fmt(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-1">
                <button onClick={toggleMute} className="text-white/70 p-1">
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-12 sm:w-16 accent-white cursor-pointer hidden xs:block"
                />
              </div>

              <select
                value={speed}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setSpeed(v);
                  if (videoRef.current) videoRef.current.playbackRate = v;
                }}
                className="text-white/90 bg-white/10 rounded-md px-1 text-xs font-bold border-none outline-none appearance-none"
              >
                {[0.5, 1, 1.5, 2].map((s) => (
                  <option key={s} value={s} className="text-black">
                    {s}x
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
LazyVideo.displayName = "LazyVideo";

const MediaCarousel = memo(
  ({ media, thumbnail }: { media: any[]; thumbnail?: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const { scrollLeft, offsetWidth } = e.currentTarget;
      setCurrentIndex(Math.round(scrollLeft / offsetWidth));
    }, []);

    const scrollTo = useCallback((dir: "prev" | "next") => {
      if (!scrollRef.current) return;
      const delta =
        dir === "next"
          ? scrollRef.current.offsetWidth
          : -scrollRef.current.offsetWidth;
      scrollRef.current.scrollLeft += delta;
    }, []);

    return (
      <div className="w-full bg-muted/20 relative border-y border-border/40 group">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar scroll-smooth min-h-[350px]"
          style={{ scrollbarWidth: "none" }}
        >
          {media.map((item: any, idx: number) => {
            const fileUrl = getMediaUrl(item.file);
            const isVideo =
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
                {isVideo ? (
                  <LazyVideo
                    src={fileUrl}
                    poster={getMediaUrl(thumbnail)}
                    className="w-full max-h-[500px] object-contain"
                  />
                ) : (
                  <div className="relative w-full h-[400px]">
                    <Image
                      src={fileUrl}
                      alt={`Media ${idx}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="object-contain"
                      loading={idx === 0 ? "eager" : "lazy"}
                      unoptimized
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {media.length > 1 && (
          <>
            <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/10">
              {currentIndex + 1} / {media.length}
            </div>
            <button
              onClick={() => scrollTo("prev")}
              className={`absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 p-1.5 rounded-full shadow-md transition-opacity ${currentIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollTo("next")}
              className={`absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 p-1.5 rounded-full shadow-md transition-opacity ${currentIndex === media.length - 1 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
              <ChevronRight size={18} />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {media.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "w-4 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  },
);
MediaCarousel.displayName = "MediaCarousel";

const CommentItem = memo(
  ({
    comment,
    formatTime,
  }: {
    comment: any;
    formatTime: (d: string) => string;
  }) => (
    <div className="flex gap-3 animate-in fade-in duration-300">
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
          <p className="text-sm text-foreground/80">{comment.content}</p>
        </div>
        <p className="text-[10px] text-muted-foreground px-1">
          {formatTime(comment.created_at)}
        </p>
      </div>
    </div>
  ),
);
CommentItem.displayName = "CommentItem";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string | number;
  onClick: () => void;
  active?: boolean;
}

const ActionButton = memo(
  ({ icon, label, onClick, active = false }: ActionButtonProps) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-accent ${
        active
          ? "text-primary bg-primary/5"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </button>
  ),
);
ActionButton.displayName = "ActionButton";

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

  const cardRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (wasRendered) return; // already seen, skip observer

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

  const handleLike = useCallback(async () => {
    const isUnliking = post.current_user_reaction === "like";
    dispatch(
      togglePostReaction({
        postId: post.id,
        reactionType: isUnliking ? null : "like",
      }),
    );
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, type: "like" }),
      });
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        throw new Error("Failed to sync reaction");
      }
    } catch {
      // Rollback
      dispatch(
        togglePostReaction({
          postId: post.id,
          reactionType: isUnliking ? "like" : null,
        }),
      );
    }
  }, [post.id, post.current_user_reaction, dispatch, router]);

  const handleShare = useCallback(async () => {
    if (
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) &&
      navigator.share
    ) {
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
  }, [post]);

  const handleRepostSubmit = useCallback(async () => {
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
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [repostCaption, post]);

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
              loading="lazy"
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
            <div className="w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
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

        {/* Caption */}
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

        {/* Media */}
        {renderMedia()}

        {/* Footer */}
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
            className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-all"
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
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    formatTime={formatRelativeTime}
                  />
                ))
              ) : (
                <p className="text-center py-6 text-sm text-muted-foreground">
                  No comments yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Repost Modal */}
      {isRepostModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="absolute inset-0"
            onClick={() => setIsRepostModalOpen(false)}
          />
          <div className="bg-card border border-border w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden relative z-[110] animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-bold text-xl text-foreground">Repost</h3>
              <button
                onClick={() => setIsRepostModalOpen(false)}
                className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 relative rounded-full bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                  <User size={20} className="text-muted-foreground" />
                </div>
                <textarea
                  autoFocus
                  placeholder="Add your thoughts about this..."
                  className="w-full bg-transparent resize-none text-foreground text-lg focus:outline-none min-h-[100px] py-1"
                  value={repostCaption}
                  onChange={(e) => setRepostCaption(e.target.value)}
                />
              </div>

              {/* Original post preview */}
              <div className="ml-2 border border-border/60 rounded-2xl p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-muted border border-border relative overflow-hidden shrink-0">
                    {post.avatar ? (
                      <Image
                        src={getMediaUrl(post.avatar)}
                        alt={post.username}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <User size={10} className="m-1 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-foreground/80">
                    @{post.username}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    • {formatRelativeTime(post.created_at)}
                  </span>
                </div>
                <p className="text-sm text-foreground/70 line-clamp-2 leading-relaxed mb-3">
                  {caption}
                </p>
                {(() => {
                  const mediaUrl = post.video
                    ? getMediaUrl(post.thumbnail)
                    : getMediaUrl(
                        post.media?.[0]?.file || post.file || post.image_url,
                      );
                  if (!mediaUrl) return null;
                  return (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border/40 bg-black/5">
                      <Image
                        src={mediaUrl}
                        alt="Original post thumbnail"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {post.video && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full">
                            <svg
                              className="w-4 h-4 text-white fill-current"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <button
                onClick={handleRepostSubmit}
                disabled={isSubmitting || !repostCaption.trim()}
                className="w-full bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {isSubmitting ? "Sharing..." : "Repost Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(PostCard);
