"use client";

import { useState, useEffect } from "react";
import ProteinInfoCard from "@/components/ProteinInfoCard";
import LinkedProteinsTable from "@/components/LinkedProteinsTable";
import dynamic from "next/dynamic";

const ProteinRelationshipGraph = dynamic(
  () => import("./ProteinRelationGraph"),
  {
    ssr: false,
  }
);

const ProteinViewer = dynamic(() => import("./ProteinViewer"), {
  ssr: false,
});

async function getProtein(
  id: string,
  page: number,
  pageSize: number,
  sortBy: string,
  sortOrder: "asc" | "desc"
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/protein/${id}?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
    { cache: "no-store" }
  );
  if (!res.ok) return undefined;
  return res.json();
}

export function ProteinDetailPanel({ proteinId }: { proteinId: string }) {
  const [protein, setProtein] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("linkedProteinId");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const pageSize = 10;

  useEffect(() => {
    const fetchProtein = async () => {
      const data = await getProtein(
        proteinId,
        currentPage,
        pageSize,
        sortBy,
        sortOrder
      );
      if (data) setProtein(data);
    };
    fetchProtein();
  }, [proteinId, currentPage, sortBy, sortOrder]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSortChange = (
    newSortBy: string,
    newSortOrder: "asc" | "desc"
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  if (!protein) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="space-y-8">
        <ProteinInfoCard protein={protein} />
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">
            {/* Protein Relationship Graph */}
            基因/蛋白关联图
          </h2>
          <div className="h-[800px]">
            <ProteinRelationshipGraph centerId={proteinId} topK={5} />
          </div>
        </section>
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Protein Structure</h2>
          <ProteinViewer pdbId={proteinId} />
        </section>
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Linked Proteins</h2>
          <LinkedProteinsTable
            links={protein.ProteinLinks}
            totalLinks={protein.totalLinks}
            currentPage={protein.currentPage}
            totalPages={protein.totalPages}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
          />
        </section>
      </div>
    </div>
  );
}
