import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type EnrichmentTerm = {
  id: number;
  term: string;
};

type ProteinInfoProps = {
  id: string;
  name: string;
  alias: string;
  source: string;
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
        <p><strong>Source:</strong> {protein.source}</p>
        {protein.fast_sequence && (
          <p><strong>Fast Sequence:</strong> {protein.fast_sequence}</p>
        )}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Enrichment Terms:</h3>
          <div className="flex flex-wrap gap-2">
            {protein.EnrichmentTerms.map((term) => (
              <Badge key={term.id} variant="secondary">
                {term.term}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}