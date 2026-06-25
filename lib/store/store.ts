import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./features/authSlice";
import themeReducer from "./features/themeSlice";
import cartReducer from "./features/cartSlice";
import postsReducer from "./features/postsSlice";
import reelsReducer from "./features/reelsSlice";
import productsReducer from "./features/productsSlice";
import messagesReducer from "./features/messagesSlice";
import chatUiReducer from "./features/chatUiSlice";

const persistConfig: PersistConfig<any> = {
  key: "root",
  storage,
  whitelist: ["auth", "theme", "cart", "chatUi"],
  version: 1,
  migrate: (state: any) => {
    if (state?.chatUi && !Array.isArray(state.chatUi.openChats)) {
      return Promise.resolve({
        ...state,
        chatUi: { openChats: [] },
      });
    }
    return Promise.resolve(state);
  },
};

const appReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  cart: cartReducer,
  posts: postsReducer,
  reels: reelsReducer,
  products: productsReducer,
  messages: messagesReducer,
  chatUi: chatUiReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/clearCredentials") {
    const { theme } = state;

    state = { theme };
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
