"use client";

import { ProteinDetailPanel } from "@/components/ProteinDetailPanel";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Page({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  const handleClose = () => {
    router.push("/protein");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <div
        className={`sticky top-0 z-10 flex justify-end p-4 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md" : ""
        }`}
      >
        <Button
          onClick={handleClose}
          variant="outline"
          size="icon"
          className="hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ProteinDetailPanel proteinId={params.slug} />
    </div>
  );
}
