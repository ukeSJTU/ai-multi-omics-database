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
}

export function SearchResults({ results }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleProteinClick = (proteinId: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    router.push(`/protein/${proteinId}?${currentParams.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((protein: Protein) => (
        <div key={protein.id} onClick={() => handleProteinClick(protein.id)}>
          <ProteinCard protein={protein} />
        </div>
      ))}
      {results.length === 0 && (
        <div className="col-span-full text-center text-gray-500">
          No results found
        </div>
      )}
    </div>
  );
}
