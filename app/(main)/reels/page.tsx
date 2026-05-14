"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ReelCard from "@/components/Reels/ReelCard";

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadingRef = useRef(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchReels = useCallback(async (cursor: string | null = null) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const url = cursor
        ? `/api/reels?cursor=${encodeURIComponent(cursor)}`
        : "/api/reels";
      const res = await fetch(url);
      const data = await res.json();
      setReels((prev) => (cursor ? [...prev, ...data.results] : data.results));
      setNextCursor(data.next ?? null);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      loadingRef.current = false;
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  useEffect(() => {
    const el = observerTarget.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && nextCursor) fetchReels(nextCursor);
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nextCursor, fetchReels]);

  if (initialLoading) {
    return (
      <div className="h-[calc(100vh-64px)] bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="h-[calc(100vh-64px)] w-full flex justify-center overflow-hidden">
      <div
        ref={containerRef}
        className="h-full w-full max-w-[500px] overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reels.map((reel) => (
          <section
            key={reel.id}
            className="w-full h-[calc(100vh-64px)] snap-start flex items-center justify-center py-4"
          >
            <ReelCard reel={reel} />
          </section>
        ))}
        <div ref={observerTarget} className="h-4 shrink-0" />
      </div>
    </main>
  );
}
