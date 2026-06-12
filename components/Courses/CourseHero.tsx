import React, { useState, useRef } from "react";
import Image from "next/image";
import { PlayCircle, Play, BookOpen } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { Content, Course } from "@/types/course";
import { isVideo } from "@/lib/utils/course";
import { PreviewPlayer } from "./PreviewPlayer";

export function CourseHero({
  course,
  isEnrolled,
  activeLesson,
  onClearLesson,
}: {
  course: Course;
  isEnrolled: boolean;
  activeLesson: Content | null;
  onClearLesson: () => void;
}) {
  const previewVideo = course.contents.find((c) => c.is_preview && isVideo(c));
  const [showPreview, setShowPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(
    null,
  ) as React.RefObject<HTMLVideoElement>;

  const handleWatchPreview = () => {
    setShowPreview(true);
    setTimeout(() => {
      videoRef.current?.play();
    }, 50);
  };

  if (activeLesson) {
    return (
      <div className="w-full">
        <PreviewPlayer content={activeLesson} />
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-border">
          <PlayCircle size={13} className="text-primary flex-shrink-0" />
          <p className="text-xs font-medium text-primary truncate flex-1">
            Now playing: {activeLesson.title}
          </p>
          <button
            onClick={onClearLesson}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        {previewVideo && (
          <div className={showPreview ? "block w-full h-full" : "hidden"}>
            <PreviewPlayer content={previewVideo} videoRef={videoRef} />
          </div>
        )}

        {!showPreview && (
          <>
            {course.thumbnail ? (
              <Image
                src={getMediaUrl(course.thumbnail) || ""}
                alt={course.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900">
                <BookOpen
                  size={40}
                  className="text-orange-300 dark:text-zinc-600"
                />
                <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">
                  {course.title}
                </p>
              </div>
            )}
            {previewVideo && (
              <button
                onClick={handleWatchPreview}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 hover:bg-black/40 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-white/90 group-hover:scale-105 transition-transform flex items-center justify-center shadow-lg">
                  <Play size={22} className="text-primary ml-0.5" />
                </div>
                <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                  Watch Preview
                </span>
              </button>
            )}
          </>
        )}
      </div>

      {showPreview && previewVideo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100">
          <PlayCircle size={14} className="text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            Preview: {previewVideo.title}
          </p>
          <button
            onClick={() => setShowPreview(false)}
            className="ml-auto text-xs text-amber-600 underline"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
