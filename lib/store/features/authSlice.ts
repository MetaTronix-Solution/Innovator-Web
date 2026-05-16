// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface AuthState {
//   user: any | null;
//   isAuthenticated: boolean;
//   isInitialized: boolean;
//   loading: boolean;
// }

// const initialState: AuthState = {
//   user: null,
//   isAuthenticated: false,
//   isInitialized: true,
//   loading: false,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setCredentials: (state, action: PayloadAction<{ user: any }>) => {
//       state.user = action.payload.user;
//       state.isAuthenticated = true;
//       state.isInitialized = true;
//     },
//     setInitialized: (state) => {
//       state.isInitialized = true;
//     },
//     clearCredentials: (state) => {
//       state.user = null;
//       state.isAuthenticated = false;
//       state.isInitialized = true;
//     },
//     setLoading: (state, action: PayloadAction<boolean>) => {
//       state.loading = action.payload;
//     },
//     updateFollowing: (
//       state,
//       action: PayloadAction<{ username: string; isFollowing: boolean }>,
//     ) => {
//       if (!state.user) return;
//       const { username, isFollowing } = action.payload;
//       const list: string[] = state.user.following_usernames ?? [];

//       if (isFollowing) {
//         // Add to following list if not already there
//         if (!list.includes(username)) {
//           state.user.following_usernames = [...list, username];
//         }
//       } else {
//         // Remove from following list
//         state.user.following_usernames = list.filter((u) => u !== username);
//       }
//     },
//   },
// });

// export const {
//   setCredentials,
//   clearCredentials,
//   setLoading,
//   setInitialized,
//   updateFollowing,
// } = authSlice.actions;

// export default authSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: true,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: any }>) => {
      const incomingUser = action.payload.user;

      if (incomingUser) {
        // Normalize data structures so initial login matches refresh payloads perfectly
        state.user = {
          ...incomingUser,
          profile: {
            ...incomingUser.profile,
            // Fallback strategy: pick avatar path regardless of nesting format
            avatar:
              incomingUser.profile?.avatar ||
              incomingUser.profile_image ||
              null,
          },
          // Keep flat field fallback definition intact
          profile_image:
            incomingUser.profile_image || incomingUser.profile?.avatar || null,
        };
      } else {
        state.user = null;
      }

      state.isAuthenticated = !!incomingUser;
      state.isInitialized = true;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateFollowing: (
      state,
      action: PayloadAction<{ username: string; isFollowing: boolean }>,
    ) => {
      if (!state.user) return;
      const { username, isFollowing } = action.payload;
      const list: string[] = state.user.following_usernames ?? [];

      if (isFollowing) {
        if (!list.includes(username)) {
          state.user.following_usernames = [...list, username];
        }
      } else {
        state.user.following_usernames = list.filter((u) => u !== username);
      }
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
  setLoading,
  setInitialized,
  updateFollowing,
} = authSlice.actions;

export default authSlice.reducer;
