"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { X, Plus, Image as ImageIcon, Smile, Send } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

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
  token: string | null;
  onClose: () => void;
}

export default function MessagesView({
  conversations: rawConversations = [],
  token,
  onClose,
}: MessagesViewProps) {
  console.log("MessagesView render — token:", token, "type:", typeof token);

  const stableToken = typeof token === "string" ? token : null;

  console.log("stableToken:", stableToken);
  const conversations = Array.isArray(rawConversations)
    ? rawConversations
    : (rawConversations as any)?.messages &&
        Array.isArray((rawConversations as any).messages)
      ? (rawConversations as any).messages
      : [];

  const { user } = useSelector((state: any) => state.auth);
  const currentUserId = user?.id || "";

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typeMessage, setTypeMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoDelete24h, setAutoDelete24h] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getChatName = (chat: ActiveChatUser) =>
    chat.name || chat.full_name || chat.username || "User";
  const getChatAvatar = (chat: ActiveChatUser) =>
    chat.avatar || chat.profile_picture || null;
  const getChatActiveStatus = (chat: ActiveChatUser) =>
    !!(chat.active || chat.is_active);
  const getChatLastMsg = (chat: ActiveChatUser) =>
    chat.lastMsg || chat.last_message || "";

  const activeUsers = conversations.filter((chat) => getChatActiveStatus(chat));
  const currentChat = conversations.find(
    (chat) => String(chat.id) === String(activeChatId),
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const fetchChatHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/chats/?with_user=${activeChatId}`);
        if (response.ok) {
          const data = await response.json();

          let rawMessages = [];
          if (data && typeof data === "object" && "messages" in data) {
            rawMessages = Array.isArray(data.messages) ? data.messages : [];
          } else if (Array.isArray(data)) {
            rawMessages = data;
          }

          const sortedMessages = rawMessages.sort(
            (a: ChatMessage, b: ChatMessage) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );
          setMessages(sortedMessages);
        } else {
          console.error("Failed fetching chat logs");
        }
      } catch (error) {
        console.error("Network communication error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChatId || !stableToken) return;

    const chat = conversations.find(
      (c) => String(c.id) === String(activeChatId),
    );
    const roomId = chat?.conversation_id || activeChatId;

    console.log(
      "🔌 Connecting WS. roomId:",
      roomId,
      "token:",
      stableToken.slice(0, 12) + "...",
    );

    const ws = new WebSocket(
      `ws://36.253.137.34:8005/ws/chat/${roomId}/?token=${stableToken}`,
    );

    socketRef.current = ws;

    ws.onopen = () => console.log("✅ Socket Open");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          {
            id: data.id || String(Date.now()),
            sender: data.sender_id ?? data.sender,
            sender_username: data.sender_username,
            sender_full_name: data.sender_full_name,
            sender_avatar: data.sender_avatar ?? null,
            message: data.message,
            created_at: data.created_at || new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };

    ws.onclose = (event) => {
      console.error("🔴 Closed. Code:", event.code, "Reason:", event.reason);
      socketRef.current = null;
    };

    ws.onerror = (err) => console.error("❌ WS Error:", err);

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [activeChatId, stableToken]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeMessage.trim() || !activeChatId) return;

    const ws = socketRef.current;
    console.log("🔍 WS ref:", ws, "readyState:", ws?.readyState);

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("Socket not ready. State:", ws?.readyState ?? "null ref");
      return;
    }

    const payload = {
      message: typeMessage.trim(),
      sender_id: currentUserId,
      receiver_id: activeChatId,
      expire_after_24h: autoDelete24h,
    };

    ws.send(JSON.stringify(payload));

    // Optimistically render the sent message immediately
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

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex h-[calc(100vh-72px)] w-full bg-background font-sans antialiased">
      {/* SIDEBAR NAVIGATION COLUMN */}
      <div
        className={`flex flex-col bg-background transition-all duration-300 ${
          activeChatId === null
            ? "w-full"
            : "w-[80px] sm:w-[220px] md:w-[240px] border-r border-border/60 shrink-0"
        }`}
      >
        <div className="p-4 h-[65px] flex items-center justify-between border-b border-border/60">
          <h2 className="text-lg font-black tracking-tight text-foreground">
            Messages
          </h2>
          {activeChatId === null && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {activeChatId === null ? (
          /* FULL SCREEN SIDEBAR VIEW Matrix */
          <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
            {activeUsers.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider mb-3">
                  Active Users ({activeUsers.length})
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {activeUsers.map((chatUser) => {
                    const resolvedAvatar = getMediaUrl(getChatAvatar(chatUser));
                    const displayName = getChatName(chatUser);
                    return (
                      <div
                        key={chatUser.id}
                        onClick={() => setActiveChatId(chatUser.id)}
                        className="flex flex-col items-center space-y-1.5 cursor-pointer text-center group min-w-[65px]"
                      >
                        <div className="relative w-12 h-12 rounded-full bg-muted border-2 border-border group-hover:border-orange-500 transition-colors flex items-center justify-center font-bold text-sm text-foreground overflow-hidden">
                          {resolvedAvatar ? (
                            <Image
                              src={resolvedAvatar}
                              alt={displayName}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            displayName[0]?.toUpperCase() || "?"
                          )}
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full z-10" />
                        </div>
                        <span className="text-xs font-medium text-foreground truncate max-w-[70px]">
                          {displayName.split(" ")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider mb-2">
                Recent Chats
              </h3>
              {conversations.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2">
                  No conversations found.
                </p>
              ) : (
                <div className="divide-y divide-border/40">
                  {conversations.map((chat) => {
                    const resolvedAvatar = getMediaUrl(getChatAvatar(chat));
                    const displayName = getChatName(chat);
                    return (
                      <div
                        key={chat.id}
                        onClick={() => setActiveChatId(chat.id)}
                        className="flex items-center gap-3 py-3 hover:bg-muted/30 px-2 rounded-xl cursor-pointer transition-colors"
                      >
                        <div className="relative w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-sm text-muted-foreground shrink-0 overflow-hidden">
                          {resolvedAvatar ? (
                            <Image
                              src={resolvedAvatar}
                              alt={displayName}
                              width={44}
                              height={44}
                              className="w-full h-full object-cover rounded-full"
                              unoptimized
                            />
                          ) : (
                            displayName[0]?.toUpperCase() || "?"
                          )}
                          {getChatActiveStatus(chat) && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-background rounded-full z-10" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-sm font-bold text-foreground truncate">
                              {displayName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {chat.time || ""}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {getChatLastMsg(chat)}
                          </p>
                        </div>
                        {chat.unread && chat.unread > 0 ? (
                          <span className="w-4 h-4 bg-orange-500 text-white font-bold text-[9px] flex items-center justify-center rounded-full">
                            {chat.unread}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* CONDENSED SIDEBAR SPLIT COLUMN VIEW */
          <div className="flex-1 overflow-y-auto divide-y divide-border/10 no-scrollbar">
            {conversations.map((chat) => {
              const resolvedAvatar = getMediaUrl(getChatAvatar(chat));
              const displayName = getChatName(chat);
              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`flex items-center justify-center sm:justify-start gap-3 p-3 sm:p-4 cursor-pointer transition-colors relative ${
                    String(activeChatId) === String(chat.id)
                      ? "bg-accent/40 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-orange-500"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-sm text-muted-foreground shrink-0 overflow-hidden">
                    {resolvedAvatar ? (
                      <Image
                        src={resolvedAvatar}
                        alt={displayName}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded-full"
                        unoptimized
                      />
                    ) : (
                      displayName[0]?.toUpperCase() || "?"
                    )}
                    {getChatActiveStatus(chat) && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-background rounded-full z-10" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 hidden sm:block">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs md:text-sm font-bold text-foreground truncate">
                        {displayName}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70 pl-1">
                        {chat.time || ""}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/80 truncate">
                      {getChatLastMsg(chat)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CHAT CANVAS VIEW AREA */}
      {activeChatId !== null && currentChat && (
        <div className="flex-1 flex flex-col bg-background relative min-w-0">
          {/* Header */}
          <div className="px-4 py-3 h-[65px] border-b border-border/60 flex items-center justify-between bg-background">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-xs text-muted-foreground shrink-0 overflow-hidden">
                {getMediaUrl(getChatAvatar(currentChat)) ? (
                  <Image
                    src={getMediaUrl(getChatAvatar(currentChat))!}
                    alt={getChatName(currentChat)}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover rounded-full"
                    unoptimized
                  />
                ) : (
                  getChatName(currentChat)[0]?.toUpperCase() || "?"
                )}
                {getChatActiveStatus(currentChat) && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-background rounded-full z-10" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs md:text-sm font-bold text-foreground leading-tight truncate">
                  {getChatName(currentChat)}
                </h3>
                <span className="text-[10px] text-muted-foreground/80 font-medium">
                  {getChatActiveStatus(currentChat) ? "Active now" : "Offline"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground shrink-0">
              <button
                type="button"
                onClick={() => setAutoDelete24h(!autoDelete24h)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 mr-1 ${
                  autoDelete24h
                    ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400"
                    : "bg-muted/40 border-border text-muted-foreground"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${autoDelete24h ? "bg-orange-500 animate-pulse" : "bg-muted-foreground/40"}`}
                />
                {autoDelete24h ? "24h Auto-Delete ON" : "Keep Messages"}
              </button>

              <button
                onClick={() => setActiveChatId(null)}
                className="p-2 hover:bg-muted text-muted-foreground hover:text-destructive rounded-full transition-colors ml-0.5"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Stream Rendering */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 no-scrollbar">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground space-y-1">
                <p className="text-sm font-bold">No messages here yet</p>
                <p className="text-xs text-center px-4 max-w-[280px]">
                  Say hi to initiate a transaction!
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMyMessage =
                  String(msg.sender) === String(currentUserId);
                const textBody =
                  msg.message || msg.text || msg.body || msg.content || "";

                // Fetch dynamic text fields or fall back to current context keys
                const senderName =
                  msg.sender_full_name ||
                  (currentChat ? getChatName(currentChat) : "User");
                const senderAvatar = getMediaUrl(
                  msg.sender_avatar ||
                    (isMyMessage ? user?.avatar : getChatAvatar(currentChat)),
                );

                return isMyMessage ? (
                  <div
                    key={msg.id}
                    className="flex flex-col items-end max-w-[85%] ml-auto animate-in fade-in slide-in-from-bottom-2 duration-200"
                  >
                    <div className="bg-gradient-to-r from-orange-700 to-orange-600 text-white px-3.5 py-2 rounded-2xl rounded-br-none text-xs md:text-sm shadow-sm text-left">
                      {textBody}
                    </div>
                    {formatTime(msg.created_at) && (
                      <span className="text-[9px] text-muted-foreground/70 mt-1 mr-1 font-medium">
                        {formatTime(msg.created_at)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    className="flex items-end gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-muted-foreground text-[9px] shrink-0 overflow-hidden relative">
                      {senderAvatar ? (
                        <Image
                          src={senderAvatar}
                          alt="Avatar"
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        senderName[0]?.toUpperCase() || "?"
                      )}
                    </div>
                    <div>
                      <div className="bg-card text-foreground border border-border/60 px-3.5 py-2 rounded-2xl rounded-bl-none text-xs md:text-sm shadow-sm">
                        {textBody}
                      </div>
                      {formatTime(msg.created_at) && (
                        <span className="text-[9px] text-muted-foreground/70 mt-1 block ml-1 font-medium">
                          {formatTime(msg.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Controls Footer */}
          <div className="p-3 border-t border-border/60 bg-background">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 bg-muted/40 border border-border/80 rounded-xl px-3 py-2"
            >
              <button
                type="button"
                className="text-muted-foreground/80 hover:text-foreground transition-colors shrink-0"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                className="text-muted-foreground/80 hover:text-foreground transition-colors shrink-0 mr-0.5"
              >
                <ImageIcon size={16} />
              </button>
              <input
                type="text"
                value={typeMessage}
                disabled={loading}
                onChange={(e) => setTypeMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-foreground placeholder:text-muted-foreground/50 min-w-0"
              />
              <button
                type="button"
                className="text-muted-foreground/80 hover:text-foreground transition-colors shrink-0"
              >
                <Smile size={16} />
              </button>
              <button
                type="submit"
                disabled={!typeMessage.trim() || loading}
                className="p-1.5 rounded-lg bg-orange-600 text-white disabled:opacity-30 hover:bg-orange-500 transition-colors shrink-0 flex items-center justify-center"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
