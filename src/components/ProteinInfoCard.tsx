"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

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
  fasta_sequence: string | null;
  EnrichmentTerms: EnrichmentTerm[];
};

export default function ProteinInfoCard({ protein }: { protein: ProteinInfoProps }) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  const groupedTerms = protein.EnrichmentTerms.reduce((acc, term) => {
    if (!acc[term.category]) {
      acc[term.category] = [];
    }
    acc[term.category].push(term);
    return acc;
  }, {} as Record<string, EnrichmentTerm[]>);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optionally, you can add some feedback here, like a toast notification
      console.log('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

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
        {protein.fasta_sequence && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">FASTA Sequence:</h3>
            <div 
              className="bg-gray-100 p-4 rounded-md overflow-hidden relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <p className="font-mono text-sm overflow-x-scroll">
                {protein.fasta_sequence}
              </p>
              <Button 
                onClick={() => copyToClipboard(protein.fasta_sequence || '')}
                size="icon"
                variant="ghost"
                className={`absolute top-2 right-2 transition-opacity duration-100 ease-in-out ${
                  isHovering ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Enrichment Terms:</h3>
          <Accordion type="multiple" value={expandedCategories} onValueChange={setExpandedCategories}>
            {Object.entries(groupedTerms).map(([category, terms]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger>{category} ({terms.length})</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {terms.map((term) => (
                      <HoverCard key={term.id}>
                        <HoverCardTrigger>
                          <Badge variant="secondary">
                            {term.term}
                          </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <p><strong>Term:</strong> {term.term}</p>
                          {term.description && <p><strong>Description:</strong> {term.description}</p>}
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}