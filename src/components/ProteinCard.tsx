// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function ProteinCard({ protein }) {
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
