"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import {
  X,
  Plus,
  Smile,
  Send,
  Loader2,
  Trash2,
  Clock,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { useChatBridge } from "@/lib/hooks/useChatBridge";
import { MutualUser } from "@/app/(main)/messages/page";
import { MediaBubble, MediaUploadButton } from "./MediaUploadButton";

interface ChatMessage {
  id: string;
  sender: string | number;
  sender_username?: string;
  sender_full_name?: string;
  sender_avatar?: string | null;
  message?: string;
  text?: string;
  body?: string;
  content?: string;
  attachment?: string | null;
  created_at: string;
}

export interface ActiveChatUser {
  id: string;
  conversation_id?: string;
  name?: string;
  username?: string;
  full_name?: string;
  active?: boolean;
  is_active?: boolean;
  time?: string;
  lastMsg?: string;
  last_message?: string;
  unread?: number;
  avatar?: string | null;
  profile_picture?: string | null;
}

interface MessagesViewProps {
  conversations: ActiveChatUser[];
  mutualUsers: MutualUser[];
  token: string | null;
  onClose: () => void;
}

const PALETTE = [
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-lime-100 text-lime-700",
];

function avatarColor(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return PALETTE[n % PALETTE.length];
}

function Avatar({
  src,
  name,
  id,
  size = 40,
  online = false,
  dotSize = 10,
}: {
  src?: string | null;
  name: string;
  id: string;
  size?: number;
  online?: boolean;
  dotSize?: number;
}) {
  const resolved = getMediaUrl(src);
  return (
    <div
      className="relative shrink-0 rounded-full flex items-center justify-center font-medium"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {resolved ? (
        <Image
          src={resolved}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-cover rounded-full"
          unoptimized
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center rounded-full ${avatarColor(id)}`}
        >
          {name[0]?.toUpperCase() || "?"}
        </div>
      )}
      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full bg-green-500 border-2 border-background z-10"
          style={{
            width: dotSize + 4,
            height: dotSize + 4,
            transform: "translate(10%, 10%)",
          }}
        />
      )}
    </div>
  );
}

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center justify-center gap-3 my-1">
      <span className="text-[11px] text-center text-muted-foreground/60 font-medium whitespace-nowrap">
        {date}
      </span>
    </div>
  );
}

function formatTime(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatDateLabel(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function groupMessages(messages: ChatMessage[], currentUserId: string) {
  const groups: {
    senderId: string;
    messages: ChatMessage[];
    isMine: boolean;
  }[] = [];
  messages.forEach((msg) => {
    const isMine = String(msg.sender) === String(currentUserId);
    const last = groups[groups.length - 1];
    if (last && String(last.senderId) === String(msg.sender)) {
      last.messages.push(msg);
    } else {
      groups.push({ senderId: String(msg.sender), messages: [msg], isMine });
    }
  });
  return groups;
}

export default function MessagesView({
  conversations: rawConversations = [],
  mutualUsers = [],
  token,
  onClose,
}: MessagesViewProps) {
  const stableToken = typeof token === "string" ? token : null;

  const conversations: ActiveChatUser[] = Array.isArray(rawConversations)
    ? rawConversations
    : (rawConversations as any)?.messages &&
        Array.isArray((rawConversations as any).messages)
      ? (rawConversations as any).messages
      : [];

  const { user } = useSelector((state: any) => state.auth);
  const currentUserId = user?.id || "";
  const currentUserIdRef = useRef(currentUserId);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [tempChat, setTempChat] = useState<ActiveChatUser | null>(null);
  const [localUnread, setLocalUnread] = useState<Record<string, number>>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typeMessage, setTypeMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [autoDelete24h, setAutoDelete24h] = useState(false);
  const [search, setSearch] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [hasMediaFiles, setHasMediaFiles] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const mediaSendRef = useRef<(() => Promise<void>) | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesBodyRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getChatName = (c: ActiveChatUser) =>
    c.name || c.full_name || c.username || "User";
  const getChatAvatar = (c: ActiveChatUser) =>
    c.avatar || c.profile_picture || null;
  const getChatActiveStatus = (c: ActiveChatUser) =>
    !!(c.active || c.is_active);
  const getChatLastMsg = (c: ActiveChatUser) =>
    c.lastMsg || c.last_message || "";

  const allConversations: ActiveChatUser[] = (
    tempChat && !conversations.find((c) => String(c.id) === String(tempChat.id))
      ? [tempChat, ...conversations]
      : conversations
  ).filter((c) => !deletedIds.has(String(c.id)));

  const filteredConversations = search.trim()
    ? allConversations.filter((c) =>
        getChatName(c).toLowerCase().includes(search.toLowerCase()),
      )
    : allConversations;

  const currentChat = allConversations.find(
    (c) => String(c.id) === String(activeChatId),
  );
  const activeRoomId = currentChat?.conversation_id || activeChatId;

  const getLiveOnlineStatus = (userId: string, fallback: boolean) =>
    mutualUsers.find((u) => String(u.id) === String(userId))?.online_status ??
    fallback;

  const getUnreadCount = (chat: ActiveChatUser) =>
    localUnread[chat.id] !== undefined
      ? localUnread[chat.id]
      : (chat.unread ?? 0);

  const markAsRead = useCallback((chatId: string) => {
    setLocalUnread((prev) => ({ ...prev, [chatId]: 0 }));
    fetch(`/api/chats/mark-as-read/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender_id: chatId }),
    }).catch(() => {});
  }, []);

  const handleOpenChat = useCallback(
    (userId: string, meta?: Partial<ActiveChatUser>) => {
      const existsInConversations = conversations.some(
        (c) => String(c.id) === String(userId),
      );
      const existsInTemp = tempChat && String(tempChat.id) === String(userId);
      if (!existsInConversations && !existsInTemp && meta) {
        setTempChat({ id: userId, ...meta });
      }
      markAsRead(userId);
      setActiveChatId(userId);
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [conversations, tempChat, markAsRead],
  );

  const handleStartChat = (u: MutualUser) =>
    handleOpenChat(u.id, {
      name: u.full_name || u.username || "User",
      avatar: u.avatar,
      active: u.online_status,
    });

  const handleCloseChat = () => {
    setActiveChatId(null);
    setTempChat(null);
    setMessages([]);
  };

  const handleIncomingMessage = useCallback((data: any) => {
    if (data.type !== "chat_message") return;
    if (String(data.sender) === String(currentUserIdRef.current)) return;
    setMessages((prev) => [
      ...prev,
      {
        id: data.id || String(Date.now()),
        sender: data.sender,
        sender_username: data.sender_username,
        sender_full_name: data.sender_full_name,
        sender_avatar: data.sender_avatar ?? null,
        message: data.message || "",
        created_at: data.created_at || new Date().toISOString(),
      },
    ]);
  }, []);

  const { sendMessage, isSendReady } = useChatBridge(
    activeRoomId,
    activeRoomId,
    stableToken,
    stableToken,
    handleIncomingMessage,
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const el = messagesBodyRef.current;
    if (!el) return;
    const handler = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(distFromBottom > 200);
    };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/chats/?with_user=${activeChatId}`);
        if (res.ok) {
          const data = await res.json();
          let raw: ChatMessage[] = [];
          if (data && typeof data === "object" && "messages" in data) {
            raw = Array.isArray(data.messages) ? data.messages : [];
          } else if (Array.isArray(data)) {
            raw = data;
          }
          setMessages(
            [...raw].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
            ),
          );
        }
      } catch (err) {
        console.error("Fetch chat history error:", err);
      } finally {
        setLoading(false);
        setTimeout(() => scrollToBottom("instant"), 50);
      }
    };
    fetchHistory();
  }, [activeChatId, scrollToBottom]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasMediaFiles && mediaSendRef.current) {
      await mediaSendRef.current();
    }
    if (!typeMessage.trim() || !activeChatId) return;
    sendMessage({
      message: typeMessage.trim(),
      sender_id: currentUserId,
      receiver_id: activeChatId,
      expire_after_24h: autoDelete24h,
    });
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: currentUserId,
        message: typeMessage.trim(),
        created_at: new Date().toISOString(),
      },
    ]);
    setTypeMessage("");
  };

  const handleDeleteConversation = async (chatId: string) => {
    if (deleteLoading) return;
    setDeleteLoading(chatId);
    setMenuOpenId(null);
    try {
      await fetch("/api/chats/delete-conversation/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ with_user: chatId }),
      });
      setDeletedIds((prev) => new Set([...prev, String(chatId)]));
      if (String(activeChatId) === String(chatId)) {
        handleCloseChat();
      }
      if (tempChat && String(tempChat.id) === String(chatId)) {
        setTempChat(null);
      }
    } catch (err) {
      console.error("Delete conversation error:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const grouped = groupMessages(messages, currentUserId);

  let lastDateLabel = "";
  type RenderedItem =
    | { type: "date"; label: string; key: string }
    | { type: "group"; group: (typeof grouped)[0]; key: string };

  const renderedItems: RenderedItem[] = [];
  grouped.forEach((group, gi) => {
    const firstMsg = group.messages[0];
    const label = formatDateLabel(firstMsg.created_at);
    if (label && label !== lastDateLabel) {
      lastDateLabel = label;
      renderedItems.push({ type: "date", label, key: `date-${gi}` });
    }
    renderedItems.push({ type: "group", group, key: `group-${gi}` });
  });

  const totalUnread = allConversations.reduce(
    (sum, c) => sum + getUnreadCount(c),
    0,
  );

  return (
    <div className="flex h-[calc(100vh-72px)] w-full bg-background font-sans antialiased overflow-hidden">
      <div
        className={`flex flex-col bg-background transition-all duration-300 ease-in-out border-r border-border/60 shrink-0 ${
          activeChatId === null
            ? "w-full md:w-[360px]"
            : "hidden md:flex md:w-[280px]"
        }`}
      >
        <div className="hidden md:flex items-center justify-between px-4 h-[40px] border-b border-border/60 shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-foreground">
              Messages
            </h2>
            {totalUnread > 0 && (
              <span className="min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1">
                {totalUnread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {activeChatId === null && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {activeChatId === null && (
          <div className="px-3 py-2.5 border-b border-border/60 hidden md:block">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages…"
                className="w-full h-8 rounded-full bg-muted/50 border border-border/60 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-orange-500/30 transition"
              />
            </div>
          </div>
        )}

        {mutualUsers.length > 0 && (
          <div className="border-b border-border/60 shrink-0">
            <div className="px-4 pt-3 pb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2.5">
                People you know
              </p>
              <div className="flex flex-row gap-4 overflow-x-auto no-scrollbar pb-3">
                {mutualUsers.map((u) => {
                  const isOnline = u.online_status;
                  const displayName = u.full_name || u.username || "User";
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleStartChat(u)}
                      className="flex flex-col items-center gap-1.5 group shrink-0 focus:outline-none"
                    >
                      <div className="p-1">
                        <div
                          className={`relative rounded-full transition-transform group-hover:scale-105 ${
                            isOnline
                              ? "ring-2 ring-green-400"
                              : "ring-2 ring-border/30"
                          }`}
                        >
                          <Avatar
                            src={u.avatar}
                            name={displayName}
                            id={u.id}
                            size={44}
                            online={isOnline}
                            dotSize={10}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] text-muted-foreground/80 truncate max-w-[52px]">
                        {displayName.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredConversations.length > 0 && (
            <div className="pb-2">
              {filteredConversations.map((chat) => {
                const isActive = String(activeChatId) === String(chat.id);
                const isOnline = getLiveOnlineStatus(
                  chat.id,
                  getChatActiveStatus(chat),
                );
                const unread = getUnreadCount(chat);
                const displayName = getChatName(chat);
                const isDeleting = deleteLoading === chat.id;

                return (
                  <div
                    key={chat.id}
                    className={`w-full flex items-center gap-3 px-3 py-3 transition-colors relative ${
                      isActive
                        ? "bg-muted/60 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-orange-500 before:rounded-r-full"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    {/* Main clickable area */}
                    <button
                      className="flex items-center gap-3 flex-1 min-w-0 text-left focus:outline-none"
                      onClick={() => handleOpenChat(chat.id)}
                    >
                      <Avatar
                        src={getChatAvatar(chat)}
                        name={displayName}
                        id={chat.id}
                        size={40}
                        online={isOnline}
                        dotSize={10}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className={`text-[13px] truncate ${unread > 0 ? "font-semibold text-foreground" : "font-medium text-foreground"}`}
                          >
                            {displayName}
                          </span>
                          <span className="text-[11px] text-muted-foreground/60 ml-2 shrink-0">
                            {chat.time || ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs truncate ${unread > 0 ? "text-foreground font-medium" : "text-muted-foreground/70"}`}
                          >
                            {getChatLastMsg(chat)}
                          </p>
                          {unread > 0 && (
                            <span className="min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center px-1 shrink-0">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* More menu */}
                    <div
                      className="relative shrink-0"
                      ref={menuOpenId === chat.id ? menuRef : null}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(
                            menuOpenId === chat.id ? null : chat.id,
                          );
                        }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition-colors focus:outline-none"
                      >
                        {isDeleting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <MoreHorizontal size={15} />
                        )}
                      </button>

                      {menuOpenId === chat.id && (
                        <div className="absolute right-0 top-8 z-50 w-48 bg-background border border-border/60 rounded-xl shadow-lg overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(chat.id);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete conversation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-border/60">
            <div className="px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Start a new chat
            </div>
            {mutualUsers.map((u) => {
              const hasExistingChat = filteredConversations.some(
                (c) => String(c.id) === String(u.id),
              );
              if (hasExistingChat) return null;
              return (
                <button
                  key={u.id}
                  onClick={() => handleStartChat(u)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                >
                  <Avatar
                    src={u.avatar}
                    name={u.full_name || u.username || "User"}
                    id={u.id}
                    size={40}
                    online={u.online_status}
                    dotSize={10}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground">
                      {u.full_name || u.username || "User"}
                    </p>
                    <p className="text-[11px] text-orange-500 font-medium">
                      Start conversation
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeChatId === null && (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-muted/10 gap-3">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <Send
              size={28}
              className="text-muted-foreground/40 rotate-[-10deg]"
            />
          </div>
          <p className="text-sm font-medium text-foreground">Your messages</p>
          <p className="text-xs text-muted-foreground">
            Select a conversation or start a new one
          </p>
        </div>
      )}

      {activeChatId !== null && currentChat && (
        <div className="flex-1 flex flex-col bg-background relative min-w-0 border border-primary/50 overflow-hidden">
          <div className="px-2 h-[60px] border-b border-border/60 flex items-center gap-3 shrink-0 bg-background">
            <button
              onClick={handleCloseChat}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>
            <Avatar
              src={getChatAvatar(currentChat)}
              name={getChatName(currentChat)}
              id={currentChat.id}
              size={36}
              online={getLiveOnlineStatus(
                currentChat.id,
                getChatActiveStatus(currentChat),
              )}
              dotSize={9}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
                {getChatName(currentChat)}
              </p>
              <p className="text-[11px] font-medium leading-tight">
                {getLiveOnlineStatus(
                  currentChat.id,
                  getChatActiveStatus(currentChat),
                ) ? (
                  <span className="text-green-500">Active now</span>
                ) : (
                  <span className="text-muted-foreground/60">Offline</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setAutoDelete24h((v) => !v)}
                className={`hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  autoDelete24h
                    ? "bg-orange-500/10 border-orange-500/50 text-orange-600 dark:text-orange-400"
                    : "bg-muted/40 border-border/60 text-muted-foreground"
                }`}
              >
                <Clock
                  size={11}
                  className={autoDelete24h ? "text-orange-500" : ""}
                />
                {autoDelete24h ? "24h on" : "24h off"}
              </button>
              <button
                onClick={handleCloseChat}
                className="hidden md:flex w-8 h-8 rounded-full hover:bg-muted/50 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div
            ref={messagesBodyRef}
            className="flex-1 overflow-y-auto no-scrollbar pl-4 py-4 space-y-1 bg-muted/5 relative"
          >
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <Avatar
                  src={getChatAvatar(currentChat)}
                  name={getChatName(currentChat)}
                  id={currentChat.id}
                  size={56}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {getChatName(currentChat)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No messages yet — say hello!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {renderedItems.map((item) => {
                  if (item.type === "date") {
                    return <DateSeparator key={item.key} date={item.label} />;
                  }
                  const { group } = item;
                  const firstMsg = group.messages[0];
                  const lastMsg = group.messages[group.messages.length - 1];
                  const senderName =
                    firstMsg.sender_full_name ||
                    (group.isMine ? "You" : getChatName(currentChat));
                  const senderAvatarSrc = group.isMine
                    ? user?.avatar
                    : firstMsg.sender_avatar || getChatAvatar(currentChat);

                  return (
                    <div
                      key={item.key}
                      className={`flex items-end gap-2 mb-2 ${
                        group.isMine ? "flex-row-reverse pr-1" : "flex-row"
                      }`}
                    >
                      <div className="shrink-0 self-end mb-1">
                        {!group.isMine && (
                          <Avatar
                            src={senderAvatarSrc}
                            name={senderName}
                            id={String(firstMsg.sender)}
                            size={26}
                          />
                        )}
                      </div>

                      <div
                        className={`flex flex-col gap-[3px] ${
                          group.isMine
                            ? "items-end max-w-[72%] ml-auto"
                            : "items-start max-w-[72%]"
                        }`}
                      >
                        {(() => {
                          const elements: React.ReactNode[] = [];
                          let i = 0;
                          while (i < group.messages.length) {
                            const msg = group.messages[i];
                            const textBody =
                              msg.message ||
                              msg.text ||
                              msg.body ||
                              msg.content ||
                              "";

                            if (msg.attachment && !textBody.trim()) {
                              const attachmentBatch: string[] = [];
                              const batchIds: string[] = [];
                              while (
                                i < group.messages.length &&
                                group.messages[i].attachment &&
                                !(
                                  group.messages[i].message ||
                                  group.messages[i].text ||
                                  group.messages[i].body ||
                                  group.messages[i].content ||
                                  ""
                                ).trim()
                              ) {
                                attachmentBatch.push(
                                  group.messages[i].attachment!,
                                );
                                batchIds.push(group.messages[i].id);
                                i++;
                              }
                              elements.push(
                                <div
                                  key={batchIds.join("-")}
                                  className="w-full"
                                >
                                  <MediaBubble
                                    attachments={attachmentBatch}
                                    isMine={group.isMine}
                                  />
                                </div>,
                              );
                              continue;
                            }

                            const isFirst = i === 0;
                            const isLast = i === group.messages.length - 1;
                            elements.push(
                              <div key={msg.id} className="w-full">
                                {msg.attachment && (
                                  <MediaBubble
                                    attachments={[msg.attachment]}
                                    isMine={group.isMine}
                                  />
                                )}
                                {textBody.trim() && (
                                  <div
                                    className={`inline-block px-3.5 py-2 text-[13px] leading-relaxed break-words max-w-full ${
                                      group.isMine
                                        ? "bg-orange-600 text-white"
                                        : "bg-card text-foreground border border-border/60"
                                    } ${
                                      group.isMine
                                        ? isFirst && isLast
                                          ? "rounded-2xl rounded-br-[5px]"
                                          : isFirst
                                            ? "rounded-2xl rounded-br-[5px] rounded-bl-2xl"
                                            : isLast
                                              ? "rounded-2xl rounded-br-[5px]"
                                              : "rounded-[10px] rounded-r-[5px]"
                                        : isFirst && isLast
                                          ? "rounded-2xl rounded-bl-[5px]"
                                          : isFirst
                                            ? "rounded-2xl rounded-bl-[5px] rounded-br-2xl"
                                            : isLast
                                              ? "rounded-2xl rounded-bl-[5px]"
                                              : "rounded-[10px] rounded-l-[5px]"
                                    }`}
                                  >
                                    {textBody}
                                  </div>
                                )}
                              </div>,
                            );
                            i++;
                          }
                          return elements;
                        })()}
                        {formatTime(lastMsg.created_at) && (
                          <p
                            className={`text-[10px] text-muted-foreground/50 font-medium mt-0.5 ${
                              group.isMine ? "text-right mr-1" : "ml-1"
                            }`}
                          >
                            {formatTime(lastMsg.created_at)}
                            {group.isMine && <span className="ml-1">✓✓</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            <div ref={messagesEndRef} />

            {showScrollBtn && (
              <button
                onClick={() => scrollToBottom("smooth")}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm hover:bg-orange-600 transition-colors z-10"
              >
                ↓ New messages
              </button>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 px-3 py-2.5 border-t border-border/60 bg-background relative">
            <input ref={fileInputRef} type="file" className="hidden" />
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-2 bg-muted/40 border border-border/80 rounded-2xl px-3 py-2 focus-within:border-orange-500/40 transition-colors">
                <button
                  type="button"
                  className="text-muted-foreground/70 hover:text-foreground transition-colors shrink-0"
                >
                  <Plus size={16} />
                </button>
                <MediaUploadButton
                  activeChatId={activeChatId}
                  disabled={loading || !isSendReady}
                  onSent={(newMsg) => setMessages((prev) => [...prev, newMsg])}
                  onHasFilesChange={setHasMediaFiles}
                  triggerSendRef={mediaSendRef}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={typeMessage}
                  disabled={loading || (!!activeChatId && !isSendReady)}
                  onChange={(e) => setTypeMessage(e.target.value)}
                  placeholder={`Message ${getChatName(currentChat).split(" ")[0]}…`}
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground/40 min-w-0"
                />
                <button
                  type="button"
                  className="text-muted-foreground/70 hover:text-foreground transition-colors shrink-0"
                >
                  <Smile size={16} />
                </button>
              </div>
              <button
                type="submit"
                disabled={
                  (!typeMessage.trim() && !hasMediaFiles) ||
                  loading ||
                  (!!activeChatId && !isSendReady)
                }
                className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500 disabled:opacity-30 transition-all active:scale-95 shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
