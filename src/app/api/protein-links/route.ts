import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const proteinId = searchParams.get("proteinId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  if (!proteinId) {
    return NextResponse.json(
      { error: "proteinId is required" },
      { status: 400 }
    );
  }

  try {
    const links = await prisma.proteinLink.findMany({
      where: { proteinId },
      orderBy: { combined_score: "desc" },
      take: limit,
      select: {
        linkedProteinId: true,
        combined_score: true,
      },
    });

    const proteins = links.map((link) => link.linkedProteinId);
    const values = links.map((link) => link.combined_score);

    return NextResponse.json({ proteins, values });
  } catch (error) {
    console.error("Request error", error);
    return NextResponse.json(
      { error: "Error fetching protein links" },
      { status: 500 }
    );
  }
}
