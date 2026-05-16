"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

const ProfilePage = () => {
  const params = useParams();
  const targetId = params?.id as string;
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");

  const isOwnProfile = currentUser?.id?.toString() === targetId;

  useEffect(() => {
    const loadData = async () => {
      if (!targetId || targetId === "undefined") return;
      try {
        setLoading(true);
        const userRes = await fetch(`/api/users/${targetId}`);
        const userData = await userRes.json();
        console.log(userData);
        if (userRes.ok) setProfileData(userData);
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [targetId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b00]"></div>
      </div>
    );
  }

  if (!profileData)
    return (
      <div className="p-20 text-center text-slate-500">User not found.</div>
    );

  const userPosts = profileData.posts || [];
  const userReels = profileData.reels || []; // Assuming reels are in the response
  const avatarUrl = getMediaUrl(
    profileData?.profile?.avatar || profileData?.profile_image,
  );

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-sm">
      {/* 1. Header / Cover Area */}
      <div className="h-32 md:h-44 bg-[#ff6b00] relative" />

      {/* 2. Profile Info Section */}
      <div className="px-6 pb-6 border-b border-slate-100">
        <div className="relative flex justify-between items-start">
          <div className="relative -mt-16">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 overflow-hidden relative shadow-md">
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
                <User size={60} className="m-auto mt-8 text-slate-400" />
              )}
            </div>
            {isOwnProfile && (
              <button className="absolute bottom-2 right-0 bg-[#ff6b00] p-2 rounded-full border-2 border-white text-white shadow-lg">
                <Camera size={18} />
              </button>
            )}
          </div>

          <div className="pt-4">
            {isOwnProfile ? (
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                <MoreHorizontal size={26} />
              </button>
            ) : (
              <div className="flex gap-2">
                <button className="bg-[#ff6b00] text-white px-6 py-2 rounded-full font-bold text-sm shadow-md flex items-center gap-2">
                  <Send size={16} /> Send
                </button>
                <FollowToggle
                  username=""
                  userId={profileData.id}
                  initialIsFollowed={profileData.is_followed}
                  variant="button"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-black text-slate-900">
            {profileData?.full_name || profileData?.username}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {profileData?.email || `@${profileData?.username}`}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex gap-10 mt-6 pt-5 border-t border-slate-50">
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
      <div className="bg-[#f8f9fa] p-4 min-h-screen space-y-6">
        {isOwnProfile && activeTab === "posts" && (
          <div className="space-y-3">
            <h2 className="font-bold text-lg text-slate-800 ml-1">
              Create New Post
            </h2>
            <CreatePostBox />
          </div>
        )}

        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-0 px-1">
          {/* Left Side */}
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex items-center gap-2 pb-2 transition-all ${
              activeTab === "posts"
                ? "border-b-2 border-[#ff6b00] text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <LayoutGrid size={18} />
            <span className="font-black text-sm uppercase tracking-wider">
              Posts
            </span>
          </button>

          {/* Right Side */}
          <button
            onClick={() => setActiveTab("reels")}
            className={`flex items-center gap-2 pb-2 transition-all ${
              activeTab === "reels"
                ? "border-b-2 border-[#ff6b00] text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Film size={18} />
            <span className="font-black text-sm uppercase tracking-wider">
              Reels
            </span>
          </button>
        </div>

        {/* Content Display */}
        <div className="grid grid-cols-1 gap-4">
          {activeTab === "posts" ? (
            userPosts.length > 0 ? (
              userPosts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <EmptyState message="No posts to show yet." />
            )
          ) : (
            // Placeholder for Reels Grid (usually 3 columns)
            <div className="grid grid-cols-3 gap-2">
              {userReels.length > 0 ? (
                userReels.map((reel: any) => (
                  <div
                    key={reel.id}
                    className="aspect-[9/16] bg-slate-200 rounded-lg animate-pulse"
                  />
                ))
              ) : (
                <div className="col-span-3 py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                  <p className="text-slate-400 text-sm font-medium">
                    No reels to show yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components for cleaner code
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
    className={`flex flex-col ${border ? "border-l border-slate-100 pl-10" : ""}`}
  >
    <span className="text-[#ff6b00] font-black text-xl leading-none">
      {count || 0}
    </span>
    <span className="text-slate-400 text-[11px] font-bold uppercase mt-1 tracking-wide">
      {label}
    </span>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
    <p className="text-slate-400 text-sm font-medium">{message}</p>
  </div>
);

export default ProfilePage;
