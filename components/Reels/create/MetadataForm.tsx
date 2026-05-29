import React from "react";
import ThumbnailSelector from "./ThumbnailSelector";

export interface ReelForm {
  caption: string;
  hashtags: string[];
  thumbnail: string | null;
  privacy: "public" | "friends" | "private";
}

export interface UploadState {
  status: "idle" | "uploading" | "processing" | "success" | "error";
  progress: number;
  message: string;
}

interface MetadataFormProps {
  form: ReelForm;
  onChange: (form: ReelForm) => void;
  videoSrc: string | null;
  onSubmit: () => void;
  uploadState: UploadState;
}

const MAX_CAPTION_LENGTH = 2200;
const PRIVACY_OPTIONS = [
  { value: "public" as const, label: "Public", icon: "🌐" },
  { value: "friends" as const, label: "Friends", icon: "👥" },
  { value: "private" as const, label: "Private", icon: "🔒" },
];

export default function MetadataForm({
  form,
  onChange,
  videoSrc,
  onSubmit,
  uploadState,
}: MetadataFormProps) {
  const handleCaption = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...form, caption: e.target.value.slice(0, MAX_CAPTION_LENGTH) });
  };

  const handlePrivacy = (privacy: ReelForm["privacy"]) => {
    onChange({ ...form, privacy });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label
          htmlFor="caption"
          className="block text-sm text-muted-foreground mb-2"
        >
          Caption / Description
        </label>
        <textarea
          id="caption"
          value={form.caption}
          onChange={handleCaption}
          rows={4}
          placeholder="Write a caption…"
          className="w-full bg-muted border border-border rounded-xl p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-y"
        />
        <p
          className={`text-xs text-right mt-1 ${form.caption.length > MAX_CAPTION_LENGTH * 0.9 ? "text-amber-500" : "text-muted-foreground"}`}
        >
          {form.caption.length.toLocaleString()} /{" "}
          {MAX_CAPTION_LENGTH.toLocaleString()}
        </p>
      </div>

      {/* <ThumbnailSelector
        videoSrc={videoSrc}
        selectedThumb={form.thumbnail}
        onSelect={(thumbnail) => onChange({ ...form, thumbnail })}
      /> */}

      {/* <fieldset className="space-y-3">
        <legend className="text-sm text-muted-foreground">Privacy</legend>
        <div className="flex gap-2">
          {PRIVACY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handlePrivacy(opt.value)}
              className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                form.privacy === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted hover:border-muted-foreground"
              }`}
            >
              <span className="text-xl">{opt.icon}</span>
              <span className="text-[11px] font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      </fieldset> */}

      {uploadState.status === "uploading" && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Uploading...</span>
            <span>{uploadState.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={
          uploadState.status !== "idle" && uploadState.status !== "error"
        }
        className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-primary disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
      >
        {uploadState.status === "uploading"
          ? `Uploading ${uploadState.progress}%`
          : uploadState.status === "processing"
            ? "Processing…"
            : uploadState.status === "success"
              ? "Published!"
              : "Share Reel"}
      </button>
    </div>
  );
}
