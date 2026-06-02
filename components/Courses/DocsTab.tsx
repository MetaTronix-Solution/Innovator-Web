import React from "react";
import { FileText, Lock, Book } from "lucide-react";
import { Content } from "@/types/course";
import { isDoc } from "@/lib/utils/course";

export function DocsTab({
  contents,
  isEnrolled,
}: {
  contents: Content[];
  isEnrolled: boolean;
}) {
  const docs = contents.filter(isDoc);

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Book size={24} className="text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-foreground">
          No Documents available
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Check back later for new content.
        </p>
      </div>
    );
  }

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
