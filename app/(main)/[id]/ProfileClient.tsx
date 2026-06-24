"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { User, Camera, LayoutGrid, Film, MoreVertical } from "lucide-react";
import { RootState } from "@/lib/store/store";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import CreatePostBox from "@/components/Home/CreatePostBox";
import FollowToggle from "@/components/FollowToggle";
import PostCard from "@/components/posts/PostCard";
import ReelCard from "@/components/Reels/ReelCard";
import { useRouter } from "next/navigation";
import { updateAvatar } from "@/lib/services/profileService";
import { toast } from "sonner";
import ReportModal from "@/components/ReportModal";
import { ConfirmationModal } from "@/components/ConfirmationModal";

const ProfilePage = () => {
  const params = useParams();
  const targetId = params?.id as string;

  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [is404, setIs404] = useState(false);
  const [userReels, setUserReels] = useState<any[]>([]);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [reelsFetched, setReelsFetched] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = currentUser?.id?.toString() === targetId;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!targetId || targetId === "undefined") return;
      try {
        setLoading(true);
        const userRes = await fetch(`/api/users/${targetId}`);
        if (userRes.status === 404 || !userRes.ok) {
          setIs404(true);
          return;
        }
        const userData = await userRes.json();
        setProfileData(userData);
        if (userData?.reels) setUserReels(userData.reels);
      } catch (err) {
        setIs404(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [targetId]);

  const fetchReels = useCallback(async () => {
    if (reelsFetched || !targetId) return;
    setReelsLoading(true);
    try {
      const res = await fetch(`/api/reels?user=${targetId}`);
      const data = await res.json();
      if (res.ok) {
        setUserReels(Array.isArray(data) ? data : (data.results ?? []));
        setReelsFetched(true);
      }
    } catch (err) {
      console.error("Failed to fetch reels:", err);
    } finally {
      setReelsLoading(false);
    }
  }, [targetId, reelsFetched]);

  const handleTabChange = (tab: "posts" | "reels") => {
    setActiveTab(tab);
    if (tab === "reels") fetchReels();
  };

  const handleProfileUpdated = (updated: any) => {
    setProfileData((prev: any) => ({
      ...prev,
      full_name: updated.full_name ?? prev.full_name,
      profile: {
        ...prev.profile,
        ...updated,
      },
    }));
  };

  const handleCameraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const updated = await updateAvatar(file);
      handleProfileUpdated(updated);
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleBlock = async () => {
    setBlocking(true);
    try {
      const res = await fetch(`/api/users/${targetId}/block/`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to block user");

      toast.success("User blocked");
      setIsBlockModalOpen(false);
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to block user");
    } finally {
      setBlocking(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied!");
    setMenuOpen(false);
  };

  if (is404) {
    notFound();
    return null;
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const userPosts = profileData.posts || [];
  const avatarUrl = getMediaUrl(
    profileData?.profile?.avatar || profileData?.profile_image,
  );
  const bio = profileData?.profile?.bio || profileData?.bio;
  const occupation =
    profileData?.profile?.occupation || profileData?.occupation;

  return (
    <div className="max-w-4xl mx-auto bg-background min-h-screen border-x border-border/60 shadow-sm font-sans antialiased text-foreground">
      <div className="h-36 md:h-44 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
      </div>

      <div className="px-6 pb-6 border-b border-border bg-card flex flex-col items-center text-center">
        <div className="relative -mt-16 md:-mt-20">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-card bg-muted overflow-hidden relative shadow-md">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="profile"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <User
                size={54}
                className="m-auto mt-6 md:mt-8 text-muted-foreground/60"
              />
            )}
          </div>
          {isOwnProfile && (
            <>
              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-1 right-1 bg-orange-500 hover:bg-orange-600 p-2 rounded-full border-2 border-card text-white shadow-md transition-transform disabled:opacity-60"
              >
                {avatarUploading ? (
                  <div className="h-[15px] w-[15px] animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Camera size={15} />
                )}
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCameraChange}
              />
            </>
          )}
        </div>
        <div className="mt-4">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            {profileData?.full_name || profileData?.username}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium mt-0.5">
            {profileData?.username
              ? `@${profileData.username}`
              : profileData?.email}
          </p>
          {occupation && (
            <p className="text-xs text-muted-foreground mt-1">{occupation}</p>
          )}
          {bio && (
            <p className="text-sm text-foreground/80 mt-2 leading-relaxed max-w-lg">
              {bio}
            </p>
          )}
        </div>
        <div className="pt-6 flex items-center gap-3">
          {!isOwnProfile && (
            <>
              <button
                onClick={() => router.push(`/messages/${targetId}`)}
                className="rounded-xl px-6 py-1.5 bg-primary text-primary-foreground hover:scale-105"
              >
                Message
              </button>
              <FollowToggle
                username=""
                userId={profileData.id}
                initialIsFollowed={profileData.is_followed}
                variant="button"
              />
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-5 border-t border-border/40 w-full w-full">
          <div className="flex-1 flex justify-center border-r border-border/60">
            <StatItem count={profileData?.followers_count} label="Followers" />
          </div>

          <div className="flex-1 flex justify-center border-r border-border/60">
            <StatItem count={profileData?.following_count} label="Following" />
          </div>

          <div className="flex-1 flex justify-center border-r border-border/60">
            <StatItem count={userPosts.length} label="Posts" />
          </div>

          <div className="flex-1 flex justify-center relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-primary hover:bg-accent rounded-full transition-colors"
            >
              <MoreVertical size={24} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-border bg-popover shadow-lg py-1 z-20">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => {
                        handleCopyLink();
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-muted"
                    >
                      Copy link
                    </button>
                    <button
                      onClick={() => router.push("/settings/edit-profile")}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-muted"
                    >
                      Edit profile
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-muted"
                    >
                      Copy link
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setIsReportModalOpen(true);
                      }}
                      className="w-full px-4 py-2 text-sm text-left text-destructive hover:bg-muted"
                    >
                      Report
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setIsBlockModalOpen(true);
                      }}
                      className="w-full px-4 py-2 text-sm text-left text-destructive hover:bg-muted"
                    >
                      Block
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {!isOwnProfile && (
            <ReportModal
              userId={targetId}
              isOpen={isReportModalOpen}
              onClose={() => setIsReportModalOpen(false)}
            />
          )}
        </div>
      </div>

      <div className="bg-background p-4 min-h-screen space-y-6">
        {isOwnProfile && activeTab === "posts" && (
          <div className="space-y-2.5">
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground/80 ml-1">
              Create New Post
            </h2>
            <CreatePostBox />
          </div>
        )}

        <div className="flex items-center justify-between mb-4 border-b border-border p-2">
          {(["posts", "reels"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex items-center gap-2 pb-3 transition-all relative ${activeTab === tab ? "text-foreground font-black" : "text-muted-foreground"}`}
            >
              {tab === "posts" ? <LayoutGrid size={16} /> : <Film size={16} />}
              <span className="text-xs font-bold uppercase tracking-wider">
                {tab}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 mb-10 gap-2 md:gap-4">
          {activeTab === "posts" ? (
            userPosts.length > 0 ? (
              userPosts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <EmptyState message="No posts to show yet." />
            )
          ) : reelsLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          ) : userReels.length > 0 ? (
            <div className="flex flex-col gap-6 items-center w-full">
              {userReels.map((reel: any) => (
                <div
                  key={reel.id}
                  className="w-full max-w-[400px] h-[620px] rounded-2xl overflow-hidden border border-border shadow-md bg-black"
                >
                  <ReelCard reel={reel} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No reels to show yet." />
          )}
        </div>
        <div className="mb-10"></div>
      </div>
      <ConfirmationModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={handleBlock}
        title="Block User"
        message={
          <>
            Are you sure you want to block{" "}
            <span className="text-primary font-semibold">
              {profileData?.full_name || profileData?.username}
            </span>
            ? You will no longer see their posts or reels.
          </>
        }
        confirmText="Block"
        loading={blocking}
      />
    </div>
  );
};

const StatItem = ({
  count,
  label,
  border,
}: {
  count: number;
  label: string;
  border?: boolean;
}) => (
  <div
    className={`flex flex-col ${border ? "border-l border-border/60 pl-10" : ""}`}
  >
    <span className="text-primary font-black text-lg md:text-xl leading-none">
      {count || 0}
    </span>
    <span className="text-muted-foreground text-[10px] font-bold uppercase mt-1.5 tracking-wider">
      {label}
    </span>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="py-20 text-center border-2 border-dashed border-border rounded-xl bg-card/50">
    <p className="text-muted-foreground text-xs font-medium tracking-wide">
      {message}
    </p>
  </div>
);

export default ProfilePage;
