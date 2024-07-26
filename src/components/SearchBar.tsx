"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { debounce } from "lodash";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: (term: string) => void;
  isLoading: boolean;
}

export function SearchBar({
  searchTerm,
  setSearchTerm,
  onSearch,
  isLoading,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      onSearch(term);
    }, 300),
    [onSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ease-in-out
                      ${isFocused ? "text-primary" : "text-gray-400"}`}
          size={20}
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search proteins..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`pl-10 pr-4 py-2 w-full transition-all duration-300 ease-in-out
                      ${isFocused ? "ring-2 ring-primary" : ""}`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
}
