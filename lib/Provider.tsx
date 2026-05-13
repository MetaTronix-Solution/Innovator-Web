// "use client";

// import { SessionProvider, useSession } from "next-auth/react";
// import React, { useEffect } from "react";
// import { Provider, useDispatch } from "react-redux";
// import { persistor, store } from "./store/store";
// import { setCredentials, clearCredentials } from "./store/features/authSlice";
// import { PersistGate } from "redux-persist/integration/react";

// function AuthHydrator({ children }: { children: React.ReactNode }) {
//   const dispatch = useDispatch();
//   const { data: session, status } = useSession();

//   useEffect(() => {
//     if (status === "loading") return;

//     const rehydrate = async () => {
//       try {
//         const res = await fetch("/api/auth/me");
//         if (res.ok) {
//           const data = await res.json();
//           dispatch(setCredentials({ user: data.user }));
//           return;
//         }
//       } catch {
//         // fall through
//       }

//       // No cookie — check NextAuth (Google login)
//       if (status === "authenticated" && session?.accessToken) {
//         // Set the HttpOnly cookie for Google users too
//         await fetch("/api/auth/set-cookie", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ accessToken: session.accessToken }),
//         });

//         dispatch(setCredentials({ user: session.user }));
//         return;
//       }

//       dispatch(clearCredentials());
//     };

//     rehydrate();
//   }, [status, session, dispatch]);

//   return <>{children}</>;
// }

// function AppProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <SessionProvider>
//       <Provider store={store}>
//         <PersistGate loading={null} persistor={persistor}>
//           <AuthHydrator>{children}</AuthHydrator>
//         </PersistGate>
//       </Provider>
//     </SessionProvider>
//   );
// }

// export default AppProvider;

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
  // ✅ Prevent duplicate runs when both status + session change together
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (status === "loading") return;

    // ✅ If we already dispatched credentials this session, skip
    if (hydratedRef.current) return;

    const rehydrate = async () => {
      // 1️⃣ First, try the HttpOnly cookie (email/password users + returning Google users)
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

      // 2️⃣ Google sign-in: session exists but no HttpOnly cookie yet
      if (status === "authenticated" && session?.accessToken) {
        // ✅ Await the cookie being set BEFORE dispatching credentials
        const cookieRes = await fetch("/api/auth/set-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: session.accessToken }),
        });

        if (cookieRes.ok) {
          // ✅ Re-fetch /api/auth/me so user data comes from a single source of truth
          try {
            const meRes = await fetch("/api/auth/me");
            if (meRes.ok) {
              const data = await meRes.json();
              dispatch(setCredentials({ user: data.user }));
              hydratedRef.current = true;
              return;
            }
          } catch {
            // fall through to using session data directly
          }

          // ✅ Fallback: use session user if /me still fails
          dispatch(setCredentials({ user: session.user }));
          hydratedRef.current = true;
          return;
        }
      }

      // 3️⃣ Truly unauthenticated
      dispatch(clearCredentials());
    };

    rehydrate();
    // ✅ Use stable primitives instead of the session object to avoid extra triggers
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
