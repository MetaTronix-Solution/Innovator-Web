"use client";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightWidgets from "@/components/layout/RightWidgets";
import { RootState } from "@/lib/store/store";
import { setCredentials } from "@/lib/store/features/authSlice";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitialized } = useSelector(
    (state: any) => state.auth,
  );
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { mode } = useSelector((state: RootState) => state.theme);

  const hasRedirected = useRef(false);

  // useEffect(() => {
  //   const root = window.document.documentElement;
  //   if (mode === "light") {
  //     root.classList.add("light");
  //     root.classList.remove("dark");
  //   } else {
  //     root.classList.add("dark");
  //     root.classList.remove("light");
  //   }
  // }, [mode]);

  useEffect(() => {
    if (
      sessionStatus === "authenticated" &&
      session?.accessToken &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;

      document.cookie = `accessToken=${session.accessToken}; path=/; max-age=${
        60 * 60 * 24
      }; SameSite=Lax`;
      dispatch(setCredentials({ user: session.user as any }));

      const isOAuthCallback = window.location.pathname.startsWith("/api/auth");
      if (isOAuthCallback) {
        window.history.replaceState(null, "", "/");

        const blockBack = () => window.history.pushState(null, "", "/");
        window.addEventListener("popstate", blockBack);
        return () => window.removeEventListener("popstate", blockBack);
      }
    }
  }, [sessionStatus, session, dispatch]);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus === "authenticated") return;

    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, sessionStatus, router]);

  if (
    sessionStatus === "loading" ||
    !isInitialized ||
    (!isAuthenticated && sessionStatus !== "authenticated")
  ) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans transition-colors duration-300">
      <Navbar />
      <div className="w-full mx-auto px-0 md:px-4 lg:px-8">
        <div className="flex justify-center pt-4 gap-4 xl:gap-8">
          <aside className="hidden xl:block w-[280px] 2xl:w-[320px] sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto no-scrollbar">
            <LeftSidebar />
          </aside>
          <main className="w-full max-w-[680px] min-w-0 px-2 md:px-4">
            {children}
          </main>
          <aside className="hidden lg:block w-[300px] 2xl:w-[350px] sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto no-scrollbar">
            <RightWidgets />
          </aside>
        </div>
      </div>
    </div>
  );
}
