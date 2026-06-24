"use client";

import React from "react";
import {
  Users,
  Video,
  Calendar,
  ShoppingBag,
  Truck,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GlassCard from "@/components/GlassCard";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}

const LeftSidebar = () => {
  const pathname = usePathname();

  const items = [
    { icon: <Users size={20} />, label: "Followings", href: "/following" },
    { icon: <Video size={20} />, label: "Reels", href: "/reels" },
    { icon: <ShoppingBag size={20} />, label: "Shop", href: "/products" },
    { icon: <MessageSquare size={20} />, label: "Messages", href: "/messages" },
    { icon: <Calendar size={20} />, label: "Events", href: "/events" },
    { icon: <Truck size={20} />, label: "My Orders", href: "/orders" },
  ];

  return (
    <aside className="sticky top-14 p-2">
      <GlassCard
        style={{}}
        borderRadius={12}
        displacementScale={30}
        blur={0.6}
        saturation={140}
        className="w-full"
      >
        {/* Nav items */}
        <div className="flex flex-col gap-0.5 p-2">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={isActive}
              />
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-3 h-px bg-black/[0.06] dark:bg-white/10" />

        {/* Footer */}
        <div className="px-4 py-4">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {[
              { label: "Terms", href: "/terms" },
              { label: "Privacy", href: "/privacy" },
              { label: "About", href: "/about" },
              { label: "Help", href: "/faq" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-1.5">
            © {new Date().getFullYear()} Innovator. All rights reserved.
          </p>
        </div>
      </GlassCard>
    </aside>
  );
};

const SidebarItem = ({
  icon,
  label,
  href,
  isActive = false,
}: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
        transition-all duration-200 active:scale-[0.98] group relative
        ${
          isActive
            ? "bg-white/40 dark:bg-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.15)]"
            : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
        }
      `}
      style={
        isActive ? { border: "1px solid rgba(255,255,255,0.55)" } : undefined
      }
    >
      <div
        className={`
          flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg
          transition-all duration-200
          ${
            isActive
              ? "bg-white/50 dark:bg-white/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
              : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200"
          }
        `}
      >
        {icon}
      </div>

      <span
        className={`
          text-[14.5px] tracking-[-0.01em] transition-colors duration-200
          ${
            isActive
              ? "font-semibold text-zinc-900 dark:text-white"
              : "font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
          }
        `}
      >
        {label}
      </span>

      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-primary opacity-70" />
      )}
    </Link>
  );
};

export default LeftSidebar;
