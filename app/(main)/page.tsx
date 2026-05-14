"use client";

import React from "react";
import CreatePostBox from "@/components/Home/CreatePostBox";
import PostFeed from "@/components/Home/PostFeed";

const Page = () => {
  return (
    <div className="pb-10 space-y-4">
      <CreatePostBox />

      <PostFeed />
    </div>
  );
};

export default Page;
