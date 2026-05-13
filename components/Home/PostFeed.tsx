"use client";

import React, { useCallback, useEffect } from "react";
import { Virtuoso } from "react-virtuoso";
import PostCard from "../posts/PostCard";
import { useDispatch, useSelector } from "react-redux";
import {
  setPosts,
  setPostsLoading,
  setPostsError,
} from "@/lib/store/features/postsSlice";

const PostFeed = () => {
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state: any) => state.auth);

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
      } else {
        dispatch(setPostsError(data.error || "Failed to fetch feed"));
      }
    } catch (err) {
      console.error("Feed error:", err);
      dispatch(setPostsError("Failed to connect to server"));
    }
  }, [loading, hasMore, next_cursor, dispatch, posts.length]);

  useEffect(() => {
    if (posts.length === 0 && isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Virtuoso
        useWindowScroll
        data={posts}
        endReached={fetchPosts}
        increaseViewportBy={{ top: 800, bottom: 800 }}
        itemContent={(index, post) => (
          <div className="pb-4">
            <PostCard post={post} index={index} />
          </div>
        )}
      />
    </div>
  );
};

export default PostFeed;
