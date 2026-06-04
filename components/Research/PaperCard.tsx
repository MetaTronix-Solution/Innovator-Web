"use client";

import React from "react";
import {
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Users,
  Lock,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ResearchPaper } from "@/types/research";

interface PaperCardProps {
  paper: ResearchPaper;
  onClick: () => void;
  isUnlocked: boolean;
  isLiked: boolean;
}

export function PaperCard({
  paper,
  onClick,
  isUnlocked,
  isLiked,
}: PaperCardProps) {
  const isLocked = paper.type === "paid" && !isUnlocked;

  return (
    <article
      onClick={onClick}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-800 cursor-pointer"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <Badge
          variant="secondary"
          className="text-xs font-medium bg-muted text-muted-foreground border-none"
        >
          {paper.category}
        </Badge>

        {isLocked ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <Lock className="h-3 w-3" /> NPR {paper.price}
          </span>
        ) : paper.type === "paid" ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Unlocked
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <BookOpen className="h-3 w-3" /> Free
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="mb-2 line-clamp-2 text-md font-semibold leading-snug text-foreground group-hover:text-orange-600 transition-colors">
          {paper.title}
        </h3>

        <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{paper.authors.join(", ")}</span>
        </div>

        <p className="mb-4 line-clamp-4 text-sm text-muted-foreground leading-relaxed">
          {paper.abstract}
        </p>
      </div>

      <div className="mt-auto">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {paper.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
          {paper.tags.length > 3 && (
            <span className="rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
              +{paper.tags.length - 3}
            </span>
          )}
        </div>

        <Separator className="mb-4" />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {paper.views.toLocaleString()}
            </span>
            <span
              className={cn(
                "flex items-center gap-1",
                isLiked && "text-orange-500",
              )}
            >
              <Heart
                className={cn("h-3.5 w-3.5", isLiked && "fill-orange-500")}
              />
              {paper.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {paper.comments}
            </span>
          </div>
          {/* <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(paper.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div> */}
        </div>
      </div>
    </article>
  );
}
