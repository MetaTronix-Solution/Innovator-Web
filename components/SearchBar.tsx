// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import { Search } from "lucide-react";

// const SearchBar = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div ref={containerRef} className="flex items-center h-10">
//       <div
//         onClick={() => setIsOpen(true)}
//         className={`
//           flex items-center h-10 rounded-full transition-all duration-300 ease-in-out cursor-pointer
//           ${
//             isOpen
//               ? "w-60 bg-muted px-3"
//               : "w-10 bg-transparent justify-center hover:bg-muted"
//           }
//         `}
//       >
//         <Search
//           size={18}
//           className={`shrink-0 transition-colors ${isOpen ? "text-muted-foreground" : "text-foreground"}`}
//         />

//         <input
//           type="text"
//           placeholder="Search"
//           className={`
//             ml-2 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground
//             transition-all duration-300 ease-in-out
//             ${isOpen ? "w-full opacity-100" : "w-0 opacity-0 pointer-events-none"}
//           `}
//           autoFocus={isOpen}
//         />
//       </div>
//     </div>
//   );
// };

// export default SearchBar;

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize state with screen size
  useEffect(() => {
    const handleResize = () => {
      // If screen is lg (1024px) or larger, keep it open
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close on click outside if we are on a mobile/tablet device (< 1024px)
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
      <div
        onClick={() => {
          if (window.innerWidth < 1024) setIsOpen(true);
        }}
        className={`
          flex items-center h-10 rounded-full transition-all duration-300 ease-in-out
          ${
            isOpen
              ? "w-48 sm:w-60 bg-muted px-3"
              : "w-10 bg-transparent justify-center hover:bg-muted cursor-pointer"
          }
          lg:w-64 lg:bg-muted lg:px-3 lg:cursor-default
        `}
      >
        <Search
          size={18}
          className={`shrink-0 transition-colors ${
            isOpen ? "text-muted-foreground" : "text-foreground"
          } lg:text-muted-foreground`}
        />

        <input
          type="text"
          placeholder="Search"
          className={`
            ml-2 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground
            transition-all duration-300 ease-in-out
            ${
              isOpen
                ? "w-full opacity-100"
                : "w-0 opacity-0 pointer-events-none"
            }
            lg:w-full lg:opacity-100 lg:pointer-events-auto
          `}
          autoFocus={isOpen && window.innerWidth < 1024}
        />
      </div>
    </div>
  );
};

export default SearchBar;
