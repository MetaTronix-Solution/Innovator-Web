"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  X,
  Minus,
  Ban,
  UserRound,
  ChevronDown,
  Trash,
  Trash2,
  MoreHorizontal,
  CornerUpLeft,
  Check,
  Clock,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { useChatBridge } from "@/lib/hooks/useChatBridge";
import {
  addMessage,
  setHistory,
  setHistoryLoading,
  markThreadAsRead,
  deleteMessageLocally,
  updateMessageId,
  deleteThread,
  ChatMessage,
} from "@/lib/store/features/messagesSlice";
import { cn } from "@/lib/utils";
import ChatInputForm from "@/components/messages/ChatInputForm";
import StackedMediaBubble from "@/components/messages/StackedMediaBubble";
import { useRouter } from "next/navigation";
import { useBlockUser } from "@/lib/hooks/useBlockUser";
import { useDeleteMessage } from "@/lib/hooks/useDeleteMessage";
import { ConfirmationModal } from "../ConfirmationModal";
import { formatDateSeparator } from "@/lib/utils/formatRelativeTime";
import { setChatDeletionPreference } from "@/lib/services/chatPreferences";

interface FloatingChatBoxProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string | null;
  conversationId?: string | null;
  token: string | null;
  onClose: () => void;
  onMinimize: () => void;
}

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  messageId: string | null;
  isMine: boolean;
}

