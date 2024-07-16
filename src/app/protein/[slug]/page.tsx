'use client'

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import ProteinInfoCard from '@/components/ProteinInfoCard';
import LinkedProteinsTable from '@/components/LinkedProteinsTable';

async function getProtein(slug: string, page: number, pageSize: number, sortBy: string, sortOrder: 'asc' | 'desc') {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/protein/${slug}?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return undefined;
  return res.json();
}

export default function ProteinPage({ params }: { params: { slug: string } }) {
  const [protein, setProtein] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('linkedProteinId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const pageSize = 10;

  useEffect(() => {
    const fetchProtein = async () => {
      const data = await getProtein(params.slug, currentPage, pageSize, sortBy, sortOrder);
      if (!data) notFound();
      setProtein(data);
    };
    fetchProtein();
  }, [params.slug, currentPage, sortBy, sortOrder]);

  if (!protein) return <div>Loading...</div>;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return (
    <div className="container mx-auto p-4">
      <ProteinInfoCard protein={protein} />
      <h2 className="text-2xl font-bold mt-8 mb-4">Linked Proteins</h2>
      <LinkedProteinsTable
        links={protein.ProteinLinks}
        currentPage={currentPage}
        totalPages={protein.totalPages}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />
    </div>
  );
}