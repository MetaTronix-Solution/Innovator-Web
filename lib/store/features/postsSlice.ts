// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export interface PostMedia {
//   id: string;
//   file: string;
//   media_type: "image" | "video";
// }

// interface Post {
//   id: string;
//   username: string;
//   user_id: string;
//   caption: string;
//   content: string;
//   media: PostMedia[];
//   video: string | null;
//   thumbnail: string | null;
//   type: "reel" | "post";
//   like_count: number;
//   comments_count: number;
//   views_count: number;
//   created_at: string;
//   current_user_reaction: string | null;
//   is_followed: boolean;
//   is_recommended: boolean;
// }

// interface PostsState {
//   items: Post[];
//   next_cursor: string | null;
//   has_next: boolean;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: PostsState = {
//   items: [],
//   next_cursor: null,
//   has_next: false,
//   loading: false,
//   error: null,
// };

// const postsSlice = createSlice({
//   name: "posts",
//   initialState,
//   reducers: {
//     setPostsLoading: (state, action: PayloadAction<boolean>) => {
//       state.loading = action.payload;
//     },

//     setPosts: (
//       state,
//       action: PayloadAction<{
//         results: Post[];
//         next_cursor: string | null;
//         has_next: boolean;
//       }>,
//     ) => {
//       if (state.next_cursor === null) {
//         state.items = action.payload.results;
//       } else {
//         // Append for infinite scroll
//         state.items = [...state.items, ...action.payload.results];
//       }
//       state.next_cursor = action.payload.next_cursor;
//       state.has_next = action.payload.has_next;
//       state.loading = false;
//     },

//     // Push new post to top of array
//     addPostToTop: (state, action: PayloadAction<Post>) => {
//       state.items = [action.payload, ...state.items];
//     },

//     setPostsError: (state, action: PayloadAction<string | null>) => {
//       state.error = action.payload;
//       state.loading = false;
//     },

//     resetPosts: () => initialState,

//     // In your togglePostReaction reducer, ensure it handles the count correctly:
//     togglePostReaction: (
//       state,
//       action: PayloadAction<{ postId: string; reactionType: string | null }>,
//     ) => {
//       const post = state.items.find((p) => p.id === action.payload.postId);
//       if (!post) return;

//       // Only update the reaction type — don't touch like_count
//       post.current_user_reaction = action.payload.reactionType;
//     },
//   },
// });

// export const {
//   setPostsLoading,
//   addPostToTop,
//   setPosts,
//   setPostsError,
//   resetPosts,
//   togglePostReaction,
// } = postsSlice.actions;

// export default postsSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PostMedia {
  id: string;
  file: string;
  media_type: "image" | "video";
}

export interface Post {
  id: string;
  username: string;
  full_name?: string;
  user_id: string;
  avatar?: string | null;
  caption: string;
  content: string;
  media: PostMedia[];
  video: string | null;
  thumbnail: string | null;
  type: "reel" | "post";
  like_count: number;
  reactions_count: number;
  reaction_types: string[] | Record<string, number>;
  comments_count: number;
  views_count: number;
  share_count: number;
  created_at: string;
  updated_at?: string;
  current_user_reaction: string | null;
  is_followed: boolean;
  is_recommended: boolean;
  shared_post: string | null;
  shared_post_details: any | null;
  shared_reel: string | null;
  shared_reel_details: any | null;
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
        // Dedupe by id on append
        const existingIds = new Set(state.items.map((p) => p.id));
        const newItems = action.payload.results.filter(
          (p) => !existingIds.has(p.id),
        );
        state.items = [...state.items, ...newItems];
      }
      state.next_cursor = action.payload.next_cursor;
      state.has_next = action.payload.has_next;
      state.loading = false;
      state.error = null;
    },

    addPostToTop: (state, action: PayloadAction<Post>) => {
      // Prevent duplicate if already exists
      const exists = state.items.some((p) => p.id === action.payload.id);
      if (!exists) {
        state.items = [action.payload, ...state.items];
      }
    },

    removePost: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },

    updatePost: (
      state,
      action: PayloadAction<{ postId: string; changes: Partial<Post> }>,
    ) => {
      const post = state.items.find((p) => p.id === action.payload.postId);
      if (post) {
        Object.assign(post, action.payload.changes);
      }
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
      const post = state.items.find((p) => p.id === action.payload.postId);
      if (!post) return;
      post.current_user_reaction = action.payload.reactionType;
    },

    incrementCommentCount: (state, action: PayloadAction<string>) => {
      const post = state.items.find((p) => p.id === action.payload);
      if (post) post.comments_count += 1;
    },

    incrementShareCount: (state, action: PayloadAction<string>) => {
      const post = state.items.find((p) => p.id === action.payload);
      if (post) post.share_count = (post.share_count ?? 0) + 1;
    },

    toggleFollowInPosts: (
      state,
      action: PayloadAction<{ userId: string; isFollowed: boolean }>,
    ) => {
      // Update is_followed across all posts by this user
      state.items.forEach((p) => {
        if (p.user_id === action.payload.userId) {
          p.is_followed = action.payload.isFollowed;
        }
      });
    },
  },
});

export const {
  setPostsLoading,
  addPostToTop,
  removePost,
  updatePost,
  setPosts,
  setPostsError,
  resetPosts,
  togglePostReaction,
  incrementCommentCount,
  incrementShareCount,
  toggleFollowInPosts,
} = postsSlice.actions;

export default postsSlice.reducer;
