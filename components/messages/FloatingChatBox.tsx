"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { X, Minus, Ban, UserRound, ChevronDown } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { useChatBridge } from "@/lib/hooks/useChatBridge";
import {
  addMessage,
  setHistory,
  setHistoryLoading,
  markThreadAsRead,
} from "@/lib/store/features/messagesSlice";
import { cn } from "@/lib/utils";
import ChatInputForm from "@/components/messages/ChatInputForm";
import StackedMediaBubble from "@/components/messages/StackedMediaBubble";
import { useRouter } from "next/navigation";
import { useBlockUser } from "@/lib/hooks/useBlockUser";
import { ConfirmationModal } from "../ConfirmationModal";

interface FloatingChatBoxProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string | null;
  conversationId?: string | null;
  token: string | null;
  onClose: () => void;
  onMinimize: () => void;
}

const FloatingChatBox = React.memo(function FloatingChatBox({
  recipientId,
  recipientName,
  recipientAvatar,
  conversationId,
  token,
  onClose,
  onMinimize,
}: FloatingChatBoxProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { chatHistories, loadingHistory } = useSelector(
    (state: RootState) => state.messages,
  );

  const currentUserId = String(currentUser?.id || "");
  const stableToken = typeof token === "string" ? token : null;
  const roomId = conversationId || recipientId;

  const messages = chatHistories[recipientId] || [];
  const loading = loadingHistory[recipientId] || false;

  const [typeMessage, setTypeMessage] = useState("");
  const [hasMediaFiles, setHasMediaFiles] = useState(false);
  const mediaSendRef = useRef<(() => Promise<void>) | null>(null);
  const currentUserIdRef = useRef(currentUserId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false);

  const { blockUser, blocking } = useBlockUser();

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleIncomingMessage = useCallback(
    (data: any) => {
      if (data.type !== "chat_message") return;
      if (String(data.sender) === String(currentUserIdRef.current)) return;
      dispatch(
        addMessage({
          chatId: recipientId,
          message: {
            id: data.id || String(Date.now()),
            sender: data.sender,
            sender_username: data.sender_username,
            sender_full_name: data.sender_full_name,
            sender_avatar: data.sender_avatar ?? null,
            message: data.message || "",
            attachment: data.attachment ?? null,
            created_at: data.created_at || new Date().toISOString(),
          },
          currentUserId: currentUserIdRef.current,
        }),
      );
    },
    [dispatch, recipientId],
  );

  const { sendMessage, isSendReady } = useChatBridge(
    roomId,
    roomId,
    stableToken,
    stableToken,
    handleIncomingMessage,
  );

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const fetchHistory = async () => {
      if (chatHistories[recipientId]) return;
      dispatch(setHistoryLoading({ chatId: recipientId, loading: true }));
      try {
        const res = await fetch(`/api/chats/?with_user=${recipientId}`);
        if (res.ok) {
          const data = await res.json();
          let raw: any[] = [];
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
          dispatch(setHistory({ chatId: recipientId, messages: sorted }));
        }
      } catch (err) {
        console.error("FloatingChatBox: fetch history error", err);
      } finally {
        dispatch(setHistoryLoading({ chatId: recipientId, loading: false }));
      }
    };
    fetchHistory();
    dispatch(markThreadAsRead(recipientId));
  }, [recipientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasMediaFiles && mediaSendRef.current) {
      await mediaSendRef.current();
    }
    if (!typeMessage.trim()) return;
    dispatch(
      addMessage({
        chatId: recipientId,
        message: {
          id: String(Date.now()),
          sender: currentUserId,
          message: typeMessage.trim(),
          created_at: new Date().toISOString(),
        },
        currentUserId,
      }),
    );
    sendMessage({
      message: typeMessage.trim(),
      sender_id: currentUserId,
      receiver_id: recipientId,
    });
    setTypeMessage("");
  };

  const handleSentMedia = useCallback(
    (newMsg: any) => {
      dispatch(
        addMessage({
          chatId: recipientId,
          message: newMsg,
          currentUserId,
        }),
      );
    },
    [dispatch, recipientId, currentUserId],
  );

  const QUICK_REPLIES = [
    "Hey! How are you? 👋",
    "Let's catch up soon!",
    "🌟 Hello!",
    "What's up?",
    `Hey ${recipientName}, how's it going?`,
  ];

  const avatarSrc = recipientAvatar ? getMediaUrl(recipientAvatar) : null;
  const initials = recipientName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const groupedMessages = useMemo(() => {
    const MERGE_WINDOW_MS = 60_000;
    type Group = {
      id: string;
      sender: string;
      isMine: boolean;
      attachments: string[];
      texts: string[];
      created_at: string;
    };
    const groups: Group[] = [];
    for (const msg of messages) {
      const isMine = String(msg.sender) === String(currentUserId);
      const text = msg.message || msg.text || msg.body || msg.content || "";
      const atts: string[] = msg.attachment ? [msg.attachment] : [];
      const last = groups[groups.length - 1];
      const sameS = last && String(last.sender) === String(msg.sender);
      const withinWindow =
        last &&
        new Date(msg.created_at).getTime() -
          new Date(last.created_at).getTime() <
          MERGE_WINDOW_MS;
      const prevAttOnly =
        last && last.texts.length === 0 && last.attachments.length > 0;
      const currAttOnly = atts.length > 0 && !text;
      if (sameS && withinWindow && prevAttOnly && currAttOnly) {
        last.attachments.push(...atts);
        last.created_at = msg.created_at;
      } else {
        const msgId = msg.id || String(Date.now());

        groups.push({
          id: msgId,
          sender: String(msg.sender),
          isMine,
          attachments: [...atts],
          texts: text ? [text] : [],
          created_at: msg.created_at,
        });
      }
    }
    return groups;
  }, [messages, currentUserId]);

  return (
    <div className="w-[320px] h-[440px] rounded-2xl shadow-2xl border border-border bg-card flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-card border-b border-border shrink-0">
        <div className="relative w-8 h-8 shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={recipientName}
                fill
                className="object-cover rounded-full"
                unoptimized
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
                {initials}
              </span>
            )}
          </div>

          {isSendReady && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
          )}
        </div>

        <div className="flex-1 min-w-0 relative" ref={menuRef}>
          <div className="flex items-center gap-1">
            <p className="text-sm font-semibold leading-tight truncate">
              {recipientName}
            </p>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-0.5 rounded-full hover:bg-muted transition-colors text-muted-foreground shrink-0"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isSendReady ? "Active now" : "Connecting…"}
          </p>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-popover border border-border rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push(`/${recipientId}`);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
              >
                <UserRound className="w-3.5 h-3.5" />
                View Profile
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setIsBlockModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-destructive"
              >
                <Ban className="w-3.5 h-3.5" />
                Block
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-background/50
  [&::-webkit-scrollbar]:w-1.5
  [&::-webkit-scrollbar-track]:bg-transparent
  [&::-webkit-scrollbar-thumb]:bg-border
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40"
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <div className="relative w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground overflow-hidden">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={recipientName}
                  fill
                  className="object-cover rounded-full"
                  unoptimized
                />
              ) : (
                initials
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Say hi to{" "}
              <span className="font-semibold text-foreground">
                {recipientName}
              </span>
              !
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => setTypeMessage(reply)}
                  className="text-xs px-3 py-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors whitespace-nowrap"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div
              key={group.id}
              className={cn(
                "flex items-end gap-1.5",
                group.isMine ? "justify-end" : "justify-start",
              )}
            >
              {!group.isMine && (
                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt=""
                      fill
                      className="object-cover rounded-full"
                      unoptimized
                    />
                  ) : (
                    initials[0]
                  )}
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[210px]">
                {group.attachments.length > 0 && (
                  <StackedMediaBubble
                    attachments={group.attachments}
                    isMine={group.isMine}
                  />
                )}
                {group.texts.map((text, ti) => (
                  <div
                    key={ti}
                    className={cn(
                      "px-3 py-2 rounded-2xl text-sm leading-snug break-words",
                      group.isMine
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm",
                    )}
                  >
                    {text}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInputForm
        activeChatId={recipientId}
        isSendReady={isSendReady}
        typeMessage={typeMessage}
        onTypeMessageChange={setTypeMessage}
        loading={loading}
        hasMediaFiles={hasMediaFiles}
        onHasFilesChange={setHasMediaFiles}
        mediaSendRef={mediaSendRef}
        chatPartnerName={recipientName}
        onSubmit={handleSubmit}
        onSentMedia={handleSentMedia}
        isFloating={true}
      />

      <ConfirmationModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={() =>
          blockUser(recipientId, () => {
            setIsBlockModalOpen(false);
            onClose();
          })
        }
        title="Block User"
        message={
          <>
            Are you sure you want to block{" "}
            <span className="text-primary font-semibold">{recipientName}</span>?
            You will no longer see their messages.
          </>
        }
        confirmText="Block"
        loading={blocking}
      />
    </div>
  );
});

export default FloatingChatBox;
