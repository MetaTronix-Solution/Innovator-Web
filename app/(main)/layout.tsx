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
    <div className="min-h-screen bg-background font-sans transition-colors duration-300">
      <Navbar />

      {/* 2. Removed max-w limit to let the layout breathe, or increased it for ultra-wide screens */}
      <div className="w-full mx-auto px-0 md:px-4 lg:px-8">
        {/* 3. Changed justify-between to justify-center to keep the feed focused while sidebars fill the edges */}
        <div className="flex justify-center pt-4 gap-4 xl:gap-8">
          {/* Left Sidebar: Fixed width, disappears on smaller screens */}
          <aside className="hidden xl:block w-[280px] 2xl:w-[320px] sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto no-scrollbar">
            <LeftSidebar />
          </aside>

          {/* Main Feed: Takes remaining space but has a max-width for readability */}
          <main className="w-full max-w-[680px] min-w-0 px-2 md:px-0">
            {children}
          </main>

          {/* Right Sidebar: Fixed width, disappears on medium screens */}
          <aside className="hidden lg:block w-[300px] 2xl:w-[350px] sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto no-scrollbar">
            <RightWidgets />
          </aside>
        </div>
      </div>
    </div>
  );
}
