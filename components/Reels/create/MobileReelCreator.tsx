"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Music2,
  Sparkles,
  Gauge,
  ImagePlus,
  Video,
  Upload,
  Check,
  Loader2,
  FlipHorizontal,
  Timer,
} from "lucide-react";
import MetadataForm, { ReelForm } from "./MetadataForm";

type UploadState = {
  status: "idle" | "uploading" | "processing" | "success" | "error";
  progress: number;
  message: string;
};

type Screen = "capture" | "preview" | "details";

interface Props {
  onClose: () => void;
  onFileSelect: (file: File) => void;
  onSubmit: () => void;
  videoFile: File | null;
  videoSrc: string | null;
  onRemove: () => void;
  uploadState: UploadState;
  form: ReelForm;
  onFormChange: (f: ReelForm) => void;
  fileError: string | null;
}

const SPEEDS = [
  { label: "0.3×", value: 0.3 },
  { label: "0.5×", value: 0.5 },
  { label: "1×", value: 1 },
  { label: "2×", value: 2 },
  { label: "3×", value: 3 },
];

const EFFECTS = [
  { id: "none", label: "None", filter: "none" },
  { id: "vivid", label: "Vivid", filter: "saturate(1.8) contrast(1.1)" },
  { id: "fade", label: "Fade", filter: "opacity(0.75) brightness(1.1)" },
  { id: "noir", label: "Noir", filter: "grayscale(1) contrast(1.2)" },
  { id: "warm", label: "Warm", filter: "sepia(0.4) saturate(1.3)" },
  { id: "cool", label: "Cool", filter: "hue-rotate(180deg) saturate(0.8)" },
  {
    id: "dramatic",
    label: "Dramatic",
    filter: "contrast(1.5) brightness(0.85)",
  },
];

const TRACKS = [
  { id: "1", title: "Trending Beat", artist: "DJ Nova", duration: "0:30" },
  { id: "2", title: "Chill Vibes", artist: "Lo-Fi Studio", duration: "0:45" },
  { id: "3", title: "Epic Moment", artist: "Cinematic Co.", duration: "0:60" },
  { id: "4", title: "Summer Groove", artist: "Beach Sounds", duration: "0:30" },
];

