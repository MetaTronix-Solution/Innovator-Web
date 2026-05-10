"use client";

import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";

export default function ImageUploadButton() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = getCookie("accessToken");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsUploading(true);

      const response = await fetch(
        "http://36.253.137.34:8005/api/users/me/avatar/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (response.ok) {
        router.refresh();
        console.log("Avatar updated successfully");
      } else {
        const errorData = await response.json();
        console.error("Upload failed:", errorData);
      }
    } catch (error) {
      console.error("Error connecting to the server:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full border-2 border-background hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-70 z-10"
        aria-label="Upload profile picture"
      >
        {isUploading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Camera size={16} />
        )}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </>
  );
}
