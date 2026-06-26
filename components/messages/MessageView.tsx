"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { useChatBridge } from "@/lib/hooks/useChatBridge";
import { MutualUser } from "@/app/(main)/messages/page";
import { RootState } from "@/lib/store/store";
import {
  setActiveChatId,
  addMessage,
  setHistory,
  setHistoryLoading,
  markThreadAsRead,
  deleteThread,
  ActiveChatUser,
  ChatMessage,
} from "@/lib/store/features/messagesSlice";

import ChatSidebar from "./ChatSidebar";
import ChatAreaHeader from "./ChatAreaHeader";
import MessageGroup from "./MessageGroup";
import ChatInputForm from "./ChatInputForm";

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

export function avatarColor(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return PALETTE[n % PALETTE.length];
}

export function Avatar({
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

  const dispatch = useDispatch();
  const { activeChatId, chatHistories, loadingHistory } = useSelector(
    (state: RootState) => state.messages,
  );

  const messages = activeChatId ? chatHistories[activeChatId] || [] : [];
  const loading = activeChatId ? loadingHistory[activeChatId] || false : false;

  const [tempChat, setTempChat] = useState<ActiveChatUser | null>(null);
  const [typeMessage, setTypeMessage] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [autoDelete24h, setAutoDelete24h] = useState(false);
  const [search, setSearch] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [hasMediaFiles, setHasMediaFiles] = useState(false);
  const mediaSendRef = useRef<(() => Promise<void>) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesBodyRef = useRef<HTMLDivElement | null>(null);

  const getChatName = (c: ActiveChatUser) =>
    c.name || c.full_name || c.username || "User";
  const getChatAvatar = (c: ActiveChatUser) =>
    c.avatar || c.profile_picture || null;
  const getChatActiveStatus = (c: ActiveChatUser) =>
    !!(c.active || c.is_active);

  const allConversations: ActiveChatUser[] =
    tempChat && !conversations.find((c) => String(c.id) === String(tempChat.id))
      ? [tempChat, ...conversations]
      : conversations;

  const currentChat = allConversations.find(
    (c) => String(c.id) === String(activeChatId),
  );
  const activeRoomId = currentChat?.conversation_id || activeChatId;

  const getLiveOnlineStatus = useCallback(
    (userId: string, fallback: boolean) =>
      mutualUsers.find((u) => String(u.id) === String(userId))?.online_status ??
      fallback,
    [mutualUsers],
  );

  const markAsRead = useCallback(
    (chatId: string) => {
      dispatch(markThreadAsRead(chatId));
      fetch(`/api/chats/mark-as-read/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_id: chatId }),
      }).catch(() => {});
    },
    [dispatch],
  );

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
      dispatch(setActiveChatId(userId));
    },
    [conversations, tempChat, markAsRead, dispatch],
  );

  const handleCloseChat = useCallback(() => {
    dispatch(setActiveChatId(null));
    setTempChat(null);
  }, [dispatch]);

  const handleIncomingMessage = useCallback(
    (data: any) => {
      if (data.type !== "chat_message") return;
      if (String(data.sender) === String(currentUserIdRef.current)) return;
      dispatch(
        addMessage({
          chatId: String(data.sender),
          message: {
            id: data.id || String(Date.now()),
            sender: data.sender,
            sender_username: data.sender_username,
            sender_full_name: data.sender_full_name,
            sender_avatar: data.sender_avatar ?? null,
            message: data.message || "",
            created_at: data.created_at || new Date().toISOString(),
          },
          currentUserId: currentUserIdRef.current,
        }),
      );
    },
    [dispatch],
  );

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

  const chatHistoriesRef = useRef(chatHistories);
  useEffect(() => {
    chatHistoriesRef.current = chatHistories;
  }, [chatHistories]);

  useEffect(() => {
    if (!activeChatId) {
      return;
    }
    const existingHistory = chatHistoriesRef.current[activeChatId];
    const fetchHistory = async () => {
      if (!existingHistory) {
        dispatch(setHistoryLoading({ chatId: activeChatId, loading: true }));
      }
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
          const sorted = [...raw].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );
          dispatch(setHistory({ chatId: activeChatId, messages: sorted }));
        }
      } catch (err) {
        console.error("Fetch chat history error:", err);
      } finally {
        dispatch(setHistoryLoading({ chatId: activeChatId, loading: false }));
        setTimeout(() => scrollToBottom("instant"), 50);
      }
    };
    fetchHistory();
  }, [activeChatId, dispatch, scrollToBottom]);

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
    dispatch(
      addMessage({
        chatId: activeChatId,
        message: {
          id: String(Date.now()),
          sender: currentUserId,
          message: typeMessage.trim(),
          created_at: new Date().toISOString(),
        },
        currentUserId: currentUserId,
      }),
    );
    setTypeMessage("");
  };

  const handleDeleteConversation = async (chatId: string) => {
    if (deleteLoading) return;
    setDeleteLoading(chatId);
    try {
      await fetch("/api/chats/delete-conversation/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ with_user: chatId }),
      });
      dispatch(deleteThread(chatId));
      if (tempChat && String(tempChat.id) === String(chatId)) {
        setTempChat(null);
      }
    } catch (err) {
      console.error("Delete conversation error:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSentMedia = useCallback(
    (newMsg: any) => {
      dispatch(
        addMessage({
          chatId: activeChatId!,
          message: newMsg,
          currentUserId,
        }),
      );
    },
    [dispatch, activeChatId, currentUserId],
  );

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

  return (
    <div
      className={`flex w-full bg-background font-sans antialiased overflow-hidden ${
        activeChatId
          ? "h-[calc(100dvh-72px)] md:h-[calc(100vh-80px)]"
          : "h-[calc(100dvh-64px)] md:h-[calc(100vh-72px)]"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`flex flex-col bg-background border-r border-border/60 shrink-0 transition-all duration-300 ease-in-out ${
          activeChatId === null
            ? "w-full md:w-[360px]"
            : "hidden md:flex md:w-[280px]"
        }`}
      >
        <ChatSidebar
          conversations={conversations}
          mutualUsers={mutualUsers}
          search={search}
          onSearchChange={setSearch}
          activeChatId={activeChatId}
          onOpenChat={handleOpenChat}
          onClose={onClose}
          onDeleteConversation={handleDeleteConversation}
          deleteLoading={deleteLoading}
          getLiveOnlineStatus={getLiveOnlineStatus}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden transition-all duration-300">
        {activeChatId !== null && currentChat ? (
          <div className="flex flex-col flex-1 bg-background relative min-w-0 overflow-hidden">
            <ChatAreaHeader
              currentChat={currentChat}
              isOnline={getLiveOnlineStatus(
                currentChat.id,
                getChatActiveStatus(currentChat),
              )}
              autoDelete24h={autoDelete24h}
              onToggleAutoDelete={() => setAutoDelete24h((v) => !v)}
              onCloseChat={handleCloseChat}
            />
            <div
              ref={messagesBodyRef}
              className="flex-1 overflow-y-auto no-scrollbar pl-4 py-2 space-y-1 bg-muted/5 relative"
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
                    if (item.type === "date")
                      return <DateSeparator key={item.key} date={item.label} />;
                    return (
                      <MessageGroup
                        key={item.key}
                        group={item.group}
                        currentChatName={getChatName(currentChat)}
                        currentChatAvatar={getChatAvatar(currentChat)}
                        currentUserAvatar={user?.avatar}
                      />
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
            <ChatInputForm
              activeChatId={activeChatId}
              isSendReady={isSendReady}
              typeMessage={typeMessage}
              onTypeMessageChange={setTypeMessage}
              loading={loading}
              hasMediaFiles={hasMediaFiles}
              onHasFilesChange={setHasMediaFiles}
              mediaSendRef={mediaSendRef}
              chatPartnerName={getChatName(currentChat)}
              onSubmit={handleSendMessage}
              onSentMedia={handleSentMedia}
            />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-muted/10 gap-3">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
              <svg
                className="text-muted-foreground/40 rotate-[-10deg]"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">Your messages</p>
            <p className="text-xs text-muted-foreground">
              Select a conversation or start a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
