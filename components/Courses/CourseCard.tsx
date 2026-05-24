"use client";

import React from "react";
import Image from "next/image";
import { Clock, Star, ArrowRight } from "lucide-react";

interface Course {
  id: string | number;
  title: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  lessonsCount: number;
  rating: number;
}

interface CourseCardProps {
  course: Course;
  onClick: (id: string | number) => void;
}

const CourseCard = ({ course, onClick }: CourseCardProps) => {
  return (
    <article
      onClick={() => onClick(course.id)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-within:ring-2 focus-within:ring-orange-500"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
            {course.lessonsCount} Lessons
          </span>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={14} fill="currentColor" />
            <span className="text-xs font-bold text-neutral-700">
              {course.rating}
            </span>
          </div>
        </div>

        <h3 className="mb-1 text-lg font-bold leading-tight text-neutral-900 group-hover:text-orange-600 transition-colors">
          {course.title}
        </h3>
        <p className="mb-4 text-sm text-neutral-500">by {course.instructor}</p>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Clock size={14} />
            <span>{course.duration}</span>
          </div>

          <button
            className="flex items-center gap-1 text-sm font-bold text-neutral-900 transition-transform group-hover:translate-x-1"
            aria-label={`View details for ${course.title}`}
          >
            Details <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;
