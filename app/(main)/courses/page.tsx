"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Clock,
  Star,
  ChevronRight,
  Play,
  Users,
  Bell,
} from "lucide-react";

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
  level?: string;
  description?: string;
  price?: number | string;
  is_enrolled?: boolean;
}

interface Category {
  id: string | number;
  name: string;
  slug?: string;
}

interface CourseCache {
  courses: Course[];
  timestamp: number;
  hasMore: boolean;
  categories: string[];
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

function CourseCard({
  course,
  onClick,
}: {
  course: Course;
  onClick: () => void;
}) {
  const level = course.level || "Beginner";
  const levelColor =
    level === "Beginner"
      ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
      : level === "Intermediate"
        ? "text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400"
        : "text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400";

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden cursor-pointer
                 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.10)]
                 hover:-translate-y-1.5 transition-all duration-300"
    >
      <div className="relative aspect-video bg-gradient-to-br from-orange-100 to-amber-50 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen
              size={40}
              className="text-orange-300 dark:text-zinc-600"
            />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Play
              size={18}
              className="text-orange-600 ml-0.5"
              fill="currentColor"
            />
          </div>
        </div>
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${levelColor}`}
        >
          {level}
        </span>
        {course.is_enrolled && (
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-500 text-white">
            Enrolled
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1.5">
          {typeof course.category === "object"
            ? (course.category as any)?.name
            : ((course as any).category_name ?? course.category ?? "Course")}
        </p>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug mb-3">
          {course.title}
        </h3>

        {/* <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-orange-600 dark:text-orange-400 shrink-0">
            {course.instructor?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {course.instructor}
          </span>
        </div> */}

        <div className="flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500 mb-4">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={11} />
            {course.lessons_count} lessons
          </span>
          {course.enrolled_count != null && (
            <span className="flex items-center gap-1">
              <Users size={11} />
              {course.enrolled_count.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {Number(course.rating || 0).toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 group-hover:gap-2.5 transition-all">
            {course.price != null && Number(course.price) > 0
              ? `Rs ${Number(course.price).toLocaleString()}`
              : "Free"}
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [categories, setCategories] = useState<string[]>([]);

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

      if (cache?.courses?.length) {
        setCourses(cache.courses);
        setHasMore(cache.hasMore ?? false);
        setPage(2);
        if (cache.categories?.length) setCategories(cache.categories);
        setBootstrapping(false);
      }

      const shouldRefetch = !isCacheFresh(cache);

      try {
        const [coursesJson, categoriesJson] = await Promise.all([
          shouldRefetch
            ? fetch(`/api/courses?page=1&limit=${LIMIT}`).then((res) => {
                if (!res.ok) throw new Error("Could not fetch courses.");
                return res.json();
              })
            : Promise.resolve(null),
          fetch("/api/courses/categories").then((res) =>
            res.ok ? res.json() : Promise.resolve([]),
          ),
        ]);

        const parsedCategories: string[] = Array.isArray(categoriesJson)
          ? categoriesJson
              .map((c: any) =>
                typeof c === "string"
                  ? c
                  : (c.name ?? c.title ?? c.category_name ?? ""),
              )
              .filter(Boolean)
          : [];

        if (parsedCategories.length) setCategories(parsedCategories);

        let freshCourses = cache?.courses ?? [];

        if (coursesJson) {
          freshCourses = coursesJson.results ?? coursesJson ?? [];
          setCourses(freshCourses);
          setHasMore(coursesJson.hasMore ?? false);
          setPage(2);
        }

        writeCache({
          courses: freshCourses,
          hasMore: coursesJson?.hasMore ?? cache?.hasMore ?? false,
          timestamp: Date.now(),
          categories: parsedCategories.length
            ? parsedCategories
            : (cache?.categories ?? []),
        });
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

    const courseCategoryName =
      typeof course.category === "object"
        ? ((course.category as any)?.name ?? "")
        : ((course as any).category_name ??
          (course as any).category_details?.name ??
          course.category ??
          "");

    const matchesCategory =
      activeCategory === "All" ||
      courseCategoryName.toLowerCase() === activeCategory.toLowerCase();

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
    <div className="w-full max-w-5xl mx-auto px-4 py-6 bg-background font-sans min-h-screen">
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
        <button className="p-3 bg-card border border-border/70 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
    </div>
  );
}
