"use client";

import { useEffect, useState } from "react";
import { NotificationService } from "@/lib/services/notificationService";
import { NotificationFeed } from "@/components/NotificationFeed";
import { NotificationItem } from "@/types/notification";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Wait for user to be available from Redux
    if (!user) return;

    setLoading(true);
    NotificationService.getNotifications()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]); // re-run when user hydrates

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-4 px-2 md:px-0">
      <NotificationFeed
        initialNotifications={notifications}
        userId={user?.id || user?.uuid || ""}
        token={user?.accessToken ?? undefined}
      />
    </div>
  );
}
