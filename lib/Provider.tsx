"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, { useEffect, useRef } from "react";
import { Provider, useDispatch } from "react-redux";
import { persistor, store } from "./store/store";
import { setCredentials, clearCredentials } from "./store/features/authSlice";
import { PersistGate } from "redux-persist/integration/react";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    if (hydratedRef.current) return;

    const rehydrate = async () => {
      if (
        typeof window !== "undefined" &&
        sessionStorage.getItem("just_logged_in") === "true"
      ) {
        sessionStorage.removeItem("just_logged_in");
        hydratedRef.current = true;
        return;
      }

      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          dispatch(setCredentials({ user: data.user }));
          hydratedRef.current = true;
          return;
        }
      } catch {
        // fall through
      }

      if (status === "authenticated" && session?.accessToken) {
        const cookieRes = await fetch("/api/auth/set-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: session.accessToken }),
        });

        if (cookieRes.ok) {
          try {
            const meRes = await fetch("/api/auth/me");
            if (meRes.ok) {
              const data = await meRes.json();
              dispatch(setCredentials({ user: data.user }));
              hydratedRef.current = true;
              return;
            }
          } catch {
            // fall through
          }

          dispatch(setCredentials({ user: session.user }));
          hydratedRef.current = true;
          return;
        }
      }

      dispatch(clearCredentials());
    };

    rehydrate();
  }, [status, session?.accessToken, dispatch]);

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
