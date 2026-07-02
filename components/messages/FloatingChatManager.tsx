"use client";

import { createPortal } from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import { closeChat, openChat } from "@/lib/store/features/chatUiSlice";
import FloatingChatBox from "./FloatingChatBox";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { MessageCircle, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import useDebounce from "@/lib/hooks/useDebounce";
import { ActiveChatUser } from "@/lib/store/features/messagesSlice";

const getLastMsgPreview = (msg: any, currentUserId: string): string => {
  const isMine = String(msg.sender) === currentUserId;
  const prefix = isMine ? "You: " : "";

  if (msg.message || msg.text || msg.body)
    return prefix + (msg.message || msg.text || msg.body);

  if (msg.attachment) {
    const url: string = msg.attachment;
    if (/\.(mp4|mov|webm|avi)$/i.test(url))
      return isMine ? "You sent a video 🎥" : "🎥 Video";
    if (/\.(jpg|jpeg|png|gif|webp|heic)$/i.test(url))
      return isMine ? "You sent a photo 📷" : "📷 Photo";
    return isMine ? "You sent a file 📎" : "📎 Attachment";
  }

  return "";
};

export default function FloatingChatManager() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [showList, setShowList] = useState(false);
  const [threads, setThreads] = useState<ActiveChatUser[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [search, setSearch] = useState("");
  const [mutualUsers, setMutualUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const lastFetchedAt = useRef<number>(0);
  const listRef = useRef<HTMLDivElement>(null);

  const { openChats } = useSelector((state: RootState) => state.chatUi);
  const { user } = useSelector((state: RootState) => state.auth);
  const currentUserId = user?.id ? String(user.id) : "";
  const dispatch = useDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const getToken = async () => {
      try {
        const res = await fetch("/api/auth/token");
        const data = await res.json();
        setToken(data.token ?? null);
      } catch {}
    };
    getToken();
  }, []);

  const fetchData = useCallback(async () => {
    if (!currentUserId) return;
    if (Date.now() - lastFetchedAt.current < 30_000) return;
    lastFetchedAt.current = Date.now();
    setLoadingThreads(true);
    try {
      const [chatsRes, mutualRes] = await Promise.all([
        fetch("/api/chats"),
        fetch("/api/users/mutual-users"),
      ]);

      if (chatsRes.ok) {
        const rawData = await chatsRes.json();
        const messages: any[] = Array.isArray(rawData) ? rawData : [];
        const map: Record<string, any> = {};
        messages.forEach((msg) => {
          const isMeSender = String(msg.sender) === currentUserId;
          const targetId = isMeSender ? msg.receiver : msg.sender;
          const targetFullName = isMeSender
            ? msg.receiver_full_name
            : msg.sender_full_name;
          const targetUsername = isMeSender
            ? msg.receiver_username
            : msg.sender_username;
          const targetAvatar = isMeSender
            ? msg.receiver_avatar
            : msg.sender_avatar;
          const msgTime = new Date(msg.created_at);
          if (!map[targetId] || new Date(map[targetId].rawTime) < msgTime) {
            map[targetId] = {
              id: String(targetId),
              conversation_id: msg.conversation_id || msg.room_id || null,
              name: targetFullName || targetUsername || "User",
              avatar: targetAvatar || null,
              lastMsg: getLastMsgPreview(msg, currentUserId),
              rawTime: msg.created_at,
              time: isNaN(msgTime.getTime())
                ? ""
                : msgTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
              unread: !msg.is_read && !isMeSender ? 1 : 0,
              active: false,
            };
          } else if (!msg.is_read && !isMeSender) {
            map[targetId].unread += 1;
          }
        });
        setThreads(
          Object.values(map).sort(
            (a: any, b: any) =>
              new Date(b.rawTime).getTime() - new Date(a.rawTime).getTime(),
          ) as ActiveChatUser[],
        );
      }

      if (mutualRes.ok) {
        const data = await mutualRes.json();
        setMutualUsers(data.mutual_friends ?? data ?? []);
      }
    } catch {
    } finally {
      setLoadingThreads(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (showList) fetchData();
  }, [showList, fetchData]);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const fetchSearch = async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(debouncedSearch)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    };
    fetchSearch();
  }, [debouncedSearch]);

  useEffect(() => {
    if (!showList) return;
    const handler = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showList]);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleOpenChat = (thread: ActiveChatUser) => {
    dispatch(
      openChat({
        id: thread.id,
        name: thread.name || "",
        avatar: thread.avatar ?? null,
        conversationId: thread.conversation_id ?? null,
      }),
    );
    setOpenIds((prev) => new Set(prev).add(thread.id));
    setShowList(false);
    setSearch("");
    setSearchResults([]);

    if (thread.unread ?? 0 > 0) {
      setThreads((prev) =>
        prev.map((t) => (t.id === thread.id ? { ...t, unread: 0 } : t)),
      );

      const formData = new FormData();
      formData.append("sender_id", thread.id);

      fetch("/api/chats/mark-as-read/", {
        method: "POST",
        body: formData,
      }).catch(() => {});
    }
  };

  const visibleChats = useMemo(
    () => openChats.filter((chat) => openIds.has(chat.id)),
    [openChats, openIds],
  );

  const totalUnread = threads.reduce((sum, t) => sum + (t.unread || 0), 0);

  const merged: ActiveChatUser[] = useMemo(
    () => [
      ...threads,
      ...mutualUsers
        .filter((u) => !threads.some((t) => String(t.id) === String(u.id)))
        .map(
          (u): ActiveChatUser => ({
            id: String(u.id),
            name: u.full_name || u.username || "User",
            avatar: u.avatar ?? null,
            active: u.online_status ?? false,
            lastMsg: "",
            time: "",
            unread: 0,
            conversation_id: undefined,
          }),
        ),
    ],
    [threads, mutualUsers],
  );

  const mergedWithPresence = useMemo(
    () =>
      merged.map((item) => {
        const match = mutualUsers.find((u) => String(u.id) === String(item.id));
        return match
          ? { ...item, active: match.online_status ?? item.active }
          : item;
      }),
    [merged, mutualUsers],
  );

  const displayList: ActiveChatUser[] = search.trim()
    ? searchResults.map(
        (u): ActiveChatUser => ({
          id: String(u.id),
          name: u.full_name || u.username || "User",
          avatar: u.avatar || u.profile_picture || null,
          active: u.online_status ?? false,
          lastMsg: u.username ? `@${u.username}` : "",
          time: "",
          unread: 0,
          conversation_id: undefined,
        }),
      )
    : mergedWithPresence;

  if (!mounted || !currentUserId) return null;

  return createPortal(
    <div className="hidden fixed bottom-0 right-4 z-50 md:flex items-end gap-3">
      {/* Chat boxes */}
      <div className="flex items-end gap-3">
        {visibleChats.map((chat) => (
          <FloatingChatBox
            key={chat.id}
            recipientId={chat.id}
            recipientName={chat.name}
            recipientAvatar={chat.avatar}
            conversationId={chat.conversationId}
            token={token}
            onClose={() => dispatch(closeChat(chat.id))}
            onMinimize={() => toggleOpen(chat.id)}
          />
        ))}
      </div>

      {/* Right column */}
      <div className="flex flex-col items-center gap-2 pb-3">
        <div className="flex flex-col-reverse items-center gap-2">
          {openChats.map((chat) => {
            const isOpen = openIds.has(chat.id);
            const avatarSrc = chat.avatar ? getMediaUrl(chat.avatar) : null;
            const initials = chat.name
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div key={chat.id} className="relative group">
                <button
                  onClick={() => toggleOpen(chat.id)}
                  className={cn(
                    "relative w-12 h-12 rounded-full border-2 overflow-hidden shadow-lg transition-all duration-200 hover:scale-110",
                    isOpen
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-card hover:border-primary/50",
                  )}
                >
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={chat.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {initials}
                    </div>
                  )}
                </button>

                <button
                  onClick={() => dispatch(closeChat(chat.id))}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-muted border border-border rounded-full hidden group-hover:flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="currentColor"
                  >
                    <path
                      d="M1 1l6 6M7 1L1 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground text-xs font-medium px-2 py-1 rounded-lg shadow-md border border-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {chat.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Messenger icon + popover */}
        <div className="relative" ref={listRef}>
          {showList && (
            <div className="absolute bottom-14 right-0 w-[300px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold">Messages</span>
                <button
                  onClick={() => setShowList(false)}
                  className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Search */}
              <div className="px-3 py-2 border-b border-border">
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search people..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                  />
                  {search && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setSearchResults([]);
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto max-h-[320px] py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
                {loadingThreads || searchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : displayList.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    {search ? "No users found" : "No conversations yet"}
                  </p>
                ) : (
                  displayList.map((thread) => {
                    const avatarSrc = thread.avatar
                      ? getMediaUrl(thread.avatar)
                      : null;
                    const initials = (thread.name || "U")
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    const isOnline = thread.active;

                    return (
                      <button
                        key={thread.id}
                        onClick={() => handleOpenChat(thread)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                            {avatarSrc ? (
                              <Image
                                src={avatarSrc}
                                alt={thread.name || ""}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold">
                                {initials}
                              </div>
                            )}
                          </div>
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={cn(
                                "text-xs truncate",
                                thread.unread
                                  ? "font-semibold text-foreground"
                                  : "font-medium text-foreground/80",
                              )}
                            >
                              {thread.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {thread.time}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "text-[11px] truncate mt-0.5",
                              thread.unread
                                ? "text-foreground font-medium"
                                : "text-muted-foreground",
                            )}
                          >
                            {thread.lastMsg || "Start a conversation"}
                          </p>
                        </div>

                        {/* Unread badge */}
                        {!!thread.unread && (
                          <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                            {thread.unread > 99 ? "99+" : thread.unread}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Icon button */}
          <button
            onClick={() => setShowList((v) => !v)}
            className={cn(
              "relative w-12 h-12 rounded-full shadow-lg border-2 flex items-center justify-center transition-all duration-200 hover:scale-110",
              showList
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-card border-border hover:border-primary/50 text-foreground",
            )}
          >
            <MessageCircle className="w-5 h-5" />
            {totalUnread > 0 && !showList && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 border-2 border-card">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
