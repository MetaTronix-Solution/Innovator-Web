"use client";

import { useEffect, useState, useRef, memo, useCallback } from "react";
import { Heart } from "lucide-react";

interface ReelVideoProps {
  src: string;
  poster?: string;
  className?: string;
  onScroll?: (direction: "up" | "down") => void;
}

const ReelVideo = memo(
  ({ src, poster, className, onScroll }: ReelVideoProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const observer = new IntersectionObserver(
        async ([entry]) => {
          if (entry.isIntersecting) {
            containerRef.current?.focus();
            try {
              await video.play();
            } catch (err) {
              if (err instanceof Error && err.name !== "AbortError") {
                if (!video.muted) {
                  video.muted = true;
                  await video.play();
                }
              }
            }
          } else {
            video.pause();
          }
        },
        { threshold: 0.6 },
      );

      if (containerRef.current) observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
        if (video) video.pause();
      };
    }, []);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const updateProgress = () => {
        if (video.duration) {
          setProgress((video.currentTime / video.duration) * 100);
        }
      };

      video.addEventListener("timeupdate", updateProgress);
      return () => video.removeEventListener("timeupdate", updateProgress);
    }, []);

    const togglePlay = useCallback(() => {
      if (!videoRef.current) return;
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }, []);

    const lastTap = useRef<number>(0);
    const handleTouch = () => {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
      } else {
        togglePlay();
      }
      lastTap.current = now;
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          onScroll?.("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          onScroll?.("down");
          break;
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          e.preventDefault();
          videoRef.current.muted = !videoRef.current.muted;
          setIsMuted(videoRef.current.muted);
          break;
      }
    };

    return (
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`relative w-full h-full bg-black overflow-hidden flex items-center justify-center ${className} isolate`}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          autoPlay
          muted={isMuted}
          className="w-full h-full object-contain"
          onClick={handleTouch}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-black/20 backdrop-blur-sm p-5 rounded-full">
              <div className="w-0 h-0 border-y-[15px] border-y-transparent border-l-[25px] border-l-white ml-2" />
            </div>
          </div>
        )}

        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <Heart
              size={100}
              className="text-white fill-white animate-reel-heart"
            />
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full h-1 z-[60] bg-black/50">
          <div
            className="h-full transition-all duration-100 ease-linear"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(to right, #ffffff, #ffffff)",
              willChange: "width",
              filter: "none",
              opacity: 1,
            }}
          />
        </div>
      </div>
    );
  },
);

ReelVideo.displayName = "ReelVideo";

export default ReelVideo;
