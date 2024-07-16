import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;

  try {
    const protein = await prisma.protein.findUnique({
      where: { id: slug },
      include: {
        EnrichmentTerms: true,
        ProteinLinks: {
          include: {
            protein: true
          }
        }
      }
    });

    if (!protein) {
      return NextResponse.json({ error: 'Protein not found' }, { status: 404 });
    }

    return NextResponse.json(protein);
  } catch (error) {
    console.error('Error fetching protein:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}