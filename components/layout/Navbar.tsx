// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "@/lib/store/store";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   Home,
//   PlaySquare,
//   Store,
//   MessageCircle,
//   Bell,
//   ChevronDown,
//   BookOpen,
//   GraduationCap,
//   Menu,
//   X,
//   LogOut,
//   User,
// } from "lucide-react";
// import { Button } from "../ui/button";
// import { usePathname, useRouter } from "next/navigation";
// import { authService } from "@/lib/services/authService";
// import { clearCredentials } from "@/lib/store/features/authSlice";
// import { ThemeToggle } from "../ThemeToggle";
// import SearchBar from "../SearchBar";
// import UserDropdown from "../UserDropdown";
// import { signOut } from "next-auth/react";
// import { getMediaUrl } from "@/lib/utils/getMediaUrl";

// import { NotificationFeed } from "@/components/NotificationFeed";

// import { NotificationService } from "@/lib/services/notificationService";
// import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
// import { NotificationItem } from "@/types/notification";

// interface NavItemProps {
//   icon: React.ReactElement<{ size?: number; strokeWidth?: number }>;
//   href: string;
//   active?: boolean;
// }

// const Navbar = () => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const dispatch = useDispatch();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [initialNotifications, setInitialNotifications] = useState<
//     NotificationItem[]
//   >([]);

//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const menuRef = useRef<HTMLDivElement>(null);

//   const { user } = useSelector((state: RootState) => state.auth);

//   useEffect(() => {
//     if (!user) return;

//     const fetchInitialNotifications = async () => {
//       try {
//         const data = await NotificationService.getNotifications();
//         setInitialNotifications(data);

//         const unread = data.filter((n: any) => !n.is_read).length;
//         setUnreadCount(unread);
//       } catch (err) {
//         console.error("Failed loading initial notification metrics:", err);
//       }
//     };

//     fetchInitialNotifications();
//   }, [user]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setIsMobileMenuOpen(false);
//       }
//     };

//     if (isMobileMenuOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isMobileMenuOpen]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         dropdownRef.current.contains(event.target as Node) === false
//       ) {
//         setIsDropdownOpen(false);
//       }
//     };
//     if (isDropdownOpen)
//       document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isDropdownOpen]);

//   const getProfileImage = () => {
//     const rawAvatarPath = user?.profile?.avatar || user?.profile_image;
//     if (!rawAvatarPath || rawAvatarPath === "null") return null;
//     return getMediaUrl(rawAvatarPath);
//   };
//   const profileImage = getProfileImage();

//   const handleLogout = async () => {
//     try {
//       await authService.logout();
//     } catch (error) {
//       console.error("Logout error:", error);
//     } finally {
//       dispatch(clearCredentials());
//       await signOut({ redirect: false });
//       router.push("/login");
//       router.refresh();
//     }
//   };

//   const [notifOpen, setNotifOpen] = useState(false);
//   const notifRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
//         setNotifOpen(false);
//       }
//     };
//     if (notifOpen) document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, [notifOpen]);

//   const isMobile = useMediaQuery("(max-width: 640px)");

//   const navLinks = [
//     { icon: <Home />, href: "/", label: "Home", exact: true },
//     { icon: <PlaySquare />, href: "/reels", label: "Reels" },
//     { icon: <Store />, href: "/ecommerce", label: "Market" },
//     { icon: <GraduationCap />, href: "/elearning", label: "Academy" },
//     { icon: <BookOpen />, href: "/research", label: "Library" },
//   ];

//   return (
//     <>
//       {isMobileMenuOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-background/60 backdrop-blur-md md:hidden animate-in fade-in duration-300"
//           aria-hidden="true"
//         />
//       )}

//       <nav className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
//         <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between h-16">
//           <div className="flex items-center flex-1 gap-2">
//             <Link
//               href="/"
//               className="flex items-center justify-center w-10 h-10 text-xl font-bold text-primary-foreground bg-primary rounded-full hover:opacity-90 shrink-0 select-none"
//             >
//               I
//             </Link>
//           </div>

//           <div className="hidden md:flex items-center justify-center flex-[1.5] h-full gap-1">
//             {navLinks.map((link) => (
//               <NavItem
//                 key={link.href}
//                 icon={link.icon}
//                 href={link.href}
//                 active={
//                   link.exact
//                     ? pathname === link.href
//                     : pathname.startsWith(link.href)
//                 }
//               />
//             ))}
//           </div>

//           <div className="flex items-center justify-end flex-1 gap-1 md:gap-2">
//             <div className="hidden sm:flex items-center gap-1 md:gap-2">
//               <SearchBar />
//               <IconButton icon={<MessageCircle />} />

