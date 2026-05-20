import { NotificationItem } from "@/types/notification";

export class NotificationService {
  static async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error inside client NotificationService:", error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string | number): Promise<void> {
    try {
      const response = await fetch("/api/notifications/mark-as-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: notificationId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error(
        "Error inside client NotificationService.markAsRead:",
        error,
      );
      throw error;
    }
  }

  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const response = await fetch("/api/notifications/mark-all-as-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! Status: ${response.status}`,
        );
      }
    } catch (error) {
      console.error(
        "Error inside client NotificationService.markAllAsRead:",
        error,
      );
      throw error;
    }
  }
}
