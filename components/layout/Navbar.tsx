"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  PlaySquare,
  ShoppingBag,
  Bell,
  ChevronDown,
  BookOpen,
  User,
  FileText,
  PlusCircle,
  MessageSquare,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/services/authService";
import { clearCredentials } from "@/lib/store/features/authSlice";
import SearchBar from "../SearchBar";
import UserDropdown from "../UserDropdown";
import { signOut } from "next-auth/react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { NotificationFeed } from "@/components/NotificationFeed";
import { NotificationService } from "@/lib/services/notificationService";
import { NotificationItem } from "@/types/notification";
import CreateReelModal from "../Reels/create/CreateReelModal";
import MobileTabBar from "@/components/layout/MobileTabBar";

interface NavItemProps {
  icon: React.ReactElement<{ size?: number; strokeWidth?: number }>;
  href: string;
  title: string;
  active?: boolean;
}

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const [initialNotifications, setInitialNotifications] = useState<
    NotificationItem[]
  >([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const [createReelOpen, setCreateReelOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const { user } = useSelector((state: RootState) => state.auth);
  const { activeChatId } = useSelector((state: RootState) => state.messages);

  useEffect(() => {
    if (!user) return;
    const fetchInitialNotifications = async () => {
      try {
        const data = await NotificationService.getNotifications();
        setInitialNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.is_read).length);
      } catch (err) {
        console.error("Failed loading initial notification metrics:", err);
      }
    };
    fetchInitialNotifications();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isBellClick =
        target.closest('[aria-label="Notification options"]') ||
        target.closest(".bell-icon-container");
      const isInsideDropdown = target.closest(".notification-dropdown");
      if (isBellClick || isInsideDropdown) return;
      setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setTabBarVisible(currentY < lastScrollY.current || currentY < 10);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getProfileImage = () => {
    const rawAvatarPath = user?.profile?.avatar || user?.profile_image;
    if (!rawAvatarPath || rawAvatarPath === "null") return null;
    return getMediaUrl(rawAvatarPath);
  };
  const profileImage = getProfileImage();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(clearCredentials());
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    }
  };

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const navLinks = [
    { icon: <Home />, href: "/", title: "Home", exact: true },
    { icon: <PlaySquare />, href: "/reels", title: "Reels" },
    { icon: <ShoppingBag />, href: "/products", title: "Shop" },
    { icon: <BookOpen />, href: "/courses", title: "E-learning" },
    { icon: <FileText />, href: "/research", title: "Research Papers" },
  ];

  const isChatRoomActive = pathname === "/messages" && !!activeChatId;

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-md md:hidden animate-in fade-in duration-300"
          aria-hidden="true"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <nav
        className={`sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm ${
          pathname === "/" ? "block" : "hidden md:block"
        }`}
      >
        <div
          className={`max-w-[1440px] mx-auto px-2 md:px-6 flex items-center justify-between h-12 md:h-16 ${
            pathname === "/" ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="flex items-center cursor-pointer flex-1 gap-2">
            <Link
              href="/"
              className="shrink-0 flex items-center gap-1"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  const start =
                    window.scrollY ||
                    document.documentElement.scrollTop ||
                    document.body.scrollTop;
                  if (start === 0) return;

                  const duration = 800;
                  const startTime = performance.now();

                  const animateScroll = (currentTime: number) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease =
                      progress < 0.5
                        ? 2 * progress * progress
                        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                    const position = start * (1 - ease);

                    window.scrollTo(0, position);
                    document.documentElement.scrollTop = position;
                    document.body.scrollTop = position;

                    if (progress < 1) requestAnimationFrame(animateScroll);
                  };

                  requestAnimationFrame(animateScroll);
                }
              }}
            >
              <Image
                src="/logo1.png"
                alt="Innovator"
                width={40}
                height={40}
                className="rounded-full"
              />
              <p className="hidden md:block text-primary text-2xl font-medium">
                Innovator
              </p>
            </Link>
            <div className="flex sm:hidden ml-1">
              <SearchBar />
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center justify-center flex-[1.5] h-full gap-1">
            {navLinks.map((link) => (
              <NavItem
                key={link.href}
                title={link.title}
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
              <button
                onClick={() => setCreateReelOpen(true)}
                className="p-2 rounded-full hover:bg-accent hover:scale-105"
                title="Create Reel"
              >
                <PlusCircle className="text-secondary-foreground" size={24} />
              </button>

              <div className="relative" ref={notifRef}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotifOpen((prev) => !prev);
                  }}
                  className="bell-icon-container relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 text-muted-foreground rounded-full cursor-pointer hover:bg-accent hover:scale-105 transition-colors border border-transparent active:scale-95"
                >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-[3px] rounded-full bg-destructive text-[8px] text-accent font-bold flex items-center justify-center border border-card shadow">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                {notifOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="fixed top-[70px] right-32 w-[320px] 2xl:w-[380px] h-[calc(100vh-72px)] z-40 bg-card border-l border-border rounded-3xl shadow-xl overflow-y-auto no-scrollbar notification-dropdown"
                  >
                    <div className="p-4">
                      <NotificationFeed
                        initialNotifications={initialNotifications}
                        userId={user?.id || user?.uuid || ""}
                        token={user?.accessToken ?? undefined}
                        onUnreadCountChange={handleUnreadCountChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile action buttons */}
            <div className="flex sm:hidden items-center gap-1">
              <button
                onClick={() => setCreateReelOpen(true)}
                className="relative flex items-center justify-center w-8 h-8 bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent transition-colors active:scale-95"
                aria-label="Create Reel"
              >
                <PlusCircle size={18} />
              </button>
              <Link href="/messages" aria-label="Messages">
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-colors active:scale-95 ${
                    pathname === "/messages"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  <MessageSquare size={18} />
                </div>
              </Link>
              <div
                onClick={() => router.push("/notifications")}
                className="relative flex items-center justify-center w-8 h-8 bg-secondary text-muted-foreground rounded-full cursor-pointer hover:bg-accent transition-colors active:scale-95"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center border border-card shadow animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            </div>

            {/* Avatar / dropdown */}
            <div
              ref={dropdownRef}
              className="relative shrink-0 hidden sm:block"
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen((prev) => !prev);
                }}
                className="relative w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-secondary text-secondary-foreground border border-border cursor-pointer active:scale-95 transition-all flex items-center justify-center overflow-hidden shrink-0 p-0"
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
                    className="bg-secondary text-muted-foreground block leading-none"
                  />
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent text-accent-foreground rounded-full border border-card flex items-center justify-center">
                  <ChevronDown size={8} />
                </div>
              </div>
              {isDropdownOpen && (
                <div onClick={(e) => e.stopPropagation()}>
                  <UserDropdown
                    user={user}
                    onLogout={handleLogout}
                    getProfileImage={getProfileImage}
                    onClose={() => setIsDropdownOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <MobileTabBar visible={tabBarVisible} />

      <CreateReelModal
        isOpen={createReelOpen}
        onClose={() => setCreateReelOpen(false)}
      />
    </>
  );
};

const NavItem = ({ icon, title, href, active = false }: NavItemProps) => (
  <div className="relative group flex items-center justify-center h-full">
    <div className="absolute top-full mt-2 px-4 py-1 bg-primary text-secondary-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
      {title}
    </div>
    <Link
      href={href}
      className={`flex items-center justify-center w-16 lg:w-24 h-full cursor-pointer border-b-4 transition-all ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
    </Link>
  </div>
);

export default Navbar;
