"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  Clock,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";

export default function CourseDetails({
  course,
  onClose,
}: {
  course: any;
  onClose: () => void;
}) {
  const [openModule, setOpenModule] = useState<number | null>(0);

  return (
    <div className="max-w-7xl mx-auto px-2 py-2 animate-in fade-in duration-500">
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-neutral-500 hover:text-orange-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Courses
      </button>

      {/* Grid: 12 columns total */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <h1 className="text-center text-4xl md:text-5xl font-black text-neutral-900">
            {course.title}
          </h1>
          <p className="text-xl text-neutral-600">
            Master the art of innovation with this comprehensive guide.
          </p>

          <div className="flex flex-wrap gap-4 p-4 border rounded-xl bg-neutral-50">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />{" "}
              <span className="font-bold">4.9</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={20} className="text-neutral-400" /> 1.2k Students
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-neutral-400" /> {course.duration}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Course Content</h2>
            {[1, 2, 3, 4, 5, 6, 7].map((mod) => (
              <div
                key={mod}
                className="border rounded-xl overflow-hidden bg-white shadow-sm"
              >
                <button
                  onClick={() => setOpenModule(openModule === mod ? null : mod)}
                  className="w-full flex items-center justify-between p-5 font-semibold hover:bg-neutral-50"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen size={18} /> Module {mod}: Foundation
                  </span>
                  {openModule === mod ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
                {openModule === mod && (
                  <div className="p-5 border-t space-y-3 bg-neutral-50/50">
                    {["Introduction", "Core Concepts", "Practice"].map(
                      (lesson) => (
                        <div
                          key={lesson}
                          className="flex items-center gap-3 text-neutral-700"
                        >
                          <PlayCircle size={16} className="text-orange-500" />{" "}
                          {lesson}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Takes 4 columns */}
        <div className="lg:col-span-8">
          <div className="sticky top-24 border rounded-3xl p-6 shadow-xl bg-white border-neutral-100">
            {/* The clamp() function: min-size, preferred-size, max-size */}
            <div
              className="font-black mb-6 w-full text-center"
              style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}
            >
              $149.00
            </div>

            <button className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 cursor-pointer transition-all mb-6">
              Enroll Now
            </button>
            <ul className="space-y-4 text-sm text-neutral-600">
              {[
                "Lifetime Access",
                "Completion Certificate",
                "Offline Viewing",
                "Community Access",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
