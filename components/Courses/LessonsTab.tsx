import React from "react";
import { PlayCircle, Lock, Clock, Play, Pause } from "lucide-react";
import { Content } from "@/types/course";
import { formatDuration, isVideo } from "@/lib/utils/course";

export function LessonsTab({
  contents,
  isEnrolled,
  onSelectLesson,
  activeLesson,
}: any) {
  const videos = contents;
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <PlayCircle size={24} className="text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-foreground">
          No lessons available
        </p>
      </div>
    );
  }

  const canPlay = (lesson: Content) =>
    (isEnrolled || lesson.is_preview) && isVideo(lesson);

  return (
    <div className="divide-y divide-border">
      {videos.map((lesson: Content) => {
        const playable = canPlay(lesson);
        const isActive = activeLesson?.id === lesson.id;
        return (
          <div
            key={lesson.id}
            onClick={() => playable && onSelectLesson(isActive ? null : lesson)}
            className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${playable ? "cursor-pointer hover:bg-muted/50 active:bg-muted" : "opacity-50 cursor-not-allowed"} ${isActive ? "bg-primary/5" : ""}`}
          >
            <div
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? "bg-primary" : "bg-primary/10"}`}
            >
              {playable ? (
                <PlayCircle
                  size={18}
                  className={
                    isActive ? "text-primary-foreground" : "text-primary"
                  }
                />
              ) : (
                <Lock size={15} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {lesson.order}. {lesson.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {!isVideo(lesson) && (
                  <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                )}
                {lesson.duration > 0 && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDuration(lesson.duration)}
                  </span>
                )}
                {lesson.course_level && (
                  <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                    {lesson.course_level}
                  </span>
                )}
                {lesson.is_preview && (
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                    Preview
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              {!isVideo(lesson) ? (
                <Clock size={14} className="text-muted-foreground/40" />
              ) : playable ? (
                isActive ? (
                  <Pause size={15} className="text-primary" />
                ) : (
                  <Play size={15} className="text-muted-foreground" />
                )
              ) : (
                <Lock size={14} className="text-muted-foreground/50" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
