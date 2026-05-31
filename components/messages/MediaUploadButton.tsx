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
  ImageIcon,
  Loader2,
  Paperclip,
} from "lucide-react";

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

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 400,
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
      >
        <X size={16} />
      </button>
      <a
        href={src}
        download
        className="absolute top-3 right-14 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
      >
        <Download size={14} />
      </a>
      <div className="max-w-[90vw] max-h-[85vh] relative">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] rounded-lg object-contain"
        />
      </div>
    </div>
  );
}

function VideoLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 400,
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
      >
        <X size={16} />
      </button>
      <video
        src={src}
        controls
        autoPlay
        className="max-w-[90vw] max-h-[85vh] rounded-lg"
      />
    </div>
  );
}

export function MediaBubble({
  attachment,
  isMine,
}: {
  attachment: string;
  isMine: boolean;
}) {
  const [lightbox, setLightbox] = useState<"image" | "video" | null>(null);
  const mediaType = getMediaType(attachment);
  const fileName = getFileName(attachment);

  if (mediaType === "image") {
    return (
      <>
        <div
          className={`relative group cursor-zoom-in overflow-hidden rounded-xl ${
            isMine ? "rounded-br-[5px]" : "rounded-bl-[5px]"
          }`}
          style={{ maxWidth: 220, minWidth: 120 }}
          onClick={() => setLightbox("image")}
        >
          <img
            src={attachment}
            alt={fileName}
            className="w-full object-cover rounded-xl"
            style={{ maxHeight: 220, display: "block" }}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center">
            <ZoomIn
              size={22}
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
            />
          </div>
        </div>
        {lightbox === "image" && (
          <Lightbox
            src={attachment}
            alt={fileName}
            onClose={() => setLightbox(null)}
          />
        )}
      </>
    );
  }

  if (mediaType === "video") {
    return (
      <>
        <div
          className={`relative group cursor-pointer overflow-hidden rounded-xl bg-black ${
            isMine ? "rounded-br-[5px]" : "rounded-bl-[5px]"
          }`}
          style={{ maxWidth: 220, minWidth: 120 }}
          onClick={() => setLightbox("video")}
        >
          <video
            src={attachment}
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
          <VideoLightbox src={attachment} onClose={() => setLightbox(null)} />
        )}
      </>
    );
  }

  return (
    <a
      href={attachment}
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
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isMine ? "bg-white/20" : "bg-muted"
        }`}
      >
        <FileText
          size={16}
          className={isMine ? "text-white" : "text-muted-foreground"}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-[12px] font-medium truncate leading-tight ${
            isMine ? "text-white" : "text-foreground"
          }`}
        >
          {fileName}
        </p>
        <p
          className={`text-[10px] mt-0.5 ${
            isMine ? "text-white/70" : "text-muted-foreground/70"
          }`}
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
        <img
          src={preview.objectUrl}
          alt={preview.file.name}
          className="w-24 h-24 object-cover rounded-xl"
        />
      )}
      {preview.mediaType === "video" && (
        <div className="w-24 h-24 bg-black flex items-center justify-center rounded-xl">
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

interface MediaUploadProps {
  activeChatId: string;
  onSent: (message: any) => void;
  disabled?: boolean;
  onHasFilesChange?: (hasFiles: boolean) => void; // ← new
  triggerSendRef?: React.MutableRefObject<(() => Promise<void>) | null>; // ← new
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
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].objectUrl);
      const updated = prev.filter((_, i) => i !== index);
      onHasFilesChange?.(updated.length > 0);
      return updated;
    });
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

      {/* Preview strip above input */}
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
