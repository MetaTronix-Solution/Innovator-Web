import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReactNode } from "react";

export interface ChatMessage {
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
  parent?: string | null;
  replied_to_details?: {
    id: string;
    message: string;
    sender_username: string;
    has_attachment: boolean;
  } | null;
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
  rawTime?: string;
  lastMsg?: ReactNode;
  last_message?: string;
  unread?: number;
  avatar?: string | null;
  profile_picture?: string | null;
}

interface MessagesState {
  threads: ActiveChatUser[];
  chatHistories: Record<string, ChatMessage[]>;
  activeChatId: string | null;
  loadingThreads: boolean;
  loadingHistory: Record<string, boolean>;
  error: string | null;
}

const initialState: MessagesState = {
  threads: [],
  chatHistories: {},
  activeChatId: null,
  loadingThreads: false,
  loadingHistory: {},
  error: null,
};

const formatMessageTime = (isoString: string) => {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setThreadsLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingThreads = action.payload;
    },

    setThreads: (state, action: PayloadAction<ActiveChatUser[]>) => {
      state.threads = action.payload;
      state.loadingThreads = false;
      state.error = null;
    },

    setHistoryLoading: (
      state,
      action: PayloadAction<{ chatId: string; loading: boolean }>,
    ) => {
      const { chatId, loading } = action.payload;
      state.loadingHistory[chatId] = loading;
    },

    setHistory: (
      state,
      action: PayloadAction<{ chatId: string; messages: ChatMessage[] }>,
    ) => {
      const { chatId, messages } = action.payload;
      state.chatHistories[chatId] = messages;
      state.loadingHistory[chatId] = false;
    },

    setActiveChatId: (state, action: PayloadAction<string | null>) => {
      state.activeChatId = action.payload;
      if (action.payload) {
        const thread = state.threads.find(
          (t) => String(t.id) === String(action.payload),
        );
        if (thread) {
          thread.unread = 0;
        }
      }
    },

    addMessage: (
      state,
      action: PayloadAction<{
        chatId: string;
        message: ChatMessage;
        currentUserId: string;
      }>,
    ) => {
      const { chatId, message, currentUserId } = action.payload;

      if (!state.chatHistories[chatId]) {
        state.chatHistories[chatId] = [];
      }
      const existing = state.chatHistories[chatId].find(
        (m) => m.id === message.id,
      );
      if (!existing) {
        state.chatHistories[chatId] = [
          ...state.chatHistories[chatId],
          message,
        ].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      }

      const isMeSender = String(message.sender) === String(currentUserId);
      const msgText =
        message.message ||
        message.text ||
        message.body ||
        message.content ||
        "";
      const msgTimeStr = formatMessageTime(message.created_at);

      let threadIndex = state.threads.findIndex(
        (t) => String(t.id) === String(chatId),
      );

      if (threadIndex !== -1) {
        const thread = state.threads[threadIndex];
        thread.lastMsg = msgText;
        thread.time = msgTimeStr;
        thread.rawTime = message.created_at;

        if (!isMeSender && String(state.activeChatId) !== String(chatId)) {
          thread.unread = (thread.unread ?? 0) + 1;
        } else if (String(state.activeChatId) === String(chatId)) {
          thread.unread = 0;
        }

        const [movedThread] = state.threads.splice(threadIndex, 1);
        state.threads.unshift(movedThread);
      } else {
        const newThread: ActiveChatUser = {
          id: chatId,
          conversation_id: message.attachment || "", // temporary field or placeholder
          name: isMeSender
            ? message.sender_full_name || "User"
            : message.sender_full_name || "User",
          username: isMeSender
            ? message.sender_username || "user"
            : message.sender_username || "user",
          avatar: isMeSender
            ? message.sender_avatar || null
            : message.sender_avatar || null,
          lastMsg: msgText,
          time: msgTimeStr,
          rawTime: message.created_at,
          unread:
            !isMeSender && String(state.activeChatId) !== String(chatId)
              ? 1
              : 0,
        };
        state.threads.unshift(newThread);
      }
    },

    markThreadAsRead: (state, action: PayloadAction<string>) => {
      const thread = state.threads.find(
        (t) => String(t.id) === String(action.payload),
      );
      if (thread) {
        thread.unread = 0;
      }
    },

    deleteThread: (state, action: PayloadAction<string>) => {
      state.threads = state.threads.filter(
        (t) => String(t.id) !== String(action.payload),
      );
      delete state.chatHistories[action.payload];
      if (String(state.activeChatId) === String(action.payload)) {
        state.activeChatId = null;
      }
    },

    resetMessages: () => initialState,

    deleteMessageLocally: (
      state,
      action: PayloadAction<{ chatId: string; messageId: string | number }>,
    ) => {
      const { chatId, messageId } = action.payload;
      if (!state.chatHistories[chatId]) return;
      state.chatHistories[chatId] = state.chatHistories[chatId].filter(
        (msg) => String(msg.id) !== String(messageId),
      );
    },

    updateMessageId: (state, action) => {
      const { chatId, tempId, realId } = action.payload;
      const history = state.chatHistories[chatId];
      const msg = history.find((m) => m.id === tempId);
      if (msg) {
        msg.id = realId;
      }
    },
  },
});

export const {
  setThreadsLoading,
  setThreads,
  setHistoryLoading,
  setHistory,
  setActiveChatId,
  addMessage,
  markThreadAsRead,
  deleteThread,
  resetMessages,
  deleteMessageLocally,
  updateMessageId,
} = messagesSlice.actions;

export default messagesSlice.reducer;
