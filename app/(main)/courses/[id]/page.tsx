"use client";

import { AboutTab } from "@/components/Courses/AboutTab";
import { CourseHero } from "@/components/Courses/CourseHero";
import { DocsTab } from "@/components/Courses/DocsTab";
import { LessonsTab } from "@/components/Courses/LessonsTab";
import { CourseSkeleton } from "@/components/Courses/CourseSkeleton"; // Create this component
import { Content, Course, Tab } from "@/types/course";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { globalCourseCache } from "@/lib/cache";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("lessons");
  const [activeLesson, setActiveLesson] = useState<Content | null>(null);

  useEffect(() => {
    if (!courseId) return;

    if (globalCourseCache[courseId]) {
      setCourse(globalCourseCache[courseId]);
      setIsReady(true);
      return;
    }

    setIsReady(false);
    const minDelay = new Promise((resolve) => setTimeout(resolve, 1500));

    async function fetchData() {
      try {
        const [courseRes, enrollmentRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`),
          fetch("/api/courses/enroll"),
        ]);

        const courseData = await courseRes.json();
        const enrollments = await enrollmentRes.json();

        globalCourseCache[courseId] = courseData;

        setCourse(courseData);
        setIsEnrolled(enrollments.some((e: any) => e.course === courseData.id));
      } catch (err) {
        console.error("Failed to sync data:", err);
      }
    }

    Promise.all([fetchData(), minDelay]).then(() => {
      setIsReady(true);
    });
  }, [courseId]);

  if (!isReady) return <CourseSkeleton />;

  if (!course)
    return (
      <div className="text-center py-20 text-sm text-muted-foreground">
        Course not found.
      </div>
    );

  const handleEnroll = async () => {
    if (!course) return;

    try {
      const res = await fetch("/api/courses/enroll", {
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
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen bg-background pb-32">
      <CourseHero
        course={course}
        isEnrolled={isEnrolled}
        activeLesson={activeLesson}
        onClearLesson={() => setActiveLesson(null)}
      />

      <div className="px-4 pt-4 pb-1">
        <h1 className="text-lg font-bold text-foreground leading-snug">
          {course.title}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          by <span className="font-medium">{course.vendor_name}</span> ·{" "}
          <span>{course.category_name}</span>
        </p>
      </div>

      <div className="px-4 pb-2 mt-3">
        <div className="flex gap-1 p-1 bg-secondary rounded-2xl border border-border">
          {(["lessons", "docs", "about"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                activeTab === t
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-1">
        {activeTab === "lessons" && (
          <LessonsTab
            contents={course.contents}
            isEnrolled={isEnrolled}
            onSelectLesson={setActiveLesson}
            activeLesson={activeLesson}
          />
        )}
        {activeTab === "docs" && (
          <DocsTab contents={course.contents} isEnrolled={isEnrolled} />
        )}
        {activeTab === "about" && (
          <AboutTab
            course={course}
            isEnrolled={isEnrolled}
            onEnroll={handleEnroll}
            setIsEnrolled={setIsEnrolled}
          />
        )}
      </div>
    </div>
  );
}
