"use client";

import React, { memo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle,
  MoreHorizontal,
  UserPlus,
  Music2,
  Send,
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import ReelVideo from "./ReelVideo";
import FollowToggle from "@/components/FollowToggle";
import { useDispatch } from "react-redux";
import { toggleReelReaction } from "@/lib/store/features/reelsSlice";
import { useRouter } from "next/navigation";
import SharePostModal from "@/components/SharePostModal";
import ReactionButton from "../posts/ReactionButton";
import ReelCommentsDrawer from "./ReelCommentDrawer";
import ReelReactionsDrawer from "./ReelReactonsDrawer";

interface ReelCardProps {
  reel: any;
  post?: any;
}

const ReelCard = ({ reel, post }: ReelCardProps) => {
  const videoSrc = getMediaUrl(reel.video_file || reel.video);
  const posterSrc = getMediaUrl(
    reel.thumbnail || reel.cover_image || reel.poster,
  );
  const avatarSrc = getMediaUrl(reel.avatar);

  const dispatch = useDispatch();
  const router = useRouter();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [localCount, setLocalCount] = useState<number>(
    reel.reactions_count ?? reel.like_count ?? 0,
  );

  const userId = reel.user_id || reel.user?.id || reel.id;

  const handleReact = useCallback(
    async (reactionType: string | null) => {
      const prevReaction = reel.current_user_reaction;
      const isSame = prevReaction === reactionType;
      const nextReaction = isSame ? null : reactionType;
      const delta =
        !prevReaction && nextReaction
          ? 1
          : prevReaction && !nextReaction
            ? -1
            : 0;

      dispatch(
        toggleReelReaction({ reelId: reel.id, reactionType: nextReaction }),
      );
      setLocalCount((c) => Math.max(0, c + delta));

      try {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: reel.id,
            type: reactionType,
            contentType: "reel",
          }),
        });
        if (!res.ok) {
          if (res.status === 401) router.push("/login");
          throw new Error();
        }
      } catch {
        dispatch(
          toggleReelReaction({ reelId: reel.id, reactionType: prevReaction }),
        );
        setLocalCount((c) => Math.max(0, c - delta));
      }
    },
    [reel.id, reel.current_user_reaction, dispatch, router],
  );

  const handleShare = useCallback(async () => {
    setIsShareModalOpen(true);
  }, []);

  return (
    <div className="relative w-[400px] h-full rounded-sm md:rounded-3xl overflow-hidden">
      <div className="absolute inset-0 z-0">
        {videoSrc ? (
          <ReelVideo
            src={videoSrc || ""}
            poster={posterSrc || undefined}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-neutral-900 animate-pulse" />
        )}
      </div>

      <div className="absolute right-3 bottom-10 z-20 flex flex-col items-center gap-5">
        <ReactionButton
          isVertical={true}
          currentReaction={reel.current_user_reaction ?? null}
          count={localCount}
          onReact={handleReact}
          onCountClick={() => {
            if (localCount > 0) setShowReactions(true);
          }}
          variant="reels"
        />
        <ActionBtn
          icon={<MessageCircle size={24} strokeWidth={1.8} />}
          label={formatCount(reel.comments_count)}
          onClick={() => setShowComments(true)}
        />

        <button
          onClick={handleShare}
          className="p-2 rounded-full cursor-pointer text-muted-foreground transition-all hover:scale-110"
        >
          <Send size={20} className="text-white" />
        </button>

        <SharePostModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          post={post ?? reel}
        />
        <button className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
          <MoreHorizontal
            size={24}
            strokeWidth={1.8}
            className="text-white drop-shadow-lg"
          />
        </button>
        {showComments && (
          <ReelCommentsDrawer
            reelId={reel.id}
            commentsCount={reel.comments_count ?? 0}
            onClose={() => setShowComments(false)}
          />
        )}
        {showReactions && (
          <ReelReactionsDrawer
            reelId={reel.id}
            onClose={() => setShowReactions(false)}
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pt-16 pb-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <div className="flex items-center gap-2.5 mb-2">
          <Link
            href={`/${userId || ""}`}
            className="flex items-center gap-2.5 group cursor-pointer transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-full border-2 border-white/80 overflow-hidden relative shrink-0 shadow-lg group-hover:border-white transition-colors">
              {avatarSrc ? (
                <Image
                  src={avatarSrc || ""}
                  alt={reel.username ?? "user"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="bg-neutral-700 w-full h-full flex items-center justify-center">
                  <UserPlus size={16} className="text-white" />
                </div>
              )}
            </div>
            <p className="font-bold text-white text-sm">
              {(reel.full_name || reel.username).length > 20
                ? (reel.full_name || reel.username).substring(0, 20) + "..."
                : reel.full_name || reel.username}
            </p>
          </Link>

          <FollowToggle
            key={reel.id}
            userId={userId}
            initialIsFollowed={reel.is_followed ?? false}
            username={reel.username}
            variant="reels"
          />
        </div>

        {reel.caption && (
          <div className="max-w-[75%] mt-2">
            <p
              className={`text-white/90 text-sm leading-relaxed ${
                isExpanded ? "line-clamp-none" : "line-clamp-1"
              }`}
            >
              {reel.caption}
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/60 text-xs font-semibold hover:text-white transition-colors mt-1"
            >
              {isExpanded ? "See less" : "See more"}
            </button>
          </div>
        )}

        {reel.audio_name && (
          <div className="flex items-center gap-1.5 mt-2">
            <Music2 size={12} className="text-white/70 shrink-0" />
            <p className="text-white/70 text-xs truncate max-w-[60%]">
              {reel.audio_name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function formatCount(val?: number | string): string {
  const n = Number(val ?? 0);
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function ActionBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group"
    >
      <span className="text-white drop-shadow-lg group-hover:scale-110 transition-transform">
        {icon}
      </span>
      {label !== undefined && (
        <span className="text-white text-xs font-semibold drop-shadow">
          {label}
        </span>
      )}
    </button>
  );
}

export default memo(ReelCard);
