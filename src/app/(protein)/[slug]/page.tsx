import { notFound } from 'next/navigation';
import ProteinInfoCard from '@/components/ProteinInfoCard';
import LinkedProteinsList from '@/components/LinkedProteinList';

async function getProtein(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/protein/${slug}`, { cache: 'no-store' });
  if (!res.ok) return undefined;
  return res.json();
}

export default async function ProteinPage({ params }: { params: { slug: string } }) {
  const protein = await getProtein(params.slug);

  if (!protein) notFound();

  return (
    <div className="container mx-auto p-4">
      <ProteinInfoCard protein={protein} />
      <LinkedProteinsList links={protein.ProteinLinks} />
    </div>
  );
}