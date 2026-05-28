"use client";

import { FileText, PlayCircle, Lock } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image"; // Added Image import

interface Content {
  id: string;
  title: string;
  video_url: string | null;
  video_file: string | null;
  document_url: string | null;
  document_file: string | null;
  is_preview: boolean;
  duration?: number;
}

interface Course {
  id: string;
  vendor_name: string;
  category_name: string;
  title: string;
  description: string;
  thumbnail: string;
  price: string;
  course_type: "free" | "paid";
  is_published: boolean;
  created_at: string;
  contents: Content[];
}

type Tab = "lessons" | "docs" | "about";

const isVideo = (c: Content) => !!c.video_url || !!c.video_file;
const isDoc = (c: Content) => !!c.document_url || !!c.document_file;

function LessonsTab({
  contents,
  isEnrolled,
}: {
  contents: Content[];
  isEnrolled: boolean;
}) {
  const videos = contents.filter(isVideo);

  return (
    <div className="divide-y divide-border">
      {videos.map((lesson, idx) => (
        <div
          key={lesson.id}
          className={`flex items-center gap-3 px-4 py-3.5 ${!isEnrolled ? "opacity-60" : ""}`}
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            {isEnrolled ? (
              <PlayCircle size={18} className="text-primary" />
            ) : (
              <Lock size={15} className="text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {idx + 1}. {lesson.title}
            </p>
            {!isEnrolled && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Enroll to watch
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function DocsTab({
  contents,
  isEnrolled,
}: {
  contents: Content[];
  isEnrolled: boolean;
}) {
  const docs = contents.filter(isDoc);

  return (
    <div className="px-4 py-3 space-y-2.5">
      {docs.map((doc, idx) => (
        <div
          key={doc.id}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border ${!isEnrolled ? "border-dashed" : "border-solid"} border-border bg-card`}
        >
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            {isEnrolled ? (
              <FileText size={17} className="text-primary" />
            ) : (
              <Lock size={15} className="text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-medium text-foreground">
            {idx + 1}. {doc.title}
          </p>
        </div>
      ))}
    </div>
  );
}

function AboutTab({
  course,
  isEnrolled,
  onEnroll,
}: {
  course: Course;
  isEnrolled: boolean;
  onEnroll: () => void;
}) {
  return (
    <div className="px-4 py-4 space-y-5">
      {!isEnrolled ? (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
          <h3 className="text-sm font-bold text-primary mb-1">
            Ready to start?
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Enroll now to get full access to all lessons and documents.
          </p>
          <button
            onClick={onEnroll}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl transition-all"
          >
            {course.course_type === "free"
              ? "Enroll for Free"
              : `Enroll — $${course.price}`}
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
              <polyline points="20 6 9 17 4 12"></polyline>
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

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Instructor", value: course.vendor_name },
          { label: "Category", value: course.category_name },
          { label: "Lessons", value: `${course.contents.length}` },
          {
            label: "Price",
            value: course.course_type === "free" ? "Free" : `$${course.price}`,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-2xl border border-border bg-card"
          >
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">
              {item.label}{" "}
            </p>
            <p className="text-sm font-semibold mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("lessons");

  useEffect(() => {
    if (!courseId) return;

    async function fetchData() {
      try {
        setLoading(true);

        const courseRes = await fetch(`/api/courses/${courseId}`);
        const courseData = await courseRes.json();
        setCourse(courseData);

        const enrollmentRes = await fetch("/api/courses/enroll");
        const enrollments = await enrollmentRes.json();

        const isAlreadyEnrolled = enrollments.some(
          (enroll: any) => enroll.course === courseData.id,
        );

        setIsEnrolled(isAlreadyEnrolled);
      } catch (err) {
        console.error("Failed to sync enrollment status:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

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
        console.log("Access granted: User is enrolled.");
      } else {
        console.error("Enrollment failed:", data);
        alert("Error: " + (data.detail || "Failed to enroll"));
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!course)
    return <div className="text-center py-20">Course not found.</div>;

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen bg-background pb-32">
      <div className="relative w-full aspect-video bg-muted overflow-hidden">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="px-4 pb-2 mt-4">
        <div className="flex gap-1 p-1 bg-secondary rounded-2xl border border-border">
          {["lessons", "docs", "about"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as Tab)}
              className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                activeTab === t
                  ? "bg-primary text-primary-foreground shadow-sm"
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
          <LessonsTab contents={course.contents} isEnrolled={isEnrolled} />
        )}
        {activeTab === "docs" && (
          <DocsTab contents={course.contents} isEnrolled={isEnrolled} />
        )}
        {activeTab === "about" && (
          <AboutTab
            course={course}
            isEnrolled={isEnrolled}
            onEnroll={handleEnroll}
          />
        )}
      </div>
    </div>
  );
}
