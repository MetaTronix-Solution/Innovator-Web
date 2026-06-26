"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  MoreHorizontal,
  Trash2,
  Loader2,
} from "lucide-react";
import { MutualUser } from "@/app/(main)/messages/page";
import { Avatar } from "./MessageView";
import { ActiveChatUser } from "@/lib/store/features/messagesSlice";

interface ChatSidebarProps {
  conversations: ActiveChatUser[];
  mutualUsers: MutualUser[];
  search: string;
  onSearchChange: (val: string) => void;
  activeChatId: string | null;
  onOpenChat: (userId: string, meta?: Partial<ActiveChatUser>) => void;
  onClose: () => void;
  onDeleteConversation: (chatId: string) => Promise<void>;
  deleteLoading: string | null;
  getLiveOnlineStatus: (userId: string, fallback: boolean) => boolean;
}

export default function ChatSidebar({
  conversations,
  mutualUsers,
  search,
  onSearchChange,
  activeChatId,
  onOpenChat,
  onClose,
  onDeleteConversation,
  deleteLoading,
  getLiveOnlineStatus,
}: ChatSidebarProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getChatName = (c: ActiveChatUser) =>
    c.name || c.full_name || c.username || "User";
  const getChatAvatar = (c: ActiveChatUser) =>
    c.avatar || c.profile_picture || null;
  const getChatActiveStatus = (c: ActiveChatUser) =>
    !!(c.active || c.is_active);
  const getChatLastMsg = (c: ActiveChatUser) =>
    c.lastMsg || c.last_message || "";
  const getUnreadCount = (chat: ActiveChatUser) => chat.unread ?? 0;

  const handleStartChat = (u: MutualUser) =>
    onOpenChat(u.id, {
      name: u.full_name || u.username || "User",
      avatar: u.avatar,
      active: u.online_status,
    });

  const filteredConversations = search.trim()
    ? conversations.filter((c) =>
        getChatName(c).toLowerCase().includes(search.toLowerCase()),
      )
    : conversations;

  return (
    <div
      className={`flex flex-col bg-background border-r border-border/60 shrink-0 transition-all duration-300 ease-in-out ${
        activeChatId === null
          ? "w-full md:w-[360px]"
          : "hidden md:flex md:w-[280px]"
      }`}
    >
      <div className="flex md:hidden items-center justify-between px-2 h-[40px] border-b border-border/60 shrink-0">
        <div className="w-8 flex items-center">
          {activeChatId === null && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}
        </div>

        <h2 className="text-[15px] font-semibold text-foreground">Messages</h2>

        <div className="w-8" />
      </div>

      {activeChatId === null && (
        <div className="px-3 py-2.5 border-b border-border/60">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
            />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
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
                  <button
                    className="flex items-center gap-3 flex-1 min-w-0 text-left focus:outline-none"
                    onClick={() => onOpenChat(chat.id)}
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
                          className={`text-[13px] truncate ${
                            unread > 0
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground"
                          }`}
                        >
                          {displayName}
                        </span>
                        <span className="text-[11px] text-muted-foreground/60 ml-2 shrink-0">
                          {chat.time || ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs truncate ${
                            unread > 0
                              ? "text-foreground font-medium"
                              : "text-muted-foreground/70"
                          }`}
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

                  <div
                    className="relative shrink-0"
                    ref={menuOpenId === chat.id ? menuRef : null}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
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
                            onDeleteConversation(chat.id);
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
            const hasExistingChat = conversations.some(
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
  );
}
