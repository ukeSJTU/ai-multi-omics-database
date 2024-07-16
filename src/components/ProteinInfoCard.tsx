import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

type EnrichmentTerm = {
  id: number;
  category: string;
  term: string;
  description: string | null;
};

type ProteinInfoProps = {
  id: string;
  name: string;
  alias: string;
  size: string | null;
  annotation: string | null;
  fast_sequence: string | null;
  EnrichmentTerms: EnrichmentTerm[];
};

export default function ProteinInfoCard({ protein }: { protein: ProteinInfoProps }) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{protein.name}</CardTitle>
        <CardDescription>{protein.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <p><strong>Alias:</strong> {protein.alias}</p>
        {protein.size && <p><strong>Size:</strong> {protein.size}</p>}
        {protein.annotation && <p><strong>Annotation:</strong> {protein.annotation}</p>}
        {protein.fast_sequence && (
          <p><strong>Fast Sequence:</strong> {protein.fast_sequence}</p>
        )}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Enrichment Terms:</h3>
          <div className="flex flex-wrap gap-2">
            {protein.EnrichmentTerms.map((term) => (
              <HoverCard key={term.id}>
                <HoverCardTrigger>
                  <Badge variant="secondary">
                    {term.term}
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent>
                  <p><strong>Category:</strong> {term.category}</p>
                  {term.description && <p><strong>Description:</strong> {term.description}</p>}
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}