"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "./SearchResults";

async function searchProteins(term: string) {
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

  const handleSearch = async (term: string) => {
    setIsLoading(true);
    const results = await searchProteins(term);
    setSearchResults(results);
    setIsLoading(false);

    // Update URL with the search term without refreshing the page
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("term", term);
    router.replace(`?${newSearchParams.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        isLoading={isLoading}
      />
      <div className="mt-4 flex-grow overflow-auto">
        <SearchResults results={searchResults} />
      </div>
    </div>
  );
}
