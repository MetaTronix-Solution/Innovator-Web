import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Reel {
  id: string;
  username: string;
  user_id: string;
  avatar: string | null;
  caption: string;
  video: string | null;
  video_file: string | null;
  hls_playlist_url: string | null;
  thumbnail: string | null;
  cover_image: string | null;
  like_count: number;
  reactions_count: number;
  reaction_types: Record<string, number>;
  comments_count: number;
  views_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  current_user_reaction: string | null;
  is_followed: boolean;
  shared_reel: string | null;
  shared_reel_details: any | null;
}

interface ReelsState {
  items: Reel[];
  next_cursor: string | null;
  has_next: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: ReelsState = {
  items: [],
  next_cursor: null,
  has_next: false,
  loading: false,
  error: null,
};

const reelsSlice = createSlice({
  name: "reels",
  initialState,
  reducers: {
    setReelsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setReels: (
      state,
      action: PayloadAction<{
        results: Reel[];
        next_cursor: string | null;
        has_next: boolean;
      }>,
    ) => {
      if (action.payload.next_cursor === null) {
        // initial load — replace
        state.items = action.payload.results;
      } else {
        // paginated load — append, dedupe by id
        const existingIds = new Set(state.items.map((r) => r.id));
        const newItems = action.payload.results.filter(
          (r) => !existingIds.has(r.id),
        );
        state.items = [...state.items, ...newItems];
      }
      state.has_next = action.payload.has_next;
      state.loading = false;
    },

    setReelsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    resetReels: () => initialState,

    toggleReelReaction: (
      state,
      action: PayloadAction<{ reelId: string; reactionType: string | null }>,
    ) => {
      const reel = state.items.find((r) => r.id === action.payload.reelId);
      if (!reel) return;
      reel.current_user_reaction = action.payload.reactionType;
    },
  },
});

export const {
  setReelsLoading,
  setReels,
  setReelsError,
  resetReels,
  toggleReelReaction,
} = reelsSlice.actions;

export default reelsSlice.reducer;
