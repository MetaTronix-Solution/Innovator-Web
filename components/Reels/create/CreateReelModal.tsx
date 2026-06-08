// "use client";

// import { useState } from "react";
// import { X } from "lucide-react";
// import MetadataForm, { ReelForm } from "@/components/Reels/create/MetadataForm";
// import UploadZone from "@/components/Reels/create/UploadZone";
// import VideoPreview from "@/components/Reels/create/VideoPreview";
// import { useRouter } from "next/navigation";

// const MAX_FILE_SIZE_MB = 500;
// const ACCEPTED_TYPES = ["video/mp4", "video/quicktime"];

// interface CreateReelModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function CreateReelModal({
//   isOpen,
//   onClose,
// }: CreateReelModalProps) {
//   const router = useRouter();

//   const [videoFile, setVideoFile] = useState<File | null>(null);
//   const [videoSrc, setVideoSrc] = useState<string | null>(null);
//   const [fileError, setFileError] = useState<string | null>(null);

//   const [uploadState, setUploadState] = useState({
//     status: "idle" as "idle" | "uploading" | "processing" | "success" | "error",
//     progress: 0,
//     message: "",
//   });

//   const [form, setForm] = useState<ReelForm>({
//     caption: "",
//     hashtags: [],
//     thumbnail: null,
//     privacy: "public",
//   });

//   const handleFileSelect = (file: File) => {
//     setFileError(null);
//     if (!ACCEPTED_TYPES.includes(file.type)) {
//       setFileError("Only MP4 and MOV files are supported.");
//       return;
//     }
//     if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
//       setFileError(`File must be under ${MAX_FILE_SIZE_MB} MB.`);
//       return;
//     }
//     setVideoFile(file);
//     setVideoSrc(URL.createObjectURL(file));
//   };

//   const handleRemove = () => {
//     if (videoSrc) URL.revokeObjectURL(videoSrc);
//     setVideoFile(null);
//     setVideoSrc(null);
//     setForm((f) => ({ ...f, thumbnail: null }));
//   };

//   const handleClose = () => {
//     handleRemove();
//     setUploadState({ status: "idle", progress: 0, message: "" });
//     onClose();
//   };

//   const handleSubmit = async () => {
//     if (!videoFile) return;
//     setUploadState({ status: "uploading", progress: 0, message: "" });
//     try {
//       const formData = new FormData();
//       formData.append("video", videoFile);
//       formData.append("caption", form.caption);

//       const response = await fetch("/api/reels", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message ?? "Upload failed");
//       }

//       setUploadState({ status: "success", progress: 100, message: "" });
//       setTimeout(() => {
//         handleClose();
//         router.push("/reels");
//         router.refresh();
//       }, 1000);
//     } catch (err) {
//       setUploadState({
//         status: "error",
//         progress: 0,
//         message: err instanceof Error ? err.message : "Something went wrong",
//       });
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-black/70 backdrop-blur-sm"
//         onClick={handleClose}
//       />

//       <div className="relative w-full max-w-4xl max-h-[90vh] bg-background rounded-3xl shadow-2xl overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-lg text-primary-foreground">
//               🎞
//             </div>
//             <div>
//               <h2 className="text-lg font-extrabold tracking-tight">
//                 Create Reel
//               </h2>
//               <p className="text-xs text-muted-foreground">
//                 Share a moment with the world
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={handleClose}
//             className="p-2 rounded-full hover:bg-accent transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
//           <div className="md:w-1/3 border-r border-border p-2 flex flex-col gap-2 overflow-y-auto">
//             <div className="bg-card border border-border rounded-2xl p-2 flex flex-col gap-4 h-fit">
//               <UploadZone
//                 onFileSelect={handleFileSelect}
//                 error={fileError || undefined}
//               />

