"use client";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightWidgets from "@/components/layout/RightWidgets";
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
  const pathname = usePathname();

  const hasRedirected = useRef(false);
  const isMessagesPage = pathname === "/messages";
  const scrollPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.current[pathname] = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    const savedPosition = scrollPositions.current[pathname];
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo({ top: savedPosition, behavior: "instant" });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

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
      const hasAuthParam = new URLSearchParams(window.location.search).has(
        "auth",
      );

      if (isOAuthCallback || hasAuthParam) {
        window.history.replaceState(null, "", "/");

        if (isOAuthCallback) {
          const blockBack = () => window.history.pushState(null, "", "/");
          window.addEventListener("popstate", blockBack);
          return () => window.removeEventListener("popstate", blockBack);
        }
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
      <div id="scroll-top-anchor" />
      <Navbar />

      <div className="w-full mx-auto px-0 md:px-4 lg:px-8">
        <div className="flex items-start justify-center gap-4 xl:gap-8 pt-2 md:pt-4">
          <aside className="hidden xl:block w-[280px] 2xl:w-[320px] sticky top-[72px] max-h-[calc(100vh-72px)] overflow-y-auto no-scrollbar shrink-0">
            <LeftSidebar />
          </aside>

          <main className={`w-full min-w-0 md:px-4 max-w-[680px] md:pb-20`}>
            {children}
          </main>

          <aside className="hidden lg:block w-[300px] 2xl:w-[350px] sticky top-[72px] max-h-[calc(100vh-72px)] overflow-y-auto no-scrollbar shrink-0">
            <RightWidgets />
          </aside>
        </div>
      </div>
    </div>
  );
}
