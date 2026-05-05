"use client";

import React from "react";
import Image from "next/image";
import {
  Settings,
  HelpCircle,
  Moon,
  LogOut,
  ChevronRight,
  UserCircle,
} from "lucide-react";

interface UserDropdownProps {
  user: any;
  onLogout: () => void;
  getProfileImage: () => string;
}

const UserDropdown = ({
  user,
  onLogout,
  getProfileImage,
}: UserDropdownProps) => {
  return (
    <div className="absolute top-12 right-0 w-[360px] bg-card border border-border shadow-2xl rounded-xl overflow-hidden z-[60] p-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Profile Section */}
      <div className="p-2 mb-2 rounded-lg shadow-md border border-border bg-background/50">
        <div className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors cursor-pointer">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border">
            <Image
              src={getProfileImage()}
              alt="User"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <span className="font-bold text-foreground">
            {user?.full_name || user?.username}
          </span>
        </div>
        <div className="border-t border-border mt-2 pt-2">
          <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-md transition-colors">
            <UserCircle size={18} /> See all profiles
          </button>
        </div>
      </div>

      {/* Menu Links */}
      <div className="space-y-1">
        <MenuLink
          icon={<Settings size={20} />}
          label="Settings & privacy"
          hasArrow
        />
        <MenuLink
          icon={<HelpCircle size={20} />}
          label="Help & support"
          hasArrow
        />
        <MenuLink
          icon={<Moon size={20} />}
          label="Display & accessibility"
          hasArrow
        />

        <div onClick={onLogout}>
          <MenuLink icon={<LogOut size={20} />} label="Log out" />
        </div>
      </div>
    </div>
  );
};

const MenuLink = ({ icon, label, sublabel, hasArrow, onClick }: any) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors group"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-secondary rounded-full group-hover:bg-secondary/80 transition-colors">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {sublabel && (
          <span className="text-[10px] text-muted-foreground uppercase">
            {sublabel}
          </span>
        )}
      </div>
    </div>
    {hasArrow && <ChevronRight size={18} className="text-muted-foreground" />}
  </div>
);

export default UserDropdown;
