"use client";

import Image from "next/image";
import { User, Repeat2 } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import MediaCarousel from "./MediaCarousel";
import LazyVideo from "./LazyVideo";

interface RepostCardProps {
  post: any;
  formatRelativeTime: (d: string) => string;
}

const RepostCard = ({ post, formatRelativeTime }: RepostCardProps) => {
  const shared = post.shared_post_details;

  const repostCaption = post.content || post.caption || "";

  const originalCaption = shared?.content || shared?.caption || "";

  const renderSharedMedia = () => {
    if (!shared) return null;

    if (shared.media?.length > 0) {
      return (
        <div className="rounded-b-xl overflow-hidden">
          <MediaCarousel media={shared.media} thumbnail={shared.thumbnail} />
        </div>
      );
    }

    if (shared.video) {
      return (
        <div className="rounded-b-xl overflow-hidden">
          <LazyVideo
            src={getMediaUrl(shared.video) || ""}
            poster={getMediaUrl(shared.thumbnail) || undefined}
            className="w-full max-h-[360px] object-contain"
          />
        </div>
      );
    }

    const singleUrl = getMediaUrl(shared.file || shared.image_url);
    if (!singleUrl) return null;

    const isVideo = singleUrl
      .toLowerCase()
      .split(/[?#]/)[0]
      .match(/\.(mp4|webm|mov|m4v|m3u8)$/);

    if (isVideo) {
      return (
        <div className="rounded-b-xl overflow-hidden">
          <LazyVideo
            src={singleUrl}
            poster={getMediaUrl(shared.thumbnail) || undefined}
            className="w-full max-h-[360px] object-contain"
          />
        </div>
      );
    }

    return (
      <div className="relative w-full h-[260px]">
        <Image
          src={singleUrl}
          alt="Original post media"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  };

  return (
    <div className="w-full">
      {repostCaption ? (
        <div className="px-4 pb-3">
          <p className="text-[15px] text-foreground/90 leading-relaxed">
            {repostCaption}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-4 pb-2 text-muted-foreground">
          <Repeat2 size={13} />
          <span className="text-xs">Reposted</span>
        </div>
      )}

      {shared && (
        <div className="mx-4 mb-3 border border-border/70 rounded-2xl overflow-hidden bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
          {/* Original post header */}
          <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
            <div className="w-7 h-7 rounded-full bg-muted border border-border relative overflow-hidden shrink-0 flex items-center justify-center">
              {shared.avatar ? (
                <Image
                  src={getMediaUrl(shared.avatar) || ""}
                  alt={shared.username || "user"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <User size={13} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span className="text-xs text-muted-foreground">
                @{shared.username}
              </span>
              {shared.created_at && (
                <>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(shared.created_at)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Original caption */}
          {originalCaption && (
            <p className="px-3 pb-2 text-sm text-foreground/80 leading-relaxed line-clamp-3">
              {originalCaption}
            </p>
          )}

          {/* Original media */}
          {renderSharedMedia()}
        </div>
      )}
    </div>
  );
};

export default RepostCard;
