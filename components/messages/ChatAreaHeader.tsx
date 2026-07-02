"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Clock, MoreVertical, Check } from "lucide-react";
import { Avatar } from "./MessageView";
import { ActiveChatUser } from "@/lib/store/features/messagesSlice";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getChatName = (c: ActiveChatUser) =>
    c.name || c.full_name || c.username || "User";
  const getChatAvatar = (c: ActiveChatUser) =>
    c.avatar || c.profile_picture || null;

  return (
    <div className="px-2 h-[60px] border-b border-border/60 flex items-center gap-3 shrink-0 bg-background relative">
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
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-50 w-64 bg-background border border-border/60 rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
                <Clock size={14} className="text-muted-foreground" />
                <span className="text-[13px] font-semibold text-foreground">
                  Message Preferences
                </span>
              </div>

              {/* Options */}
              <div className="px-4 py-3 space-y-3">
                <button
                  onClick={() => {
                    if (!autoDelete24h) onToggleAutoDelete();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock size={15} className="text-orange-500 shrink-0" />
                    <div className="text-left">
                      <p className="text-[13px] font-medium text-foreground">
                        Auto delete in 24hrs
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Messages vanish after 24 hours
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      autoDelete24h
                        ? "bg-orange-500 border-orange-500"
                        : "border-border"
                    }`}
                  >
                    {autoDelete24h && (
                      <Check size={11} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (autoDelete24h) onToggleAutoDelete();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground shrink-0"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-[13px] font-medium text-foreground">
                        Never delete
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Messages are kept forever
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      !autoDelete24h
                        ? "bg-orange-500 border-orange-500"
                        : "border-border"
                    }`}
                  >
                    {!autoDelete24h && (
                      <Check size={11} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                </button>
              </div>

              {/* Info message */}
              <div className="mx-4 mb-4 px-3 py-2.5 bg-muted/50 rounded-xl border border-border/40">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {autoDelete24h
                    ? "⏱ Auto-delete is on. New messages in this conversation will be removed after 24 hours."
                    : "🔒 Messages in this conversation are saved and will never be automatically deleted."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Close - desktop only */}
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
