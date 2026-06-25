"use client";

import { TEMPLATES, TemplateConfig } from "@/types/templates";
import { ResumeTemplate } from "@/types/resume";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  selected: ResumeTemplate;
  onChange: (t: ResumeTemplate) => void;
}

function TemplateCard({
  config,
  selected,
  onClick,
}: {
  config: TemplateConfig;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col rounded-xl border-2 overflow-hidden transition-all duration-200 text-left",
        selected
          ? "border-primary shadow-lg scale-[1.02]"
          : "border-border hover:border-primary/40 hover:shadow-md",
      )}
    >
      <div className="h-28 bg-muted flex flex-col overflow-hidden">
        {/* Header strip */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2",
            config.preview.header,
          )}
        >
          {/* Avatar circle */}
          <div className="w-6 h-6 rounded-full bg-white/30 shrink-0" />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className={cn("h-2 w-20 rounded-full bg-white/70")} />
            <div className={cn("h-1.5 w-12 rounded-full bg-white/40")} />
          </div>
        </div>

        {/* Body area */}
        <div
          className={cn(
            "flex gap-2 flex-1 p-2",
            config.preview.sidebar ? "" : "flex-col",
          )}
        >
          {config.preview.sidebar && (
            <div className="w-14 bg-muted-foreground/10 rounded flex flex-col gap-1 p-1.5">
              <div className="h-1.5 bg-muted-foreground/30 rounded-full w-10" />
              <div className="h-1.5 bg-muted-foreground/20 rounded-full w-8" />
              <div className="h-1.5 bg-muted-foreground/20 rounded-full w-9" />
              <div className="h-1.5 bg-muted-foreground/10 rounded-full w-7 mt-2" />
              <div className="h-1.5 bg-muted-foreground/20 rounded-full w-8" />
            </div>
          )}
          <div className="flex-1 flex flex-col gap-1 p-1">
            <div className="h-1.5 bg-muted-foreground/25 rounded-full" />
            <div className="h-1.5 bg-muted-foreground/15 rounded-full w-4/5" />
            <div className="h-1.5 bg-muted-foreground/15 rounded-full w-3/5" />
            <div className="h-1.5 bg-muted-foreground/25 rounded-full mt-1.5" />
            <div className="h-1.5 bg-muted-foreground/15 rounded-full w-4/5" />
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="px-3 py-2.5 bg-card flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold leading-tight">{config.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            {config.description}
          </p>
        </div>
        {selected && (
          <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </span>
        )}
      </div>
    </button>
  );
}

export default function TemplateSelector({
  selected,
  onChange,
}: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TEMPLATES.map((t) => (
        <TemplateCard
          key={t.id}
          config={t}
          selected={selected === t.id}
          onClick={() => onChange(t.id)}
        />
      ))}
    </div>
  );
}
