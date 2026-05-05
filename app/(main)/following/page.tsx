"use client";

import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import FollowingList from "@/components/FollowingList";
import FollowerList from "@/components/FollowerList";

const NetworkPage = () => {
  const [tab, setTab] = useState<"following" | "followers">("following");
  const [counts, setCounts] = useState({ following: 0, followers: 0 });

  // Fetch counts to display in the header regardless of which tab is active
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [followingRes, followersRes] = await Promise.all([
          fetch("/api/following"),
          fetch("/api/followers"),
        ]);
        const followingData = await followingRes.json();
        const followersData = await followersRes.json();

        setCounts({
          following: followingData?.following_count || 0,
          followers: followersData?.followers_count || 0,
        });
      } catch (err) {
        console.error("Error fetching network counts:", err);
      }
    };
    fetchCounts();
  }, []);

  return (
    <main className="flex-1 max-w-2xl mx-auto p-4">
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Innovator Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users size={24} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Your Network</h2>
          </div>

          <div className="flex gap-6 border-b border-border">
            <TabButton
              active={tab === "following"}
              label={`Following (${counts.following})`}
              onClick={() => setTab("following")}
            />
            <TabButton
              active={tab === "followers"}
              label={`Followers (${counts.followers})`}
              onClick={() => setTab("followers")}
            />
          </div>

          {/* Dynamic Description for both components */}
          <p className="text-xs text-muted-foreground mt-4 font-medium italic">
            {tab === "following"
              ? `Exploring ideas with ${counts.following} visionaries`
              : `Connected with ${counts.followers} innovators following your journey`}
          </p>
        </div>

        {/* Conditional List Rendering */}
        <div className="min-h-[300px]">
          {tab === "following" ? <FollowingList /> : <FollowerList />}
        </div>
      </div>
    </main>
  );
};

const TabButton = ({ active, label, onClick }: any) => (
  <button
    onClick={onClick}
    className={`pb-3 px-1 text-sm font-bold transition-all border-b-2 ${
      active
        ? "border-primary text-primary"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`}
  >
    {label}
  </button>
);

export default NetworkPage;
