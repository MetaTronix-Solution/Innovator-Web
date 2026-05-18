// "use client";

// import React, { useEffect, useState, Suspense } from "react";
// import { useSearchParams } from "next/navigation";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Card, CardContent } from "@/components/ui/card";
// import { Loader2, SearchX } from "lucide-react";

// // 1. Updated interface to accurately map your Django backend JSON keys
// interface User {
//   id: string;
//   full_name: string; // Matches Django field
//   username: string;
//   avatar_url?: string; // Matches snake_case standards
//   bio?: string;
// }

// function SearchResults() {
//   const searchParams = useSearchParams();
//   const query = searchParams.get("q") || "";

//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!query) {
//       setUsers([]);
//       return;
//     }

//     const fetchSearchResults = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch(
//           `/api/users/search?q=${encodeURIComponent(query)}`,
//         );
//         if (response.ok) {
//           const data = await response.json();
//           setUsers(data);
//         }
//       } catch (error) {
//         console.error("Failed fetching users:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSearchResults();
//   }, [query]);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//         <p className="text-sm text-muted-foreground">
//           Searching for "{query}"...
//         </p>
//       </div>
//     );
//   }

//   if (!query) {
//     return (
//       <div className="text-center py-12 text-muted-foreground">
//         Search for innovators by their full name.
//       </div>
//     );
//   }

//   if (users.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
//         <SearchX className="h-10 w-10 text-muted-foreground" />
//         <h3 className="font-medium text-lg">No results found</h3>
//         <p className="text-sm text-muted-foreground max-w-xs">
//           We couldn't find any accounts matching "{query}". Check the spelling
//           and try again.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 max-w-2xl mx-auto px-4">
//       <div className="text-sm text-muted-foreground mb-2">
//         Showing results for{" "}
//         <span className="font-medium text-foreground">"{query}"</span>
//       </div>

//       <div className="grid gap-3">
//         {users.map((user) => (
//           <Card
//             key={user.id}
//             className="overflow-hidden hover:bg-accent/40 transition-colors duration-200 cursor-pointer"
//           >
//             <CardContent className="p-4 flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <Avatar className="h-12 w-12 border">
//                   <AvatarImage src={user.avatar_url} alt={user.full_name} />
//                   <AvatarFallback className="bg-primary/10 text-primary font-medium">
//                     {/* Fallback initials from full_name */}
//                     {user.full_name
//                       ? user.full_name.substring(0, 2).toUpperCase()
//                       : "US"}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div>
//                   {/* 3. Render user.full_name instead of user.name */}
//                   <h4 className="font-semibold text-sm leading-tight text-foreground">
//                     {user.full_name}
//                   </h4>
//                   <p className="text-xs text-muted-foreground">
//                     @{user.username}
//                   </p>
//                   {user.bio && (
//                     <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
//                       {user.bio}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function SearchPage() {
//   return (
//     <div className="container py-8">
//       <Suspense
//         fallback={
//           <div className="flex items-center justify-center min-h-[300px]">
//             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//           </div>
//         }
//       >
//         <SearchResults />
//       </Suspense>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, SearchX, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

interface User {
  id: string;
  full_name: string;
  username: string;
  profile_image?: string | null;
  profile?: {
    avatar?: string | null;
  } | null;
  bio?: string;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setUsers([]);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(query)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Failed fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Searching for "{query}"...
        </p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Search for innovators by their full name.
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <SearchX className="h-10 w-10 text-muted-foreground" />
        <h3 className="font-medium text-lg">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          We couldn't find any accounts matching "{query}". Check the spelling
          and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto px-4">
      <div className="text-sm text-muted-foreground mb-2">
        Showing results for{" "}
        <span className="font-medium text-foreground">"{query}"</span>
      </div>

      <div className="grid gap-3">
        {users.map((user) => {
          const rawAvatarPath = user?.profile?.avatar || user?.profile_image;
          const resolvedAvatarUrl = rawAvatarPath
            ? getMediaUrl(rawAvatarPath)
            : null;

          return (
            <Card
              key={user.id}
              className="overflow-hidden hover:bg-accent/40 transition-colors duration-200"
            >
              <CardContent className="flex items-center justify-between">
                <Link
                  href={`/${user.id}`}
                  className="flex items-center space-x-4 flex-1 group"
                >
                  <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:opacity-80 transition-opacity">
                    <AvatarImage
                      src={resolvedAvatarUrl || undefined}
                      alt={user.full_name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-muted flex items-center justify-center">
                      {user.full_name ? (
                        <span className="text-primary font-semibold text-sm">
                          {user.full_name.substring(0, 2).toUpperCase()}
                        </span>
                      ) : (
                        <UserIcon
                          size={24}
                          className="text-muted-foreground/60"
                        />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h4 className="font-semibold text-sm leading-tight text-foreground group-hover:underline decoration-primary">
                      {user.full_name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </Link>

                <Link href={`/${user.id}`}>
                  <button className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full font-medium transition-colors shrink-0">
                    View Profile
                  </button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </div>
  );
}
