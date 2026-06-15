"use client";

import React from "react";
import { X, Clock } from "lucide-react";
import { ActiveChatUser } from "./MessageView";
import { Avatar } from "./MessageView";

interface ChatAreaHeaderProps {
  currentChat: ActiveChatUser;
  isOnline: boolean;
  autoDelete24h: boolean;
  onToggleAutoDelete: () => void;
  onCloseChat: () => void;
}

export default function ChatAreaHeader({
  currentChat,
  isOnline,
  autoDelete24h,
  onToggleAutoDelete,
  onCloseChat,
}: ChatAreaHeaderProps) {
  const getChatName = (c: ActiveChatUser) =>
    c.name || c.full_name || c.username || "User";
  const getChatAvatar = (c: ActiveChatUser) =>
    c.avatar || c.profile_picture || null;

  return (
    <div className="px-2 h-[60px] border-b border-border/60 flex items-center gap-3 shrink-0 bg-background">
      <button
        onClick={onCloseChat}
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
        online={isOnline}
        dotSize={9}
      />
      
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
          {getChatName(currentChat)}
        </p>
        <p className="text-[11px] font-medium leading-tight">
          {isOnline ? (
            <span className="text-green-500">Active now</span>
          ) : (
            <span className="text-muted-foreground/60">Offline</span>
          )}
        </p>
      </div>
      
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggleAutoDelete}
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
          onClick={onCloseChat}
          className="hidden md:flex w-8 h-8 rounded-full hover:bg-muted/50 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
