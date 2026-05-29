"use client";

import { useState } from "react";
import MetadataForm, { ReelForm } from "@/components/Reels/create/MetadataForm";
import UploadZone from "@/components/Reels/create/UploadZone";
import VideoPreview from "@/components/Reels/create/VideoPreview";

const MAX_FILE_SIZE_MB = 500;
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime"];

export default function CreateReelPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [uploadState, setUploadState] = useState({
    status: "idle" as "idle" | "uploading" | "processing" | "success" | "error",
    progress: 0,
    message: "",
  });

  const [form, setForm] = useState<ReelForm>({
    caption: "",
    hashtags: [],
    thumbnail: null,
    privacy: "public",
  });

  const handleFileSelect = (file: File) => {
    setFileError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Only MP4 and MOV files are supported.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File must be under ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    setVideoFile(file);
    setVideoSrc(URL.createObjectURL(file));
  };

  const handleRemove = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    setVideoFile(null);
    setVideoSrc(null);
    setForm((f) => ({ ...f, thumbnail: null }));
  };

  // const handleSubmit = () => {
  //   if (!videoFile) return;
  //   setUploadState({ status: "uploading", progress: 0, message: "" });

  //   const interval = setInterval(() => {
  //     setUploadState((prev) => {
  //       const nextProgress = prev.progress + 10;
  //       if (nextProgress >= 100) {
  //         clearInterval(interval);
  //         setTimeout(
  //           () =>
  //             setUploadState({ status: "success", progress: 100, message: "" }),
  //           1000,
  //         );
  //         return { ...prev, status: "processing", progress: 100 };
  //       }
  //       return { ...prev, progress: nextProgress };
  //     });
  //   }, 300);
  // };

  const handleSubmit = async () => {
    if (!videoFile) return;

    setUploadState({ status: "uploading", progress: 0, message: "" });

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("caption", form.caption);

      const response = await fetch("/api/reels", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message ?? "Upload failed");
      }

      setUploadState({ status: "success", progress: 100, message: "" });
    } catch (err) {
      setUploadState({
        status: "error",
        progress: 0,
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  return (
    <main className="min-h-screen bg-background p-6 md:px-16">
      <header className="max-w-6xl mx-auto mb-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xl text-primary-foreground">
          🎞
        </div>

        <div>
          <h1 className="text-2xl font-extrabold tracking-tighter">
            Create Reel
          </h1>
          <p className="text-sm text-muted-foreground">
            Share a moment with the world
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr,420px] gap-6">
        <section>
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-5">
            {!videoFile ? (
              <UploadZone
                onFileSelect={handleFileSelect}
                error={fileError || undefined}
              />
            ) : (
              <VideoPreview
                src={videoSrc!}
                file={videoFile}
                onRemove={handleRemove}
              />
            )}

            {videoFile && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <span className="text-lg">🎬</span>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold truncate">
                    {videoFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(videoFile.size / 1024 / 1024).toFixed(1)} MB ·
                    {videoFile.type.split("/")[1].toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={handleRemove}
                  className="text-destructive text-xs font-semibold px-3 py-1.5 border border-border rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="bg-card border border-border rounded-3xl p-6">
            <MetadataForm
              form={form}
              onChange={setForm}
              videoSrc={videoSrc}
              onSubmit={handleSubmit}
              uploadState={uploadState}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
