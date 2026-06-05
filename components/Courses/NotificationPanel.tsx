"use client";

import { Bell, Check, CheckCheck, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Notification {
  id: string | number;
  title?: string;
  message?: string;
  body?: string;
  is_read: boolean;
  created_at?: string;
}

export function NotificationsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [visible, setVisible] = useState(false);
  const [animated, setAnimated] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const touchStartY = useRef(0);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimated(true));
      });
    } else {
      setAnimated(false);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/courses/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(Array.isArray(data) ? data : (data.results ?? []));
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  const markAsRead = async (id: string | number) => {
    try {
      await fetch("/api/courses/notifications/mark-as-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch {}
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch("/api/courses/notifications/mark-all-as-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
    } finally {
      setMarkingAll(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const diff = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000,
    );
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // Swipe down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const offset = Math.max(0, e.touches[0].clientY - touchStartY.current);
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (dragOffset > 120) onClose();
    setDragOffset(0);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!visible) return null;

  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <Bell size={18} className="text-orange-500" />
          <h2 className="font-black text-base text-foreground tracking-tight">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-orange-500 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors font-semibold"
            >
              {markingAll ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CheckCheck size={12} />
              )}
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-start animate-pulse">
                <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2.5 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Bell size={24} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              No notifications yet
            </p>
            <p className="text-xs text-muted-foreground/60">
              You're all caught up!
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {notifications.map((n) => (
              <li
                key={n.id}
                onClick={() => !n.is_read && markAsRead(n.id)}
                className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors ${
                  n.is_read
                    ? "bg-transparent hover:bg-muted/40"
                    : "bg-orange-50/60 dark:bg-orange-950/20 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                }`}
              >
                <div
                  className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                    n.is_read ? "bg-transparent" : "bg-orange-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  {n.title && (
                    <p className="text-xs font-bold text-foreground mb-0.5 truncate">
                      {n.title}
                    </p>
                  )}
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {n.message ?? n.body ?? "New notification"}
                  </p>
                  {n.created_at && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatTime(n.created_at)}
                    </p>
                  )}
                </div>
                {n.is_read && (
                  <Check
                    size={13}
                    className="text-muted-foreground/30 shrink-0 mt-0.5"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          animated
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={`hidden md:flex fixed top-0 right-0 z-50 h-full w-full max-w-[380px] bg-card border-l border-border shadow-2xl flex-col transition-transform duration-300 ease-in-out ${
          animated ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {panelContent}
      </div>

      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-2xl rounded-t-2xl flex flex-col"
        style={{
          transform: animated
            ? `translateY(${dragOffset}px)`
            : "translateY(100%)",
          transition: isDragging.current ? "none" : "transform 0.3s ease-out",
          maxHeight: "85vh",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {panelContent}
        </div>
      </div>
    </>
  );
}
