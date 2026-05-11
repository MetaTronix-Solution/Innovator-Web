"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { persistor, store } from "./store/store";
import { setCredentials, clearCredentials } from "./store/features/authSlice";
import { PersistGate } from "redux-persist/integration/react";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    const rehydrate = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          dispatch(setCredentials({ user: data.user }));
          return;
        }
      } catch {
        // fall through
      }

      // No cookie — check NextAuth (Google login)
      if (status === "authenticated" && session?.accessToken) {
        // Set the HttpOnly cookie for Google users too
        await fetch("/api/auth/set-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: session.accessToken }),
        });

        dispatch(setCredentials({ user: session.user }));
        return;
      }

      dispatch(clearCredentials());
    };

    rehydrate();
  }, [status, session, dispatch]);

  return <>{children}</>;
}

function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthHydrator>{children}</AuthHydrator>
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
}

export default AppProvider;
