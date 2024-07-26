import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term") || "";

  try {
    const proteins = await prisma.protein.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { alias: { contains: term, mode: "insensitive" } },
          { id: { contains: term, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        alias: true,
        size: true,
        annotation: true,
        EnrichmentTerms: {
          take: 3,
          select: {
            term: true,
          },
        },
        _count: {
          select: { ProteinLinks: true },
        },
      },
      take: 20,
    });

    return NextResponse.json(proteins);
  } catch (error) {
    console.error("Error searching proteins:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
