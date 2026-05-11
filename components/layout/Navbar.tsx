"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import Image from "next/image";
import {
  Home,
  PlaySquare,
  Store,
  MessageCircle,
  Bell,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/services/authService";
import { clearCredentials, logout } from "@/lib/store/features/authSlice";
import { ThemeToggle } from "../ThemeToggle";
import SearchBar from "../SearchBar";
import UserDropdown from "../UserDropdown";
import { signOut } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface NavItemProps {
  icon: React.ReactElement<{ size?: number; strokeWidth?: number }>;
  href: string;
  active?: boolean;
}

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const { user } = useSelector((state: RootState) => state.auth);

  const getProfileImage = () => {
    if (!user?.profile_image || user?.profile_image === "null") return null;
    return user.profile_image.startsWith("http")
      ? user.profile_image
      : `${BASE_URL}${user.profile_image}`;
  };
  const profileImage = getProfileImage();

  // const handleLogout = async () => {
  //   try {
  //     await authService.logout();
  //   } catch (error) {
  //     console.error("An error occurred during logout:", error);
  //   } finally {
  //     dispatch(logout());
  //     router.push("/login");
  //     router.refresh();
  //   }
  // };

  const handleLogout = async () => {
    try {
      await authService.logout(); // clears HttpOnly cookie
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(clearCredentials()); // clears Redux + persisted storage
      await signOut({ redirect: false }); // clears NextAuth session (Google users)
      router.push("/login");
      router.refresh();
    }
  };

  const navLinks = [
    { icon: <Home />, href: "/", label: "Home", exact: true },
    { icon: <PlaySquare />, href: "/reels", label: "Reels" },
    { icon: <Store />, href: "/ecommerce", label: "Market" },
    { icon: <GraduationCap />, href: "/elearning", label: "Academy" },
    { icon: <BookOpen />, href: "/research", label: "Library" },
  ];

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-md md:hidden animate-in fade-in duration-300"
          aria-hidden="true"
        />
      )}

      <nav className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between h-14">
          <div className="flex items-center flex-1 gap-2">
            <div
              onClick={() => router.push("/")}
              className="flex items-center justify-center w-9 h-9 text-xl font-bold text-primary-foreground bg-primary rounded-full cursor-pointer hover:opacity-90 shrink-0"
            >
              I
            </div>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-[1.5] h-full gap-1">
            {navLinks.map((link) => (
              <NavItem
                key={link.href}
                icon={link.icon}
                href={link.href}
                active={
                  link.exact
                    ? pathname === link.href
                    : pathname.startsWith(link.href)
                }
              />
            ))}
          </div>

          <div className="flex items-center justify-end flex-1 gap-1 md:gap-2">
            <div className="hidden sm:flex items-center gap-1 md:gap-2">
              <SearchBar />
              <IconButton icon={<MessageCircle />} />
              <IconButton icon={<Bell />} />
            </div>

            <div ref={dropdownRef} className="relative shrink-0">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative w-9 h-9 rounded-full bg-secondary text-secondary-foreground border border-border cursor-pointer active:scale-95 transition-all flex items-center justify-center overflow-hidden shrink-0 p-0"
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={user?.username || "User profile"}
                    fill
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User
                    size={22}
                    className="bg-secondary text-secondary-foreground block leading-none"
                  />
                )}

                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent text-accent-foreground rounded-full border border-card flex items-center justify-center">
                  <ChevronDown size={8} />
                </div>
              </div>

              {isDropdownOpen && (
                <UserDropdown
                  user={user}
                  onLogout={handleLogout}
                  getProfileImage={getProfileImage}
                />
              )}
            </div>

            <button
              className="md:hidden p-2 text-foreground relative z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden absolute top-14 left-0 w-full bg-card border-b border-border p-4 shadow-xl animate-in slide-in-from-top"
          >
            <div className="mb-4">
              <SearchBar />
            </div>
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((link) => (
                <div
                  key={link.href}
                  onClick={() => {
                    router.push(link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent"
                  }`}
                >
                  {React.cloneElement(
                    link.icon as React.ReactElement<{ size?: number }>,
                    {
                      size: 20,
                    },
                  )}
                  <span className="font-medium">{link.label}</span>
                </div>
              ))}
              <hr className="border-border my-2" />
              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-medium">Theme</span>
                <ThemeToggle />
              </div>
              <Button
                variant="destructive"
                className="w-full mt-2 gap-2"
                onClick={handleLogout}
              >
                <LogOut size={18} /> Logout
              </Button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

const NavItem = ({ icon, href, active = false }: NavItemProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(href)}
      className={`
        flex items-center justify-center w-16 lg:w-24 h-full cursor-pointer border-b-4 transition-all
        ${
          active
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }
      `}
    >
      {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 })}
    </div>
  );
};

interface IconButtonProps {
  icon: React.ReactElement<{ size?: number }>;
}

const IconButton = ({ icon }: IconButtonProps) => (
  <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent transition-colors border border-transparent active:scale-95">
    {React.cloneElement(icon, { size: 18 })}
  </div>
);

export default Navbar;
