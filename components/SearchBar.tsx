"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import useDebounce from "@/lib/hooks/useDebounce";

const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const isTyping = useRef(false);

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
    } else if (searchParams.get("q")) {
      router.push("/");
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (!isTyping.current) {
      setQuery(searchParams.get("q") || "");
    }
    isTyping.current = false;
  }, [searchParams]);

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex items-center h-9 w-48 sm:w-60 md:w-48 lg:w-64 rounded-full border border-foreground/20 px-2 sm:px-3 bg-transparent"
    >
      <Search size={18} className="shrink-0 text-foreground" />
      <Input
        type="text"
        value={query}
        onChange={(e) => {
          isTyping.current = true;
          setQuery(e.target.value);
        }}
        placeholder="Search"
        className="ml-1 h-full bg-transparent border-none shadow-none text-sm text-foreground placeholder:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 [&:not(:focus)]:bg-transparent"
      />
    </form>
  );
};

export default SearchBar;
