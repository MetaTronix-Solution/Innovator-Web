"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";

import { repostPost } from "@/lib/services/postService";
import { getComments, postComment } from "@/lib/services/commentService";
import { togglePostReaction } from "@/lib/store/features/postsSlice";

const usePostActions = (post: any) => {
  const dispatch = useDispatch();

  // Like
  const liked = post.current_user_reaction === "like";

  // Comments
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Repost
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [repostCaption, setRepostCaption] = useState("");
  const [isReposting, setIsReposting] = useState(false);

  // Share
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  // --- Like ---

  const handleLike = async () => {
    const isUnliking = liked;
    const newReaction = isUnliking ? null : "like";

    dispatch(
      togglePostReaction({ postId: post.id, reactionType: newReaction }),
    );

    try {
      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, type: "like" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to sync reaction");
      }
    } catch (error) {
      // Roll back optimistic update
      dispatch(
        togglePostReaction({
          postId: post.id,
          reactionType: isUnliking ? "like" : null,
        }),
      );
      console.error("Reaction error:", error);
    }
  };

  // --- Comments ---

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const data = await getComments(post.id, post.type || "post");
      setComments(data);
    } catch {
      toast.error("Failed to load comments.");
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const created = await postComment(
        post.id,
        newComment,
        post.type || "post",
      );
      setComments((prev) => [created, ...prev]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentToggle = () => setShowComments((prev) => !prev);

  // --- Repost ---

  const handleRepostSubmit = async () => {
    if (!repostCaption.trim()) return;
    setIsReposting(true);
    try {
      await repostPost(post.id, repostCaption, {
        content: post.caption || post.content,
        mediaFile: post.video,
        username: post.username,
      });
      toast.success("Successfully reposted!");
      setIsRepostModalOpen(false);
      setRepostCaption("");
      window.location.reload();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsReposting(false);
    }
  };

  // --- Share ---

  const handleShare = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
      navigator
        .share({
          title: `Post by ${post.username}`,
          text: post.caption || post.content,
          url: `${window.location.origin}/post/${post.id}`,
        })
        .catch(console.error);
    } else {
      setIsShareModalOpen(true);
    }
  };

  return {
    // Like
    liked,
    handleLike,

    // Comments
    showComments,
    comments,
    newComment,
    isLoadingComments,
    isSubmittingComment,
    setNewComment,
    handleCommentToggle,
    handleCommentSubmit,

    // Repost
    isRepostModalOpen,
    repostCaption,
    isReposting,
    setRepostCaption,
    openRepostModal: () => setIsRepostModalOpen(true),
    closeRepostModal: () => setIsRepostModalOpen(false),
    handleRepostSubmit,

    // Share
    isShareModalOpen,
    handleShare,
    closeShareModal: () => setIsShareModalOpen(false),
  };
};

export default usePostActions;
