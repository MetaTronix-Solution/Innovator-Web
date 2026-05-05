"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightWidgets from "@/components/layout/RightWidgets";
import { RootState } from "@/lib/store/store";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isInitialized } = useSelector(
    (state: any) => state.auth,
  );
  const router = useRouter();

  const { mode } = useSelector((state: RootState) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;

    if (mode === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  }, [mode]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex justify-between pt-4 gap-6 xl:gap-12">
          <aside className="hidden xl:block w-[300px] sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto no-scrollbar">
            <LeftSidebar />
          </aside>

          <main className="flex-1 max-w-[680px] min-w-0">{children}</main>

          <aside className="hidden lg:block w-[320px] sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto no-scrollbar">
            <RightWidgets />
          </aside>
        </div>
      </div>
    </div>
  );
}
