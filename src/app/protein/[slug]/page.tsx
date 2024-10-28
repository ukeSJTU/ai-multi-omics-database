"use client";

import { ProteinDetailPanel } from "@/components/ProteinDetailPanel";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { slug: string } }) {
  const router = useRouter();

  const handleClose = () => {
    router.push("/protein");
  };

  return (
    <div>
      <div
        className={"fixed top-4 right-4 z-10 transition-opacity duration-300"}
      >
        <Button
          onClick={handleClose}
          variant="outline"
          size="icon"
          className="hover:bg-gray-100 bg-white shadow-md"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ProteinDetailPanel proteinId={params.slug} />
    </div>
  );
}
