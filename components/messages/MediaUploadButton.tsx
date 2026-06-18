
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  X,
  FileText,
  Film,
  Download,
  ZoomIn,
  Play,
  Loader2,
  Paperclip,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

export type MediaType = "image" | "video" | "file";

export interface AttachmentPreview {
  file: File;
  objectUrl: string;
  mediaType: MediaType;
}

export function getMediaType(src: string): MediaType {
  const ext = src.split("?")[0].split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "avif", "svg"].includes(ext))
    return "image";
  if (["mp4", "webm", "ogg", "mov", "mkv"].includes(ext)) return "video";
  return "file";
}

function getFileName(src: string) {
  return decodeURIComponent(src.split("/").pop()?.split("?")[0] || "file");
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Full-screen gallery lightbox ──────────────────────────────────────────────
function GalleryLightbox({
  items,
  startIndex,
  onClose,
}: {
  items: { src: string; type: "image" | "video" }[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);

  const prev = () => setCurrent((i) => Math.max(0, i - 1));
  const next = () => setCurrent((i) => Math.min(items.length - 1, i + 1));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const item = items[current];

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex flex-col"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-white/60 text-sm font-medium">
          {current + 1} / {items.length}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={item.src}
            download
            className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={14} />
          </a>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main media */}
      <div className="flex-1 flex items-center justify-center relative px-12">
        {item.type === "image" ? (
          <div className="relative w-full h-full max-w-3xl">
            <Image
              src={item.src}
              alt={`Media ${current + 1}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <video
            key={item.src}
            src={item.src}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-lg"
          />
        )}

        {/* Prev / Next */}
        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={current === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/25 disabled:opacity-20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              disabled={current === items.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/25 disabled:opacity-20 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 shrink-0 overflow-x-auto">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === current
                  ? "border-white scale-110"
                  : "border-white/20 opacity-50 hover:opacity-80"
              }`}
            >
              {it.type === "image" ? (
                <Image
                  src={it.src}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <Play size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Collage grid for multiple media ──────────────────────────────────────────
function MediaCollage({
  attachments,
  isMine,
}: {
  attachments: string[];
  isMine: boolean;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const items = attachments.map((src) => ({
    src: getMediaUrl(src) || src,
    type:
      getMediaType(src) === "video" ? ("video" as const) : ("image" as const),
  }));

  const total = items.length;
  const showCount = Math.min(total, 4); // show max 4 tiles
  const extraCount = total - showCount;

  const cornerClass = isMine ? "rounded-br-[5px]" : "rounded-bl-[5px]";

  const gridClass =
    showCount === 1
      ? "grid-cols-1"
      : showCount === 2
        ? "grid-cols-2"
        : showCount === 3
          ? "grid-cols-2"
          : "grid-cols-2";

  return (
    <>
      <div
        className={`grid gap-0.5 overflow-hidden rounded-xl ${cornerClass} ${gridClass}`}
        style={{ maxWidth: 240, minWidth: 120 }}
      >
        {items.slice(0, showCount).map((item, i) => {
          const isLastTile = i === showCount - 1;
          const hasExtra = isLastTile && extraCount > 0;

          // 3-item layout: first item spans full width top row
          const spanFull = showCount === 3 && i === 0;

          return (
            <div
              key={i}
              className={`relative cursor-pointer group bg-black overflow-hidden ${
                spanFull ? "col-span-2" : ""
              }`}
              style={{ height: spanFull ? 130 : showCount === 1 ? 200 : 110 }}
              onClick={() => setLightboxIndex(i)}
            >
              {item.type === "image" ? (
                <Image
                  src={item.src}
                  alt={`Media ${i + 1}`}
                  fill
                  className="object-cover group-hover:brightness-90 transition-all"
                  unoptimized
                />
              ) : (
                <>
                  <video
                    src={item.src}
                    className="w-full h-full object-cover opacity-80"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow">
                      <Play size={14} className="text-gray-900 ml-0.5" />
                    </div>
                  </div>
                </>
              )}

              {/* +N overlay on last tile */}
              {hasExtra && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    +{extraCount}
                  </span>
                </div>
              )}

              {/* Hover zoom icon for single image */}
              {!hasExtra && showCount === 1 && item.type === "image" && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn
                    size={20}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          items={items}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

// ── Single media bubble (backward compat) ────────────────────────────────────
export function MediaBubble({
  attachment,
  attachments,
  isMine,
}: {
  attachment?: string;
  attachments?: string[];
  isMine: boolean;
}) {
  // Normalise: prefer attachments array, fall back to single attachment
  const all =
    attachments && attachments.length > 0
      ? attachments
      : attachment
        ? [attachment]
        : [];

  if (all.length === 0) return null;

  // If all are images/videos → collage
  const allMedia = all.every((s) => {
    const t = getMediaType(s);
    return t === "image" || t === "video";
  });

  if (allMedia) {
    return <MediaCollage attachments={all} isMine={isMine} />;
  }

  // Mixed or file-only → render each as file bubble
  return (
    <div className="flex flex-col gap-1">
      {all.map((src, i) => (
        <SingleFileBubble key={i} src={src} isMine={isMine} />
      ))}
    </div>
  );
}

function SingleFileBubble({ src, isMine }: { src: string; isMine: boolean }) {
  const resolvedSrc = getMediaUrl(src) || src;
  const fileName = getFileName(src);
  const mediaType = getMediaType(src);
  const [lightbox, setLightbox] = useState<"image" | "video" | null>(null);

  if (mediaType === "image") {
    return (
      <>
        <MediaCollage attachments={[src]} isMine={isMine} />
      </>
    );
  }

  if (mediaType === "video") {
    return (
      <>
        <div
          className={`relative group cursor-pointer overflow-hidden rounded-xl bg-black ${isMine ? "rounded-br-[5px]" : "rounded-bl-[5px]"}`}
          style={{ maxWidth: 220, minWidth: 120 }}
          onClick={() => setLightbox("video")}
        >
          <video
            src={resolvedSrc}
            className="w-full object-cover rounded-xl opacity-90"
            style={{ maxHeight: 180, display: "block" }}
            muted
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors rounded-xl">
            <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow">
              <Play size={18} className="text-gray-900 ml-0.5" />
            </div>
          </div>
        </div>
        {lightbox === "video" && (
          <GalleryLightbox
            items={[{ src: resolvedSrc, type: "video" }]}
            startIndex={0}
            onClose={() => setLightbox(null)}
          />
        )}
      </>
    );
  }

  return (
    <a
      href={resolvedSrc}
      download={fileName}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-colors no-underline ${
        isMine
          ? "bg-orange-600/90 border-orange-500/40 hover:bg-orange-600 text-white rounded-br-[5px]"
          : "bg-card border-border/60 hover:bg-muted/50 text-foreground rounded-bl-[5px]"
      }`}
      style={{ maxWidth: 220, minWidth: 140 }}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMine ? "bg-white/20" : "bg-muted"}`}
      >
        <FileText
          size={16}
          className={isMine ? "text-white" : "text-muted-foreground"}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[12px] font-medium truncate leading-tight ${isMine ? "text-white" : "text-foreground"}`}
        >
          {fileName}
        </p>
        <p
          className={`text-[10px] mt-0.5 ${isMine ? "text-white/70" : "text-muted-foreground/70"}`}
        >
          Download
        </p>
      </div>
      <Download
        size={13}
        className={isMine ? "text-white/80" : "text-muted-foreground"}
      />
    </a>
  );
}

// ── Attachment preview card (before send) ─────────────────────────────────────
function AttachmentPreviewCard({
  preview,
  onRemove,
}: {
  preview: AttachmentPreview;
  onRemove: () => void;
}) {
  return (
    <div className="relative inline-block rounded-xl overflow-hidden border border-border/60 bg-muted/30">
      {preview.mediaType === "image" && (
        // blob: URLs not supported by next/image — intentional img tag
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.objectUrl}
          alt={preview.file.name}
          className="w-24 h-24 object-cover rounded-xl"
        />
      )}
      {preview.mediaType === "video" && (
        <div className="w-24 h-24 bg-black flex items-center justify-center rounded-xl relative">
          <video
            src={preview.objectUrl}
            className="w-full h-full object-cover rounded-xl opacity-80"
            muted
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Film size={22} className="text-white/80" />
          </div>
        </div>
      )}
      {preview.mediaType === "file" && (
        <div className="w-24 h-24 flex flex-col items-center justify-center gap-1 px-2">
          <FileText size={28} className="text-muted-foreground/70" />
          <p className="text-[10px] text-muted-foreground truncate w-full text-center">
            {preview.file.name}
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            {formatBytes(preview.file.size)}
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <X size={10} />
      </button>
    </div>
  );
}

// ── Upload button ─────────────────────────────────────────────────────────────
interface MediaUploadProps {
  activeChatId: string;
  onSent: (message: any) => void;
  disabled?: boolean;
  onHasFilesChange?: (hasFiles: boolean) => void;
  triggerSendRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

export function MediaUploadButton({
  activeChatId,
  onSent,
  disabled,
  onHasFilesChange,
  triggerSendRef,
}: MediaUploadProps) {
  const [previews, setPreviews] = useState<AttachmentPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPreviews: AttachmentPreview[] = files.map((file) => ({
      file,
      objectUrl: URL.createObjectURL(file),
      mediaType: getMediaType(file.name),
    }));
    const updated = [...previews, ...newPreviews];
    setPreviews(updated);
    onHasFilesChange?.(updated.length > 0);
    e.target.value = "";
  };

  const removePreview = (index: number) => {
    URL.revokeObjectURL(previews[index].objectUrl);
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onHasFilesChange?.(updated.length > 0);
  };

  const handleSend = useCallback(async () => {
    if (!previews.length || uploading) return;
    setUploading(true);
    try {
      for (const preview of previews) {
        const formData = new FormData();
        formData.append("attachment", preview.file);
        formData.append("receiver", activeChatId);
        const res = await fetch("/api/chats/", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          onSent(data);
        }
        URL.revokeObjectURL(preview.objectUrl);
      }
    } catch (err) {
      console.error("Media upload failed:", err);
    } finally {
      setPreviews([]);
      onHasFilesChange?.(false);
      setUploading(false);
    }
  }, [previews, activeChatId, uploading, onSent, onHasFilesChange]);

  useEffect(() => {
    if (triggerSendRef) {
      triggerSendRef.current = handleSend;
    }
  }, [handleSend, triggerSendRef]);

  return (
    <>
      <input
        ref={fileInputRef}
        id="media-upload-input"
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      <label
        htmlFor="media-upload-input"
        className={`text-muted-foreground/70 hover:text-foreground transition-colors shrink-0 cursor-pointer ${
          disabled ? "opacity-40 pointer-events-none" : ""
        }`}
        title="Attach file"
      >
        <Paperclip size={16} />
      </label>

      {previews.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-1 px-3 py-2 bg-background border-t border-border/60 flex items-end gap-2 overflow-x-auto no-scrollbar z-10">
          {previews.map((p, i) => (
            <AttachmentPreviewCard
              key={p.objectUrl}
              preview={p}
              onRemove={() => removePreview(i)}
            />
          ))}
          {uploading && (
            <div className="ml-auto self-end flex items-center gap-2 text-xs text-muted-foreground pb-1 pr-1">
              <Loader2 size={14} className="animate-spin text-orange-500" />
              Sending…
            </div>
          )}
        </div>
      )}
    </>
  );
}
