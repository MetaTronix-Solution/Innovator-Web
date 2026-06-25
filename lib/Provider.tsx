"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, { useEffect, useRef } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { persistor, RootState, store } from "./store/store";
import { setCredentials, clearCredentials } from "./store/features/authSlice";
import { PersistGate } from "redux-persist/integration/react";

export function ThemeSync() {
  const mode = useSelector((state: RootState) => state.theme.mode);

  useEffect(() => {
    const root = window.document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [mode]);

  return null;
}

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const hydratedRef = useRef(false);

  useEffect(() => {
    // Crucial: Wait for Auth status to resolve before deciding to clear credentials
    if (status === "loading" || hydratedRef.current) return;

    const rehydrate = async () => {
      // 1. Check for quick-login flag
      if (
        typeof window !== "undefined" &&
        sessionStorage.getItem("just_logged_in") === "true"
      ) {
        sessionStorage.removeItem("just_logged_in");
        hydratedRef.current = true;
        return;
      }

      // 2. Try fetching current user
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          dispatch(setCredentials({ user: data.user }));
          hydratedRef.current = true;
          return;
        }
      } catch (err) {
        console.error("AuthHydrator: Failed to fetch profile from API", err);
      }

      // 3. If API failed, try to sync session with server-side cookie
      if (status === "authenticated" && session?.accessToken) {
        try {
          const cookieRes = await fetch("/api/auth/set-cookie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: session.accessToken }),
          });

          if (cookieRes.ok) {
            try {
              const meRes = await fetch("/api/auth/me");
              const data = await meRes.json();
              dispatch(setCredentials({ user: data.user }));
            } catch (innerErr) {
              console.warn(
                "AuthHydrator: Cookie set, but profile fetch failed, using session fallback",
                innerErr,
              );
              dispatch(setCredentials({ user: session.user }));
            }
            hydratedRef.current = true;
            return;
          }
        } catch (err) {
          console.error(
            "AuthHydrator: Network error during cookie synchronization",
            err,
          );
        }
      }

      // 4. Final fallback: If unauthenticated, clear credentials
      dispatch(clearCredentials());
      hydratedRef.current = true;
    };

    rehydrate();
  }, [status, session, dispatch]);

  return <>{children}</>;
}

function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        {/* <PersistGate loading={null} persistor={persistor}> */}
        <PersistGate
          loading={
            <div className="h-screen w-full flex items-center justify-center">
              Loading...
            </div>
          }
          onBeforeLift={() =>
            new Promise((resolve) => setTimeout(resolve, 100))
          }
          persistor={persistor}
        >
          <ThemeSync />
          <AuthHydrator>{children}</AuthHydrator>
        </PersistGate>
      </Provider>
    </SessionProvider>
  );
}

export default AppProvider;