const CONTEXT_MENU_CLOSED: ContextMenu = {
  visible: false,
  x: 0,
  y: 0,
  messageId: null,
  isMine: false,
};

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
  const pendingMessagesRef = useRef<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [contextMenu, setContextMenu] =
    useState<ContextMenu>(CONTEXT_MENU_CLOSED);
  const [autoDelete24h, setAutoDelete24h] = useState(false);

  const [presence, setPresence] = useState<{
    status: "online" | "offline" | null;
    timestamp: string | null;
  }>({ status: null, timestamp: null });

  const [resolvedConversationId, setResolvedConversationId] = useState<
    string | null
  >(conversationId ?? null);

  const menuRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false);

  const { blockUser, blocking } = useBlockUser();
  const { deleteMessage, isDeleting } = useDeleteMessage();

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    if (conversationId) setResolvedConversationId(conversationId);
  }, [conversationId]);

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

  useEffect(() => {
    if (!contextMenu.visible) return;
    const handler = () => setContextMenu(CONTEXT_MENU_CLOSED);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [contextMenu.visible]);

  const handleIncomingMessage = useCallback(
    (data: any) => {
      if (data.type === "user_online_status" && data.user_id === recipientId) {
        setPresence({ status: data.status, timestamp: data.timestamp });
        return;
      }

      if (data.type !== "chat_message") return;

      const currentHistory = chatHistories[recipientId] || [];

      const isMine = String(data.sender) === String(currentUserIdRef.current);

      let isAlreadyInStore = currentHistory.some(
        (m) => m.id === data.id || (data.temp_id && m.id === data.temp_id),
      );
      let matchedTempId: string | null = data.temp_id || null;

      if (!isAlreadyInStore && isMine) {
        const tempMsg = currentHistory.find(
          (m) =>
            (m.id.length < 20 ||
              !isNaN(Number(m.id)) ||
              m.id.startsWith("temp")) &&
            String(m.sender) === String(currentUserIdRef.current) &&
            (m.message === data.message ||
              m.text === data.message ||
              m.body === data.message),
        );
        if (tempMsg) {
          isAlreadyInStore = true;
          matchedTempId = tempMsg.id;
        }
      }

      if (isAlreadyInStore) {
        if (isMine && matchedTempId && data.id !== matchedTempId) {
          dispatch(
            updateMessageId({
              chatId: recipientId,
              tempId: matchedTempId,
              realId: data.id,
            }),
          );
        }
        return;
      }

      dispatch(
        addMessage({
          chatId: recipientId,
          message: {
            id: data.id,
            sender: data.sender,
            sender_username: data.sender_username,
            sender_full_name: data.sender_full_name,
            sender_avatar: data.sender_avatar ?? null,
            message: data.message || "",
            attachment: data.attachment ?? null,
            created_at: data.created_at || new Date().toISOString(),
            parent: data.parent ?? null,
            replied_to_details: data.replied_to_details ?? null,
          },
          currentUserId: currentUserIdRef.current,
        }),
      );
    },
    [dispatch, recipientId, chatHistories],
  );

  const handleToggleAutoDelete = useCallback(
    async (value: boolean) => {
      setAutoDelete24h(value);
      try {
        await setChatDeletionPreference(
          recipientId,
          value ? "24_hours" : "never",
        );
      } catch (err) {
        console.error("Failed to update deletion preference:", err);
        setAutoDelete24h(!value); // revert on failure
      }
    },
    [recipientId],
  );

  const { sendMessage, markAsRead, isSendReady, isReceiveReady } =
    useChatBridge(
      roomId,
      roomId,
      stableToken,
      stableToken,
      handleIncomingMessage,
    );

  useEffect(() => {
    if (isReceiveReady) {
      markAsRead();
    }
  }, [isReceiveReady]);

  useEffect(() => {
    if (!isSendReady || pendingMessagesRef.current.length === 0) return;
    const queued = pendingMessagesRef.current;
    pendingMessagesRef.current = [];
    queued.forEach((payload) => sendMessage(payload));
  }, [isSendReady, sendMessage]);

  useEffect(() => {
    hasFetched.current = false;
  }, [recipientId]);

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

          const foundConvId =
            data.conversation_id || data.id || data.room_id || data.chat_id;

          if (foundConvId) {
            setResolvedConversationId(String(foundConvId));
          }

          const raw = Array.isArray(data.messages)
            ? data.messages
            : Array.isArray(data)
              ? data
              : [];
          const sorted = [...raw].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );
          dispatch(setHistory({ chatId: recipientId, messages: sorted }));
        }
      } catch (err) {
        console.error("Fetch history error", err);
      } finally {
        dispatch(setHistoryLoading({ chatId: recipientId, loading: false }));
      }
    };
    fetchHistory();
    dispatch(markThreadAsRead(recipientId));
  }, [recipientId, dispatch, chatHistories]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasMediaFiles && mediaSendRef.current) {
      await mediaSendRef.current();
    }

    if (!typeMessage.trim()) return;

    const tempId = String(Date.now());

    const replyDetails = replyingTo
      ? {
          id: replyingTo.id,
          message:
            replyingTo.message ||
            replyingTo.text ||
            replyingTo.body ||
            replyingTo.content ||
            "",
          sender_username: replyingTo.sender_username || "User",
          has_attachment: !!replyingTo.attachment,
        }
      : null;

    const optimisticMessage: ChatMessage = {
      id: tempId,
      sender: currentUserId,
      message: typeMessage.trim(),
      created_at: new Date().toISOString(),
      parent: replyingTo ? replyingTo.id : null,
      replied_to_details: replyDetails,
    };

    dispatch(
      addMessage({
        chatId: recipientId,
        message: optimisticMessage,
        currentUserId,
      }),
    );

    const payload = {
      message: typeMessage.trim(),
      sender_id: currentUserId,
      receiver_id: recipientId,
      temp_id: tempId,
      parent: replyingTo ? replyingTo.id : null,
      replied_to_details: replyDetails,
      expire_after_24h: autoDelete24h,
    };

    if (isSendReady) {
      sendMessage(payload);
    } else {
      pendingMessagesRef.current.push(payload);
    }

    setTypeMessage("");
    setReplyingTo(null);
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

  const handleDeleteMessage = useCallback(
    async (deleteType: "for_me" | "for_everyone") => {
      if (!contextMenu.messageId) return;

      setContextMenu(CONTEXT_MENU_CLOSED);

      const success = await deleteMessage({
        messageId: contextMenu.messageId,
        deleteType,
      });

      if (success) {
        dispatch(
          deleteMessageLocally({
            chatId: recipientId,
            messageId: contextMenu.messageId,
          }),
        );
      }
    },
    [contextMenu.messageId, recipientId, deleteMessage, dispatch],
  );

  const handleDeleteConversation = useCallback(async () => {
    if (deleteLoading) return;
    setDeleteLoading(true);
    try {
      await fetch("/api/chats/delete-conversation/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ with_user: recipientId }),
      });
      dispatch(deleteThread(recipientId));
      setIsDeleteModalOpen(false);
      onClose();
    } catch (err) {
      console.error("Delete conversation error:", err);
    } finally {
      setDeleteLoading(false);
    }
  }, [recipientId, deleteLoading, dispatch, onClose]);

  const QUICK_REPLIES = [
    "Hey! How are you? 👋",
    "Let's catch up soon!",
    "🌟 Hello!",
    "What's up?",
    `Hey ${recipientName?.split(" ")[0]}, how's it going?`,
  ];

  const avatarSrc = recipientAvatar ? getMediaUrl(recipientAvatar) : null;
  const initials = recipientName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const selectedMessage = useMemo(() => {
    if (!contextMenu.messageId) return null;
    return messages.find((m) => m.id === contextMenu.messageId) || null;
  }, [messages, contextMenu.messageId]);

  const openMsgMenu = useCallback(
    (e: React.MouseEvent, message: ChatMessage, isMine: boolean) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = e.currentTarget.getBoundingClientRect();

      setContextMenu({
        visible: true,
        x: rect.left,
        y: rect.bottom,
        messageId: message.id,
        isMine,
      });
    },
    [],
  );

  const groupedMessages = useMemo(() => {
    const MERGE_WINDOW_MS = 60_000;
    type Group = {
      id: string;
      sender: string;
      isMine: boolean;
      created_at: string;
      messages: ChatMessage[];
    };
    const groups: Group[] = [];
    for (const msg of messages) {
      const isMine = String(msg.sender) === String(currentUserId);
      const last = groups[groups.length - 1];
      const sameSender = last && String(last.sender) === String(msg.sender);
      const withinWindow =
        last &&
        new Date(msg.created_at).getTime() -
          new Date(last.created_at).getTime() <
          MERGE_WINDOW_MS;

      const isReply = !!msg.parent || !!msg.replied_to_details;
      const lastIsReply =
        last && last.messages.some((m) => !!m.parent || !!m.replied_to_details);

      if (sameSender && withinWindow && !isReply && !lastIsReply) {
        last.messages.push(msg);
        last.created_at = msg.created_at;
      } else {
        const msgId = msg.id || String(Date.now());
        groups.push({
          id: msgId,
          sender: String(msg.sender),
          isMine,
          created_at: msg.created_at,
          messages: [msg],
        });
      }
    }
    return groups;
  }, [messages, currentUserId]);

  return (
    <>
      <div className="w-[320px] h-[440px] rounded-2xl shadow-2xl border border-border bg-card flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-card border-b border-border shrink-0">
          <div className="relative w-8 h-8 shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted cursor-pointer">
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

            {menuOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-xl shadow-lg py-1 z-50">
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

                <div className="my-1 border-t border-border" />

                <button
                  onClick={() => {
                    handleToggleAutoDelete(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    Auto delete 24h
                  </span>
                  {autoDelete24h && (
                    <Check className="w-3.5 h-3.5 text-orange-500" />
                  )}
                </button>

                <button
                  onClick={() => {
                    handleToggleAutoDelete(false);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Never delete
                  </span>
                  {!autoDelete24h && (
                    <Check className="w-3.5 h-3.5 text-orange-500" />
                  )}
                </button>

                <div className="my-1 border-t border-border" />

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
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Chat
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

        {/* Messages */}
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
            groupedMessages.map((group, index) => {
              const prevGroup = groupedMessages[index - 1];
              const currentDate = new Date(
                group.messages[0].created_at,
              ).toDateString();
              const prevDate = prevGroup
                ? new Date(
                    prevGroup.messages[prevGroup.messages.length - 1]
                      .created_at,
                  ).toDateString()
                : null;
              const showDateSeparator = currentDate !== prevDate;

              return (
                <div key={group.id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-3">
                      <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-muted/80 text-muted-foreground">
                        {formatDateSeparator(group.messages[0].created_at)}
                      </span>
                    </div>
                  )}

                  <div
                    className={cn(
                      "flex items-end gap-1.5 group/msg",
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

                    <div className="flex flex-col gap-1.5 max-w-[210px] relative">
                      {(() => {
                        const groupAttachments = group.messages
                          .map((m) => m.attachment)
                          .filter(Boolean) as string[];
                        const groupAttachmentMessages = group.messages.filter(
                          (m) => !!m.attachment,
                        );

                        return groupAttachments.length > 0 ? (
                          <StackedMediaBubble
                            attachments={groupAttachments}
                            isMine={group.isMine}
                            onMenuOpen={(e) =>
                              openMsgMenu(
                                e,
                                groupAttachmentMessages[0],
                                group.isMine,
                              )
                            }
                          />
                        ) : null;
                      })()}

                      {group.messages.map((msg) => {
                        const text =
                          msg.message ||
                          msg.text ||
                          msg.body ||
                          msg.content ||
                          "";
                        const hasReply = !!msg.replied_to_details;

                        if (!text && !hasReply) return null;

                        return (
                          <div
                            key={msg.id}
                            className="relative group/bubble flex items-center gap-1.5"
                          >
                            {group.isMine && !!text && (
                              <button
                                onClick={(e) =>
                                  openMsgMenu(e, msg, group.isMine)
                                }
                                className="opacity-0 group-hover/bubble:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted text-muted-foreground shrink-0 order-first"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <div className="flex flex-col max-w-full">
                              {hasReply && (
                                <div
                                  className={cn(
                                    "flex flex-col gap-0.5 mb-[1px] max-w-full",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "text-[10px] text-muted-foreground",
                                      group.isMine
                                        ? "rounded-r-2xl"
                                        : "rounded-l-2xl",
                                    )}
                                  >
                                    {(() => {
                                      const isParentMine =
                                        String(
                                          msg.replied_to_details!
                                            .sender_username,
                                        ) === String(currentUser?.username);
                                      if (group.isMine && isParentMine)
                                        return "You replied to yourself";
                                      if (group.isMine) return "You replied";
                                      if (isParentMine) return "Replied to you";
                                      return `Replied to themself`;
                                    })()}
                                  </div>

                                  <div
                                    className={cn(
                                      "text-[10px] px-2.5 py-1 bg-muted/60 border-l-2 border-primary/30 text-muted-foreground truncate w-fit max-w-[170px]",
                                      group.isMine
                                        ? "rounded-r-lg"
                                        : "rounded-l-lg",
                                    )}
                                  >
                                    {msg.replied_to_details!.message}
                                  </div>
                                </div>
                              )}

                              {text && (
                                <div
                                  className={cn(
                                    "px-3 py-2 text-sm leading-snug break-words rounded-2xl",
                                    group.isMine
                                      ? "bg-primary text-primary-foreground rounded-br-sm"
                                      : "bg-muted text-foreground rounded-bl-sm",
                                    hasReply && "rounded-t-none",
                                  )}
                                >
                                  {text}
                                </div>
                              )}

                              <span
                                className={cn(
                                  "text-[10px] text-muted-foreground mt-0.5 px-1",
                                  group.isMine ? "text-right" : "text-left",
                                )}
                              >
                                {new Date(msg.created_at).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>

                            {!group.isMine && !!text && (
                              <button
                                onClick={(e) =>
                                  openMsgMenu(e, msg, group.isMine)
                                }
                                className="opacity-0 group-hover/bubble:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted text-muted-foreground shrink-0 order-last"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply Preview Bar */}
        {replyingTo && (
          <div className="flex items-center justify-between px-3 py-2 bg-muted/60 border-t border-border text-xs text-muted-foreground shrink-0 transition-all duration-200 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 min-w-0">
              <CornerUpLeft className="w-3.5 h-3.5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-foreground/80 text-[10px] leading-none mb-0.5">
                  Replying to @{replyingTo.sender_username || "User"}
                </p>
                <p className="truncate text-foreground/60 text-[11px] leading-tight max-w-[200px]">
                  {replyingTo.message ||
                    replyingTo.text ||
                    replyingTo.body ||
                    replyingTo.content ||
                    "Media"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 rounded-full hover:bg-muted-foreground/10 text-muted-foreground transition-colors shrink-0"
              title="Cancel reply"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
              <span className="text-primary font-semibold">
                {recipientName}
              </span>
              ? You will no longer see their messages.
            </>
          }
          confirmText="Block"
          loading={blocking}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConversation}
          title="Delete Conversation"
          message={
            <>
              Are you sure you want to delete your conversation with{" "}
              <span className="text-primary font-semibold">
                {recipientName}
              </span>
              ? This action cannot be undone.
            </>
          }
          confirmText="Delete"
          loading={deleteLoading}
        />
      </div>

      {contextMenu.visible && (
        <div
          className="fixed z-[9999] min-w-[170px] rounded-xl overflow-hidden shadow-xl border border-border bg-popover py-1"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              if (selectedMessage) {
                setReplyingTo(selectedMessage);
              }
              setContextMenu(CONTEXT_MENU_CLOSED);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-muted transition-colors text-foreground"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
            Reply
          </button>

          <button
            disabled={isDeleting}
            onClick={() => handleDeleteMessage("for_me")}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-destructive hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Trash className="w-3.5 h-3.5" />
            Delete for me
          </button>

          {contextMenu.isMine && (
            <button
              disabled={isDeleting}
              onClick={() => handleDeleteMessage("for_everyone")}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-destructive hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete for everyone
            </button>
          )}
        </div>
      )}
    </>
  );
});

export default FloatingChatBox;