//               <div className="relative" ref={notifRef}>
//                 <div
//                   onClick={() => setNotifOpen((o) => !o)}
//                   className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent transition-colors border border-transparent active:scale-95"
//                 >
//                   <Bell size={28} />
//                   {unreadCount > 0 && (
//                     <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center border border-card shadow animate-pulse">
//                       {unreadCount}
//                     </span>
//                   )}
//                 </div>

//                 {notifOpen && (
//                   <div className="fixed top-[70px] right-32 w-[320px] 2xl:w-[380px] h-[calc(100vh-72px)] z-40 bg-card border-l border-border rounded-3xl shadow-xl overflow-y-auto no-scrollbar">
//                     <div className="p-4">
//                       <NotificationFeed
//                         initialNotifications={initialNotifications}
//                         userId={user?.id || user?.uuid || ""}
//                         token={user?.accessToken ?? undefined}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div ref={dropdownRef} className="relative shrink-0">
//               <div
//                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                 className="relative w-10 h-10 rounded-full bg-secondary text-secondary-foreground border border-border cursor-pointer active:scale-95 transition-all flex items-center justify-center overflow-hidden shrink-0 p-0"
//               >
//                 {profileImage ? (
//                   <Image
//                     src={profileImage}
//                     alt={user?.username || "User profile"}
//                     fill
//                     className="rounded-full object-cover"
//                     unoptimized
//                   />
//                 ) : (
//                   <User
//                     size={22}
//                     className="bg-secondary text-secondary-foreground block leading-none"
//                   />
//                 )}

//                 <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent text-accent-foreground rounded-full border border-card flex items-center justify-center">
//                   <ChevronDown size={8} />
//                 </div>
//               </div>

//               {isDropdownOpen && (
//                 <UserDropdown
//                   user={user}
//                   onLogout={handleLogout}
//                   getProfileImage={getProfileImage}
//                   onClose={() => setIsDropdownOpen(false)}
//                 />
//               )}
//             </div>

//             <button
//               className="md:hidden p-2 text-foreground relative z-50"
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             >
//               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//             </button>
//           </div>
//         </div>

//         {isMobileMenuOpen && (
//           <div
//             ref={menuRef}
//             className="md:hidden absolute top-14 left-0 w-full bg-card border-b border-border p-4 shadow-xl animate-in slide-in-from-top"
//           >
//             <div className="mb-4">
//               <SearchBar />
//             </div>
//             <div className="grid grid-cols-1 gap-2">
//               {navLinks.map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   onClick={() => setIsMobileMenuOpen(false)}
//                   className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
//                     pathname === link.href
//                       ? "bg-primary/10 text-primary"
//                       : "hover:bg-accent"
//                   }`}
//                 >
//                   {React.cloneElement(
//                     link.icon as React.ReactElement<{ size?: number }>,
//                     {
//                       size: 20,
//                     },
//                   )}
//                   <span className="font-medium">{link.label}</span>
//                 </Link>
//               ))}

//               <hr className="border-border my-2" />

//               <Link
//                 href="/notifications"
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 className="flex items-center justify-between p-3 rounded-lg hover:bg-accent text-foreground"
//               >
//                 <div className="flex items-center gap-3">
//                   <Bell size={20} />
//                   <span className="font-medium">Notifications</span>
//                 </div>
//                 {unreadCount > 0 && (
//                   <span className="px-2 py-0.5 rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
//                     {unreadCount} new
//                   </span>
//                 )}
//               </Link>

//               <div className="flex items-center justify-between px-2 py-1">
//                 <span className="text-sm font-medium">Theme</span>
//                 <ThemeToggle />
//               </div>

//               <Button
//                 variant="destructive"
//                 className="w-full mt-2 gap-2"
//                 onClick={handleLogout}
//               >
//                 <LogOut size={18} /> Logout
//               </Button>
//             </div>
//           </div>
//         )}
//       </nav>
//     </>
//   );
// };

// const NavItem = ({ icon, href, active = false }: NavItemProps) => {
//   return (
//     <Link
//       href={href}
//       className={`
//         flex items-center justify-center w-16 lg:w-24 h-full cursor-pointer border-b-4 transition-all
//         ${
//           active
//             ? "border-primary text-primary"
//             : "border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
//         }
//       `}
//     >
//       {React.cloneElement(icon, { size: 28, strokeWidth: active ? 2.5 : 2 })}
//     </Link>
//   );
// };

// interface IconButtonProps {
//   icon: React.ReactElement<{ size?: number }>;
// }

