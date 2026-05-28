// "use client";

// import {
//   ArrowLeft,
//   BookOpen,
//   FileText,
//   Info,
//   Clock,
//   PlayCircle,
//   Lock,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import React, { useState } from "react";

// interface Content {
//   id: string;
//   title: string;
//   content_type?: string;
//   duration?: string;
//   is_free?: boolean;
// }

// interface Course {
//   id: string;
//   vendor_name: string;
//   category_name: string;
//   title: string;
//   description: string;
//   thumbnail: string;
//   price: string;
//   course_type: "free" | "paid";
//   is_published: boolean;
//   created_at: string;
//   contents: Content[];
// }

// const MOCK_COURSE: Course = {
//   id: "efa6a9de-8780-4191-9ce5-1bcb5b7f9b4d",
//   vendor_name: "udemyguru7",
//   category_name: "Technology",
//   title: "AWS",
//   description:
//     "This is an AWS course for beginners. You will learn the fundamentals of Amazon Web Services, including EC2, S3, Lambda, RDS, IAM, and much more. By the end of this course you will be confident deploying and managing cloud infrastructure on AWS.",
//   thumbnail:
//     "http://36.253.137.34:8003/media/course_thumbnails/aws-color_zgu3u0Q.png",
//   price: "0.00",
//   course_type: "free",
//   is_published: true,
//   created_at: "2026-05-07T14:51:25.597303+05:45",
//   contents: Array.from({ length: 21 }, (_, i) => ({
//     id: `content-${i}`,
//     title: `Lesson ${i + 1}: ${["Introduction to AWS", "IAM & Security", "EC2 Basics", "S3 Storage", "Lambda Functions", "RDS Databases", "CloudFront CDN", "VPC Networking", "Route 53 DNS", "Auto Scaling", "Load Balancers", "CloudWatch Monitoring", "SQS & SNS", "DynamoDB", "Elastic Beanstalk", "CodeDeploy", "CloudFormation", "AWS CLI", "Cost Management", "Serverless Architecture", "Final Project"][i]}`,
//     content_type: i % 4 === 3 ? "document" : "video",
//     duration: `${Math.floor(Math.random() * 20) + 5}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
//     is_free: i < 3,
//   })),
// };

// type Tab = "lessons" | "docs" | "about";

// function LessonsTab({ contents }: { contents: Content[] }) {
//   const videos = contents.filter((c) => c.content_type !== "document");
//   if (videos.length === 0)
//     return (
//       <p className="text-center text-zinc-400 dark:text-zinc-500 py-16 text-sm">
//         No lessons available yet.
//       </p>
//     );

//   return (
//     <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
//       {videos.map((lesson, idx) => (
//         <div
//           key={lesson.id}
//           className="flex items-center gap-3 px-4 py-3.5 group"
//         >
//           <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center">
//             {lesson.is_free ? (
//               <PlayCircle size={18} className="text-orange-500" />
//             ) : (
//               <Lock size={15} className="text-zinc-400 dark:text-zinc-500" />
//             )}
//           </div>

