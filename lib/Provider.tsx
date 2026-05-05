"use client";

import { SessionProvider } from "next-auth/react";
import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store/store";
import { setCredentials, setInitialized } from "./store/features/authSlice";

// This internal component has access to dispatch
function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      dispatch(
        setCredentials({
          token: savedToken,
          user: JSON.parse(savedUser),
        }),
      );
    } else {
      // Crucial: Tell the app we looked, and there's nobody here.
      dispatch(setInitialized());
    }
  }, [dispatch]);

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
