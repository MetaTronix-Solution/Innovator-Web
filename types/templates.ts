import { ResumeTemplate } from "./resume";

export interface TemplateConfig {
  id: ResumeTemplate;
  name: string;
  description: string;
  accent: string;
  preview: {
    header: string;
    text: string;
    sidebar: boolean;
  };
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean two-column layout. Timeless and ATS-friendly.",
    accent: "bg-slate-700",
    preview: {
      header: "bg-slate-700",
      text: "text-white",
      sidebar: true,
    },
  },
  {
    id: "modern",
    name: "Modern",
    description: "Bold header with accent colour. Great for tech roles.",
    accent: "bg-violet-600",
    preview: {
      header: "bg-violet-600",
      text: "text-white",
      sidebar: false,
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "All whitespace and typography. Let the work speak.",
    accent: "bg-zinc-900",
    preview: {
      header: "bg-white border border-zinc-200",
      text: "text-zinc-900",
      sidebar: false,
    },
  },
  {
    id: "bold",
    name: "Bold",
    description: "High contrast sidebar. Eye-catching for creative fields.",
    accent: "bg-rose-600",
    preview: {
      header: "bg-rose-600",
      text: "text-white",
      sidebar: true,
    },
  },
];
