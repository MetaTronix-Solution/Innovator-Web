"use client";

import { Loader2, Trash2 } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  title = "Delete comment?",
  description = "This will permanently remove your comment. This action cannot be undone.",
  onConfirm,
  onCancel,
  isDeleting,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-card border border-border/60 rounded-2xl shadow-2xl w-[320px] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 px-6 pt-6 pb-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Trash2 size={22} className="text-destructive" />
          </div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 border-t border-border/50">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="py-3.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors border-r border-border/50 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="py-3.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
