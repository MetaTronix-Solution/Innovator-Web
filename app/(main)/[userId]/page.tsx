import ImageUploadButton from "@/components/ImageUploadButton";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { User } from "lucide-react";
import { getCookie } from "cookies-next";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const token = getCookie("accessToken");
  const fetchUrl =
    userId === "me"
      ? `http://36.253.137.34:8005/api/users/me/`
      : `http://36.253.137.34:8005/api/users/${userId}/`;

  const res = await fetch(fetchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const userData = await res.json();
  const profileImageUrl = getMediaUrl(userData.profile_image);
  const isOwnProfile = userId === "me";

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card rounded-2xl border border-border shadow-sm mt-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Left Side: Avatar Container */}
        <div className="relative shrink-0">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-background shadow-md bg-secondary flex items-center justify-center">
            {profileImageUrl ? (
              <Image
                src={profileImageUrl}
                alt={userData.full_name || "User profile"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <User size={48} className="text-muted-foreground" />
            )}
          </div>

          {isOwnProfile && <ImageUploadButton />}
        </div>

        {/* Right Side: Information */}
        <div className="flex-1 text-center sm:text-left space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {userData.full_name}
          </h1>

          <div className="flex flex-col sm:items-start items-center">
            <span className="text-muted-foreground text-sm font-medium">
              {userData.email}
            </span>
          </div>

          <div className="pt-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Bio
            </h3>
            <p className="text-foreground/80 leading-relaxed text-sm italic">
              {userData.bio ? `"${userData.bio}"` : "No bio available yet."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
