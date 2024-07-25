"use client";

import { ProteinDetailPanel } from "@/components/ProteinDetailPanel";

export default function Page({ params }: { params: { slug: string } }) {
  return <ProteinDetailPanel proteinId={params.slug} />;
}
