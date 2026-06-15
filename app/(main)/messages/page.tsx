"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import MessagesView, {
  ActiveChatUser,
} from "@/components/messages/MessageView";
import { RootState } from "@/lib/store/store";
import { setThreads, setThreadsLoading } from "@/lib/store/features/messagesSlice";

export interface MutualUser {
  id: string;
  username: string;
  full_name: string;
  avatar: string | null;
  online_status: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { threads } = useSelector((state: RootState) => state.messages);
  const [mutualUsers, setMutualUsers] = useState<MutualUser[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(threads.length === 0);

  const { user } = useSelector((state: RootState) => state.auth);
  const currentUserId = user?.id ? String(user.id) : "";

  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await fetch("/api/auth/token");
        const data = await res.json();
        setToken(data.token ?? null);
      } catch (err) {
        console.error("Failed to get token:", err);
      }
    };
    getToken();
  }, []);

  const fetchMutualUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users/mutual-users");
      if (res.ok) {
        const data = await res.json();
        const friends: MutualUser[] = data.mutual_friends ?? data ?? [];
        setMutualUsers(friends);
      }
    } catch (error) {
      console.error("Failed to fetch mutual users:", error);
    }
  }, []);

  useEffect(() => {
    fetchMutualUsers();
    const interval = setInterval(fetchMutualUsers, 30_000);
    return () => clearInterval(interval);
  }, [fetchMutualUsers]);

  useEffect(() => {
    if (!currentUserId) return;

    const initializeChatWorkspace = async () => {
      try {
        if (threads.length === 0) {
          dispatch(setThreadsLoading(true));
        }
        const response = await fetch("/api/chats");
        if (response.ok) {
          const rawData = await response.json();
          const messagesArray: any[] = Array.isArray(rawData) ? rawData : [];

          const threadsMap: Record<string, any> = {};

          messagesArray.forEach((msg: any) => {
            const isMeSender = String(msg.sender) === currentUserId;
            const targetId = isMeSender ? msg.receiver : msg.sender;
            const targetUsername = isMeSender
              ? msg.receiver_username
              : msg.sender_username;
            const targetFullName = isMeSender
              ? msg.receiver_full_name
              : msg.sender_full_name;
            const targetAvatar = isMeSender
              ? msg.receiver_avatar
              : msg.sender_avatar;

            const msgTime = new Date(msg.created_at);

            if (
              !threadsMap[targetId] ||
              new Date(threadsMap[targetId].rawTime) < msgTime
            ) {
              threadsMap[targetId] = {
                id: targetId,
                conversation_id: msg.conversation_id || msg.room_id || null,
                name: targetFullName || targetUsername || "User",
                active: false,
                time: isNaN(msgTime.getTime())
                  ? ""
                  : msgTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                rawTime: msg.created_at,
                lastMsg:
                  msg.message || msg.text || msg.body || msg.content || "",
                unread: !msg.is_read && !isMeSender ? 1 : 0,
                avatar: targetAvatar || null,
              };
            } else if (!msg.is_read && !isMeSender) {
              threadsMap[targetId].unread += 1;
            }
          });

          const sortedThreads: ActiveChatUser[] = Object.values(
            threadsMap,
          ).sort(
            (a: any, b: any) =>
              new Date(b.rawTime).getTime() - new Date(a.rawTime).getTime(),
          );

          dispatch(setThreads(sortedThreads));
        }
      } catch (error) {
        console.error("Failed compiling message workspace datasets:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChatWorkspace();
  }, [currentUserId, dispatch, threads.length]);

  const threadsWithPresence: ActiveChatUser[] = threads.map(
    (thread) => {
      const match = mutualUsers.find((u) => String(u.id) === String(thread.id));
      return match ? { ...thread, active: match.online_status } : thread;
    },
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-72px)] w-full items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <MessagesView
      conversations={threadsWithPresence}
      mutualUsers={mutualUsers}
      token={token}
      onClose={() => router.push("/")}
    />
  );
}
