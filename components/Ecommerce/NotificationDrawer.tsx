"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, X, Loader2, Check, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  data: {
    type: string;
    category: string;
    product_id: string;
  };
}

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({
  open,
  onClose,
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : (data.results ?? []));
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // const markAsRead = async (id: string) => {
  //   setNotifications((prev) =>
  //     prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
  //   );
  //   try {
  //     const res = await fetch(`/api/products/notifications//mark-as-read`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ notification_id: id }),
  //     });
  //     if (!res.ok) throw new Error();
  //   } catch {
  //     // Revert on failure
  //     setNotifications((prev) =>
  //       prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)),
  //     );
  //   }
  // };

  // const markAllAsRead = async () => {
  //   const prev = notifications;
  //   setMarkingAll(true);
  //   setNotifications((n) => n.map((n) => ({ ...n, is_read: true })));
  //   try {
  //     const res = await fetch("/api/products/notifications/mark-all-as-read", {
  //       method: "POST",
  //     });
  //     if (!res.ok) throw new Error();
  //   } catch {
  //     setNotifications(prev);
  //   } finally {
  //     setMarkingAll(false);
  //   }
  // };

  const markAsRead = async (id: string | number) => {
    try {
      await fetch("/api/products/notifications/mark-as-read", {
        method: "PATCH",
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
      await fetch("/api/products/notifications/mark-all-as-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) await markAsRead(n.id);
    if (n.data?.product_id) {
      onClose();
      setTimeout(() => router.push(`/products/${n.data.product_id}`), 50);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-background border-l border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-orange-500" />
            <h2 className="font-bold text-sm">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-orange-500 hover:bg-orange-500/10 transition-colors disabled:opacity-50"
                title="Mark all as read"
              >
                {markingAll ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <CheckCheck size={13} />
                )}
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                size={22}
                className="animate-spin text-muted-foreground"
              />
            </div>
          ) : error ? (
            <div className="text-center py-20 px-4">
              <p className="text-xs text-destructive mb-3">{error}</p>
              <button
                onClick={fetchNotifications}
                className="text-xs text-orange-500 font-semibold hover:underline"
              >
                Retry
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Bell size={32} className="text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`px-5 py-4 flex gap-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                    !n.is_read ? "bg-orange-500/5" : ""
                  }`}
                >
                  <div className="flex-shrink-0 mt-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        n.is_read ? "bg-transparent" : "bg-orange-500"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        !n.is_read
                          ? "font-semibold"
                          : "font-medium text-muted-foreground"
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>

                  {!n.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n.id);
                      }}
                      className="flex-shrink-0 self-center p-1.5 rounded-lg hover:bg-orange-500/10 text-orange-500 transition-colors"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
