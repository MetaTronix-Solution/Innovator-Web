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
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import ReelVideo from "./ReelVideo";
import FollowToggle from "@/components/FollowToggle";
import { useDispatch, useSelector } from "react-redux";
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

  const currentUserId = useSelector((state: any) => state.auth?.user?.id);
  const isOwner =
    currentUserId && currentUserId === (reel.user_id || reel.user?.id);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(reel.caption ?? "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const handleUpdate = async () => {
    if (!editCaption.trim()) return;
    setIsUpdating(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/reels/${reel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: editCaption }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Failed to update");
      }

      setIsEditing(false);
      setShowMenu(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this reel?")) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/reels/${reel.id}`, {
        method: "DELETE",
      });

      if (res.ok || res.status === 204) {
        router.refresh(); // re-fetch reels list
      } else {
        const err = await res.json();
        throw new Error(err.message ?? "Failed to delete");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleShare = useCallback(() => setIsShareModalOpen(true), []);

  return (
    <div className="relative w-[400px] h-full rounded-sm md:rounded-3xl overflow-hidden">
      <div className="absolute inset-0 z-0">
        {videoSrc ? (
          <ReelVideo
            src={videoSrc}
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
          <Send size={20} className="text-secondary" />
        </button>

        <SharePostModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          post={post ?? reel}
        />

        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="More options"
          >
            <MoreHorizontal
              size={24}
              strokeWidth={1.8}
              className="text-secondary drop-shadow-lg"
            />
          </button>

          {showMenu && (
            <div className="absolute bottom-8 right-0 w-44 bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl z-50">
              {isOwner ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    <Pencil size={15} />
                    Edit caption
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    {isDeleting ? "Deleting…" : "Delete reel"}
                  </button>
                </>
              ) : (
                <div className="px-4 py-3 text-sm text-white/40 text-center select-none">
                  No actions available
                </div>
              )}
            </div>
          )}
        </div>

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

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pt-16 pb-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <div className="flex items-center gap-2.5 mb-2">
          <Link
            href={`/${userId || ""}`}
            className="flex items-center gap-2.5 group cursor-pointer transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-full border-2 border-white/80 overflow-hidden relative shrink-0 shadow-lg group-hover:border-white transition-colors">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
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
              className={`text-white/90 text-sm leading-relaxed ${isExpanded ? "line-clamp-none" : "line-clamp-1"}`}
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

      {/* Edit caption modal */}
      {isEditing && (
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-neutral-900 rounded-2xl p-5 w-full border border-white/10 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Edit caption</h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditError(null);
                }}
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value.slice(0, 2200))}
              rows={4}
              className="w-full bg-neutral-800 text-white text-sm rounded-xl p-3 border border-white/10 resize-none outline-none focus:border-white/30 transition-colors"
              placeholder="Write a caption…"
            />

            <div className="flex justify-between items-center">
              <span className="text-white/30 text-xs">
                {editCaption.length} / 2,200
              </span>
              {editError && (
                <span className="text-red-400 text-xs">{editError}</span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditError(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating || !editCaption.trim()}
                className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-40"
              >
                {isUpdating ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
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
      <span className="text-secondary drop-shadow-lg group-hover:scale-110 transition-transform">
        {icon}
      </span>
      {label !== undefined && (
        <span className="text-secondary text-xs font-semibold drop-shadow">
          {label}
        </span>
      )}
    </button>
  );
}

export default memo(ReelCard);
