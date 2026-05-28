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
  username: string;
  onDeleted: () => void;
  onEditClick: () => void;
  onBlocked?: () => void;
}

export default function PostCardMenu({
  postId,
  isOwnPost,
  content,
  userId,
  username,
  onDeleted,
  onEditClick,
  onBlocked,
}: PostCardMenuProps) {
  const [open, setOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const handleInitiateBlock = () => {
    setShowConfirm(true);
  };

  const handleBlock = async () => {
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
      setShowConfirm(false);
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
                onClick={handleInitiateBlock}
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

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-card p-6 rounded-2xl shadow-2xl border border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Block @{username}?
            </h2>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Are you sure you want to block this user? They will be removed
              from your feed and you will no longer see their content.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                disabled={blocking}
                className="flex-1 px-4 py-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium flex items-center justify-center"
              >
                {blocking ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Block"
                )}
              </button>
            </div>
          </div>
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
