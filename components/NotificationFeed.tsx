"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { NotificationItem } from "@/types/notification";
import { NotificationService } from "@/lib/services/notificationService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "./ui/button";
import { Check, LayoutGrid, MoreVertical } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { formatRelativeTime } from "@/lib/utils/formatRelativeTime";

interface NotificationFeedProps {
  initialNotifications: NotificationItem[];
  userId: string;
  token?: string;
  onUnreadCountChange?: (count: number) => void;
}

type Tab = "all" | "unread";

const typeMap: Record<string, { label: string; icon: string; badge: string }> =
  {
    like: {
      label: "Reaction",
      icon: "❤️",
      badge:
        "text-red-500 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400",
    },
    follow: {
      label: "Follow",
      icon: "👤",
      badge:
        "text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400",
    },
    repost: {
      label: "Repost",
      icon: "🔄",
      badge:
        "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400",
    },
    system: {
      label: "System",
      icon: "⚙️",
      badge:
        "text-slate-500 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400",
    },
  };

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function NotificationFeed({
  initialNotifications,
  userId,
  token,
  onUnreadCountChange,
}: NotificationFeedProps) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [tab, setTab] = useState<Tab>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [liveStatus, setLiveStatus] = useState<
    "connecting" | "online" | "offline"
  >("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const MAX_RECONNECT = 5;

  const updateUnreadCount = useCallback(
    (notifs: NotificationItem[]) => {
      if (onUnreadCountChange) {
        const count = notifs.filter((n) => !n.is_read).length;
        onUnreadCountChange(count);
      }
    },
    [onUnreadCountChange],
  );

  useEffect(() => {
    updateUnreadCount(initialNotifications);
  }, [initialNotifications, updateUnreadCount]);

  useEffect(() => {
    if (!userId) {
      setLiveStatus("offline");
      return;
    }

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;

      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      const isSecure = window.location.protocol === "https:";
      const protocol = isSecure ? "wss" : "ws";
      const host = "36.253.137.34:8005";
      const tokenParam = token ? `?token=${token}` : "";
      const socketUrl = `${protocol}://${host}/ws/notifications/${userId}/${tokenParam}`;

      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) {
          ws.close(1000, "Cancelled");
          return;
        }
        setLiveStatus("online");
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        if (cancelled) return;
        try {
          const data = JSON.parse(event.data);
          setNotifications((prev) => {
            const next = [data, ...prev];
            updateUnreadCount(next);
            return next;
          });
        } catch (err) {
          console.error("Failed to parse WS message:", err);
        }
      };

      ws.onerror = () => {
        if (cancelled) return;
        setLiveStatus("offline");
      };

      ws.onclose = (event) => {
        if (cancelled) return;
        setLiveStatus("offline");
        if (
          event.code !== 1000 &&
          event.code !== 1001 &&
          reconnectAttempts.current < MAX_RECONNECT
        ) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
          reconnectAttempts.current += 1;
          reconnectTimer.current = setTimeout(connect, delay);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        wsRef.current.close(1000, "Component unmounted");
        wsRef.current = null;
      }
    };
  }, [userId, token]);

  const markRead = async (item: NotificationItem) => {
    setNotifications((prev) => {
      const next = prev.map((n) =>
        n.id === item.id ? { ...n, is_read: true } : n,
      );
      updateUnreadCount(next);
      return next;
    });

    if (item.related_post_id) {
      router.push(`/posts/${item.related_post_id}`);
    } else if (item.sender) {
      router.push(`/${item.sender}`);
    }

    try {
      await NotificationService.markAsRead(item.id);
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllRead = async () => {
    const prev = notifications;
    const next = notifications.map((n) => ({ ...n, is_read: true }));

    setNotifications(next);
    updateUnreadCount(next);
    setMenuOpen(false);

    try {
      await NotificationService.markAllAsRead(userId);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setNotifications(prev);
      updateUnreadCount(prev);
    }
  };

  const deduplicated = notifications.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (n) =>
          n.sender === item.sender &&
          n.type === item.type &&
          n.related_post_id === item.related_post_id,
      ),
  );

  const unreadCount = deduplicated.filter(
    (n) => !n.is_read && n.type !== "chat_message",
  ).length;

  const filtered = (
    tab === "all"
      ? deduplicated
      : tab === "unread"
        ? notifications.filter((n) => !n.is_read)
        : notifications.filter((n) => n.is_read)
  ).filter((n) => n.type !== "chat_message");

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-foreground">
          Notifications
        </h1>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-transparent hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Notification options"
          >
            <MoreVertical />
          </button>

          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1.5 z-20 min-w-[180px] rounded-lg border border-border bg-popover shadow-md py-1"
            >
              <Button
                onClick={markAllRead}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
              >
                <Check size={16} />
                Mark all as read
              </Button>
              <Button
                variant="secondary"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
                onClick={() => router.push("/notifications")}
              >
                <LayoutGrid size={16} />
                View all
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        {(["all", "unread"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={(e) => {
              e.stopPropagation();
              setTab(t);
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm transition-all ${
              tab === t
                ? "bg-foreground text-background border-foreground font-medium"
                : "bg-transparent text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "unread" && unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-medium bg-destructive/10 text-destructive">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 pb-4 no-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-border text-muted-foreground text-sm">
            No notifications here.
          </div>
        ) : (
          filtered.map((item) => {
            const meta = typeMap[item.type] ?? typeMap.system;
            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  markRead(item);
                }}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  item.is_read
                    ? "bg-card border-border hover:bg-muted/50"
                    : "bg-blue-50/60 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 hover:bg-muted/50"
                }`}
              >
                <div className="relative w-10 h-10 flex-shrink-0">
                  {item.sender_avatar ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border relative">
                      <Image
                        src={getMediaUrl(item.sender_avatar) || ""}
                        alt={item.sender_username ?? "Sender avatar"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-semibold text-foreground">
                      {initials(item.sender_username ?? "?")}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-[11px] z-10">
                    {meta.icon}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${meta.badge}`}
                    >
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {item.title ??
                      `${item.sender_username} triggered an update.`}
                  </p>
                  {item.message && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                  )}
                </div>

                {!item.is_read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