//               {videoFile && (
//                 <div className="flex items-center gap-2 p-2 bg-muted rounded-xl mt-auto">
//                   <span className="text-md">🎬</span>
//                   <div className="flex-1 overflow-hidden">
//                     <p className="text-sm font-semibold truncate">
//                       {videoFile.name}
//                     </p>
//                     <p className="text-xs text-muted-foreground">
//                       {(videoFile.size / 1024 / 1024).toFixed(1)} MB ·{" "}
//                       {videoFile.type.split("/")[1].toUpperCase()}
//                     </p>
//                   </div>
//                   <button
//                     onClick={handleRemove}
//                     className="text-destructive text-xs font-semibold px-3 py-1.5 border border-border rounded-lg hover:bg-destructive/10 transition-colors shrink-0"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* RIGHT — Preview + form */}
//           <div className="md:w-2/3 p-4 flex flex-col gap-4 overflow-y-auto">
//             {videoSrc ? (
//               <>
//                 <VideoPreview
//                   src={videoSrc}
//                   file={videoFile!}
//                   onRemove={handleRemove}
//                 />
//                 <div className="bg-card border border-border rounded-2xl p-5">
//                   <MetadataForm
//                     form={form}
//                     onChange={setForm}
//                     videoSrc={videoSrc}
//                     onSubmit={handleSubmit}
//                     uploadState={uploadState}
//                   />
//                 </div>
//               </>
//             ) : (
//               <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-muted-foreground">
//                 <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">
//                   🎥
//                 </div>
//                 <p className="text-sm font-medium">
//                   Upload a video to see the preview
//                 </p>
//                 <p className="text-xs">
//                   Supported formats: MP4, MOV · Max 500MB
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import MetadataForm, { ReelForm } from "@/components/Reels/create/MetadataForm";
import UploadZone from "@/components/Reels/create/UploadZone";
import VideoPreview from "@/components/Reels/create/VideoPreview";
import MobileReelCreator from "@/components/Reels/create/MobileReelCreator";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const MAX_FILE_SIZE_MB = 500;
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime"];

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateReelModal({
  isOpen,
  onClose,
}: CreateReelModalProps) {
  const router = useRouter();
  const isMobile = useIsMobile();

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

  const handleClose = () => {
    handleRemove();
    setUploadState({ status: "idle", progress: 0, message: "" });
    onClose();
  };

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
      setTimeout(() => {
        handleClose();
        router.push("/reels");
        router.refresh();
      }, 1000);
    } catch (err) {
      setUploadState({
        status: "error",
        progress: 0,
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  if (!isOpen) return null;

  // ── Mobile: full-screen native-style creator ──────────────────
  if (isMobile) {
    return (
      <MobileReelCreator
        onClose={handleClose}
        onFileSelect={handleFileSelect}
        onSubmit={handleSubmit}
        videoFile={videoFile}
        videoSrc={videoSrc}
        onRemove={handleRemove}
        uploadState={uploadState}
        form={form}
        onFormChange={setForm}
        fileError={fileError}
      />
    );
  }

  // ── Desktop: existing modal (unchanged) ───────────────────────
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-background rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-lg text-primary-foreground">
              🎞
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Create Reel
              </h2>
              <p className="text-xs text-muted-foreground">
                Share a moment with the world
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="md:w-1/3 border-r border-border p-2 flex flex-col gap-2 overflow-y-auto">
            <div className="bg-card border border-border rounded-2xl p-2 flex flex-col gap-4 h-fit">
              <UploadZone
                onFileSelect={handleFileSelect}
                error={fileError || undefined}
              />
              {videoFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-xl mt-auto">
                  <span className="text-md">🎬</span>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold truncate">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(videoFile.size / 1024 / 1024).toFixed(1)} MB ·{" "}
                      {videoFile.type.split("/")[1].toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={handleRemove}
                    className="text-destructive text-xs font-semibold px-3 py-1.5 border border-border rounded-lg hover:bg-destructive/10 transition-colors shrink-0"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="md:w-2/3 p-4 flex flex-col gap-4 overflow-y-auto">
            {videoSrc ? (
              <>
                <VideoPreview
                  src={videoSrc}
                  file={videoFile!}
                  onRemove={handleRemove}
                />
                <div className="bg-card border border-border rounded-2xl p-5">
                  <MetadataForm
                    form={form}
                    onChange={setForm}
                    videoSrc={videoSrc}
                    onSubmit={handleSubmit}
                    uploadState={uploadState}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">
                  🎥
                </div>
                <p className="text-sm font-medium">
                  Upload a video to see the preview
                </p>
                <p className="text-xs">
                  Supported formats: MP4, MOV · Max 500MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
