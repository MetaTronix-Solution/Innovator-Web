export interface NotificationItem {
  id: string;
  user: string;
  sender: string;
  sender_username: string;
  sender_avatar: string | null;
  type: "system" | "repost" | "like" | "follow";
  title: string;
  message: string;
  related_post_id: string | null;
  is_read: boolean;
  created_at: string;
}
