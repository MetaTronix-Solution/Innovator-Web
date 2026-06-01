import { Video } from "lucide-react";
import React, { useState, useRef, useCallback } from "react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  error?: string | null;
}

const MAX_FILE_SIZE_MB = 100; // Example value

export default function UploadZone({ onFileSelect, error }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload video file. Drag and drop or click to select."
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all outline-none user-select-none ${
        isDragging
          ? "border-primary bg-primary/10"
          : error
            ? "border-destructive bg-destructive/5"
            : "border-border bg-muted/50 hover:bg-muted"
      }`}
    >
      <div
        className="w-18 h-18 rounded-full bg-linear-to-br from-primary to-pink-500 flex items-center justify-center text-4xl"
        aria-hidden="true"
      >
        <Video className="h-9 w-9 text-secondary" />
      </div>

      <div className="text-center">
        <p className="text-foreground text-lg font-semibold mb-1.5">
          {isDragging ? "Drop your video here" : "Drag & drop your video"}
        </p>
        <p className="text-muted-foreground text-sm">
          or <span className="text-primary underline">browse files</span>
        </p>
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {["MP4", "MOV"].map((ext) => (
          <span
            key={ext}
            className="px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium"
          >
            {ext}
          </span>
        ))}
        <span className="px-3 py-1 rounded-full bg-white/5 text-muted-foreground text-xs">
          Max {MAX_FILE_SIZE_MB} MB
        </span>
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm text-center">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
