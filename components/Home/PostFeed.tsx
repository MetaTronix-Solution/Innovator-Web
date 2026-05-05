"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Virtuoso } from "react-virtuoso";
import PostCard from "../PostCard";

const PostFeed = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const cursorParam = cursorRef.current
        ? `&cursor=${cursorRef.current}`
        : "";
      const response = await fetch(`/api/feed/?limit=10${cursorParam}`);
      const data = await response.json();
      const newItems = data.results || data;

      if (Array.isArray(newItems) && newItems.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNew = newItems.filter((p) => !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });

        cursorRef.current = newItems[newItems.length - 1].id;
        if (newItems.length < 10) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Feed error:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  // Initial Load Trigger
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Virtuoso
        useWindowScroll
        data={posts}
        endReached={fetchPosts}
        itemContent={(index, post) => (
          <div className="">
            <PostCard post={post} index={index} />
          </div>
        )}
        components={{
          Footer: () => (
            <div className="h-20 flex items-center justify-center">
              {loading && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              )}
            </div>
          ),
        }}
      />
    </div>
  );
};

export default PostFeed;
