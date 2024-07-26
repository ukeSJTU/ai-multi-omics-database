"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProteinCard } from "@/components/ProteinCard";

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
    return (
      <div className="text-center text-gray-500 mt-8">
        Start typing to search for proteins
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {results.map((protein: Protein) => (
        <div key={protein.id} onClick={() => handleProteinClick(protein.id)}>
          <ProteinCard protein={protein} />
        </div>
      ))}
      {results.length === 0 && hasSearched && (
        <div className="text-center text-gray-500">No results found</div>
      )}
    </div>
  );
}
