import { useState, useEffect, useRef, memo } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  VolumeX,
  Volume2,
} from "lucide-react";

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
    const [controlsVisible, setControlsVisible] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fmt = (s: number) => {
      s = Math.floor(s || 0);
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    };

    const clearHideTimer = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };

    const startHideTimer = () => {
      clearHideTimer();
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    };

    const revealControls = () => {
      setControlsVisible(true);
      startHideTimer();
    };

    useEffect(() => {
      return () => clearHideTimer();
    }, []);

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
      setTimeout(() => containerRef.current?.focus(), 0);
      if (!videoRef.current) return;
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 600);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!videoRef.current) return;
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
          break;
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(5);
          break;
        case "m":
          e.preventDefault();
          videoRef.current.muted = !videoRef.current.muted;
          setIsMuted(videoRef.current.muted);
          break;
      }
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

    const handleSeekCommit = () => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = (progress / 100) * duration;
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
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={revealControls}
        onMouseMove={revealControls}
        onMouseLeave={() => {
          clearHideTimer();
          setControlsVisible(false);
        }}
        className={`relative bg-black/25 group w-full flex items-center justify-center overflow-hidden cursor-pointer ${className}`}
        style={{ aspectRatio: "auto" }}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          muted
          preload="metadata"
          className="w-full object-contain max-h-[500px]"
          onClick={togglePlay}
          onTouchEnd={(e) => {
            e.preventDefault();
            if (!controlsVisible) {
              revealControls();
            } else {
              togglePlay();
            }
          }}
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

        {/* Play/Pause feedback pulse */}
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

        {/* Bottom overlay */}
        <div
          className="absolute bottom-0 left-0 right-0"
          // Remove stopPropagation so button touches pass through
          onClick={(e) => e.stopPropagation()}
        >
          {/* Buttons + progress — slide up/down */}
          <div
            className={`px-3 pt-8 pb-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-300 ease-in-out ${
              controlsVisible
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-full pointer-events-none"
            }`}
          >
            {/* Progress bar inside controls */}
            <div
              className="relative h-4 flex items-center mb-1"
              onMouseEnter={() => {
                clearHideTimer();
                setControlsVisible(true);
              }}
            >
              <div className="absolute left-0 right-0 h-[3px] bg-white/30 rounded-full">
                <div
                  className="absolute left-0 top-0 h-full bg-white/50 rounded-full"
                  style={{ width: `${buffered}%` }}
                />
                <div
                  className="absolute left-0 top-0 h-full bg-white rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute h-3 w-3 bg-white rounded-full -top-[4px] shadow-md"
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
                onMouseDown={() => {
                  setIsSeeking(true);
                  clearHideTimer();
                }}
                onMouseUp={() => {
                  handleSeekCommit();
                  startHideTimer();
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsSeeking(true);
                  clearHideTimer();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  handleSeekCommit();
                  startHideTimer();
                }}
                className="absolute left-0 right-0 w-full h-full opacity-0 cursor-pointer z-10 touch-none"
              />
            </div>

            {/* Icon row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    togglePlay();
                    startHideTimer();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="text-white p-2"
                >
                  {isPlaying ? (
                    <Pause size={20} fill="white" />
                  ) : (
                    <Play size={20} fill="white" />
                  )}
                </button>
                <button
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    skip(-5);
                    startHideTimer();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    skip(-5);
                  }}
                  className="text-white/70 p-2"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    skip(5);
                    startHideTimer();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    skip(5);
                  }}
                  className="text-white/70 p-2"
                >
                  <RotateCw size={18} />
                </button>
                <span className="text-white/90 text-[11px] font-medium ml-1 tabular-nums">
                  {fmt(currentTime)} / {fmt(duration)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-1">
                  <button
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      toggleMute();
                      startHideTimer();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="text-white/70 p-1"
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => e.stopPropagation()}
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

          {/* Thin progress bar — always visible when controls hidden */}
          <div
            className={`transition-all duration-300 ${
              controlsVisible
                ? "opacity-0 pointer-events-none h-0"
                : "opacity-100 h-4"
            } relative flex items-center px-3`}
          >
            <div className="absolute left-3 right-3 h-[3px] bg-white/30 rounded-full">
              <div
                className="absolute left-0 top-0 h-full bg-white/50 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              <div
                className="absolute left-0 top-0 h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

LazyVideo.displayName = "LazyVideo";
export default LazyVideo;
