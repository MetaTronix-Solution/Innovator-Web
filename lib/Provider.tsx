// lib/Provider.tsx
"use client";

import { SessionProvider, useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store/store";
import { setCredentials, setInitialized } from "./store/features/authSlice";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    console.log("Auth status:", status);
    console.log("Session data:", session);

    if (status === "authenticated" && session?.accessToken) {
      console.log("User from session:", session.user);
      console.log("Access token:", session.accessToken);

      // Coming from Google OAuth — session has the token
      dispatch(
        setCredentials({
          token: session.accessToken,
          user: session.user,
        }),
      );
    } else {
      // Fall back to localStorage for email/password login
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      console.log("localStorage token:", savedToken);
      console.log("localStorage user:", savedUser);

      if (savedToken && savedUser) {
        dispatch(
          setCredentials({
            token: savedToken,
            user: JSON.parse(savedUser),
          }),
        );
      } else {
        dispatch(setInitialized());
      }
    }
  }, [status, session, dispatch]);

  return <>{children}</>;
}

function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <AuthHydrator>{children}</AuthHydrator>
      </Provider>
    </SessionProvider>
  );
}

export default AppProvider;
