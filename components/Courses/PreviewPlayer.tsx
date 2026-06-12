import React, { useState, useEffect, useRef } from "react";
import { Maximize2 } from "lucide-react";
import { Content } from "@/types/course";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

export function PreviewPlayer({
  content,
  videoRef,
}: {
  content: Content;
  videoRef?: React.RefObject<HTMLVideoElement>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const videoUrl = getMediaUrl(content.video_url);
  const videoFile = getMediaUrl(content.video_file);

  if (videoUrl) {
    return (
      <div
        ref={containerRef}
        className="relative w-full bg-black"
        style={{ aspectRatio: "16/9" }}
      >
        <iframe
          src={videoUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen"
          loading="lazy"
        />
      </div>
    );
  }

  if (videoFile) {
    return (
      <div
        ref={containerRef}
        className="relative w-full bg-black"
        style={{ aspectRatio: "16/9" }}
      >
        <video
          ref={videoRef}
          src={videoFile}
          controls
          className="w-full h-full"
          playsInline
          preload="auto"
        />
        <button
          onClick={handleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          className="absolute bottom-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5 transition-all backdrop-blur-sm"
        >
          <Maximize2 size={15} />
        </button>
      </div>
    );
  }

  return null;
}
