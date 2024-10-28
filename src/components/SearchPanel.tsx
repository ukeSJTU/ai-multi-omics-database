"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "./SearchResults";

async function searchProteins(term: string) {
  if (!term.trim()) return [];
  console.log("Searching for proteins with term:", term);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/search?term=${term}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  return res.json();
}

export function SearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("term") || "");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (term: string) => {
    setIsLoading(true);
    setHasSearched(true);
    const results = await searchProteins(term);
    setSearchResults(results);
    setIsLoading(false);

    const newSearchParams = new URLSearchParams(searchParams);
    if (term.trim()) {
      newSearchParams.set("term", term);
    } else {
      newSearchParams.delete("term");
    }
    router.replace(`?${newSearchParams.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else {
      setHasSearched(false);
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleSwitchToFaiss = () => {
    router.push("/search");
  };

  return (
    <div
      className={`h-full flex flex-col transition-all duration-700 ease-in-out px-4 ${
        searchTerm ? "pt-8" : ""
      }`}
    >
      <div
        className={`flex-grow transition-all duration-700 ease-in-out ${
          !searchTerm ? "flex items-center justify-center" : ""
        }`}
      >
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>
      <div
        className={`mt-6 flex-grow overflow-auto transition-opacity duration-500 ${
          searchTerm ? "opacity-100" : "opacity-0"
        }`}
      >
        {searchTerm && (
          <SearchResults results={searchResults} hasSearched={hasSearched} />
        )}
      </div>
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleSwitchToFaiss}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          切换到 FAISS 搜索
        </button>
      </div>
    </div>
  );
}
