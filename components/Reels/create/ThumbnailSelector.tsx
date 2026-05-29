import React from "react";
import Image from "next/image";

interface ThumbnailSelectorProps {
  videoSrc: string | null;
  selectedThumb: string | null;
  onSelect: (thumb: string) => void;
}

export default function ThumbnailSelector({
  videoSrc,
  selectedThumb,
  onSelect,
}: ThumbnailSelectorProps) {
  if (!videoSrc) return null;

  return (
    <div className="space-y-3">
      <label className="block text-sm text-muted-foreground">
        Select Thumbnail
      </label>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(`thumb-${i}`)}
            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
              selectedThumb === `thumb-${i}`
                ? "border-primary"
                : "border-transparent hover:border-border"
            }`}
          >
            <Image
              src={`/placeholder-thumb-${i}.jpg`}
              alt={`Thumbnail option ${i}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 200px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
