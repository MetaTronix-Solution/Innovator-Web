import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PostMedia {
  id: string;
  file: string;
  media_type: "image" | "video";
}

interface Post {
  id: string;
  username: string;
  user_id: string;
  caption: string;
  content: string;
  media: PostMedia[];
  video: string | null;
  thumbnail: string | null;
  type: "reel" | "post";
  like_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  current_user_reaction: string | null;
  is_followed: boolean;
  is_recommended: boolean;
}

interface PostsState {
  items: Post[];
  next_cursor: string | null;
  has_next: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  items: [],
  next_cursor: null,
  has_next: false,
  loading: false,
  error: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPostsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setPosts: (
      state,
      action: PayloadAction<{
        results: Post[];
        next_cursor: string | null;
        has_next: boolean;
      }>,
    ) => {
      if (state.next_cursor === null) {
        state.items = action.payload.results;
      } else {
        // Append for infinite scroll
        state.items = [...state.items, ...action.payload.results];
      }
      state.next_cursor = action.payload.next_cursor;
      state.has_next = action.payload.has_next;
      state.loading = false;
    },

    // Push new post to top of array
    addPostToTop: (state, action: PayloadAction<Post>) => {
      state.items = [action.payload, ...state.items];
    },

    setPostsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    resetPosts: () => initialState,

    togglePostReaction: (
      state,
      action: PayloadAction<{ postId: string; reactionType: string | null }>,
    ) => {
      const { postId, reactionType } = action.payload;
      const post = state.items.find((p) => p.id === postId);

      if (post) {
        if (reactionType === null) {
          if (post.current_user_reaction === "like") {
            post.like_count = Math.max(0, post.like_count - 1);
          }
        } else if (reactionType === "like") {
          if (post.current_user_reaction !== "like") {
            post.like_count += 1;
          }
        }
        post.current_user_reaction = reactionType;
      }
    },
  },
});

export const {
  setPostsLoading,
  addPostToTop,
  setPosts,
  setPostsError,
  resetPosts,
  togglePostReaction,
} = postsSlice.actions;

export default postsSlice.reducer;
