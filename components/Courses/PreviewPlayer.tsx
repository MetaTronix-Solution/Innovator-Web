import React, { useState, useEffect, useRef } from "react";
import { Maximize2 } from "lucide-react";
import { Content } from "@/types/course";

export function PreviewPlayer({ content }: { content: Content }) {
  const iframeRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    const el = iframeRef.current;
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

  if (content.video_url) {
    return (
      <div
        ref={iframeRef}
        className="relative w-full bg-black"
        style={{ aspectRatio: "16/9" }}
      >
        <iframe
          src={content.video_url}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen"
          loading="lazy"
        />
      </div>
    );
  }

  if (content.video_file) {
    return (
      <div
        ref={iframeRef}
        className="relative w-full bg-black"
        style={{ aspectRatio: "16/9" }}
      >
        <video
          src={content.video_file}
          controls
          className="w-full h-full"
          playsInline
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
