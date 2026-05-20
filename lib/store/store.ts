// import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import { persistStore, persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";
// import authReducer from "./features/authSlice";
// import themeReducer from "./features/themeSlice";
// import cartReducer from "./features/cartSlice";
// import postsReducer from "./features/postsSlice";
// import reelsReducer from "./features/reelsSlice";

// const persistConfig = {
//   key: "root",
//   storage,
//   whitelist: ["auth", "theme", "cart"],
// };

// const rootReducer = combineReducers({
//   auth: authReducer,
//   theme: themeReducer,
//   cart: cartReducer,
//   posts: postsReducer,
//   reels: reelsReducer,
// });

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false,
//     }),
// });

// export const persistor = persistStore(store);
// export type RootState = ReturnType<typeof rootReducer>;
// export type AppDispatch = typeof store.dispatch;

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./features/authSlice";
import themeReducer from "./features/themeSlice";
import cartReducer from "./features/cartSlice";
import postsReducer from "./features/postsSlice";
import reelsReducer from "./features/reelsSlice";

const persistConfig: PersistConfig<any> = {
  key: "root",
  storage,
  whitelist: ["auth", "theme", "cart"],
};

const appReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  cart: cartReducer,
  posts: postsReducer,
  reels: reelsReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/clearCredentials") {
    storage.removeItem("persist:root");
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
