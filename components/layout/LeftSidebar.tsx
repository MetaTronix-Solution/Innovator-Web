import React from "react";
import { Users, Bookmark, Video, Store, Calendar, Package } from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  bold?: boolean;
}

const LeftSidebar = () => {
  const router = useRouter();

  return (
    <aside className="h-[calc(100vh-56px)] sticky top-14 p-2">
      <div className="space-y-1 pb-4 border-b border-border">
        <SidebarItem
          icon={<Users size={24} className="text-primary" />}
          label="Followings"
          onClick={() => router.push("/following")}
        />

        {/* <SidebarItem
          icon={<Bookmark size={24} className="text-primary" />}
          label="Saved"
          onClick={() => router.push("/saved")}
        /> */}

        <SidebarItem
          icon={<Video size={24} className="text-primary" />}
          label="Reels"
          onClick={() => router.push("/reels")}
        />

        <SidebarItem
          icon={<Store size={24} className="text-primary" />}
          label="Shop"
          onClick={() => router.push("/products")}
        />

        <SidebarItem
          icon={<Calendar size={24} className="text-primary" />}
          label="Events"
          onClick={() => router.push("/events")}
        />

        <SidebarItem
          icon={<Package size={24} className="text-primary" />}
          label="My Orders"
          onClick={() => router.push("/orders")}
        />
      </div>
    </aside>
  );
};

const SidebarItem = ({
  icon,
  label,
  onClick,
  bold = false,
}: SidebarItemProps) => {
  return (
    <div
      onClick={onClick}
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
    </div>
  );
};

export default LeftSidebar;
