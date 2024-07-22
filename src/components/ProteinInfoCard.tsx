"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const groupedTerms = protein.EnrichmentTerms.reduce((acc, term) => {
    if (!acc[term.category]) {
      acc[term.category] = [];
    }
    acc[term.category].push(term);
    return acc;
  }, {} as Record<string, EnrichmentTerm[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
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
        {protein.fast_sequence && (
          <p><strong>Fast Sequence:</strong> {protein.fast_sequence}</p>
        )}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Enrichment Terms:</h3>
          <Accordion type="single" value={expandedCategories} onValueChange={setExpandedCategories}>
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