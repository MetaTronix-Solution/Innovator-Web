"use client";

import { formatDuration, isDoc, isVideo } from "@/lib/utils/course";
import { Course } from "@/types/course";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";

interface AboutTabProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: () => void;
  setIsEnrolled: (value: boolean) => void;
}

export function AboutTab({ course, isEnrolled, setIsEnrolled }: AboutTabProps) {
  const [loading, setLoading] = useState(false);

  const totalDuration = course.contents.reduce(
    (sum, c) => sum + (c.duration || 0),
    0,
  );
  const videoCount = course.contents.filter(isVideo).length;
  const docCount = course.contents.filter(isDoc).length;

  const isFreeCourse =
    course.course_type === "free" || Number(course.price) === 0;

  const handleEnrollClick = async () => {
    setLoading(true);

    if (!isFreeCourse) {
      try {
        const res = await fetch("/api/courses/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ course_id: course.id }),
        });

        const data = await res.json();
        console.log(data);

        if (res.ok && data.payment_url) {
          window.location.href = data.payment_url;
        } else {
          alert("Error: " + (data.detail || "Payment initiation failed"));
          setLoading(false);
        }
      } catch (err) {
        console.error("Network error:", err);
        alert("Could not connect to payment gateway.");
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch("/api/courses/enroll/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: course.id }),
      });

      const data = await res.json();

      if (
        res.ok ||
        data.detail === "You are already enrolled in this course."
      ) {
        setIsEnrolled(true);
      } else {
        alert("Error: " + (data.detail || "Failed to enroll"));
      }
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-1 py-2 md:px-4 md:py-4 space-y-5">
      {!isEnrolled ? (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
          <h3 className="text-sm font-bold text-primary mb-1">
            {isFreeCourse ? "Ready to start?" : "Unlock this course"}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {isFreeCourse
              ? "Enroll now to get full access to all lessons."
              : "Complete the payment to get full access to all lessons."}
          </p>
          <button
            onClick={handleEnrollClick}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isFreeCourse ? (
              "Enroll for Free"
            ) : (
              `Buy for RS${course.price}`
            )}
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-green-900">Enrolled</h3>
            <p className="text-xs text-green-700">
              You have full access to this course.
            </p>
          </div>
        </div>
      )}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
          About
        </h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          {course.description}
        </p>
      </div>
      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Instructor",
            value: course.contents[0]?.instructor_name ?? course.vendor_name,
          },
          { label: "Category", value: course.category_name },
          { label: "Videos", value: `${videoCount}` },
          { label: "Documents", value: `${docCount}` },
          {
            label: "Total Duration",
            value: totalDuration > 0 ? formatDuration(totalDuration) : "—",
          },
          {
            label: "Price",
            value: course.course_type === "free" ? "Free" : `RS${course.price}`,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-2xl border border-border bg-card"
          >
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">
              {item.label}
            </p>
            <p className="text-sm font-semibold mt-1 truncate">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
