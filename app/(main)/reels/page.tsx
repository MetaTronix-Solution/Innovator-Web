"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setReels } from "@/lib/store/features/reelsSlice";
import { RootState } from "@/lib/store/store";
import ReelCard from "@/components/Reels/ReelCard";

export default function ReelsPage() {
  const dispatch = useDispatch();
  const reels = useSelector((state: RootState) => state.reels.items);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadingRef = useRef(false);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const desktopContainerRef = useRef<HTMLDivElement>(null); // ← added
  const mobileObserverTarget = useRef<HTMLDivElement>(null);
  const desktopObserverTarget = useRef<HTMLDivElement>(null);

  const fetchReels = useCallback(
    async (cursor: string | null = null) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      try {
        const url = cursor
          ? `/api/reels?cursor=${encodeURIComponent(cursor)}`
          : "/api/reels";

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.results) {
          console.error("API error:", res.status, data);
          return;
        }

        dispatch(
          setReels({
            results: data.results,
            next_cursor: cursor,
            has_next: !!data.next,
          }),
        );

        if (data.next) {
          try {
            const parsed = new URL(data.next);
            const cursorParam = parsed.searchParams.get("cursor") ?? data.next;
            setNextCursor(cursorParam);
          } catch {
            setNextCursor(data.next);
          }
        } else {
          setNextCursor(null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        loadingRef.current = false;
        setInitialLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // Shared observer factory
  const createObserver = useCallback(
    (container: HTMLDivElement | null, sentinel: HTMLDivElement | null) => {
      if (!container || !sentinel) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && nextCursor && !loadingRef.current) {
            fetchReels(nextCursor);
          }
        },
        { root: container, threshold: 0, rootMargin: "200px" },
      );

      observer.observe(sentinel);
      return observer;
    },
    [nextCursor, fetchReels],
  );

  useEffect(() => {
    const observer = createObserver(
      mobileContainerRef.current,
      mobileObserverTarget.current,
    );
    return () => observer?.disconnect();
  }, [createObserver]);

  useEffect(() => {
    const observer = createObserver(
      desktopContainerRef.current,
      desktopObserverTarget.current,
    );
    return () => observer?.disconnect();
  }, [createObserver]);

  if (initialLoading) {
    return (
      <div className="h-[calc(100dvh-40px)] md:h-[calc(100vh-64px)] bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          body { overflow: hidden; }
        }
      `}</style>

      {/* ── Mobile ── */}
      <div className="md:hidden fixed inset-0 top-0 bottom-[64px] z-30 bg-black overflow-hidden">
        <div
          ref={mobileContainerRef}
          onScroll={(e) => {
            window.dispatchEvent(
              new CustomEvent("app:scroll", {
                detail: { scrollY: e.currentTarget.scrollTop },
              }),
            );
          }}
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reels.map((reel) => (
            <section
              key={reel.id}
              className="w-full h-full snap-start snap-always relative"
            >
              <ReelCard reel={reel} />
            </section>
          ))}
          <div ref={mobileObserverTarget} className="h-20 w-full shrink-0" />
        </div>
      </div>

      <main className="hidden md:flex h-[calc(100vh-64px)] w-full justify-center overflow-hidden">
        <div
          ref={desktopContainerRef}
          className="h-full w-full max-w-[500px] overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reels.map((reel) => (
            <section
              key={reel.id}
              className="w-full h-full snap-start snap-always md:py-2 relative"
            >
              <ReelCard reel={reel} />
            </section>
          ))}
          <div ref={desktopObserverTarget} className="h-20 w-full shrink-0" />
        </div>
      </main>
    </>
  );
}
