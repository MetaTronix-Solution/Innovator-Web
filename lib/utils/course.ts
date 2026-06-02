import { Content } from "@/types/course";

export const isVideo = (c: Content) => !!c.video_url || !!c.video_file;

export const isDoc = (c: Content) => !!c.document_url || !!c.document_file;

export function formatDuration(minutes: number): string {
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
