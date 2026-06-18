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

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  bold?: boolean;
  isActive?: boolean;
}

const LeftSidebar = () => {
  const pathname = usePathname();

  const items = [
    { icon: <Users size={24} />, label: "Followings", href: "/following" },
    { icon: <Video size={24} />, label: "Reels", href: "/reels" },
    { icon: <ShoppingBag size={24} />, label: "Shop", href: "/products" },
    { icon: <MessageSquare size={24} />, label: "Messages", href: "/messages" },
    { icon: <Calendar size={24} />, label: "Events", href: "/events" },
    { icon: <Truck size={24} />, label: "My Orders", href: "/orders" },
  ];

  return (
    <aside className="h-[calc(100vh-56px)] sticky top-14 p-2">
      <div className="space-y-1 pb-4 border-b border-border">
        {items.map((item) => (
          <SidebarItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={
              pathname === item.href || pathname.startsWith(item.href + "/")
            }
          />
        ))}
      </div>
    </aside>
  );
};

const SidebarItem = ({
  icon,
  label,
  href,
  bold = false,
  isActive = false,
}: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all active:scale-[0.98] group
    ${isActive ? "bg-accent" : "hover:bg-accent"}`}
    >
      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
        <span className="text-primary">{icon}</span>
      </div>
      <span
        className={`text-[15px] text-foreground font-semibold ${bold ? "font-semibold" : "font-medium"} 
      `}
      >
        {label}
      </span>
    </Link>
  );
};

export default LeftSidebar;
