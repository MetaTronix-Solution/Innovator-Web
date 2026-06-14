"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Flag,
  ShieldBan,
  Loader2,
} from "lucide-react";

interface CommentMenuProps {
  isOwner: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onBlock: () => void;
}

const CommentMenu = ({
  isOwner,
  isDeleting,
  onEdit,
  onDelete,
  onReport,
  onBlock,
}: CommentMenuProps) => {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 110);
    }
    setOpen((v) => !v);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="
          flex items-center justify-center w-6 h-6 rounded-full
          text-muted-foreground hover:text-foreground
          hover:bg-muted/60 transition-colors
        "
        aria-label="Comment options"
      >
        <MoreHorizontal size={14} />
      </button>

      {open && (
        <div
          className={`
            absolute left-full z-50 min-w-[180px]
            bg-popover border border-border/60 rounded-xl shadow-lg
            py-1 overflow-hidden
            animate-in fade-in-0 zoom-in-95 duration-100
            ${dropUp ? "bottom-0" : "top-0"}
          `}
          style={{ marginLeft: "6px" }}
        >
          {isOwner ? (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className="
                  flex items-center gap-2.5 w-full px-4 py-2.5
                  text-[13px] text-foreground/90
                  hover:bg-muted/60 transition-colors text-left
                "
              >
                <Pencil size={13} className="shrink-0" />
                Edit comment
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                disabled={isDeleting}
                className="
                  flex items-center gap-2.5 w-full px-4 py-2.5
                  text-[13px] text-destructive
                  hover:bg-destructive/10 transition-colors text-left
                  disabled:opacity-40
                "
              >
                {isDeleting ? (
                  <Loader2 size={13} className="animate-spin shrink-0" />
                ) : (
                  <Trash2 size={13} className="shrink-0" />
                )}
                Delete comment
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  onReport();
                }}
                className="
                  flex items-center gap-2.5 w-full px-4 py-2.5
                  text-[13px] text-foreground/90
                  hover:bg-muted/60 transition-colors text-left
                "
              >
                <Flag size={13} className="shrink-0" />
                Report comment
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onBlock();
                }}
                className="
                  flex items-center gap-2.5 w-full px-4 py-2.5
                  text-[13px] text-destructive
                  hover:bg-destructive/10 transition-colors text-left
                "
              >
                <ShieldBan size={13} className="shrink-0" />
                Block user
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentMenu;
