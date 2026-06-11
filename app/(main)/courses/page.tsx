"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, BookOpenText } from "lucide-react";
import { NotificationsPanel } from "@/components/Courses/NotificationPanel";
import { CourseCard } from "@/components/Courses/CourseCard";
import useDebounce from "@/lib/hooks/useDebounce";
import useLocalCache from "@/lib/hooks/useLocalCache";
import useInfiniteScroll from "@/lib/hooks/useInfiniteScroll";
import { Course } from "@/types/course";

interface CourseCacheData {
  courses: Course[];
  hasMore: boolean;
}

const LIMIT = 10;

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
  const [unreadCount, setUnreadCount] = useState(0);

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

  const debouncedSearch = useDebounce(searchQuery, 500);
  const cache = useLocalCache<CourseCacheData>("courses_cache", 5 * 60 * 1000);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/courses/notifications");
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setUnreadCount(list.filter((n: any) => !n.is_read).length);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (notifOpen) setUnreadCount(0);
    else fetchUnreadCount();
  }, [notifOpen, fetchUnreadCount]);

  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;

    const bootstrap = async () => {
      const cached = cache.read();

      if (cached?.courses?.length) {
        setCourses(cached.courses);
        setHasMore(cached.hasMore ?? false);
        setPage(2);
        setBootstrapping(false);
      }

      const shouldRefetch = !cache.isFresh() || !cached?.courses?.length;

      try {
        if (shouldRefetch) {
          const res = await fetch(`/api/courses?page=1&limit=${LIMIT}`);
          if (!res.ok) throw new Error("Could not fetch courses.");
          const data = await res.json();
          const freshCourses: Course[] = data.results ?? data ?? [];
          const freshHasMore: boolean = data.hasMore ?? false;

          setCourses(freshCourses);
          setHasMore(freshHasMore);
          setPage(2);
          cache.write({ courses: freshCourses, hasMore: freshHasMore });
        }
      } catch (err: any) {
        if (!cached?.courses?.length) {
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
      const newHasMore: boolean = json.hasMore ?? false;

      setCourses((prev) => {
        const merged = [...prev, ...newCourses];
        const cached = cache.read();
        if (cached) cache.write({ courses: merged, hasMore: newHasMore });
        return merged;
      });

      setHasMore(newHasMore);
      setPage(pageRef.current + 1);
    } catch (err) {
      console.error("Failed to fetch more courses:", err);
    } finally {
      setLoadingMore(false);
    }
  }, []);

  const sentinelRef = useInfiniteScroll(fetchMore);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        course.instructor
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase());

      const courseCat = getCategoryName(course);
      const matchesCategory =
        activeCategory === "All" ||
        courseCat.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [courses, debouncedSearch, activeCategory]);

  if (error) {
    return (
      <div className="p-20 text-center text-destructive text-sm">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 py-1 md:py-2 bg-background font-sans min-h-screen">
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
          className="relative p-3 bg-card border border-border/70 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-orange-500 text-white text-[10px] font-bold rounded-full px-1 leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
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
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl space-y-3">
          <div className="p-4 rounded-full bg-muted">
            <BookOpenText className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold text-md">
            No courses found
          </p>
          <p className="text-muted-foreground text-sm text-center max-w-[200px]">
            {debouncedSearch
              ? `No results for "${debouncedSearch}". Try a different title or instructor.`
              : "No courses available in this category yet."}
          </p>
          {debouncedSearch && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-orange-500 font-semibold hover:underline"
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
