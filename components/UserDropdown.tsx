"use client";

import React from "react";
import Image from "next/image";
import {
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  UserCircle,
  User,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useRouter } from "next/navigation";

interface UserDropdownProps {
  user: any;
  onLogout: () => void;
  getProfileImage: () => string | null;
}

interface MenuLinkProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  hasArrow?: boolean;
  onClick?: () => void;
}

const UserDropdown = ({
  user,
  onLogout,
  getProfileImage,
}: UserDropdownProps) => {
  const profileImage = getProfileImage();
  const router = useRouter();

  const handleViewProfile = () => {
    router.push("/me");
  };
  return (
    <div className="absolute top-12 right-0 w-[360px] bg-card border border-border shadow-2xl rounded-xl overflow-hidden z-[60] p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="p-2 mb-2 rounded-lg shadow-md border border-border bg-background/50">
        <div
          onClick={handleViewProfile}
          className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors cursor-pointer"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border flex items-center justify-center">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="User"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <User
                size={20}
                className="bg-secondary text-secondary-foreground"
              />
            )}
          </div>
          <span className="font-bold text-foreground">
            {user?.full_name || user?.username}
          </span>
        </div>
      </div>

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
        <MenuLink icon={<ThemeToggle />} label="Display & accessibility" />

        <MenuLink
          icon={<LogOut size={20} />}
          label="Log out"
          onClick={onLogout}
        />
      </div>
    </div>
  );
};

const MenuLink = ({
  icon,
  label,
  sublabel,
  hasArrow,
  onClick,
}: MenuLinkProps) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors group"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 flex items-center justify-center bg-secondary text-secondary-foreground rounded-full group-hover:bg-secondary/80 transition-colors shrink-0">
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
