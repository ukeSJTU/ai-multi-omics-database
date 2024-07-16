'use client'

import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';

type Protein = {
  id: string;
  name: string;
  alias: string;
};

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Protein[]>([]);

  const performSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    // Update URL with search term
    router.push(`/?term=${encodeURIComponent(term)}`, { scroll: false });

    // Store search term in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lastSearchTerm', term);
    }

    const response = await fetch(`/api/search?term=${encodeURIComponent(term)}`);
    if (!response.ok) {
      console.error('Search failed');
      return;
    }

    const results: Protein[] = await response.json();

    // Perform fuzzy search on the client side
    const fuse = new Fuse(results, {
      keys: ['alias', 'name', 'id'],
      threshold: 0.4,
    });

    const fuzzyResults = fuse.search(term).map(result => result.item);
    setSearchResults(fuzzyResults);
  }, [router]);

  const debouncedSearch = useCallback(debounce(performSearch, 300), [performSearch]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check URL params for search term
      const urlParams = new URLSearchParams(window.location.search);
      const termFromUrl = urlParams.get('term');
      if (termFromUrl) {
        setSearchTerm(termFromUrl);
        performSearch(termFromUrl);
      } else {
        // Check sessionStorage for search term
        const storedTerm = sessionStorage.getItem('lastSearchTerm');
        if (storedTerm) {
          setSearchTerm(storedTerm);
          performSearch(storedTerm);
        }
      }
    }
  }, [performSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Protein Search</h1>
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Search proteins..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-grow"
        />
        <Button>Download</Button>
      </div>
      <div className="space-y-4">
        {searchResults.map((protein) => (
          <Card key={protein.id}>
            <CardContent className="p-4">
              <Link href={`/protein/${protein.id}`} className="text-blue-500 hover:underline">
                <h2 className="text-lg font-semibold">{protein.alias}</h2>
              </Link>
              <p className="text-sm text-gray-600">{protein.name}</p>
              <p className="text-xs text-gray-400">{protein.id}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}