//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate leading-snug">
//               {idx + 1}. {lesson.title}
//             </p>
//             <div className="flex items-center gap-2 mt-0.5">
//               {lesson.duration && (
//                 <span className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
//                   <Clock size={11} />
//                   {lesson.duration}
//                 </span>
//               )}
//               {lesson.is_free && (
//                 <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-500 bg-orange-50 dark:bg-orange-950/40 px-1.5 py-0.5 rounded-md">
//                   Free
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function DocsTab({ contents }: { contents: Content[] }) {
//   const docs = contents.filter((c) => c.content_type === "document");
//   if (docs.length === 0)
//     return (
//       <p className="text-center text-zinc-400 dark:text-zinc-500 py-16 text-sm">
//         No documents available for this course.
//       </p>
//     );

//   return (
//     <div className="px-4 py-3 space-y-2.5">
//       {docs.map((doc, idx) => (
//         <div
//           key={doc.id}
//           className="flex items-center gap-3 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
//         >
//           <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
//             <FileText size={17} className="text-blue-500" />
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
//               {idx + 1}. {doc.title}
//             </p>
//             <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
//               PDF Document
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function AboutTab({ course }: { course: Course }) {
//   const formattedDate = new Date(course.created_at).toLocaleDateString(
//     "en-US",
//     {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     },
//   );

//   return (
//     <div className="px-4 py-4 space-y-5">
//       <div>
//         <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
//           About this course
//         </h3>
//         <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
//           {course.description}
//         </p>
//       </div>

//       {/* Meta grid */}
//       <div className="grid grid-cols-2 gap-3">
//         {[
//           { label: "Instructor", value: course.vendor_name },
//           { label: "Category", value: course.category_name },
//           { label: "Published", value: formattedDate },
//           { label: "Lessons", value: `${course.contents.length} lessons` },
//           {
//             label: "Price",
//             value: course.course_type === "free" ? "Free" : `$${course.price}`,
//           },
//           {
//             label: "Status",
//             value: course.is_published ? "Published" : "Draft",
//           },
//         ].map(({ label, value }) => (
//           <div
//             key={label}
//             className="p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
//           >
//             <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
//               {label}
//             </p>
//             <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mt-1 truncate">
//               {value}
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function CourseDetailPage() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState<Tab>("lessons");

//   const course = MOCK_COURSE;

//   const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
//     { key: "lessons", label: "Lessons", icon: <BookOpen size={15} /> },
//     { key: "docs", label: "Docs", icon: <FileText size={15} /> },
//     { key: "about", label: "About", icon: <Info size={15} /> },
//   ];

//   return (
//     <div className="w-full max-w-2xl mx-auto min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-32">
//       <div className="relative w-full aspect-video bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
//         <img
//           src={course.thumbnail}
//           alt={course.title}
//           className="w-full h-full object-cover"
//           onError={(e) => {
//             (e.target as HTMLImageElement).src =
//               "https://placehold.co/800x450/1c1c1e/555?text=No+Image";
//           }}
//         />
//         {/* subtle gradient overlay at bottom */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
//       </div>

//       <div className="px-4 pt-4 pb-3 flex items-start gap-3">
//         <button
//           onClick={() => router.back()}
//           className="flex-shrink-0 mt-0.5 p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-orange-500 transition-colors"
//         >
//           <ArrowLeft size={18} />
//         </button>

//         <div className="flex-1 min-w-0">
//           <h1 className="text-base font-bold leading-tight text-zinc-900 dark:text-zinc-50">
//             {course.title}
//           </h1>
//           <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
//             {course.category_name}
//           </p>
//         </div>

//         <span
//           className={`flex-shrink-0 mt-0.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl ${
//             course.course_type === "free"
//               ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
//               : "bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400"
//           }`}
//         >
//           {course.course_type === "free" ? "Free" : `$${course.price}`}
//         </span>
//       </div>

//       <div className="px-4 pb-2">
//         <div className="flex gap-1 p-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
//           {tabs.map((tab) => (
//             <button
//               key={tab.key}
//               onClick={() => setActiveTab(tab.key)}
//               className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
//                 activeTab === tab.key
//                   ? "bg-orange-500 text-white shadow-sm"
//                   : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
//               }`}
//             >
//               {tab.icon}
//               {tab.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="mt-1">
//         {activeTab === "lessons" && <LessonsTab contents={course.contents} />}
//         {activeTab === "docs" && <DocsTab contents={course.contents} />}
//         {activeTab === "about" && <AboutTab course={course} />}
//       </div>

//       <div className="fixed bottom-0 left-0 right-0 flex justify-center bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-100 dark:border-zinc-800 px-4 py-4">
//         <button className="w-full max-w-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/25">
//           {course.course_type === "free"
//             ? "Start Learning"
//             : `Enroll — $${course.price}`}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default CourseDetailPage;

"use client";

import {
  ArrowLeft,
  BookOpen,
  FileText,
  Info,
  Clock,
  PlayCircle,
  Lock,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import React, { useState, useEffect } from "react";

// --- Interfaces ---
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
    <div className="divide-y divide-zinc-100">
      {videos.map((lesson, idx) => (
        <div
          key={lesson.id}
          className={`flex items-center gap-3 px-4 py-3.5 ${!isEnrolled ? "opacity-60" : ""}`}
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
            {/* Show Lock icon if not enrolled */}
            {isEnrolled ? (
              <PlayCircle size={18} className="text-orange-500" />
            ) : (
              <Lock size={15} className="text-zinc-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-800 truncate">
              {idx + 1}. {lesson.title}
            </p>
            {!isEnrolled && (
              <p className="text-[10px] text-zinc-400 mt-0.5">
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
          className={`flex items-center gap-3 p-3.5 rounded-2xl border ${!isEnrolled ? "border-dashed" : "border-solid"} border-zinc-200 bg-white`}
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            {isEnrolled ? (
              <FileText size={17} className="text-blue-500" />
            ) : (
              <Lock size={15} className="text-zinc-400" />
            )}
          </div>
          <p className="text-sm font-medium text-zinc-800">
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
      {/* Enrollment Section */}
      {!isEnrolled ? (
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
          <h3 className="text-sm font-bold text-orange-900 mb-1">
            Ready to start?
          </h3>
          <p className="text-xs text-orange-700 mb-3">
            Enroll now to get full access to all lessons and documents.
          </p>
          <button
            onClick={onEnroll}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-all"
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

      {/* Description Section */}
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
            className="p-3 rounded-2xl border border-zinc-100 bg-white"
          >
            <p className="text-[10px] font-semibold uppercase text-zinc-400">
              {item.label}
            </p>
            <p className="text-sm font-semibold mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const router = useRouter();
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
    <div className="w-full max-w-2xl mx-auto min-h-screen bg-zinc-50 pb-32">
      <div className="relative w-full aspect-video bg-zinc-200 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-4 pb-2 mt-4">
        <div className="flex gap-1 p-1 bg-white rounded-2xl border border-zinc-100">
          {["lessons", "docs", "about"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t as Tab)}
              className={`flex-1 py-2 rounded-xl text-sm ${activeTab === t ? "bg-orange-500 text-white" : "text-zinc-400"}`}
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
