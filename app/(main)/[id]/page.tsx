"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import {
  User,
  Camera,
  MoreHorizontal,
  Send,
  LayoutGrid,
  Film,
} from "lucide-react";
import { RootState } from "@/lib/store/store";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import CreatePostBox from "@/components/Home/CreatePostBox";
import FollowToggle from "@/components/FollowToggle";
import PostCard from "@/components/posts/PostCard";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ReelCard from "@/components/Reels/ReelCard";

const ProfilePage = () => {
  const params = useParams();
  const targetId = params?.id as string;
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [is404, setIs404] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userReels, setUserReels] = useState<any[]>([]);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [reelsFetched, setReelsFetched] = useState(false);

  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");

  const isOwnProfile = currentUser?.id?.toString() === targetId;

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
        if (userData?.reels) {
          setUserReels(userData.reels);
        }
        console.log(userData);
      } catch (err) {
        console.error("Failed to load profile data:", err);
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

  if (is404) {
    notFound();
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profileData) {
    notFound();
  }

  const userPosts = profileData.posts || [];
  const avatarUrl = getMediaUrl(
    profileData?.profile?.avatar || profileData?.profile_image,
  );

  return (
    <div className="max-w-4xl mx-auto bg-background min-h-screen border-x border-border/60 shadow-sm font-sans antialiased text-foreground">
      {/* 1. Header / Cover Area */}
      <div className="h-36 md:h-44 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
      </div>

      {/* 2. Profile Info Section */}
      <div className="px-6 pb-6 border-b border-border bg-card">
        <div className="relative flex justify-between items-start">
          {/* Avatar Container */}
          <div className="relative -mt-16 md:-mt-20">
            <div className="w-28 h-28 md:w-34 md:h-34 rounded-full border-4 border-card bg-muted overflow-hidden relative shadow-md">
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
              <button className="absolute bottom-1 right-1 bg-orange-500 hover:bg-orange-600 p-2 rounded-full border-2 border-card text-white shadow-md active:scale-95 transition-transform">
                <Camera size={15} />
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4">
            {isOwnProfile ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="border border-border bg-muted hover:bg-accent text-foreground px-5 py-2 rounded-full font-bold text-xs tracking-wide transition-colors shadow-sm"
                >
                  Edit profile
                </button>
                <button className="p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors">
                  <MoreHorizontal size={22} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold text-xs tracking-wide shadow-sm active:scale-95 transition-all flex items-center gap-2">
                  <Send size={14} /> Send
                </button>
                <FollowToggle
                  username=""
                  userId={profileData.id}
                  initialIsFollowed={profileData.is_followed}
                  variant="button"
                />
              </div>
            )}

            {showEditModal && (
              <EditProfileModal
                onClose={() => setShowEditModal(false)}
                onUpdated={handleProfileUpdated}
              />
            )}
          </div>
        </div>

        {/* Identity block */}
        <div className="mt-4">
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            {profileData?.full_name || profileData?.username}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium mt-0.5">
            {profileData?.username
              ? `@${profileData.username}`
              : profileData?.email}
          </p>
        </div>

        {/* Dynamic Stats Row */}
        <div className="flex gap-10 mt-6 pt-5 border-t border-border/40">
          <StatItem count={profileData?.followers_count} label="Followers" />
          <StatItem
            count={profileData?.following_count}
            label="Following"
            border
          />
          <StatItem count={userPosts.length} label="Posts" border />
        </div>
      </div>

      {/* 3. Feed Section */}
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
          <button
            onClick={() => handleTabChange("posts")}
            className={`flex items-center gap-2 pb-3 transition-all relative group ${
              activeTab === "posts"
                ? "text-foreground font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Posts
            </span>
            {activeTab === "posts" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => handleTabChange("reels")}
            className={`flex items-center gap-2 pb-3 transition-all relative group ${
              activeTab === "reels"
                ? "text-foreground font-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Film size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Reels
            </span>
            {activeTab === "reels" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-full" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
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
      </div>
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
