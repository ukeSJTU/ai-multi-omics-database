"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchResultProteinCard } from "@/components/ProteinCard";

interface Protein {
  id: string;
  name: string;
  description: string;
}

interface SearchResultsProps {
  results: Protein[];
  hasSearched: boolean;
}

export function SearchResults({ results, hasSearched }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleProteinClick = (proteinId: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    router.push(`/protein/${proteinId}?${currentParams.toString()}`, {
      scroll: false,
    });
  };

  if (!hasSearched) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {results.map((protein: Protein) => (
        <div key={protein.id} onClick={() => handleProteinClick(protein.id)}>
          <SearchResultProteinCard protein={protein} />
        </div>
      ))}
      {results.length === 0 && (
        <div className="text-center text-gray-500">No results found</div>
      )}
    </div>
  );
}
