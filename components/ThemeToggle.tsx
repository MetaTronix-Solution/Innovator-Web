"use client";

import { toggleTheme } from "@/lib/store/features/themeSlice";
import { RootState } from "@/lib/store/store";
import { Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.theme);

  return (
    <Button
      onClick={() => dispatch(toggleTheme())}
      className="flex items-center justify-center w-10 h-10 bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent transition-colors border border-transparent active:scale-95"
      aria-label="Toggle Theme"
    >
      {mode === "dark" ? (
        <Sun size={20} className="animate-in zoom-in duration-300" />
      ) : (
        <Moon size={20} className="animate-in zoom-in duration-300" />
      )}
    </Button>
  );
}
