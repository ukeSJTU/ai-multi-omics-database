"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { debounce } from "lodash";

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
    <div
      className={`relative w-full max-w-md mx-auto transition-all duration-300 ease-in-out ${
        searchTerm ? "mt-4" : "mt-[40vh]"
      }`}
    >
      <div
        className={`relative flex items-center transition-all duration-300 ease-in-out 
                    ${isFocused ? "bg-white shadow-lg" : "bg-gray-100"} 
                    rounded-full overflow-hidden`}
      >
        <Search
          className={`absolute left-3 transition-all duration-300 ease-in-out
                      ${isFocused ? "text-blue-500" : "text-gray-400"}`}
          size={20}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search proteins..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full py-2 pl-10 pr-4 text-gray-700 bg-transparent outline-none
                      transition-all duration-300 ease-in-out
                      ${isFocused ? "pl-12" : "pl-10"}`}
          // disabled={isLoading}
        />
      </div>
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}
