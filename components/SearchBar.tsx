// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Search } from "lucide-react";
// import { Input } from "@/components/ui/input";

// const SearchBar = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [query, setQuery] = useState(searchParams.get("q") || "");
//   const [isOpen, setIsOpen] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     setQuery(searchParams.get("q") || "");
//   }, [searchParams]);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 1024) {
//         setIsOpen(true);
//       } else {
//         setIsOpen(false);
//       }
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         window.innerWidth < 1024 &&
//         containerRef.current &&
//         !containerRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (query.trim()) {
//       router.push(`/search?q=${encodeURIComponent(query.trim())}`);
//     }
//   };

//   return (
//     <div ref={containerRef} className="flex items-center h-10">
//       <form
//         onSubmit={handleSubmit}
//         onClick={() => {
//           if (window.innerWidth < 1024) setIsOpen(true);
//         }}
//         className={`
//           flex items-center h-10 rounded-full transition-all duration-300 ease-in-out
//           ${
//             isOpen
//               ? "w-48 sm:w-60 bg-muted px-3"
//               : "w-10 bg-transparent justify-center hover:bg-muted cursor-pointer"
//           }
//           lg:w-64 lg:bg-muted lg:px-3 lg:cursor-default
//         `}
//       >
//         <button
//           type="submit"
//           disabled={!isOpen && window.innerWidth < 1024}
//           className="p-0 bg-transparent border-none outline-none flex items-center justify-center cursor-pointer disabled:cursor-default"
//         >
//           <Search
//             size={18}
//             className={`shrink-0 transition-colors ${
//               isOpen ? "text-muted-foreground" : "text-foreground"
//             } lg:text-muted-foreground`}
//           />
//         </button>

//         <Input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Search name or username"
//           autoFocus={isOpen && window.innerWidth < 1024}
//           className={`
//             ml-1 h-full bg-transparent border-none outline-none text-sm text-foreground
//             placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0
//             transition-all duration-300 ease-in-out w-full
//             ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
//             lg:opacity-100 lg:pointer-events-auto
//           `}
//         />
//       </form>
//     </div>
//   );
// };

// export default SearchBar;

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      } else if (searchParams.get("q")) {
        router.push(`/search`);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [query, router, searchParams]);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        window.innerWidth < 1024 &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="flex items-center h-10">
      <form
        onSubmit={(e) => e.preventDefault()}
        onClick={() => {
          if (window.innerWidth < 1024) setIsOpen(true);
        }}
        className={`
          flex items-center h-10 rounded-full transition-all duration-300 ease-in-out
          ${
            isOpen
              ? "w-48 sm:w-60 bg-transparent border border-muted-foreground/20 px-3" // Changed bg-muted to bg-transparent
              : "w-10 bg-transparent justify-center hover:bg-muted/50 cursor-pointer"
          }
          lg:w-64 lg:bg-transparent lg:border lg:border-muted-foreground/20 lg:px-3 lg:cursor-default
        `}
      >
        <div className="p-0 flex items-center justify-center">
          <Search
            size={18}
            className={`shrink-0 transition-colors text-muted-foreground`}
          />
        </div>

        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or username"
          className={`
            ml-1 h-full bg-transparent border-none outline-none text-sm text-foreground 
            placeholder:text-muted-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0
            transition-all duration-300 ease-in-out w-full
            ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
            lg:opacity-100 lg:pointer-events-auto
          `}
        />
      </form>
    </div>
  );
};

export default SearchBar;
