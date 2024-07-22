import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const sortBy = searchParams.get('sortBy') || 'linkedProteinId';
  const sortOrder = searchParams.get('sortOrder') || 'asc';
  const limit = parseInt(searchParams.get('limit') || '0', 10);

  try {
    const protein = await prisma.protein.findUnique({
      where: { id: slug },
      include: {
        EnrichmentTerms: true,
      }
    });

    if (!protein) {
      return NextResponse.json({ error: 'Protein not found' }, { status: 404 });
    }

    const totalLinks = await prisma.proteinLink.count({
      where: { proteinId: slug }
    });

    let links;
    if (limit > 0) {
      // For Force2DGraph: fetch top N links by score
      links = await prisma.proteinLink.findMany({
        where: { proteinId: slug },
        orderBy: { score: 'desc' },
        take: limit,
      });
    } else {
      // Original functionality: paginated and sorted links
      links = await prisma.proteinLink.findMany({
        where: { proteinId: slug },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    }

    // Fetch linked proteins' details
    const linkedProteinsDetails = await prisma.protein.findMany({
      where: {
        id: {
          in: links.map(link => link.linkedProteinId)
        }
      }
    });

    // Combine links with linked proteins' details
    const linksWithDetails = links.map(link => ({
      ...link,
      linkedProtein: linkedProteinsDetails.find(p => p.id === link.linkedProteinId)
    }));

    const response = {
      ...protein,
      ProteinLinks: linksWithDetails,
      totalLinks,
      currentPage: page,
      totalPages: Math.ceil(totalLinks / pageSize),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching protein:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}