import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LinkedProtein = {
  id: string;
  linkedProteinId: string;
  protein: {
    name: string;
  };
};

type LinkedProteinsListProps = {
  links: LinkedProtein[];
};

export default function LinkedProteinsList({ links }: LinkedProteinsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Proteins</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.id}>
              <Link href={`/${link.linkedProteinId}`} className="text-blue-500 hover:underline">
                {link.protein.name} ({link.linkedProteinId})
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}