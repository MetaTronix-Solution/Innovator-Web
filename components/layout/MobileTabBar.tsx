"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PlaySquare,
  Store,
  BookOpen,
  TextAlignJustify,
  FileText,
} from "lucide-react";

const TAB_LINKS = [
  { icon: <Home />, href: "/", label: "Home", exact: true },
  { icon: <PlaySquare />, href: "/reels", label: "Reels" },
  { icon: <Store />, href: "/products", label: "Shop" },
  { icon: <BookOpen />, href: "/courses", label: "Course" },
  { icon: <FileText />, href: "/research", label: "Research" },
  { icon: <TextAlignJustify />, href: "/more", label: "More" },
];

interface MobileTabBarProps {
  visible: boolean;
  isMobileMenuOpen: boolean;
  onToggleMenu: () => void;
}

const MobileTabBar = ({ visible }: MobileTabBarProps) => {
  const pathname = usePathname();

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {TAB_LINKS.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative group"
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
              <span
                className={`transition-all duration-200 ${
                  isActive
                    ? "text-primary scale-110"
                    : "text-muted-foreground group-active:scale-90"
                }`}
              >
                {React.cloneElement(
                  link.icon as React.ReactElement<{
                    size?: number;
                    strokeWidth?: number;
                  }>,
                  { size: 22, strokeWidth: isActive ? 2.5 : 1.8 },
                )}
              </span>
              <span
                className={`text-[10px] font-medium leading-none transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div
        style={{ height: "env(safe-area-inset-bottom)" }}
        className="bg-card"
      />
    </div>
  );
};

export default MobileTabBar;
