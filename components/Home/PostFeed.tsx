"use client";

import React, { useCallback, useEffect } from "react";
import { Virtuoso } from "react-virtuoso";
import PostCard from "../PostCard";
import { useDispatch, useSelector } from "react-redux";
import {
  setPosts,
  setPostsLoading,
  setPostsError,
} from "@/lib/store/features/postsSlice";

const PostFeed = () => {
  const dispatch = useDispatch();

  const {
    items: posts,
    loading,
    has_next: hasMore,
    next_cursor,
  } = useSelector((state: any) => state.posts);

  const fetchPosts = useCallback(async () => {
    if (loading || (!hasMore && posts.length > 0)) return;

    dispatch(setPostsLoading(true));

    try {
      const cursorParam = next_cursor ? `&cursor=${next_cursor}` : "";
      const response = await fetch(`/api/feed/?limit=10${cursorParam}`);
      const data = await response.json();

      if (response.ok) {
        dispatch(
          setPosts({
            results: data.results,
            next_cursor: data.next_cursor,
            has_next: data.has_next,
          }),
        );
        console.log(data);
      } else {
        dispatch(setPostsError(data.error || "Failed to fetch feed"));
      }
    } catch (err) {
      console.error("Feed error:", err);
      dispatch(setPostsError("Failed to connect to server"));
    }
  }, [loading, hasMore, next_cursor, dispatch, posts.length]);

  // Initial Load
  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts();
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Virtuoso
        useWindowScroll
        data={posts}
        endReached={fetchPosts}
        itemContent={(index, post) => (
          <div className="pb-4">
            <PostCard post={post} index={index} />
          </div>
        )}
        components={{
          Footer: () => (
            <div className="h-24 flex items-center justify-center">
              {loading && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              )}
              {!hasMore && posts.length > 0 && (
                <p className="text-muted-foreground text-sm">
                  You've reached the end!
                </p>
              )}
            </div>
          ),
        }}
      />
    </div>
  );
};

export default PostFeed;
