// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "./features/authSlice";
// import themeReducer from "./features/themeSlice";
// import postsReducer from "./features/postsSlice";

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     theme: themeReducer,
//     posts: postsReducer,
//   },
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./features/authSlice";
import themeReducer from "./features/themeSlice";
import postsReducer from "./features/postsSlice";
import reelsReducer from "./features/reelsSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "theme"], // posts are not persisted
};

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  posts: postsReducer,
  reels: reelsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
