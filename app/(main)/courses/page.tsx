"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Bell } from "lucide-react";
import { NotificationsPanel } from "@/components/Courses/NotificationPanel";
import { CourseCard } from "@/components/Courses/CourseCard";

interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string | null;
  duration: string;
  lessons_count: number;
  rating: number;
  enrolled_count?: number;
  category?: string;
  category_name?: string;
  level?: string;
  description?: string;
  price?: number | string;
  is_enrolled?: boolean;
}

interface CourseCache {
  courses: Course[];
  timestamp: number;
  hasMore: boolean;
}

const LIMIT = 10;
const CACHE_KEY = "courses_cache";
const CACHE_TTL = 5 * 60 * 1000;

const readCache = (): CourseCache | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CourseCache;
  } catch {
    return null;
  }
};

const writeCache = (data: CourseCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
};

const isCacheFresh = (cache: CourseCache | null): boolean => {
  if (!cache || !cache.courses?.length) return false;
  return Date.now() - cache.timestamp < CACHE_TTL;
};

const getCategoryName = (course: Course): string =>
  (course as any).category_name ??
  (typeof course.category === "object"
    ? ((course.category as any)?.name ?? "")
    : (course.category ?? ""));

const extractCategories = (courses: Course[]): string[] =>
  Array.from(new Set(courses.map(getCategoryName).filter(Boolean))).sort();

function SkeletonCard() {
  return (
    <div className="rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden animate-pulse">
      <div className="aspect-video bg-zinc-100 dark:bg-zinc-800" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/4" />
        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
        <div className="flex gap-3">
          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-16" />
          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-20" />
        </div>
        <div className="flex justify-between pt-1">
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-10" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export default function CoursePage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [notifOpen, setNotifOpen] = useState(false);

  const categories = extractCategories(courses);

  const hasMoreRef = useRef(hasMore);
  const loadingMoreRef = useRef(loadingMore);
  const pageRef = useRef(page);
  const initialFetchDone = useRef(false);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;

    const bootstrap = async () => {
      const cache = readCache();

      // Show cached data immediately while we revalidate
      if (cache?.courses?.length) {
        setCourses(cache.courses);
        setHasMore(cache.hasMore ?? false);
        setPage(2);
        setBootstrapping(false);
      }

      const shouldRefetch = !isCacheFresh(cache);

      try {
        if (shouldRefetch) {
          const res = await fetch(`/api/courses?page=1&limit=${LIMIT}`);
          if (!res.ok) throw new Error("Could not fetch courses.");
          const json = await res.json();
          const freshCourses: Course[] = json.results ?? json ?? [];
          const freshHasMore: boolean = json.hasMore ?? false;

          setCourses(freshCourses);
          setHasMore(freshHasMore);
          setPage(2);

          writeCache({
            courses: freshCourses,
            hasMore: freshHasMore,
            timestamp: Date.now(),
          });
        }
      } catch (err: any) {
        if (!cache?.courses?.length) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        setBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (activeCategory !== "All" && !categories.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [categories, activeCategory]);

  const fetchMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/courses?page=${pageRef.current}&limit=${LIMIT}`,
      );
      if (!res.ok) return;
      const json = await res.json();
      const newCourses: Course[] = json.results ?? json ?? [];
      setCourses((prev) => {
        const merged = [...prev, ...newCourses];
        const cache = readCache();
        if (cache) {
          writeCache({
            ...cache,
            courses: merged,
            hasMore: json.hasMore ?? false,
          });
        }
        return merged;
      });
      setHasMore(json.hasMore ?? false);
      setPage(pageRef.current + 1);
    } catch (err) {
      console.error("Failed to fetch more courses:", err);
    } finally {
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchMore();
      },
      { threshold: 0.1 },
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [fetchMore]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchQuery.toLowerCase());

    const courseCat = getCategoryName(course);
    const matchesCategory =
      activeCategory === "All" ||
      courseCat.toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  if (error) {
    return (
      <div className="p-20 text-center text-destructive text-sm">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-1 md:py-2 bg-background font-sans min-h-screen">
      <div className="flex items-center gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses or instructors..."
            className="w-full bg-card border border-border/70 rounded-full py-3 pl-11 pr-4 text-sm focus:border-orange-500/60 shadow-sm transition-all outline-none"
          />
        </div>
        <button
          onClick={() => setNotifOpen(true)}
          className="p-3 bg-card border border-border/70 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell size={17} />
        </button>
      </div>

      {categories.length > 0 && (
        <div className="flex items-center gap-2 mb-7 overflow-x-auto pb-1 no-scrollbar">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:border-orange-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {bootstrapping ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <BookOpen
            size={32}
            className="mx-auto text-muted-foreground/40 mb-3"
          />
          <p className="text-muted-foreground text-sm font-medium">
            No courses found.
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-orange-500 font-bold"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-15">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => router.push(`/courses/${course.id}`)}
            />
          ))}
        </div>
      )}

      {loadingMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />

      <NotificationsPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </div>
  );
}
