"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  LogOut,
  User,
  Ban,
  Lock,
  Shield,
  Edit,
  Key,
  Eye,
  Tag,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import ChangePasswordModal from "./ChangePasswordModal";

const UserDropdown = ({ user, onLogout, getProfileImage, onClose }: any) => {
  const profileImage = getProfileImage();
  const userId = user?.id || user?.user_id;
  const router = useRouter();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [openSection, setOpenSection] = useState<"account" | "privacy" | null>(
    null,
  );

  useEffect(() => {
    const handleScroll = () => onClose();
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [onClose]);

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  const toggleSection = (section: "account" | "privacy") => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="absolute top-12 right-0 w-[360px] bg-card border border-border shadow-2xl rounded-xl overflow-hidden z-[60] p-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Profile link */}
      <div className="p-2 mb-4 rounded-lg border border-border bg-background/50">
        <Link
          href={`/${userId}`}
          onClick={onClose}
          className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border flex items-center justify-center bg-muted">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="User"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <User size={20} />
            )}
          </div>
          <span className="font-bold text-foreground">
            {user?.full_name || user?.username}
          </span>
        </Link>
      </div>

      <div className="space-y-1">
        {/* Settings Header */}
        <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase">
          Settings & Privacy
        </div>

        <MenuLink
          icon={<User size={20} />}
          label="Account"
          hasArrow
          isExpanded={openSection === "account"}
          onClick={() => toggleSection("account")}
        />
        {openSection === "account" && (
          <div className="pl-6 space-y-1 animate-in slide-in-from-top-1 duration-200">
            <MenuLink
              icon={<Edit size={16} />}
              label="Edit profile"
              onClick={() => handleNavigate("/settings/edit-profile")}
            />
            <MenuLink
              icon={<Key size={16} />}
              label="Change password"
              onClick={() => {
                setShowPasswordModal(true);
              }}
            />
            <MenuLink icon={<Lock size={16} />} label="Private account" />
          </div>
        )}

        {showPasswordModal && (
          <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
        )}

        <MenuLink
          icon={<Shield size={20} />}
          label="Privacy"
          hasArrow
          isExpanded={openSection === "privacy"}
          onClick={() => toggleSection("privacy")}
        />
        {openSection === "privacy" && (
          <div className="pl-6 space-y-1 animate-in slide-in-from-top-1 duration-200">
            <MenuLink icon={<Eye size={16} />} label="Online status" />
            <MenuLink icon={<Tag size={16} />} label="Allow tagging" />
            <MenuLink
              icon={<Ban size={16} />}
              label="Blocked users"
              onClick={() => handleNavigate("/settings/blocked-users")}
            />
          </div>
        )}

        <div className="my-2 border-t border-border" />

        <ThemeToggle />

        <MenuLink icon={<HelpCircle size={20} />} label="Help & support" />
        <MenuLink
          icon={<LogOut size={20} />}
          label="Log out"
          onClick={onLogout}
        />
      </div>
    </div>
  );
};

const MenuLink = ({ icon, label, hasArrow, onClick, isExpanded }: any) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors group"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 flex items-center justify-center bg-secondary rounded-full">
        {icon}
      </div>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </div>
    {hasArrow && (
      <ChevronDown
        size={18}
        className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
      />
    )}
  </div>
);

export default UserDropdown;