export default function MobileReelCreator({
  onClose,
  onFileSelect,
  onSubmit,
  videoFile,
  videoSrc,
  onRemove,
  uploadState,
  form,
  onFormChange,
  fileError,
}: Props) {
  const [screen, setScreen] = useState<Screen>("capture");
  const [activePanel, setActivePanel] = useState<
    "speed" | "effects" | "music" | "timer" | null
  >(null);
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [selectedEffect, setSelectedEffect] = useState("none");
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [timerDelay, setTimerDelay] = useState<3 | 10 | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.playbackRate = selectedSpeed;
    }
  }, [selectedSpeed, videoSrc]);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, aspectRatio: 9 / 16 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      // Camera not available — silently fall back (user can still upload)
    }
  }, [facingMode]);

  useEffect(() => {
    if (screen === "capture") startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, startCamera]);

  const handleFlip = () => {
    setFacingMode((f) => (f === "user" ? "environment" : "user"));
  };

  const beginRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const file = new File([blob], `reel_${Date.now()}.webm`, {
        type: "video/webm",
      });
      onFileSelect(file);
      setScreen("preview");
    };
    mediaRef.current = mr;
    mr.start();
    setIsRecording(true);
    setRecordSeconds(0);
    timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      mediaRef.current?.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    if (timerDelay) {
      setCountdown(timerDelay);
      let c = timerDelay;
      const iv = setInterval(() => {
        c--;
        setCountdown(c);
        if (c === 0) {
          clearInterval(iv);
          setCountdown(null);
          beginRecording();
        }
      }, 1000);
    } else {
      beginRecording();
    }
  };

  const handleGalleryPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
    setScreen("preview");
  };

  const effect = EFFECTS.find((ef) => ef.id === selectedEffect)!;

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (screen === "capture")
    return (
      <div
        className="fixed inset-0 z-[70] bg-black flex flex-col"
        style={{ touchAction: "none" }}
      >
        <div className="relative flex-1 overflow-hidden">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className="w-full h-full object-cover"
            style={{
              filter: effect.filter,
              transform: facingMode === "user" ? "scaleX(-1)" : "none",
            }}
          />

          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-8xl font-black drop-shadow-lg animate-ping">
                {countdown}
              </span>
            </div>
          )}

          {/* Recording badge */}
          {isRecording && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-sm font-semibold tabular-nums">
                {fmtTime(recordSeconds)}
              </span>
            </div>
          )}

          {/* Progress bar */}
          {isRecording && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-red-500 transition-all"
                style={{
                  width: `${Math.min((recordSeconds / 60) * 100, 100)}%`,
                }}
              />
            </div>
          )}

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe pt-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
            >
              <X size={20} className="text-white" />
            </button>

            <button
              onClick={handleFlip}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
            >
              <FlipHorizontal size={18} className="text-white" />
            </button>
          </div>

          {/* Right toolbar */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            {[
              {
                icon: <Gauge size={20} />,
                label: "Speed",
                panel: "speed" as const,
              },
              {
                icon: <Sparkles size={20} />,
                label: "Effects",
                panel: "effects" as const,
              },
              {
                icon: <Music2 size={20} />,
                label: "Music",
                panel: "music" as const,
              },
              {
                icon: <Timer size={20} />,
                label: "Timer",
                panel: "timer" as const,
              },
            ].map(({ icon, label, panel }) => (
              <button
                key={panel}
                onClick={() =>
                  setActivePanel(activePanel === panel ? null : panel)
                }
                className={`flex flex-col items-center gap-0.5 w-12 py-2 rounded-2xl backdrop-blur-sm transition-colors ${
                  activePanel === panel ? "bg-white/30" : "bg-black/30"
                }`}
              >
                <span className="text-white">{icon}</span>
                <span className="text-white text-[9px] font-medium">
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Panel overlays */}
          {activePanel === "speed" && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl">
              {SPEEDS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => {
                    setSelectedSpeed(s.value);
                    setActivePanel(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                    selectedSpeed === s.value
                      ? "bg-white text-black"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {activePanel === "effects" && (
            <div className="absolute bottom-28 left-0 right-0 px-4">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {EFFECTS.map((ef) => (
                  <button
                    key={ef.id}
                    onClick={() => {
                      setSelectedEffect(ef.id);
                      setActivePanel(null);
                    }}
                    className={`flex-shrink-0 flex flex-col items-center gap-1`}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl border-2 overflow-hidden transition-all ${
                        selectedEffect === ef.id
                          ? "border-white scale-105"
                          : "border-white/30"
                      }`}
                      style={{
                        filter: ef.filter,
                        background: "linear-gradient(135deg,#667eea,#764ba2)",
                      }}
                    />
                    <span className="text-white text-[10px] font-medium">
                      {ef.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePanel === "music" && (
            <div className="absolute bottom-28 left-3 right-3 bg-black/75 backdrop-blur-md rounded-2xl p-3 flex flex-col gap-2 max-h-56 overflow-y-auto no-scrollbar">
              <p className="text-white text-xs font-semibold mb-1 flex items-center gap-1">
                <Music2 size={12} /> Add Music
              </p>
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTrack(t.id);
                    setActivePanel(null);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
                    selectedTrack === t.id ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                    <Music2 size={14} className="text-white" />
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-white text-sm font-medium truncate">
                      {t.title}
                    </p>
                    <p className="text-white/60 text-xs truncate">
                      {t.artist} · {t.duration}
                    </p>
                  </div>
                  {selectedTrack === t.id && (
                    <Check size={14} className="text-green-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {activePanel === "timer" && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-3 bg-black/60 backdrop-blur-md px-4 py-3 rounded-2xl">
              {([null, 3, 10] as const).map((d) => (
                <button
                  key={String(d)}
                  onClick={() => {
                    setTimerDelay(d);
                    setActivePanel(null);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                    timerDelay === d
                      ? "bg-white text-black"
                      : "text-white hover:bg-white/20"
                  }`}
                >
                  {d === null ? "Off" : `${d}s`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="bg-black px-6 pb-safe pb-6 pt-4 flex items-center justify-between gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-2xl border-2 border-white/30 bg-white/10 flex items-center justify-center"
          >
            <ImagePlus size={22} className="text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={handleGalleryPick}
          />

          {/* Record button */}
          <button
            onClick={handleRecordToggle}
            disabled={countdown !== null}
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
          >
            <span
              className={`absolute inset-0 rounded-full border-4 transition-colors ${isRecording ? "border-red-500" : "border-white"}`}
            />
            <span
              className={`transition-all duration-200 rounded-full ${
                isRecording
                  ? "w-8 h-8 bg-red-500 rounded-lg"
                  : "w-14 h-14 bg-white"
              }`}
            />
          </button>

          {/* Upload from device */}
          <button
            onClick={() => {
              const inp = document.createElement("input");
              inp.type = "file";
              inp.accept = "video/mp4,video/quicktime,video/webm";
              inp.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  onFileSelect(file);
                  setScreen("preview");
                }
              };
              inp.click();
            }}
            className="w-14 h-14 rounded-2xl border-2 border-white/30 bg-white/10 flex items-center justify-center"
          >
            <Upload size={22} className="text-white" />
          </button>
        </div>

        {/* Active indicators strip */}
        <div className="bg-black px-4 pb-3 flex gap-3 justify-center">
          {selectedEffect !== "none" && (
            <span className="flex items-center gap-1 text-white/70 text-[10px]">
              <Sparkles size={10} />{" "}
              {EFFECTS.find((e) => e.id === selectedEffect)?.label}
            </span>
          )}
          {selectedTrack && (
            <span className="flex items-center gap-1 text-white/70 text-[10px]">
              <Music2 size={10} />{" "}
              {TRACKS.find((t) => t.id === selectedTrack)?.title}
            </span>
          )}
          {selectedSpeed !== 1 && (
            <span className="flex items-center gap-1 text-white/70 text-[10px]">
              <Gauge size={10} /> {selectedSpeed}×
            </span>
          )}
          {timerDelay && (
            <span className="flex items-center gap-1 text-white/70 text-[10px]">
              <Timer size={10} /> {timerDelay}s timer
            </span>
          )}
        </div>
      </div>
    );

  if (screen === "preview" && videoSrc)
    return (
      <div className="fixed inset-0 z-[70] bg-black flex flex-col">
        <div className="relative flex-1 overflow-hidden">
          <video
            ref={previewRef}
            src={videoSrc}
            loop
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ filter: effect.filter }}
          />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe pt-3">
            <button
              onClick={() => {
                onRemove();
                setScreen("capture");
              }}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <span className="text-white font-semibold text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
              Preview
            </span>
            <button
              onClick={() => setScreen("details")}
              className="flex items-center gap-1.5 bg-white text-black font-semibold text-sm px-4 py-1.5 rounded-full"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          {/* File info */}
          {videoFile && (
            <div className="absolute bottom-6 left-4 right-4 bg-black/50 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3">
              <Video size={18} className="text-white shrink-0" />
              <div className="flex-1 overflow-hidden">
                <p className="text-white text-sm font-medium truncate">
                  {videoFile.name}
                </p>
                <p className="text-white/60 text-xs">
                  {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );

  if (screen === "details")
    return (
      <div className="fixed inset-0 z-[70] bg-background flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border flex items-center justify-between px-4 py-3 shrink-0">
          <button onClick={() => setScreen("preview")} className="p-1">
            <ChevronLeft size={22} className="text-foreground" />
          </button>
          <h2 className="font-bold text-base">Post Reel</h2>
          <div className="w-8" />
        </div>

        {/* Thumbnail row */}
        {videoSrc && (
          <div className="px-4 pt-4">
            <div className="flex gap-3 items-center bg-muted rounded-2xl p-3">
              <video
                src={videoSrc}
                className="w-16 h-20 object-cover rounded-xl"
                style={{ filter: effect.filter }}
                muted
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {videoFile?.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {videoFile
                    ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB`
                    : ""}
                  {selectedEffect !== "none" &&
                    ` · ${EFFECTS.find((e) => e.id === selectedEffect)?.label}`}
                  {selectedTrack &&
                    ` · ${TRACKS.find((t) => t.id === selectedTrack)?.title}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload status */}
        {uploadState.status === "uploading" && (
          <div className="mx-4 mt-3 bg-primary/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Loader2 size={18} className="animate-spin text-primary" />
            <span className="text-sm text-primary font-medium">Uploading…</span>
          </div>
        )}
        {uploadState.status === "success" && (
          <div className="mx-4 mt-3 bg-green-500/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Check size={18} className="text-green-500" />
            <span className="text-sm text-green-600 font-medium">
              Posted! Redirecting…
            </span>
          </div>
        )}
        {uploadState.status === "error" && (
          <div className="mx-4 mt-3 bg-destructive/10 rounded-2xl px-4 py-3">
            <p className="text-sm text-destructive font-medium">
              {uploadState.message || "Upload failed"}
            </p>
          </div>
        )}

        {/* MetadataForm */}
        <div className="px-4 py-4 flex-1">
          <MetadataForm
            form={form}
            onChange={onFormChange}
            videoSrc={videoSrc!}
            onSubmit={onSubmit}
            uploadState={uploadState}
          />
        </div>
      </div>
    );

  return null;
}
