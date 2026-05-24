"use client";

import { toggleTheme } from "@/lib/store/features/themeSlice";
import { RootState } from "@/lib/store/store";
import { Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

export function ThemeToggle() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);

  return (
    <div
      onClick={() => dispatch(toggleTheme())}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center bg-secondary text-secondary-foreground rounded-full">
          {mode === "dark" ? (
            <Sun size={18} className="animate-in zoom-in duration-300" />
          ) : (
            <Moon size={18} className="animate-in zoom-in duration-300" />
          )}
        </div>
        <span className="text-sm font-semibold text-foreground">
          {mode === "dark" ? "Light Mode" : "Dark Mode"}
        </span>
      </div>
    </div>
  );
}
