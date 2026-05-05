"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
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
        onClick={() => setIsOpen(true)}
        className={`
          flex items-center h-10 rounded-full transition-all duration-300 ease-in-out cursor-pointer
          ${
            isOpen
              ? "w-60 bg-muted px-3"
              : "w-10 bg-transparent justify-center hover:bg-muted"
          }
        `}
      >
        <Search
          size={18}
          className={`shrink-0 transition-colors ${isOpen ? "text-muted-foreground" : "text-foreground"}`}
        />

        <input
          type="text"
          placeholder="Search"
          className={`
            ml-2 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground
            transition-all duration-300 ease-in-out
            ${isOpen ? "w-full opacity-100" : "w-0 opacity-0 pointer-events-none"}
          `}
          autoFocus={isOpen}
        />
      </div>
    </div>
  );
};

export default SearchBar;
