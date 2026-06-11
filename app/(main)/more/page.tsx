"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/authService";
import { clearCredentials } from "@/lib/store/features/authSlice";
import { signOut } from "next-auth/react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import UserDropdown from "@/components/UserDropdown";

export default function MorePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const getProfileImage = () => {
    const rawAvatarPath = user?.profile?.avatar || user?.profile_image;
    if (!rawAvatarPath || rawAvatarPath === "null") return null;
    return getMediaUrl(rawAvatarPath);
  };

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

  return (
    <div className="min-h-screen bg-background pb-16">
      <h1 className="text-lg font-semibold text-foreground px-2 py-1 mb-1">
        More
      </h1>
      <UserDropdown
        user={user}
        onLogout={handleLogout}
        getProfileImage={getProfileImage}
        onClose={() => router.back()}
        onNavigate={() => router.back()}
        isMobile={true}
      />
    </div>
  );
}
