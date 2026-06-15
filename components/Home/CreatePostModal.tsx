"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Image as ImageIcon,
  Loader2,
  User,
  Check,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { addPostToTop } from "@/lib/store/features/postsSlice";
import { Button } from "../ui/button";
import CaptionText from "@/components/CaptionText"; // ← add

interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  user,
  profileImage,
  initialFile,
}: any) {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // ← add

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(Array.isArray(data) ? data : data.results || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !initialFile) return;
    const url = URL.createObjectURL(initialFile);
    setMediaFiles([initialFile]);
    setPreviews([url]);
  }, [isOpen, initialFile]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const hasHashtags = /#\w+/.test(content);

  if (!isOpen) return null;

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (mediaFiles.length + files.length > 5) {
      return toast.error("You can only upload up to 5 files.");
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setMediaFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeMedia = (index: number) => {
    const updatedFiles = [...mediaFiles];
    const updatedPreviews = [...previews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setMediaFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const isVideoFile = (file: File) => file.type.startsWith("video/");

  const handlePostSubmit = async () => {
    if (!selectedCategoryId) {
      return toast.error("Please select a category before posting.");
    }
    if (!content.trim() && mediaFiles.length === 0) {
      return toast.error("Please add some content or media.");
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    formData.append("category_ids", selectedCategoryId);
    mediaFiles.forEach((file) => formData.append("uploaded_media", file));

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        toast.success("Post shared successfully!");
        dispatch(addPostToTop(result.post || result));
        setContent("");
        setMediaFiles([]);
        setPreviews([]);
        setSelectedCategoryId(null);
        setShowPreview(false);
        onClose();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (err) {
      toast.error("Failed to connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="w-8" />
          <h2 className="text-xl font-bold">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[500px] overflow-y-auto p-6 space-y-4 no-scrollbar">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="User"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <User size={24} className="text-muted-foreground/60" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm">
                {user?.full_name || user?.username}
              </p>
            </div>
          </div>

          {/* Textarea or Preview toggle */}
          {showPreview ? (
            <div
              className="w-full min-h-[100px] text-lg leading-relaxed whitespace-pre-wrap cursor-text text-foreground/90"
              onClick={() => setShowPreview(false)}
            >
              <CaptionText caption={content} />
            </div>
          ) : (
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={() => {
                if (hasHashtags) setShowPreview(true);
              }}
              placeholder={`What's on your mind, ${user?.full_name?.split(" ")[0] || "Innovator"}?`}
              className="w-full min-h-[100px] bg-transparent border-none text-lg resize-none focus:outline-none placeholder:text-muted-foreground/50"
            />
          )}

          {/* Hashtag hint */}
          {hasHashtags && !showPreview && (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="text-xs text-primary font-medium hover:underline"
            >
              Preview hashtags
            </button>
          )}

          {/* Category selector */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Select Category <span className="text-destructive">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 border ${
                    selectedCategoryId === cat.id
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {selectedCategoryId === cat.id && (
                    <Check className="w-3 h-3" />
                  )}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Media previews — Image instead of img */}
          {previews.length > 0 && (
            <div
              className={`grid gap-2 ${previews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
            >
              {previews.map((url, index) => {
                const isVideo = isVideoFile(mediaFiles[index]);
                return (
                  <div
                    key={url}
                    className="relative group rounded-xl overflow-hidden border aspect-video bg-muted"
                  >
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 z-10 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {isVideo ? (
                      <div className="relative w-full h-full">
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="bg-white/90 rounded-full p-2">
                            <Play className="w-6 h-6 text-black" fill="black" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // ← Image instead of img
                      <div className="relative w-full h-full">
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-xl bg-muted/20">
            <span className="text-sm font-semibold px-2">Add to your post</span>
            <div className="flex gap-1">
              <input
                type="file"
                multiple
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-accent rounded-full text-emerald-500 transition-all hover:scale-110"
              >
                <ImageIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          <Button
            onClick={handlePostSubmit}
            disabled={isLoading || (!content.trim() && mediaFiles.length === 0)}
            className="w-full p-6 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