// const IconButton = ({ icon }: IconButtonProps) => (
//   <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent transition-colors border border-transparent active:scale-95">
//     {React.cloneElement(icon, { size: 28 })}
//   </div>
// );

// export default Navbar;

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import Image from "next/image";
import Link from "next/link";
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
import { clearCredentials } from "@/lib/store/features/authSlice";
import { ThemeToggle } from "../ThemeToggle";
import SearchBar from "../SearchBar";
import UserDropdown from "../UserDropdown";
import { signOut } from "next-auth/react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

import { NotificationFeed } from "@/components/NotificationFeed";

import { NotificationService } from "@/lib/services/notificationService";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { NotificationItem } from "@/types/notification";

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [initialNotifications, setInitialNotifications] = useState<
    NotificationItem[]
  >([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user) return;

    const fetchInitialNotifications = async () => {
      try {
        const data = await NotificationService.getNotifications();
        setInitialNotifications(data);

        const unread = data.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);
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
        dropdownRef.current.contains(event.target as Node) === false
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

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

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const isMobile = useMediaQuery("(max-width: 640px)");

  const navLinks = [
    { icon: <Home />, href: "/", label: "Home", exact: true },
    { icon: <PlaySquare />, href: "/reels", label: "Reels" },
    { icon: <Store />, href: "/products", label: "Market" },
    { icon: <GraduationCap />, href: "/courses", label: "Academy" },
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
        <div className="max-w-[1440px] mx-auto px-2 md:px-6 flex items-center justify-between h-16">
          <div className="flex items-center cursor-pointer flex-1 gap-2">
            <Link href="/" className="shrink-0 flex items-center gap-1">
              <Image
                src="/logo1.png"
                alt="Innovator"
                width={40}
                height={40}
                className="rounded-full"
              />
              <p className="text-primary text-2xl font-medium">Innovator</p>
            </Link>
          </div>

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

              <Link href="/messages" aria-label="Open chats selection panel">
                <IconButton
                  icon={<MessageCircle />}
                  active={pathname === "/messages"}
                />
              </Link>

              <div className="relative" ref={notifRef}>
                <div
                  onClick={() => setNotifOpen((o) => !o)}
                  className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-secondary text-secondary-foreground rounded-full cursor-pointer hover:bg-accent transition-colors border border-transparent active:scale-95"
                >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center border border-card shadow animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {notifOpen && (
                  <div className="fixed top-[70px] right-32 w-[320px] 2xl:w-[380px] h-[calc(100vh-72px)] z-40 bg-card border-l border-border rounded-3xl shadow-xl overflow-y-auto no-scrollbar">
                    <div className="p-4">
                      <NotificationFeed
                        initialNotifications={initialNotifications}
                        userId={user?.id || user?.uuid || ""}
                        token={user?.accessToken ?? undefined}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div ref={dropdownRef} className="relative shrink-0">
              <div
                onClick={() =>
                  !isDropdownOpen
                    ? setIsDropdownOpen(true)
                    : setIsDropdownOpen(false)
                }
                className="relative w-10 h-10 rounded-full bg-secondary text-secondary-foreground border border-border cursor-pointer active:scale-95 transition-all flex items-center justify-center overflow-hidden shrink-0 p-0"
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
                  onClose={() => setIsDropdownOpen(false)}
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
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
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
                </Link>
              ))}

              <hr className="border-border my-2" />

              {/* Mobile Menu Message Trigger Element */}
              <Link
                href="/messages"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  pathname === "/messages"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageCircle size={20} />
                  <span className="font-medium">Messages</span>
                </div>
              </Link>

              <Link
                href="/notifications"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent text-foreground"
              >
                <div className="flex items-center gap-3">
                  <Bell size={20} />
                  <span className="font-medium">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                    {unreadCount} new
                  </span>
                )}
              </Link>

              <div className="flex items-center justify-between px-2 py-1">
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
  return (
    <Link
      href={href}
      className={`
        flex items-center justify-center w-16 lg:w-24 h-full cursor-pointer border-b-4 transition-all
        ${
          active
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }
      `}
    >
      {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
    </Link>
  );
};

interface IconButtonProps {
  icon: React.ReactElement<{ size?: number }>;
  active?: boolean;
}

const IconButton = ({ icon, active = false }: IconButtonProps) => (
  <div
    className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full cursor-pointer transition-all border border-transparent active:scale-95 ${
      active
        ? "bg-primary text-primary-foreground font-medium shadow-sm"
        : "bg-secondary text-secondary-foreground hover:bg-accent"
    }`}
  >
    {React.cloneElement(icon, { size: 24 })}
  </div>
);

export default Navbar;
