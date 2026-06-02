"use client";

import React from "react";
import Image from "next/image";
import { BookOpen, Lock, Play } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

interface Course {
  id: string;
  title: string;
  thumbnail: string | null;
  price?: number | string;
  category?: any;
  category_name?: string;
  is_enrolled?: boolean;
  [key: string]: any;
}

const getCategoryName = (course: Course): string =>
  (course as any).category_name ??
  (typeof course.category === "object"
    ? ((course.category as any)?.name ?? "")
    : (course.category ?? ""));

export function CourseCard({
  course,
  onClick,
}: {
  course: Course;
  onClick: () => void;
}) {
  const isFree = !course.price || Number(course.price) === 0;
  const categoryLabel = getCategoryName(course);

  const isEnrolled = course.is_enrolled;

  return (
    <div
      onClick={onClick}
      className="group bg-card rounded-md border border-border overflow-hidden cursor-pointer
               hover:-translate-y-1.5 hover:border-primary hover:ring-2 hover:ring-primary/50
               transition-all duration-300 flex flex-col"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />

      <div className="relative aspect-video overflow-hidden">
        {course.thumbnail ? (
          <Image
            src={getMediaUrl(course.thumbnail) || ""}
            alt={course.title}
            fill
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen
              size={40}
              className="text-orange-300 dark:text-zinc-600"
            />
          </div>
        )}

        {isFree && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500 text-white shadow-sm">
            {isEnrolled ? "Free" : "Continue"}
          </span>
        )}

        {!isFree && (
          <span className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
            <Lock size={11} className="text-white" />
          </span>
        )}
      </div>

      <div className="p-2 flex flex-col flex-1 min-h-[100px]">
        {categoryLabel && (
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">
            {categoryLabel}
          </p>
        )}
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2 leading-snug mb-auto">
          {course.title}
        </h3>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
          <span className="text-xs font-bold text-foreground">
            {isEnrolled
              ? "Continue Learning"
              : isFree
                ? "Free"
                : `Rs ${Number(course.price).toLocaleString()}`}
          </span>
          <div className="w-7 h-7 rounded-full bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-colors duration-300">
            <Play
              size={13}
              className="text-primary group-hover:text-primary-foreground ml-0.5 transition-colors duration-300"
              fill="currentColor"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
