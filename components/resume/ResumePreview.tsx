"use client";

import { ResumeData, ResumeTemplate } from "@/types/resume";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ResumePreviewProps {
  template: ResumeTemplate;
  data: ResumeData;
  scale?: number;
}

function SkillPills({ skills, accent }: { skills: string[]; accent: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s) => (
        <span
          key={s}
          className={cn("px-2 py-0.5 rounded text-[11px] font-medium", accent)}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function ExperienceList({
  experience,
}: {
  experience: ResumeData["experience"];
}) {
  return (
    <div className="space-y-3">
      {experience.map((exp) => (
        <div key={exp.id}>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[13px] font-semibold leading-tight">
              {exp.role || "Role"}
            </p>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
              {exp.startDate || "Start"} –{" "}
              {exp.current ? "Present" : exp.endDate || "End"}
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            {exp.company || "Company"}
          </p>
          {exp.description && (
            <p className="text-[11px] mt-1 leading-relaxed text-foreground/80">
              {exp.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function EducationList({ education }: { education: ResumeData["education"] }) {
  return (
    <div className="space-y-2">
      {education.map((edu) => (
        <div key={edu.id}>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[13px] font-semibold leading-tight">
              {edu.degree || "Degree"} {edu.field ? `in ${edu.field}` : ""}
            </p>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
              {edu.startDate || "–"} – {edu.endDate || "–"}
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            {edu.institution || "Institution"}
          </p>
          {edu.grade && (
            <p className="text-[11px] text-muted-foreground">
              Grade: {edu.grade}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ClassicTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-zinc-800 font-sans min-h-full">
      {/* Header */}
      <div className="bg-slate-700 text-white px-8 py-6 flex items-center gap-5">
        {data.personalInfo.avatarUrl && (
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shrink-0">
            <Image
              src={data.personalInfo.avatarUrl}
              alt={data.personalInfo.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {data.personalInfo.name || "Your Name"}
          </h1>
          <p className="text-slate-300 text-sm mt-0.5">
            {data.personalInfo.title || "Your Title"}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-[11px] text-slate-300">
            {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
            {data.personalInfo.location && (
              <span>{data.personalInfo.location}</span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-0">
        {/* Sidebar */}
        <div className="w-52 shrink-0 bg-slate-50 px-5 py-6 space-y-5 border-r border-slate-100">
          {data.skills.length > 0 && (
            <div>
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1">
                {data.skills.map((s) => (
                  <span
                    key={s}
                    className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.links.length > 0 && (
            <div>
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">
                Links
              </h2>
              <div className="space-y-1">
                {data.links.map((l, i) => (
                  <p key={i} className="text-[11px] text-slate-600 truncate">
                    <span className="font-medium">{l.label}: </span>
                    {l.url}
                  </p>
                ))}
              </div>
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">
                Education
              </h2>
              <EducationList education={data.education} />
            </div>
          )}
        </div>

        {/* Main */}
        <div className="flex-1 px-6 py-6 space-y-5">
          {data.personalInfo.bio && (
            <div>
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1.5">
                Summary
              </h2>
              <p className="text-[12px] leading-relaxed text-zinc-700">
                {data.personalInfo.bio}
              </p>
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
                Experience
              </h2>
              <ExperienceList experience={data.experience} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// MODERN template  (Orange header, single col)
function ModernTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-zinc-800 font-sans min-h-full">
      <div className="bg-primary text-white px-8 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {data.personalInfo.name || "Your Name"}
        </h1>
        <p className="text-violet-200 text-sm mt-1">
          {data.personalInfo.title || "Your Title"}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-3 text-[11px] text-violet-100">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && (
            <span>{data.personalInfo.location}</span>
          )}
          {data.personalInfo.website && (
            <span>{data.personalInfo.website}</span>
          )}
        </div>
      </div>
      <div className="px-8 py-6 space-y-6">
        {data.personalInfo.bio && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-violet-600 mb-2">
              About
            </h2>
            <p className="text-[12px] leading-relaxed">
              {data.personalInfo.bio}
            </p>
          </div>
        )}
        {data.experience.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-violet-600 mb-3 border-b border-violet-100 pb-1">
              Experience
            </h2>
            <ExperienceList experience={data.experience} />
          </div>
        )}
        {data.education.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-violet-600 mb-3 border-b border-violet-100 pb-1">
              Education
            </h2>
            <EducationList education={data.education} />
          </div>
        )}
        {data.skills.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-violet-600 mb-2 border-b border-violet-100 pb-1">
              Skills
            </h2>
            <SkillPills
              skills={data.skills}
              accent="bg-violet-50 text-violet-700 border border-violet-100"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// MINIMAL template  (pure white, type-driven)
function MinimalTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-zinc-900 font-sans min-h-full px-10 py-10 space-y-6">
      <div className="border-b border-zinc-200 pb-5">
        <h1 className="text-[28px] font-black tracking-tight leading-none">
          {data.personalInfo.name || "Your Name"}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          {data.personalInfo.title || "Your Title"}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2.5 text-[11px] text-zinc-400">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && (
            <span>{data.personalInfo.location}</span>
          )}
        </div>
      </div>
      {data.personalInfo.bio && (
        <p className="text-[12px] leading-relaxed text-zinc-600">
          {data.personalInfo.bio}
        </p>
      )}
      {data.experience.length > 0 && (
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-3">
            Experience
          </h2>
          <ExperienceList experience={data.experience} />
        </div>
      )}
      {data.education.length > 0 && (
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-3">
            Education
          </h2>
          <EducationList education={data.education} />
        </div>
      )}
      {data.skills.length > 0 && (
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 mb-2">
            Skills
          </h2>
          <SkillPills skills={data.skills} accent="bg-zinc-100 text-zinc-700" />
        </div>
      )}
    </div>
  );
}

// BOLD template  (rose sidebar, high contrast)
function BoldTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white text-zinc-800 font-sans min-h-full flex">
      <div className="w-56 shrink-0 bg-rose-600 text-white px-5 py-8 space-y-6">
        {data.personalInfo.avatarUrl && (
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/40 mx-auto">
            <Image
              src={data.personalInfo.avatarUrl}
              alt={data.personalInfo.name || "Avatar"}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div>
          <h1 className="text-lg font-extrabold leading-tight text-center">
            {data.personalInfo.name || "Your Name"}
          </h1>
          <p className="text-rose-200 text-[11px] text-center mt-0.5">
            {data.personalInfo.title || "Your Title"}
          </p>
        </div>
        <div className="space-y-0.5 text-[11px] text-rose-100">
          {data.personalInfo.email && <p>{data.personalInfo.email}</p>}
          {data.personalInfo.phone && <p>{data.personalInfo.phone}</p>}
          {data.personalInfo.location && <p>{data.personalInfo.location}</p>}
        </div>
        {data.skills.length > 0 && (
          <div>
            <h2 className="text-[9px] uppercase tracking-widest font-bold text-rose-200 mb-2">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((s) => (
                <span
                  key={s}
                  className="bg-white/10 text-white text-[10px] px-1.5 py-0.5 rounded"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {data.links.length > 0 && (
          <div>
            <h2 className="text-[9px] uppercase tracking-widest font-bold text-rose-200 mb-1.5">
              Links
            </h2>
            {data.links.map((l, i) => (
              <p key={i} className="text-[10px] text-rose-100 truncate">
                {l.label}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 px-6 py-8 space-y-5">
        {data.personalInfo.bio && (
          <div>
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-rose-600 mb-1.5">
              Profile
            </h2>
            <p className="text-[12px] leading-relaxed">
              {data.personalInfo.bio}
            </p>
          </div>
        )}
        {data.experience.length > 0 && (
          <div>
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-rose-600 mb-2 border-b border-rose-100 pb-1">
              Experience
            </h2>
            <ExperienceList experience={data.experience} />
          </div>
        )}
        {data.education.length > 0 && (
          <div>
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-rose-600 mb-2 border-b border-rose-100 pb-1">
              Education
            </h2>
            <EducationList education={data.education} />
          </div>
        )}
      </div>
    </div>
  );
}

// Router
export default function ResumePreview({ template, data }: ResumePreviewProps) {
  switch (template) {
    case "classic":
      return <ClassicTemplate data={data} />;
    case "modern":
      return <ModernTemplate data={data} />;
    case "minimal":
      return <MinimalTemplate data={data} />;
    case "bold":
      return <BoldTemplate data={data} />;
    default:
      return <ClassicTemplate data={data} />;
  }
}
