"use client";

import { ResumeData } from "@/types/resume";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 mt-6 first:mt-0">
      {children}
    </h3>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const base =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cn(base, "resize-none")}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  );
}

export default function ResumeForm({ data, onChange }: ResumeFormProps) {
  const updatePersonal = (key: keyof ResumeData["personalInfo"], val: string) =>
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [key]: val },
    });

  const addExperience = () =>
    onChange({
      ...data,
      experience: [
        ...data.experience,
        {
          id: crypto.randomUUID(),
          company: "",
          role: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    });

  const updateExperience = (
    id: string,
    key: keyof ResumeData["experience"][0],
    val: string | boolean,
  ) =>
    onChange({
      ...data,
      experience: data.experience.map((e) =>
        e.id === id ? { ...e, [key]: val } : e,
      ),
    });

  const removeExperience = (id: string) =>
    onChange({
      ...data,
      experience: data.experience.filter((e) => e.id !== id),
    });

  const addEducation = () =>
    onChange({
      ...data,
      education: [
        ...data.education,
        {
          id: crypto.randomUUID(),
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          grade: "",
        },
      ],
    });

  const updateEducation = (
    id: string,
    key: keyof ResumeData["education"][0],
    val: string,
  ) =>
    onChange({
      ...data,
      education: data.education.map((e) =>
        e.id === id ? { ...e, [key]: val } : e,
      ),
    });

  const removeEducation = (id: string) =>
    onChange({ ...data, education: data.education.filter((e) => e.id !== id) });

  const [skillsRaw, setSkillsRaw] = useState(data.skills.join(", "));

  const handleSkillsChange = (raw: string) => {
    setSkillsRaw(raw);
    onChange({
      ...data,
      skills: raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="space-y-1 pb-6">
      {/* Personal Info */}
      <SectionTitle>Personal Info</SectionTitle>
      <div className="grid grid-cols-1 gap-3">
        <Field
          label="Full Name"
          value={data.personalInfo.name}
          onChange={(v) => updatePersonal("name", v)}
          placeholder="Deepak Shrestha"
        />
        <Field
          label="Professional Title"
          value={data.personalInfo.title}
          onChange={(v) => updatePersonal("title", v)}
          placeholder="Associate Frontend Developer"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Email"
            value={data.personalInfo.email}
            onChange={(v) => updatePersonal("email", v)}
            placeholder="you@example.com"
          />
          <Field
            label="Phone"
            value={data.personalInfo.phone}
            onChange={(v) => updatePersonal("phone", v)}
            placeholder="+977 98XXXXXXXX"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Location"
            value={data.personalInfo.location}
            onChange={(v) => updatePersonal("location", v)}
            placeholder="Lalitpur, Nepal"
          />
          <Field
            label="Website / Portfolio"
            value={data.personalInfo.website}
            onChange={(v) => updatePersonal("website", v)}
            placeholder="https://yoursite.com"
          />
        </div>
        <Field
          label="Professional Summary"
          value={data.personalInfo.bio}
          onChange={(v) => updatePersonal("bio", v)}
          placeholder="Brief summary of your experience and goals…"
          multiline
        />
      </div>

      {/* Experience */}
      <SectionTitle>Experience</SectionTitle>
      <div className="space-y-4">
        {data.experience.map((exp, i) => (
          <div
            key={exp.id}
            className="rounded-xl border border-border p-3 space-y-3 bg-muted/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Position {i + 1}
              </span>
              <button
                onClick={() => removeExperience(exp.id)}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Company"
                value={exp.company}
                onChange={(v) => updateExperience(exp.id, "company", v)}
                placeholder="Nepatronix Engineering"
              />
              <Field
                label="Role"
                value={exp.role}
                onChange={(v) => updateExperience(exp.id, "role", v)}
                placeholder="Frontend Developer"
              />
              <Field
                label="Start Date"
                value={exp.startDate}
                onChange={(v) => updateExperience(exp.id, "startDate", v)}
                placeholder="Jan 2024"
              />
              <Field
                label="End Date"
                value={exp.endDate}
                onChange={(v) => updateExperience(exp.id, "endDate", v)}
                placeholder="Present"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`current-${exp.id}`}
                checked={exp.current}
                onChange={(e) =>
                  updateExperience(exp.id, "current", e.target.checked)
                }
                className="rounded border-border"
              />
              <label
                htmlFor={`current-${exp.id}`}
                className="text-xs text-muted-foreground"
              >
                Currently working here
              </label>
            </div>
            <Field
              label="Description"
              value={exp.description}
              onChange={(v) => updateExperience(exp.id, "description", v)}
              placeholder="Key responsibilities and achievements…"
              multiline
            />
          </div>
        ))}
        <button
          onClick={addExperience}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>

      {/* Education */}
      <SectionTitle>Education</SectionTitle>
      <div className="space-y-4">
        {data.education.map((edu, i) => (
          <div
            key={edu.id}
            className="rounded-xl border border-border p-3 space-y-3 bg-muted/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Qualification {i + 1}
              </span>
              <button
                onClick={() => removeEducation(edu.id)}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <Field
              label="Institution"
              value={edu.institution}
              onChange={(v) => updateEducation(edu.id, "institution", v)}
              placeholder="Patan Multiple Campus"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Degree"
                value={edu.degree}
                onChange={(v) => updateEducation(edu.id, "degree", v)}
                placeholder="BSc. CSIT"
              />
              <Field
                label="Field"
                value={edu.field}
                onChange={(v) => updateEducation(edu.id, "field", v)}
                placeholder="Computer Science"
              />
              <Field
                label="Start Date"
                value={edu.startDate}
                onChange={(v) => updateEducation(edu.id, "startDate", v)}
                placeholder="2020"
              />
              <Field
                label="End Date / Expected"
                value={edu.endDate}
                onChange={(v) => updateEducation(edu.id, "endDate", v)}
                placeholder="2024"
              />
            </div>
            <Field
              label="Grade / GPA"
              value={edu.grade}
              onChange={(v) => updateEducation(edu.id, "grade", v)}
              placeholder="3.8 / 4.0"
            />
          </div>
        ))}
        <button
          onClick={addEducation}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Education
        </button>
      </div>

      {/* Skills */}
      <SectionTitle>Skills</SectionTitle>
      <Field
        label="Skills (comma-separated)"
        value={skillsRaw}
        onChange={handleSkillsChange}
        placeholder="React, Next.js, TypeScript, Tailwind CSS, Redux…"
      />

      {/* Links */}
      <SectionTitle>Links</SectionTitle>
      <div className="space-y-3">
        {data.links.map((link, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end"
          >
            <Field
              label="Label"
              value={link.label}
              onChange={(v) => {
                const links = [...data.links];
                links[i] = { ...links[i], label: v };
                onChange({ ...data, links });
              }}
              placeholder="GitHub"
            />
            <Field
              label="URL"
              value={link.url}
              onChange={(v) => {
                const links = [...data.links];
                links[i] = { ...links[i], url: v };
                onChange({ ...data, links });
              }}
              placeholder="https://github.com/username"
            />
            <button
              onClick={() =>
                onChange({
                  ...data,
                  links: data.links.filter((_, j) => j !== i),
                })
              }
              className="mb-0.5 p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            onChange({
              ...data,
              links: [...data.links, { label: "", url: "" }],
            })
          }
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>
    </div>
  );
}
