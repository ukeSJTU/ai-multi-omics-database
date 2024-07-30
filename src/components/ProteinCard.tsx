// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import Image from "next/image";

export function SearchResultProteinCard({ protein }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link
            href={`/protein/${protein.id}`}
            className="text-primary hover:underline"
          >
            {protein.alias}
          </Link>
          <Badge variant="outline">{protein.id}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">{protein.name}</p>
        {protein.annotation && (
          <p className="text-sm mt-2 line-clamp-2">{protein.annotation}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-1">
          {protein.EnrichmentTerms.map((term, index) => (
            <Badge key={index} variant="secondary">
              {term.term}
            </Badge>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <span>Size: {protein.size || "N/A"}</span>
          <span className="ml-2">Links: {protein._count.ProteinLinks}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function GraphDataProteinCard({ protein, onClose }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-bold">
          {protein.name || protein.id}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <p>
          <strong>ID:</strong> {protein.id}
        </p>
        <p>
          <strong>Alias:</strong> {protein.alias || "N/A"}
        </p>
        <p>
          <strong>Size:</strong> {protein.size || "N/A"}
        </p>
        <p>
          <strong>Total Links:</strong> {protein.totalLinks}
        </p>

        {expanded && (
          <div className="mt-4">
            <Image
              src={`/img/name/${protein.id}.png`}
              alt={`No structure available for ${protein.id}`}
              width={280}
              height={280}
              layout="responsive"
              objectFit="contain"
            />
          </div>
        )}

        <Button
          className="w-full mt-4"
          variant="outline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" /> Hide Image
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" /> Show Image
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
