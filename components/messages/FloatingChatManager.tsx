"use client";

import { createPortal } from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import { closeChat } from "@/lib/store/features/chatUiSlice";
import FloatingChatBox from "./FloatingChatBox";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function FloatingChatManager() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const { openChats } = useSelector((state: RootState) => state.chatUi);
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
      } catch (err) {
        console.error("FloatingChatManager: failed to get token", err);
      }
    };
    getToken();
  }, []);

  if (!mounted || !openChats?.length) return null;

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return createPortal(
    <div className="fixed bottom-0 right-4 z-50 flex items-end gap-3">
      <div className="flex items-end gap-3">
        {openChats
          .filter((chat) => openIds.has(chat.id))
          .map((chat) => (
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

      <div className="flex flex-col-reverse items-center gap-2 pb-3">
        {openChats.map((chat) => {
          const isOpen = openIds.has(chat.id);
          const avatarSrc = chat.avatar
            ? chat.avatar.startsWith("http")
              ? chat.avatar
              : `${process.env.NEXT_PUBLIC_API_URL || ""}${chat.avatar}`
            : null;
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
                className={`w-12 h-12 rounded-full border-2 overflow-hidden shadow-lg transition-all duration-200 hover:scale-110 ${
                  isOpen
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-card hover:border-primary/50"
                }`}
              >
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={chat.name}
                    fill
                    className="object-cover rounded-full"
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
                <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
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
    </div>,
    document.body,
  );
}
