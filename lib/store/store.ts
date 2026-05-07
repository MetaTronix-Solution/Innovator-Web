import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import themeReducer from "./features/themeSlice";
import postsReducer from "./features/postsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    posts: postsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
