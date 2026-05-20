"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getPostById } from "@/lib/services/postService";
import PostCard, { renderedPosts } from "@/components/posts/PostCard";

export default function PostPage() {
  const params = useParams();
  const postId = params?.postId as string;
  const router = useRouter();

  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPostById(postId);
        renderedPosts.add(data.id);
        setPost(data);
      } catch (err: any) {
        console.error("FETCH ERROR:", err);
        setError(err.message || "Failed to load post.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold text-foreground text-base">Post</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-sm">Loading post…</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-destructive text-2xl">!</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">{error}</p>
            <button
              onClick={() => router.back()}
              className="text-sm text-primary hover:underline underline-offset-4"
            >
              Go back
            </button>
          </div>
        )}

        {!isLoading && !error && post && (
          <div className="min-h-[1px]">
            <PostCard post={post} index={0} />
          </div>
        )}

        {!isLoading && !error && !post && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p className="text-muted-foreground text-sm">Post not found.</p>
            <button
              onClick={() => router.back()}
              className="text-sm text-primary hover:underline underline-offset-4"
            >
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
