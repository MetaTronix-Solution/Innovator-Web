import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RecipientData {
  id: string;
  name: string;
  avatar?: string | null;
  conversationId?: string | null;
}

interface ChatUiState {
  openChats: RecipientData[];
}

const initialState: ChatUiState = {
  openChats: [],
};

export function migrateChatUiState(state: any): ChatUiState {
  if (!state) return initialState;
  if (Array.isArray(state.openChats)) return state as ChatUiState;
  // Old shape — discard and start fresh
  return initialState;
}

const MAX_OPEN = 3;

const chatUiSlice = createSlice({
  name: "chatUi",
  initialState,
  reducers: {
    openChat: (state, action: PayloadAction<RecipientData>) => {
      const exists = state.openChats.find((c) => c.id === action.payload.id);
      if (exists) return; // already open — don't duplicate
      if (state.openChats.length >= MAX_OPEN) {
        // drop the oldest (leftmost) to make room
        state.openChats.shift();
      }
      state.openChats.push(action.payload);
    },
    closeChat: (state, action: PayloadAction<string>) => {
      state.openChats = state.openChats.filter((c) => c.id !== action.payload);
    },
    closeAllChats: (state) => {
      state.openChats = [];
    },
  },
});

export const { openChat, closeChat, closeAllChats } = chatUiSlice.actions;
export default chatUiSlice.reducer;
