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

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  bold?: boolean;
}

const LeftSidebar = () => {
  return (
    <aside className="h-[calc(100vh-56px)] sticky top-14 p-2">
      <div className="space-y-1 pb-4 border-b border-border">
        <SidebarItem
          icon={<Users size={24} className="text-primary" />}
          label="Followings"
          href="/following"
        />
        <SidebarItem
          icon={<Video size={24} className="text-primary" />}
          label="Reels"
          href="/reels"
        />
        <SidebarItem
          icon={<ShoppingBag size={24} className="text-primary" />}
          label="Shop"
          href="/products"
        />

        <SidebarItem
          icon={<MessageSquare size={24} className="text-primary" />}
          label="Messages"
          href="/messages"
        />

        <SidebarItem
          icon={<Calendar size={24} className="text-primary" />}
          label="Events"
          href="/events"
        />

        <SidebarItem
          icon={<Truck size={24} className="text-primary" />}
          label="My Orders"
          href="/orders"
        />
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, href, bold = false }: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-accent transition-all active:scale-[0.98] group"
    >
      <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
        {icon}
      </div>
      <span
        className={`text-[15px] ${bold ? "font-semibold" : "font-medium"} text-foreground`}
      >
        {label}
      </span>
    </Link>
  );
};

export default LeftSidebar;
