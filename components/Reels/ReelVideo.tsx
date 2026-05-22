"use client";

import { useEffect, useState, useRef, memo, useCallback } from "react";
import { Heart } from "lucide-react";

interface ReelVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

const ReelVideo = memo(({ src, poster, className }: ReelVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting) {
          try {
            await video.play();
          } catch (err) {
            // Ignore AbortError, it's expected when play() is interrupted
            if (err instanceof Error && err.name !== "AbortError") {
              // If it's a permission error, try forcing muted
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
      // Trigger your Like API here
    } else {
      togglePlay();
    }
    lastTap.current = now;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black overflow-hidden flex items-center justify-center ${className}`}
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

      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/20 z-20">
        <div
          className="h-full bg-white/60 transition-all duration-100 ease-linear"
          style={{
            width: `${videoRef.current ? (videoRef.current.currentTime / videoRef.current.duration) * 100 : 0}%`,
          }}
        />
      </div>
    </div>
  );
});

ReelVideo.displayName = "ReelVideo";

export default ReelVideo;
