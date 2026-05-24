"use client";

import { useEffect, useRef, useState } from "react";
import {
  EllipsisVertical,
  Pencil,
  Trash2,
  Flag,
  Ban,
  Copy,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { deletePost } from "@/lib/services/postService";
import ReportModal from "../ReportModal";

interface PostCardMenuProps {
  postId: string;
  isOwnPost: boolean;
  content: string;
  userId: string;
  onDeleted: () => void;
  onEditClick: () => void;
  onBlocked?: () => void;
}

export default function PostCardMenu({
  postId,
  isOwnPost,
  content,
  userId,
  onDeleted,
  onEditClick,
  onBlocked,
}: PostCardMenuProps) {
  const [open, setOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    setDeleting(true);
    try {
      await deletePost(postId);
      toast.success("Post deleted");
      onDeleted();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete post");
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
    setOpen(false);
  };

  const handleBlock = async () => {
    if (
      !confirm("Block this user? Their posts will be removed from your feed.")
    )
      return;
    setBlocking(true);
    try {
      const res = await fetch(`/api/users/${userId}/block/`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to block user");
      }
      toast.success("User blocked");
      setOpen(false);
      onBlocked?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to block user");
    } finally {
      setBlocking(false);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
      >
        <EllipsisVertical size={18} />
      </button>

      <ReportModal
        userId={userId}
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setOpen(false);
        }}
      />

      {open && (
        <div className="absolute right-0 top-9 z-50 w-44 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {isOwnPost ? (
            <>
              <MenuItem
                icon={<Pencil size={15} />}
                label="Edit post"
                onClick={() => {
                  onEditClick();
                  setOpen(false);
                }}
              />
              <MenuItem
                icon={
                  deleting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )
                }
                label="Delete post"
                onClick={handleDelete}
                danger
                disabled={deleting}
              />
            </>
          ) : (
            <>
              <MenuItem
                icon={<Flag size={15} />}
                label="Report post"
                onClick={() => setIsReportModalOpen(true)}
              />

              <MenuItem
                icon={
                  blocking ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Ban size={15} />
                  )
                }
                label="Block user"
                onClick={handleBlock}
                danger
                disabled={blocking}
              />
              <MenuItem
                icon={<Copy size={15} />}
                label="Copy text"
                onClick={handleCopyText}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent disabled:opacity-50
        ${danger ? "text-destructive hover:bg-destructive/10" : "text-foreground"}`}
    >
      {icon}
      {label}
    </button>
  );
}
