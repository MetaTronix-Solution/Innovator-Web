// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { Loader2 } from "lucide-react";
// import FollowButton from "@/components/FollowButton";
// import { useSelector } from "react-redux";
// import { getMediaUrl } from "@/lib/utils/getMediaUrl";

// const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// const FollowerList = () => {
//   const [followers, setFollowers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { user: currentUser } = useSelector((state: any) => state.auth);

//   useEffect(() => {
//     const fetchFollowers = async () => {
//       try {
//         const res = await fetch("/api/followers");
//         const data = await res.json();
//         setFollowers(data.followers || data || []);
//       } catch (err) {
//         console.error("Error fetching followers:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchFollowers();
//   }, []);

//   // const getImageUrl = (path?: string) => {
//   //   if (!path || path === "null") return "/google.png";
//   //   const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
//   //   if (url.startsWith("http://")) {
//   //     return `/api/media?url=${encodeURIComponent(url)}`;
//   //   }
//   //   return url;
//   // };

//   if (loading)
//     return <Loader2 className="animate-spin mx-auto mt-10 text-primary" />;

//   if (followers.length === 0)
//     return (
//       <div className="p-10 text-center text-muted-foreground text-sm">
//         No followers yet.
//       </div>
//     );

//   return (
//     <div className="divide-y divide-border">
//       {followers.map((user: any) => {
//         const isFollowed =
//           currentUser?.following_usernames?.includes(user.username) ?? false;

//         return (
//           <div
//             key={user.id}
//             className="flex items-center justify-between p-4 hover:bg-accent/50 transition-all group"
//           >
//             <div className="flex items-center gap-4">
//               <div className="relative w-14 h-14 rounded-full p-0.5 border-2 border-primary/20 group-hover:border-primary transition-colors">
//                 <div className="relative w-full h-full rounded-full overflow-hidden">
//                   <Image
//                     src={getMediaUrl(user.profile?.avatar)}
//                     alt={user.full_name || "User"}
//                     fill
//                     className="object-cover"
//                     unoptimized
//                   />
//                 </div>
//               </div>
//               <div className="flex flex-col">
//                 <span className="font-bold text-foreground text-sm">
//                   {user.full_name || user.username}
//                 </span>
//                 <span className="text-xs text-primary/80 font-medium uppercase tracking-wider">
//                   {user.profile?.occupation || "Innovator"}
//                 </span>
//               </div>
//             </div>

//             <FollowButton userId={user.id} username={user.username} />
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default FollowerList;

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, User } from "lucide-react"; // Added User import
import FollowButton from "@/components/FollowButton";
import { useSelector } from "react-redux";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { RootState } from "@/lib/store/store";

const FollowerList = () => {
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await fetch("/api/followers");
        const data = await res.json();
        setFollowers(data.followers || data || []);
      } catch (err) {
        console.error("Error fetching followers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowers();
  }, []);

  if (loading)
    return <Loader2 className="animate-spin mx-auto mt-10 text-primary" />;

  if (followers.length === 0)
    return (
      <div className="p-10 text-center text-muted-foreground text-sm">
        No followers yet.
      </div>
    );

  return (
    <div className="divide-y divide-border">
      {followers.map((user: any) => {
        // Get the avatar URL or null via helper
        const avatarSrc = getMediaUrl(user.profile?.avatar);

        return (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 hover:bg-accent/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              {/* Profile Image Container - styled to match PostBox */}
              <div className="relative w-14 h-14 rounded-full border-2 border-primary/20 flex items-center justify-center bg-muted overflow-hidden shrink-0 transition-colors group-hover:border-primary">
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={user.full_name || user.username}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <User size={28} className="text-muted-foreground/60" />
                )}
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-foreground text-sm">
                  {user.full_name || user.username}
                </span>
                <span className="text-xs text-primary/80 font-medium uppercase tracking-wider">
                  {user.profile?.occupation || "Innovator"}
                </span>
              </div>
            </div>

            <FollowButton userId={user.id} username={user.username} />
          </div>
        );
      })}
    </div>
  );
};

export default FollowerList;
